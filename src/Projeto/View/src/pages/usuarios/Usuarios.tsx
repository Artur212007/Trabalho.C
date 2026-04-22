import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/sidebar";
import { IconAlert, IconCard, IconCheck, IconClock, IconMoney, IconTool, IconUsers } from "../../components/ui/icons";
import "./Usuarios.css";

type SessionUser = {
  id?: number;
  usuario?: string;
  nivel_acesso?: number;
  tipo?: string;
  nome?: string;
};

function safeParseSessionUser(): SessionUser | null {
  const raw = sessionStorage.getItem("usuario");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function getInitials(value?: string) {
  if (!value) return "U";
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

function getPerfilLabel(tipo?: string) {
  if (tipo === "cliente") return "Cliente";
  if (tipo === "usuario") return "Usuário interno";
  return "Usuário";
}

export default function Usuarios() {
  const navigate = useNavigate();
  const usuario = useMemo(() => safeParseSessionUser(), []);

  const nomeExibicao = usuario?.nome || usuario?.usuario || "Usuário";
  const perfil = getPerfilLabel(usuario?.tipo);
  const nivel = usuario?.nivel_acesso ?? 0;
  const initials = getInitials(nomeExibicao);

  const accessCards = [
    { label: "Sessão ativa", value: usuario ? "Conectado" : "Desconhecida", icon: <IconCheck />, tone: "good" },
    { label: "Tipo de acesso", value: perfil, icon: <IconUsers />, tone: "blue" },
    { label: "Nível", value: nivel ? `Nível ${nivel}` : "Não informado", icon: <IconCard />, tone: "violet" },
    { label: "Hoje", value: new Date().toLocaleDateString("pt-BR"), icon: <IconClock />, tone: "gold" },
  ];

  return (
    <div className="usuarios-wrapper">
      <Sidebar />

      <div className="usuarios-page">
        <header className="u-topbar">
          <div className="u-title-block">
            <span className="u-chip">Perfil e acesso</span>
            <h1>Usuários</h1>
            <p>Visualize sua conta, nível de acesso e atalhos do sistema em um painel mais limpo e moderno.</p>
          </div>

          <div className="u-topbar-actions">
            <button className="btn btn-back" onClick={() => navigate(-1)}>Voltar</button>
            <Link className="btn btn-primary" to="/dashboard">Ir ao dashboard</Link>
          </div>
        </header>

        <div className="u-content">
          <section className="u-hero-card">
            <div className="u-avatar-panel">
              <div className="u-avatar">{initials}</div>
              <div>
                <p className="u-kicker">Conta atual</p>
                <h2>{nomeExibicao}</h2>
                <p className="u-muted">{perfil} · {usuario?.usuario ? `@${usuario.usuario}` : "Sem login identificado"}</p>
              </div>
            </div>

            <div className="u-hero-meta">
              <span className="u-badge good">Sessão ativa</span>
              <span className="u-badge">Acesso protegido</span>
              <span className="u-badge">Design moderno</span>
            </div>
          </section>

          <section className="u-grid">
            {accessCards.map(card => (
              <article key={card.label} className={`u-stat-card ${card.tone}`}>
                <div className="u-stat-icon">{card.icon}</div>
                <div>
                  <p>{card.label}</p>
                  <strong>{card.value}</strong>
                </div>
              </article>
            ))}
          </section>

          <section className="u-main-grid">
            <article className="u-panel">
              <div className="u-panel-header">
                <div>
                  <h3>Dados da conta</h3>
                  <p>Informações capturadas da sessão atual.</p>
                </div>
                <IconUsers />
              </div>

              <div className="u-info-list">
                <div className="u-info-row">
                  <span>Nome</span>
                  <strong>{nomeExibicao}</strong>
                </div>
                <div className="u-info-row">
                  <span>Usuário</span>
                  <strong>{usuario?.usuario || "—"}</strong>
                </div>
                <div className="u-info-row">
                  <span>Tipo</span>
                  <strong>{perfil}</strong>
                </div>
                <div className="u-info-row">
                  <span>Nível de acesso</span>
                  <strong>{nivel ? `Nível ${nivel}` : "—"}</strong>
                </div>
              </div>
            </article>

            <article className="u-panel u-panel-accent">
              <div className="u-panel-header">
                <div>
                  <h3>Atalhos rápidos</h3>
                  <p>Acesse os módulos mais usados com um clique.</p>
                </div>
                <IconTool />
              </div>

              <div className="u-shortcuts">
                <Link to="/clientes" className="u-shortcut">
                  <IconUsers />
                  <div>
                    <strong>Clientes</strong>
                    <span>Cadastro e gestão</span>
                  </div>
                </Link>

                <Link to="/vendas" className="u-shortcut">
                  <IconMoney />
                  <div>
                    <strong>Vendas</strong>
                    <span>Pedidos e detalhes</span>
                  </div>
                </Link>

                <Link to="/caixa" className="u-shortcut">
                  <IconCard />
                  <div>
                    <strong>Fluxo de caixa</strong>
                    <span>Entradas e saídas</span>
                  </div>
                </Link>

                <Link to="/ordem" className="u-shortcut">
                  <IconTool />
                  <div>
                    <strong>Ordens de serviço</strong>
                    <span>Acompanhamento</span>
                  </div>
                </Link>
              </div>
            </article>
          </section>

          <section className="u-footer-card">
            <div className="u-footer-copy">
              <div className="u-footer-icon"><IconAlert /></div>
              <div>
                <h3>Próximo passo recomendado</h3>
                <p>Se quiser um sistema ainda mais consistente, posso aplicar esse mesmo padrão visual aos formulários restantes.</p>
              </div>
            </div>
            <button className="btn btn-back" onClick={() => navigate("/dashboard")}>Voltar</button>
          </section>
        </div>
      </div>
    </div>
  );
}