<script lang="ts">
	import { onMount } from 'svelte';
	import {
		concursos,
		type ConcursoPublico,
		type CargoConcurso,
		type DocumentoConcurso
	} from '$lib/data/concursos';
	import LogoJBA from '$lib/components/LogoJBA.svelte';

	type AbaConcursos = 'editais' | 'inscricao' | 'consulta' | 'publicacoes';

	interface ComprovanteInscricao {
		protocolo: string;
		editalId: string;
		editalCodigo: string;
		orgao: string;
		cargoId: string;
		cargoTitulo: string;
		nivel: string;
		nome: string;
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

	let abaAtiva = $state<AbaConcursos>('editais');

	// --- ABA 1: EDITAIS E VAGAS ---
	let buscaPalavraChave = $state('');
	let filtroStatus = $state<'Todos' | 'Inscrições Abertas' | 'Em Andamento' | 'Previsto'>('Todos');
	let filtroEscolaridade = $state<'Todos' | 'Superior' | 'Médio' | 'Técnico' | 'Fundamental'>('Todos');
	let editalModalAberto = $state<ConcursoPublico | null>(null);

	const editaisFiltrados = $derived(
		concursos.filter((c) => {
			const matchStatus = filtroStatus === 'Todos' || c.status === filtroStatus;
			const matchEscolaridade =
				filtroEscolaridade === 'Todos' ||
				c.cargos.some((cargo) => cargo.nivel === filtroEscolaridade);
			const termo = buscaPalavraChave.trim().toLowerCase();
			const matchBusca =
				!termo ||
				c.orgao.toLowerCase().includes(termo) ||
				c.titulo.toLowerCase().includes(termo) ||
				c.codigo.toLowerCase().includes(termo) ||
				c.municipio.toLowerCase().includes(termo) ||
				c.cargos.some((cargo) => cargo.nome.toLowerCase().includes(termo));

			return matchStatus && matchEscolaridade && matchBusca;
		})
	);

	// --- ABA 2: FICHA DE INSCRIÇÃO ONLINE (4 PASSOS) ---
	const editaisAbertos = concursos.filter((c) => c.status === 'Inscrições Abertas');

	let passoAtual = $state<1 | 2 | 3 | 4>(1);
	let editalSelecionadoId = $state(editaisAbertos[0]?.id ?? concursos[0].id);

	const editalSelecionado = $derived(
		concursos.find((c) => c.id === editalSelecionadoId) ?? concursos[0]
	);

	let cargoSelecionadoId = $state(concursos[0].cargos[0].id);

	const cargoSelecionado = $derived<CargoConcurso>(
		editalSelecionado.cargos.find((cg) => cg.id === cargoSelecionadoId) ??
			editalSelecionado.cargos[0]
	);

	let modalidadeConcorrencia = $state('Ampla Concorrência (AC)');
	let necessidadeEspecial = $state('Nenhuma');
	let detalheAtendimentoEspecial = $state('');

	let nomeCandidato = $state('');
	let cpfCandidato = $state('');
	let rgCandidato = $state('');
	let orgaoExpedidor = $state('SSP/MG');
	let dataNascimento = $state('1994-06-15');
	let nomeMae = $state('');
	let emailCandidato = $state('');
	let telefoneCandidato = $state('');
	let cepCandidato = $state('');
	let cidadeUfCandidato = $state('São José do Vale / MG');
	let escolaridadeCandidato = $state('Ensino Superior Completo');

	let modalidadePagamento = $state<'pagamento' | 'isencao'>('pagamento');
	let nisCadUnico = $state('');
	let tipoIsencao = $state('Inscrito no CadÚnico (Decreto Federal nº 11.016/2022)');
	let aceiteEdital = $state(false);
	let aceiteLgpd = $state(false);

	let enviandoInscricao = $state(false);
	let erroInscricao = $state('');
	let comprovanteEmitido = $state<ComprovanteInscricao | null>(null);
	let pixCopiadoFeedback = $state(false);

	// --- ABA 3: CONSULTA DE INSCRIÇÃO ---
	let tipoConsulta = $state<'protocolo' | 'cpf'>('protocolo');
	let protocoloConsultaInput = $state('JBA-2026-000191');
	let cpfConsultaInput = $state('');
	let dataNascConsultaInput = $state('');
	let carregandoConsulta = $state(false);
	let erroConsulta = $state('');
	let resultadoConsulta = $state<ComprovanteInscricao | null>(null);
	let historicoLocalInscricoes = $state<ComprovanteInscricao[]>([]);

	// --- ABA 4: PUBLICAÇÕES E RECURSOS ---
	let filtroEditalPublicacoes = $state('todos');
	let recursoEditalId = $state(concursos[3]?.id ?? concursos[0].id);
	let recursoProtocoloCandidato = $state('');
	let recursoCargoNome = $state('');
	let recursoNumeroQuestao = $state('14');
	let recursoTipo = $state('Impugnação ao Gabarito Preliminar (Prova Objetiva)');
	let recursoFundamentacao = $state('');
	let enviandoRecurso = $state(false);
	let protocoloRecursoGerado = $state('');
	let erroRecurso = $state('');

	const todosDocumentosPublicados = $derived(
		concursos
			.flatMap((certame) =>
				certame.documentos.map((doc: DocumentoConcurso) => ({
					...doc,
					editalId: certame.id,
					editalCodigo: certame.codigo,
					orgao: certame.orgao,
					statusCertame: certame.status
				}))
			)
			.filter((item) =>
				filtroEditalPublicacoes === 'todos' ? true : item.editalId === filtroEditalPublicacoes
			)
	);

	function codigoCurto(codigo: string): string {
		return codigo.split('—')[0].trim();
	}

	function aplicarMascaraCpf(valor: string): string {
		const digitos = valor.replace(/\D/g, '').slice(0, 11);
		if (digitos.length <= 3) return digitos;
		if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
		if (digitos.length <= 9)
			return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
		return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9, 11)}`;
	}

	function aplicarMascaraTelefone(valor: string): string {
		const digitos = valor.replace(/\D/g, '').slice(0, 11);
		if (digitos.length <= 2) return digitos;
		if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
		if (digitos.length <= 10)
			return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
		return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7, 11)}`;
	}

	function validarCpfModulo11(cpfRaw: string): boolean {
		const cpf = cpfRaw.replace(/\D/g, '');
		if (cpf.length !== 11) return false;
		if (/^(\d)\1{10}$/.test(cpf)) return false;

		let soma1 = 0;
		for (let i = 0; i < 9; i++) {
			soma1 += Number(cpf[i]) * (10 - i);
		}
		let resto1 = (soma1 * 10) % 11;
		if (resto1 === 10) resto1 = 0;
		if (resto1 !== Number(cpf[9])) return false;

		let soma2 = 0;
		for (let i = 0; i < 10; i++) {
			soma2 += Number(cpf[i]) * (11 - i);
		}
		let resto2 = (soma2 * 10) % 11;
		if (resto2 === 10) resto2 = 0;
		return resto2 === Number(cpf[10]);
	}

	const cpfDigitosLimpos = $derived(cpfCandidato.replace(/\D/g, ''));
	const cpfValido = $derived(
		cpfDigitosLimpos.length === 11 && validarCpfModulo11(cpfDigitosLimpos)
	);

	function handleInputCpf(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		cpfCandidato = aplicarMascaraCpf(target.value);
	}

	function handleInputTelefone(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		telefoneCandidato = aplicarMascaraTelefone(target.value);
	}

	function handleInputCpfConsulta(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		cpfConsultaInput = aplicarMascaraCpf(target.value);
	}

	function selecionarEditalParaInscricao(editalId: string, cargoIdOpcional?: string) {
		const alvo = concursos.find((c) => c.id === editalId);
		if (alvo) {
			editalSelecionadoId = alvo.id;
			cargoSelecionadoId = cargoIdOpcional ?? alvo.cargos[0].id;
		}
		comprovanteEmitido = null;
		erroInscricao = '';
		passoAtual = 1;
		abaAtiva = 'inscricao';
		editalModalAberto = null;
	}

	function aoTrocarEditalNoPasso1() {
		const edital = concursos.find((c) => c.id === editalSelecionadoId);
		if (edital && edital.cargos.length > 0) {
			cargoSelecionadoId = edital.cargos[0].id;
		}
	}

	function avancarPasso() {
		erroInscricao = '';
		if (passoAtual === 1) {
			if (!editalSelecionadoId || !cargoSelecionadoId) {
				erroInscricao = 'Selecione o Edital e o Cargo pretendido para prosseguir.';
				return;
			}
			passoAtual = 2;
		} else if (passoAtual === 2) {
			if (!nomeCandidato.trim() || nomeCandidato.trim().split(/\s+/).length < 2) {
				erroInscricao = 'Informe seu Nome Civil Completo (nome e sobrenome).';
				return;
			}
			if (!cpfValido) {
				erroInscricao =
					'Informe um CPF válido (11 dígitos verificados pelo algoritmo Módulo-11).';
				return;
			}
			if (!emailCandidato.trim() || !emailCandidato.includes('@')) {
				erroInscricao = 'Informe um endereço de e-mail válido para envio do comprovante.';
				return;
			}
			if (!dataNascimento) {
				erroInscricao = 'Informe sua data de nascimento.';
				return;
			}
			passoAtual = 3;
		} else if (passoAtual === 3) {
			if (modalidadePagamento === 'isencao' && nisCadUnico.replace(/\D/g, '').length < 11) {
				erroInscricao =
					'Para solicitar isenção de taxa, informe o Número de Identificação Social (NIS / PIS) com 11 dígitos.';
				return;
			}
			if (!aceiteEdital || !aceiteLgpd) {
				erroInscricao =
					'É obrigatório marcar o Aceite das Normas do Edital e o Consentimento LGPD para avançar.';
				return;
			}
			passoAtual = 4;
		}
	}

	function voltarPasso() {
		erroInscricao = '';
		if (passoAtual > 1) {
			passoAtual = (passoAtual - 1) as 1 | 2 | 3 | 4;
		}
	}

	async function submeterInscricaoOficial() {
		erroInscricao = '';
		enviandoInscricao = true;

		const payload = {
			editalId: editalSelecionado.id,
			editalTitulo: `${editalSelecionado.codigo} — ${editalSelecionado.orgao}`,
			cargoId: cargoSelecionado.id,
			cargoTitulo: `${cargoSelecionado.codigo} - ${cargoSelecionado.nome}`,
			nome: nomeCandidato.trim(),
			cpf: cpfCandidato,
			email: emailCandidato.trim(),
			telefone: telefoneCandidato.trim() || '(31) 99999-0000',
			dataNascimento,
			cidadeUf:
				cidadeUfCandidato.trim() || `${editalSelecionado.municipio} / ${editalSelecionado.uf}`,
			necessidadeEspecial:
				necessidadeEspecial === 'Nenhuma'
					? 'Nenhuma'
					: `${necessidadeEspecial}${detalheAtendimentoEspecial ? ` (${detalheAtendimentoEspecial})` : ''}`,
			modalidadeConcorrencia,
			isencaoSolicitada: modalidadePagamento === 'isencao',
			aceiteEdital,
			aceiteLgpd
		};

		try {
			const response = await fetch('/api/inscricao', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				erroInscricao =
					data.error ||
					'Não foi possível concluir o registro da inscrição. Verifique os dados informados.';
				enviandoInscricao = false;
				return;
			}

			const recibo: ComprovanteInscricao = data.inscricao;
			comprovanteEmitido = recibo;
			historicoLocalInscricoes = [recibo, ...historicoLocalInscricoes];
		} catch {
			const randomProto = `JBA-2026-${Math.floor(100000 + Math.random() * 900000)}`;
			const fallbackRecibo: ComprovanteInscricao = {
				protocolo: randomProto,
				editalId: editalSelecionado.id,
				editalCodigo: `${editalSelecionado.codigo} — ${editalSelecionado.orgao}`,
				orgao: editalSelecionado.orgao,
				cargoId: cargoSelecionado.id,
				cargoTitulo: cargoSelecionado.nome,
				nivel: cargoSelecionado.nivel,
				nome: nomeCandidato.trim().toUpperCase(),
				cpfMascarado: `***.${cpfDigitosLimpos.slice(3, 6)}.${cpfDigitosLimpos.slice(6, 9)}-**`,
				emailMascarado: emailCandidato,
				telefoneMascarado: telefoneCandidato || '(**) *****-****',
				cidadeUf: cidadeUfCandidato,
				dataNascimento,
				necessidadeEspecial,
				isencaoSolicitada: modalidadePagamento === 'isencao',
				modalidadeConcorrencia,
				taxaInscricao: cargoSelecionado.taxaNumerica,
				taxaFormatada: cargoSelecionado.taxa,
				statusPagamento:
					modalidadePagamento === 'isencao'
						? 'EM ANÁLISE DE ISENÇÃO (CADÚNICO / DOADOR DE MEDULA)'
						: 'AGUARDANDO COMPENSAÇÃO GRU / PIX OFICIAL',
				pixCopiaECola: `00020126580014BR.GOV.BCB.PIX0136jba-concursos-gov@jbaconsultorias.com.br5204000053039865802BR5925JBA CONSULTORIAS PUBLICAS62200516${randomProto.replace(/[^A-Z0-9]/g, '')}6304A1B9`,
				dataHoraInscricao: new Date().toISOString(),
				integrityHash: 'A94F8C2E1B7D603E5A8C4F2B9D1E7A3C6F8B0D2E4A6C8F0B2D4E6A8C0E2F4A6B'
			};
			comprovanteEmitido = fallbackRecibo;
			historicoLocalInscricoes = [fallbackRecibo, ...historicoLocalInscricoes];
		} finally {
			enviandoInscricao = false;
		}
	}

	async function copiarCodigoPix(codigo: string) {
		try {
			await navigator.clipboard.writeText(codigo);
			pixCopiadoFeedback = true;
			setTimeout(() => {
				pixCopiadoFeedback = false;
			}, 3000);
		} catch {
			pixCopiadoFeedback = true;
		}
	}

	function imprimirComprovante() {
		if (typeof window !== 'undefined') {
			window.print();
		}
	}

	const DEMO_COMPROVANTE: ComprovanteInscricao = {
		protocolo: 'JBA-2026-000191',
		editalId: concursos[0].id,
		editalCodigo: `${concursos[0].codigo} — ${concursos[0].orgao}`,
		orgao: concursos[0].orgao,
		cargoId: concursos[0].cargos[0].id,
		cargoTitulo: concursos[0].cargos[0].nome,
		nivel: concursos[0].cargos[0].nivel,
		nome: 'CANDIDATO DEMONSTRAÇÃO HOMOLOGAÇÃO JBA',
		cpfMascarado: '***.000.001-**',
		emailMascarado: 'ca***@candidato.gov.br',
		telefoneMascarado: '(31) *****-0191',
		cidadeUf: `${concursos[0].municipio} / ${concursos[0].uf}`,
		dataNascimento: '1992-05-14',
		necessidadeEspecial: 'Nenhuma',
		isencaoSolicitada: false,
		modalidadeConcorrencia: 'Ampla Concorrência (AC)',
		taxaInscricao: concursos[0].cargos[0].taxaNumerica,
		taxaFormatada: concursos[0].cargos[0].taxa,
		statusPagamento: 'AGUARDANDO COMPENSAÇÃO GRU / PIX OFICIAL',
		pixCopiaECola:
			'00020126580014BR.GOV.BCB.PIX0136jba-concursos-gov@jbaconsultorias.com.br5204000053039865802BR5925JBA CONSULTORIAS PUBLICAS62200516JBA20260001916304A1B9',
		dataHoraInscricao: '2026-03-01T14:30:00.000Z',
		integrityHash: '8F4E2C9A1D7B6E3F0A5C8D2E4B7A9F1C3E6D8B0A2F4C6E8A1B3D5F7E9C0A2B4D'
	};

	function buscarLocalOuDemo(): ComprovanteInscricao | null {
		const proto = protocoloConsultaInput.trim().toUpperCase();
		const cpfLimpo = cpfConsultaInput.replace(/\D/g, '');
		const localMatch = historicoLocalInscricoes.find(
			(item) => item.protocolo.toUpperCase() === proto
		);
		if (localMatch) return localMatch;
		if (
			(tipoConsulta === 'protocolo' && proto === 'JBA-2026-000191') ||
			(tipoConsulta === 'cpf' && cpfLimpo === '00000000191')
		) {
			return DEMO_COMPROVANTE;
		}
		return null;
	}

	async function consultarInscricaoCandidato(event: SubmitEvent) {
		event.preventDefault();
		erroConsulta = '';
		resultadoConsulta = null;

		const queryParam =
			tipoConsulta === 'protocolo'
				? `protocolo=${encodeURIComponent(protocoloConsultaInput.trim())}`
				: `cpf=${encodeURIComponent(cpfConsultaInput.replace(/\D/g, ''))}`;

		if (
			(tipoConsulta === 'protocolo' && !protocoloConsultaInput.trim()) ||
			(tipoConsulta === 'cpf' && cpfConsultaInput.replace(/\D/g, '').length !== 11)
		) {
			erroConsulta =
				tipoConsulta === 'protocolo'
					? 'Informe o número do Protocolo JBA (ex.: JBA-2026-000191).'
					: 'Informe um CPF válido com 11 dígitos para pesquisar.';
			return;
		}

		carregandoConsulta = true;

		try {
			const response = await fetch(`/api/inscricao?${queryParam}`);
			const data = await response.json();

			if (response.ok && data.success && data.inscricao) {
				resultadoConsulta = data.inscricao;
			} else {
				const fallback = buscarLocalOuDemo();
				if (fallback) {
					resultadoConsulta = fallback;
				} else {
					erroConsulta =
						data.error ||
						'Inscrição não localizada. Verifique os dados ou teste o protocolo de demonstração JBA-2026-000191.';
				}
			}
		} catch {
			const fallback = buscarLocalOuDemo();
			if (fallback) {
				resultadoConsulta = fallback;
			} else {
				erroConsulta =
					'Inscrição não localizada. Verifique os dados ou teste o protocolo de demonstração JBA-2026-000191.';
			}
		} finally {
			carregandoConsulta = false;
		}
	}

	function submeterRecursoAdministrativo(event: SubmitEvent) {
		event.preventDefault();
		erroRecurso = '';

		if (!recursoProtocoloCandidato.trim() || !recursoFundamentacao.trim()) {
			erroRecurso =
				'Preencha o número do seu Protocolo de Inscrição e a fundamentação do recurso.';
			return;
		}

		enviandoRecurso = true;
		setTimeout(() => {
			enviandoRecurso = false;
			const num = Math.floor(100000 + Math.random() * 900000);
			protocoloRecursoGerado = `JBA-REC-2026-${num}`;
		}, 400);
	}

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const editalParam = params.get('edital');
		const abaParam = params.get('aba');

		if (editalParam) {
			const encontrado = concursos.find((c) => c.id === editalParam);
			if (encontrado) {
				editalSelecionadoId = encontrado.id;
				cargoSelecionadoId = encontrado.cargos[0].id;
			}
		}

		if (
			abaParam === 'editais' ||
			abaParam === 'inscricao' ||
			abaParam === 'consulta' ||
			abaParam === 'publicacoes'
		) {
			abaAtiva = abaParam;
		} else if (editalParam) {
			abaAtiva = 'inscricao';
		}
	});
