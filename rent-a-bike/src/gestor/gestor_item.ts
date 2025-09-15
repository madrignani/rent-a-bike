import { GestorFuncionario } from "./gestor_funcionario.ts";
import { ErroDominio } from "../infra/erro_dominio.ts";
import { Item } from "../modelo/item.ts";
import { Fabricante } from "../modelo/fabricante.ts";
import { Avaria } from "../modelo/avaria.ts";
import { API_URL } from "./rota_api.ts";

export class GestorItem {

  async buscar(codigo: string): Promise<Item> {
    try {
      const codigoNumero = Number(codigo);
      if ( isNaN(codigoNumero) || codigoNumero <= 0 ) {
        throw ErroDominio.comProblemas( ["O código do item deve ser um número inteiro positivo."] );
      }
      const resp = await fetch(`${API_URL}/itens/${codigo}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!resp.ok) {
        throw ErroDominio.comProblemas( [`Erro ao buscar o item. Código: ${resp.status}`] );
      }
      const dados = await resp.json();
      if (!dados || !dados.fabricante) {
        throw ErroDominio.comProblemas( ["Item ou fabricante não encontrado."] );
      }
      const fabricante = new Fabricante(dados.fabricante.codigo, dados.fabricante.descricao);
      const item = new Item(
        dados.codigo,
        dados.modelo,
        dados.descricao,
        dados.valorHora,
        fabricante,
        [],                
        dados.disponivel
      );
      const gestorFuncionario = new GestorFuncionario();
      let avarias: Avaria[] = [];
      if (dados.avarias && dados.avarias.length > 0) {
        avarias = await Promise.all(dados.avarias.map(async (a: any) => {
            const avaliador = await gestorFuncionario.buscar(a.avariaAvaliadorCodigo);
            return new Avaria(
              a.avariaId,
              a.avariaDevolucaoId,
              item,
              new Date(a.avariaDataHora),
              avaliador,
              a.avariaDescricao,
              a.avaraiaCaminhoFoto ?? "",
              Number(a.avariaValorCobrar)
            );
          })
        );
      }
      item.setAvarias(avarias);
      const problemas = item.validar();
      if ( problemas.length > 0 ) {
        throw ErroDominio.comProblemas(problemas);
      }
      return item;
    } catch (erro) {
      throw erro;
    }
  }

}