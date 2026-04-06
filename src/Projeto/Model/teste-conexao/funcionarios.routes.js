const express = require('express');
const router = express.Router();
const db = require('./db');

// GET /funcionarios — lista todos
router.get('/', (req, res) => {
  db.query('SELECT * FROM funcionario ORDER BY id_funcionario ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /funcionarios/:id — busca um
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM funcionario WHERE id_funcionario = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json(rows[0]);
  });
});

// POST /funcionarios — cria novo
router.post('/', (req, res) => {
  const { nome, cargo, salario, percentual_comissao, ativo } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do funcionário é obrigatório.' });
  }
  if (cargo == null || cargo === "" || isNaN(Number(cargo))) {
    return res.status(400).json({ error: 'O cargo do funcionário é obrigatório.' });
  }

  const sql = `INSERT INTO funcionario (nome, cargo, salario, percentual_comissao, ativo) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [nome.trim(), Number(cargo), Number(salario) || 0, Number(percentual_comissao) || 0, ativo ? 1 : 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id_funcionario: result.insertId, ...req.body });
  });
});

// PUT /funcionarios/:id — atualiza
router.put('/:id', (req, res) => {
  const { nome, cargo, salario, percentual_comissao, ativo } = req.body;
  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome do funcionário é obrigatório.' });
  }
  if (cargo == null || cargo === "" || isNaN(Number(cargo))) {
    return res.status(400).json({ error: 'O cargo do funcionário é obrigatório.' });
  }

  const sql = `UPDATE funcionario SET nome = ?, cargo = ?, salario = ?, percentual_comissao = ?, ativo = ? WHERE id_funcionario = ?`;
  db.query(sql, [nome.trim(), Number(cargo), Number(salario) || 0, Number(percentual_comissao) || 0, ativo ? 1 : 0, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Funcionário atualizado com sucesso' });
  });
});

// DELETE /funcionarios/:id — desativa
router.delete('/:id', (req, res) => {
  const sql = `UPDATE funcionario SET ativo = 0 WHERE id_funcionario = ?`;
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Funcionário desativado com sucesso' });
  });
});

module.exports = router;
