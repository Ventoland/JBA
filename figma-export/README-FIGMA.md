# Pacote Oficial de Importação para o Figma — JBA Consultorias e Soluções Públicas

Este diretório contém todos os artefatos estruturados para importar o Design System e as telas de alta fidelidade da **JBA Consultorias e Soluções Públicas** (*PLANEJAMENTO • GESTÃO • RESULTADOS*) diretamente no **Figma**.

---

## Como Importar no Figma (3 Métodos Imediatos)

### Método 1: Arrastar e Soltar Telas Vetoriais Editáveis (`.svg`) — Mais Rápido (5 segundos)
O Figma converte arquivos `.svg` estruturados diretamente em **Frames, Grupos, Textos Editáveis e Vetores nativos**.
1. Abra o seu arquivo no **Figma Desktop** ou **Figma Web**.
2. Arraste os arquivos abaixo diretamente para o Canvas do Figma:
   - `jba-home-figma.svg` → Cria o Frame completo de **1440px** da **Home Institucional JBA** (Topbar OAB/CRC, Header, Hero com Logo JBA, Os 3 Pilares: Advocacia, Contabilidade e Consultoria, e Chamada para Concursos).
   - `jba-concursos-figma.svg` → Cria o Frame completo de **1440px** da **Central de Concursos Públicos & Ficha de Inscrição Online** (Cards de Editais Abertos, Formulário de Inscrição completo e Card do Comprovante Oficial com Protocolo e Hash SHA-256).
   - `../static/logo-jba.svg` e `../static/favicon.svg` → Vetores oficiais da marca JBA com a coluna greco-romana dourada e o arco dourado.

---

### Método 2: Importar Variáveis e Design Tokens (`figma-tokens.json`)
Arquivo no padrão **W3C Design Tokens / Tokens Studio for Figma**:
1. No Figma, abra o plugin **Tokens Studio for Figma** (ou o importador nativo de **Figma Variables**).
2. Clique em **Import** e selecione `figma-export/figma-tokens.json`.
3. Todas as cores institucionais (`Navy 950`, `Navy 900`, `Gold 500`, `Gold 400`, `Warm Ivory`, `Success`), tipografia (`Cinzel`, `Plus Jakarta Sans`, `JetBrains Mono`), espaçamentos e sombras serão registrados como variáveis.

---

### Método 3: Gerador Automático via Figma Plugin API (`figma-plugin-generator.js`)
Script construído segundo as diretrizes oficiais da API de Plugins do Figma (`figma-use` & `figma-generate-design`):
1. No Figma Desktop, acesse **Plugins → Development → Open Console** (ou utilize o plugin **Scripter**).
2. Copie todo o conteúdo de `figma-export/figma-plugin-generator.js`, cole no console e pressione **Enter**.
3. O script criará automaticamente a coleção de variáveis `JBA Consultorias — Brand Tokens` e gerará os 3 frames em Auto-Layout:
   - `01 - Design System JBA`
   - `02 - Home Institucional JBA`
   - `03 - Aba Concursos Públicos & Inscrição`
