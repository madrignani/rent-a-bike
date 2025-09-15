<?php

namespace App\Autenticacao;

use App\Config\Conexao;
use App\Exception\DominioException;
use App\Repositorio\RepositorioFuncionarioEmBDR;
use App\Servico\ServicoFuncionario;

class Autenticacao {
    private const SESSION_NAME = 'RentBikeSession';

    private ServicoFuncionario $servicoFuncionario;
    private static bool $envLoaded = false;

    public function __construct(){
        $pdo = Conexao::conectar();
        $repo = new RepositorioFuncionarioEmBDR($pdo);
        $this->servicoFuncionario = new ServicoFuncionario($repo);
    }
    
    private static function loadEnv():void{
        if (self::$envLoaded) { return; }
        $envFile = __DIR__ . '/../../.env';
        if (!file_exists($envFile)){
            return;
        }
        foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line){
            if (trim($line) === '' || str_starts_with(trim($line), '#')){
                continue;
            }
            [$name, $value] = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            putenv("$name=$value");
            $_ENV[$name] = $value;
        }
        self::$envLoaded = true;
    }

    private function getEnv(string $chave):string{
        self::loadEnv();
        $valor = getenv($chave);
        if ($valor === false){
            return '';
        }
        return $valor;
    }

    private function iniciarSessao(): void{
        if (session_status() === PHP_SESSION_NONE){
            session_name(self::SESSION_NAME);
            session_start();
        }
    }

    private function senhaHash(string $senha, string $salt):string{
        $pimenta  = $this->getEnv('PIMENTA');
        $pimenta2 = $this->getEnv('PIMENTA2');
        return hash('sha512', $salt . $pimenta . $senha . $pimenta2);
    }

    public function login(string $cpf, string $senha): void{
        $this->iniciarSessao();
        $usuario = $this->servicoFuncionario->buscarPorCPF($cpf);
        $hashInformado = $this->senhaHash($senha, $usuario['salt']);
        if ($hashInformado !== $usuario['senha_hash']){
            throw DominioException::comProblemas(['Usuário ou senha inválidos.']);
        }
        $_SESSION['usuario_codigo'] = $usuario['codigo'];
        $_SESSION['usuario_cpf'] = $usuario['cpf'];
        $_SESSION['usuario_cargo'] = $usuario['cargo'];
    }

    public function logout(): void{
        $this->iniciarSessao();
        $_SESSION = [];
        session_destroy();
        if ( ini_get("session.use_cookies") ) {
            $params = session_get_cookie_params();
            setcookie( session_name(), '', [
                'expires' => time() - 3600,
                'path' => $params["path"],
                'domain' => $params["domain"],
                'secure' => $params["secure"],
                'httponly' => $params["httponly"],
                'samesite' => 'Lax'
            ] );
        }
    }

    public function usuarioLogado(): string{
        $this->iniciarSessao();
        if ( !isset($_SESSION['usuario_cpf'])){
            throw DominioException::comProblemas(['Acesso negado! Faça login.']);
        }
        return $_SESSION['usuario_cpf']; 
    }

    public function usuarioLogadoCodigo():int{
        $this->iniciarSessao();
        if (!isset($_SESSION['usuario_codigo'])){
            throw DominioException::comProblemas(['Acesso negado! Faça login.']);
        }
        return ((int)$_SESSION['usuario_codigo']);
    }

}

?>