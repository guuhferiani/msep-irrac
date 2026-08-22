// State Management
let currentStep = 1;
let sampleCourses = {};
let currentCourseData = {
    courseKey: "chatgpt",
    courseName: "Inteligências Artificiais Generativas Aplicada a Programação – ChatGPT",
    courseUnit: "Inteligências Artificiais Generativas Aplicada a Programação – ChatGPT",
    unitSigla: "ChatGPT",
    workload: 48,
    turma: "IAGP 2614IB",
    semAno: "2º Sem/2026",
    docente: "Gustavo da Silva Feriani",
    escola: "Escola SENAI \"Mariano Ferraz\""
};
let currentMsepPlan = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    initEventListeners();
    await fetchSamples();
    loadPresetCourse('chatgpt');
});

// Fetch Preloaded Samples from Backend
async function fetchSamples() {
    try {
        const res = await fetch('/api/samples');
        if (res.ok) {
            sampleCourses = await res.json();
        }
    } catch (err) {
        console.warn('Using default local samples', err);
    }
}

// Event Listeners Initialization
function initEventListeners() {
    // Stepper buttons
    document.querySelectorAll('.step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.dataset.step);
            goToStep(step);
        });
    });

    // Preset cards
    document.querySelectorAll('.preset-card').forEach(card => {
        card.addEventListener('click', () => {
            const presetKey = card.dataset.preset;
            loadPresetCourse(presetKey);
        });
    });

    // Dropzone & File Upload
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const btnBrowse = document.getElementById('btn-browse-file');

    btnBrowse.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Navigation buttons
    document.getElementById('btn-back-step-1').addEventListener('click', () => goToStep(1));
    document.getElementById('btn-generate-msep-flow').addEventListener('click', handleGenerateMSEP);
    document.getElementById('btn-proceed-export').addEventListener('click', () => {
        syncMsepPlanFromUI();
        renderExportAndDocView();
        goToStep(4);
    });

    // Dynamic SA Control: Add new SA
    document.getElementById('btn-add-sa').addEventListener('click', handleAddNewSA);

    // Export buttons
    document.getElementById('btn-download-xlsx').addEventListener('click', handleDownloadIRRAC);
    document.getElementById('btn-save-irrac-workspace').addEventListener('click', handleSaveIRRACToWorkspace);
    document.getElementById('btn-print-plano').addEventListener('click', () => window.print());
    document.getElementById('btn-toggle-plano-preview').addEventListener('click', () => {
        const docView = document.getElementById('official-doc-view');
        docView.scrollIntoView({ behavior: 'smooth' });
    });

    // Header Quick Samples
    document.getElementById('btn-quick-samples').addEventListener('click', () => goToStep(1));
}

