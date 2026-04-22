const router = require('express').Router();
const auth   = require('../middleware/Auth');
const { q }  = require('../helpers/db');
const { err400, err500 } = require('../helpers/Response');

// ── CRIAR ─────────────────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { descricao, valor, status } = req.body;
  if (!valor || valor <= 0) return err400(res, 'Valor deve ser maior que zero');

  try {
    const r = await q(
      `INSERT INTO despesa (descricao,valor,status,data) VALUES (?,?,?,NOW())`,
      [descricao || 'Despesa', valor, status || 'pendente']
    );
    const id_despesa = r.insertId;

    // Se já for paga → saída no caixa
    if (status === 'pago') {
      const [caixa] = await q(`SELECT id_caixa FROM caixa WHERE valor_fechamento IS NULL ORDER BY data DESC LIMIT 1`);
      if (caixa) {
        await q(
          `INSERT INTO movimentacao_caixa (id_caixa,tipo,valor,descricao) VALUES (?,'saida',?,?)`,
          [caixa.id_caixa, valor, `Despesa #${id_despesa} - ${descricao || 'Sem descrição'}`]
        );
      }
    }

    res.status(201).json({ success: true, id_despesa });
  } catch (e) { err500(res, e); }
});

// ── LISTAR ────────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try { res.json(await q(`SELECT * FROM despesa ORDER BY data DESC`)); }
  catch (e) { err500(res, e); }
});

// ── BUSCAR POR ID ─────────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const rows = await q(`SELECT * FROM despesa WHERE id_despesa=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Despesa não encontrada' });
    res.json(rows[0]);
  } catch (e) { err500(res, e); }
});

// ── ATUALIZAR ─────────────────────────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  const { descricao, valor, status, data } = req.body;
  try {
    const exists = await q(`SELECT id_despesa FROM despesa WHERE id_despesa=?`, [req.params.id]);
    if (!exists.length) return res.status(404).json({ error: 'Despesa não encontrada' });

    await q(
      `UPDATE despesa SET descricao=?,valor=?,status=?,data=? WHERE id_despesa=?`,
      [descricao, valor, status, data, req.params.id]
    );
    res.json({ success: true });
  } catch (e) { err500(res, e); }
});

module.exports = router;