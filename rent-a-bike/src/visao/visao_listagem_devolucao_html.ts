import { ControladoraListagemDevolucao } from "../controladora/controladora_listagem_devolucao.ts";
import type { VisaoListagemDevolucao } from "./visao_listagem_devolucao.ts";

export class VisaoListagemDevolucaoEmHTML implements VisaoListagemDevolucao {
  private controladora: ControladoraListagemDevolucao;
  private tbody = document.querySelector('table tbody') as HTMLTableSectionElement;
  private inputFiltro = document.getElementById("filtroDevolucao") as HTMLInputElement;
  private dropdownConteudoUsuario = document.getElementById("dropdownConteudoUsuario") as HTMLDivElement;

  constructor() {
    this.controladora = new ControladoraListagemDevolucao(this);
  }
  
  iniciar(): void {
    this.controladora.iniciarSessao();
    this.iniciarLogout();
    this.controladora.carregarDevolucoes();
    this.iniciarPesquisaFiltro();
  }

  exibirUsuarioLogado(nome: string, cargo: string): void {
      this.dropdownConteudoUsuario.innerHTML = `
          <p>${nome}</p>
          <p>Cargo: ${cargo}</p>
      `;
  }

  private iniciarLogout(): void {
    const botaoLogout = document.getElementById("botaoLogout") as HTMLButtonElement;
    botaoLogout.addEventListener( "click", () => {
      this.controladora.logout();
    } );
  }

  exibirMensagem( mensagem: string[] ): void {
    alert( mensagem.join("\n") );
  }

  exibirDevolucoes( devolucoes: any[] ): void {
    const formatador = new Intl.DateTimeFormat( 'pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    } );
    this.tbody.innerHTML = devolucoes.map( devolucao => {
      const dataHora = new Date(devolucao.data_hora);
      return `
        <tr>
          <td>${devolucao.id}</td>
          <td>${formatador.format(dataHora)}</td>
          <td>${devolucao.locacao_id}</td>
          <td>${devolucao.cliente_nome}</td>
          <td>R$ ${devolucao.valor_pago}</td>
        </tr>
      `;
    } ).join('');
  }
  
  private iniciarPesquisaFiltro(): void {
    this.inputFiltro.addEventListener( "input", () => {
      const CPFouID = this.inputFiltro.value.replace(/\D/g, "");
      this.inputFiltro.value = CPFouID; 
      this.controladora.filtrarDevolucoes(CPFouID);
    } );
  }

}