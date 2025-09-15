<?php

namespace App\Repositorio;

use App\Modelo\Devolucao;

interface RepositorioDevolucao {

    public function salvar(Devolucao $devolucao): int;
    public function buscarPorLocacao(int $idLocacao): ?array;
    public function buscarPorCodigo(int $id): ?array;
    public function listarPorCpfCliente(string $cpf): ?array;

}

?>