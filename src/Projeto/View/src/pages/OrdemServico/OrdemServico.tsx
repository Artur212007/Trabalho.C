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
  status: number;
  data: string;
}

const IconPlus = () => <span>＋</span>;
const IconEdit = () => <span>✏️</span>;
const IconTrash = () => <span>🗑️</span>;
const IconSearch = () => <span>🔍</span>;
const IconDown = () => <span>⬇️</span>;

export default function OrdemServico() {
  const navigate = useNavigate();

  const [lista, setLista] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // =========================
  // BUSCAR ORDENS
  // =========================
  async function fetchOS() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/OrdemServico`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar ordens");
      }

      const data = await res.json();

      setLista(data.map((o: any) => ({
        id: o.id_ordem_servico,
        cliente: o.nome_cliente || "Sem cliente",
        tecnico: o.nome_tecnico || "Sem técnico",
        descricao: o.descricao_problema || "",
        status: o.status ?? 0,
        data: o.data_abertura || ""
      })));

    } catch (err) {
      console.error(err);
      alert("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOS();
  }, []);

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

  // =========================
  // DELETAR
  // =========================
  async function deletar(id: number) {
    if (!window.confirm("Deseja excluir a ordem de serviço?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/OrdemServico/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Erro ao deletar");
      }

      fetchOS();

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
      o.status === 1 ? "Concluído" : "Aberto",
      o.data
    ]);

    const csv = [headers, ...rows]
      .map(r => r.join(";"))
      .join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv]));
    a.download = "ordens_servico.csv";
    a.click();
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

            <button
              className="btn btn-primary"
              onClick={() => navigate("/Ordem/novo")}
            >
              <IconPlus /> Nova OS
            </button>
          </div>
        </header>

        <div className="p-content">
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
              <p>Carregando...</p>
            ) : filtrado.length === 0 ? (
              <p>Nenhuma ordem encontrada</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Técnico</th>
                    <th>Problema</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filtrado.map(o => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.cliente}</td>
                      <td>{o.tecnico}</td>
                      <td>{o.descricao}</td>

                      <td>
                        {o.status === 1 ? "Concluído" : "Aberto"}
                      </td>

                      <td>
                        {o.data
                          ? new Date(o.data).toLocaleString()
                          : "-"
                        }
                      </td>

                      <td>
                        <button
                          onClick={() => navigate(`/Ordem/editar/${o.id}`)}
                        >
                          <IconEdit />
                        </button>

                        <button onClick={() => deletar(o.id)}>
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}