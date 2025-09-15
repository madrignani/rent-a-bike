<?php

namespace App\Modelo;

use App\Modelo\Fabricante;
use App\Modelo\Funcionario;
use App\Modelo\Cliente;
use App\Modelo\Item;

class Locacao {
    private int $id;
    private \DateTime $dataHora;
    private int $horasContratadas;
    private string $status;
    private Cliente $cliente;
    private Funcionario $funcionario;
    private array $itens;

    public function __construct(
        int $id,
        \DateTime $dataHora,
        int $horasContratadas,
        string $status,
        Cliente $cliente,
        Funcionario $funcionario,
        array $itens = []
    ) {
        $this->id = $id;
        $this->dataHora = $dataHora;
        $this->horasContratadas = $horasContratadas;
        $this->status = $status;
        $this->cliente = $cliente;
        $this->funcionario = $funcionario;
        $this->itens = $itens;
    }

    public function getId(): int { return $this->id; }

    public function getDataHora(): \DateTime { return $this->dataHora; }

    public function getHorasContratadas(): int { return $this->horasContratadas; }

    public function getStatus(): string { return $this->status; }

    public function getCliente(): Cliente { return $this->cliente; }

    public function getFuncionario(): Funcionario { return $this->funcionario; }

    public function getItens(): array { return $this->itens; }

    public function setDataHora(\DateTime $dataHora): void { $this->dataHora = $dataHora; }

    public function setHorasContratadas(int $horas): void { $this->horasContratadas = $horas; }

    public function setStatus(string $status): void { $this->status = $status; }

    public function setCliente(Cliente $cliente): void { $this->cliente = $cliente; }

    public function setFuncionario(Funcionario $funcionario): void { $this->funcionario = $funcionario; }

    public function adicionarItem(Item $item): void { $this->itens[] = $item; }

    public function validar(): array {
        $problemas = [];
        if ($this->horasContratadas <= 0) {
            $problemas[] = "Horas contratadas deve ser maior que zero.";
        }
        if (!in_array($this->status, ['EM_ANDAMENTO', 'FINALIZADA'])) {
            $problemas[] = "Status inválido.";
        }
        if (empty($this->cliente)) {
            $problemas[] = "Cliente é obrigatório.";
        }
        if (empty($this->funcionario)) {
            $problemas[] = "Funcionário é obrigatório.";
        }
        if (empty($this->itens)) {
            $problemas[] = "Deve conter pelo menos um item.";
        }
        return $problemas;
    }

}

?>