export class Seguro{
    private numero: string;
    
    constructor(numero: string){
        this.numero = numero;
    }

    public getNumero(){
        return this.numero;
    }
}