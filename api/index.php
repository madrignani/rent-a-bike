<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Config\Conexao;
use App\Autenticacao\Autenticacao;
use App\Repositorio\RepositorioFuncionarioEmBDR;
use App\Repositorio\RepositorioClienteEmBDR;
use App\Repositorio\RepositorioItemEmBDR;
use App\Repositorio\RepositorioFabricanteEmBDR;
use App\Repositorio\RepositorioLocacaoEmBDR;
use App\Repositorio\RepositorioSessaoEmBDR;
use App\Repositorio\RepositorioDevolucaoEmBDR;
use App\Repositorio\RepositorioAvariaEmBDR;
use App\Repositorio\RepositorioRelatorioEmBDR;
use App\Servico\ServicoFuncionario;
use App\Servico\ServicoCliente;
use App\Servico\ServicoItem;
use App\Servico\ServicoLocacao;
use App\Servico\ServicoSessao;
use App\Servico\ServicoDevolucao;
use App\Servico\ServicoAvaria;
use App\Servico\ServicoRelatorio;
use App\Exception\DominioException;
use App\Transacao\TransacaoComPDO;

use \phputil\router\Router;
use function \phputil\cors\cors;

date_default_timezone_set('America/Sao_Paulo');

$app = new Router();

$app->use( cors([
    'origin' => ['http://localhost:5173', 'http://localhost:8080'],
    'allowedHeaders' => ['Host', 'Origin', 'Accept', 'Content-Type'],
    'exposeHeaders' => ['Content-Type'],
    'allowMethods' => ['GET','POST','PATCH','DELETE','OPTIONS'],
    'allowCredentials' => true
]) );


////////////////////////////////////////////////////////////////////////


$app->get( '/funcionarios', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioFuncionarioEmBDR($pdo);
        $servico = new ServicoFuncionario($repositorio);
        $funcionarios = $servico->listar();
        $res->json($funcionarios);
    } catch (DominioException $e) {
        $res->status( 400 )->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status(500)->json( [
            'erro' => 'Erro ao buscar funcionários',
            'mensagem' => $e->getMessage()
        ] );
    }
} );

$app->get( '/funcionarios/:codigo', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioFuncionarioEmBDR($pdo);
        $servico = new ServicoFuncionario($repositorio);
        $funcionario = $servico->buscarPorCodigo((int) $req->param('codigo'));
        $res->json($funcionario);
    } catch (DominioException $e) {
        $res->status(400)->json($e->getProblemas());
    } catch (Exception $e) {
        $res->status(404)->json(['erro' => $e->getMessage()]);
    }
} );

$app->get( '/clientes/codigo/:codigo', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioClienteEmBDR($pdo);
        $servico = new ServicoCliente($repositorio);
        $cliente = $servico->buscarPorCodigo((int) $req->param('codigo'));
        $res->json($cliente);
    } catch (DominioException $e) {
        $res->status( 400 )->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status( 404 )->json(['erro' => $e->getMessage()]);
    }
} );

$app->get( '/clientes/cpf/:cpf', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $repositorio = new RepositorioClienteEmBDR($pdo);
        $servico = new ServicoCliente($repositorio);
        $cliente = $servico->buscarPorCpf($req->param('cpf'));
        $res->json($cliente);
    } catch (DominioException $e) {
        $res->status( 400 )->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status( 404 )->json(['erro' => $e->getMessage()]);
    }
} );

$app->get( '/itens/:codigo', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $servico = new ServicoItem($repositorioItem, $repositorioFabricante, $transacao);
        $item = $servico->buscarPorCodigo($req->param('codigo'));
        $res->json($item);
    } catch (DominioException $e) {
        $res->status( 400 )->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status( 404 )->json(['erro' => $e->getMessage()]);
    }
} );

$app->patch( '/itens/:codigo/disponibilidade', function($req, $res) {
    try {
        $codigo = (int) $req->param('codigo');
        $dados = (array) $req->body();
        if ( !isset($dados['disponivel']) ) {
            throw new DominioException(['Campo "disponivel" é obrigatório']);
        }
        $disponibilidade = match( strtolower((string) $dados['disponivel']) ) {
            'true', '1', 'on' => true,
            'false', '0', 'off' => false,
            default => throw new DominioException(['Valor inválido para disponibilidade.'])
        };
        $pdo = Conexao::conectar();
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $servicoItem = new ServicoItem($repositorioItem, $repositorioFabricante);
        $servicoItem->atualizarDisponibilidade($codigo, $disponibilidade);
        $res->status( 204 )->send();
    } catch (DominioException $e) {
        $res->status( 400 )->json($e->getProblemas());
    } catch (Exception $e) {
        $res->status( 500 )->json(['erro' => $e->getMessage()]);
    }
} );

