export type NivelEscolaridade = 'Superior' | 'Médio' | 'Técnico' | 'Fundamental';

export type StatusConcurso = 'Inscrições Abertas' | 'Em Andamento' | 'Previsto' | 'Encerrado';

export interface CargoConcurso {
	id: string;
	codigo: string;
	nome: string;
	nivel: NivelEscolaridade;
	vagas: number;
	cadastroReserva: number;
	vencimento: string;
	vencimentoNumerico: number;
	cargaHoraria: string;
	taxa: string;
	taxaNumerica: number;
	requisitos: string;
}

export interface DocumentoConcurso {
	id: string;
	titulo: string;
	tipo: 'Edital de Abertura' | 'Retificação' | 'Cronograma' | 'Conteúdo Programático' | 'Gabarito Preliminar' | 'Homologação' | 'Comunicado Oficial';
	dataPublicacao: string;
	tamanho: string;
	hashSha256: string;
	resumo: string;
}

export interface ConcursoPublico {
	id: string;
	codigo: string;
	orgao: string;
	uf: string;
	municipio: string;
	titulo: string;
	subtitulo: string;
	status: StatusConcurso;
	periodoInscricao: string;
	inicioInscricao: string;
	fimInscricao: string;
	limiteIsencao: string;
	dataProva: string;
	vagasTotais: number;
	cadastroReservaTotal: number;
	salarioMax: string;
	taxaInscricao: string;
	banca: string;
	regimeJuridico: string;
	cargos: CargoConcurso[];
	documentos: DocumentoConcurso[];
	etapas: string[];
}

export interface PilarAtuacao {
	id: string;
	slug: 'gestao' | 'governanca' | 'concursos';
	numero: string;
	titulo: string;
	subtitulo: string;
	papelProfissional: string;
	credencial: string;
	resumoExecutivo: string;
	baseLegal: string[];
	servicos: {
		nome: string;
		descricao: string;
		entregavel: string;
	}[];
	diferenciais: string[];
}

export interface IndicadorInstitucional {
	id: string;
	valor: string;
	rotulo: string;
	detalhe: string;
	icone: string;
}

export interface ParecerPublicacao {
	id: string;
	codigo: string;
	categoria: 'Gestão & Rotinas' | 'Licitações & Contratos' | 'Concursos Públicos';
	titulo: string;
	data: string;
	autor: string;
	credencialAutor: string;
	resumo: string;
	fundamentacaoLegal: string;
	tempoLeitura: string;
}

export const indicadores: IndicadorInstitucional[] = [
	{
		id: 'ind-municipios',
		valor: '+85',
		rotulo: 'Órgãos Públicos Atendidos',
		detalhe: 'Consultoria técnica para Prefeituras, Câmaras Municipais, Autarquias e Consórcios.',
		icone: 'building'
	},
	{
		id: 'ind-concursos',
		valor: '+140',
		rotulo: 'Concursos e Seleções Realizados',
		detalhe: 'Planejamento, inscrições online e aplicação segura de certames públicos.',
		icone: 'shield-check'
	},
	{
		id: 'ind-rotinas',
		valor: '100%',
		rotulo: 'Rotinas Padronizadas',
		detalhe: 'Fluxos administrativos simplificados, manuais práticos e capacitação de equipes.',
		icone: 'scale'
	},
	{
		id: 'ind-candidatos',
		valor: '+250 mil',
		rotulo: 'Candidatos Inscritos',
		detalhe: 'Atendimento transparente ao cidadão, emissão de comprovantes e proteção LGPD.',
		icone: 'users'
	}
];

