const { getDb } = require('./database');
const { createParecer, addRelacionado } = require('./services/indexService');

const seedData = [
  {
    numero: '001/2024/PROJUR',
    tipo: 'sistemico',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Diretoria Geral FESF-SUS',
    autor: 'Roberta Graziella Vidal Pereira da Silva',
    assunto: 'Pagamento indenizatorio por enriquecimento sem causa da Administracao Publica',
    ementa: 'Parecer sistemico sobre procedimentos para reconhecimento de divida e pagamento indenizatorio a fornecedores que prestaram servicos ou forneceram bens sem cobertura contratual formal, com base no principio da vedacao ao enriquecimento sem causa.',
    texto_completo: `I - DO OBJETO E DA CONSULTA

A Diretoria Geral da FESF-SUS, por intermedio do Oficio nº 045/2024/DG, formulou consulta a esta Procuradoria Juridica acerca dos procedimentos juridicos adequados para o reconhecimento de divida e pagamento indenizatorio a fornecedores que prestaram servicos ou forneceram bens sem a devida cobertura contratual formal.

II - DA FUNDAMENTACAO JURIDICA

O ordenamento juridico brasileiro, com fundamento no art. 884 do Codigo Civil, consagra o principio da vedacao ao enriquecimento sem causa.

VII - DA CONCLUSAO

Ante o exposto, conclui-se pela possibilidade juridica do pagamento indenizatorio, desde que rigorosamente atendidos todos os requisitos documentais e procedimentais elencados neste parecer.`,
    fundamentacao_legal: 'Art. 59, paragrafo unico, Lei 8.666/93; Art. 884, Codigo Civil; Acordao TCU 1506/2013; Parecer AGU GQ-77',
    conclusao: 'Conclui-se pela possibilidade juridica do pagamento indenizatorio, desde que atendidos todos os requisitos documentais elencados no checklist de 22 itens anexo.',
    materia: 'Licitacoes e Contratos',
    status: 'vigente',
    data_emissao: '2024-03-15',
    ano: 2024,
    nup: '0022.000145/2024-38',
    palavras_chave: 'indenizacao, pagamento, enriquecimento sem causa, divida, fornecedor'
  },
  {
    numero: '002/2024/PROJUR',
    tipo: 'consultivo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Gerencia Administrativa Financeira',
    autor: 'Diego Souza Lobao',
    assunto: 'Retencao tributaria em pagamentos a pessoas juridicas prestadoras de servico',
    ementa: 'Consulta sobre obrigatoriedade de retencao de tributos federais (IRRF, CSLL, PIS, COFINS) e municipais (ISS) nos pagamentos realizados pela FESF-SUS.',
    texto_completo: 'Trata-se de consulta formulada pela Gerencia Administrativa Financeira acerca da obrigatoriedade de retencao tributaria nos pagamentos a pessoas juridicas.',
    fundamentacao_legal: 'IN RFB 1.234/2012; Art. 31, Lei 8.212/91; Art. 64, Lei 9.430/96; LC 116/2003',
    conclusao: 'Recomenda-se a retencao de todos os tributos aplicaveis conforme tabela de aliquotas da IN RFB 1.234/2012.',
    materia: 'Tributario',
    status: 'vigente',
    data_emissao: '2024-05-20',
    ano: 2024,
    nup: '0022.000201/2024-12',
    palavras_chave: 'retencao, tributo, IRRF, CSLL, PIS, COFINS, ISS, nota fiscal'
  },
  {
    numero: '003/2024/PROJUR',
    tipo: 'normativo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Diretoria de Gestao de Pessoas',
    autor: 'Roberta Graziella Vidal Pereira da Silva',
    assunto: 'Regime juridico de contratacao de pessoal por tempo determinado na FESF-SUS',
    ementa: 'Parecer normativo sobre a possibilidade e limites da contratacao temporaria de pessoal pela FESF-SUS.',
    texto_completo: 'A FESF-SUS, como fundacao estatal de direito privado, submete-se ao regime celetista para contratacao de pessoal.',
    fundamentacao_legal: 'Art. 37, IX, CF/88; Art. 173, par.1, CF/88; Lei Estadual 11.426/2009',
    conclusao: 'A contratacao temporaria e admissivel, desde que fundamentada em necessidade emergencial comprovada, por prazo nao superior a 24 meses.',
    materia: 'Pessoal',
    status: 'vigente',
    data_emissao: '2024-07-10',
    ano: 2024,
    nup: '0022.000315/2024-55',
    palavras_chave: 'contratacao, temporario, pessoal, CLT, concurso, processo seletivo'
  },
  {
    numero: '004/2024/PROJUR',
    tipo: 'consultivo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Hospital Estadual Costa dos Coqueiros',
    autor: 'Diego Souza Lobao',
    assunto: 'Dispensa de licitacao para aquisicao emergencial de medicamentos',
    ementa: 'Analise da possibilidade de dispensa de licitacao para aquisicao emergencial de medicamentos essenciais para o HECC.',
    texto_completo: 'Cuida-se de consulta formulada pelo HECC acerca da possibilidade de aquisicao direta de medicamentos sem licitacao previa.',
    fundamentacao_legal: 'Art. 24, IV, Lei 8.666/93; Art. 75, VIII, Lei 14.133/2021',
    conclusao: 'A dispensa e possivel desde que fique demonstrada a emergencia e a contratacao se limite ao estritamente necessario.',
    materia: 'Licitacoes e Contratos',
    status: 'vigente',
    data_emissao: '2024-08-05',
    ano: 2024,
    nup: '0289.000102/2024-77',
    palavras_chave: 'dispensa, licitacao, emergencia, medicamento, aquisicao direta, HECC'
  },
  {
    numero: '005/2023/PROJUR',
    tipo: 'consultivo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Diretoria Financeira',
    autor: 'Roberta Graziella Vidal Pereira da Silva',
    assunto: 'Prescricao quinquenal de dividas da Fazenda Publica',
    ementa: 'Analise dos prazos prescricionais aplicaveis as dividas da Administracao Publica.',
    texto_completo: 'O Decreto 20.910/1932 estabelece o prazo prescricional de 5 anos para dividas da Fazenda Publica.',
    fundamentacao_legal: 'Decreto 20.910/1932; Art. 1, Decreto-Lei 4.597/42; STJ REsp 1.251.993/PR',
    conclusao: 'As dividas com prazo superior a 5 anos desde a emissao da NF estao prescritas e nao devem ser pagas.',
    materia: 'Administrativo',
    status: 'vigente',
    data_emissao: '2023-11-20',
    ano: 2023,
    nup: '0022.000089/2023-44',
    palavras_chave: 'prescricao, quinquenal, divida, fazenda publica, prazo, Decreto 20.910'
  },
  {
    numero: '006/2025/PROJUR',
    tipo: 'consultivo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Gerencia de Contratos',
    autor: 'Diego Souza Lobao',
    assunto: 'Fiscalizacao de contratos de terceirizacao e responsabilidade subsidiaria',
    ementa: 'Orientacao sobre as obrigacoes da Administracao como tomadora de servicos terceirizados.',
    texto_completo: 'A terceirizacao de servicos na Administracao Publica impoe ao tomador o dever de fiscalizar o cumprimento das obrigacoes trabalhistas.',
    fundamentacao_legal: 'Sumula 331, TST; Art. 121, Lei 14.133/2021; Art. 71, Lei 8.666/93',
    conclusao: 'A fiscalizacao rigorosa e indispensavel para afastar a responsabilidade subsidiaria.',
    materia: 'Trabalhista',
    status: 'vigente',
    data_emissao: '2025-01-15',
    ano: 2025,
    nup: '0022.000012/2025-88',
    palavras_chave: 'terceirizacao, fiscalizacao, trabalhista, responsabilidade subsidiaria, Sumula 331, FGTS'
  },
  {
    numero: '007/2025/PROJUR',
    tipo: 'normativo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Diretoria Geral',
    autor: 'Roberta Graziella Vidal Pereira da Silva',
    assunto: 'Normas para instrucao de processos de reconhecimento de divida e pagamento indenizatorio',
    ementa: 'Parecer normativo que estabelece o checklist de 22 itens obrigatorios para instrucao de processos de reconhecimento de divida.',
    texto_completo: 'Em complemento ao Parecer Sistemico 001/2024/PROJUR, o presente parecer normativo visa detalhar a documentacao obrigatoria.',
    fundamentacao_legal: 'Parecer 001/2024/PROJUR; Ato Administrativo 598/2024; Lei 8.666/93; Lei 14.133/2021',
    conclusao: 'Todos os 22 itens sao obrigatorios. A ausencia de qualquer item impede o prosseguimento do processo.',
    materia: 'Licitacoes e Contratos',
    status: 'vigente',
    data_emissao: '2025-02-01',
    ano: 2025,
    nup: '0022.000025/2025-11',
    palavras_chave: 'checklist, instrucao, processo, reconhecimento, divida, 22 itens, documentacao'
  },
  {
    numero: '008/2025/PROJUR',
    tipo: 'consultivo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Hospital Estadual Costa dos Coqueiros',
    autor: 'Diego Souza Lobao',
    assunto: 'Contratacao de servicos medicos por pessoa juridica no ambito hospitalar',
    ementa: 'Analise da legalidade da contratacao de servicos medicos especializados por intermedio de pessoas juridicas pelo HECC.',
    texto_completo: 'A contratacao de servicos medicos especializados por intermedio de pessoas juridicas e uma realidade no ambito hospitalar.',
    fundamentacao_legal: 'RE 958.252/MG (Tema 725 STF); ADPF 324; Art. 25, Lei 14.133/2021',
    conclusao: 'A contratacao de PJ medica e juridicamente viavel, desde que observados os requisitos de habilitacao.',
    materia: 'Saude',
    status: 'vigente',
    data_emissao: '2025-02-20',
    ano: 2025,
    nup: '0289.000033/2025-22',
    palavras_chave: 'medico, PJ, pessoa juridica, credenciamento, hospital, HECC, terceirizacao'
  },
  {
    numero: '001/2023/PROJUR',
    tipo: 'consultivo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Ouvidoria',
    autor: 'Roberta Graziella Vidal Pereira da Silva',
    assunto: 'Lei Geral de Protecao de Dados (LGPD) aplicada a gestao hospitalar',
    ementa: 'Orientacao sobre a aplicacao da LGPD no tratamento de dados pessoais e dados sensiveis de pacientes.',
    texto_completo: 'A Lei 13.709/2018 (LGPD) estabelece normas para o tratamento de dados pessoais, inclusive por parte da Administracao Publica.',
    fundamentacao_legal: 'Lei 13.709/2018 (LGPD); Decreto 8.771/2016; Resolucao ANPD 2/2022',
    conclusao: 'O hospital deve implementar programa de conformidade com a LGPD.',
    materia: 'Administrativo',
    status: 'vigente',
    data_emissao: '2023-06-15',
    ano: 2023,
    nup: '0022.000055/2023-99',
    palavras_chave: 'LGPD, dados pessoais, dados sensiveis, hospital, privacidade, DPO'
  },
  {
    numero: '009/2025/PROJUR',
    tipo: 'consultivo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Gerencia Administrativa Financeira',
    autor: 'Diego Souza Lobao',
    assunto: 'Possibilidade de pagamento parcial de nota fiscal em processo indenizatorio',
    ementa: 'Analise da viabilidade de pagamento parcial de nota fiscal quando apenas parte dos itens e comprovadamente recebida.',
    texto_completo: 'Consulta sobre a possibilidade de efetuar pagamento parcial de nota fiscal em processo indenizatorio.',
    fundamentacao_legal: 'Art. 884, Codigo Civil; Art. 59, paragrafo unico, Lei 8.666/93; Acordao TCU 2344/2011',
    conclusao: 'O pagamento parcial e admissivel e deve ser adotado sempre que houver divergencia.',
    materia: 'Licitacoes e Contratos',
    status: 'vigente',
    data_emissao: '2025-03-10',
    ano: 2025,
    nup: '0022.000042/2025-33',
    palavras_chave: 'pagamento parcial, nota fiscal, sobrepreco, pesquisa de mercado, indenizatorio'
  }
];

