import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import "./FluxoCaixa.css";

const API = "http://localhost:3001/api";

interface Funcionario {
  id_funcionario: number;
  nome: string;
  cargo: number;
}

interface CaixaFormData {
  data: string;
  valor_abertura: number;
  valor_fechamento: number | null;
  saldo: number;
  id_funcionario: number;
}


const IconArrowLeft = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;

const IconSave = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
}

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "del"; visible: boolean }>({ 
    msg: "", type: "ok", visible: false 
  });
  
  function show(msg: string, type: "ok" | "err" | "del" = "ok") {
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

export default function CaixaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [tecnicos, setTecnicos] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();
  const [valorAberturaDisplay, setValorAberturaDisplay] = useState("");
  const [valorFechamentoDisplay, setValorFechamentoDisplay] = useState("");
  
  const [formData, setFormData] = useState<CaixaFormData>({
    data: new Date().toISOString().split('T')[0],
    valor_abertura: 0,
    valor_fechamento: null,
    saldo: 0,
    id_funcionario: 0
  });

  // Buscar técnicos (apenas cargo = 5)
  useEffect(() => {
    async function fetchTecnicos() {
      try {
        const res = await fetchWithAuth(`${API}/caixa/tecnicos`);
        if (!res.ok) throw new Error('Erro ao carregar técnicos');
        const data = await res.json();
        setTecnicos(data);
      } catch (err) {
        console.error(err);
        showToast('Erro ao carregar lista de técnicos', 'err');
      }
    }
    
    fetchTecnicos();
  }, []);

  // Buscar dados se for edição
  useEffect(() => {
    async function fetchCaixa() {
      if (!isEditing) return;
      
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API}/caixa/${id}`);
        if (!res.ok) throw new Error('Erro ao carregar registro');
        const data = await res.json();
        
        setFormData({
          data: data.data ? data.data.split('T')[0] : '',
          valor_abertura: data.valor_abertura,
          valor_fechamento: data.valor_fechamento,
          saldo: data.saldo,
          id_funcionario: data.id_funcionario
        });
        setValorAberturaDisplay(data.valor_abertura.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        if (data.valor_fechamento) {
          setValorFechamentoDisplay(data.valor_fechamento.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        }
      } catch (err) {
        console.error(err);
        showToast('Erro ao carregar registro de caixa', 'err');
        navigate('/caixa');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCaixa();
  }, [id, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'valor_abertura') {
      const { display, numeric } = formatPreco(value);
      setValorAberturaDisplay(display);
      setFormData(prev => ({ ...prev, valor_abertura: numeric }));
    } else if (name === 'valor_fechamento') {
      const { display, numeric } = formatPreco(value);
      setValorFechamentoDisplay(display);
      setFormData(prev => ({ ...prev, valor_fechamento: numeric }));
    } else if (name === 'saldo') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));
    } else if (name === 'id_funcionario') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.id_funcionario || formData.id_funcionario === 0) {
      showToast('Selecione um responsável (técnico)', 'err');
      return;
    }
    
    if (formData.valor_abertura < 0) {
      showToast('Valor de abertura não pode ser negativo', 'err');
      return;
    }
    
    if (formData.saldo < 0) {
      showToast('Saldo não pode ser negativo', 'err');
      return;
    }
    
    setSaving(true);
    
    try {
      let url = `${API}/caixa`;
      let method = 'POST';
      let dadosEnvio: any = {};
      
      if (isEditing) {
        url = `${API}/caixa/${id}`;
        method = 'PUT';
        
        // Para EDIÇÃO: enviar todos os campos, valor_fechamento como 0 se for null
        dadosEnvio = {
          data: formData.data,
          valor_abertura: formData.valor_abertura,
          valor_fechamento: formData.valor_fechamento === null || formData.valor_fechamento === undefined ? 0 : formData.valor_fechamento,
          saldo: formData.saldo,
          id_funcionario: formData.id_funcionario
        };
      } else {
        // Para CRIAÇÃO: não enviar valor_fechamento
        dadosEnvio = {
          valor_abertura: formData.valor_abertura,
          saldo: formData.saldo,
          id_funcionario: formData.id_funcionario
        };
      }
      
      console.log('📤 Enviando:', dadosEnvio); // Debug
      
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(dadosEnvio)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao salvar');
      }
      
      showToast(isEditing ? 'Registro atualizado com sucesso!' : 'Registro criado com sucesso!', 'ok');
      
      setTimeout(() => {
        navigate('/caixa');
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : 'Erro ao salvar registro', 'err');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pf-wrapper">
        <Sidebar />
        <div className="pf-page">
          <div className="empty-state">
            <div className="big-icon">⏳</div>
            <p>Carregando registro...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pf-wrapper">
      <Sidebar />
      <div className="pf-page">
        <header className="pf-header">
          <div className="pf-title-block">
            <h1>Fluxo de Caixa</h1>
            <p>{isEditing ? 'Editar Registro' : 'Novo Registro'}</p>
          </div>
          <button className="pf-back" onClick={() => navigate('/caixa')}>
            <IconArrowLeft /> Voltar
          </button>
        </header>

        <div className="pf-content">
          <div className="pf-card">
            <div className="pf-card-header">
              <div className="pf-card-icon">💰</div>
              <div>
                <h2>Fluxo de Caixa</h2>
                <p>{isEditing ? 'Editar Registro' : 'Novo Registro'}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="pf-grid">
                {/* Data */}
                <div className="pf-field">
                  <label htmlFor="data">Data *</label>
                  <input
                    type="date"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    max="2026-04-11"
                    required
                  />
                </div>

                {/* Responsável (Técnico) */}
                <div className="pf-field">
                  <label htmlFor="id_funcionario">Responsável (Técnico) *</label>
                  <select
                    id="id_funcionario"
                    name="id_funcionario"
                    value={formData.id_funcionario}
                    onChange={handleChange}
                    required
                  >
                    <option value={0}>Selecione um técnico...</option>
                    {tecnicos.map(tecnico => (
                      <option key={tecnico.id_funcionario} value={tecnico.id_funcionario}>
                        {tecnico.nome}
                      </option>
                    ))}
                  </select>
                  {tecnicos.length === 0 && (
                    <small className="form-hint">Nenhum técnico encontrado. Cadastre um funcionário com cargo de técnico (ID 5).</small>
                  )}
                </div>

                {/* Valor Abertura */}
                <div className="pf-field">
                  <label htmlFor="valor_abertura">Valor de Abertura (R$) *</label>
                  <input
                    type="text"
                    id="valor_abertura"
                    name="valor_abertura"
                    maxLength={12}
                    value={valorAberturaDisplay}
                    onChange={handleChange}
                    placeholder="0,00"
                    required
                  />
                </div>

                {/* Valor Fechamento - só mostra se for edição */}
                {isEditing && (
                  <div className="pf-field">
                    <label htmlFor="valor_fechamento">Valor de Fechamento (R$)</label>
                    <input
                      type="text"
                      id="valor_fechamento"
                      name="valor_fechamento"
                      maxLength={12}
                      value={valorFechamentoDisplay}
                      onChange={handleChange}
                      placeholder="0,00"
                    />
                  </div>
                )}

                {/* Saldo */}
                <div className="pf-field">
                  <label htmlFor="saldo">Saldo (R$) *</label>
                  <input
                    type="number"
                    id="saldo"
                    name="saldo"
                    value={formData.saldo}
                    onChange={handleChange}
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="pf-footer">
                <div></div>
                <div className="pf-footer-right">
                  <button type="button" className="btn btn-ghost" onClick={() => navigate('/caixa')}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <IconSave /> {saving ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className={`toast${toast.visible ? " show" : ""}`}>
          <span className={`toast-dot ${toast.type}`} />
          <span>{toast.msg}</span>
        </div>
      </div>
    </div>
  );
}