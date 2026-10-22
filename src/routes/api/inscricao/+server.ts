import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = false;
import {
	checkRateLimit,
	detectAttackPayload,
	formatCPF,
	generateIntegrityHash,
	maskCPF,
	sanitizeInput,
	validateCPF
} from '$lib/security/validator';

/**
 * Catálogo Autoritativo Server-Side de Editais e Taxas Oficiais da Banca JBA.
 * Impede ataques de Parameter Tampering / Price Manipulation onde um atacante
 * tenta alterar o valor da taxa de inscrição no payload JSON enviado pelo cliente.
 */
interface CargoServerSpec {
	id: string;
	titulo: string;
	nivel: 'Superior' | 'Médio' | 'Técnico';
	taxaInscricao: number;
}

interface EditalServerSpec {
	id: string;
	codigo: string;
	orgao: string;
	inscricoesAbertas: boolean;
	cargos: Record<string, CargoServerSpec>;
}

const CATALOGO_EDITAIS_SERVIDOR: Record<string, EditalServerSpec> = {
	'edital-001-2026': {
		id: 'edital-001-2026',
		codigo: 'EDITAL Nº 001/2026 — PREFEITURA MUNICIPAL DE FLORIANÓPOLIS/SC',
		orgao: 'Prefeitura Municipal de Florianópolis — Secretaria da Fazenda e Administração',
		inscricoesAbertas: true,
		cargos: {
			'auditor-fiscal': {
				id: 'auditor-fiscal',
				titulo: 'Auditor Fiscal de Tributos Municipais',
				nivel: 'Superior',
				taxaInscricao: 145.0
			},
			'analista-juridico': {
				id: 'analista-juridico',
				titulo: 'Analista Jurídico e Procuradoria Administrativa',
				nivel: 'Superior',
				taxaInscricao: 130.0
			},
			'contador-publico': {
				id: 'contador-publico',
				titulo: 'Contador Público — Contabilidade Aplicada ao Setor Público (CASP)',
				nivel: 'Superior',
				taxaInscricao: 130.0
			},
			'tecnico-administrativo': {
				id: 'tecnico-administrativo',
				titulo: 'Técnico em Gestão Pública e Licitações',
				nivel: 'Médio',
				taxaInscricao: 85.0
			}
		}
	},
	'edital-002-2026': {
		id: 'edital-002-2026',
		codigo: 'EDITAL Nº 002/2026 — CÂMARA MUNICIPAL DE SÃO JOSÉ/SC',
		orgao: 'Câmara Municipal de São José — Poder Legislativo',
		inscricoesAbertas: true,
		cargos: {
			'controlador-interno': {
				id: 'controlador-interno',
				titulo: 'Controlador Interno Legislativo',
				nivel: 'Superior',
				taxaInscricao: 140.0
			},
			'procurador-legislativo': {
				id: 'procurador-legislativo',
				titulo: 'Procurador Jurídico Legislativo',
				nivel: 'Superior',
				taxaInscricao: 150.0
			},
			'analista-contabil': {
				id: 'analista-contabil',
				titulo: 'Analista Contábil e Financeiro',
				nivel: 'Superior',
				taxaInscricao: 125.0
			},
			'assistente-legislativo': {
				id: 'assistente-legislativo',
				titulo: 'Assistente Técnico Legislativo',
				nivel: 'Médio',
				taxaInscricao: 80.0
			}
		}
	},
	'edital-003-2026': {
		id: 'edital-003-2026',
		codigo: 'EDITAL Nº 003/2026 — AUTARQUIA DE SANEAMENTO E MEIO AMBIENTE (SAMAE)',
		orgao: 'Autarquia Municipal de Saneamento e Gestão Ambiental',
		inscricoesAbertas: true,
		cargos: {
			'engenheiro-sanitarista': {
				id: 'engenheiro-sanitarista',
				titulo: 'Engenheiro Sanitarista e Ambiental',
				nivel: 'Superior',
				taxaInscricao: 135.0
			},
			'analista-licitacoes': {
				id: 'analista-licitacoes',
				titulo: 'Especialista em Contratações Públicas (Lei 14.133/2021)',
				nivel: 'Superior',
				taxaInscricao: 120.0
			},
			'agente-operacional': {
				id: 'agente-operacional',
				titulo: 'Técnico em Saneamento e Fiscalização',
				nivel: 'Técnico',
				taxaInscricao: 75.0
			}
		}
	}
};

