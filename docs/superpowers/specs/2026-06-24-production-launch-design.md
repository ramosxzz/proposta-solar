# Lancamento publico do Proposta Solar

## Objetivo

Publicar a aplicacao atual como produto oficial no GitHub e no Cloudflare Pages, preservando sua identidade visual e garantindo uso funcional em celulares.

## Interface

- Manter a composicao, tipografia e paleta existentes.
- Em telas menores que 768 px, reduzir a navegacao de etapas, empilhar formularios e botoes e impedir rolagem horizontal da pagina.
- Redimensionar a previa A4 proporcionalmente dentro da largura do celular, sem alterar o PDF gerado.
- Incluir no rodape da aplicacao: `Desenvolvido por Matheus Ramos - 51989849699` com telefone clicavel.
- Adicionar favicon SVG com o simbolo solar usado na marca.

## Empacotamento

- Gerar `dist/` contendo somente os arquivos publicos: HTML, CSS, favicon, JavaScript, base solar e cabecalhos Cloudflare.
- Nao publicar testes, documentos internos, scripts locais, PDFs de exemplo ou inicializadores Windows no Cloudflare.
- Manter o codigo-fonte completo no GitHub.

## Publicacao

- Inicializar o repositorio Git local com branch `main`.
- Criar ou reutilizar o repositorio publico `proposta-solar` na conta GitHub conectada e enviar `main`.
- Criar ou reutilizar o projeto Cloudflare Pages `proposta-solar`.
- Fazer deploy de `dist/` com `--branch main` para garantir ambiente de producao.
- Verificar a URL publica, favicon, rodape, layout mobile e carregamento dos arquivos principais.

## Criterios de aceite

- Testes automatizados passam.
- Build contem apenas os arquivos permitidos.
- A pagina nao apresenta rolagem horizontal em 390 px.
- A previa da proposta cabe na tela e continua legivel por zoom.
- O rodape e o favicon aparecem no site publicado.
- GitHub recebe o commit em `main`.
- Cloudflare registra o deploy como producao.
