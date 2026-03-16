🛠️ ToolMaster Pro

Sistema de Gerenciamento para Loja de Ferramentas

📌 Sobre o Projeto

O ToolMaster Pro é um sistema web criado para facilitar a gestão de uma loja de ferramentas, reunindo em uma única plataforma as principais funções administrativas e operacionais do negócio.

A proposta do sistema é tornar o dia a dia da loja mais organizado, ágil e eficiente, reduzindo erros e melhorando o controle das informações.

Com ele é possível gerenciar:

🛒 Vendas e orçamentos

📦 Controle de estoque

🔧 Ordens de serviço e assistência técnica

🛡️ Garantias de produtos

💰 Comissões de vendedores

📊 Relatórios gerenciais

🔐 Controle de acesso por tipo de usuário

O sistema foi pensado para oferecer praticidade, segurança e uma experiência simples para quem utiliza.

💻 Tecnologias Utilizadas

O projeto foi desenvolvido utilizando tecnologias modernas e amplamente utilizadas no mercado:

Node.js – Responsável pelo back-end e pelas regras de negócio

React.js – Construção da interface dinâmica e responsiva

MySQL – Armazenamento seguro e estruturado dos dados

👥 Equipe do Projeto:

👨‍💼 Gerente do Projeto:
Artur dos Anjos Xavier
Github:Artur212007

👨‍💻 Desenvolvedor Back-end:
Yago Nascimento Abreu
Github:Morkis-s

🎨 Desenvolvedor Front-end:
Luiz Eduardo Alencar Monteiro
Github:AlencLuiz

🧩 Auxiliar 1:
Elizandro Luiz de Assis
Github:elizandro-luiz

🧩 Auxiliar 2:
Joao Marcos Barahuna Cardozo
Github:jmm237

Ah, entendi! Você quer que a parte de **como rodar o projeto** fique mais desenvolvida e explicada, para que qualquer pessoa consiga seguir o passo a passo sem se perder. Aqui vai uma versão detalhada:

▶️ Como Rodar o Projeto

Para executar o ToolMaster Pro em ambiente de desenvolvimento, siga este guia passo a passo:

 1. 📥 Pré-requisitos
Antes de iniciar, certifique-se de ter instalado:
- Node.js (versão atual recomendada)
- NPM (instalado junto com o Node.js)
- MySQL (para o banco de dados)
- Nodemon (instalado globalmente com npm install -g nodemon)
- XAMPP ou WAMP (se preferir rodar o MySQL com interface gráfica)
- Git (para versionamento e clonagem do projeto)
- Visual Studio Code
 2. 📂 Preparando o Ambiente
1. Clonar o repositório (caso esteja no GitHub):

   bash:
   git clone https://github.com/Artur212007/Trabalho.C.git
   
3. Entrar na pasta do projeto
   bash:
   cd Trabalho.C\src\frontend\teste-conexao
   
4. Instalar dependências:
   bash
   npm install
   Esse comando baixa todas as bibliotecas necessárias (express, mysql2, react, etc.).
   
   
   

 3. 🗄️ Configurando o Banco de Dados
1. Abra o MySQL (Workbench ou terminal).
2. Crie o banco de dados:
   sql
   CREATE DATABASE loja_de_ferramentas;
4. Importe o arquivo .sql do projeto que está dentro da pasta docs para criar as tabelas.

 4. 🚀 Iniciando o Servidor
1. No terminal, execute:
   bash:
   node server.js

 5. 🌐 Acessando o Sistema
1. vá até o Visual Studio Code, dentro da pasta do projeto no vscode abra o terminal que tem dentro do programa e digite npm run dev


 7. 📌 Observação Importante
- Sempre verifique se o banco está rodando antes de iniciar o servidor.
