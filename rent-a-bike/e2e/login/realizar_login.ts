import { BrowserContext } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config( { path: path.resolve(__dirname, '../../../api/.env') } );


const LOGIN_URL = 'http://localhost:5173/login.html';


export async function loginIniciaSessao(contexto: BrowserContext) {
  const pagina = await contexto.newPage();
  await pagina.goto(LOGIN_URL);
  const cpf = process.env.USUARIO_TESTE_CPF;
  const senha = process.env.USUARIO_TESTE_SENHA;
  if (!cpf || !senha) {
    throw new Error( 'CPF ou senha não fornecidos nas variáveis de ambiente.' );
  }
  await pagina.fill('#cpfFuncionario', cpf);
  await pagina.fill('#senha', senha);
  await pagina.click('#botaoLogin');
  await pagina.waitForURL('**/index.html');
  await contexto.storageState({ path: 'e2e/.auth/session.json' });
  await pagina.close();
}