<?php

namespace App\Repositorio;

use \PDO;
use App\Exception\RepositorioException;

class RepositorioFuncionarioEmBDR implements RepositorioFuncionario {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function listar(): array {
        try {
            $stmt = $this->pdo->prepare("SELECT codigo, nome, cpf, cargo, senha_hash, salt FROM funcionario");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new RepositorioException($e->getMessage());
        }
    }

    public function buscarPorCodigo(int $codigo): array {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM funcionario WHERE codigo = :codigo");
            $stmt->execute(['codigo' => $codigo]);
            $dados = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($dados === false) {
                throw new RepositorioException("Funcionário com código $codigo não encontrado.");
            }
            return $dados;
        } catch (\PDOException $e) {
            throw new RepositorioException("Erro ao buscar funcionário por código: " . $e->getMessage());
        }
    }

    public function buscarPorCPF(string $cpf): array {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM funcionario WHERE cpf = :cpf");
            $stmt->execute(['cpf' => $cpf]);
            $dados = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($dados === false) {
                throw new RepositorioException("Funcionário com CPF $cpf não encontrado.");
            }
            return $dados;
        } catch (\PDOException $e) {
            throw new RepositorioException("Erro ao buscar funcionário por CPF: " . $e->getMessage());
        }
    }
}

?>