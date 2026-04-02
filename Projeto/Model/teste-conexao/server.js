const express = require('express');
const cors = require('cors');
const db = require('./db');
const produtosRoutes      = require('./produtos.routes');
const clientesRoutes      = require('./clientes.routes');
const fornecedoresRoutes  = require('./fornecedores.routes');
const funcionariosRoutes  = require('./funcionarios.routes');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Rota de login
app.post('/api/login', (req, res) => {
  const { usuario, senha, nomeCompleto, email, telefone } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  const sql = `
    SELECT u.id_usuario AS id, u.usuario, u.senha, u.ativo, n.nome AS nivel_acesso
    FROM usuario u
    JOIN nivel_acesso n ON u.nivel_acesso = n.id_nivel_acesso
    WHERE u.usuario = ? AND u.ativo = 1

    UNION

    SELECT c.id_cliente AS id, c.usuario, c.senha, c.ativo, n.nome AS nivel_acesso
    FROM cliente c
    JOIN nivel_acesso n ON c.nivel_acesso = n.id_nivel_acesso
    WHERE c.usuario = ? AND c.ativo = 1
  `;

 db.query(sql, [usuario, usuario], (err, results) => { 
    if (err) {
      console.error('Erro na consulta:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const user = results[0];

    // Verifica senha manualmente
    if (user.senha !== senha) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        usuario: user.usuario,
        nivel_acesso: user.nivel_acesso,
      }
    });
  });
});

// Rota de cadastro
app.post('/api/cadastro', (req, res) => {
  const { usuario, senha, nomeCompleto, email, telefone } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  // Verifica se usuário já existe na tabela usuario
  db.query('SELECT id_usuario FROM usuario WHERE usuario = ?', [usuario], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(409).json({ error: 'Usuário já existe.' });

    // Verifica se já existe na tabela cliente
    db.query('SELECT id_cliente FROM cliente WHERE usuario = ?', [usuario], (errC, resC) => {
      if (errC) return res.status(500).json({ error: errC.message });
      if (resC.length > 0) return res.status(409).json({ error: 'Usuário já existe.' });

      const sql = `INSERT INTO cliente
          (usuario, senha, ativo, nivel_acesso, telefone, email, \`endereço\`, nome, cpf_cnpj)
          VALUES (?, ?, 1, 6, ?, ?, null, ?, null)`;

      db.query(sql, [
        usuario,
        senha,
        telefone     || null,
        email        || null,
        nomeCompleto || null
      ], (err3, result) => {
        if (err3) {
          console.error('Erro ao inserir usuário:', err3);
          return res.status(500).json({ error: err3.message });
        }
        res.status(201).json({ success: true, id: result.insertId });
      });
    });
  });
});

// Rotas de produtos
app.use('/produtos', produtosRoutes);

// Rotas de clientes
app.use('/clientes', clientesRoutes);

// Rotas de fornecedores
app.use('/fornecedores', fornecedoresRoutes);

// Rotas de funcionários
app.use('/funcionarios', funcionariosRoutes);

// ─── REGISTRAR VENDA ───────────────────────────────────────────────────────────
// Recebe: { id_cliente, itens: [{ id_produto, quantidade, valor_unitario }], valor_total }
// Salva em: venda + item_venda + desconta estoque
app.post('/api/venda', (req, res) => {
  const { id_cliente, itens, valor_total } = req.body;

  if (!itens || itens.length === 0) {
    return res.status(400).json({ error: 'Nenhum item informado.' });
  }

  // id_vendedor fixo = 1 (sistema/loja online). Ajuste conforme necessário.
  const ID_VENDEDOR_LOJA = 1;

  const sqlVenda = `
    INSERT INTO venda (id_cliente, id_vendedor, valor_total, data_venda, status)
    VALUES (?, ?, ?, NOW(), 1)
  `;

  db.query(sqlVenda, [id_cliente ?? 1, ID_VENDEDOR_LOJA, valor_total], (err, result) => {
    if (err) {
      console.error('Erro ao inserir venda:', err);
      return res.status(500).json({ error: err.message });
    }

    const id_venda = result.insertId;

    // Monta os itens para inserção em lote
    const sqlItens = `
      INSERT INTO item_venda (id_venda, id_produto, quantidade, valor_unitario)
      VALUES ?
    `;
    const valores = itens.map(i => [id_venda, i.id_produto, i.quantidade, i.valor_unitario]);

    db.query(sqlItens, [valores], (err2) => {
      if (err2) {
        console.error('Erro ao inserir itens da venda:', err2);
        return res.status(500).json({ error: err2.message });
      }

      // Desconta estoque de cada produto
      const updates = itens.map(i =>
        new Promise((resolve, reject) => {
          db.query(
            'UPDATE produto SET quantidade_estoque = quantidade_estoque - ? WHERE id_produto = ?',
            [i.quantidade, i.id_produto],
            (err3) => err3 ? reject(err3) : resolve()
          );
        })
      );

      Promise.all(updates)
        .then(() => res.status(201).json({ success: true, id_venda }))
        .catch(err4 => {
          console.error('Erro ao atualizar estoque:', err4);
          res.status(500).json({ error: err4.message });
        });
    });
  });
});

