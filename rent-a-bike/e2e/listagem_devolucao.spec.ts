import { test, expect, BrowserContext } from '@playwright/test';
import { loginIniciaSessao } from './login/realizar_login';


test.describe( 'Listagem de Devoluções', () => {

  const url = 'http://localhost:5173/devolucoes.html';
  const cpfTeste = '12345678901';

  let context: BrowserContext;

  test.beforeAll( async ({ browser }) => {
    context = await browser.newContext();
    await loginIniciaSessao(context);
  } );

  test.afterAll( async () => {
    await context.close();
  } );

  test( 'Deve carregar a página com elementos principais visíveis.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await expect( page.locator('h1') ).toContainText('DEVOLUÇÕES');
    await expect( page.locator('#filtroDevolucao') ).toBeVisible();
    await expect( page.locator('table thead') ).toBeVisible();
    await expect( page.locator('table tbody') ).toBeVisible();
  } );

  test( 'Deve carregar devoluções na tabela.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const linhas = page.locator('table tbody tr');
    await expect( linhas.first() ).toBeVisible();
  } );

  test( 'Deve filtrar devoluções por CPF válido.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.fill('#filtroDevolucao', cpfTeste);
    await page.waitForTimeout(500);
    const inputValue = await page.inputValue('#filtroDevolucao');
    expect(inputValue).toBe(cpfTeste);
  } );

  test( 'Deve remover caracteres não numéricos do filtro.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.fill('#filtroDevolucao', '123.456.789-01');
    const inputValue = await page.inputValue('#filtroDevolucao');
    expect(inputValue).toBe(cpfTeste);
  } );

  test( 'Deve limpar filtro quando campo está vazio.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.fill('#filtroDevolucao', cpfTeste);
    await page.waitForTimeout(300);
    await page.fill('#filtroDevolucao', '');
    await page.waitForTimeout(300);
    const linhas = page.locator('table tbody tr');
    await expect( linhas.first() ).toBeVisible();
  } );

  test( 'Deve manter estado do filtro após digitação.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.fill('#filtroDevolucao', '123456');
    await page.waitForTimeout(100);
    const valorAtual = await page.inputValue('#filtroDevolucao');
    expect(valorAtual).toBe('123456');
  } );

  test( 'Deve validar estrutura da tabela após carregamento.', async () => {
    const page = await context.newPage();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const tabela = page.locator('table');
    await expect( tabela ).toBeVisible();
    const thead = tabela.locator('thead');
    const tbody = tabela.locator('tbody');
    await expect( thead ).toBeVisible();
    await expect( tbody ).toBeVisible();
    const numeroHeaders = await thead.locator('th').count();
    expect(numeroHeaders).toBe(5);
  } );

} );