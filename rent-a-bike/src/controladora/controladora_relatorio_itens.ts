
import type { VisaoRelatorioItens } from '../visao/visao_relatorio_itens.ts';
import { ErroDominio } from '../infra/erro_dominio.ts';
import { GestorSessao } from '../gestor/gestor_sessao.ts';
import { GestorLogin } from '../gestor/gestor_login.ts';
import { GestorRelatorio } from '../gestor/gestor_relatorio.ts';

interface FiltroPeriodo {
    inicio?: string;
    fim?: string;
}

export class ControladoraRelatorioItens {
    private visao: VisaoRelatorioItens;
    private gestorRelatorio = new GestorRelatorio();
    private gestorLogin = new GestorLogin();

    constructor(visao: VisaoRelatorioItens) {
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
            this.visao.exibirUsuarioLogado(funcionario.getNome(), funcionario.getCargo());
        }
    }

    async logout(): Promise<void> {
        try {
            await this.gestorLogin.logout();
            window.location.href = './login.html';
        } catch (erro: any) {
            if (erro instanceof ErroDominio) {
                this.visao.exibirMensagem(erro.getProblemas());
            } else {
                this.visao.exibirMensagem(['Erro ao fazer logout: ' + erro.message]);
            }
        }
    }

    async gerarRelatorio(filtro: FiltroPeriodo): Promise<void> {
        try {
            const registros = await this.gestorRelatorio.obterTop10Itens(filtro);
            if (registros.length === 0) {
                this.visao.limparRelatorio();
                this.visao.exibirMensagem(['Não existe nenhum item alugado no período escolhido.'])
                return;
            }
            this.visao.exibirRelatorio(registros);
        } catch (erro: any) {
            if (erro instanceof ErroDominio) {
                this.visao.limparRelatorio();
                this.visao.exibirMensagem(erro.getProblemas());
            } else {
                this.visao.limparRelatorio();
                this.visao.exibirMensagem(['Erro ao gerar relatório: ' + erro.message]);
            }
        }
    }

}