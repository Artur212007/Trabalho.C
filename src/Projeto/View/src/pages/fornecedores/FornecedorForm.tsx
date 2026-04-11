import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar/";
import { IconArrowLeft } from "../../components/icons";
import "./FornecedorForm.css";

const API = "http://localhost:3001/api"; // ✅ Adicionado /api

interface FormData {
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
}

const EMPTY: FormData = { nome: "", telefone: "", email: "", endereco: "" };

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

export default function FornecedorForm() {
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
    fetchWithAuth(`${API}/fornecedores/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Erro ao carregar fornecedor');
        return r.json();
      })
      .then(f => {
        setForm({
          nome: f.nome ?? "",
          telefone: f.telefone ?? "",
          email: f.email ?? "",
          endereco: f.endereco ?? "",
        });
      })
      .catch(() => showToast("Erro ao carregar fornecedor.", "err"))
      .finally(() => setLoading(false));
  }, [id]);

  function setField(key: keyof FormData, val: string) { 
    setForm(f => ({ ...f, [key]: val })); 
  }

  function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  function validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSave() {
    if (!form.nome.trim()) { showToast("Informe o nome do fornecedor.", "err"); return; }
    if (form.email && !validarEmail(form.email)) { showToast("E-mail inválido.", "err"); return; }

    setSaving(true);
    
    // ✅ Remove máscara do telefone antes de enviar
    const telefoneNumeros = form.telefone ? form.telefone.replace(/\D/g, "") : "";
    
    const body = {
      nome: form.nome,
      telefone: telefoneNumeros || null,
      email: form.email || null,
      endereco: form.endereco || null,
    };
    
    console.log('📤 Enviando fornecedor:', body);
    
    try {
      const url = isEdit ? `${API}/fornecedores/${id}` : `${API}/fornecedores`;
      const method = isEdit ? "PUT" : "POST";
      
      // ✅ Usando fetchWithAuth
      const res = await fetchWithAuth(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body) 
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      showToast(isEdit ? "Fornecedor atualizado!" : "Fornecedor cadastrado!");
      setTimeout(() => navigate("/fornecedores"), 1200);
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
      const res = await fetchWithAuth(`${API}/fornecedores/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      showToast("Fornecedor removido com sucesso!", "del");
      setTimeout(() => navigate("/fornecedores"), 1200);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        showToast(err.message || "Erro ao remover fornecedor.", "err");
      } else {
        showToast("Erro ao remover fornecedor.", "err");
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
            <button className="btn btn-ghost" onClick={() => navigate("/fornecedores")}>
              <IconArrowLeft /> Voltar
            </button>
            <div className="pf-title-block">
              <h1>{isEdit ? "Editar Fornecedor" : "Novo Fornecedor"}</h1>
              <p>{isEdit ? "Atualize as informações do fornecedor" : "Preencha os dados para cadastrar um novo fornecedor"}</p>
            </div>
          </div>
          {isEdit && (
            <div className="pf-header-actions">
              <button className="btn btn-danger" onClick={() => setConfirm(true)}>
                <IconTrash /> Excluir Fornecedor
              </button>
            </div>
          )}
        </div>

        <div className="pf-card">
          <div className="pf-card-header">
            <div className="pf-card-icon">🏭</div>
            <div>
              <h2>{isEdit ? "Editar Fornecedor" : "Cadastro de Fornecedor"}</h2>
              <p>{isEdit ? `Editando fornecedor #${id}` : "Preencha os campos do novo fornecedor"}</p>
            </div>
          </div>
          
          {loading ? (
            <div className="pf-loading">⏳ Carregando dados do fornecedor...</div>
          ) : (
            <div className="pf-form">
              <div className="pf-section-title">Informações Gerais</div>
              <div className="pf-grid">
                <div className="pf-field pf-full">
                  <label>Nome da Empresa *</label>
                  <input maxLength={100} value={form.nome} onChange={e => setField("nome", e.target.value)} placeholder="Ex: Ferramentas Alfa Ltda" />
                </div>
                <div className="pf-field">
                  <label>Telefone</label>
                  <input maxLength={15} value={form.telefone} onChange={e => setField("telefone", formatPhone(e.target.value))} placeholder="(00) 90000-0000" />
                </div>
                <div className="pf-field">
                  <label>E-mail</label>
                  <input type="email" maxLength={100} value={form.email} onChange={e => setField("email", e.target.value)} placeholder="exemplo@email.com" />
                </div>
                <div className="pf-field pf-full">
                  <label>Endereço</label>
                  <input maxLength={150} value={form.endereco} onChange={e => setField("endereco", e.target.value)} placeholder="Ex: Rua das Indústrias, 100 - Fortaleza/CE" />
                </div>
              </div>
            </div>
          )}
          
          <div className="pf-footer">
            <button className="btn btn-ghost" onClick={() => navigate("/fornecedores")}>Cancelar</button>
            <div className="pf-footer-right">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
                <IconCheck />
                {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Fornecedor"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL CORRIGIDO - usando as classes corretas */}
      <div 
        className={`modal-overlay${confirm ? " open" : ""}`} 
        onClick={handleCloseModal}
      >
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="danger-icon">🗑️</div>
          <h3>Remover este fornecedor?</h3>
          <p>O fornecedor será removido permanentemente do sistema.</p>
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