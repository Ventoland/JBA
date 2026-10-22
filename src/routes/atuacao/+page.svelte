<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { pilaresAtuacao } from '$lib/data/concursos';

	type SlugFiltro = 'todos' | 'gestao' | 'governanca' | 'concursos';

	let filtroAtivo = $state<SlugFiltro>('todos');

	let tipoEntidade = $state('Prefeitura Municipal');
	let nomeOrgao = $state('');
	let ufOrgao = $state('MG');
	let responsavelNome = $state('');
	let responsavelCargo = $state('Secretário(a) / Gestor(a)');
	let emailInstitucional = $state('');
	let telefoneContato = $state('');
	let escopoInteresse = $state('Consultoria em Gestão e Simplificação de Rotinas');
	let descricaoDemanda = $state('');
	let aceiteLgpd = $state(false);

	let enviandoProposta = $state(false);
	let erroProposta = $state('');
	let protocoloGerado = $state('');

	const pilaresFiltrados = $derived(
		filtroAtivo === 'todos'
			? pilaresAtuacao
			: pilaresAtuacao.filter((p) => p.slug === filtroAtivo)
	);

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const pilarParam = params.get('pilar');
		if (pilarParam === 'gestao' || pilarParam === 'governanca' || pilarParam === 'concursos') {
			filtroAtivo = pilarParam;
		}
	});

	function enviarSolicitacaoProposta(event: SubmitEvent) {
		event.preventDefault();
		erroProposta = '';

		if (!nomeOrgao.trim() || !responsavelNome.trim() || !emailInstitucional.trim()) {
			erroProposta =
				'Preencha a identificação do Órgão Público, Nome do Responsável e E-mail Institucional.';
			return;
		}

		if (!aceiteLgpd) {
			erroProposta =
				'Confirme a ciência sobre o tratamento institucional de dados (LGPD).';
			return;
		}

		enviandoProposta = true;
		setTimeout(() => {
			enviandoProposta = false;
			const randomNum = Math.floor(100000 + Math.random() * 900000);
			protocoloGerado = `JBA-PROP-2026-${randomNum}`;
		}, 350);
	}
</script>

<svelte:head>
	<title>Consultoria Pública e Soluções | JBA Consultorias e Soluções Públicas</title>
	<meta
		name="description"
		content="Conheça as frentes de atuação da JBA Consultorias e Soluções Públicas: Gestão Pública, Simplificação de Rotinas, Planejamento de Contratações e Concursos Públicos."
	/>
</svelte:head>

