<?php

namespace App\Repositorio;

use PDO;
use PDOException;
use App\Exception\RepositorioException;

class RepositorioRelatorioEmBDR implements RepositorioRelatorio {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function buscarLocacoesDevolvidas( string $inicio, string $fim ): array {
        try {
            $stmt = $this->pdo->prepare( 
                "SELECT DATE(d.data_hora) AS data,
                SUM(d.valor_pago) AS total_pago
                FROM devolucao d
                JOIN locacao l ON l.id = d.locacao_id
                WHERE d.data_hora BETWEEN :inicio AND :fim
                AND l.status = 'FINALIZADA'
                GROUP BY DATE(d.data_hora)
                ORDER BY DATE(d.data_hora)"
            );
            $stmt->execute( [':inicio' => $inicio . ' 00:00:00', ':fim' => $fim . ' 23:59:59'] );
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao consultar Locações Devolvidas: " . $e->getMessage() );
        }
    }

    public function buscarTop10ItensAlugados(string $inicio, string $fim): array {
        try {  
            $sqlTop10 = <<<SQL
                SELECT i.codigo, i.descricao, COUNT(li.item_codigo) AS quantidade
                FROM locacao_item li
                JOIN locacao l ON li.locacao_id = l.id
                JOIN item i ON li.item_codigo = i.codigo
                WHERE l.data_hora BETWEEN :inicio AND :fim
                GROUP BY i.codigo, i.descricao
                ORDER BY quantidade DESC, i.descricao ASC
                LIMIT 10
            SQL;
            $stmt = $this->pdo->prepare($sqlTop10);
            $stmt->execute( [
                ':inicio' => $inicio . ' 00:00:00',
                ':fim' => $fim . ' 23:59:59'
            ] );
            $top10 = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $top10;
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao consultar Top 10 Itens Alugados: " . $e->getMessage() );
        }
    }

}

?>