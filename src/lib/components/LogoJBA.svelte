<script lang="ts">
	import {
		JBA_NAVY_PATH,
		JBA_GOLD_PATH,
		JBA_CONSULTORIAS_PATH,
		JBA_SOLUCOES_PATH,
		JBA_TAGLINE_PATH,
		JBA_SEP_DIAMOND_PATH,
		JBA_SEP_LEFT_PATH,
		JBA_SEP_RIGHT_PATH
	} from './jbaVectorData';

	interface Props {
		variant?: 'compact' | 'full';
		theme?: 'light' | 'dark';
		className?: string;
	}

	let {
		variant = 'compact',
		theme = 'dark',
		className = ''
	}: Props = $props();

	const uid = `jba-logo-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="jba-logo-root {variant} {theme} {className}">
	{#if variant === 'full'}
		<!-- SVG Vetorial Oficial JBA Completo (com separador dourado e sem borda branca) -->
		<svg
			viewBox="0 0 1056 790"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			class="jba-svg-full"
			role="img"
			aria-label="JBA Consultorias e Soluções Públicas — Simplificando rotinas, otimizando resultados"
		>
			<defs>
				<linearGradient
					id="{uid}-primary"
					x1="4.02539"
					y1="3.98315"
					x2="345.544"
					y2="778.18"
					gradientUnits="userSpaceOnUse"
				>
					{#if theme === 'dark'}
						<stop stop-color="#FFFFFF" />
						<stop offset="0.45" stop-color="#FFFFFF" />
						<stop offset="1" stop-color="#FFFFFF" />
					{:else}
						<stop stop-color="#081C4A" />
						<stop offset="0.45" stop-color="#16398A" />
						<stop offset="1" stop-color="#06143A" />
					{/if}
				</linearGradient>
				<linearGradient
					id="{uid}-gold"
					x1="121.489"
					y1="159.156"
					x2="1000.2"
					y2="159.156"
					gradientUnits="userSpaceOnUse"
				>
					<stop stop-color="#A2721A" />
					<stop offset="0.5" stop-color="#F9D567" />
					<stop offset="1" stop-color="#C49539" />
				</linearGradient>
			</defs>

			<!-- Monograma JBA + Coluna Dourada (`jba-logo 1.svg` 1056x470) -->
			<path fill="url(#{uid}-primary)" fill-rule="evenodd" clip-rule="evenodd" d={JBA_NAVY_PATH} />
			<path fill="url(#{uid}-gold)" fill-rule="evenodd" clip-rule="evenodd" d={JBA_GOLD_PATH} />

			<!-- CONSULTORIAS (`Consultorias.svg` 898x91) -->
			<g transform="translate(79, 488)">
				<path fill={theme === 'dark' ? '#FFFFFF' : '#081C4A'} d={JBA_CONSULTORIAS_PATH} />
			</g>

			<!-- E SOLUÇÕES PÚBLICAS (`E SOLUÇÕES PÚBLICAS.svg` 710x67) -->
			<g transform="translate(173, 594)">
				<path fill={theme === 'dark' ? '#FFFFFF' : '#081C4A'} d={JBA_SOLUCOES_PATH} />
			</g>

			<!-- Separador Dourado Oficial (`Rectangle 57` + `Rectangle 56` + `Rectangle 58`) -->
			<g transform="translate(133.36, 678) scale(0.865)">
				<g transform="translate(0, 22)">
					<path fill="url(#{uid}-gold)" d={JBA_SEP_LEFT_PATH} />
				</g>
				<g transform="translate(438, 0)">
					<path fill="url(#{uid}-gold)" d={JBA_SEP_DIAMOND_PATH} />
				</g>
				<g transform="translate(494.4657, 22)">
					<path fill="url(#{uid}-gold)" d={JBA_SEP_RIGHT_PATH} />
				</g>
			</g>

			<!-- Simplificando rotinas, otimizando resultados (`Simplificando rotinas, otimizando resultados.svg` 789x34) -->
			<g transform="translate(133.5, 742)">
				<path fill={theme === 'dark' ? '#FFFFFF' : '#16398A'} d={JBA_TAGLINE_PATH} />
			</g>
		</svg>
	{:else}
		<!-- Versão Compacta (Menu Superior e Rodapé) — Sem borda em volta -->
		<div class="jba-compact-lockup">
			<div class="jba-compact-badge">
				<svg
					viewBox="0 0 1056 470"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					class="jba-compact-mark"
					role="img"
					aria-hidden="true"
				>
					<defs>
						<linearGradient id="{uid}-c-navy" x1="0" y1="0" x2="1" y2="1">
							{#if theme === 'dark'}
								<stop offset="0" stop-color="#ffffff" />
								<stop offset="1" stop-color="#ffffff" />
							{:else}
								<stop offset="0" stop-color="#081c4a" />
								<stop offset="0.45" stop-color="#16398a" />
								<stop offset="1" stop-color="#06143a" />
							{/if}
						</linearGradient>
						<linearGradient id="{uid}-c-gold" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0" stop-color="#a2721a" />
							<stop offset="0.5" stop-color="#f9d567" />
							<stop offset="1" stop-color="#c49539" />
						</linearGradient>
					</defs>
					<path fill="url(#{uid}-c-navy)" fill-rule="evenodd" clip-rule="evenodd" d={JBA_NAVY_PATH} />
					<path fill="url(#{uid}-c-gold)" fill-rule="evenodd" clip-rule="evenodd" d={JBA_GOLD_PATH} />
				</svg>
			</div>

			<div class="jba-compact-text">
				<span class="jba-brand-title">CONSULTORIAS E SOLUÇÕES PÚBLICAS</span>
				<span class="jba-brand-tagline">
					SIMPLIFICANDO ROTINAS, OTIMIZANDO RESULTADOS
				</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.jba-logo-root {
		display: inline-flex;
		align-items: center;
	}

	.jba-logo-root.full {
		width: 100%;
		justify-content: center;
	}

	.jba-svg-full {
		width: 100%;
		max-width: 495px;
		height: auto;
		display: block;
	}

	.jba-compact-lockup {
		display: flex;
		align-items: center;
		gap: 0.95rem;
	}

	/* Sem borda, sem caixa de fundo */
	.jba-compact-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		background: transparent;
		border: none;
		box-shadow: none;
	}

	.jba-compact-mark {
		width: 112px;
		height: 50px;
		flex-shrink: 0;
		display: block;
	}

	.jba-compact-text {
		display: flex;
		flex-direction: column;
		gap: 0.22rem;
	}

	.jba-brand-title {
		font-family: var(--font-heading);
		font-size: 0.88rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		line-height: 1.15;
	}

	.dark .jba-brand-title {
		color: #ffffff;
	}

	.light .jba-brand-title {
		color: #081c4a;
	}

	.jba-brand-tagline {
		font-family: var(--font-body);
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.dark .jba-brand-tagline {
		color: rgba(250, 247, 240, 0.82);
	}

	.light .jba-brand-tagline {
		color: #16398a;
	}

	@media (max-width: 560px) {
		.jba-compact-mark {
			width: 84px;
			height: 38px;
		}
		.jba-brand-title {
			font-size: 0.74rem;
			letter-spacing: 0.05em;
		}
		.jba-brand-tagline {
			font-size: 0.56rem;
			letter-spacing: 0.08em;
		}
	}
</style>
