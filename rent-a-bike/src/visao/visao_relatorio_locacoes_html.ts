import type { VisaoRelatorioLocacoes } from "./visao_relatorio_locacoes.ts";
import { ControladoraRelatorioLocacoes } from "../controladora/controladora_relatorio_locacoes.ts";
import Chart from 'chart.js/auto';

export class VisaoRelatorioLocacoesEmHTML implements VisaoRelatorioLocacoes {
    private controladora: ControladoraRelatorioLocacoes;

    private inputInicio = document.getElementById("dataInicio") as HTMLInputElement;
    private inputFim = document.getElementById("dataFim") as HTMLInputElement;
    private botaoGerar = document.getElementById("botaoGerarRelatorio") as HTMLButtonElement;
    private divGrafico = document.getElementById("grafico") as HTMLDivElement;
    private dropdownConteudoUsuario = document.getElementById("dropdownConteudoUsuario") as HTMLDivElement;

    constructor() {
        this.controladora = new ControladoraRelatorioLocacoes(this);
    }

    iniciar(): void {
        this.divGrafico.style.display = 'none';
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
        const botaoLogout = document.getElementById("botaoLogout") as HTMLButtonElement;
        botaoLogout.addEventListener( "click", () => {
            this.controladora.logout();
        } );
    }

    exibirMensagem( mensagens: string[] ): void {
        alert( mensagens.join("\n") );
    }

    private inicializarRelatorio(): void {
        this.botaoGerar.addEventListener( "click", () => {
            const inicio = this.inputInicio.value;
            const fim = this.inputFim.value;
            this.controladora.gerarRelatorio( { inicio, fim } );
        } );
    }

    exibirRelatorio( registros: { data: string; total_pago: number }[] ): void {
        this.divGrafico.style.display = 'block';
        this.divGrafico.innerHTML = '';
        const canvas = document.createElement('canvas');
        this.divGrafico.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            this.exibirMensagem( ['Não foi possível obter contexto para o gráfico.'] );
            return;
        }
        const labels = registros.map( registro => registro.data.split('-').reverse().join('/') );
        const dados = registros.map( registro => registro.total_pago );
        const fonte = "'Open Sans', sans-serif";
        const cores = dados.map( (_, i) => i % 2 === 0 ? '#4e73df' : '#1cc88a' );
        new Chart( ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [ {
                    data: dados,
                    backgroundColor: cores,
                    borderWidth: 0,
                    barPercentage: 0.7,
                } ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false, position: 'top',
                        labels: {
                            color: '#f0f0f0',
                            font: {
                                family: fonte, size: 16
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#fff', titleColor: '#333', bodyColor: '#333', borderColor: '#e0e0e0',
                        borderWidth: 1, padding: 10,
                        titleFont: {
                            family: fonte, size: 16
                        },
                        bodyFont: {
                            family: fonte, size: 16
                        },
                        callbacks: {
                            label: (context) => `R$ ${context.parsed.y.toLocaleString( 'pt-BR', { 
                                minimumFractionDigits: 2 
                            } )}`
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            padding: {top: 10},
                            text: 'DATA EM QUE OCORRERAM AS LOCAÇÕES',
                            color: '#f0f0f0',
                            font: {
                                family: fonte, size: 16
                            }
                        },
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                family: fonte, size: 16
                            },
                            maxRotation: 45
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            padding: {bottom: 10},
                            text: 'VALOR PAGO NAS DEVOLUÇÕES (R$)',
                            color: '#f0f0f0',
                            font: {
                                family: fonte, size: 16
                            }
                        },
                        min: 0, max: 2000,
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                family: fonte, size: 16
                            },
                            callback: ( (value) => `R$ ${value}` )
                        },
                        grid: {
                            color: 'rgba(240, 240, 240, 0.2)',
                        }
                    }
                }
            }
        } );
    }

    limparRelatorio(): void {
        this.divGrafico.style.display = 'none';
    }

}