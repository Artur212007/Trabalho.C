// =========================
// CONFIGURAÇÕES INICIAIS
// =========================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_forte";

// =========================
// MIDDLEWARES
// =========================
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// =========================
// AUTH MIDDLEWARE
// =========================
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// =========================
// LOGIN (cliente + usuario)
// =========================
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ error: 'Usuário e senha obrigatórios' });
  }

  const sql = `
    SELECT id_usuario AS id, usuario, senha, nivel_acesso, ativo, 'usuario' AS tipo
    FROM usuario WHERE usuario = ? AND ativo = 1

    UNION

    SELECT id_cliente AS id, usuario, senha, nivel_acesso, ativo, 'cliente' AS tipo
    FROM cliente WHERE usuario = ? AND ativo = 1
  `;

  db.query(sql, [usuario, usuario], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = results[0];

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: user.id, tipo: user.tipo, nivel: user.nivel_acesso },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        usuario: user.usuario,
        nivel_acesso: user.nivel_acesso,
        tipo: user.tipo
      }
    });
  });
});

// =========================
// CADASTRO (com validação global)
// =========================
app.post('/api/cadastro', async (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ error: "Usuário e senha obrigatórios" });
  }

  try {
    const checkSql = `
      SELECT usuario FROM usuario WHERE usuario = ?
      UNION
      SELECT usuario FROM cliente WHERE usuario = ?
    `;

    db.query(checkSql, [usuario, usuario], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
        return res.status(400).json({ error: "Usuário já existe" });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      db.query(
        `INSERT INTO cliente (usuario, senha, ativo, nivel_acesso)
         VALUES (?, ?, 1, 6)`,
        [usuario, senhaHash],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          res.status(201).json({ success: true });
        }
      );
    });

  } catch {
    res.status(500).json({ error: "Erro interno" });
  }
});

// =========================
// DASHBOARD - ESTATÍSTICAS
// =========================
app.get('/api/dashboard', auth, (req, res) => {
  // Vendas do dia
  const sqlVendasDia = `
    SELECT 
      COALESCE(SUM(valor_total), 0) as total,
      COUNT(*) as quantidade
    FROM venda 
    WHERE DATE(data_venda) = CURDATE()
  `;
  
  // Ordens de serviço abertas (status 1 = aberta)
  const sqlOrdensAbertas = `
    SELECT COUNT(*) as total FROM ordem_servico WHERE status = 1
  `;
  
  // Total de clientes ativos
  const sqlTotalClientes = `
    SELECT COUNT(*) as total FROM cliente WHERE ativo = 1
  `;
  
  // Total de produtos em estoque (soma das quantidades)
  const sqlTotalEstoque = `
    SELECT COALESCE(SUM(quantidade_estoque), 0) as total FROM produto
  `;
  
  // Atividade recente (últimas 5 vendas)
  const sqlAtividadeRecente = `
    SELECT 
      v.id_venda,
      v.data_venda,
      v.valor_total,
      COALESCE(c.nome, 'Cliente não identificado') AS nome_cliente,
      GROUP_CONCAT(DISTINCT p.nome SEPARATOR ', ') AS produtos,
      COALESCE(SUM(iv.quantidade), 0) AS total_itens
    FROM venda v
    LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
    LEFT JOIN item_venda iv ON iv.id_venda = v.id_venda
    LEFT JOIN produto p ON p.id_produto = iv.id_produto
    GROUP BY v.id_venda, v.data_venda, v.valor_total, c.nome
    ORDER BY v.data_venda DESC
    LIMIT 5
  `;
  
  // Executar todas as queries em paralelo
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(sqlVendasDia, (err, results) => {
        if (err) reject(err);
        else resolve(results[0] || { total: 0, quantidade: 0 });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(sqlOrdensAbertas, (err, results) => {
        if (err) reject(err);
        else resolve(results[0] || { total: 0 });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(sqlTotalClientes, (err, results) => {
        if (err) reject(err);
        else resolve(results[0] || { total: 0 });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(sqlTotalEstoque, (err, results) => {
        if (err) reject(err);
        else resolve(results[0] || { total: 0 });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(sqlAtividadeRecente, (err, results) => {
        if (err) reject(err);
        else resolve(results || []);
      });
    })
  ]).then(([vendasDia, ordensAbertas, totalClientes, totalEstoque, atividadeRecente]) => {
    res.json({
      vendas_dia: vendasDia.total || 0,
      qtd_vendas_dia: vendasDia.quantidade || 0,
      ordens_abertas: ordensAbertas.total || 0,
      total_clientes: totalClientes.total || 0,
      total_estoque: totalEstoque.total || 0,
      atividade_recente: atividadeRecente.map(item => ({
        id_venda: item.id_venda,
        data_venda: item.data_venda,
        valor_total: item.valor_total,
        nome_cliente: item.nome_cliente,
        produtos: item.produtos || 'Sem produtos',
        total_itens: item.total_itens || 0
      }))
    });
  }).catch(err => {
    console.error('Erro ao carregar dashboard:', err);
    res.status(500).json({ error: err.message });
  });
});

// =========================
// LISTAR PRODUTOS
// =========================
app.get('/api/produtos', auth, (req, res) => {
  const sql = `
    SELECT 
      id_produto,
      nome,
      tipo,
      preco_custo,
      preco_venda,
      quantidade_estoque,
      estoque_minimo,
      garantia,
      id_fornecedor
    FROM produto
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});  

// =========================
// CRIAR PRODUTO
// =========================
app.post('/api/produtos', auth, (req, res) => {
  console.log('📦 Recebendo produto:', req.body);
  
  const {
    nome,
    tipo,
    preco_custo,
    preco_venda,
    quantidade_estoque,
    estoque_minimo,
    garantia,
    id_fornecedor
  } = req.body;

  if (!nome || !preco_custo || !preco_venda || !id_fornecedor) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios: nome, preco_custo, preco_venda, id_fornecedor' 
    });
  }

  if (preco_custo <= 0 || preco_venda <= 0) {
    return res.status(400).json({ error: 'Preços devem ser maiores que zero' });
  }

  if (preco_venda <= preco_custo) {
    return res.status(400).json({ error: 'Preço de venda deve ser maior que preço de custo' });
  }

  const checkFornecedorSql = 'SELECT id_fornecedor FROM fornecedor WHERE id_fornecedor = ?';
  
  db.query(checkFornecedorSql, [id_fornecedor], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.status(400).json({ error: 'Fornecedor não encontrado' });
    }

    const sql = `
      INSERT INTO produto (
        nome, tipo, preco_custo, preco_venda, 
        quantidade_estoque, estoque_minimo, garantia, id_fornecedor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      nome, tipo || 1, preco_custo, preco_venda,
      quantidade_estoque || 0, estoque_minimo || 0,
      garantia || 12, id_fornecedor
    ];

    db.query(sql, valores, (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      res.status(201).json({ 
        success: true, 
        message: 'Produto criado com sucesso',
        id_produto: result.insertId
      });
    });
  });
});

// =========================
// ATUALIZAR PRODUTO
// =========================
app.put('/api/produtos/:id', auth, (req, res) => {
  const { id } = req.params;
  const {
    nome, tipo, preco_custo, preco_venda,
    quantidade_estoque, estoque_minimo, garantia, id_fornecedor
  } = req.body;

  if (!id) return res.status(400).json({ error: 'ID do produto é obrigatório' });

  const checkProdutoSql = 'SELECT id_produto FROM produto WHERE id_produto = ?';
  
  db.query(checkProdutoSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });

    const updateData = [];
    const values = [];

    if (nome !== undefined) { updateData.push('nome = ?'); values.push(nome); }
    if (tipo !== undefined) { updateData.push('tipo = ?'); values.push(tipo); }
    if (preco_custo !== undefined) { updateData.push('preco_custo = ?'); values.push(preco_custo); }
    if (preco_venda !== undefined) { updateData.push('preco_venda = ?'); values.push(preco_venda); }
    if (quantidade_estoque !== undefined) { updateData.push('quantidade_estoque = ?'); values.push(quantidade_estoque); }
    if (estoque_minimo !== undefined) { updateData.push('estoque_minimo = ?'); values.push(estoque_minimo); }
    if (garantia !== undefined) { updateData.push('garantia = ?'); values.push(garantia); }
    if (id_fornecedor !== undefined) { updateData.push('id_fornecedor = ?'); values.push(id_fornecedor); }

    if (updateData.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(id);
    const sql = `UPDATE produto SET ${updateData.join(', ')} WHERE id_produto = ?`;

    db.query(sql, values, (err3) => {
      if (err3) return res.status(500).json({ error: err3.message });
      res.json({ success: true, message: 'Produto atualizado com sucesso' });
    });
  });
});

