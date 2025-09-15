<?php

namespace App\Repositorio;

use \PDO;
use App\Exception\RepositorioException;

class RepositorioClienteEmBDR implements RepositorioCliente {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function buscarPorCodigo(int $codigo): ?array {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM cliente WHERE codigo = :codigo");
            $stmt->execute( ['codigo' => $codigo] );
            return $stmt->fetch(PDO::FETCH_ASSOC)?: null;
        } catch (PDOException $e) {
            throw new RepositorioException("Erro ao buscar cliente por código: " . $e->getMessage());
        }
    }

    public function buscarPorCpf(string $cpf): ?array {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM cliente WHERE cpf = :cpf");
            $stmt->execute( ['cpf' => $cpf] );
            return $stmt->fetch(PDO::FETCH_ASSOC)?: null;
        } catch (PDOException $e) {
            throw new RepositorioException("Erro ao buscar cliente por CPF: " . $e->getMessage());
        }
    }
    
}

?>