<?php 

namespace App\Servico;

use App\Repositorio\RepositorioCliente;
use App\Modelo\Cliente;
use App\Exception\DominioException;

class ServicoCliente {
    private RepositorioCliente $repositorio;

    public function __construct(RepositorioCliente $repositorio) {
        $this->repositorio = $repositorio;
    }

    public function buscarPorCodigo(int $codigo): array {
        $dados = $this->repositorio->buscarPorCodigo($codigo);
        if (!$dados) {
            throw new DominioException("Cliente com código $codigo não encontrado.");
        }
        $cliente = $this->mapearCliente($dados);
        return $this->converterParaArray($cliente);
    }

    public function buscarPorCpf(string $cpf): array {
        $dados = $this->repositorio->buscarPorCpf($cpf);
        if (!$dados) {
            throw new DominioException("Cliente com CPF $cpf não encontrado.");
        }
        $cliente = $this->mapearCliente($dados);
        return $this->converterParaArray($cliente);
    }

    public function mapearCliente(array $dados): Cliente {
        $cliente = new Cliente(
            $dados['codigo'],
            $dados['nome'],
            $dados['cpf'],
            $dados['telefone'],
            $dados['email'],
            $dados['endereco'],
            $dados['foto_url'] ?? null,
            new \DateTime($dados['data_nascimento'])
        );
        $problemas = $cliente->validar();
        if ( !empty($problemas) ) {
            throw DominioException::comProblemas($problemas);
        }
        return $cliente;
    }

    private function converterParaArray(Cliente $cliente): array {
        return [
            'codigo' => $cliente->getCodigo(),
            'nome' => $cliente->getNome(),
            'cpf' => $cliente->getCpf(),
            'telefone' => $cliente->getTelefone(),
            'email' => $cliente->getEmail(),
            'endereco' => $cliente->getEndereco(),
            'fotoUrl' => $cliente->getFotoUrl(),
            'dataNascimento' => $cliente->getDataNascimento()->format('Y-m-d')
        ];
    }
    
}

?>