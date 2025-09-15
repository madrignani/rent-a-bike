<?php

use App\Exception\DominioException;
use App\Repositorio\RepositorioClienteEmBDR;
use App\Servico\ServicoCliente;

describe('ServicoCliente', function () {

    beforeAll(function () {
        `cd .. && pnpm run db`;

        $pdo = new PDO('mysql:dbname=rent_a_bike_teste;host=localhost;charset=utf8', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->repositorio = new RepositorioClienteEmBDR($pdo);
        $this->servico = new ServicoCliente($this->repositorio);
    });

    it('Deve retornar um cliente existente pelo código.', function () {
        $cliente = $this->servico->buscarPorCodigo(1); 
        expect($cliente['nome'])->toBe('Edsger Dijkstra');
    });

    it('Deve lançar exceção ao buscar cliente com código inexistente.', function () {
        expect(fn() => $this->servico->buscarPorCodigo(999))->toThrow(new DominioException("Cliente com código 999 não encontrado."));
    });

    it('Deve retornar um cliente existente pelo cpf.', function () {
        $cliente = $this->servico->buscarPorCpf(12345678901); 
        expect($cliente['nome'])->toBe('Linus Torvalds');
    });

    it('Deve lançar exceção ao buscar cliente com cpf inexistente.', function () {
        expect(fn() => $this->servico->buscarPorCodigo(99999999999))->toThrow(new DominioException("Cliente com código 99999999999 não encontrado."));
    });

    it('Deve retornar data de nascimento formatada corretamente.', function () {
        $cliente = $this->servico->buscarPorCodigo(3); 
        expect($cliente['dataNascimento'])->toBe('1912-01-01');
    });

    it('Deve conter todas as chaves esperadas no retorno.', function () {
        $cliente = $this->servico->buscarPorCodigo(2); 
        expect(array_keys($cliente))->toEqual([
            'codigo', 'nome', 'cpf', 'telefone', 'email','endereco', 'fotoUrl', 'dataNascimento'
        ]);
    });

    it('Deve mapear corretamente os dados válidos para um objeto Cliente.', function () {
        $dados = [
            'codigo' => 42,
            'nome' => 'Teste Valido',
            'cpf' => '99999999900',
            'telefone' => '21999999999',
            'email' => 'teste@email.com',
            'endereco' => 'Rua Valida, 1',
            'foto_url' => 'http://exemplo.com/foto.jpg',
            'data_nascimento' => '2005-01-05',
        ];
        $cliente = $this->servico->mapearCliente($dados);
        expect($cliente->getNome())->toBe('Teste Valido');
        expect($cliente->getCpf())->toBe('99999999900');
    });

    it('Deve lançar exceção ao mapear cliente com dados inválidos.', function () {
        $dados = [
            'codigo' => 99,
            'nome' => '', 
            'cpf' => 'cpf inválido', 
            'telefone' => '',
            'email' => 'tudo errado',
            'endereco' => '',
            'foto_url' => '',
            'data_nascimento' => '2025-05-01',
        ];
        expect(fn() => $this->servico->mapearCliente($dados))->toThrow(new DominioException());
    });

    it('Deve lançar exceção ao mapear cliente com nome menor que 3 caracteres.', function () {
        $dados = [
            'codigo' => 100,
            'nome' => 'Ab', 
            'cpf' => '99999999999',
            'telefone' => '21999999999',
            'email' => 'teste@email.com',
            'endereco' => 'Rua Valida, 1',
            'foto_url' => 'http://exemplo.com/foto.jpg',
            'data_nascimento' => '2005-01-05',
        ];
        expect(fn() => $this->servico->mapearCliente($dados))->toThrow(new DominioException("Problemas encontrados: Nome deve possuir entre 3 e 100 caracteres"));
    });

    it('Deve lançar exceção ao mapear cliente com CPF menor que 11 dígitos.', function () {
        $dados = [
            'codigo' => 101,
            'nome' => 'Teste',
            'cpf' => '12345678', 
            'telefone' => '21999999999',
            'email' => 'teste@email.com',
            'endereco' => 'Rua Valida, 1',
            'foto_url' => 'http://exemplo.com/foto.jpg',
            'data_nascimento' => '2005-01-05',
        ];
        expect(fn() => $this->servico->mapearCliente($dados))->toThrow(new DominioException("Problemas encontrados: CPF deve possuir somente 11 números, sem pontuação."));
    });

    it('Deve lançar exceção ao mapear cliente com telefone maior que 11 dígitos.', function () {
        $dados = [
            'codigo' => 102,
            'nome' => 'Teste',
            'cpf' => '12345678901',
            'telefone' => '219999999999999', 
            'email' => 'teste@email.com',
            'endereco' => 'Rua Valida, 1',
            'foto_url' => 'http://exemplo.com/foto.jpg',
            'data_nascimento' => '2005-01-05',
        ];
        expect(fn() => $this->servico->mapearCliente($dados))->toThrow(new DominioException("Problemas encontrados: Telefone deve possuir 10 ou 11 números, sem pontuação."));
    });

});