export const pilaresAtuacao: PilarAtuacao[] = [
	{
		id: 'pilar-gestao',
		slug: 'gestao',
		numero: '01',
		titulo: 'Consultoria em Gestão Pública & Rotinas',
		subtitulo: 'Simplificação de Processos, Organização Administrativa e Apoio Técnico',
		papelProfissional: 'Consultoria em Gestão e Modernização Municipal',
		credencial: 'Gestão Pública • Padronização de Fluxos • Eficiência Operacional',
		resumoExecutivo:
			'Apoio prático ao gestor e aos servidores públicos para destravar o dia a dia da administração. Mapeamos processos internos, eliminamos retrabalho e estruturamos rotinas claras para secretarias, autarquias e câmaras municipais.',
		baseLegal: [
			'Princípio da Eficiência Administrativa (Art. 37 da CF/88)',
			'Desburocratização e Governo Digital (Lei nº 14.129/2021)',
			'Organização de Quadros de Pessoal e Planos de Cargos'
		],
		servicos: [
			{
				nome: 'Mapeamento e Simplificação de Rotinas Administrativas',
				descricao:
					'Diagnóstico dos setores, redução de etapas desnecessárias e criação de fluxos de trabalho objetivos para agilizar o atendimento interno.',
				entregavel: 'Manual de Rotinas e Procedimentos Operacionais Padrão (POP).'
			},
			{
				nome: 'Reestruturação Organizacional e Planos de Cargos (PCCV)',
				descricao:
					'Dimensionamento da força de trabalho, atualização de atribuições de cargos e organização da estrutura de secretarias.',
				entregavel: 'Minuta técnica de estrutura administrativa e quadro de pessoal.'
			},
			{
				nome: 'Capacitação e Treinamento de Equipes Públicas',
				descricao:
					'Oficinas práticas in loco para servidores sobre instrução de processos, redação oficial e rotinas de gestão.',
				entregavel: 'Material de apoio prático e certificação da equipe.'
			}
		],
		diferenciais: [
			'Linguagem simples e foco na prática diária do servidor',
			'Acompanhamento próximo na implantação das melhorias',
			'Soluções sob medida para o porte de cada município'
		]
	},
	{
		id: 'pilar-governanca',
		slug: 'governanca',
		numero: '02',
		titulo: 'Planejamento, Contratações & Governança',
		subtitulo: 'Apoio em Licitações (Lei 14.133/21), Controle Interno e Transparência',
		papelProfissional: 'Assessoria Técnica em Compras Públicas e Controle',
		credencial: 'Lei nº 14.133/2021 • Planejamento Anual • Controle Interno',
		resumoExecutivo:
			'Orientação técnica para estruturar o setor de compras, planejar contratações anuais e fortalecer o controle interno municipal, garantindo entregas no prazo e segurança nas decisões administrativas.',
		baseLegal: [
			'Lei Federal nº 14.133/2021 (Licitações e Contratos Administrativos)',
			'Lei de Acesso à Informação — LAI (Lei nº 12.527/2011)',
			'Lei Geral de Proteção de Dados no Setor Público (Lei nº 13.709/2018)'
		],
		servicos: [
			{
				nome: 'Implantação Prática da Lei nº 14.133/2021',
				descricao:
					'Estruturação da fase preparatória das compras, elaboração do Plano de Contratações Anual (PCA) e padronização de documentos.',
				entregavel: 'Modelos de Estudo Técnico Preliminar (ETP) e Termo de Referência (TR).'
			},
			{
				nome: 'Apoio ao Controle Interno e Governança',
				descricao:
					'Criação de checklists de conferência processual, acompanhamento de metas e melhoria dos índices de transparência ativa.',
				entregavel: 'Roteiros de controle preventivo e relatórios de acompanhamento.'
			},
			{
				nome: 'Adequação Institucional à LGPD e Ouvidoria',
				descricao:
					'Organização do fluxo de atendimento ao cidadão, proteção de dados pessoais nos setores públicos e canal de transparência.',
				entregavel: 'Plano de adequação e guia prático de proteção de dados.'
			}
		],
		diferenciais: [
			'Modelos padronizados que economizam tempo das comissões',
			'Redução de erros formais e atrasos nas compras públicas',
			'Suporte técnico contínuo às equipes de planejamento'
		]
	},
	{
		id: 'pilar-concursos',
		slug: 'concursos',
		numero: '03',
		titulo: 'Concursos Públicos & Processos Seletivos',
		subtitulo: 'Planejamento, Inscrições Online e Execução Completa de Certames',
		papelProfissional: 'Banca Organizadora de Concursos e Seleções Públicas',
		credencial: 'Banca Examinadora • Inscrições Online • Logística Segura',
		resumoExecutivo:
			'Realização periódica de Concursos Públicos e Processos Seletivos para Prefeituras, Câmaras, Autarquias e Consórcios. Cuidamos de todas as etapas — do levantamento de vagas e publicação do edital à aplicação das provas e homologação final.',
		baseLegal: [
			'Constituição Federal — Art. 37, II e IX (Investidura e Seleções Públicas)',
			'Lei Federal nº 14.133/2021 — Art. 75, XV (Banca Examinadora)',
			'Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018)'
		],
		servicos: [
			{
				nome: 'Organização Integral de Concursos Públicos',
				descricao:
					'Elaboração do edital, portal de inscrições eletrônicas, elaboração de provas inéditas, logística de aplicação e leitura óptica.',
				entregavel: 'Resultado final homologado e relatório completo do certame.'
			},
			{
				nome: 'Processos Seletivos Simplificados e Temporários',
				descricao:
					'Seleções ágeis para atendimento a demandas da Saúde, Educação, Assistência Social e programas específicos.',
				entregavel: 'Processo seletivo ágil com cronograma otimizado.'
			},
			{
				nome: 'Portal do Candidato e Gestão de Recursos',
				descricao:
					'Ambiente online intuitivo para inscrições, pagamento via PIX/GRU, emissão de comprovante com protocolo e análise de recursos.',
				entregavel: 'Atendimento digital transparente ao candidato.'
			}
		],
		diferenciais: [
			'Portal de inscrições simples, rápido e acessível pelo celular',
			'Comprovante de inscrição autenticado e consulta imediata de protocolo',
			'Organização logística rigorosa e cronograma cumprido à risca'
		]
	}
];

