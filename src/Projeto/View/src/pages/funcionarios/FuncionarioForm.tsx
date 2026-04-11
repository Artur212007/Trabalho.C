import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar/";
import { IconArrowLeft } from "../../components/icons";
import "./FuncionarioForm.css";

const API = "http://localhost:3001/api"; // ✅ Adicionado /api

interface FormData {
  nome: string;
  cargo: number | null;
  salario: string;
  percentual_comissao: string;
  ativo: boolean;
  usuario: string;
  senha: string;
}

const EMPTY: FormData = {
  nome: "",
  cargo: null,
  salario: "",
  percentual_comissao: "",
  ativo: true,
  usuario: "",
  senha: "",
};

const CARGOS = [
  { id: 2, label: "GERENTE" },
  { id: 3, label: "VENDEDOR" },
  { id: 4, label: "TECNICO" },
  { id: 5, label: "CAIXA" },
];

const IconCheck = () => <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✅</span>;
const IconTrash = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

// ✅ Função auxiliar para fetch com token
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export default function FuncionarioForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "del"; visible: boolean }>({ msg: "", type: "ok", visible: false });

  function showToast(msg: string, type: "ok" | "err" | "del" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    // ✅ Usando fetchWithAuth
    fetchWithAuth(`${API}/funcionarios/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Erro ao carregar funcionário');
        return r.json();
      })
      .then(f => {
        setForm({
          nome: f.nome ?? "",
          cargo: f.cargo ?? null,
          salario: f.salario ? String(f.salario) : "",
          percentual_comissao: f.percentual_comissao ? String(f.percentual_comissao) : "",
          ativo: f.ativo === 1 || f.ativo === true,
          usuario: "", // Não carregar por segurança
          senha: "",   // Não carregar por segurança
        });
      })
      .catch(() => showToast("Erro ao carregar funcionário.", "err"))
      .finally(() => setLoading(false));
  }, [id]);

  function setField(key: keyof FormData, val: string | boolean | number | null) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function formatCurrency(v: string) {
    return v.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  }

  async function handleSave() {
    if (!form.nome.trim()) { showToast("Informe o nome do funcionário.", "err"); return; }
    if (!form.cargo) { showToast("Informe o cargo do funcionário.", "err"); return; }
    if (!form.salario || Number(formatCurrency(form.salario)) <= 0) { showToast("Salário inválido.", "err"); return; }
    
    // Validação para novo funcionário
    if (!isEdit && !form.usuario.trim()) { showToast("Informe o usuário de acesso.", "err"); return; }
    if (!isEdit && !form.senha.trim()) { showToast("Informe a senha de acesso.", "err"); return; }

    setSaving(true);
    
    const salarioNumerico = parseFloat(formatCurrency(form.salario));
    const comissaoNumerica = form.percentual_comissao ? parseFloat(formatCurrency(form.percentual_comissao)) : 0;
    
    const body: any = {
      nome: form.nome,
      cargo: form.cargo,
      salario: salarioNumerico,
      percentual_comissao: comissaoNumerica,
      ativo: form.ativo ? 1 : 0,
    };
    
    // Só incluir usuário/senha se for novo ou se foram preenchidos
    if (!isEdit || (form.usuario && form.senha)) {
      if (form.usuario) body.usuario = form.usuario;
      if (form.senha) body.senha = form.senha;
    }

    console.log('📤 Enviando funcionário:', body);

    try {
      const url = isEdit ? `${API}/funcionarios/${id}` : `${API}/funcionarios`;
      const method = isEdit ? "PUT" : "POST";
      
      // ✅ Usando fetchWithAuth
      const res = await fetchWithAuth(url, { 
        method, 
        body: JSON.stringify(body) 
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      showToast(isEdit ? "Funcionário atualizado!" : "Funcionário cadastrado!");
      setTimeout(() => navigate("/funcionarios"), 1200);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        showToast(err.message || "Erro ao salvar. Verifique os dados.", "err");
      } else {
        showToast("Erro ao salvar. Verifique os dados.", "err");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      // ✅ Usando fetchWithAuth
      const res = await fetchWithAuth(`${API}/funcionarios/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      showToast("Funcionário removido com sucesso!", "del");
      setTimeout(() => navigate("/funcionarios"), 1200);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        showToast(err.message || "Erro ao remover funcionário.", "err");
      } else {
        showToast("Erro ao remover funcionário.", "err");
      }
    } finally {
      setDeleting(false);
      setConfirm(false);
    }
  }

  // ✅ Função para fechar o modal
  const handleCloseModal = () => {
    setConfirm(false);
    setDeleting(false);
  };

  return (
    <div className="pf-wrapper">
      <Sidebar />
      <div className="pf-page">
        <div className="pf-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="btn btn-ghost" onClick={() => navigate("/funcionarios")}>
              <IconArrowLeft /> Voltar
            </button>
            <div className="pf-title-block">
              <h1>{isEdit ? "Editar Funcionário" : "Novo Funcionário"}</h1>
              <p>{isEdit ? "Atualize as informações do funcionário" : "Preencha os dados para cadastrar um novo funcionário"}</p>
            </div>
          </div>
          {isEdit && (
            <div className="pf-header-actions">
              <button className="btn btn-danger" onClick={() => setConfirm(true)}>
                <IconTrash /> Excluir Funcionário
              </button>
            </div>
          )}
        </div>

        <div className="pf-card">
          <div className="pf-card-header">
            <div className="pf-card-icon">👤</div>
            <div>
              <h2>{isEdit ? "Editar Funcionário" : "Cadastro de Funcionário"}</h2>
              <p>{isEdit ? `Editando funcionário #${id}` : "Preencha os campos do novo funcionário"}</p>
            </div>
          </div>
          
          {loading ? (
            <div className="pf-loading">⏳ Carregando dados do funcionário...</div>
          ) : (
            <div className="pf-form">
              <div className="pf-section-title">Dados Pessoais</div>
              <div className="pf-grid">
                <div className="pf-field pf-full">
                  <label>Nome *</label>
                  <input maxLength={100} value={form.nome} onChange={e => setField("nome", e.target.value)} placeholder="Ex: Carlos Eduardo" />
                </div>
                <div className="pf-field">
                  <label>Cargo *</label>
                  <select value={form.cargo ?? ""} onChange={e => setField("cargo", e.target.value ? Number(e.target.value) : null)}>
                    <option value="">Selecione</option>
                    {CARGOS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="pf-field">
                  <label>Salário *</label>
                  <input 
                    type="text"
                    maxLength={12}
                    value={form.salario} 
                    onChange={e => setField("salario", e.target.value)} 
                    placeholder="Ex: 4500.00" 
                  />
                </div>
                <div className="pf-field">
                  <label>% Comissão</label>
                  <input 
                    type="text"
                    maxLength={7}
                    value={form.percentual_comissao} 
                    onChange={e => setField("percentual_comissao", e.target.value)} 
                    placeholder="Ex: 5.00" 
                  />
                </div>
                <div className="pf-field">
                  <label>Status</label>
                  <select value={form.ativo ? "1" : "0"} onChange={e => setField("ativo", e.target.value === "1")}>
                    <option value="1">Ativo</option>
                    <option value="0">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="pf-section-title">Acesso ao Sistema</div>
              <div className="pf-grid">
                <div className="pf-field">
                  <label>Usuário {!isEdit && "*"}</label>
                  <input 
                    type="text"
                    maxLength={50}
                    value={form.usuario} 
                    onChange={e => setField("usuario", e.target.value)} 
                    placeholder="Nome de usuário para login"
                    autoComplete="off"
                  />
                </div>
                <div className="pf-field">
                  <label>Senha {!isEdit && "*"}</label>
                  <input 
                    type="password"
                    maxLength={50}
                    value={form.senha} 
                    onChange={e => setField("senha", e.target.value)} 
                    placeholder={isEdit ? "Deixe em branco para não alterar" : "Senha de acesso"}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="pf-footer">
            <button className="btn btn-ghost" onClick={() => navigate("/funcionarios")}>Cancelar</button>
            <div className="pf-footer-right">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
                <IconCheck />
                {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Funcionário"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL CORRIGIDO */}
      <div 
        className={`modal-overlay${confirm ? " open" : ""}`} 
        onClick={handleCloseModal}
      >
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="danger-icon">🗑️</div>
          <h3>Remover este funcionário?</h3>
          <p>O funcionário será removido do sistema.</p>
          <div className="confirm-actions">
            <button className="btn btn-ghost" onClick={handleCloseModal}>
              Cancelar
            </button>
            <button 
              className="btn btn-danger" 
              onClick={handleDelete} 
              disabled={deleting}
            >
              {deleting ? "Removendo..." : "Sim, remover"}
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