export interface InscricaoRecord {
	protocolo: string;
	editalId: string;
	editalCodigo: string;
	orgao: string;
	cargoId: string;
	cargoTitulo: string;
	nivel: string;
	nome: string;
	cpfHashKey: string;
	cpfMascarado: string;
	emailMascarado: string;
	telefoneMascarado: string;
	cidadeUf: string;
	dataNascimento: string;
	necessidadeEspecial: string;
	isencaoSolicitada: boolean;
	modalidadeConcorrencia: string;
	taxaInscricao: number;
	taxaFormatada: string;
	statusPagamento: string;
	pixCopiaECola: string;
	dataHoraInscricao: string;
	integrityHash: string;
}

const inscricoesStore = new Map<string, InscricaoRecord>();

function maskEmail(email: string): string {
	const parts = email.split('@');
	if (parts.length !== 2) return '***@***';
	const [user, domain] = parts;
	const visible = user.slice(0, 2);
	return `${visible}***@${domain}`;
}

function maskPhone(phone: string): string {
	const digits = phone.replace(/\D/g, '');
	if (digits.length < 8) return '(**) *****-****';
	const ddd = digits.slice(0, 2);
	const last4 = digits.slice(-4);
	return `(${ddd}) *****-${last4}`;
}

function buildPixPayload(protocolo: string, valor: number): string {
	const valorStr = valor.toFixed(2);
	const cleanProto = protocolo.replace(/[^A-Z0-9]/g, '');
	return `00020126580014BR.GOV.BCB.PIX0136jba-concursos-gov@jbaconsultorias.com.br520400005303986540${valorStr.length}${valorStr}5802BR5925JBA CONSULTORIAS PUBLICAS6013FLORIANOPOLIS62200516${cleanProto}6304A1B9`;
}

// Pre-seed de inscrição de demonstração para consulta imediata via GET /api/inscricao
const DEMO_PROTOCOLO = 'JBA-2026-000191';
const DEMO_RECORD: InscricaoRecord = {
	protocolo: DEMO_PROTOCOLO,
	editalId: 'edital-001-2026',
	editalCodigo: 'EDITAL Nº 001/2026 — PREFEITURA MUNICIPAL DE FLORIANÓPOLIS/SC',
	orgao: 'Prefeitura Municipal de Florianópolis — Secretaria da Fazenda e Administração',
	cargoId: 'auditor-fiscal',
	cargoTitulo: 'Auditor Fiscal de Tributos Municipais',
	nivel: 'Superior',
	nome: 'CANDIDATO DEMONSTRAÇÃO HOMOLOGAÇÃO JBA',
	cpfHashKey: '00000000191',
	cpfMascarado: '***.000.001-**',
	emailMascarado: 'ca***@candidato.gov.br',
	telefoneMascarado: '(48) *****-0191',
	cidadeUf: 'Florianópolis / SC',
	dataNascimento: '1992-05-14',
	necessidadeEspecial: 'Nenhuma',
	isencaoSolicitada: false,
	modalidadeConcorrencia: 'Ampla Concorrência (AC)',
	taxaInscricao: 145.0,
	taxaFormatada: 'R$ 145,00',
	statusPagamento: 'AGUARDANDO COMPENSAÇÃO GRU / PIX OFICIAL',
	pixCopiaECola: buildPixPayload(DEMO_PROTOCOLO, 145.0),
	dataHoraInscricao: '2026-03-01T14:30:00.000Z',
	integrityHash: '8F4E2C9A1D7B6E3F0A5C8D2E4B7A9F1C3E6D8B0A2F4C6E8A1B3D5F7E9C0A2B4D'
};

inscricoesStore.set(DEMO_PROTOCOLO, DEMO_RECORD);

/**
 * Resolve de forma autoritativa no servidor o Edital, o Cargo e a Taxa de Inscrição.
 * Mesmo que o front-end envie IDs customizados de outros editais do portal, o valor da taxa
 * é SEMPRE determinado exclusivamente pelo servidor com base na tabela oficial.
 */
