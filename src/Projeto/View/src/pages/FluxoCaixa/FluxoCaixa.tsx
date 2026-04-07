import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import "./FluxoCaixa.css";

const API = "http://localhost:3001/api";

interface Caixa {
  id_caixa: number;
  data: string;
  valor_abertura: number;
  valor_fechamento: number | null;
  saldo: number;
  id_funcionario: number;
  funcionario_nome?: string;
}

const IconPlus = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconSearch = () => <svg width="14" height="14" fill="none" stroke="#71797E" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconDown = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

export default function FluxoCaixa() {
  const navigate = useNavigate();
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast, show: showToast } = useToast();

  async function fetchCaixas() {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API}/caixa`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCaixas(data.map((c: any) => ({
        id_caixa: c.id_caixa,
        data: c.data,
        valor_abertura: parseFloat(c.valor_abertura) || 0,
        valor_fechamento: c.valor_fechamento ? parseFloat(c.valor_fechamento) : null,
        saldo: parseFloat(c.saldo) || 0,
        id_funcionario: c.id_funcionario,
        funcionario_nome: c.funcionario_nome || `ID: ${c.id_funcionario}`,
      })));
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        showToast(`Erro ao carregar caixa: ${err.message}`, "err");
      } else {
        showToast("Erro ao carregar caixa. Verifique o backend.", "err");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCaixas(); }, []);

  const stats = useMemo(() => {
    const caixasAbertos = caixas.filter(c => c.valor_fechamento === null).length;
    const caixasFechados = caixas.filter(c => c.valor_fechamento !== null).length;
    const saldoTotal = caixas.reduce((sum, c) => sum + c.saldo, 0);
    const aberturaTotal = caixas.reduce((sum, c) => sum + c.valor_abertura, 0);
    
    return {
      total: caixas.length,
      abertos: caixasAbertos,
      fechados: caixasFechados,
      saldoTotal,
      aberturaTotal,
    };
  }, [caixas]);

  const lista = useMemo(() =>
    caixas.filter(c => {
      const q = search.toLowerCase();
      return (
        formatDate(c.data).toLowerCase().includes(q) ||
        String(c.id_caixa).includes(q) ||
        (c.funcionario_nome?.toLowerCase().includes(q) || false)
      );
    }), [caixas, search]);

  async function handleDelete() {
    if (!confirmId) return;
    
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`${API}/caixa/${confirmId}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      setConfirmId(null);
      showToast("Registro de caixa removido com sucesso!", "del");
      await fetchCaixas();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        showToast(err.message || "Erro ao remover registro.", "err");
      } else {
        showToast("Erro ao remover registro.", "err");
      }
    } finally {
      setDeleting(false);
    }
  }

  function exportCSV() {
    const headers = ["ID", "Data", "Valor Abertura", "Valor Fechamento", "Saldo", "ID Funcionário", "Funcionário"];
    const rows = caixas.map(c => [
      c.id_caixa, 
      formatDate(c.data), 
      formatCurrency(c.valor_abertura),
      c.valor_fechamento ? formatCurrency(c.valor_fechamento) : "Em aberto",
      formatCurrency(c.saldo),
      c.id_funcionario,
      c.funcionario_nome || `ID: ${c.id_funcionario}`
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = "fluxo_caixa.csv";
    a.click();
    showToast("CSV exportado!", "ok");
  }

  const handleCloseModal = () => {
    setConfirmId(null);
    setDeleting(false);
  };

  const confirmCaixa = caixas.find(c => c.id_caixa === confirmId);

  return (
    <div className="fornecedores-wrapper">
      <Sidebar />
      <div className="fornecedores-page">
        <header className="p-topbar">
          <div className="p-topbar-title">
            Fluxo de Caixa <span>Registros</span>
          </div>
          <div className="p-topbar-actions">
            <button className="btn btn-ghost" onClick={exportCSV}>
              <IconDown /> Exportar
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/caixa/novo")}>
              <IconPlus /> Novo Registro
            </button>
          </div>
        </header>

        <div className="p-content">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon si-yellow">💰</div>
              <div className="stat-info">
                <p>Total de Registros</p>
                <strong>{stats.total}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon si-green">🟢</div>
              <div className="stat-info">
                <p>Caixas Abertos</p>
                <strong>{stats.abertos}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon si-red">🔴</div>
              <div className="stat-info">
                <p>Caixas Fechados</p>
                <strong>{stats.fechados}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon si-blue">📊</div>
              <div className="stat-info">
                <p>Saldo Total</p>
                <strong>{formatCurrency(stats.saldoTotal)}</strong>
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h3>Registros de Fluxo de Caixa</h3>
              <div className="table-header-right">
                <div className="search-bar">
                  <IconSearch />
                  <input 
                    type="text" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Buscar por data, funcionário ou ID..." 
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="big-icon">⏳</div>
                <p>Carregando registros...</p>
              </div>
            ) : lista.length === 0 ? (
              <div className="empty-state">
                <div className="big-icon">💰</div>
                <p>
                  Nenhum registro de caixa encontrado.<br />
                  Clique em <strong>Novo Registro</strong> para iniciar um novo caixa.
                </p>
              </div>
            ) : (
              <table className="fornecedores-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Valor Abertura</th>
                    <th>Valor Fechamento</th>
                    <th>Saldo</th>
                    <th>Funcionário</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map(c => (
                    <tr key={c.id_caixa}>
                      <td className="td-id">#{c.id_caixa}</td>
                      <td className="td-nome">{formatDate(c.data)}</td>
                      <td className="td-dim">{formatCurrency(c.valor_abertura)}</td>
                      <td className="td-dim">
                        {c.valor_fechamento ? formatCurrency(c.valor_fechamento) : "—"}
                      </td>
                      <td className={`td-saldo ${c.saldo >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(c.saldo)}
                      </td>
                      <td className="td-dim">{c.funcionario_nome || `ID: ${c.id_funcionario}`}</td>
                      <td>
                        <span className={`status-badge ${c.valor_fechamento === null ? 'status-open' : 'status-closed'}`}>
                          {c.valor_fechamento === null ? 'Aberto' : 'Fechado'}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button 
                            className="icon-btn edit" 
                            title="Editar" 
                            onClick={() => navigate(`/caixa/editar/${c.id_caixa}`)}
                          >
                            <IconEdit />
                          </button>
                          <button 
                            className="icon-btn del" 
                            title="Remover" 
                            onClick={() => setConfirmId(c.id_caixa)}
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

      {/* MODAL DE CONFIRMAÇÃO */}
      <div 
        className={`modal-overlay${confirmId !== null ? " open" : ""}`} 
        onClick={handleCloseModal}
      >
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="danger-icon">🗑️</div>
          <h3>Remover registro de caixa?</h3>
          <p>
            Registro do dia <strong>{confirmCaixa ? formatDate(confirmCaixa.data) : ''}</strong> 
            {" "}será removido permanentemente do sistema.
          </p>
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