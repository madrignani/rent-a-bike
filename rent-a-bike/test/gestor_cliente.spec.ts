import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GestorCliente } from '../src/gestor/gestor_cliente';
import { Cliente } from '../src/modelo/cliente';
import { ErroDominio } from '../src/infra/erro_dominio';


vi.mock( '../src/gestor/rota_api', () => ({
  API_URL: 'http://simulacao-api'
}) );


describe( 'GestorCliente', () => {

  let gestor: GestorCliente;

  beforeEach( () => {
    gestor = new GestorCliente();
    vi.restoreAllMocks();
  } );

  it( 'Deve lançar ErroDominio para busca inválida.', async () => {
    await expect( gestor.buscar('abc') ).rejects.toBeInstanceOf(ErroDominio);
    await expect( gestor.buscar('12345') ).rejects.toBeInstanceOf(ErroDominio);
    await expect( gestor.buscar('1234567890') ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'Deve buscar por código quando ocorre busca numérica com até 4 dígitos.', async () => {
    const dadosMock = {
      codigo: 10,
      nome: 'Cliente Teste ID',
      cpf: '85784236985',
      telefone: '11999998888',
      email: 'teste@teste.com',
      endereco: 'Rua A, 123',
      fotoUrl: 'http://imagem.com/foto.jpg',
      dataNascimento: '2000-01-01'
    };
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => dadosMock
    }) );
    const cliente = await gestor.buscar('10');
    expect( cliente ).toBeInstanceOf(Cliente);
    expect( cliente.getCodigo() ).toBe(10);
    expect( cliente.getNome() ).toBe('Cliente Teste ID');
  } );

  it( 'Deve buscar por CPF quando busca numérica com 11 dígitos.', async () => {
    const dadosMock = {
      codigo: 20,
      nome: 'Cliente Teste CPF',
      cpf: '58967452135',
      telefone: '21988887777',
      email: 'teste@teste.com',
      endereco: 'Rua A, 123',
      fotoUrl: 'http://imagem.com/foto.jpg',
      dataNascimento: '2000-01-01'
    };
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => dadosMock
    }) );
    const cliente = await gestor.buscar('58967452135');
    expect( cliente.getCpf() ).toBe('58967452135');
    expect( cliente.getEmail() ).toBe('teste@teste.com');
  });

  it( 'Deve lançar ErroDominio se response.ok for false.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => null
    }) );
    await expect( gestor.buscar('1') ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'Deve lançar ErroDominio se json for null ou indefinido.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => null
    }) );
    await expect( gestor.buscar('2') ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'Deve lançar ErroDominio se dados do cliente forem inválidos.', async () => {
    const dadosInvalidos = {
      codigo: 5,
      nome: 'AB',
      cpf: 'abcdef12345',
      telefone: '123',
      email: 'teste@teste.com',
      endereco: 'Rua A, 123',
      fotoUrl: '',
      dataNascimento: new Date(Date.now() + 86400000).toISOString()
    };
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => dadosInvalidos
    }) );
    await expect( gestor.buscar('5') ).rejects.toBeInstanceOf(ErroDominio);
  } );

} );