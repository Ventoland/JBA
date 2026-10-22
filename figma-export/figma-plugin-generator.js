/**
 * ============================================================================
 * JBA CONSULTORIAS E SOLUÇÕES PÚBLICAS — FIGMA PLUGIN / MCP GENERATOR SCRIPT
 * PLANEJAMENTO • GESTÃO • RESULTADOS
 * ============================================================================
 * Compliant with `figma-use` and `figma-generate-design` skill rules:
 *  - Color channels use 0..1 range (never 0..255)
 *  - Fonts are loaded via `await figma.loadFontAsync(...)` before setting text
 *  - Variable collections created with explicit scopes
 *  - `layoutSizingHorizontal = 'FILL'` is ALWAYS set AFTER `parent.appendChild(child)`
 *  - Text truncation/auto-resize uses `textAutoResize = 'HEIGHT'` AFTER `appendChild`
 *  - Returns `createdNodeIds` array for verification
 *
 * HOW TO RUN IN FIGMA:
 *  1. Open any Figma file -> Plugins -> Development -> Open Console (or Scripter plugin)
 *  2. Paste this entire script and press Enter (or run via Figma MCP `use_figma`).
 * ============================================================================
 */

(async () => {
  const createdNodeIds = [];

  // 1. Load Fonts First (Mandatory in Figma Plugin API)
  const SERIF_FONT = { family: 'Cinzel', style: 'Bold' };
  const SANS_REGULAR = { family: 'Inter', style: 'Regular' };
  const SANS_MEDIUM = { family: 'Inter', style: 'Medium' };
  const SANS_BOLD = { family: 'Inter', style: 'Bold' };

  let headingFont = SERIF_FONT;
  await figma.loadFontAsync(SANS_REGULAR);
  await figma.loadFontAsync(SANS_MEDIUM);
  await figma.loadFontAsync(SANS_BOLD);
  try {
    await figma.loadFontAsync(SERIF_FONT);
  } catch {
    headingFont = SANS_BOLD;
  }

  // 2. Normalized RGB Helper (0..1 scale)
  function hexToRgb01(hex) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: ((num >> 16) & 255) / 255,
      g: ((num >> 8) & 255) / 255,
      b: (num & 255) / 255
    };
  }

  const COLORS = {
    navy950: hexToRgb01('#071226'),
    navy900: hexToRgb01('#0B1B3D'),
    navy800: hexToRgb01('#132A56'),
    navy700: hexToRgb01('#1E3F7A'),
    gold500: hexToRgb01('#C59B4B'),
    gold400: hexToRgb01('#D4AF37'),
    gold100: hexToRgb01('#F7F1E1'),
    ivory: hexToRgb01('#FAF8F5'),
    white: hexToRgb01('#FFFFFF'),
    slate700: hexToRgb01('#334155'),
    slate200: hexToRgb01('#E2E8F0'),
    success: hexToRgb01('#15803D')
  };

  // 3. Create Variable Collection for JBA Design Tokens
  const collection = figma.variables.createVariableCollection('JBA Consultorias — Brand Tokens');
  const modeId = collection.modes[0].modeId;
  collection.renameMode(modeId, 'Institutional');

  const colorTokenDefs = [
    ['color/jba/navy-950', COLORS.navy950],
    ['color/jba/navy-900', COLORS.navy900],
    ['color/jba/navy-800', COLORS.navy800],
    ['color/jba/gold-500', COLORS.gold500],
    ['color/jba/gold-400', COLORS.gold400],
    ['color/jba/gold-100', COLORS.gold100],
    ['color/jba/ivory', COLORS.ivory],
    ['color/jba/white', COLORS.white],
    ['color/jba/success', COLORS.success]
  ];

  for (const [name, rgb] of colorTokenDefs) {
    const v = figma.variables.createVariable(name, collection, 'COLOR');
    v.scopes = ['ALL_FILLS', 'STROKE_COLOR'];
    v.setValueForMode(modeId, rgb);
  }

  // Helper: Create Auto-Layout Frame
  function createAutoFrame(name, direction, spacing, padX, padY, bgRgb, radius = 0) {
    const f = figma.createFrame();
    f.name = name;
    f.layoutMode = direction;
    f.itemSpacing = spacing;
    f.paddingLeft = padX;
    f.paddingRight = padX;
    f.paddingTop = padY;
    f.paddingBottom = padY;
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
    f.cornerRadius = radius;
    if (bgRgb) {
      f.fills = [{ type: 'SOLID', color: bgRgb }];
    } else {
      f.fills = [];
    }
    createdNodeIds.push(f.id);
    return f;
  }

  // Helper: Create Styled Text Node
  function createText(characters, size, font, colorRgb) {
    const t = figma.createText();
    t.fontName = font;
    t.characters = characters;
    t.fontSize = size;
    t.fills = [{ type: 'SOLID', color: colorRgb }];
    createdNodeIds.push(t.id);
    return t;
  }

  // ==========================================================================
  // FRAME 01: 01 - Design System JBA
  // ==========================================================================
  const dsFrame = createAutoFrame('01 - Design System JBA', 'VERTICAL', 32, 64, 64, COLORS.ivory, 16);
  dsFrame.x = 0;
  dsFrame.y = 0;
  dsFrame.resize(1440, 100);
  dsFrame.counterAxisSizingMode = 'FIXED';

  const dsHeader = createAutoFrame('DS Header', 'VERTICAL', 8, 32, 32, COLORS.navy900, 12);
  dsFrame.appendChild(dsHeader);
  dsHeader.layoutSizingHorizontal = 'FILL';

  const dsTitle = createText('JBA CONSULTORIAS E SOLUÇÕES PÚBLICAS — DESIGN SYSTEM', 28, headingFont, COLORS.white);
  dsHeader.appendChild(dsTitle);
  const dsSub = createText('PLANEJAMENTO • GESTÃO • RESULTADOS | Advocacia Pública • Contabilidade (LRF) • Concursos Públicos', 15, SANS_MEDIUM, COLORS.gold400);
  dsHeader.appendChild(dsSub);

  const swatchRow = createAutoFrame('Color Swatches', 'HORIZONTAL', 20, 0, 0, null);
  dsFrame.appendChild(swatchRow);
  swatchRow.layoutSizingHorizontal = 'FILL';

  const swatchList = [
    ['Navy 900 (#0B1B3D)', COLORS.navy900, COLORS.white],
    ['Navy 950 (#071226)', COLORS.navy950, COLORS.white],
    ['Gold 500 (#C59B4B)', COLORS.gold500, COLORS.navy950],
    ['Gold 400 (#D4AF37)', COLORS.gold400, COLORS.navy950],
    ['Ivory (#FAF8F5)', COLORS.ivory, COLORS.navy900],
    ['Success (#15803D)', COLORS.success, COLORS.white]
  ];

  for (const [label, bg, fg] of swatchList) {
    const card = createAutoFrame(label, 'VERTICAL', 8, 20, 28, bg, 10);
    card.strokes = [{ type: 'SOLID', color: COLORS.gold500 }];
    card.strokeWeight = 1;
    swatchRow.appendChild(card);
    card.layoutSizingHorizontal = 'FILL';
    const txt = createText(label, 14, SANS_BOLD, fg);
    card.appendChild(txt);
  }

  // ==========================================================================
  // FRAME 02: 02 - Home Institucional JBA
  // ==========================================================================
  const homeFrame = createAutoFrame('02 - Home Institucional JBA', 'VERTICAL', 48, 0, 0, COLORS.ivory, 0);
  homeFrame.x = 1540;
  homeFrame.y = 0;
  homeFrame.resize(1440, 100);
  homeFrame.counterAxisSizingMode = 'FIXED';

  // Top Header
  const navBar = createAutoFrame('Institutional Header', 'HORIZONTAL', 32, 80, 24, COLORS.navy900, 0);
  navBar.primaryAxisAlignItems = 'SPACE_BETWEEN';
  navBar.counterAxisAlignItems = 'CENTER';
  homeFrame.appendChild(navBar);
  navBar.layoutSizingHorizontal = 'FILL';

  const brandTitle = createText('JBA CONSULTORIAS E SOLUÇÕES PÚBLICAS', 20, headingFont, COLORS.white);
  navBar.appendChild(brandTitle);

  const navCta = createAutoFrame('CTA Inscrever', 'HORIZONTAL', 8, 20, 12, COLORS.gold500, 8);
  navBar.appendChild(navCta);
  const navCtaText = createText('INSCREVER EM CONCURSO PÚBLICO', 13, SANS_BOLD, COLORS.navy950);
  navCta.appendChild(navCtaText);

  // Hero Section
  const hero = createAutoFrame('Hero Section', 'VERTICAL', 20, 80, 72, COLORS.navy950, 0);
  homeFrame.appendChild(hero);
  hero.layoutSizingHorizontal = 'FILL';

  const heroEyebrow = createText('PLANEJAMENTO • GESTÃO • RESULTADOS', 13, SANS_BOLD, COLORS.gold400);
  hero.appendChild(heroEyebrow);

  const heroTitle = createText('Excelência Jurídica, Contábil e Consultoria Oficial para a Administração Pública', 40, headingFont, COLORS.white);
  hero.appendChild(heroTitle);
  heroTitle.layoutSizingHorizontal = 'FILL';
  heroTitle.textAutoResize = 'HEIGHT';

  const heroDesc = createText('Atuação integrada de Advogados Públicos, Contadores Governamentais (LRF/CASP) e Banca Organizadora de Concursos Públicos e Processos Seletivos.', 18, SANS_REGULAR, COLORS.gold100);
  hero.appendChild(heroDesc);
  heroDesc.layoutSizingHorizontal = 'FILL';
  heroDesc.textAutoResize = 'HEIGHT';

  // 3 Pillars Section
  const pillarsWrap = createAutoFrame('Três Pilares Institucionais', 'HORIZONTAL', 24, 80, 24, null, 0);
  homeFrame.appendChild(pillarsWrap);
  pillarsWrap.layoutSizingHorizontal = 'FILL';

  const pillarsData = [
    ['01 • ADVOCACIA PÚBLICA (OAB)', 'Direito Administrativo, Defesa em Tribunais de Contas, Pareceres Jurídicos e Nova Lei de Licitações 14.133/21.'],
    ['02 • CONTABILIDADE GOVERNAMENTAL (CRC)', 'Cumprimento da LRF, PCASP, SICONFI, Prestação de Contas Anual e Planejamento Orçamentário (PPA, LDO, LOA).'],
    ['03 • CONSULTORIA & CONCURSOS PÚBLICOS', 'Banca Organizadora Completa de Concursos Públicos, Processos Seletivos, Editais e Portal do Candidato.']
  ];

  for (const [pTitle, pBody] of pillarsData) {
    const pCard = createAutoFrame(pTitle, 'VERTICAL', 12, 28, 32, COLORS.white, 12);
    pCard.strokes = [{ type: 'SOLID', color: COLORS.gold500 }];
    pCard.strokeWeight = 2;
    pillarsWrap.appendChild(pCard);
    pCard.layoutSizingHorizontal = 'FILL';

    const t1 = createText(pTitle, 16, headingFont, COLORS.navy900);
    pCard.appendChild(t1);
    t1.layoutSizingHorizontal = 'FILL';
    t1.textAutoResize = 'HEIGHT';

    const t2 = createText(pBody, 14, SANS_REGULAR, COLORS.slate700);
    pCard.appendChild(t2);
    t2.layoutSizingHorizontal = 'FILL';
    t2.textAutoResize = 'HEIGHT';
  }

  // ==========================================================================
  // FRAME 03: 03 - Aba Concursos Públicos & Inscrição
  // ==========================================================================
  const concFrame = createAutoFrame('03 - Aba Concursos Públicos & Inscrição', 'VERTICAL', 36, 0, 0, COLORS.ivory, 0);
  concFrame.x = 3080;
  concFrame.y = 0;
  concFrame.resize(1440, 100);
  concFrame.counterAxisSizingMode = 'FIXED';

  const concHeader = createAutoFrame('Concursos Banner', 'VERTICAL', 12, 80, 48, COLORS.navy900, 0);
  concFrame.appendChild(concHeader);
  concHeader.layoutSizingHorizontal = 'FILL';

  const concBadge = createText('PORTAL OFICIAL DE CERTAMES • INSCRIÇÕES ABERTAS', 13, SANS_BOLD, COLORS.gold400);
  concHeader.appendChild(concBadge);
  const concMainTitle = createText('Central de Concursos Públicos e Ficha de Inscrição Online', 34, headingFont, COLORS.white);
  concHeader.appendChild(concMainTitle);

  const formCard = createAutoFrame('Ficha de Inscrição do Candidato', 'VERTICAL', 16, 48, 40, COLORS.white, 16);
  formCard.strokes = [{ type: 'SOLID', color: COLORS.gold500 }];
  formCard.strokeWeight = 2;
  concFrame.appendChild(formCard);
  formCard.layoutSizingHorizontal = 'FILL';

  const formHeading = createText('FORMULÁRIO OFICIAL DE INSCRIÇÃO EM CONCURSO PÚBLICO', 20, headingFont, COLORS.navy900);
  formCard.appendChild(formHeading);

  const fields = [
    'Concurso / Edital Selecionado: Edital nº 001/2025 — Prefeitura Municipal (Procurador, Contador, Analista)',
    'Cargo Pretendido: Contador Público Municipal — Nível Superior (CRC Ativo)',
    'Nome Completo do Candidato(a) | CPF (Validação Módulo 11) | Data de Nascimento',
    'E-mail Oficial para Comprovante | Telefone / WhatsApp | Solicitação de Isenção (CadÚnico / Doador)',
    'Atendimento Especial (PcD / Lactante / Sabatista) | Aceite do Edital e Conformidade LGPD'
  ];

  for (const fText of fields) {
    const inputBox = createAutoFrame('Input Field', 'HORIZONTAL', 10, 20, 16, COLORS.ivory, 8);
    inputBox.strokes = [{ type: 'SOLID', color: COLORS.slate200 }];
    inputBox.strokeWeight = 1;
    formCard.appendChild(inputBox);
    inputBox.layoutSizingHorizontal = 'FILL';
    const labelNode = createText(fText, 14, SANS_MEDIUM, COLORS.navy900);
    inputBox.appendChild(labelNode);
  }

  const submitBtn = createAutoFrame('Submit Button', 'HORIZONTAL', 10, 32, 18, COLORS.gold500, 10);
  formCard.appendChild(submitBtn);
  const submitTxt = createText('CONFIRMAR INSCRIÇÃO E EMITIR COMPROVANTE OFICIAL (PROTOCOLO + HASH SHA-256)', 14, SANS_BOLD, COLORS.navy950);
  submitBtn.appendChild(submitTxt);

  figma.viewport.scrollAndZoomIntoView([dsFrame, homeFrame, concFrame]);
  return { status: 'OK', createdCount: createdNodeIds.length, createdNodeIds };
})();
