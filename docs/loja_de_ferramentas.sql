-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 12/03/2026 às 04:20
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `loja_de_ferramentas`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `caixa`
--

CREATE TABLE `caixa` (
  `id_caixa` int(11) NOT NULL,
  `data` datetime NOT NULL,
  `valor_abertura` int(11) NOT NULL,
  `valor_fechamento` int(11) NOT NULL,
  `saldo` int(11) NOT NULL,
  `id_funcionario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `caixa`
--

INSERT INTO `caixa` (`id_caixa`, `data`, `valor_abertura`, `valor_fechamento`, `saldo`, `id_funcionario`) VALUES
(1, '2026-01-10 08:00:00', 50000, 200000, 150000, 6),
(2, '2026-01-15 08:00:00', 50000, 120000, 70000, 6),
(3, '2026-01-20 08:00:00', 50000, 180000, 130000, 6),
(4, '2026-02-02 08:00:00', 50000, 90000, 40000, 6),
(5, '2026-02-10 08:00:00', 50000, 150000, 100000, 6),
(6, '2026-02-18 08:00:00', 50000, 130000, 80000, 6),
(7, '2026-03-01 08:00:00', 50000, 100000, 50000, 6),
(8, '2026-03-05 08:00:00', 50000, 80000, 30000, 6);

-- --------------------------------------------------------

--
-- Estrutura para tabela `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `cpf_cnpj` varchar(18) NOT NULL,
  `telefone` char(13) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `endereço` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `nome`, `cpf_cnpj`, `telefone`, `email`, `endereço`, `ativo`) VALUES
