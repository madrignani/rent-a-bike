<?php

namespace App\Servico;

use App\Modelo\Avaria;
use App\Repositorio\RepositorioAvaria;
use App\Repositorio\RepositorioDevolucao;
use App\Repositorio\RepositorioFuncionario;
use App\Servico\ServicoFuncionario;
use App\Servico\ServicoItem;
use App\Exception\DominioException;

class ServicoAvaria {
    private RepositorioFuncionario $repositorioFuncionario;
    private RepositorioDevolucao $repositorioDevolucao;
    private RepositorioAvaria $repositorioAvaria;
    private ServicoItem $servicoItem;

    public function __construct(
        RepositorioFuncionario $repositorioFuncionario,
        RepositorioDevolucao $repositorioDevolucao,
        RepositorioAvaria $repositorioAvaria,
        ServicoItem $servicoItem
    ) {
        $this->repositorioFuncionario = $repositorioFuncionario;
        $this->repositorioDevolucao = $repositorioDevolucao;
        $this->repositorioAvaria = $repositorioAvaria;
        $this->servicoItem = $servicoItem;
    }

    public function cadastrar(array $dados): array {
        $devolucaoId = ( (int) $dados['devolucaoId'] );
        if ( !$this->repositorioDevolucao->buscarPorCodigo($devolucaoId) ) {
            throw DominioException::comProblemas( ['Devolução não encontrada para lançar Avaria.'] );
        }
        $arquivoBase64 = $dados['arquivoBase64'] ?? '';
        $imageData = base64_decode($arquivoBase64);
        if ($imageData === false) {
            throw DominioException::comProblemas( ['Erro ao decodificar imagem da Avaria.'] );
        }
        $details = getimagesizefromstring($imageData);
        if ($details === false || $details[2] !== IMAGETYPE_JPEG) {
            throw DominioException::comProblemas( ['Tipo de imagem da Avaria não suportado.'] );
        }
        $caminhoFoto = trim( $dados['caminhoFoto'] );
        $extensao = strtolower( pathinfo($caminhoFoto, PATHINFO_EXTENSION) );
        if ($extensao !== 'jpg') {
            throw DominioException::comProblemas( ['Extensão de arquivo de imagem inválida. Apenas .jpg é permitida.'] );
        }
        $destino = __DIR__ . '/../../fotos/avarias/' . basename($caminhoFoto);
        if (file_put_contents($destino, $imageData) === false) {
            throw DominioException::comProblemas( ['Erro ao salvar imagem da Avaria.'] );
        }
        $itemCodigo = ( (int) $dados['itemCodigo'] );
        $item = $this->servicoItem->buscarObjetoPorCodigo($itemCodigo);
        $avaliadorCodigo = ( (int) $dados['avaliadorCodigo'] );
        $avaliadorCru = $this->repositorioFuncionario->buscarPorCodigo($avaliadorCodigo);
        $avaliador = ( new ServicoFuncionario($this->repositorioFuncionario) )->mapearFuncionario($avaliadorCru);
        $avaria = new Avaria(
            0,
            $devolucaoId,
            $item,
            new \DateTime( $dados['dataHora'] ),
            $avaliador,
            trim( $dados['descricao'] ),
            $destino,
            ( (float) $dados['valorCobrar'] )
        );
        $problemas = $avaria->validar();
        if ( !empty($problemas) ) {
            throw DominioException::comProblemas($problemas);
        }
        $id = $this->repositorioAvaria->salvar($avaria);
        return [
            'id' => $id,
            'devolucaoId' => $devolucaoId,
            'itemCodigo' => $itemCodigo,
            'avaliador' => $avaliador->getCodigo(),
            'descricao' => $avaria->getDescricao(),
            'valorCobrar' => $avaria->getValorCobrar(),
            'caminhoFoto' => basename($caminhoFoto),
            'dataHora' => $avaria->getDataHora()->format('Y-m-d H:i:s')
        ];
    }

    public function verificarNomeArquivo(string $nomeArquivo): bool {
        if (empty($nomeArquivo)) {
            throw DominioException::comProblemas( ['Nome da imagem não encontrado.'] );
        }
        $caminho = __DIR__ . '/../../fotos/avarias/' . basename($nomeArquivo);
        return file_exists($caminho);
    }

}