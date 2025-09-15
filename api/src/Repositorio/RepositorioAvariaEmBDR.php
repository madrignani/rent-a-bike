<?php

namespace App\Repositorio;

use App\Modelo\Avaria;
use \PDO;
use App\Exception\RepositorioException;

class RepositorioAvariaEmBDR implements RepositorioAvaria {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(Avaria $avaria): int {
        try {
            $stmt = $this->pdo->prepare( "INSERT INTO avaria
                    (devolucao_id, item_codigo, data_hora, avaliador_codigo, descricao, caminho_foto, valor_cobrar)
                 VALUES
                    (:devolucao, :itemCodigo, :dataHora, :avaliadorCodigo, :descricao, :caminhoFoto, :valorCobrar)"
            );
            $stmt->execute( [
                'devolucao' => $avaria->getDevolucaoId(),
                'itemCodigo' => $avaria->getItem()->getCodigo(),
                'dataHora' => $avaria->getDataHora()->format('Y-m-d H:i:s'),
                'avaliadorCodigo' => $avaria->getAvaliador()->getCodigo(),
                'descricao' => $avaria->getDescricao(),
                'caminhoFoto' => $avaria->getCaminhoFoto(),
                'valorCobrar' => $avaria->getValorCobrar(),
            ] );
            return ( (int) $this->pdo->lastInsertId() );
        } catch (PDOException $e) {
            throw new RepositorioException("Erro ao salvar avaria: " . $e->getMessage());
        }
    }

    public function listarPorDevolucao(int $idDevolucao): ?array {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT
                    a.id AS id, a.item_codigo, a.data_hora, a.avaliador_codigo,
                    a.descricao, a.caminho_foto, a.valor_cobrar
                 FROM avaria a WHERE a.devolucao_id = :id_devolucao"
            );
            $stmt->execute( ['id_devolucao' => $idDevolucao] );
            $avarias = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if ($avarias !== false && count($avarias) > 0) {
                return $avarias;
            } else {
                return null;
            }
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao buscar avarias: " . $e->getMessage() );
        }
    }
    
}

?>