$app->post( '/locacoes', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioLocacao = new RepositorioLocacaoEmBDR($pdo);
        $repositorioCliente = new RepositorioClienteEmBDR($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $servicoFuncionario = new ServicoFuncionario($repositorioFuncionario);
        $autenticacao = new Autenticacao($servicoFuncionario);
        $servico = new ServicoLocacao(
            $repositorioLocacao,
            $repositorioCliente,
            $repositorioFuncionario,
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $autenticacao->usuarioLogado();
        $dados = (array) $req->body();
        $locacaoCriada = $servico->cadastrar($dados);
        $res->status( 201 )->json($locacaoCriada);
    } catch (DominioException $e) {
        $res->status( 400 )->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status( 500 )->json(['erro' => $e->getMessage()]);
    }
} );

$app->get( '/locacoes', function($req, $res) { 
    try{
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioLocacao = new RepositorioLocacaoEmBDR($pdo);
        $repositorioCliente = new RepositorioClienteEmBDR($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $servicoFuncionario = new ServicoFuncionario($repositorioFuncionario);
        $autenticacao = new Autenticacao($servicoFuncionario);
        $servico = new ServicoLocacao(
            $repositorioLocacao,
            $repositorioCliente,
            $repositorioFuncionario,
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $autenticacao->usuarioLogado();
        $lista = $servico->listar();
        $res->json($lista);
    }catch(DominioException $e){
        $res->status( 400 )->json($e->getProblemas());
    } catch (Exception $e) {
        $res->status( 500 )->json(['erro' => $e->getMessage()]);
    }
} );

$app->get( '/locacoes/id/:id', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioLocacao = new RepositorioLocacaoEmBDR($pdo);
        $repositorioCliente = new RepositorioClienteEmBDR($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $servicoLocacao = new ServicoLocacao(
            $repositorioLocacao,
            $repositorioCliente,
            $repositorioFuncionario,
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $autenticacao = new Autenticacao(
            new ServicoFuncionario($repositorioFuncionario)
        );
        $autenticacao->usuarioLogado();
        $id = (int) $req->param('id');
        $lista = $servicoLocacao->filtrarPorId($id);
        $res->json($lista);
    } catch (DominioException $e) {
        $res->status(400)->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status(500)->json( ['erro' => $e->getMessage()] );
    }
} );

$app->get( '/locacoes/cpf/:cpf', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioLocacao = new RepositorioLocacaoEmBDR($pdo);
        $repositorioCliente = new RepositorioClienteEmBDR($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $servicoLocacao = new ServicoLocacao(
            $repositorioLocacao,
            $repositorioCliente,
            $repositorioFuncionario,
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $autenticacao = new Autenticacao(
            new ServicoFuncionario($repositorioFuncionario)
        );
        $autenticacao->usuarioLogado();
        $cpf = $req->param('cpf');
        $lista = $servicoLocacao->filtrarPorCpf($cpf);
        $res->json($lista);
    } catch ( DominioException $e ) {
        $res->status(400)->json( $e->getProblemas() );
    } catch ( Exception $e ) {
        $res->status(500)->json( ['erro' => $e->getMessage()] );
    }
} );

$app->post( '/devolucoes', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioCliente = new RepositorioClienteEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioLocacao = new RepositorioLocacaoEmBDR($pdo);
        $repositorioDevolucao = new RepositorioDevolucaoEmBDR($pdo);
        $repositorioAvaria = new RepositorioAvariaEmBDR($pdo);
        $servicoFuncionario = new ServicoFuncionario($repositorioFuncionario);
        $autenticacao = new Autenticacao($servicoFuncionario);
        $autenticacao->usuarioLogado();
        $servicoItem = new ServicoItem (
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $servicoLocacao = new ServicoLocacao (
            $repositorioLocacao,
            $repositorioCliente,
            $repositorioFuncionario,
            $repositorioItem,
            $repositorioFabricante,
            $transacao        
        );
        $servicoAvaria = new ServicoAvaria (
            $repositorioFuncionario,
            $repositorioDevolucao,
            $repositorioAvaria,
            $servicoItem
        );
        $servicoDevolucao = new ServicoDevolucao (
            $repositorioFuncionario,
            $repositorioCliente,
            $repositorioFabricante,
            $repositorioItem,
            $repositorioLocacao,
            $repositorioDevolucao,
            $servicoLocacao,
            $servicoAvaria,
            $transacao
        );
        $dados = ( (array) $req->body() );
        $devolucaoCriada = $servicoDevolucao->cadastrar($dados);
        $res->status(201)->json($devolucaoCriada);
    } catch (DominioException $e) {
        $res->status( 400 )->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status( 500 )->json( ['erro' => $e->getMessage()] );
    }
} );

$app->get( '/devolucoes', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioCliente = new RepositorioClienteEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioLocacao = new RepositorioLocacaoEmBDR($pdo);
        $repositorioDevolucao = new RepositorioDevolucaoEmBDR($pdo);
        $repositorioAvaria = new RepositorioAvariaEmBDR($pdo);
        $servicoFuncionario = new ServicoFuncionario($repositorioFuncionario);
        $autenticacao = new Autenticacao($servicoFuncionario);
        $autenticacao->usuarioLogado();
        $servicoItem = new ServicoItem (
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $servicoLocacao = new ServicoLocacao (
            $repositorioLocacao,
            $repositorioCliente,
            $repositorioFuncionario,
            $repositorioItem,
            $repositorioFabricante,
            $transacao        
        );
        $servicoAvaria = new ServicoAvaria (
            $repositorioFuncionario,
            $repositorioDevolucao,
            $repositorioAvaria,
            $servicoItem
        );
        $servicoDevolucao = new ServicoDevolucao(
            $repositorioFuncionario,
            $repositorioCliente,
            $repositorioFabricante,
            $repositorioItem,
            $repositorioLocacao,
            $repositorioDevolucao,
            $servicoLocacao,
            $servicoAvaria,
            $transacao
        );
        $lista = $servicoDevolucao->listar();
        $res->json($lista);
    } catch (DominioException $e) {
        $res->status(400)->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status(500)->json( ['erro' => $e->getMessage()] );
    }
} );

