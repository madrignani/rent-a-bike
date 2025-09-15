export class Cliente {
  private readonly codigo: number | null;
  private nome: string;
  private cpf: string;
  private telefone: string;
  private email: string;
  private endereco: string;
  private fotoUrl: string;
  private dataNascimento: Date;

  constructor(
    codigo: number | null,
    nome: string,
    cpf: string,
    telefone: string,
    email: string,
    endereco: string,
    fotoUrl: string,
    dataNascimento: Date,
  ) {
    this.codigo = codigo;
    this.nome = nome;
    this.cpf = cpf;
    this.telefone = telefone;
    this.email = email;
    this.endereco = endereco;
    this.fotoUrl = fotoUrl;
    this.dataNascimento = dataNascimento;
  }

  getCodigo(): number | null { return this.codigo; }

  getNome(): string { return this.nome; }

  getCpf(): string { return this.cpf; }

  getTelefone(): string { return this.telefone; }

  getEmail(): string { return this.email; }

  getEndereco(): string { return this.endereco; }

  getFotoUrl(): string { return this.fotoUrl; }

  getDataNascimento(): Date { return this.dataNascimento; }

  validar(): string[] {
    const problemas: string[] = [];
    if (this.nome.length < 3 || this.nome.length > 100) {
      problemas.push("Nome deve possuir entre 3 e 100 caracteres");
    }
    if (this.cpf.length !== 11 || isNaN(Number(this.cpf))) {
      problemas.push("CPF deve possuir somente 11 números, sem pontuação.");
    }
    if (this.telefone.length < 10 || this.telefone.length > 11) {
      problemas.push("Telefone deve possuir 10 ou 11 números, sem pontuação.");
    }
    if (this.dataNascimento > new Date()) {
      problemas.push("Data de nascimento não pode ser no futuro");
    }
    return problemas;
  }
  
}