import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import "./FluxoCaixaForm.css";

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
  id_funcionario: number;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

function useToast() {
  const [toast, setToast] = useState({
    msg: "",
    type: "ok",
    visible: false,
  });

  function show(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }

  return { toast, show };
}

export default function CaixaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [tecnicos, setTecnicos] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast, show } = useToast();

  const [formData, setFormData] = useState<CaixaFormData>({
    data: new Date().toISOString().split("T")[0],
    valor_abertura: 0,
    valor_fechamento: null,
    id_funcionario: 0,
  });

  // 🔥 buscar técnicos
  useEffect(() => {
    async function fetchTecnicos() {
      try {
        const res = await fetchWithAuth(`${API}/caixa/tecnicos`);
        const data = await res.json();
        setTecnicos(data);
      } catch {
        show("Erro ao carregar técnicos", "err");
      }
    }
    fetchTecnicos();
  }, []);

  // 🔥 buscar caixa (edição)
  useEffect(() => {
    async function fetchCaixa() {
      if (!isEditing) return;

      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API}/caixa/${id}`);
        const data = await res.json();

        setFormData({
          data: data.data?.split("T")[0],
          valor_abertura: data.valor_abertura,
          valor_fechamento: data.valor_fechamento,
          id_funcionario: data.id_funcionario,
        });
      } catch {
        show("Erro ao carregar caixa", "err");
        navigate("/caixa");
      } finally {
        setLoading(false);
      }
    }

    fetchCaixa();
  }, [id]);

  function handleChange(e: any) {
    const { name, value } = e.target;

    if (name === "valor_abertura" || name === "valor_fechamento") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "id_funcionario" ? parseInt(value) : value,
      }));
    }
  }

  // 🔥 salvar (NÃO FECHA CAIXA)
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!formData.id_funcionario) {
      show("Selecione um responsável", "err");
      return;
    }

    setSaving(true);

    try {
      let url = `${API}/caixa`;
      let method = "POST";
      let dados: any = {};

      if (isEditing) {
        url = `${API}/caixa/${id}`;
        method = "PUT";

        // 🔥 NUNCA envia valor_fechamento aqui
        dados = {
          data: formData.data,
          valor_abertura: formData.valor_abertura,
          id_funcionario: formData.id_funcionario,
        };
      } else {
        dados = {
          valor_abertura: formData.valor_abertura,
          id_funcionario: formData.id_funcionario,
        };
      }

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(dados),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      show("Salvo com sucesso!");
      setTimeout(() => navigate("/caixa"), 1500);
    } catch (err: any) {
      show(err.message, "err");
    } finally {
      setSaving(false);
    }
  }

  // 🔥 FECHAR CAIXA (AÇÃO SEPARADA)
  async function handleFecharCaixa() {
  if (!formData.valor_fechamento || formData.valor_fechamento <= 0) {
    show("Informe o valor de fechamento", "err");
    return;
  }

  if (!confirm("Deseja realmente fechar o caixa?")) return;

  try {
    const res = await fetchWithAuth(`${API}/caixa/${id}/fechar`, {
      method: "PUT",
      body: JSON.stringify({
        valor_fechamento: formData.valor_fechamento,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao fechar caixa");
    }

    show("Caixa fechado com sucesso!");
    setTimeout(() => navigate("/caixa"), 1500);

  } catch (err: any) {
    show(err.message || "Não foi possível fechar o caixa", "err");
  }
}

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="fornecedores-wrapper">
      <Sidebar />

      <div className="fornecedores-page">
        <header className="p-topbar">
          <div className="p-topbar-title">
            {isEditing ? "Editar Caixa" : "Novo Caixa"}
          </div>

          <div className="p-topbar-actions">
            <button type="button" className="btn btn-back" onClick={() => navigate("/caixa")}>
              Voltar
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <label>Data</label>
          <input type="date" name="data" value={formData.data} onChange={handleChange} />

          <label>Técnico</label>
          <select name="id_funcionario" value={formData.id_funcionario} onChange={handleChange}>
            <option value={0}>Selecione...</option>
            {tecnicos.map((t) => (
              <option key={t.id_funcionario} value={t.id_funcionario}>
                {t.nome}
              </option>
            ))}
          </select>

          <label>Abertura</label>
          <input type="number" name="valor_abertura" value={formData.valor_abertura} onChange={handleChange} />

          {isEditing && (
            <>
              <label>Valor Fechamento</label>
              <input
                type="number"
                name="valor_fechamento"
                value={formData.valor_fechamento ?? ""}
                onChange={handleChange}
              />

              <button type="button" className="btn-danger" onClick={handleFecharCaixa}>
                Fechar Caixa
              </button>
            </>
          )}

          <div className="actions">
            <button type="button" onClick={() => navigate("/caixa")}>
              Cancelar
            </button>

            <button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>

      {toast.visible && <div className="toast">{toast.msg}</div>}
    </div>
  );
}