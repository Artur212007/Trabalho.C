-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 07/04/2026 às 06:14
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
  `valor_fechamento` decimal(10,2) DEFAULT NULL,
  `saldo` int(11) NOT NULL,
  `id_funcionario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cliente`
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
-- Despejando dados para a tabela `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `nome`, `cpf_cnpj`, `telefone`, `email`, `endereço`, `ativo`, `senha`, `usuario`, `nivel_acesso`) VALUES
(1, 'Carlos Eduardo ', '529.982.247-25', '11999998888', 'carlos@email.com', 'Rua A, 123', 1, '$2b$10$BXSaZnnt9fnr5RI9GdODcOY7W1umLuEfEiHlttq.YEbhOTT8WTd9i', 'carlos', 6),
(2, 'Fernanda Lima', '987.654.321-00', '11988887777', 'fernanda@email.com', 'Rua B, 456', 1, '$2b$10$WSCB4.lDhcvGL7QVJ8LjUOihguGgYHMYrozQCMMgm5K1A58DZ1AxC', 'fernanda', 6);

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
(1, 'Ferramentas LTDA', '1133334444', 'contato@ferramentas.com', 'Av Industrial, 1000'),
(2, 'Máquinas Brasil', '1144445555', 'vendas@maquinasbr.com', 'Rua das Oficinas, 500');

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionario`
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
-- Despejando dados para a tabela `funcionario`
--

INSERT INTO `funcionario` (`id_funcionario`, `nome`, `cargo`, `salario`, `percentual_comissao`, `ativo`) VALUES
(1, 'João Silva', 2, 3500.00, 2.00, 1),
(2, 'Maria Santos', 3, 2500.00, 3.00, 1),
(3, 'Pedro Costa', 4, 3200.00, 0.00, 1),
(4, 'Ana Lima', 5, 2200.00, 0.00, 1),
(5, 'Ricardo Holanda de Abreu', 1, 8000.00, 2.00, 1);

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
(14, 11, 4, 1, 189.00);

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
(5, 'CAIXA'),
(6, 'CLIENTE');

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
  `status` tinyint(1) DEFAULT NULL,
  `id_tecnico` int(11) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `dados` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `orcamento`
--

INSERT INTO `orcamento` (`id_orcamento`, `id_cliente`, `valor_total`, `data`, `validade`, `status`, `id_tecnico`, `descricao`, `dados`) VALUES
(3, 1, 122, '2026-04-06 23:17:42', '2009-08-12', 0, 3, 'vfiwvfds', 'nnff');

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
(1, 1, 3, 'Furadeira não liga', 'Defeito elétrico', 1, '2026-04-05 09:06:27');

-- --------------------------------------------------------

--
-- Estrutura para tabela `pagamento`
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
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pagamento_parcela`
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
(1, 'Furadeira Elétrica', 150, 299, 49, 10, 12, 1, 1),
(2, 'Parafusadeira', 120, 249, 39, 8, 12, 1, 1),
(3, 'Serra Circular', 280, 549, 19, 5, 24, 2, 1),
(4, 'Lixadeira', 90, 189, 31, 7, 12, 1, 1);

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
(1, 1, 'Troca do motor', 150, '2026-04-05');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario`
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
-- Despejando dados para a tabela `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `usuario`, `senha`, `nivel_acesso`, `ativo`, `data_criacao`, `id_funcionario`) VALUES
(1, 'gerente', '$2b$10$YotLFaecegAHeWE2HhiZsO9GjmxcMfixxNAuP/amoRhd5AhHVuObG', 2, 1, '2026-04-05 09:06:27', 1),
(2, 'vendedor', '$2b$10$u2cdTHt8d8gGjzfaiUGBEOJa1E7xKKuLPaGiTQ26ZDCQIi9JkfLQS', 3, 1, '2026-04-05 09:06:27', 2),
(3, 'tecnico', '$2b$10$GtcZ7oSiVco1FOgn2hGwmey6bmkd1klZnUbzyl2n576WR13MRv2pC', 4, 1, '2026-04-05 09:06:27', 3),
(4, 'caixa', '$2b$10$SOb839MEvrW2k3yk6Dsl2.aiZub3V3WcNYoK8JfwQC4O5tzjpNghi', 5, 1, '2026-04-05 09:06:27', 4),
(5, 'admin', '$2b$10$uG66YLsxf.rT/npUZFgYsuPV2BRphepeSlM1GB370l8kKD4GGDc3G', 1, 1, '2026-04-05 11:42:26', 5);

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
(11, 2, 2, 189, '2026-04-06 21:58:05', 1);

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
  ADD UNIQUE KEY `cpf_cnpj` (`cpf_cnpj`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD KEY `nivel_acesso` (`nivel_acesso`);

--
-- Índices de tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  ADD PRIMARY KEY (`id_fornecedor`);

--
-- Índices de tabela `funcionario`
--
ALTER TABLE `funcionario`
  ADD PRIMARY KEY (`id_funcionario`),
  ADD KEY `cargo` (`cargo`);

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
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `fk_orcamento_tecnico` (`id_tecnico`);

--
-- Índices de tabela `ordem_servico`
--
ALTER TABLE `ordem_servico`
  ADD PRIMARY KEY (`id_ordem_servico`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_tecnico` (`id_tecnico`);

