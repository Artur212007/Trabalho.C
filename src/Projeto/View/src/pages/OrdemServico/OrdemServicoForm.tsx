import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { IconArrowLeft, IconClock } from "../../components/icons";
import "./OrdemServico.css";

const API = "http://localhost:3001/api";

// Hook para notificações toast
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err'; visible: boolean }>({ msg: '', type: 'ok', visible: false });
  function show(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }
  return { toast, show };
}

export default function OrdemServicoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast, show: showToast } = useToast();

  const [clientes, setClientes] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);

  const [idCliente, setIdCliente] = useState("");
  const [idTecnico, setIdTecnico] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("0");

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
      showToast("Erro ao carregar clientes", 'err');
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
      setDescricao(data.descricao_problema);
      setStatus(String(data.status));
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
        descricao_problema: descricao, // ✅ CORRETO
        status: Number(status),
      };

      const url = id
        ? `${API}/OrdemServico/${id}`
        : `${API}/OrdemServico`;

      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ ESSENCIAL
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || "Erro ao salvar ordem de serviço", 'err');
        return;
      }

      showToast(`Ordem de serviço ${id ? 'atualizada' : 'criada'} com sucesso!`, 'ok');
      navigate("/ordem-servico");

    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar ordem de serviço", 'err');
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="ordem-servico-wrapper">
      <Sidebar />

      <div className="ordem-servico-page">
        <header className="p-topbar">
          <div className="p-topbar-title">
            {id ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"} <span>Formulário</span>
          </div>
          <div className="p-topbar-actions">
            <button className="btn btn-ghost" onClick={() => navigate("/ordem-servico")}>
              <IconArrowLeft /> Voltar
            </button>
          </div>
        </header>

        <div className="p-content">
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon"><IconClock /></div>
              <div>
                <h2>{id ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}</h2>
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

                {/* STATUS */}
                <div className="pf-field">
                  <label>Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="0">Aberta</option>
                    <option value="1">Concluída</option>
                  </select>
                </div>

                {/* DESCRIÇÃO */}
                <div className="pf-field pf-full">
                  <label>Descrição do Problema *</label>
                  <textarea
                    maxLength={150}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva detalhadamente o problema relatado..."
                    rows={4}
                    required
                    style={{
                      background: '#F5F5F5',
                      color: '#1A1A1A',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(0,0,0,.1)',
                      padding: '14px',
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
                    onClick={() => navigate("/ordem-servico")}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button className="btn btn-primary" disabled={loading}>
                    {loading ? "Salvando..." : (id ? "Atualizar OS" : "Criar OS")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className={`toast${toast.visible ? ' show' : ''}`}>
        <span className={`toast-dot ${toast.type}`} />
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}