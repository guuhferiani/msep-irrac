# 🏛️ SENAI MSEP & IRRAC Suite

<div align="center">

![SENAI](https://img.shields.io/badge/SENAI-SP-E11D48?style=for-the-badge&logo=senai&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![OpenXML](https://img.shields.io/badge/Excel-OpenXML-107C41?style=for-the-badge&logo=microsoftexcel&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Status](https://img.shields.io/badge/Status-100%25_Operacional-success?style=for-the-badge)

<br>

**Plataforma Web Inteligente de Engenharia Pedagógica e Automação de Documentos Institucionais SENAI.**  
*Geração automática de Planos de Ensino baseados no MSEP (Metodologia SENAI de Educação Profissional) e exportação da planilha oficial IRRAC (.xlsx) com fórmulas dinâmicas.*

</div>

---

## 🎯 Propósito do Projeto

O **SENAI MSEP & IRRAC Suite** foi concebido para resolver uma das principais dores operacionais e burocráticas do corpo docente do SENAI: a necessidade de traduzir manualmente matrizes curriculares de **Planos de Curso** em **Situações de Aprendizagem (SAs)** contextualizadas e estruturar a complexa matriz de critérios avaliativos na planilha **IRRAC**.

A plataforma elimina o retrabalho repetitivo, oferecendo uma solução **aberta, ágil, sem necessidade de login** e **100% modular** para todas as áreas tecnológicas da instituição.

---

## 🚀 Principais Funcionalidades

```mermaid
graph LR
    A["📄 1. Plano de Curso (PDF/Preset)"] --> B["⚙️ 2. Dados da Turma & Carga Horária"]
    B --> C["🎛️ 3. Editor MSEP (SAs & Critérios)"]
    C --> D["📊 4. Download IRRAC (.xlsx) & Plano (PDF)"]
```

### 1. 🌐 Universal & Multidisciplinar
* **Todas as Áreas Tecnológicas:** Pré-configurações prontas e suporte a qualquer curso de *Tecnologia da Informação*, *Eletroeletrônica*, *Automação Industrial*, *Metalmecânica*, *Refrigeração*, *Gestão*, etc.
* **Carga Horária Flexível:** Ajuste dinâmico para cursos de qualquer duração (*20h, 40h, 60h, 80h, 160h, 200h+*).

### 2. 🎛️ Editor Pedagógico MSEP Modular
* **Situações de Aprendizagem (SAs) Dinâmicas:** Adicione (`+`) ou remova (`🗑️`) SAs conforme a extensão da Unidade Curricular.
* **Balanceador de Horas em Tempo Real:** Medidor visual que valida a equivalência entre as aulas distribuídas nas SAs e a carga horária total do curso.
* **Cenários do Mundo Real:** Geração de narrativas contextualizadas com empresas simuladas, desafios de engenharia e entregáveis práticos.

### 3. 📋 Matriz de Critérios de Avaliação
* **Flexibilidade Total:** Adicione e remova linhas de critérios livremente.
* **Classificação Clara:** Separação entre critérios **Críticos (`C`)** e **Desejáveis (`D`)**.

### 4. 🧮 Compilador OpenXML do IRRAC com Fórmulas Autoajustáveis
* Gera a planilha oficial `.xlsx` com todas as 4 abas institucionais (`Home`, `Cadastro`, `Consolidação` e a aba da `Unidade Curricular`).
* Recalcula dinamicamente os intervalos de linhas e a fórmula de ponderação:
  $$\text{Nota} = \text{ARRED}\left(\left(\text{Críticos} \times \frac{50}{\text{Total Críticos}}\right) + \left(\text{Desejáveis} \times \frac{50}{\text{Total Desejáveis}}\right), 0\right)$$
  garantindo que a pontuação máxima seja sempre **100**, independente da quantidade de critérios avaliados.

### 5. 📄 Documento Oficial Formatado (Plano de Ensino A4)
* Visualizador e gerador de PDF formatado nas normas visuais e tabelas padrão do SENAI-SP, pronto para impressão e envio à coordenação/orientação pedagógica.

---

## 🛠️ Tecnologias Utilizadas

* **Runtime & Backend:** [Node.js](https://nodejs.org/) (Vanilla HTTP Engine + REST API)
* **Manipulação de Planilhas:** Pure JavaScript OpenXML Compiler com [Adm-Zip](https://github.com/cthackers/adm-zip) (100% Cross-Platform / Cloud-Native)
* **Frontend:** HTML5 Semântico, Vanilla JavaScript (SPA State Management)
* **Design & Estilos:** Vanilla CSS moderno com Design Tokens, Glassmorphism, tipografia Google Fonts (*Plus Jakarta Sans* e *JetBrains Mono*) e Estilos de Impressão A4 (`@media print`)
* **Deploy & Cloud:** [Vercel](https://vercel.com/) / [Render](https://render.com/)

---

## 💻 Como Executar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/guuhferiani/msep-irrac-suite.git
   cd msep-irrac-suite
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

---

## ☁️ Deploy na Nuvem (Vercel)

O projeto conta com arquivo de configuração `vercel.json` pré-configurado:
1. Conecte o repositório `msep-irrac-suite` na sua conta da **[Vercel](https://vercel.com/)**.
2. Clique em **Deploy** (nenhuma variável de ambiente é necessária).
3. A aplicação estará disponível em seu subdomínio `.vercel.app` instantaneamente.

---

## 👨‍💻 Autores e Créditos

<div align="center">

Desenvolvido com dedicação para a comunidade docente do **SENAI-SP**.

| **Gustavo da Silva Feriani** | **Google Antigravity** |
| :---: | :---: |
| 🎓 *Idealização, Engenharia Pedagógica e Docente SENAI-SP* | 🤖 *Pair Programming, Arquitetura de Software & Automação* |
| [![GitHub](https://img.shields.io/badge/GitHub-guuhferiani-181717?style=flat&logo=github)](https://github.com/guuhferiani) | [![Antigravity](https://img.shields.io/badge/AI-Antigravity-4285F4?style=flat&logo=google)](https://deepmind.google/) |

</div>

---

<div align="center">
  <sub>Construído por docentes para docentes. Compartilhe o conhecimento e simplifique a rotina pedagógica! ❤️</sub>
</div>
