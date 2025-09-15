import { Item } from './item';
import { Funcionario } from './funcionario';

export class Avaria {
  private readonly id: number | null;
  private devolucaoId: number;
  private item: Item;
  private dataHora: Date;
  private avaliador: Funcionario;
  private descricao: string;
  private caminhoFoto: string;
  private valorCobrar: number;

  constructor(
    id: number | null,
    devolucaoId: number,
    item: Item,
    dataHora: Date,
    avaliador: Funcionario,
    descricao: string,
    caminhoFoto: string,
    valorCobrar: number
  ) {
    this.id = id;
    this.devolucaoId = devolucaoId;
    this.item = item;
    this.dataHora = dataHora;
    this.avaliador = avaliador;
    this.descricao = descricao;
    this.caminhoFoto = caminhoFoto;
    this.valorCobrar = valorCobrar;
  }

  getId(): number | null { return this.id; }
  public getDevolucaoId(): number { return this.devolucaoId; }
  public getItem(): Item { return this.item; }
  public getDataHora(): Date { return this.dataHora; }
  public getAvaliador(): Funcionario { return this.avaliador; }
  public getDescricao(): string { return this.descricao; }
  public getCaminhoFoto(): string { return this.caminhoFoto; }
  public getValorCobrar(): number { return this.valorCobrar; }

  public setDevolucaoId(devolucaoId: number): void {
    this.devolucaoId = devolucaoId;
  }

  public setItem(item: Item): void {
    this.item = item;
  }

  public setDataHora(dataHora: Date): void {
    this.dataHora = dataHora;
  }

  public setAvaliador(avaliador: Funcionario): void {
    this.avaliador = avaliador;
  }

  public setDescricao(descricao: string): void {
    this.descricao = descricao;
  }

  public setCaminhoFoto(caminhoFoto: string): void {
    this.caminhoFoto = caminhoFoto;
  }

  public setValorCobrar(valorCobrar: number): void {
    this.valorCobrar = valorCobrar;
  }

  public validar(): string[] {
    const erros: string[] = [];
    if ( !this.descricao || this.descricao.trim() === '' ) {
      erros.push('Descrição da avaria não pode estar vazia.');
    }
    if ( !this.caminhoFoto.toLowerCase().endsWith('.jpg') ) {
        erros.push('Foto deve ser arquivo JPG.');
    }
    if ( this.valorCobrar < 0 ) {
      erros.push('Valor a cobrar não pode ser negativo.');
    }
    const agora = new Date();
    if ( this.dataHora > agora ) {
      erros.push('Data e hora da avaria não podem estar no futuro.');
    }
    return erros;
  }

}