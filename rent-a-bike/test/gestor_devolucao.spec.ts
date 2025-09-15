import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GestorDevolucao, DadosNovaDevolucao } from '../src/gestor/gestor_devolucao';
import { Funcionario } from '../src/modelo/funcionario';
import { Cliente } from '../src/modelo/cliente';
import { ErroDominio } from '../src/infra/erro_dominio';
import { Cargo } from '../src/modelo/cargo';
import { Item } from '../src/modelo/item';


vi.mock( '../src/gestor/rota_api', () => ({
  API_URL: 'http://simulacao-api'
}) );


vi.mock( '../src/gestor/gestor_funcionario', async () => {
  const atual = await vi.importActual<typeof import('../src/gestor/gestor_funcionario')>('../src/gestor/gestor_funcionario');
  return {
    ...atual,
    GestorFuncionario: class extends atual.GestorFuncionario {
      async buscar(codigo: number) {
        return new Funcionario(codigo, 'Funcionario', '12345678901', Cargo.ATENDENTE);
      }
    }
  };
} );


vi.mock( '../src/gestor/gestor_cliente', async () => {
  const atual = await vi.importActual<typeof import('../src/gestor/gestor_cliente')>('../src/gestor/gestor_cliente');
  return {
    ...atual,
    GestorCliente: class extends atual.GestorCliente {
      async buscar(codigoOuCpf: number | string) {
        return new Cliente(
          1, 'Cliente', '12345678901', '22999999999', 'teste.com', 'Rua A', 'foto.com', new Date('2000-01-01')
        );
      }
    }
  };
} );


vi.mock( '../src/gestor/gestor_item', async () => {
  const atual = await vi.importActual<typeof import('../src/gestor/gestor_item')>('../src/gestor/gestor_item');
  return {
    ...atual,
    GestorItem: class extends atual.GestorItem {
      async buscar(codigo: string) {
        return new Item(
          Number(codigo), 'Item', 'desc', 50,
          new ( await import('../src/modelo/fabricante') ).Fabricante(1, 'Fabricante'),
          [], true
        );
      }
    }
  };
} );


describe( 'GestorDevolucao', () => {

  let gestor: GestorDevolucao;
  const now = new Date();
  const past = new Date( now.getTime() - 1000 );

  beforeEach( () => {
    gestor = new GestorDevolucao();
    vi.restoreAllMocks();
  } );

  it( 'REGISTRAR -> Deve registrar Devolucao com sucesso e retornar JSON.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue( {
      ok: true,
      status: 201,
      json: async () => ( { sucesso: true } )
    } ) );
    vi.spyOn( gestor['gestorLocacao'], 'obterLocacaoPeloId').mockResolvedValue( [{
      clienteCodigo: 1,
      funcionarioCodigo: 2,
      dataHora: '2024-12-30',
      horasContratadas: 1,
      status: 'EM_ANDAMENTO',
      itens: ['1']
    }] );
    const dados: DadosNovaDevolucao = {
      funcionarioCodigo: 1,
      locacaoId: 5,
      dataHora: new Date('2025-01-01'),
      valorPago: 100
    };
    const resposta = await gestor.registrarDevolucao(dados);
    expect(resposta).toEqual( { sucesso: true } );
    expect(fetch).toHaveBeenCalled();
  } );

  it( 'REGISTRAR -> Deve lançar ErroDominio se devolucao.validar falhar por data futura.', async () => {
    const futuro = new Date( now.getTime() + 1000000 );
    vi.stubGlobal('fetch', vi.fn());
    const dados: DadosNovaDevolucao = {
      funcionarioCodigo: 1,
      locacaoId: 5,
      dataHora: futuro,
      valorPago: 100
    };
    await expect( gestor.registrarDevolucao(dados) ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'REGISTRAR -> Deve lançar ErroDominio se fetch.ok for false.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }) );
    const dados: DadosNovaDevolucao = {
      funcionarioCodigo: 1,
      locacaoId: 5,
      dataHora: now,
      valorPago: 100
    };
    await expect( gestor.registrarDevolucao(dados) ).rejects.toBeInstanceOf(ErroDominio);
  } );

  it( 'LISTAR -> Deve retornar array de devoluções.', async () => {
    const array = [ { id:1 }, { id:2 } ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue( { ok: true, status: 200, json: async () => array }) );
    const resposta = await gestor.obterDevolucoes();
    expect(resposta).toEqual(array);
  } );

  it( 'LISTAR -> Deve lançar Error se response.ok for false.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue( { ok: false, status: 404 } ) );
    await expect( gestor.obterDevolucoes() ).rejects.toThrow('Erro ao obter Locações: 404');
  } );

  it( 'LISTAR COM CPF -> Deve lançar ErroDominio para CPF inválido.', async () => {
    await expect( gestor.filtrarObterDevolucoes('1234') ).rejects.toBeInstanceOf(ErroDominio);
  });

  it( 'LISTAR COM CPF -> Deve lançar ErroDominio se fetch.ok for false.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue( { ok: false, status: 500 } ) );
    await expect( gestor.filtrarObterDevolucoes('12345678901') ).rejects.toBeInstanceOf(ErroDominio);
  } );

} );