// ==========================================================================
// DOCENTE SENAI - STATE MANAGEMENT & LOCAL STORAGE
// Workflow: From Scratch (File Upload / Direct Input)
// ==========================================================================

const STORAGE_KEY = 'docente_senai_state_v3';

let currentStep = 1;
let currentCourseData = {
    courseKey: "custom",
    courseName: "",
    courseUnit: "",
    unitSigla: "",
    workload: "",
    turma: "",
    semAno: "",
    docente: "",
    escola: 'Escola SENAI "Mariano Ferraz"',
    fileName: null
};
let currentMsepPlan = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();

    // Check for saved local state
    const hasSavedState = loadFromLocalStorage();
    if (hasSavedState && currentCourseData && (currentCourseData.courseName || currentCourseData.fileName || currentMsepPlan)) {
        populateStep2Inputs();
        updateStep1FileCard();
        if (currentMsepPlan) {
            renderMSEPViewer();
            renderExportAndDocView();
        }
        goToStep(currentStep || 1, false);
        setStorageStatus('Rascunho recuperado', true);
    } else {
        resetFormToBlank();
        goToStep(1, false);
    }
});

// Event Listeners Initialization
function initEventListeners() {
    // Stepper buttons
    document.querySelectorAll('.step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.dataset.step);
            goToStep(step);
        });
    });

    // Step 1 Continue Button
    document.getElementById('btn-step1-continue').addEventListener('click', () => {
        goToStep(2);
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

    // Remove attached file button
    const btnRemoveFile = document.getElementById('btn-remove-attached-file');
    if (btnRemoveFile) {
        btnRemoveFile.addEventListener('click', (e) => {
            e.stopPropagation();
            handleRemoveAttachedFile();
        });
    }

    // Step 2 live input listeners for real-time saving
    const step2Inputs = ['inp-course-name', 'inp-unit-sigla', 'inp-workload', 'inp-school', 'inp-docente', 'inp-turma', 'inp-sem-ano'];
    step2Inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                syncCourseDataFromInputs();
                saveToLocalStorage();
            });
        }
    });

    // Navigation buttons
    document.getElementById('btn-back-step-1').addEventListener('click', () => goToStep(1));
    document.getElementById('btn-generate-msep-flow').addEventListener('click', handleGenerateMSEP);
    document.getElementById('btn-proceed-export').addEventListener('click', () => {
        syncMsepPlanFromUI();
        saveToLocalStorage();
        renderExportAndDocView();
        goToStep(4);
    });

    // Dynamic SA Control: Add new SA
    document.getElementById('btn-add-sa').addEventListener('click', handleAddNewSA);

    // Export buttons
    document.getElementById('btn-download-xlsx').addEventListener('click', handleDownloadIRRAC);
    document.getElementById('btn-print-plano').addEventListener('click', () => {
        const originalTitle = document.title;
        const cleanName = (currentCourseData.courseName || 'SENAI_MSEP').replace(/[^a-zA-Z0-9-_]/g, '_');
        document.title = `Plano de Ensino - ${cleanName}`;
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    });
    document.getElementById('btn-toggle-plano-preview').addEventListener('click', () => {
        const docView = document.getElementById('official-doc-view');
        docView.scrollIntoView({ behavior: 'smooth' });
    });

    // Header Reset Action
    const btnReset = document.getElementById('btn-reset-plan');
    if (btnReset) {
        btnReset.addEventListener('click', handleResetPlan);
    }

    // Global click outside listener to close custom dropdowns
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-wrap')) {
            document.querySelectorAll('.custom-select-wrap.open').forEach(w => w.classList.remove('open'));
        }
    });
}

