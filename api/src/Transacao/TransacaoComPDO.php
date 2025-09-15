<?php

namespace App\Transacao;

use PDO;
use App\Exception;

class TransacaoComPDO implements Transacao{
    public function __construct(private PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function iniciar(): void{
        try{
            $this->pdo->beginTransaction();
        } catch(\Trowable $e){
            throw new RepositorioException("Erro ao iniciar transação", 0, $e);
        }
    }

    public function finalizar(): void {
        try {
            $this->pdo->commit();
        } catch (\Throwable $e) {
            throw new RepositorioException("Erro ao finalizar transação", 0, $e);
        }
    }

    public function desfazer(): void {
        try {
            $this->pdo->rollBack();
        } catch (\Throwable $e) {
            throw new RepositorioException("Erro ao desfazer transação", 0, $e);
        }
    }

}

?>