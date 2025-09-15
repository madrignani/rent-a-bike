import { Cargo } from "./cargo";

export class Funcionario {
  private codigo: number;
  private nome: string;
  private cpf: string;
  private cargo: Cargo;

  constructor(
    codigo: number,
    nome: string,
    cpf: string,
    cargo: Cargo,

  ) {
    this.codigo = codigo;
    this.nome = nome;
    this.cpf = cpf;
    this.cargo = cargo;
  }

  getCodigo(): number { return this.codigo; }

  getNome(): string { return this.nome; }

  getCpf(): string { return this.cpf; }

  getCargo(): Cargo { return this.cargo; }

  validar(): string[] {
    const problemas: string[] = [];
    if (this.codigo <= 0) {
      problemas.push("Código do funcionário inválido.");
    }
    if (this.nome.length < 3 || this.nome.length > 100) {
      problemas.push("Nome deve ter entre 3 e 100 caracteres.");
    }
    if (this.cpf.length !== 11 || isNaN(Number(this.cpf))) {
      problemas.push("CPF deve possuir somente 11 números, sem pontuação.");
    }
    if (!Object.values(Cargo).includes(this.cargo)) {
      problemas.push("Cargo inválido.");
    }
    return problemas;
  }

}