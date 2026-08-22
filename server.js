const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const TEMPLATE_DIR = path.join(__dirname, 'template');
const WORKSPACE_DIR = path.join(__dirname, '..');

// MIME types
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.pdf': 'application/pdf'
};

// Multidisciplinary Sample Courses
const SAMPLE_COURSES = {
    "chatgpt": {
        area: "TI - Software",
        courseName: "Inteligências Artificiais Generativas Aplicada a Programação – ChatGPT",
        courseUnit: "Inteligências Artificiais Generativas Aplicada a Programação – ChatGPT",
        unitSigla: "ChatGPT",
        workload: 48,
        turma: "IAGP 2614IB",
        semAno: "2º Sem/2026",
        docente: "Gustavo da Silva Feriani",
        escola: "Escola SENAI \"Mariano Ferraz\"",
        capacidadesTecnicas: [
            "Identificar inteligências artificiais generativas, suas arquiteturas e funcionamento.",
            "Treinar IA, utilizando os fundamentos do aprendizado de máquina.",
            "Criar um chatbot personalizado utilizando o processamento de linguagem natural (NLP).",
            "Estruturar e codificar solução utilizando inteligências artificiais.",
            "Corrigir erros em scripts, builds e deploys com ChatGPT.",
            "Refatorar códigos com ChatGPT.",
            "Aplicar o processo de treinamento personalizado do ChatGPT através de API, incluindo a coleta e pré-processamento de dados, ajuste de parâmetros, e avaliação do modelo e redes neurais.",
            "Implementar o ChatGPT em aplicações de chatbot usando suas bibliotecas e APIs."
        ],
        capacidadesSocioemocionais: [
            "Demonstrar raciocínio lógico.",
            "Demonstrar atenção aos detalhes."
        ],
        conhecimentos: [
            "1. Inteligência Artificial: Definição, Modelos Supervisionados e Não Supervisionados, Redes Neurais e NLP.",
            "2. IA Generativa: Arquiteturas LLM, Tokenização, Métricas e Alucinações.",
            "3. Produtividade: Pesquisas, Resolução de Bugs, Refatoração e Clean Code.",
            "4. Integração: API da OpenAI, Autenticação, Endpoints, Testes e Fine-Tuning."
        ]
    },
    "antigravity": {
        area: "TI - Software",
        courseName: "Desenvolvimento de Aplicações com IA Generativa utilizando Google Antigravity",
        courseUnit: "Desenvolvimento de Aplicações com IA Generativa utilizando Google Antigravity",
        unitSigla: "Antigravity",
        workload: 40,
        turma: "DESGAGR 2614IB",
        semAno: "2º Sem/2026",
        docente: "Gustavo da Silva Feriani",
        escola: "Escola SENAI \"Mariano Ferraz\"",
        capacidadesTecnicas: [
            "Diferenciar IA tradicional e IA generativa, tendo em vista, finalidades, entradas e saídas.",
            "Utilizar modelos de IA generativa pré-treinados para interpretação de entradas e saídas.",
            "Elaborar prompts estruturados para obtenção de respostas, de acordo com requisitos.",
            "Realizar construção e implantação de protótipo, com utilização de Gemini/Imagen na plataforma Vertex AI.",
            "Utilizar ferramenta Antigravity para geração de código e estruturação de projetos.",
            "Validar protótipo funcional com IA generativa, por meio de aplicação de testes e IA responsável."
        ],
        capacidadesSocioemocionais: [
            "Demonstrar atenção a detalhes.",
            "Demonstrar raciocínio lógico.",
            "Demonstrar visão sistêmica.",
            "Demonstrar responsabilidade.",
            "Demonstrar tolerância ao estresse."
        ],
        conhecimentos: [
            "1. IA Generativa: Fundamentos e Limitações.",
            "2. Modelos de Linguagem: LLMs e Formatos (JSON, Tabelas).",
            "3. Engenharia de Prompts: Estrutura e Few-Shot.",
            "4. Antigravity: Geração de Código e Arquitetura.",
            "5. Validação e IA Responsável: Testes, Mitigação de Vieses e Ética."
        ]
    },
    "eletrica": {
        area: "Eletroeletrônica",
        courseName: "Comandos Elétricos e Acionamentos Industriais",
        courseUnit: "Comandos Elétricos Industriais",
        unitSigla: "COMANDOS",
        workload: 80,
        turma: "ELT-CMD 2026/2",
        semAno: "2º Sem/2026",
        docente: "Docente de Eletroeletrônica",
        escola: "Escola SENAI \"Mariano Ferraz\"",
        capacidadesTecnicas: [
            "Interpretar diagramas elétricos funcionais, unifilares e trifilares de comandos de motores.",
            "Dimensionar dispositivos de proteção, comando e seccionamento (disjuntores, contatores, relés térmicos).",
            "Montar painéis elétricos industriais e circuitos de força e comando seguindo normas técnicas (NR-10 e NBR 5410).",
            "Parametrizar inversores de frequência e soft-starters para controle de velocidade e partida suave de motores de indução.",
            "Diagnosticar e reparar falhas em circuitos de comandos elétricos utilizando instrumentos de medição (multímetro, alicate amperímetro)."
        ],
        capacidadesSocioemocionais: [
            "Demonstrar atenção a detalhes e segurança.",
            "Demonstrar raciocínio lógico no diagnóstico de falhas.",
            "Demonstrar responsabilidade e trabalho em equipe."
        ],
        conhecimentos: [
            "1. Componentes de Comando: Botoeiras, contatores, temporizadores, relés térmicos e sinalizadores.",
            "2. Partidas de Motores: Partida direta, direta com reversão, estrela-triângulo e compensadora.",
            "3. Acionamentos Eletrônicos: Soft-starter e Inversor de Frequência (curvas V/f, rampas de aceleração/desaceleração).",
            "4. Segurança em Eletricidade: NR-10, EPIs/EPCs, aterramento e seccionamento seguro."
        ]
    },
    "automacao": {
        area: "Automação Industrial",
        courseName: "Controladores Lógicos Programáveis - CLP",
        courseUnit: "Programação de Controladores Lógicos",
        unitSigla: "CLP-AUT",
        workload: 40,
        turma: "AUT-CLP 2026/2",
        semAno: "2º Sem/2026",
        docente: "Docente de Automação",
        escola: "Escola SENAI \"Mariano Ferraz\"",
        capacidadesTecnicas: [
            "Identificar a arquitetura de hardware de CLPs (entradas, saídas digitais/analógicas, CPU e memórias).",
            "Elaborar programas de controle em linguagem Ladder e Diagrama de Blocos Funcionais (FBD).",
            "Configurar redes industriais de comunicação para troca de dados entre CLP e sensores/atuadores.",
            "Validar rotinas de intertravamento e segurança operacional em bancadas didáticas ou plantas industriais simuladas."
        ],
        capacidadesSocioemocionais: [
            "Demonstrar raciocínio lógico.",
            "Demonstrar visão sistêmica.",
            "Demonstrar atenção a detalhes."
        ],
        conhecimentos: [
            "1. Hardware de CLP: Módulos de E/S discretas e analógicas, fontes de alimentação e barramentos.",
            "2. Linguagens de Programação (IEC 61131-3): Ladder (LAD) e Diagrama de Blocos de Funções (FBD).",
            "3. Instruções Avançadas: Temporizadores (TON/TOF), Contadores (CTU/CTD) e Comparadores.",
            "4. Redes e Diagnóstico: Protocolos industriais (Modbus/Profinet) e rotinas de simulação."
        ]
    }
};