// Step Navigation
function goToStep(stepNumber, shouldSave = true) {
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

    if (shouldSave) {
        saveToLocalStorage();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset form to clean state
function resetFormToBlank() {
    currentCourseData = {
        courseKey: "custom",
        courseName: "",
        courseUnit: "",
        unitSigla: "",
        workload: "",
        turma: "",
        semAno: "",
        docente: "",
        escola: 'Escola SENAI "Mariano Ferraz"',
        fileName: null
    };
    currentMsepPlan = null;
    populateStep2Inputs();
    updateStep1FileCard();
}

// Populate Step 2 Inputs from state
function populateStep2Inputs() {
    document.getElementById('inp-course-name').value = currentCourseData.courseName || '';
    document.getElementById('inp-unit-sigla').value = currentCourseData.unitSigla || '';
    document.getElementById('inp-workload').value = currentCourseData.workload || '';
    document.getElementById('inp-school').value = currentCourseData.escola || 'Escola SENAI "Mariano Ferraz"';
    document.getElementById('inp-docente').value = currentCourseData.docente || '';
    document.getElementById('inp-turma').value = currentCourseData.turma || '';
    document.getElementById('inp-sem-ano').value = currentCourseData.semAno || '';

    const badge = document.getElementById('selected-course-badge');
    if (badge) {
        badge.textContent = currentCourseData.unitSigla ? `UC: ${currentCourseData.unitSigla}` : (currentCourseData.courseName ? currentCourseData.courseName : 'Novo Curso');
    }
}

// Sync inputs to currentCourseData
function syncCourseDataFromInputs() {
    currentCourseData.courseName = document.getElementById('inp-course-name').value.trim();
    currentCourseData.courseUnit = document.getElementById('inp-course-name').value.trim();
    currentCourseData.unitSigla = document.getElementById('inp-unit-sigla').value.trim();
    const rawHours = document.getElementById('inp-workload').value;
    currentCourseData.workload = rawHours ? parseInt(rawHours) : '';
    currentCourseData.escola = document.getElementById('inp-school').value.trim();
    currentCourseData.docente = document.getElementById('inp-docente').value.trim();
    currentCourseData.turma = document.getElementById('inp-turma').value.trim();
    currentCourseData.semAno = document.getElementById('inp-sem-ano').value.trim();

    const badge = document.getElementById('selected-course-badge');
    if (badge) {
        badge.textContent = currentCourseData.unitSigla ? `UC: ${currentCourseData.unitSigla}` : (currentCourseData.courseName ? currentCourseData.courseName : 'Novo Curso');
    }
}

// Intelligent Sigla Generator
function generateSigla(name) {
    if (!name) return "";
    const upper = name.toUpperCase();
    if (upper.includes("DESENVOLVIMENTO") || upper.includes("SISTEMA")) return "DEV-SIST";
    if (upper.includes("ELETRICISTA") || upper.includes("PREDIAL")) return "ELET-PRED";
    if (upper.includes("EMPILHADEIRA") || upper.includes("NR-11") || upper.includes("NR11")) return "NR11-EMP";
    if (upper.includes("DESENHO") || upper.includes("MECÂNICO") || upper.includes("MECANICO")) return "DES-MEC";
    if (upper.includes("VEÍCULOS") || upper.includes("VEICULOS") || upper.includes("LEVES")) return "AUT-LEVES";
    if (upper.includes("MAQUINISTA")) return "MAQUINISTA";
    if (upper.includes("BOAS PRÁTICAS") || upper.includes("MERCADO")) return "BOAS-PRAT";
    if (upper.includes("ANTIGRAVITY")) return "ANTIGRAVITY";
    if (upper.includes("CHATGPT") || upper.includes("IA GENERATIVA")) return "CHATGPT";

    const words = upper.split(/[\s\-_]+/).filter(w => w.length > 2);
    if (words.length >= 2) {
        return (words[0].substring(0, 4) + "-" + words[1].substring(0, 4)).toUpperCase();
    }
    return upper.substring(0, 8).toUpperCase();
}

// Handle Custom File Upload
function handleFileUpload(file) {
    const fileName = file.name;
    const fileSizeKB = Math.round(file.size / 1024);
    
    const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim();
    
    currentCourseData.fileName = fileName;
    currentCourseData.courseKey = 'custom';
    currentCourseData.courseName = cleanName.toUpperCase();
    currentCourseData.courseUnit = cleanName.toUpperCase();
    currentCourseData.unitSigla = generateSigla(cleanName);
    currentCourseData.workload = "";
    currentCourseData.turma = "";
    currentCourseData.semAno = "";
    currentCourseData.docente = "";
    currentCourseData.escola = 'Escola SENAI "Mariano Ferraz"';
    
    populateStep2Inputs();
    updateStep1FileCard(fileSizeKB);
    saveToLocalStorage();

    showToast(`Plano de Curso "${fileName}" anexado! Informe a carga horária no Passo 2.`);
}

// Update Step 1 File Preview Card
function updateStep1FileCard(fileSizeKB = null) {
    const card = document.getElementById('attached-file-card');
    const nameEl = document.getElementById('attached-file-name');
    const sizeEl = document.getElementById('attached-file-size');
    const labelEl = document.getElementById('step1-selected-name');

    if (currentCourseData.fileName) {
        card.style.display = 'flex';
        nameEl.textContent = currentCourseData.fileName;
        sizeEl.textContent = fileSizeKB ? `${fileSizeKB} KB • Documento pronto para processamento` : `Documento carregado`;
        if (labelEl) {
            labelEl.textContent = `${currentCourseData.fileName} (${currentCourseData.courseName})`;
        }
    } else {
        card.style.display = 'none';
        if (labelEl) {
            labelEl.textContent = currentCourseData.courseName ? `${currentCourseData.courseName} (Manual)` : 'Nenhum arquivo anexado (ou avance para preencher manualmente)';
        }
    }
}

// Remove attached file
function handleRemoveAttachedFile() {
    currentCourseData.fileName = null;
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    updateStep1FileCard();
    saveToLocalStorage();
    showToast('Arquivo desanexado.');
}

// Generate MSEP Plan via Backend API
async function handleGenerateMSEP() {
    syncCourseDataFromInputs();

    if (!currentCourseData.courseName) {
        showToast('Por favor, informe o Nome do Curso / Unidade Curricular.');
        document.getElementById('inp-course-name').focus();
        return;
    }

    if (!currentCourseData.workload || isNaN(currentCourseData.workload) || currentCourseData.workload <= 0) {
        showToast('Por favor, informe a Carga Horária Total da UC (ex: 80, 120, 160h).');
        document.getElementById('inp-workload').focus();
        return;
    }

    if (!currentCourseData.unitSigla) {
        currentCourseData.unitSigla = generateSigla(currentCourseData.courseName);
        document.getElementById('inp-unit-sigla').value = currentCourseData.unitSigla;
    }

    if (!currentCourseData.turma) {
        currentCourseData.turma = `TURMA ${new Date().getFullYear()}`;
    }
    if (!currentCourseData.semAno) {
        currentCourseData.semAno = `2º Sem/${new Date().getFullYear()}`;
    }
    if (!currentCourseData.escola) {
        currentCourseData.escola = 'Escola SENAI "Mariano Ferraz"';
    }
    if (!currentCourseData.docente) {
        currentCourseData.docente = 'Docente Responsável';
    }

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
            saveToLocalStorage();
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
                    <div class="sa-hours-box">
                        <input type="number" class="form-control form-control-sm sa-hours-input" data-sa-idx="${saIdx}" value="${sa.aulas}" style="width: 75px; text-align: center; font-weight: 700;" title="Horas desta SA">
                        <span class="sa-hours-label">Aulas</span>
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
                                    <div class="custom-select-wrap" data-sa-idx="${saIdx}" data-c-idx="${cIdx}" data-selected-val="${c.tipo || 'C'}">
                                        <button type="button" class="custom-select-trigger" aria-haspopup="listbox">
                                            <span class="custom-select-label">${c.tipo === 'C' ? 'Crítico (C)' : 'Desejável (D)'}</span>
                                            <svg class="custom-select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </button>
                                        <div class="custom-select-dropdown" role="listbox">
                                            <div class="custom-select-item ${c.tipo === 'C' ? 'active' : ''}" data-val="C">
                                                <span class="item-title">Crítico (C)</span>
                                                <span class="item-desc">Item obrigatório para aprovação</span>
                                            </div>
                                            <div class="custom-select-item ${c.tipo === 'D' ? 'active' : ''}" data-val="D">
                                                <span class="item-title">Desejável (D)</span>
                                                <span class="item-desc">Item de aprimoramento e notas</span>
                                            </div>
                                        </div>
                                    </div>
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
    const liveSelectors = ['.sa-title-input', '.sa-context-input', '.sa-desafio-input', '.sa-obs-input', '.sa-res-input', '.crit-cap-input', '.crit-text-input'];
    liveSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(inp => {
            inp.addEventListener('input', () => {
                syncMsepPlanFromUI();
                saveToLocalStorage();
            });
            inp.addEventListener('change', () => {
                syncMsepPlanFromUI();
                saveToLocalStorage();
            });
        });
    });

    // Custom Dropdown Triggers
    document.querySelectorAll('.custom-select-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const wrap = btn.closest('.custom-select-wrap');
            const isOpen = wrap.classList.contains('open');
            document.querySelectorAll('.custom-select-wrap.open').forEach(w => {
                if (w !== wrap) w.classList.remove('open');
            });
            wrap.classList.toggle('open', !isOpen);
        });
    });

    // Custom Dropdown Item Selection
    document.querySelectorAll('.custom-select-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const wrap = item.closest('.custom-select-wrap');
            const val = item.getAttribute('data-val');
            const label = item.querySelector('.item-title').textContent.trim();

            wrap.setAttribute('data-selected-val', val);
            wrap.querySelector('.custom-select-label').textContent = label;

            wrap.querySelectorAll('.custom-select-item').forEach(it => it.classList.remove('active'));
            item.classList.add('active');

            wrap.classList.remove('open');

            syncMsepPlanFromUI();
            saveToLocalStorage();
        });
    });

    // Hours inputs
    document.querySelectorAll('.sa-hours-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
            const saIdx = parseInt(e.target.dataset.saIdx);
            if (currentMsepPlan && currentMsepPlan.situacoes[saIdx]) {
                currentMsepPlan.situacoes[saIdx].aulas = parseInt(e.target.value) || 0;
            }
            updateHoursBalanceIndicator();
            saveToLocalStorage();
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
            const sa = currentMsepPlan.situacoes[saIdx];
            openModal({
                title: `Excluir Situação de Aprendizagem ${sa.numero}?`,
                desc: `Tem certeza que deseja remover "${sa.titulo}" e seus critérios de avaliação?`,
                confirmText: 'Excluir SA',
                cancelText: 'Cancelar',
                iconType: 'danger',
                isDanger: true,
                onConfirm: () => {
                    syncMsepPlanFromUI();
                    currentMsepPlan.situacoes.splice(saIdx, 1);
                    currentMsepPlan.situacoes.forEach((item, i) => {
                        item.numero = String(i + 1).padStart(2, '0');
                    });
                    saveToLocalStorage();
                    renderMSEPViewer();
                    showToast('Situação de Aprendizagem removida.');
                }
            });
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
                crit: "Executa os procedimentos técnicos atendendo aos requisitos de qualidade e conformidade.",
                tipo: "C"
            });
            saveToLocalStorage();
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
            saveToLocalStorage();
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
            { row: 16, cap: "", crit: "Aplica normas e regulamentações técnicas e de segurança da área.", tipo: "D" },
            { row: 17, cap: "Demonstrar responsabilidade", crit: "Cumpre os prazos e diretrizes técnicas do projeto de forma metódica.", tipo: "C" },
            { row: 18, cap: "", crit: "Demonstra postura colaborativa e organização no ambiente de trabalho.", tipo: "D" }
        ]
    });

    saveToLocalStorage();
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

            const wrap = document.querySelector(`.custom-select-wrap[data-sa-idx="${saIdx}"][data-c-idx="${cIdx}"]`);
            if (wrap) {
                c.tipo = wrap.getAttribute('data-selected-val') || 'C';
            }

            c.row = globalRowCounter++;
        });

        globalRowCounter++;
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
                <td style="width: 50%;"><strong>Nº de aulas:</strong> ${currentMsepPlan.numAulas || currentMsepPlan.cargaHoraria}</td>
            </tr>
            <tr>
                <td colspan="2">
                    <strong>Carga horária prevista para o desenvolvimento da Situação de Aprendizagem:</strong><br>
                    ${currentMsepPlan.situacoes.map(sa => `• Situação de Aprendizagem ${sa.numero}: ${sa.aulas} aulas`).join('<br>')}
                </td>
            </tr>
            <tr>
                <td colspan="2"><strong>Objetivo da UC:</strong> ${currentMsepPlan.objetivoUC || 'Desenvolver as competências técnicas e socioemocionais preconizadas na matriz curricular.'}</td>
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
    saveToLocalStorage();
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

