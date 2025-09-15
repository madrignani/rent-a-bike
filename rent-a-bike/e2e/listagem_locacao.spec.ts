import { test, expect, BrowserContext } from '@playwright/test';
import { loginIniciaSessao } from './login/realizar_login';


test.describe( 'Listagem de Locações', () => {

  const url = 'http://localhost:5173/index.html';

  let context: BrowserContext;

  test.beforeAll( async ({ browser }) => {
    context = await browser.newContext();
    await loginIniciaSessao(context);
  } );

  test.afterAll( async () => {
    await context.close();
  } );

  test( 'Deve carregar a página de listagem com elementos principais.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await expect( page.locator('h1') ).toHaveText('LOCAÇÕES');
    await expect( page.locator('#filtroLocacao') ).toBeVisible();
    await expect( page.locator('table thead') ).toBeVisible();
    await expect( page.locator('tbody') ).toBeVisible();
  } );

  test( 'Deve listar locações na tabela.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    const linhas = page.locator('tbody tr');
    const quantidade = await linhas.count();
    expect(quantidade).toBeGreaterThan(0);
    const primeiraLinha = linhas.first();
    await expect( primeiraLinha.locator('td').nth(0) ).toContainText(/^\d+$/);
    await expect( primeiraLinha.locator('td').nth(1) ).toContainText(/\d{2}\/\d{2}\/\d{4}/);
    await expect( primeiraLinha.locator('td').nth(2) ).toContainText(/^\d+$/);
    await expect( primeiraLinha.locator('td').nth(3) ).toContainText(/\d{2}\/\d{2}\/\d{4}/);
    await expect( primeiraLinha.locator('td').nth(4) ).toContainText(/\w+/);
  } );

  test( 'Deve filtrar locações por ID válido.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForSelector('tbody tr');
    const idPrimeiraLocacao = await page.locator('tbody tr:first-child td:first-child').textContent();
    const filtro = page.locator('#filtroLocacao');
    await filtro.fill(idPrimeiraLocacao!);
    await page.waitForTimeout(500);
    const linhasVisveis = page.locator('tbody tr');
    const quantidade = await linhasVisveis.count();
    expect(quantidade).toBeGreaterThanOrEqual(1);
    const primeiroId = await linhasVisveis.first().locator('td:first-child').textContent();
    expect(primeiroId).toBe(idPrimeiraLocacao);
  } );

  test( 'Deve aceitar apenas números no campo de filtro.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    const filtro = page.locator('#filtroLocacao');
    await filtro.fill('abc123def456');
    const valorFiltro = await filtro.inputValue();
    expect(valorFiltro).toBe('123456');
  } );

  test( 'Deve limpar filtro quando campo estiver vazio.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForSelector('tbody tr');
    const quantidadeInicial = await page.locator('tbody tr').count();
    const filtro = page.locator('#filtroLocacao');
    await filtro.fill('999999');
    await page.waitForTimeout(500);
    await filtro.clear();
    await page.waitForTimeout(500);
    const quantidadeFinal = await page.locator('tbody tr').count();
    expect(quantidadeFinal).toBe(quantidadeInicial);
  } );

  test( 'Deve exibir botões de ação corretos baseados no status da locação.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForSelector('tbody tr');
    const linhas = page.locator('tbody tr');
    const quantidade = await linhas.count();
    for (let i = 0; i < Math.min(quantidade, 3); i++) {
      const linha = linhas.nth(i);
      const botaoAcao = linha.locator('td:last-child button');
      await expect( botaoAcao ).toBeVisible();
      const textoBotao = await botaoAcao.textContent();
      expect(['Finalizar', 'Finalizado']).toContain(textoBotao);
      if (textoBotao === 'Finalizado') {
        await expect( botaoAcao ).toBeDisabled();
        await expect( botaoAcao ).toHaveClass(/botao-finalizado/);
      } else {
        await expect( botaoAcao ).toBeEnabled();
        await expect( botaoAcao ).toHaveClass(/botao-finalizar/);
      }
    }
  } );

  test( 'Deve redirecionar para devolução ao clicar em finalizar.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForSelector('tbody tr');
    const botaoFinalizar = page.locator('.botao-finalizar').first();
    if (await botaoFinalizar.count() > 0) {
      const idLocacao = await botaoFinalizar.getAttribute('data-id');
      await botaoFinalizar.click();
      await expect( page ).toHaveURL(new RegExp(`cadastro_devolucao\\.html\\?id=${idLocacao}`));
    }
  } );

} );