// Universal MSEP Engine
function generateMSEPPlan(courseInfo) {
    const key = courseInfo.courseKey || '';
    const nameLower = (courseInfo.courseName || '').toLowerCase();

    if (SAMPLE_COURSES[key]) {
        const p = SAMPLE_COURSES[key];
        return buildPresetPlan(p, courseInfo);
    }
    if (nameLower.includes('chatgpt')) return buildPresetPlan(SAMPLE_COURSES.chatgpt, courseInfo);
    if (nameLower.includes('antigravity')) return buildPresetPlan(SAMPLE_COURSES.antigravity, courseInfo);
    if (nameLower.includes('elétr') || nameLower.includes('comando') || nameLower.includes('motor')) return buildPresetPlan(SAMPLE_COURSES.eletrica, courseInfo);
    if (nameLower.includes('clp') || nameLower.includes('automa')) return buildPresetPlan(SAMPLE_COURSES.automacao, courseInfo);

    return buildGenericDynamicPlan(courseInfo);
}

function buildPresetPlan(preset, overrides) {
    const isEletrica = preset === SAMPLE_COURSES.eletrica;
    const isAutomacao = preset === SAMPLE_COURSES.automacao;

    const base = {
        curso: overrides.courseName || preset.courseName,
        unidade: overrides.courseUnit || preset.courseUnit,
        sigla: overrides.unitSigla || preset.unitSigla,
        cargaHoraria: overrides.workload || preset.workload,
        numAulas: `${overrides.workload || preset.workload} aulas de 60 minutos cada`,
        docente: overrides.docente || preset.docente,
        turma: overrides.turma || preset.turma,
        semAno: overrides.semAno || preset.semAno,
        escola: overrides.escola || preset.escola
    };

    if (isEletrica) {
        base.objetivoUC = "Desenvolver capacidades técnicas e socioemocionais relativas à montagem, parametrização de acionamentos e diagnóstico de falhas em sistemas de comandos elétricos industriais conforme normas técnicas e de segurança.";
        base.situacoes = [
            {
                numero: "01",
                titulo: "Diagramas, Dimensionamento e Partida Direta de Motores",
                aulas: 24,
                estrategiaTipo: "Situação-problema",
                capacidadesTecnicas: [preset.capacidadesTecnicas[0], preset.capacidadesTecnicas[1]],
                capacidadesSocioemocionais: [preset.capacidadesSocioemocionais[0], preset.capacidadesSocioemocionais[1]],
                conhecimentos: [preset.conhecimentos[0], preset.conhecimentos[1]],
                contextualizacao: "Uma indústria de alimentos precisa instalar uma nova esteira transportadora de embalagens. O motor trifásico de 5 CV deve ser acionado por botoeiras com retenção e possuir proteção completa contra sobrecarga e curto-circuito. Como eletricista técnico da planta, você deve analisar a demanda, dimensionar contatores e relés térmicos, desenhar o diagrama funcional e montar o painel de comando.",
                observacoesDocente: "Revisar normas de segurança em eletricidade (NR-10). Conduzir a montagem prática em bancada garantindo o uso correto de EPIs e ferramentas isoladas.",
                desafio: "Dimensionar os componentes elétricos de proteção e manobra, desenhar os esquemas funcionais de força e comando e montar o circuito de partida direta com reversão e sinalização luminosa de falha.",
                resultadosEsperados: "Painel de comando montado e testado em bancada, diagrama elétrico unifilar e trifilar assinado e memorial de cálculo dos condutores e disjuntores.",
                estrategiasEnsino: "Exposição dialogada; Aula prática de montagem em bancadas industriais; Simulação em software CAD elétrico.",
                instrumentosAvaliacao: "Prova prática de montagem e teste funcional; Ficha de inspeção técnica de painel; Checklist de segurança NR-10.",
                recursos: "Bancadas didáticas de comandos elétricos, contatores, relés térmicos, botoeiras, motores de indução trifásicos, multímetros e ferramentas manuais isoladas.",
                criterios: [
                    { row: 15, cap: preset.capacidadesTecnicas[0], crit: "Interpreta diagramas funcionais, identificando corretamente a simbologia de força e comando.", tipo: "C" },
                    { row: 16, cap: "", crit: "Elabora diagramas elétricos com clareza e aderência às normas técnicas vigentes.", tipo: "D" },
                    { row: 17, cap: preset.capacidadesTecnicas[1], crit: "Dimensiona contatores, disjuntores-motores e relés térmicos adequados à corrente nominal do motor.", tipo: "C" },
                    { row: 18, cap: "", crit: "Calcula a bitola de condutores considerando critérios de capacidade de corrente e queda de tensão.", tipo: "D" },
                    { row: 19, cap: "Demonstrar atenção a detalhes e segurança", crit: "Executa a fiação e o borneamento do painel seguindo rigorosamente o esquema elétrico e normas de segurança.", tipo: "C" },
                    { row: 20, cap: "", crit: "Organiza o encaminhamento de cabos em canaletas com acabamento estético e identificação de anilhas.", tipo: "D" }
                ]
            },
            {
                numero: "02",
                titulo: "Acionamentos Eletrônicos (Inversores e Soft-Starters)",
                aulas: 32,
                estrategiaTipo: "Projeto",
                capacidadesTecnicas: [preset.capacidadesTecnicas[3]],
                capacidadesSocioemocionais: [preset.capacidadesSocioemocionais[1]],
                conhecimentos: [preset.conhecimentos[2]],
                contextualizacao: "Um misturador industrial de produtos químicos tem sofrido frequentes quebras mecânicas devido ao tranco de partida direta. Além disso, o processo exige variação de velocidade conforme a viscosidade da mistura. A gerência de manutenção solicitou a modernização do acionamento utilizando inversor de frequência com rampas de aceleração suaves e controle por potenciômetro externo.",
                observacoesDocente: "Estimular o raciocínio lógico na parametrização dos menus do inversor (dados de placa do motor, frequências máxima/mínima, frenagem por injeção CC).",
                desafio: "Integrar um inversor de frequência ao circuito do misturador, configurar todos os parâmetros do motor, implementar controle por entradas digitais/analógicas e testar a frenagem e aceleração com segurança.",
                resultadosEsperados: "Inversor de frequência parametrizado e acionando o motor em diferentes faixas de velocidade com relatório de parâmetros configurados.",
                estrategiasEnsino: "Projeto prático em bancada; Parametrização orientada no teclado (IHM) do inversor; Medição de harmônicos e corrente.",
                instrumentosAvaliacao: "Avaliação de desempenho prático; Relatório de parametrização e teste de bancada; Ficha de observação técnica.",
                recursos: "Bancadas didáticas com inversores de frequência industriais, motores elétricos, tacômetros e osciloscópios/analisadores de energia.",
                criterios: [
                    { row: 22, cap: preset.capacidadesTecnicas[3], crit: "Parametriza inversores de frequência e soft-starters de acordo com os dados de placa do motor e requisitos da aplicação.", tipo: "C" },
                    { row: 23, cap: "", crit: "Configura rampas de aceleração/desaceleração e limites de corrente otimizando o consumo de energia.", tipo: "D" },
                    { row: 24, cap: "Demonstrar raciocínio lógico", crit: "Interpreta os códigos de alarme e falha exibidos na IHM do acionamento propondo a solução correta.", tipo: "C" },
                    { row: 25, cap: "", crit: "Relaciona a variação de frequência com a variação de torque e rotação mecânica do motor.", tipo: "D" }
                ]
            },
            {
                numero: "03",
                titulo: "Diagnóstico de Falhas, Manutenção e Comissionamento",
                aulas: 24,
                estrategiaTipo: "Estudo de caso / Resolução de Problemas",
                capacidadesTecnicas: [preset.capacidadesTecnicas[2], preset.capacidadesTecnicas[4]],
                capacidadesSocioemocionais: [preset.capacidadesSocioemocionais[0], preset.capacidadesSocioemocionais[2]],
                conhecimentos: [preset.conhecimentos[3]],
                contextualizacao: "O setor de envase parou inesperadamente. O operador relata que a máquina tenta partir, mas desarma a proteção imediatamente, sem acionar o motor de bombeamento. Como técnico plantonista, você deve isolar a área, testar continuidade, isolamento e tensão nas fases, identificar o componente danificado e restabelecer a operação no menor tempo possível.",
                observacoesDocente: "Inserir falhas reais ou controladas nas bancadas (contato auxiliar oxidado, bobina aberta, desbalanceamento de fases). Avaliar a metodologia sequencial de teste dos alunos.",
                desafio: "Investigar e solucionar a falha oculta no painel de comando elétrico utilizando multímetro e alicate amperímetro, substituindo o componente defeituoso e liberando a máquina para operação segura.",
                resultadosEsperados: "Ordem de Serviço (OS) preenchida com diagnóstico detalhado, causa-raiz identificada, medições registradas e circuito recomposto em pleno funcionamento.",
                estrategiasEnsino: "Estudo de caso com falhas reais inseridas em bancada; Metodologia de árvore de falhas; Dinâmica de intervenção segura com bloqueio LOTO.",
                instrumentosAvaliacao: "Prova prática cronometrada de diagnóstico de falhas; Relatório de Ordem de Serviço de Manutenção; Checklist de procedimentos seguros de medição.",
                recursos: "Painéis elétricos industriais operacionais, kits de teste com falhas induzidas, alicates amperímetros e EPIs completos.",
                criterios: [
                    { row: 27, cap: preset.capacidadesTecnicas[4], crit: "Localiza e corrige falhas em circuitos elétricos de comando e potência utilizando instrumentos de medição de forma correta.", tipo: "C" },
                    { row: 28, cap: "", crit: "Executa testes de continuidade e isolamento elétrico antes de energizar o circuito reparado.", tipo: "D" },
                    { row: 29, cap: preset.capacidadesTecnicas[2], crit: "Monta e reforma painéis elétricos industriais respeitando códigos de cores de cabos e normas de segurança NR-10.", tipo: "C" },
                    { row: 30, cap: "", crit: "Registra os procedimentos executados na documentação técnica e ordem de serviço de maneira metódica.", tipo: "D" },
                    { row: 31, cap: "Demonstrar responsabilidade e trabalho em equipe", crit: "Aplica procedimentos rigorosos de bloqueio, travamento e sinalização (LOTO) durante as intervenções de manutenção.", tipo: "C" },
                    { row: 32, cap: "", crit: "Colabora ativamente com os colegas de equipe para agilizar o tempo de retorno da planta industrial.", tipo: "D" }
                ]
            }
        ];
        return base;
    }

    if (isAutomacao) {
        base.objetivoUC = "Desenvolver capacidades relativas à programação, configuração e validação de rotinas em Controladores Lógicos Programáveis (CLP) para automação de processos industriais.";
        base.situacoes = [
            {
                numero: "01",
                titulo: "Hardware, Linguagem Ladder e Intertravamentos",
                aulas: 20,
                estrategiaTipo: "Situação-problema",
                capacidadesTecnicas: [preset.capacidadesTecnicas[0], preset.capacidadesTecnicas[1]],
                capacidadesSocioemocionais: [preset.capacidadesSocioemocionais[0], preset.capacidadesSocioemocionais[2]],
                conhecimentos: [preset.conhecimentos[0], preset.conhecimentos[1]],
                contextualizacao: "Uma célula de paletização automática necessita de um sistema de controle programável para comandar cilindros pneumáticos e esteiras transportadoras com segurança contra acionamentos acidentais. A equipe de automação deve mapear as entradas e saídas do CLP e desenvolver a lógica Ladder com intertravamentos de emergência.",
                observacoesDocente: "Conduzir a programação em software de simulação e posterior download para o CLP físico.",
                desafio: "Elaborar o programa em linguagem Ladder contendo rotinas de partida/parada com selo, temporização de ciclo e botões de emergência monitorados.",
                resultadosEsperados: "Programa Ladder testado e validado em bancada didática com documentação comentada de cada linha de instrução.",
                estrategiasEnsino: "Exposição dialogada; Programação prática no laboratório; Simulação de sensores virtuais.",
                instrumentosAvaliacao: "Avaliação prática de lógica Ladder; Ficha de verificação de funcionamento do CLP.",
                recursos: "Computadores com software de programação de CLP, cabos de comunicação e bastidores didáticos de CLP.",
                criterios: [
                    { row: 15, cap: preset.capacidadesTecnicas[0], crit: "Identifica a configuração física de entradas e saídas digitais e analógicas do CLP.", tipo: "C" },
                    { row: 16, cap: "", crit: "Mapeia as variáveis e tags de memória conforme a tabela de conexões do projeto.", tipo: "D" },
                    { row: 17, cap: preset.capacidadesTecnicas[1], crit: "Desenvolve a lógica de controle em linguagem Ladder atendendo aos requisitos de funcionamento e intertravamento.", tipo: "C" },
                    { row: 18, cap: "", crit: "Insere comentários detalhados e documentação técnica nas rotinas do programa.", tipo: "D" },
                    { row: 19, cap: "Demonstrar raciocínio lógico", crit: "Estrutura blocos lógicos sequenciais evitando conflitos de estados em atuadores industriais.", tipo: "C" },
                    { row: 20, cap: "", crit: "Otimiza o número de linhas de código mantendo a clareza e manutenibilidade do programa.", tipo: "D" }
                ]
            },
            {
                numero: "02",
                titulo: "Funções Avançadas, Redes e Comissionamento",
                aulas: 20,
                estrategiaTipo: "Projeto",
                capacidadesTecnicas: [preset.capacidadesTecnicas[2], preset.capacidadesTecnicas[3]],
                capacidadesSocioemocionais: [preset.capacidadesSocioemocionais[1]],
                conhecimentos: [preset.conhecimentos[2], preset.conhecimentos[3]],
                contextualizacao: "Uma linha de envase automático requer a contagem precisa de frascos por caixa, controle de temperatura de selagem por sensor analógico e comunicação via rede industrial com o supervisório da planta.",
                observacoesDocente: "Trabalhar blocos de comparação e tratamento de grandezas analógicas (conversão A/D e escalas de engenharia).",
                desafio: "Implementar rotinas de contagem (CTU), blocos de temporização (TON) e tratamento de sinais analógicos no CLP, comunicando os dados via rede industrial.",
                resultadosEsperados: "Sistema automatizado executando a contagem de peças e controle de processo com monitoramento online de variáveis.",
                estrategiasEnsino: "Projeto prático em bancada; Configuração de rede industrial; Validação com simuladores de processos.",
                instrumentosAvaliacao: "Prova prática de comissionamento de CLP; Relatório técnico do projeto.",
                recursos: "Kits didáticos de CLP com módulos analógicos, sensores industriais e softwares de monitoramento.",
                criterios: [
                    { row: 22, cap: preset.capacidadesTecnicas[2], crit: "Configura parâmetros de comunicação em rede industrial para troca de dados com dispositivos de campo.", tipo: "C" },
                    { row: 23, cap: "", crit: "Diagnostica o status de comunicação dos nós da rede através de ferramentas de diagnóstico.", tipo: "D" },
                    { row: 24, cap: preset.capacidadesTecnicas[3], crit: "Valida as rotinas operacionais garantindo o cumprimento de todos os requisitos de segurança e produtividade.", tipo: "C" },
                    { row: 25, cap: "", crit: "Elabora o manual de operação e comissionamento da automação para a equipe de operadores.", tipo: "D" },
                    { row: 26, cap: "Demonstrar visão sistêmica", crit: "Articula a integração entre sensores, CLP, atuadores e interface de monitoramento compreendendo a planta global.", tipo: "C" },
                    { row: 27, cap: "", crit: "Propõe melhorias no ciclo de automação visando ganho de cadência e economia energética.", tipo: "D" }
                ]
            }
        ];
        return base;
    }

    return buildGenericDynamicPlan(overrides || preset);
}

