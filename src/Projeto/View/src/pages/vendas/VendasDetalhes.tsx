import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import "./vendas.css";

const API = "http://localhost:3001/api";

interface Item {
  id_item_venda: number;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
}

interface Venda {
  id_venda: number;
  cliente_nome: string;
  vendedor_nome: string;
  valor_total: number;
  data_venda: string;
  status: number;
  itens: Item[];
}

// 🔐 fetch com token
async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function VendasDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venda, setVenda] = useState<Venda | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVenda() {
      try {
        const res = await fetchWithAuth(`${API}/vendas/${id}`);
        const data = await res.json();
        setVenda(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchVenda();
  }, [id]);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR") + " " +
      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatCurrency(v: number) {
    return "R$ " + v.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Carregando...</p>;
  }

  if (!venda) {
    return <p style={{ padding: 20 }}>Venda não encontrada</p>;
  }

  return (
    <div className="vendas-wrapper">
      <Sidebar />

      <div className="vendas-page">
        <header className="p-topbar">
          <div className="p-topbar-title">
            Venda #{venda.id_venda}
          </div>

          <button className="btn" onClick={() => navigate(-1)}>
            ← Voltar
          </button>
        </header>

        <div className="p-content">

          {/* INFO */}
          <div className="stat-card">
            <p><strong>Cliente:</strong> {venda.cliente_nome}</p>
            <p><strong>Vendedor:</strong> {venda.vendedor_nome}</p>
            <p><strong>Data:</strong> {formatDate(venda.data_venda)}</p>
            <p><strong>Status:</strong> {venda.status === 1 ? "Concluída" : "Cancelada"}</p>
          </div>

          {/* ITENS */}
          <div className="table-card">
            <h3>Itens da Venda</h3>

            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Valor Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {venda.itens.map((i) => (
                  <tr key={i.id_item_venda}>
                    <td>{i.produto_nome}</td>
                    <td>{i.quantidade}</td>
                    <td>{formatCurrency(i.valor_unitario)}</td>
                    <td>{formatCurrency(i.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <strong>Total: {formatCurrency(venda.valor_total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}