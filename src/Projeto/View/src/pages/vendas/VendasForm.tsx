import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { IconClock, IconAlertCircle, IconBox, IconArrowLeft } from "../../components/icons";
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

const IconCheck = () => <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✅</span>;

const IconPlus = () => <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>➕</span>;

const IconTrash = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>;

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
  const rawId = c.id_cliente ?? c.id ?? c._id ?? c.cliente_id;
  const id = Number(rawId);
  if (!rawId || isNaN(id) || id <= 0) return null;
  return {
    id,
    nome: c.nome ?? c.name ?? "",
    cpf_cnpj: c.cpf_cnpj ?? c.cpf ?? c.cnpj ?? "",
  };
}

function normalizarProduto(p: any): Produto | null {
  const rawId = p.id_produto ?? p.id ?? p._id;
  const id = Number(rawId);
  if (!rawId || isNaN(id) || id <= 0) return null;
  return {
    id,
    nome: p.nome ?? p.name ?? "",
    preco_venda: Number(p.preco_venda ?? p.preco ?? 0),
    quantidade_estoque: Number(p.quantidade_estoque ?? p.estoque ?? 0),
  };
}

function normalizarFuncionario(f: any): Funcionario | null {
  // banco usa id_funcionario como PK e cargo como FK para nivel_acesso
  const rawId = f.id_funcionario ?? f.id ?? f._id;
  const id = Number(rawId);
  if (!rawId || isNaN(id) || id <= 0) return null;
  return {
    id,
    nome: f.nome ?? f.name ?? "",
    cargo: Number(f.cargo ?? f.nivel_acesso ?? f.id_nivel_acesso ?? 0),
  };
}

