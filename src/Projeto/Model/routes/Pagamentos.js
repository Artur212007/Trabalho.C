const router   = require('express').Router();
const auth     = require('../middleware/Auth');
const { q, buildSet } = require('../helpers/db');
const { err400, err404, err500, ok } = require('../helpers/Response');

// ── SQL BASE ──────────────────────────────────────────────────────────────────
const PAG_SELECT = `
  SELECT
    p.id_pagamento, p.id_venda, p.id_ordem_servico, p.id_cliente, p.id_despesa,
    p.valor, p.forma_pagamento, p.parcelas, p.status,
    p.data_pagamento, p.data_vencimento, p.descricao,
    c.nome AS cliente_nome,
    d.descricao AS despesa_descricao
  FROM pagamento p
  LEFT JOIN cliente c ON c.id_cliente = p.id_cliente
  LEFT JOIN despesa d ON d.id_despesa = p.id_despesa
`;

// ── HELPER: movimenta caixa aberto ───────────────────────────────────────────
async function movimentarCaixa(tipo, valor, descricao) {
  const [caixa] = await q(`SELECT id_caixa FROM caixa WHERE valor_fechamento IS NULL ORDER BY data DESC LIMIT 1`);
  if (caixa) {
    await q(
      `INSERT INTO movimentacao_caixa (id_caixa,tipo,valor,descricao) VALUES (?,?,?,?)`,
      [caixa.id_caixa, tipo, valor, descricao]
    );
  }
}

// ── LISTAR ────────────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try { res.json(await q(`${PAG_SELECT} ORDER BY p.data_pagamento DESC`)); }
  catch (e) { err500(res, e); }
});

// ── BUSCAR POR ID ─────────────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const r = await q(`${PAG_SELECT} WHERE p.id_pagamento=?`, [req.params.id]);
    r.length ? res.json(r[0]) : err404(res, 'Pagamento não encontrado');
  } catch (e) { err500(res, e); }
});

// ── CRIAR ─────────────────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { valor, forma_pagamento, id_cliente, id_despesa, id_venda, id_ordem_servico, parcelas, status, descricao, data_pagamento, data_vencimento } = req.body;

  if (!valor || valor <= 0)        return err400(res, 'Valor deve ser maior que zero');
  if (!forma_pagamento)            return err400(res, 'Forma de pagamento obrigatória');
  if (!id_cliente && !id_despesa && !id_venda && !id_ordem_servico)
    return err400(res, 'Informe ao menos uma origem: cliente, despesa, venda ou OS');

  try {
    const r = await q(`
      INSERT INTO pagamento
        (id_cliente,id_despesa,id_venda,id_ordem_servico,valor,forma_pagamento,parcelas,status,data_pagamento,data_vencimento,descricao)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `, [
      id_cliente || null, id_despesa || null, id_venda || null, id_ordem_servico || null,
      valor, forma_pagamento, parcelas || 1, status || 'pendente',
      data_pagamento || null, data_vencimento || null, descricao || null,
    ]);

    // Movimenta caixa se já for pago
    if (status === 'pago') {
      const tipoMov = id_despesa ? 'saida' : 'entrada';
      const desc    = id_despesa
        ? `Despesa #${id_despesa} - ${descricao || ''}`
        : `Recebimento - ${descricao || 'Pagamento cliente'}`;
      await movimentarCaixa(tipoMov, valor, desc);
    }

    res.status(201).json({ success: true, id_pagamento: r.insertId });
  } catch (e) { err500(res, e); }
});

// ── ATUALIZAR ─────────────────────────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const exists = await q(`SELECT id_pagamento FROM pagamento WHERE id_pagamento=?`, [req.params.id]);
    if (!exists.length) return err404(res, 'Pagamento não encontrado');

    const { cols, vals } = buildSet(req.body, [
      'valor', 'forma_pagamento', 'parcelas', 'status', 'descricao',
      'id_venda', 'id_ordem_servico', 'id_cliente', 'data_pagamento', 'data_vencimento',
    ]);
    if (!cols.length) return err400(res, 'Nenhum campo para atualizar');

    await q(`UPDATE pagamento SET ${cols.join(', ')} WHERE id_pagamento=?`, [...vals, req.params.id]);
    ok(res, { message: 'Pagamento atualizado com sucesso' });
  } catch (e) { err500(res, e); }
});

// ── BAIXAR ────────────────────────────────────────────────────────────────────
router.put('/:id/baixar', auth, async (req, res) => {
  try {
    const [pag] = await q(`SELECT * FROM pagamento WHERE id_pagamento=?`, [req.params.id]);
    if (!pag) return err404(res, 'Pagamento não encontrado');
    if (pag.status === 'pago') return err400(res, 'Já está pago');

    await q(`UPDATE pagamento SET status='pago',data_pagamento=NOW() WHERE id_pagamento=?`, [req.params.id]);
    await movimentarCaixa('entrada', pag.valor, `Baixa pagamento ID ${pag.id_pagamento}`);

    ok(res, { message: 'Pagamento baixado com sucesso' });
  } catch (e) { err500(res, e); }
});

// ── EXCLUIR ───────────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const exists = await q(`SELECT id_pagamento FROM pagamento WHERE id_pagamento=?`, [req.params.id]);
    if (!exists.length) return err404(res, 'Pagamento não encontrado');
    await q(`DELETE FROM pagamento WHERE id_pagamento=?`, [req.params.id]);
    ok(res, { message: 'Pagamento excluído com sucesso' });
  } catch (e) { err500(res, e); }
});

module.exports = router;