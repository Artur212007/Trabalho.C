import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar/";
import "./ProdutoForm.css";

const API = "http://localhost:3001/api";

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

// ============================================
// ÍCONES SVG
// ============================================
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
// ============================================

// Função auxiliar para pegar token
const getToken = () => localStorage.getItem('token');

// Função para fazer fetch com token
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export default function ProdutoForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "del"; visible: boolean }>({ msg: "", type: "ok", visible: false });
  const [precoCustoDisplay, setPrecoCustoDisplay] = useState("");
  const [precoVendaDisplay, setPrecoVendaDisplay] = useState("");

  function showToast(msg: string, type: "ok" | "err" | "del" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }

  function formatPreco(value: string): { display: string; numeric: number } {
    const digits = value.replace(/\D/g, "");
    const numeric = Number(digits) / 100;
    const display = numeric.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return { display, numeric };
  }

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    
    fetchWithAuth(`${API}/produtos/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Erro ao carregar produto');
        return r.json();
      })
      .then(p => {
        const custo = p.preco_custo;
        const venda = p.preco_venda;
        
        setForm({
          nome: p.nome,
          tipo: p.tipo,
          preco_custo: custo,
          preco_venda: venda,
          quantidade_estoque: p.quantidade_estoque,
          estoque_minimo: p.estoque_minimo,
          garantia: p.garantia,
          id_fornecedor: p.id_fornecedor,
        });
        setPrecoCustoDisplay(custo.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setPrecoVendaDisplay(venda.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      })
      .catch(() => showToast("Erro ao carregar produto.", "err"))
      .finally(() => setLoading(false));
  }, [id]);

  function set(key: keyof FormData, val: string | number) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSave() {
  if (!form.nome.trim()) { showToast("Informe o nome do produto.", "err"); return; }
  if (!form.preco_venda || form.preco_venda <= 0) { showToast("Informe o preço de venda do produto.", "err"); return; }
  
  setSaving(true);
  
  const body = {
    nome: form.nome,
    tipo: form.tipo,
    preco_custo: form.preco_custo,
    preco_venda: form.preco_venda,
    quantidade_estoque: form.quantidade_estoque,
    estoque_minimo: form.estoque_minimo,
    garantia: form.garantia,
    id_fornecedor: form.id_fornecedor,
  };
  
  // 🔍 ADICIONE ESTES LOGS
  console.log('📤 Enviando dados:', body);
  console.log('🔑 Token:', getToken());
  
  try {
    const url = isEdit ? `${API}/produtos/${id}` : `${API}/produtos`;
    const method = isEdit ? "PUT" : "POST";
    
    console.log(`📍 ${method} para:`, url);
    
    const res = await fetchWithAuth(url, { method, body: JSON.stringify(body) });
    
    // 🔍 LOG DA RESPOSTA
    console.log('📥 Status:', res.status);
    const errorText = await res.text();
    console.log('📥 Resposta:', errorText);
    
    if (!res.ok) {
      throw new Error(errorText || 'Erro ao salvar');
    }
    
    showToast(isEdit ? "Produto atualizado!" : "Produto cadastrado!");
    setTimeout(() => navigate("/produtos"), 1200);
  } catch (err) {
    console.error('❌ Erro completo:', err);
    showToast("Erro ao salvar. Verifique os dados.", "err");
  } finally {
    setSaving(false);
  }
}

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`${API}/produtos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      showToast("Produto excluído.", "del");
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

      <div className="pf-page">
        <div className="pf-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="pf-back" onClick={() => navigate("/produtos")}>
              <IconArrow /> <span>Voltar</span>
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
              <div className="pf-section-title">Identificação</div>
              <div className="pf-grid">
                <div className="pf-field pf-full">
                  <label>Nome do Produto *</label>
                  <input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex: Furadeira de Impacto 750W" />
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
                  <input type="number" min={0} value={form.garantia || ""} onChange={e => set("garantia", Number(e.target.value))} placeholder="12" />
                </div>
              </div>

              <div className="pf-section-title">Preços</div>
              <div className="pf-grid">
                <div className="pf-field price">
                  <label>Preço de Custo (R$) *</label>
                  <input
                    type="text"
                    value={precoCustoDisplay}
                    onChange={e => { const { display, numeric } = formatPreco(e.target.value); setPrecoCustoDisplay(display); set("preco_custo", numeric); }}
                    placeholder="0,00"
                  />
                </div>
                <div className="pf-field price">
                  <label>Preço de Venda (R$) *</label>
                  <input
                    type="text"
                    value={precoVendaDisplay}
                    onChange={e => { const { display, numeric } = formatPreco(e.target.value); setPrecoVendaDisplay(display); set("preco_venda", numeric); }}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="pf-section-title">Estoque</div>
              <div className="pf-grid cols-3">
                <div className="pf-field">
                  <label>Quantidade em Estoque</label>
                  <input type="number" min={0} value={form.quantidade_estoque || ""} onChange={e => set("quantidade_estoque", Number(e.target.value))} placeholder="0" />
                </div>
                <div className="pf-field">
                  <label>Estoque Mínimo</label>
                  <input type="number" min={0} value={form.estoque_minimo || ""} onChange={e => set("estoque_minimo", Number(e.target.value))} placeholder="5" />
                </div>
                <div className="pf-field">
                  <label>ID do Fornecedor *</label>
                  <input type="number" min={1} value={form.id_fornecedor || ""} onChange={e => set("id_fornecedor", Number(e.target.value))} placeholder="1" />
                </div>
              </div>
            </div>
          )}

          <div className="pf-footer">
            <button className="btn btn-ghost" onClick={() => navigate("/produtos")}>Cancelar</button>
            <div className="pf-footer-right">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
                <IconCheck />
                {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Produto"}
              </button>
            </div>
          </div>
        </div>
      </div>

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

      <div className={`toast${toast.visible ? " show" : ""}`}>
        <span className={`toast-dot ${toast.type}`} />
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}