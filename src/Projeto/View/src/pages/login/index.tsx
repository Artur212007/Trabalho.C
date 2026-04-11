import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { IconAlertCircle } from "../../components/icons";
import "./login.css";

const IconEye = () => <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>👁️</span>;

const IconEyeOff = () => <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🚫</span>;

async function autenticarComBackend(usuario: string, senha: string) {
  const response = await fetch("http://localhost:3001/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha }),
  });
  
  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "Credenciais inválidas.");

  // 🔐 SALVA TOKEN AQUI
  localStorage.setItem("token", data.token);

  // retorna o usuário
  return data.user;
}

export function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostraSenha, setMostraSenha] = useState(false);
  const [erro, setErro] = useState("");
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
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <div className="container">
        <div className="primary-container">
          <div className="logo-branding">
            <div className="logo-icon">T</div>
            <div className="logo-text">Tool-Master</div>
          </div>
          <h1>Entre na sua conta</h1>
          <p>
            Trabalhe com as melhores ferramentas para quase qualquer tipo de serviço.
          </p>
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
              maxLength={50}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            <div className="label">
              <label>Senha</label>
            </div>
            <div className="password-input-wrapper">
              <Input
                type={mostraSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                maxLength={50}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                className="toggle-senha"
                onClick={() => setMostraSenha(!mostraSenha)}
                title={mostraSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostraSenha ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>

            {erro && (
              <p style={{
                color: "red",
                fontSize: "13px",
                marginTop: "8px",
                alignSelf: "flex-start",
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <IconAlertCircle /> {erro}
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
    </>
  );
}