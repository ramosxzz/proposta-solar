# Reference Proposal PDF Design

## Goal

Make the generated proposal follow the six-page commercial solar proposal supplied in `Carlos_Alberto_Da_Silveira_orcamento.pdf`, while keeping all calculations automatic from the bill and adding explicit warranty information for modules and inverter.

## Accepted structure

1. Cover page with commercial proposal title, solar-energy wording, customer name, salesperson/integrator name and issue date.
2. Benefits and on-grid operation page with three benefit cards, a black/yellow operation banner, four explanatory steps and an embedded on-grid diagram.
3. "Seu Sistema" page with black/yellow equipment table, module quantity/power, inverter model/quantity, warranty lines, technical metrics and a generation-vs-consumption monthly chart.
4. "Investimento que se Paga" page with large blue/orange heading, year-1 savings, a rising curve graphic and 10-year accumulated savings highlight.
5. "Proposta de Investimento" page with cash investment value, proposal date, immediate row plus 20-year payback table and technical notes.
6. Closing page with sustainable/economic decision message and customer/integrator signature lines.

## Data and inputs

- The integrator still enters module power and inverter model.
- The form also exposes editable warranty defaults:
  - Module warranty: 25 years.
  - Inverter warranty: 5 years.
- Calculated values continue to come from bill extraction, irradiation and current system sizing logic.
- The current 5 percent tariff escalation and 0.5 percent generation degradation remain unless changed later.

## Visual direction

- Use the reference PDF's white pages, black top/bottom bars, navy accent strip, yellow text over black, large uppercase headings and black/yellow equipment table.
- Recreate artwork as embedded CSS/SVG so deployment stays self-contained. Do not depend on external image files from the reference PDF.
- Keep A4 PDF output stable through the existing `html2canvas` and `jsPDF` flow.

## Testing

- Unit/model tests must verify warranties and investment summary values are present in the proposal model.
- UI tests must verify exactly six proposal pages and the key reference sections.
- Browser/PDF verification must confirm no clipped pages and readable output.
