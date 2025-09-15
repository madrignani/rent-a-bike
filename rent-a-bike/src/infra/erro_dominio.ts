export class ErroDominio extends Error{
    private problemas: string[] = [];

    constructor (message?: string) {
        super(message);
    }

    getProblemas(): string[] { return this.problemas; }

    static comProblemas(problemas: string[]): ErroDominio {
        const erro = new ErroDominio();
        erro.problemas = problemas;
        return erro;
    }

}