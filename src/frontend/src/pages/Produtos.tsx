import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/sidebar/";

const API = "http://localhost:3001";

type Tipo = 1 | 2 | 3;

interface Produto {
  id: number;
  nome: string;
  tipo: Tipo;
  preco_custo: number;
  preco_venda: number;
  quantidade_estoque: number;
  estoque_minimo: number;
  garantia: number;
  id_fornecedor: number;
}

const TIPOS: Record<Tipo, string> = { 1: "Ferramenta", 2: "Peça", 3: "Acessório" };

function fmt(v: number) {
  return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getStatus(p: Produto): { label: string; cls: string } {
  if (p.quantidade_estoque <= 0)                      return { label: "Sem estoque", cls: "badge-low" };
  if (p.quantidade_estoque <= p.estoque_minimo)       return { label: "Crítico",     cls: "badge-low" };
  if (p.quantidade_estoque <= p.estoque_minimo * 1.5) return { label: "Baixo",       cls: "badge-warn" };
  return { label: "OK", cls: "badge-ok" };
}

const IconPlus   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash  = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconSearch = () => <svg width="14" height="14" fill="none" stroke="#71797E" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconDown   = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err"; visible: boolean }>({ msg: "", type: "ok", visible: false });
  function show(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }
  return { toast, show };
}

