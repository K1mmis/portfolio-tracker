// ══════════════════════════════════════════
// CONFIG - Constants, defaults
// ══════════════════════════════════════════
export const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
export const MONTHS_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const PLAN_COLOR_OPTIONS = ["#10b981","#3b82f6","#f97316","#8b5cf6","#f59e0b","#ec4899","#06b6d4","#ef4444","#84cc16","#14b8a6","#f43f5e","#a855f7"];
export const SECTOR_COLORS = {"Technology":"#3b82f6","Healthcare":"#10b981","Financial":"#f59e0b","Energy":"#ef4444","Consumer":"#8b5cf6","Utilities":"#06b6d4","REIT":"#ec4899","Tobacco":"#f97316","Industrial":"#84cc16","Telecom":"#14b8a6","Other":"#64748b"};

export const TABS = [
  {id:"feed",label:"📰 Feed"},
  {id:"overview",label:"📊 Resumo"},
  {id:"stocks",label:"📈 Ações"},
  {id:"etfs",label:"🏦 ETFs"},
  {id:"dividends",label:"💰 Dividendos"},
  {id:"calendar",label:"📅 Calendário"},
  {id:"watchlist",label:"👀 Watchlist"},
  {id:"history",label:"📋 Histórico"},
  {id:"fire",label:"🔥 FIRE"},
  {id:"analyzer",label:"🔬 Ações"},
  {id:"etfanalyzer",label:"🔬 ETFs"},
  {id:"correlation",label:"📐 Correlação"},
  {id:"comparador",label:"⚖️ Comparador"},
  {id:"links",label:"🔗 Links Úteis"}
];


export const DEFAULT_STOCKS=[
  {ticker:"MO",name:"Altria Group",sector:"Tobacco",volume:2.0212,buyPrice:66.76,currentPrice:66.47,currency:"USD",divYield:6.38,divPerShare:1.06,freq:"Trimestral",months:[1,4,7,10]},
  {ticker:"ENEL",name:"Enel SpA",sector:"Utilities",volume:3.574,buyPrice:9.79,currentPrice:9.17,currency:"EUR",divYield:5.14,divPerShare:0.235,freq:"Semestral",months:[1,7]},
  {ticker:"MDLZ",name:"Mondelez",sector:"Consumer",volume:2.2121,buyPrice:59.71,currentPrice:58.31,currency:"USD",divYield:3.55,divPerShare:0.50,freq:"Trimestral",months:[1,4,7,10]},
  {ticker:"PLD",name:"Prologis",sector:"REIT",volume:0.2179,buyPrice:122.21,currentPrice:128.97,currency:"USD",divYield:3.18,divPerShare:1.07,freq:"Trimestral",months:[3,6,9,12]},
  {ticker:"O",name:"Realty Income",sector:"REIT",volume:1.388,buyPrice:64.73,currentPrice:60.73,currency:"USD",divYield:5.34,divPerShare:0.2705,freq:"Mensal",months:[1,2,3,4,5,6,7,8,9,10,11,12]},
  {ticker:"UVV",name:"Universal Corp",sector:"Tobacco",volume:2,buyPrice:52.71,currentPrice:52.74,currency:"USD",divYield:6.73,divPerShare:0.80,freq:"Trimestral",months:[2,5,8,11]},
  {ticker:"VICI",name:"VICI Properties",sector:"REIT",volume:2.7585,buyPrice:26.59,currentPrice:26.59,currency:"USD",divYield:6.76,divPerShare:0.45,freq:"Trimestral",months:[1,4,7,10]}
];

export const DEFAULT_PLANS=[
  {id:"workolic",name:"Workolic",color:"#10b981"},
  {id:"dividendos",name:"Dividendos",color:"#3b82f6"},
  {id:"semicondutores",name:"Semicondutores",color:"#f97316"},
  {id:"ishares",name:"iShares",color:"#8b5cf6"},
  {id:"plano_inicial",name:"Plano Inicial",color:"#f59e0b"}
];

