# Rent A Bike

Sistema web para aluguel de bicicletas e equipamentos, desenvolvido como parte da disciplina Projeto Integrador do curso Sistemas de Informação do CEFET/RJ.

## Autores

* Giovanni de Oliveira Madrignani
* Renan Wenderroscky Hottz

## Dependências

Para executar o projeto, certifique-se de ter instalado em sua máquina:

### Ambiente de Desenvolvimento

* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [PNPM](https://pnpm.io/) (versão 10.11.0)
* [PHP](https://www.php.net/) (versão 8.0 ou superior)
* [Composer](https://getcomposer.org/)
* [MariaDB](https://mariadb.org/) ou MySQL 5.7+

### Front-end (devDependencies listadas no `package.json`)

No diretório `rent-a-bike`, o projeto utiliza as seguintes dependências:

* `vite` ^6.3.5
* `typescript` ~5.8.3
* `vitest` ^3.1.3
* `@playwright/test` ^1.53.1
* `@types/node` ^24.0.7
* `chart.js` ^4.5.0  
* `dotenv` ^17.0.0

### Back-end (require e require-dev do `composer.json`)

No diretório `api`, a API PHP utiliza as seguintes dependências:

* `phputil/router` dev-main  
* `phputil/cors` ^0.5
* `kahlan/kahlan` ^5.2  
* `phpstan/phpstan` ^2.1

## Como Executar o Projeto

### 1. Clonar o repositório

```bash
git clone https://gitlab.com/cefet-nf/pis-2025-1/g7.git
cd g7
```

### 2. Configurar o Banco de Dados (MariaDB via phpMyAdmin)

1. Certifique-se de que o MariaDB e o phpMyAdmin estejam instalados e em execução (por exemplo, via XAMPP, WAMP, Laragon, etc).
2. Acesse o phpMyAdmin em http://localhost/phpmyadmin
3. Crie um novo banco de dados chamado rent_a_bike no menu à esquerda.
4. Importe os arquivos de estrutura e dados:
    - Clique no banco rent_a_bike no menu à esquerda.
    - Vá até a aba Importar.
    - Clique em "Escolher arquivo" e selecione o arquivo estrutura.sql localizado na pasta /db na raiz do projeto.
    - Clique em "Executar".
    - Repita o processo para o arquivo dados.sql.
5. Para verificar se você está utilizando o MariaDB, execute o seguinte comando no terminal SQL: 
    - SELECT VERSION();

### 3. Instalar Dependências do Back-end

No diretório `api`:

```bash
cd api
composer install
```

### 4. Iniciar a API (Back-end)

```bash
php -S localhost:8000 
```

### 5. Instalar Dependências do Front-end

Em outra janela de terminal, no diretório `rent-a-bike`:

```bash
cd rent-a-bike
pnpm install
```

### 6. Iniciar o Front-end

```bash
pnpm dev
```

### 7. Acessar o Sistema

* Front-end: [http://localhost:5173](http://localhost:5173)
* API (back-end): [http://localhost:8000](http://localhost:8000)

## Referências e Recursos Utilizados

* [Composer](https://getcomposer.org/) – Gerenciador de dependências para PHP.
* [Node.js](https://nodejs.org/) – Ambiente de execução JavaScript no back-end.
* [Vite](https://vitejs.dev/) – Ferramenta moderna para bundling e desenvolvimento front-end.
* [Vitest](https://vitest.dev/) – Framework de testes unitários para projetos front-end em TypeScript.
* [Playwright](https://playwright.dev/) – Ferramenta para testes end-to-end automatizados.
* [Chart.js](https://www.chartjs.org/) – Utilizado para visualização de gráficos no painel de relatórios.
* [dotenv](https://github.com/motdotla/dotenv) – Gerenciamento de variáveis de ambiente no front-end.
* [@types/node](https://www.npmjs.com/package/@types/node) – Tipos TypeScript para recursos globais do Node.js.
* [Kahlan](https://kahlan.github.io/) – Framework de testes orientado a BDD para PHP.
* [PHPStan](https://phpstan.org/) – Ferramenta de análise estática para código PHP.
* [phputil/router](https://github.com/thiagodp/router) – Biblioteca de roteamento simples para APIs PHP.
* [phputil/cors](https://github.com/phputil/cors) – Middleware de suporte a CORS em aplicações PHP.
* [draw.io (diagrams.net)](https://app.diagrams.net/) – Ferramenta utilizada para criação dos diagramas UML.
* [Gemini](https://deepmind.google/technologies/gemini/) – Inteligência Artificial utilizada na geração de estilos CSS. 

As imagens dos clientes utilizados no banco de dados foram obtidas das seguintes fontes públicas:
- https://wiki.inf.ufpr.br/computacao/lib/exe/fetch.php?media=e:dijkstra3.jpg
- https://antlia.com.br/wp-content/uploads/2023/08/Linus.jpg
- https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/AB6D/production/_130858834_capture.jpg
- https://castle.eiu.edu/wow/hopteach.jpg
- https://upload.wikimedia.org/wikipedia/commons/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg
- https://blogdaengenharia.com/wp-content/uploads/2021/05/Margaret_Hamilton_1989.jpg
- https://ieeecs-media.computer.org/wp-media/2018/03/11020301/donald-knuth-e1523412218270.jpg
- https://upload.wikimedia.org/wikipedia/commons/d/d6/JohnvonNeumann-LosAlamos.jpg
- https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Guido_van_Rossum_OSCON_2006.jpg/960px-Guido_van_Rossum_OSCON_2006.jpg
- https://upload.wikimedia.org/wikipedia/commons/b/ba/Ada_Lovelace_in_1852.jpg
As imagens utilizadas têm fins exclusivamente educacionais, sem qualquer intuito comercial.