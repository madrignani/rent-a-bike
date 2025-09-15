DROP DATABASE IF EXISTS rent_a_bike;

CREATE DATABASE IF NOT EXISTS rent_a_bike CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE rent_a_bike;

CREATE TABLE seguro (
    numero VARCHAR(20) PRIMARY KEY
) ENGINE=INNODB;

CREATE TABLE fabricante (
    codigo INT PRIMARY KEY AUTO_INCREMENT,
    descricao VARCHAR(40) NOT NULL
) ENGINE=INNODB;

CREATE TABLE item (
    codigo INT PRIMARY KEY AUTO_INCREMENT,
    modelo VARCHAR(40) NOT NULL,
    descricao VARCHAR(40) NULL,
    valor_hora DECIMAL(10,2) NOT NULL,
    fabricante_codigo INT NOT NULL,
    disponivel BOOLEAN NOT NULL DEFAULT true,
    FOREIGN KEY (fabricante_codigo) REFERENCES fabricante(codigo) ON DELETE RESTRICT
) ENGINE=INNODB;

CREATE TABLE bicicleta (
    codigo INT PRIMARY KEY,
    seguro_numero VARCHAR(50) NOT NULL,
    FOREIGN KEY (codigo) REFERENCES item(codigo) ON DELETE CASCADE,
    FOREIGN KEY (seguro_numero) REFERENCES seguro(numero)
) ENGINE=INNODB;

CREATE TABLE equipamento (
    codigo INT PRIMARY KEY,
    FOREIGN KEY (codigo) REFERENCES item(codigo) ON DELETE CASCADE
) ENGINE=INNODB;

CREATE TABLE cliente (
    codigo INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(60) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    telefone VARCHAR(15) NOT NULL,
    email VARCHAR(60) NOT NULL,
    endereco TEXT NOT NULL,
    foto_url VARCHAR(500),
    data_nascimento DATE NOT NULL
) ENGINE=INNODB;

CREATE TABLE funcionario (
    codigo INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(60) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    senha_hash CHAR(128) NOT NULL,
    salt CHAR(32) NOT NULL,
    cargo ENUM('GERENTE', 'ATENDENTE', 'MECANICO') NOT NULL
) ENGINE=InnoDB;

CREATE TABLE locacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    horas_contratadas INT NOT NULL,
    status ENUM('EM_ANDAMENTO', 'FINALIZADA') NOT NULL,
    cliente_codigo INT NOT NULL,
    funcionario_codigo INT NOT NULL,
    FOREIGN KEY (cliente_codigo) REFERENCES cliente(codigo),
    FOREIGN KEY (funcionario_codigo) REFERENCES funcionario(codigo)
) ENGINE=INNODB;

CREATE TABLE locacao_item (
    locacao_id INT NOT NULL,
    item_codigo INT NOT NULL,
    PRIMARY KEY (locacao_id, item_codigo),
    FOREIGN KEY (locacao_id) REFERENCES locacao(id),
    FOREIGN KEY (item_codigo) REFERENCES item(codigo)
) ENGINE=INNODB;

CREATE TABLE devolucao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_pago DECIMAL(10,2) NOT NULL,
    locacao_id INT NOT NULL UNIQUE,
    funcionario_codigo INT NOT NULL,
    FOREIGN KEY (locacao_id) REFERENCES locacao(id),
    FOREIGN KEY (funcionario_codigo) REFERENCES funcionario(codigo)
) ENGINE=INNODB;

CREATE TABLE avaria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    devolucao_id INT NOT NULL,
    item_codigo INT NOT NULL,
    data_hora DATETIME NOT NULL,
    avaliador_codigo INT NOT NULL,
    descricao TEXT NOT NULL,
    caminho_foto VARCHAR(255) NOT NULL,
    valor_cobrar DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (devolucao_id) REFERENCES devolucao(id),
    FOREIGN KEY (item_codigo) REFERENCES item(codigo),
    FOREIGN KEY (avaliador_codigo) REFERENCES funcionario(codigo)
) ENGINE=INNODB;