--
-- Índices de tabela `pagamento`
--
ALTER TABLE `pagamento`
  ADD PRIMARY KEY (`id_pagamento`),
  ADD KEY `id_venda` (`id_venda`),
  ADD KEY `id_ordem_servico` (`id_ordem_servico`),
  ADD KEY `id_cliente` (`id_cliente`);

--
-- Índices de tabela `pagamento_parcela`
--
ALTER TABLE `pagamento_parcela`
  ADD PRIMARY KEY (`id_parcela`),
  ADD KEY `id_pagamento` (`id_pagamento`);

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
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD KEY `nivel_acesso` (`nivel_acesso`),
  ADD KEY `funcionario` (`id_funcionario`);

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
  MODIFY `id_caixa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `fornecedor`
--
ALTER TABLE `fornecedor`
  MODIFY `id_fornecedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `funcionario`
--
ALTER TABLE `funcionario`
  MODIFY `id_funcionario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `item_venda`
--
ALTER TABLE `item_venda`
  MODIFY `id_item_venda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `nivel_acesso`
--
ALTER TABLE `nivel_acesso`
  MODIFY `id_nivel_acesso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `orcamento`
--
ALTER TABLE `orcamento`
  MODIFY `id_orcamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `ordem_servico`
--
ALTER TABLE `ordem_servico`
  MODIFY `id_ordem_servico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `pagamento`
--
ALTER TABLE `pagamento`
  MODIFY `id_pagamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `venda`
--
ALTER TABLE `venda`
  MODIFY `id_venda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `caixa`
--
ALTER TABLE `caixa`
  ADD CONSTRAINT `caixa_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Restrições para tabelas `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`nivel_acesso`) REFERENCES `nivel_acesso` (`id_nivel_acesso`);

--
-- Restrições para tabelas `funcionario`
--
ALTER TABLE `funcionario`
  ADD CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`cargo`) REFERENCES `nivel_acesso` (`id_nivel_acesso`);

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
  ADD CONSTRAINT `fk_orcamento_tecnico` FOREIGN KEY (`id_tecnico`) REFERENCES `funcionario` (`id_funcionario`),
  ADD CONSTRAINT `orcamento_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE;

--
-- Restrições para tabelas `ordem_servico`
--
ALTER TABLE `ordem_servico`
  ADD CONSTRAINT `ordem_servico_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE,
  ADD CONSTRAINT `ordem_servico_ibfk_2` FOREIGN KEY (`id_tecnico`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Restrições para tabelas `pagamento`
--
ALTER TABLE `pagamento`
  ADD CONSTRAINT `pagamento_ibfk_1` FOREIGN KEY (`id_venda`) REFERENCES `venda` (`id_venda`) ON DELETE SET NULL,
  ADD CONSTRAINT `pagamento_ibfk_2` FOREIGN KEY (`id_ordem_servico`) REFERENCES `ordem_servico` (`id_ordem_servico`) ON DELETE SET NULL,
  ADD CONSTRAINT `pagamento_ibfk_3` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);

--
-- Restrições para tabelas `pagamento_parcela`
--
ALTER TABLE `pagamento_parcela`
  ADD CONSTRAINT `pagamento_parcela_ibfk_1` FOREIGN KEY (`id_pagamento`) REFERENCES `pagamento` (`id_pagamento`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`);

--
-- Restrições para tabelas `venda`
--
ALTER TABLE `venda`
  ADD CONSTRAINT `venda_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`) ON DELETE CASCADE,
  ADD CONSTRAINT `venda_ibfk_2` FOREIGN KEY (`id_vendedor`) REFERENCES `funcionario` (`id_funcionario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
