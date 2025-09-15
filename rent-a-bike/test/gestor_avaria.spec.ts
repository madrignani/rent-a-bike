import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GestorAvaria } from '../src/gestor/gestor_avaria';
import { ErroDominio } from '../src/infra/erro_dominio';


vi.mock( '../src/gestor/rota_api.ts', () => ({
  API_URL: 'http://simulacao-api'
}) );


describe('GestorAvaria', () => {

  let gestor: GestorAvaria;

  beforeEach( () => {
    vi.restoreAllMocks();
    gestor = new GestorAvaria();
  } );

  it( 'Deve retornar true se o nome do arquivo de imagem já existir.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ( { existe: true } )
    }) );
    const resultado = await gestor.verificarNomeArquivo('imagem1.jpg');
    expect(resultado).toBe(true);
  } );

  it( 'Deve retornar false se o nome do arquivo não existir.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ( { existe: false } )
    }) );
    const resultado = await gestor.verificarNomeArquivo('imagem2.jpg');
    expect(resultado).toBe(false);
  });

  it( 'Deve lançar ErroDominio se a resposta da API for inválida.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    }) );
    await expect(
      gestor.verificarNomeArquivo('foto3.jpg')
    ).rejects.toThrow(ErroDominio);
  } );

  it( 'Deve lançar erro genérico se o fetch falhar.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockRejectedValue(new Error('Falha de conexão')) );
    await expect(
      gestor.verificarNomeArquivo('foto4.jpg')
    ).rejects.toThrow('Falha de conexão');
  } );

} );