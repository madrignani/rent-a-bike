<?php

namespace App\Modelo;

use App\Modelo\Fabricante;
use App\Modelo\Seguro;
use App\Modelo\Item;

class Bicicleta extends Item {
    private Seguro $seguro;

    public function __construct(
        int $codigo,
        string $modelo,
        string $descricao,
        float $valorHora,
        Fabricante $fabricante,
        ?string $avaria,
        bool $disponivel,
        Seguro $seguro
    ) {
        parent::__construct($codigo, $modelo, $descricao, $valorHora, $fabricante, $avaria, $disponivel);
        $this->seguro = $seguro;
    }

    public function getSeguro(): Seguro {
        return $this->seguro;
    }

    public function validar(): array {
        $problemas = parent::validar();
        if (!$this->seguro) {
            $problemas[] = "Bicicleta deve possuir seguro.";
        }
        return $problemas;
    }
}

?>