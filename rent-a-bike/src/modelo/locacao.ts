import { Cliente } from './cliente.ts'; 
import { Funcionario } from './funcionario.ts';
import { Item } from './item.ts';

export class Locacao {
  private readonly id: number | null;
  private dataHora: Date;
  private horasContratadas: number;
  private status: 'EM_ANDAMENTO' | 'FINALIZADA';
  private cliente: Cliente;
  private funcionario: Funcionario;
  private itens: Item[];

  constructor(
    id: number | null,
    dataHora: Date,
    horasContratadas: number,
    status: 'EM_ANDAMENTO' | 'FINALIZADA',
    cliente: Cliente,
    funcionario: Funcionario,
    itens: Item[] = []
  ) {
    this.id = id;
    this.dataHora = dataHora;
    this.horasContratadas = horasContratadas;
    this.status = status;
    this.cliente = cliente;
    this.funcionario = funcionario;
    this.itens = itens;
  }

  getId(): number | null { return this.id; }
  getDataHora(): Date { return this.dataHora; }
  getHorasContratadas(): number { return this.horasContratadas; }
  getStatus(): 'EM_ANDAMENTO' | 'FINALIZADA' { return this.status; }
  getCliente(): Cliente { return this.cliente; }
  getFuncionario(): Funcionario { return this.funcionario; }
  getItens(): Item[] { return this.itens; }

  setDataHora(dataHora: Date): void { this.dataHora = dataHora; }
  setHorasContratadas(horas: number): void { this.horasContratadas = horas; }
  setStatus(status: 'EM_ANDAMENTO' | 'FINALIZADA'): void { this.status = status; }
  setCliente(cliente: Cliente): void { this.cliente = cliente; }
  setFuncionario(funcionario: Funcionario): void { this.funcionario = funcionario; }
  
  adicionarItem(item: Item): void { this.itens.push(item); }

  validar(): string[] {
    const problemas: string[] = [];
    if (this.horasContratadas <= 0) {
      problemas.push('Horas contratadas deve ser maior que zero.');
    }
    if (!['EM_ANDAMENTO', 'FINALIZADA'].includes(this.status)) {
      problemas.push('Status inválido.');
    }
    if (!this.cliente) {
      problemas.push('Cliente é obrigatório.');
    }
    if (!this.funcionario) {
      problemas.push('Funcionário é obrigatório.');
    }
    if (this.itens.length === 0) {
      problemas.push('Deve conter pelo menos um item.');
    }
    return problemas;
  }

}