function resolveServerEditalAndCargo(
	editalIdInput: string,
	cargoIdInput: string,
	editalTituloFallback?: string,
	cargoTituloFallback?: string
): {
	editalId: string;
	editalCodigo: string;
	orgao: string;
	cargoId: string;
	cargoTitulo: string;
	nivel: string;
	taxaInscricao: number;
} {
	const editalSpec = CATALOGO_EDITAIS_SERVIDOR[editalIdInput];
	if (editalSpec) {
		const cargoSpec = editalSpec.cargos[cargoIdInput] ?? Object.values(editalSpec.cargos)[0];
		return {
			editalId: editalSpec.id,
			editalCodigo: editalSpec.codigo,
			orgao: editalSpec.orgao,
			cargoId: cargoSpec.id,
			cargoTitulo: cargoSpec.titulo,
			nivel: cargoSpec.nivel,
			taxaInscricao: cargoSpec.taxaInscricao
		};
	}

	// Caso o ID venha de outro formato na UI, busca correspondência de cargo no catálogo ou aplica tabela normativa da Banca JBA
	for (const edital of Object.values(CATALOGO_EDITAIS_SERVIDOR)) {
		if (edital.cargos[cargoIdInput]) {
			const cargo = edital.cargos[cargoIdInput];
			return {
				editalId: editalIdInput,
				editalCodigo: editalTituloFallback || edital.codigo,
				orgao: edital.orgao,
				cargoId: cargo.id,
				cargoTitulo: cargo.titulo,
				nivel: cargo.nivel,
				taxaInscricao: cargo.taxaInscricao
			};
		}
	}

	const normalizedCargo = `${cargoIdInput} ${cargoTituloFallback ?? ''}`.toLowerCase();
	const isNivelMedioOuTecnico =
		normalizedCargo.includes('tecnico') ||
		normalizedCargo.includes('técnico') ||
		normalizedCargo.includes('assistente') ||
		normalizedCargo.includes('medio') ||
		normalizedCargo.includes('médio') ||
		normalizedCargo.includes('agente');

	return {
		editalId: editalIdInput,
		editalCodigo:
			editalTituloFallback || `EDITAL OFICIAL JBA (${editalIdInput.toUpperCase()})`,
		orgao: 'Banca Examinadora JBA Consultorias e Soluções Públicas',
		cargoId: cargoIdInput,
		cargoTitulo: cargoTituloFallback || cargoIdInput,
		nivel: isNivelMedioOuTecnico ? 'Médio / Técnico' : 'Superior',
		taxaInscricao: isNivelMedioOuTecnico ? 85.0 : 135.0
	};
}

function calculateCandidateAge(birthDateString: string): number | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDateString.trim());
	if (!match) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);

	const birthDate = new Date(Date.UTC(year, month - 1, day));
	if (
		Number.isNaN(birthDate.getTime()) ||
		birthDate.getUTCFullYear() !== year ||
		birthDate.getUTCMonth() !== month - 1 ||
		birthDate.getUTCDate() !== day
	) {
		return null;
	}

	const now = new Date();
	let age = now.getUTCFullYear() - year;
	const monthDiff = now.getUTCMonth() + 1 - month;
	if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < day)) {
		age -= 1;
	}
	return age;
}

