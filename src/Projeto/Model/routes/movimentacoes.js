const router = require('express').Router();
const auth   = require('../middleware/Auth');
const { q }  = require('../helpers/db');
const { err500 } = require('../helpers/Response');

// ── LISTAR MOVIMENTAÇÕES DO CAIXA ABERTO ──────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const [caixa] = await q(`
      SELECT id_caixa FROM caixa
      WHERE valor_fechamento IS NULL
      ORDER BY data DESC LIMIT 1
    `);

    if (!caixa) return res.json([]);

    const rows = await q(`
      SELECT * FROM movimentacao_caixa
      WHERE id_caixa = ?
      ORDER BY id_movimentacao DESC
    `, [caixa.id_caixa]);

    res.json(rows);
  } catch (e) { err500(res, e); }
});

module.exports = router;