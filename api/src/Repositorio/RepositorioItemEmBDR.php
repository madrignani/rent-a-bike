<?php

namespace App\Repositorio;

use \PDO;
use \PDOException;
use App\Exception\RepositorioException;

class RepositorioItemEmBDR implements RepositorioItem {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function buscarPorCodigo(int $codigo): ?array {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT codigo, modelo, descricao, valor_hora,
                        fabricante_codigo, disponivel
                 FROM item
                 WHERE codigo = :codigo"
            );
            $stmt->execute( ['codigo' => $codigo] );
            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$resultado) {
                return null;
            }
            $resultado['avarias'] = $this->buscarAvariasPorItem($codigo);
            return $resultado;
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao buscar item por código: " . $e->getMessage() );
        }
    }

    public function atualizarDisponibilidade(int $codigo, bool $disponibilidade): void {
        try {
            $stmt = $this->pdo->prepare(
                "UPDATE item SET disponivel = :disponibilidade
                 WHERE codigo = :codigo"
            );
            $stmt->execute([
                'disponibilidade' => $disponibilidade ? 1 : 0,
                'codigo' => $codigo
            ]);
        } catch (PDOException $e) {
            throw new DominioException('Erro ao atualizar disponibilidade.');
        }
    }

    public function buscarAvariasPorItem(int $codigo): array {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT id, devolucao_id, item_codigo, data_hora, avaliador_codigo,
                        descricao, caminho_foto, valor_cobrar
                 FROM avaria
                 WHERE item_codigo = :codigo"
            );
            $stmt->execute(['codigo' => $codigo]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (PDOException $e) {
            throw new RepositorioException("Erro ao buscar avarias do item: " . $e->getMessage());
        }
    }

}

?>