export const concursos: ConcursoPublico[] = [
	{
		id: 'edital-001-2026-pmsjv',
		codigo: 'EDITAL Nº 001/2026 — PMSJV',
		orgao: 'Prefeitura Municipal de São José do Vale',
		uf: 'MG',
		municipio: 'São José do Vale',
		titulo: 'Concurso Público para Provimento Efetivo do Quadro Geral, Saúde e Educação',
		subtitulo: 'Provimento de vagas efetivas e formação de cadastro de reserva sob o Regime Estatutário',
		status: 'Inscrições Abertas',
		periodoInscricao: '01/10/2026 a 18/11/2026',
		inicioInscricao: '2026-10-01',
		fimInscricao: '2026-11-18',
		limiteIsencao: '25/10/2026',
		dataProva: '13/12/2026',
		vagasTotais: 68,
		cadastroReservaTotal: 140,
		salarioMax: 'R$ 8.450,00',
		taxaInscricao: 'R$ 60,00 a R$ 130,00',
		banca: 'JBA Consultorias e Soluções Públicas',
		regimeJuridico: 'Estatutário (Lei Complementar Municipal nº 042/2022)',
		etapas: [
			'Prova Objetiva de Múltipla Escolha (Eliminatória e Classificatória)',
			'Avaliação de Títulos (Classificatória para cargos de Nível Superior)',
			'Perícia Médica Oficial (para vagas reservadas)'
		],
		cargos: [
			{
				id: 'cargo-pmsjv-01',
				codigo: '101',
				nome: 'Analista de Gestão Pública e Planejamento',
				nivel: 'Superior',
				vagas: 4,
				cadastroReserva: 12,
				vencimento: 'R$ 7.450,00',
				vencimentoNumerico: 7450,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 120,00',
				taxaNumerica: 120,
				requisitos: 'Graduação em Administração Pública, Administração, Economia ou Gestão Pública'
			},
			{
				id: 'cargo-pmsjv-02',
				codigo: '102',
				nome: 'Analista de Controle Interno e Governança',
				nivel: 'Superior',
				vagas: 3,
				cadastroReserva: 10,
				vencimento: 'R$ 6.800,00',
				vencimentoNumerico: 6800,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 120,00',
				taxaNumerica: 120,
				requisitos: 'Ensino Superior Completo em Administração, Gestão Pública, Contabilidade ou Economia'
			},
			{
				id: 'cargo-pmsjv-03',
				codigo: '103',
				nome: 'Auditor Fiscal Municipal',
				nivel: 'Superior',
				vagas: 4,
				cadastroReserva: 12,
				vencimento: 'R$ 6.950,00',
				vencimentoNumerico: 6950,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 120,00',
				taxaNumerica: 120,
				requisitos: 'Ensino Superior Completo em Administração, Economia ou Ciências Contábeis'
			},
			{
				id: 'cargo-pmsjv-04',
				codigo: '104',
				nome: 'Coordenador Pedagógico Municipal',
				nivel: 'Superior',
				vagas: 5,
				cadastroReserva: 15,
				vencimento: 'R$ 5.400,00',
				vencimentoNumerico: 5400,
				cargaHoraria: '30h semanais',
				taxa: 'R$ 100,00',
				taxaNumerica: 100,
				requisitos: 'Licenciatura Plena em Pedagogia'
			},
			{
				id: 'cargo-pmsjv-05',
				codigo: '105',
				nome: 'Professor de Educação Básica — PEB II',
				nivel: 'Superior',
				vagas: 22,
				cadastroReserva: 40,
				vencimento: 'R$ 4.867,77',
				vencimentoNumerico: 4867.77,
				cargaHoraria: '30h semanais',
				taxa: 'R$ 100,00',
				taxaNumerica: 100,
				requisitos: 'Licenciatura Plena em Pedagogia ou Normal Superior'
			},
			{
				id: 'cargo-pmsjv-06',
				codigo: '201',
				nome: 'Técnico em Contabilidade e Orçamento',
				nivel: 'Técnico',
				vagas: 5,
				cadastroReserva: 15,
				vencimento: 'R$ 3.620,00',
				vencimentoNumerico: 3620,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 85,00',
				taxaNumerica: 85,
				requisitos: 'Ensino Médio Completo + Curso Técnico em Contabilidade ou Administração'
			},
			{
				id: 'cargo-pmsjv-07',
				codigo: '202',
				nome: 'Técnico de Enfermagem da Família (ESF)',
				nivel: 'Técnico',
				vagas: 12,
				cadastroReserva: 20,
				vencimento: 'R$ 3.450,00',
				vencimentoNumerico: 3450,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 85,00',
				taxaNumerica: 85,
				requisitos: 'Ensino Médio + Curso Técnico em Enfermagem + Registro ativo no COREN'
			},
			{
				id: 'cargo-pmsjv-08',
				codigo: '301',
				nome: 'Agente Administrativo e de Licitações',
				nivel: 'Médio',
				vagas: 18,
				cadastroReserva: 18,
				vencimento: 'R$ 2.980,00',
				vencimentoNumerico: 2980,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 60,00',
				taxaNumerica: 60,
				requisitos: 'Ensino Médio Completo e conhecimentos em Informática Básica'
			}
		],
		documentos: [
			{
				id: 'doc-pmsjv-01',
				titulo: 'Edital de Abertura nº 001/2026 — Consolidado',
				tipo: 'Edital de Abertura',
				dataPublicacao: '01/10/2026',
				tamanho: '1.84 MB (PDF/A)',
				hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
				resumo: 'Regras gerais do certame, quadro de vagas, reserva legal (PcD e Cotas), atribuições e disposições sobre a prova objetiva.'
			},
			{
				id: 'doc-pmsjv-02',
				titulo: 'Anexo I — Conteúdo Programático e Bibliografia Sugerida',
				tipo: 'Conteúdo Programático',
				dataPublicacao: '01/10/2026',
				tamanho: '940 KB (PDF/A)',
				hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
				resumo: 'Programa detalhado de Língua Portuguesa, Raciocínio Lógico, Legislação Municipal, Lei 14.133/21, LRF e Conhecimentos Específicos.'
			},
			{
				id: 'doc-pmsjv-03',
				titulo: 'Anexo II — Cronograma Oficial Previsto do Concurso',
				tipo: 'Cronograma',
				dataPublicacao: '01/10/2026',
				tamanho: '412 KB (PDF/A)',
				hashSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
				resumo: 'Datas oficiais de inscrição, solicitação de isenção CadÚnico, homologação das inscrições, ensalamento e realização das provas.'
			},
			{
				id: 'doc-pmsjv-04',
				titulo: 'Retificação nº 01/2026 — Ampliação de Vagas para Contador e PEB II',
				tipo: 'Retificação',
				dataPublicacao: '10/10/2026',
				tamanho: '315 KB (PDF/A)',
				hashSha256: 'e7f6c011776e8db7cd330b54174fd76f7d0216b612387a5ffcfb81e6f0919683',
				resumo: 'Atualiza o quantitativo do cadastro de reserva e detalha os critérios da prova prático-profissional para Procurador e Contador.'
			}
		]
	},
	{
		id: 'edital-002-2026-cmsc',
		codigo: 'EDITAL Nº 002/2026 — CMSC',
		orgao: 'Câmara Municipal de Santa Clara',
		uf: 'SP',
		municipio: 'Santa Clara',
		titulo: 'Concurso Público para o Quadro Técnico-Legislativo e Controle Interno',
		subtitulo: 'Carreiras de Estado do Poder Legislativo Municipal com plano de progressão funcional',
		status: 'Inscrições Abertas',
		periodoInscricao: '05/10/2026 a 25/11/2026',
		inicioInscricao: '2026-10-05',
		fimInscricao: '2026-11-25',
		limiteIsencao: '30/10/2026',
		dataProva: '20/12/2026',
		vagasTotais: 19,
		cadastroReservaTotal: 60,
		salarioMax: 'R$ 9.620,00',
		taxaInscricao: 'R$ 75,00 a R$ 145,00',
		banca: 'JBA Consultorias e Soluções Públicas',
		regimeJuridico: 'Estatutário do Poder Legislativo (Resolução nº 08/2024)',
		etapas: [
			'Prova Objetiva de Conhecimentos Gerais e Específicos (Eliminatória e Classificatória)',
			'Prova Discursiva de Processo Legislativo Constitucional (Cargos de Nível Superior)',
			'Avaliação de Títulos Acadêmicos e Experiência no Setor Público'
		],
		cargos: [
			{
				id: 'cargo-cmsc-01',
				codigo: '101',
				nome: 'Procurador Legislativo',
				nivel: 'Superior',
				vagas: 1,
				cadastroReserva: 8,
				vencimento: 'R$ 9.620,00',
				vencimentoNumerico: 9620,
				cargaHoraria: '30h semanais',
				taxa: 'R$ 145,00',
				taxaNumerica: 145,
				requisitos: 'Bacharelado em Direito + Inscrição ativa na OAB sem sanções disciplinares'
			},
			{
				id: 'cargo-cmsc-02',
				codigo: '102',
				nome: 'Contador Legislativo e de Finanças',
				nivel: 'Superior',
				vagas: 2,
				cadastroReserva: 10,
				vencimento: 'R$ 8.190,00',
				vencimentoNumerico: 8190,
				cargaHoraria: '35h semanais',
				taxa: 'R$ 140,00',
				taxaNumerica: 140,
				requisitos: 'Bacharelado em Ciências Contábeis + Registro ativo no CRC'
			},
			{
				id: 'cargo-cmsc-03',
				codigo: '103',
				nome: 'Controlador Interno do Legislativo',
				nivel: 'Superior',
				vagas: 1,
				cadastroReserva: 8,
				vencimento: 'R$ 8.190,00',
				vencimentoNumerico: 8190,
				cargaHoraria: '35h semanais',
				taxa: 'R$ 140,00',
				taxaNumerica: 140,
				requisitos: 'Superior em Direito, Ciências Contábeis, Economia ou Administração Pública'
			},
			{
				id: 'cargo-cmsc-04',
				codigo: '104',
				nome: 'Analista de Compras, Licitações e Contratos (Lei 14.133/21)',
				nivel: 'Superior',
				vagas: 3,
				cadastroReserva: 12,
				vencimento: 'R$ 6.750,00',
				vencimentoNumerico: 6750,
				cargaHoraria: '35h semanais',
				taxa: 'R$ 125,00',
				taxaNumerica: 125,
				requisitos: 'Ensino Superior Completo em qualquer área + Capacitação em Contratações Públicas'
			},
			{
				id: 'cargo-cmsc-05',
				codigo: '201',
				nome: 'Técnico de Tecnologia da Informação e Transparência',
				nivel: 'Técnico',
				vagas: 4,
				cadastroReserva: 10,
				vencimento: 'R$ 4.380,00',
				vencimentoNumerico: 4380,
				cargaHoraria: '35h semanais',
				taxa: 'R$ 90,00',
				taxaNumerica: 90,
				requisitos: 'Ensino Médio + Curso Técnico em Informática, Redes ou Desenvolvimento de Sistemas'
			},
			{
				id: 'cargo-cmsc-06',
				codigo: '301',
				nome: 'Assistente Técnico Legislativo e de Plenário',
				nivel: 'Médio',
				vagas: 8,
				cadastroReserva: 12,
				vencimento: 'R$ 3.790,00',
				vencimentoNumerico: 3790,
				cargaHoraria: '35h semanais',
				taxa: 'R$ 75,00',
				taxaNumerica: 75,
				requisitos: 'Ensino Médio Completo'
			}
		],
		documentos: [
			{
				id: 'doc-cmsc-01',
				titulo: 'Edital de Abertura nº 002/2026 — Câmara Municipal de Santa Clara',
				tipo: 'Edital de Abertura',
				dataPublicacao: '05/10/2026',
				tamanho: '1.52 MB (PDF/A)',
				hashSha256: '7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451',
				resumo: 'Normas completas do concurso legislativo, atribuições regimentais, reserva de vagas e estrutura das provas.'
			},
			{
				id: 'doc-cmsc-02',
				titulo: 'Conteúdo Programático — Regimento Interno, Lei Orgânica e CASP',
				tipo: 'Conteúdo Programático',
				dataPublicacao: '05/10/2026',
				tamanho: '780 KB (PDF/A)',
				hashSha256: '2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3',
				resumo: 'Tópicos de Direito Constitucional Legislativo, Contabilidade Aplicada ao Setor Público e Lei nº 14.133/2021.'
			}
		]
	},
	{
		id: 'edital-003-2026-iprev',
		codigo: 'EDITAL Nº 003/2026 — IPREV',
		orgao: 'Instituto de Previdência Municipal (IPREV)',
		uf: 'PR',
		municipio: 'Monte Verde do Sul',
		titulo: 'Concurso Público para Gestão Previdenciária (RPPS) e Atuária',
		subtitulo: 'Certame alinhado aos requisitos do Pró-Gestão RPPS Nível III',
		status: 'Inscrições Abertas',
		periodoInscricao: '12/10/2026 a 30/11/2026',
		inicioInscricao: '2026-10-12',
		fimInscricao: '2026-11-30',
		limiteIsencao: '03/11/2026',
		dataProva: '10/01/2027',
		vagasTotais: 14,
		cadastroReservaTotal: 45,
		salarioMax: 'R$ 7.890,00',
		taxaInscricao: 'R$ 70,00 a R$ 135,00',
		banca: 'JBA Consultorias e Soluções Públicas',
		regimeJuridico: 'Estatutário Autárquico (RPPS)',
		etapas: [
			'Prova Objetiva (Eliminatória e Classificatória)',
			'Prova de Títulos e Certificações RPPS (CPRPPS / CGRPPS)'
		],
		cargos: [
			{
				id: 'cargo-iprev-01',
				codigo: '101',
				nome: 'Contador Previdenciário e de Investimentos RPPS',
				nivel: 'Superior',
				vagas: 2,
				cadastroReserva: 10,
				vencimento: 'R$ 7.890,00',
				vencimentoNumerico: 7890,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 135,00',
				taxaNumerica: 135,
				requisitos: 'Graduação em Ciências Contábeis + CRC Ativo'
			},
			{
				id: 'cargo-iprev-02',
				codigo: '102',
				nome: 'Analista Jurídico Previdenciário',
				nivel: 'Superior',
				vagas: 2,
				cadastroReserva: 10,
				vencimento: 'R$ 7.890,00',
				vencimentoNumerico: 7890,
				cargaHoraria: '30h semanais',
				taxa: 'R$ 135,00',
				taxaNumerica: 135,
				requisitos: 'Graduação em Direito + OAB ativa'
			},
			{
				id: 'cargo-iprev-03',
				codigo: '103',
				nome: 'Analista de Benefícios e Concessão Previdenciária',
				nivel: 'Superior',
				vagas: 4,
				cadastroReserva: 15,
				vencimento: 'R$ 5.920,00',
				vencimentoNumerico: 5920,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 115,00',
				taxaNumerica: 115,
				requisitos: 'Ensino Superior Completo em Administração, Contabilidade, Direito ou Economia'
			},
			{
				id: 'cargo-iprev-04',
				codigo: '301',
				nome: 'Agente Previdenciário e de Atendimento ao Segurado',
				nivel: 'Médio',
				vagas: 6,
				cadastroReserva: 10,
				vencimento: 'R$ 3.490,00',
				vencimentoNumerico: 3490,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 70,00',
				taxaNumerica: 70,
				requisitos: 'Ensino Médio Completo'
			}
		],
		documentos: [
			{
				id: 'doc-iprev-01',
				titulo: 'Edital de Abertura nº 003/2026 — IPREV Pró-Gestão',
				tipo: 'Edital de Abertura',
				dataPublicacao: '12/10/2026',
				tamanho: '1.45 MB (PDF/A)',
				hashSha256: '19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7',
				resumo: 'Regras completas do concurso autárquico previdenciário, pontuação adicional por certificação RPPS e cronograma.'
			}
		]
	},
	{
		id: 'edital-004-2026-cis',
		codigo: 'PROCESSO SELETIVO Nº 004/2026 — CIS-REGIONAL',
		orgao: 'Consórcio Intermunicipal de Saúde da Região Central',
		uf: 'MG',
		municipio: 'Polo Regional (14 Municípios)',
		titulo: 'Processo Seletivo Público para Equipes Multiprofissionais e Gestão',
		subtitulo: 'Contratação sob regime de emprego público consorcial (Lei Federal nº 11.107/2005)',
		status: 'Em Andamento',
		periodoInscricao: '15/08/2026 a 20/09/2026',
		inicioInscricao: '2026-08-15',
		fimInscricao: '2026-09-20',
		limiteIsencao: '25/08/2026',
		dataProva: '18/10/2026',
		vagasTotais: 42,
		cadastroReservaTotal: 90,
		salarioMax: 'R$ 6.800,00',
		taxaInscricao: 'R$ 55,00 a R$ 110,00',
		banca: 'JBA Consultorias e Soluções Públicas',
		regimeJuridico: 'Emprego Público Consorcial (CLT / Consórcio Público de Direito Público)',
		etapas: [
			'Prova Objetiva Realizada em 18/10/2026',
			'Gabarito Preliminar Publicado — Fase de Interposição de Recursos Aberta',
			'Resultado Definitivo e Convocação previstos para 05/11/2026'
		],
		cargos: [
			{
				id: 'cargo-cis-01',
				codigo: '101',
				nome: 'Enfermeiro Regulador e de Urgência',
				nivel: 'Superior',
				vagas: 10,
				cadastroReserva: 25,
				vencimento: 'R$ 5.650,00',
				vencimentoNumerico: 5650,
				cargaHoraria: '36h semanais',
				taxa: 'R$ 110,00',
				taxaNumerica: 110,
				requisitos: 'Graduação em Enfermagem + Registro ativo no COREN'
			},
			{
				id: 'cargo-cis-02',
				codigo: '102',
				nome: 'Contador Consorcial',
				nivel: 'Superior',
				vagas: 1,
				cadastroReserva: 5,
				vencimento: 'R$ 6.800,00',
				vencimentoNumerico: 6800,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 110,00',
				taxaNumerica: 110,
				requisitos: 'Graduação em Ciências Contábeis + Registro ativo no CRC'
			},
			{
				id: 'cargo-cis-03',
				codigo: '201',
				nome: 'Técnico em Farmácia e Almoxarifado de Saúde',
				nivel: 'Técnico',
				vagas: 15,
				cadastroReserva: 30,
				vencimento: 'R$ 3.120,00',
				vencimentoNumerico: 3120,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 75,00',
				taxaNumerica: 75,
				requisitos: 'Ensino Médio + Curso Técnico correlato'
			},
			{
				id: 'cargo-cis-04',
				codigo: '401',
				nome: 'Condutor de Veículo de Urgência e Transporte Sanitário',
				nivel: 'Fundamental',
				vagas: 16,
				cadastroReserva: 30,
				vencimento: 'R$ 2.890,00',
				vencimentoNumerico: 2890,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 55,00',
				taxaNumerica: 55,
				requisitos: 'Ensino Fundamental Completo + CNH Categoria "D" + Curso de Condutor de Emergência'
			}
		],
		documentos: [
			{
				id: 'doc-cis-01',
				titulo: 'Caderno de Provas e Gabarito Preliminar Oficial — Aplicado em 18/10/2026',
				tipo: 'Gabarito Preliminar',
				dataPublicacao: '19/10/2026',
				tamanho: '1.12 MB (PDF/A)',
				hashSha256: '4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5',
				resumo: 'Gabarito oficial preliminar de todos os cargos e abertura do prazo de 48h úteis para recursos fundamentados.'
			},
			{
				id: 'doc-cis-02',
				titulo: 'Edital de Processo Seletivo Público nº 004/2026 — CIS-Regional',
				tipo: 'Edital de Abertura',
				dataPublicacao: '15/08/2026',
				tamanho: '1.38 MB (PDF/A)',
				hashSha256: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
				resumo: 'Regulamento geral da seleção pública consorcial.'
			}
		]
	},
	{
		id: 'edital-005-2026-saae',
		codigo: 'EDITAL Nº 005/2026 — SAAE',
		orgao: 'Serviço Autônomo de Água e Esgoto de Rio Verde (SAAE)',
		uf: 'GO',
		municipio: 'Rio Verde da Serra',
		titulo: 'Concurso Público para Engenheiros, Químicos, Contadores e Operadores',
		subtitulo: 'Modernização do quadro técnico da autarquia municipal de saneamento básico',
		status: 'Previsto',
		periodoInscricao: 'Abertura prevista: 10/11/2026',
		inicioInscricao: '2026-11-10',
		fimInscricao: '2026-12-18',
		limiteIsencao: '20/11/2026',
		dataProva: '24/01/2027',
		vagasTotais: 31,
		cadastroReservaTotal: 75,
		salarioMax: 'R$ 9.100,00',
		taxaInscricao: 'R$ 60,00 a R$ 135,00',
		banca: 'JBA Consultorias e Soluções Públicas',
		regimeJuridico: 'Estatutário Autárquico',
		etapas: [
			'Prova Objetiva (Todos os cargos)',
			'Prova Prática Operacional (Operador de ETA/ETE)',
			'Prova de Títulos (Cargos de Nível Superior)'
		],
		cargos: [
			{
				id: 'cargo-saae-01',
				codigo: '101',
				nome: 'Engenheiro Sanitarista e Ambiental',
				nivel: 'Superior',
				vagas: 2,
				cadastroReserva: 8,
				vencimento: 'R$ 9.100,00',
				vencimentoNumerico: 9100,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 135,00',
				taxaNumerica: 135,
				requisitos: 'Graduação em Engenharia Sanitária ou Civil + Registro no CREA'
			},
			{
				id: 'cargo-saae-02',
				codigo: '201',
				nome: 'Técnico em Química e Controle de Qualidade da Água',
				nivel: 'Técnico',
				vagas: 9,
				cadastroReserva: 22,
				vencimento: 'R$ 3.980,00',
				vencimentoNumerico: 3980,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 85,00',
				taxaNumerica: 85,
				requisitos: 'Curso Técnico em Química ou Saneamento + Registro no CRQ'
			},
			{
				id: 'cargo-saae-03',
				codigo: '301',
				nome: 'Agente Comercial e de Atendimento',
				nivel: 'Médio',
				vagas: 20,
				cadastroReserva: 45,
				vencimento: 'R$ 2.840,00',
				vencimentoNumerico: 2840,
				cargaHoraria: '40h semanais',
				taxa: 'R$ 60,00',
				taxaNumerica: 60,
				requisitos: 'Ensino Médio Completo'
			}
		],
		documentos: [
			{
				id: 'doc-saae-01',
				titulo: 'Extrato de Contrato e Comissão Organizadora — SAAE 2026',
				tipo: 'Comunicado Oficial',
				dataPublicacao: '15/10/2026',
				tamanho: '290 KB (PDF/A)',
				hashSha256: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
				resumo: 'Designação da Comissão Especial de Concurso Público e cronograma preliminar de publicação do edital.'
			}
		]
	}
];

