import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import "../login/login.css";

export function SignUp() {
  return (
    <>
      <div className="container">
        <div className="primary-container">
          <div className="logo-branding">
            <div className="logo-icon">T</div>
            <div className="logo-text">Tool-Master</div>
          </div>
          <h1>Crie sua conta</h1>
          <p>
            Trabalhe com as melhores ferramentas para quase qualquer tipo de serviço.
          </p>
        </div>

        <div className="login-container">
          <div className="login-form">
            <h2>Crie sua conta</h2>
            <p>Preencha os campos para criar sua conta.</p>

            <div className="label">
              <label>Nome</label>
            </div>
            <Input type="text" placeholder="Seu nome completo" />

            <div className="label">
              <label>Email</label>
            </div>
            <Input type="email" placeholder="seuemail@exemplo.com" />

            <div className="label">
              <label>Usuário</label>
            </div>
            <Input type="text" placeholder="Crie um nome de usuário" />

            <div className="label">
              <label>Senha</label>
            </div>
            <Input type="password" placeholder="Crie uma senha forte" />

            <Button type="submit">Criar conta</Button>

            <span>Já tem uma conta? <a href="/">Fazer login</a></span>
          </div>
        </div>
      </div>
    </>
  );
}