const revokedData = [
  {
    numero: '002/2023/PROJUR',
    tipo: 'consultivo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Gerencia Administrativa Financeira',
    autor: 'Roberta Graziella Vidal Pereira da Silva',
    assunto: 'Procedimento para pagamento de fornecedores sem contrato vigente',
    ementa: 'Orientacao inicial sobre pagamentos a fornecedores sem cobertura contratual. REVOGADO pelo Parecer Sistemico 001/2024/PROJUR.',
    texto_completo: 'Este parecer estabelecia procedimentos simplificados para pagamento de fornecedores sem contrato.',
    fundamentacao_legal: 'Art. 59, paragrafo unico, Lei 8.666/93; Art. 884, Codigo Civil',
    conclusao: 'REVOGADO. Substituido integralmente pelo Parecer Sistemico 001/2024/PROJUR.',
    materia: 'Licitacoes e Contratos',
    status: 'revogado',
    parecer_revogador: '001/2024/PROJUR',
    data_emissao: '2023-04-10',
    ano: 2023,
    nup: '0022.000032/2023-15',
    palavras_chave: 'pagamento, fornecedor, sem contrato, indenizacao, revogado'
  },
  {
    numero: '003/2023/PROJUR',
    tipo: 'normativo',
    orgao: 'Procuradoria Juridica FESF-SUS',
    orgao_solicitante: 'Diretoria Geral',
    autor: 'Diego Souza Lobao',
    assunto: 'Requisitos documentais para reconhecimento de divida - versao preliminar',
    ementa: 'Versao preliminar dos requisitos documentais para instrucao de processos de reconhecimento de divida. SUSPENSO.',
    texto_completo: 'Este parecer estabelecia 15 itens documentais obrigatorios para instrucao de processos de reconhecimento de divida.',
    fundamentacao_legal: 'Lei 8.666/93; Parecer AGU GQ-77',
    conclusao: 'SUSPENSO. Substituido pelo Parecer Normativo 007/2025/PROJUR.',
    materia: 'Licitacoes e Contratos',
    status: 'suspenso',
    data_emissao: '2023-08-20',
    ano: 2023,
    nup: '0022.000067/2023-77',
    palavras_chave: 'checklist, requisitos, documentos, reconhecimento, divida, suspenso'
  }
];