// =========================
// DELETAR PRODUTO
// =========================
app.delete('/api/produtos/:id', auth, (req, res) => {
  const { id } = req.params;
  
  if (!id) return res.status(400).json({ error: 'ID do produto é obrigatório' });

  const checkProdutoSql = 'SELECT id_produto, nome FROM produto WHERE id_produto = ?';
  
  db.query(checkProdutoSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });

    const checkVendasSql = 'SELECT COUNT(*) as total FROM item_venda WHERE id_produto = ?';
    
    db.query(checkVendasSql, [id], (err2, vendasResult) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      if (vendasResult[0].total > 0) {
        return res.status(400).json({ 
          error: `Não é possível excluir produto com ${vendasResult[0].total} venda(s) vinculada(s)`
        });
      }

      const deleteSql = 'DELETE FROM produto WHERE id_produto = ?';
      db.query(deleteSql, [id], (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({ success: true, message: 'Produto excluído com sucesso' });
      });
    });
  });
});

// =========================
// BUSCAR PRODUTO POR ID
// =========================
app.get('/api/produtos/:id', auth, (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      p.id_produto, p.nome, p.tipo, p.preco_custo, p.preco_venda,
      p.quantidade_estoque, p.estoque_minimo, p.garantia, p.id_fornecedor,
      f.nome AS nome_fornecedor
    FROM produto p
    LEFT JOIN fornecedor f ON f.id_fornecedor = p.id_fornecedor
    WHERE p.id_produto = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(results[0]);
  });
});

