<script lang="ts">
	const diretrizesLgpd = [
		{
			numero: '01',
			tema: 'Finalidade Institucional e Editais',
			descricao:
				'Os dados pessoais de candidatos inscritos e servidores públicos são tratados exclusivamente para execução de certames oficiais e atividades de consultoria.'
		},
		{
			numero: '02',
			tema: 'Minimização e Mascaramento de CPF',
			descricao:
				'Nas consultas públicas de protocolo e listagens eletrônicas, o CPF é exibido de forma mascarada (***.000.000-**), protegendo a privacidade do titular.'
		},
		{
			numero: '03',
			tema: 'Segurança e Autenticidade',
			descricao:
				'Os comprovantes de inscrição possuem código verificador SHA-256 e validação de integridade, garantindo rastreabilidade e transparência.'
		}
	];

	let canalSelecionado = $state<
		| 'Atendimento ao Candidato (Concursos)'
		| 'Consultoria para Órgãos Públicos'
		| 'Ouvidoria e Transparência'
		| 'Solicitação LGPD / Proteção de Dados'
	>('Atendimento ao Candidato (Concursos)');
	let modoAnonimoOuvidoria = $state(false);
	let nomeRemetente = $state('');
	let emailRemetente = $state('');
	let telefoneRemetente = $state('');
	let orgaoOuEditalRef = $state('');
	let mensagemConteudo = $state('');
	let cienciaLgpdContato = $state(false);

	let enviandoManifestacao = $state(false);
	let erroManifestacao = $state('');
	let protocoloOuvidoria = $state('');

	function submeterManifestacao(event: SubmitEvent) {
		event.preventDefault();
		erroManifestacao = '';

		if (!modoAnonimoOuvidoria && (!nomeRemetente.trim() || !emailRemetente.trim())) {
			erroManifestacao =
				'Informe Nome e E-mail para retorno, ou marque a opção de relato anônimo.';
			return;
		}

		if (!mensagemConteudo.trim() || mensagemConteudo.trim().length < 10) {
			erroManifestacao = 'Descreva sua mensagem com pelo menos 10 caracteres.';
			return;
		}

		if (!cienciaLgpdContato) {
			erroManifestacao = 'Confirme a ciência quanto ao registro de protocolo.';
			return;
		}

		enviandoManifestacao = true;
		setTimeout(() => {
			enviandoManifestacao = false;
			const num = Math.floor(100000 + Math.random() * 900000);
			protocoloOuvidoria = `JBA-ATD-2026-${num}`;
		}, 300);
	}
</script>

<svelte:head>
	<title>Transparência, LGPD e Contato | JBA Consultorias e Soluções Públicas</title>
	<meta
		name="description"
		content="Transparência Institucional, Conformidade LGPD, Ouvidoria e Canais de Contato da JBA Consultorias e Soluções Públicas."
	/>
</svelte:head>

