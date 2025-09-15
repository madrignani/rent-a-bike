<?php

namespace App\Modelo;

use App\Modelo\Locacao;

class Devolucao {
    private int $id;
    private Funcionario $funcionario;
    private Locacao $locacao;
    private \DateTime $dataHora;
    private float $valorPago;

    public function __construct(
        int $id,
        Funcionario $funcionario,
        Locacao $locacao,
        \DateTime $dataHora,
        float $valorPago
    ) {
        $this->id = $id;
        $this->funcionario = $funcionario;
        $this->locacao = $locacao;
        $this->dataHora = $dataHora;
        $this->valorPago = $valorPago;
    }

    public function getId(): int { return $this->id; }
    public function getFuncionario(): Funcionario { return $this->funcionario; }
    public function getLocacao(): Locacao { return $this->locacao; }
    public function getDataHora(): \DateTime { return $this->dataHora; }
    public function getValorPago(): float { return $this->valorPago; }
    
    public function setFuncionario(Funcionario $funcionario): void {
        $this->funcionario = $funcionario;
    }

    public function setLocacao(Locacao $locacao): void {
        $this->locacao = $locacao;
    }

    public function setDataHora(\DateTime $dataHora): void {
        $this->dataHora = $dataHora;
    }

    public function setValorPago(float $valorPago): void {
        $this->valorPago = $valorPago;
    }

    public function validar(): array {
        $problemas = [];
        if (empty($this->locacao)) {
            $problemas[] = "Devolução deve referenciar uma locação válida.";
        }
        if ($this->dataHora < $this->locacao->getDataHora()) {
            $problemas[] = "Data da devolução não pode ser anterior à data da locação.";
        }
        if ($this->dataHora > new \DateTime()) {
            $problemas[] = "Data da devolução não pode ser no futuro.";
        }
        if ($this->locacao->getStatus() === 'FINALIZADA') {
            $problemas[] = "A devolução não pode ser criada para uma locação já finalizada.";
        }
        return $problemas;
    }
    
}

?>