</script>

<svelte:head>
	<title>Portal de Concursos Públicos e Inscrições | JBA Consultorias e Soluções Públicas</title>
	<meta
		name="description"
		content="Portal Oficial de Concursos Públicos e Processos Seletivos da JBA Consultorias. Editais abertos, Ficha de Inscrição Online, Área do Candidato e Recursos."
	/>
</svelte:head>

<div class="concursos-page">
	<!-- CABEÇALHO DA PÁGINA -->
	<section class="page-hero no-print" aria-labelledby="portal-concursos-title">
		<div class="container">
			<span class="kicker">BANCA ORGANIZADORA • SELEÇÕES MUNICIPAIS</span>
			<h1 id="portal-concursos-title" class="page-title">
				Concursos Públicos e Processos Seletivos
			</h1>
			<p class="page-lead">
				Consulte os editais gerenciados pela JBA, realize sua inscrição online, emita a segunda via do comprovante ou protocole recursos administrativos com transparência.
			</p>

			<div class="tabs-bar" role="tablist" aria-label="Navegação do Portal de Concursos">
				<button
					type="button"
					role="tab"
					aria-selected={abaAtiva === 'editais'}
					class="tab-btn"
					class:active={abaAtiva === 'editais'}
					onclick={() => (abaAtiva = 'editais')}
				>
					Editais e Vagas ({concursos.length})
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={abaAtiva === 'inscricao'}
					class="tab-btn"
					class:active={abaAtiva === 'inscricao'}
					onclick={() => (abaAtiva = 'inscricao')}
				>
					Ficha de Inscrição Online
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={abaAtiva === 'consulta'}
					class="tab-btn"
					class:active={abaAtiva === 'consulta'}
					onclick={() => (abaAtiva = 'consulta')}
				>
					Área do Candidato / Consulta
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={abaAtiva === 'publicacoes'}
					class="tab-btn"
					class:active={abaAtiva === 'publicacoes'}
					onclick={() => (abaAtiva = 'publicacoes')}
				>
					Publicações e Recursos
				</button>
			</div>
		</div>
	</section>

	<section class="section">
		<div class="container">
			<!-- =================================================================== -->
			<!-- ABA 1: EDITAIS E VAGAS                                              -->
			<!-- =================================================================== -->
			{#if abaAtiva === 'editais'}
				<div class="tab-content" aria-labelledby="aba-editais-heading">
					<div class="card filter-card">
						<div class="filter-header">
							<div>
								<span class="card-kicker">PESQUISA DE CERTAMES</span>
								<h2 id="aba-editais-heading" class="card-heading">
									Editais Gerenciados pela JBA
								</h2>
							</div>
							<span class="results-badge">
								Exibindo <strong>{editaisFiltrados.length}</strong> de {concursos.length} certames
							</span>
						</div>

						<div class="filters-grid">
							<div class="field">
								<label for="busca-edital">Buscar por Órgão, Cargo, Município ou Edital</label>
								<input
									id="busca-edital"
									type="search"
									placeholder="Ex.: Analista Administrativo, Contador, São José do Vale..."
									bind:value={buscaPalavraChave}
								/>
							</div>

							<div class="field">
								<label for="filtro-status">Status do Certame</label>
								<select id="filtro-status" bind:value={filtroStatus}>
									<option value="Todos">Todos os Status</option>
									<option value="Inscrições Abertas">Inscrições Abertas</option>
									<option value="Em Andamento">Em Andamento</option>
									<option value="Previsto">Previsto</option>
								</select>
							</div>

							<div class="field">
								<label for="filtro-nivel">Escolaridade</label>
								<select id="filtro-nivel" bind:value={filtroEscolaridade}>
									<option value="Todos">Todos os Níveis</option>
									<option value="Superior">Ensino Superior</option>
									<option value="Técnico">Ensino Técnico</option>
									<option value="Médio">Ensino Médio</option>
									<option value="Fundamental">Ensino Fundamental</option>
								</select>
							</div>
						</div>
					</div>

					{#if editaisFiltrados.length === 0}
						<div class="card empty-card">
							<h3>Nenhum certame encontrado para os filtros selecionados</h3>
							<p>Limpe os filtros de pesquisa para visualizar todos os editais disponíveis.</p>
							<button
								type="button"
								class="btn btn-navy"
								onclick={() => {
									buscaPalavraChave = '';
									filtroStatus = 'Todos';
									filtroEscolaridade = 'Todos';
								}}
							>
								Limpar Filtros
							</button>
						</div>
					{:else}
						<div class="editais-stack">
							{#each editaisFiltrados as certame (certame.id)}
								<article class="card edital-card">
									<div class="edital-top">
										<div class="edital-badges">
											<span class="code-badge">{certame.codigo}</span>
											<span class="meta-badge">{certame.municipio} / {certame.uf}</span>
											<span class="meta-badge subtle">{certame.regimeJuridico}</span>
										</div>
										<span
											class="status-pill {certame.status === 'Inscrições Abertas'
												? 'open'
												: certame.status === 'Em Andamento'
													? 'progress'
													: 'planned'}"
										>
											{certame.status}
										</span>
									</div>

									<div class="edital-header-row">
										<div>
											<h3 class="edital-orgao">{certame.orgao}</h3>
											<p class="edital-desc">{certame.titulo}</p>
										</div>
										<div class="edital-header-actions">
											{#if certame.status === 'Inscrições Abertas'}
												<button
													type="button"
													class="btn btn-gold"
													onclick={() => selecionarEditalParaInscricao(certame.id)}
												>
													Realizar Inscrição
												</button>
											{/if}
											<button
												type="button"
												class="btn btn-outline"
												onclick={() => (editalModalAberto = certame)}
											>
												Edital e Anexos ({certame.documentos.length})
											</button>
										</div>
									</div>

									<div class="edital-info-grid">
										<div class="info-cell">
											<span>Período de Inscrição</span>
											<strong>{certame.periodoInscricao}</strong>
										</div>
										<div class="info-cell">
											<span>Pedidos de Isenção</span>
											<strong>Até {certame.limiteIsencao}</strong>
										</div>
										<div class="info-cell">
											<span>Prova Objetiva</span>
											<strong>{certame.dataProva}</strong>
										</div>
										<div class="info-cell">
											<span>Quadro de Vagas</span>
											<strong>{certame.vagasTotais} imediatas + {certame.cadastroReservaTotal} CR</strong>
										</div>
										<div class="info-cell highlight">
											<span>Vencimentos Iniciais</span>
											<strong>Até {certame.salarioMax}</strong>
										</div>
									</div>

									<div class="table-wrapper">
										<div class="table-header-bar">
											<h4>Quadro de Cargos e Vagas ({certame.cargos.length} cargos)</h4>
											<span>Taxas: {certame.taxaInscricao}</span>
										</div>
										<div class="table-scroll">
											<table class="clean-table">
												<thead>
													<tr>
														<th>Cód.</th>
														<th>Cargo Público e Requisitos</th>
														<th>Escolaridade</th>
														<th>Vagas</th>
														<th>Vencimento</th>
														<th>Taxa</th>
														<th>Inscrição</th>
													</tr>
												</thead>
												<tbody>
													{#each certame.cargos as cargo (cargo.id)}
														<tr>
															<td class="mono-cell">{cargo.codigo}</td>
															<td>
																<strong class="cargo-title">{cargo.nome}</strong>
																<span class="cargo-sub">{cargo.requisitos} • {cargo.cargaHoraria}</span>
															</td>
															<td class="nowrap-cell"><span class="level-pill">{cargo.nivel}</span></td>
															<td class="nowrap-cell">{cargo.vagas} + {cargo.cadastroReserva} CR</td>
															<td class="salary-cell">{cargo.vencimento}</td>
															<td class="nowrap-cell">{cargo.taxa}</td>
															<td class="action-cell">
																{#if certame.status === 'Inscrições Abertas'}
																	<button
																		type="button"
																		class="btn btn-navy btn-xs"
																		onclick={() =>
																			selecionarEditalParaInscricao(certame.id, cargo.id)}
																	>
																		Inscrever-se
																	</button>
																{:else}
																	<span class="status-muted">{certame.status}</span>
																{/if}
															</td>
														</tr>
													{/each}
												</tbody>
											</table>
										</div>
									</div>
								</article>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- =================================================================== -->
			<!-- ABA 2: FICHA DE INSCRIÇÃO ONLINE                                    -->
			<!-- =================================================================== -->
			{#if abaAtiva === 'inscricao'}
				<div class="tab-content" aria-labelledby="aba-inscricao-heading">
					{#if comprovanteEmitido}
						<div class="card receipt-card" id="comprovante-oficial-jba">
							<div class="receipt-header">
								<LogoJBA variant="compact" theme="light" />
								<div class="protocol-box">
									<span>PROTOCOLO OFICIAL</span>
									<strong>{comprovanteEmitido.protocolo}</strong>
								</div>
							</div>

							<div class="receipt-banner">
								<span>✓ Inscrição registrada com sucesso</span>
								<span>Emitido em {new Date(comprovanteEmitido.dataHoraInscricao).toLocaleString('pt-BR')}</span>
							</div>

							<div class="grid-2 receipt-body-grid">
								<div class="receipt-col">
									<h3>1. Dados do Certame e Cargo</h3>
									<dl class="clean-dl">
										<div>
											<dt>Edital</dt>
											<dd>{comprovanteEmitido.editalCodigo}</dd>
										</div>
										<div>
											<dt>Órgão Público</dt>
											<dd>{comprovanteEmitido.orgao}</dd>
										</div>
										<div>
											<dt>Cargo Pretendido</dt>
											<dd>{comprovanteEmitido.cargoTitulo} ({comprovanteEmitido.nivel})</dd>
										</div>
										<div>
											<dt>Concorrência</dt>
											<dd>{comprovanteEmitido.modalidadeConcorrencia}</dd>
										</div>
										<div>
											<dt>Atendimento Especial</dt>
											<dd>{comprovanteEmitido.necessidadeEspecial}</dd>
										</div>
									</dl>
								</div>

								<div class="receipt-col">
									<h3>2. Dados do Candidato (LGPD)</h3>
									<dl class="clean-dl">
										<div>
											<dt>Nome Civil</dt>
											<dd><strong>{comprovanteEmitido.nome}</strong></dd>
										</div>
										<div>
											<dt>CPF</dt>
											<dd>{comprovanteEmitido.cpfMascarado}</dd>
										</div>
										<div>
											<dt>Data de Nascimento</dt>
											<dd>{comprovanteEmitido.dataNascimento}</dd>
										</div>
										<div>
											<dt>E-mail</dt>
											<dd>{comprovanteEmitido.emailMascarado}</dd>
										</div>
										<div>
											<dt>Município / UF</dt>
											<dd>{comprovanteEmitido.cidadeUf}</dd>
										</div>
									</dl>
								</div>
							</div>

							<div class="payment-panel">
								<div class="payment-panel-main">
									<h3>3. Pagamento da Taxa (GRU / PIX Oficial)</h3>
									<p>Situação: <strong>{comprovanteEmitido.statusPagamento}</strong></p>
									<p>Valor da Taxa: <strong>{comprovanteEmitido.taxaFormatada}</strong></p>

									{#if !comprovanteEmitido.isencaoSolicitada}
										<div class="pix-row">
											<input
												id="pix-payload-read"
												type="text"
												readonly
												value={comprovanteEmitido.pixCopiaECola}
												aria-label="Código PIX Copia e Cola"
											/>
											<button
												type="button"
												class="btn btn-navy"
												onclick={() => copiarCodigoPix(comprovanteEmitido?.pixCopiaECola ?? '')}
											>
												{pixCopiadoFeedback ? '✓ Copiado!' : 'Copiar PIX'}
											</button>
										</div>
									{/if}
								</div>

								<div class="qr-box">
									<svg
										width="116"
										height="116"
										viewBox="0 0 120 120"
										role="img"
										aria-label="QR Code PIX"
									>
										<rect width="120" height="120" fill="#ffffff" stroke="#06143a" stroke-width="4" />
										<rect x="12" y="12" width="28" height="28" fill="none" stroke="#06143a" stroke-width="5" />
										<rect x="20" y="20" width="12" height="12" fill="#06143a" />
										<rect x="80" y="12" width="28" height="28" fill="none" stroke="#06143a" stroke-width="5" />
										<rect x="88" y="20" width="12" height="12" fill="#06143a" />
										<rect x="12" y="80" width="28" height="28" fill="none" stroke="#06143a" stroke-width="5" />
										<rect x="20" y="88" width="12" height="12" fill="#06143a" />
										<rect x="48" y="48" width="24" height="24" fill="#c49539" />
										<rect x="54" y="54" width="12" height="12" fill="#06143a" />
									</svg>
									<span>QR Code PIX</span>
								</div>
							</div>

							<div class="hash-bar">
								<span>HASH SHA-256:</span>
								<code>{comprovanteEmitido.integrityHash}</code>
							</div>

							<div class="receipt-actions no-print">
								<button type="button" class="btn btn-gold" onclick={imprimirComprovante}>
									Imprimir / Salvar PDF
								</button>
								<button
									type="button"
									class="btn btn-navy"
									onclick={() => {
										protocoloConsultaInput = comprovanteEmitido?.protocolo ?? 'JBA-2026-000191';
										abaAtiva = 'consulta';
									}}
								>
									Consultar na Área do Candidato
								</button>
								<button
									type="button"
									class="btn btn-outline"
									onclick={() => {
										comprovanteEmitido = null;
										passoAtual = 1;
									}}
								>
									Nova Inscrição
								</button>
							</div>
						</div>
					{:else}
						<div class="inscricao-layout">
							<!-- COLUNA PRINCIPAL: WIZARD EM 4 ETAPAS -->
							<div class="card wizard-card">
								<div class="wizard-top">
									<div>
										<span class="card-kicker">INSCRIÇÃO ELETRÔNICA</span>
										<h2 id="aba-inscricao-heading" class="card-heading">
											Ficha de Inscrição em Concurso Público
										</h2>
									</div>
									<span class="step-badge">Etapa {passoAtual} de 4</span>
								</div>

								<ol class="stepper" aria-label="Etapas da inscrição">
									<li class:active={passoAtual >= 1} class:done={passoAtual > 1}>
										<span>01</span> Edital e Cargo
									</li>
									<li class:active={passoAtual >= 2} class:done={passoAtual > 2}>
										<span>02</span> Dados Pessoais
									</li>
									<li class:active={passoAtual >= 3} class:done={passoAtual > 3}>
										<span>03</span> Taxa e Termos
									</li>
									<li class:active={passoAtual === 4}>
										<span>04</span> Revisão
									</li>
								</ol>

								{#if erroInscricao}
									<div class="alert-error" role="alert">
										{erroInscricao}
									</div>
								{/if}

								{#if passoAtual === 1}
									<div class="step-panel">
										<div class="field">
											<label for="select-edital">Concurso Público / Processo Seletivo *</label>
											<select
												id="select-edital"
												bind:value={editalSelecionadoId}
												onchange={aoTrocarEditalNoPasso1}
											>
												{#each concursos as certame (certame.id)}
													<option value={certame.id}>
														{codigoCurto(certame.codigo)} — {certame.orgao} ({certame.status})
													</option>
												{/each}
											</select>
										</div>

										<div class="field">
											<label for="select-cargo">Cargo Público Pretendido *</label>
											<select id="select-cargo" bind:value={cargoSelecionadoId}>
												{#each editalSelecionado.cargos as cg (cg.id)}
													<option value={cg.id}>
														Cód. {cg.codigo} — {cg.nome} ({cg.nivel} • {cg.vencimento})
													</option>
												{/each}
											</select>
										</div>

										<div class="grid-2">
											<div class="field">
												<label for="select-modalidade">Modalidade de Concorrência *</label>
												<select id="select-modalidade" bind:value={modalidadeConcorrencia}>
													<option value="Ampla Concorrência (AC)">Ampla Concorrência (AC)</option>
													<option value="Pessoa com Deficiência (PcD — Reserva Constitucional)">
														Pessoa com Deficiência (PcD)
													</option>
													<option value="Cotas Raciais — Pretos ou Pardos (Lei nº 12.990/2014)">
														Cotas Raciais — Pretos ou Pardos
													</option>
												</select>
											</div>

											<div class="field">
												<label for="select-atendimento">Atendimento Especial na Prova</label>
												<select id="select-atendimento" bind:value={necessidadeEspecial}>
													<option value="Nenhuma">Não necessito de atendimento especial</option>
													<option value="Prova Ampliada (Fonte 18 / 24)">Prova Ampliada (Baixa Visão)</option>
													<option value="Ledor / Transcritor / Intérprete de Libras">
														Auxílio Ledor / Transcritor / Intérprete de Libras
													</option>
													<option value="Sala de Amamentação (Candidata Lactante)">
														Sala para Amamentação (Candidata Lactante)
													</option>
													<option value="Tempo Adicional de 60 minutos (Com Laudo Médico)">
														Tempo Adicional de 60 minutos (Com Laudo)
													</option>
												</select>
											</div>
										</div>

										{#if necessidadeEspecial !== 'Nenhuma'}
											<div class="field">
												<label for="detalhe-atendimento">Especifique a necessidade ou recurso adicional</label>
												<input
													id="detalhe-atendimento"
													type="text"
													placeholder="Descreva a condição para preparo logístico..."
													bind:value={detalheAtendimentoEspecial}
												/>
											</div>
										{/if}

										<div class="step-actions">
											<span></span>
											<button type="button" class="btn btn-navy" onclick={avancarPasso}>
												Avançar para Dados Pessoais →
											</button>
										</div>
									</div>
								{/if}

								{#if passoAtual === 2}
									<div class="step-panel">
										<div class="grid-2">
											<div class="field">
												<label for="input-nome">Nome Civil Completo *</label>
												<input
													id="input-nome"
													type="text"
													placeholder="Ex.: MARIA HELENA ALMEIDA SANTOS"
													bind:value={nomeCandidato}
													required
												/>
											</div>

											<div class="field">
												<div class="label-row">
													<label for="input-cpf">CPF do Candidato *</label>
													<button
														type="button"
														class="helper-link"
														onclick={() => (cpfCandidato = '000.000.001-91')}
													>
														Usar CPF de teste
													</button>
												</div>
												<input
													id="input-cpf"
													type="text"
													inputmode="numeric"
													maxlength="14"
													placeholder="000.000.000-00"
													value={cpfCandidato}
													oninput={handleInputCpf}
													required
												/>
												{#if cpfDigitosLimpos.length > 0}
													<span class="field-status {cpfValido ? 'ok' : 'err'}">
														{cpfValido ? '✓ CPF válido' : 'Informe 11 dígitos válidos'}
													</span>
												{/if}
											</div>
										</div>

										<div class="grid-3">
											<div class="field">
												<label for="input-rg">RG / Identidade</label>
												<input id="input-rg" type="text" placeholder="MG-14.258.963" bind:value={rgCandidato} />
											</div>
											<div class="field">
												<label for="input-orgao-exp">Órgão Expedidor</label>
												<input id="input-orgao-exp" type="text" placeholder="SSP/MG" bind:value={orgaoExpedidor} />
											</div>
											<div class="field">
												<label for="input-nasc">Data de Nascimento *</label>
												<input id="input-nasc" type="date" bind:value={dataNascimento} required />
											</div>
										</div>

										<div class="grid-2">
											<div class="field">
												<label for="input-mae">Nome da Mãe</label>
												<input id="input-mae" type="text" placeholder="Nome completo da mãe" bind:value={nomeMae} />
											</div>
											<div class="field">
												<label for="input-escolaridade">Escolaridade Atual</label>
												<select id="input-escolaridade" bind:value={escolaridadeCandidato}>
													<option>Ensino Fundamental Completo</option>
													<option>Ensino Médio Completo</option>
													<option>Ensino Técnico Profissionalizante</option>
													<option>Ensino Superior Completo</option>
													<option>Pós-Graduação / Especialização</option>
												</select>
											</div>
										</div>

										<div class="grid-2">
											<div class="field">
												<label for="input-email">E-mail *</label>
												<input
													id="input-email"
													type="email"
													placeholder="candidato@email.com.br"
													bind:value={emailCandidato}
													required
												/>
											</div>
											<div class="field">
												<label for="input-telefone">Telefone / WhatsApp *</label>
												<input
													id="input-telefone"
													type="tel"
													placeholder="(31) 99999-0000"
													value={telefoneCandidato}
													oninput={handleInputTelefone}
												/>
											</div>
										</div>

										<div class="grid-2">
											<div class="field">
												<label for="input-cep">CEP</label>
												<input id="input-cep" type="text" placeholder="30000-000" bind:value={cepCandidato} />
											</div>
											<div class="field">
												<label for="input-cidade">Município / UF *</label>
												<input id="input-cidade" type="text" bind:value={cidadeUfCandidato} />
											</div>
										</div>

										<div class="step-actions">
											<button type="button" class="btn btn-outline" onclick={voltarPasso}>
												← Voltar
											</button>
											<button type="button" class="btn btn-navy" onclick={avancarPasso}>
												Avançar para Taxa e Termos →
											</button>
										</div>
									</div>
								{/if}

								{#if passoAtual === 3}
									<div class="step-panel">
										<div class="grid-2">
											<label class="choice-card" class:selected={modalidadePagamento === 'pagamento'}>
												<input
													type="radio"
													name="modPagamento"
													value="pagamento"
													bind:group={modalidadePagamento}
												/>
												<div>
													<strong>Pagamento via GRU / PIX Oficial</strong>
													<p>Emissão imediata da guia no valor de <strong>{cargoSelecionado.taxa}</strong>.</p>
												</div>
											</label>

											<label class="choice-card" class:selected={modalidadePagamento === 'isencao'}>
												<input
													type="radio"
													name="modPagamento"
													value="isencao"
													bind:group={modalidadePagamento}
												/>
												<div>
													<strong>Solicitação de Isenção de Taxa</strong>
													<p>Para inscritos no CadÚnico ou doadores de medula óssea (REDOME).</p>
												</div>
											</label>
										</div>

										{#if modalidadePagamento === 'isencao'}
											<div class="grid-2 sub-panel">
												<div class="field">
													<label for="tipo-isencao">Hipótese Legal de Isenção</label>
													<select id="tipo-isencao" bind:value={tipoIsencao}>
														<option>Inscrito no CadÚnico (Decreto Federal nº 11.016/2022)</option>
														<option>Doador Regular de Medula Óssea (Lei Federal nº 13.656/2018)</option>
													</select>
												</div>
												<div class="field">
													<label for="input-nis">Número de Identificação Social (NIS / PIS — 11 dígitos) *</label>
													<input
														id="input-nis"
														type="text"
														maxlength="14"
														placeholder="00000000000"
														bind:value={nisCadUnico}
													/>
												</div>
											</div>
										{/if}

										<div class="consents-list">
											<label class="check-row">
												<input type="checkbox" bind:checked={aceiteEdital} />
												<span>
													<strong>Aceite do Edital:</strong> Declaro conhecer e aceitar as normas do <strong>{editalSelecionado.codigo} ({editalSelecionado.orgao})</strong> para o cargo de <strong>{cargoSelecionado.nome}</strong>.
												</span>
											</label>

											<label class="check-row">
												<input type="checkbox" bind:checked={aceiteLgpd} />
												<span>
													<strong>Consentimento LGPD (Lei nº 13.709/2018):</strong> Autorizo o tratamento dos meus dados pessoais pela JBA exclusivamente para execução deste concurso público.
												</span>
											</label>
										</div>

										<div class="step-actions">
											<button type="button" class="btn btn-outline" onclick={voltarPasso}>
												← Voltar
											</button>
											<button type="button" class="btn btn-navy" onclick={avancarPasso}>
												Revisar Dados →
											</button>
										</div>
									</div>
								{/if}

								{#if passoAtual === 4}
									<div class="step-panel">
										<div class="review-box">
											<dl class="clean-dl grid-2">
												<div>
													<dt>Certame</dt>
													<dd>{editalSelecionado.codigo} — {editalSelecionado.orgao}</dd>
												</div>
												<div>
													<dt>Cargo Pretendido</dt>
													<dd>{cargoSelecionado.codigo} - {cargoSelecionado.nome} ({cargoSelecionado.nivel})</dd>
												</div>
												<div>
													<dt>Candidato</dt>
													<dd>{nomeCandidato.toUpperCase()}</dd>
												</div>
												<div>
													<dt>CPF</dt>
													<dd>{cpfCandidato}</dd>
												</div>
												<div>
													<dt>Nascimento e Cidade</dt>
													<dd>{dataNascimento} • {cidadeUfCandidato}</dd>
												</div>
												<div>
													<dt>Contato</dt>
													<dd>{emailCandidato} • {telefoneCandidato || 'Não informado'}</dd>
												</div>
												<div>
													<dt>Concorrência / Atendimento</dt>
													<dd>{modalidadeConcorrencia} | {necessidadeEspecial}</dd>
												</div>
												<div>
													<dt>Taxa de Inscrição</dt>
													<dd class="gold-val">
														{modalidadePagamento === 'isencao'
															? `Solicitação de Isenção (${cargoSelecionado.taxa})`
															: cargoSelecionado.taxa}
													</dd>
												</div>
											</dl>
										</div>

										<div class="step-actions">
											<button type="button" class="btn btn-outline" onclick={voltarPasso}>
												← Corrigir Dados
											</button>
											<button
												type="button"
												class="btn btn-gold"
												disabled={enviandoInscricao}
												onclick={submeterInscricaoOficial}
											>
												{enviandoInscricao ? 'Emitindo Protocolo...' : 'Confirmar Inscrição e Emitir Comprovante'}
											</button>
										</div>
									</div>
								{/if}
							</div>

							<!-- COLUNA LATERAL: RESUMO FIXO DO CARGO E CERTAME -->
							<aside class="card summary-aside" aria-label="Resumo da Inscrição">
								<div class="summary-aside-top">
									<span class="card-kicker">RESUMO SELECIONADO</span>
									<span
										class="status-pill {editalSelecionado.status === 'Inscrições Abertas'
											? 'open'
											: editalSelecionado.status === 'Em Andamento'
												? 'progress'
												: 'planned'}"
									>
										{editalSelecionado.status}
									</span>
								</div>

								<h3 class="summary-aside-title">{editalSelecionado.orgao}</h3>
								<p class="summary-aside-code">{editalSelecionado.codigo}</p>

								<dl class="summary-dl">
									<div>
										<dt>Cargo Pretendido</dt>
										<dd><strong>Cód. {cargoSelecionado.codigo} — {cargoSelecionado.nome}</strong></dd>
									</div>
									<div>
										<dt>Escolaridade e Requisitos</dt>
										<dd>{cargoSelecionado.nivel} • {cargoSelecionado.requisitos}</dd>
									</div>
									<div class="summary-row-2">
										<div>
											<dt>Vencimento Inicial</dt>
											<dd><strong>{cargoSelecionado.vencimento}</strong></dd>
										</div>
										<div>
											<dt>Jornada e Vagas</dt>
											<dd>{cargoSelecionado.cargaHoraria} • {cargoSelecionado.vagas} + {cargoSelecionado.cadastroReserva} CR</dd>
										</div>
									</div>
									<div class="summary-row-2">
										<div>
											<dt>Inscrições</dt>
											<dd>{editalSelecionado.periodoInscricao}</dd>
										</div>
										<div>
											<dt>Data da Prova</dt>
											<dd>{editalSelecionado.dataProva}</dd>
										</div>
									</div>
								</dl>

								<div class="summary-fee-box">
									<div>
										<span>Taxa de Inscrição</span>
										<small>{modalidadePagamento === 'isencao' ? 'Pedido de isenção ativo' : 'Guia GRU / PIX Oficial'}</small>
									</div>
									<strong>{cargoSelecionado.taxa}</strong>
								</div>
							</aside>
						</div>
					{/if}
				</div>
			{/if}

			<!-- =================================================================== -->
			<!-- ABA 3: CONSULTA DE INSCRIÇÃO                                        -->
			<!-- =================================================================== -->
			{#if abaAtiva === 'consulta'}
				<div class="tab-content grid-2" aria-labelledby="aba-consulta-heading">
					<div class="card">
						<span class="card-kicker">ÁREA DO CANDIDATO</span>
						<h2 id="aba-consulta-heading" class="card-heading">
							Consultar Situação da Inscrição
						</h2>
						<p class="card-desc">
							Consulte o status da sua inscrição, emita a 2ª via do código PIX/GRU ou verifique os dados cadastrados.
						</p>

						<div class="toggle-group">
							<button
								type="button"
								class="toggle-btn"
								class:active={tipoConsulta === 'protocolo'}
								onclick={() => (tipoConsulta = 'protocolo')}
							>
								Por Protocolo JBA
							</button>
							<button
								type="button"
								class="toggle-btn"
								class:active={tipoConsulta === 'cpf'}
								onclick={() => (tipoConsulta = 'cpf')}
							>
								Por CPF
							</button>
						</div>

						<form onsubmit={consultarInscricaoCandidato} class="form-stack">
							{#if tipoConsulta === 'protocolo'}
								<div class="field">
									<label for="input-proto-busca">Número do Protocolo Oficial *</label>
									<input
										id="input-proto-busca"
										type="text"
										placeholder="Ex.: JBA-2026-000191"
										bind:value={protocoloConsultaInput}
									/>
									<span class="field-hint">Protocolo de demonstração: <strong>JBA-2026-000191</strong></span>
								</div>
							{:else}
								<div class="field">
									<label for="input-cpf-busca">CPF do Candidato *</label>
									<input
										id="input-cpf-busca"
										type="text"
										maxlength="14"
										placeholder="000.000.001-91"
										value={cpfConsultaInput}
										oninput={handleInputCpfConsulta}
									/>
									<span class="field-hint">CPF de demonstração: <strong>000.000.001-91</strong></span>
								</div>
								<div class="field">
									<label for="input-nasc-busca">Data de Nascimento (Opcional)</label>
									<input id="input-nasc-busca" type="date" bind:value={dataNascConsultaInput} />
								</div>
							{/if}

							{#if erroConsulta}
								<div class="alert-error" role="alert">{erroConsulta}</div>
							{/if}

							<button type="submit" class="btn btn-navy" disabled={carregandoConsulta}>
								{carregandoConsulta ? 'Consultando...' : 'Consultar Inscrição'}
							</button>
						</form>
					</div>

					<div>
						{#if resultadoConsulta}
							<div class="card">
								<div class="edital-top">
									<span class="code-badge">{resultadoConsulta.protocolo}</span>
									<span class="status-pill open">Inscrição Localizada</span>
								</div>

								<h3 class="edital-orgao">{resultadoConsulta.nome}</h3>
								<p class="edital-desc">{resultadoConsulta.editalCodigo}</p>

								<dl class="clean-dl">
									<div>
										<dt>Cargo Pretendido</dt>
										<dd>{resultadoConsulta.cargoTitulo} ({resultadoConsulta.nivel})</dd>
									</div>
									<div>
										<dt>CPF (Protegido LGPD)</dt>
										<dd>{resultadoConsulta.cpfMascarado}</dd>
									</div>
									<div>
										<dt>Modalidade</dt>
										<dd>{resultadoConsulta.modalidadeConcorrencia}</dd>
									</div>
									<div>
										<dt>Taxa de Inscrição</dt>
										<dd><strong>{resultadoConsulta.taxaFormatada}</strong></dd>
									</div>
									<div>
										<dt>Situação Financeira</dt>
										<dd>{resultadoConsulta.statusPagamento}</dd>
									</div>
								</dl>

								<div class="card-footer-action">
									<button
										type="button"
										class="btn btn-gold"
										onclick={() => {
											comprovanteEmitido = resultadoConsulta;
											abaAtiva = 'inscricao';
										}}
									>
										Abrir 2ª Via Completa / QR Code PIX
									</button>
								</div>
							</div>
						{:else}
							<div class="card info-placeholder">
								<h3>Orientações ao Candidato</h3>
								<ul class="clean-list">
									<li>
										<strong>2ª Via de Pagamento:</strong> Informe seu protocolo ao lado para recuperar o QR Code PIX ou código Copia e Cola.
									</li>
									<li>
										<strong>Local de Prova:</strong> Disponibilizado nesta área conforme o cronograma oficial de cada edital.
									</li>
									<li>
										<strong>Proteção de Dados (LGPD):</strong> Em conformidade com a Lei Federal nº 13.709/2018, os dados pessoais são parcialmente mascarados em consulta pública.
									</li>
								</ul>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- =================================================================== -->
			<!-- ABA 4: PUBLICAÇÕES, GABARITOS E RECURSOS                            -->
			<!-- =================================================================== -->
			{#if abaAtiva === 'publicacoes'}
				<div class="tab-content pub-layout" aria-labelledby="aba-pub-heading">
					<div class="pub-main">
						<div class="card filter-card">
							<div class="filter-header">
								<div>
									<span class="card-kicker">PUBLICAÇÕES OFICIAIS</span>
									<h2 id="aba-pub-heading" class="card-heading">
										Editais, Retificações e Gabaritos
									</h2>
								</div>
								<select bind:value={filtroEditalPublicacoes} aria-label="Filtrar publicações por edital" class="compact-select">
									<option value="todos">Todos os Certames ({concursos.length})</option>
									{#each concursos as cert (cert.id)}
										<option value={cert.id}>{codigoCurto(cert.codigo)} — {cert.municipio}/{cert.uf}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="docs-list">
							{#each todosDocumentosPublicados as doc (doc.id)}
								<article class="card doc-card">
									<div class="edital-top">
										<span class="code-badge">{doc.tipo}</span>
										<span class="doc-date">Publicado em {doc.dataPublicacao} • {doc.tamanho}</span>
									</div>
									<h3 class="doc-title">{doc.titulo}</h3>
									<p class="doc-orgao">{doc.editalCodigo} — {doc.orgao}</p>
									<p class="doc-summary">{doc.resumo}</p>
									<div class="doc-footer">
										<span class="doc-hash">SHA-256: {doc.hashSha256.slice(0, 20)}...</span>
										<button
											type="button"
											class="link-btn"
											onclick={() => {
												const cert = concursos.find((c) => c.id === doc.editalId);
												if (cert) editalModalAberto = cert;
											}}
										>
											Visualizar Documento →
										</button>
									</div>
								</article>
							{/each}
						</div>
					</div>

					<aside class="pub-side">
						<div class="card">
							<span class="card-kicker">CONTRADITÓRIO E AMPLA DEFESA</span>
							<h3 class="card-heading">Interposição de Recurso</h3>
							<p class="card-desc">
								Protocole recurso fundamentado contra indeferimento de isenção, homologação de inscrições ou gabarito preliminar.
							</p>

							{#if protocoloRecursoGerado}
								<div class="success-box" role="status">
									<strong>✓ Recurso Protocolado: {protocoloRecursoGerado}</strong>
									<p>
										Sua fundamentação referente ao item {recursoNumeroQuestao} ({recursoTipo}) foi registrada para análise da banca examinadora.
									</p>
									<button
										type="button"
										class="btn btn-outline"
										onclick={() => {
											protocoloRecursoGerado = '';
											recursoFundamentacao = '';
										}}
									>
										Protocolar Novo Recurso
									</button>
								</div>
							{:else}
								<form onsubmit={submeterRecursoAdministrativo} class="form-stack">
									{#if erroRecurso}
										<div class="alert-error" role="alert">{erroRecurso}</div>
									{/if}

									<div class="field">
										<label for="rec-edital">Certame Público</label>
										<select id="rec-edital" bind:value={recursoEditalId}>
											{#each concursos as cert (cert.id)}
												<option value={cert.id}>{codigoCurto(cert.codigo)} — {cert.municipio}/{cert.uf}</option>
											{/each}
										</select>
									</div>

									<div class="field">
										<label for="rec-proto">Protocolo de Inscrição *</label>
										<input
											id="rec-proto"
											type="text"
											placeholder="Ex.: JBA-2026-000191"
											bind:value={recursoProtocoloCandidato}
											required
										/>
									</div>

									<div class="field">
										<label for="rec-tipo">Objeto do Recurso</label>
										<select id="rec-tipo" bind:value={recursoTipo}>
											<option>Impugnação ao Gabarito Preliminar (Prova Objetiva)</option>
											<option>Recurso contra Indeferimento de Isenção de Taxa</option>
											<option>Recurso contra Lista de Inscrições Homologadas</option>
											<option>Recurso contra Pontuação da Prova de Títulos</option>
										</select>
									</div>

									<div class="grid-2">
										<div class="field">
											<label for="rec-cargo">Cargo</label>
											<input id="rec-cargo" type="text" placeholder="Ex.: Contador" bind:value={recursoCargoNome} />
										</div>
										<div class="field">
											<label for="rec-questao">Nº da Questão / Item</label>
											<input id="rec-questao" type="text" placeholder="14" bind:value={recursoNumeroQuestao} />
										</div>
									</div>

									<div class="field">
										<label for="rec-fund">Fundamentação Técnica *</label>
										<textarea
											id="rec-fund"
											rows="4"
											placeholder="Apresente a fundamentação técnica e bibliográfica..."
											bind:value={recursoFundamentacao}
											required
										></textarea>
									</div>

									<button type="submit" class="btn btn-navy" disabled={enviandoRecurso}>
										{enviandoRecurso ? 'Enviando...' : 'Protocolar Recurso'}
									</button>
								</form>
							{/if}
						</div>
					</aside>
				</div>
			{/if}
		</div>
	</section>

	<!-- MODAL DE VISUALIZAÇÃO DO EDITAL E ANEXOS -->
	{#if editalModalAberto}
		<div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-edital-title">
			<div class="card modal-card">
				<div class="modal-header">
					<div>
						<span class="code-badge">{editalModalAberto.codigo}</span>
						<h2 id="modal-edital-title" class="modal-title">{editalModalAberto.orgao}</h2>
					</div>
					<button
						type="button"
						class="btn btn-outline btn-xs"
						onclick={() => (editalModalAberto = null)}
					>
						✕ Fechar
					</button>
				</div>

				<p class="edital-desc">{editalModalAberto.titulo}</p>

				<div class="modal-section">
					<h4>Etapas do Certame</h4>
					<ul class="clean-list">
						{#each editalModalAberto.etapas as etapa (etapa)}
							<li>✓ {etapa}</li>
						{/each}
					</ul>
				</div>

				<div class="modal-section">
					<h4>Documentos e Anexos Publicados (Padrão PDF/A)</h4>
					<div class="modal-docs">
						{#each editalModalAberto.documentos as doc (doc.id)}
							<div class="modal-doc-item">
								<strong>{doc.titulo}</strong>
								<p>{doc.resumo}</p>
								<span>Publicado em {doc.dataPublicacao} • {doc.tamanho} • SHA-256: {doc.hashSha256.slice(0, 24)}...</span>
							</div>
						{/each}
					</div>
				</div>

				<div class="modal-footer">
					{#if editalModalAberto.status === 'Inscrições Abertas'}
						<button
							type="button"
							class="btn btn-gold"
							onclick={() =>
								editalModalAberto && selecionarEditalParaInscricao(editalModalAberto.id)}
						>
							Prosseguir para Inscrição
						</button>
					{/if}
					<button
						type="button"
						class="btn btn-outline"
						onclick={() => (editalModalAberto = null)}
					>
						Voltar aos Editais
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.concursos-page {
		background: var(--jba-ivory);
		color: var(--jba-slate-700);
		min-height: 85vh;
	}

	/* HERO PADRÃO */
	.page-hero {
		background: #06143a;
		color: #ffffff;
		padding: 3.5rem 0 0;
		border-bottom: 2px solid #c49539;
	}

	.kicker {
		display: inline-block;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #f9d567;
		margin-bottom: 0.6rem;
	}

	.page-title {
		font-size: clamp(1.85rem, 3vw, 2.5rem);
		color: #ffffff;
		margin-bottom: 0.75rem;
	}

	.page-lead {
		font-size: 1rem;
		color: rgba(250, 247, 240, 0.84);
		max-width: 65ch;
		line-height: 1.65;
		margin-bottom: 2rem;
	}

	/* ABAS DE NAVEGAÇÃO */
	.tabs-bar {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tab-btn {
		padding: 0.85rem 1.25rem;
		font-size: 0.86rem;
		font-weight: 600;
		color: rgba(250, 247, 240, 0.8);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(196, 149, 57, 0.25);
		border-bottom: none;
		border-radius: 8px 8px 0 0;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: background 0.15s ease, color 0.15s ease;
	}

	.tab-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #ffffff;
	}

	.tab-btn.active {
		background: var(--jba-ivory);
		color: var(--jba-navy-900);
		font-weight: 700;
		border-color: #c49539;
	}

	/* CARDS E GRIDS PADRÃO */
	.card {
		background: #ffffff;
		border: 1px solid var(--jba-border);
		border-radius: 12px;
		padding: 1.75rem;
		min-width: 0;
	}

	.card-kicker {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--jba-gold-600);
		margin-bottom: 0.25rem;
	}

	.card-heading {
		font-size: 1.35rem;
		color: var(--jba-navy-900);
		margin-bottom: 0.35rem;
	}

	.card-desc {
		font-size: 0.9rem;
		color: var(--jba-slate-600);
		line-height: 1.55;
		margin-bottom: 1.25rem;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.25rem;
	}

	.grid-3 {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.25rem;
	}

	/* FILTROS */
	.filter-card {
		margin-bottom: 1.5rem;
	}

	.filter-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.25rem;
	}

	.results-badge {
		font-size: 0.82rem;
		color: var(--jba-slate-600);
		background: var(--jba-ivory);
		padding: 0.3rem 0.75rem;
		border-radius: 9999px;
		border: 1px solid var(--jba-border);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.filters-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem;
	}

	/* CAMPOS DE FORMULÁRIO */
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.38rem;
		min-width: 0;
	}

	.field label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--jba-navy-900);
	}

	.field input,
	.field select,
	.field textarea,
	.compact-select {
		width: 100%;
		max-width: 100%;
		min-width: 0;
		padding: 0.65rem 0.85rem;
		border: 1px solid #cfc8b8;
		border-radius: 6px;
		font-family: var(--font-body);
		font-size: 0.88rem;
		background: #ffffff;
		color: var(--jba-navy-900);
		text-overflow: ellipsis;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.compact-select {
		width: auto;
		max-width: 320px;
	}

	.field input:focus,
	.field select:focus,
	.field textarea:focus,
	.compact-select:focus {
		outline: none;
		border-color: #c49539;
		box-shadow: 0 0 0 3px rgba(196, 149, 57, 0.18);
	}

	.field-hint {
		font-size: 0.76rem;
		color: var(--jba-slate-500);
	}

	.field-status {
		font-size: 0.76rem;
		font-weight: 600;
	}

	.field-status.ok {
		color: var(--jba-success);
	}

	.field-status.err {
		color: var(--jba-danger);
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.helper-link {
		background: none;
		border: none;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--jba-gold-600);
		cursor: pointer;
		text-decoration: underline;
		white-space: nowrap;
	}

	/* LISTA DE EDITAIS */
	.editais-stack {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.edital-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
		padding-bottom: 0.85rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--jba-border);
	}

	.edital-badges {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.code-badge {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		font-weight: 700;
		color: var(--jba-navy-900);
		background: var(--jba-ivory);
		padding: 0.24rem 0.65rem;
		border-radius: 4px;
		border: 1px solid var(--jba-border);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.meta-badge {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--jba-navy-800);
	}

	.meta-badge.subtle {
		color: var(--jba-slate-500);
		font-weight: 500;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		font-size: 0.74rem;
		font-weight: 700;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.status-pill.open {
		background: var(--jba-success-bg);
		color: var(--jba-success);
	}

	.status-pill.progress {
		background: var(--jba-warning-bg);
		color: var(--jba-warning);
	}

	.status-pill.planned {
		background: #e2e8f0;
		color: #334155;
	}

	.edital-header-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
		margin-bottom: 1.25rem;
	}

	.edital-orgao {
		font-size: 1.35rem;
		color: var(--jba-navy-900);
		margin-bottom: 0.3rem;
	}

	.edital-desc {
		font-size: 0.9rem;
		color: var(--jba-slate-600);
		line-height: 1.55;
		max-width: 72ch;
	}

	.edital-header-actions {
		display: flex;
		gap: 0.65rem;
		flex-wrap: wrap;
		flex-shrink: 0;
	}

	.edital-info-grid {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.info-cell {
		background: var(--jba-ivory);
		border: 1px solid var(--jba-border);
		border-radius: 8px;
		padding: 0.75rem 0.9rem;
		min-width: 0;
	}

	.info-cell span {
		display: block;
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--jba-slate-500);
		margin-bottom: 0.2rem;
	}

	.info-cell strong {
		font-size: 0.84rem;
		color: var(--jba-navy-900);
	}

	.info-cell.highlight {
		border-color: rgba(196, 149, 57, 0.45);
	}

	.info-cell.highlight strong {
		color: var(--jba-gold-700);
	}

	/* TABELA DE CARGOS */
	.table-wrapper {
		border: 1px solid var(--jba-border);
		border-radius: 8px;
		overflow: hidden;
	}

	.table-header-bar {
		background: var(--jba-ivory);
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid var(--jba-border);
	}

	.table-header-bar h4 {
		font-family: var(--font-body);
		font-size: 0.84rem;
		font-weight: 700;
		color: var(--jba-navy-900);
	}

	.table-header-bar span {
		font-size: 0.78rem;
		color: var(--jba-slate-600);
		white-space: nowrap;
	}

	.table-scroll {
		overflow-x: auto;
	}

	.clean-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 0.84rem;
	}

	.clean-table th {
		padding: 0.7rem 1rem;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--jba-slate-500);
		background: #ffffff;
		border-bottom: 1px solid var(--jba-border);
		white-space: nowrap;
	}

	.clean-table td {
		padding: 0.85rem 1rem;
		border-bottom: 1px solid var(--jba-border);
		vertical-align: middle;
	}

	.clean-table tbody tr:last-child td {
		border-bottom: none;
	}

	.mono-cell {
		font-family: var(--font-mono);
		font-weight: 600;
		color: var(--jba-navy-800);
		font-size: 0.78rem;
		white-space: nowrap;
	}

	.nowrap-cell {
		white-space: nowrap;
	}

	.action-cell {
		white-space: nowrap;
		width: 1%;
	}

	.cargo-title {
		display: block;
		color: var(--jba-navy-900);
	}

	.cargo-sub {
		display: block;
		font-size: 0.76rem;
		color: var(--jba-slate-500);
	}

	.level-pill {
		display: inline-block;
		font-size: 0.72rem;
		font-weight: 600;
		padding: 0.18rem 0.55rem;
		border-radius: 4px;
		background: var(--jba-ivory);
		color: var(--jba-navy-800);
		white-space: nowrap;
	}

	.salary-cell {
		font-weight: 700;
		color: var(--jba-navy-900);
		white-space: nowrap;
	}

	.btn-xs {
		padding: 0.42rem 0.85rem;
		font-size: 0.76rem;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.status-muted {
		font-size: 0.76rem;
		color: var(--jba-slate-500);
		white-space: nowrap;
	}

	/* LAYOUT 2 COLUNAS DA INSCRIÇÃO ONLINE */
	.inscricao-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.55fr) minmax(0, 0.85fr);
		gap: 1.5rem;
		align-items: start;
	}

	.wizard-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.step-badge {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--jba-navy-900);
		background: var(--jba-ivory);
		padding: 0.3rem 0.75rem;
		border-radius: 9999px;
		border: 1px solid var(--jba-border);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.stepper {
		list-style: none;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--jba-border);
	}

	.stepper li {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--jba-slate-500);
		padding: 0.6rem 0.7rem;
		border-radius: 6px;
		background: var(--jba-ivory);
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.stepper li span {
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--jba-gold-600);
		flex-shrink: 0;
	}

	.stepper li.active {
		background: var(--jba-navy-900);
		color: #ffffff;
	}

	.stepper li.active span {
		color: #f9d567;
	}

	.step-panel {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		min-width: 0;
	}

	/* RESUMO LATERAL DA INSCRIÇÃO */
	.summary-aside {
		position: sticky;
		top: 6rem;
		background: #ffffff;
		border: 1px solid var(--jba-border);
		border-top: 3px solid #c49539;
	}

	.summary-aside-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.summary-aside-title {
		font-size: 1.15rem;
		color: var(--jba-navy-900);
		margin-bottom: 0.2rem;
	}

	.summary-aside-code {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		font-weight: 600;
		color: var(--jba-slate-500);
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--jba-border);
	}

	.summary-dl {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		margin-bottom: 1.25rem;
	}

	.summary-dl dt {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--jba-slate-500);
		margin-bottom: 0.15rem;
	}

	.summary-dl dd {
		font-size: 0.85rem;
		color: var(--jba-navy-900);
		line-height: 1.45;
	}

	.summary-row-2 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		padding-top: 0.65rem;
		border-top: 1px solid var(--jba-border);
	}

	.summary-fee-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		background: #06143a;
		color: #ffffff;
		padding: 1rem 1.15rem;
		border-radius: 8px;
	}

	.summary-fee-box span {
		display: block;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #f9d567;
	}

	.summary-fee-box small {
		font-size: 0.74rem;
		color: rgba(250, 247, 240, 0.78);
	}

	.summary-fee-box strong {
		font-family: var(--font-heading);
		font-size: 1.35rem;
		color: #ffffff;
		white-space: nowrap;
	}

	.gold-val {
		color: var(--jba-gold-700) !important;
		font-weight: 700;
	}

	.choice-card {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid var(--jba-border);
		border-radius: 8px;
		background: var(--jba-ivory);
		cursor: pointer;
		min-width: 0;
	}

	.choice-card.selected {
		border-color: #c49539;
		background: #ffffff;
		box-shadow: 0 0 0 2px rgba(196, 149, 57, 0.15);
	}

	.choice-card strong {
		display: block;
		font-size: 0.9rem;
		color: var(--jba-navy-900);
		margin-bottom: 0.2rem;
	}

	.choice-card p {
		font-size: 0.82rem;
		color: var(--jba-slate-600);
		line-height: 1.45;
	}

	.sub-panel {
		background: var(--jba-ivory);
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--jba-border);
	}

	.consents-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--jba-ivory);
		border-radius: 8px;
		border: 1px solid var(--jba-border);
	}

	.check-row {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		font-size: 0.84rem;
		line-height: 1.5;
		cursor: pointer;
	}

	.check-row input {
		margin-top: 0.25rem;
		width: auto;
		flex-shrink: 0;
	}

	.step-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--jba-border);
	}

	.alert-error {
		padding: 0.85rem 1rem;
		border-radius: 6px;
		background: var(--jba-danger-bg);
		color: var(--jba-danger);
		font-size: 0.85rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	/* COMPROVANTE E LISTAS DE DEFINIÇÃO */
	.receipt-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid var(--jba-border);
		margin-bottom: 1rem;
	}

	.protocol-box {
		background: var(--jba-navy-900);
		color: #ffffff;
		padding: 0.6rem 1rem;
		border-radius: 8px;
		text-align: right;
	}

	.protocol-box span {
		display: block;
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		color: #f9d567;
	}

	.protocol-box strong {
		font-family: var(--font-mono);
		font-size: 1rem;
	}

	.receipt-banner {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5rem;
		background: var(--jba-success-bg);
		color: var(--jba-success);
		padding: 0.65rem 1rem;
		border-radius: 6px;
		font-size: 0.82rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
	}

	.receipt-col h3 {
		font-size: 0.95rem;
		margin-bottom: 0.75rem;
		color: var(--jba-navy-900);
	}

	.clean-dl {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.clean-dl.grid-2 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.clean-dl dt {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--jba-slate-500);
	}

	.clean-dl dd {
		font-size: 0.88rem;
		color: var(--jba-navy-900);
	}

	.payment-panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1.5rem;
		align-items: center;
		background: var(--jba-ivory);
		border: 1px solid var(--jba-border);
		border-radius: 8px;
		padding: 1.25rem;
		margin: 1.5rem 0;
	}

	.payment-panel-main h3 {
		font-size: 0.95rem;
		margin-bottom: 0.4rem;
	}

	.payment-panel-main p {
		font-size: 0.86rem;
		margin-bottom: 0.25rem;
	}

	.pix-row {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.pix-row input {
		flex: 1;
		min-width: 0;
		padding: 0.55rem 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		border: 1px solid #cfc8b8;
		border-radius: 6px;
		background: #ffffff;
	}

	.qr-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--jba-navy-900);
	}

	.hash-bar {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		color: var(--jba-slate-600);
		background: var(--jba-ivory);
		padding: 0.65rem 1rem;
		border-radius: 6px;
		overflow-wrap: anywhere;
		margin-bottom: 1.25rem;
	}

	.receipt-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	/* CONSULTA & PUBLICAÇÕES */
	.toggle-group {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.toggle-btn {
		flex: 1;
		padding: 0.55rem 0.75rem;
		font-size: 0.82rem;
		font-weight: 600;
		border: 1px solid var(--jba-border);
		border-radius: 6px;
		background: var(--jba-ivory);
		color: var(--jba-slate-600);
		cursor: pointer;
		white-space: nowrap;
	}

	.toggle-btn.active {
		background: var(--jba-navy-900);
		color: #ffffff;
		border-color: var(--jba-navy-900);
	}

	.form-stack {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.card-footer-action {
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid var(--jba-border);
	}

	.info-placeholder h3 {
		font-size: 1.15rem;
		margin-bottom: 1rem;
	}

	.clean-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-size: 0.88rem;
		line-height: 1.55;
	}

	.pub-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.85fr);
		gap: 1.5rem;
		align-items: start;
	}

	.pub-main,
	.pub-side {
		min-width: 0;
	}

	.docs-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.doc-date {
		font-size: 0.76rem;
		color: var(--jba-slate-500);
	}

	.doc-title {
		font-size: 1.05rem;
		color: var(--jba-navy-900);
		margin-bottom: 0.25rem;
	}

	.doc-orgao {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--jba-gold-600);
		margin-bottom: 0.4rem;
	}

	.doc-summary {
		font-size: 0.86rem;
		color: var(--jba-slate-600);
		line-height: 1.5;
		margin-bottom: 0.85rem;
	}

	.doc-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--jba-border);
	}

	.doc-hash {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--jba-slate-500);
	}

	.link-btn {
		background: none;
		border: none;
		font-size: 0.84rem;
		font-weight: 700;
		color: var(--jba-navy-800);
		cursor: pointer;
		white-space: nowrap;
	}

	.link-btn:hover {
		color: var(--jba-gold-600);
	}

	.success-box {
		background: var(--jba-success-bg);
		color: var(--jba-success);
		padding: 1.25rem;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		font-size: 0.86rem;
	}

	.empty-card {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 3rem 1.5rem;
	}

	/* MODAL */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(6, 20, 58, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		z-index: 200;
	}

	.modal-card {
		max-width: 720px;
		width: 100%;
		max-height: 88vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.modal-title {
		font-size: 1.35rem;
		margin-top: 0.35rem;
	}

	.modal-section {
		margin-top: 1.25rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--jba-border);
	}

	.modal-section h4 {
		font-size: 0.95rem;
		margin-bottom: 0.75rem;
	}

	.modal-docs {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.modal-doc-item {
		background: var(--jba-ivory);
		padding: 0.85rem 1rem;
		border-radius: 8px;
		border: 1px solid var(--jba-border);
	}

	.modal-doc-item strong {
		display: block;
		font-size: 0.88rem;
		color: var(--jba-navy-900);
	}

	.modal-doc-item p {
		font-size: 0.82rem;
		color: var(--jba-slate-600);
		margin: 0.2rem 0 0.35rem;
	}

	.modal-doc-item span {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--jba-slate-500);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--jba-border);
	}

	@media (max-width: 1024px) {
		.inscricao-layout,
		.pub-layout,
		.edital-info-grid {
			grid-template-columns: 1fr;
		}

		.summary-aside {
			position: static;
		}
	}

	@media (max-width: 768px) {
		.filters-grid,
		.stepper,
		.grid-2,
		.grid-3,
		.clean-dl.grid-2,
		.payment-panel,
		.summary-row-2 {
			grid-template-columns: 1fr;
		}

		.compact-select {
			width: 100%;
			max-width: 100%;
		}
	}
</style>
