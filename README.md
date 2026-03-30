# 📊 Portfolio Tracker — Gestão de Investimentos & Dividendos

Uma ferramenta gratuita e open-source para gestão de portfolios de investimento, focada em dividendos, análise de ações e planeamento financeiro.

**🔗 [Abrir App](https://k1mmis.github.io/portfolio-tracker/)**

---

## ✨ Funcionalidades

### 📰 Feed de Notícias & Conteúdo
- Notícias financeiras em tempo real via RSS (Reuters, CNBC, ECO, Jornal de Negócios, etc.)
- Últimos vídeos de canais YouTube de investimento com thumbnails
- Sistema de prioridade para canais (os favoritos mostram mais vídeos)
- Só mostra conteúdo dos últimos 7 dias
- Fontes e canais totalmente personalizáveis

### 📊 Dashboard / Resumo
- Valor total do portfolio, lucro/perda, dividendos estimados
- Gráfico de dividendos esperados por mês
- Gráficos de alocação: ações por setor + ETFs por plano
- Performance vs Dividend Yield
- Meta de dividendos com barra de progresso
- Capital não investido com estimativa de juros mensais
- Evolução do portfolio ao longo do tempo (snapshots)

### 📈 Ações
- Tabela completa com P&L, yield, dividendos anuais estimados
- Tudo convertido para EUR automaticamente (câmbio em tempo real)
- Auto-fetch de dados por ticker via Yahoo Finance
- Atualização de preços via API ou manual

### 🏦 ETFs
- Organizados por planos editáveis (nome + cor personalizável)
- Link direto para JustETF por ISIN
- Suporte ACC e DIST
- Criação de planos ilimitados

### 💰 Dividendos
- Calendário mensal com análise de meses fortes/fracos
- Visualização de que ações pagam em cada mês
- Sugestões de ações para cobrir meses fracos
- Registo de dividendos recebidos

### 📅 Calendário
- Vista mensal com classificação (Excelente/Forte/Bom/Fraco/Crítico)
- Mostra dividendos previstos, recebidos e capital investido por mês

### 👀 Watchlist
- Tabelas separadas para ações e ETFs
- Auto-fetch de dados por ticker
- Classificação de interesse (SIM/TALVEZ/ANALISAR)

### 🔬 Analisador de Ações
- Pesquisa por ticker com dados em tempo real
- Gráfico de preços com períodos (1M, 3M, 6M, 1A, 5A)
- Máximo/Mínimo 52 semanas, volume médio
- Integração com o portfolio (mostra a tua posição se tiveres a ação)
- Links para Seeking Alpha, Yahoo Finance, Google Finance

### 🔥 Calculadora FIRE
- Projeção do património com gráfico interativo
- Número FIRE e Coast FIRE
- Cenários de crescimento (pessimista, conservador, realista, otimista)
- Campo "anos que pretendo investir" (investir X anos, reformar em Y)
- Contribuição mensal necessária quando o objetivo não é atingível
- Marcos importantes com rendimento anual estimado (regra 4%)

### 🔗 Links Úteis
- Diretório organizado por categorias (Ferramentas, Corretoras, Dividendos, etc.)
- Links para justETF, Getquin, TradingView, XTB, Trading 212, etc.
- Possibilidade de adicionar links e categorias personalizadas

---

## 🔒 Privacidade & Segurança

- **Zero servidores** — A app corre 100% no teu browser
- **Sem login, sem registo** — Não precisa de criar conta
- **Dados no localStorage** — Ficam no TEU computador, nunca saem do browser
- **Open source** — Podes ver todo o código
- **Cada utilizador tem os seus dados** — Se partilhares o link, a outra pessoa vê os dados default, não os teus

---

## 🚀 Como Usar

1. Abre **[https://k1mmis.github.io/portfolio-tracker/](https://k1mmis.github.io/portfolio-tracker/)**
2. A app já vem com dados de exemplo para explorares
3. Edita as ações, ETFs e planos conforme o teu portfolio real
4. Usa **Exportar JSON** para fazer backup dos teus dados
5. Usa **Importar JSON** para restaurar num browser diferente

---

## 💾 Backup dos Dados

Os dados ficam no localStorage do browser. Para não os perder:

1. Clica em **📥 Exportar JSON** regularmente
2. Guarda o ficheiro `.json` (por exemplo, nesta pasta `backups/`)
3. Se mudares de browser ou limpares os dados, usa **📤 Importar** para restaurar

---

## 🛠️ Stack Técnica

- **HTML + CSS + JavaScript** puro (zero dependências de build)
- **Chart.js** para gráficos
- **Yahoo Finance API** via proxy CORS para dados de mercado
- **RSS2JSON** para feeds de notícias
- **YouTube RSS** para vídeos dos canais
- **GitHub Pages** para hosting gratuito

---

## 📋 Roadmap

- [x] Dashboard com gráficos de alocação e dividendos
- [x] Sistema multi-conta (XTB, Trading 212, etc.)
- [x] Analisador de ações com gráficos de preços
- [x] Calculadora FIRE/Coast FIRE
- [x] Feed de notícias e YouTube
- [x] Meta de dividendos com barra de progresso
- [ ] Analisador de ETFs (tipo JustETF)
- [ ] Relatório mensal em PDF
- [ ] Análise de correlação entre ações
- [ ] Comparador de ETFs lado a lado
- [ ] Alertas de preço

---

## 📄 Licença

Projeto pessoal e open-source. Usa como quiseres.

---

*Desenvolvido com ☕ e muitas horas de conversa com AI*
