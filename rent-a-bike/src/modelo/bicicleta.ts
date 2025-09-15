import { Item } from './item.ts';
import { Seguro } from './seguro.ts';
import { Fabricante } from './fabricante.ts';

export class Bicicleta extends Item {
  private seguro: Seguro;

  constructor(
    codigo: number | null,
    modelo: string,
    descricao: string,
    valorHora: number,
    fabricante: Fabricante,
    avaria: string | null,
    disponivel: boolean,
    seguro: Seguro
  ) {
    super(codigo, modelo, descricao, valorHora, fabricante, avaria, disponivel);
    this.seguro = seguro;
  }

  getSeguro(): Seguro { return this.seguro; }

  validar(): string[] {
    const problemas: string[] = super.validar();
    if (!this.seguro) {
      problemas.push('Bicicleta deve possuir seguro.');
    }
    return problemas;
  }
  
}