const router   = require('express').Router();
const auth     = require('../middleware/Auth');
const { q, buildSet } = require('../helpers/db');
const { err400, err404, err500, ok } = require('../helpers/Response');

// ── LISTAR ────────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    res.json(await q(`
      SELECT
        os.id_ordem_servico,
        os.descricao_problema,
        os.status,
        os.id_orcamento,
        os.data_abertura,
        c.nome AS nome_cliente,
        f.nome AS nome_tecnico
      FROM ordem_servico os
      LEFT JOIN cliente c ON c.id_cliente=os.id_cliente
      LEFT JOIN funcionario f ON f.id_funcionario=os.id_tecnico
      ORDER BY os.data_abertura DESC
    `));
  } catch (e) { err500(res, e); }
});

// ── BUSCAR POR ID ─────────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const r = await q(
      `SELECT os.*,c.nome AS nome_cliente,f.nome AS nome_tecnico
       FROM ordem_servico os
       LEFT JOIN cliente c ON c.id_cliente=os.id_cliente
       LEFT JOIN funcionario f ON f.id_funcionario=os.id_tecnico
       WHERE os.id_ordem_servico=?`,
      [req.params.id]
    );
    r.length ? res.json(r[0]) : err404(res, 'OS não encontrada');
  } catch (e) { err500(res, e); }
});

// ── CRIAR ─────────────────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { id_cliente, id_tecnico, descricao_problema, status } = req.body;
  if (!id_cliente || !descricao_problema)
    return err400(res, 'Campos obrigatórios: id_cliente, id_tecnico, descricao_problema');

  try {
    const r = await q(
      `INSERT INTO ordem_servico (id_cliente,id_tecnico,descricao_problema,status,data_abertura) VALUES (?,?,?,?,NOW())`,
      [id_cliente, id_tecnico, descricao_problema, status ?? 0]
    );
    res.status(201).json({ success: true, id_ordem_servico: r.insertId });
  } catch (e) { err500(res, e); }
});

// ── ATUALIZAR ─────────────────────────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await q(`SELECT id_ordem_servico FROM ordem_servico WHERE id_ordem_servico=?`, [id]);
    if (!exists.length) return err404(res, 'OS não encontrada');

    const { cols, vals } = buildSet(req.body, ['id_cliente', 'id_tecnico', 'descricao_problema', 'status', 'id_orcamento']);
    if (!cols.length) return err400(res, 'Nada para atualizar');

    await q(`UPDATE ordem_servico SET ${cols.join(', ')} WHERE id_ordem_servico=?`, [...vals, id]);
    ok(res, { message: 'OS atualizada com sucesso' });
  } catch (e) { err500(res, e); }
});

// ── EXCLUIR ───────────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await q(`SELECT id_ordem_servico FROM ordem_servico WHERE id_ordem_servico=?`, [id]);
    if (!exists.length) return err404(res, 'OS não encontrada');
    await q(`DELETE FROM ordem_servico WHERE id_ordem_servico=?`, [id]);
    ok(res, { message: 'OS deletada com sucesso' });
  } catch (e) { err500(res, e); }
});

module.exports = router;