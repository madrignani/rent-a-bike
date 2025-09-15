import type { VisaoLogin } from "../visao/visao_login.ts";
import { GestorLogin } from "../gestor/gestor_login.ts";
import { ErroDominio } from "../infra/erro_dominio.ts";

export class ControladoraLogin {
  private gestor = new GestorLogin();
  private visao: VisaoLogin;

  constructor(visao: VisaoLogin) {
      this.visao = visao;
    }

  async login(cpf: string, senha: string): Promise<void> {
    try {
      await this.gestor.autenticar(cpf, senha);
    } catch (e: any) {
        let mensagens: string[];
        if ( Array.isArray(e?.mensagens) && e.mensagens.length > 0 ) {
          mensagens = e.mensagens;
        } else if ( (typeof e?.message === 'string') && e.message ) {
            mensagens = [e.message];
        } else {
            mensagens = [ 'Erro ao autenticar.' ];
        }
        this.visao.exibirMensagem(mensagens);
    }
  }

  async logout(): Promise<void> {
      try {
        await this.gestor.logout();
      } catch (erro: any) {
        if (erro instanceof ErroDominio) {
          this.visao.exibirMensagem(erro.getProblemas());
        } else {
          this.visao.exibirMensagem( ["Erro ao fazer logout: " + erro.message] );
        }
      }
  }

}