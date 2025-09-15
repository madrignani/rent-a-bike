<?php

use App\Servico\ServicoRelatorio;
use App\Repositorio\RepositorioRelatorioEmBDR;
use App\Repositorio\RepositorioFuncionarioEmBDR;
use App\Exception\DominioException;

describe('ServicoRelatorio', function () {

    beforeAll(function () {
        `cd .. && pnpm run db`;
        $pdo = new PDO('mysql:dbname=rent_a_bike_teste;host=localhost;charset=utf8', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $repositorioRelatorio = new RepositorioRelatorioEmBDR($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);

        $this->servico = new ServicoRelatorio(
            $repositorioRelatorio,
            $repositorioFuncionario
        );
    });

    it('Deve gerar relatório de locações devolvidas com sucesso.', function () {
        $dados = [
            'inicio' => '2024-01-01',
            'fim' => '2025-12-31',
            'funcionario' => 1
        ];
        $resultado = $this->servico->relatorioLocacoesDevolvidas($dados);
        expect($resultado)->toBeAn('array');
        if (!empty($resultado)) {
            foreach ($resultado as $linha) {
                expect(isset($linha['data']))->toBe(true);
                expect(isset($linha['total_pago']))->toBe(true);
            }
        }
    });

    it('Deve gerar relatório dos 10 itens mais alugados com sucesso.', function () {
        $dados = [
            'inicio' => '2024-01-01',
            'fim' => '2025-12-31',
            'funcionario' => 1 
        ];
        $resultado = $this->servico->relatorioTop10Itens($dados);
        expect($resultado)->toBeAn('array');
        if (!empty($resultado)) {
            foreach ($resultado as $linha) {
                expect(isset($linha['codigo']))->toBe(true);
                expect(isset($linha['descricao']))->toBe(true);
                expect(isset($linha['quantidade']))->toBe(true);
            }
        }
    });

    it('Deve lançar exceção se datas de início ou fim estiverem vazias ao gerar relatório de locações devolvidas.', function () {
        $dados = [
            'inicio' => '',
            'fim' => '',
            'funcionario' => 1];
        expect(fn() => $this->servico->relatorioLocacoesDevolvidas($dados))->toThrow(new DominioException('Problemas encontrados: Parâmetros de período inválidos.'));
    });

    it('Deve lançar exceção se período for inválido no relatório Top 10 itens.', function () {
        $dados = [
            'inicio' => '',
            'fim' => '',
            'funcionario' => 1];
        expect(fn() => $this->servico->relatorioTop10Itens($dados))->toThrow(new DominioException('Problemas encontrados: Período inválido.'));
    });

});