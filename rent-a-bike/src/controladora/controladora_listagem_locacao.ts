import type { VisaoListagemLocacao } from "../visao/visao_listagem_locacao.ts";
import { ErroDominio } from "../infra/erro_dominio.ts";
import { GestorLocacao } from "../gestor/gestor_locacao.ts";
import { GestorSessao } from "../gestor/gestor_sessao.ts";
import { GestorLogin } from "../gestor/gestor_login.ts";
import { GestorCliente } from "../gestor/gestor_cliente.ts";

export class ControladoraListagemLocacao {
  private gestor = new GestorLocacao();
  private gestorLogin = new GestorLogin();
  private gestorCliente = new GestorCliente();
  
  private visao: VisaoListagemLocacao;

  constructor(visao: VisaoListagemLocacao) {
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
        this.visao.exibirMensagem(["Erro ao fazer logout: " + erro.message]);
      }
    }
  }

  async carregarLocacoes(): Promise<void> {
    await GestorSessao.carregarFuncionario();
    const funcionario = GestorSessao.getFuncionario();
    if ( !funcionario ) {
      return;
    }
    try {
      const locacoes = await this.gestor.obterLocacoes();
      this.visao.exibirLocacoes(locacoes);
    } catch (erro: any) {
      if (erro instanceof ErroDominio) {
        this.visao.exibirMensagem(erro.getProblemas());
      } else {
        this.visao.exibirMensagem( [`Erro ao listar locações: ${erro.message}`]) ;
      }
    }
  }

  async filtrarLocacoes(entrada: string): Promise<void> {
    const termo = entrada.trim();
    if (!termo) {
      this.carregarLocacoes();
      return;
    }
    try {
      const locacoesFiltradas = await this.gestor.filtrarObterLocacoes(termo);
      for (const locacao of locacoesFiltradas) {
        const clienteCodigo = locacao.clienteCodigo;
        const cliente = await this.gestorCliente.buscar(String(clienteCodigo));
        locacao.clienteNome = cliente.getNome();
        locacao.clienteTelefone = cliente.getTelefone();
      }
      this.visao.exibirLocacoes(locacoesFiltradas);
    } catch (erro: any) {
      this.visao.exibirLocacoes([]);
    }
  }

  async finalizarLocacao(id: number): Promise<void> {
    try {
      await GestorSessao.carregarFuncionario();
      const funcionario = GestorSessao.getFuncionario();
      if (!funcionario) {
        this.visao.exibirMensagem(["Sessão expirada. Faça login novamente."]);
        window.location.href = "./login.html";
        return;
      }
      if (funcionario.getCargo() === "MECANICO") {
        this.visao.exibirMensagem(["Acesso restrito para mecânicos."]);
        return;
      }
      window.location.href = `./cadastro_devolucao.html?id=${id}`;
    } catch (erro: any) {
      if (erro instanceof ErroDominio) {
        this.visao.exibirMensagem(erro.getProblemas());
      } else {
        this.visao.exibirMensagem([`Erro ao finalizar locação: ${erro.message}`]);
      }
    }
  }
}