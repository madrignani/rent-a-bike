import { GestorFuncionario } from "../gestor/gestor_funcionario";
import { GestorLocacao } from "../gestor/gestor_locacao";
import { GestorLogin } from "../gestor/gestor_login";
import { GestorSessao } from "../gestor/gestor_sessao";
import { GestorDevolucao } from "../gestor/gestor_devolucao";
import { GestorAvaria } from "../gestor/gestor_avaria";
import { ConversorBase64 } from "../utils/conversor_base64.ts";
import type { VisaoCadastroDevolucao } from "../visao/visao_cadastro_devolucao";
import { ErroDominio } from "../infra/erro_dominio";

export class ControladoraCadastroDevolucao {
  private visao: VisaoCadastroDevolucao;
  private gestorLocacao = new GestorLocacao();
  private gestorLogin = new GestorLogin();
  private gestorFuncionario = new GestorFuncionario();
  private gestorDevolucao = new GestorDevolucao();
  private gestorAvaria = new GestorAvaria();

  private funcionarioCodigo!: number;
  private locacao: any;
  private itens: any[] = [];
  private horasContratadas: number = 0;
  private dataHoraLocacao!: Date;
  private dataHoraDevolucao!: Date;
  private taxaLimpezaAplicada: boolean[] = [];
  private subtotais: number[] = [];
  private valorFinal!: number;

  private avariasTemporarias: {
    itemIndice: number;
    avaliadorCodigo: number;
    descricao: string;
    valor: number;
    fotoCaminho: string;
    arquivoBase64: string;
  } [] = [];

  constructor(visao: VisaoCadastroDevolucao) {
    this.visao = visao;
  }
  
  async iniciarSessao(): Promise<void> {
    try {
      await this.verificarPermissao();
      this.buscarUsuarioLogado();
    } catch (erro: any) {
        let mensagens: string[];
        if (erro instanceof ErroDominio) {
          mensagens = erro.getProblemas();
        } else {
          mensagens = ["Erro: " + erro.message];
        }
        this.visao.exibirMensagem(mensagens);
        window.location.href = "index.html";
    }
  }

  private async verificarPermissao(): Promise<void> {
    await GestorSessao.carregarFuncionario();
    const funcionario = GestorSessao.getFuncionario();
    if (!funcionario) {
      this.visao.exibirMensagem( ["Sessão não encontrada. Faça login novamente."] );
      window.location.href = "login.html";
      return;
    }
    if (funcionario.getCargo() === "MECANICO") {
      this.visao.exibirMensagem( ["Acesso restrito para mecânicos."] );
      window.location.href = "index.html";
      return;
    }
    this.funcionarioCodigo = funcionario.getCodigo();
  }

  private buscarUsuarioLogado(): void {
    const funcionario = GestorSessao.getFuncionario();
    if (funcionario) {
        this.visao.exibirUsuarioLogado( funcionario.getNome(), funcionario.getCargo() );
    }
  }

  async logout(): Promise<void> {
    try {
      await this.gestorLogin.logout();
      window.location.href = "./login.html";
    } catch (erro: any) {
      if (erro instanceof ErroDominio) {
        this.visao.exibirMensagem(erro.getProblemas());
      } else {
        this.visao.exibirMensagem( ["Erro ao fazer logout: " + erro.message] );
      }
    }
  }

  async carregarDadosLocacaoParaDevolucao(idLocacao: string | null): Promise<void> {
    try {
      if (!idLocacao || idLocacao.trim() === "") {
        this.visao.exibirMensagem( ["ID da Locação não foi fornecido."] );
        window.location.href = "index.html";
        return;
      }
      const id = idLocacao;
      const idNum = Number(id);
      if (Number.isNaN(idNum)) {
        this.visao.exibirMensagem( ["ID da Locação inválido."] );
        window.location.href = "index.html";
        return;
      }
      const [dados] = await this.gestorLocacao.obterLocacaoPeloId(id);
      if (dados.status === "FINALIZADA") {
        this.visao.exibirMensagem( ["Locação já está finalizada."] );
        window.location.href = "index.html";
        return;
      }
      const itensDaLocacao = dados.itens.map((i: any) => ({
        codigoItem: i.codigoItem,
        descricao: i.descricaoItem,
        valorHora: i.valorHoraItem,
        avarias: i.avarias,
      }));
      this.dataHoraDevolucao = new Date();
      this.locacao = {
        id: dados.id,
        dataHora: dados.dataHora,
        horasContratadas: dados.horasContratadas,
        status: dados.status,
        itens: itensDaLocacao,
        dataHoraDev: this.dataHoraDevolucao
      };
      this.itens = itensDaLocacao;
      this.horasContratadas = dados.horasContratadas;
      this.dataHoraLocacao = new Date(dados.dataHora);
      this.taxaLimpezaAplicada = this.itens.map(() => false);
      this.visao.exibirDadosLocacao(this.locacao);
      this.adicionarTaxaLimpeza();
      this.calcularSubtotais();
      this.calcularResumoFinanceiro();
    } catch (erro: any) {
      if (erro instanceof ErroDominio) {
        this.visao.exibirMensagem(erro.getProblemas());
      } else {
        this.visao.exibirMensagem([`Erro ao carregar locação: ${erro.message}`]);
      }
      window.location.href = "./index.html";
    }
  }

