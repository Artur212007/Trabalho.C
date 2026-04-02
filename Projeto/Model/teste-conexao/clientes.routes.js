const express = require('express');
const router  = express.Router();
const db      = require('./db');

// GET /clientes — lista todos
router.get('/', (req, res) => {
  db.query('SELECT * FROM cliente WHERE ativo = 1 ORDER BY id_cliente ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /clientes/:id — busca um
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM cliente WHERE id_cliente = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(rows[0]);
  });
});

// POST /clientes — cria novo
router.post('/', (req, res) => {
  const { nome, cpf_cnpj, telefone, email, endereco, usuario, senha } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do cliente é obrigatório.' });
  }

  // Verifica se usuário já existe
  if (usuario) {
    db.query('SELECT id_cliente FROM cliente WHERE usuario = ?', [usuario], (errU, resU) => {
      if (errU) return res.status(500).json({ error: errU.message });
      if (resU.length > 0) return res.status(409).json({ error: 'Usuário já existe.' });
      inserir();
    });
  } else {
    inserir();
  }

  function inserir() {
    const sql = `
      INSERT INTO cliente (nome, cpf_cnpj, telefone, email, \`endereço\`, usuario, senha, nivel_acesso, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 6, 1)
    `;
    db.query(sql, [nome, cpf_cnpj || null, telefone || null, email || null, endereco || null, usuario || null, senha || null], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id_cliente: result.insertId, ...req.body });
    });
  }
});

// PUT /clientes/:id — atualiza
router.put('/:id', (req, res) => {
  const { nome, cpf_cnpj, telefone, email, endereco, usuario, senha } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do cliente é obrigatório.' });
  }

  // Se senha foi informada, atualiza; senão mantém a existente
  if (senha) {
    const sql = `
      UPDATE cliente SET nome=?, cpf_cnpj=?, telefone=?, email=?, \`endereço\`=?, usuario=?, senha=?
      WHERE id_cliente=?
    `;
    db.query(sql, [nome, cpf_cnpj || null, telefone || null, email || null, endereco || null, usuario || null, senha, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Cliente atualizado com sucesso' });
    });
  } else {
    const sql = `
      UPDATE cliente SET nome=?, cpf_cnpj=?, telefone=?, email=?, \`endereço\`=?, usuario=?
      WHERE id_cliente=?
    `;
    db.query(sql, [nome, cpf_cnpj || null, telefone || null, email || null, endereco || null, usuario || null, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Cliente atualizado com sucesso' });
    });
  }
});

// DELETE /clientes/:id — desativa (soft delete)
router.delete('/:id', (req, res) => {
  db.query('UPDATE cliente SET ativo = 0 WHERE id_cliente = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cliente removido com sucesso' });
  });
});

module.exports = router;