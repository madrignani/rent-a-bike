<?php

namespace App\Servico;

use App\Repositorio\RepositorioItem;
use App\Repositorio\RepositorioFabricante;
use App\Modelo\Item;
use App\Modelo\Fabricante;
use App\Modelo\Avaria;
use App\Exception\DominioException;
use App\Transacao\Transacao;

class ServicoItem {
    private RepositorioItem $repositorio;
    private RepositorioFabricante $repositorioFabricante;
    private Transacao $transacao;

    public function __construct(RepositorioItem $repositorioItem, RepositorioFabricante $repositorioFabricante, Transacao $transacao) {
        $this->repositorio = $repositorioItem;
        $this->repositorioFabricante = $repositorioFabricante;
        $this->transacao = $transacao;
    }

    public function buscarPorCodigo(int $codigo): array {
        $dados = $this->repositorio->buscarPorCodigo($codigo);
        if (!$dados) {
            throw new DominioException( "Item com código {$codigo} não encontrado." );
        }
        $item = $this->mapearItem($dados);
        $avariasDados = $this->repositorio->buscarAvariasPorItem($codigo);
        $avarias = [];
        foreach ($avariasDados as $av) {
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
        $item->setAvarias($avarias);
        return $this->converterParaArray($item);
    }

    public function atualizarDisponibilidade(int $codigo, bool $disponivel): void {
        try {
            $this->transacao->iniciar();
            $this->repositorio->atualizarDisponibilidade($codigo, $disponivel);
            $this->transacao->finalizar();
        } catch (RepositorioException | DominioException $e) {
            $this->transacao->desfazer();
            throw new DominioException('Erro ao atualizar disponibilidade: ' . $e->getMessage());
        }
    }

    public function buscarObjetoPorCodigo(int $codigo): Item {
        $dados = $this->repositorio->buscarPorCodigo($codigo);
        if (!$dados) {
            throw new DominioException("Item com código {$codigo} não encontrado.");
        }
        return $this->mapearItem($dados);
    }

    public function mapearItem(array $dados): Item {
        $dadosFabricante = $this->repositorioFabricante->buscarPorCodigo($dados['fabricante_codigo']);
        if (!$dadosFabricante) {
            throw new DominioException("Fabricante com código {$dados['fabricante_codigo']} não encontrado.");
        }
        $fabricante = new Fabricante(
            $dadosFabricante['codigo'],
            $dadosFabricante['descricao']
        );
        $item = new Item(
            $dados['codigo'],
            $dados['modelo'],
            $dados['descricao'],
            $dados['valor_hora'],
            $fabricante,
            [],
            $dados['disponivel']
        );
        $problemas = $item->validar();
        if (!empty($problemas)) {
            throw DominioException::comProblemas($problemas);
        }
        return $item;
    }

    private function converterParaArray(Item $item): array {
        return [
            'codigo' => $item->getCodigo(),
            'modelo' => $item->getModelo(),
            'descricao' => $item->getDescricao(),
            'valorHora' => $item->getValorHora(),
            'fabricante' => [
                'codigo' => $item->getFabricante()->getCodigo(),
                'descricao' => $item->getFabricante()->getDescricao()
            ],
            'avarias' => array_map( function (array $a) {
                return [
                    'avariaId' => (int)$a['id'],
                    'avariaDevolucaoId' => (int)$a['devolucaoId'],
                    'avariaItemCodigo' => (int)$a['itemCodigo'],
                    'avariaDataHora' => (new \DateTime($a['dataHora']))->format('Y-m-d H:i:s'),
                    'avariaAvaliadorCodigo'=> (int)$a['avaliadorCodigo'],
                    'avariaDescricao' => $a['descricao'],
                    'avaraiaCaminhoFoto' => $a['caminhoFoto'],
                    'avariaValorCobrar' => (float)$a['valorCobrar'],
                ];
            }, 
            $item->getAvarias() ),
            'disponivel' => $item->getDisponivel()
        ];
    }
}

?>