function buildGenericDynamicPlan(courseInfo) {
    const totalHours = parseInt(courseInfo.workload) || 40;
    const courseName = courseInfo.courseName || "Curso Técnico de Formação";
    const sigla = courseInfo.unitSigla || "CURSO";
    const capsTec = courseInfo.capacidadesTecnicas && courseInfo.capacidadesTecnicas.length > 0
        ? courseInfo.capacidadesTecnicas
        : [
            `Identificar fundamentos e normas aplicáveis a ${courseName}.`,
            `Operar equipamentos e ferramentas específicas de ${courseName}.`,
            `Executar procedimentos técnicos e montagens de soluções em ${courseName}.`,
            `Validar a qualidade e conformidade das entregas técnicas.`
        ];
    const capsSocio = courseInfo.capacidadesSocioemocionais && courseInfo.capacidadesSocioemocionais.length > 0
        ? courseInfo.capacidadesSocioemocionais
        : ["Demonstrar atenção a detalhes.", "Demonstrar raciocínio lógico.", "Demonstrar responsabilidade e trabalho em equipe."];

    let numSAs = 2;
    if (totalHours <= 30) numSAs = 1;
    else if (totalHours <= 60) numSAs = 2;
    else if (totalHours <= 100) numSAs = 3;
    else numSAs = 4;

    const saHours = Math.floor(totalHours / numSAs);
    const remainder = totalHours % numSAs;

    const situacoes = [];
    let currentRow = 15;

    for (let i = 1; i <= numSAs; i++) {
        const hoursForSA = (i === numSAs) ? saHours + remainder : saHours;
        const saNum = String(i).padStart(2, '0');
        
        const startIdx = Math.floor(((i - 1) / numSAs) * capsTec.length);
        const endIdx = Math.max(startIdx + 1, Math.floor((i / numSAs) * capsTec.length));
        const assignedCaps = capsTec.slice(startIdx, endIdx);
        if (assignedCaps.length === 0) assignedCaps.push(capsTec[0]);

        const saCriterios = [];
        assignedCaps.forEach((capText) => {
            saCriterios.push({
                row: currentRow++,
                cap: capText,
                crit: `Executa com precisão as atividades técnicas relacionadas à ${capText.toLowerCase().replace(/\.$/, '')}.`,
                tipo: "C"
            });
            saCriterios.push({
                row: currentRow++,
                cap: "",
                crit: `Aplica boas práticas e normas de segurança pertinentes durante os procedimentos de ${courseName}.`,
                tipo: "D"
            });
        });

        const socioCap = capsSocio[(i - 1) % capsSocio.length];
        saCriterios.push({
            row: currentRow++,
            cap: socioCap,
            crit: `Demonstra postura profissional e ${socioCap.toLowerCase().replace(/\.$/, '')} na resolução das demandas propostas.`,
            tipo: "C"
        });
        saCriterios.push({
            row: currentRow++,
            cap: "",
            crit: `Colabora ativamente com os colegas cumprindo prazos e instruções com zelo e organização.`,
            tipo: "D"
        });

        currentRow++;

        situacoes.push({
            numero: saNum,
            titulo: `Situação de Aprendizagem ${saNum} - Aplicação Prática de ${courseName}`,
            aulas: hoursForSA,
            estrategiaTipo: (i === 1) ? "Situação-problema" : (i === numSAs ? "Estudo de caso / Projeto Integrador" : "Projeto"),
            capacidadesTecnicas: assignedCaps,
            capacidadesSocioemocionais: [socioCap],
            conhecimentos: [`Fundamentos, técnicas e procedimentos operacionais de ${courseName}.`],
            contextualizacao: `Uma empresa do setor industrial contratou sua equipe técnica para solucionar um desafio operacional relevante. O objetivo é analisar os requisitos do cliente, planejar as etapas de intervenção técnica e executar os procedimentos práticos de ${courseName} com máxima eficiência e qualidade.`,
            observacoesDocente: "Conduzir a mediação pedagógica estimulando o protagonismo dos alunos na resolução prática das tarefas em laboratório ou oficina.",
            desafio: `Como profissionais técnicos, planejar, desenvolver e validar a solução solicitada aplicando os conceitos e ferramentas de ${courseName}.`,
            resultadosEsperados: "Produto/serviço técnico concluído com conformidade, documentação técnica assinada e relatório de validação das entregas.",
            estrategiasEnsino: "Exposição dialogada; Aula prática de laboratório/oficina; Resolução colaborativa de problemas.",
            instrumentosAvaliacao: "Avaliação prática de desempenho; Relatório técnico de entrega; Ficha de observação comportamental.",
            recursos: "Ambiente pedagógico especializado (laboratório/oficina), ferramentas manuais e equipamentos específicos do curso.",
            criterios: saCriterios
        });
    }

    return {
        curso: courseName,
        unidade: courseInfo.courseUnit || courseName,
        sigla: sigla,
        cargaHoraria: totalHours,
        numAulas: `${totalHours} aulas de 60 minutos cada`,
        docente: courseInfo.docente || "Docente SENAI",
        turma: courseInfo.turma || "TURMA 2026",
        semAno: courseInfo.semAno || "2º Sem/2026",
        escola: courseInfo.escola || "Escola SENAI \"Mariano Ferraz\"",
        objetivoUC: `Desenvolver capacidades técnicas e socioemocionais relativas a ${courseName} de acordo com as diretrizes do MSEP.`,
        situacoes: situacoes
    };
}

