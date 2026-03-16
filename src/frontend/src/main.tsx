import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Login }     from "./pages/login";
import { Home }      from "./pages/home/home";
import { SignUp }    from "./pages/sign-up";
import { Dashboard } from "./pages/dashboard";
import Produtos      from "./pages/Produtos";
import ProdutoForm   from "./pages/produtos/ProdutoForm";

import "./index.css";

const root = document.getElementById("root");

createRoot(root!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/"                        element={<Login />} />
      <Route path="/home"                    element={<Home />} />
      <Route path="/sign-up"                 element={<SignUp />} />
      <Route path="/dashboard"               element={<Dashboard />} />
      <Route path="/produtos"                element={<Produtos />} />
      <Route path="/produtos/novo"           element={<ProdutoForm />} />
      <Route path="/produtos/editar/:id"     element={<ProdutoForm />} />
    </Routes>
  </BrowserRouter>,
);
