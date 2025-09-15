export interface VisaoListagemDevolucao {

    exibirUsuarioLogado(nome: string, cargo: string): void;
    exibirDevolucoes( devolucoes: any[] ): void;
    exibirMensagem( mensagem: string[] ): void;

}