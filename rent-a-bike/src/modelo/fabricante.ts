export class Fabricante {
    private codigo: number | null;
    private descricao: string;

    constructor(codigo: number, descricao: string) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    getCodigo(): number | null { return this.codigo; }
    
    getDescricao(): string { return this.descricao; }

}