export const DEFAULT_ETFS=[
  {planId:"workolic",name:"iShares Core EURO STOXX 50 UCITS",ticker:"SX5S",type:"ACC",invested:38.65,current:38.20,isin:"IE00B53L3W79"},
  {planId:"workolic",name:"L&G Battery Value-Chain UCITS",ticker:"BATT",type:"ACC",invested:36.28,current:42.13,isin:"IE00BF0M2Z96"},
  {planId:"workolic",name:"Invesco CoinShares Global Blockchain UCITS",ticker:"BCHN",type:"ACC",invested:44.20,current:39.65,isin:"IE00BGBN6P67"},
  {planId:"dividendos",name:"SPDR S&P Euro Dividend Aristocrats UCITS",ticker:"EUDV",type:"DIST",invested:29.73,current:29.32,isin:"IE00B5M1WJ87"},
  {planId:"dividendos",name:"SPDR S&P Gbl Div Aristocrats UCITS",ticker:"GLDV",type:"DIST",invested:29.80,current:29.42,isin:"IE00B9CQXS71"},
  {planId:"dividendos",name:"SPDR S&P Pan Asia Dividend Aristocrats",ticker:"ASDV",type:"DIST",invested:29.81,current:29.01,isin:"IE00B9KNR336"},
  {planId:"dividendos",name:"Vanguard FTSE All-World High Div Yield UCITS",ticker:"VHYL",type:"DIST",invested:29.74,current:29.80,isin:"IE00B8GKDB10"},
  {planId:"semicondutores",name:"iShares Automation & Robotics UCITS",ticker:"RBOT",type:"ACC",invested:52.59,current:49.12,isin:"IE00BYZK4552"},
  {planId:"semicondutores",name:"VanEck Semiconductor UCITS",ticker:"SMH",type:"ACC",invested:67.19,current:70.61,isin:"IE00BMC38736"},
  {planId:"semicondutores",name:"Lyxor MSCI Semiconductors ESG Filtered UCITS",ticker:"CHIP",type:"ACC",invested:78.78,current:80.34,isin:"LU1900066033"},
  {planId:"ishares",name:"iShares NASDAQ 100 UCITS",ticker:"CNDX",type:"ACC",invested:20.52,current:19.37,isin:"IE00B53SZB19"},
  {planId:"ishares",name:"iShares Core S&P 500 UCITS",ticker:"CSPX",type:"ACC",invested:17.74,current:17.09,isin:"IE00B5BMR087"},
  {planId:"ishares",name:"iShares Core MSCI World UCITS",ticker:"IWDA",type:"ACC",invested:20.78,current:20.19,isin:"IE00B4L5Y983"},
  {planId:"plano_inicial",name:"Xtrackers AI and Big Data UCITS",ticker:"XAIX",type:"ACC",invested:35.56,current:32.84,isin:"IE00BGV5VN51"},
  {planId:"plano_inicial",name:"VanEck AEX UCITS",ticker:"TAXE",type:"DIST",invested:35.60,current:35.24,isin:"NL0009272749"},
  {planId:"plano_inicial",name:"iShares $ Treasury Bond 3-7yr UCITS",ticker:"IUSM",type:"ACC",invested:36.62,current:36.50,isin:"IE00B3VWN518"}
];

export const DEFAULT_FEED_SOURCES=[
  {id:'reuters',name:'Reuters Business',rss:'https://www.reutersagency.com/feed/?best-topics=business-finance',url:'https://www.reuters.com/business/',color:'#ff8c00',enabled:true},
  {id:'cnbc',name:'CNBC',rss:'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',url:'https://www.cnbc.com/world/',color:'#006daa',enabled:true},
  {id:'investing',name:'Investing.com',rss:'https://www.investing.com/rss/news.rss',url:'https://www.investing.com/news/',color:'#2962ff',enabled:true},
  {id:'marketwatch',name:'MarketWatch',rss:'https://feeds.marketwatch.com/marketwatch/topstories/',url:'https://www.marketwatch.com/',color:'#00ac4e',enabled:true},
  {id:'eco',name:'ECO (Portugal)',rss:'https://eco.sapo.pt/feed/',url:'https://eco.sapo.pt/mercados/',color:'#00a651',enabled:true},
  {id:'jnegocios',name:'Jornal de Negócios',rss:'https://www.jornaldenegocios.pt/rss',url:'https://www.jornaldenegocios.pt/',color:'#c8102e',enabled:true},
  {id:'seekalpha',name:'Seeking Alpha',rss:'https://seekingalpha.com/market_currents.xml',url:'https://seekingalpha.com/',color:'#f7971e',enabled:true},
  {id:'yahoo',name:'Yahoo Finance',rss:'https://finance.yahoo.com/news/rssindex',url:'https://finance.yahoo.com/',color:'#7b0099',enabled:true}
];

export const DEFAULT_YT_CHANNELS=[
  {id:'yt1',name:'Daniel Menino',channelId:'UCxKVg9fRMnGFGAhBrPHQxYQ',channelUrl:'https://www.youtube.com/@odanielmenino',desc:'Investimentos PT',enabled:true},
  {id:'yt2',name:'Tiago Ramos',channelId:'UC2iRmfRFN0In_aGKNv7DFKQ',channelUrl:'https://www.youtube.com/@TiagoRamosInvest',desc:'Investimentos PT',enabled:true},
  {id:'yt3',name:'Dividend Bull',channelId:'UCsxJh2duQOBihNxOMpfgVOA',channelUrl:'https://www.youtube.com/@DividendBull',desc:'Dividendos',enabled:true},
  {id:'yt4',name:'Joseph Carlson',channelId:'UCbta1dGapXS7TyFXQjELklg',channelUrl:'https://www.youtube.com/@JosephCarlsonShow',desc:'Dividend investing',enabled:true},
  {id:'yt5',name:'Andrei Jikh',channelId:'UCGy7SkBjcIAgTiwkXEtPnYg',channelUrl:'https://www.youtube.com/@AndreiJikh',desc:'Investing & Finance',enabled:true},
  {id:'yt6',name:'The Plain Bagel',channelId:'UCFCEuCsyWP0YkP3CZ3Mr01Q',channelUrl:'https://www.youtube.com/@ThePlainBagel',desc:'Finance education',enabled:true}
];