$app->get( '/devolucoes/cpf/:cpf', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioCliente = new RepositorioClienteEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioLocacao = new RepositorioLocacaoEmBDR($pdo);
        $repositorioDevolucao = new RepositorioDevolucaoEmBDR($pdo);
        $repositorioAvaria = new RepositorioAvariaEmBDR($pdo);
        $servicoFuncionario = new ServicoFuncionario($repositorioFuncionario);
        $autenticacao = new Autenticacao($servicoFuncionario);
        $autenticacao->usuarioLogado();
        $servicoItem = new ServicoItem (
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $servicoLocacao = new ServicoLocacao (
            $repositorioLocacao,
            $repositorioCliente,
            $repositorioFuncionario,
            $repositorioItem,
            $repositorioFabricante,
            $transacao        
        );
        $servicoAvaria = new ServicoAvaria (
            $repositorioFuncionario,
            $repositorioDevolucao,
            $repositorioAvaria,
            $servicoItem
        );
        $servicoDevolucao = new ServicoDevolucao (
            $repositorioFuncionario,
            $repositorioCliente,
            $repositorioFabricante,
            $repositorioItem,
            $repositorioLocacao,
            $repositorioDevolucao,
            $servicoLocacao,
            $servicoAvaria,
            $transacao
        );
        $cpf = $req->param('cpf');
        $lista = $servicoDevolucao->filtrarPorCpf($cpf);
        $res->json($lista);
    } catch (DominioException $e) {
        $res->status(400)->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status(500)->json( ['erro' => $e->getMessage()] );
    }
} );

$app->get( '/avarias/verificar-nome', function( $req, $res ) {
    try {
        $nomeArquivo = $_GET['arquivo'] ?? '';
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $repositorioFabricante = new RepositorioFabricanteEmBDR($pdo);
        $repositorioItem = new RepositorioItemEmBDR($pdo);
        $repositorioDevolucao = new RepositorioDevolucaoEmBDR($pdo);
        $repositorioAvaria = new RepositorioAvariaEmBDR($pdo);
        $servicoItem = new ServicoItem (
            $repositorioItem,
            $repositorioFabricante,
            $transacao
        );
        $servicoAvaria = new ServicoAvaria (
            $repositorioFuncionario,
            $repositorioDevolucao,
            $repositorioAvaria,
            $servicoItem
        );
        $existe = $servicoAvaria->verificarNomeArquivo($nomeArquivo);
        $res->json( ['existe' => $existe] );
    } catch (Exception $e) {
        error_log("Erro ao verificar nome: " . $e->getMessage());
        $res->status(500)->json( ['erro' => $e->getMessage()] );
    }
} );