// 100% Cross-Platform Pure JS XLSX Compiler (Works on Linux, Cloud, Windows, Docker)
function compileIRRACXlsx(courseData) {
    const tempDir = path.join(os.tmpdir(), `irrac_build_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    fs.cpSync(TEMPLATE_DIR, tempDir, { recursive: true });

    // 1. [Content_Types].xml
    const ctPath = path.join(tempDir, '[Content_Types].xml');
    let ctContent = fs.readFileSync(ctPath, 'utf8');
    ctContent = ctContent.replace(
        'application/vnd.ms-excel.sheet.macroEnabled.main+xml',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml'
    );
    fs.writeFileSync(ctPath, ctContent, 'utf8');

    // 2. xl/workbook.xml
    const wbPath = path.join(tempDir, 'xl', 'workbook.xml');
    let wbContent = fs.readFileSync(wbPath, 'utf8');
    wbContent = wbContent.replace(/name="Antigravity"/g, `name="${courseData.unitSigla}"`);
    fs.writeFileSync(wbPath, wbContent, 'utf8');

    // 3. String Table Management
    const sstPath = path.join(tempDir, 'xl', 'sharedStrings.xml');
    const sstRaw = fs.readFileSync(sstPath, 'utf8');

    const stringList = [];
    const sstMatches = sstRaw.matchAll(/<si>(.*?)<\/si>/gs);
    for (const m of sstMatches) {
        const tMatch = m[1].match(/<t[^>]*>(.*?)<\/t>/s);
        if (tMatch) {
            stringList.push(tMatch[1]);
        } else {
            const rMatches = [...m[1].matchAll(/<t[^>]*>(.*?)<\/t>/gs)];
            stringList.push(rMatches.map(r => r[1]).join(''));
        }
    }

    function getOrAddString(str) {
        const idx = stringList.indexOf(str);
        if (idx !== -1) return idx;
        stringList.push(str);
        return stringList.length - 1;
    }

    // 4. Update sheet2.xml (Cadastro)
    const s2Path = path.join(tempDir, 'xl', 'worksheets', 'sheet2.xml');
    let s2Content = fs.readFileSync(s2Path, 'utf8');

    const strCourseNameIdx = getOrAddString(courseData.courseName);
    const strUnitSiglaIdx = getOrAddString(courseData.unitSigla);
    const strTurmaIdx = getOrAddString(courseData.turma || "TURMA 2026");
    const strDocenteIdx = getOrAddString(courseData.docente || "Docente SENAI");
    const strSemAnoIdx = getOrAddString(courseData.semAno || "2º Sem/2026");

    s2Content = s2Content.replace(/<c r="D4"[^>]*><v>\d+<\/v><\/c>/, () => `<c r="D4" s="10" t="s"><v>${strCourseNameIdx}</v></c>`);
    s2Content = s2Content.replace(/<c r="D5"[^>]*><v>\d+<\/v><\/c>/, () => `<c r="D5" s="10" t="s"><v>${strTurmaIdx}</v></c>`);
    s2Content = s2Content.replace(/<c r="D6"[^>]*><v>\d+<\/v><\/c>/, () => `<c r="D6" s="10" t="s"><v>${strSemAnoIdx}</v></c>`);
    s2Content = s2Content.replace(/<c r="D7"[^>]*><v>\d+<\/v><\/c>/, () => `<c r="D7" s="10" t="s"><v>${strDocenteIdx}</v></c>`);
    s2Content = s2Content.replace(/<c r="D10"[^>]*><v>\d+<\/v><\/c>/, () => `<c r="D10" s="25" t="s"><v>${strCourseNameIdx}</v></c>`);
    s2Content = s2Content.replace(/<c r="E10"[^>]*><v>\d+<\/v><\/c>/, () => `<c r="E10" s="25" t="s"><v>${strUnitSiglaIdx}</v></c>`);
    s2Content = s2Content.replace(/<c r="F10"[^>]*><v>[\d.]+<\/v><\/c>/, () => `<c r="F10" s="26"><v>${courseData.workload || 40}</v></c>`);
    fs.writeFileSync(s2Path, s2Content, 'utf8');

    // 5. Update sheet1.xml (Home)
    const s1Path = path.join(tempDir, 'xl', 'worksheets', 'sheet1.xml');
    let s1Content = fs.readFileSync(s1Path, 'utf8');
    s1Content = s1Content.replace(/<c r="D14"([^>]*)><f>Cadastro!E10<\/f><v>[^<]*<\/v><\/c>/, () => `<c r="D14" s="67" t="str"><f>Cadastro!E10</f><v>${courseData.unitSigla}</v></c>`);
    fs.writeFileSync(s1Path, s1Content, 'utf8');

    const allCriteria = [];
    if (courseData.criteria && courseData.criteria.length > 0) {
        allCriteria.push(...courseData.criteria);
    } else if (courseData.situacoes) {
        courseData.situacoes.forEach(sa => {
            if (sa.criterios) {
                allCriteria.push(...sa.criterios);
            }
        });
    }

    let countCriticos = 0;
    let countDesejaveis = 0;
    allCriteria.forEach(c => {
        if (c.tipo === 'C') countCriticos++;
        if (c.tipo === 'D') countDesejaveis++;
    });

    const maxRowNumber = allCriteria.length > 0 ? Math.max(...allCriteria.map(c => c.row)) : 40;
    const evaluationRange = `$I$15:$I$${maxRowNumber}`;
    const matrixRange = `$J$15:$AD$${maxRowNumber}`;
    const offsetRange = `$J$15:$J$${maxRowNumber}`;

    // 6. Update sheet3.xml (Consolidação)
    const s3Path = path.join(tempDir, 'xl', 'worksheets', 'sheet3.xml');
    let s3Content = fs.readFileSync(s3Path, 'utf8');

    s3Content = s3Content.replace(/Antigravity!/g, `${courseData.unitSigla}!`);
    s3Content = s3Content.replace(/<c r="M1"[^>]*><f>.*?<\/f><v>.*?<\/v><\/c>/, () => `<c r="M1" s="10" t="str"><f>IF(Cadastro!$E$10=&quot;&quot;,&quot;&quot;,Cadastro!$E$10)</f><v>${courseData.unitSigla}</v></c>`);

    for (let r = 2; r <= 34; r++) {
        s3Content = s3Content.replace(new RegExp(`<c r="E${r}"[^>]*><v>[\\d.]+<\\/v><\\/c>`), () => `<c r="E${r}" s="1"><v>${countCriticos}</v></c>`);
        s3Content = s3Content.replace(new RegExp(`<f>SUMPRODUCT\\(\\(INDEX\\(${courseData.unitSigla}!\\$J\\$15:\\$AD\\$\\d+,,\\$B${r}\\)<>&quot;&quot;\\)\\*\\(INDEX\\(${courseData.unitSigla}!\\$J\\$15:\\$AD\\$\\d+,,\\$B${r}\\)<>&quot;N\\/A&quot;\\)\\)<\\/f>`), () => `<f>SUMPRODUCT((INDEX(${courseData.unitSigla}!${matrixRange},,$B${r})<>&quot;&quot;)*(INDEX(${courseData.unitSigla}!${matrixRange},,$B${r})<>&quot;N/A&quot;))</f>`);
        s3Content = s3Content.replace(new RegExp(`<f>COUNTIFS\\(${courseData.unitSigla}!\\$I\\$15:\\$I\\$\\d+,&quot;C&quot;,OFFSET\\(${courseData.unitSigla}!\\$J\\$15:\\$J\\$\\d+,0,ROW\\(A${r - 1}\\)-1\\),&quot;A&quot;\\)<\\/f>`), () => `<f>COUNTIFS(${courseData.unitSigla}!${evaluationRange},&quot;C&quot;,OFFSET(${courseData.unitSigla}!${offsetRange},0,ROW(A${r - 1})-1),&quot;A&quot;)</f>`);
        s3Content = s3Content.replace(new RegExp(`<f>COUNTIFS\\(${courseData.unitSigla}!\\$I\\$15:\\$I\\$\\d+,&quot;D&quot;,OFFSET\\(${courseData.unitSigla}!\\$J\\$15:\\$J\\$\\d+, 0, ROW\\(A${r - 1}\\)-1\\),&quot;A&quot;\\)<\\/f>`), () => `<f>COUNTIFS(${courseData.unitSigla}!${evaluationRange},&quot;D&quot;,OFFSET(${courseData.unitSigla}!${offsetRange}, 0, ROW(A${r - 1})-1),&quot;A&quot;)</f>`);
    }

    fs.writeFileSync(s3Path, s3Content, 'utf8');

    // 7. Update sheet4.xml (Unit Sheet)
    const s4Path = path.join(tempDir, 'xl', 'worksheets', 'sheet4.xml');
    let s4Content = fs.readFileSync(s4Path, 'utf8');

    s4Content = s4Content.replace(/<c r="A7"[^>]*><f>.*?<\/f><v>.*?<\/v><\/c>/, () => `<c r="A7" s="89" t="str"><f>Cadastro!D4</f><v>${courseData.courseName}</v></c>`);
    s4Content = s4Content.replace(/<c r="G7"[^>]*><f>.*?<\/f><v>.*?<\/v><\/c>/, () => `<c r="G7" s="89" t="str"><f>Cadastro!D10</f><v>${courseData.courseName}</v></c>`);
    s4Content = s4Content.replace(/<c r="AF7"[^>]*><f>.*?<\/f><v>.*?<\/v><\/c>/, () => `<c r="AF7" s="90" t="str"><f>Cadastro!F10</f><v>${courseData.workload || 40}</v></c>`);
    s4Content = s4Content.replace(/<c r="A9"[^>]*><f>.*?<\/f><v>.*?<\/v><\/c>/, () => `<c r="A9" s="89" t="str"><f>Cadastro!D7</f><v>${courseData.docente || "Docente SENAI"}</v></c>`);
    s4Content = s4Content.replace(/<c r="Q9"[^>]*><f>.*?<\/f><v>.*?<\/v><\/c>/, () => `<c r="Q9" s="89" t="str"><f>Cadastro!D5</f><v>${courseData.turma || "TURMA 2026"}</v></c>`);
    s4Content = s4Content.replace(/<c r="AF9"[^>]*><f>.*?<\/f><v>.*?<\/v><\/c>/, () => `<c r="AF9" s="90" t="str"><f>Cadastro!D6</f><v>${courseData.semAno || "2º Sem/2026"}</v></c>`);

    const studentCols = ['J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP'];
    const strAIdx = getOrAddString('A');

    for (const c of allCriteria) {
        const rowNum = c.row;
        let rowXml = `<row r="${rowNum}" ht="30" customHeight="1">`;
        
        if (c.cap) {
            const capIdx = getOrAddString(c.cap);
            rowXml += `<c r="A${rowNum}" s="94" t="s"><v>${capIdx}</v></c>`;
        }
        
        const critStyle = (c.tipo === 'C') ? "95" : "98";
        const critIdx = getOrAddString(c.crit);
        rowXml += `<c r="E${rowNum}" s="${critStyle}" t="s"><v>${critIdx}</v></c>`;
        
        const tipoIdx = getOrAddString(c.tipo);
        rowXml += `<c r="I${rowNum}" s="96" t="s"><v>${tipoIdx}</v></c>`;
        
        for (let i = 0; i < studentCols.length; i++) {
            const col = studentCols[i];
            if (i < 10) {
                rowXml += `<c r="${col}${rowNum}" s="97" t="s"><v>${strAIdx}</v></c>`;
            } else {
                rowXml += `<c r="${col}${rowNum}" s="97"/>`;
            }
        }
        
        rowXml += `</row>`;
        
        const rowPattern = new RegExp(`<row r="${rowNum}"[^>]*>.*?<\\/row>`, 's');
        if (rowPattern.test(s4Content)) {
            s4Content = s4Content.replace(rowPattern, () => rowXml);
        }
    }

    fs.writeFileSync(s4Path, s4Content, 'utf8');

    // 8. Rebuild xl/sharedStrings.xml
    let newSstXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst count="${stringList.length}" uniqueCount="${stringList.length}" xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">`;
    for (const s of stringList) {
        const escaped = String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
        
        if (escaped.includes('\n') || escaped.startsWith(' ') || escaped.endsWith(' ')) {
            newSstXml += `<si><t xml:space="preserve">${escaped}</t></si>`;
        } else {
            newSstXml += `<si><t>${escaped}</t></si>`;
        }
    }
    newSstXml += `</sst>`;
    fs.writeFileSync(sstPath, newSstXml, 'utf8');

    // 9. Pure JavaScript Zip with AdmZip (Multiplatform)
    const zip = new AdmZip();

    function addDirToZip(currentDir, relativePath) {
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            const itemPath = path.join(currentDir, item);
            const itemRelPath = relativePath ? `${relativePath}/${item}` : item;
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
                addDirToZip(itemPath, itemRelPath);
            } else {
                const content = fs.readFileSync(itemPath);
                zip.addFile(itemRelPath, content);
            }
        }
    }

    addDirToZip(tempDir, '');
    const fileBuffer = zip.toBuffer();

    try {
        fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}

    return fileBuffer;
}

