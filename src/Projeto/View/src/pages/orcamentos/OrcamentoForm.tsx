import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { IconClipboard, IconArrowLeft } from "../../components/icons";
import "./OrcamentoForm.css";

const API = "http://localhost:3001/api";

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err"; visible: boolean }>({ msg: "", type: "ok", visible: false });
  function show(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }
  return { toast, show };
}

function formatPreco(value: string): { display: string; numeric: number } {
  const digits = value.replace(/\D/g, "");
  const numeric = Number(digits) / 100;
  const display = numeric.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return { display, numeric };
}

export default function OrcamentoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast, show: showToast } = useToast();

  const [clientes, setClientes] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);

  const [idCliente, setIdCliente] = useState("");
  const [idTecnico, setIdTecnico] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dados, setDados] = useState(""); // ✅ NOVO
  const [valor, setValor] = useState("");
  const [valorDisplay, setValorDisplay] = useState("");
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
    const valorNum = data.valor_total;
    setValor(valorNum);
    setValorDisplay(valorNum.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
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
        valor_total: parseFloat((valor || "0").toString()),
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
        showToast(err.error || "Erro ao salvar orçamento", "err");
        return;
      }

      showToast(`Orçamento ${id ? 'atualizado' : 'criado'} com sucesso!`, "ok");
      setTimeout(() => navigate("/orcamentos"), 1500);

    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar orçamento", "err");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="pf-wrapper">
      <Sidebar />

      <div className="pf-page">
        <div className="pf-header">
          <button className="btn btn-ghost" onClick={() => navigate("/orcamentos")}>
            <IconArrowLeft /> Voltar
          </button>
          <div className="pf-title-block">
            <h1>{id ? "Editar Orçamento" : "Novo Orçamento"}</h1>
            <p>{id ? "Atualize as informações do orçamento" : "Cadastre um novo orçamento"}</p>
          </div>
        </div>

        <div className="pf-card">
          <div className="pf-card-header">
            <div className="pf-card-icon"><IconClipboard /></div>
            <div>
              <h2>{id ? "Editar" : "Criar"} Orçamento</h2>
              <p>Preencha os dados do formulário</p>
            </div>
          </div>

          <form className="pf-form" onSubmit={salvar}>
            <div className="pf-grid">
              {/* CLIENTE */}
              <div className="pf-field">
                <label>Cliente *</label>
                <select
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* TECNICO */}
              <div className="pf-field">
                <label>Técnico Responsável</label>
                <select
                  value={idTecnico}
                  onChange={(e) => setIdTecnico(e.target.value)}
                >
                  <option value="">Selecione um técnico</option>
                  {tecnicos.map((t) => (
                    <option key={t.id_funcionario} value={t.id_funcionario}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* VALOR */}
              <div className="pf-field">
                <label>Valor (R$) *</label>
                <input
                  type="text"
                  maxLength={12}
                  value={valorDisplay}
                  onChange={e => { const { display, numeric } = formatPreco(e.target.value); setValorDisplay(display); setValor(numeric); }}
                  placeholder="0,00"
                  required
                />
              </div>

              {/* VALIDADE */}
              <div className="pf-field">
                <label>Data de Validade *</label>
                <input
                  type="date"
                  value={validade}
                  onChange={(e) => setValidade(e.target.value)}
                  max="2026-04-11"
                  required
                />
              </div>

              {/* STATUS */}
              <div className="pf-field">
                <label>Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="0">Pendente</option>
                  <option value="1">Aprovado</option>
                  <option value="2">Rejeitado</option>
                </select>
              </div>

              {/* DESCRIÇÃO */}
              <div className="pf-field pf-full">
                <label>Descrição do Orçamento *</label>
                <textarea
                  maxLength={150}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva detalhadamente o serviço ou produto..."
                  rows={3}
                  required
                  style={{
                    background: '#F5F5F5',
                    color: '#1A1A1A',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(0,0,0,.1)',
                    padding: '12px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color .2s, box-shadow .2s',
                    width: '100%',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FFD100';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,209,0,.15)';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0,0,0,.1)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#F5F5F5';
                  }}
                />
              </div>

              {/* DADOS */}
              <div className="pf-field pf-full">
                <label>Dados Adicionais</label>
                <textarea
                  maxLength={150}
                  value={dados}
                  onChange={(e) => setDados(e.target.value)}
                  placeholder="Informações adicionais, diagnóstico, observações..."
                  rows={3}
                  style={{
                    background: '#F5F5F5',
                    color: '#1A1A1A',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(0,0,0,.1)',
                    padding: '12px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color .2s, box-shadow .2s',
                    width: '100%',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FFD100';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,209,0,.15)';
                    e.target.style.background = '#fff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0,0,0,.1)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#F5F5F5';
                  }}
                />
              </div>
            </div>

            {/* BOTÕES */}
            <div className="pf-footer">
              <div></div>
              <div className="pf-footer-right">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/orcamentos")}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" disabled={loading}>
                  {loading ? "Salvando..." : (id ? "Atualizar Orçamento" : "Criar Orçamento")}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className={`toast${toast.visible ? ' show' : ''}`}>
          <span className={`toast-dot ${toast.type}`} />
          <span>{toast.msg}</span>
        </div>
      </div>
    </div>
  );
}