// =========================
// LISTAR CLIENTES
// =========================
app.get('/api/clientes', auth, (req, res) => {
  const sql = `
    SELECT 
      id_cliente, nome, cpf_cnpj, telefone, email,
      endereço as endereco, ativo, usuario, nivel_acesso
    FROM cliente WHERE ativo = 1 ORDER BY nome ASC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =========================
// BUSCAR CLIENTE POR ID
// =========================
app.get('/api/clientes/:id', auth, (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT id_cliente, nome, cpf_cnpj, telefone, email,
      endereço as endereco, ativo, usuario, nivel_acesso
    FROM cliente WHERE id_cliente = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(results[0]);
  });
});

// =========================
// CRIAR CLIENTE
// =========================
app.post('/api/clientes', auth, async (req, res) => {
  const { nome, cpf_cnpj, telefone, email, endereco, usuario, senha, nivel_acesso } = req.body;

  if (!nome || !usuario || !senha) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, usuario, senha' });
  }

  const checkUserSql = `SELECT usuario FROM usuario WHERE usuario = ? UNION SELECT usuario FROM cliente WHERE usuario = ?`;
  
  db.query(checkUserSql, [usuario, usuario], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ error: 'Usuário já existe' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const sql = `
      INSERT INTO cliente (nome, cpf_cnpj, telefone, email, endereço, ativo, usuario, senha, nivel_acesso)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    `;

    db.query(sql, [nome, cpf_cnpj || null, telefone || null, email || null, endereco || null, usuario, senhaHash, nivel_acesso || 6], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json({ success: true, message: 'Cliente criado com sucesso', id_cliente: result.insertId });
    });
  });
});

// =========================
// ATUALIZAR CLIENTE
// =========================
app.put('/api/clientes/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { nome, cpf_cnpj, telefone, email, endereco, usuario, senha, ativo } = req.body;

  if (!id) return res.status(400).json({ error: 'ID do cliente é obrigatório' });

  db.query('SELECT id_cliente FROM cliente WHERE id_cliente = ?', [id], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });

    const updates = [];
    const values = [];

    if (nome !== undefined) { updates.push('nome = ?'); values.push(nome); }
    if (cpf_cnpj !== undefined) { updates.push('cpf_cnpj = ?'); values.push(cpf_cnpj); }
    if (telefone !== undefined) { updates.push('telefone = ?'); values.push(telefone); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (endereco !== undefined) { updates.push('endereço = ?'); values.push(endereco); }
    if (usuario !== undefined) { updates.push('usuario = ?'); values.push(usuario); }
    if (ativo !== undefined) { updates.push('ativo = ?'); values.push(ativo); }
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      updates.push('senha = ?');
      values.push(senhaHash);
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    values.push(id);
    db.query(`UPDATE cliente SET ${updates.join(', ')} WHERE id_cliente = ?`, values, (err3) => {
      if (err3) return res.status(500).json({ error: err3.message });
      res.json({ success: true, message: 'Cliente atualizado com sucesso' });
    });
  });
});

// =========================
// DELETAR CLIENTE
// =========================
app.delete('/api/clientes/:id', auth, (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: 'ID do cliente é obrigatório' });

  db.query('SELECT id_cliente FROM cliente WHERE id_cliente = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });

    db.query('SELECT COUNT(*) as total FROM venda WHERE id_cliente = ?', [id], (err2, vendasResult) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      if (vendasResult[0].total > 0) {
        db.query('UPDATE cliente SET ativo = 0 WHERE id_cliente = ?', [id], (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ success: true, message: 'Cliente desativado com sucesso', softDelete: true });
        });
      } else {
        db.query('DELETE FROM cliente WHERE id_cliente = ?', [id], (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ success: true, message: 'Cliente excluído com sucesso' });
        });
      }
    });
  });
});

// =========================
// LISTAR FORNECEDORES
// =========================
app.get('/api/fornecedores', auth, (req, res) => {
  const sql = `SELECT id_fornecedor, nome, telefone, email, endereco FROM fornecedor ORDER BY nome ASC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =========================
// BUSCAR FORNECEDOR POR ID
// =========================
app.get('/api/fornecedores/:id', auth, (req, res) => {
  const { id } = req.params;
  const sql = `SELECT id_fornecedor, nome, telefone, email, endereco FROM fornecedor WHERE id_fornecedor = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    res.json(results[0]);
  });
});

// =========================
// CRIAR FORNECEDOR
// =========================
app.post('/api/fornecedores', auth, (req, res) => {
  const { nome, telefone, email, endereco } = req.body;
  if (!nome) return res.status(400).json({ error: 'Campos obrigatórios: nome' });

  const sql = `INSERT INTO fornecedor (nome, telefone, email, endereco) VALUES (?, ?, ?, ?)`;
  db.query(sql, [nome, telefone || null, email || null, endereco || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, message: 'Fornecedor criado com sucesso', id_fornecedor: result.insertId });
  });
});

// =========================
// ATUALIZAR FORNECEDOR
// =========================
app.put('/api/fornecedores/:id', auth, (req, res) => {
  const { id } = req.params;
  const { nome, telefone, email, endereco } = req.body;

  db.query('SELECT id_fornecedor FROM fornecedor WHERE id_fornecedor = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Fornecedor não encontrado' });

    const updates = [];
    const values = [];
    if (nome !== undefined) { updates.push('nome = ?'); values.push(nome); }
    if (telefone !== undefined) { updates.push('telefone = ?'); values.push(telefone); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (endereco !== undefined) { updates.push('endereco = ?'); values.push(endereco); }

    if (updates.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

    values.push(id);
    db.query(`UPDATE fornecedor SET ${updates.join(', ')} WHERE id_fornecedor = ?`, values, (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true, message: 'Fornecedor atualizado com sucesso' });
    });
  });
});

// =========================
// DELETAR FORNECEDOR
// =========================
app.delete('/api/fornecedores/:id', auth, (req, res) => {
  const { id } = req.params;

  db.query('SELECT id_fornecedor FROM fornecedor WHERE id_fornecedor = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Fornecedor não encontrado' });

    db.query('SELECT COUNT(*) as total FROM produto WHERE id_fornecedor = ?', [id], (err2, produtosResult) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (produtosResult[0].total > 0) {
        return res.status(400).json({ error: `Não é possível excluir fornecedor com ${produtosResult[0].total} produto(s) vinculado(s)` });
      }

      db.query('DELETE FROM fornecedor WHERE id_fornecedor = ?', [id], (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({ success: true, message: 'Fornecedor excluído com sucesso' });
      });
    });
  });
});

// =========================
// LISTAR FUNCIONÁRIOS
// =========================
app.get('/api/funcionarios', auth, (req, res) => {
  const { cargo } = req.query;

  let sql = `
    SELECT id_funcionario, nome, cargo
    FROM funcionario
  `;

  let params = [];

  if (cargo) {
    sql += " WHERE cargo = ?";
    params.push(cargo);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =========================
// BUSCAR FUNCIONÁRIO POR ID
// =========================
app.get('/api/funcionarios/:id', auth, (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT f.id_funcionario, f.nome, f.cargo, f.salario, f.percentual_comissao, f.ativo, n.nome AS nome_cargo
    FROM funcionario f LEFT JOIN nivel_acesso n ON n.id_nivel_acesso = f.cargo WHERE f.id_funcionario = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json(results[0]);
  });
});

// =========================
// CRIAR FUNCIONÁRIO
// =========================
app.post('/api/funcionarios', auth, async (req, res) => {
  const { nome, cargo, salario, percentual_comissao, ativo, usuario, senha } = req.body;
  if (!nome || !cargo || !salario) {
    return res.status(400).json({ error: 'Campos obrigatórios: nome, cargo, salario' });
  }

  db.query('SELECT id_nivel_acesso FROM nivel_acesso WHERE id_nivel_acesso = ?', [cargo], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(400).json({ error: 'Cargo não encontrado' });

    const sql = `INSERT INTO funcionario (nome, cargo, salario, percentual_comissao, ativo) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [nome, cargo, salario, percentual_comissao || 0, ativo !== undefined ? ativo : 1], async (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      const id_funcionario = result.insertId;
      
      if (usuario && senha) {
        const senhaHash = await bcrypt.hash(senha, 10);
        db.query(`INSERT INTO usuario (usuario, senha, nivel_acesso, ativo, data_criacao, id_funcionario) VALUES (?, ?, ?, 1, NOW(), ?)`,
          [usuario, senhaHash, cargo, id_funcionario], (err3) => { if (err3) console.error('Erro ao criar usuário:', err3); });
      }
      
      res.status(201).json({ success: true, message: 'Funcionário criado com sucesso', id_funcionario });
    });
  });
});

// =========================
// ATUALIZAR FUNCIONÁRIO
// =========================
app.put('/api/funcionarios/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { nome, cargo, salario, percentual_comissao, ativo, usuario, senha } = req.body;

  db.query('SELECT id_funcionario FROM funcionario WHERE id_funcionario = ?', [id], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });

    const updates = [];
    const values = [];
    if (nome !== undefined) { updates.push('nome = ?'); values.push(nome); }
    if (cargo !== undefined) { updates.push('cargo = ?'); values.push(cargo); }
    if (salario !== undefined) { updates.push('salario = ?'); values.push(salario); }
    if (percentual_comissao !== undefined) { updates.push('percentual_comissao = ?'); values.push(percentual_comissao); }
    if (ativo !== undefined) { updates.push('ativo = ?'); values.push(ativo); }

    if (updates.length > 0) {
      values.push(id);
      await new Promise((resolve, reject) => {
        db.query(`UPDATE funcionario SET ${updates.join(', ')} WHERE id_funcionario = ?`, values, (err2) => {
          if (err2) reject(err2);
          else resolve();
        });
      });
    }

    if (usuario || senha) {
      db.query('SELECT id_usuario FROM usuario WHERE id_funcionario = ?', [id], async (err2, userResults) => {
        if (err2) return res.status(500).json({ error: err2.message });
        
        const cargoAtual = cargo || (await new Promise((resolve) => {
          db.query('SELECT cargo FROM funcionario WHERE id_funcionario = ?', [id], (err3, results3) => {
            resolve(results3[0]?.cargo || 1);
          });
        }));
        
        if (userResults.length > 0) {
          const userUpdates = [];
          const userValues = [];
          if (usuario) { userUpdates.push('usuario = ?'); userValues.push(usuario); }
          if (senha) { userUpdates.push('senha = ?'); userValues.push(await bcrypt.hash(senha, 10)); }
          if (cargo !== undefined) { userUpdates.push('nivel_acesso = ?'); userValues.push(cargo); }
          if (userUpdates.length > 0) {
            userValues.push(userResults[0].id_usuario);
            db.query(`UPDATE usuario SET ${userUpdates.join(', ')} WHERE id_usuario = ?`, userValues, () => {});
          }
        } else if (usuario && senha) {
          const senhaHash = await bcrypt.hash(senha, 10);
          db.query(`INSERT INTO usuario (usuario, senha, nivel_acesso, ativo, data_criacao, id_funcionario) VALUES (?, ?, ?, 1, NOW(), ?)`,
            [usuario, senhaHash, cargoAtual, id], () => {});
        }
      });
    }

    res.json({ success: true, message: 'Funcionário atualizado com sucesso' });
  });
});

