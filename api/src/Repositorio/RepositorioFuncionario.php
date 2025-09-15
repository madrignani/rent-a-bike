<?php

namespace App\Repositorio;

interface RepositorioFuncionario {
    public function listar(): array;
    public function buscarPorCodigo(int $codigo): array;
    public function buscarPorCPF(string $cpf): array;
}

?>