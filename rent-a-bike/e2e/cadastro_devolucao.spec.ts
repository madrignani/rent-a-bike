import { test, expect, BrowserContext } from '@playwright/test';
import { loginIniciaSessao } from './login/realizar_login';


test.describe( 'Cadastro de Devolução', () => {

  const urlLocacaoAberta = 'http://localhost:5173/cadastro_devolucao.html?id=8';
  const urlLocacaoDevolvida = 'http://localhost:5173/cadastro_devolucao.html?id=1';

  let context: BrowserContext;

  test.beforeAll( async ({ browser }) => {
    context = await browser.newContext();
    await loginIniciaSessao(context);
  } );

  test.afterAll( async () => {
    await context.close();
  } );

  test( 'Deve exibir dados da Locação corretamente.', async () => {
    const page = await context.newPage();
    await page.goto(urlLocacaoAberta);
    await expect( page.locator('#idLocacao') ).not.toHaveText('...');
    await expect( page.locator('#horaDevolucao') ).not.toHaveText('...');
  } );

  test( 'Deve somar aos subtotais a taxa de limpeza.', async () => {
    const page = await context.newPage();
    await page.goto(urlLocacaoAberta);
    await page.waitForSelector('#tabelaItens tr');
    const btnLimpeza = page.locator('.btn-limpeza').first();
    await btnLimpeza.click();
    await expect( btnLimpeza ).toHaveText('Sim');
    const subtotalAntes = await page.locator('.cel-subtotal').first().textContent();
    await btnLimpeza.click();
    const subtotalDepois = await page.locator('.cel-subtotal').first().textContent();
    expect(subtotalAntes).not.toBe(subtotalDepois);
  } );

  test( 'Deve cancelar avaria e fechar modal.', async () => {
    const page = await context.newPage();
    await page.goto(urlLocacaoAberta);
    await page.waitForSelector('.btn-avaria');
    await page.locator('.btn-avaria').first().click();
    await page.locator('#cancelarAvaria').click();
    await expect( page.locator('#modalAvaria') ).toHaveClass(/hidden/);
  } );

  test( 'Deve rejeitar arquivo não JPG.', async () => {
    const page = await context.newPage();
    await page.goto(urlLocacaoAberta);
    await page.waitForSelector('.btn-avaria');
    await page.locator('.btn-avaria').first().click();
    await page.locator('#avaliador').selectOption({ index: 0 });
    await page.fill('#descricaoAvaria', 'Teste avaria');
    await page.fill('#valorAvaria', '50.00');
    const fileBuffer = Buffer.from('conteudo png', 'utf8');
    await page.setInputFiles('#fotoAvaria', {
      name: 'teste.png',
      mimeType: 'image/png',
      buffer: fileBuffer
    });
    page.on('dialog', async dialog => {
      expect( dialog.message() ).toContain('Arquivo inválido');
      await dialog.accept();
    });
    await page.locator('#formAvaria button[type="submit"]').click();
  } );

  test( 'Deve remover avaria adicionada.', async () => {
    const page = await context.newPage();
    await page.goto(urlLocacaoAberta);
    await page.waitForSelector('.btn-avaria');
    await page.locator('.btn-avaria').first().click();
    await page.locator('#avaliador').selectOption({ index: 0 });
    await page.fill('#descricaoAvaria', 'Avaria para remover');
    await page.fill('#valorAvaria', '25.00');
    const jpegBuffer = Buffer.from('teste de foto', 'base64');
    await page.setInputFiles('#fotoAvaria', {
      name: 'teste_foto.jpg',
      mimeType: 'image/jpeg',
      buffer: jpegBuffer
    });
    await page.locator('#formAvaria button[type="submit"]').click();
    await expect( page.locator('.tr-avaria') ).toBeVisible();
    await page.locator('.btn-remover-avaria').first().click();
    await expect( page.locator('.tr-avaria') ).not.toBeVisible();
  } );

  test( 'Deve atualizar resumo financeiro com desconto.', async () => {
    const page = await context.newPage();
    await page.goto(urlLocacaoAberta);
    await page.waitForSelector('#valorTotal');
    const valorInicial = await page.locator('#valorTotal').textContent();
    const descontoInicial = await page.locator('#valorDesconto').textContent();
    expect(valorInicial).toMatch(/R\$ [\d,]+\.\d{2}/);
    expect(descontoInicial).toMatch(/R\$ [\d,]+\.\d{2}/);
  } );

  test( 'Deve confirmar devolução com sucesso.', async () => {
    const page = await context.newPage();
    await page.goto(urlLocacaoAberta);
    await page.waitForSelector('#botaoConfirmarDevolucao');
    page.on('dialog', async dialog => {
      expect( dialog.message() ).toContain('sucesso');
      await dialog.accept();
    });
    await page.locator('#botaoConfirmarDevolucao').click();
    await page.waitForURL('**/index.html', { timeout: 10000 });
  } );

  test( 'Deve rejeitar locação já finalizada.', async () => {
    const page = await context.newPage();
    page.on('dialog', async dialog => {
      expect( dialog.message() ).toContain('já está finalizada');
      await dialog.accept();
    });
    await page.goto(urlLocacaoDevolvida);
    await page.waitForURL('**/index.html');
  } );

} );