// =========================
// DELETAR FUNCIONÁRIO
// =========================
app.delete('/api/funcionarios/:id', auth, (req, res) => {
  const { id } = req.params;

  db.query('SELECT id_funcionario FROM funcionario WHERE id_funcionario = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });

    db.query('SELECT COUNT(*) as total FROM venda WHERE id_vendedor = ?', [id], (err2, vendasResult) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      db.query('SELECT COUNT(*) as total FROM ordem_servico WHERE id_tecnico = ?', [id], (err3, osResult) => {
        if (err3) return res.status(500).json({ error: err3.message });
        
        if (vendasResult[0].total > 0 || osResult[0].total > 0) {
          db.query('UPDATE funcionario SET ativo = 0 WHERE id_funcionario = ?', [id], (err4) => {
            if (err4) return res.status(500).json({ error: err4.message });
            db.query('UPDATE usuario SET ativo = 0 WHERE id_funcionario = ?', [id], () => {});
            res.json({ success: true, message: 'Funcionário desativado com sucesso', softDelete: true });
          });
        } else {
          db.query('DELETE FROM usuario WHERE id_funcionario = ?', [id], () => {});
          db.query('DELETE FROM funcionario WHERE id_funcionario = ?', [id], (err4) => {
            if (err4) return res.status(500).json({ error: err4.message });
            res.json({ success: true, message: 'Funcionário excluído com sucesso' });
          });
        }
      });
    });
  });
});

// =========================
// LISTAR CARGOS
// =========================
app.get('/api/cargos', auth, (req, res) => {
  const sql = `SELECT id_nivel_acesso, nome FROM nivel_acesso WHERE id_nivel_acesso NOT IN (6) ORDER BY id_nivel_acesso ASC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =========================
// ERRO GLOBAL
// =========================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// =========================
// LISTAR VENDAS (completo)
// =========================
app.get('/api/vendas', auth, (req, res) => {
  const sql = `
    SELECT 
      v.id_venda,
      v.valor_total,
      v.data_venda,
      v.status,
      c.nome AS cliente_nome,
      c.id_cliente,
      f.nome AS vendedor_nome,
      f.id_funcionario AS vendedor_id,
      CASE 
        WHEN v.status = 1 THEN 'Concluída'
        WHEN v.status = 0 THEN 'Cancelada'
        ELSE 'Pendente'
      END AS status_texto
    FROM venda v
    LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
    LEFT JOIN funcionario f ON f.id_funcionario = v.id_vendedor
    ORDER BY v.data_venda DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// =========================
// BUSCAR VENDA POR ID (completa com itens)
// =========================
app.get('/api/vendas/:id', auth, (req, res) => {
  const { id } = req.params;

  // Busca dados da venda
  const sqlVenda = `
    SELECT 
      v.id_venda,
      v.valor_total,
      v.data_venda,
      v.status,
      c.nome AS cliente_nome,
      c.id_cliente,
      c.cpf_cnpj,
      c.telefone,
      f.nome AS vendedor_nome,
      f.id_funcionario AS vendedor_id
    FROM venda v
    LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
    LEFT JOIN funcionario f ON f.id_funcionario = v.id_vendedor
    WHERE v.id_venda = ?
  `;

  // Busca itens da venda
  const sqlItens = `
    SELECT 
      iv.id_item_venda,
      iv.id_produto,
      iv.quantidade,
      iv.valor_unitario,
      p.nome AS produto_nome,
      (iv.quantidade * iv.valor_unitario) AS subtotal
    FROM item_venda iv
    LEFT JOIN produto p ON p.id_produto = iv.id_produto
    WHERE iv.id_venda = ?
  `;

  db.query(sqlVenda, [id], (err, vendaResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (vendaResult.length === 0) return res.status(404).json({ error: 'Venda não encontrada' });

    db.query(sqlItens, [id], (err2, itensResult) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      res.json({
        ...vendaResult[0],
        itens: itensResult
      });
    });
  });
});

// =========================
// REGISTRAR VENDA (completo com estoque)
// =========================
app.post('/api/vendas', auth, (req, res) => {
  const { id_cliente, id_vendedor, itens, valor_total, desconto } = req.body;

  // Validações
  if (!id_vendedor) {
  return res.status(400).json({ error: 'Vendedor é obrigatório' });
}
  if (!id_cliente) {
    return res.status(400).json({ error: 'Cliente é obrigatório' });
  }
  if (!itens || itens.length === 0) {
    return res.status(400).json({ error: 'Adicione pelo menos um produto' });
  }

  // Verifica se o cliente existe
  const checkClienteSql = 'SELECT id_cliente, nome FROM cliente WHERE id_cliente = ? AND ativo = 1';
  
  db.query(checkClienteSql, [id_cliente], (err, clienteResult) => {
    if (err) return res.status(500).json({ error: err.message });
    if (clienteResult.length === 0) {
      return res.status(400).json({ error: 'Cliente não encontrado ou inativo' });
    }

    // Verifica estoque de todos os produtos
    let verificacoes = itens.map(item => {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT quantidade_estoque, nome FROM produto WHERE id_produto = ?';
        db.query(sql, [item.id_produto], (err2, result) => {
          if (err2) reject(err2);
          if (result.length === 0) {
            reject(new Error(`Produto ID ${item.id_produto} não encontrado`));
          }
          if (result[0].quantidade_estoque < item.quantidade) {
            reject(new Error(`Estoque insuficiente para "${result[0].nome}". Disponível: ${result[0].quantidade_estoque}`));
          }
          resolve();
        });
      });
    });

    Promise.all(verificacoes)
      .then(() => {
        // Inicia transação
        db.beginTransaction(err3 => {
          if (err3) return res.status(500).json({ error: err3.message });

          const valorFinal = desconto ? valor_total - desconto : valor_total;
          
          // Insere a venda
          const sqlVenda = `
            INSERT INTO venda (id_cliente, id_vendedor, valor_total, data_venda, status)
            VALUES (?, ?, ?, NOW(), 1)
          `;

          db.query(sqlVenda, [id_cliente, id_vendedor, valorFinal], (err4, result) => {
            if (err4) {
              return db.rollback(() => res.status(500).json({ error: err4.message }));
            }

            const id_venda = result.insertId;

            // Insere os itens da venda
            const valoresItens = itens.map(item => [
              id_venda,
              item.id_produto,
              item.quantidade,
              item.valor_unitario
            ]);

            db.query(
              'INSERT INTO item_venda (id_venda, id_produto, quantidade, valor_unitario) VALUES ?',
              [valoresItens],
              (err5) => {
                if (err5) {
                  return db.rollback(() => res.status(500).json({ error: err5.message }));
                }

                // Atualiza o estoque
                const updates = itens.map(item => {
                  return new Promise((resolve, reject) => {
                    db.query(
                      `UPDATE produto 
                       SET quantidade_estoque = quantidade_estoque - ? 
                       WHERE id_produto = ? AND quantidade_estoque >= ?`,
                      [item.quantidade, item.id_produto, item.quantidade],
                      err6 => err6 ? reject(err6) : resolve()
                    );
                  });
                });

                Promise.all(updates)
                  .then(() => {
                    db.commit(err7 => {
                      if (err7) {
                        return db.rollback(() => res.status(500).json({ error: err7.message }));
                      }
                      
                      res.status(201).json({ 
                        success: true, 
                        message: 'Venda registrada com sucesso',
                        id_venda: id_venda,
                        cliente: clienteResult[0].nome,
                        valor_total: valorFinal
                      });
                    });
                  })
                  .catch(err8 => {
                    db.rollback(() => res.status(500).json({ error: err8.message }));
                  });
              }
            );
          });
        });
      })
      .catch(err9 => {
        res.status(400).json({ error: err9.message });
      });
  });
});

