<?php

use App\Exception\DominioException;
use App\Repositorio\RepositorioItemEmBDR;
use App\Repositorio\RepositorioFabricanteEmBDR;
use App\Servico\ServicoItem;
use App\Transacao\TransacaoComPDO;


describe('ServicoItem', function () {

    beforeAll(function () {
        `cd .. && pnpm run db`;

        $pdo = new PDO('mysql:dbname=rent_a_bike_teste;host=localhost;charset=utf8', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $transacao = new TransacaoComPDO($pdo);

        $this->servico = new ServicoItem($repositorioItem, $repositorioFabricante, $transacao);
    });

    it('Deve retornar um item existente pelo código.', function () {
        $item = $this->servico->buscarPorCodigo(1);
        expect($item['codigo'])->toBe(1);
        expect(isset($item['modelo']))->toBe(true);
        expect(isset($item['fabricante']))->toBe(true);
    });

    it('Deve lançar exceção ao buscar item com código inexistente.', function () {
        expect(fn() => $this->servico->buscarPorCodigo(999))->toThrow(new DominioException("Item com código 999 não encontrado."));
    });

    it('Deve atualizar disponibilidade do item.', function () {
        $this->servico->atualizarDisponibilidade(1, true);
        $item = $this->servico->buscarObjetoPorCodigo(1);
        expect($item->getDisponivel())->toBe(true);

        $this->servico->atualizarDisponibilidade(1, false);
        $item = $this->servico->buscarObjetoPorCodigo(1);
        expect($item->getDisponivel())->toBe(false);
    });

    it('Deve mapear corretamente os dados válidos para um objeto Item.', function () {
        $dados = [
            'codigo' => 42,
            'modelo' => 'Modelo valido',
            'descricao' => 'Descrição valido',
            'valor_hora' => 15.5,
            'fabricante_codigo' => 1,
            'avaria' => null,
            'disponivel' => true
        ];

        $item = $this->servico->mapearItem($dados);
        expect($item->getCodigo())->toBe(42);
        expect($item->getModelo())->toBe('Modelo valido');
        expect($item->getFabricante()->getCodigo())->toBe(1);
    });

    it('Deve lançar exceção ao mapear item com fabricante inexistente.', function () {
        $dados = [
            'codigo' => 42,
            'modelo' => 'Teste',
            'descricao' => 'Teste',
            'valor_hora' => 15.5,
            'fabricante_codigo' => 9999,
            'avaria' => null,
            'disponivel' => true
        ];

        expect(fn() => $this->servico->mapearItem($dados))->toThrow(new DominioException("Fabricante com código 9999 não encontrado."));
    });

    it('Deve lançar exceção ao mapear item com dados inválidos.', function () {
        $dados = [
            'codigo' => 0,
            'modelo' => 'TESTE',
            'descricao' => 'TESTE',
            'valor_hora' => -10,
            'fabricante_codigo' => 1,
            'avaria' => null,
            'disponivel' => true
        ];

        expect(fn() => $this->servico->mapearItem($dados))->toThrow(new DominioException("Problemas encontrados: Valor por hora deve ser positivo."));
    });

    it('Deve conter todas as chaves esperadas no retorno do array.', function () {
        $itemArray = $this->servico->buscarPorCodigo(1);
        expect(array_keys($itemArray))->toEqual([
            'codigo',
            'modelo',
            'descricao',
            'valorHora',
            'fabricante',
            'avarias',
            'disponivel'
        ]);
    });

});
