<?php

namespace App\Repositorio;

use \PDO;
use \PDOException;
use App\Exception\RepositorioException;

class RepositorioFabricanteEmBDR implements RepositorioFabricante {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function buscarPorCodigo(int $codigo): ?array {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM fabricante WHERE codigo = :codigo");
            $stmt->execute(['codigo' => $codigo]);
            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
            return $resultado !== false ? $resultado : null;
        } catch (PDOException $e) {
            throw new RepositorioException("Erro ao buscar fabricante por código: " . $e->getMessage());
        }
    }
    
}

?>