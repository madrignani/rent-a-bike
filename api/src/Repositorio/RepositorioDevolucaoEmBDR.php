<?php

namespace App\Repositorio;

use \PDO;
use App\Exception\RepositorioException;
use App\Modelo\Devolucao;

class RepositorioDevolucaoEmBDR implements RepositorioDevolucao {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(Devolucao $devolucao): int {
        try {
            $stmt = $this->pdo->prepare( "INSERT INTO devolucao
                    (data_hora, valor_pago, locacao_id, funcionario_codigo)
                 VALUES
                    (:dataHora, :valorPago, :locacao, :funcionario)"
            );
            $stmt->execute( [
                'dataHora' => $devolucao->getDataHora()->format('Y-m-d H:i:s'),
                'valorPago' => $devolucao->getValorPago(),
                'locacao' => $devolucao->getLocacao()->getId(),
                'funcionario' => $devolucao->getFuncionario()->getCodigo(),
            ] );
            return (int) $this->pdo->lastInsertId();
        } catch (\PDOException $e) {
            error_log('Erro PDO ao salvar devolução: ' . $e->getMessage());
            error_log($e->getTraceAsString());
            throw new RepositorioException( "Erro ao salvar devolução: " . $e->getMessage() );
        }
    }

    public function listar(): array {
        try {
            $stmt = $this->pdo->query(
                "SELECT d.id, d.data_hora, d.valor_pago, d.locacao_id, 
                        l.cliente_codigo, c.nome AS cliente_nome
                FROM devolucao d
                INNER JOIN locacao l ON d.locacao_id = l.id
                INNER JOIN cliente c ON l.cliente_codigo = c.codigo
                ORDER BY d.data_hora DESC"
            );
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao listar devoluções: " . $e->getMessage() );
        }
    }

    public function listarPorCpfCliente(string $cpf): array {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT d.id, d.data_hora, d.valor_pago, d.locacao_id, 
                        l.cliente_codigo, c.nome AS cliente_nome
                FROM devolucao d
                INNER JOIN locacao l ON d.locacao_id = l.id
                INNER JOIN cliente c ON l.cliente_codigo = c.codigo
                WHERE c.cpf = :cpf
                ORDER BY d.data_hora DESC"
            );
            $stmt->execute( ['cpf' => $cpf] );
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao buscar devoluções por CPF: " . $e->getMessage() );
        }
    }

    public function buscarPorLocacao(int $idLocacao): ?array {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT
                    id, data_hora, valor_pago, funcionario_codigo
                 FROM devolucao
                 WHERE locacao_id = :locacao"
            );
            $stmt->execute( ['locacao' => $idLocacao] );
            $linha = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($linha === false) {
                return null;
            } else {
                return $linha;
            }
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao buscar devolução: " . $e->getMessage() );
        }
    }

    public function buscarPorCodigo(int $id): ?array {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT
                    id, data_hora, valor_pago, locacao_id, funcionario_codigo
                 FROM devolucao
                 WHERE id = :id"
            );
            $stmt->execute( ['id' => $id] );
            $linha = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
            return $linha !== false ? $linha : null;
        } catch (PDOException $e) {
            throw new RepositorioException("Erro ao buscar devolução por ID: " . $e->getMessage());
        }
    }
    
}

?>