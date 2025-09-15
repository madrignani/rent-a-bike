<?php

namespace App\Servico;

use App\Repositorio\RepositorioLocacao;
use App\Repositorio\RepositorioCliente;
use App\Repositorio\RepositorioFuncionario;
use App\Repositorio\RepositorioItem;
use App\Repositorio\RepositorioFabricante;
use App\Servico\ServicoCliente;
use App\Servico\ServicoFuncionario;
use App\Servico\ServicoItem;
use App\Modelo\Locacao;
use App\Modelo\Cliente;
use App\Modelo\Funcionario;
use App\Modelo\Item;
use App\Exception\DominioException;
use App\Exception\RepositorioException;
use App\Transacao\Transacao;

class ServicoLocacao {
    private RepositorioLocacao $repositorioLocacao;
    private RepositorioCliente $repositorioCliente;
    private RepositorioFuncionario $repositorioFuncionario;
    private RepositorioItem $repositorioItem;
    private RepositorioFabricante $repositorioFabricante;
    private Transacao $transacao;

    public function __construct(
        RepositorioLocacao $repositorioLocacao, RepositorioCliente $repositorioCliente,
        RepositorioFuncionario $repositorioFuncionario, RepositorioItem $repositorioItem, RepositorioFabricante $repositorioFabricante, Transacao $transacao
    ) {
        $this->repositorioLocacao = $repositorioLocacao;
        $this->repositorioCliente = $repositorioCliente;
        $this->repositorioFuncionario = $repositorioFuncionario;
        $this->repositorioItem = $repositorioItem;
        $this->repositorioFabricante  = $repositorioFabricante;
        $this->transacao = $transacao;
    }

    public function cadastrar(array $dados): array {
        $this->transacao->iniciar();
        try {
            $clienteCru = $this->repositorioCliente->buscarPorCodigo( (int) $dados['cliente']->codigo );
            $cliente = ( new ServicoCliente($this->repositorioCliente) )->mapearCliente($clienteCru);
            $funcionarioCru = $this->repositorioFuncionario->buscarPorCodigo( (int) $dados['funcionario']->codigo );
            $funcionario = ( new ServicoFuncionario($this->repositorioFuncionario) )->mapearFuncionario($funcionarioCru);
            if ($funcionario->getCargo() === 'MECANICO') {
                throw DominioException::comProblemas(['Funcionário não permitido.']);
            }
            $servicoItem = new ServicoItem(
                $this->repositorioItem,
                $this->repositorioFabricante,
                $this->transacao
            );
            $itens = [];
            foreach ($dados['itens'] as $i) {
                $codigo = (int) $i->codigo;
                $itens[] = $servicoItem->buscarObjetoPorCodigo($codigo);
            }
            $locacao = $this->mapearLocacao(
                $cliente,
                $funcionario,
                $itens,
                (int) $dados['horasContratadas'],
                $dados['status']
            );
            $idGerado = $this->repositorioLocacao->salvar($locacao);
            foreach ($itens as $itemObj) {
                $this->repositorioItem->atualizarDisponibilidade($itemObj->getCodigo(), false);
            }
            $this->transacao->finalizar();
            return $this->formatarLocacaoSimples($locacao, $idGerado);
        }
        catch (RepositorioException | DominioException $e) {
            $this->transacao->desfazer();
            throw DominioException::comProblemas([
                'Erro ao cadastrar locação: ' . $e->getMessage()
            ]);
        }
    }

    public function listar(): array{
        $locacoes = $this->repositorioLocacao->listar();
        $listaFormatada = [];
        foreach ($locacoes as $locacao) {
            $listaFormatada[] = [
                'id' => ( (int) $locacao['id'] ),
                'dataHora' => $locacao['data_hora'],
                'horasContratadas' => ( (int) $locacao['horas_contratadas'] ),
                'entregaEsperada' => $locacao['entrega_esperada'],
                'status' => $locacao['status'],
                'clienteNome' => $locacao['cliente_nome'],
                'clienteTelefone' => $locacao['cliente_telefone'],
            ];
        }
        return $listaFormatada;
    }

