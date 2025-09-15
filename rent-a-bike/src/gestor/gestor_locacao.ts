import { GestorCliente } from "./gestor_cliente.ts";
import { GestorFuncionario } from "./gestor_funcionario.ts";
import { GestorItem } from "./gestor_item.ts";
import { Funcionario } from "../modelo/funcionario.ts";
import { Cliente } from "../modelo/cliente.ts";
import { Item } from "../modelo/item.ts";
import { Locacao } from "../modelo/locacao.ts";
import { ErroDominio } from "../infra/erro_dominio.ts";
import { API_URL } from "./rota_api.ts";

export interface DadosNovaLocacao {
  cliente: Cliente;
  funcionario: Funcionario;
  itens: Item[];
  horasContratadas: number;
}

export class GestorLocacao {
  private gestorCliente = new GestorCliente();
  private gestorFuncionario = new GestorFuncionario();
  private gestorItem = new GestorItem();


  async registrarLocacao(dados: DadosNovaLocacao): Promise<Locacao> {
    try {
      const agora = new Date();
      const locacao = new Locacao(
        null,
        agora,
        dados.horasContratadas,
        "EM_ANDAMENTO",
        dados.cliente,
        dados.funcionario,
        []
      );
      dados.itens.forEach( item => locacao.adicionarItem(item) );
      const problemas = locacao.validar();
      if (problemas.length > 0) {
        throw ErroDominio.comProblemas(problemas);
      }
      const response = await fetch( `${API_URL}/locacoes`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente: { codigo: dados.cliente.getCodigo() },
          funcionario: { codigo: dados.funcionario.getCodigo() },
          itens: dados.itens.map(item => ({ codigo: item.getCodigo() })),
          horasContratadas: dados.horasContratadas,
          status: "EM_ANDAMENTO"
        })
      } );
      if (!response.ok) {
        throw ErroDominio.comProblemas( ["Erro ao cadastrar a locação: " + response.status] );
      }
      return locacao;
    } catch(erro) {
      throw erro;
    }
  }

  async obterLocacoes(): Promise<any[]> {
      const response = await fetch(`${API_URL}/locacoes`, {
          method: 'GET',
          credentials: 'include',
          headers: {
              'Content-type': 'application/json',
          },
      });
      if (!response.ok) {
        throw new Error( `Erro ao obter Locações: ${response.status}` );
      }
      return await response.json();
  }

  async filtrarObterLocacoes(idOuCpf: string): Promise<any[]> {
    if ( idOuCpf.length <= 6 && !isNaN(Number(idOuCpf)) )  {
      return this.obterLocacaoPeloId(idOuCpf);
    }
    if ( idOuCpf.length === 11 && !isNaN(Number(idOuCpf)) ) {
      return this.obterLocacoesPeloCpf(idOuCpf);
    }
    throw ErroDominio.comProblemas(["Filtro inválido"]);
  }

  async obterLocacaoPeloId(id: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/locacoes/id/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw ErroDominio.comProblemas([`Erro ao obter locações por ID: ${response.status}`]);
    }
    return await response.json();
  }

  async obterLocacoesPeloCpf(cpf: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/locacoes/cpf/${cpf}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw ErroDominio.comProblemas([`Erro ao obter locações por CPF: ${response.status}`]);
    }
    return await response.json();
  }

  async mapearLocacao(dados: any): Promise<Locacao> {
    const codigoCliente = dados.clienteCodigo;
    const codigoFuncionario = dados.funcionarioCodigo;
    const cliente: Cliente = await this.gestorCliente.buscar(String(codigoCliente));
    const funcionario: Funcionario = await this.gestorFuncionario.buscar(codigoFuncionario);
    const listaItens: any[] = dados.itens || [];
    const promessas = listaItens.map( item => 
        this.gestorItem.buscar( String(item.codigoItem) )
    );
    const itens = await Promise.all(promessas);
    const locacao = new Locacao(
      dados.id,
      new Date(dados.dataHora),
      dados.horasContratadas,
      dados.status,
      cliente,
      funcionario,
      itens
    );
    const problemas = locacao.validar();
      if ( problemas.length > 0 ) {
        throw ErroDominio.comProblemas(problemas);
      }
    return locacao;
  }
  
}