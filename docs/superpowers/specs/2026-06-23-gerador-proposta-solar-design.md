# Gerador automatico de proposta solar

## Objetivo

Criar uma aplicacao web para um unico integrador gerar uma proposta solar profissional a partir de uma conta de energia em PDF ou imagem. O integrador informa somente a potencia do modulo e a marca/modelo do inversor, confere os dados e baixa o PDF.

## Fluxo

1. O integrador configura uma vez os dados da empresa, logotipo e preco por Wp.
2. Envia uma conta de energia.
3. O sistema extrai cliente, endereco, distribuidora, classe, tipo de fornecimento, valor, consumo atual, historico mensal, tarifas e CIP.
4. Se o PDF nao tiver texto, o sistema usa OCR local no navegador.
5. O sistema mostra os dados extraidos, a confianca e campos editaveis para conferencia.
6. O integrador informa potencia do modulo e marca/modelo do inversor.
7. O sistema calcula consumo medio, custo de disponibilidade, consumo compensavel, potencia fotovoltaica, quantidade de modulos, geracao, economia, investimento e retorno simples.
8. O integrador gera a proposta em PDF.

## Regras de calculo

- Consumo medio: media de ate 12 meses validos da conta.
- Disponibilidade do grupo B: 30 kWh monofasico, 50 kWh bifasico e 100 kWh trifasico.
- Energia alvo: consumo medio menos disponibilidade, nunca menor que zero.
- Irradiacao: media anual da base municipal do LABREN/INPE; na ausencia, usar 4,5 h/dia e exibir alerta.
- Performance ratio inicial: 0,80, configuravel.
- Potencia necessaria em kWp: energia alvo / (irradiacao diaria x 30 x performance ratio).
- Quantidade de modulos: arredondamento para cima de potencia necessaria / potencia do modulo.
- Potencia instalada: quantidade x potencia do modulo / 1000.
- Geracao mensal: potencia instalada x irradiacao diaria x 30 x performance ratio.
- Investimento: potencia instalada em Wp x preco por Wp.
- Economia: energia compensada x tarifa efetiva de energia. CIP, multas, juros, doacoes e debitos anteriores nao entram na economia.
- Payback simples: investimento / economia anual.

## Arquitetura

Aplicacao estatica modular em HTML, CSS e JavaScript. PDF.js extrai texto e renderiza paginas; Tesseract.js e o fallback OCR. Parsers deterministas convertem a conta em dados estruturados. Um motor de calculo puro gera o dimensionamento. Configuracoes ficam no armazenamento local do navegador. A conta e processada localmente e nao e persistida.

## Interface

- Etapa 1: upload por arrastar/selecionar, status de leitura e erros claros.
- Etapa 2: conferencia dos dados extraidos e historico de consumo.
- Etapa 3: potencia do modulo e inversor, seguida do resultado calculado.
- Etapa 4: previa profissional e download do PDF.
- Configuracoes: empresa, responsavel, telefone, email, logotipo, preco por Wp e performance ratio.

## Validacao e erros

- Campos essenciais sem leitura ficam destacados e impedem o calculo.
- Historico incompleto usa os meses validos e informa quantos foram considerados.
- Valores fora de faixas plausiveis exigem confirmacao.
- A proposta identifica estimativas e nao promete economia garantida.
- O PDF nunca inclui CPF completo, codigo de barras, QR Code ou debitos da conta.

## Escopo da primeira versao

Leitura validada para o modelo RGE/CPFL fornecido, com parser generico e OCR para outros layouts. Sem financiamento, CRM, catalogo de equipamentos, assinatura eletronica ou historico de propostas.
