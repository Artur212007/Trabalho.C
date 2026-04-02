const express = require('express');
const router = express.Router();
const db = require('./db');

// GET /fornecedores — lista todos
router.get('/', (req, res) => {
  db.query('SELECT * FROM fornecedor ORDER BY id_fornecedor ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /fornecedores/:id — busca um
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM fornecedor WHERE id_fornecedor = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    res.json(rows[0]);
  });
});

// POST /fornecedores — cria novo
router.post('/', (req, res) => {
  const { nome, telefone, email, endereco } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do fornecedor é obrigatório.' });
  }

  const sql = 'INSERT INTO fornecedor (nome, telefone, email, endereco) VALUES (?, ?, ?, ?)';
  db.query(sql, [nome.trim(), telefone || null, email || null, endereco || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id_fornecedor: result.insertId, ...req.body });
  });
});

// PUT /fornecedores/:id — atualiza
router.put('/:id', (req, res) => {
  const { nome, telefone, email, endereco } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do fornecedor é obrigatório.' });
  }

  const sql = 'UPDATE fornecedor SET nome = ?, telefone = ?, email = ?, endereco = ? WHERE id_fornecedor = ?';
  db.query(sql, [nome.trim(), telefone || null, email || null, endereco || null, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Fornecedor atualizado com sucesso' });
  });
});

// DELETE /fornecedores/:id — remove
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  // Verifica se fornecedores tem produtos vinculados
  db.query('SELECT COUNT(*) AS count FROM produto WHERE id_fornecedor = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows[0].count > 0) {
      return res.status(400).json({ error: 'Existem produtos ligados a este fornecedor. Exclua ou reatribua os produtos antes.' });
    }

    db.query('DELETE FROM fornecedor WHERE id_fornecedor = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Fornecedor removido com sucesso' });
    });
  });
});

module.exports = router;
