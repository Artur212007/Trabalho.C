const express = require('express');
const cors = require('cors');
const db = require('./db');
const produtosRoutes = require('./produtos.routes');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Rota de login
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  const sql = `
    SELECT u.id_usuario, u.usuario, u.ativo, n.nome AS nivel_acesso
    FROM usuario u
    JOIN nivel_acesso n ON u.nivel_acesso = n.id_nivel_acesso
    WHERE u.usuario = ? AND u.senha = ? AND u.ativo = 1
  `;

  db.query(sql, [usuario, senha], (err, results) => {
    if (err) {
      console.error('Erro na consulta:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const user = results[0];
    return res.json({
      success: true,
      user: {
        id: user.id_usuario,
        usuario: user.usuario,
        nivel_acesso: user.nivel_acesso,
      }
    });
  });
});

// Rotas de produtos
app.use('/produtos', produtosRoutes);

// Teste de conexão
app.get('/api/ping', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) return res.status(500).json({ status: 'Banco desconectado', error: err.message });
    res.json({ status: 'Banco conectado com sucesso!' });
  });
});

app.listen(PORT, () => {
  console.log('✅ Servidor rodando em http://localhost:' + PORT);
});