  private adicionarTaxaLimpeza(): void {
    const botoes = document.querySelectorAll<HTMLButtonElement>('.btn-limpeza');
    botoes.forEach(btn => {
      const indiceItem = Number(btn.dataset.index);
      btn.addEventListener('click', () => {
        this.taxaLimpezaAplicada[indiceItem] = !this.taxaLimpezaAplicada[indiceItem];
        btn.textContent = this.taxaLimpezaAplicada[indiceItem] ? 'Sim' : 'Não';
        this.calcularSubtotais();
      });
    });
  }

  private calcularAtrasoHorasTotais(): number {
    const tempoAlocadoEmMs = this.dataHoraDevolucao.getTime() - this.dataHoraLocacao.getTime();
    const minutosAlocados = tempoAlocadoEmMs / (1000 * 60);
    const minutosContratados = this.horasContratadas * 60;
    const tolerancia = 15;
    if (minutosAlocados <= minutosContratados) {
      return Math.ceil(minutosAlocados / 60);
    }
    if (minutosAlocados <= minutosContratados + tolerancia) {
      return this.horasContratadas;
    }
    return Math.ceil(minutosAlocados / 60);
  }

  calcularSubtotais(): void {
    const totalHoras = this.calcularAtrasoHorasTotais();
    const subtotais = this.itens.map((item, i) => {
      const base = item.valorHora * totalHoras;
      let taxaLimpeza = 0;
      if (this.taxaLimpezaAplicada[i]) {
        taxaLimpeza = item.valorHora * 0.10; 
      }
      let totalAvarias = 0;
      for (const av of this.avariasTemporarias) {
        if (av.itemIndice === i) {
          totalAvarias += av.valor;
        }
      }
      return base + taxaLimpeza +totalAvarias;
    });
    this.subtotais = subtotais;
    this.visao.atualizarSubtotais(subtotais);
    this.calcularResumoFinanceiro();
  }

  private calcularResumoFinanceiro(): void {
    let totalPagar = 0;
    for (const valor of this.subtotais) {
      totalPagar += valor;
    }
    const totalHoras = this.calcularAtrasoHorasTotais();
    let desconto = 0;
    if(totalHoras>=2){
      desconto+= (totalPagar * 0.10);
    }
    const valorComDesconto = totalPagar - desconto;
    this.valorFinal = valorComDesconto;
    this.visao.exibirResumoFinanceiro({ totalPagar, desconto, valorComDesconto });
  }

  async iniciarRegistroAvaria(index: number): Promise<void> {
    try {
      const funcionariosObj = await this.gestorFuncionario.obterFuncionarios();
      const funcionarios = this.gestorFuncionario.converterParaArray(funcionariosObj);
      const descricao = this.itens[index].descricao; 
      this.visao.atualizarTituloModal(descricao);
      const campoIdItem = document.getElementById("idItemAvaria") as HTMLInputElement;
      campoIdItem.value = String(index);
      this.visao.exibirAvaliadores(funcionarios);
      this.visao.showModal();
      this.visao.iniciarLançamentoAvaria();
      const btnCancelar = document.getElementById("cancelarAvaria") as HTMLButtonElement;
      btnCancelar.addEventListener('click', () => {this.visao.hideModal();});
    } catch (erro: any) {
      if (erro instanceof ErroDominio) {
        this.visao.exibirMensagem(erro.getProblemas());
      } else {
        this.visao.exibirMensagem(["Erro ao carregar avaliadores: " + erro.message]);
      }
    }
  }

