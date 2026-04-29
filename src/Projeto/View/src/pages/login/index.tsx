import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { IconAlert } from "../../components/ui/icons";
import "./login.css";

async function autenticarComBackend(usuario: string, senha: string) {
  const response = await fetch("http://localhost:3001/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Credenciais inválidas.");

  localStorage.setItem("token", data.token);
  return data.user;
}

export function Login() {
  const [usuario,    setUsuario]    = useState("");
  const [senha,      setSenha]      = useState("");
  const [erro,       setErro]       = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleLogin() {
    if (!usuario || !senha) {
      setErro("Preencha o usuário e a senha.");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const user = await autenticarComBackend(usuario, senha);
      sessionStorage.setItem("usuario", JSON.stringify(user));

      if (user.tipo === "cliente") {
        navigate("/loja");
        return;
      }

      switch (user.nivel_acesso) {
        case 1: // Admin
        case 2: // Gerente
          navigate("/dashboard");
          break;
        case 3: // Vendedor
          navigate("/vendas");
          break;
        case 4: // Técnico
          navigate("/ordem");
          break;
        case 5: // Caixa
          navigate("/caixa");
          break;
        default:
          navigate("/home");
      }
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="container">
      <div className="primary-container">
        <div className="logo-branding">
          <div className="logo-icon">T</div>
          <div className="logo-text">Tool-Master</div>
        </div>
        <h1>Entre na sua conta</h1>
        <p>Trabalhe com as melhores ferramentas para quase qualquer tipo de serviço.</p>
      </div>

      <div className="login-container">
        <div className="login-form">
          <h2>Bem-vindo de volta</h2>
          <p>Faça o login para continuar sua experiência.</p>

          <div className="label">
            <label>Usuário</label>
          </div>
          <Input
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <div className="label">
            <label>Senha</label>
          </div>
          <Input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {erro && (
            <p style={{
              color: "red",
              fontSize: "13px",
              marginTop: "8px",
              alignSelf: "flex-start",
              width: "100%"
            }}>
              <IconAlert style={{ width: 14, height: 14, marginRight: 6, verticalAlign: "-2px" }} />
              {erro}
            </p>
          )}

          <Button type="button" onClick={handleLogin} disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </Button>

          <span>
            Ainda não tem conta? <a href="/sign-up">Criar conta</a>
          </span>
        </div>
      </div>
    </div>
  );
}