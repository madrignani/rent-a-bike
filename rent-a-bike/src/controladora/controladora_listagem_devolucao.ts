import type { VisaoListagemDevolucao } from "../visao/visao_listagem_devolucao.ts";
import { ErroDominio } from "../infra/erro_dominio.ts";
import { GestorDevolucao } from "../gestor/gestor_devolucao.ts";
import { GestorSessao } from "../gestor/gestor_sessao.ts";
import { GestorLogin } from "../gestor/gestor_login.ts";

export class ControladoraListagemDevolucao {
    private gestor = new GestorDevolucao();
    private gestorLogin = new GestorLogin();
    
    private visao: VisaoListagemDevolucao;

    constructor(visao: VisaoListagemDevolucao) {
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
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( ["Erro ao fazer logout: " + erro.message] );
            }
        }
    }

    async carregarDevolucoes(): Promise<void> {
        await GestorSessao.carregarFuncionario();
        const funcionario = GestorSessao.getFuncionario();
        if ( !funcionario ) {
            return;
        }
        try {
            const devolucoes = await this.gestor.obterDevolucoes();
            this.visao.exibirDevolucoes(devolucoes);
        } catch (erro: any) {
            if (erro instanceof ErroDominio) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } 
            else {
                this.visao.exibirMensagem( ["Erro ao listar devoluções: " + erro.message] );
            }
        }    
    }

    async filtrarDevolucoes(entrada: string): Promise<void> {
        const cpf = entrada.trim();
        if (!cpf) {
            this.carregarDevolucoes();
            return;
        }
        try {
            const devolucoesFiltradas = await this.gestor.filtrarObterDevolucoes(cpf);
            this.visao.exibirDevolucoes(devolucoesFiltradas);
        } catch (erro: any) {
            this.visao.exibirDevolucoes( [] );
        }
    }

}