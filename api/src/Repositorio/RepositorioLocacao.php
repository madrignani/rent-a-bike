<?php

namespace App\Repositorio;

use App\Modelo\Locacao;

interface RepositorioLocacao {

    public function salvar(Locacao $locacao): int;
    public function listar(): ?array;
    public function buscarPorCodigo(int $id): ?array;
    public function buscarItensLocacao(int $locacaoId): array;
    public function atualizarStatus(int $locacaoId, string $novoStatus): void;
    public function listarPorCpfCliente(string $cpf): array;
   
}

?>