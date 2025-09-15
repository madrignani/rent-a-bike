import type { Cliente } from "../modelo/cliente.ts";
import type { Item } from "../modelo/item.ts";
import { GestorLocacao } from "../gestor/gestor_locacao.ts";
import { GestorCliente } from "../gestor/gestor_cliente.ts";
import { GestorItem } from "../gestor/gestor_item.ts";
import type { VisaoCadastroLocacao } from "../visao/visao_cadastro_locacao.ts";
import { ErroDominio } from "../infra/erro_dominio.ts";
import { GestorLogin } from "../gestor/gestor_login.ts";
import { GestorSessao } from "../gestor/gestor_sessao.ts";

export class ControladoraCadastroLocacao {
  private gestorLocacao = new GestorLocacao();
  private gestorCliente = new GestorCliente();
  private gestorItem = new GestorItem();
  private gestorLogin = new GestorLogin();
  private visao: VisaoCadastroLocacao;
  private itens: Item[] = [];
  private cliente?: Cliente;

  constructor(visao: VisaoCadastroLocacao) {
    this.visao = visao;
  }

  async iniciarSessao(): Promise<void> {
    try {
      await this.verificarPermissao();
      this.buscarUsuarioLogado();
    } catch (erro: any) {
      let mensagens: string[];
      if (erro instanceof ErroDominio) {
          mensagens = erro.getProblemas();
      } else {
          mensagens = ["Erro: " + erro.message];
      }
      this.visao.exibirMensagem(mensagens);
      window.location.href = "login.html";
    }
  }

  private async verificarPermissao(): Promise<void> {
    await GestorSessao.carregarFuncionario();
    const funcionario = GestorSessao.getFuncionario();
    if (!funcionario) {
      this.visao.exibirMensagem( ["Sessão não encontrada. Faça login novamente."] );
      window.location.href = "login.html";
      return;
    }
    if (funcionario.getCargo() === "MECANICO") {
      this.visao.exibirMensagem( ["Acesso restrito para mecânicos."] );
      window.location.href = "index.html";
      return;
    }
  }

  private buscarUsuarioLogado(): void {
    const funcionario = GestorSessao.getFuncionario();
    if (funcionario) {
      this.visao.exibirUsuarioLogado( funcionario.getNome(), funcionario.getCargo() );
    }
  }
  
  async logout(): Promise<void> {
    try {
      await this.gestorLogin.logout();
      window.location.href = "./login.html";
    } catch (erro: any) {
      if (erro instanceof ErroDominio) {
        this.visao.exibirMensagem(erro.getProblemas());
      } else {
        this.visao.exibirMensagem( ["Erro ao fazer logout: " + erro.message] );
      }
    }
  }

  async buscarCliente(busca: string): Promise<void> {
    try {
      const cliente = await this.gestorCliente.buscar(busca);
      this.cliente = cliente;
      this.visao.exibirCliente({
        nome: cliente.getNome(),
        cpf: cliente.getCpf(),
        telefone: cliente.getTelefone(),
        email: cliente.getEmail(),
        endereco: cliente.getEndereco(),
        dataNascimento: cliente.getDataNascimento().toLocaleDateString(),
        fotoUrl: cliente.getFotoUrl()
      });
    } catch (erro: any) {
      if (erro instanceof ErroDominio) {
        this.visao.exibirMensagem(erro.getProblemas());
      } else {
        this.visao.exibirMensagem(["Cliente não encontrado: " + erro.message]);
      }
      this.cliente = undefined;
      this.visao.exibirCliente({
        nome: "", cpf: "", telefone: "", email: "", endereco: "", dataNascimento: "", fotoUrl: ""
      });
    }
  }

