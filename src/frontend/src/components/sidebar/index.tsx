import { useState } from "react";
import "./sidebar.css";
import { Link } from "react-router-dom";

export function Sidebar() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(o => !o)} aria-label="Menu">
        {open ? "✕" : "☰"}
      </button>

      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={close} />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="logo">
          <span className="logo-icon">T</span>
          <span className="logo-text">ToolMaster</span>
        </div>

        <nav className="menu">
          <Link to="/dashboard" onClick={close}>Dashboard</Link>

          <p className="menu-title">Vendas</p>
          <Link to="/clientes" onClick={close}>Clientes</Link>
          <Link to="/vendas" onClick={close}>Vendas</Link>
          <Link to="/orcamentos" onClick={close}>Orçamentos</Link>

          <p className="menu-title">Serviços</p>
          <Link to="/ordens" onClick={close}>Ordens de Serviço</Link>

          <p className="menu-title">Gestão</p>
          <Link to="/produtos" onClick={close}>Produtos</Link>
          <Link to="/fornecedores" onClick={close}>Fornecedores</Link>
          <Link to="/funcionarios" onClick={close}>Funcionários</Link>

          <p className="menu-title">Financeiro</p>
          <Link to="/caixa" onClick={close}>Fluxo de Caixa</Link>
          <Link to="/pagamentos" onClick={close}>Pagamentos</Link>

          <p className="menu-title">Sistema</p>
          <Link to="/usuarios" onClick={close}>Usuários</Link>

          <p className="menu-title">Vitrine</p>
          <Link to="/produtos">Produtos</Link>
        </nav>
      </aside>
    </>
  );
}