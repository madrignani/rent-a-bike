import { Funcionario } from "../modelo/funcionario.ts";
import { ErroDominio } from "../infra/erro_dominio.ts";
import { API_URL } from "./rota_api.ts";
import type { Cargo } from "../modelo/cargo.ts";

export class GestorFuncionario {

  async obterFuncionarios(): Promise<Funcionario[]> {
    try {
      const response = await fetch( `${API_URL}/funcionarios`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      } );
      if (!response.ok) {
        throw ErroDominio.comProblemas([
          "Erro ao buscar os funcionarios." + response.status
        ]);
      }
      const funcionariosDados = await response.json();
      if (!funcionariosDados || funcionariosDados.length === 0) {
        throw ErroDominio.comProblemas([
          "Nenhum funcionário encontrado." + response.status
        ]);
      }
      const funcionarios: Funcionario[] = funcionariosDados.map((f: { codigo: number; nome: string, cpf: string, cargo: Cargo }) => {
        return new Funcionario(f.codigo, f.nome, f.cpf, f.cargo);
      });
      return funcionarios;
    } catch (erro) {
      throw erro;
    }
  }

  async buscar(codigo: number): Promise<Funcionario> {
    try {
      if (!Number.isInteger(codigo) || codigo <= 0) {
        throw ErroDominio.comProblemas(["O código do funcionário deve ser um número inteiro positivo."]);
      }
      const response = await fetch( `${API_URL}/funcionarios/${codigo}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      } );
      if (!response.ok) {
        throw ErroDominio.comProblemas([
          "Erro ao buscar o funcionário." + response.status
        ]);
      }
      const dadosFuncionario = await response.json();
      if (!dadosFuncionario) {
        throw ErroDominio.comProblemas([
          "Funcionário não encontrado." + response.status
        ]);
      }
      const funcionario = new Funcionario( dadosFuncionario.codigo, dadosFuncionario.nome, dadosFuncionario.cpf, dadosFuncionario.cargo);
      return funcionario;
    } 
    catch (erro) {
      throw erro;
    }
  }
  
  converterParaArray(funcionarios: Funcionario[]): any[] {
    return funcionarios.map(funcionario => ({
      codigo: funcionario.getCodigo(),
      nome: funcionario.getNome(),
      cpf: funcionario.getCpf(),
      cargo: funcionario.getCargo()
    }));
  }
}
