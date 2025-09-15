import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GestorLocacao, DadosNovaLocacao } from '../src/gestor/gestor_locacao';
import { Locacao } from '../src/modelo/locacao';
import { Cliente } from '../src/modelo/cliente';
import { Funcionario } from '../src/modelo/funcionario';
import { Item } from '../src/modelo/item';
import { ErroDominio } from '../src/infra/erro_dominio';
import { Cargo } from '../src/modelo/cargo';
import { Fabricante } from '../src/modelo/fabricante';


vi.mock( '../src/gestor/rota_api', () => ({
  API_URL: 'http://simulacao-api'
}) );


vi.mock( '../src/gestor/gestor_cliente', async () => {
  const atual = await vi.importActual<typeof import('../src/gestor/gestor_cliente')>('../src/gestor/gestor_cliente');
  return {
    ...atual,
    GestorCliente: class extends atual.GestorCliente {
      async buscar() { return new Cliente(1, 'Cliente', '12345678901', '11999998888', 'email.com', 'Rua', '', new Date('2000-01-01')); }
    }
  };
} );


vi.mock( '../src/gestor/gestor_funcionario', async () => {
  const atual = await vi.importActual<typeof import('../src/gestor/gestor_funcionario')>('../src/gestor/gestor_funcionario');
  return {
    ...atual,
    GestorFuncionario: class extends atual.GestorFuncionario {
      async buscar() { return new Funcionario(2, 'Funcionario', '10987654321', Cargo.ATENDENTE); }
    }
  };
} );


vi.mock( '../src/gestor/gestor_item', async () => {
  const atual = await vi.importActual<typeof import('../src/gestor/gestor_item')>('../src/gestor/gestor_item');
  return {
    ...atual,
    GestorItem: class extends atual.GestorItem {
      async buscar(codigo: string) { 
        return new Item( Number(codigo), 'mod', 'des', 10, new Fabricante(1, 'fab'), [], true );
      }
    }
  };
} );


describe( 'GestorLocacao', () => {

  let gestor: GestorLocacao;

  beforeEach( () => {
    gestor = new GestorLocacao();
    vi.restoreAllMocks();
  } );

  it( 'REGISTRAR -> Deve criar locação válida e chamar fetch.', async () => {
    const cliente = new Cliente( 1, 'Cliente', '12345678901', '11999998888', 'email.com', 'Rua', '', new Date('2000-01-01') );
    const funcionario = new Funcionario( 2, 'Funcionario', '10987654321', Cargo.GERENTE );
    const item = new Item( 3, 'mod', 'des', 5, new Fabricante(1, 'fab'), [], true );
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue( { ok: true, status: 201 } ) );
    const dados: DadosNovaLocacao = { cliente, funcionario, itens: [item], horasContratadas: 4 };
    const resultado = await gestor.registrarLocacao(dados);
    expect( resultado ).toBeInstanceOf(Locacao);
    expect( resultado.getHorasContratadas() ).toBe(4);
    expect( fetch ).toHaveBeenCalled();
  } );

  it( 'REGISTRAR -> Deve lançar ErroDominio para dados inválidos.', async () => {
    const cliente = new Cliente( 1, 'Cliente', '123', '1', 'e', 'R', '', new Date('2100-01-01') );
    const funcionario = new Funcionario(2, 'Func', '10987654321', Cargo.ATENDENTE);
    const dados: DadosNovaLocacao = { cliente, funcionario, itens: [], horasContratadas: 0 };
    await expect( gestor.registrarLocacao(dados) ).rejects.toBeInstanceOf(ErroDominio);
  });

  it( 'REGISTRAR -> Deve lançar ErroDominio se fetch retornar erro.', async () => {
    const cliente = new Cliente( 1, 'Cliente', '12345678901', '11999998888', 'email.com', 'Rua', '', new Date('2000-01-01') );
    const funcionario = new Funcionario(2, 'Funcionario', '10987654321', Cargo.GERENTE);
    const item = new Item(3, 'mod', 'des', 5, new Fabricante(1, 'fab'), [], true);
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }) );
    const dados: DadosNovaLocacao = { cliente, funcionario, itens: [item], horasContratadas: 2 };
    await expect( gestor.registrarLocacao(dados) ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'OBTER TODAS -> Deve retornar array de locações.', async () => {
    const arr = [ { id:1 }, { id:2 } ];
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue( { ok: true, status: 200, json: async () => arr } ) );
    const resposta = await gestor.obterLocacoes();
    expect(resposta).toEqual(arr);
  });

  it( 'OBTER TODAS -> Deve lançar Error se fetch.erro.', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect( gestor.obterLocacoes() ).rejects.toThrow('Erro ao obter Locações: 404');
  } );

  it( 'FILTRAR -> Deve filtrar por ID numérico.', async () => {
    const dados = [ { id:3 } ];
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue( { ok: true, status:200, json: async () => dados } ) );
    const resposta = await gestor.filtrarObterLocacoes('123');
    expect(resposta).toEqual(dados);
  } );

  it( 'FILTRAR -> Deve filtrar por CPF de 11 dígitos.', async () => {
    const dados = [ { id:4 } ];
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue( { ok: true, status:200, json: async () => dados } ) );
    const resposta = await gestor.filtrarObterLocacoes('12345678901');
    expect(resposta).toEqual(dados);
  } );

  it( 'FILTRAR -> Deve lançar ErroDominio para filtro inválido.', async () => {
    await expect( gestor.filtrarObterLocacoes('abc') ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'BUSCAR UMA -> Deve retornar dados quando fetch.ok', async () => {
    const dados = [ { id:5 } ];
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue( { ok: true, status:200, json: async () => dados } ) );
    const resposta = await gestor.obterLocacaoPeloId('5');
    expect(resposta).toEqual(dados);
  } );

  it( 'BUSCAR UMA -> Deve lançar ErroDominio se fetch.ok false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status:404 }));
    await expect( gestor.obterLocacaoPeloId('5') ).rejects.toBeInstanceOf(ErroDominio);
  } );

} );