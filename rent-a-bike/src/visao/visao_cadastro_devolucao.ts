export interface VisaoCadastroDevolucao {

    exibirUsuarioLogado(nome: string, cargo: string): void;
    exibirMensagem(mensagem: string[]): void;
    atualizarSubtotais(subtotais: number[]): void;
    exibirDadosLocacao(locacao: string[]): void;
    iniciarLançamentoAvaria():void;
    exibirResumoFinanceiro(resumo:{ totalPagar: number, desconto: number, valorComDesconto: number }): void;
    exibirAvaliadores(funcionarios:any[]): void;
    atualizarTituloModal(descricao: string): void
    adicionarLinhaAvaria(index:number, descricao:string, valor:number, avariaIndex:number):void;
    removerLinhaAvaria(itemIndex:number, avariaIndex:number):void;
    showModal(): void;
    hideModal(): void;
    
}