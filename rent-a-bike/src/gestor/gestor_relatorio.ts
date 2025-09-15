import { ErroDominio } from "../infra/erro_dominio.ts";
import { API_URL } from "./rota_api.ts";

interface FiltroPeriodo {
    inicio?: string;
    fim?: string;
}

interface RegistroRelatorio {
    data: string;
    total_pago: number;
}

interface RegistroItem {
    codigo: number | null;
    descricao: string;
    quantidade: number;
}

export class GestorRelatorio {

    async obterLocacoesDevolvidas(filtro: FiltroPeriodo): Promise<RegistroRelatorio[]> {
        try {
            const params = new URLSearchParams();
            if (filtro.inicio) params.append("inicio", filtro.inicio);
            if (filtro.fim) params.append("fim", filtro.fim);
            const response = await fetch( `${API_URL}/relatorios/locacoes-devolvidas?${params.toString()}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            } );
            if (!response.ok) {
                throw ErroDominio.comProblemas( ["Erro ao gerar relatório de locações devolvidas por período:" + response.status] );
            }
            const dados: RegistroRelatorio[] = await response.json();
            return dados;
        } catch (erro: any) {
            if (erro instanceof ErroDominio) {
                throw erro;
            }
            throw new Error( "Erro ao consultar relatório de locações devolvidas: " + erro.message );
        }
    }

    async obterTop10Itens(filtro: FiltroPeriodo): Promise<RegistroItem[]> {
        try {
            const params = new URLSearchParams();
            if (filtro.inicio) params.append('inicio', filtro.inicio);
            if (filtro.fim) params.append('fim', filtro.fim);
            const response = await fetch(
                `${API_URL}/relatorios/itens/top10?${params.toString()}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            if (!response.ok) {
                throw ErroDominio.comProblemas( [`Erro ao consultar relatório de itens mais alugados: ${response.status}`] );
            }
            const dados: RegistroItem[] = await response.json();
            return dados;
        } catch (erro: any) {
            if (erro instanceof ErroDominio) {
                throw erro;
            }
            throw new Error( 'Erro ao consultar relatório de itens mais alugados: ' + erro.message );
        }
    }

}