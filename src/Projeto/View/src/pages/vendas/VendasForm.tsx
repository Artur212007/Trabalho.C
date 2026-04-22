import { useState, useEffect, type SVGProps } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { IconCart, IconClock, IconUsers } from "../../components/ui/icons";
import "./VendasForm.css";

const API = "http://localhost:3001/api";

interface Produto {
  id: number;
  nome: string;
  preco_venda: number;
  quantidade_estoque: number;
}

interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
}

interface Funcionario {
  id: number;
  nome: string;
  cargo: number;
}

interface ItemVenda {
  id_produto: number;
  nome_produto: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
}

const IconArrow = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconCheck = (props: SVGProps<SVGSVGElement>) => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
  </svg>
);

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

function normalizarCliente(c: any): Cliente | null {
  const id = Number(c.id_cliente ?? c.id);
  if (!id || id <= 0) return null;
  return { id, nome: c.nome ?? "", cpf_cnpj: c.cpf_cnpj ?? "" };
}

function normalizarProduto(p: any): Produto | null {
  const id = Number(p.id_produto ?? p.id);
  if (!id || id <= 0) return null;
  return {
    id,
    nome: p.nome ?? "",
    preco_venda: Number(p.preco_venda ?? 0),
    quantidade_estoque: Number(p.quantidade_estoque ?? 0),
  };
}

function normalizarFuncionario(f: any): Funcionario | null {
  const id = Number(f.id_funcionario ?? f.id);
  if (!id || id <= 0) return null;
  return { id, nome: f.nome ?? "", cargo: Number(f.cargo ?? 0) };
}

