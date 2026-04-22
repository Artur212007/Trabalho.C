import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Login }       from "./pages/login";
import { Home }        from "./pages/home/home";
import { SignUp }      from "./pages/sign-up";
import { Dashboard }   from "./pages/dashboard";
import Produtos        from "./pages/produtos/Produtos";
import ProdutoForm     from "./pages/produtos/ProdutoForm";
import Clientes        from "./pages/clientes/Clientes";
import ClienteForm     from "./pages/clientes/ClienteForm";
import Loja            from "./pages/loja/Loja";
import Fornecedores    from "./pages/fornecedores/fornecedores";
import FornecedorForm  from "./pages/fornecedores/FornecedorForm";
import Funcionarios    from "./pages/funcionarios/funcionarios";
import FuncionarioForm from "./pages/funcionarios/FuncionarioForm";
import Vendas          from "./pages/vendas/vendas";
import VendasForm      from "./pages/vendas/VendasForm";
import VendasDetalhes   from "./pages/vendas/VendasDetalhes";
import Ordem         from "./pages/OrdemServico/OrdemServico";
import OrdemForm    from "./pages/OrdemServico/OrdemServicoForm";
import Orcamento       from "./pages/orcamentos/Orcamento";
import OrcamentoForm   from "./pages/orcamentos/OrcamentoForm";
import Caixa      from "./pages/FluxoCaixa/FluxoCaixa";
import CaixaForm   from "./pages/FluxoCaixa/FluxoCaixaForm";
import Pagamentos      from "./pages/Pagamentos/Pagamentos";
import PagamentosForm   from "./pages/Pagamentos/PagamentosForm";
import Movimentacoes      from "./pages/movimentacoes/movimentacoes";
import Despesas      from "./pages/despesas/Despesas";
import DespesasForm   from "./pages/despesas/DespesasForm";
import Usuarios       from "./pages/usuarios/Usuarios";

import "./index.css";

const root = document.getElementById("root");

createRoot(root!).render(
  <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <Routes>
      <Route path="/"                        element={<Login />} />
      <Route path="/home"                    element={<Home />} />
      <Route path="/loja"                    element={<Loja />} />
      <Route path="/sign-up"                 element={<SignUp />} />
      <Route path="/dashboard"               element={<Dashboard />} />
      <Route path="/produtos"                element={<Produtos />} />
      <Route path="/produtos/novo"           element={<ProdutoForm />} />
      <Route path="/produtos/editar/:id"     element={<ProdutoForm />} />
      <Route path="/clientes"                element={<Clientes />} />
      <Route path="/clientes/novo"           element={<ClienteForm />} />
      <Route path="/clientes/editar/:id"     element={<ClienteForm />} />
      <Route path="/fornecedores"            element={<Fornecedores />} />
      <Route path="/fornecedores/novo"       element={<FornecedorForm />} />
      <Route path="/fornecedores/editar/:id" element={<FornecedorForm />} />
      <Route path="/funcionarios"            element={<Funcionarios />} />
      <Route path="/funcionarios/novo"       element={<FuncionarioForm />} />
      <Route path="/funcionarios/editar/:id" element={<FuncionarioForm />} />
      <Route path="/vendas"                  element={<Vendas />} />
      <Route path="/vendas/novo"             element={<VendasForm />} />
      <Route path="/vendas/editar/:id"       element={<VendasForm />} />
      <Route path="/vendas/:id"              element={<VendasDetalhes />} />
      <Route path="/ordem"                   element={<Ordem />} />
      <Route path="/ordem/novo"              element={<OrdemForm />} />
      <Route path="/ordem/editar/:id"        element={<OrdemForm />} />
      <Route path="/orcamentos"              element={<Orcamento />} />
      <Route path="/orcamentos/novo"         element={<OrcamentoForm />} />
      <Route path="/orcamentos/editar/:id"   element={<OrcamentoForm />} />
      <Route path="/caixa"                   element={<Caixa />} />
      <Route path="/caixa/novo"              element={<CaixaForm />} />
      <Route path="/caixa/editar/:id"        element={<CaixaForm />} />
      <Route path="/pagamentos"              element={<Pagamentos />} />
      <Route path="/pagamentos/novo"         element={<PagamentosForm />} />
      <Route path="/pagamentos/editar/:id"   element={<PagamentosForm />} />
      <Route path="/despesas"                element={<Despesas />} />
      <Route path="/despesas/novo"           element={<DespesasForm/>} />
      <Route path="/despesas/editar/:id"     element={<DespesasForm />} />
      <Route path="/movimentacoes"           element={<Movimentacoes/>} />
      <Route path="/usuarios"                element={<Usuarios />} />
    </Routes>
  </BrowserRouter>,
);