function ConfirmDialog({ open, nomeProduto, onConfirm, onClose }: { open: boolean; nomeProduto: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className={`modal-overlay${open ? " open" : ""}`} onClick={e => { if ((e.target as HTMLElement).classList.contains("modal-overlay")) onClose(); }}>
      <div className="confirm-modal">
        <div className="danger-icon">🗑️</div>
        <h3>Excluir produto?</h3>
        <p>"{nomeProduto}" será removido permanentemente.</p>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Sim, excluir</button>
        </div>
      </div>
    </div>
  );
}

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos]     = useState<Produto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [confirmId, setConfirmId]   = useState<number | null>(null);
  const { toast, show: showToast }  = useToast();

  async function fetchProdutos() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/produtos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProdutos(data.map((p: any) => ({
        id:                 p.id_produto,
        nome:               p.nome,
        tipo:               p.tipo as Tipo,
        preco_custo:        p.preco_custo / 100,
        preco_venda:        p.preco_venda / 100,
        quantidade_estoque: p.quantidade_estoque,
        estoque_minimo:     p.estoque_minimo,
        garantia:           p.garantia,
        id_fornecedor:      p.id_fornecedor,
      })));
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar produtos. Verifique o backend.", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProdutos(); }, []);

  const stats = useMemo(() => ({
    total:        produtos.length,
    criticos:     produtos.filter(p => p.quantidade_estoque <= p.estoque_minimo).length,
    valor:        produtos.reduce((s, p) => s + p.preco_venda * p.quantidade_estoque, 0),
    fornecedores: new Set(produtos.map(p => p.id_fornecedor)).size,
  }), [produtos]);

  const lista = useMemo(() =>
    produtos.filter(p => {
      const q = search.toLowerCase();
      return (p.nome.toLowerCase().includes(q) || String(p.id).includes(q))
        && (!filterTipo || String(p.tipo) === filterTipo);
    }), [produtos, search, filterTipo]);

  async function deleteProduct() {
    try {
      const res = await fetch(`${API}/produtos/${confirmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setConfirmId(null);
      showToast("Produto excluído.");
      fetchProdutos();
    } catch (err) {
      console.error(err);
      showToast("Erro ao excluir produto.", "err");
    }
  }

  function exportCSV() {
    const headers = ["ID","Nome","Tipo","Preço Custo","Preço Venda","Estoque","Est. Mínimo","Garantia","Fornecedor"];
    const rows    = produtos.map(p => [p.id, p.nome, TIPOS[p.tipo], p.preco_custo, p.preco_venda, p.quantidade_estoque, p.estoque_minimo, p.garantia, p.id_fornecedor]);
    const csv     = [headers, ...rows].map(r => r.join(";")).join("\n");
    const a       = document.createElement("a");
    a.href        = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download    = "produtos.csv";
    a.click();
    showToast("CSV exportado!");
  }

  const confirmProduto = produtos.find(p => p.id === confirmId);

  return (
    <div className="produtos-wrapper">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .produtos-wrapper { display:flex;width:100%;height:100vh;overflow:hidden; }
        .produtos-page { display:flex;flex-direction:column;flex:1;height:100vh;overflow:hidden;background:var(--bg,#F5F5F5);font-family:'Poppins',sans-serif; }
        .p-topbar { background:#fff;border-bottom:1px solid rgba(0,0,0,.09);padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0; }
        .p-topbar-title { font-size:18px;font-weight:700;display:flex;align-items:center;gap:10px; }
        .p-topbar-title span { background:var(--primary,#FFD100);color:#000;font-size:10px;font-weight:700;letter-spacing:.8px;padding:3px 8px;border-radius:20px;text-transform:uppercase; }
        .p-topbar-actions { display:flex;align-items:center;gap:10px; }
        .p-content { flex:1;overflow-y:auto;padding:28px 32px; }
        .stats-row { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px; }
        .stat-card { background:#fff;border-radius:14px;border:1px solid rgba(0,0,0,.09);padding:20px;display:flex;align-items:center;gap:14px;animation:fadeUp .4s ease both; }
        .stat-card:nth-child(1){animation-delay:.05s}.stat-card:nth-child(2){animation-delay:.10s}.stat-card:nth-child(3){animation-delay:.15s}.stat-card:nth-child(4){animation-delay:.20s}
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .stat-icon { width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0; }
        .si-yellow{background:#fff7cc}.si-red{background:#ffe4dd}.si-green{background:#d4f5e5}.si-blue{background:#ddf0ff}
        .stat-info p{font-size:11px;color:#71797E;font-weight:500}.stat-info strong{font-size:22px;font-weight:700;line-height:1.1}
        .table-card{background:#fff;border-radius:14px;border:1px solid rgba(0,0,0,.09);overflow:hidden;animation:fadeUp .4s ease .25s both;}
        .table-header{padding:18px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(0,0,0,.09);flex-wrap:wrap;gap:12px;}
        .table-header h3{font-size:15px;font-weight:700}.table-header-right{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
        .search-bar{display:flex;align-items:center;gap:8px;background:var(--bg,#F5F5F5);border:1px solid rgba(0,0,0,.09);border-radius:8px;padding:0 12px;height:36px;}
        .search-bar input{border:none;background:transparent;font-family:'Poppins',sans-serif;font-size:13px;color:#1A1A1A;width:180px;outline:none;}
        .search-bar input::placeholder{color:#71797E}
        .filter-select{height:36px;border-radius:8px;border:1px solid rgba(0,0,0,.09);background:var(--bg,#F5F5F5);font-family:'Poppins',sans-serif;font-size:13px;padding:0 10px;color:#1A1A1A;outline:none;cursor:pointer;}
        table{width:100%;border-collapse:collapse}
        thead th{text-align:left;font-size:11px;font-weight:600;color:#71797E;letter-spacing:.6px;text-transform:uppercase;padding:12px 24px;background:#fafafa;border-bottom:1px solid rgba(0,0,0,.09);}
        tbody tr{border-bottom:1px solid rgba(0,0,0,.06);transition:background .15s;}
        tbody tr:last-child{border-bottom:none}tbody tr:hover{background:#fafafa}
        tbody td{padding:14px 24px;font-size:13px}
        .td-nome{font-weight:600}.td-id{color:#71797E;font-size:12px}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
        .badge-low{background:#ffe4dd;color:#c43500}.badge-ok{background:#d4f5e5;color:#0a7a3e}.badge-warn{background:#fff3cc;color:#8a6500}
        .row-actions{display:flex;gap:6px}
        .icon-btn{width:30px;height:30px;border-radius:8px;border:1.5px solid rgba(0,0,0,.09);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;color:#71797E;}
        .icon-btn.edit:hover{border-color:var(--primary,#FFD100);background:#fff7cc;color:#7a5f00}
        .icon-btn.del:hover{border-color:#FF4500;background:#ffe4dd;color:#FF4500}
        .empty-state{text-align:center;padding:60px 0;color:#71797E;}
        .empty-state .big-icon{font-size:40px;margin-bottom:12px}.empty-state p{font-size:14px;line-height:1.6}
        .btn{cursor:pointer;border:none;border-radius:calc(infinity * 1px);font-family:'Poppins',sans-serif;font-weight:600;font-size:13px;padding:0 18px;height:36px;display:flex;align-items:center;gap:7px;transition:all .2s;}
        .btn-primary{background:var(--primary,#FFD100);color:#000}.btn-primary:hover{filter:brightness(.93);transform:translateY(-1px)}
        .btn-ghost{background:transparent;color:#71797E;border:1.5px solid rgba(0,0,0,.09);}.btn-ghost:hover{border-color:#1A1A1A;color:#1A1A1A}
        .btn-danger{background:#FF4500;color:#fff}.btn-danger:hover{background:#e03d00}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:100;opacity:0;pointer-events:none;transition:opacity .2s;}
        .modal-overlay.open{opacity:1;pointer-events:all}
        .confirm-modal{background:#fff;border-radius:16px;width:360px;padding:28px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.18);transform:scale(.95);transition:transform .2s;}
        .modal-overlay.open .confirm-modal{transform:scale(1)}
        .danger-icon{font-size:36px;margin-bottom:12px}.confirm-modal h3{font-size:16px;margin-bottom:8px}
        .confirm-modal p{font-size:13px;color:#71797E;margin-bottom:24px;line-height:1.5}
        .confirm-actions{display:flex;gap:10px;justify-content:center}
        .toast{position:fixed;bottom:24px;right:24px;background:var(--secondary,#1A1A1A);color:#fff;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:500;display:flex;align-items:center;gap:10px;transform:translateY(80px);opacity:0;transition:all .3s ease;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.2);pointer-events:none;}
        .toast.show{transform:translateY(0);opacity:1}
        .toast-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}.toast-dot.ok{background:#FFD100}.toast-dot.err{background:#FF4500}
        .p-content::-webkit-scrollbar{width:6px}.p-content::-webkit-scrollbar-track{background:transparent}.p-content::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}

        @media (max-width: 900px) {
          .p-topbar{padding:0 16px 0 64px;height:56px;}
          .p-topbar-title{font-size:15px;}
          .p-content{padding:16px;}
          .stats-row{grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px;}
          .stat-card{padding:14px;gap:10px;}
          .stat-icon{width:36px;height:36px;font-size:16px;}
          .stat-info strong{font-size:18px;}
          .table-header{padding:14px 16px;}
          thead th,tbody td{padding:10px 14px;}
        }

        @media (max-width: 600px) {
          .p-topbar-title span{display:none;}
          .p-topbar-actions .btn-ghost{display:none;}
          .stats-row{grid-template-columns:repeat(2,1fr);}
          .stat-info strong{font-size:16px;}
          .search-bar input{width:120px;}
          .table-card{border-radius:10px;overflow-x:auto;}
          table{min-width:620px;}
          .p-content{padding:12px;}
        }

        @media (max-width: 400px) {
          .stats-row{grid-template-columns:1fr 1fr;}
          .p-topbar{padding:0 12px;}
          .p-content{padding:10px;}
        }
      `}</style>

      <Sidebar />
      <div className="produtos-page">
        <header className="p-topbar">
          <div className="p-topbar-title">Produtos <span>Vitrine</span></div>
          <div className="p-topbar-actions">
            <button className="btn btn-ghost" onClick={exportCSV}><IconDown /> Exportar</button>
            <button className="btn btn-primary" onClick={() => navigate("/produtos/novo")}>
              <IconPlus /> Novo Produto
            </button>
          </div>
        </header>

        <div className="p-content">
          <div className="stats-row">
            <div className="stat-card"><div className="stat-icon si-yellow">📦</div><div className="stat-info"><p>Total de Produtos</p><strong>{stats.total}</strong></div></div>
            <div className="stat-card"><div className="stat-icon si-red">⚠️</div><div className="stat-info"><p>Estoque Crítico</p><strong>{stats.criticos}</strong></div></div>
            <div className="stat-card"><div className="stat-icon si-green">💰</div><div className="stat-info"><p>Valor em Estoque</p><strong>{"R$ " + stats.valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong></div></div>
            <div className="stat-card"><div className="stat-icon si-blue">🏭</div><div className="stat-info"><p>Fornecedores</p><strong>{stats.fornecedores}</strong></div></div>
          </div>

          <div className="table-card">
            <div className="table-header">
              <h3>Cadastro de Produtos</h3>
              <div className="table-header-right">
                <div className="search-bar">
                  <IconSearch />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." />
                </div>
                <select className="filter-select" value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
                  <option value="">Todos os tipos</option>
                  <option value="1">Ferramenta</option>
                  <option value="2">Peça</option>
                  <option value="3">Acessório</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="empty-state"><div className="big-icon">⏳</div><p>Carregando produtos...</p></div>
            ) : lista.length === 0 ? (
              <div className="empty-state">
                <div className="big-icon">📦</div>
                <p>Nenhum produto encontrado.<br />Clique em <strong>Novo Produto</strong> para cadastrar.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Produto</th><th>Tipo</th>
                    <th>Preço Custo</th><th>Preço Venda</th>
                    <th>Estoque</th><th>Est. Mínimo</th><th>Garantia</th>
                    <th>Status</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map(p => {
                    const st = getStatus(p);
                    return (
                      <tr key={p.id}>
                        <td className="td-id">#{p.id}</td>
                        <td className="td-nome">{p.nome}</td>
                        <td>{TIPOS[p.tipo]}</td>
                        <td>{fmt(p.preco_custo)}</td>
                        <td><strong>{fmt(p.preco_venda)}</strong></td>
                        <td>{p.quantidade_estoque}</td>
                        <td>{p.estoque_minimo}</td>
                        <td>{p.garantia > 0 ? `${p.garantia} m` : "—"}</td>
                        <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                        <td>
                          <div className="row-actions">
                            <button className="icon-btn edit" title="Editar" onClick={() => navigate(`/produtos/editar/${p.id}`)}>
                              <IconEdit />
                            </button>
                            <button className="icon-btn del" title="Excluir" onClick={() => setConfirmId(p.id)}>
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        nomeProduto={confirmProduto?.nome ?? ""}
        onConfirm={deleteProduct}
        onClose={() => setConfirmId(null)}
      />

      <div className={`toast${toast.visible ? " show" : ""}`}>
        <span className={`toast-dot ${toast.type}`} />
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}