# ⏱️ Controle de Ponto — PWA Pessoal

Aplicativo de controle de ponto pessoal, **100% gratuito**, que funciona totalmente offline, sem servidor, sem login e sem qualquer serviço pago. Todos os dados ficam salvos localmente no seu dispositivo via **IndexedDB**.

Otimizado para uso em celular (mobile-first), com suporte a instalação como app (PWA) no Android e iPhone.

---

## 📂 Arquivos do Projeto

```
index.html          → Interface completa (HTML + CSS)
app.js               → Lógica da aplicação (banco de dados, cálculos, telas)
service-worker.js   → Cache e funcionamento offline
manifest.json        → Configuração de instalação como PWA
README.md            → Este arquivo
```

Os 4 primeiros arquivos são **obrigatórios** e devem ficar na mesma pasta para o app funcionar.

---

## 🚀 Como Usar

### 1. Colocar os arquivos em uma pasta
Baixe `index.html`, `app.js`, `service-worker.js` e `manifest.json` para a mesma pasta.

### 2. Abrir o app
- **Mais simples:** dê duplo clique em `index.html` para abrir no navegador.
- **Recomendado (para o modo offline funcionar 100%):** sirva a pasta por um servidor local. Exemplos:
  ```bash
  # Python
  python -m http.server 8000

  # Node.js
  npx http-server
  ```
  Depois acesse `http://localhost:8000`.

### 3. Instalar como app (opcional)
- **Android (Chrome/Firefox):** menu (⋮) → "Instalar app" ou "Adicionar à tela inicial"
- **iPhone (Safari):** botão Compartilhar → "Adicionar à Tela de Início"
- **Desktop:** ícone de instalação na barra de endereço

### 4. Configurar sua jornada
Vá em **Configurações (⚙️)** e defina:
- Horas trabalhadas por dia (pode ser diferente em cada dia da semana)
- Quais dias são de trabalho ou folga
- Se há intervalo, e sua duração

### 5. Bater ponto
Toque no botão grande na tela inicial. Ele muda automaticamente:

| Estado | Ação |
|---|---|
| 🟢 Registrar Entrada | Início do expediente |
| 🟡 Iniciar Intervalo | Pausa/almoço |
| 🔵 Finalizar Intervalo | Volta da pausa |
| 🔴 Registrar Saída | Fim do expediente |

Um alerta de confirmação aparece antes de cada registro, para evitar toques acidentais.

---

## 🧭 Navegação

| Aba | Função |
|---|---|
| 🏠 Início | Bater ponto, ver resumo do dia |
| 📋 Histórico | Lista de todos os dias, com filtros (hoje/semana/mês) |
| 📅 Calendário | Visão mensal com status de cada dia |
| 📊 Resumo | Totais de hoje, semana, mês, extras, faltas e saldo acumulado |
| ⚙️ Config | Jornada, intervalo, backup e restauração |

---

## 🧮 Como os Cálculos Funcionam

**Horas trabalhadas** = (Saída − Entrada) − duração do(s) intervalo(s)

**Saldo do dia** = Horas trabalhadas − Horas previstas para aquele dia

**Saldo acumulado** = soma de todos os saldos diários (dias de folga não entram na conta)

O app também valida a sequência dos registros (não deixa, por exemplo, registrar uma saída sem entrada, ou um horário antes do último registro do dia), evitando dados inconsistentes.

### Exemplo

```
Jornada configurada: 8h/dia, intervalo de 1h

Entrada:        08:00
Início intervalo: 12:00
Fim intervalo:    13:00
Saída:            17:00

Trabalhado = 17:00 - 08:00 - 1h = 8h
Saldo do dia = 8h - 8h = 0h ✓
```

---

## ✏️ Editando e Excluindo Registros

Toque em qualquer dia no **Histórico** ou **Calendário** para abrir os detalhes. Lá você pode:
- **Editar** (✏️) — altera tipo e horário de um registro. O app revalida a sequência do dia inteiro antes de salvar; se a edição deixar os dados inconsistentes, ela é rejeitada e o registro original é mantido.
- **Excluir** (🗑️) — remove o registro após confirmação.
- **Adicionar observação** — uma nota de texto livre para aquele dia.

---

## 💾 Backup e Restauração

Como não há nuvem nem servidor, o backup é **a sua rede de segurança**.

- **Exportar** (Configurações → Dados): gera um arquivo `.json` com todos os registros, configurações e observações.
- **Importar**: restaura os dados a partir de um backup exportado anteriormente. O app mostra uma prévia e pede confirmação antes de sobrescrever os dados atuais.

> ⚠️ **Faça backup regularmente.** Se você limpar os dados do navegador ou desinstalar o app sem exportar antes, os registros são perdidos permanentemente — não há como recuperá-los.

---

## 📴 Funcionamento Offline

Depois da primeira abertura, o **Service Worker** guarda os arquivos do app em cache. A partir daí, o app funciona inteiramente sem internet: bater ponto, consultar histórico, editar, calcular saldo e exportar backup — tudo continua disponível offline.

---

## 🔒 Privacidade

- Nenhum dado sai do seu dispositivo.
- Nenhuma conta, e-mail, login ou servidor externo.
- Nenhum rastreamento ou coleta de dados.
- Você decide quando (e se) exporta seus dados.

---

## 📱 Compatibilidade

Testado e funcional em navegadores modernos: Chrome, Firefox, Safari e Edge — em Android, iPhone, tablet e desktop. O layout é mobile-first, com áreas de toque confortáveis e suporte a modo escuro automático (segue a preferência do sistema).

---

## 🛠️ Solução de Problemas

| Problema | O que fazer |
|---|---|
| Dados sumiram | Restaure a partir do último backup exportado. Sem backup, não há recuperação. |
| App não abre offline | Abra uma vez com internet antes, para o Service Worker cachear os arquivos. |
| Não consigo instalar | Verifique se está usando um navegador atualizado (Chrome/Firefox/Safari recentes). |
| Erro ao registrar ponto | O app bloqueia sequências inválidas (ex: saída sem entrada). Confira o histórico do dia. |

---

## 🎯 Resumo Técnico

- **Stack:** HTML5 + CSS3 + JavaScript puro (sem frameworks)
- **Armazenamento:** IndexedDB (stores: `punches`, `settings`, `weekdaySettings`, `notes`)
- **Offline:** Service Worker com estratégia network-first + fallback para cache
- **Instalação:** PWA via `manifest.json`, com ícones adaptativos e suporte a áreas seguras (notch/home indicator)
- **Custo:** zero — sem APIs pagas, sem nuvem, sem assinatura

---

**Bom controle de ponto! ⏱️**
