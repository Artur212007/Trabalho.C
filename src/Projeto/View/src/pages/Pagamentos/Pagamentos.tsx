import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import "./Pagamentos.css";

const API = "http://localhost:3001/api";

interface Pagamento {
  id_pagamento: number;
  id_venda: number | null;
  id_ordem_servico: number | null;
  id_cliente: number;
  cliente_nome: string;
  valor: number;
  forma_pagamento: string;
  parcelas: number;
  status: string;
  data_pagamento: string | null;
  data_vencimento: string;
  descricao: string;
}

interface Parcela {
  id_parcela: number;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
}

const IconPlus = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconEdit = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const IconSearch = () => (
  <svg width="14" height="14" fill="none" stroke="#71797E" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconDown = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconEye = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

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
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "del"; visible: boolean }>({ 
    msg: "", type: "ok", visible: false 
  });
  
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
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function getStatusBadge(status: string): string {
  const statusMap: Record<string, string> = {
    'pago': 'status-paid',
    'pendente': 'status-pending',
    'cancelado': 'status-cancelled',
    'atrasado': 'status-overdue'
  };
  return statusMap[status] || 'status-pending';
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pago': 'Pago',
    'pendente': 'Pendente',
    'cancelado': 'Cancelado',
    'atrasado': 'Atrasado'
  };
  return statusMap[status] || status;
}

function getFormaPagamentoText(forma: string): string {
  const formaMap: Record<string, string> = {
    'dinheiro': 'Dinheiro',
    'cartao_credito': 'Cartão Crédito',
    'cartao_debito': 'Cartão Débito',
    'pix': 'PIX',
    'boleto': 'Boleto',
    'transferencia': 'Transferência'
  };
  return formaMap[forma] || forma;
}