const relationships = [
  { from: '001/2024/PROJUR', to: '005/2023/PROJUR', tipo: 'cita' },
  { from: '007/2025/PROJUR', to: '001/2024/PROJUR', tipo: 'complementa' },
  { from: '004/2024/PROJUR', to: '005/2023/PROJUR', tipo: 'cita' },
  { from: '006/2025/PROJUR', to: '002/2024/PROJUR', tipo: 'cita' },
  { from: '009/2025/PROJUR', to: '001/2024/PROJUR', tipo: 'cita' },
  { from: '001/2024/PROJUR', to: '002/2023/PROJUR', tipo: 'revoga' },
  { from: '007/2025/PROJUR', to: '003/2023/PROJUR', tipo: 'revoga' },
];

async function main() {
  console.log('Inicializando conexao com Supabase...');
  const supabase = getDb();

  console.log('Inserindo pareceres de exemplo...');
  for (const parecer of seedData) {
    try {
      const result = await createParecer(parecer);
      console.log(`  [OK] ${result.numero} — ${parecer.assunto.substring(0, 60)}...`);
    } catch (err) {
      console.log(`  [ERRO] ${parecer.numero}: ${err.message}`);
    }
  }

  console.log('\nInserindo pareceres revogados/suspensos...');
  for (const parecer of revokedData) {
    try {
      const result = await createParecer(parecer);
      console.log(`  [OK] ${result.numero} (${parecer.status}) — ${parecer.assunto.substring(0, 50)}...`);
    } catch (err) {
      console.log(`  [ERRO] ${parecer.numero}: ${err.message}`);
    }
  }

  // Build number->id map
  console.log('\nCriando relacionamentos...');
  const { data: allPareceres } = await supabase.from('pareceres').select('id, numero');
  const idMap = {};
  for (const p of allPareceres) idMap[p.numero] = p.id;

  for (const rel of relationships) {
    const fromId = idMap[rel.from];
    const toId = idMap[rel.to];
    if (fromId && toId) {
      try {
        await addRelacionado(fromId, toId, rel.tipo);
        console.log(`  [OK] ${rel.from} —(${rel.tipo})→ ${rel.to}`);
      } catch (err) {
        console.log(`  [ERRO] ${rel.from} → ${rel.to}: ${err.message}`);
      }
    } else {
      console.log(`  [SKIP] ${rel.from} → ${rel.to} (ID nao encontrado)`);
    }
  }

  console.log(`\nSeed concluido: ${seedData.length + revokedData.length} pareceres + ${relationships.length} relacionamentos.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