/**
 * POST /api/inscricao
 * Registra uma nova inscrição em Concurso Público com validação criptográfica e anti-fraude.
 */
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const clientIp =
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		(() => {
			try {
				return getClientAddress();
			} catch {
				return '127.0.0.1';
			}
		})();

	// 1. Rate Limit estrito para submissão de inscrição (10 tentativas por minuto por IP)
	const rate = checkRateLimit(clientIp, 'inscricao-post', 10, 60_000);
	if (!rate.allowed) {
		const retryAfterSeconds = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000));
		return json(
			{
				error: 'Muitas tentativas de inscrição a partir deste endereço IP. Aguarde antes de tentar novamente.',
				code: 'RATE_LIMIT_INSCRICAO',
				retryAfterSeconds
			},
			{
				status: 429,
				headers: { 'Retry-After': String(retryAfterSeconds) }
			}
		);
	}

	// 2. Verificação de tamanho e parse seguro do JSON
	const rawBodyText = await request.text();
	if (rawBodyText.length > 16_384) {
		return json(
			{
				error: 'Payload excede o tamanho máximo permitido (16KB) pela Banca JBA.',
				code: 'PAYLOAD_TOO_LARGE'
			},
			{ status: 413 }
		);
	}

	let body: Record<string, unknown>;
	try {
		const parsed = JSON.parse(rawBodyText);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return json(
				{ error: 'Formato de requisição inválido. Objeto JSON esperado.', code: 'INVALID_JSON_OBJECT' },
				{ status: 400 }
			);
		}
		body = parsed as Record<string, unknown>;
	} catch {
		return json(
			{ error: 'Corpo JSON malformado ou inválido.', code: 'MALFORMED_JSON' },
			{ status: 400 }
		);
	}

	// 3. Inspeção WAF / Red Team em todas as propriedades e valores string do payload
	for (const [key, value] of Object.entries(body)) {
		const keyCheck = detectAttackPayload(key);
		if (keyCheck.isMalicious) {
			console.warn(`[JBA-SECURITY-ALERT] IP=${clientIp} KeyAttack="${key}" Reason="${keyCheck.reason}"`);
			return json(
				{
					error: 'Requisição bloqueada pelo motor de segurança preventiva da Banca JBA.',
					code: 'WAF_PAYLOAD_REJECTED'
				},
				{ status: 400 }
			);
		}

		if (typeof value === 'string') {
			const valCheck = detectAttackPayload(value);
			if (valCheck.isMalicious) {
				console.warn(
					`[JBA-SECURITY-ALERT] IP=${clientIp} Field="${key}" Reason="${valCheck.reason}"`
				);
				return json(
					{
						error: 'Entrada bloqueada por conter padrões não permitidos pela política de segurança.',
						code: 'WAF_PAYLOAD_REJECTED'
					},
					{ status: 400 }
				);
			}
		}
	}

	// 4. Extração e validação dos campos obrigatórios
	const rawNome = typeof body.nome === 'string' ? body.nome : '';
	const rawCpf = typeof body.cpf === 'string' ? body.cpf : '';
	const rawEmail = typeof body.email === 'string' ? body.email : '';
	const rawTelefone = typeof body.telefone === 'string' ? body.telefone : '';
	const rawEditalId = typeof body.editalId === 'string' ? body.editalId : '';
	const rawCargoId = typeof body.cargoId === 'string' ? body.cargoId : '';
	const rawDataNascimento = typeof body.dataNascimento === 'string' ? body.dataNascimento : '';
	const rawCidadeUf = typeof body.cidadeUf === 'string' ? body.cidadeUf : 'Florianópolis / SC';
	const rawNecessidadeEspecial =
		typeof body.necessidadeEspecial === 'string' ? body.necessidadeEspecial : 'Nenhuma';
	const rawModalidade =
		typeof body.modalidadeConcorrencia === 'string'
			? body.modalidadeConcorrencia
			: 'Ampla Concorrência (AC)';
	const aceiteEdital = Boolean(body.aceiteEdital);
	const aceiteLgpd = Boolean(body.aceiteLgpd);
	const isencaoSolicitada = Boolean(body.isencaoSolicitada);

	const nome = sanitizeInput(rawNome, 120);
	const email = sanitizeInput(rawEmail, 120).toLowerCase();
	const telefone = sanitizeInput(rawTelefone, 30);
	const editalId = sanitizeInput(rawEditalId, 80);
	const cargoId = sanitizeInput(rawCargoId, 80);
	const dataNascimento = sanitizeInput(rawDataNascimento, 12);
	const cidadeUf = sanitizeInput(rawCidadeUf, 80);
	const necessidadeEspecial = sanitizeInput(rawNecessidadeEspecial, 120);
	const modalidadeConcorrencia = sanitizeInput(rawModalidade, 80);
	const editalTituloOptional =
		typeof body.editalTitulo === 'string' ? sanitizeInput(body.editalTitulo, 140) : undefined;
	const cargoTituloOptional =
		typeof body.cargoTitulo === 'string' ? sanitizeInput(body.cargoTitulo, 140) : undefined;

	if (!nome || nome.length < 5 || !nome.includes(' ')) {
		return json(
			{
				error: 'Informe o nome civil completo do candidato (mínimo de nome e sobrenome).',
				code: 'INVALID_CANDIDATE_NAME'
			},
			{ status: 400 }
		);
	}

	const cpfDigits = rawCpf.replace(/\D/g, '');
	if (!validateCPF(cpfDigits)) {
		return json(
			{
				error: 'CPF inválido segundo o algoritmo oficial da Receita Federal.',
				code: 'INVALID_CPF_MOD11'
			},
			{ status: 400 }
		);
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
	if (!email || !emailRegex.test(email)) {
		return json(
			{ error: 'Informe um endereço de e-mail válido para recebimento do comprovante.', code: 'INVALID_EMAIL' },
			{ status: 400 }
		);
	}

	if (!editalId || !cargoId) {
		return json(
			{ error: 'Selecione o Edital e o Cargo pretendido antes de confirmar a inscrição.', code: 'MISSING_EDITAL_OR_CARGO' },
			{ status: 400 }
		);
	}

	if (!dataNascimento) {
		return json(
			{ error: 'A data de nascimento do candidato é obrigatória.', code: 'MISSING_BIRTHDATE' },
			{ status: 400 }
		);
	}

	const candidateAge = calculateCandidateAge(dataNascimento);
	if (candidateAge === null || candidateAge < 16 || candidateAge > 100) {
		return json(
			{
				error: 'Data de nascimento inválida. O candidato deve possuir entre 16 e 100 anos de idade.',
				code: 'INVALID_CANDIDATE_AGE'
			},
			{ status: 400 }
		);
	}

	if (!aceiteEdital || !aceiteLgpd) {
		return json(
			{
				error: 'É obrigatório declarar ciência das normas do Edital e consentimento com o termo de privacidade LGPD.',
				code: 'MISSING_LEGAL_CONSENT'
			},
			{ status: 400 }
		);
	}

	// 5. Cálculo Autoritativo da Taxa no Servidor (Ignora qualquer valor financeiro enviado pelo cliente)
	const resolvedSpec = resolveServerEditalAndCargo(
		editalId,
		cargoId,
		editalTituloOptional,
		cargoTituloOptional
	);

	// Se o cliente tentou enviar um campo `taxa` ou `valor` adulterado abaixo do valor oficial, registramos alerta de auditoria
	if (
		(typeof body.taxa === 'number' || typeof body.valor === 'number') &&
		Number(body.taxa ?? body.valor) !== resolvedSpec.taxaInscricao
	) {
		console.warn(
			`[JBA-SECURITY-ALERT] Tentativa de Parameter Tampering na taxa de inscrição ignorada. IP=${clientIp} ValorCliente=${String(body.taxa ?? body.valor)} ValorOficial=${resolvedSpec.taxaInscricao}`
		);
	}

	// 6. Geração de Protocolo Único, Mascaramento LGPD e Assinatura SHA-256
	const randomSuffix = crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000;
	const protocolo = `JBA-2026-${String(randomSuffix)}`;
	const dataHoraInscricao = new Date().toISOString();
	const cpfMascarado = maskCPF(cpfDigits);
	const taxaFinal = resolvedSpec.taxaInscricao;
	const taxaFormatada = `R$ ${taxaFinal.toFixed(2).replace('.', ',')}`;

	const integrityHash = await generateIntegrityHash({
		protocolo,
		editalId: resolvedSpec.editalId,
		cargoId: resolvedSpec.cargoId,
		cpf: formatCPF(cpfDigits),
		nome: nome.toUpperCase(),
		taxaInscricao: taxaFinal,
		dataHoraInscricao
	});

	const record: InscricaoRecord = {
		protocolo,
		editalId: resolvedSpec.editalId,
		editalCodigo: resolvedSpec.editalCodigo,
		orgao: resolvedSpec.orgao,
		cargoId: resolvedSpec.cargoId,
		cargoTitulo: resolvedSpec.cargoTitulo,
		nivel: resolvedSpec.nivel,
		nome: nome.toUpperCase(),
		cpfHashKey: cpfDigits,
		cpfMascarado,
		emailMascarado: maskEmail(email),
		telefoneMascarado: maskPhone(telefone),
		cidadeUf,
		dataNascimento,
		necessidadeEspecial,
		isencaoSolicitada,
		modalidadeConcorrencia,
		taxaInscricao: taxaFinal,
		taxaFormatada,
		statusPagamento: isencaoSolicitada
			? 'EM ANÁLISE DE ISENÇÃO (CADÚNICO / DOADOR DE MEDULA)'
			: 'AGUARDANDO COMPENSAÇÃO GRU / PIX OFICIAL',
		pixCopiaECola: buildPixPayload(protocolo, taxaFinal),
		dataHoraInscricao,
		integrityHash
	};

	inscricoesStore.set(protocolo, record);

	// Remove a chave interna de busca antes de retornar ao cliente (Prevenção de Vazamento de PII)
	const { cpfHashKey: _unused, ...safePublicReceipt } = record;

	return json(
		{
			success: true,
			message: 'Inscrição registrada e homologada preliminarmente com assinatura criptográfica SHA-256.',
			inscricao: safePublicReceipt
		},
		{ status: 201 }
	);
};

