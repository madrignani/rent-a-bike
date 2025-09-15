<?php

namespace App\Modelo;

use App\Modelo\Item;
use App\Modelo\Funcionario;

class Avaria {
    private int $id;
    private int $devolucaoId;
    private Item $item;
    private \DateTime $dataHora;
    private Funcionario $avaliador;
    private string $descricao;
    private string $caminhoFoto;
    private float $valorCobrar;

    public function __construct(
        int $id,
        int $devolucaoId,
        Item $item,
        \DateTime $dataHora,
        Funcionario $avaliador,
        string $descricao,
        string $caminhoFoto,
        float $valorCobrar
    ) {
        $this->id = $id;
        $this->devolucaoId = $devolucaoId;
        $this->item = $item;
        $this->dataHora = $dataHora;
        $this->avaliador = $avaliador;
        $this->descricao = $descricao;
        $this->caminhoFoto = $caminhoFoto;
        $this->valorCobrar = $valorCobrar;
    }

    public function getId(): int { return $this->id; }
    public function getDevolucaoId(): int { return $this->devolucaoId; }
    public function getItem(): Item { return $this->item; }
    public function getDataHora(): \DateTime { return $this->dataHora; }
    public function getAvaliador(): Funcionario { return $this->avaliador; }
    public function getDescricao(): string { return $this->descricao; }
    public function getCaminhoFoto(): string { return $this->caminhoFoto; }
    public function getValorCobrar(): float { return $this->valorCobrar; }

    public function setDevolucaoId(int $devolucaoId): void {
        $this->devolucaoId = $devolucaoId;
    }

    public function setItem(Item $item): void {
        $this->item = $item;
    }

    public function setDataHora(\DateTime $dataHora): void {
        $this->dataHora = $dataHora;
    }

    public function setAvaliador(Funcionario $avaliador): void {
        $this->avaliador = $avaliador;
    }

    public function setDescricao(string $descricao): void {
        $this->descricao = $descricao;
    }

    public function setCaminhoFoto(string $caminhoFoto): void {
        $this->caminhoFoto = $caminhoFoto;
    }

    public function setValorCobrar(float $valorCobrar): void {
        $this->valorCobrar = $valorCobrar;
    }

    public function validar(): array {
        $erros = [];
        if ( empty($this->descricao) ) {
            $erros[] = 'Descrição da avaria não pode estar vazia.';
        }
        if ( !str_ends_with(strtolower($this->caminhoFoto), '.jpg') ) {
            $erros[] = 'Foto deve ser arquivo JPG.';
        }
        if ( $this->valorCobrar < 0 ) {
            $erros[] = 'Valor a cobrar não pode ser negativo.';
        }
        $now = new \DateTime();
        if ( $this->dataHora > $now ) {
            $erros[] = 'Data e hora da avaria não podem estar no futuro.';
        }
        return $erros;
    }

}

?>