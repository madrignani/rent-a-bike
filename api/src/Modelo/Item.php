<?php

namespace App\Modelo;

use App\Modelo\Fabricante;
use App\Modelo\Avaria;

class Item {
    protected int $codigo;
    protected string $modelo;
    protected string $descricao;
    protected float $valorHora;
    protected Fabricante $fabricante;
    private array $avarias;
    protected bool $disponivel;
    
    public function __construct(
        int $codigo,
        string $modelo,
        string $descricao,
        float $valorHora,
        Fabricante $fabricante,
        array $avarias,
        bool $disponivel
    ) {
        $this->codigo = $codigo;
        $this->modelo = $modelo;
        $this->descricao = $descricao;
        $this->valorHora = $valorHora;
        $this->fabricante = $fabricante;
        $this->avarias = $avarias;
        $this->disponivel = $disponivel;
    }

    public function getCodigo(): int { return $this->codigo; }
    public function getModelo(): string { return $this->modelo; }
    public function getDescricao(): string { return $this->descricao; }
    public function getValorHora(): float { return $this->valorHora; }
    public function getFabricante(): Fabricante { return $this->fabricante; }
    public function getAvarias(): array { return $this->avarias; }
    public function getDisponivel(): bool { return $this->disponivel; }

    public function setAvarias(array $avarias): void {
        $this->avarias = $avarias;
    }

    public function setDisponivel(bool $disponivel): void {
        $this->disponivel = $disponivel;
    }

    public function calcularSubtotal(int $horas): float {
        return $this->valorHora * $horas;
    }

    public function validar(): array {
        $problemas = [];
        if ($this->valorHora <= 0) {
            $problemas[] = "Valor por hora deve ser positivo.";
        }
        if (!$this->fabricante) {
            $problemas[] = "Fabricante é obrigatório para o item.";
        }
        return $problemas;
    }

}

?>