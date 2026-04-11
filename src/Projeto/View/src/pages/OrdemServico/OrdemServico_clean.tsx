import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import "./OrdemServico.css";

const API = "http://localhost:3001/api";

interface OrdemServico {
  id: number;
  cliente: string;
  tecnico: string;
  descricao: string;
  estado: string;
  status: number;
  data: string;
}

const IconPlus   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash  = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconSearch = () => <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🔍</span>;
const IconDown   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

// FunÃ§Ã£o auxiliar para fetch com token
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

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "del"; visible: boolean }>({ msg: "", type: "ok", visible: false });
  function show(msg: string, type: "ok" | "err" | "del" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }
  return { toast, show };
}

export default function OrdemServico() {
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, show: showToast } = useToast();

  async function fetchOrdens() {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API}/OrdemServico`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOrdens(data.map((o: any) => ({
        id: o.id_ordem_servico,
        cliente: o.nome_cliente || "Sem cliente",
        tecnico: o.nome_tecnico || "Sem tÃ©cnico",
        descricao: o.descricao_problema || "",
        estado: o.estado_equipamento || "",
        status: o.status ?? 0,
        data: o.data_abertura || ""
      })));
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        showToast(`Erro ao carregar ordens: ${err.message}`, "err");
      } else {
        showToast("Erro ao carregar ordens. Verifique o backend.", "err");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOrdens(); }, []);

  const stats = useMemo(() => ({
    total: ordens.length,
    concluidas: ordens.filter(o => o.status === 1).length,
    abertas: ordens.filter(o => o.status === 0).length,
  }), [ordens]);

  const lista = useMemo(() =>
    ordens.filter(o => {
      const q = search.toLowerCase();
      return (
        o.cliente.toLowerCase().includes(q) ||
        o.tecnico.toLowerCase().includes(q) ||
        o.descricao.toLowerCase().includes(q) ||
        o.estado.toLowerCase().includes(q) ||
        String(o.id).includes(q)
      );
    }), [ordens, search]);

  async function handleDelete() {
    if (!confirmId) return;

    setDeleting(true);
    try {
      const res = await fetchWithAuth(`${API}/OrdemServico/${confirmId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      showToast("Ordem de serviÃ§o removida com sucesso!", "del");
      await fetchOrdens();
      setConfirmId(null);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        showToast(err.message || "Erro ao remover ordem de serviÃ§o.", "err");
      } else {
        showToast("Erro ao remover ordem de serviÃ§o.", "err");
      }
    } finally {
      setDeleting(false);
    }
  }

  function exportCSV() {
    const headers = ["ID", "Cliente", "TÃ©cnico", "Problema", "Estado", "Status", "Data"];
    const rows = ordens.map(o => [
      o.id,
      o.cliente,
      o.tecnico,
      o.descricao,
      o.estado,
      o.status === 1 ? "ConcluÃ­da" : "Aberta",
      o.data ? new Date(o.data).toLocaleDateString("pt-BR") : "-"
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = "ordens_servico.csv";
    a.click();
    showToast("CSV exportado!", "ok");
  }

  const handleCloseModal = () => {
    setConfirmId(null);
    setDeleting(false);
  };

  const confirmOrdem = ordens.find(o => o.id === confirmId);

  return (
    <div className="ordem-servico-wrapper">
      <Sidebar />
      <div className="ordem-servico-page">
        <header className="p-topbar">
          <div className="p-topbar-title">Ordens de ServiÃ§o <span>GestÃ£o</span></div>
          <div className="p-topbar-actions">
            <button className="btn btn-ghost" onClick={exportCSV}><IconDown /> Exportar</button>
            <button className="btn btn-primary" onClick={() => navigate("/ordem-servico/novo")}>
              <IconPlus /> Nova OS
            </button>
          </div>
        </header>

        <div className="p-content">
          <div className="stats-row">
            <div className="stat-card"><div className="stat-icon si-yellow">ðŸ”§</div><div className="stat-info"><p>Total de OS</p><strong>{stats.total}</strong></div></div>
            <div className="stat-card"><div className="stat-icon si-green">âœ…</div><div className="stat-info"><p>ConcluÃ­das</p><strong>{stats.concluidas}</strong></div></div>
            <div className="stat-card"><div className="stat-icon si-red">â³</div><div className="stat-info"><p>Abertas</p><strong>{stats.abertas}</strong></div></div>
            <div className="stat-card"><div className="stat-icon si-blue">ðŸ“Š</div><div className="stat-info"><p>Taxa de ConclusÃ£o</p><strong>{stats.total > 0 ? Math.round((stats.concluidas / stats.total) * 100) : 0}%</strong></div></div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h3>Cadastro de Ordens de ServiÃ§o</h3>
              <div className="table-header-right">
                <div className="search-bar">
                  <IconSearch />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ordem de serviÃ§o..." />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="empty-state"><div className="big-icon">â³</div><p>Carregando ordens de serviÃ§o...</p></div>
            ) : lista.length === 0 ? (
              <div className="empty-state">
                <div className="big-icon">ðŸ”§</div>
                <p>Nenhuma ordem de serviÃ§o encontrada.<br />Clique em <strong>Nova OS</strong> para cadastrar.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Cliente</th><th>TÃ©cnico</th><th>Problema</th><th>Estado</th><th>Status</th><th>AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map(o => (
                    <tr key={o.id}>
                      <td className="td-id">#{o.id}</td>
                      <td className="td-nome">{o.cliente}</td>
                      <td>{o.tecnico}</td>
                      <td className="td-dim">{o.descricao || "â€”"}</td>
                      <td>{o.estado || "â€”"}</td>
                      <td><span className={`badge ${o.status === 1 ? 'badge-ok' : 'badge-warn'}`}>{o.status === 1 ? "ConcluÃ­da" : "Aberta"}</span></td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-btn edit"
                            title="Editar"
                            onClick={() => navigate(`/ordem-servico/editar/${o.id}`)}
                          >
                            <IconEdit />
                          </button>
                          <button
                            className="icon-btn del"
                            title="Excluir"
                            onClick={() => setConfirmId(o.id)}
                          >
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

      <div
        className={`modal-overlay${confirmId !== null ? " open" : ""}`}
        onClick={handleCloseModal}
      >
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="danger-icon">ðŸ—‘ï¸</div>
          <h3>Remover esta ordem de serviÃ§o?</h3>
          <p>"{confirmOrdem?.cliente || 'Ordem de serviÃ§o'}" serÃ¡ removida permanentemente.</p>
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

      setLista(data.map((o: any) => ({
        id: o.id_ordem_servico,
        cliente: o.nome_cliente || "Sem cliente",
        tecnico: o.nome_tecnico || "Sem tÃ©cnico",
        descricao: o.descricao_problema || "",
        status: o.status ?? 0,
        data: o.data_abertura || ""
      })));

    } catch (err) {
