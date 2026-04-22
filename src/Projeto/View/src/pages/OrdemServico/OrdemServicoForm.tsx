import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import "./OrdemServicoForm.css";

const API = "http://localhost:3001/api";

export default function OrdemServicoForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [clientes, setClientes] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);

  const [idCliente, setIdCliente] = useState("");
  const [idTecnico, setIdTecnico] = useState("");
  const [descricao, setDescricao] = useState("");

  // 🔥 NOVOS CAMPOS
  const [status, setStatus] = useState("0");
  const [idOrcamento, setIdOrcamento] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================
  // CARREGAR DADOS
  // =========================
  useEffect(() => {
    fetchClientes();
    fetchTecnicos();

    if (id) {
      fetchOS();
    }
  }, [id]);

  async function fetchClientes() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/clientes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar clientes");
    }
  }

  async function fetchTecnicos() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/funcionarios?cargo=4`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTecnicos(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar técnicos");
    }
  }

  async function fetchOS() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/OrdemServico/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        return;
      }

      const data = await res.json();

      setIdCliente(String(data.id_cliente));
      setIdTecnico(String(data.id_tecnico || ""));
      setDescricao(data.descricao_problema || "");

      // 🔥 NOVOS CAMPOS
      setStatus(String(data.status ?? "0"));
      setIdOrcamento(String(data.id_orcamento || ""));

    } catch (err) {
      console.error(err);
      alert("Erro ao carregar OS");
    }
  }

  // =========================
  // SALVAR
  // =========================
  async function salvar(e: any) {
    e.preventDefault();

    if (!idCliente || !descricao) {
      alert("Cliente e descrição são obrigatórios");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
     const payload = {
  id_cliente: Number(idCliente),
  id_tecnico: idTecnico ? Number(idTecnico) : null,
  descricao_problema: descricao,
  status: Number(status),
  id_orcamento: idOrcamento ? Number(idOrcamento) : null
};

      const url = id
        ? `${API}/OrdemServico/${id}`
        : `${API}/OrdemServico`;

      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao salvar");
        return;
      }

      alert("Salvo com sucesso!");
      navigate("/ordem");

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="funcionarios-wrapper">
      <Sidebar />

      <div className="funcionarios-page">
        <header className="p-topbar">
          <div className="p-topbar-title">
            {id ? "Editar OS" : "Nova OS"}
          </div>

          <div className="p-topbar-actions">
            <button
              type="button"
              className="btn btn-back"
              onClick={() => navigate("/ordem")}
            >
              Voltar
            </button>
          </div>
        </header>

        <div className="p-content">
          <form className="form-card" onSubmit={salvar}>

            {/* CLIENTE */}
            <label>Cliente</label>
            <select
              value={idCliente}
              onChange={(e) => setIdCliente(e.target.value)}
            >
              <option value="">Selecione</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nome}
                </option>
              ))}
            </select>

            {/* TECNICO */}
            <label>Técnico</label>
            <select
              value={idTecnico}
              onChange={(e) => setIdTecnico(e.target.value)}
            >
              <option value="">Nenhum</option>
              {tecnicos.map((t) => (
                <option key={t.id_funcionario} value={t.id_funcionario}>
                  {t.nome}
                </option>
              ))}
            </select>

            {/* DESCRIÇÃO */}
            <label>Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            {/* 🔥 STATUS NOVO */}
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="0">Pendente</option>
              <option value="1">Feito</option>
              <option value="2">Cancelado</option>
            </select>

            {/* 🔥 ID ORÇAMENTO */}
            <label>ID do Orçamento</label>
            <input
              type="number"
              value={idOrcamento}
              onChange={(e) => setIdOrcamento(e.target.value)}
              placeholder="Opcional"
            />

            {/* BOTÕES */}
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/ordem")}
              >
                Cancelar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}