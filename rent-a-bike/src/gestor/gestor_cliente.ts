import { Cliente } from "../modelo/cliente.ts";
import { ErroDominio } from "../infra/erro_dominio.ts";
import { API_URL } from './rota_api.ts';

export class GestorCliente {

  async buscar(busca: string): Promise<Cliente> {
    try {
      let urlBusca: string;
      if ( busca.length <= 4 && !isNaN(Number(busca)) ) {
        urlBusca = `${API_URL}/clientes/codigo/${busca}`;
      }
      else if ( busca.length === 11 && !isNaN(Number(busca)) ) {
        urlBusca = `${API_URL}/clientes/cpf/${busca}`;
      } 
      else {
        throw ErroDominio.comProblemas([
          "Busca inválida: O código deve ter até 4 dígitos numéricos e o CPF deve ter 11 dígitos."
        ]);
      }
      const response = await fetch( urlBusca, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      } );
      if (!response.ok) {
        throw ErroDominio.comProblemas([
          "Erro ao buscar o cliente." + response.status
        ]);
      }
      const dadosCliente = await response.json();
      if (!dadosCliente) {
        throw ErroDominio.comProblemas([
          "Cliente não encontrado." + response.status
        ]);
      }
      const cliente = new Cliente( dadosCliente.codigo, dadosCliente.nome, dadosCliente.cpf,
        dadosCliente.telefone, dadosCliente.email, dadosCliente.endereco, dadosCliente.fotoUrl,
        new Date(dadosCliente.dataNascimento)
      );
      const problemas = cliente.validar();
      if ( problemas.length > 0 ) {
        throw ErroDominio.comProblemas(problemas);
      }
      return cliente;
    } 
    catch (erro) {
      throw erro;
    }
  }

}