export const pareceresPublicacoes: ParecerPublicacao[] = [
	{
		id: 'par-001',
		codigo: 'GUIA PRÁTICO JBA Nº 014/2026',
		categoria: 'Gestão & Rotinas',
		titulo: 'Como Simplificar Rotinas Administrativas e Reduzir o Retrabalho nas Secretarias Municipais',
		data: '14 de Outubro de 2026',
		autor: 'Consultoria em Gestão Pública JBA',
		credencialAutor: 'Especialistas em Processos e Eficiência Pública',
		resumo:
			'Passo a passo para padronizar fluxos internos, organizar protocolos e dar agilidade às demandas diárias das equipes municipais.',
		fundamentacaoLegal: 'Lei nº 14.129/2021 (Governo Digital e Eficiência)',
		tempoLeitura: '5 min'
	},
	{
		id: 'par-002',
		codigo: 'NOTA TÉCNICA JBA Nº 029/2026',
		categoria: 'Licitações & Contratos',
		titulo: 'Planejamento Anual de Contratações e Padronização de Termos de Referência na Lei nº 14.133/2021',
		data: '02 de Outubro de 2026',
		autor: 'Núcleo de Planejamento e Governança JBA',
		credencialAutor: 'Consultoria em Contratações Públicas',
		resumo:
			'Orientações objetivas para organizar o calendário de compras do órgão e elaborar Estudos Técnicos Preliminares com clareza e rapidez.',
		fundamentacaoLegal: 'Lei Federal nº 14.133/2021 (Arts. 12 e 18)',
		tempoLeitura: '6 min'
	},
	{
		id: 'par-003',
		codigo: 'INFORMATIVO JBA Nº 008/2026',
		categoria: 'Concursos Públicos',
		titulo: 'Planejamento de Concursos Públicos e Processos Seletivos: Do Levantamento de Vagas à Homologação',
		data: '25 de Setembro de 2026',
		autor: 'Coordenação de Concursos e Seleções JBA',
		credencialAutor: 'Banca Organizadora de Certames',
		resumo:
			'Como organizar certames periódicos com cronograma enxuto, portal de inscrições acessível ao cidadão e total segurança operacional.',
		fundamentacaoLegal: 'Art. 37, II da CF/88 • Lei nº 13.709/2018 (LGPD)',
		tempoLeitura: '5 min'
	}
];
