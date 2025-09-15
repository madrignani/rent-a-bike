import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GestorSessao } from '../src/gestor/gestor_sessao';
import { Cargo } from '../src/modelo/cargo';
import { ErroDominio } from '../src/infra/erro_dominio';


vi.mock( '../src/gestor/rota_api.ts', () => ({
  API_URL: 'http://simulacao-api'
}) );


describe( 'GestorSessao', () => {

  beforeEach( () => {
    vi.restoreAllMocks();
    (GestorSessao as any).funcionarioLogado = null;
  } );

  it( 'Deve carregar e retornar um funcionário válido.', async () => {
    const mockFuncionario = {
      codigo: 1,
      nome: 'Funcionario',
      cpf: '12345678901',
      cargo: Cargo.ATENDENTE
    };
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFuncionario
    }) );
    await GestorSessao.carregarFuncionario();
    const funcionario = GestorSessao.getFuncionario();
    expect( funcionario ).not.toBeNull();
    expect( funcionario?.getCodigo() ).toBe( mockFuncionario.codigo );
    expect( funcionario?.getNome() ).toBe( mockFuncionario.nome );
    expect( funcionario?.getCpf() ).toBe( mockFuncionario.cpf );
    expect( funcionario?.getCargo() ).toBe( mockFuncionario.cargo );
  } );

  it( 'Deve lançar erro e limpar funcionário se a resposta for inválida.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401
    }) );
    await expect( GestorSessao.carregarFuncionario() ).rejects.toThrow( ErroDominio );
    expect( GestorSessao.getFuncionario() ).toBeNull();
  } );

  it( 'Deve lançar erro se os dados retornados forem inválidos para validação.', async () => {
    const mockInvalido = {
      codigo: 2,
      nome: 'A',
      cpf: '123',
      cargo: Cargo.ATENDENTE
    };
    vi.stubGlobal( 'fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockInvalido
    }) );
    await expect( GestorSessao.carregarFuncionario() ).rejects.toThrow( ErroDominio );
    expect( GestorSessao.getFuncionario() ).toBeNull();
  } );

  it( 'Deve lançar erro genérico se o fetch falhar.', async () => {
    vi.stubGlobal( 'fetch', vi.fn().mockRejectedValue( new Error( 'Erro de conexão' ) ) );
    await expect( GestorSessao.carregarFuncionario() ).rejects.toThrow( ErroDominio );
    expect( GestorSessao.getFuncionario() ).toBeNull();
  } );

} );