<?php

use App\Servico\ServicoDevolucao;
use App\Repositorio\RepositorioDevolucaoEmBDR;
use App\Repositorio\RepositorioAvariaEmBDR;
use App\Repositorio\RepositorioFuncionarioEmBDR;
use App\Repositorio\RepositorioClienteEmBDR;
use App\Repositorio\RepositorioItemEmBDR;
use App\Repositorio\RepositorioFabricanteEmBDR;
use App\Repositorio\RepositorioLocacaoEmBDR;
use App\Transacao\TransacaoComPDO;
use App\Servico\ServicoLocacao;
use App\Servico\ServicoFuncionario;
use App\Servico\ServicoItem;
use App\Servico\ServicoAvaria;
use App\Exception\DominioException;

describe('ServicoDevolucao', function () {

    beforeAll(function () {
        `cd .. && pnpm run db`;

        $pdo = new PDO('mysql:dbname=rent_a_bike_teste;host=localhost;charset=utf8', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioCliente = new RepositorioClienteEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioLocacao = new RepositorioLocacaoEmBDR($pdo);
        $repositorioDevolucao = new RepositorioDevolucaoEmBDR($pdo);
        $repositorioAvaria = new RepositorioAvariaEmBDR($pdo);
        $transacao = new TransacaoComPDO($pdo);
        $servicoLocacao = new ServicoLocacao(
            $repositorioLocacao,
            $repositorioCliente,
            $repositorioFuncionario,
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $servicoFuncionario = new ServicoFuncionario($repositorioFuncionario);
        $servicoItem = new ServicoItem(
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $servicoAvaria = new ServicoAvaria(
            $repositorioFuncionario,
            $repositorioDevolucao,
            $repositorioAvaria,
            $servicoItem
        );
        $this->servico = new ServicoDevolucao(
            $repositorioFuncionario,
            $repositorioCliente,
            $repositorioFabricante,
            $repositorioItem,
            $repositorioLocacao,
            $repositorioDevolucao,
            $servicoLocacao,
            $servicoAvaria,
            $transacao
        );
    });

    it('Deve listar devoluções existentes.', function () {
        $lista = $this->servico->listar();
        expect($lista)->toBeAn('array');
        if (!empty($lista)) {
            $devolucao = $lista[0];
            expect(isset($devolucao['id']))->toBe(true);
            expect(isset($devolucao['locacao_id']))->toBe(true);
            expect(isset($devolucao['valor_pago']))->toBe(true);
            expect(isset($devolucao['data_hora']))->toBe(true);
        }
    });

    it('Deve filtrar devoluções por CPF existente.', function () {
        $resultado = $this->servico->filtrarPorCpf('12345678900');
        expect($resultado)->toBeAn('array');
        if (!empty($resultado)) {
            foreach ($resultado as $devolucao) {
                expect(isset($devolucao['id']))->toBe(true);
                expect(isset($devolucao['data_hora']))->toBe(true);
                expect(isset($devolucao['valor_pago']))->toBe(true);
                expect(isset($devolucao['locacao_id']))->toBe(true);
                expect(isset($devolucao['cliente_codigo']))->toBe(true);
                expect(isset($devolucao['cliente_nome']))->toBe(true);
                expect($devolucao['cliente_codigo'])->toBe(1);
            }
        } else {
            expect($resultado)->toEqual([]);
        }
    });

    it('Deve cadastrar devolução sem avarias para locação em andamento com sucesso.', function () {
        $dados = [
            'locacao' => (object) ['id' => 6],
            'funcionario' => (object) ['codigo' => 1],
            'valorPago' => 100.00
        ];
        $resultado = $this->servico->cadastrar($dados);
        expect($resultado)->toBeAn('array');
        expect(isset($resultado['id']))->toBe(true);
        expect($resultado['locacaoId'])->toBe(6);
        expect($resultado['funcionarioId'])->toBe(1);
        expect($resultado['valorPago'])->toBe(100.00);
        expect(isset($resultado['avarias']))->toBe(true);
        expect($resultado['avarias'])->toEqual([]);
    });

    it('Deve lançar excessão ao tentar cadastrar devolução sem avarias com Funcionário com cargo não permitido', function () {
        $dados = [
            'locacao' => (object) ['id' => 6],
            'funcionario' => (object) ['codigo' => 3],
            'valorPago' => 100.00
        ];
        expect(function () use ($dados) {$this->servico->cadastrar($dados);})->toThrow(new DominioException());
    });

    it('Deve lançar exceção ao tentar cadastrar devolução com locação inexistente.', function () {
        $dados = [
            'locacao' => (object) ['id' => 999], 
            'funcionario' => (object) ['codigo' => 1],
            'valorPago' => 999.00
        ];
        expect(function () use ($dados) {$this->servico->cadastrar($dados);})->toThrow(new DominioException());
    });

    it('Deve lançar exceção ao tentar cadastrar devolução para locação já finalizada.', function () {
        $dados = [
            'locacao' => (object) ['id' => 5], 
            'funcionario' => (object) ['codigo' => 1],
            'valorPago' => 999.00
        ];
        expect(function () use ($dados) {$this->servico->cadastrar($dados);})->toThrow(new DominioException());
    });
});