// =========================
// CANCELAR VENDA (devolve ao estoque)
// =========================
app.put('/api/vendas/:id/cancelar', auth, (req, res) => {
  const { id } = req.params;

  // Verifica se a venda existe e está ativa
  const checkVendaSql = 'SELECT id_venda, status FROM venda WHERE id_venda = ?';
  
  db.query(checkVendaSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Venda não encontrada' });
    if (results[0].status === 0) return res.status(400).json({ error: 'Venda já está cancelada' });

    // Busca os itens da venda
    const sqlItens = 'SELECT id_produto, quantidade FROM item_venda WHERE id_venda = ?';
    
    db.query(sqlItens, [id], (err2, itens) => {
      if (err2) return res.status(500).json({ error: err2.message });

      db.beginTransaction(err3 => {
        if (err3) return res.status(500).json({ error: err3.message });

        // Cancela a venda
        const cancelSql = 'UPDATE venda SET status = 0 WHERE id_venda = ?';
        
        db.query(cancelSql, [id], (err4) => {
          if (err4) {
            return db.rollback(() => res.status(500).json({ error: err4.message }));
          }

          // Devolve os produtos ao estoque
          const updates = itens.map(item => {
            return new Promise((resolve, reject) => {
              db.query(
                'UPDATE produto SET quantidade_estoque = quantidade_estoque + ? WHERE id_produto = ?',
                [item.quantidade, item.id_produto],
                err5 => err5 ? reject(err5) : resolve()
              );
            });
          });

          Promise.all(updates)
            .then(() => {
              db.commit(err6 => {
                if (err6) {
                  return db.rollback(() => res.status(500).json({ error: err6.message }));
                }
                res.json({ success: true, message: 'Venda cancelada e estoque restaurado' });
              });
            })
            .catch(err7 => {
              db.rollback(() => res.status(500).json({ error: err7.message }));
            });
        });
      });
    });
  });
});

// =========================
// DELETAR VENDA (apenas se não tiver itens ou com permissão especial)
// =========================
app.delete('/api/vendas/:id', auth, (req, res) => {
  const { id } = req.params;

  // Verifica se a venda existe
  const checkVendaSql = 'SELECT id_venda, status FROM venda WHERE id_venda = ?';
  
  db.query(checkVendaSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Venda não encontrada' });

    // Apenas admin pode excluir vendas (soft delete ou hard delete)
    if (req.user.nivel !== 1) {
      return res.status(403).json({ error: 'Apenas administradores podem excluir vendas' });
    }

    // Soft delete - apenas marca como cancelada
    const cancelSql = 'UPDATE venda SET status = 0 WHERE id_venda = ?';
    
    db.query(cancelSql, [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true, message: 'Venda cancelada com sucesso' });
    });
  });
});

