<?php

use App\Servico\ServicoLocacao;
use App\Repositorio\RepositorioLocacaoEmBDR;
use App\Repositorio\RepositorioClienteEmBDR;
use App\Repositorio\RepositorioFuncionarioEmBDR;
use App\Repositorio\RepositorioItemEmBDR;
use App\Repositorio\RepositorioFabricanteEmBDR;
use App\Transacao\TransacaoComPDO;
use App\Exception\DominioException;
use App\Modelo\Locacao;
use App\Modelo\Cliente;
use App\Modelo\Funcionario;
use App\Modelo\Cargo;
use App\Modelo\Item;
use App\Modelo\Fabricante;

describe('ServicoLocacao', function () {

    beforeAll(function () {
        `cd .. && pnpm run db`;

        $pdo = new PDO('mysql:dbname=rent_a_bike_teste;host=localhost;charset=utf8', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $repositorioLocacao = new RepositorioLocacaoEmBDR($pdo);
        $repositorioCliente = new RepositorioClienteEmBDR($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $transacao = new TransacaoComPDO($pdo);

        $this->servico = new ServicoLocacao(
            $repositorioLocacao,
            $repositorioCliente,
            $repositorioFuncionario,
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
    });

    it('Deve listar locações existentes.', function () {
        $locacoes = $this->servico->listar();
        expect($locacoes)->toBeAn('array');
        if (count($locacoes) > 0) {
            $locacao = $locacoes[0];
            expect(array_key_exists('id', $locacao))->toBe(true);
            expect(array_key_exists('clienteNome', $locacao))->toBe(true);
            expect(array_key_exists('clienteTelefone', $locacao))->toBe(true);
        }
    });

    it('deve cadastrar uma nova locação com sucesso (já verifica o método de mapearLocacao e FormatarLocacaoSimples junto).', function(){
        $dados = [
            'cliente' => (object) ['codigo' => 3],
            'funcionario' => (object) ['codigo' => 2],
            'itens' => array_map(fn($codigo) => (object) ['codigo' => $codigo], [1]),
            'horasContratadas' => 4,
            'status' => 'EM_ANDAMENTO'
        ];
        $resultado = $this->servico->cadastrar($dados);
        expect($resultado)->toBeAn('array');
        expect(isset($resultado['id']))->toBe(true);
        expect($resultado['id'])->toBeA('integer');
        expect($resultado['id'])->toBeGreaterThan(0);
    });

    it('deve filtrar locação existente por id (já verifica o método formatarLocacaoCompleta junto).', function () {
        $resultado = $this->servico->filtrarPorId(1);
        expect($resultado)->toBeAn('array');
        expect(count($resultado))->toBe(1);
        $locacao = $resultado[0];
        expect(isset($locacao['id']))->toBe(true);
        expect($locacao['id'])->toBeA('integer');
        expect($locacao['id'])->toBe(1);
    });

    it('deve filtrar locações existentes por CPF (já verifica o método formatarLocacaoCompleta junto).', function () {
        $cpf = '12345678900';
        $resultado = $this->servico->filtrarPorCpf($cpf);
        expect($resultado)->toBeAn('array');
        if (!empty($resultado)) {
            foreach ($resultado as $locacao) {
                expect(isset($locacao['clienteCodigo']))->toBe(true);
                expect($locacao['clienteCodigo'])->toBeA('integer');
                expect($locacao['clienteCodigo'])->toBe(1);
            }
        } else {
            expect($resultado)->toEqual([]);
        }
    });

    it('deve mapear locação para devolução com sucesso.', function () {
        $cliente = new Cliente(
            1,
            'Teste Cliente',
            '12345678900',
            '11999999999',
            'email@test.com',
            'Rua Teste, 1',
            null,
            new \DateTime('2000-01-01')
        );
        $funcionario = new Funcionario(
            4,
            'Teste Funcionario',
            '12345678900',
            Cargo::ATENDENTE,
            str_repeat('a', 128),
            str_repeat('b', 32)
        );
        $fabricanteSimulado = new Fabricante(1, 'Teste');
        $item = new Item(
            1,
            'Modelo Teste',
            'Descricao Teste',
            10.0,
            $fabricanteSimulado,
            [],
            true
        );
        $dataHora = new \DateTime('2025-06-30 10:00:00');
        $itens = [$item];
        $locacao = $this->servico->mapearLocacaoParaDevolucao(
            99,
            $dataHora,
            $cliente,
            $funcionario,
            $itens,
            9,
            'FINALIZADA'
        );
        expect($locacao)->toBeAnInstanceOf(Locacao::class);
        expect($locacao->getId())->toBe(99);
        expect($locacao->getDataHora()->format('Y-m-d H:i:s'))->toBe('2025-06-30 10:00:00');
        expect($locacao->getHorasContratadas())->toBe(9);
        expect($locacao->getStatus())->toBe('FINALIZADA');
        expect($locacao->getCliente()->getCodigo())->toBe(1);
        expect($locacao->getFuncionario()->getCodigo())->toBe(4);
        expect(count($locacao->getItens()))->toBe(1);
    });

});
