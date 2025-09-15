export interface VisaoRelatorioItens {

    exibirUsuarioLogado(nome: string, cargo: string): void;
    exibirRelatorio( registros: { descricao: string; quantidade: number }[] ): void;
    exibirMensagem( mensagens: string[] ): void;
    limparRelatorio(): void;

}