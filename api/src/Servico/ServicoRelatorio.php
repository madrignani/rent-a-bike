<?php

namespace App\Servico;

use App\Repositorio\RepositorioRelatorio;
use App\Repositorio\RepositorioFuncionario;
use App\Servico\ServicoFuncionario;
use App\Exception\DominioException;
use App\Exception\RepositorioException;

class ServicoRelatorio {
    private RepositorioRelatorio $repositorioRelatorio;
    private RepositorioFuncionario $repositorioFuncionario;

    public function __construct (
        RepositorioRelatorio $repositorioRelatorio,
        RepositorioFuncionario $repositorioFuncionario
    ) {
        $this->repositorioRelatorio   = $repositorioRelatorio;
        $this->repositorioFuncionario = $repositorioFuncionario;
    }

    public function relatorioLocacoesDevolvidas(array $dados): array {
        try {
            if ( empty($dados['inicio']) || empty($dados['fim']) ) {
                throw DominioException::comProblemas( ['Parâmetros de período inválidos.'] );
            }
            $inicio = $dados['inicio'];
            $fim = $dados['fim'];
            $funcionarioCru = $this->repositorioFuncionario->buscarPorCodigo( $dados['funcionario'] );
            $funcionario = ( new ServicoFuncionario($this->repositorioFuncionario) )->mapearFuncionario($funcionarioCru);
            $cargo = $funcionario->getCargo();
            if ($cargo === 'MECANICO' || $cargo === 'ATENDENTE') {
                throw DominioException::comProblemas( ['Funcionário não permitido.'] );
            }
            $resultado = $this->repositorioRelatorio->buscarLocacoesDevolvidas( $inicio, $fim );
            $linhas = array_map( function (array $linha) {
                return [
                    'data' => $linha['data'],
                    'total_pago' => ( (float) $linha['total_pago'] ),
                ];
            }, $resultado );
            return $linhas;
        } catch (RepositorioException $e) {
            throw DominioException::comProblemas( ['Erro ao gerar relatório: ' . $e->getMessage()] );
        }
    }

    public function relatorioTop10Itens(array $dados): array {
        try{ 
            if ( empty($dados['inicio']) || empty($dados['fim']) ) {
                throw DominioException::comProblemas( ['Período inválido.'] );
            }
            $inicio = $dados['inicio'];
            $fim = $dados['fim'];
            $funcionarioCru = $this->repositorioFuncionario->buscarPorCodigo( $dados['funcionario'] );
            $funcionario = ( new ServicoFuncionario($this->repositorioFuncionario) )->mapearFuncionario($funcionarioCru);
            $cargo = $funcionario->getCargo();
            if ($cargo === 'MECANICO') {
                throw DominioException::comProblemas( ['Funcionário não permitido.'] );
            }
            $resultado = $this->repositorioRelatorio->buscarTop10ItensAlugados( $inicio, $fim );
            $linhas = array_map( function (array $linha) {
                return [
                    'codigo' => $linha['codigo'],
                    'descricao' => $linha['descricao'],
                    'quantidade'=> ( (int) $linha['quantidade'] ),
                ];
            }, $resultado);
            return $linhas;
        } catch (RepositorioException $e) {
            throw DominioException::comProblemas( ['Erro ao gerar relatório: ' . $e->getMessage()] );
        }
    }

}

?>