$app->get( '/relatorios/locacoes-devolvidas', function($req, $res) {
    try {
        $inicio = $_GET['inicio'] ?? date('Y-m-01');
        $fim = $_GET['fim'] ?? date('Y-m-t');
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioRelatorio = new RepositorioRelatorioEmBDR($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $servicoFuncionario = new ServicoFuncionario($repositorioFuncionario);
        $autenticacao = new Autenticacao($servicoFuncionario);
        $autenticacao->usuarioLogado();
        $funcionarioCodigo = $autenticacao->usuarioLogadoCodigo();
        $servicoRelatorio = new ServicoRelatorio(
            $repositorioRelatorio,
            $repositorioFuncionario
        );
        $resultado = $servicoRelatorio->relatorioLocacoesDevolvidas( [
            'inicio' => $inicio,
            'fim' => $fim,
            'funcionario' => $funcionarioCodigo
        ] );
        $res->status(200)->json($resultado);
    } catch (DominioException $e) {
        $res->status(400)->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status(500)->json( ['erro' => $e->getMessage()] );
    }
} );

$app->get( '/relatorios/itens/top10', function($req, $res) {
    try {
        $inicio = $_GET['inicio'] ?? date('Y-m-01');
        $fim = $_GET['fim'] ?? date('Y-m-t');
        $pdo = Conexao::conectar();
        $transacao = new TransacaoComPDO($pdo);
        $repositorioRelatorio = new RepositorioRelatorioEmBDR($pdo);
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $servicoFuncionario = new ServicoFuncionario($repositorioFuncionario);
        $autenticacao = new Autenticacao($servicoFuncionario);
        $autenticacao->usuarioLogado();
        $funcionarioCodigo = $autenticacao->usuarioLogadoCodigo();
        $servicoRelatorio = new ServicoRelatorio(
            $repositorioRelatorio,
            $repositorioFuncionario
        );
        $resultado = $servicoRelatorio->relatorioTop10Itens( [
            'inicio' => $inicio,
            'fim' => $fim,
            'funcionario' => $funcionarioCodigo
        ] );
        $res->status(200)->json($resultado);
    } catch (DominioException $e) {
        $res->status(400)->json( $e->getProblemas() );
    } catch (Exception $e) {
        $res->status(500)->json( ['erro' => $e->getMessage()] );
    }
} );

$app->post( '/login', function($req, $res) {
    try {
        $dados = (array) $req->body();
        if (!isset($dados['cpf']) || !isset($dados['senha'])) {
            throw new DominioException(['CPF e senha são obrigatórios.']);
        }
        $cpf = (string) $dados['cpf'];
        $senha = (string) $dados['senha'];
        $pdo = Conexao::conectar();
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $servicoFuncionario = new ServicoFuncionario($repositorioFuncionario);
        $autenticacao = new Autenticacao($servicoFuncionario);
        $autenticacao->login($cpf, $senha);
        $res->status(200)->json(['mensagem' => 'Login realizado com sucesso.']);
    } catch (DominioException $e) {
        $res->status(401)->json(['mensagens' => $e->getProblemas()]);
    } catch (Exception $e) {
        $res->status(500)->json(['mensagens' => ['erro ' . $e->getMessage()]]);
    }
} );

$app->post( '/logout', function($req, $res) {
    try {
        $pdo = Conexao::conectar();
        $repositorioFuncionario = new RepositorioFuncionarioEmBDR($pdo);
        $servicoFuncionario = new ServicoFuncionario($repositorioFuncionario);
        $autenticacao = new Autenticacao($servicoFuncionario);
        $autenticacao->logout();
        $res->status(200)->json( ['mensagem' => 'Logout realizado com sucesso.'] );
    } catch (Exception $e) {
        $res->status(500)->json( ['erro' => 'Erro ao realizar logout: ' .  $e->getMessage()] );
    }
} );

$app->get( '/me', function($req, $res) {
    try {
        $autenticacao = new Autenticacao();
        $cpf = $autenticacao->usuarioLogado();
        $servicoFuncionario = new ServicoFuncionario(
            new RepositorioFuncionarioEmBDR(Conexao::conectar())
        );
        $usuario = $servicoFuncionario->buscarPorCPFParaFront($cpf);  
        $res->json($usuario);
    } catch (DominioException $e) {
        $res->status(401)->json( ['mensagens' => $e->getProblemas()] );
    }
} );

$app->listen();

?>