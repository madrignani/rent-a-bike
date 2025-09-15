export interface VisaoCadastroLocacao {

  exibirUsuarioLogado(nome: string, cargo: string): void;  
  exibirCliente(dadosCliente: { nome: string; cpf: string; telefone: string; email: string; 
    endereco: string; dataNascimento: string; fotoUrl: string; } ): void;
  inserirItemNaTabela(dados: { descricao: string; valorHora: number; avaria: string; disponibilidade: boolean }): void;
  atualizarSubtotais(subtotais: number[]): void;
  exibirResumoLocacao(dados: { totalBruto: number; desconto: number; valorTotal: number; previsaoEntrega: string; }): void;
  atualizarDisponibilidadeTabela(disponibilidades: boolean[]): void;
  exibirMensagem(mensagem: string[]): void;
  
}