(1, 'João Pedro Cavalcante', '123.456.789-01', '8591110001', 'joao.pedro@email.com', 'Rua das Flores, 10 - Fortaleza/CE', 1),
(2, 'Maria Luiza Andrade', '234.567.890-12', '8592220002', 'maria.luiza@email.com', 'Av. Bezerra de Menezes, 500 - Fortaleza', 1),
(3, 'Construtora Nordeste Ltda', '12.345.678/0001-90', '8533330003', 'compras@constnordeste.com', 'Rua XV de Novembro, 88 - Fortaleza/CE', 1),
(4, 'Pedro Henrique Barros', '345.678.901-23', '8594440004', 'pedrobarros@email.com', 'Rua Tibúrcio Cavalcante, 12 - Fortaleza', 1),
(5, 'Oficina Irmãos Silva', '98.765.432/0001-10', '8595550005', 'oficina.silva@email.com', 'Av. Sargento Hermínio, 200 - Maracanaú', 1),
(6, 'Letícia Moura Pinto', '456.789.012-34', '8596660006', 'leticia.moura@email.com', 'Rua Pereira Filgueiras, 34 - Fortaleza', 1),
(7, 'Antônio Carlos Feitosa', '567.890.123-45', '8597770007', 'acfeitosa@email.com', 'Rua Major Facundo, 90 - Fortaleza/CE', 1),
(8, 'Elétrica Fonseca ME', '11.222.333/0001-44', '8598880008', 'eletricafonseca@email.com', 'Av. João Pessoa, 310 - Caucaia/CE', 1),
(9, 'Roberta Sampaio Leal', '678.901.234-56', '8599990009', 'roberta.leal@email.com', 'Rua Osvaldo Cruz, 78 - Fortaleza/CE', 1),
(10, 'Marcelo Augusto Teixeira', '789.012.345-67', '8500010010', 'marcelo.teixeira@email.com', 'Rua 24 de Maio, 55 - Fortaleza/CE', 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `fornecedor`
--

CREATE TABLE `fornecedor` (
  `id_fornecedor` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `telefone` char(11) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `endereco` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `fornecedor`
--

INSERT INTO `fornecedor` (`id_fornecedor`, `nome`, `telefone`, `email`, `endereco`) VALUES
(1, 'Ferramentas Alfa Ltda', '85999110001', 'contato@alfaferr.com.br', 'Rua das Indústrias, 100 - Fortaleza/CE'),
(2, 'Distribuidora Beta Tools', '85988220002', 'vendas@betatools.com.br', 'Av. Industrial, 250 - Maracanaú/CE'),
(3, 'Supremax Equipamentos', '85977330003', 'comercial@supremax.com.br', 'Rua Paraná, 45 - Caucaia/CE'),
(4, 'Mega Suprimentos S/A', '85966440004', 'pedidos@megasuprimentos.com', 'Av. dos Comerciantes, 800 - Fortaleza/CE'),
(5, 'TechFerr Indústria e Comércio', '85955550005', 'ti@techferr.com.br', 'Rua Piauí, 30 - Eusébio/CE');

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionario`
--

CREATE TABLE `funcionario` (
  `id_funcionario` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `cargo` varchar(150) NOT NULL,
  `salario` decimal(10,2) NOT NULL,
  `percentual_comissao` decimal(5,2) DEFAULT 0.00,
  `ativo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `funcionario`
--

INSERT INTO `funcionario` (`id_funcionario`, `nome`, `cargo`, `salario`, `percentual_comissao`, `ativo`) VALUES
(1, 'Carlos Eduardo Lima', 'Gerente', 4500.00, 2.00, 1),
(2, 'Ana Paula Sousa', 'Vendedor', 2200.00, 5.00, 1),
(3, 'Marcos Vinícius Rocha', 'Vendedor', 2200.00, 5.00, 1),
(4, 'Fernanda Costa Melo', 'Técnico', 2800.00, 0.00, 1),
(5, 'Ricardo Alves Neto', 'Técnico', 2800.00, 0.00, 1),
(6, 'Juliana Ferreira Lima', 'Caixa', 1900.00, 0.00, 1),
(7, 'Bruno Henrique Dias', 'Vendedor', 2200.00, 5.00, 0),
(8, 'Patrícia Nascimento', 'Administrativo', 2500.00, 0.00, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `item_da_venda`
--

CREATE TABLE `item_da_venda` (
  `id_item_venda` int(11) NOT NULL,
  `id_venda` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `id_quantidade` int(11) NOT NULL,
  `valor_unitario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `item_da_venda`
--

INSERT INTO `item_da_venda` (`id_item_venda`, `id_venda`, `id_produto`, `id_quantidade`, `valor_unitario`) VALUES
(1, 1, 1, 2, 45000),
(2, 1, 7, 3, 3200),
(3, 1, 8, 5, 1800),
(4, 2, 1, 1, 45000),
(5, 3, 6, 1, 58000),
(6, 3, 12, 2, 7500),
(7, 3, 9, 1, 1600),
(8, 4, 3, 2, 4500),
(9, 4, 4, 1, 5900),
(10, 5, 6, 1, 58000),
(11, 6, 5, 1, 38000),
(12, 7, 2, 1, 29900),
(13, 8, 11, 1, 32000),
(14, 8, 12, 2, 7500);

-- --------------------------------------------------------

--
-- Estrutura para tabela `item_venda`
--

CREATE TABLE `item_venda` (
  `id_item_venda` int(11) NOT NULL,
  `id_venda` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Despejando dados para a tabela `item_venda`
--

INSERT INTO `item_venda` (`id_item_venda`, `id_venda`, `id_produto`, `quantidade`, `valor_unitario`) VALUES
(1, 1, 1, 2, 45000.00),
(2, 1, 7, 3, 3200.00),
(3, 1, 8, 5, 1800.00),
(4, 2, 1, 1, 45000.00),
(5, 3, 6, 1, 58000.00),
(6, 3, 12, 2, 7500.00),
(7, 3, 9, 1, 1600.00),
(8, 4, 3, 2, 4500.00),
(9, 4, 4, 1, 5900.00),
(10, 5, 6, 1, 58000.00),
(11, 6, 5, 1, 38000.00),
(12, 7, 2, 1, 29900.00),
(13, 8, 11, 1, 32000.00),
(14, 8, 12, 2, 7500.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `nivel_acesso`
--

CREATE TABLE `nivel_acesso` (
  `id_nivel_acesso` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `nivel_acesso`
--

INSERT INTO `nivel_acesso` (`id_nivel_acesso`, `nome`) VALUES
(1, 'ADMIN'),
(2, 'GERENTE'),
(3, 'VENDEDOR'),
(4, 'TECNICO'),
(5, 'CAIXA');

-- --------------------------------------------------------

--
-- Estrutura para tabela `orcamento`
--

CREATE TABLE `orcamento` (
  `id_orcamento` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `valor_total` int(11) NOT NULL,
  `data` datetime DEFAULT NULL,
  `validade` date NOT NULL,
  `status` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `orcamento`
--

INSERT INTO `orcamento` (`id_orcamento`, `id_cliente`, `valor_total`, `data`, `validade`, `status`) VALUES
(1, 3, 250000, '2026-01-08 10:00:00', '2026-01-22', 1),
(2, 5, 116000, '2026-01-18 11:30:00', '2026-02-01', 1),
(3, 8, 190000, '2026-02-05 09:00:00', '2026-02-19', 1),
(4, 1, 45000, '2026-02-14 15:00:00', '2026-02-28', 0),
(5, 7, 98000, '2026-03-01 10:30:00', '2026-03-15', 0),
(6, 2, 62000, '2026-03-06 14:00:00', '2026-03-20', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `ordem_servico`
--

CREATE TABLE `ordem_servico` (
  `id_ordem_servico` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `descricao_problema` varchar(150) NOT NULL,
  `estado_equipamento` varchar(20) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `data_abertura` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `ordem_servico`
--

INSERT INTO `ordem_servico` (`id_ordem_servico`, `id_cliente`, `id_tecnico`, `descricao_problema`, `estado_equipamento`, `status`, `data_abertura`) VALUES
(1, 5, 4, 'Furadeira não liga, possível problema no motor', 'Danificado', 0, '2026-01-12 09:00:00'),
(2, 1, 5, 'Esmerilhadeira com vibração excessiva', 'Usado', 1, '2026-01-22 10:30:00'),
(3, 8, 4, 'Serra circular travando durante o corte', 'Danificado', 0, '2026-02-03 11:00:00'),
(4, 3, 5, 'Parafusadeira com bateria viciada', 'Desgastado', 1, '2026-02-15 14:00:00'),
(5, 9, 4, 'Nível a laser sem precisão, descalibrado', 'Danificado', 0, '2026-03-02 09:30:00'),
(6, 7, 5, 'Furadeira com cheiro de queimado', 'Danificado', 0, '2026-03-07 16:00:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `produto`
--

CREATE TABLE `produto` (
  `id_produto` int(11) NOT NULL,
  `nome` varchar(155) NOT NULL,
  `preco_custo` int(11) NOT NULL,
  `preco_venda` int(11) NOT NULL,
  `quantidade_estoque` int(11) NOT NULL,
  `estoque_minimo` int(11) NOT NULL,
  `garantia` int(11) NOT NULL,
  `id_fornecedor` int(11) NOT NULL,
  `tipo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produto`
--

INSERT INTO `produto` (`id_produto`, `nome`, `preco_custo`, `preco_venda`, `quantidade_estoque`, `estoque_minimo`, `garantia`, `id_fornecedor`, `tipo`) VALUES
(1, 'Furadeira de Impacto 750W', 28000, 45000, 15, 5, 12, 2, 2),
(2, 'Parafusadeira a Bateria 12V', 18000, 29900, 20, 5, 12, 1, 2),
(3, 'Martelo Cabo Fibra 500g', 2500, 4500, 50, 10, 6, 3, 1),
(4, 'Chave de Fenda Philips Jogo 6pç', 3200, 5900, 40, 10, 6, 4, 1),
(5, 'Nível a Laser Autonivelante', 22000, 38000, 10, 3, 12, 5, 5),
(6, 'Serra Circular 7.1/4\" 1400W', 35000, 58000, 8, 3, 12, 2, 2),
(7, 'Capacete de Segurança ABA Total', 1800, 3200, 60, 15, 0, 3, 3),
(8, 'Luva de Raspa Cano Longo', 900, 1800, 80, 20, 0, 3, 3),
(9, 'Caixa de Parafuso Sextavado M8', 800, 1600, 30, 10, 0, 4, 4),
(10, 'Trena Digital 50m', 5500, 9800, 12, 4, 12, 5, 5),
(11, 'Esmerilhadeira Angular 4.1/2\"', 19000, 32000, 10, 3, 12, 1, 2),
(12, 'Alicate Universal 8\" Profissional', 4200, 7500, 35, 8, 6, 4, 1),
(13, 'Fita Isolante Rolo 10m', 300, 650, 100, 30, 0, 3, 4),
(14, 'Torno de Bancada 5\"', 14000, 24000, 6, 2, 12, 2, 1),
(15, 'Óculos de Proteção Incolor', 600, 1200, 70, 20, 0, 3, 3);

-- --------------------------------------------------------

--
-- Estrutura para tabela `reparo`
--

CREATE TABLE `reparo` (
  `id_reparo` int(11) NOT NULL,
  `id_ordem_servico` int(11) NOT NULL,
  `descricao_servico` varchar(150) NOT NULL,
  `custo` int(11) NOT NULL,
  `data` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `reparo`
--

INSERT INTO `reparo` (`id_reparo`, `id_ordem_servico`, `descricao_servico`, `custo`, `data`) VALUES
(1, 2, 'Substituição de rolamento dianteiro e balanceamento', 8500, '2026-01-25'),
(2, 2, 'Teste final e ajuste de disco de corte', 1500, '2026-01-26'),
(3, 4, 'Substituição de célula da bateria 12V', 6000, '2026-02-17'),
(4, 4, 'Calibração e teste de carga da bateria nova', 1000, '2026-02-18'),
(5, 1, 'Diagnóstico: bobina do motor queimada', 2000, '2026-01-13'),
(6, 3, 'Limpeza e lubrificação do mecanismo de travamento', 3500, '2026-02-05');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `usuario` varchar(150) NOT NULL,
  `senha` varchar(20) NOT NULL,
  `nivel_acesso` int(11) NOT NULL,
  `ativo` tinyint(1) NOT NULL,
  `data_criacao` datetime DEFAULT current_timestamp(),
  `funcionario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `usuario`, `senha`, `nivel_acesso`, `ativo`, `data_criacao`, `funcionario`) VALUES
(1, 'admin', '123', 1, 1, '2026-03-12 01:00:07', NULL),
(2, 'carlos.gerente', 'ger@2024', 2, 1, '2026-01-05 08:00:00', 1),
(3, 'ana.vendas', 'vnd@2024', 3, 1, '2026-01-05 08:05:00', 2),
(4, 'marcos.vendas', 'vnd@2024', 3, 1, '2026-01-05 08:10:00', 3),
(5, 'fernanda.tec', 'tec@2024', 4, 1, '2026-01-05 08:15:00', 4),
(6, 'ricardo.tec', 'tec@2024', 4, 1, '2026-01-05 08:20:00', 5),
(7, 'juliana.caixa', 'cx@2024', 5, 1, '2026-01-05 08:25:00', 6);

-- --------------------------------------------------------

--
-- Estrutura para tabela `venda`
--

CREATE TABLE `venda` (
  `id_venda` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_vendedor` int(11) NOT NULL,
  `valor_total` int(11) NOT NULL,
  `data_venda` datetime DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Despejando dados para a tabela `venda`
--

INSERT INTO `venda` (`id_venda`, `id_cliente`, `id_vendedor`, `valor_total`, `data_venda`, `status`) VALUES
(1, 3, 2, 103900, '2026-01-10 09:30:00', 1),
(2, 1, 3, 45000, '2026-01-15 14:00:00', 1),
(3, 5, 2, 90900, '2026-01-20 10:15:00', 1),
(4, 2, 3, 13700, '2026-02-02 11:00:00', 1),
(5, 8, 2, 58000, '2026-02-10 16:30:00', 1),
(6, 4, 3, 38000, '2026-02-18 09:00:00', 1),
(7, 6, 2, 29900, '2026-03-01 13:45:00', 1),
(8, 7, 3, 47500, '2026-03-05 10:00:00', 0);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `caixa`
--
ALTER TABLE `caixa`
  ADD PRIMARY KEY (`id_caixa`),
  ADD KEY `id_funcionario` (`id_funcionario`);

--
-- Índices de tabela `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `cpf_cnpj` (`cpf_cnpj`);

--
-- Índices de tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  ADD PRIMARY KEY (`id_fornecedor`);

--
-- Índices de tabela `funcionario`
--
ALTER TABLE `funcionario`
  ADD PRIMARY KEY (`id_funcionario`);

--
-- Índices de tabela `item_da_venda`
--
ALTER TABLE `item_da_venda`
  ADD PRIMARY KEY (`id_item_venda`),
  ADD KEY `id_venda` (`id_venda`),
  ADD KEY `id_produto` (`id_produto`);

--
-- Índices de tabela `item_venda`
--
ALTER TABLE `item_venda`
  ADD PRIMARY KEY (`id_item_venda`),
  ADD KEY `id_venda` (`id_venda`),
  ADD KEY `id_produto` (`id_produto`);

--
-- Índices de tabela `nivel_acesso`
--
ALTER TABLE `nivel_acesso`
  ADD PRIMARY KEY (`id_nivel_acesso`);

--
-- Índices de tabela `orcamento`
--
ALTER TABLE `orcamento`
  ADD PRIMARY KEY (`id_orcamento`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Índices de tabela `ordem_servico`
--
ALTER TABLE `ordem_servico`
  ADD PRIMARY KEY (`id_ordem_servico`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_tecnico` (`id_tecnico`);

--
-- Índices de tabela `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`id_produto`),
  ADD KEY `fornecedor` (`id_fornecedor`);

--
-- Índices de tabela `reparo`
--
ALTER TABLE `reparo`
  ADD PRIMARY KEY (`id_reparo`),
  ADD KEY `id_ordem_servico` (`id_ordem_servico`);

--
-- Índices de tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `nivel_acesso` (`nivel_acesso`),
  ADD KEY `funcionario` (`funcionario`);

--
-- Índices de tabela `venda`
--
ALTER TABLE `venda`
  ADD PRIMARY KEY (`id_venda`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_vendedor` (`id_vendedor`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `caixa`
--
ALTER TABLE `caixa`
  MODIFY `id_caixa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  MODIFY `id_fornecedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `funcionario`
--
ALTER TABLE `funcionario`
  MODIFY `id_funcionario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `item_da_venda`
--
ALTER TABLE `item_da_venda`
  MODIFY `id_item_venda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `item_venda`
--
ALTER TABLE `item_venda`
  MODIFY `id_item_venda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `nivel_acesso`
--
ALTER TABLE `nivel_acesso`
  MODIFY `id_nivel_acesso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `orcamento`
--
ALTER TABLE `orcamento`
  MODIFY `id_orcamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `ordem_servico`
--
ALTER TABLE `ordem_servico`
  MODIFY `id_ordem_servico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `produto`
--
ALTER TABLE `produto`
  MODIFY `id_produto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `reparo`
--
ALTER TABLE `reparo`
  MODIFY `id_reparo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `venda`
--
ALTER TABLE `venda`
  MODIFY `id_venda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `caixa`
--
ALTER TABLE `caixa`
  ADD CONSTRAINT `caixa_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Restrições para tabelas `item_da_venda`
--
ALTER TABLE `item_da_venda`
  ADD CONSTRAINT `item_da_venda_ibfk_1` FOREIGN KEY (`id_venda`) REFERENCES `venda` (`id_venda`),
  ADD CONSTRAINT `item_da_venda_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `produto` (`id_produto`);

--
-- Restrições para tabelas `item_venda`
--
ALTER TABLE `item_venda`
  ADD CONSTRAINT `item_venda_ibfk_1` FOREIGN KEY (`id_venda`) REFERENCES `venda` (`id_venda`),
  ADD CONSTRAINT `item_venda_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `produto` (`id_produto`);

--
-- Restrições para tabelas `orcamento`
--
ALTER TABLE `orcamento`
  ADD CONSTRAINT `orcamento_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);

--
-- Restrições para tabelas `ordem_servico`
--
ALTER TABLE `ordem_servico`
  ADD CONSTRAINT `ordem_servico_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `ordem_servico_ibfk_2` FOREIGN KEY (`id_tecnico`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Restrições para tabelas `produto`
--
ALTER TABLE `produto`
  ADD CONSTRAINT `fornecedor` FOREIGN KEY (`id_fornecedor`) REFERENCES `fornecedor` (`id_fornecedor`);

--
-- Restrições para tabelas `reparo`
--
ALTER TABLE `reparo`
  ADD CONSTRAINT `reparo_ibfk_1` FOREIGN KEY (`id_ordem_servico`) REFERENCES `ordem_servico` (`id_ordem_servico`);

--
-- Restrições para tabelas `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`nivel_acesso`) REFERENCES `nivel_acesso` (`id_nivel_acesso`),
  ADD CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`funcionario`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Restrições para tabelas `venda`
--
ALTER TABLE `venda`
  ADD CONSTRAINT `venda_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `venda_ibfk_2` FOREIGN KEY (`id_vendedor`) REFERENCES `funcionario` (`id_funcionario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
