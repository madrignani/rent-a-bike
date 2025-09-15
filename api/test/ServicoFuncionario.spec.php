<?php

use App\Servico\ServicoFuncionario;
use App\Repositorio\RepositorioFuncionarioEmBDR;
use App\Exception\RepositorioException;

describe('ServicoFuncionario', function () {

    beforeAll(function () {
        `cd .. && pnpm run db`;

        $pdo = new PDO('mysql:dbname=rent_a_bike_teste;host=localhost;charset=utf8', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $repositorio = new RepositorioFuncionarioEmBDR($pdo);
        $this->servico = new ServicoFuncionario($repositorio);
    });

    it('Deve listar funcionários existentes.', function () {
        $funcionarios = $this->servico->listar();
        expect($funcionarios)->toBeAn('array');
        expect(count($funcionarios))->toBeGreaterThan(0);
        $funcionario = $funcionarios[0];
        expect(isset($funcionario['codigo']))->toBe(true);
        expect(isset($funcionario['nome']))->toBe(true);
        expect(isset($funcionario['cpf']))->toBe(true);
        expect(isset($funcionario['cargo']))->toBe(true);
    });

    it('Deve buscar funcionário por código existente.', function () {
        $dados = $this->servico->buscarPorCodigo(1);
        expect($dados)->toBeAn('array');
        expect($dados['codigo'])->toBe(1);
        expect($dados['nome'])->toBe('João da Silva');
        expect($dados['cpf'])->toBe('12345678997');
        expect($dados['cargo'])->toBe('GERENTE');
    });

    it('Deve lançar exceção ao buscar funcionário com código inexistente.', function () {
        expect(fn() => $this->servico->buscarPorCodigo(9999))->toThrow(new RepositorioException("Funcionário com código 9999 não encontrado."));
    });

    it('Deve buscar funcionário por CPF existente (já verifica o método de converterCompletoParaArray).', function () {
        $dados = $this->servico->buscarPorCPF('12345678997');
        expect($dados)->toBeAn('array');
        expect($dados['cpf'])->toBe('12345678997');
        expect($dados['nome'])->toBe('João da Silva');
        expect(isset($dados['senha_hash']))->toBe(true);
        expect(isset($dados['salt']))->toBe(true);
    });

    it('Deve lançar exceção ao buscar funcionário com CPF inexistente.', function () {
        expect(fn() => $this->servico->buscarPorCPF('99999999999'))->toThrow(new RepositorioException("Funcionário com CPF 99999999999 não encontrado."));
    });

    it('Deve buscar funcionário por CPF para front (Retorna array sem senha e sem sal e verifica o método converterParaArray).', function () {
        $dados = $this->servico->buscarPorCPFParaFront('12345678997');
        expect($dados)->toBeAn('array');
        expect($dados['codigo'])->toBe(1);
        expect($dados['nome'])->toBe('João da Silva');
        expect($dados['cpf'])->toBe('12345678997');
        expect($dados['cargo'])->toBe('GERENTE');
        expect(!isset($dados['senha_hash']))->toBe(true);
        expect(!isset($dados['salt']))->toBe(true);
    });

});
