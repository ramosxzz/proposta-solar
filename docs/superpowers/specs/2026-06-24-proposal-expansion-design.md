# Expansão técnica e financeira da proposta solar

## Objetivo

Ampliar a proposta atual de três para cinco páginas, adicionando benefícios do sistema, explicação visual do funcionamento on-grid e projeção financeira de 20 anos. Todo o conteúdo deve ser gerado automaticamente a partir dos dados já extraídos da conta, do módulo informado, do inversor e das configurações do integrador.

## Escopo aprovado

- Não adicionar tabela detalhada de equipamentos.
- Manter a identidade visual atual do Proposta Solar.
- Não copiar logotipo, cores ou ilustrações das referências recebidas.
- Manter a proposta responsiva na prévia mobile e em tamanho A4 no PDF.
- Adotar reajuste anual automático da tarifa de energia de 5%.
- Adotar degradação anual da geração dos módulos de 0,5%.
- Projetar resultados durante 20 anos.

## Estrutura do documento

### Páginas existentes

1. Capa com cliente, potência e geração anual.
2. Diagnóstico, configuração recomendada e geração mensal.
3. Investimento à vista, economia, retorno simples, premissas e assinaturas.

### Nova página 4 — Benefícios e funcionamento on-grid

A página terá três cards:

- Vida útil de referência de 25 anos.
- Retorno calculado para o cliente, sem faixa fixa ou promessa comercial.
- Potencial de valorização do imóvel pela redução do custo recorrente de energia, apresentado como possibilidade e não garantia.

O funcionamento on-grid será explicado em quatro etapas:

1. Os módulos captam a radiação solar e geram energia em corrente contínua.
2. O inversor converte a energia para corrente alternada e alimenta os equipamentos do imóvel.
3. Quando a geração supera o consumo instantâneo, o excedente passa pelo medidor bidirecional e é compensado conforme as regras da distribuidora.
4. Quando a geração não atende ao consumo, a rede fornece automaticamente a energia complementar.

Um diagrama vetorial próprio mostrará módulos, inversor, imóvel, medidor bidirecional e rede da concessionária. O diagrama deve ser legível no PDF e não depender de imagem externa.

### Nova página 5 — Projeção financeira

A página apresentará:

- Investimento total à vista e data da proposta.
- Resumo da economia acumulada em 20 anos.
- Ano estimado em que o saldo acumulado se torna positivo.
- Tabela com período, economia anual, economia acumulada e saldo após o investimento.
- Destaque visual na primeira linha em que o saldo ficar positivo.
- Notas técnicas com todas as premissas e a indicação de que os valores são estimativas, não garantia de resultado.

## Cálculo financeiro

Constantes aprovadas:

- `projectionYears = 20`
- `annualTariffEscalation = 0.05`
- `annualGenerationDegradation = 0.005`

Para o ano `n`, começando em 1:

```text
economiaAnual(n) = economiaAnualBase
                   × (1 + 0,05)^(n - 1)
                   × (1 - 0,005)^(n - 1)

economiaAcumulada(n) = soma das economias anuais do ano 1 até n

saldoAcumulado(n) = economiaAcumulada(n) - investimento
```

O ano de retorno projetado será o primeiro ano cujo saldo acumulado seja maior ou igual a zero. O retorno simples já existente continuará disponível nas áreas atuais para comparação, calculado sem reajuste ou degradação.

## Fonte da premissa de reajuste

A base oficial de tarifas homologadas da ANEEL registra TUSD e TE resultantes dos reajustes das distribuidoras. A análise da mediana anual da tarifa residencial convencional B1 entre 2015 e 2025 resultou em crescimento composto aproximado de 5,36% ao ano. A proposta usará 5% para manter a projeção ligeiramente conservadora.

Fonte: `https://dadosabertos.aneel.gov.br/dataset/tarifas-distribuidoras-energia-eletrica`

## Arquitetura

- Criar um módulo financeiro isolado para gerar as 20 linhas da projeção e identificar o retorno.
- Acrescentar os resultados ao modelo de proposta, sem misturar cálculos com manipulação do DOM.
- Renderizar tabela, destaque e valores acumulados no `app.js`.
- Manter páginas e diagrama no HTML/CSS para que `html2pdf` gere o arquivo sem recursos remotos adicionais.
- Atualizar a numeração dos rodapés para cinco páginas.

## Tratamento de limites

- Rejeitar investimento, economia ou parâmetros financeiros não numéricos e negativos.
- Se o saldo não ficar positivo em 20 anos, exibir “acima de 20 anos” em vez de inventar um retorno.
- Manter valores monetários com duas casas no resumo e formato compacto e legível na tabela.
- Não afirmar valorização financeira garantida do imóvel.

## Testes e validação

- Testar a fórmula do primeiro ano, composição anual, acumulado e saldo.
- Testar a identificação do primeiro ano positivo.
- Testar o cenário sem retorno dentro de 20 anos.
- Testar a presença das cinco páginas e das premissas no HTML.
- Executar toda a suíte automatizada e gerar o build de produção.
- Validar a prévia em desktop e mobile sem rolagem horizontal.
- Gerar o PDF, renderizar as cinco páginas e inspecionar visualmente legibilidade, cortes, rodapés e tabela.
- Após aprovação técnica, enviar a atualização para a branch `main` do GitHub e para o ambiente de produção do Cloudflare Pages.

## Critérios de aceite

- A proposta possui cinco páginas A4.
- A página 4 explica benefícios e fluxo on-grid com diagrama próprio.
- A página 5 apresenta 20 anos completos e destaca o retorno projetado.
- Os cálculos usam 5% de reajuste e 0,5% de degradação, descritos nas notas.
- Nenhuma promessa de retorno ou valorização é apresentada como garantia.
- Prévia mobile, PDF, testes, build e deploy de produção permanecem funcionais.
