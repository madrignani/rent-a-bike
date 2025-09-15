import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GestorFuncionario } from '../src/gestor/gestor_funcionario';
import { Funcionario } from '../src/modelo/funcionario';
import { Cargo } from '../src/modelo/cargo';
import { ErroDominio } from '../src/infra/erro_dominio';


vi.mock( '../src/gestor/rota_api', () => ({
  API_URL: 'http://simulacao-api'
}) );


describe('GestorFuncionario', () => {

  let gestor: GestorFuncionario;

  beforeEach( () => {
    gestor = new GestorFuncionario();
    vi.restoreAllMocks();
  } );

  it( 'OBTER TODOS -> Deve retornar lista de Funcionarios quando fetch OK e dados válidos.', async () => {
    const mockDados = [
      { codigo: 1, nome: 'Funcionario', cpf: '12345678901', cargo: Cargo.ATENDENTE }
    ];
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockDados
    }) );
    const lista = await gestor.obterFuncionarios();
    expect(lista).toHaveLength(1);
    expect(lista[0]).toBeInstanceOf(Funcionario);
    expect(lista[0].getNome()).toBe('Funcionario');
  } );

  it( 'OBTER TODOS -> Deve lançar ErroDominio se response.ok for false.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => null
    }) );
    await expect( gestor.obterFuncionarios() ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'OBTER TODOS -> Deve lançar ErroDominio se lista retornada for vazia.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => []
    }) );
    await expect( gestor.obterFuncionarios() ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'OBTER UM -> Deve lançar ErroDominio para código inválido.', async () => {
    await expect( gestor.buscar(0) ).rejects.toBeInstanceOf(ErroDominio);
    await expect( gestor.buscar(-5) ).rejects.toBeInstanceOf(ErroDominio);
    await expect( gestor.buscar(1.5) ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'OBTER UM -> Deve lançar ErroDominio se fetch retorna status de erro.', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => null
    }));
    await expect(gestor.buscar(1))
      .rejects.toBeInstanceOf(ErroDominio);
  });

  it( 'OBTER UM -> Deve retornar Funcionario quando fetch OK e json válido.', async () => {
    const mockDados = { codigo: 3, nome: 'Funcionario', cpf: '98765432100', cargo: Cargo.MECANICO };
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockDados
    }) );
    const funcionario = await gestor.buscar(3);
    expect( funcionario ).toBeInstanceOf(Funcionario);
    expect( funcionario.getCodigo() ).toBe(3);
    expect( funcionario.getCargo() ).toBe(Cargo.MECANICO);
  } );

} );