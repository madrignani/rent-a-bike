import { Fabricante } from './fabricante.ts';
import { Avaria } from './avaria.ts'

export class Item {
    private codigo: number | null;
    private modelo: string;
    private descricao: string;
    private valorHora: number;
    private fabricante: Fabricante;
    private avarias: Avaria[];
    private disponivel: boolean;
  
    constructor(
    codigo: number | null,
    modelo: string,
    descricao: string,
    valorHora: number,
    fabricante: Fabricante,
    avarias: Avaria[] = [],
    disponivel: boolean
  ) {
    this.codigo = codigo; 
    this.modelo=modelo; 
    this.descricao= descricao; 
    this.valorHora = valorHora;
    this.fabricante = fabricante;
    this.avarias = avarias;
    this.disponivel = disponivel; }
  
    getCodigo(): number | null { return this.codigo; }
    getModelo(): string { return this.modelo; }
    getDescricao(): string { return this.descricao; }
    getValorHora(): number { return this.valorHora; }
    getFabricante(): Fabricante { return this.fabricante; }
    getDisponivel(): boolean { return this.disponivel; }
    getAvarias(): Avaria[] { return this.avarias; }

    setAvarias(avarias: Avaria[]): void { this.avarias = avarias; }
    setDisponivel(disponivel: boolean): void { this.disponivel = disponivel; }

    calcularSubtotal(horas: number): number {
      return this.valorHora * horas;
    }

    validar(): string[] {
      const problemas: string[] = [];
      if (this.valorHora <= 0) {
        problemas.push('Valor por hora deve ser positivo.');
      }
      if (!this.fabricante) {
        problemas.push('Fabricante é obrigatório para o item.');
      }
      return problemas;
    }

}