export default function Pagamentos() {
  const navigate = useNavigate();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [parcelas, setParcelas] = useState<Record<number, Parcela[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewParcelasId, setViewParcelasId] = useState<number | null>(null);
  const { toast, show: showToast } = useToast();

  async function fetchPagamentos() {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API}/pagamentos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPagamentos(data);
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar pagamentos", "err");
    } finally {
      setLoading(false);
    }
  }

  async function fetchParcelas(id_pagamento: number) {
    if (parcelas[id_pagamento]) return;
    
    try {
      const res = await fetchWithAuth(`${API}/pagamentos/${id_pagamento}/parcelas`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setParcelas(prev => ({ ...prev, [id_pagamento]: data }));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const stats = useMemo(() => {
    const totalPendente = pagamentos
      .filter(p => p.status === 'pendente')
      .reduce((sum, p) => sum + p.valor, 0);
    
    const totalPago = pagamentos
      .filter(p => p.status === 'pago')
      .reduce((sum, p) => sum + p.valor, 0);
    
    const totalAtrasado = pagamentos
      .filter(p => p.status === 'atrasado')
      .reduce((sum, p) => sum + p.valor, 0);
    
    return {
      total: pagamentos.length,
      totalValor: pagamentos.reduce((sum, p) => sum + p.valor, 0),
      pendentes: pagamentos.filter(p => p.status === 'pendente').length,
      pagos: pagamentos.filter(p => p.status === 'pago').length,
      atrasados: pagamentos.filter(p => p.status === 'atrasado').length,
      totalPendente,
      totalPago,
      totalAtrasado
    };
  }, [pagamentos]);

  const lista = useMemo(() => {
    let filtered = pagamentos.filter(p => {
      const q = search.toLowerCase();
      return (
        p.cliente_nome?.toLowerCase().includes(q) ||
        String(p.id_pagamento).includes(q) ||
        p.descricao?.toLowerCase().includes(q)
      );
    });
    
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    return filtered;
  }, [pagamentos, search, filterStatus]);

  async function handleDelete() {
    if (!confirmId) return;
    
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`${API}/pagamentos/${confirmId}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      
      setConfirmId(null);
      showToast("Pagamento removido com sucesso!", "del");
      await fetchPagamentos();
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : "Erro ao remover pagamento", "err");
    } finally {
      setDeleting(false);
    }
  }

 async function handleBaixarPagamento(id_pagamento: number) {
  try {
    const res = await fetchWithAuth(`${API}/pagamentos/${id_pagamento}/baixar`, {
      method: "PUT"
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao baixar pagamento');
    }
    
    showToast("Pagamento baixado com sucesso!", "ok");
    
    // 🔥 CORRIGIDO: status como string 'pago'
    setPagamentos(prevPagamentos => 
      prevPagamentos.map(pagamento => 
        pagamento.id_pagamento === id_pagamento 
          ? { 
              ...pagamento, 
              status: 'pago',  // ← string, não número 1
              data_pagamento: new Date().toISOString()
            }
          : pagamento
      )
    );
    
  } catch (err) {
    console.error(err);
    showToast(err instanceof Error ? err.message : "Erro ao baixar pagamento", "err");
  }
}

  function exportCSV() {
    const headers = ["ID", "Cliente", "Valor", "Forma Pagamento", "Status", "Vencimento", "Descrição"];
    const rows = lista.map(p => [
      p.id_pagamento,
      p.cliente_nome,
      formatCurrency(p.valor),
      getFormaPagamentoText(p.forma_pagamento),
      getStatusText(p.status),
      formatDate(p.data_vencimento),
      p.descricao || ""
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = "pagamentos.csv";
    a.click();
    showToast("CSV exportado!", "ok");
  }

  const handleCloseModal = () => {
    setConfirmId(null);
    setDeleting(false);
  };

  const confirmPagamento = pagamentos.find(p => p.id_pagamento === confirmId);

  return (
    <div className="pagamentos-wrapper">
      <Sidebar />
      <div className="pagamentos-page">
        <header className="p-topbar">
          <div className="p-topbar-title">
            Pagamentos <span>Gestão de Recebimentos</span>
          </div>
          <div className="p-topbar-actions">
            <button className="btn btn-ghost" onClick={exportCSV}>
              <IconDown /> Exportar
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/pagamentos/novo")}>
              <IconPlus /> Novo Pagamento
            </button>
          </div>
        </header>

        <div className="p-content">
          {/* Stats Cards */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon si-blue">💰</div>
              <div className="stat-info">
                <p>Total em Pagamentos</p>
                <strong>{formatCurrency(stats.totalValor)}</strong>
                <small>{stats.total} registros</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon si-yellow">⏳</div>
              <div className="stat-info">
                <p>Pendentes</p>
                <strong>{formatCurrency(stats.totalPendente)}</strong>
                <small>{stats.pendentes} pendentes</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon si-green">✅</div>
              <div className="stat-info">
                <p>Recebidos</p>
                <strong>{formatCurrency(stats.totalPago)}</strong>
                <small>{stats.pagos} pagos</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon si-red">⚠️</div>
              <div className="stat-info">
                <p>Atrasados</p>
                <strong>{formatCurrency(stats.totalAtrasado)}</strong>
                <small>{stats.atrasados} atrasados</small>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="table-card">
            <div className="table-header">
              <h3>Lista de Pagamentos</h3>
              <div className="table-header-right">
                <div className="filter-group">
                  <select 
                    className="filter-select"
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)}
                  >
                    <option value="todos">Todos os status</option>
                    <option value="pendente">Pendentes</option>
                    <option value="pago">Pagos</option>
                    <option value="atrasado">Atrasados</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                  <div className="search-bar">
                    <IconSearch />
                    <input 
                      type="text" 
                      value={search} 
                      onChange={e => setSearch(e.target.value)} 
                      placeholder="Buscar por cliente, ID..." 
                    />
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="big-icon">⏳</div>
                <p>Carregando pagamentos...</p>
              </div>
            ) : lista.length === 0 ? (
              <div className="empty-state">
                <div className="big-icon">💰</div>
                <p>
                  Nenhum pagamento encontrado.<br />
                  Clique em <strong>Novo Pagamento</strong> para registrar um recebimento.
                </p>
              </div>
            ) : (
              <table className="pagamentos-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Valor</th>
                    <th>Forma</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map(p => (
                    <tr key={p.id_pagamento}>
                      <td className="td-id">#{p.id_pagamento}</td>
                      <td className="td-nome">{p.cliente_nome}</td>
                      <td className="td-valor">{formatCurrency(p.valor)}</td>
                      <td className="td-dim">{getFormaPagamentoText(p.forma_pagamento)}</td>
                      <td className="td-dim">{formatDate(p.data_vencimento)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(p.status)}`}>
                          {getStatusText(p.status)}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          {p.parcelas > 1 && (
                            <button 
                              className="icon-btn view" 
                              title="Ver parcelas" 
                              onClick={() => {
                                setViewParcelasId(p.id_pagamento);
                                fetchParcelas(p.id_pagamento);
                              }}
                            >
                              <IconEye />
                            </button>
                          )}
                          {p.status === 'pendente' && (
                            <button 
                              className="icon-btn success" 
                              title="Baixar pagamento" 
                              onClick={() => handleBaixarPagamento(p.id_pagamento)}
                            >
                              ✅
                            </button>
                          )}
                          <button 
                            className="icon-btn edit" 
                            title="Editar" 
                            onClick={() => navigate(`/pagamentos/editar/${p.id_pagamento}`)}
                          >
                            <IconEdit />
                          </button>
                          <button 
                            className="icon-btn del" 
                            title="Remover" 
                            onClick={() => setConfirmId(p.id_pagamento)}
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

      {/* Modal de Parcelas */}
      <div 
        className={`modal-overlay${viewParcelasId !== null ? " open" : ""}`} 
        onClick={() => setViewParcelasId(null)}
      >
        <div className="parcelas-modal" onClick={e => e.stopPropagation()}>
          <h3>📋 Parcelas do Pagamento #{viewParcelasId}</h3>
          {viewParcelasId && parcelas[viewParcelasId] && (
            <table className="parcelas-table">
              <thead>
                <tr>
                  <th>Parcela</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Data Pagamento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {parcelas[viewParcelasId].map(parcela => (
                  <tr key={parcela.id_parcela}>
                    <td>{parcela.numero_parcela}/{pagamentos.find(p => p.id_pagamento === viewParcelasId)?.parcelas}</td>
                    <td>{formatCurrency(parcela.valor)}</td>
                    <td>{formatDate(parcela.data_vencimento)}</td>
                    <td>{parcela.data_pagamento ? formatDate(parcela.data_pagamento) : '—'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(parcela.status)}`}>
                        {getStatusText(parcela.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={() => setViewParcelasId(null)}>
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <div 
        className={`modal-overlay${confirmId !== null ? " open" : ""}`} 
        onClick={handleCloseModal}
      >
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="danger-icon">🗑️</div>
          <h3>Remover pagamento?</h3>
          <p>
            Pagamento de <strong>{confirmPagamento ? formatCurrency(confirmPagamento.valor) : ''}</strong>
            {" "}do cliente <strong>{confirmPagamento?.cliente_nome}</strong> será removido.
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