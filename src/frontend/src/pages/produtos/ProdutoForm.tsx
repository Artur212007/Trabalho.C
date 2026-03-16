import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar/";

const API = "http://localhost:3001";

type Tipo = 1 | 2 | 3;

interface FormData {
  nome: string;
  tipo: Tipo;
  preco_custo: number;
  preco_venda: number;
  quantidade_estoque: number;
  estoque_minimo: number;
  garantia: number;
  id_fornecedor: number;
}

const EMPTY: FormData = {
  nome: "", tipo: 1, preco_custo: 0, preco_venda: 0,
  quantidade_estoque: 0, estoque_minimo: 5, garantia: 0, id_fornecedor: 1,
};

const IconArrow = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconCheck = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

export default function ProdutoForm() {
  const navigate    = useNavigate();
  const { id }      = useParams<{ id?: string }>();
  const isEdit      = Boolean(id);

  const [form, setForm]         = useState<FormData>(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm]   = useState(false);
  const [toast, setToast]       = useState<{ msg: string; type: "ok" | "err"; visible: boolean }>({ msg: "", type: "ok", visible: false });

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }

  // Carrega produto se for edição
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    fetch(`${API}/produtos/${id}`)
      .then(r => r.json())
      .then(p => {
        setForm({
          nome:               p.nome,
          tipo:               p.tipo,
          preco_custo:        p.preco_custo / 100,
          preco_venda:        p.preco_venda / 100,
          quantidade_estoque: p.quantidade_estoque,
          estoque_minimo:     p.estoque_minimo,
          garantia:           p.garantia,
          id_fornecedor:      p.id_fornecedor,
        });
      })
      .catch(() => showToast("Erro ao carregar produto.", "err"))
      .finally(() => setLoading(false));
  }, [id]);

  function set(key: keyof FormData, val: string | number) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    if (!form.nome.trim()) { showToast("Informe o nome do produto.", "err"); return; }
    setSaving(true);
    const body = {
      nome:               form.nome,
      tipo:               form.tipo,
      preco_custo:        Math.round(form.preco_custo * 100),
      preco_venda:        Math.round(form.preco_venda * 100),
      quantidade_estoque: form.quantidade_estoque,
      estoque_minimo:     form.estoque_minimo,
      garantia:           form.garantia,
      id_fornecedor:      form.id_fornecedor,
    };
    try {
      const url    = isEdit ? `${API}/produtos/${id}` : `${API}/produtos`;
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      showToast(isEdit ? "Produto atualizado!" : "Produto cadastrado!");
      setTimeout(() => navigate("/produtos"), 1200);
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar. Verifique os dados.", "err");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`${API}/produtos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      showToast("Produto excluído.");
      setTimeout(() => navigate("/produtos"), 1200);
    } catch (err) {
      console.error(err);
      showToast("Erro ao excluir produto.", "err");
    } finally {
      setDeleting(false);
      setConfirm(false);
    }
  }

  return (
    <div className="pf-wrapper">
      <Sidebar />
      <>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pf-wrapper {
          display: flex;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        .pf-page {
          flex: 1;
          height: 100vh;
          overflow-y: auto;
          background: #F5F5F5;
          font-family: 'Poppins', sans-serif;
          padding: 32px;
        }

        .pf-page::-webkit-scrollbar { width: 6px; }
        .pf-page::-webkit-scrollbar-track { background: transparent; }
        .pf-page::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }

        /* ── Header ── */
        .pf-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
        }
        .pf-back {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; cursor: pointer;
          font-family: 'Poppins', sans-serif; font-size: 14px;
          font-weight: 600; color: #1A1A1A;
          padding: 8px 14px; border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,.12);
          transition: all .2s;
        }
        .pf-back:hover { background: #1A1A1A; color: #fff; border-color: #1A1A1A; }

        .pf-title-block h1 { font-size: 22px; font-weight: 700; }
        .pf-title-block p  { font-size: 13px; color: #71797E; margin-top: 2px; }

        .pf-header-actions { display: flex; gap: 10px; align-items: center; }

        /* ── Card ── */
        .pf-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,.09);
          overflow: hidden;
          max-width: 720px;
          margin: 0 auto;
          animation: slideUp .35s ease both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pf-card-header {
          background: #1A1A1A;
          padding: 20px 28px;
          display: flex; align-items: center; gap: 14px;
        }
        .pf-card-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: #FFD100;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .pf-card-header h2 { font-size: 16px; font-weight: 700; color: #fff; }
        .pf-card-header p  { font-size: 12px; color: rgba(255,255,255,.5); margin-top: 2px; }

        /* ── Form ── */
        .pf-form { padding: 28px; }

        .pf-section-title {
          font-size: 11px; font-weight: 700; color: #71797E;
          letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 16px; margin-top: 24px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(0,0,0,.07);
        }
        .pf-section-title:first-child { margin-top: 0; }

        .pf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pf-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
        .pf-full { grid-column: 1 / -1; }

        .pf-field { display: flex; flex-direction: column; gap: 6px; }
        .pf-field label {
          font-size: 11px; font-weight: 600; color: #71797E;
          letter-spacing: .5px; text-transform: uppercase;
        }
        .pf-field input,
        .pf-field select {
          background: #F5F5F5;
          color: #1A1A1A;
          border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,.1);
          padding: 0 14px;
          height: 44px;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          width: 100%;
        }
        .pf-field input:focus,
        .pf-field select:focus {
          border-color: #FFD100;
          box-shadow: 0 0 0 3px rgba(255,209,0,.15);
          background: #fff;
        }
        .pf-field input::placeholder { color: #aaa; }

        /* preço highlight */
        .pf-field.price input {
          font-weight: 600;
          font-size: 14px;
        }

        /* ── Footer ── */
        .pf-footer {
          padding: 20px 28px;
          border-top: 1px solid rgba(0,0,0,.08);
          display: flex; justify-content: space-between; align-items: center; gap: 12px;
          flex-wrap: wrap;
        }
        .pf-footer-right { display: flex; gap: 10px; }

        /* ── Buttons ── */
        .btn {
          cursor: pointer; border: none;
          border-radius: 10px;
          font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 13px;
          padding: 0 20px; height: 42px;
          display: flex; align-items: center; gap: 8px;
          transition: all .2s;
        }
        .btn:disabled { opacity: .6; cursor: not-allowed; }
        .btn-primary { background: #FFD100; color: #000; }
        .btn-primary:hover:not(:disabled) { filter: brightness(.93); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,209,0,.4); }
        .btn-ghost  { background: transparent; color: #71797E; border: 1.5px solid rgba(0,0,0,.12); }
        .btn-ghost:hover:not(:disabled) { border-color: #1A1A1A; color: #1A1A1A; }
        .btn-danger { background: #FF4500; color: #fff; }
        .btn-danger:hover:not(:disabled) { background: #e03d00; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255,69,0,.35); }

        /* ── Loading skeleton ── */
        .pf-loading { padding: 60px 28px; text-align: center; color: #71797E; font-size: 14px; }

        /* ── Confirm overlay ── */
        .confirm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.4); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 200;
          opacity: 0; pointer-events: none; transition: opacity .2s;
        }
        .confirm-overlay.open { opacity: 1; pointer-events: all; }
        .confirm-box {
          background: #fff; border-radius: 18px; padding: 32px;
          width: 360px; max-width: 95vw; text-align: center;
          box-shadow: 0 24px 60px rgba(0,0,0,.2);
          transform: scale(.95); transition: transform .2s;
        }
        .confirm-overlay.open .confirm-box { transform: scale(1); }
        .confirm-icon { font-size: 40px; margin-bottom: 12px; }
        .confirm-box h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
        .confirm-box p  { font-size: 13px; color: #71797E; line-height: 1.6; margin-bottom: 24px; }
        .confirm-actions { display: flex; gap: 10px; justify-content: center; }

        /* ── Toast ── */
        .toast {
          position: fixed; bottom: 28px; right: 28px;
          background: #1A1A1A; color: #fff;
          padding: 14px 22px; border-radius: 12px;
          font-size: 13px; font-weight: 500;
          display: flex; align-items: center; gap: 10px;
          transform: translateY(80px); opacity: 0;
          transition: all .3s ease; z-index: 300;
          box-shadow: 0 8px 28px rgba(0,0,0,.25);
          pointer-events: none;
        }
        .toast.show { transform: translateY(0); opacity: 1; }
        .toast-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .toast-dot.ok  { background: #FFD100; }
        .toast-dot.err { background: #FF4500; }

        @media (max-width: 900px) {
          .pf-page { padding: 16px 16px 16px 16px; padding-top: 72px; }
          .pf-grid, .pf-grid.cols-3 { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 600px) {
          .pf-page { padding: 12px; }
          .pf-grid, .pf-grid.cols-3 { grid-template-columns: 1fr; }
          .pf-full { grid-column: 1; }
          .pf-header { flex-direction: column; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
          .pf-title-block h1 { font-size: 18px; }
          .pf-title-block p { font-size: 12px; }
          .pf-card { border-radius: 12px; }
          .pf-form { padding: 20px 16px; }
          .pf-footer { padding: 16px; flex-direction: column-reverse; }
          .pf-footer-right { width: 100%; }
          .pf-footer-right .btn, .pf-footer .btn-ghost { width: 100%; justify-content: center; }
          .pf-back span { display: none; }
          .confirm-box { padding: 24px 16px; }
        }

        @media (max-width: 400px) {
          .pf-page { padding: 8px; }
          .pf-card-header { padding: 16px; }
        }
      `}</style>

      <div className="pf-page">
        {/* Header */}
        <div className="pf-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="pf-back" onClick={() => navigate("/produtos")}>
              <IconArrow /> Voltar
            </button>
            <div className="pf-title-block">
              <h1>{isEdit ? "Editar Produto" : "Novo Produto"}</h1>
              <p>{isEdit ? "Atualize as informações do produto" : "Preencha os dados para cadastrar um novo produto"}</p>
            </div>
          </div>

          {isEdit && (
            <div className="pf-header-actions">
              <button className="btn btn-danger" onClick={() => setConfirm(true)}>
                <IconTrash /> Excluir Produto
              </button>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="pf-card">
          <div className="pf-card-header">
            <div className="pf-card-icon">📦</div>
            <div>
              <h2>{isEdit ? "Editar Produto" : "Cadastro de Produto"}</h2>
              <p>{isEdit ? `Editando produto #${id}` : "Preencha todos os campos obrigatórios"}</p>
            </div>
          </div>

          {loading ? (
            <div className="pf-loading">⏳ Carregando dados do produto...</div>
          ) : (
            <div className="pf-form">

              {/* Identificação */}
              <div className="pf-section-title">Identificação</div>
              <div className="pf-grid">
                <div className="pf-field pf-full">
                  <label>Nome do Produto *</label>
                  <input
                    value={form.nome}
                    onChange={e => set("nome", e.target.value)}
                    placeholder="Ex: Furadeira de Impacto 750W"
                  />
                </div>
                <div className="pf-field">
                  <label>Tipo</label>
                  <select value={form.tipo} onChange={e => set("tipo", Number(e.target.value) as Tipo)}>
                    <option value={1}>Ferramenta</option>
                    <option value={2}>Peça</option>
                    <option value={3}>Acessório</option>
                  </select>
                </div>
                <div className="pf-field">
                  <label>Garantia (meses)</label>
                  <input
                    type="number" min={0}
                    value={form.garantia || ""}
                    onChange={e => set("garantia", Number(e.target.value))}
                    placeholder="12"
                  />
                </div>
              </div>

              {/* Preços */}
              <div className="pf-section-title">Preços</div>
              <div className="pf-grid">
                <div className="pf-field price">
                  <label>Preço de Custo (R$) *</label>
                  <input
                    type="number" min={0} step={0.01}
                    value={form.preco_custo || ""}
                    onChange={e => set("preco_custo", Number(e.target.value))}
                    placeholder="0,00"
                  />
                </div>
                <div className="pf-field price">
                  <label>Preço de Venda (R$) *</label>
                  <input
                    type="number" min={0} step={0.01}
                    value={form.preco_venda || ""}
                    onChange={e => set("preco_venda", Number(e.target.value))}
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Estoque */}
              <div className="pf-section-title">Estoque</div>
              <div className="pf-grid cols-3">
                <div className="pf-field">
                  <label>Quantidade em Estoque</label>
                  <input
                    type="number" min={0}
                    value={form.quantidade_estoque || ""}
                    onChange={e => set("quantidade_estoque", Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="pf-field">
                  <label>Estoque Mínimo</label>
                  <input
                    type="number" min={0}
                    value={form.estoque_minimo || ""}
                    onChange={e => set("estoque_minimo", Number(e.target.value))}
                    placeholder="5"
                  />
                </div>
                <div className="pf-field">
                  <label>ID do Fornecedor *</label>
                  <input
                    type="number" min={1}
                    value={form.id_fornecedor || ""}
                    onChange={e => set("id_fornecedor", Number(e.target.value))}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pf-footer">
            <button className="btn btn-ghost" onClick={() => navigate("/produtos")}>
              Cancelar
            </button>
            <div className="pf-footer-right">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
                <IconCheck />
                {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Produto"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete */}
      <div className={`confirm-overlay${confirm ? " open" : ""}`} onClick={e => { if ((e.target as HTMLElement).classList.contains("confirm-overlay")) setConfirm(false); }}>
        <div className="confirm-box">
          <div className="confirm-icon">🗑️</div>
          <h3>Excluir este produto?</h3>
          <p>Esta ação é permanente e não pode ser desfeita. O produto será removido do sistema.</p>
          <div className="confirm-actions">
            <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Cancelar</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Sim, excluir"}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast${toast.visible ? " show" : ""}`}>
        <span className={`toast-dot ${toast.type}`} />
        <span>{toast.msg}</span>
      </div>
    </>
    </div>
  );
}