// ─── DADOS DO DASHBOARD ────────────────────────────────────────────────────────
// Retorna: vendas do dia, total de clientes, total de produtos, atividade recente
app.get('/api/dashboard', (req, res) => {
  const resultados = {};

  // 1. Vendas do dia (soma valor_total das vendas de hoje)
  db.query(
    `SELECT COALESCE(SUM(valor_total), 0) AS total_dia, COUNT(*) AS qtd_vendas
     FROM venda
     WHERE DATE(data_venda) = CURDATE() AND status = 1`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      resultados.vendas_dia = rows[0].total_dia;
      resultados.qtd_vendas_dia = rows[0].qtd_vendas;

      // 2. Ordens de serviço abertas (status = 0)
      db.query(
        `SELECT COUNT(*) AS total FROM ordem_servico WHERE status = 0`,
        (err2, rows2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          resultados.ordens_abertas = rows2[0].total;

          // 3. Total de clientes ativos
          db.query(
            `SELECT COUNT(*) AS total FROM cliente WHERE ativo = 1`,
            (err3, rows3) => {
              if (err3) return res.status(500).json({ error: err3.message });
              resultados.total_clientes = rows3[0].total;

              // 4. Total de produtos em estoque (soma quantidade_estoque)
              db.query(
                `SELECT COALESCE(SUM(quantidade_estoque), 0) AS total FROM produto`,
                (err4, rows4) => {
                  if (err4) return res.status(500).json({ error: err4.message });
                  resultados.total_estoque = rows4[0].total;

                  // 5. Atividade recente: últimas 4 vendas com nome do cliente e produtos
                  db.query(
                    `SELECT v.id_venda, v.data_venda, v.valor_total,
                            c.nome AS nome_cliente,
                            GROUP_CONCAT(p.nome ORDER BY p.nome SEPARATOR ', ') AS produtos,
                            SUM(iv.quantidade) AS total_itens
                     FROM venda v
                     LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
                     LEFT JOIN item_venda iv ON iv.id_venda = v.id_venda
                     LEFT JOIN produto p ON p.id_produto = iv.id_produto
                     GROUP BY v.id_venda
                     ORDER BY v.data_venda DESC
                     LIMIT 4`,
                    (err5, rows5) => {
                      if (err5) return res.status(500).json({ error: err5.message });
                      resultados.atividade_recente = rows5;

                      res.json(resultados);
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// Teste de conexão
app.get('/api/ping', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) return res.status(500).json({ status: 'Banco desconectado', error: err.message });
    res.json({ status: 'Banco conectado com sucesso!' });
  });
});

app.listen(PORT, () => {
  console.log('✅ Servidor rodando em http://localhost:' + PORT);

  // Testa conexão com banco de dados
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('❌ Erro ao conectar ao banco de dados:', err.message);
      process.exit(1);
    } else {
      console.log('✅ Conectado ao banco MySQL - loja_de_ferramentas');
    }
  });
});

// Mantém o processo vivo
process.on('SIGINT', () => {
  console.log('\n🛑 Servidor encerrado pelo usuário');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promessa rejeitada não tratada:', reason);
  process.exit(1);
});