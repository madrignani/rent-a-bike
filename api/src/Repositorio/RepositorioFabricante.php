<?php

namespace App\Repositorio;

interface RepositorioFabricante {
    public function buscarPorCodigo(int $codigo): ?array;
}

?>