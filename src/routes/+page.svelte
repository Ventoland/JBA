<script lang="ts">
	import { base } from '$app/paths';
	import { concursos, indicadores, pilaresAtuacao } from '$lib/data/concursos';
	import LogoJBA from '$lib/components/LogoJBA.svelte';

	const concursosAbertos = concursos.filter((c) => c.status === 'Inscrições Abertas');

	const etapasMetodo = [
		{
			numero: '01',
			titulo: 'Diagnóstico Objetivo',
			descricao:
				'Levantamento direto das demandas do órgão público, identificando gargalos nas rotinas internas, necessidades de contratação ou quadro de vagas.'
		},
		{
			numero: '02',
			titulo: 'Simplificação de Rotinas',
			descricao:
				'Padronização de fluxos administrativos, elaboração de modelos práticos (Lei nº 14.133/2021) e condução organizada de processos seletivos e concursos.'
		},
		{
			numero: '03',
			titulo: 'Otimização de Resultados',
			descricao:
				'Entregas seguras, servidores capacitados para o dia a dia e certames homologados com transparência para a Administração e para o cidadão.'
		}
	];
</script>

<svelte:head>
	<title>JBA Consultorias e Soluções Públicas | Simplificando Rotinas, Otimizando Resultados</title>
	<meta
		name="description"
		content="JBA Consultorias e Soluções Públicas — Simplificando rotinas, otimizando resultados. Consultoria em gestão pública municipal, licitações e realização de concursos públicos."
	/>
</svelte:head>

