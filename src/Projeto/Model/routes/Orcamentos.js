const router   = require('express').Router();
const auth     = require('../middleware/Auth');
const { q, buildSet } = require('../helpers/db');
const { err400, err404, err500, ok } = require('../helpers/Response');

function statusToDb(status) {
  if (status === 1 || status === '1' || status === 'aceito') return 1;
  if (status === 2 || status === '2' || status === 'cancelado') return 2;
  return 0;
}

function statusToText(status) {
  if (status === 1 || status === '1') return 'aceito';
  if (status === 2 || status === '2') return 'cancelado';
  return 'pendente';
}

// ── LISTAR ────────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const rows = await q(`
      SELECT o.id_orcamento, o.id_cliente, o.descricao, o.valor_total, o.validade,
             CASE
               WHEN o.status = 1 THEN 'aceito'
               WHEN o.status = 2 THEN 'cancelado'
               ELSE 'pendente'
             END AS status,
             c.nome AS nome_cliente
      FROM orcamento o
      LEFT JOIN cliente c ON c.id_cliente = o.id_cliente
      ORDER BY o.id_orcamento DESC
    `);
    res.json(rows);
  } catch (e) {
    console.error('ERRO REAL:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── DISPONÍVEIS (para vincular a OS) ─────────────────────────────────────────
router.get('/disponiveis', auth, async (req, res) => {
  try {
    const rows = await q(`
      SELECT o.id_orcamento, o.descricao, o.valor_total
      FROM orcamento o
      LEFT JOIN ordem_servico os ON os.id_orcamento = o.id_orcamento
      WHERE o.status = 1 AND os.id_orcamento IS NULL
      ORDER BY o.id_orcamento DESC
    `);
    res.json(rows);
  } catch (e) { err500(res, e); }
});

// ── BUSCAR POR ID ─────────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const r = await q(`
      SELECT o.*, 
             CASE
               WHEN o.status = 1 THEN 'aceito'
               WHEN o.status = 2 THEN 'cancelado'
               ELSE 'pendente'
             END AS status_text
      FROM orcamento o
      WHERE o.id_orcamento=?
    `, [req.params.id]);
    if (!r.length) return err404(res, 'Orçamento não encontrado');
    const orcamento = r[0];
    res.json({ ...orcamento, status: orcamento.status_text || statusToText(orcamento.status) });
  } catch (e) { err500(res, e); }
});

// ── CRIAR ─────────────────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { id_cliente, descricao, valor_total, validade, status, tipo } = req.body;
  if (!id_cliente || !valor_total || !validade)
    return err400(res, 'Campos obrigatórios: id_cliente, valor_total, validade');

  try {
    const statusDb = statusToDb(status);
    const r = await q(
      `INSERT INTO orcamento (id_cliente,descricao,valor_total,validade,status) VALUES (?,?,?,?,?)`,
      [id_cliente, descricao || null, valor_total, validade, statusDb]
    );
    const id_orcamento = r.insertId;

    // Cria OS automática se orçamento de OS for aceito
    if (tipo === 'os' && status === 'aceito') {
      await q(
        `INSERT INTO ordem_servico (id_cliente,descricao_problema,status,data_abertura) VALUES (?,?,0,NOW())`,
        [id_cliente, descricao || 'Gerado automaticamente']
      );
    }

    res.status(201).json({ success: true, id_orcamento });
  } catch (e) {
    console.error(e);
    err500(res, e);
  }
});

// ── ATUALIZAR ─────────────────────────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const [orc] = await q(`SELECT * FROM orcamento WHERE id_orcamento=?`, [id]);
    if (!orc) return err404(res, 'Orçamento não encontrado');

    const payload = { ...req.body };
    if (payload.status !== undefined) payload.status = statusToDb(payload.status);

    const { cols, vals } = buildSet(payload, ['id_cliente', 'descricao', 'valor_total', 'validade', 'status']);
    if (!cols.length) return err400(res, 'Nada para atualizar');

    await q(`UPDATE orcamento SET ${cols.join(', ')} WHERE id_orcamento=?`, [...vals, id]);

    // Cria OS se orçamento virou tipo=os e status=aceito
    const novoStatus = req.body.status || statusToText(orc.status);
    const novoTipo   = req.body.tipo   || orc.tipo;

    if (novoTipo === 'os' && novoStatus === 'aceito') {
      const existing = await q(
        `SELECT id_ordem_servico FROM ordem_servico WHERE id_cliente=? AND descricao_problema=?`,
        [orc.id_cliente, orc.descricao]
      );
      if (!existing.length) {
        await q(
          `INSERT INTO ordem_servico (id_cliente,descricao_problema,status,data_abertura) VALUES (?,?,?,NOW())`,
          [orc.id_cliente, orc.descricao || 'Gerado automaticamente', 0]
        );
      }
    }

    ok(res, { message: 'Orçamento atualizado com sucesso' });
  } catch (e) {
    console.error(e);
    err500(res, e);
  }
});

// ── ACEITAR ───────────────────────────────────────────────────────────────────
router.put('/:id/aceitar', auth, async (req, res) => {
  try {
    const [orc] = await q(`SELECT * FROM orcamento WHERE id_orcamento=?`, [req.params.id]);
    if (!orc) return err404(res, 'Orçamento não encontrado');
    if (statusToText(orc.status) === 'aceito') return err400(res, 'Orçamento já foi aceito');

    await q(`UPDATE orcamento SET status=1 WHERE id_orcamento=?`, [req.params.id]);

    // Se for tipo OS → cria ordem de serviço
    if (Number(orc.tipo) === 1) {
      await q(
        `INSERT INTO ordem_servico (id_cliente,id_tecnico,descricao_problema,status,id_orcamento,data_abertura)
         VALUES (?,?,?,0,?,NOW())`,
        [orc.id_cliente, orc.id_tecnico, orc.descricao || 'Gerado a partir de orçamento', orc.id_orcamento]
      );
    }

    ok(res, { message: 'Orçamento aceito com sucesso' });
  } catch (e) { err500(res, e); }
});

// ── CANCELAR ──────────────────────────────────────────────────────────────────
router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    await q(`UPDATE orcamento SET status=2 WHERE id_orcamento=?`, [req.params.id]);
    ok(res, { message: 'Orçamento cancelado' });
  } catch (e) { err500(res, e); }
});

// ── EXCLUIR ───────────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const exists = await q(`SELECT id_orcamento FROM orcamento WHERE id_orcamento=?`, [req.params.id]);
    if (!exists.length) return err404(res, 'Orçamento não encontrado');
    await q(`DELETE FROM orcamento WHERE id_orcamento=?`, [req.params.id]);
    ok(res, { message: 'Orçamento deletado com sucesso' });
  } catch (e) { err500(res, e); }
});

module.exports = router;