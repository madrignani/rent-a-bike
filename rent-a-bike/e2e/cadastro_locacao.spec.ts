import { test, expect } from '@playwright/test';
import { loginIniciaSessao } from './login/realizar_login';


test.describe( 'Cadastro de Locação', () => {

  const url = 'http://localhost:5173/cadastro_locacao.html';
  const idItemDisponivel = '20';
  const idItemIndisponivel = '19';
  
  test.beforeEach( async ({ page, context }) => {
    await loginIniciaSessao(context);
    await page.goto(url);
  } );

  test( 'Deve carregar página corretamente.', async ({ page }) => {
    await expect( page.locator('h1') ).toHaveText('CADASTRO');
    await expect( page.locator('#buscaCliente') ).toBeVisible();
    await expect( page.locator('#horasDesejadas') ).toBeVisible();
    await expect( page.locator('#buscaItem') ).toBeVisible();
    await expect( page.locator('#botaoRegistrarLocacao') ).toBeVisible();
  } );

  test( 'Deve buscar cliente por CPF válido.', async ({ page }) => {
    await page.fill('#buscaCliente', '12345678901');
    await page.click('#botaoBuscaCliente');
    await page.waitForTimeout(1000);
    const detalhesCliente = page.locator('#detalhesCliente');
    await expect(detalhesCliente).toBeVisible();
    await expect( detalhesCliente.locator('p') ).toHaveCount(6);
  } );

  test( 'Deve exibir erro para cliente não encontrado.', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect( dialog.message() ).toContain('Erro ao buscar o cliente');
      await dialog.accept();
    });
    await page.fill('#buscaCliente', '80');
    await page.click('#botaoBuscaCliente');
    await page.waitForTimeout(500);
  } );

  test( 'Deve adicionar item válido na tabela.', async ({ page }) => {
    await page.fill('#buscaItem', idItemDisponivel);
    await page.click('#botaoBuscarItem');
    await page.waitForTimeout(1000);
    const tabela = page.locator('#itensSelecionados tbody tr');
    await expect(tabela).toHaveCount(1);
    await expect( tabela.locator('td').nth(0) ).toBeVisible();
    await expect( tabela.locator('td').nth(1) ).toContainText('R$');
  } );

  test( 'Deve remover item da tabela.', async ({ page }) => {
    await page.fill('#buscaItem', idItemDisponivel);
    await page.click('#botaoBuscarItem');
    await page.waitForTimeout(500);
    const botaoRetirar = page.locator('.botaoRetirar');
    await botaoRetirar.click();
    const tabela = page.locator('#itensSelecionados tbody tr');
    await expect(tabela).toHaveCount(0);
  } );

  test( 'Deve impedir adicionar item duplicado.', async ({ page }) => {
    page.on( 'dialog', async dialog => {
      expect( dialog.message() ).toContain('já foi adicionado');
      await dialog.accept();
    } );
    await page.fill('#buscaItem', '5');
    await page.click('#botaoBuscarItem');
    await page.waitForTimeout(500);
    await page.fill('#buscaItem', '5');
    await page.click('#botaoBuscarItem');
    await page.waitForTimeout(500);
  } );

  test( 'Deve impedir locação com item indisponível.', async ({ page }) => {
    await page.fill('#buscaCliente', '12345678901');
    await page.click('#botaoBuscaCliente');
    await page.waitForTimeout(1000);
    await page.fill('#buscaItem', idItemIndisponivel);
    await page.click('#botaoBuscarItem');
    await page.waitForTimeout(1000);
    await page.fill('#horasDesejadas', '2');
    await page.waitForTimeout(500);
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('itens indisponíveis');
      await dialog.accept();
    });
    await page.click('#botaoRegistrarLocacao');
    await page.waitForTimeout(500);
  });

  test( 'Deve calcular subtotal automaticamente ao inserir horas.', async ({ page }) => {
    await page.fill('#buscaItem', idItemDisponivel);
    await page.click('#botaoBuscarItem');
    await page.waitForTimeout(500);
    await page.fill('#horasDesejadas', '3');
    await page.waitForTimeout(500);
    const subtotal = page.locator('#itensSelecionados tbody tr td').nth(4);
    await expect(subtotal).toContainText('R$');
    const resumoTotal = page.locator('#totalBruto');
    await expect(resumoTotal).not.toHaveText('0.00');
  } );

  test( 'Deve aplicar desconto para locação com 2 ou mais horas.', async ({ page }) => {
    await page.fill('#buscaItem', idItemDisponivel);
    await page.click('#botaoBuscarItem');
    await page.waitForTimeout(500);
    await page.fill('#horasDesejadas', '2');
    await page.waitForTimeout(500);
    const desconto = page.locator('#desconto');
    await expect(desconto).not.toHaveText('0.00');
  } );

  test( 'Deve validar campos obrigatórios ao registrar.', async ({ page }) => {
    page.on('dialog', async dialog => {
      const message = dialog.message();
      expect(message).toMatch(/cliente|horas|item/i);
      await dialog.accept();
    });
    await page.click('#botaoRegistrarLocacao');
    await page.waitForTimeout(500);
  } );

  test( 'Deve atualizar previsão de entrega.', async ({ page }) => {
    await page.fill('#buscaItem', idItemDisponivel);
    await page.click('#botaoBuscarItem');
    await page.waitForTimeout(500);
    await page.fill('#horasDesejadas', '4');
    await page.waitForTimeout(500);
    const previsao = page.locator('#previsaoEntrega');
    await expect(previsao).not.toHaveText('—');
    const textoPrevisao = await previsao.textContent();
    expect(textoPrevisao).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  } );

  test( 'Deve recalcular valores ao alterar horas.', async ({ page }) => {
    await page.fill('#buscaItem', idItemDisponivel);
    await page.click('#botaoBuscarItem');
    await page.waitForTimeout(500);
    await page.fill('#horasDesejadas', '1');
    await page.waitForTimeout(300);
    const valorInicial = await page.locator('#totalBruto').textContent();
    await page.fill('#horasDesejadas', '3');
    await page.waitForTimeout(300);
    const valorFinal = await page.locator('#totalBruto').textContent();
    expect(valorInicial).not.toBe(valorFinal);
  } );

  test( 'Deve registrar locação com sucesso.', async ({ page }) => {
    await page.fill('#buscaCliente', '1');
    await page.click('#botaoBuscaCliente');
    await page.waitForTimeout(1000);
    await page.fill('#horasDesejadas', '1');
    await page.fill('#buscaItem', idItemDisponivel);
    await page.click('#botaoBuscarItem');
    await page.waitForTimeout(1000);
    page.on( 'dialog', async dialog => {
      expect( dialog.message() ).toContain('sucesso');
      await dialog.accept();
    } );
    await page.click('#botaoRegistrarLocacao');
    await page.waitForTimeout(2000);
  } );

} );