# SENAI MSEP & IRRAC Suite 🚀

> **Gerador Pedagógico Inteligente e Automatizador de Plano de Ensino MSEP e Planilha IRRAC (.xlsx) para Docentes SENAI.**

Uma aplicação web desenvolvida para eliminar o retrabalho burocrático de docentes de todas as áreas tecnológicas do SENAI (TI, Eletroeletrônica, Automação, Metalmecânica, Refrigeração, etc.).

---

## ✨ Funcionalidades Principais

- 📁 **Universal & Multidisciplinar:** Suporte a qualquer curso técnico ou de qualificação profissional, com qualquer carga horária (20h a 200h+).
- 🎛️ **Editor MSEP Dinâmico:** Crie, edite, adicione ou remova **Situações de Aprendizagem (SAs)** com balanceamento de horas automático em tempo real.
- 📋 **Matriz de Critérios de Avaliação:** Gestão ágil de critérios **Críticos (`C`)** e **Desejáveis (`D`)**.
- 📊 **Exportação IRRAC (.xlsx) Oficial:** Compilação OpenXML com recálculo automático de fórmulas ponderadas do SENAI.
- 📄 **Plano de Ensino em PDF / A4:** Layout diagramado pronto para impressão nas normas institucionais.
- ⚡ **Sem Login / Sem Barreiras:** Acesso 100% livre e direto para todos os instrutores.

---

## 🛠️ Como Executar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/guuhferiani/msep-irrac-suite.git
cd msep-irrac-suite
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie a aplicação:
```bash
npm start
```

4. Acesse no navegador:
```
http://localhost:3000
```

---

## ☁️ Deploy em Nuvem (Render / Railway / Vercel)

Esta aplicação foi desenvolvida em Node.js puro com compactação OpenXML em memória (`adm-zip`), permitindo deploy gratuito e instantâneo no **Render**, **Railway** ou **Vercel** sem necessidade de configurações complexas.
