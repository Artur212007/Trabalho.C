import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { IconAlert, IconBox, IconCheck, IconClock, IconDown, IconEdit, IconPlus, IconSearch, IconTrash } from "../../components/ui/icons";
import { getUser } from "../../utils/auth";
import "./OrdemServico.css";

const API = "http://localhost:3001/api";

interface OrdemServico {
  id: number;
  cliente: string;
  tecnico: string;
  descricao: string;
  status: number;
  status_execucao: number;
  id_orcamento: number;
  data: string;
}

export default function OrdemServico() {
  const navigate = useNavigate();

  const [lista, setLista] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const user = getUser();
  const isTecnico = user?.nivel === 4;

  // =========================
  // BUSCAR ORDENS
  // =========================
  async function fetchOS() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/OrdemServico`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao buscar ordens");
      const data = await res.json();
      setLista(Array.isArray(data) ? data.map((o: any) => ({
        id: o.id_ordem_servico,
        cliente: o.nome_cliente || "Sem cliente",
        tecnico: o.nome_tecnico || "Sem técnico",
        descricao: o.descricao_problema || "",
        status: Number(o.status ?? 0),
        status_execucao: Number(o.status_execucao ?? o.status) || 0,
        id_orcamento: o.id_orcamento,
        data: o.data_abertura || ""
      })) : []);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOS(); }, []);

  // =========================
  // FILTRO
  // =========================
  const filtrado = useMemo(() =>
    lista.filter(o =>
      (o.cliente || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.tecnico || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.descricao || "").toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search)
    ), [lista, search]
  );

  const stats = useMemo(() => ({
    total: lista.length,
    pendentes: lista.filter(o => o.status_execucao === 0).length,
    concluidas: lista.filter(o => o.status_execucao === 3).length,
    canceladas: lista.filter(o => o.status_execucao === 4).length,
  }), [lista]);

  // =========================
  // STATUS
  // =========================
  function getStatusLabel(status: number) {
    switch (status) {
      case 1: return "Em diagnóstico";
      case 2: return "Em reparo";
      case 3: return "Concluída";
      case 4: return "Cancelada";
      default: return "Aguardando";
    }
  }

  function getStatusClass(status: number) {
    switch (status) {
      case 1: return "status-info";
      case 2: return "status-warn";
      case 3: return "status-ok";
      case 4: return "status-bad";
      default: return "status-neutral";
    }
  }

  // =========================
  // VERIFICAR SE TEM TÉCNICO
  // =========================
  function semTecnico(o: OrdemServico) {
    return o.tecnico === "Sem técnico";
  }

  // =========================
  // DELETAR
  // =========================
  async function deletar(id: number) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/OrdemServico/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao deletar");
      fetchOS();
      setConfirmId(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar ordem");
    }
  }

  // =========================
  // EXPORTAR CSV
  // =========================
  function exportCSV() {
    const headers = ["ID", "Cliente", "Técnico", "Descrição", "Status", "Data"];
    const rows = lista.map(o => [
      o.id,
      o.cliente,
      o.tecnico,
      o.descricao,
      getStatusLabel(o.status_execucao),
      o.data
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv]));
    a.download = "ordens_servico.csv";
    a.click();
  }

  // Adicione essa função junto com as outras:
  async function pegarOS(id: number) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/OrdemServico/${id}/pegar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const e = await res.json();
        alert(e.error || "Erro ao pegar OS");
        return;
      }
      fetchOS();
    } catch {
      alert("Erro ao pegar OS");
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="funcionarios-wrapper">
      <Sidebar />

      <div className="funcionarios-page">
        <header className="p-topbar">
          <div className="p-topbar-title">
            Ordens de Serviço <span>Gestão</span>
          </div>

          <div className="p-topbar-actions">
            <button className="btn btn-ghost" onClick={exportCSV}>
              <IconDown /> Exportar
            </button>

            {!isTecnico && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/ordem/novo")}
              >
                <IconPlus /> Nova OS
              </button>
            )}
          </div>
        </header>

        <div className="p-content">
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon si-blue"><IconBox /></div>
              <div className="stat-info">
                <p>Total de OS</p>
                <strong>{stats.total}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon si-yellow"><IconClock /></div>
              <div className="stat-info">
                <p>Aguardando</p>
                <strong>{stats.pendentes}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon si-green"><IconCheck /></div>
              <div className="stat-info">
                <p>Concluídas</p>
                <strong>{stats.concluidas}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon si-red"><IconAlert /></div>
              <div className="stat-info">
                <p>Canceladas</p>
                <strong>{stats.canceladas}</strong>
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h3>Ordens de Serviço</h3>
              <div className="search-bar">
                <IconSearch />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                />
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="big-icon"><IconClock style={{ width: 32, height: 32 }} /></div>
                <p>Carregando ordens de serviço...</p>
              </div>
            ) : filtrado.length === 0 ? (
              <div className="empty-state">
                <div className="big-icon"><IconBox style={{ width: 32, height: 32 }} /></div>
                <p>Nenhuma ordem encontrada</p>
              </div>
            ) : (
              <table className="ordem-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Técnico</th>
                    <th>Problema</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Orçamento</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrado.map(o => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.cliente}</td>

                      {/* Coluna técnico — mostra "Disponível" se não tiver */}
                      <td>
                        {semTecnico(o)
                          ? <span className="status-badge status-info">Disponível</span>
                          : o.tecnico
                        }
                      </td>

                      <td>{o.descricao}</td>

                      <td>
                        <span className={`status-badge ${getStatusClass(o.status_execucao)}`}>
                          {getStatusLabel(o.status_execucao)}
                        </span>
                      </td>

                      <td>{o.data ? new Date(o.data).toLocaleString() : "-"}</td>
                      <td>{o.id_orcamento ? `#${o.id_orcamento}` : "-"}</td>

                      {/* AÇÕES */}
                      <td>
                        <div className="row-actions">

                          {/* Técnico vendo OS disponível → só botão Pegar */}
                          {isTecnico && semTecnico(o) && (
                            <button
                              className="btn btn-primary"
                              style={{ height: 32, fontSize: 12, padding: "0 12px", borderRadius: 8 }}
                              onClick={() => pegarOS(o.id)}
                            >
                              Pegar OS
                            </button>
                          )}

                          {/* Técnico vendo OS já vinculada a ele → só ver detalhes */}
                          {isTecnico && !semTecnico(o) && (
                            <button
                              className="icon-btn edit"
                              title="Ver detalhes"
                              onClick={() => navigate(`/ordem/${o.id}/detalhes`)}
                            >
                              👁
                            </button>
                          )}

                          {/* Gerente/Admin → ver detalhes + editar + excluir */}
                          {!isTecnico && (
                            <>
                              <button
                                className="icon-btn edit"
                                title="Ver detalhes"
                                onClick={() => navigate(`/ordem/${o.id}/detalhes`)}
                              >
                                👁
                              </button>
                              <button
                                className="icon-btn edit"
                                title="Editar"
                                onClick={() => navigate(`/ordem/editar/${o.id}`)}
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
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {confirmId !== null && (
          <div className="confirm-overlay open" onClick={() => setConfirmId(null)}>
            <div className="confirm-box" onClick={e => e.stopPropagation()}>
              <div className="confirm-icon"><IconTrash /></div>
              <h3>Excluir ordem de serviço?</h3>
              <p>Essa ação é permanente e vai remover a ordem selecionada.</p>
              <div className="confirm-actions">
                <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={() => deletar(confirmId)}>Sim, excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}