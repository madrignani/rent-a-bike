<?php

namespace App\Repositorio;

use App\Modelo\Locacao;
use PDO;
use PDOException;
use App\Exception\RepositorioException;

class RepositorioLocacaoEmBDR implements RepositorioLocacao {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function salvar(Locacao $locacao): int {
        try {
            $stmt = $this->pdo->prepare( 
                "INSERT INTO locacao 
                (data_hora, horas_contratadas, status, cliente_codigo, funcionario_codigo)
                VALUES (:dataHora, :horas, :status, :cliente, :funcionario)"
            );
            $stmt->execute([
                'dataHora' => $locacao->getDataHora()->format('Y-m-d H:i:s'),
                'horas' => $locacao->getHorasContratadas(),
                'status' => $locacao->getStatus(),
                'cliente' => $locacao->getCliente()->getCodigo(),
                'funcionario'=> $locacao->getFuncionario()->getCodigo(),
            ]);
            $locacaoId = (int) $this->pdo->lastInsertId();
            $stmtItem = $this->pdo->prepare(
                "INSERT INTO locacao_item (locacao_id, item_codigo) 
                 VALUES (:locacaoId, :itemCodigo)"
            );
            foreach ($locacao->getItens() as $item) {
                $stmtItem->execute([
                    'locacaoId'  => $locacaoId,
                    'itemCodigo' => $item->getCodigo(),
                ]);
            }
            return $locacaoId;
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao salvar locação: " . $e->getMessage());
        }
    }

    public function listar(): ?array {
        try{
            $stmt = $this->pdo->prepare( 
                "SELECT l.id, l.data_hora, l.horas_contratadas,
                DATE_ADD(l.data_hora, INTERVAL l.horas_contratadas HOUR) AS entrega_esperada,
                l.status,
                c.nome AS cliente_nome,
                c.telefone AS cliente_telefone
                FROM locacao l
                JOIN cliente c ON c.codigo = l.cliente_codigo
                ORDER BY entrega_esperada ASC"
            );
            $stmt->execute();
            $locacoes= $stmt->fetchAll(PDO::FETCH_ASSOC);
            if($locacoes !== false){
                return $locacoes;
            } else{
                return null;
            }
        } catch(PDOException $e) {
            throw new RepositorioException("Erro ao buscar locações: " . $e->getMessage());
        }
    }

    public function buscarPorCodigo(int $id): ?array {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT l.id, l.data_hora, l.horas_contratadas,
                    DATE_ADD(l.data_hora, INTERVAL l.horas_contratadas HOUR) AS entrega_esperada,
                    l.status, l.cliente_codigo, l.funcionario_codigo
                FROM locacao l
                WHERE l.id = :id"
            );
            $stmt->execute( ['id' => $id] );
            $loc = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($loc === false) {
                return null;
            }
            $stmt2 = $this->pdo->prepare(
                "SELECT 
                    i.codigo AS item_codigo,
                    i.modelo AS item_modelo,
                    i.descricao AS item_descricao,
                    i.valor_hora AS item_valor_hora,
                    i.fabricante_codigo AS item_fabricante_codigo,
                    i.disponivel AS item_disponivel
                FROM locacao_item li
                JOIN item i ON i.codigo = li.item_codigo
                LEFT JOIN fabricante f ON f.codigo = i.fabricante_codigo
                WHERE li.locacao_id = :id"
            );
            $stmt2->execute(['id' => $id]);
            $resultadoItens = $stmt2->fetchAll(PDO::FETCH_ASSOC);
            $loc['itens'] = $resultadoItens;
            return $loc;
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao buscar locação por ID: " . $e->getMessage() );
        }
    }

    public function listarPorCpfCliente(string $cpf): array {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT l.id, l.data_hora, l.horas_contratadas,
                    DATE_ADD(l.data_hora, INTERVAL l.horas_contratadas HOUR) AS entrega_esperada,
                    l.status, l.cliente_codigo, l.funcionario_codigo
                FROM locacao l
                JOIN cliente c ON c.codigo = l.cliente_codigo
                WHERE c.cpf = :cpf
                ORDER BY entrega_esperada ASC"
            );
            $stmt->execute( ['cpf' => $cpf] );
            $locacoes = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            $stmtItem = $this->pdo->prepare(
                "SELECT
                    i.codigo AS item_codigo,
                    i.modelo AS item_modelo,
                    i.descricao AS item_descricao,
                    i.valor_hora AS item_valor_hora,
                    i.fabricante_codigo AS item_fabricante_codigo,
                    i.disponivel AS item_disponivel
                FROM locacao_item li
                JOIN item i ON i.codigo = li.item_codigo
                WHERE li.locacao_id = :locacao_id"
            );
            foreach ($locacoes as &$loc) {
                $stmtItem->execute( ['locacao_id' => $loc['id']] );
                $resultadoItens = $stmtItem->fetchAll(PDO::FETCH_ASSOC);
                $loc['itens'] = $resultadoItens;
            }
            return $locacoes;
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao buscar locações por CPF: " . $e->getMessage() );
        }
    }

    public function buscarItensLocacao(int $locacaoId): array {
        try {
            $stmt = $this->pdo->prepare(
                "SELECT item_codigo FROM locacao_item WHERE locacao_id = :locacaoId"
            );
            $stmt->execute(['locacaoId' => $locacaoId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RepositorioException("Erro ao buscar itens da locação: " . $e->getMessage());
        }
    }

    public function atualizarStatus(int $locacaoId, string $novoStatus): void {
        try {
            $stmt = $this->pdo->prepare(
                "UPDATE locacao SET status = :status WHERE id = :id"
            );
            $stmt->execute( [
                'status' => $novoStatus,
                'id' => $locacaoId,
            ] );
        } catch (PDOException $e) {
            throw new RepositorioException( "Erro ao atualizar status da locação: " . $e->getMessage() );
        }
    }
    
}

?>