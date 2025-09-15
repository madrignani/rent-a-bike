<?php

namespace App\Modelo;

use App\Modelo\Cargo;

class Funcionario {
    private int $codigo;
    private string $nome;
    private string $cpf;
    private Cargo $cargo;
    private string $senhaHash;
    private string $salt;

    public function __construct(
        int $codigo,
        string $nome,
        string $cpf,
        Cargo $cargo,
        string $senhaHash,
        string $salt
    ) {
        $this->codigo = $codigo;
        $this->nome = $nome;
        $this->cpf = $cpf;
        $this->cargo = $cargo;
        $this->senhaHash = $senhaHash;
        $this->salt = $salt;
    }

    public function getCodigo(): int { return $this->codigo; }

    public function getNome(): string { return $this->nome; }

    public function getCpf(): string { return $this->cpf; }

    public function getCargo(): Cargo { return $this->cargo; }

    public function getSenhaHash(): string { return $this->senhaHash; }

    public function getSalt(): string { return $this->salt; }

    public function validar(): array {
        $problemas = [];
        if ($this->codigo <= 0) {
            $problemas[] = "Código do funcionário inválido.";
        }
        if (strlen($this->nome) < 3 || strlen($this->nome) > 100) {
            $problemas[] = "Nome deve ter entre 3 e 100 caracteres.";
        }
        if (strlen($this->cpf) !== 11 || !ctype_digit($this->cpf)) {
            $problemas[] = "CPF deve possuir somente 11 números, sem pontuação.";
        }
        if (!($this->cargo instanceof Cargo)) {
            $problemas[] = "Cargo inválido.";
        }
        if (strlen($this->senhaHash) !== 128) {
            $problemas[] = "Hash de senha deve ter 128 caracteres.";
        } elseif (!ctype_xdigit($this->senhaHash)) {
            $problemas[] = "Hash de senha deve conter apenas caracteres hexadecimais.";
        }
        if (strlen($this->salt) !== 32) {
            $problemas[] = "Salt deve ter 32 caracteres.";
        } elseif (!ctype_xdigit($this->salt)) {
            $problemas[] = "Salt deve conter apenas caracteres hexadecimais.";
        }
        return $problemas;
    }

}

?>