<div class="atuacao-page">
	<section class="page-hero" aria-labelledby="atuacao-hero-title">
		<div class="container">
			<span class="hero-kicker">SIMPLIFICANDO ROTINAS, OTIMIZANDO RESULTADOS</span>
			<h1 id="atuacao-hero-title" class="hero-title">
				Consultoria Pública e Organização de Certames
			</h1>
			<p class="hero-sub">
				Atuamos ao lado de Prefeituras, Câmaras Municipais, Autarquias e Consórcios para organizar processos internos, apoiar o planejamento de contratações e realizar concursos públicos e processos seletivos com eficiência.
			</p>

			<div class="tabs-bar" role="tablist" aria-label="Filtrar frentes de atuação">
				<button
					type="button"
					role="tab"
					aria-selected={filtroAtivo === 'todos'}
					class="tab-btn {filtroAtivo === 'todos' ? 'active' : ''}"
					onclick={() => (filtroAtivo = 'todos')}
				>
					Todas as Frentes
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={filtroAtivo === 'gestao'}
					class="tab-btn {filtroAtivo === 'gestao' ? 'active' : ''}"
					onclick={() => (filtroAtivo = 'gestao')}
				>
					01. Gestão e Rotinas
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={filtroAtivo === 'governanca'}
					class="tab-btn {filtroAtivo === 'governanca' ? 'active' : ''}"
					onclick={() => (filtroAtivo = 'governanca')}
				>
					02. Planejamento e Contratações
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={filtroAtivo === 'concursos'}
					class="tab-btn {filtroAtivo === 'concursos' ? 'active' : ''}"
					onclick={() => (filtroAtivo = 'concursos')}
				>
					03. Concursos Públicos
				</button>
			</div>
		</div>
	</section>

	<section class="section" aria-label="Detalhamento das frentes de atuação">
		<div class="container pillars-stack">
			{#each pilaresFiltrados as pilar (pilar.id)}
				<article class="dossier-card" id={pilar.slug}>
					<div class="dossier-header">
						<div>
							<span class="dossier-num">FRENTE {pilar.numero} • {pilar.papelProfissional}</span>
							<h2 class="dossier-title">{pilar.titulo}</h2>
							<p class="dossier-sub">{pilar.subtitulo}</p>
						</div>
						<span class="dossier-badge">{pilar.credencial}</span>
					</div>

					<p class="dossier-lead">{pilar.resumoExecutivo}</p>

					<div class="services-grid">
						{#each pilar.servicos as servico (servico.nome)}
							<div class="service-box">
								<h3>{servico.nome}</h3>
								<p>{servico.descricao}</p>
								<span class="service-deliv">
									<strong>Entrega:</strong> {servico.entregavel}
								</span>
							</div>
						{/each}
					</div>

					<div class="dossier-footer">
						<div class="diffs-row">
							{#each pilar.diferenciais as dif (dif)}
								<span class="diff-item">✓ {dif}</span>
							{/each}
						</div>

						{#if pilar.slug === 'concursos'}
							<a href="{base}/concursos" class="btn btn-gold">
								Acessar Portal de Concursos →
							</a>
						{:else}
							<a href="#solicitar-proposta" class="btn btn-outline">
								Solicitar Atendimento →
							</a>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</section>

	<section class="section section-white" id="solicitar-proposta" aria-labelledby="proposta-title">
		<div class="container proposal-grid">
			<div class="proposal-info">
				<span class="section-kicker">ATENDIMENTO AO SETOR PÚBLICO</span>
				<h2 id="proposta-title" class="section-title">
					Solicite Diagnóstico ou Proposta Técnica
				</h2>
				<p class="proposal-copy">
					Atendemos Prefeituras Municipais, Câmaras Legislativas, Autarquias, Institutos de Previdência e Consórcios Públicos com propostas técnicas objetivas e adequadas à realidade de cada órgão.
				</p>

				<div class="info-cards">
					<div class="info-card">
						<h3>Consultoria e Simplificação de Rotinas</h3>
						<p>Diagnóstico organizacional, padronização de fluxos internos, apoio em licitações (Lei nº 14.133/2021) e capacitação de servidores.</p>
					</div>
					<div class="info-card">
						<h3>Organização de Concursos e Seleções</h3>
						<p>Planejamento completo de certames públicos e processos seletivos, do levantamento de vagas e inscrições online até a homologação final.</p>
					</div>
				</div>
			</div>

			<div class="proposal-form-wrap">
				{#if protocoloGerado}
					<div class="success-box" role="status">
						<span class="success-tag">SOLICITAÇÃO REGISTRADA</span>
						<h3>Protocolo: {protocoloGerado}</h3>
						<p>
							Prezado(a) <strong>{responsavelNome}</strong> ({nomeOrgao}/{ufOrgao}), recebemos sua solicitação referente a <strong>{escopoInteresse}</strong>.
						</p>
						<p>
							Nossa equipe entrará em contato pelo e-mail <strong>{emailInstitucional}</strong> em até 24 horas úteis.
						</p>
						<button
							type="button"
							class="btn btn-navy"
							onclick={() => {
								protocoloGerado = '';
								descricaoDemanda = '';
							}}
						>
							Enviar Nova Solicitação
						</button>
					</div>
				{:else}
					<form onsubmit={enviarSolicitacaoProposta} class="proposal-form">
						<h3>Formulário para Órgãos Públicos</h3>

						{#if erroProposta}
							<div class="error-banner" role="alert">{erroProposta}</div>
						{/if}

						<div class="row-2">
							<div class="field">
								<label for="tipo-entidade">Tipo de Entidade</label>
								<select id="tipo-entidade" bind:value={tipoEntidade}>
									<option>Prefeitura Municipal</option>
									<option>Câmara Municipal</option>
									<option>Autarquia / Fundação Pública</option>
									<option>Instituto de Previdência (RPPS)</option>
									<option>Consórcio Público Intermunicipal</option>
								</select>
							</div>
							<div class="field">
								<label for="uf-orgao">UF</label>
								<select id="uf-orgao" bind:value={ufOrgao}>
									<option value="MG">MG</option>
									<option value="SP">SP</option>
									<option value="PR">PR</option>
									<option value="RJ">RJ</option>
									<option value="GO">GO</option>
									<option value="BA">BA</option>
									<option value="SC">SC</option>
									<option value="RS">RS</option>
									<option value="DF">DF</option>
									<option value="OUTRO">Outra UF</option>
								</select>
							</div>
						</div>

						<div class="field">
							<label for="nome-orgao">Nome do Órgão Público *</label>
							<input
								id="nome-orgao"
								type="text"
								placeholder="Ex.: Prefeitura Municipal de São José do Vale"
								bind:value={nomeOrgao}
								required
							/>
						</div>

						<div class="row-2">
							<div class="field">
								<label for="resp-nome">Nome do Solicitante *</label>
								<input
									id="resp-nome"
									type="text"
									placeholder="Nome completo"
									bind:value={responsavelNome}
									required
								/>
							</div>
							<div class="field">
								<label for="resp-cargo">Cargo / Função</label>
								<input id="resp-cargo" type="text" bind:value={responsavelCargo} />
							</div>
						</div>

						<div class="row-2">
							<div class="field">
								<label for="email-inst">E-mail Institucional *</label>
								<input
									id="email-inst"
									type="email"
									placeholder="contato@municipio.gov.br"
									bind:value={emailInstitucional}
									required
								/>
							</div>
							<div class="field">
								<label for="tel-inst">Telefone / WhatsApp</label>
								<input
									id="tel-inst"
									type="tel"
									placeholder="(00) 00000-0000"
									bind:value={telefoneContato}
								/>
							</div>
						</div>

						<div class="field">
							<label for="escopo-interesse">Demanda Principal</label>
							<select id="escopo-interesse" bind:value={escopoInteresse}>
								<option>Consultoria em Gestão e Simplificação de Rotinas</option>
								<option>Planejamento de Contratações e Apoio na Lei nº 14.133/2021</option>
								<option>Organização de Concurso Público / Processo Seletivo</option>
								<option>Reestruturação Administrativa e Plano de Cargos</option>
							</select>
						</div>

						<div class="field">
							<label for="desc-demanda">Resumo da Necessidade</label>
							<textarea
								id="desc-demanda"
								rows="3"
								placeholder="Descreva brevemente a necessidade do órgão ou estimativa de vagas..."
								bind:value={descricaoDemanda}
							></textarea>
						</div>

						<label class="check-row">
							<input type="checkbox" bind:checked={aceiteLgpd} />
							<span>
								Concordo com o tratamento dos dados informados para envio de proposta institucional (Lei nº 13.709/2018 — LGPD).
							</span>
						</label>

						<button type="submit" class="btn btn-gold full" disabled={enviandoProposta}>
							{enviandoProposta ? 'Enviando...' : 'Solicitar Proposta Técnica'}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</section>
</div>

<style>
	.atuacao-page {
		background: var(--jba-ivory);
		color: var(--jba-slate-700);
	}

	.page-hero {
		background: linear-gradient(135deg, #06143a 0%, #081c4a 100%);
		color: #ffffff;
		padding: 3.75rem 0 3rem;
		border-bottom: 2px solid #c49539;
	}

	.hero-kicker {
		display: inline-block;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #f9d567;
		margin-bottom: 0.75rem;
	}

	.hero-title {
		font-size: clamp(1.85rem, 3vw, 2.6rem);
		color: #ffffff;
		margin-bottom: 0.85rem;
	}

	.hero-sub {
		max-width: 68ch;
		font-size: 1rem;
		color: rgba(250, 247, 240, 0.84);
		line-height: 1.65;
		margin-bottom: 1.75rem;
	}

	.tabs-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tab-btn {
		padding: 0.55rem 1rem;
		border-radius: 6px;
		border: 1px solid rgba(249, 213, 103, 0.3);
		background: rgba(255, 255, 255, 0.05);
		color: #FAF7F0;
		font-size: 0.84rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.tab-btn:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.tab-btn.active {
		background: #c49539;
		color: #06143a;
		border-color: #c49539;
		font-weight: 700;
	}

	.pillars-stack {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.dossier-card {
		background: #ffffff;
		border: 1px solid var(--jba-border);
		border-radius: 12px;
		padding: 2rem;
	}

	.dossier-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 1.25rem;
		margin-bottom: 1.25rem;
		border-bottom: 1px solid var(--jba-border);
		flex-wrap: wrap;
	}

	.dossier-num {
		display: block;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--jba-gold-600);
		margin-bottom: 0.25rem;
	}

	.dossier-title {
		font-size: 1.45rem;
		margin-bottom: 0.2rem;
	}

	.dossier-sub {
		font-size: 0.9rem;
		color: var(--jba-slate-600);
	}

	.dossier-badge {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--jba-navy-900);
		background: var(--jba-ivory);
		border: 1px solid var(--jba-border);
		padding: 0.35rem 0.75rem;
		border-radius: 6px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.dossier-lead {
		font-size: 0.95rem;
		line-height: 1.65;
		color: var(--jba-slate-700);
		margin-bottom: 1.5rem;
	}

	.services-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.25rem;
		margin-bottom: 1.5rem;
	}

	.service-box {
		background: var(--jba-ivory);
		border: 1px solid var(--jba-border);
		border-radius: 8px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.service-box h3 {
		font-family: var(--font-body);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--jba-navy-900);
	}

	.service-box p {
		font-size: 0.84rem;
		color: var(--jba-slate-600);
		line-height: 1.5;
		flex: 1;
	}

	.service-deliv {
		font-size: 0.78rem;
		color: var(--jba-navy-800);
		padding-top: 0.5rem;
		border-top: 1px solid var(--jba-border);
	}

	.dossier-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--jba-border);
		flex-wrap: wrap;
	}

	.diffs-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.diff-item {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--jba-navy-900);
	}

	/* PROPOSTA */
	.proposal-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		gap: 2.5rem;
		align-items: start;
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

	.section-title {
		font-size: 1.65rem;
		margin-bottom: 0.75rem;
	}

	.proposal-copy {
		font-size: 0.95rem;
		color: var(--jba-slate-600);
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.info-cards {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.info-card {
		background: var(--jba-ivory);
		border: 1px solid var(--jba-border);
		border-left: 3px solid #c49539;
		border-radius: 8px;
		padding: 1.15rem;
	}

	.info-card h3 {
		font-family: var(--font-body);
		font-size: 0.95rem;
		font-weight: 700;
		margin-bottom: 0.3rem;
	}

	.info-card p {
		font-size: 0.84rem;
		color: var(--jba-slate-600);
		line-height: 1.5;
	}

	.proposal-form-wrap {
		background: var(--jba-ivory);
		border: 1px solid var(--jba-border);
		border-radius: 12px;
		padding: 1.75rem;
	}

	.proposal-form h3 {
		font-size: 1.2rem;
		margin-bottom: 1.25rem;
	}

	.row-2 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-bottom: 1rem;
		min-width: 0;
	}

	.field label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--jba-navy-900);
	}

	.field input,
	.field select,
	.field textarea {
		width: 100%;
		max-width: 100%;
		min-width: 0;
		padding: 0.65rem 0.85rem;
		border: 1px solid #CFCBC0;
		border-radius: 6px;
		background: #ffffff;
		font-size: 0.9rem;
		color: var(--jba-slate-900);
	}

	.check-row {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
		font-size: 0.8rem;
		color: var(--jba-slate-600);
		margin-bottom: 1.25rem;
		cursor: pointer;
	}

	.check-row input {
		margin-top: 0.2rem;
	}

	.btn.full {
		width: 100%;
	}

	.error-banner {
		background: var(--jba-danger-bg);
		color: var(--jba-danger);
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.84rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.success-box {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		padding: 1rem 0;
	}

	.success-tag {
		align-self: flex-start;
		background: var(--jba-success-bg);
		color: var(--jba-success);
		font-size: 0.72rem;
		font-weight: 700;
		padding: 0.25rem 0.65rem;
		border-radius: 9999px;
	}

	@media (max-width: 960px) {
		.services-grid,
		.proposal-grid,
		.row-2 {
			grid-template-columns: 1fr;
		}
	}
</style>
