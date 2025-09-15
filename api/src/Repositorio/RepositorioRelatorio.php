<?php

namespace App\Repositorio;

interface RepositorioRelatorio {

    public function buscarLocacoesDevolvidas(string $inicio, string $fim) : array;
    public function buscarTop10ItensAlugados(string $inicio, string $fim): array;

}

?>