<div class="transparencia-page">
	<section class="page-hero" aria-labelledby="transp-title">
		<div class="container">
			<span class="hero-kicker">SIMPLIFICANDO ROTINAS, OTIMIZANDO RESULTADOS</span>
			<h1 id="transp-title" class="hero-title">
				Transparência, LGPD e Canais de Contato
			</h1>
			<p class="hero-sub">
				Canal direto da <strong>JBA Consultorias e Soluções Públicas</strong> para atendimento a gestores municipais, candidatos de concursos públicos e cidadãos.
			</p>
		</div>
	</section>

	<section class="section" aria-labelledby="lgpd-heading">
		<div class="container">
			<div class="section-head">
				<span class="section-kicker">LEI Nº 13.709/2018 (LGPD)</span>
				<h2 id="lgpd-heading" class="section-title">Proteção de Dados e Governança</h2>
			</div>

			<div class="lgpd-grid">
				{#each diretrizesLgpd as item (item.numero)}
					<article class="lgpd-card">
						<span class="lgpd-num">{item.numero}</span>
						<h3>{item.tema}</h3>
						<p>{item.descricao}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section class="section section-white" id="ouvidoria" aria-labelledby="contato-heading">
		<div class="container contact-grid">
			<div class="channels-col">
				<span class="section-kicker">CANAIS DE ATENDIMENTO</span>
				<h2 id="contato-heading" class="section-title">Fale com a JBA</h2>
				<p class="contact-lead">
					Escolha o canal correspondente à sua necessidade para atendimento ágil pela nossa equipe.
				</p>

				<div class="channel-list">
					<div class="channel-item">
						<h3>Consultoria para Órgãos Públicos</h3>
						<p>Atendimento a Prefeituras, Câmaras e Autarquias sobre simplificação de rotinas, gestão e novos projetos.</p>
						<span>contato@jbaconsultorias.com.br</span>
					</div>

					<div class="channel-item">
						<h3>Suporte ao Candidato (Concursos)</h3>
						<p>Dúvidas sobre inscrições, comprovantes, isenção de taxa e locais de prova.</p>
						<span>concursos@jbaconsultorias.com.br</span>
					</div>

					<div class="channel-item">
						<h3>Ouvidoria e Proteção de Dados (LGPD)</h3>
						<p>Manifestações institucionais, sugestões e requisições de titulares de dados.</p>
						<span>ouvidoria@jbaconsultorias.com.br</span>
					</div>
				</div>
			</div>

			<div class="form-col">
				{#if protocoloOuvidoria}
					<div class="receipt-box" role="status">
						<span class="receipt-tag">MENSAGEM REGISTRADA</span>
						<h3>Protocolo: {protocoloOuvidoria}</h3>
						<p>
							Sua solicitação para <strong>{canalSelecionado}</strong> foi registrada com sucesso.
						</p>
						{#if !modoAnonimoOuvidoria}
							<p>Enviaremos o retorno para <strong>{emailRemetente}</strong> em até 48 horas úteis.</p>
						{/if}
						<button
							type="button"
							class="btn btn-navy"
							onclick={() => {
								protocoloOuvidoria = '';
								mensagemConteudo = '';
							}}
						>
							Nova Mensagem
						</button>
					</div>
				{:else}
					<form onsubmit={submeterManifestacao} class="contact-form">
						<h3>Enviar Mensagem ou Manifestação</h3>

						{#if erroManifestacao}
							<div class="error-banner" role="alert">{erroManifestacao}</div>
						{/if}

						<div class="field">
							<label for="select-canal">Assunto / Canal *</label>
							<select id="select-canal" bind:value={canalSelecionado}>
								<option value="Atendimento ao Candidato (Concursos)">
									Atendimento ao Candidato (Concursos Públicos)
								</option>
								<option value="Consultoria para Órgãos Públicos">
									Consultoria para Órgãos Públicos (Prefeituras / Câmaras)
								</option>
								<option value="Ouvidoria e Transparência">
									Ouvidoria e Transparência
								</option>
								<option value="Solicitação LGPD / Proteção de Dados">
									Solicitação LGPD / Proteção de Dados
								</option>
							</select>
						</div>

						{#if canalSelecionado === 'Ouvidoria e Transparência'}
							<label class="check-row">
								<input type="checkbox" bind:checked={modoAnonimoOuvidoria} />
								<span>Realizar manifestação anônima</span>
							</label>
						{/if}

						{#if !modoAnonimoOuvidoria}
							<div class="row-2">
								<div class="field">
									<label for="ouv-nome">Nome Completo *</label>
									<input
										id="ouv-nome"
										type="text"
										placeholder="Seu nome"
										bind:value={nomeRemetente}
									/>
								</div>
								<div class="field">
									<label for="ouv-email">E-mail *</label>
									<input
										id="ouv-email"
										type="email"
										placeholder="seu.email@exemplo.com"
										bind:value={emailRemetente}
									/>
								</div>
							</div>

							<div class="row-2">
								<div class="field">
									<label for="ouv-tel">Telefone / WhatsApp</label>
									<input
										id="ouv-tel"
										type="tel"
										placeholder="(00) 00000-0000"
										bind:value={telefoneRemetente}
									/>
								</div>
								<div class="field">
									<label for="ouv-ref">Órgão ou Edital de Referência</label>
									<input
										id="ouv-ref"
										type="text"
										placeholder="Ex.: Edital 001/2026 ou Prefeitura..."
										bind:value={orgaoOuEditalRef}
									/>
								</div>
							</div>
						{/if}

						<div class="field">
							<label for="ouv-msg">Mensagem *</label>
							<textarea
								id="ouv-msg"
								rows="4"
								placeholder="Descreva sua solicitação de forma objetiva..."
								bind:value={mensagemConteudo}
								required
							></textarea>
						</div>

						<label class="check-row">
							<input type="checkbox" bind:checked={cienciaLgpdContato} />
							<span>
								Estou ciente do tratamento destes dados para atendimento da solicitação nos termos da LGPD (Lei nº 13.709/2018).
							</span>
						</label>

						<button type="submit" class="btn btn-gold full" disabled={enviandoManifestacao}>
							{enviandoManifestacao ? 'Enviando...' : 'Enviar Mensagem'}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</section>
</div>

<style>
	.transparencia-page {
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
		font-size: clamp(1.85rem, 3vw, 2.5rem);
		color: #ffffff;
		margin-bottom: 0.75rem;
	}

	.hero-sub {
		max-width: 64ch;
		font-size: 1rem;
		color: rgba(250, 247, 240, 0.84);
		line-height: 1.65;
	}

	.section-head {
		margin-bottom: 2rem;
	}

	.section-kicker {
		display: block;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--jba-gold-600);
		margin-bottom: 0.35rem;
	}

	.section-title {
		font-size: 1.65rem;
	}

	.lgpd-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.5rem;
	}

	.lgpd-card {
		background: #ffffff;
		border: 1px solid var(--jba-border);
		border-radius: 12px;
		padding: 1.75rem;
	}

	.lgpd-num {
		display: inline-block;
		font-family: var(--font-heading);
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--jba-gold-600);
		margin-bottom: 0.5rem;
	}

	.lgpd-card h3 {
		font-size: 1.1rem;
		margin-bottom: 0.5rem;
	}

	.lgpd-card p {
		font-size: 0.88rem;
		color: var(--jba-slate-600);
		line-height: 1.6;
	}

	.contact-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		gap: 2.5rem;
		align-items: start;
	}

	.contact-lead {
		font-size: 0.95rem;
		color: var(--jba-slate-600);
		margin: 0.65rem 0 1.5rem;
	}

	.channel-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.channel-item {
		background: var(--jba-ivory);
		border: 1px solid var(--jba-border);
		border-left: 3px solid #c49539;
		border-radius: 8px;
		padding: 1.15rem;
	}

	.channel-item h3 {
		font-family: var(--font-body);
		font-size: 0.95rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
	}

	.channel-item p {
		font-size: 0.84rem;
		color: var(--jba-slate-600);
		margin-bottom: 0.4rem;
	}

	.channel-item span {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--jba-navy-900);
	}

	.form-col {
		background: var(--jba-ivory);
		border: 1px solid var(--jba-border);
		border-radius: 12px;
		padding: 1.75rem;
	}

	.contact-form h3 {
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
		margin-bottom: 1.15rem;
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

	.receipt-box {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.receipt-tag {
		align-self: flex-start;
		background: var(--jba-success-bg);
		color: var(--jba-success);
		font-size: 0.72rem;
		font-weight: 700;
		padding: 0.25rem 0.65rem;
		border-radius: 9999px;
	}

	@media (max-width: 960px) {
		.lgpd-grid,
		.contact-grid,
		.row-2 {
			grid-template-columns: 1fr;
		}
	}
</style>