export const DEFAULT_USEFUL_LINKS=[
  {category:'Ferramentas',links:[
    {name:'justETF Screener',url:'https://www.justetf.com/en/etf-screener.html',icon:'📊',desc:'Pesquisa e filtra ETFs'},
    {name:'Getquin',url:'https://www.getquin.com/',icon:'📱',desc:'Portfolio tracker social'},
    {name:'WalletBurst FIRE Calc',url:'https://walletburst.com/tools/coast-fire-calc/',icon:'🔥',desc:'Calculadora Coast FIRE'},
    {name:'Portfolio Visualizer',url:'https://www.portfoliovisualizer.com/',icon:'📈',desc:'Backtest e análise de portfolios'},
    {name:'TradingView',url:'https://www.tradingview.com/',icon:'📉',desc:'Gráficos e análise técnica'}
  ]},
  {category:'Corretoras',links:[
    {name:'XTB xStation',url:'https://xstation5.xtb.com/?branch=pt',icon:'💼',desc:'Plataforma XTB'},
    {name:'Trading 212',url:'https://www.trading212.com/',icon:'📲',desc:'Trading 212'},
    {name:'DEGIRO',url:'https://www.degiro.pt/',icon:'🏦',desc:'Corretora europeia'},
    {name:'Interactive Brokers',url:'https://www.interactivebrokers.com/',icon:'🌐',desc:'Corretora global'}
  ]},
  {category:'Dividendos',links:[
    {name:'Dividend.com',url:'https://www.dividend.com/',icon:'💰',desc:'Dados de dividendos US'},
    {name:'DivvyDiary',url:'https://divvydiary.com/',icon:'📅',desc:'Calendário de dividendos'},
    {name:'Stock Events',url:'https://stockevents.app/',icon:'📆',desc:'Datas de dividendos e earnings'},
    {name:'Simply Wall St',url:'https://simplywall.st/',icon:'🧱',desc:'Análise visual de ações'}
  ]},
  {category:'Notícias & Aprendizagem',links:[
    {name:'Investopedia',url:'https://www.investopedia.com/',icon:'📚',desc:'Enciclopédia de investimento'},
    {name:'Morningstar',url:'https://www.morningstar.com/',icon:'⭐',desc:'Análise e ratings'},
    {name:'Yahoo Finance',url:'https://finance.yahoo.com/',icon:'📰',desc:'Cotações e notícias'},
    {name:'ECO Mercados',url:'https://eco.sapo.pt/mercados/',icon:'🇵🇹',desc:'Mercados Portugal'}
  ]},
  {category:'Impostos & Regulação (Portugal)',links:[
    {name:'Portal das Finanças',url:'https://www.portaldasfinancas.gov.pt/',icon:'🏛️',desc:'AT Portugal'},
    {name:'CMVM',url:'https://www.cmvm.pt/',icon:'⚖️',desc:'Regulador mercados PT'},
    {name:'Banco de Portugal',url:'https://www.bportugal.pt/',icon:'🏦',desc:'Banco central'}
  ]}
];

export const DEFAULT_WATCHLIST_STOCKS=[
  {ticker:"ABBV",name:"AbbVie",sector:"Healthcare",divYield:3.85,freq:"Trimestral",months:"Fev/Mai/Ago/Nov",interest:"SIM",notes:"Cobre meses fracos"},
  {ticker:"MAIN",name:"Main Street Capital",sector:"Financial",divYield:7.01,freq:"Mensal",months:"Todos",interest:"SIM",notes:"BDC mensal"},
  {ticker:"PM",name:"Philip Morris",sector:"Tobacco",divYield:5.97,freq:"Trimestral",months:"Jan/Abr/Jul/Out",interest:"SIM",notes:"Tabaco global"},
  {ticker:"KO",name:"Coca-Cola",sector:"Consumer",divYield:3.12,freq:"Trimestral",months:"Abr/Jul/Out/Dez",interest:"TALVEZ",notes:"Dividend King"},
  {ticker:"T",name:"AT&T",sector:"Telecom",divYield:7.12,freq:"Trimestral",months:"Fev/Mai/Ago/Nov",interest:"ANALISAR",notes:"Alto yield, risco"},
  {ticker:"JNJ",name:"Johnson & Johnson",sector:"Healthcare",divYield:2.93,freq:"Trimestral",months:"Mar/Jun/Set/Dez",interest:"TALVEZ",notes:"Dividend King"},
  {ticker:"PEP",name:"PepsiCo",sector:"Consumer",divYield:2.63,freq:"Trimestral",months:"Jan/Mar/Jun/Set",interest:"TALVEZ",notes:"Dividend King"},
  {ticker:"CVX",name:"Chevron",sector:"Energy",divYield:3.49,freq:"Trimestral",months:"Mar/Jun/Set/Dez",interest:"TALVEZ",notes:"Energia"}
];
