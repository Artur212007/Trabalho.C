import { Sidebar } from "../../components/sidebar/";
import "./dashboard.css";

export function Dashboard() {
  return (
    <div className="dashboard-container">

      <Sidebar />

      <main className="dashboard-content">

        <h1>Dashboard</h1>

        <div className="cards">

          <div className="card">
            <h3>Vendas do Dia</h3>
            <p>R$ 2.540</p>
          </div>

          <div className="card">
            <h3>Ordens de Serviço</h3>
            <p>12 abertas</p>
          </div>

          <div className="card">
            <h3>Clientes</h3>
            <p>154 cadastrados</p>
          </div>

          <div className="card">
            <h3>Produtos</h3>
            <p>89 no estoque</p>
          </div>

        </div>

      </main>

    </div>
  );
}