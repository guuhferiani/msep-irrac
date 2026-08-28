const http = require('http');
const fs = require('fs');
const path = require('path');

const coursesToTest = [
    { name: "ELETRICISTA INSTALADOR PREDIAL", sigla: "ELET-PRED", workload: 160 },
    { name: "NR-11 OPERAÇÃO DE EMPILHADEIRA", sigla: "NR11-EMP", workload: 32 },
    { name: "LEITURA E INTERPRETAÇÃO DE DESENHO TÉCNICO MECÂNICO", sigla: "DES-MEC", workload: 60 },
    { name: "CARACTERÍSTICAS TÉCNICAS DE VEÍCULOS LEVES", sigla: "AUT-LEVES", workload: 40 },
    { name: "MAQUINISTA", sigla: "MAQUINISTA", workload: 200 },
    { name: "BOAS PRÁTICAS PARA O MERCADO DO TRABALHO", sigla: "BOAS-PRAT", workload: 20 },
    { name: "DESENVOLVIMENTO DE SISTEMAS", sigla: "DEV-SIST", workload: 120 }
];

const outputDir = path.join(__dirname, 'test_output_irracs');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function sendRequest(endpoint, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ statusCode: res.statusCode, headers: res.headers, data: buffer });
                } else {
                    reject(new Error(`Status: ${res.statusCode} - ${buffer.toString()}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function runAllTests() {
    console.log("==========================================================================");
    console.log("🚀 TESTANDO COMPILAÇÃO AUTOMÁTICA DOS PLANOS DE CURSO DO SENAI");
    console.log("==========================================================================\n");

    for (let i = 0; i < coursesToTest.length; i++) {
        const c = coursesToTest[i];
        console.log(`📌 [${i + 1}/${coursesToTest.length}] Curso: ${c.name} (${c.workload}h)...`);

        const coursePayload = {
            courseKey: "custom",
            courseName: c.name,
            courseUnit: c.name,
            unitSigla: c.sigla,
            workload: c.workload,
            docente: "Gustavo Feriani",
            turma: `${c.sigla} 2026/2`,
            semAno: "2º Sem/2026",
            escola: 'Escola SENAI "Mariano Ferraz"'
        };

        // 1. Gerar MSEP
        const msepRes = await sendRequest('/api/generate-msep', coursePayload);
        const msepData = JSON.parse(msepRes.data.toString());
        const plan = msepData.plan;

        console.log(`   ✅ MSEP Gerado com Sucesso: ${plan.situacoes.length} Situações de Aprendizagem.`);
        let totalHoursAllocated = 0;
        let totalCrit = 0;
        let totalDesej = 0;
        plan.situacoes.forEach(sa => {
            totalHoursAllocated += sa.aulas;
            sa.criterios.forEach(crit => {
                if (crit.tipo === 'C') totalCrit++;
                if (crit.tipo === 'D') totalDesej++;
            });
        });
        console.log(`   ⏱️  Horas Balanceadas: ${totalHoursAllocated}h / ${c.workload}h`);
        console.log(`   📋 Critérios: ${totalCrit} Críticos (C) e ${totalDesej} Desejáveis (D).`);

        // 2. Exportar XLSX do IRRAC
        const irracRes = await sendRequest('/api/export-irrac', {
            courseName: plan.curso,
            unitSigla: plan.sigla,
            workload: plan.cargaHoraria,
            turma: plan.turma,
            semAno: plan.semAno,
            docente: plan.docente,
            escola: plan.escola,
            situacoes: plan.situacoes
        });

        const outputPath = path.join(outputDir, `IRRAC - ${c.sigla}.xlsx`);
        fs.writeFileSync(outputPath, irracRes.data);
        console.log(`   📊 Planilha Oficial OpenXML salva em: IRRACs/IRRAC - ${c.sigla}.xlsx (${irracRes.data.length} bytes)\n`);
    }

    console.log("==========================================================================");
    console.log("🎉 TODOS OS PLANOS DE CURSO FORAM TESTADOS E EXPORTADOS COM 100% DE SUCESSO!");
    console.log("==========================================================================");
}

runAllTests().catch(err => {
    console.error("❌ Falha no teste:", err);
});
