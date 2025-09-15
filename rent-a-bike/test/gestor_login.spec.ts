import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GestorLogin } from '../src/gestor/gestor_login';
import { ErroDominio } from '../src/infra/erro_dominio';


vi.mock( '../src/gestor/rota_api', () => ({
  API_URL: 'http://simulacao-api'
}) );


describe( 'GestorLogin', () => {

  let gestor: GestorLogin;

  beforeEach( () => {
    vi.restoreAllMocks();
    gestor = new GestorLogin();
  } );

  it( 'LOGIN -> Deve autenticar com CPF e senha válidos e redirecionar.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true
    }) );
    vi.stubGlobal('window', {
      location: {
        href: ''
      }
    } );
    await gestor.autenticar('12345678901', 'minhasenha');
    expect(window.location.href).toBe('/index.html');
  } );

  it( 'LOGIN -> Deve lançar erro se o CPF for inválido.', async () => {
    await expect( gestor.autenticar('1234', 'minhasenha') ).rejects.toThrow(ErroDominio);
  } );

  it( 'LOGIN -> Deve lançar erro se a resposta for inválida e retornar mensagens da API.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ( { mensagens: ['Erro ao autenticar.'] })
    }) );
    await expect(gestor.autenticar('12345678901', 'minhasenha')).rejects.toThrowError(ErroDominio);
  } );

  it( 'LOGOUT -> Deve fazer logout com sucesso.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true
    }) );
    await expect( gestor.logout() ).resolves.not.toThrow();
  } );

  it( 'LOGOUT -> Deve lançar erro se falhar.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500
    }) );
    await expect( gestor.logout() ).rejects.toThrow(ErroDominio);
  } );

} );