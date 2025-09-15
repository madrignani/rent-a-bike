import { Locacao } from './locacao.ts';
import { Funcionario } from './funcionario.ts';

export class Devolucao {
  private readonly id: number | null;
  private funcionario: Funcionario;
  private locacao: Locacao;
  private dataHora: Date;
  private valorPago: number;

  constructor(
    id: number | null,
    funcionario: Funcionario,
    locacao: Locacao,
    dataHora: Date,
    valorPago: number
  ) {
    this.id = id;
    this.funcionario = funcionario;
    this.locacao = locacao;
    this.dataHora = dataHora;
    this.valorPago = valorPago;
  }

  getId(): number | null { return this.id; }
  public getFuncionario(): Funcionario { return this.funcionario; }
  public getLocacao(): Locacao { return this.locacao; }
  public getDataHora(): Date { return this.dataHora; }
  public getValorPago(): number { return this.valorPago; }
  public setFuncionario(funcionario: Funcionario): void { this.funcionario = funcionario; }

  public setLocacao(locacao: Locacao): void {
    this.locacao = locacao;
  }

  public setDataHora(dataHora: Date): void {
    this.dataHora = dataHora;
  }

  public setValorPago(valorPago: number): void {
    this.valorPago = valorPago;
  }

  public validar(): string[] {
    const problemas: string[] = [];
    if (!this.locacao) {
      problemas.push('Devolução deve referenciar uma locação válida.');
    }
    const dataLocacao = this.locacao.getDataHora();
    if (this.dataHora < dataLocacao) {
      problemas.push('Data da devolução não pode ser anterior à data da locação.');
    }
    const agora = new Date();
    if (this.dataHora > agora) {
      problemas.push('Data da devolução não pode ser no futuro.');
    }
    if (this.locacao.getStatus() === 'FINALIZADA') {
      problemas.push('A devolução não pode ser criada para uma locação já finalizada.');
    }
    return problemas;
  }

}