// =========================
// ESTATÍSTICAS DE VENDAS
// =========================
app.get('/api/vendas/estatisticas', auth, (req, res) => {
  const { periodo } = req.query; // dia, mes, ano
  
  let groupBy = '';
  let dateFormat = '';
  
  switch(periodo) {
    case 'dia':
      groupBy = 'DATE(data_venda)';
      dateFormat = '%d/%m/%Y';
      break;
    case 'mes':
      groupBy = 'DATE_FORMAT(data_venda, "%Y-%m")';
      dateFormat = '%m/%Y';
      break;
    case 'ano':
      groupBy = 'YEAR(data_venda)';
      dateFormat = '%Y';
      break;
    default:
      groupBy = 'DATE(data_venda)';
      dateFormat = '%d/%m/%Y';
  }
  
  const sql = `
    SELECT 
      DATE_FORMAT(data_venda, '${dateFormat}') AS periodo,
      COUNT(*) AS quantidade,
      COALESCE(SUM(valor_total), 0) AS total
    FROM venda
    WHERE status = 1
    GROUP BY ${groupBy}
    ORDER BY data_venda DESC
    LIMIT 30
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const totalVendas = results.reduce((acc, r) => acc + r.total, 0);
    const totalQuantidade = results.reduce((acc, r) => acc + r.quantidade, 0);
    
    res.json({
      total_vendas: totalVendas,
      total_transacoes: totalQuantidade,
      media_por_periodo: totalQuantidade > 0 ? totalVendas / totalQuantidade : 0,
      dados: results
    });
  });
});

// =========================
// BUSCAR VENDAS POR CLIENTE
// =========================
app.get('/api/vendas/cliente/:id', auth, (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT 
      v.id_venda,
      v.valor_total,
      v.data_venda,
      v.status,
      f.nome AS vendedor_nome
    FROM venda v
    LEFT JOIN funcionario f ON f.id_funcionario = v.id_vendedor
    WHERE v.id_cliente = ?
    ORDER BY v.data_venda DESC
  `;
  
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =========================
// BUSCAR VENDAS POR PERÍODO
// =========================
app.get('/api/vendas/periodo', auth, (req, res) => {
  const { data_inicio, data_fim } = req.query;
  
  if (!data_inicio || !data_fim) {
    return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
  }
  
  const sql = `
    SELECT 
      v.id_venda,
      v.valor_total,
      v.data_venda,
      v.status,
      c.nome AS cliente_nome,
      f.nome AS vendedor_nome
    FROM venda v
    LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
    LEFT JOIN funcionario f ON f.id_funcionario = v.id_vendedor
    WHERE DATE(v.data_venda) BETWEEN ? AND ?
    ORDER BY v.data_venda DESC
  `;
  
  db.query(sql, [data_inicio, data_fim], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const total_periodo = results.reduce((acc, r) => acc + r.valor_total, 0);
    
    res.json({
      total_periodo,
      quantidade: results.length,
      vendas: results
    });
  });
});

app.get('/api/OrdemServico', auth, (req, res) => {
  const sql = `
    SELECT 
      os.id_ordem_servico,
      os.descricao_problema,
      os.status,
      os.data_abertura,
      c.nome AS nome_cliente,
      f.nome AS nome_tecnico
    FROM ordem_servico os
    LEFT JOIN cliente c ON c.id_cliente = os.id_cliente
    LEFT JOIN funcionario f ON f.id_funcionario = os.id_tecnico
    ORDER BY os.data_abertura DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/OrdemServico/:id', auth, (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      os.*,
      c.nome AS nome_cliente,
      f.nome AS nome_tecnico
    FROM ordem_servico os
    LEFT JOIN cliente c ON c.id_cliente = os.id_cliente
    LEFT JOIN funcionario f ON f.id_funcionario = os.id_tecnico
    WHERE os.id_ordem_servico = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'OS não encontrada' });

    res.json(results[0]);
  });
});

app.post('/api/OrdemServico', auth, (req, res) => {
  const { id_cliente, id_tecnico, descricao_problema, status } = req.body;

  if (!id_cliente || !descricao_problema) {
    return res.status(400).json({ error: 'Cliente e descrição são obrigatórios' });
  }

  const sql = `
    INSERT INTO ordem_servico 
    (id_cliente, id_tecnico, descricao_problema, status, data_abertura)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(
    sql,
    [id_cliente, id_tecnico || null, descricao_problema, status || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        success: true,
        id_ordem_servico: result.insertId
      });
    }
  );
});

app.put('/api/OrdemServico/:id', auth, (req, res) => {
  const { id } = req.params;
  const { id_cliente, id_tecnico, descricao_problema, status } = req.body;

  db.query(
    'SELECT id_ordem_servico FROM ordem_servico WHERE id_ordem_servico = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'OS não encontrada' });

      const updates = [];
      const values = [];

      if (id_cliente !== undefined) {
        updates.push('id_cliente = ?');
        values.push(id_cliente);
      }

      if (id_tecnico !== undefined) {
        updates.push('id_tecnico = ?');
        values.push(id_tecnico);
      }

      if (descricao_problema !== undefined) {
        updates.push('descricao_problema = ?');
        values.push(descricao_problema);
      }

      if (status !== undefined) {
        updates.push('status = ?');
        values.push(status);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nada para atualizar' });
      }

      values.push(id);

      const sql = `UPDATE ordem_servico SET ${updates.join(', ')} WHERE id_ordem_servico = ?`;

      db.query(sql, values, (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        res.json({ success: true, message: 'OS atualizada com sucesso' });
      });
    }
  );
});

app.delete('/api/OrdemServico/:id', auth, (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT id_ordem_servico FROM ordem_servico WHERE id_ordem_servico = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'OS não encontrada' });

      db.query(
        'DELETE FROM ordem_servico WHERE id_ordem_servico = ?',
        [id],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          res.json({ success: true, message: 'OS deletada com sucesso' });
        }
      );
    }
  );
});


  app.get('/api/orcamentos', auth, (req, res) => {
  const sql = `
    SELECT 
      o.*,
      c.nome AS nome_cliente,
      f.nome AS nome_tecnico
    FROM orcamento o
    LEFT JOIN cliente c ON c.id_cliente = o.id_cliente
    LEFT JOIN funcionario f ON f.id_funcionario = o.id_tecnico
    ORDER BY o.data DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

app.get('/api/orcamentos/:id', auth, (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT *
    FROM orcamento
    WHERE id_orcamento = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    res.json(results[0]);
  });
});

app.post('/api/orcamentos', auth, (req, res) => {
  const {
    id_cliente,
    id_tecnico,
    descricao,
    dados,
    valor_total,
    validade,
    status
  } = req.body;

  if (!id_cliente || !valor_total) {
    return res.status(400).json({
      error: 'Cliente e valor são obrigatórios'
    });
  }

  const sql = `
    INSERT INTO orcamento
    (id_cliente, id_tecnico, descricao, dados, valor_total, data, validade, status)
    VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)
  `;

  db.query(
    sql,
    [
      id_cliente,
      id_tecnico || null,
      descricao || null,
      dados || null,
      valor_total,
      validade || null,
      status || 0
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        success: true,
        id_orcamento: result.insertId
      });
    }
  );
});


app.put('/api/orcamentos/:id', auth, (req, res) => {
  const { id } = req.params;

  const {
    id_cliente,
    id_tecnico,
    descricao,
    dados,
    valor_total,
    validade,
    status
  } = req.body;

  const updates = [];
  const values = [];

  if (id_cliente !== undefined) {
    updates.push('id_cliente = ?');
    values.push(id_cliente);
  }

  if (id_tecnico !== undefined) {
    updates.push('id_tecnico = ?');
    values.push(id_tecnico);
  }

  if (descricao !== undefined) {
    updates.push('descricao = ?');
    values.push(descricao);
  }

  if (dados !== undefined) {
    updates.push('dados = ?');
    values.push(dados);
  }

  if (valor_total !== undefined) {
    updates.push('valor_total = ?');
    values.push(valor_total);
  }

  if (validade !== undefined) {
    updates.push('validade = ?');
    values.push(validade);
  }

  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Nada para atualizar' });
  }

  values.push(id);

  const sql = `
    UPDATE orcamento
    SET ${updates.join(', ')} 
    WHERE id_orcamento = ?
  `;

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ success: true });
  });
});

app.delete('/api/orcamentos/:id', auth, (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT id_orcamento FROM orcamento WHERE id_orcamento = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      db.query(
        'DELETE FROM orcamento WHERE id_orcamento = ?',
        [id],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          res.json({
            success: true,
            message: 'Orçamento deletado com sucesso'
          });
        }
      );
    }
  );
});

// =========================
// LISTAR TÉCNICOS (DEVE VIR PRIMEIRO)
// =========================
app.get('/api/caixa/tecnicos', auth, (req, res) => {
  const sql = `
    SELECT 
      f.id_funcionario,
      f.nome,
      f.cargo
    FROM funcionario f
    WHERE f.cargo = 5 AND f.ativo = 1
    ORDER BY f.nome ASC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =========================
// LISTAR CAIXA
// =========================
app.get('/api/caixa', auth, (req, res) => {
  const sql = `
    SELECT 
      c.id_caixa,
      c.data,
      c.valor_abertura,
      c.valor_fechamento,
      c.saldo,
      c.id_funcionario,
      f.nome AS funcionario_nome
    FROM caixa c
    LEFT JOIN funcionario f ON f.id_funcionario = c.id_funcionario
    ORDER BY c.data DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =========================
// RESUMO DO CAIXA DO DIA
// =========================
app.get('/api/caixa/resumo/dia', auth, (req, res) => {
  const sql = `
    SELECT 
      c.id_caixa,
      c.valor_abertura,
      c.saldo,
      c.data,
      f.nome AS funcionario_nome,
      CASE 
        WHEN c.valor_fechamento IS NULL THEN 'Aberto'
        ELSE 'Fechado'
      END AS status
    FROM caixa c
    LEFT JOIN funcionario f ON f.id_funcionario = c.id_funcionario
    WHERE DATE(c.data) = CURDATE()
    ORDER BY c.data DESC
    LIMIT 1
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.json({ 
        status: 'Fechado',
        message: 'Nenhum caixa aberto hoje'
      });
    }
    
    res.json(results[0]);
  });
});