export default function VendasForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [clientes, setClientes]   = useState<Cliente[]>([]);
  const [produtos, setProdutos]   = useState<Produto[]>([]);
  const [vendedores, setVendedores] = useState<Funcionario[]>([]);

  const [clienteId, setClienteId]   = useState<number | null>(null);
  const [vendedorId, setVendedorId] = useState<number | null>(null);
  const [itens, setItens]           = useState<ItemVenda[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err"; visible: boolean }>(
    { msg: "", type: "ok", visible: false }
  );

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }

  // ── carrega dados iniciais ──────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cRes, pRes, fRes] = await Promise.all([
          fetchWithAuth(`${API}/clientes`),
          fetchWithAuth(`${API}/produtos`),
          fetchWithAuth(`${API}/funcionarios`),
        ]);

        if (cRes.ok) {
          const raw = await cRes.json();
          setClientes((Array.isArray(raw) ? raw : []).map(normalizarCliente).filter(Boolean) as Cliente[]);
        }
        if (pRes.ok) {
          const raw = await pRes.json();
          setProdutos((Array.isArray(raw) ? raw : []).map(normalizarProduto).filter(Boolean) as Produto[]);
        }
        if (fRes.ok) {
          const raw = await fRes.json();
          // cargo 3 = VENDEDOR
          setVendedores(
            (Array.isArray(raw) ? raw : [])
              .map(normalizarFuncionario)
              .filter((f): f is Funcionario => f !== null && f.cargo === 3)
          );
        }
      } catch (err) {
        showToast("Erro ao carregar dados", "err");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── carrega venda para edição ───────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit || !id) return;
    async function loadVenda() {
      try {
        const res = await fetchWithAuth(`${API}/vendas/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar venda");
        const data = await res.json();
        setClienteId(Number(data.id_cliente) || null);
        setVendedorId(Number(data.id_vendedor ?? data.vendedor_id) || null);
        setItens(data.itens.map((item: any) => ({
          id_produto:    item.id_produto,
          nome_produto:  item.produto_nome ?? item.nome,
          quantidade:    item.quantidade,
          valor_unitario: Number(item.valor_unitario),
          subtotal:      item.quantidade * Number(item.valor_unitario),
        })));
      } catch {
        showToast("Erro ao carregar venda", "err");
      }
    }
    loadVenda();
  }, [isEdit, id]);

  // ── adicionar produto ───────────────────────────────────────────────────────
  function adicionarProduto() {
    if (!produtoSelecionado) { showToast("Selecione um produto", "err"); return; }
    if (quantidade <= 0)     { showToast("Quantidade inválida", "err"); return; }

    const produtoId = Number(produtoSelecionado);
    const produto   = produtos.find(p => p.id === produtoId);
    if (!produto) { showToast("Produto não encontrado", "err"); return; }

    const itemExistente = itens.find(i => i.id_produto === produtoId);
    const novaQtd = (itemExistente?.quantidade ?? 0) + quantidade;

    if (produto.quantidade_estoque < novaQtd) {
      showToast(`Estoque insuficiente. Disponível: ${produto.quantidade_estoque}`, "err");
      return;
    }

    if (itemExistente) {
      setItens(itens.map(i =>
        i.id_produto === produtoId
          ? { ...i, quantidade: novaQtd, subtotal: novaQtd * i.valor_unitario }
          : i
      ));
    } else {
      setItens([...itens, {
        id_produto:    produto.id,
        nome_produto:  produto.nome,
        quantidade,
        valor_unitario: produto.preco_venda,
        subtotal:      quantidade * produto.preco_venda,
      }]);
    }

    setProdutoSelecionado("");
    setQuantidade(1);
    showToast("Produto adicionado!");
  }

  function removerItem(id_produto: number) {
    setItens(itens.filter(i => i.id_produto !== id_produto));
    showToast("Item removido");
  }

  const totalVenda          = itens.reduce((s, i) => s + i.subtotal, 0);
  const clienteSelecionado  = clientes.find(c => c.id === clienteId);
  const vendedorSelecionado = vendedores.find(v => v.id === vendedorId);

  // ── finalizar venda ─────────────────────────────────────────────────────────
  async function finalizarVenda() {
    if (!clienteId)        { showToast("Selecione um cliente", "err"); return; }
    if (!vendedorId)       { showToast("Selecione um vendedor", "err"); return; }
    if (!itens.length)     { showToast("Adicione pelo menos um produto", "err"); return; }

    setSaving(true);
    try {
      const res = await fetchWithAuth(`${API}/vendas`, {
        method: "POST",
        body: JSON.stringify({
          id_cliente:  clienteId,
          id_vendedor: vendedorId,
          itens: itens.map(i => ({
            id_produto:    i.id_produto,
            quantidade:    i.quantidade,
            valor_unitario: i.valor_unitario,
          })),
          valor_total: totalVenda,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao finalizar venda");
      }

      showToast("Venda registrada! Aguardando pagamento.");
      setTimeout(() => navigate("/vendas"), 1500);
    } catch (err: any) {
      showToast(err.message, "err");
    } finally {
      setSaving(false);
    }
  }

  function fmt(value: number) {
    return "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  }

  return (
    <div className="pf-wrapper">
      <Sidebar />

      <div className="pf-page">
        <div className="pf-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="btn btn-back pf-back" onClick={() => navigate("/vendas")}>
              <IconArrow /> <span>Voltar</span>
            </button>
            <div className="pf-title-block">
              <h1>{isEdit ? "Editar Venda" : "Nova Venda"}</h1>
              <p>{isEdit ? "Atualize as informações da venda" : "Registre uma nova venda"}</p>
            </div>
          </div>
        </div>

        <div className="pf-card">
          <div className="pf-card-header">
            <div className="pf-card-icon"><IconCart /></div>
            <div>
              <h2>Registrar Venda</h2>
              <p>Selecione o vendedor, cliente e os produtos</p>
            </div>
          </div>

          {loading ? (
            <div className="pf-loading"><IconClock style={{ width: 16, height: 16, marginRight: 8 }} /> Carregando dados...</div>
          ) : (
            <div className="pf-form">

              {/* Vendedor */}
              <div className="pf-section-title">Vendedor Responsável</div>
              <div className="pf-grid">
                <div className="pf-field pf-full">
                  <label>Selecione o Vendedor *</label>
                  <select
                    value={vendedorId ?? ""}
                    onChange={e => setVendedorId(Number(e.target.value) || null)}
                  >
                    <option value="">-- Selecione um vendedor --</option>
                    {vendedores.length === 0
                      ? <option disabled>Nenhum vendedor encontrado</option>
                      : vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)
                    }
                  </select>
                  {vendedorSelecionado && (
                    <div style={{ marginTop:10, padding:"8px 12px", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:6, fontSize:13, color:"#1e40af" }}>
                      <IconUsers style={{ width: 14, height: 14, marginRight: 6, verticalAlign: "-2px" }} /> Vendedor: <strong>{vendedorSelecionado.nome}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Cliente */}
              <div className="pf-section-title">Cliente</div>
              <div className="pf-grid">
                <div className="pf-field pf-full">
                  <label>Selecione o Cliente *</label>
                  <select
                    value={clienteId ?? ""}
                    onChange={e => setClienteId(Number(e.target.value) || null)}
                  >
                    <option value="">-- Selecione um cliente --</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome}{c.cpf_cnpj ? ` - ${c.cpf_cnpj}` : ""}
                      </option>
                    ))}
                  </select>
                  {clienteSelecionado && (
                    <div style={{ marginTop:10, padding:"8px 12px", background:"#d1fae5", borderRadius:6, fontSize:13, color:"#065f46" }}>
                      <IconCheck style={{ width: 14, height: 14, marginRight: 6, verticalAlign: "-2px" }} /> Cliente: <strong>{clienteSelecionado.nome}</strong>
                      {clienteSelecionado.cpf_cnpj ? ` — ${clienteSelecionado.cpf_cnpj}` : ""}
                    </div>
                  )}
                </div>
              </div>

              {/* Produtos */}
              <div className="pf-section-title">Produtos</div>
              <div className="produtos-row">
                <div className="produto-select">
                  <select value={produtoSelecionado} onChange={e => setProdutoSelecionado(e.target.value)}>
                    <option value="">Selecione um produto</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} - {fmt(p.preco_venda)} (Estoque: {p.quantidade_estoque})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="quantidade-input">
                  <input
                    type="number" min="1" value={quantidade}
                    onChange={e => setQuantidade(Number(e.target.value))}
                    placeholder="Qtd"
                  />
                </div>
                <button className="btn-add" onClick={adicionarProduto} type="button">
                  <IconPlus /> Adicionar
                </button>
              </div>

              {/* Tabela de itens */}
              {itens.length > 0 ? (
                <div className="itens-tabela">
                  <table className="itens-table">
                    <thead>
                      <tr>
                        <th>Produto</th><th>Quantidade</th><th>Valor Unit.</th><th>Subtotal</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map(item => (
                        <tr key={item.id_produto}>
                          <td>{item.nome_produto}</td>
                          <td>{item.quantidade}</td>
                          <td>{fmt(item.valor_unitario)}</td>
                          <td><strong>{fmt(item.subtotal)}</strong></td>
                          <td>
                            <button className="btn-remove" onClick={() => removerItem(item.id_produto)} type="button">
                              <IconTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="total-label">TOTAL</td>
                        <td colSpan={2} className="total-value">{fmt(totalVenda)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="empty-cart">
                  <p>Nenhum produto adicionado.</p>
                  <p>Selecione um produto acima para começar.</p>
                </div>
              )}
            </div>
          )}

          <div className="pf-footer">
            <button className="btn btn-ghost" onClick={() => navigate("/vendas")}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={finalizarVenda}
              disabled={saving || !itens.length || !clienteId || !vendedorId}
            >
              <IconCheck />
              {saving ? "Registrando..." : "Registrar Venda"}
            </button>
          </div>
        </div>
      </div>

      <div className={`toast${toast.visible ? " show" : ""}`}>
        <span className={`toast-dot ${toast.type}`} />
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}