  async lançarAvaria(): Promise<void> {
      const indice = Number( (document.getElementById("idItemAvaria") as HTMLInputElement).value );
      const avaliadorCodigo = Number( (document.getElementById("avaliador") as HTMLSelectElement).value );
      const descricao = ( document.getElementById("descricaoAvaria") as HTMLTextAreaElement ).value;
      const valor = Number( (document.getElementById("valorAvaria") as HTMLInputElement).value );
      const inputFoto = document.getElementById("fotoAvaria") as HTMLInputElement;
      if (!inputFoto.files || inputFoto.files.length === 0) {
          this.visao.exibirMensagem( ["Selecione uma foto para a avaria."] );
          return;
      }
      const fotoFile = inputFoto.files[0];
      const nomeLower = fotoFile.name.toLowerCase();
      if ( !nomeLower.endsWith(".jpg") ) {
          this.visao.exibirMensagem( ["Arquivo inválido. Apenas imagens com extensão .jpg são permitidas."] );
          return;
      }
      const tamanhoMaximo = ( 4 * 1024 * 1024 );
      if (fotoFile.size > tamanhoMaximo) {
        this.visao.exibirMensagem( ["Arquivo muito grande. Máximo permitido: 4MB."] );
        return;
      }
      const nomeArquivo = fotoFile.name;
      const caminhoCompleto = `fotos/avarias/${nomeArquivo}`;
      let nomeExisteTemporarias = false;
      for (const avaria of this.avariasTemporarias) {
          if (avaria.fotoCaminho === caminhoCompleto) {
              nomeExisteTemporarias = true;
              break;
          }
      }
      if (nomeExisteTemporarias) {
          this.visao.exibirMensagem( ["Esta imagem de avaria já foi adicionada para a devolução."] );
          return;
      }
      const nomeExisteApi = await this.gestorAvaria.verificarNomeArquivo(nomeArquivo);
      if (nomeExisteApi) {
          this.visao.exibirMensagem( ["Já existe uma imagem com este nome no sistema, a renomeie ou selecione outra."] );
          return;
      }
      const arquivoDataURL = await ConversorBase64.arquivoParaDataURL(fotoFile);
      const arquivoBase64 = ConversorBase64.extrairBase64DeDataURL(arquivoDataURL);
      this.avariasTemporarias.push( {
          itemIndice: indice,
          avaliadorCodigo,
          descricao,
          valor,
          fotoCaminho: caminhoCompleto,
          arquivoBase64
      } );
      this.calcularSubtotais();
      this.visao.adicionarLinhaAvaria(indice, descricao, valor, this.avariasTemporarias.length - 1);
      ( document.getElementById("formAvaria") as HTMLFormElement ).reset();
      this.visao.hideModal();
  }

  removerAvaria(itemIndice: number, avariaIndice: number): void {
    this.avariasTemporarias.splice(avariaIndice, 1);
    this.calcularSubtotais();
    this.visao.removerLinhaAvaria(itemIndice, avariaIndice);
  }

  async registrarDevolucao(): Promise<void> {
    try {
      const avarias = this.avariasTemporarias.map( avaria => ( {
        itemCodigo: this.itens[avaria.itemIndice].codigoItem,
        avaliadorCodigo: avaria.avaliadorCodigo,
        descricao: avaria.descricao,
        valorCobrar: avaria.valor,
        caminhoFoto: avaria.fotoCaminho,
        arquivoBase64: avaria.arquivoBase64
      } ) );
      await this.gestorDevolucao.registrarDevolucao( {
        funcionarioCodigo: this.funcionarioCodigo,
        locacaoId: this.locacao.id,
        dataHora: this.dataHoraDevolucao,
        valorPago: this.valorFinal,
        avarias: avarias
      } );
      this.visao.exibirMensagem( ["Devolução cadastrada com sucesso."] );
      window.location.href = "./index.html";
    } catch (erro: any) {
      if (erro instanceof ErroDominio) {
        this.visao.exibirMensagem( erro.getProblemas() );
      } else {
        this.visao.exibirMensagem( ["Erro ao cadastrar devolução: " + erro.message] );
        window.location.href = "./index.html";
      }
    }
  }

}