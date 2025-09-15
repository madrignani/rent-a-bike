<?php

namespace App\Modelo;

use App\Modelo\Fabricante;
use App\Modelo\Item;

class Equipamento extends Item {
    public function __construct(
        int $codigo,
        string $modelo,
        string $descricao,
        float $valorHora,
        Fabricante $fabricante,
        ?string $avaria,
        bool $disponivel
    ) {
        parent::__construct($codigo, $modelo, $descricao, $valorHora, $fabricante, $avaria, $disponivel);
    }

    public function validar(): array {
        return parent::validar();
    }
}

?>