<?php

use App\Repositorio\RepositorioFuncionarioEmBDR;
use App\Repositorio\RepositorioFabricanteEmBDR;
use App\Repositorio\RepositorioItemEmBDR;
use App\Repositorio\RepositorioDevolucaoEmBDR;
use App\Repositorio\RepositorioAvariaEmBDR;
use App\Servico\ServicoItem;
use App\Servico\ServicoAvaria;
use App\Transacao\TransacaoComPDO;
use App\Exception\DominioException;

describe('ServicoAvaria', function () {

    beforeAll(function () {
        `cd .. && pnpm run db`;
        $pdo = new PDO('mysql:dbname=rent_a_bike_teste;host=localhost;charset=utf8', 'root', '');

        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioDevolucao = new RepositorioDevolucaoEmBDR($pdo);
        $repositorioAvaria = new RepositorioAvariaEmBDR($pdo);
        $transacao = new TransacaoComPDO($pdo);
        $servicoItem = new ServicoItem(
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $this->servicoAvaria = new ServicoAvaria(
            $repositorioFuncionario,
            $repositorioDevolucao,
            $repositorioAvaria,
            $servicoItem
        );
    });

    it('Deve verificar corretamente se uma imagem existe.', function () {
        expect($this->servicoAvaria->verificarNomeArquivo('rachadura.jpg'))->toBe(true);
    });

    it('Deve verificar corretamente uma imagem que não existe.', function () {
        expect($this->servicoAvaria->verificarNomeArquivo('inexistente.jpg'))->toBe(false);
    });

    it('Deve cadastrar avaria com sucesso usando uma imagem válida (apaga a imagem após a verificação).', function () {
        $base64Imagem = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCABkAGQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQKf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPwF//9k=';
        $dados = [
            'devolucaoId' => 5,
            'itemCodigo' => 21,
            'avaliadorCodigo' => 3,
            'descricao' => 'Arranhão no garfo',
            'caminhoFoto' => 'teste_avaria.jpg',
            'valorCobrar' => 45.00,
            'dataHora' => (new DateTime())->format('Y-m-d H:i:s'),
            'arquivoBase64' => $base64Imagem,
        ];
        $avaria = $this->servicoAvaria->cadastrar($dados);
        expect($avaria)->toBeAn('array');
        expect($avaria['caminhoFoto'])->toBe('teste_avaria.jpg');
        expect($this->servicoAvaria->verificarNomeArquivo('teste_avaria.jpg'))->toBe(true);
        $caminho = __DIR__ . '/../fotos/avarias/teste_avaria.jpg';
        if (file_exists($caminho)) {
            unlink($caminho);
        }
    });

    it('Deve lançar exceção ao tentar cadastrar avaria com devolução inexistente.', function () {
        $base64Imagem = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCABkAGQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQKf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPwF//9k=';
        $dados = [
            'devolucaoId' => 999,
            'itemCodigo' => 21,
            'avaliadorCodigo' => 3,
            'descricao' => 'Arranhão no garfo',
            'caminhoFoto' => 'teste_avaria.jpg',
            'valorCobrar' => 45.00,
            'dataHora' => (new DateTime())->format('Y-m-d H:i:s'),
            'arquivoBase64' => $base64Imagem,
        ];
        expect(function () use ($dados) {
            $this->servicoAvaria->cadastrar($dados);})->toThrow(new DominioException('Problemas encontrados: Devolução não encontrada para lançar Avaria.'));
    });

    it('Deve lançar exceção se o tipo de imagem não for JPG.', function () {
        $dados = [
            'devolucaoId' => 5,
            'itemCodigo' => 21,
            'avaliadorCodigo' => 3,
            'descricao' => 'Tipo inválido',
            'caminhoFoto' => 'teste_invalido.jpg',
            'valorCobrar' => 10.00,
            'dataHora' => (new DateTime())->format('Y-m-d H:i:s'),
            'arquivoBase64' => base64_encode("NÃO É IMAGEM"),
        ];
        expect(function () use ($dados) {
            $this->servicoAvaria->cadastrar($dados);})->toThrow(new DominioException('Problemas encontrados: Tipo de imagem da Avaria não suportado.'));
    });

    it('Deve lançar exceção se extensão da imagem não for .jpg.', function () {
        $base64ImagemJPEG = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////2wBDAf//////////////////////////////////////////////wAARCABkAGQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQL/xAAVEQEBAAAAAAAAAAAAAAAAAAABEP/aAAgBAgEBPwH/xAAWEQEBAQAAAAAAAAAAAAAAAAABECH/2gAIAQEABj8CLP/EABgQAQEBAQEAAAAAAAAAAAAAAAERACEx/9oACAEBAAE/IH1jb1mQHfZCwkkhNH//2Q==';
        $dados = [
            'devolucaoId' => 5,
            'itemCodigo' => 21,
            'avaliadorCodigo' => 3,
            'descricao' => 'Extensão errada',
            'caminhoFoto' => 'imagemComoPNG.png', 
            'valorCobrar' => 10.00,
            'dataHora' => (new DateTime())->format('Y-m-d H:i:s'),
            'arquivoBase64' => $base64ImagemJPEG,
        ];
        expect(function () use ($dados) {
            $this->servicoAvaria->cadastrar($dados);})->toThrow(new DominioException('Problemas encontrados: Extensão de arquivo de imagem inválida. Apenas .jpg é permitida.'));
    });

});