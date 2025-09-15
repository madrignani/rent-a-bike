export interface VisaoRelatorioLocacoes {

    exibirUsuarioLogado(nome: string, cargo: string): void;    
    exibirRelatorio( registros: { data: string; total_pago: number }[] ): void;
    exibirMensagem( mensagens: string[] ): void;
    limparRelatorio(): void;

}