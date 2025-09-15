<?php

namespace App\Repositorio;

interface RepositorioItem {
    public function buscarPorCodigo(int $codigo): ?array;
    public function atualizarDisponibilidade(int $codigo, bool $disponivel): void;
    public function buscarAvariasPorItem(int $codigo): array;
}

?>