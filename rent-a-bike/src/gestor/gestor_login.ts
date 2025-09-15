import { ErroDominio } from "../infra/erro_dominio.ts";
import { API_URL } from "./rota_api.ts";

export class GestorLogin {
  async autenticar(cpf: string, senha: string): Promise<void> {
    try {
      if ( cpf.length !== 11 || isNaN(Number(cpf)) ) {
        throw ErroDominio.comProblemas(["CPF deve conter exatamente 11 dígitos numéricos."]);
      }
      if (typeof senha !== 'string' || senha.length < 8) {
        throw ErroDominio.comProblemas(["Senha deve ter ao menos 8 caracteres."]);
      }
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha })
      });
      if (!response.ok) {
        const erroJson = await response.json().catch(() => null);
        const msgs = erroJson?.mensagens ?? [`Falha na autenticação: ${response.status}`];
        throw ErroDominio.comProblemas(msgs);
      }
      window.location.href = '/index.html';
    } catch (erro) {
      throw erro;
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        throw ErroDominio.comProblemas([`Falha ao fazer logout. Código: ${response.status}`]);
      }
    } catch (erro) {
      throw erro;
    }
  }
  
}