// =========================
// HISTÓRICO DE CAIXA POR PERÍODO
// =========================
app.get('/api/caixa/historico', auth, (req, res) => {
  const { data_inicio, data_fim } = req.query;
  
  let sql = `
    SELECT 
      c.id_caixa,
      DATE(c.data) AS data,
      c.valor_abertura,
      c.valor_fechamento,
      c.saldo,
      f.nome AS funcionario_nome
    FROM caixa c
    LEFT JOIN funcionario f ON f.id_funcionario = c.id_funcionario
    WHERE 1=1
  `;
  
  const params = [];
  
  if (data_inicio) {
    sql += ' AND DATE(c.data) >= ?';
    params.push(data_inicio);
  }
  
  if (data_fim) {
    sql += ' AND DATE(c.data) <= ?';
    params.push(data_fim);
  }
  
  sql += ' ORDER BY c.data DESC';
  
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const total_abertura = results.reduce((sum, r) => sum + r.valor_abertura, 0);
    const total_fechamento = results.reduce((sum, r) => sum + (r.valor_fechamento || 0), 0);
    const saldo_total = results.reduce((sum, r) => sum + r.saldo, 0);
    
    res.json({
      total_registros: results.length,
      total_abertura,
      total_fechamento,
      saldo_total,
      registros: results
    });
  });
});

// =========================
// BUSCAR CAIXA POR ID (DEVE VIR POR ÚLTIMO)
// =========================
app.get('/api/caixa/:id', auth, (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      c.id_caixa,
      c.data,
      c.valor_abertura,
      c.valor_fechamento,
      c.saldo,
      c.id_funcionario,
      f.nome AS funcionario_nome
    FROM caixa c
    LEFT JOIN funcionario f ON f.id_funcionario = c.id_funcionario
    WHERE c.id_caixa = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Registro de caixa não encontrado' });
    res.json(results[0]);
  });
});

// =========================
// CRIAR REGISTRO DE CAIXA (Abertura)
// =========================
app.post('/api/caixa', auth, (req, res) => {
  const { valor_abertura, id_funcionario } = req.body;

  if (!valor_abertura || !id_funcionario) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios: valor_abertura, id_funcionario' 
    });
  }

  if (valor_abertura < 0) {
    return res.status(400).json({ error: 'Valor de abertura não pode ser negativo' });
  }

  // Verifica se já existe um caixa aberto para hoje
  const checkSql = `
    SELECT id_caixa FROM caixa 
    WHERE DATE(data) = CURDATE() AND valor_fechamento IS NULL
  `;

  db.query(checkSql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length > 0) {
      return res.status(400).json({ error: 'Já existe um caixa aberto para hoje' });
    }

    const sql = `
      INSERT INTO caixa (data, valor_abertura, valor_fechamento, saldo, id_funcionario)
      VALUES (NOW(), ?, NULL, ?, ?)
    `;

    db.query(sql, [valor_abertura, valor_abertura, id_funcionario], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      res.status(201).json({ 
        success: true, 
        message: 'Caixa aberto com sucesso',
        id_caixa: result.insertId
      });
    });
  });
});

// =========================
// FECHAR CAIXA (atualizar valor_fechamento)
// =========================
app.put('/api/caixa/:id/fechar', auth, (req, res) => {
  const { id } = req.params;
  const { valor_fechamento } = req.body;

  if (!valor_fechamento) {
    return res.status(400).json({ error: 'Valor de fechamento é obrigatório' });
  }

  // Verifica se o caixa existe e está aberto
  const checkSql = `
    SELECT id_caixa, valor_abertura, saldo FROM caixa 
    WHERE id_caixa = ? AND valor_fechamento IS NULL
  `;

  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Caixa não encontrado ou já está fechado' });
    }

    const sql = `
      UPDATE caixa 
      SET valor_fechamento = ? 
      WHERE id_caixa = ?
    `;

    db.query(sql, [valor_fechamento, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      res.json({ success: true, message: 'Caixa fechado com sucesso' });
    });
  });
});

// =========================
// ATUALIZAR SALDO DO CAIXA
// =========================
app.put('/api/caixa/:id/saldo', auth, (req, res) => {
  const { id } = req.params;
  const { saldo } = req.body;

  if (saldo === undefined) {
    return res.status(400).json({ error: 'Saldo é obrigatório' });
  }

  // Verifica se o caixa existe e está aberto
  const checkSql = `
    SELECT id_caixa FROM caixa 
    WHERE id_caixa = ? AND valor_fechamento IS NULL
  `;

  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Caixa não encontrado ou está fechado' });
    }

    const sql = `UPDATE caixa SET saldo = ? WHERE id_caixa = ?`;

    db.query(sql, [saldo, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      res.json({ success: true, message: 'Saldo atualizado com sucesso' });
    });
  });
});