export default function VendasForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  // Apenas funcionários com cargo = 3 (VENDEDOR)
  const [vendedores, setVendedores] = useState<Funcionario[]>([]);
  const [vendedorId, setVendedorId] = useState<number | null>(null);

  const [clienteId, setClienteId] = useState<number | null>(null);
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("");
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err"; visible: boolean }>({ msg: "", type: "ok", visible: false });

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Clientes
        const clientesRes = await fetchWithAuth(`${API}/clientes`);
        if (clientesRes.ok) {
          const raw = await clientesRes.json();
          const arr: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.clientes ?? [];
          setClientes(arr.map(normalizarCliente).filter((c): c is Cliente => c !== null));
        } else {
          showToast("Erro ao carregar clientes", "err");
        }

        // Produtos
        const produtosRes = await fetchWithAuth(`${API}/produtos`);
        if (produtosRes.ok) {
          const raw = await produtosRes.json();
          const arr: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.produtos ?? [];
          setProdutos(arr.map(normalizarProduto).filter((p): p is Produto => p !== null));
        } else {
          showToast("Erro ao carregar produtos", "err");
        }

        // Funcionários — filtra só cargo = 3 (VENDEDOR) no banco
        const funcRes = await fetchWithAuth(`${API}/funcionarios`);
        if (funcRes.ok) {
          const raw = await funcRes.json();
          const arr: any[] = Array.isArray(raw) ? raw : raw?.data ?? raw?.funcionarios ?? [];
          const todos = arr.map(normalizarFuncionario).filter((f): f is Funcionario => f !== null);
          // cargo = 3 corresponde ao nivel_acesso VENDEDOR no banco
          const apenasVendedores = todos.filter(f => f.cargo === 3);
          setVendedores(apenasVendedores);
        } else {
          showToast("Erro ao carregar vendedores", "err");
        }
      } catch (err) {
        console.error(err);
        showToast("Erro ao carregar dados", "err");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;

    async function loadVenda() {
      try {
        const res = await fetchWithAuth(`${API}/vendas/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar venda");
        const data = await res.json();

        const idCliente = Number(data.id_cliente);
        setClienteId(isNaN(idCliente) ? null : idCliente);

        const idVendedor = Number(data.id_vendedor ?? data.vendedor_id);
        setVendedorId(isNaN(idVendedor) ? null : idVendedor);

        setItens(data.itens.map((item: any) => ({
          id_produto: item.id_produto,
          nome_produto: item.produto_nome ?? item.nome,
          quantidade: item.quantidade,
          valor_unitario: Number(item.valor_unitario),
          subtotal: item.quantidade * Number(item.valor_unitario)
        })));
      } catch (err) {
        console.error(err);
        showToast("Erro ao carregar venda", "err");
      }
    }

    loadVenda();
  }, [isEdit, id]);

  function adicionarProduto() {
    if (!produtoSelecionado) { showToast("Selecione um produto", "err"); return; }
    if (quantidade <= 0) { showToast("Quantidade inválida", "err"); return; }

    const produtoId = Number(produtoSelecionado);
    const produto = produtos.find(p => p.id === produtoId);

    if (!produto) { showToast("Produto não encontrado", "err"); return; }
    if (produto.quantidade_estoque < quantidade) {
      showToast(`Estoque insuficiente. Disponível: ${produto.quantidade_estoque}`, "err");
      return;
    }

    const itemExistente = itens.find(i => i.id_produto === produtoId);

    if (itemExistente) {
      const novaQuantidade = itemExistente.quantidade + quantidade;
      if (produto.quantidade_estoque < novaQuantidade) {
        showToast(`Estoque insuficiente. Disponível: ${produto.quantidade_estoque}`, "err");
        return;
      }
      setItens(itens.map(i =>
        i.id_produto === produtoId
          ? { ...i, quantidade: novaQuantidade, subtotal: novaQuantidade * i.valor_unitario }
          : i
      ));
    } else {
      setItens([...itens, {
        id_produto: produto.id,
        nome_produto: produto.nome,
        quantidade,
        valor_unitario: produto.preco_venda,
        subtotal: quantidade * produto.preco_venda
      }]);
    }

    setProdutoSelecionado("");
    setQuantidade(1);
    showToast("Produto adicionado com sucesso!");
  }

  function removerItem(id_produto: number) {
    setItens(itens.filter(i => i.id_produto !== id_produto));
    showToast("Item removido");
  }

  const totalVenda = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const clienteSelecionado = clientes.find(c => c.id === clienteId);
  const vendedorSelecionado = vendedores.find(v => v.id === vendedorId);
  const clienteIdStr = clienteId !== null ? String(clienteId) : "";
  const vendedorIdStr = vendedorId !== null ? String(vendedorId) : "";

  async function finalizarVenda() {
    if (clienteId === null || isNaN(clienteId) || clienteId <= 0) {
      showToast("Selecione um cliente", "err");
      return;
    }
    if (vendedorId === null || isNaN(vendedorId) || vendedorId <= 0) {
      showToast("Selecione um vendedor", "err");
      return;
    }
    if (itens.length === 0) {
      showToast("Adicione pelo menos um produto", "err");
      return;
    }

    setSaving(true);

    const body = {
      id_cliente: clienteId,
      id_vendedor: vendedorId,
      itens: itens.map(item => ({
        id_produto: item.id_produto,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario
      })),
      valor_total: totalVenda
    };

    try {
      const res = await fetchWithAuth(`${API}/vendas`, {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      showToast("Venda realizada com sucesso!");
      setTimeout(() => navigate("/vendas"), 1500);
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : "Erro ao finalizar venda", "err");
    } finally {
      setSaving(false);
    }
  }

  function formatCurrency(value: number) {
    if (value == null || isNaN(value)) return "R$ 0,00";
    return "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="pf-wrapper">
      <Sidebar />

      <div className="pf-page">
        <div className="pf-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="btn btn-ghost" onClick={() => navigate("/vendas")}>
              <IconArrowLeft /> Voltar
            </button>
            <div className="pf-title-block">
              <h1>{isEdit ? "Editar Venda" : "Nova Venda"}</h1>
              <p>{isEdit ? "Atualize as informações da venda" : "Registre uma nova venda"}</p>
            </div>
          </div>
        </div>

        <div className="pf-card">
          <div className="pf-card-header">
            <div className="pf-card-icon"><IconBox /></div>
            <div>
              <h2>Registrar Venda</h2>
              <p>Selecione o vendedor, cliente e os produtos</p>
            </div>
          </div>

          {loading ? (
            <div className="pf-loading"><IconClock /> Carregando dados...</div>
          ) : (
            <div className="pf-form">

              {/* ── Vendedor ── */}
              <div className="pf-section-title">Vendedor Responsável</div>
              <div className="pf-grid">
                <div className="pf-field pf-full">
                  <label>Selecione o Vendedor *</label>
                  <select
                    value={vendedorIdStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setVendedorId(null);
                      } else {
                        const parsed = Number(val);
                        setVendedorId(isNaN(parsed) ? null : parsed);
                      }
                    }}
                  >
                    <option value="">-- Selecione um vendedor --</option>
                    {vendedores.length === 0 ? (
                      <option disabled value="">Nenhum vendedor encontrado</option>
                    ) : (
                      vendedores.map((v) => (
                        <option key={String(v.id)} value={String(v.id)}>
                          {v.nome}
                        </option>
                      ))
                    )}
                  </select>

                  {vendedorSelecionado && (
                    <div style={{
                      marginTop: "10px",
                      padding: "8px 12px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color: "#1e40af"
                    }}>
                      <IconAlertCircle /> Vendedor: <strong>{vendedorSelecionado.nome}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Cliente ── */}
              <div className="pf-section-title">Cliente</div>
              <div className="pf-grid">
                <div className="pf-field pf-full">
                  <label>Selecione o Cliente *</label>
                  <select
                    value={clienteIdStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setClienteId(null);
                      } else {
                        const parsed = Number(val);
                        setClienteId(isNaN(parsed) ? null : parsed);
                      }
                    }}
                  >
                    <option value="">-- Selecione um cliente --</option>
                    {clientes.map((c) => (
                      <option key={String(c.id)} value={String(c.id)}>
                        {c.nome} {c.cpf_cnpj ? `- ${c.cpf_cnpj}` : ""}
                      </option>
                    ))}
                  </select>

                  {clienteSelecionado && (
                    <div style={{
                      marginTop: "10px",
                      padding: "8px 12px",
                      background: "#d1fae5",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color: "#065f46"
                    }}>
                      <IconAlertCircle /> Cliente: <strong>{clienteSelecionado.nome}</strong>
                      {clienteSelecionado.cpf_cnpj ? ` — ${clienteSelecionado.cpf_cnpj}` : ""}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Produtos ── */}
              <div className="pf-section-title">Produtos</div>
              <div className="produtos-row">
                <div className="produto-select">
                  <select
                    value={produtoSelecionado}
                    onChange={(e) => setProdutoSelecionado(e.target.value)}
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map((p) => (
                      <option key={String(p.id)} value={String(p.id)}>
                        {p.nome} - {formatCurrency(p.preco_venda)} (Estoque: {p.quantidade_estoque})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="quantidade-input">
                  <input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={e => setQuantidade(Number(e.target.value))}
                    placeholder="Qtd"
                  />
                </div>

                <button className="btn-add" onClick={adicionarProduto} type="button">
                  <IconPlus /> Adicionar
                </button>
              </div>

              {/* ── Tabela de itens ── */}
              {itens.length > 0 && (
                <div className="itens-tabela">
                  <table className="itens-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Valor Unit.</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map(item => (
                        <tr key={item.id_produto}>
                          <td>{item.nome_produto}</td>
                          <td>{item.quantidade}</td>
                          <td>{formatCurrency(item.valor_unitario)}</td>
                          <td><strong>{formatCurrency(item.subtotal)}</strong></td>
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
                        <td colSpan={2} className="total-value">{formatCurrency(totalVenda)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {itens.length === 0 && (
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
              disabled={saving || itens.length === 0 || clienteId === null || vendedorId === null}
            >
              <IconCheck />
              {saving ? "Finalizando..." : "Finalizar Venda"}
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