// Step Navigation
function goToStep(stepNumber) {
    currentStep = stepNumber;

    document.querySelectorAll('.step-btn').forEach(btn => {
        const step = parseInt(btn.dataset.step);
        if (step === currentStep) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.step-view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`step-${currentStep}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load Preset Course
function loadPresetCourse(presetKey) {
    document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active-preset'));
    const targetCard = document.getElementById(`preset-${presetKey}`);
    if (targetCard) targetCard.classList.add('active-preset');

    if (sampleCourses[presetKey]) {
        currentCourseData = { courseKey: presetKey, ...sampleCourses[presetKey] };
    }

    // Populate Step 2 Inputs
    document.getElementById('inp-course-name').value = currentCourseData.courseName || '';
    document.getElementById('inp-unit-sigla').value = currentCourseData.unitSigla || '';
    document.getElementById('inp-workload').value = currentCourseData.workload || 40;
    document.getElementById('inp-school').value = currentCourseData.escola || 'Escola SENAI "Mariano Ferraz"';
    document.getElementById('inp-docente').value = currentCourseData.docente || 'Docente SENAI';
    document.getElementById('inp-turma').value = currentCourseData.turma || 'TURMA 2026';
    document.getElementById('inp-sem-ano').value = currentCourseData.semAno || '2º Sem/2026';

    document.getElementById('selected-course-badge').textContent = `${currentCourseData.area || 'Curso'}: ${currentCourseData.unitSigla}`;

    showToast(`Curso "${currentCourseData.courseName.substring(0, 30)}..." carregado!`);
    goToStep(2);
}

// Handle Custom File Upload
function handleFileUpload(file) {
    const fileName = file.name.toLowerCase();
    showToast(`Arquivo "${file.name}" carregado. Analisando matriz curricular...`);

    if (fileName.includes('chatgpt')) {
        loadPresetCourse('chatgpt');
    } else if (fileName.includes('antigravity')) {
        loadPresetCourse('antigravity');
    } else if (fileName.includes('eletri') || fileName.includes('comando')) {
        loadPresetCourse('eletrica');
    } else if (fileName.includes('clp') || fileName.includes('automa')) {
        loadPresetCourse('automacao');
    } else {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        currentCourseData = {
            courseKey: 'custom',
            courseName: cleanName.toUpperCase(),
            courseUnit: cleanName.toUpperCase(),
            unitSigla: cleanName.substring(0, 8).toUpperCase(),
            workload: 40,
            turma: "TURMA 2026",
            semAno: "2º Sem/2026",
            docente: "Docente SENAI",
            escola: 'Escola SENAI "Mariano Ferraz"'
        };

        document.getElementById('inp-course-name').value = currentCourseData.courseName;
        document.getElementById('inp-unit-sigla').value = currentCourseData.unitSigla;
        document.getElementById('inp-workload').value = currentCourseData.workload;
        document.getElementById('selected-course-badge').textContent = currentCourseData.unitSigla;
        goToStep(2);
    }
}

// Generate MSEP Plan via Backend API
async function handleGenerateMSEP() {
    currentCourseData.courseName = document.getElementById('inp-course-name').value;
    currentCourseData.courseUnit = document.getElementById('inp-course-name').value;
    currentCourseData.unitSigla = document.getElementById('inp-unit-sigla').value;
    currentCourseData.workload = parseInt(document.getElementById('inp-workload').value) || 40;
    currentCourseData.escola = document.getElementById('inp-school').value;
    currentCourseData.docente = document.getElementById('inp-docente').value;
    currentCourseData.turma = document.getElementById('inp-turma').value;
    currentCourseData.semAno = document.getElementById('inp-sem-ano').value;

    showToast('Gerando Situações de Aprendizagem MSEP Modular...');

    try {
        const response = await fetch('/api/generate-msep', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentCourseData)
        });

        if (response.ok) {
            const data = await response.json();
            currentMsepPlan = data.plan;
            renderMSEPViewer();
            goToStep(3);
            showToast(`Plano MSEP gerado com ${currentMsepPlan.situacoes.length} Situações de Aprendizagem!`);
        } else {
            throw new Error('Falha na resposta do servidor');
        }
    } catch (err) {
        console.error('Error generating MSEP:', err);
        showToast('Erro ao gerar MSEP. Verifique os dados inseridos.');
    }
}

// Update Hours Balance Indicator
function updateHoursBalanceIndicator() {
    if (!currentMsepPlan) return;

    let totalAllocated = 0;
    currentMsepPlan.situacoes.forEach(sa => {
        totalAllocated += parseInt(sa.aulas) || 0;
    });

    const targetWorkload = parseInt(currentMsepPlan.cargaHoraria) || 40;
    const pill = document.getElementById('hours-balance-pill');
    document.getElementById('hours-allocated').textContent = totalAllocated;
    document.getElementById('hours-total').textContent = targetWorkload;

    if (totalAllocated === targetWorkload) {
        pill.classList.remove('mismatch');
        pill.title = "Carga horária perfeitamente balanceada!";
    } else {
        pill.classList.add('mismatch');
        pill.title = `Atenção: A soma das SAs (${totalAllocated}h) difere da carga horária total (${targetWorkload}h)`;
    }
}

// Render Interactive MSEP Editor (Step 3)
function renderMSEPViewer() {
    if (!currentMsepPlan) return;

    const container = document.getElementById('sa-container');
    container.innerHTML = '';

    document.getElementById('msep-view-title').textContent = `${currentMsepPlan.curso}`;
    updateHoursBalanceIndicator();

    currentMsepPlan.situacoes.forEach((sa, saIdx) => {
        const saCard = document.createElement('div');
        saCard.className = 'sa-card';
        saCard.id = `sa-card-${saIdx}`;
        saCard.innerHTML = `
            <div class="sa-card-header">
                <div class="sa-title-wrap">
                    <span class="sa-badge">SA ${sa.numero}</span>
                    <input type="text" class="form-control sa-title-input" data-sa-idx="${saIdx}" value="${sa.titulo}" style="font-weight: 700; font-size: 1.05rem;">
                </div>
                <div class="sa-header-controls">
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                        <input type="number" class="form-control form-control-sm sa-hours-input" data-sa-idx="${saIdx}" value="${sa.aulas}" style="width: 70px; text-align: center;" title="Horas desta SA">
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Aulas</span>
                    </div>
                    <button class="btn btn-danger btn-xs btn-delete-sa" data-sa-idx="${saIdx}" title="Excluir esta Situação de Aprendizagem">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Excluir SA
                    </button>
                </div>
            </div>

            <div class="sa-grid">
                <div class="sa-section-block">
                    <h4>🏢 Contextualização (Cenário / Empresa Simulada)</h4>
                    <textarea class="sa-context-input" data-sa-idx="${saIdx}" rows="5">${sa.contextualizacao}</textarea>
                </div>

                <div class="sa-section-block">
                    <h4>🎯 Desafio Prático & Entregas</h4>
                    <textarea class="sa-desafio-input" data-sa-idx="${saIdx}" rows="5">${sa.desafio}</textarea>
                </div>
            </div>

            <div class="sa-grid">
                <div class="sa-section-block">
                    <h4>👨‍🏫 Mediação e Observações para o Docente</h4>
                    <textarea class="sa-obs-input" data-sa-idx="${saIdx}" rows="3">${sa.observacoesDocente}</textarea>
                </div>

                <div class="sa-section-block">
                    <h4>📦 Resultados Esperados (Entregáveis)</h4>
                    <textarea class="sa-res-input" data-sa-idx="${saIdx}" rows="3">${sa.resultadosEsperados}</textarea>
                </div>
            </div>

            <!-- Criteria Table for this SA -->
            <div style="margin-top: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">📋 Matriz de Critérios de Avaliação (IRRAC)</h4>
                    <button class="btn btn-outline btn-xs btn-add-crit" data-sa-idx="${saIdx}">+ Adicionar Critério</button>
                </div>
                <table class="criteria-table" id="criteria-table-${saIdx}">
                    <thead>
                        <tr>
                            <th style="width: 25%;">Capacidade</th>
                            <th style="width: 50%;">Critério de Desempenho Observável</th>
                            <th style="width: 18%; text-align: center;">Classificação</th>
                            <th style="width: 7%; text-align: center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="criteria-tbody-${saIdx}">
                        ${sa.criterios.map((c, cIdx) => `
                            <tr id="crit-row-${saIdx}-${cIdx}">
                                <td>
                                    <input type="text" class="form-control form-control-sm crit-cap-input" data-sa-idx="${saIdx}" data-c-idx="${cIdx}" value="${c.cap || ''}" placeholder="(Continuação)">
                                </td>
                                <td>
                                    <input type="text" class="form-control form-control-sm crit-text-input" data-sa-idx="${saIdx}" data-c-idx="${cIdx}" value="${c.crit}" style="${c.tipo === 'C' ? 'font-weight: 700;' : ''}">
                                </td>
                                <td style="text-align: center;">
                                    <select class="form-control form-control-sm crit-tipo-select" data-sa-idx="${saIdx}" data-c-idx="${cIdx}" style="text-align: center;">
                                        <option value="C" ${c.tipo === 'C' ? 'selected' : ''}>Crítico (C)</option>
                                        <option value="D" ${c.tipo === 'D' ? 'selected' : ''}>Desejável (D)</option>
                                    </select>
                                </td>
                                <td style="text-align: center;">
                                    <button class="btn btn-outline btn-xs btn-delete-crit" data-sa-idx="${saIdx}" data-c-idx="${cIdx}" title="Excluir linha">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        container.appendChild(saCard);
    });

    attachDynamicMSEPHandlers();
}

// Attach Event Listeners to Dynamically Rendered MSEP Elements
function attachDynamicMSEPHandlers() {
    // Hours inputs
    document.querySelectorAll('.sa-hours-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
            const saIdx = parseInt(e.target.dataset.saIdx);
            currentMsepPlan.situacoes[saIdx].aulas = parseInt(e.target.value) || 0;
            updateHoursBalanceIndicator();
        });
    });

    // Delete SA buttons
    document.querySelectorAll('.btn-delete-sa').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const saIdx = parseInt(btn.dataset.saIdx);
            if (currentMsepPlan.situacoes.length <= 1) {
                showToast('O Plano de Ensino precisa ter pelo menos 1 Situação de Aprendizagem.');
                return;
            }
            syncMsepPlanFromUI();
            currentMsepPlan.situacoes.splice(saIdx, 1);
            // Renumber SAs
            currentMsepPlan.situacoes.forEach((sa, i) => {
                sa.numero = String(i + 1).padStart(2, '0');
            });
            renderMSEPViewer();
            showToast('Situação de Aprendizagem removida.');
        });
    });

    // Add Criterion buttons
    document.querySelectorAll('.btn-add-crit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const saIdx = parseInt(btn.dataset.saIdx);
            syncMsepPlanFromUI();
            currentMsepPlan.situacoes[saIdx].criterios.push({
                row: 15 + currentMsepPlan.situacoes[saIdx].criterios.length,
                cap: "",
                crit: "Executa os procedimentos técnicos atendendo aos requisitos de qualidade e segurança estabelecidos.",
                tipo: "C"
            });
            renderMSEPViewer();
            showToast('Novo critério adicionado.');
        });
    });

    // Delete Criterion buttons
    document.querySelectorAll('.btn-delete-crit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const saIdx = parseInt(btn.dataset.saIdx);
            const cIdx = parseInt(btn.dataset.cIdx);
            syncMsepPlanFromUI();
            currentMsepPlan.situacoes[saIdx].criterios.splice(cIdx, 1);
            renderMSEPViewer();
        });
    });
}

// Add New SA
function handleAddNewSA() {
    if (!currentMsepPlan) return;
    syncMsepPlanFromUI();

    const newNum = String(currentMsepPlan.situacoes.length + 1).padStart(2, '0');
    currentMsepPlan.situacoes.push({
        numero: newNum,
        titulo: `Situação de Aprendizagem ${newNum} - Projeto Prático Aplicado`,
        aulas: 10,
        estrategiaTipo: "Projeto",
        capacidadesTecnicas: ["Executar rotinas e procedimentos técnicos da especialidade."],
        capacidadesSocioemocionais: ["Demonstrar atenção a detalhes.", "Demonstrar responsabilidade."],
        conhecimentos: ["Técnicas avançadas e boas práticas profissionais."],
        contextualizacao: "Uma nova demanda operacional surge no setor industrial requerendo análise técnica, planejamento e intervenção prática com foco em produtividade e qualidade.",
        observacoesDocente: "Orientar os alunos na aplicação autônoma dos conhecimentos prévios e incentivar o trabalho em equipe.",
        desafio: "Planejar, implementar e documentar a solução técnica solicitada atendendo aos padrões de engenharia e segurança.",
        resultadosEsperados: "Produto/serviço técnico concluído com relatório de validação assinado.",
        estrategiasEnsino: "Projeto prático em equipe; Aula em laboratório/oficina; Apresentação técnica.",
        instrumentosAvaliacao: "Avaliação de desempenho prático; Relatório técnico do projeto.",
        recursos: "Ambiente pedagógico especializado e ferramentas do curso.",
        criterios: [
            { row: 15, cap: "Capacidade Técnica Adicional", crit: "Executa os procedimentos com precisão e conformidade técnica.", tipo: "C" },
            { row: 16, cap: "", crit: "Aplica normas e regulamentações de segurança aplicáveis à área.", tipo: "D" },
            { row: 17, cap: "Demonstrar responsabilidade", crit: "Cumpre os prazos e diretrizes técnicas do projeto de forma metódica.", tipo: "C" },
            { row: 18, cap: "", crit: "Demonstra postura colaborativa e organização no ambiente de trabalho.", tipo: "D" }
        ]
    });

    renderMSEPViewer();
    showToast(`Situação de Aprendizagem ${newNum} adicionada!`);
}

// Synchronize edits made in Step 3 UI back into state
function syncMsepPlanFromUI() {
    if (!currentMsepPlan) return;

    let globalRowCounter = 15;

    currentMsepPlan.situacoes.forEach((sa, saIdx) => {
        const titleInp = document.querySelector(`.sa-title-input[data-sa-idx="${saIdx}"]`);
        if (titleInp) sa.titulo = titleInp.value;

        const hoursInp = document.querySelector(`.sa-hours-input[data-sa-idx="${saIdx}"]`);
        if (hoursInp) sa.aulas = parseInt(hoursInp.value) || 0;

        const ctxInp = document.querySelector(`.sa-context-input[data-sa-idx="${saIdx}"]`);
        if (ctxInp) sa.contextualizacao = ctxInp.value;

        const desafioInp = document.querySelector(`.sa-desafio-input[data-sa-idx="${saIdx}"]`);
        if (desafioInp) sa.desafio = desafioInp.value;

        const obsInp = document.querySelector(`.sa-obs-input[data-sa-idx="${saIdx}"]`);
        if (obsInp) sa.observacoesDocente = obsInp.value;

        const resInp = document.querySelector(`.sa-res-input[data-sa-idx="${saIdx}"]`);
        if (resInp) sa.resultadosEsperados = resInp.value;

        sa.criterios.forEach((c, cIdx) => {
            const capInp = document.querySelector(`.crit-cap-input[data-sa-idx="${saIdx}"][data-c-idx="${cIdx}"]`);
            if (capInp) c.cap = capInp.value;

            const textInp = document.querySelector(`.crit-text-input[data-sa-idx="${saIdx}"][data-c-idx="${cIdx}"]`);
            if (textInp) c.crit = textInp.value;

            const tipoSel = document.querySelector(`.crit-tipo-select[data-sa-idx="${saIdx}"][data-c-idx="${cIdx}"]`);
            if (tipoSel) c.tipo = tipoSel.value;

            c.row = globalRowCounter++;
        });

        globalRowCounter++; // blank row separator between SAs in sheet
    });
}

// Render Step 4: Export Summary & Printable Official SENAI Document
function renderExportAndDocView() {
    if (!currentMsepPlan) return;

    let totalCrit = 0;
    let totalDesej = 0;

    currentMsepPlan.situacoes.forEach(sa => {
        sa.criterios.forEach(c => {
            if (c.tipo === 'C') totalCrit++;
            if (c.tipo === 'D') totalDesej++;
        });
    });

    document.getElementById('stat-crit-count').textContent = totalCrit;
    document.getElementById('stat-desej-count').textContent = totalDesej;
    document.getElementById('stat-total-count').textContent = totalCrit + totalDesej;

    const docContainer = document.getElementById('printable-doc-content');
    
    let docHTML = `
        <div class="senai-doc-header">
            <h1>${currentMsepPlan.escola}</h1>
            <h2>PLANO DE ENSINO</h2>
            <div class="senai-banner-black">SITUAÇÃO DE APRENDIZAGEM</div>
        </div>

        <table class="senai-table-doc">
            <tr>
                <td colspan="2"><strong>Curso:</strong> ${currentMsepPlan.curso}</td>
            </tr>
            <tr>
                <td colspan="2"><strong>Unidade Curricular (UC):</strong> ${currentMsepPlan.unidade}</td>
            </tr>
            <tr>
                <td style="width: 50%;"><strong>Carga horária da UC:</strong> ${currentMsepPlan.cargaHoraria} horas</td>
                <td style="width: 50%;"><strong>Nº de aulas:</strong> ${currentMsepPlan.numAulas}</td>
            </tr>
            <tr>
                <td colspan="2">
                    <strong>Carga horária prevista para o desenvolvimento da Situação de Aprendizagem:</strong><br>
                    ${currentMsepPlan.situacoes.map(sa => `• Situação de Aprendizagem ${sa.numero}: ${sa.aulas} aulas`).join('<br>')}
                </td>
            </tr>
            <tr>
                <td colspan="2"><strong>Objetivo da UC:</strong> ${currentMsepPlan.objetivoUC}</td>
            </tr>
        </table>
    `;

    currentMsepPlan.situacoes.forEach((sa, idx) => {
        docHTML += `
            <div class="${idx > 0 ? 'print-page-break' : ''}">
                <div class="doc-sa-title">SITUAÇÃO DE APRENDIZAGEM ${sa.numero} - ${sa.titulo}</div>
                
                <table class="senai-table-doc">
                    <tr>
                        <td>
                            <strong>Capacidades Técnicas:</strong><br>
                            ${(sa.capacidadesTecnicas || []).map(c => `• ${c}`).join('<br>')}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Capacidades Socioemocionais:</strong><br>
                            ${(sa.capacidadesSocioemocionais || []).map(c => `• ${c}`).join('<br>')}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Conhecimentos Relacionados:</strong><br>
                            ${(sa.conhecimentos || []).map(k => `• ${k}`).join('<br>')}
                        </td>
                    </tr>
                </table>

                <table class="senai-table-doc">
                    <tr>
                        <th>Estratégia de aprendizagem ${sa.numero}: ${sa.estrategiaTipo}</th>
                    </tr>
                    <tr>
                        <td>
                            <strong>Contextualização:</strong><br>
                            ${sa.contextualizacao}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Observações para o docente:</strong><br>
                            ${sa.observacoesDocente}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Desafio:</strong><br>
                            ${sa.desafio}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <strong>Resultados esperados:</strong><br>
                            ${sa.resultadosEsperados}
                        </td>
                    </tr>
                </table>

                <div class="doc-sa-title">ESTRATÉGIAS DE ENSINO, INSTRUMENTOS DE AVALIAÇÃO E RECURSOS DIDÁTICOS</div>
                <table class="senai-table-doc">
                    <thead>
                        <tr>
                            <th style="width: 15%;">Nº Horas / Aulas</th>
                            <th style="width: 45%;">Estratégias de Ensino e Instrumentos de Avaliação</th>
                            <th style="width: 40%;">Recursos e Ambientes Pedagógicos</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${sa.aulas} aulas</td>
                            <td>
                                <strong>Estratégias de Ensino:</strong><br>${sa.estrategiasEnsino}<br><br>
                                <strong>Instrumentos de Avaliação:</strong><br>${sa.instrumentosAvaliacao}
                            </td>
                            <td>${sa.recursos}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="doc-sa-title">INSTRUMENTO DE REGISTRO - CRITÉRIOS DE AVALIAÇÃO</div>
                <table class="senai-table-doc">
                    <thead>
                        <tr>
                            <th style="width: 30%;">Capacidade</th>
                            <th style="width: 55%;">Critérios de Avaliação</th>
                            <th style="width: 15%; text-align: center;">Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sa.criterios.map(c => `
                            <tr>
                                <td>${c.cap || '-'}</td>
                                <td class="${c.tipo === 'C' ? 'doc-bold' : ''}">${c.crit}</td>
                                <td style="text-align: center; font-weight: bold;">${c.tipo === 'C' ? 'Crítico (C)' : 'Desejável (D)'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });

    // Performance Conversion Table
    docHTML += `
        <div class="print-page-break">
            <div class="senai-doc-header">
                <h2>TABELA DE NÍVEIS DE DESEMPENHO E CONVERSÃO</h2>
            </div>
            <table class="senai-table-doc">
                <thead>
                    <tr>
                        <th style="width: 60%;">Critérios de Avaliação</th>
                        <th style="width: 20%; text-align: center;">Nível de Desempenho</th>
                        <th style="width: 20%; text-align: center;">Conversão em Notas</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Atingiu 100% dos critérios críticos (${totalCrit})</td><td style="text-align:center;">5</td><td style="text-align:center;">100</td></tr>
                    <tr><td>Atingiu no mínimo 80% dos critérios críticos</td><td style="text-align:center;">4</td><td style="text-align:center;">85</td></tr>
                    <tr><td>Atingiu no mínimo 60% dos critérios críticos</td><td style="text-align:center;">3</td><td style="text-align:center;">65</td></tr>
                    <tr><td>Atingiu no mínimo 40% dos critérios críticos</td><td style="text-align:center;">2</td><td style="text-align:center;">45</td></tr>
                    <tr><td>Atingiu menos de 40% dos critérios críticos</td><td style="text-align:center;">1</td><td style="text-align:center;">25</td></tr>
                </tbody>
            </table>
        </div>
    `;

    docContainer.innerHTML = docHTML;
}

// Download IRRAC XLSX File
async function handleDownloadIRRAC() {
    syncMsepPlanFromUI();
    showToast('Compilando planilha XLSX oficial...');

    const payload = {
        courseName: currentMsepPlan.curso,
        unitSigla: currentMsepPlan.sigla,
        workload: currentMsepPlan.cargaHoraria,
        turma: currentMsepPlan.turma,
        semAno: currentMsepPlan.semAno,
        docente: currentMsepPlan.docente,
        escola: currentMsepPlan.escola,
        situacoes: currentMsepPlan.situacoes
    };

    try {
        const response = await fetch('/api/export-irrac', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `IRRAC - ${currentMsepPlan.sigla}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            showToast(`Planilha "IRRAC - ${currentMsepPlan.sigla}.xlsx" baixada com sucesso!`);
        } else {
            throw new Error('Falha ao compilar XLSX');
        }
    } catch (err) {
        console.error('Download error:', err);
        showToast('Erro ao baixar planilha. Tente novamente.');
    }
}

// Save IRRAC directly into the workspace folder
async function handleSaveIRRACToWorkspace() {
    syncMsepPlanFromUI();
    showToast('Salvando na pasta /IRRACs...');

    const payload = {
        courseName: currentMsepPlan.curso,
        unitSigla: currentMsepPlan.sigla,
        workload: currentMsepPlan.cargaHoraria,
        turma: currentMsepPlan.turma,
        semAno: currentMsepPlan.semAno,
        docente: currentMsepPlan.docente,
        escola: currentMsepPlan.escola,
        situacoes: currentMsepPlan.situacoes
    };

    try {
        const response = await fetch('/api/export-irrac', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
            
            const saveRes = await fetch('/api/save-to-workspace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'irrac',
                    fileName: `IRRAC - ${currentMsepPlan.sigla}.xlsx`,
                    content: base64,
                    isBinary: true
                })
            });

            if (saveRes.ok) {
                const resData = await saveRes.json();
                showToast(`Salvo em: ${resData.path}`);
            }
        }
    } catch (err) {
        console.error('Save error:', err);
        showToast('Erro ao salvar no workspace.');
    }
}

// Toast Helper
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}