<div class="jba-home">
	<!-- HERO INSTITUCIONAL -->
	<section class="hero-section" aria-labelledby="hero-title">
		<div class="container hero-grid">
			<div class="hero-content">
				<span class="hero-motto">SIMPLIFICANDO ROTINAS, OTIMIZANDO RESULTADOS</span>

				<h1 id="hero-title" class="hero-title">
					Consultoria em Gestão Pública e Organização de Concursos
				</h1>

				<p class="hero-lead">
					Apoiamos Prefeituras, Câmaras Municipais e Autarquias na organização de processos administrativos, planejamento de contratações e realização periódica de concursos públicos e processos seletivos com clareza e segurança.
				</p>

				<div class="hero-actions">
					<a href="{base}/atuacao" class="btn btn-gold">
						Conhecer a Consultoria
					</a>
					<a href="{base}/concursos" class="btn btn-outline-gold">
						Portal de Concursos ({concursosAbertos.length} Abertos)
					</a>
				</div>
			</div>

			<div class="hero-brand-panel">
				<LogoJBA variant="full" theme="dark" />
			</div>
		</div>
	</section>

	<!-- INDICADORES OBJETIVOS -->
	<section class="metrics-bar" aria-label="Indicadores Institucionais">
		<div class="container metrics-grid">
			{#each indicadores as item (item.id)}
				<div class="metric-item">
					<strong class="metric-value">{item.valor}</strong>
					<span class="metric-label">{item.rotulo}</span>
					<p class="metric-detail">{item.detalhe}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ÁREAS DE ATUAÇÃO (FOCO EM CONSULTORIA PÚBLICA E CONCURSOS) -->
	<section class="section" aria-labelledby="atuacao-heading">
		<div class="container">
			<div class="section-header">
				<div>
					<span class="section-kicker">ATUAÇÃO INSTITUCIONAL</span>
					<h2 id="atuacao-heading" class="section-title">
						Soluções Práticas para a Administração Pública
					</h2>
				</div>
				<p class="section-subtitle">
					Foco na organização do trabalho diário dos órgãos públicos e na condução transparente de seleções quando há necessidade de recomposição de quadro.
				</p>
			</div>

			<div class="pillars-grid">
				{#each pilaresAtuacao as pilar (pilar.id)}
					<article class="pillar-card">
						<div class="pillar-top">
							<span class="pillar-number">{pilar.numero}</span>
							<span class="pillar-tag">{pilar.credencial.split('•')[0].trim()}</span>
						</div>

						<h3 class="pillar-title">{pilar.titulo}</h3>
						<p class="pillar-summary">{pilar.resumoExecutivo}</p>

						<ul class="pillar-list">
							{#each pilar.servicos as servico (servico.nome)}
								<li>
									<strong>{servico.nome}</strong>
									<span>{servico.descricao}</span>
								</li>
							{/each}
						</ul>

						<div class="pillar-footer">
							{#if pilar.slug === 'concursos'}
								<a href="{base}/concursos" class="link-arrow">
									Acessar Portal de Concursos →
								</a>
							{:else}
								<a href="{base}/atuacao?pilar={pilar.slug}" class="link-arrow">
									Ver detalhes da consultoria →
								</a>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- METODOLOGIA: SIMPLIFICANDO ROTINAS, OTIMIZANDO RESULTADOS -->
	<section class="section section-navy" aria-labelledby="metodo-heading">
		<div class="container">
			<div class="section-header">
				<div>
					<span class="section-kicker gold">COMO TRABALHAMOS</span>
					<h2 id="metodo-heading" class="section-title light">
						Simplificando Rotinas, Otimizando Resultados
					</h2>
				</div>
				<p class="section-subtitle light">
					Metodologia direta e sem excesso de burocracia para apoiar gestores e equipes técnicas municipais.
				</p>
			</div>

			<div class="steps-grid">
				{#each etapasMetodo as etapa (etapa.numero)}
					<div class="step-card">
						<span class="step-num">{etapa.numero}</span>
						<h3 class="step-title">{etapa.titulo}</h3>
						<p class="step-desc">{etapa.descricao}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- CONCURSOS ABERTOS (SEGUINDO O MESMO PADRÃO DOS CARDS ANTERIORES) -->
	<section class="section" aria-labelledby="concursos-heading">
		<div class="container">
			<div class="section-header">
				<div>
					<span class="section-kicker">CONCURSOS ABERTOS</span>
					<h2 id="concursos-heading" class="section-title">
						Concursos Públicos e Processos Seletivos
					</h2>
				</div>
				<div class="header-links">
					<a href="{base}/concursos" class="btn btn-navy">
						Ver Todos os Editais ({concursos.length})
					</a>
					<a href="{base}/concursos?aba=consulta" class="btn btn-outline">
						Consultar Inscrição
					</a>
				</div>
			</div>

			<div class="pillars-grid">
				{#each concursosAbertos as certame (certame.id)}
					<article class="pillar-card">
						<div class="pillar-top">
							<span class="concurso-code">{certame.codigo.split('—')[0].trim()}</span>
							<span class="concurso-status">{certame.status}</span>
						</div>

						<h3 class="pillar-title">{certame.orgao}</h3>
						<p class="pillar-summary">{certame.titulo}</p>

						<ul class="concurso-specs">
							<li>
								<span>Município / UF</span>
								<strong>{certame.municipio} / {certame.uf}</strong>
							</li>
							<li>
								<span>Período de Inscrição</span>
								<strong>{certame.periodoInscricao}</strong>
							</li>
							<li>
								<span>Quadro de Vagas</span>
								<strong>{certame.vagasTotais} imediatas + {certame.cadastroReservaTotal} CR</strong>
							</li>
							<li>
								<span>Vencimentos Iniciais</span>
								<strong class="gold-text">Até {certame.salarioMax}</strong>
							</li>
						</ul>

						<div class="concurso-card-footer">
							<a href="{base}/concursos?edital={certame.id}&aba=inscricao" class="btn btn-navy btn-sm">
								Realizar Inscrição
							</a>
							<a href="{base}/concursos?edital={certame.id}&aba=editais" class="link-arrow">
								Ver Edital →
							</a>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- CHAMADA FINAL PARA ÓRGÃOS PÚBLICOS -->
	<section class="cta-banner" aria-labelledby="cta-title">
		<div class="container cta-inner">
			<div>
				<span class="section-kicker">ATENDIMENTO A PREFEITURAS, CÂMARAS E AUTARQUIAS</span>
				<h2 id="cta-title" class="cta-title">
					Precisa organizar rotinas administrativas ou planejar um novo certame?
				</h2>
				<p class="cta-desc">
					Entre em contato com nossa consultoria para diagnóstico técnico ou solicitação de proposta institucional.
				</p>
			</div>
			<div class="cta-buttons">
				<a href="{base}/atuacao#solicitar-proposta" class="btn btn-navy">
					Solicitar Proposta Técnica
				</a>
				<a href="{base}/transparencia#ouvidoria" class="btn btn-outline">
					Falar com a JBA
				</a>
			</div>
		</div>
	</section>
</div>

<style>
	.jba-home {
		background-color: var(--jba-ivory);
		color: var(--jba-slate-700);
	}

	/* HERO */
	.hero-section {
		background: linear-gradient(135deg, #06143a 0%, #081c4a 100%);
		color: #ffffff;
		padding: 4.5rem 0;
		border-bottom: 2px solid #c49539;
	}

	.hero-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
		gap: 2.5rem;
		align-items: center;
	}

	.hero-motto {
		display: inline-block;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #f9d567;
		padding: 0.35rem 0.85rem;
		border-radius: 4px;
		background: rgba(249, 213, 103, 0.1);
		border: 1px solid rgba(249, 213, 103, 0.3);
		margin-bottom: 1.25rem;
	}

	.hero-title {
		font-family: var(--font-heading);
		font-size: clamp(2rem, 3.4vw, 2.85rem);
		color: #ffffff;
		line-height: 1.18;
		margin-bottom: 1.25rem;
	}

	.hero-lead {
		font-size: 1.05rem;
		line-height: 1.65;
		color: rgba(250, 247, 240, 0.86);
		margin-bottom: 2rem;
		max-width: 60ch;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	.hero-brand-panel {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* INDICADORES */
	.metrics-bar {
		background: #ffffff;
		border-bottom: 1px solid var(--jba-border);
		padding: 2.25rem 0;
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1.5rem;
	}

	.metric-item {
		padding-left: 1rem;
		border-left: 2px solid #c49539;
	}

	.metric-value {
		display: block;
		font-family: var(--font-heading);
		font-size: 1.65rem;
		font-weight: 700;
		color: var(--jba-navy-900);
		line-height: 1.1;
		margin-bottom: 0.25rem;
	}

	.metric-label {
		display: block;
		font-size: 0.88rem;
		font-weight: 700;
		color: var(--jba-navy-800);
		margin-bottom: 0.2rem;
	}

	.metric-detail {
		font-size: 0.8rem;
		color: var(--jba-slate-600);
		line-height: 1.45;
	}

	/* CABEÇALHOS DE SEÇÃO */
	.section-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 2rem;
		margin-bottom: 2.5rem;
		flex-wrap: wrap;
	}

	.section-kicker {
		display: block;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--jba-gold-600);
		margin-bottom: 0.4rem;
	}

	.section-kicker.gold {
		color: #f9d567;
	}

	.section-title {
		font-size: clamp(1.5rem, 2.4vw, 2.1rem);
		color: var(--jba-navy-900);
	}

	.section-title.light {
		color: #ffffff;
	}

	.section-subtitle {
		max-width: 480px;
		font-size: 0.95rem;
		color: var(--jba-slate-600);
		line-height: 1.6;
	}

	.section-subtitle.light {
		color: rgba(250, 247, 240, 0.8);
	}

	.header-links {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	/* PILARES DE ATUAÇÃO & CONCURSOS ABERTOS (MESMO PADRÃO VISUAL) */
	.pillars-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.5rem;
	}

	.pillar-card {
		background: #ffffff;
		border: 1px solid var(--jba-border);
		border-radius: 12px;
		padding: 1.75rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.pillar-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--jba-border);
	}

	.pillar-number {
		font-family: var(--font-heading);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--jba-gold-600);
	}

	.pillar-tag {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--jba-navy-800);
		background: var(--jba-ivory);
		padding: 0.2rem 0.6rem;
		border-radius: 4px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.concurso-code {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		font-weight: 700;
		color: var(--jba-navy-900);
		background: var(--jba-ivory);
		padding: 0.22rem 0.6rem;
		border-radius: 4px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.concurso-status {
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--jba-success);
		background: var(--jba-success-bg);
		padding: 0.22rem 0.7rem;
		border-radius: 9999px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.pillar-title {
		font-size: 1.18rem;
		margin-bottom: 0.6rem;
		color: var(--jba-navy-900);
		line-height: 1.3;
	}

	.pillar-summary {
		font-size: 0.88rem;
		color: var(--jba-slate-600);
		line-height: 1.55;
		margin-bottom: 1.25rem;
	}

	.pillar-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--jba-border);
	}

	.pillar-list li {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.pillar-list strong {
		font-size: 0.85rem;
		color: var(--jba-navy-900);
	}

	.pillar-list span {
		font-size: 0.8rem;
		color: var(--jba-slate-600);
		line-height: 1.45;
	}

	.concurso-specs {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: auto;
		margin-bottom: 1.5rem;
		padding: 1rem 0;
		border-top: 1px solid var(--jba-border);
		border-bottom: 1px solid var(--jba-border);
	}

	.concurso-specs li {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: 0.82rem;
	}

	.concurso-specs span {
		color: var(--jba-slate-500);
	}

	.concurso-specs strong {
		color: var(--jba-navy-900);
		font-weight: 600;
		text-align: right;
	}

	.concurso-specs strong.gold-text {
		color: var(--jba-gold-700);
		font-weight: 700;
	}

	.pillar-footer {
		margin-top: auto;
		padding-top: 0.5rem;
	}

	.concurso-card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.btn-sm {
		padding: 0.55rem 1rem;
		font-size: 0.82rem;
	}

	.link-arrow {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--jba-navy-800);
		white-space: nowrap;
	}

	.link-arrow:hover {
		color: var(--jba-gold-600);
	}

	/* METODOLOGIA */
	.steps-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.5rem;
	}

	.step-card {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(249, 213, 103, 0.22);
		border-radius: 10px;
		padding: 1.75rem;
	}

	.step-num {
		display: inline-block;
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: #f9d567;
		margin-bottom: 0.65rem;
	}

	.step-title {
		font-size: 1.15rem;
		color: #ffffff;
		margin-bottom: 0.5rem;
	}

	.step-desc {
		font-size: 0.9rem;
		color: rgba(250, 247, 240, 0.8);
		line-height: 1.6;
	}

	/* CTA FINAL */
	.cta-banner {
		padding: 0 0 4.5rem;
		background: var(--jba-ivory);
	}

	.cta-inner {
		background: #ffffff;
		border: 1px solid var(--jba-border);
		border-left: 4px solid #c49539;
		border-radius: 12px;
		padding: 2.25rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.cta-title {
		font-size: 1.4rem;
		margin-bottom: 0.35rem;
	}

	.cta-desc {
		font-size: 0.92rem;
		color: var(--jba-slate-600);
	}

	.cta-buttons {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	@media (max-width: 960px) {
		.hero-grid,
		.pillars-grid,
		.steps-grid {
			grid-template-columns: 1fr;
		}

		.metrics-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 600px) {
		.metrics-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
