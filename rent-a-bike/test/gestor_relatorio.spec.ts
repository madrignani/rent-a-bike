import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GestorRelatorio } from '../src/gestor/gestor_relatorio';
import { ErroDominio } from '../src/infra/erro_dominio';


vi.mock( '../src/gestor/rota_api.ts', () => ({
  API_URL: 'http://simulacao-api'
}) );


describe( 'GestorRelatorio', () => {

  let gestor: GestorRelatorio;

  beforeEach( () => {
    vi.restoreAllMocks();
    gestor = new GestorRelatorio();
  } );

  it( 'LOCAÇÕES DEVOLVIDAS -> Deve retornar dados com sucesso.', async () => {
    const mockDados = [
      { data: '2025-01-01', total_pago: 1000 },
      { data: '2025-01-02', total_pago: 2000 }
    ];
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDados
    }) );
    const resultado = await gestor.obterLocacoesDevolvidas( { inicio: '2025-01-01', fim: '2025-01-31' } );
    expect( resultado ).toEqual( mockDados );
  } );

  it( 'LOCAÇÕES DEVOLVIDAS -> Deve lançar ErroDominio se resposta for inválida.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    }) );
    await expect(
      gestor.obterLocacoesDevolvidas( { inicio: '2025-01-01', fim: '2025-01-31' } )
    ).rejects.toThrow( ErroDominio );
  } );

  it( 'TOP 10 ITENS -> Deve retornar dados com sucesso.', async () => {
    const mockTopItens = [
      { codigo: 1, descricao: 'Bike A', quantidade: 15 },
      { codigo: 2, descricao: 'Bike B', quantidade: 10 }
    ];
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTopItens
    }) );
    const resultado = await gestor.obterTop10Itens( {inicio: '2025-01-01', fim: '2025-01-31'} );
    expect(resultado).toEqual(mockTopItens);
  } );

  it( 'TOP 10 ITENS -> Deve lançar ErroDominio se resposta for inválida.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403
    }) );
    await expect(
      gestor.obterTop10Itens( {} )
    ).rejects.toThrow( ErroDominio );
  } );

} );