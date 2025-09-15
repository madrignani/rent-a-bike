import type { VisaoRelatorioItens } from './visao_relatorio_itens.ts';
import { ControladoraRelatorioItens } from '../controladora/controladora_relatorio_itens.ts';
import Chart from 'chart.js/auto';

export class VisaoRelatorioItensEmHTML implements VisaoRelatorioItens {
    private controladora: ControladoraRelatorioItens;

    private inputInicio = document.getElementById('dataInicio') as HTMLInputElement;
    private inputFim = document.getElementById('dataFim') as HTMLInputElement;
    private botaoGerar = document.getElementById('botaoGerarRelatorio') as HTMLButtonElement;
    private divGrafico = document.getElementById('graficoPizza') as HTMLDivElement;
    private tabelaRanking = document.getElementById('tabelaRanking') as HTMLTableElement;
    private dropdownConteudoUsuario = document.getElementById("dropdownConteudoUsuario") as HTMLDivElement;

    constructor() {
        this.controladora = new ControladoraRelatorioItens(this);
    }

    iniciar(): void {
        this.tabelaRanking.style.display = 'none';
        this.controladora.iniciarSessao();
        this.iniciarLogout();
        this.inicializarRelatorio();
    }

    exibirUsuarioLogado(nome: string, cargo: string): void {
        this.dropdownConteudoUsuario.innerHTML = `
            <p>${nome}</p>
            <p>Cargo: ${cargo}</p>
        `;
    }

    private iniciarLogout(): void {
        const botaoLogout = document.getElementById('botaoLogout') as HTMLButtonElement;
        botaoLogout.addEventListener( "click", () => {
            this.controladora.logout();
        } );
    }

    exibirMensagem( mensagens: string[] ): void {
        alert( mensagens.join('\n') );
    }

    private inicializarRelatorio(): void {
        this.botaoGerar.addEventListener( 'click', () => {
            const inicio = this.inputInicio.value;
            const fim = this.inputFim.value;
            this.controladora.gerarRelatorio( { inicio, fim } );
        } );
    }

    exibirRelatorio( registros: { descricao: string; quantidade: number }[] ): void {
        this.tabelaRanking.style.display = 'table';
        this.divGrafico.innerHTML = '';
        const canvas = document.createElement('canvas');
        this.divGrafico.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            this.exibirMensagem( ['Não foi possível obter contexto para o gráfico.'] );
            return;
        }
        const labels = registros.map( registro => registro.descricao );
        const data = registros.map( registro => registro.quantidade );
        new Chart( ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [ { data } ]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            color: '#ffffff', padding: 30, boxWidth: 20, boxHeight: 20,
                            font: { size: 16 }
                        }
                    }
                },
                layout: {
                    padding: { top: 20, bottom: 10, left: 0, right: 0 }
                }
            }
        } );
        const total = ( data.reduce((sum, v) => sum + v, 0) );
        const tbody = this.tabelaRanking.querySelector('tbody')!;
        tbody.innerHTML = '';
        registros.slice(0, 10).forEach( (registro, indice) => {
            let porcentual;
            if (total > 0) {
                porcentual = ( (registro.quantidade / total) * 100 ).toFixed(2) + '%';
            } else {
                porcentual = '0%';
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${indice + 1}</td>
                <td>${registro.descricao}</td>
                <td>${registro.quantidade}</td>
                <td>${porcentual}</td>
            `;
            tbody.appendChild(tr);
        } );
    }

    limparRelatorio(): void {
        this.tabelaRanking.style.display = 'none';
        this.divGrafico.innerHTML = '';
        const tbody = this.tabelaRanking.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
        }
    }

}