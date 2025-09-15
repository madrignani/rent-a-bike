<?php

namespace App\Transacao;

interface Transacao{
    public function iniciar(): void;
    public function finalizar(): void;
    public function desfazer(): void;

}

?>