// =========================
// ATUALIZAR REGISTRO DE CAIXA (completo)
// =========================
app.put('/api/caixa/:id', auth, (req, res) => {
  const { id } = req.params;
  const { data, valor_abertura, valor_fechamento, saldo, id_funcionario } = req.body;

  // Verifica se o caixa existe
  const checkSql = 'SELECT id_caixa FROM caixa WHERE id_caixa = ?';
  
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Registro de caixa não encontrado' });
    }

    const updates = [];
    const values = [];

    if (data !== undefined) {
      updates.push('data = ?');
      values.push(data);
    }
    if (valor_abertura !== undefined) {
      updates.push('valor_abertura = ?');
      values.push(valor_abertura);
    }
    if (valor_fechamento !== undefined) {
      updates.push('valor_fechamento = ?');
      values.push(valor_fechamento);
    }
    if (saldo !== undefined) {
      updates.push('saldo = ?');
      values.push(saldo);
    }
    if (id_funcionario !== undefined) {
      updates.push('id_funcionario = ?');
      values.push(id_funcionario);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(id);
    const sql = `UPDATE caixa SET ${updates.join(', ')} WHERE id_caixa = ?`;

    db.query(sql, values, (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true, message: 'Registro de caixa atualizado com sucesso' });
    });
  });
});

// =========================
// DELETAR REGISTRO DE CAIXA
// =========================
app.delete('/api/caixa/:id', auth, (req, res) => {
  const { id } = req.params;

  // Verifica se o caixa existe
  const checkSql = 'SELECT id_caixa FROM caixa WHERE id_caixa = ?';
  
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Registro de caixa não encontrado' });
    }

    const sql = 'DELETE FROM caixa WHERE id_caixa = ?';
    
    db.query(sql, [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true, message: 'Registro de caixa excluído com sucesso' });
    });
  });
});

// =========================
// LISTAR CLIENTES PARA PAGAMENTO
// =========================
app.get('/api/clientes/pagamentos', auth, (req, res) => {
  const sql = `
    SELECT id_cliente, nome 
    FROM cliente 
    WHERE ativo = 1 
    ORDER BY nome ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =========================
// LISTAR VENDAS PARA PAGAMENTO
// =========================
app.get('/api/vendas/pagamentos', auth, (req, res) => {
  const sql = `
    SELECT 
      v.id_venda, 
      v.valor_total, 
      v.data_venda,
      c.nome AS cliente_nome
    FROM venda v
    LEFT JOIN cliente c ON c.id_cliente = v.id_cliente
    WHERE v.status = 1
    ORDER BY v.data_venda DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =========================
// LISTAR PAGAMENTOS
// =========================
app.get('/api/pagamentos', auth, (req, res) => {
  const sql = `
    SELECT 
      p.id_pagamento,
      p.valor,
      p.data_pagamento,
      p.forma_pagamento,
      p.status,
      p.descricao,
      p.id_venda,
      p.id_cliente,
      c.nome AS cliente_nome
    FROM pagamento p
    LEFT JOIN cliente c ON c.id_cliente = p.id_cliente
    ORDER BY p.data_pagamento DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// =========================
// BUSCAR PAGAMENTO POR ID
// =========================
app.get('/api/pagamentos/:id', auth, (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      p.id_pagamento,
      p.valor,
      p.data_pagamento,
      p.forma_pagamento,
      p.status,
      p.descricao,
      p.id_venda,
      p.id_cliente,
      c.nome AS cliente_nome
    FROM pagamento p
    LEFT JOIN cliente c ON c.id_cliente = p.id_cliente
    WHERE p.id_pagamento = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });
    res.json(results[0]);
  });
});

// =========================
// CRIAR PAGAMENTO
// =========================
app.post('/api/pagamentos', auth, (req, res) => {
  const { valor, data_pagamento, forma_pagamento, status, descricao, id_venda, id_cliente } = req.body;

  if (!valor || !forma_pagamento || !id_cliente) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios: valor, forma_pagamento, id_cliente' 
    });
  }

  if (valor <= 0) {
    return res.status(400).json({ error: 'Valor deve ser maior que zero' });
  }

  const sql = `
    INSERT INTO pagamento 
    (valor, data_pagamento, forma_pagamento, status, descricao, id_venda, id_cliente)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    valor, 
    data_pagamento || new Date(), 
    forma_pagamento, 
    status || 1, 
    descricao || null, 
    id_venda || null, 
    id_cliente
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    res.status(201).json({ 
      success: true, 
      message: 'Pagamento registrado com sucesso',
      id_pagamento: result.insertId
    });
  });
});

// =========================
// ATUALIZAR PAGAMENTO
// =========================
app.put('/api/pagamentos/:id', auth, (req, res) => {
  const { id } = req.params;
  const { valor, data_pagamento, forma_pagamento, status, descricao, id_venda, id_cliente } = req.body;

  const checkSql = 'SELECT id_pagamento FROM pagamento WHERE id_pagamento = ?';
  
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });

    const updates = [];
    const values = [];

    if (valor !== undefined) {
      updates.push('valor = ?');
      values.push(valor);
    }
    if (data_pagamento !== undefined) {
      updates.push('data_pagamento = ?');
      values.push(data_pagamento);
    }
    if (forma_pagamento !== undefined) {
      updates.push('forma_pagamento = ?');
      values.push(forma_pagamento);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (descricao !== undefined) {
      updates.push('descricao = ?');
      values.push(descricao);
    }
    if (id_venda !== undefined) {
      updates.push('id_venda = ?');
      values.push(id_venda || null);
    }
    if (id_cliente !== undefined) {
      updates.push('id_cliente = ?');
      values.push(id_cliente);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(id);
    const sql = `UPDATE pagamento SET ${updates.join(', ')} WHERE id_pagamento = ?`;

    db.query(sql, values, (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true, message: 'Pagamento atualizado com sucesso' });
    });
  });
});

// =========================
// DELETAR PAGAMENTO
// =========================
app.delete('/api/pagamentos/:id', auth, (req, res) => {
  const { id } = req.params;

  const checkSql = 'SELECT id_pagamento FROM pagamento WHERE id_pagamento = ?';
  
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });

    const sql = 'DELETE FROM pagamento WHERE id_pagamento = ?';
    
    db.query(sql, [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true, message: 'Pagamento excluído com sucesso' });
    });
  });
});

app.put('/api/pagamentos/:id/baixar', auth, (req, res) => {
  const { id } = req.params;

  const checkSql = 'SELECT id_pagamento, status FROM pagamento WHERE id_pagamento = ?';
  
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });
    
    if (results[0].status === 'pago') {
      return res.status(400).json({ error: 'Pagamento já foi baixado' });
    }

    const sql = `
      UPDATE pagamento 
      SET status = 'pago', 
          data_pagamento = NOW() 
      WHERE id_pagamento = ?
    `;

    db.query(sql, [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      res.json({ 
        success: true, 
        message: 'Pagamento baixado com sucesso'
      });
    });
  });
});