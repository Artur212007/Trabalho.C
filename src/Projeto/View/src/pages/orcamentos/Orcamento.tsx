import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import "./Orcamento.css";

const API = "http://localhost:3001/api";

interface Orcamento {
  id: number;
  cliente: string;
  tecnico: string;
  descricao: string;
  dados: string;
  valor: number;
  status: number;
  data: string;
  validade: string;
}

const IconPlus = () => <span>＋</span>;
const IconEdit = () => <span>✏️</span>;
const IconTrash = () => <span>🗑️</span>;
const IconSearch = () => <span>🔍</span>;
const IconDown = () => <span>⬇️</span>;

export default function Orcamentos() {
  const navigate = useNavigate();

  const [lista, setLista] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchOrcamentos() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/orcamentos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao buscar orçamentos");
      const data = await res.json();
      setLista(data.map((o: any) => ({
        id: o.id_orcamento,
        cliente: o.nome_cliente || "Sem cliente",
        tecnico: o.nome_tecnico || "Sem técnico",
        descricao: o.descricao || "",
        dados: o.dados || "",
        valor: o.valor_total || 0,
        status: o.status ?? 0,
        data: o.data || "",
        validade: o.validade || ""
      })));
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const filtrado = useMemo(() =>
    lista.filter(o =>
      o.cliente.toLowerCase().includes(search.toLowerCase()) ||
      o.tecnico.toLowerCase().includes(search.toLowerCase()) ||
      o.descricao.toLowerCase().includes(search.toLowerCase()) ||
      o.dados.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search)
    ), [lista, search]
  );

  async function deletar(id: number) {
    if (!window.confirm("Deseja excluir o orçamento?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/orcamentos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao deletar");
      fetchOrcamentos();
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar orçamento");
    }
  }

  function exportCSV() {
    const headers = ["ID", "Cliente", "Técnico", "Descrição", "Dados", "Valor", "Status", "Data", "Validade"];
    const rows = lista.map(o => [
      o.id,
      o.cliente,
      o.tecnico,
      o.descricao,
      o.dados,
      o.valor,
      o.status === 1 ? "Aprovado" : "Pendente",
      o.data ? new Date(o.data).toLocaleDateString("pt-BR") : "-",
      o.validade ? new Date(o.validade).toLocaleDateString("pt-BR") : "-"
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv]));
    a.download = "orcamentos.csv";
    a.click();
  }

  return (
    <div className="funcionarios-wrapper">
      <Sidebar />

      <div className="funcionarios-page">
        <header className="p-topbar">
          <div className="p-topbar-title">
            Orçamentos <span>Gestão</span>
          </div>

          <div className="p-topbar-actions">
            <button className="btn btn-ghost" onClick={exportCSV}>
              <IconDown /> Exportar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/orcamentos/novo")}
            >
              <IconPlus /> Novo Orçamento
            </button>
          </div>
        </header>

        <div className="p-content">
          <div className="table-card">

            <div className="table-header">
              <h3>Lista de Orçamentos</h3>
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
              <p>Nenhum orçamento encontrado</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Técnico</th>
                    <th>Descrição</th>
                    <th>Dados</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Validade</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filtrado.map(o => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.cliente}</td>
                      <td>{o.tecnico}</td>
                      <td>{o.descricao || "-"}</td>
                      <td>{o.dados || "-"}</td>
                      <td>R$ {o.valor.toFixed(2)}</td>
                      <td>{o.status === 1 ? "Aprovado" : "Pendente"}</td>
                      <td>{o.data ? new Date(o.data).toLocaleDateString("pt-BR") : "-"}</td>
                      <td>{o.validade ? new Date(o.validade).toLocaleDateString("pt-BR") : "-"}</td>
                      <td>
                        <button onClick={() => navigate(`/orcamentos/editar/${o.id}`)}>
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