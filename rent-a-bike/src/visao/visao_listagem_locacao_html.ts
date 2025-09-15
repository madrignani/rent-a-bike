import { ControladoraListagemLocacao } from "../controladora/controladora_listagem_locacao.ts";
import type { VisaoListagemLocacao } from "./visao_listagem_locacao.ts";

export class VisaoListagemLocacaoEmHTML implements VisaoListagemLocacao {
  private controladora: ControladoraListagemLocacao;
  private tbody = document.querySelector('table tbody') as HTMLTableSectionElement;
  private inputFiltro = document.getElementById("filtroLocacao") as HTMLInputElement;
  private dropdownConteudoUsuario = document.getElementById("dropdownConteudoUsuario") as HTMLDivElement;
  
  constructor() {
    this.controladora = new ControladoraListagemLocacao(this);
  }
  
  iniciar(): void {
    this.controladora.iniciarSessao();
    this.iniciarLogout();
    this.controladora.carregarLocacoes();
    this.iniciarFinalizarLocacao();
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
    botaoLogout.addEventListener("click", () => {
      this.controladora.logout();
    });
  }

  exibirMensagem(mensagem: string[]): void {
    alert( mensagem.join("\n") );
  }

  exibirLocacoes(locacoes: any[]): void {
    this.tbody.innerHTML = locacoes.map(locacao => {
      const dataHoraLocacao = new Date(locacao.dataHora);
      const dataHoraEntrega = new Date(locacao.entregaEsperada);
      const formatador = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
      let botaoAcao = "";
      if (locacao.status === 'FINALIZADA') {
          botaoAcao = `<button class="botao-finalizado" disabled>Finalizado</button>`;
      } else {
          botaoAcao = `<button class="botao-finalizar" data-id="${locacao.id}">Finalizar</button>`;
      }
      return `
        <tr>
          <td>${locacao.id}</td>
          <td>${formatador.format(dataHoraLocacao)}</td>
          <td>${locacao.horasContratadas}</td>
          <td>${formatador.format(dataHoraEntrega)}</td>
          <td>${locacao.clienteNome}</td>
          <td>${botaoAcao}</td>
        </tr>
      `;
    }).join('');
    this.iniciarFinalizarLocacao(); 
  }
  
  private iniciarPesquisaFiltro(): void {
    this.inputFiltro.addEventListener("input", () => {
      const CPFouID = this.inputFiltro.value.replace(/\D/g, "");
      this.inputFiltro.value = CPFouID; 
      this.controladora.filtrarLocacoes(CPFouID);
    });
  }

  private iniciarFinalizarLocacao(): void {
    const botoes = this.tbody.querySelectorAll(".botao-finalizar");
    botoes.forEach(botao => {
      botao.addEventListener("click", async (evento) => {
        const id = (evento.target as HTMLButtonElement).dataset.id;
        if (!id) return;
        await this.controladora.finalizarLocacao(Number(id));
      });
    });
  }
  
}