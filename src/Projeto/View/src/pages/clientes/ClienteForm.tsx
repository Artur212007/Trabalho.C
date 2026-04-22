import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar/";
import { IconClock, IconUsers } from "../../components/ui/icons";
import "./ClienteForm.css";

const API = "http://localhost:3001/api"; // ✅ Adicionado /api

interface FormData {
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  usuario: string;
  senha: string;
}

const EMPTY: FormData = {
  nome: "", cpf_cnpj: "", telefone: "", email: "", endereco: "", usuario: "", senha: "",
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

export default function ClienteForm() {
  const navigate  = useNavigate();
  const { id }    = useParams<{ id?: string }>();
  const isEdit    = Boolean(id);

  const [form, setForm]         = useState<FormData>(EMPTY);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm]   = useState(false);
  const [toast, setToast]       = useState<{ msg: string; type: "ok" | "err" | "del"; visible: boolean }>({ msg: "", type: "ok", visible: false });

  function showToast(msg: string, type: "ok" | "err" | "del" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    // ✅ Usando fetchWithAuth
    fetchWithAuth(`${API}/clientes/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Erro ao carregar cliente');
        return r.json();
      })
      .then(c => {
        setForm({
          nome:     c.nome ?? "",
          cpf_cnpj: c.cpf_cnpj ?? "",
          telefone: c.telefone ?? "",
          email:    c.email ?? "",
          endereco: c.endereco ?? "",
          usuario:  c.usuario ?? "",
          senha:    "", // ✅ Não carregar senha por segurança
        });
      })
      .catch(() => showToast("Erro ao carregar cliente.", "err"))
      .finally(() => setLoading(false));
  }, [id]);

  function set(key: keyof FormData, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function maskTel(v: string) {
    return v.replace(/\D/g, "").slice(0, 11)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  }

  function maskCPFCNPJ(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }

  function validarCPF(cpf: string): boolean {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
    let rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== Number(digits[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    return rest === Number(digits[10]);
  }

  function validarCNPJ(cnpj: string): boolean {
    const digits = cnpj.replace(/\D/g, "");
    if (digits.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(digits)) return false;
    const calc = (d: string, len: number) => {
      let sum = 0, pos = len - 7;
      for (let i = len; i >= 1; i--) {
        sum += Number(d[len - i]) * pos--;
        if (pos < 2) pos = 9;
      }
      return sum % 11 < 2 ? 0 : 11 - (sum % 11);
    };
    return calc(digits, 12) === Number(digits[12]) && calc(digits, 13) === Number(digits[13]);
  }

  function validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSave() {
    if (!form.nome.trim()) { showToast("Informe o nome do cliente.", "err"); return; }
    if (!isEdit && !form.usuario.trim()) { showToast("Informe o usuário de acesso.", "err"); return; }
    if (!isEdit && !form.senha.trim())   { showToast("Informe a senha de acesso.", "err"); return; }
    if (form.email && !validarEmail(form.email)) { showToast("E-mail inválido.", "err"); return; }
    if (form.cpf_cnpj) {
      const digits = form.cpf_cnpj.replace(/\D/g, "");
      if (digits.length > 0 && digits.length < 11)  { showToast("CPF incompleto.", "err");  return; }
      if (digits.length === 11 && !validarCPF(form.cpf_cnpj))  { showToast("CPF inválido.", "err");  return; }
      if (digits.length > 11 && digits.length < 14) { showToast("CNPJ incompleto.", "err"); return; }
      if (digits.length === 14 && !validarCNPJ(form.cpf_cnpj)) { showToast("CNPJ inválido.", "err"); return; }
    }
    
    setSaving(true);
    
    // ✅ Monta o body corretamente
    const body: any = {
      nome: form.nome,
    };
    
    // Só incluir campos que têm valor
    if (form.cpf_cnpj) body.cpf_cnpj = form.cpf_cnpj;
    if (form.telefone) body.telefone = form.telefone;
    if (form.email) body.email = form.email;
    if (form.endereco) body.endereco = form.endereco;
    if (form.usuario) body.usuario = form.usuario;
    if (form.senha) body.senha = form.senha;
    
    try {
      const url = isEdit ? `${API}/clientes/${id}` : `${API}/clientes`;
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
      
      showToast(isEdit ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!");
      setTimeout(() => navigate("/clientes"), 1200);
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
      const res = await fetchWithAuth(`${API}/clientes/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      showToast("Cliente excluído com sucesso!", "del");
      setTimeout(() => navigate("/clientes"), 1200);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        showToast(err.message || "Erro ao remover cliente.", "err");
      } else {
        showToast("Erro ao remover cliente.", "err");
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
            <button className="btn-back" onClick={() => navigate("/clientes")}>
              <IconArrow /> <span>Voltar</span>
            </button>
            <div className="pf-title-block">
              <h1>{isEdit ? "Editar Cliente" : "Novo Cliente"}</h1>
              <p>{isEdit ? "Atualize as informações do cliente" : "Preencha os dados para cadastrar um novo cliente"}</p>
            </div>
          </div>
          {isEdit && (
            <div className="pf-header-actions">
              <button className="btn btn-danger" onClick={() => setConfirm(true)}>
                <IconTrash /> Excluir Cliente
              </button>
            </div>
          )}
        </div>

        <div className="pf-card">
          <div className="pf-card-header">
            <div className="pf-card-icon"><IconUsers /></div>
            <div>
              <h2>{isEdit ? "Editar Cliente" : "Cadastro de Cliente"}</h2>
              <p>{isEdit ? `Editando cliente #${id}` : "Preencha os campos do novo cliente"}</p>
            </div>
          </div>

          {loading ? (
            <div className="pf-loading"><IconClock style={{ width: 16, height: 16, marginRight: 8 }} /> Carregando dados do cliente...</div>
          ) : (
            <div className="pf-form">
              <div className="pf-section-title">Identificação</div>
              <div className="pf-grid">
                <div className="pf-field pf-full">
                  <label>Nome Completo *</label>
                  <input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex: João da Silva" />
                </div>
                <div className="pf-field">
                  <label>CPF / CNPJ</label>
                  <input value={form.cpf_cnpj} onChange={e => set("cpf_cnpj", maskCPFCNPJ(e.target.value))} placeholder="000.000.000-00" />
                </div>
                <div className="pf-field">
                  <label>Telefone</label>
                  <input value={form.telefone} onChange={e => set("telefone", maskTel(e.target.value))} placeholder="(00) 90000-0000" />
                </div>
                <div className="pf-field pf-full">
                  <label>E-mail</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="exemplo@email.com" />
                </div>
              </div>

              <div className="pf-section-title">Endereço</div>
              <div className="pf-grid">
                <div className="pf-field pf-full">
                  <label>Endereço</label>
                  <input value={form.endereco} onChange={e => set("endereco", e.target.value)} placeholder="Ex: Rua das Flores, 123 - São Paulo/SP" />
                </div>
              </div>

              <div className="pf-section-title">Acesso à Vitrine</div>
              <div className="pf-grid">
                <div className="pf-field">
                  <label>Usuário {!isEdit && "*"}</label>
                  <input
                    value={form.usuario}
                    onChange={e => set("usuario", e.target.value)}
                    placeholder="Nome de usuário para login"
                    autoComplete="off"
                  />
                </div>
                <div className="pf-field">
                  <label>Senha {!isEdit && "*"}</label>
                  <input
                    type="password"
                    value={form.senha}
                    onChange={e => set("senha", e.target.value)}
                    placeholder={isEdit ? "Deixe em branco para não alterar" : "Senha de acesso"}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pf-footer">
            <button className="btn btn-ghost" onClick={() => navigate("/clientes")}>Cancelar</button>
            <div className="pf-footer-right">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
                <IconCheck />
                {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Cliente"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`confirm-overlay${confirm ? " open" : ""}`} onClick={handleCloseModal}>
        <div className="confirm-box" onClick={e => e.stopPropagation()}>
          <div className="confirm-icon"><IconTrash /></div>
          <h3>Remover este cliente?</h3>
          <p>O cliente será removido do sistema.</p>
          <div className="confirm-actions">
            <button className="btn btn-ghost" onClick={handleCloseModal}>Cancelar</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
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