// HTTP Server
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;

    if (pathname === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'online', version: '2.0.0', time: new Date() }));
        return;
    }

    if (pathname === '/api/samples' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(SAMPLE_COURSES));
        return;
    }

    if (pathname === '/api/generate-msep' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const plan = generateMSEPPlan(data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, plan }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    if (pathname === '/api/export-irrac' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const courseData = JSON.parse(body);
                const xlsxBuffer = compileIRRACXlsx(courseData);
                
                const safeName = (courseData.unitSigla || 'IRRAC').replace(/[^a-zA-Z0-9-_]/g, '_');
                res.writeHead(200, {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="IRRAC - ${safeName}.xlsx"`,
                    'Content-Length': xlsxBuffer.length
                });
                res.end(xlsxBuffer);
            } catch (err) {
                console.error('Error exporting IRRAC:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    if (pathname === '/api/save-to-workspace' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { type, fileName, content, isBinary } = JSON.parse(body);
                let targetDir = WORKSPACE_DIR;
                if (type === 'irrac') targetDir = path.join(WORKSPACE_DIR, 'IRRACs');
                if (type === 'plano') targetDir = path.join(WORKSPACE_DIR, 'Planos de Ensino');

                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                const filePath = path.join(targetDir, fileName);
                if (isBinary) {
                    fs.writeFileSync(filePath, Buffer.from(content, 'base64'));
                } else {
                    fs.writeFileSync(filePath, content, 'utf8');
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, path: filePath }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // Static files
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';
    
    const filePath = path.join(PUBLIC_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 - Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SENAI MSEP & IRRAC SUITE ONLINE (PORTA ${PORT})`);
    console.log(`🌐 Acesse no navegador: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
