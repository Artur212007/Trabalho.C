import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar/";
import "./FuncionarioForm.css";

const API = "http://localhost:3001";

interface FormData {
  nome: string;
  cargo: number | null;
  salario: string;
  percentual_comissao: string;
  ativo: boolean;
}

const EMPTY: FormData = {
  nome: "",
  cargo: null,
  salario: "",
  percentual_comissao: "",
  ativo: true,
};

const CARGOS = [
  { id: 1, label: "ADMIN" },
  { id: 2, label: "GERENTE" },
  { id: 3, label: "VENDEDOR" },
  { id: 4, label: "TECNICO" },
  { id: 5, label: "CAIXA" },
  { id: 6, label: "CLIENTE" },
];

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
    fetch(`${API}/funcionarios/${id}`)
      .then(r => r.json())
      .then(f => {
        setForm({
          nome: f.nome ?? "",
          cargo: f.cargo ?? null,
          salario: f.salario ? String(f.salario) : "",
          percentual_comissao: f.percentual_comissao ? String(f.percentual_comissao) : "",
          ativo: f.ativo === 1 || f.ativo === true,
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

    setSaving(true);
    const body = {
      nome: form.nome,
      cargo: form.cargo,
      salario: parseFloat(formatCurrency(form.salario)),
      percentual_comissao: form.percentual_comissao ? parseFloat(formatCurrency(form.percentual_comissao)) : 0,
      ativo: form.ativo ? 1 : 0,
    };

    try {
      const url = isEdit ? `${API}/funcionarios/${id}` : `${API}/funcionarios`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      showToast(isEdit ? "Funcionário atualizado!" : "Funcionário cadastrado!");
      setTimeout(() => navigate("/funcionarios"), 1200);
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
      const res = await fetch(`${API}/funcionarios/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao remover funcionário.");
      showToast("Funcionário removido.", "del");
      setTimeout(() => navigate("/funcionarios"), 1200);
    } catch (err) {
      console.error(err);
      showToast((err as Error).message || "Erro ao remover funcionário.", "err");
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
            <button className="pf-back" onClick={() => navigate("/funcionarios")}><IconArrow /> <span>Voltar</span></button>
            <div className="pf-title-block"><h1>{isEdit ? "Editar Funcionário" : "Novo Funcionário"}</h1><p>{isEdit ? "Atualize as informações do funcionário" : "Preencha os dados para cadastrar um novo funcionário"}</p></div>
          </div>
          {isEdit && (<div className="pf-header-actions"><button className="btn btn-danger" onClick={() => setConfirm(true)}><IconTrash /> Excluir Funcionário</button></div>)}
        </div>

        <div className="pf-card">
          <div className="pf-card-header"><div className="pf-card-icon">👤</div><div><h2>{isEdit ? "Editar Funcionário" : "Cadastro de Funcionário"}</h2><p>{isEdit ? `Editando funcionário #${id}` : "Preencha os campos do novo funcionário"}</p></div></div>
          {loading ? (<div className="pf-loading">⏳ Carregando dados do funcionário...</div>) : (<div className="pf-form"><div className="pf-section-title">Dados Pessoais</div><div className="pf-grid"><div className="pf-field pf-full"><label>Nome *</label><input value={form.nome} onChange={e => setField("nome", e.target.value)} placeholder="Ex: Carlos Eduardo" /></div><div className="pf-field"><label>Cargo *</label><select value={form.cargo ?? ""} onChange={e => setField("cargo", e.target.value ? Number(e.target.value) : null)}><option value="">Selecione</option>{CARGOS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div><div className="pf-field"><label>Salário *</label><input type="text" value={form.salario} onChange={e => setField("salario", e.target.value)} placeholder="Ex: 4500.00" /></div><div className="pf-field"><label>% Comissão</label><input type="text" value={form.percentual_comissao} onChange={e => setField("percentual_comissao", e.target.value)} placeholder="Ex: 5.00" /></div><div className="pf-field"><label>Status</label><select value={form.ativo ? "1" : "0"} onChange={e => setField("ativo", e.target.value === "1")}><option value="1">Ativo</option><option value="0">Inativo</option></select></div></div></div>)}
          <div className="pf-footer"><button className="btn btn-ghost" onClick={() => navigate("/funcionarios")}>Cancelar</button><div className="pf-footer-right"><button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}><IconCheck />{saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Cadastrar Funcionário"}</button></div></div>
        </div>
      </div>

      <div className={`confirm-overlay${confirm ? " open" : ""}`} onClick={e => { if ((e.target as HTMLElement).classList.contains("confirm-overlay")) setConfirm(false); }}>
        <div className="confirm-box"><div className="confirm-icon">🗑️</div><h3>Remover este funcionário?</h3><p>O funcionário será desativado e não aparecerá mais na listagem.</p><div className="confirm-actions"><button className="btn btn-ghost" onClick={() => setConfirm(false)}>Cancelar</button><button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Removendo..." : "Sim, remover"}</button></div></div>
      </div>

      <div className={`toast${toast.visible ? " show" : ""}`}><span className={`toast-dot ${toast.type}`} /><span>{toast.msg}</span></div>
    </div>
  );
}