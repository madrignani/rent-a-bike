import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GestorItem } from '../src/gestor/gestor_item';
import { Item } from '../src/modelo/item';
import { Fabricante } from '../src/modelo/fabricante';
import { ErroDominio } from '../src/infra/erro_dominio';


vi.mock( '../src/gestor/rota_api', () => ({
  API_URL: 'http://simulacao-api'
}) );


describe( 'GestorItem', () => {

  let gestor: GestorItem;

  beforeEach( () => {
    gestor = new GestorItem();
    vi.restoreAllMocks();
  } );

  it( 'Deve lançar ErroDominio para código inválido.', async () => {
    await expect( gestor.buscar('abc') ).rejects.toBeInstanceOf(ErroDominio);
    await expect( gestor.buscar('0') ).rejects.toBeInstanceOf(ErroDominio);
    await expect( gestor.buscar('-1') ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'Deve lançar ErroDominio se fetch retorna status de erro.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => null
    }) );
    await expect( gestor.buscar('1') ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'Deve retornar Item sem avarias quando dados válidos sem Avaria.', async () => {
    const dadosMock = {
      codigo: 2, modelo: 'mod', descricao: 'des', valorHora: 10,
      fabricante: { codigo: 1, descricao: 'fab' }, disponivel: true
    };
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => dadosMock
    }) );
    const item = await gestor.buscar('2');
    expect( item ).toBeInstanceOf(Item);
    expect( item.getCodigo() ).toBe(2);
    expect( item.getFabricante() ).toBeInstanceOf(Fabricante);
    expect( item.getAvarias() ).toEqual([]);
    expect( item.getDisponivel() ).toBe(true);
  } );

  it( 'Deve lançar ErroDominio se o item é inválido após validação.', async () => {
    const dadosMock = {
      codigo: 4, modelo: 'mod', descricao: 'des', valorHora: 0,
      fabricante: { codigo: 8, descricao: 'fab' }, disponivel: true
    };
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => dadosMock
    }) );
    await expect( gestor.buscar('4') ).rejects.toBeInstanceOf(ErroDominio);
  });

} );