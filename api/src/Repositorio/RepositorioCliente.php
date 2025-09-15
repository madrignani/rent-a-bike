<?php

namespace App\Repositorio;

interface RepositorioCliente {
    public function buscarPorCodigo(int $codigo): ?array;
    public function buscarPorCpf(string $cpf): ?array;
}

?>