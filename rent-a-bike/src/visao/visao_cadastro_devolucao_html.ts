import { ControladoraCadastroDevolucao } from "../controladora/controladora_cadastro_devolucao";
import type { VisaoCadastroDevolucao } from "./visao_cadastro_devolucao";

export class VisaoCadastroDevolucaoEmHTML implements VisaoCadastroDevolucao {
    private controladora: ControladoraCadastroDevolucao;
    private dropdownConteudoUsuario = document.getElementById("dropdownConteudoUsuario") as HTMLDivElement;

    constructor() {
        this.controladora = new ControladoraCadastroDevolucao(this);
    }

    iniciar(): void {
        this.hideModal();
        this.controladora.iniciarSessao();
        const params = new URLSearchParams(window.location.search);
        const idLocacao = params.get("id");
        this.iniciarLogout();
        this.controladora.carregarDadosLocacaoParaDevolucao(idLocacao);
        document.getElementById("botaoLogout")!.addEventListener("click", () => this.controladora.logout());
        this.ColetaDadosFormAvaria(); 
        this.iniciarRegistroDevolucao();
    }

    exibirUsuarioLogado(nome: string, cargo: string): void {
        this.dropdownConteudoUsuario.innerHTML = `
            <p>${nome}</p>
            <p>Cargo: ${cargo}</p>
        `;
    }

    private iniciarLogout(): void {
        document.getElementById("botaoLogout")!.addEventListener("click", () => this.controladora.logout());
    }

    exibirMensagem(mensagem: string[]): void {
        alert(mensagem.join("\n"));
    }

    exibirDadosLocacao(locacao: any): void {
        document.getElementById("idLocacao")!.textContent = String(locacao.id);
        document.getElementById("horaDevolucao")!.textContent = new Date(locacao.dataHoraDev).toLocaleString();
        const tbody = document.getElementById("tabelaItens") as HTMLTableSectionElement;
        tbody.innerHTML = "";
        locacao.itens.forEach((item: any, index: number) => {
        let descricoesAvarias = "--";
        if (item.avarias && item.avarias.length > 0) {
            const listaDescricoes = item.avarias.map((av: any) => av.descricao);
            descricoesAvarias = listaDescricoes.join("; ");
        }
        const tr = document.createElement("tr");
        tr.setAttribute("data-index", String(index));
        tr.innerHTML = `
            <td>${item.descricao}</td>
            <td>R$ ${item.valorHora.toFixed(2)}</td>
            <td class="cel-avarias" data-index="${index}">${descricoesAvarias}</td>
            <td><button class="btn-limpeza" data-index="${index}">Não</button></td>
            <td class="cel-subtotal" data-index="${index}">R$ 0,00</td>
            <td><button class="btn-avaria" data-index="${index}">Lançar Avarias</button></td>
        `;
        tbody.appendChild(tr);
        });
        this.controladora.calcularSubtotais();
        this.iniciarLançamentoAvaria();
    }

    atualizarSubtotais(subtotais: number[]): void {
        const cels = Array.from(document.querySelectorAll<HTMLTableCellElement>('.cel-subtotal'));
        cels.forEach((cel, i) => {
            cel.textContent = `R$ ${subtotais[i].toFixed(2)}`;
        });
    }

    exibirResumoFinanceiro(resumo: { totalPagar: number; desconto: number; valorComDesconto: number }): void {
        document.getElementById("valorDesconto")!.textContent = `R$ ${resumo.desconto.toFixed(2)}`;
        document.getElementById("valorTotal")!.textContent = `R$ ${resumo.valorComDesconto.toFixed(2)}`;
    }

    iniciarLançamentoAvaria(): void {
        const btns = document.querySelectorAll<HTMLButtonElement>(".btn-avaria");
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = Number(btn.dataset.index);
                this.controladora.iniciarRegistroAvaria(index);
            });
        });
    }
    
    exibirAvaliadores(funcionarios: { codigo: number; nome: string }[]): void {
        const select = document.getElementById("avaliador") as HTMLSelectElement;
        select.innerHTML = "";
        funcionarios.forEach(f => {
            const opt = document.createElement('option');
            opt.value = String(f.codigo);
            opt.textContent = f.nome;
            select.appendChild(opt);
        });
    }
    
    atualizarTituloModal(descricao: string): void {
        const titulo = document.getElementById("tituloAvaria")!;
        titulo.textContent = `Lançar avaria para: ${descricao}`;
    }

    private ColetaDadosFormAvaria(): void {
        const form = document.getElementById("formAvaria") as HTMLFormElement;
        form.addEventListener("submit", e => {e.preventDefault();
            this.controladora.lançarAvaria();
        });
    }

    adicionarLinhaAvaria(itemIndex: number, descricao: string, valor: number, avariaIndex: number): void {
        const linhaItem = document.querySelector<HTMLTableRowElement>(
        `#tabelaItens tr[data-index=\"${itemIndex}\"]`
        );
        if (!linhaItem) return;
        const htmlAvaria = `
        <tr class="tr-avaria" data-parent-index="${itemIndex}" data-avaria-index="${avariaIndex}">
            <td colspan="4" class="td-avaria-descricao">– ${descricao}</td>
            <td class="td-avaria-valor">R$ ${valor.toFixed(2)} </td>
            <td><button type="button" class="btn-remover-avaria" data-item-index="${itemIndex}" data-avaria-index="${avariaIndex}"> Remover </button></td>
        </tr>
        `;
        linhaItem.insertAdjacentHTML("afterend", htmlAvaria);
        const btnRemover = document.querySelector<HTMLButtonElement>(`.btn-remover-avaria[data-item-index="${itemIndex}"][data-avaria-index="${avariaIndex}"]`);
        btnRemover?.addEventListener("click", () => {
            this.controladora.removerAvaria(itemIndex, avariaIndex);
        });
    }

    removerLinhaAvaria(itemIndex: number, avariaIndex: number): void {
        const tr = document.querySelector<HTMLTableRowElement>(
            `#tabelaItens tr.tr-avaria[data-parent-index="${itemIndex}"][data-avaria-index="${avariaIndex}"]`
        );
        tr?.remove();
    }

    private iniciarRegistroDevolucao(): void {
        const btnConfirmar = document.getElementById("botaoConfirmarDevolucao") as HTMLButtonElement;
        btnConfirmar.addEventListener("click", () => {
            this.controladora.registrarDevolucao();
        });
    }

    showModal(): void {
        document.getElementById("modalAvaria")!.classList.remove('hidden');
    }
    
    hideModal(): void {
        document.getElementById("modalAvaria")!.classList.add('hidden');
    }
}