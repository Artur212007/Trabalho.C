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
       <Route path="/vendas"                 element={<Vendas />} />
      <Route path="/vendas/novo"             element={<VendasForm />} />
      <Route path="/vendas/editar/:id"       element={<VendasForm />} />
    </Routes>
  </BrowserRouter>,
);
