import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import "./Clientes.css";

const API = "http://localhost:3001";

interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  ativo: number;
}

const IconPlus   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash  = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconSearch = () => <svg width="14" height="14" fill="none" stroke="#71797E" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconDown   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err"; visible: boolean }>({ msg: "", type: "ok", visible: false });
  function show(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }
  return { toast, show };
}

function ConfirmDialog({ open, nomeCliente, onConfirm, onClose }: { open: boolean; nomeCliente: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className={`modal-overlay${open ? " open" : ""}`} onClick={e => { if ((e.target as HTMLElement).classList.contains("modal-overlay")) onClose(); }}>
      <div className="confirm-modal">
        <div className="danger-icon">🗑️</div>
        <h3>Remover cliente?</h3>
        <p>"{nomeCliente}" será desativado do sistema.</p>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Sim, remover</button>
        </div>
      </div>
    </div>
  );
}

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes]    = useState<Cliente[]>([]);
  const [loading, setLoading]      = useState(true);
  const [search, setSearch]        = useState("");
  const [confirmId, setConfirmId]  = useState<number | null>(null);
  const { toast, show: showToast } = useToast();

  async function fetchClientes() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/clientes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClientes(data.map((c: any) => ({
        id:       c.id_cliente ?? c.id,
        nome:     c.nome,
        cpf_cnpj: c.cpf_cnpj                              ?? "—",
        telefone: c.telefone                              ?? "—",
        email:    c.email                                 ?? "—",
        endereco: c.endereco ?? c["endereço"] ?? c.address ?? "—",
        ativo:    c.ativo,
      })));
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar clientes. Verifique o backend.", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchClientes(); }, []);

  const stats = useMemo(() => ({
    total:    clientes.length,
    comEmail: clientes.filter(c => c.email !== "—").length,
    comTel:   clientes.filter(c => c.telefone !== "—").length,
    comDoc:   clientes.filter(c => c.cpf_cnpj !== "—" && c.cpf_cnpj !== "").length,
  }), [clientes]);

  const lista = useMemo(() =>
    clientes.filter(c => {
      const q = search.toLowerCase();
      return (
        c.nome.toLowerCase().includes(q) ||
        c.cpf_cnpj.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.telefone.includes(q) ||
        String(c.id).includes(q)
      );
    }), [clientes, search]);

  async function deleteCliente() {
    try {
      const res = await fetch(`${API}/clientes/${confirmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setConfirmId(null);
      showToast("Cliente removido.", "err");
      fetchClientes();
    } catch (err) {
      console.error(err);
      showToast("Erro ao remover cliente.", "err");
    }
  }

  function exportCSV() {
    const headers = ["ID", "Nome", "CPF/CNPJ", "Telefone", "E-mail", "Endereço"];
    const rows    = clientes.map(c => [c.id, c.nome, c.cpf_cnpj, c.telefone, c.email, c.endereco]);
    const csv     = [headers, ...rows].map(r => r.join(";")).join("\n");
    const a       = document.createElement("a");
    a.href        = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download    = "clientes.csv";
    a.click();
    showToast("CSV exportado!");
  }

  const confirmCliente = clientes.find(c => c.id === confirmId);

  return (
    <div className="clientes-wrapper">
      <Sidebar />
      <div className="clientes-page">
        <header className="p-topbar">
          <div className="p-topbar-title">Clientes <span>Cadastro</span></div>
          <div className="p-topbar-actions">
            <button className="btn btn-ghost" onClick={exportCSV}><IconDown /> Exportar</button>
            <button className="btn btn-primary" onClick={() => navigate("/clientes/novo")}>
              <IconPlus /> Novo Cliente
            </button>
          </div>
        </header>

        <div className="p-content">
          <div className="stats-row">
            <div className="stat-card"><div className="stat-icon si-yellow">👥</div><div className="stat-info"><p>Total de Clientes</p><strong>{stats.total}</strong></div></div>
            <div className="stat-card"><div className="stat-icon si-blue">📄</div><div className="stat-info"><p>Com CPF/CNPJ</p><strong>{stats.comDoc}</strong></div></div>
            <div className="stat-card"><div className="stat-icon si-green">📧</div><div className="stat-info"><p>Com E-mail</p><strong>{stats.comEmail}</strong></div></div>
            <div className="stat-card"><div className="stat-icon si-purple">📞</div><div className="stat-info"><p>Com Telefone</p><strong>{stats.comTel}</strong></div></div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h3>Cadastro de Clientes</h3>
              <div className="table-header-right">
                <div className="search-bar">
                  <IconSearch />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="empty-state"><div className="big-icon">⏳</div><p>Carregando clientes...</p></div>
            ) : lista.length === 0 ? (
              <div className="empty-state">
                <div className="big-icon">👥</div>
                <p>Nenhum cliente encontrado.<br />Clique em <strong>Novo Cliente</strong> para cadastrar.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Nome</th><th>CPF / CNPJ</th>
                    <th>Telefone</th><th>E-mail</th><th>Endereço</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map(c => (
                    <tr key={c.id}>
                      <td className="td-id">#{c.id}</td>
                      <td className="td-nome">{c.nome}</td>
                      <td className="td-dim">{c.cpf_cnpj || "—"}</td>
                      <td className="td-dim">{c.telefone}</td>
                      <td className="td-dim">{c.email}</td>
                      <td className="td-dim">{c.endereco}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-btn edit" title="Editar" onClick={() => navigate(`/clientes/editar/${c.id}`)}>
                            <IconEdit />
                          </button>
                          <button className="icon-btn del" title="Remover" onClick={() => setConfirmId(c.id)}>
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        nomeCliente={confirmCliente?.nome ?? ""}
        onConfirm={deleteCliente}
        onClose={() => setConfirmId(null)}
      />

      <div className={`toast${toast.visible ? " show" : ""}`}>
        <span className={`toast-dot ${toast.type}`} />
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}