// Local Storage Helper Functions
function saveToLocalStorage() {
    try {
        const state = {
            currentStep,
            currentCourseData,
            currentMsepPlan,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setStorageStatus('Salvo no Navegador');
    } catch (err) {
        console.warn('Could not save to localStorage:', err);
    }
}

function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const state = JSON.parse(raw);
        if (state.currentCourseData) currentCourseData = state.currentCourseData;
        if (state.currentMsepPlan) currentMsepPlan = state.currentMsepPlan;
        if (state.currentStep) currentStep = state.currentStep;
        return true;
    } catch (err) {
        console.warn('Error reading from localStorage:', err);
        return false;
    }
}

function handleResetPlan() {
    openModal({
        title: 'Iniciar Novo Planejamento?',
        desc: 'Todas as alterações, Situações de Aprendizagem e rascunhos salvos no navegador serão limpos para você começar um novo curso do zero.',
        confirmText: 'Sim, Iniciar do Zero',
        cancelText: 'Cancelar',
        iconType: 'primary',
        isDanger: false,
        onConfirm: () => {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {}
            resetFormToBlank();
            goToStep(1, false);
            showToast('Novo planejamento iniciado do zero.');
        }
    });
}

// Modern Modal Dialog Helper
function openModal({
    title = 'Confirmação',
    desc = 'Tem certeza que deseja prosseguir?',
    iconType = 'primary', // 'primary', 'danger', 'warning'
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDanger = false,
    onConfirm = () => {}
}) {
    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-desc');
    const iconBadge = document.getElementById('modal-icon-badge');
    const btnConfirm = document.getElementById('modal-btn-confirm');
    const btnCancel = document.getElementById('modal-btn-cancel');

    if (!overlay) return;

    titleEl.textContent = title;
    descEl.textContent = desc;
    btnConfirm.textContent = confirmText;
    btnCancel.textContent = cancelText;

    iconBadge.className = `modal-icon-badge ${iconType}`;

    if (isDanger) {
        btnConfirm.className = 'btn btn-danger';
    } else {
        btnConfirm.className = 'btn btn-primary';
    }

    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 200);
        btnConfirm.onclick = null;
        btnCancel.onclick = null;
        document.removeEventListener('keydown', handleKey);
    };

    const handleKey = (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'Enter') {
            closeModal();
            onConfirm();
        }
    };

    btnCancel.onclick = closeModal;
    btnConfirm.onclick = () => {
        closeModal();
        onConfirm();
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };

    document.addEventListener('keydown', handleKey);
}

function setStorageStatus(text, isTemporaryHighlight = false) {
    const el = document.getElementById('storage-status-text');
    if (el) {
        el.textContent = text;
    }
}

// Toast Helper
function showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}
