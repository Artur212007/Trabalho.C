-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 29-Abr-2026 às 02:09
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

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
-- Estrutura da tabela `caixa`
--

CREATE TABLE `caixa` (
  `id_caixa` int(11) NOT NULL,
  `data` datetime NOT NULL,
  `valor_abertura` int(11) NOT NULL,
  `valor_fechamento` decimal(10,2) DEFAULT NULL,
  `id_funcionario` int(11) NOT NULL,
  `observacoes` text DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1 COMMENT '1=Aberto 0=Fechado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `caixa`
--

INSERT INTO `caixa` (`id_caixa`, `data`, `valor_abertura`, `valor_fechamento`, `id_funcionario`, `observacoes`, `status`) VALUES
(12, '2026-04-13 20:48:18', 1, NULL, 3, NULL, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `cpf_cnpj` varchar(20) DEFAULT NULL,
  `telefone` char(15) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `endereço` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `senha` varchar(255) DEFAULT NULL,
  `usuario` varchar(150) DEFAULT NULL,
  `nivel_acesso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `nome`, `cpf_cnpj`, `telefone`, `email`, `endereço`, `ativo`, `senha`, `usuario`, `nivel_acesso`) VALUES
(1, 'Carlos Eduardo', '529.982.247-25', '11999998888', 'carlos@email.com', 'Rua A, 123', 1, '$2b$10$BXSaZnnt9fnr5RI9GdODcOY7W1umLuEfEiHlttq.YEbhOTT8WTd9i', 'carlos', 6),
(2, 'Fernanda Lima', '987.654.321-00', '11988887777', 'fernanda@email.com', 'Rua B, 456', 1, '$2b$10$WSCB4.lDhcvGL7QVJ8LjUOihguGgYHMYrozQCMMgm5K1A58DZ1AxC', 'fernanda', 6),
(8, 'eu', '105.233.183-16', '(85) 9909-7435', 'vcbdfgfdgfvfdsvfdsg@gmail.com', 'Yamdjfggdg ', 1, '$2b$10$F5jZQqY5pucamnfxNKWwu.RfiKXDnlBwAmMt0xnXQ8njhLykwpdVC', 'bgfenfdnfd', 6);

-- --------------------------------------------------------

--
-- Estrutura da tabela `despesa`
--

CREATE TABLE `despesa` (
  `id_despesa` int(11) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `valor` decimal(10,2) DEFAULT NULL,
  `status` enum('pendente','pago') DEFAULT 'pendente',
  `data` datetime DEFAULT current_timestamp(),
  `categoria` varchar(100) DEFAULT NULL,
  `id_funcionario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `despesa`
--

INSERT INTO `despesa` (`id_despesa`, `descricao`, `valor`, `status`, `data`, `categoria`, `id_funcionario`) VALUES
(0, 'Motoboy', 20.00, 'pendente', '2026-04-13 00:00:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `fornecedor`
--

CREATE TABLE `fornecedor` (
  `id_fornecedor` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `telefone` char(11) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `endereco` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `fornecedor`
--

INSERT INTO `fornecedor` (`id_fornecedor`, `nome`, `telefone`, `email`, `endereco`) VALUES
(1, 'Ferramentas LTDA', '1133334444', 'contato@ferramentas.com', 'Av Industrial, 1000'),
(2, 'Máquinas Brasil', '1144445555', 'vendas@maquinasbr.com', 'Rua das Oficinas, 500');

-- --------------------------------------------------------

--
-- Estrutura da tabela `funcionario`
--

CREATE TABLE `funcionario` (
  `id_funcionario` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `cargo` int(11) DEFAULT NULL,
  `salario` decimal(10,2) NOT NULL,
  `percentual_comissao` decimal(5,2) DEFAULT 0.00,
  `ativo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `funcionario`
--

INSERT INTO `funcionario` (`id_funcionario`, `nome`, `cargo`, `salario`, `percentual_comissao`, `ativo`) VALUES
(1, 'João Silva', 2, 3500.00, 2.00, 1),
(2, 'Maria Santos', 3, 2500.00, 3.00, 1),
(3, 'Pedro Costa', 4, 3200.00, 0.00, 1),
(4, 'Ana Lima', 5, 2200.00, 0.00, 1),
(5, 'Ricardo Holanda de Abreu', 1, 8000.00, 2.00, 1),
(7, 'Yago', 4, 2.00, 0.00, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `item_venda`
--

CREATE TABLE `item_venda` (
  `id_item_venda` int(11) NOT NULL,
  `id_venda` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Extraindo dados da tabela `item_venda`
--

INSERT INTO `item_venda` (`id_item_venda`, `id_venda`, `id_produto`, `quantidade`, `valor_unitario`) VALUES
(14, 11, 4, 1, 189.00),
(15, 12, 2, 1, 249.00),
(16, 12, 1, 1, 299.00),
(17, 13, 1, 1, 299.00);

-- --------------------------------------------------------

--
-- Estrutura da tabela `movimentacao_caixa`
--

CREATE TABLE `movimentacao_caixa` (
  `id_movimentacao` int(11) NOT NULL,
  `id_caixa` int(11) NOT NULL,
  `tipo` enum('entrada','saida') NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `id_referencia` int(11) DEFAULT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `data` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `nivel_acesso`
--

CREATE TABLE `nivel_acesso` (
  `id_nivel_acesso` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `nivel_acesso`
--

INSERT INTO `nivel_acesso` (`id_nivel_acesso`, `nome`) VALUES
(1, 'ADMIN'),
(2, 'GERENTE'),
(3, 'VENDEDOR'),
(4, 'TECNICO'),
(5, 'CAIXA'),
(6, 'CLIENTE');

-- --------------------------------------------------------

--
-- Estrutura da tabela `notificacao`
--

CREATE TABLE `notificacao` (
  `id_notificacao` int(11) NOT NULL,
  `id_funcionario` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensagem` text NOT NULL,
  `lida` tinyint(4) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `orcamento`
--

CREATE TABLE `orcamento` (
  `id_orcamento` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `valor_total` int(11) NOT NULL,
  `validade` date NOT NULL,
  `descricao` text DEFAULT NULL,
  `tipo` enum('normal','os') DEFAULT 'normal',
  `status` enum('pendente','aceito','cancelado') DEFAULT 'pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `orcamento`
--

INSERT INTO `orcamento` (`id_orcamento`, `id_cliente`, `valor_total`, `validade`, `descricao`, `tipo`, `status`) VALUES
(6, 1, 150, '2000-07-08', 'Furadeira nao liga ', 'os', 'pendente'),
(8, 8, 1200, '2026-04-28', 'Tutu quebrou', 'normal', 'pendente');

-- --------------------------------------------------------

--
-- Estrutura da tabela `ordem_servico`
--

CREATE TABLE `ordem_servico` (
  `id_ordem_servico` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_tecnico` int(11) DEFAULT NULL,
  `descricao_problema` varchar(150) NOT NULL,
  `data_abertura` datetime NOT NULL,
  `id_orcamento` int(11) DEFAULT NULL,
  `valor_total` int(11) NOT NULL,
  `status` int(11) DEFAULT 0,
  `status_execucao` tinyint(4) DEFAULT 0 COMMENT '0=Aguardando 1=Em diagnóstico 2=Em reparo 3=Concluído 4=Cancelado',
  `data_recebimento` datetime DEFAULT NULL,
  `data_conclusao` datetime DEFAULT NULL,
  `equipamento` varchar(255) DEFAULT NULL,
  `numero_serie` varchar(100) DEFAULT NULL,
  `condicao_entrada` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `ordem_servico`
--

INSERT INTO `ordem_servico` (`id_ordem_servico`, `id_cliente`, `id_tecnico`, `descricao_problema`, `data_abertura`, `id_orcamento`, `valor_total`, `status`, `status_execucao`, `data_recebimento`, `data_conclusao`, `equipamento`, `numero_serie`, `condicao_entrada`) VALUES
(1, 1, 3, 'Furadeira não liga', '2026-04-05 09:06:27', 6, 0, 1, 2, NULL, '2026-04-25 11:19:50', NULL, NULL, NULL),
(6, 8, 3, 'Tutu quebrou', '2026-04-28 19:17:51', 8, 0, 0, 3, NULL, '2026-04-28 19:49:07', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `os_diagnostico`
--

CREATE TABLE `os_diagnostico` (
  `id_diagnostico` int(11) NOT NULL,
  `id_ordem_servico` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `descricao` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `os_diagnostico`
--

INSERT INTO `os_diagnostico` (`id_diagnostico`, `id_ordem_servico`, `id_tecnico`, `descricao`, `created_at`) VALUES
(1, 1, 3, 'Perda total ☠️', '2026-04-25 11:18:32');

-- --------------------------------------------------------

--
-- Estrutura da tabela `os_garantia`
--

CREATE TABLE `os_garantia` (
  `id_garantia` int(11) NOT NULL,
  `id_ordem_servico` int(11) NOT NULL,
  `dias_garantia` int(11) NOT NULL DEFAULT 90,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `observacoes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `os_reparo`
--

CREATE TABLE `os_reparo` (
  `id_reparo` int(11) NOT NULL,
  `id_ordem_servico` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `descricao` text NOT NULL,
  `pecas_utilizadas` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `os_reparo`
--

INSERT INTO `os_reparo` (`id_reparo`, `id_ordem_servico`, `id_tecnico`, `descricao`, `pecas_utilizadas`, `created_at`) VALUES
(1, 1, 3, 'Impossivel dar algum reparo ☠️', 'Foi o tutu que disse', '2026-04-25 11:19:00');

-- --------------------------------------------------------

--
-- Estrutura da tabela `pagamento`
--

CREATE TABLE `pagamento` (
  `id_pagamento` int(11) NOT NULL,
  `id_venda` int(11) DEFAULT NULL,
  `id_ordem_servico` int(11) DEFAULT NULL,
  `id_cliente` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `forma_pagamento` enum('dinheiro','cartao_credito','cartao_debito','pix','boleto','transferencia') NOT NULL,
  `parcelas` int(11) DEFAULT 1,
  `status` enum('pendente','pago','cancelado') DEFAULT 'pendente',
  `data_pagamento` datetime DEFAULT NULL,
  `data_vencimento` date NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `id_despesa` int(11) DEFAULT NULL,
  `numero_recibo` varchar(20) DEFAULT NULL,
  `observacoes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `pagamento`
--

INSERT INTO `pagamento` (`id_pagamento`, `id_venda`, `id_ordem_servico`, `id_cliente`, `valor`, `forma_pagamento`, `parcelas`, `status`, `data_pagamento`, `data_vencimento`, `descricao`, `created_at`, `updated_at`, `id_despesa`, `numero_recibo`, `observacoes`) VALUES
(3, 13, NULL, 1, 299.00, 'cartao_debito', 1, 'pendente', '1222-02-09 00:00:00', '2026-04-13', 'Venda #13', '2026-04-13 14:22:52', '2026-04-13 14:24:43', NULL, NULL, NULL),
(4, NULL, NULL, 1, 200.00, 'dinheiro', 1, 'pendente', NULL, '2026-04-13', 'Despesa #5 - Motoboy', '2026-04-13 14:52:27', NULL, 5, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `pagamento_parcela`
--

CREATE TABLE `pagamento_parcela` (
  `id_parcela` int(11) NOT NULL,
  `id_pagamento` int(11) NOT NULL,
  `numero_parcela` int(11) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `data_vencimento` date NOT NULL,
  `data_pagamento` datetime DEFAULT NULL,
  `status` enum('pendente','pago','atrasado') DEFAULT 'pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `produto`
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
-- Extraindo dados da tabela `produto`
--

INSERT INTO `produto` (`id_produto`, `nome`, `preco_custo`, `preco_venda`, `quantidade_estoque`, `estoque_minimo`, `garantia`, `id_fornecedor`, `tipo`) VALUES
(1, 'Furadeira Elétrica', 150, 299, 47, 10, 12, 1, 1),
(2, 'Parafusadeira', 120, 249, 38, 8, 12, 1, 1),
(3, 'Serra Circular', 280, 549, 19, 5, 24, 2, 1),
(4, 'Lixadeira', 90, 189, 31, 7, 12, 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `reparo`
--

CREATE TABLE `reparo` (
  `id_reparo` int(11) NOT NULL,
  `id_ordem_servico` int(11) NOT NULL,
  `descricao_servico` varchar(150) NOT NULL,
  `custo` int(11) NOT NULL,
  `data` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `reparo`
--

INSERT INTO `reparo` (`id_reparo`, `id_ordem_servico`, `descricao_servico`, `custo`, `data`) VALUES
(1, 1, 'Troca do motor', 150, '2026-04-05');

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `usuario` varchar(150) NOT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `nivel_acesso` int(11) NOT NULL,
  `ativo` tinyint(1) NOT NULL,
  `data_criacao` datetime DEFAULT current_timestamp(),
  `id_funcionario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `usuario`, `senha`, `nivel_acesso`, `ativo`, `data_criacao`, `id_funcionario`) VALUES
(1, 'gerente', '$2b$10$YotLFaecegAHeWE2HhiZsO9GjmxcMfixxNAuP/amoRhd5AhHVuObG', 2, 1, '2026-04-05 09:06:27', 1),
(2, 'vendedor', '$2b$10$u2cdTHt8d8gGjzfaiUGBEOJa1E7xKKuLPaGiTQ26ZDCQIi9JkfLQS', 3, 1, '2026-04-05 09:06:27', 2),
(3, 'tecnico', '$2b$10$GtcZ7oSiVco1FOgn2hGwmey6bmkd1klZnUbzyl2n576WR13MRv2pC', 4, 1, '2026-04-05 09:06:27', 3),
(4, 'caixa', '$2b$10$SOb839MEvrW2k3yk6Dsl2.aiZub3V3WcNYoK8JfwQC4O5tzjpNghi', 5, 1, '2026-04-05 09:06:27', 4),
(5, 'admin', '$2b$10$uG66YLsxf.rT/npUZFgYsuPV2BRphepeSlM1GB370l8kKD4GGDc3G', 1, 1, '2026-04-05 11:42:26', 5),
(7, 'Yago', '$2b$10$jZ4fxuoqSyrnkDKVn.9eCuPTE2zLTmmxyx/4gkML9d4/osF0lPH.q', 4, 1, '2026-04-12 16:17:48', 7);

-- --------------------------------------------------------

--
-- Estrutura da tabela `venda`
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
-- Extraindo dados da tabela `venda`
--

INSERT INTO `venda` (`id_venda`, `id_cliente`, `id_vendedor`, `valor_total`, `data_venda`, `status`) VALUES
(11, 2, 2, 189, '2026-04-06 21:58:05', 1),
(12, 1, 2, 548, '2026-04-13 13:37:29', 1),
(13, 1, 2, 299, '2026-04-13 14:22:51', 0);

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `caixa`
--
ALTER TABLE `caixa`
  ADD PRIMARY KEY (`id_caixa`),
  ADD KEY `id_funcionario` (`id_funcionario`);

--
-- Índices para tabela `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `cpf_cnpj` (`cpf_cnpj`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD KEY `nivel_acesso` (`nivel_acesso`);

--
-- Índices para tabela `despesa`
--
ALTER TABLE `despesa`
  ADD KEY `id_funcionario` (`id_funcionario`);

--
-- Índices para tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  ADD PRIMARY KEY (`id_fornecedor`);

--
-- Índices para tabela `funcionario`
--
ALTER TABLE `funcionario`
  ADD PRIMARY KEY (`id_funcionario`),
  ADD KEY `cargo` (`cargo`);

--
-- Índices para tabela `item_venda`
--
ALTER TABLE `item_venda`
  ADD PRIMARY KEY (`id_item_venda`),
  ADD KEY `id_venda` (`id_venda`),
  ADD KEY `id_produto` (`id_produto`);

--
-- Índices para tabela `movimentacao_caixa`
--
ALTER TABLE `movimentacao_caixa`
  ADD PRIMARY KEY (`id_movimentacao`),
  ADD KEY `id_caixa` (`id_caixa`);

--
-- Índices para tabela `nivel_acesso`
--
ALTER TABLE `nivel_acesso`
  ADD PRIMARY KEY (`id_nivel_acesso`);

--
-- Índices para tabela `notificacao`
--
ALTER TABLE `notificacao`
  ADD PRIMARY KEY (`id_notificacao`),
  ADD KEY `id_funcionario` (`id_funcionario`);

--
-- Índices para tabela `orcamento`
--
ALTER TABLE `orcamento`
  ADD PRIMARY KEY (`id_orcamento`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Índices para tabela `ordem_servico`
--
ALTER TABLE `ordem_servico`
  ADD PRIMARY KEY (`id_ordem_servico`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_tecnico` (`id_tecnico`),
  ADD KEY `id_orcamento` (`id_orcamento`);

--
-- Índices para tabela `os_diagnostico`
--
ALTER TABLE `os_diagnostico`
  ADD PRIMARY KEY (`id_diagnostico`),
  ADD KEY `id_ordem_servico` (`id_ordem_servico`),
  ADD KEY `id_tecnico` (`id_tecnico`);

--
-- Índices para tabela `os_garantia`
--
ALTER TABLE `os_garantia`
  ADD PRIMARY KEY (`id_garantia`),
  ADD KEY `id_ordem_servico` (`id_ordem_servico`);

--
-- Índices para tabela `os_reparo`
--
ALTER TABLE `os_reparo`
  ADD PRIMARY KEY (`id_reparo`),
  ADD KEY `id_ordem_servico` (`id_ordem_servico`),
  ADD KEY `id_tecnico` (`id_tecnico`);

--
-- Índices para tabela `pagamento`
--
ALTER TABLE `pagamento`
  ADD PRIMARY KEY (`id_pagamento`),
  ADD KEY `id_venda` (`id_venda`),
  ADD KEY `id_ordem_servico` (`id_ordem_servico`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Índices para tabela `pagamento_parcela`
--
ALTER TABLE `pagamento_parcela`
  ADD PRIMARY KEY (`id_parcela`),
  ADD KEY `id_pagamento` (`id_pagamento`);

--
-- Índices para tabela `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`id_produto`),
  ADD KEY `fornecedor` (`id_fornecedor`);

--
-- Índices para tabela `reparo`
--
ALTER TABLE `reparo`
  ADD PRIMARY KEY (`id_reparo`),
  ADD KEY `id_ordem_servico` (`id_ordem_servico`);

--
-- Índices para tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD KEY `nivel_acesso` (`nivel_acesso`),
  ADD KEY `funcionario` (`id_funcionario`);

--
-- Índices para tabela `venda`
--
ALTER TABLE `venda`
  ADD PRIMARY KEY (`id_venda`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_vendedor` (`id_vendedor`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `caixa`
--
ALTER TABLE `caixa`
  MODIFY `id_caixa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  MODIFY `id_fornecedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `funcionario`
--
ALTER TABLE `funcionario`
  MODIFY `id_funcionario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `item_venda`
--
ALTER TABLE `item_venda`
  MODIFY `id_item_venda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `movimentacao_caixa`
--
ALTER TABLE `movimentacao_caixa`
  MODIFY `id_movimentacao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `nivel_acesso`
--
ALTER TABLE `nivel_acesso`
  MODIFY `id_nivel_acesso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `notificacao`
--
ALTER TABLE `notificacao`
  MODIFY `id_notificacao` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `orcamento`
--
ALTER TABLE `orcamento`
  MODIFY `id_orcamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `ordem_servico`
--
ALTER TABLE `ordem_servico`
  MODIFY `id_ordem_servico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `os_diagnostico`
--
ALTER TABLE `os_diagnostico`
  MODIFY `id_diagnostico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `os_garantia`
--
ALTER TABLE `os_garantia`
  MODIFY `id_garantia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `os_reparo`
--
ALTER TABLE `os_reparo`
  MODIFY `id_reparo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `pagamento`
--
ALTER TABLE `pagamento`
  MODIFY `id_pagamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `pagamento_parcela`
--
ALTER TABLE `pagamento_parcela`
  MODIFY `id_parcela` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produto`
--
ALTER TABLE `produto`
  MODIFY `id_produto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `reparo`
--
ALTER TABLE `reparo`
  MODIFY `id_reparo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `venda`
--
ALTER TABLE `venda`
  MODIFY `id_venda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `caixa`
--
ALTER TABLE `caixa`
  ADD CONSTRAINT `caixa_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Limitadores para a tabela `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`nivel_acesso`) REFERENCES `nivel_acesso` (`id_nivel_acesso`);

--
-- Limitadores para a tabela `despesa`
--
ALTER TABLE `despesa`
  ADD CONSTRAINT `despesa_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Limitadores para a tabela `funcionario`
--
ALTER TABLE `funcionario`
  ADD CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`cargo`) REFERENCES `nivel_acesso` (`id_nivel_acesso`);

--
-- Limitadores para a tabela `item_venda`
--
ALTER TABLE `item_venda`
  ADD CONSTRAINT `item_venda_ibfk_1` FOREIGN KEY (`id_venda`) REFERENCES `venda` (`id_venda`),
  ADD CONSTRAINT `item_venda_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `produto` (`id_produto`);

--
-- Limitadores para a tabela `movimentacao_caixa`
--
ALTER TABLE `movimentacao_caixa`
  ADD CONSTRAINT `movimentacao_caixa_ibfk_1` FOREIGN KEY (`id_caixa`) REFERENCES `caixa` (`id_caixa`);

--
-- Limitadores para a tabela `notificacao`
--
ALTER TABLE `notificacao`
  ADD CONSTRAINT `notificacao_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Limitadores para a tabela `orcamento`
--
ALTER TABLE `orcamento`
  ADD CONSTRAINT `orcamento_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `ordem_servico`
--
ALTER TABLE `ordem_servico`
  ADD CONSTRAINT `ordem_servico_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE,
  ADD CONSTRAINT `ordem_servico_ibfk_2` FOREIGN KEY (`id_tecnico`) REFERENCES `funcionario` (`id_funcionario`),
  ADD CONSTRAINT `ordem_servico_ibfk_3` FOREIGN KEY (`id_orcamento`) REFERENCES `orcamento` (`id_orcamento`);

--
-- Limitadores para a tabela `os_diagnostico`
--
ALTER TABLE `os_diagnostico`
  ADD CONSTRAINT `os_diagnostico_ibfk_1` FOREIGN KEY (`id_ordem_servico`) REFERENCES `ordem_servico` (`id_ordem_servico`) ON DELETE CASCADE,
  ADD CONSTRAINT `os_diagnostico_ibfk_2` FOREIGN KEY (`id_tecnico`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Limitadores para a tabela `os_garantia`
--
ALTER TABLE `os_garantia`
  ADD CONSTRAINT `os_garantia_ibfk_1` FOREIGN KEY (`id_ordem_servico`) REFERENCES `ordem_servico` (`id_ordem_servico`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `os_reparo`
--
ALTER TABLE `os_reparo`
  ADD CONSTRAINT `os_reparo_ibfk_1` FOREIGN KEY (`id_ordem_servico`) REFERENCES `ordem_servico` (`id_ordem_servico`) ON DELETE CASCADE,
  ADD CONSTRAINT `os_reparo_ibfk_2` FOREIGN KEY (`id_tecnico`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Limitadores para a tabela `pagamento`
--
ALTER TABLE `pagamento`
  ADD CONSTRAINT `pagamento_ibfk_1` FOREIGN KEY (`id_venda`) REFERENCES `venda` (`id_venda`) ON DELETE SET NULL,
  ADD CONSTRAINT `pagamento_ibfk_2` FOREIGN KEY (`id_ordem_servico`) REFERENCES `ordem_servico` (`id_ordem_servico`) ON DELETE SET NULL,
  ADD CONSTRAINT `pagamento_ibfk_3` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);

--
-- Limitadores para a tabela `pagamento_parcela`
--
ALTER TABLE `pagamento_parcela`
  ADD CONSTRAINT `pagamento_parcela_ibfk_1` FOREIGN KEY (`id_pagamento`) REFERENCES `pagamento` (`id_pagamento`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `produto`
--
ALTER TABLE `produto`
  ADD CONSTRAINT `fornecedor` FOREIGN KEY (`id_fornecedor`) REFERENCES `fornecedor` (`id_fornecedor`);

--
-- Limitadores para a tabela `reparo`
--
ALTER TABLE `reparo`
  ADD CONSTRAINT `reparo_ibfk_1` FOREIGN KEY (`id_ordem_servico`) REFERENCES `ordem_servico` (`id_ordem_servico`);

--
-- Limitadores para a tabela `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`nivel_acesso`) REFERENCES `nivel_acesso` (`id_nivel_acesso`),
  ADD CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Limitadores para a tabela `venda`
--
ALTER TABLE `venda`
  ADD CONSTRAINT `venda_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE,
  ADD CONSTRAINT `venda_ibfk_2` FOREIGN KEY (`id_vendedor`) REFERENCES `funcionario` (`id_funcionario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
