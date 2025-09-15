<?php

namespace App\Modelo;

class Seguro {
    private string $numero;

    public function __construct(string $numero) {
        $this->numero = $numero;
    }

    public function getNumero(): string {
        return $this->numero;
    }
}

?>