/**
 * GET /api/inscricao?protocolo=JBA-2026-XXXXXX ou ?cpf=00000000191
 * Consulta pública de comprovante de inscrição com proteção anti-IDOR e mascaramento LGPD.
 */
export const GET: RequestHandler = async ({ url, request, getClientAddress }) => {
	const clientIp =
		request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		(() => {
			try {
				return getClientAddress();
			} catch {
				return '127.0.0.1';
			}
		})();

	// Rate limit contra enumeração de protocolos/CPFs (20 consultas por minuto por IP)
	const rate = checkRateLimit(clientIp, 'inscricao-get', 20, 60_000);
	if (!rate.allowed) {
		const retryAfterSeconds = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000));
		return json(
			{
				error: 'Limite de consultas de protocolo excedido. Aguarde antes de consultar novamente.',
				code: 'RATE_LIMIT_LOOKUP',
				retryAfterSeconds
			},
			{
				status: 429,
				headers: { 'Retry-After': String(retryAfterSeconds) }
			}
		);
	}

	const rawProtocolo = url.searchParams.get('protocolo') ?? '';
	const rawCpf = url.searchParams.get('cpf') ?? '';

	if (
		detectAttackPayload(rawProtocolo).isMalicious ||
		detectAttackPayload(rawCpf).isMalicious
	) {
		return json(
			{ error: 'Parâmetros de consulta inválidos.', code: 'WAF_QUERY_REJECTED' },
			{ status: 400 }
		);
	}

	const protocolo = sanitizeInput(rawProtocolo, 40).toUpperCase();
	const cpfDigits = rawCpf.replace(/\D/g, '');

	if (!protocolo && !cpfDigits) {
		return json(
			{
				error: 'Informe o número de Protocolo (ex: JBA-2026-000191) ou o CPF cadastrado para consultar a inscrição.',
				code: 'MISSING_LOOKUP_PARAM'
			},
			{ status: 400 }
		);
	}

	let foundRecord: InscricaoRecord | undefined;

	if (protocolo) {
		foundRecord = inscricoesStore.get(protocolo);
	} else if (cpfDigits) {
		if (!validateCPF(cpfDigits)) {
			return json(
				{
					error: 'CPF informado para consulta é inválido segundo o algoritmo Módulo-11 da Receita Federal.',
					code: 'INVALID_CPF_LOOKUP'
				},
				{ status: 400 }
			);
		}
		for (const item of inscricoesStore.values()) {
			if (item.cpfHashKey === cpfDigits) {
				foundRecord = item;
			}
		}
	}

	if (!foundRecord) {
		return json(
			{
				error: 'Nenhuma inscrição localizada para os parâmetros informados. Verifique o número do protocolo ou tente o protocolo de demonstração JBA-2026-000191.',
				code: 'INSCRICAO_NOT_FOUND'
			},
			{ status: 404 }
		);
	}

	const { cpfHashKey: _hiddenCpf, ...lgpdSafeRecord } = foundRecord;

	return json(
		{
			success: true,
			inscricao: {
				...lgpdSafeRecord,
				cpfMascarado: maskCPF(foundRecord.cpfHashKey)
			}
		},
		{ status: 200 }
	);
};
