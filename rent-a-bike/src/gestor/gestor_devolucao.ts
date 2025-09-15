import { Devolucao } from "../modelo/devolucao.ts";
import { GestorFuncionario } from "./gestor_funcionario.ts";
import { GestorLocacao } from "./gestor_locacao.ts";
import { ErroDominio } from "../infra/erro_dominio.ts";
import { API_URL } from "./rota_api.ts";

export interface DadosNovaDevolucao {
  funcionarioCodigo: number;
  locacaoId: number;
  dataHora: Date;
  valorPago: number;
  avarias?: Array<{
    itemCodigo: number;
    avaliadorCodigo: number;
    descricao: string;
    valorCobrar: number;
    caminhoFoto: string;
    arquivoBase64: string;
  }>;
}

export class GestorDevolucao {
    private gestorFuncionario = new GestorFuncionario();
    private gestorLocacao = new GestorLocacao();

    async registrarDevolucao(dados: DadosNovaDevolucao): Promise<any> {
        const funcionario = await this.gestorFuncionario.buscar(dados.funcionarioCodigo);
        const locacoes = await this.gestorLocacao.obterLocacaoPeloId( String(dados.locacaoId) );
        if (!locacoes.length) {
            throw ErroDominio.comProblemas( [`Locação ${dados.locacaoId} não encontrada.`] );
        }
        const locacaoDados = locacoes[0];
        const locacaoObjeto = await this.gestorLocacao.mapearLocacao(locacaoDados);
        const devolucao = new Devolucao(
            null,
            funcionario,
            locacaoObjeto,
            dados.dataHora,
            dados.valorPago
        );
        const problemas = devolucao.validar();
        if (problemas.length > 0) {
            throw ErroDominio.comProblemas(problemas);
        }
        const corpoRequisicao: any = {
            funcionario: { codigo: dados.funcionarioCodigo },
            locacao: { id: dados.locacaoId },
            dataHora: dados.dataHora,
            valorPago: dados.valorPago,
        };
        if ( dados.avarias && dados.avarias.length > 0 ) {
            corpoRequisicao.avarias = dados.avarias;
        }
        const response = await fetch( `${API_URL}/devolucoes`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(corpoRequisicao),
        } );
        if (!response.ok) {
            throw ErroDominio.comProblemas( [`Erro ao cadastrar devolução: ${response.status}`] );
        }
        return await response.json();
    }

    async obterDevolucoes(): Promise<any[]> {
        const response = await fetch( `${API_URL}/devolucoes`,{
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error( `Erro ao obter Locações: ${response.status}`);
        }
        return await response.json();
    }

    async filtrarObterDevolucoes(cpf: string): Promise<any[]>{
        try {
            let urlBusca: string;
            if ( cpf.length === 11 && !isNaN(Number(cpf)) ){
                urlBusca = `${API_URL}/devolucoes/cpf/${cpf}`;
            } else {
                throw ErroDominio.comProblemas( ["Filtro inválido"]);
            }
            const response = await fetch( urlBusca, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw ErroDominio.comProblemas( [`Erro ao obter Devoluções: ${response.status}`] );
            }
            const dados = await response.json();
            return dados;
        } catch (erro) {
            throw erro;
        }
    }

}