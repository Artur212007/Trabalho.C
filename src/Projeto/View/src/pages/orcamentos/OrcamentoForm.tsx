import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import "./OrcamentoForm.css";

const API = "http://localhost:3001/api";

export default function OrcamentoForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [clientes, setClientes] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);

  const [idCliente, setIdCliente] = useState("");
  const [idTecnico, setIdTecnico] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dados, setDados] = useState(""); // ✅ NOVO
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [validade, setValidade] = useState("");
  const [status, setStatus] = useState("0");

  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD
  // =========================
  useEffect(() => {
    fetchClientes();
    fetchTecnicos();

    if (id) {
      fetchOrcamento();
    } else {
      setData(new Date().toISOString().split("T")[0]); // data automática
    }
  }, [id]);

  async function fetchClientes() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/clientes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setClientes(data);
  }

  async function fetchTecnicos() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/funcionarios?cargo=4`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setTecnicos(data);
  }

  async function fetchOrcamento() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API}/orcamentos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    setIdCliente(String(data.id_cliente));
    setIdTecnico(String(data.id_tecnico || ""));
    setDescricao(data.descricao || "");
    setDados(data.dados || ""); // ✅ AQUI
    setValor(data.valor_total);
    setData(data.data ? data.data.split("T")[0] : "");
    setValidade(data.validade ? data.validade.split("T")[0] : "");
    setStatus(String(data.status));
  }

  // =========================
  // SAVE
  // =========================
  async function salvar(e: any) {
    e.preventDefault();

    if (!idCliente || !descricao || !valor || !validade) {
      alert("Preencha cliente, descrição, valor e validade");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const payload = {
        id_cliente: Number(idCliente),
        id_tecnico: idTecnico ? Number(idTecnico) : null,
        descricao,
        dados, // ✅ NOVO
        valor_total: Number(valor),
        data,
        validade,
        status: Number(status),
      };

      const url = id
        ? `${API}/orcamentos/${id}`
        : `${API}/orcamentos`;

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

      alert("Orçamento salvo com sucesso!");
      navigate("/orcamentos");

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
            {id ? "Editar Orçamento" : "Novo Orçamento"}
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

            {/* DADOS ✅ */}
            <label>Dados</label>
            <textarea
              value={dados}
              onChange={(e) => setDados(e.target.value)}
              placeholder="Informações adicionais, diagnóstico, observações..."
            />

            {/* VALOR */}
            <label>Valor</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />

            {/* VALIDADE */}
            <label>Validade</label>
            <input
              type="date"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
            />

            {/* STATUS */}
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="0">Pendente</option>
              <option value="1">Aprovado</option>
              <option value="2">Rejeitado</option>
            </select>

            {/* BOTÕES */}
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/orcamentos")}
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