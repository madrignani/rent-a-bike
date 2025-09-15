<?php

namespace App\Servico;

use App\Repositorio\RepositorioDevolucao;
use App\Repositorio\RepositorioFuncionario;
use App\Repositorio\RepositorioLocacao;
use App\Repositorio\RepositorioCliente;
use App\Repositorio\RepositorioItem;
use App\Repositorio\RepositorioFabricante;
use App\Servico\ServicoLocacao;
use App\Servico\ServicoFuncionario;
use App\Servico\ServicoAvaria;
use App\Modelo\Devolucao;
use App\Exception\DominioException;
use App\Exception\RepositorioException;
use App\Transacao\Transacao;
use App\Modelo\Funcionario;
use App\Modelo\Locacao;
use DateTime;

class ServicoDevolucao {
    private RepositorioFuncionario $repositorioFuncionario;
    private RepositorioCliente $repositorioCliente;
    private RepositorioFabricante $repositorioFabricante;
    private RepositorioItem $repositorioItem;
    private RepositorioLocacao $repositorioLocacao;
    private RepositorioDevolucao $repositorioDevolucao;
    private ServicoLocacao $servicoLocacao;
    private ServicoAvaria $servicoAvaria;
    private Transacao $transacao;

    public function __construct(
        RepositorioFuncionario $repositorioFuncionario,
        RepositorioCliente $repositorioCliente,
        RepositorioFabricante $repositorioFabricante,
        RepositorioItem $repositorioItem,
        RepositorioLocacao $repositorioLocacao,
        RepositorioDevolucao $repositorioDevolucao,
        ServicoLocacao $servicoLocacao,
        ServicoAvaria $servicoAvaria,
        Transacao $transacao
    ) {
        $this->repositorioFuncionario = $repositorioFuncionario;
        $this->repositorioCliente = $repositorioCliente;
        $this->repositorioFabricante = $repositorioFabricante;
        $this->repositorioItem = $repositorioItem;
        $this->repositorioLocacao = $repositorioLocacao;
        $this->repositorioDevolucao = $repositorioDevolucao;
        $this->servicoLocacao = $servicoLocacao;
        $this->servicoAvaria = $servicoAvaria;
        $this->transacao = $transacao;
    }

    public function cadastrar(array $dados): array {
        $this->transacao->iniciar();
        try {
            $locacaoId = ( (int) $dados['locacao']->id );
            $locacaoDados = $this->repositorioLocacao->buscarPorCodigo( $locacaoId );
            if (!$locacaoDados) {
                throw DominioException::comProblemas( ['Locação não encontrada.'] );
            }
            if ( $locacaoDados['status'] === 'FINALIZADA' ) {
                throw DominioException::comProblemas( ['Não é possível registrar Devolução para uma Locação finalizada.'] );
            }
            $funcionarioLocacaoCru = $this->repositorioFuncionario->buscarPorCodigo( (int) $locacaoDados['funcionario_codigo'] );
            $funcionarioLocacao = ( new ServicoFuncionario($this->repositorioFuncionario) )->mapearFuncionario($funcionarioLocacaoCru );
            $clienteCru = $this->repositorioCliente->buscarPorCodigo( (int) $locacaoDados['cliente_codigo'] );
            $cliente = ( new ServicoCliente($this->repositorioCliente) )->mapearCliente($clienteCru);
            $itensDaLocacao = $this->repositorioLocacao->buscarItensLocacao($locacaoId);
            $servicoItem = new ServicoItem(
                $this->repositorioItem,
                $this->repositorioFabricante,
                $this->transacao
            );
            $itens = [];
            foreach ($itensDaLocacao as $i) {
                $itens[] = $servicoItem->buscarObjetoPorCodigo( (int) $i['item_codigo'] );
            }
            $funcionarioCru = $this->repositorioFuncionario->buscarPorCodigo( (int) $dados['funcionario']->codigo );
            $funcionario = ( new ServicoFuncionario($this->repositorioFuncionario) )->mapearFuncionario($funcionarioCru);
            if ($funcionario->getCargo() === 'MECANICO') {
                throw DominioException::comProblemas( ['Funcionário não autorizado para registrar Devolução.'] );
            }
            $dataHoraLocacao = new \DateTime($locacaoDados['data_hora']);
            $horas = ( (int) $locacaoDados['horas_contratadas'] );
            $status = $locacaoDados['status'];
            $locacaoObj = $this->servicoLocacao->mapearLocacaoParaDevolucao(
                $locacaoId,
                new \DateTime( $locacaoDados['data_hora'] ),
                $cliente,
                $funcionarioLocacao,
                $itens,
                ( (int) $locacaoDados['horas_contratadas'] ),
                $locacaoDados['status']
            );
            $devolucao = $this->mapearDevolucao(
                $funcionario,
                $locacaoObj,
                new DateTime(),
                ( (float) $dados['valorPago'] )
            );
            $idGerado = $this->repositorioDevolucao->salvar($devolucao);
            $this->repositorioLocacao->atualizarStatus( $locacaoObj->getId(), 'FINALIZADA' );
            foreach ($itensDaLocacao as $item) {
                $this->repositorioItem->atualizarDisponibilidade( (int) $item['item_codigo'], true );
            }
            $avariasCriadas = [];
            if ( isset($dados['avarias']) && is_array($dados['avarias']) ) {
                foreach ($dados['avarias'] as $avariaDados) {
                    $dadosAvaria = [
                        'devolucaoId' => $idGerado,
                        'itemCodigo' => $avariaDados->itemCodigo,
                        'dataHora' => $devolucao->getDataHora()->format('Y-m-d H:i:s'),
                        'avaliadorCodigo' => $avariaDados->avaliadorCodigo,
                        'descricao' => $avariaDados->descricao,
                        'valorCobrar' => $avariaDados->valorCobrar,
                        'caminhoFoto' => $avariaDados->caminhoFoto,
                        'arquivoBase64' => $avariaDados->arquivoBase64
                    ];
                    $avariaCriada = $this->servicoAvaria->cadastrar($dadosAvaria);
                    $avariasCriadas[] = $avariaCriada;
                }
            }
            $this->transacao->finalizar();
            return [
                'id' => $idGerado,
                'dataHora' => $devolucao->getDataHora(),
                'valorPago' => $devolucao->getValorPago(),
                'locacaoId' => $devolucao->getLocacao()->getId(),
                'funcionarioId' => $devolucao->getFuncionario()->getCodigo(),
                'avarias' => $avariasCriadas
            ];
        } catch (RepositorioException | DominioException $e) {
            $this->transacao->desfazer();
            throw DominioException::comProblemas( ['Erro ao registrar devolução: ' . $e->getMessage()] );
        }
    }

    public function listar(): array {
        return $this->repositorioDevolucao->listar();
    }

    public function filtrarPorCpf(string $cpf): array {
        return $this->repositorioDevolucao->listarPorCpfCliente($cpf);
    }

    private function mapearDevolucao(Funcionario $funcionario, Locacao $locacao, DateTime $horario, float $valorPago): Devolucao {
        $devolucao = new Devolucao(0, $funcionario, $locacao, $horario, $valorPago);
        $problemas = $devolucao->validar();
        if ( !empty($problemas) ) {
            throw DominioException::comProblemas($problemas);
        }
        return $devolucao;
    }

}