const router   = require('express').Router();
const auth     = require('../middleware/Auth');
const { q, buildSet } = require('../helpers/db');
const { err400, err404, err500, ok } = require('../helpers/Response');

// ── SQL BASE ──────────────────────────────────────────────────────────────────
const CAIXA_SELECT = `
  SELECT
    c.id_caixa,
    c.data,
    c.valor_abertura,
    c.valor_fechamento,
    c.id_funcionario,
    f.nome AS funcionario_nome,
    (
      c.valor_abertura +
      COALESCE((
        SELECT SUM(CASE WHEN tipo='entrada' THEN valor WHEN tipo='saida' THEN -valor ELSE 0 END)
        FROM movimentacao_caixa WHERE id_caixa = c.id_caixa
      ), 0)
    ) AS saldo
  FROM caixa c
  LEFT JOIN funcionario f ON f.id_funcionario = c.id_funcionario
`;

// ── TÉCNICOS ──────────────────────────────────────────────────────────────────
router.get('/tecnicos', auth, async (req, res) => {
  try {
    res.json(await q(`SELECT id_funcionario,nome,cargo FROM funcionario WHERE cargo=4 AND ativo=1 ORDER BY nome`));
  } catch (e) { err500(res, e); }
});

// ── RESUMO DO DIA ─────────────────────────────────────────────────────────────
router.get('/resumo/dia', auth, async (req, res) => {
  try {
    const r = await q(`${CAIXA_SELECT} WHERE DATE(c.data)=CURDATE() ORDER BY c.data DESC LIMIT 1`);
    res.json(
      r.length
        ? { ...r[0], status: r[0].valor_fechamento ? 'Fechado' : 'Aberto' }
        : { status: 'Fechado', message: 'Nenhum caixa aberto hoje' }
    );
  } catch (e) { err500(res, e); }
});

// ── HISTÓRICO ─────────────────────────────────────────────────────────────────
router.get('/historico', auth, async (req, res) => {
  const { data_inicio, data_fim } = req.query;
  let sql = `${CAIXA_SELECT} WHERE 1=1`, params = [];
  if (data_inicio) { sql += ' AND DATE(c.data)>=?'; params.push(data_inicio); }
  if (data_fim)    { sql += ' AND DATE(c.data)<=?'; params.push(data_fim); }
  sql += ' ORDER BY c.data DESC';
  try {
    const rows = await q(sql, params);
    res.json({
      total_registros:  rows.length,
      total_abertura:   rows.reduce((s, r) => s + r.valor_abertura, 0),
      total_fechamento: rows.reduce((s, r) => s + (r.valor_fechamento || 0), 0),
      saldo_total:      rows.reduce((s, r) => s + Number(r.saldo), 0),
      registros: rows,
    });
  } catch (e) { err500(res, e); }
});

// ── CAIXAS ABERTOS ────────────────────────────────────────────────────────────
router.get('/abertos', auth, async (req, res) => {
  try {
    const rows = await q(`
      SELECT c.id_caixa, c.data, c.valor_abertura, f.nome AS funcionario
      FROM caixa c
      LEFT JOIN funcionario f ON f.id_funcionario = c.id_funcionario
      WHERE c.valor_fechamento IS NULL
      ORDER BY c.data DESC
    `);
    res.json(rows);
  } catch (e) { err500(res, e); }
});

// ── LISTAR ────────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try { res.json(await q(`${CAIXA_SELECT} ORDER BY c.data DESC`)); }
  catch (e) { err500(res, e); }
});

// ── BUSCAR POR ID ─────────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const r = await q(`${CAIXA_SELECT} WHERE c.id_caixa=?`, [req.params.id]);
    r.length ? res.json(r[0]) : err404(res, 'Registro de caixa não encontrado');
  } catch (e) { err500(res, e); }
});

// ── ABRIR CAIXA ───────────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { valor_abertura, id_funcionario } = req.body;
  if (valor_abertura === undefined || !id_funcionario)
    return err400(res, 'Campos obrigatórios: valor_abertura, id_funcionario');
  if (valor_abertura < 0)
    return err400(res, 'Valor de abertura não pode ser negativo');

  try {
    const aberto = await q(`SELECT id_caixa FROM caixa WHERE id_funcionario=? AND valor_fechamento IS NULL`, [id_funcionario]);
    if (aberto.length) return err400(res, 'Este funcionário já possui um caixa aberto');

    const r = await q(
      `INSERT INTO caixa (data,valor_abertura,valor_fechamento,id_funcionario) VALUES (NOW(),?,NULL,?)`,
      [valor_abertura, id_funcionario]
    );
    res.status(201).json({ success: true, message: 'Caixa aberto com sucesso', id_caixa: r.insertId });
  } catch (e) { err500(res, e); }
});

// ── FECHAR CAIXA ──────────────────────────────────────────────────────────────
router.put('/:id/fechar', auth, async (req, res) => {
  const { valor_fechamento } = req.body;
  if (valor_fechamento === undefined) return err400(res, 'Valor de fechamento é obrigatório');

  try {
    const [caixa] = await q(`
      SELECT c.id_caixa, c.valor_abertura,
        (c.valor_abertura + COALESCE((
          SELECT SUM(CASE WHEN tipo='entrada' THEN valor WHEN tipo='saida' THEN -valor ELSE 0 END)
          FROM movimentacao_caixa WHERE id_caixa = c.id_caixa
        ), 0)) AS saldo
      FROM caixa c
      WHERE c.id_caixa = ? AND c.valor_fechamento IS NULL
    `, [req.params.id]);

    if (!caixa) return err404(res, 'Caixa não encontrado ou já está fechado');

    const saldo    = Number(caixa.saldo);
    const fechamento = Number(valor_fechamento);

    if (fechamento !== saldo)
      return res.status(400).json({ error: `O valor de fechamento (${fechamento}) não bate com o saldo (${saldo})` });
    if (Math.abs(fechamento - saldo) > 0.01)
      return res.status(400).json({ error: `Valor incorreto. Saldo esperado: ${saldo.toFixed(2)}` });

    await q(`UPDATE caixa SET valor_fechamento=? WHERE id_caixa=?`, [fechamento, req.params.id]);
    ok(res, { message: 'Caixa fechado com sucesso' });
  } catch (e) { err500(res, e); }
});

// ── ATUALIZAR ─────────────────────────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const exists = await q(`SELECT id_caixa FROM caixa WHERE id_caixa=?`, [req.params.id]);
    if (!exists.length) return err404(res, 'Registro de caixa não encontrado');

    const { cols, vals } = buildSet(req.body, ['data', 'valor_abertura', 'valor_fechamento', 'id_funcionario']);
    if (!cols.length) return err400(res, 'Nenhum campo para atualizar');

    await q(`UPDATE caixa SET ${cols.join(', ')} WHERE id_caixa=?`, [...vals, req.params.id]);
    ok(res, { message: 'Registro de caixa atualizado com sucesso' });
  } catch (e) { err500(res, e); }
});

// ── EXCLUIR ───────────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const exists = await q(`SELECT id_caixa FROM caixa WHERE id_caixa=?`, [req.params.id]);
    if (!exists.length) return err404(res, 'Registro de caixa não encontrado');
    await q(`DELETE FROM caixa WHERE id_caixa=?`, [req.params.id]);
    ok(res, { message: 'Registro de caixa excluído com sucesso' });
  } catch (e) { err500(res, e); }
});

module.exports = router;