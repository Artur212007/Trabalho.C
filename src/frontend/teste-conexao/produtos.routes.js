const express = require('express');
const router  = express.Router();
const db      = require('./db');

// GET /produtos — lista todos
router.get('/', (req, res) => {
  db.query('SELECT * FROM produto ORDER BY id_produto ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /produtos/:id — busca um
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM produto WHERE id_produto = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(rows[0]);
  });
});

// POST /produtos — cria novo
router.post('/', (req, res) => {
  const { nome, preco_custo, preco_venda, quantidade_estoque, estoque_minimo, garantia, id_fornecedor, tipo } = req.body;

  // Verifica se o fornecedor existe antes de inserir
  db.query('SELECT id_fornecedor FROM fornecedor WHERE id_fornecedor = ?', [id_fornecedor], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) {
      return res.status(400).json({ error: `Fornecedor com ID ${id_fornecedor} não encontrado. Verifique o ID do fornecedor.` });
    }

    const sql = `
      INSERT INTO produto (nome, preco_custo, preco_venda, quantidade_estoque, estoque_minimo, garantia, id_fornecedor, tipo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [nome, preco_custo, preco_venda, quantidade_estoque, estoque_minimo, garantia, id_fornecedor, tipo], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id_produto: result.insertId, ...req.body });
    });
  });
});

// PUT /produtos/:id — atualiza
router.put('/:id', (req, res) => {
  const { nome, preco_custo, preco_venda, quantidade_estoque, estoque_minimo, garantia, id_fornecedor, tipo } = req.body;

  // Verifica se o fornecedor existe antes de atualizar
  db.query('SELECT id_fornecedor FROM fornecedor WHERE id_fornecedor = ?', [id_fornecedor], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) {
      return res.status(400).json({ error: `Fornecedor com ID ${id_fornecedor} não encontrado. Verifique o ID do fornecedor.` });
    }

    const sql = `
      UPDATE produto SET nome=?, preco_custo=?, preco_venda=?, quantidade_estoque=?,
      estoque_minimo=?, garantia=?, id_fornecedor=?, tipo=?
      WHERE id_produto=?
    `;
    db.query(sql, [nome, preco_custo, preco_venda, quantidade_estoque, estoque_minimo, garantia, id_fornecedor, tipo, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Produto atualizado com sucesso' });
    });
  });
});

// DELETE /produtos/:id — remove (apaga itens vinculados antes para evitar erro de foreign key)
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  // 1. Deleta de item_venda
  db.query('DELETE FROM item_venda WHERE id_produto = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Deleta de item_da_venda (ignora se a tabela não existir)
    db.query('DELETE FROM item_da_venda WHERE id_produto = ?', [id], (err) => {
      if (err && !err.message.includes("doesn't exist")) {
        return res.status(500).json({ error: err.message });
      }

      // 3. Deleta o produto
      db.query('DELETE FROM produto WHERE id_produto = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Produto excluído com sucesso' });
      });
    });
  });
});

module.exports = router;