import type { Handle } from '@sveltejs/kit';
import { checkRateLimit } from '$lib/security/validator';

/**
 * JBA Consultorias e Soluções Públicas — Server Security Hook (Defense-in-Depth)
 * Implementa:
 * 1. Rate Limiting global para endpoints `/api/*` com cabeçalhos RFC 6585 (`Retry-After`).
 * 2. Proteção estrita contra CSRF verificando `Origin` e `Sec-Fetch-Site` em mutações HTTP.
 * 3. Hardening de cabeçalhos de resposta HTTP (CSP, HSTS, X-Frame-Options, Permissions-Policy).
 */
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

const CONTENT_SECURITY_POLICY = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	"img-src 'self' data: blob:",
	"connect-src 'self'",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'"
].join('; ');

function resolveClientIp(request: Request, getClientAddress: () => string): string {
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		const firstIp = forwardedFor.split(',')[0]?.trim();
		if (firstIp) return firstIp;
	}
	try {
		return getClientAddress();
	} catch {
		return '127.0.0.1';
	}
}

function applySecurityHeaders(headers: Headers): void {
	headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
	headers.set('X-Frame-Options', 'DENY');
	headers.set('X-Content-Type-Options', 'nosniff');
	headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
	headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
	headers.set('X-Permitted-Cross-Domain-Policies', 'none');
}

export const handle: Handle = async ({ event, resolve }) => {
	const { request, url } = event;
	const method = request.method.toUpperCase();
	const isApiRoute = url.pathname.startsWith('/api/');
	const clientIp = resolveClientIp(request, event.getClientAddress);

	// 1. Verificação de CSRF e Origem para requisições mutáveis (POST, PUT, DELETE, PATCH)
	if (STATE_CHANGING_METHODS.has(method)) {
		const origin = request.headers.get('origin');
		const secFetchSite = request.headers.get('sec-fetch-site');

		// Bloqueia requisições explicitamente cross-site reportadas pelo navegador
		if (secFetchSite && secFetchSite === 'cross-site') {
			const blockedHeaders = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
			applySecurityHeaders(blockedHeaders);
			return new Response(
				JSON.stringify({
					error: 'Requisição bloqueada pela política anti-CSRF (Sec-Fetch-Site inválido).',
					code: 'CSRF_CROSS_SITE_REJECTED'
				}),
				{ status: 403, headers: blockedHeaders }
			);
		}

		// Se o cabeçalho Origin estiver presente, deve corresponder exatamente ao origin do servidor
		if (origin && origin !== url.origin) {
			const blockedHeaders = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
			applySecurityHeaders(blockedHeaders);
			return new Response(
				JSON.stringify({
					error: 'Origem não autorizada para operação de escrita (Violação de Origin/CSRF).',
					code: 'CSRF_ORIGIN_MISMATCH'
				}),
				{ status: 403, headers: blockedHeaders }
			);
		}
	}

	// 2. Rate Limiting por IP nos endpoints da API (/api/*)
	let apiRateStatus: { allowed: boolean; remaining: number; resetAt: number } | null = null;
	if (isApiRoute) {
		// Limite global da camada de borda: 45 requisições por minuto por IP em rotas /api/*
		apiRateStatus = checkRateLimit(clientIp, 'global-api-hook', 45, 60_000);

		if (!apiRateStatus.allowed) {
			const retryAfterSeconds = Math.max(1, Math.ceil((apiRateStatus.resetAt - Date.now()) / 1000));
			const rateHeaders = new Headers({
				'Content-Type': 'application/json; charset=utf-8',
				'Retry-After': String(retryAfterSeconds),
				'X-RateLimit-Limit': '45',
				'X-RateLimit-Remaining': '0',
				'X-RateLimit-Reset': String(Math.ceil(apiRateStatus.resetAt / 1000))
			});
			applySecurityHeaders(rateHeaders);

			return new Response(
				JSON.stringify({
					error: 'Limite de requisições excedido. Aguarde alguns segundos antes de tentar novamente.',
					code: 'RATE_LIMIT_EXCEEDED',
					retryAfterSeconds
				}),
				{ status: 429, headers: rateHeaders }
			);
		}
	}

	const response = await resolve(event);

	// 3. Aplicação dos Cabeçalhos de Segurança Defensiva em todas as respostas
	const mutableHeaders = new Headers(response.headers);
	applySecurityHeaders(mutableHeaders);

	if (apiRateStatus) {
		mutableHeaders.set('X-RateLimit-Remaining', String(apiRateStatus.remaining));
		mutableHeaders.set('X-RateLimit-Reset', String(Math.ceil(apiRateStatus.resetAt / 1000)));
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: mutableHeaders
	});
};
