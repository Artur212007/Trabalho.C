import { useState, useMemo, useEffect, type SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { IconAlert, IconClock, IconDown, IconEdit, IconMoney, IconPlus, IconSearch, IconTrash } from "../../components/ui/icons";
import "./Despesas.css";

const API = "http://localhost:3001/api";

interface Despesa {
  id_despesa: number;
  descricao: string;
  valor: number;
  status?: string;
  data?: string;
}

type ToastType = "ok" | "err" | "del";

interface ToastState {
  msg: string;
  type: ToastType;
  visible: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(date?: string) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR");
}

export default function Despesas() {
  const navigate = useNavigate();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>({ msg: "", type: "ok", visible: false });
  const [error, setError] = useState<string | null>(null);

  // 🔥 FUNÇÃO COM TOKEN
  function api(url: string, options: any = {}) {
    const token = localStorage.getItem("token");

    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers
      }
    });
  }

  function showToast(msg: string, type: ToastType = "ok") {
    setToast({ msg, type, visible: true });
    window.setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2800);
  }

  // 🔥 BUSCAR DESPESAS
  async function fetchDespesas() {
    try {
      setLoading(true);
      setError(null);

      const res = await api(`${API}/despesas`);

      if (!res.ok) {
        if (res.status === 401) {
          alert("Sessão expirada, faça login novamente");
          navigate("/login");
          return;
        }

        throw new Error("Erro ao buscar despesas");
      }

      const data = await res.json();
      setDespesas(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar as despesas agora.");
      showToast("Erro ao carregar despesas.", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDespesas();
  }, []);

  // 🔥 FILTRO
  const lista = useMemo(() => {
    return despesas.filter(d =>
      (d.descricao || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [despesas, search]);

  // 🔥 STATS
  const stats = useMemo(() => {
    const total = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);

    const pagas = despesas
      .filter(d => d.status === "pago")
      .reduce((sum, d) => sum + (d.valor || 0), 0);

    const pendentes = despesas
      .filter(d => d.status === "pendente")
      .reduce((sum, d) => sum + (d.valor || 0), 0);

    return { total, pagas, pendentes };
  }, [despesas]);

  // 🔥 DELETE
  async function handleDelete() {
    if (!confirmId) return;

    try {
      const res = await api(`${API}/despesas/${confirmId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao excluir");

      setConfirmId(null);
      showToast("Despesa excluída com sucesso!", "del");
      fetchDespesas();

    } catch (err) {
      console.error(err);
      showToast("Erro ao excluir despesa.", "err");
    }
  }

  function getStatusMeta(status?: string) {
    const normalized = (status || "").toLowerCase();

    if (normalized === "pago") {
      return { label: "Pago", className: "is-paid" };
    }

    if (normalized === "pendente") {
      return { label: "Pendente", className: "is-pending" };
    }

    return { label: status || "—", className: "is-neutral" };
  }

  const pendingCount = useMemo(() => despesas.filter(d => (d.status || "").toLowerCase() === "pendente").length, [despesas]);
  const paidCount = useMemo(() => despesas.filter(d => (d.status || "").toLowerCase() === "pago").length, [despesas]);

  function exportCSV() {
    const headers = ["ID", "Descrição", "Valor", "Data", "Status"];
    const rows = lista.map(d => [d.id_despesa, d.descricao, d.valor, formatDate(d.data), d.status || "-"]);
    const csv = [headers, ...rows].map(row => row.join(";")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = "despesas.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("CSV exportado com sucesso!", "ok");
  }

  return (
    <div className="despesas-wrapper">
      <Sidebar />

      <div className="despesas-page">
        <header className="d-topbar">
          <div className="d-topbar-title">
            <span className="d-chip">Financeiro</span>
            <h1>Despesas</h1>
            <p>Visualize lançamentos, confira pendências e mantenha os gastos sob controle.</p>
          </div>

          <div className="d-topbar-actions">
            <button className="btn btn-ghost d-ghost" onClick={() => navigate("/dashboard")}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/despesas/novo")}>
              <IconPlus /> Nova despesa
            </button>
          </div>
        </header>

        <div className="d-content">
          <section className="d-hero">
            <div className="d-hero-copy">
              <p className="d-kicker">Resumo financeiro</p>
              <h2>Controle de despesas em um só lugar</h2>
              <p>Uma visão objetiva dos totais, valores pagos e itens pendentes, com leitura clara e direta.</p>
            </div>

            <div className="d-hero-stats">
              <article className="d-stat-card accent">
                <span className="d-stat-icon"><IconMoney /></span>
                <div>
                  <p>Total lançado</p>
                  <strong>{formatCurrency(stats.total)}</strong>
                </div>
              </article>

              <article className="d-stat-card success">
                <span className="d-stat-icon"><IconCheckmark /></span>
                <div>
                  <p>Pagas</p>
                  <strong>{paidCount}</strong>
                </div>
              </article>

              <article className="d-stat-card warning">
                <span className="d-stat-icon"><IconAlert /></span>
                <div>
                  <p>Pendentes</p>
                  <strong>{pendingCount}</strong>
                </div>
              </article>
            </div>
          </section>

          <section className="d-table-card">
            <div className="d-table-header">
              <div>
                <h3>Lista de despesas</h3>
                <p>{despesas.length} lançamento{despesas.length === 1 ? "" : "s"} encontrado{despesas.length === 1 ? "" : "s"}.</p>
              </div>

              <div className="d-toolbar">
                <div className="search-bar d-search">
                  <IconSearch />
                  <input
                    placeholder="Buscar despesa..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <button className="btn btn-ghost d-export" onClick={exportCSV}>
                  <IconDown /> Exportar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="d-empty">
                <IconClock style={{ width: 28, height: 28 }} />
                <p>Carregando despesas...</p>
              </div>
            ) : error ? (
              <div className="d-empty error">
                <IconAlert style={{ width: 28, height: 28 }} />
                <p>{error}</p>
                <button className="btn btn-back" onClick={fetchDespesas}>Tentar novamente</button>
              </div>
            ) : lista.length === 0 ? (
              <div className="d-empty">
                <IconMoney style={{ width: 28, height: 28 }} />
                <p>Nenhuma despesa encontrada.</p>
                <button className="btn btn-primary" onClick={() => navigate("/despesas/novo")}>Nova despesa</button>
              </div>
            ) : (
              <div className="d-table-scroll">
                <table className="d-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Descrição</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map(d => {
                      const statusMeta = getStatusMeta(d.status);

                      return (
                        <tr key={d.id_despesa}>
                          <td className="d-id">#{d.id_despesa}</td>
                          <td className="d-desc">{d.descricao}</td>
                          <td className="d-value">- {formatCurrency(d.valor)}</td>
                          <td className="d-date">{formatDate(d.data)}</td>
                          <td>
                            <span className={`d-status ${statusMeta.className}`}>{statusMeta.label}</span>
                          </td>
                          <td>
                            <div className="d-actions">
                              <button className="icon-btn edit" title="Editar" onClick={() => navigate(`/despesas/editar/${d.id_despesa}`)}>
                                <IconEdit />
                              </button>
                              <button className="icon-btn del" title="Excluir" onClick={() => setConfirmId(d.id_despesa)}>
                                <IconTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {confirmId !== null && (
        <div className="d-modal-overlay" onClick={() => setConfirmId(null)}>
          <div className="d-modal" onClick={e => e.stopPropagation()}>
            <div className="d-modal-icon"><IconTrash /></div>
            <h3>Excluir despesa?</h3>
            <p>Essa ação é permanente e vai remover o lançamento selecionado.</p>
            <div className="d-modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast${toast.visible ? " show" : ""}`}>
        <span className={`toast-dot ${toast.type}`} />
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}

function IconCheckmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}