    public function filtrarPorId(int $id): array {
        $linha = $this->repositorioLocacao->buscarPorCodigo($id);
        if ($linha === null) {
            return [];
        }
        return $this->formatarLocacaoCompleta([$linha]);
    }
    
    public function filtrarPorCpf(string $cpf): array {
        $linhas = $this->repositorioLocacao->listarPorCpfCliente($cpf);
        return $this->formatarLocacaoCompleta($linhas);
    }

    public function mapearLocacao(Cliente $cliente, Funcionario $funcionario, array $itens, int $horas, string $status): Locacao {
        $locacao = new Locacao(
            0,
            new \DateTime(),
            $horas,
            $status,
            $cliente,
            $funcionario,
            $itens
        );
        $problemas = $locacao->validar();
        if (!empty($problemas)) {
            throw DominioException::comProblemas($problemas);
        }
        return $locacao;
    }

    public function mapearLocacaoParaDevolucao(int $id, \DateTime $dataHora, Cliente $cliente, Funcionario $funcionarioLocacao, array $itens, int $horas, string $status): Locacao {
        $locacao = new Locacao(
            $id,
            $dataHora,
            $horas,
            $status,
            $cliente,
            $funcionarioLocacao,
            $itens
        );
        $problemas = $locacao->validar();
        if (!empty($problemas)) {
            throw DominioException::comProblemas($problemas);
        }
        return $locacao;
    }

    private function formatarLocacaoSimples(Locacao $locacao, int $id): array {
        return [
            'id' => $id,
            'dataHora' => $locacao->getDataHora()->format('Y-m-d H:i:s'),
            'horasContratadas' => $locacao->getHorasContratadas(),
            'status' => $locacao->getStatus(),
            'clienteCodigo' => ['codigo' => $locacao->getCliente()->getCodigo()],
            'funcionarioCodigo' => ['codigo' => $locacao->getFuncionario()->getCodigo()],
            'itens' => array_map( fn(Item $it) => ['codigo' => $it->getCodigo()], $locacao->getItens() )
        ];
    }

    private function formatarLocacaoCompleta(array $linhas): array {
        $saida = [];
        foreach ($linhas as $locacao) {
            $itensFormatados = [];
            foreach ($locacao['itens'] as $item) {
                $avariasCru = $this->repositorioItem->buscarAvariasPorItem( (int)$item['item_codigo'] );
                $avarias = [];
                foreach ($avariasCru as $av) {
                    $avarias[] = [
                        'id' => (int) $av['id'],
                        'devolucaoId' => (int) $av['devolucao_id'],
                        'itemCodigo' => (int) $av['item_codigo'],
                        'dataHora' => $av['data_hora'],
                        'avaliadorCodigo' => (int) $av['avaliador_codigo'],
                        'descricao' => $av['descricao'],
                        'caminhoFoto' => $av['caminho_foto'],
                        'valorCobrar' => (float) $av['valor_cobrar'],
                    ];
                }
                $itensFormatados[] = [
                    'codigoItem' => ( (int) $item['item_codigo'] ),
                    'modeloItem' => $item['item_modelo'],
                    'descricaoItem' => $item['item_descricao'],
                    'valorHoraItem' => ( (float) $item['item_valor_hora'] ),
                    'fabricanteCodigo' => ( (int) $item['item_fabricante_codigo'] ),
                    'disponivel' => ( (bool) $item['item_disponivel'] ),
                    'avarias' => $avarias,
                ];
            }
            $saida[] = [
                'id' => ( (int) $locacao['id'] ),
                'dataHora' => $locacao['data_hora'],
                'horasContratadas' => ( (int) $locacao['horas_contratadas'] ),
                'entregaEsperada' => $locacao['entrega_esperada'],
                'status' => $locacao['status'],
                'clienteCodigo' => ( (int) $locacao['cliente_codigo'] ),
                'funcionarioCodigo' => ( (int) $locacao['funcionario_codigo'] ),
                'itens' => $itensFormatados,
            ];
        }
        return $saida;
    }

}

?>