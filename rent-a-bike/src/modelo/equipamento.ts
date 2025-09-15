import { Item } from './item.ts';
import { Fabricante } from './fabricante.ts';
  
export class Equipamento extends Item {

  constructor(
    codigo: number | null,
    modelo: string,
    descricao: string,
    valorHora: number,
    fabricante: Fabricante,
    avaria: string | null,
    disponivel: boolean
  ) {
    super(codigo, modelo, descricao, valorHora, fabricante, avaria, disponivel);
  }

  validar(): string[] {
    const problemas: string[] = super.validar();
    return problemas;
  }
  
}