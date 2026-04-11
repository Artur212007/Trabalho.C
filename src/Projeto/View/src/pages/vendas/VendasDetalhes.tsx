import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { IconArrowLeft, IconClock, IconUser, IconX, IconAlertCircle } from "../../components/icons";
import "./VendasDetalhes.css";

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
    return (
      <div className="vendas-wrapper">
        <Sidebar />
        <div className="vendas-page">
          <div className="empty-state">
            <div className="big-icon"><IconClock /></div>
            <p>Carregando detalhes da venda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!venda) {
    return (
      <div className="vendas-wrapper">
        <Sidebar />
        <div className="vendas-page">
          <div className="empty-state">
            <div className="big-icon"><IconX /></div>
            <p>Venda não encontrada</p>
            <button className="btn btn-primary" onClick={() => navigate("/vendas")}>
              <IconArrowLeft /> Voltar para Vendas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendas-wrapper">
      <Sidebar />

      <div className="vendas-page">
        <header className="p-topbar">
          <div className="p-topbar-title">
            Venda <span>#{venda.id_venda}</span>
          </div>

          <div className="p-topbar-actions">
            <button className="btn-back" onClick={() => navigate(-1)}>
              <IconArrowLeft /> Voltar
            </button>
          </div>
        </header>

        <div className="p-content">
          {/* INFO PRINCIPAL */}
          <div className="detail-cards">
            <div className="detail-card">
              <div className="detail-icon"><IconUser /></div>
              <div className="detail-info">
                <p className="detail-label">Cliente</p>
                <p className="detail-value">{venda.cliente_nome}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon"><IconAlertCircle /></div>
              <div className="detail-info">
                <p className="detail-label">Vendedor</p>
                <p className="detail-value">{venda.vendedor_nome}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon"><IconClock /></div>
              <div className="detail-info">
                <p className="detail-label">Data da Venda</p>
                <p className="detail-value">{formatDate(venda.data_venda)}</p>
              </div>
            </div>

            <div className="detail-card">
              <div className={`detail-icon ${venda.status === 1 ? 'status-ok' : 'status-cancel'}`}>
                {venda.status === 1 ? <IconAlertCircle /> : <IconX />}
              </div>
              <div className="detail-info">
                <p className="detail-label">Status</p>
                <p className="detail-value">{venda.status === 1 ? "Concluída" : "Cancelada"}</p>
              </div>
            </div>
          </div>

          {/* ITENS */}
          <div className="table-card">
            <div className="table-header">
              <h3>Itens da Venda</h3>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Valor Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {venda.itens.map((i) => (
                  <tr key={i.id_item_venda}>
                    <td className="td-nome">{i.produto_nome}</td>
                    <td className="td-center">{i.quantidade}</td>
                    <td className="td-center">{formatCurrency(i.valor_unitario)}</td>
                    <td className="td-center"><strong>{formatCurrency(i.subtotal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer">
              <div className="total-info">
                <p className="total-label">Total da Venda:</p>
                <p className="total-value">{formatCurrency(venda.valor_total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}