  async buscarItem(codigo: string): Promise<void> {
    try {
      if (this.itens.some(item => String(item.getCodigo()) === codigo)) {
        this.visao.exibirMensagem([`Item de código ${codigo} já foi adicionado.`]);
        return;
      }
      const item = await this.gestorItem.buscar(codigo);
      this.itens.push(item);
      const descricaoAvarias = item.getAvarias().map(avaria => avaria.getDescricao());
      let textoAvarias: string;
      if (descricaoAvarias.length === 0) {
        textoAvarias = "—";
      } else {
        textoAvarias = descricaoAvarias.join(", ");
      }
      const dadosItem = {
        descricao: item.getDescricao(),
        valorHora: item.getValorHora(),
        avaria: textoAvarias,
        disponibilidade: item.getDisponivel()
      };
      this.visao.inserirItemNaTabela(dadosItem);
    } catch (erro: any) {
      if (erro instanceof ErroDominio) {
        this.visao.exibirMensagem(erro.getProblemas());
      } else {
        this.visao.exibirMensagem(['Item não encontrado :' + erro.message]);
      }
    }
  }

  removerItem(indice: number): void {
    if (indice >= 0 && (indice < this.itens.length)) {
      this.itens.splice(indice, 1);
    }
  }

  calcularSubtotais(horas: number): void {
    if (isNaN(horas) || horas <= 0) {
      return;
    }
    const subtotais = this.itens.map(item => (item.getValorHora() * horas));
    this.visao.atualizarSubtotais(subtotais);
  }

  async calcularResumoLocacao(horasDesejadas: number): Promise<void> {
    let totalBruto = 0;
    let desconto = 0;
    for (const item of this.itens) {
      totalBruto += (item.getValorHora() * horasDesejadas);
    }
    if (isNaN(horasDesejadas) || horasDesejadas <= 0) {
      return;
    }
    if (horasDesejadas >= 2) {
      desconto = (totalBruto * 0.10);
    }
    const valorTotal = (totalBruto - desconto);
    const previsao = new Date();
    this.calcularSubtotais(horasDesejadas);
    previsao.setHours(previsao.getHours() + horasDesejadas);
    const previsaoEntrega = previsao.toLocaleString("pt-BR");
    this.visao.exibirResumoLocacao({ totalBruto, desconto, valorTotal, previsaoEntrega });
  }

  async registrarLocacao(horas: number): Promise<void> {
    const funcionario = GestorSessao.getFuncionario();
    if (!funcionario) {
      this.visao.exibirMensagem(["Faça login para registrar uma locação."]);
      return;
    }
    if (funcionario.getCargo() === "MECANICO") {
      this.visao.exibirMensagem(["Mecânicos não podem registrar locações."]);
      return;
    }
    if (horas <= 0 || !Number.isInteger(horas)) {
      this.visao.exibirMensagem(["Insira uma quantidade de horas válida."]);
      return;
    }
    if (!this.cliente) {
      this.visao.exibirMensagem(["Busque um cliente para a locação."]);
      return;
    }
    if (this.itens.length === 0) {
      this.visao.exibirMensagem(["Adicione pelo menos um item."]);
      return;
    }
    let itemIndisponivelNaTabela = false;
    for (const item of this.itens) {
      if (!item.getDisponivel()) {
        itemIndisponivelNaTabela = true;
        break;
      }
    }
    if (itemIndisponivelNaTabela) {
      this.visao.exibirMensagem([
        "Não é possível registrar locação com itens indisponíveis. Remova-os antes de prosseguir."
      ]);
      return;
    }
    try {
      await this.gestorLocacao.registrarLocacao({
        cliente: this.cliente,
        funcionario: funcionario,
        itens: this.itens,
        horasContratadas: horas
      });
      this.itens.forEach(item => item.setDisponivel(false));
      this.visao.atualizarDisponibilidadeTabela(this.itens.map(item => item.getDisponivel()));
      this.visao.exibirMensagem(["Locação registrada com sucesso."]);
      window.location.reload();
    } catch (erro: any) {
      if (erro instanceof ErroDominio) {
        this.visao.exibirMensagem(erro.getProblemas());
      } else {
        this.visao.exibirMensagem(["Erro ao registrar locação: " + erro.message]);
      }
    }
  }  
}