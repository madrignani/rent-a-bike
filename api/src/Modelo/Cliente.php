<?php

namespace App\Modelo;

class Cliente {
    private int $codigo;
    private string $nome;
    private string $cpf;
    private string $telefone;
    private string $email;
    private string $endereco;
    private ?string $fotoUrl;
    private \DateTime $dataNascimento;

    public function __construct(
        int $codigo,
        string $nome,
        string $cpf,
        string $telefone,
        string $email,
        string $endereco,
        ?string $fotoUrl,
        \DateTime $dataNascimento
    ) {
        $this->codigo = $codigo;
        $this->nome = $nome;
        $this->cpf = $cpf;
        $this->telefone = $telefone;
        $this->email = $email;
        $this->endereco = $endereco;
        $this->fotoUrl = $fotoUrl ?? '';
        $this->dataNascimento = $dataNascimento;
    }

    public function getCodigo(): int { return $this->codigo; }

    public function getNome(): string { return $this->nome; }

    public function getCpf(): string { return $this->cpf; }

    public function getTelefone(): string { return $this->telefone; }

    public function getEmail(): string { return $this->email; }

    public function getEndereco(): string { return $this->endereco; }

    public function getFotoUrl(): string { return $this->fotoUrl; }
    
    public function getDataNascimento(): \DateTime { return $this->dataNascimento; }

    public function validar(): array {
        $problemas = [];
        if (strlen($this->nome) < 3 || strlen($this->nome) > 100) {
            $problemas[] = "Nome deve possuir entre 3 e 100 caracteres";
        }
        if (strlen($this->cpf) !== 11 || !ctype_digit($this->cpf)) {
            $problemas[] = "CPF deve possuir somente 11 números, sem pontuação.";
        }
        if (strlen($this->telefone) < 10 || strlen($this->telefone) > 11) {
            $problemas[] = "Telefone deve possuir 10 ou 11 números, sem pontuação.";
        }
        if ($this->dataNascimento > new \DateTime()) {
            $problemas[] = "Data de nascimento não pode ser no futuro";
        }
        return $problemas;
    }

}

?>