import { Funcionario } from "../modelo/funcionario.ts";
import { API_URL } from "../gestor/rota_api.ts";
import { ErroDominio } from "../infra/erro_dominio.ts";

export class GestorSessao {
  private static funcionarioLogado: Funcionario | null = null;

  static async carregarFuncionario(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        this.funcionarioLogado = null;
        throw ErroDominio.comProblemas( ["Erro ao obter login de funcionário: " + response.status] );
      }
      const dados = await response.json();
      this.funcionarioLogado = new Funcionario(
        dados.codigo,
        dados.nome,
        dados.cpf,
        dados.cargo
      );
      const problemas = this.funcionarioLogado.validar();
      if (problemas.length > 0) {
        throw ErroDominio.comProblemas(problemas);
      }
    } catch (erro) {
      this.funcionarioLogado = null;
      if (erro instanceof ErroDominio) {
        throw erro;
      } else {
        throw ErroDominio.comProblemas( [ "Erro ao obter login de funcionário: conexão falhou ou resposta inválida"] );
      }
    }
  }

  static getFuncionario(): Funcionario | null {
    return this.funcionarioLogado;
  }

}