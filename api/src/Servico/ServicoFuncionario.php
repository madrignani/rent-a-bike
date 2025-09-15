<?php

namespace App\Servico;

use App\Modelo\Cargo;
use App\Modelo\Funcionario;
use App\Repositorio\RepositorioFuncionario; 
use App\Exception\DominioException;

class ServicoFuncionario {
    private $repositorioFuncionario;

    public function __construct(RepositorioFuncionario $repositorioFuncionario) {
        $this->repositorioFuncionario = $repositorioFuncionario;
    }

    public function listar(): array {
        $dadosFuncionarios = $this->repositorioFuncionario->listar();
        $funcionarios = [];
        foreach ($dadosFuncionarios as $dados) {
            $funcionario = $this->mapearFuncionario($dados);
            $funcionarios[] = $this->converterParaArray($funcionario);
        }
        return $funcionarios;
    }

    private function buscaFuncionarioPorCPF(string $cpf){
        $dados = $this->repositorioFuncionario->buscarPorCPF($cpf);
        if (!$dados) {
            throw DominioException::comProblemas(["Funcionário com cpf $cpf não encontrado."]);
        }
        return $funcionario = $this->mapearFuncionario($dados);
    }

    public function buscarPorCodigo(int $codigo): array {
        $dados = $this->repositorioFuncionario->buscarPorCodigo($codigo);
        if (!$dados) {
            throw DominioException::comProblemas(["Funcionário com código $codigo não encontrado."]);
        }
        $funcionario = $this->mapearFuncionario($dados);
        return $this->converterParaArray($funcionario);
    }
    
    public function buscarPorCPF(string $cpf): array {
        $funcionario = $this->buscaFuncionarioPorCPF($cpf);
        return $this->converterCompletoParaArray($funcionario);
    }

    public function buscarPorCPFParaFront(string $cpf): array {
        $funcionario = $this->buscaFuncionarioPorCPF($cpf);
        return $this->converterParaArray($funcionario);
    }

    public function mapearFuncionario(array $dados): Funcionario {
        $funcionario = new Funcionario(
            (int) $dados['codigo'],
            (string) $dados['nome'],
            (string) $dados['cpf'],
            Cargo::from($dados['cargo']),
            (string) $dados['senha_hash'],
            (string) $dados['salt']
        );
        $problemas = $funcionario->validar();
        if ( !empty($problemas) ) {
            throw DominioException::comProblemas($problemas);
        }
        return $funcionario;
    }

    private function converterParaArray(Funcionario $funcionario): array {
        return [
        'codigo' => $funcionario->getCodigo(),
        'nome' => $funcionario->getNome(),
        'cpf' => $funcionario->getCpf(),
        'cargo' => $funcionario->getCargo()->value
        ];
    }

    private function converterCompletoParaArray(Funcionario $funcionario): array {
        return [
            'codigo' => $funcionario->getCodigo(),
            'nome' => $funcionario->getNome(),
            'cpf' => $funcionario->getCpf(),
            'cargo' => $funcionario->getCargo()->value,
            'senha_hash' => $funcionario->getSenhaHash(),
            'salt' => $funcionario->getSalt()
        ];
    }
}

?>