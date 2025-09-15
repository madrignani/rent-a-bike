import type { VisaoLogin } from "./visao_login.ts";
import { ControladoraLogin } from "../controladora/controladora_login.ts";

export class VisaoLoginEmHTML implements VisaoLogin {
  private controladora: ControladoraLogin;
  private inputCpf = document.getElementById("cpfFuncionario") as HTMLInputElement;
  private inputSenha = document.getElementById("senha") as HTMLInputElement;
  private btnLogin = document.getElementById("botaoLogin") as HTMLButtonElement;

  constructor() {
    this.controladora = new ControladoraLogin(this);
  }

  iniciar(): void {
    this.btnLogin.addEventListener("click", () => {
      const cpf = this.inputCpf.value.trim();
      const senha = this.inputSenha.value;
      this.controladora.login(cpf, senha);
    });
    this.configurarLogout();
  }

  private configurarLogout(): void {
    const botaoLogout = document.getElementById("botaoLogout") as HTMLButtonElement;
    botaoLogout.addEventListener("click", () => {
      this.controladora.logout();
    });
  }


  exibirMensagem( mensagens: string[] ): void {
    alert( mensagens.join("\n") );
  }
  
}