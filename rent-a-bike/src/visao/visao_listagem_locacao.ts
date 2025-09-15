export interface VisaoListagemLocacao {

    exibirUsuarioLogado(nome: string, cargo: string): void;
    exibirLocacoes( locacoes: any[] ): void;
    exibirMensagem( mensagem: string[] ): void;

}