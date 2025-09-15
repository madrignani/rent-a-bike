import { ErroDominio } from "../infra/erro_dominio.ts";
import { API_URL } from "./rota_api.ts";

export class GestorAvaria {

    async verificarNomeArquivo(nomeArquivo: string): Promise<boolean> {
        const response = await fetch( `${API_URL}/avarias/verificar-nome?arquivo=${encodeURIComponent(nomeArquivo)}`, {
            method: 'GET',
            credentials: 'include'
        } );
        if (!response.ok) {
            throw ErroDominio.comProblemas( [`Erro ao verificar nome do arquivo: ${response.status}`] );
        }
        const resultado = await response.json();
        return resultado.existe;
    }

}