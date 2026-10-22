/**
 * JBA Consultorias e Soluções Públicas — Módulo de Segurança e Validação Criptográfica
 * Arquitetura Defensiva (Luna & Quinn Security Engineering)
 *
 * Protege o Portal de Concursos Públicos e Consultoria Governamental contra:
 * - Fraude cadastral (validação algorítmica Módulo-11 da Receita Federal para CPF)
 * - Injeção de código (XSS, HTML Injection, SQLi, NoSQLi, SSTI, Prototype Pollution, Path Traversal)
 * - Adulteração de comprovantes (Hash de Integridade SHA-256 via Web Crypto API)
 * - Vazamento de dados pessoais (Mascaramento LGPD - Lei nº 13.709/2018)
 * - Abuso automatizado e força bruta (Rate Limiting em memória por IP e bucket)
 */

interface RateLimitEntry {
	timestamps: number[];
	resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Valida um CPF utilizando o algoritmo oficial Módulo-11 da Receita Federal do Brasil.
 * Rejeita CPFs com tamanho diferente de 11 dígitos, sequências repetidas (ex: 111.111.111-11)
 * e valida ambos os dígitos verificadores.
 * Também permite o CPF técnico de homologação `00000000191` (válido no Módulo-11 oficial).
 */
export function validateCPF(cpf: string): boolean {
	if (typeof cpf !== 'string') return false;

	const digits = cpf.replace(/\D/g, '');
	if (digits.length !== 11) return false;

	// Rejeita sequências de dígitos idênticos conhecidas (ex: 00000000000 a 99999999999)
	if (/^(\d)\1{10}$/.test(digits)) return false;

	// Cálculo do 1º Dígito Verificador (pesos de 10 a 2)
	let sum1 = 0;
	for (let i = 0; i < 9; i++) {
		sum1 += parseInt(digits.charAt(i), 10) * (10 - i);
	}
	let rev1 = (sum1 * 10) % 11;
	if (rev1 === 10 || rev1 === 11) rev1 = 0;
	if (rev1 !== parseInt(digits.charAt(9), 10)) return false;

	// Cálculo do 2º Dígito Verificador (pesos de 11 a 2)
	let sum2 = 0;
	for (let i = 0; i < 10; i++) {
		sum2 += parseInt(digits.charAt(i), 10) * (11 - i);
	}
	let rev2 = (sum2 * 10) % 11;
	if (rev2 === 10 || rev2 === 11) rev2 = 0;
	if (rev2 !== parseInt(digits.charAt(10), 10)) return false;

	return true;
}

/**
 * Formata um CPF no padrão `000.000.000-00`.
 */
export function formatCPF(cpf: string): string {
	const digits = String(cpf ?? '').replace(/\D/g, '').slice(0, 11);
	if (digits.length !== 11) return digits;
	return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Mascara um CPF para conformidade com a LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)
 * em comprovantes públicos, listas de inscritos e consultas de protocolo: `***.456.789-**`.
 */
export function maskCPF(cpf: string): string {
	const digits = String(cpf ?? '').replace(/\D/g, '');
	if (digits.length !== 11) return '***.***.***-**';
	return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

/**
 * Higieniza e normaliza entradas textuais de usuários contra XSS, HTML Injection,
 * operadores SQL/NoSQL e caracteres de controle invisíveis.
 */
export function sanitizeInput(input: unknown, maxLength = 255): string {
	if (input === null || input === undefined) return '';
	const raw = String(input).normalize('NFC');

	const cleaned = raw
		// Remove caracteres de controle ASCII (exceto tab/newline básicos se necessário, aqui removemos todos < 32)
		.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
		// Remove tags <script>, <iframe>, <object>, <embed>, <style> e seu conteúdo
		.replace(/<(script|iframe|object|embed|style|svg|math)[^>]*>[\s\S]*?<\/\1>/gi, '')
		// Remove quaisquer tags HTML remanescentes
		.replace(/<\/?[a-z][^>]*>/gi, '')
		// Remove handlers de eventos inline e pseudo-protocolos executáveis
		.replace(/\bon\w+\s*=/gi, '')
		.replace(/(javascript|vbscript|data)\s*:/gi, '')
		// Remove operadores de injeção NoSQL e SQL clássicos
		.replace(/\$(where|ne|gt|lt|gte|lte|in|nin|regex|expr|function)\b/gi, '')
		.replace(/('|\b)(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/gi, '')
		.replace(/--\s*$/gm, '')
		// Remove delimitadores de Server-Side Template Injection (SSTI)
		.replace(/\{\{[\s\S]*?\}\}/g, '')
		.replace(/\$\{[\s\S]*?\}/g, '')
		// Remove caracteres angulares residuais
		.replace(/[<>]/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	return cleaned.slice(0, maxLength);
}

/**
 * Motor de Detecção de Payloads Ofensivos (WAF / Red Team Detection Engine).
 * Inspeciona strings em busca de assinaturas de ataque OWASP Top 10:
 * - Cross-Site Scripting (XSS)
 * - SQL Injection (SQLi) & NoSQL Injection
 * - Server-Side Template Injection (SSTI)
 * - Path Traversal / LFI
 * - Prototype Pollution
 */
export function detectAttackPayload(input: string): { isMalicious: boolean; reason?: string } {
	if (typeof input !== 'string' || input.length === 0) {
		return { isMalicious: false };
	}

	const decoded = (() => {
		try {
			return decodeURIComponent(input);
		} catch {
			return input;
		}
	})();

	const rules: Array<{ pattern: RegExp; reason: string }> = [
		{
			pattern: /<\s*(script|iframe|svg|img|onload|onerror|body|object|embed)\b|\bon(error|load|mouseover|focus|click|submit)\s*=|javascript\s*:/i,
			reason: 'Tentativa de Cross-Site Scripting (XSS / HTML Injection) detectada.'
		},
		{
			pattern: /(\bUNION\s+(ALL\s+)?SELECT\b|\bSELECT\s+[\w*,\s]+\s+FROM\b|\bDROP\s+TABLE\b|\bINSERT\s+INTO\b|'\s*(OR|AND)\s*['"]?\w+['"]?\s*=\s*['"]?\w+|\bSLEEP\s*\(\s*\d+\s*\)|\bBENCHMARK\s*\()/i,
			reason: 'Tentativa de SQL Injection (SQLi) detectada.'
		},
		{
			pattern: /\$(where|ne|gt|lt|gte|lte|regex|expr|function)\b/i,
			reason: 'Tentativa de NoSQL Operator Injection detectada.'
		},
		{
			pattern: /(\{\{\s*[\w.*+\-/()]+\s*\}\}|\$\{\s*[\w.*+\-/()]+\s*\}|<%[\s\S]*?%>)/,
			reason: 'Tentativa de Server-Side Template Injection (SSTI) detectada.'
		},
		{
			pattern: /(\.\.[/\\]){2,}|\/etc\/passwd|c:\\windows\\system32/i,
			reason: 'Tentativa de Path Traversal / Local File Inclusion (LFI) detectada.'
		},
		{
			pattern: /(__proto__|constructor\s*\.\s*prototype|\[\s*['"]__proto__['"]\s*\])/i,
			reason: 'Tentativa de Prototype Pollution detectada.'
		}
	];

	for (const rule of rules) {
		if (rule.pattern.test(input) || rule.pattern.test(decoded)) {
			return { isMalicious: true, reason: rule.reason };
		}
	}

	return { isMalicious: false };
}

/**
 * Gera um Hash Criptográfico SHA-256 determinístico via Web Crypto API (`crypto.subtle.digest`)
 * para garantir a integridade e não-repúdio dos comprovantes de inscrição em Concursos Públicos.
 */
export async function generateIntegrityHash(payload: Record<string, unknown>): Promise<string> {
	const sortedKeys = Object.keys(payload).sort();
	const canonicalObject: Record<string, unknown> = {};
	for (const key of sortedKeys) {
		canonicalObject[key] = payload[key];
	}

	const salt = 'JBA-GOVTECH-INTEGRITY-2026-SHA256';
	const serialized = `${salt}:${JSON.stringify(canonicalObject)}`;
	const encoder = new TextEncoder();
	const data = encoder.encode(serialized);

	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Limitador de taxa (Sliding-Window em memória) para proteção contra enumeração de CPFs,
 * scraping de editais e ataques de negação de serviço (DoS) nas rotas críticas.
 */
export function checkRateLimit(
	ip: string,
	bucket: string,
	limit: number,
	windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
	const now = Date.now();
	const safeIp = (ip || 'unknown').trim().slice(0, 64);
	const key = `${bucket}:${safeIp}`;

	// Limpeza periódica preventiva para evitar crescimento ilimitado de memória
	if (rateLimitStore.size > 5000) {
		for (const [k, entry] of rateLimitStore.entries()) {
			if (entry.resetAt <= now) {
				rateLimitStore.delete(k);
			}
		}
	}

	const existing = rateLimitStore.get(key);
	const windowStart = now - windowMs;

	if (!existing || existing.resetAt <= now) {
		const resetAt = now + windowMs;
		rateLimitStore.set(key, {
			timestamps: [now],
			resetAt
		});
		return {
			allowed: true,
			remaining: Math.max(0, limit - 1),
			resetAt
		};
	}

	// Filtra apenas requisições dentro da janela deslizante atual
	const recentTimestamps = existing.timestamps.filter((ts) => ts > windowStart);

	if (recentTimestamps.length >= limit) {
		const oldestInWindow = recentTimestamps[0] ?? now;
		const resetAt = oldestInWindow + windowMs;
		existing.timestamps = recentTimestamps;
		existing.resetAt = resetAt;
		return {
			allowed: false,
			remaining: 0,
			resetAt
		};
	}

	recentTimestamps.push(now);
	const resetAt = (recentTimestamps[0] ?? now) + windowMs;
	existing.timestamps = recentTimestamps;
	existing.resetAt = resetAt;

	return {
		allowed: true,
		remaining: Math.max(0, limit - recentTimestamps.length),
		resetAt
	};
}
