import { ControladoraCadastroLocacao } from "../controladora/controladora_cadastro_locacao";
import type { VisaoCadastroLocacao } from "./visao_cadastro_locacao";

export class VisaoCadastroLocacaoEmHTML implements VisaoCadastroLocacao {
  private controladora: ControladoraCadastroLocacao;
  private subtotais: number[] = [];
  private dropdownConteudoUsuario = document.getElementById("dropdownConteudoUsuario") as HTMLDivElement;

  constructor() {
    this.controladora = new ControladoraCadastroLocacao(this);
  }

  iniciar(): void {
    const formulario = document.querySelector("form")! as HTMLFormElement;
    this.controladora.iniciarSessao();
    this.iniciarLogout();
    formulario.addEventListener("submit", event => event.preventDefault());
    this.buscaCliente();
    this.buscaItem();
    this.iniciarRegistroLocacao();
    const inputHorasDesejadas = document.getElementById("horasDesejadas") as HTMLInputElement;
    inputHorasDesejadas.addEventListener("input", () => {
      const horas = parseInt(inputHorasDesejadas.value);
      this.controladora.calcularSubtotais(horas);
      this.calcularResumoAutomatico();
    });
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
    alert(mensagem.join("\n"));
  }

  exibirCliente(cliente: {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    endereco: string;
    dataNascimento: string;
    fotoUrl: string;
  }): void {
    const divDetalhesCliente = document.getElementById("detalhesCliente") as HTMLDivElement;
    divDetalhesCliente.innerHTML = `
      <p><strong>Nome:</strong> ${cliente.nome}</p>
      <p><strong>CPF:</strong> ${cliente.cpf}</p>
      <p><strong>Telefone:</strong> ${cliente.telefone}</p>
      <p><strong>Email:</strong> ${cliente.email}</p>
      <p><strong>Endereço:</strong> ${cliente.endereco}</p>
      <p><strong>Data de Nascimento:</strong> ${cliente.dataNascimento}</p>
      <img src="${cliente.fotoUrl}" alt="Foto do cliente" width="120">
    `;
  }

  private buscaCliente(): void {
    const inputBuscaCliente = document.getElementById("buscaCliente") as HTMLInputElement;
    const botaoBuscaCliente = document.getElementById("botaoBuscaCliente") as HTMLButtonElement;
    botaoBuscaCliente.addEventListener("click", () => {
      const busca = inputBuscaCliente.value.trim();
      this.controladora.buscarCliente(busca);
    });
  }

  private buscaItem(): void {
    const inputBuscaItem = document.getElementById("buscaItem") as HTMLInputElement;
    const botaoBuscaItem = document.getElementById("botaoBuscarItem") as HTMLButtonElement;
    botaoBuscaItem.addEventListener("click", () => {
      const codigo = inputBuscaItem.value;
      this.controladora.buscarItem(codigo);
    });
  }

  inserirItemNaTabela( dados: {descricao: string; valorHora: number; avaria: string; disponibilidade: boolean;} ): void {
    const tabelaItens = document.querySelector<HTMLTableSectionElement>("#itensSelecionados tbody")!;
    const inputHorasDesejadas = document.getElementById("horasDesejadas") as HTMLInputElement;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${dados.descricao}</td>
      <td>R$ ${dados.valorHora.toFixed(2)}</td>
      <td>${dados.avaria}</td>
      <td>${dados.disponibilidade ? "Sim" : "Não"}</td>
      <td></td>
      <td><button class="botaoRetirar">Retirar</button></td>
    `;
    const botaoRetirar = tr.querySelector<HTMLButtonElement>(".botaoRetirar")!;
    botaoRetirar.addEventListener("click", () => {
      const tabelaItens = document.querySelector<HTMLTableSectionElement>("#itensSelecionados tbody")!;
      const linhas = Array.from(tabelaItens.querySelectorAll("tr"));
      const index = linhas.indexOf(tr);
      if (index !== -1) {
          this.controladora.removerItem(index);
          tr.remove();
          const inputHorasDesejadas = document.getElementById("horasDesejadas") as HTMLInputElement;
          const horas = parseInt(inputHorasDesejadas.value);
          this.controladora.calcularSubtotais(horas);
          this.calcularResumoAutomatico();
      }
    });
    tabelaItens.appendChild(tr);
    const horas = parseInt(inputHorasDesejadas.value);
    this.controladora.calcularSubtotais(horas);
    this.calcularResumoAutomatico();
  }

  atualizarDisponibilidadeTabela(disponibilidades: boolean[]): void {
    const tabelaItens = document.querySelector<HTMLTableSectionElement>("#itensSelecionados tbody")!;
    const linhas = Array.from(tabelaItens.querySelectorAll("tr"));
    disponibilidades.forEach((disp, i) => {
      const linha = linhas[i];
      if (!linha) return;
      const celula = linha.cells[3];
      celula.textContent = disp ? "Sim" : "Não";
      celula.classList.toggle("indisponivel", !disp);
      const botao = linha.cells[5].querySelector<HTMLButtonElement>("button")!;
      botao.disabled = !disp;
    });
  }

  atualizarSubtotais(subtotais: number[]): void {
    this.subtotais = subtotais;
    const tabelaItens = document.querySelector<HTMLTableSectionElement>("#itensSelecionados tbody")!;
    const linhas = Array.from(tabelaItens.querySelectorAll("tr"));
    linhas.forEach((tr, i) => {
      const cell = tr.cells[4];
      const valor = subtotais[i] || 0;
      cell.innerText = `R$ ${valor.toFixed(2)}`;
    });
  }

  private calcularResumoAutomatico(): void {
    const inputHorasDesejadas = document.getElementById("horasDesejadas") as HTMLInputElement;
    const horas = parseInt(inputHorasDesejadas.value);
    if (horas > 0 && this.subtotais.length > 0) {
      this.controladora.calcularResumoLocacao(horas);
    }
  }

  exibirResumoLocacao(dados: { totalBruto: number; desconto: number; valorTotal: number; previsaoEntrega: string;}): void {
    const totalBruto = document.getElementById("totalBruto") as HTMLSpanElement;
    const desconto = document.getElementById("desconto") as HTMLSpanElement;
    const valorTotal = document.getElementById("valorTotal") as HTMLSpanElement;
    const previsao = document.getElementById("previsaoEntrega") as HTMLSpanElement;
    totalBruto.textContent = dados.totalBruto.toFixed(2);
    desconto.textContent = dados.desconto.toFixed(2);
    valorTotal.textContent = dados.valorTotal.toFixed(2);
    previsao.textContent = dados.previsaoEntrega;
  }

  private iniciarRegistroLocacao(): void {
    const botaoRegistrar = document.getElementById("botaoRegistrarLocacao") as HTMLButtonElement;
    botaoRegistrar.addEventListener("click", () => {
    const inputHorasDesejadas = document.getElementById("horasDesejadas") as HTMLInputElement;
    const horas = parseInt(inputHorasDesejadas.value);
    this.controladora.registrarLocacao(horas);
    });
  }

}