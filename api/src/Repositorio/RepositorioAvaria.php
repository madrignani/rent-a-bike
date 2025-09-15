<?php

namespace App\Repositorio;

use App\Modelo\Avaria;

interface RepositorioAvaria {

    public function salvar(Avaria $avaria): int;
    public function listarPorDevolucao(int $idDevolucao): ?array;

}

?>