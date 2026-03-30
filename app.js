// ══════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════
const MONTHS=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MONTHS_FULL=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const PLAN_COLOR_OPTIONS=["#10b981","#3b82f6","#f97316","#8b5cf6","#f59e0b","#ec4899","#06b6d4","#ef4444","#84cc16","#14b8a6","#f43f5e","#a855f7"];
const SECTOR_COLORS={"Technology":"#3b82f6","Healthcare":"#10b981","Financial":"#f59e0b","Energy":"#ef4444","Consumer":"#8b5cf6","Utilities":"#06b6d4","REIT":"#ec4899","Tobacco":"#f97316","Industrial":"#84cc16","Telecom":"#14b8a6","Other":"#64748b"};
const TABS=[
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

// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
let allAccounts={};
let currentAccountId="";
let state={};
let selectedYear=new Date().getFullYear();
let activeTab="feed";
let charts={};
let fxRate=0.92; // EUR/USD default

// ══════════════════════════════════════════
// ACCOUNT MANAGEMENT
// ══════════════════════════════════════════
function loadAllAccounts(){
  const s=localStorage.getItem('portfolio_accounts_v3');
  if(s){allAccounts=JSON.parse(s)}
  else{
    const defaultId='ekimilson';
    allAccounts={
      _current:defaultId,
      [defaultId]:{
        name:"Ekimilson",
        broker:"XTB",
        stocks:JSON.parse(JSON.stringify(DEFAULT_STOCKS)),
        etfs:JSON.parse(JSON.stringify(DEFAULT_ETFS)),
        plans:JSON.parse(JSON.stringify(DEFAULT_PLANS)),
        watchlistStocks:JSON.parse(JSON.stringify(DEFAULT_WATCHLIST_STOCKS)),
        watchlistETFs:[],
        feedSources:JSON.parse(JSON.stringify(DEFAULT_FEED_SOURCES)),
        ytChannels:JSON.parse(JSON.stringify(DEFAULT_YT_CHANNELS)),
        usefulLinks:JSON.parse(JSON.stringify(DEFAULT_USEFUL_LINKS)),
        dividendsReceived:[],
        decisions:[],
        lastUpdate:new Date().toISOString(),
        lastPriceUpdate:null
      }
    };
  }
  currentAccountId=allAccounts._current||Object.keys(allAccounts).filter(k=>k!=='_current')[0];
  state=allAccounts[currentAccountId];
  state=normalizeAccountState(state);
  allAccounts[currentAccountId]=state;
  renderAccountSelector();
}

function saveAllAccounts(){
  allAccounts[currentAccountId]=state;
  allAccounts._current=currentAccountId;
  localStorage.setItem('portfolio_accounts_v3',JSON.stringify(allAccounts));
}

function saveData(){
  state.lastUpdate=new Date().toISOString();
  saveAllAccounts();
}

function switchAccount(id){
  saveAllAccounts();
  currentAccountId=id;
  state=allAccounts[id];
  allAccounts._current=id;
  saveAllAccounts();
  render();
}

function addAccount(){
  showModal('Nova Conta',`
    <div class="form-row"><label>Nome</label><input id="f_accName" placeholder="Ex: Mãe, Trading212..."></div>
    <div class="form-row"><label>Corretora</label><input id="f_accBroker" placeholder="XTB, Trading 212, etc."></div>
  `,()=>{
    const name=document.getElementById('f_accName').value.trim();
    const broker=document.getElementById('f_accBroker').value.trim();
    if(!name)return;
    const id=name.toLowerCase().replace(/\s+/g,'_')+'_'+Date.now();
    allAccounts[id]={name,broker,stocks:[],etfs:[],plans:[],watchlistStocks:[],watchlistETFs:[],dividendsReceived:[],decisions:[],lastUpdate:new Date().toISOString(),lastPriceUpdate:null};
    switchAccount(id);
    showToast('Conta "'+name+'" criada!');
  });
}

function renderAccountSelector(){
  const sel=document.getElementById('accountSelect');
  sel.innerHTML='';
  Object.keys(allAccounts).filter(k=>k!=='_current').forEach(id=>{
    const a=allAccounts[id];
    const opt=document.createElement('option');
    opt.value=id;
    opt.textContent=a.name+(a.broker?' ('+a.broker+')':'');
    if(id===currentAccountId)opt.selected=true;
    sel.appendChild(opt);
  });
}

// ══════════════════════════════════════════
// DEFAULT DATA
// ══════════════════════════════════════════
const DEFAULT_STOCKS=[
  {ticker:"MO",name:"Altria Group",sector:"Tobacco",volume:2.0212,buyPrice:66.76,currentPrice:66.47,currency:"USD",divYield:6.38,divPerShare:1.06,freq:"Trimestral",months:[1,4,7,10]},
  {ticker:"ENEL",name:"Enel SpA",sector:"Utilities",volume:3.574,buyPrice:9.79,currentPrice:9.17,currency:"EUR",divYield:5.14,divPerShare:0.235,freq:"Semestral",months:[1,7]},
  {ticker:"MDLZ",name:"Mondelez",sector:"Consumer",volume:2.2121,buyPrice:59.71,currentPrice:58.31,currency:"USD",divYield:3.55,divPerShare:0.50,freq:"Trimestral",months:[1,4,7,10]},
  {ticker:"PLD",name:"Prologis",sector:"REIT",volume:0.2179,buyPrice:122.21,currentPrice:128.97,currency:"USD",divYield:3.18,divPerShare:1.07,freq:"Trimestral",months:[3,6,9,12]},
  {ticker:"O",name:"Realty Income",sector:"REIT",volume:1.388,buyPrice:64.73,currentPrice:60.73,currency:"USD",divYield:5.34,divPerShare:0.2705,freq:"Mensal",months:[1,2,3,4,5,6,7,8,9,10,11,12]},
  {ticker:"UVV",name:"Universal Corp",sector:"Tobacco",volume:2,buyPrice:52.71,currentPrice:52.74,currency:"USD",divYield:6.73,divPerShare:0.80,freq:"Trimestral",months:[2,5,8,11]},
  {ticker:"VICI",name:"VICI Properties",sector:"REIT",volume:2.7585,buyPrice:26.59,currentPrice:26.59,currency:"USD",divYield:6.76,divPerShare:0.45,freq:"Trimestral",months:[1,4,7,10]}
];

const DEFAULT_PLANS=[
  {id:"workolic",name:"Workolic",color:"#10b981"},
  {id:"dividendos",name:"Dividendos",color:"#3b82f6"},
  {id:"semicondutores",name:"Semicondutores",color:"#f97316"},
  {id:"ishares",name:"iShares",color:"#8b5cf6"},
  {id:"plano_inicial",name:"Plano Inicial",color:"#f59e0b"}
];

const DEFAULT_ETFS=[
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

const DEFAULT_FEED_SOURCES=[
  {id:'reuters',name:'Reuters Business',rss:'https://www.reutersagency.com/feed/?best-topics=business-finance',url:'https://www.reuters.com/business/',color:'#ff8c00',enabled:true},
  {id:'cnbc',name:'CNBC',rss:'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114',url:'https://www.cnbc.com/world/',color:'#006daa',enabled:true},
  {id:'investing',name:'Investing.com',rss:'https://www.investing.com/rss/news.rss',url:'https://www.investing.com/news/',color:'#2962ff',enabled:true},
  {id:'marketwatch',name:'MarketWatch',rss:'https://feeds.marketwatch.com/marketwatch/topstories/',url:'https://www.marketwatch.com/',color:'#00ac4e',enabled:true},
  {id:'eco',name:'ECO (Portugal)',rss:'https://eco.sapo.pt/feed/',url:'https://eco.sapo.pt/mercados/',color:'#00a651',enabled:true},
  {id:'jnegocios',name:'Jornal de Negócios',rss:'https://www.jornaldenegocios.pt/rss',url:'https://www.jornaldenegocios.pt/',color:'#c8102e',enabled:true},
  {id:'seekalpha',name:'Seeking Alpha',rss:'https://seekingalpha.com/market_currents.xml',url:'https://seekingalpha.com/',color:'#f7971e',enabled:true},
  {id:'yahoo',name:'Yahoo Finance',rss:'https://finance.yahoo.com/news/rssindex',url:'https://finance.yahoo.com/',color:'#7b0099',enabled:true}
];

const DEFAULT_YT_CHANNELS=[
  {id:'yt1',name:'Daniel Menino',channelId:'UCxKVg9fRMnGFGAhBrPHQxYQ',channelUrl:'https://www.youtube.com/@odanielmenino',desc:'Investimentos PT',enabled:true},
  {id:'yt2',name:'Tiago Ramos',channelId:'UC2iRmfRFN0In_aGKNv7DFKQ',channelUrl:'https://www.youtube.com/@TiagoRamosInvest',desc:'Investimentos PT',enabled:true},
  {id:'yt3',name:'Dividend Bull',channelId:'UCsxJh2duQOBihNxOMpfgVOA',channelUrl:'https://www.youtube.com/@DividendBull',desc:'Dividendos',enabled:true},
  {id:'yt4',name:'Joseph Carlson',channelId:'UCbta1dGapXS7TyFXQjELklg',channelUrl:'https://www.youtube.com/@JosephCarlsonShow',desc:'Dividend investing',enabled:true},
  {id:'yt5',name:'Andrei Jikh',channelId:'UCGy7SkBjcIAgTiwkXEtPnYg',channelUrl:'https://www.youtube.com/@AndreiJikh',desc:'Investing & Finance',enabled:true},
  {id:'yt6',name:'The Plain Bagel',channelId:'UCFCEuCsyWP0YkP3CZ3Mr01Q',channelUrl:'https://www.youtube.com/@ThePlainBagel',desc:'Finance education',enabled:true}
];

const DEFAULT_USEFUL_LINKS=[
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

const DEFAULT_WATCHLIST_STOCKS=[
  {ticker:"ABBV",name:"AbbVie",sector:"Healthcare",divYield:3.85,freq:"Trimestral",months:"Fev/Mai/Ago/Nov",interest:"SIM",notes:"Cobre meses fracos"},
  {ticker:"MAIN",name:"Main Street Capital",sector:"Financial",divYield:7.01,freq:"Mensal",months:"Todos",interest:"SIM",notes:"BDC mensal"},
  {ticker:"PM",name:"Philip Morris",sector:"Tobacco",divYield:5.97,freq:"Trimestral",months:"Jan/Abr/Jul/Out",interest:"SIM",notes:"Tabaco global"},
  {ticker:"KO",name:"Coca-Cola",sector:"Consumer",divYield:3.12,freq:"Trimestral",months:"Abr/Jul/Out/Dez",interest:"TALVEZ",notes:"Dividend King"},
  {ticker:"T",name:"AT&T",sector:"Telecom",divYield:7.12,freq:"Trimestral",months:"Fev/Mai/Ago/Nov",interest:"ANALISAR",notes:"Alto yield, risco"},
  {ticker:"JNJ",name:"Johnson & Johnson",sector:"Healthcare",divYield:2.93,freq:"Trimestral",months:"Mar/Jun/Set/Dez",interest:"TALVEZ",notes:"Dividend King"},
  {ticker:"PEP",name:"PepsiCo",sector:"Consumer",divYield:2.63,freq:"Trimestral",months:"Jan/Mar/Jun/Set",interest:"TALVEZ",notes:"Dividend King"},
  {ticker:"CVX",name:"Chevron",sector:"Energy",divYield:3.49,freq:"Trimestral",months:"Mar/Jun/Set/Dez",interest:"TALVEZ",notes:"Energia"}
];


// ══════════════════════════════════════════
// FX & PRICE API
// ══════════════════════════════════════════

async function fetchTickerData(ticker){
  try{
    const r=await fetch('https://corsproxy.io/?url='+encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/'+ticker+'?range=5d&interval=1d'));
    if(!r.ok)return null;
    const d=await r.json();
    const meta=d.chart?.result?.[0]?.meta;
    if(!meta)return null;
    return{price:meta.regularMarketPrice,currency:meta.currency||'USD',name:meta.shortName||meta.longName||'',exchange:meta.exchangeName||''};
  }catch(e){return null}
}

async function autoFillTicker(inputId,nameId,priceId,currencyId){
  const ticker=document.getElementById(inputId).value.trim().toUpperCase();
  if(!ticker)return;
  const data=await fetchTickerData(ticker);
  if(data){
    if(nameId&&data.name){var el=document.getElementById(nameId);if(el)el.value=data.name}
    if(priceId&&data.price){var el=document.getElementById(priceId);if(el)el.value=data.price}
    if(currencyId&&data.currency){var el=document.getElementById(currencyId);if(el){for(var o of el.options){if(o.value===data.currency)o.selected=true}}}
    showToast('Dados de '+ticker+' carregados!');
  }else{showToast('Não encontrei '+ticker,'error')}
}

async function fetchFxRate(){
  try{
    const r=await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const d=await r.json();
    fxRate=d.rates.EUR||0.92;
    localStorage.setItem('cached_fx_rate',JSON.stringify({rate:fxRate,time:Date.now()}));
    document.getElementById('fxRate').textContent='1 USD = '+fxRate.toFixed(4)+' EUR';
    return fxRate;
  }catch(e){
    console.warn('FX fetch failed, trying cache',e);
    var cached=localStorage.getItem('cached_fx_rate');
    if(cached){try{var c=JSON.parse(cached);fxRate=c.rate||0.92}catch(x){}}
    document.getElementById('fxRate').textContent='1 USD = '+fxRate.toFixed(4)+' EUR (cache)';
    return fxRate;
  }
}

async function fetchStockPrice(ticker){
  // Try multiple CORS proxies
  var proxies=[
    'https://corsproxy.io/?url='+encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/'+ticker+'?range=1d&interval=1d'),
    'https://api.allorigins.win/raw?url='+encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/'+ticker+'?range=1d&interval=1d')
  ];
  for(var purl of proxies){
    try{
      var r=await fetch(purl);
      if(!r.ok)continue;
      var d=await r.json();
      var meta=d.chart?.result?.[0]?.meta;
      if(meta&&meta.regularMarketPrice){
        return{price:meta.regularMarketPrice,currency:meta.currency||'USD'};
      }
    }catch(e){continue}
  }
  // Fallback: try cached price
  try{var cached=JSON.parse(localStorage.getItem('cached_prices')||'{}');if(cached.prices&&cached.prices[ticker])return{price:cached.prices[ticker],currency:'USD',cached:true}}catch(e){}
  return null;
}

async function refreshPrices(){
  const btn=document.getElementById('btnRefresh');
  const status=document.getElementById('updateStatus');
  btn.disabled=true;
  btn.textContent='⏳ A atualizar...';
  status.className='update-indicator loading';
  status.innerHTML='<span class="spinner"></span> A buscar preços...';

  await fetchFxRate();

  let updated=0,failed=0;
  const allTickers=[...state.stocks.map(s=>({ticker:s.ticker,type:'stock'}))];

  for(const item of allTickers){
    try{
      const result=await fetchStockPrice(item.ticker);
      if(result){
        const stock=state.stocks.find(s=>s.ticker===item.ticker);
        if(stock){stock.currentPrice=result.price;updated++}
      }else{failed++}
    }catch(e){failed++}
    // Small delay to avoid rate limiting
    await new Promise(r=>setTimeout(r,300));
  }

  // Cache last valid prices locally
  var priceCache={};
  state.stocks.forEach(function(s){priceCache[s.ticker]=s.currentPrice});
  localStorage.setItem('cached_prices',JSON.stringify({prices:priceCache,time:Date.now()}));
  state.lastPriceUpdate=new Date().toISOString();
  saveData();
  render();

  btn.disabled=false;
  btn.textContent='🔄 Atualizar Preços';
  if(failed===0){
    status.className='update-indicator success';
    status.textContent='✅ '+updated+' preços atualizados';
    showToast(updated+' preços atualizados!');
  }else{
    status.className='update-indicator error';
    status.textContent='⚠️ '+updated+' ok, '+failed+' falharam';
    showToast(updated+' ok, '+failed+' falharam — atualiza manualmente','error');
  }
}

// Auto-refresh check (every 24h)
function checkAutoRefresh(){
  if(!state.lastPriceUpdate)return;
  const last=new Date(state.lastPriceUpdate);
  const now=new Date();
  const hours=(now-last)/(1000*60*60);
  if(hours>=24){
    console.log('Auto-refreshing prices (>24h since last update)');
    refreshPrices();
  }
}

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════
function toEUR(value,currency){
  if(currency==='EUR')return value;
  return value*fxRate;
}

function fmt(v){return new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(v)}

function calcDividendCalendar(){
  return MONTHS.map((name,idx)=>{
    const monthNum=idx+1;let total=0;const details=[];
    state.stocks.forEach(s=>{
      if(s.months&&s.months.includes(monthNum)){
        const amt=toEUR(s.volume*s.divPerShare,s.currency);
        total+=amt;
        details.push({ticker:s.ticker,name:s.name,amount:amt});
      }
    });
    return{month:name,monthFull:MONTHS_FULL[idx],monthNum,total,details,count:details.length};
  });
}

function calcTotals(){
  const si=state.stocks.reduce((a,s)=>a+toEUR(s.volume*s.buyPrice,s.currency),0);
  const sc=state.stocks.reduce((a,s)=>a+toEUR(s.volume*s.currentPrice,s.currency),0);
  const ei=state.etfs.reduce((a,e)=>a+e.invested,0);
  const ec=state.etfs.reduce((a,e)=>a+e.current,0);
  return{stocksInv:si,stocksCur:sc,etfsInv:ei,etfsCur:ec,totalInv:si+ei,totalCur:sc+ec};
}

function getPlan(planId){return(state.plans||[]).find(p=>p.id===planId)||{name:planId,color:'#64748b'}}


function sanitizeHTML(str){
  if(!str)return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function sanitizeURL(url){
  if(!url)return '#';
  var s=String(url).trim();
  if(s.startsWith('http://')||s.startsWith('https://'))return s;
  return '#';
}

function showToast(msg,type='success'){
  const t=document.createElement('div');
  t.className='toast'+(type==='error'?' error':'');
  t.textContent=msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(()=>t.remove(),3000);
}

function exportData(){
  localStorage.setItem('last_backup_date',Date.now().toString());
  var reminder=document.getElementById('backupReminder');if(reminder)reminder.remove();
  const blob=new Blob([JSON.stringify(allAccounts,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  showToast('Backup exportado!');
}

function importData(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    try{
      const imported=JSON.parse(ev.target.result);
      // Validate structure
      if(typeof imported!=='object'||imported===null){throw new Error('Formato inválido: não é um objeto JSON')}
      if(imported._current){
        // Multi-account format - validate each account
        var validAccounts=0;
        Object.keys(imported).forEach(function(k){
          if(k==='_current')return;
          if(typeof imported[k]==='object'&&imported[k].name){
            imported[k]=normalizeAccountState(imported[k]);
            validAccounts++;
          }
        });
        if(validAccounts===0)throw new Error('Nenhuma conta válida encontrada no ficheiro');
        allAccounts=imported;
      }else if(imported.name||imported.stocks){
        // Single account format
        var normalized=normalizeAccountState(imported);
        allAccounts[currentAccountId]=normalized;
      }else{
        throw new Error('Formato não reconhecido. Esperado: backup do Portfolio Tracker');
      }
      localStorage.setItem('portfolio_accounts_v3',JSON.stringify(allAccounts));
      showToast('Dados importados com sucesso! A recarregar...');
      setTimeout(function(){location.reload()},1000);
    }catch(err){
      alert('Erro ao importar: '+err.message+'\n\nVerifica se o ficheiro é um backup válido do Portfolio Tracker.');
    }
  };
  reader.readAsText(file);
  e.target.value='';
}

function normalizeAccountState(acc){
  // Ensure all required fields exist with correct types
  if(!acc.name)acc.name='Conta Importada';
  if(!Array.isArray(acc.stocks))acc.stocks=[];
  if(!Array.isArray(acc.etfs))acc.etfs=[];
  if(!Array.isArray(acc.plans))acc.plans=JSON.parse(JSON.stringify(DEFAULT_PLANS));
  if(!Array.isArray(acc.watchlistStocks))acc.watchlistStocks=[];
  if(!Array.isArray(acc.watchlistETFs))acc.watchlistETFs=[];
  if(!Array.isArray(acc.dividendsReceived))acc.dividendsReceived=[];
  if(!Array.isArray(acc.decisions))acc.decisions=[];
  if(!Array.isArray(acc.portfolioHistory))acc.portfolioHistory=[];
  if(!Array.isArray(acc.feedSources))acc.feedSources=JSON.parse(JSON.stringify(DEFAULT_FEED_SOURCES));
  if(!Array.isArray(acc.ytChannels))acc.ytChannels=JSON.parse(JSON.stringify(DEFAULT_YT_CHANNELS));
  if(!Array.isArray(acc.usefulLinks))acc.usefulLinks=JSON.parse(JSON.stringify(DEFAULT_USEFUL_LINKS));
  if(!acc.lastUpdate)acc.lastUpdate=new Date().toISOString();
  // Validate stocks have required fields
  acc.stocks=acc.stocks.filter(function(s){return s&&s.ticker}).map(function(s){
    return{ticker:String(s.ticker||''),name:String(s.name||s.ticker||''),sector:String(s.sector||'Other'),
      volume:Number(s.volume)||0,buyPrice:Number(s.buyPrice)||0,currentPrice:Number(s.currentPrice)||0,
      currency:String(s.currency||'USD'),divYield:Number(s.divYield)||0,divPerShare:Number(s.divPerShare)||0,
      freq:String(s.freq||'Trimestral'),months:Array.isArray(s.months)?s.months.filter(function(m){return m>=1&&m<=12}):[]};
  });
  // Validate ETFs
  acc.etfs=acc.etfs.filter(function(e){return e&&e.name}).map(function(e){
    return{planId:String(e.planId||''),name:String(e.name||''),ticker:String(e.ticker||''),
      isin:String(e.isin||''),type:String(e.type||'ACC'),invested:Number(e.invested)||0,current:Number(e.current)||0};
  });
  return acc;
}


function importCSVData(e){
  var file=e.target.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(ev){
    try{
      var text=ev.target.result;
      var lines=text.split('\n').filter(function(l){return l.trim()});
      if(lines.length<2){showToast('Ficheiro CSV vazio ou inválido','error');return}
      var headers=lines[0].split(/[,;\t]/).map(function(h){return h.trim().replace(/"/g,'').toLowerCase()});
      
      // Detect format (XTB vs Trading212 vs generic)
      var format='generic';
      var headerStr=headers.join(',');
      if(headerStr.includes('symbol')&&headerStr.includes('open price'))format='xtb';
      else if(headerStr.includes('ticker')&&headerStr.includes('average price'))format='trading212';
      else if(headerStr.includes('instrument')&&headerStr.includes('quantity'))format='xtb_history';
      
      var imported=[];
      var separator=lines[0].includes(';')?';':(lines[0].includes('\t')?'\t':',');
      
      for(var i=1;i<lines.length;i++){
        var cols=lines[i].split(separator).map(function(c){return c.trim().replace(/"/g,'')});
        if(cols.length<3)continue;
        var row={};
        headers.forEach(function(h,j){row[h]=cols[j]||''});
        
        var stock=null;
        if(format==='xtb'){
          stock={ticker:row['symbol']||row['instrument']||'',name:row['symbol']||'',
            volume:parseFloat(row['volume']||row['quantity']||0),
            buyPrice:parseFloat(row['open price']||row['opening price']||0),
            currentPrice:parseFloat(row['close price']||row['current price']||row['open price']||0),
            currency:'EUR',sector:'Other',divYield:0,divPerShare:0,freq:'Trimestral',months:[]};
        }else if(format==='trading212'){
          stock={ticker:row['ticker']||row['instrument']||'',name:row['name']||row['ticker']||'',
            volume:parseFloat(row['shares']||row['quantity']||row['no. shares']||0),
            buyPrice:parseFloat(row['average price']||row['price / share']||0),
            currentPrice:parseFloat(row['current price']||row['average price']||0),
            currency:row['currency']||'EUR',sector:'Other',divYield:0,divPerShare:0,freq:'Trimestral',months:[]};
        }else{
          // Generic: try common column names
          var ticker=row['ticker']||row['symbol']||row['instrument']||row['ação']||cols[0]||'';
          stock={ticker:ticker,name:row['name']||row['empresa']||row['nome']||ticker,
            volume:parseFloat(row['volume']||row['quantity']||row['shares']||row['quantidade']||cols[1]||0),
            buyPrice:parseFloat(row['buy price']||row['price']||row['preço']||row['open price']||cols[2]||0),
            currentPrice:parseFloat(row['current price']||row['close price']||row['preço atual']||row['buy price']||cols[2]||0),
            currency:row['currency']||row['moeda']||'EUR',sector:'Other',divYield:0,divPerShare:0,freq:'Trimestral',months:[]};
        }
        
        if(stock&&stock.ticker&&stock.volume>0){
          // Clean ticker (remove .US suffix common in XTB)
          stock.ticker=stock.ticker.replace(/\.US$/i,'').replace(/\.UK$/i,'').toUpperCase();
          imported.push(stock);
        }
      }
      
      if(imported.length===0){
        showToast('Nenhuma posição válida encontrada no CSV. Verifica o formato.','error');
        return;
      }
      
      // Show confirmation modal
      var preview=imported.slice(0,5).map(function(s){return s.ticker+' ('+s.volume.toFixed(2)+' @ '+s.buyPrice.toFixed(2)+')'}).join(', ');
      if(imported.length>5)preview+=' e mais '+(imported.length-5)+'...';
      
      showModal('Importar '+imported.length+' posições ('+format+')',
        '<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Formato detetado: <strong>'+format.toUpperCase()+'</strong></div>'+
        '<div style="font-size:12px;margin-bottom:16px">Posições: '+sanitizeHTML(preview)+'</div>'+
        '<div class="form-row"><label>O que fazer?</label><select id="f_csv_mode"><option value="add">Adicionar às ações existentes</option><option value="replace">Substituir todas as ações</option></select></div>',
        function(){
          var mode=document.getElementById('f_csv_mode').value;
          if(mode==='replace')state.stocks=[];
          imported.forEach(function(s){
            var existing=state.stocks.find(function(ex){return ex.ticker===s.ticker});
            if(existing){existing.volume=s.volume;existing.buyPrice=s.buyPrice;existing.currentPrice=s.currentPrice}
            else{state.stocks.push(s)}
          });
          showToast(imported.length+' posições importadas!');
        }
      );
    }catch(err){
      showToast('Erro ao ler CSV: '+err.message,'error');
    }
  };
  reader.readAsText(file);
  e.target.value='';
}

function showModal(title,fieldsHTML,onSave){
  const overlay=document.createElement('div');
  overlay.className='modal-overlay';
  overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};
  overlay.innerHTML=`<div class="modal"><h3>${title}</h3><div>${fieldsHTML}</div><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px"><button class="btn" onclick="this.closest('.modal-overlay').remove()">Cancelar</button><button class="btn btn-primary" id="modalSaveBtn">Guardar</button></div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#modalSaveBtn').onclick=()=>{onSave();overlay.remove();saveData();render()};
}


// ══════════════════════════════════════════
// RENDER ENGINE
// ══════════════════════════════════════════

function checkBackupReminder(){
  var lastBackup=localStorage.getItem('last_backup_date');
  if(!lastBackup){localStorage.setItem('last_backup_date',Date.now().toString());return}
  var daysSince=(Date.now()-parseInt(lastBackup))/(1000*60*60*24);
  if(daysSince>=7){
    var bar=document.querySelector('.export-bar-right');
    if(bar&&!document.getElementById('backupReminder')){
      var reminder=document.createElement('span');
      reminder.id='backupReminder';
      reminder.style.cssText='font-size:11px;color:var(--yellow);padding:4px 10px;border-radius:6px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3)';
      reminder.textContent='⚠️ Backup há '+Math.floor(daysSince)+' dias';
      bar.prepend(reminder);
    }
  }
}

function render(){
  checkBackupReminder();
  document.getElementById('headerTitle').textContent='Portfolio de '+state.name;
  document.title='Portfolio de '+state.name;
  const d=state.lastUpdate?new Date(state.lastUpdate):new Date();
  document.getElementById('lastUpdate').textContent=d.toLocaleDateString('pt-PT');
  document.getElementById('fxRate').textContent='1 USD = '+fxRate.toFixed(4)+' EUR';
  const t=calcTotals();
  document.getElementById('totalValue').textContent=fmt(t.totalCur);
  if(state.lastPriceUpdate){
    document.getElementById('lastPriceUpdate').textContent=new Date(state.lastPriceUpdate).toLocaleString('pt-PT');
  }
  renderYearButtons();
  renderTabs();
  renderContent();
  renderAccountSelector();
}

function renderYearButtons(){
  const cy=new Date().getFullYear();
  const years=[cy,cy+1,cy+2];
  document.getElementById('btnPrevYear').textContent=years[0];
  document.getElementById('btnPrevYear').className='btn btn-sm'+(selectedYear===years[0]?' active':'');
  document.getElementById('btnPrevYear').onclick=()=>{selectedYear=years[0];render()};
  document.getElementById('btnCurYear').textContent=years[1];
  document.getElementById('btnCurYear').className='btn btn-sm'+(selectedYear===years[1]?' active':'');
  document.getElementById('btnCurYear').onclick=()=>{selectedYear=years[1];render()};
  document.getElementById('btnNextYear').textContent=years[2];
  document.getElementById('btnNextYear').className='btn btn-sm'+(selectedYear===years[2]?' active':'');
  document.getElementById('btnNextYear').onclick=()=>{selectedYear=years[2];render()};
}

function renderTabs(){
  document.getElementById('tabs').innerHTML=TABS.map(t=>`<button class="tab ${activeTab===t.id?'active':''}" onclick="switchTab('${t.id}')">${t.label}</button>`).join('');
}

function switchTab(id){activeTab=id;renderTabs();renderContent()}

function destroyCharts(){Object.values(charts).forEach(c=>{try{c.destroy()}catch(e){}});charts={}}

function renderContent(){
  destroyCharts();
  const el=document.getElementById('content');
  switch(activeTab){
    case 'feed':el.innerHTML=renderFeed();setTimeout(loadFeedData,100);break;
    case 'overview':el.innerHTML=renderOverview();break;
    case 'stocks':el.innerHTML=renderStocks();break;
    case 'etfs':el.innerHTML=renderETFs();break;
    case 'dividends':el.innerHTML=renderDividends();break;
    case 'calendar':el.innerHTML=renderCalendar();break;
    case 'watchlist':el.innerHTML=renderWatchlist();break;
    case 'history':el.innerHTML=renderHistory();break;
    case 'fire':el.innerHTML=renderFIRE();break;
    case 'analyzer':el.innerHTML=renderAnalyzer();break;
    case 'etfanalyzer':el.innerHTML=renderETFAnalyzer();break;
    case 'correlation':el.innerHTML=renderCorrelation();break;
    case 'comparador':el.innerHTML=renderComparador();break;
    case 'links':el.innerHTML=renderLinks();break;
  }
  setTimeout(initCharts,50);
}


// ══════════════════════════════════════════
// 📰 FEED
// ══════════════════════════════════════════
function renderFeed(){
  var vidFirst=state.feedVideoFirst!==false;
  var toggleBtn1=vidFirst?'active':'';
  var toggleBtn2=vidFirst?'':'active';
  
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:8px"><h2 style="font-size:18px;font-weight:800">📰 Feed de Notícias & Conteúdo</h2><div style="display:flex;gap:8px"><button class="btn btn-sm" onclick="loadFeedData()">🔄 Atualizar</button><button class="btn btn-sm" onclick="manageFeedSources()">⚙️ Fontes</button><button class="btn btn-sm" onclick="manageYTChannels()">📺 Canais</button></div></div>'+
    '<div class="feed-section-toggle"><button class="period-pill '+toggleBtn1+'" onclick="toggleFeedOrder(true)">📺 Vídeos primeiro</button><button class="period-pill '+toggleBtn2+'" onclick="toggleFeedOrder(false)">📰 Notícias primeiro</button></div>'+
    (vidFirst?
      '<div class="card"><div class="card-title">📺 Últimos Vídeos</div><div id="ytFeedContainer"><div style="text-align:center;padding:30px;color:var(--text-dim)"><span class="spinner"></span> A carregar vídeos...</div></div></div>'+
      '<div class="card"><div class="card-title">📰 Notícias Financeiras</div><div id="newsFeedContainer"><div style="text-align:center;padding:30px;color:var(--text-dim)"><span class="spinner"></span> A carregar notícias...</div></div></div>'
    :
      '<div class="card"><div class="card-title">📰 Notícias Financeiras</div><div id="newsFeedContainer"><div style="text-align:center;padding:30px;color:var(--text-dim)"><span class="spinner"></span> A carregar notícias...</div></div></div>'+
      '<div class="card"><div class="card-title">📺 Últimos Vídeos</div><div id="ytFeedContainer"><div style="text-align:center;padding:30px;color:var(--text-dim)"><span class="spinner"></span> A carregar vídeos...</div></div></div>'
    );
}

function toggleFeedOrder(vidFirst){
  state.feedVideoFirst=vidFirst;
  saveData();
  renderContent();
}

async function loadFeedData(){
  loadYTFeed();
  loadNewsFeed();
}

async function loadYTFeed(){
  var container=document.getElementById('ytFeedContainer');
  if(!container)return;
  var channels=state.ytChannels||DEFAULT_YT_CHANNELS;
  var activeChannels=channels.filter(function(ch){return ch.enabled});
  // Sort by priority (index = priority, lower = higher priority)
  var allVideos=[];
  var sevenDaysAgo=new Date();sevenDaysAgo.setDate(sevenDaysAgo.getDate()-7);

  for(var ci=0;ci<activeChannels.length;ci++){
    var ch=activeChannels[ci];
    var maxVids=(ci<2)?3:(ci<4)?2:1; // Top 2 channels get 3 vids, next 2 get 2, rest get 1
    try{
      var rssUrl='https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id='+ch.channelId;
      var r=await fetch(rssUrl);
      if(!r.ok)continue;
      var d=await r.json();
      if(d.items){
        var count=0;
        for(var item of d.items){
          if(count>=maxVids)break;
          var pubDate=item.pubDate?new Date(item.pubDate):null;
          if(pubDate&&pubDate<sevenDaysAgo)continue; // Skip videos older than 7 days
          var vidId='';
          if(item.link){var m=item.link.match(/v=([^&]+)/);if(m)vidId=m[1]}
          allVideos.push({
            channel:ch.name,priority:ci,
            title:item.title||'',
            link:item.link||ch.channelUrl,
            thumb:vidId?'https://img.youtube.com/vi/'+vidId+'/mqdefault.jpg':'',
            date:pubDate?pubDate.toLocaleDateString('pt-PT'):'',
            dateObj:pubDate,
            vidId:vidId
          });
          count++;
        }
      }
    }catch(e){console.warn('YT feed error for '+ch.name,e)}
  }

  // Sort: by priority first, then by date within same priority
  allVideos.sort(function(a,b){
    if(a.priority!==b.priority)return a.priority-b.priority;
    return (b.dateObj||0)-(a.dateObj||0);
  });

  if(allVideos.length===0){
    container.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-dim)">Nenhum vídeo nos últimos 7 dias. Tenta atualizar.</div>';
    return;
  }

  container.innerHTML='<div class="yt-grid">'+allVideos.map(function(v){
    return '<a href="'+sanitizeURL(v.link)+'" target="_blank" class="yt-card">'+
      '<div class="yt-thumb">'+(v.thumb?'<img src="'+v.thumb+'" alt="" loading="lazy">':'<div style="font-size:48px;opacity:.3">▶</div>')+'</div>'+
      '<div class="yt-info"><div class="yt-channel">'+v.channel+'</div><div class="yt-title">'+v.title+'</div><div style="font-size:10px;color:var(--text-dim);margin-top:4px">'+v.date+'</div></div></a>';
  }).join('')+'</div>';
}

async function loadNewsFeed(){
  var container=document.getElementById('newsFeedContainer');
  if(!container)return;
  var sources=state.feedSources||DEFAULT_FEED_SOURCES;
  var activeSources=sources.filter(function(s){return s.enabled&&s.rss});
  var allNews=[];

  for(var src of activeSources.slice(0,5)){
    try{
      var rssUrl='https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(src.rss);
      var r=await fetch(rssUrl);
      if(!r.ok)continue;
      var d=await r.json();
      if(d.items){
        d.items.slice(0,4).forEach(function(item){
          var desc=item.description||'';
          desc=desc.replace(/<[^>]*>/g,'').substring(0,150);
          allNews.push({
            source:src.name,
            color:src.color,
            title:item.title||'',
            desc:desc,
            link:item.link||src.url,
            date:item.pubDate?new Date(item.pubDate).toLocaleDateString('pt-PT'):'',
            thumb:item.thumbnail||item.enclosure?.link||''
          });
        });
      }
    }catch(e){console.warn('RSS error for '+src.name,e)}
  }

  if(allNews.length===0){
    container.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-dim)">Não foi possível carregar notícias. Tenta atualizar ou verifica as fontes.</div>';
    return;
  }

  // Sort by date desc
  allNews.sort(function(a,b){return new Date(b.date)-new Date(a.date)});

  container.innerHTML='<div class="feed-grid">'+allNews.map(function(n){
    return '<a href="'+sanitizeURL(n.link)+'" target="_blank" class="feed-item">'+
      (n.thumb?'<div style="width:100%;height:140px;border-radius:8px;overflow:hidden;margin-bottom:10px;background:var(--bg)"><img src="'+n.thumb+'" style="width:100%;height:100%;object-fit:cover" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>':'')+
      '<div class="feed-source" style="color:'+n.color+'">'+sanitizeHTML(n.source)+'</div>'+
      '<div class="feed-title">'+sanitizeHTML(n.title)+'</div>'+
      '<div class="feed-desc">'+sanitizeHTML(n.desc)+'</div>'+
      '<div class="feed-date">'+n.date+'</div></a>';
  }).join('')+'</div>';
}

function manageFeedSources(){
  var sources=state.feedSources||DEFAULT_FEED_SOURCES;
  var html=sources.map(function(s,i){
    return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;padding:8px;background:var(--bg);border-radius:8px;flex-wrap:wrap">'+
      '<input type="checkbox" id="fs_en_'+i+'" '+(s.enabled?'checked':'')+' style="width:18px;height:18px;cursor:pointer">'+
      '<input id="fs_name_'+i+'" value="'+s.name+'" style="width:100px;padding:5px 8px;border-radius:6px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:11px">'+
      '<input id="fs_rss_'+i+'" value="'+(s.rss||'')+'" placeholder="RSS URL" style="flex:1;padding:5px 8px;border-radius:6px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:11px">'+
      '<button class="btn btn-sm btn-danger" onclick="removeFeedSource('+i+')">🗑️</button></div>';
  }).join('');
  html+='<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"><div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">Para encontrar RSS de um site, pesquisa "[nome do site] RSS feed" no Google</div><div class="form-grid"><div class="form-row"><label>Nome</label><input id="fs_new_name" placeholder="Nome"></div><div class="form-row"><label>RSS URL</label><input id="fs_new_rss" placeholder="https://.../feed.xml"></div></div></div>';

  showModal('Gerir Fontes de Notícias',html,function(){
    sources.forEach(function(s,i){
      s.name=document.getElementById('fs_name_'+i).value;
      s.rss=document.getElementById('fs_rss_'+i).value;
      s.enabled=document.getElementById('fs_en_'+i).checked;
    });
    var newName=document.getElementById('fs_new_name').value.trim();
    var newRss=document.getElementById('fs_new_rss').value.trim();
    if(newName&&newRss){sources.push({id:'custom_'+Date.now(),name:newName,rss:newRss,url:newRss,color:'var(--accent)',enabled:true})}
    state.feedSources=sources;
  });
}

function removeFeedSource(i){
  var sources=state.feedSources||[];
  sources.splice(i,1);
  state.feedSources=sources;
  saveData();render();
}

function manageYTChannels(){
  var channels=state.ytChannels||DEFAULT_YT_CHANNELS;
  var html='<div style="font-size:11px;color:var(--text-dim);margin-bottom:10px">Ordem = prioridade. Os primeiros canais mostram mais vídeos. Usa ↑↓ para reordenar.</div>';
  html+=channels.map(function(ch,i){
    return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;padding:6px 8px;background:var(--bg);border-radius:8px">'+
      '<span style="font-size:10px;color:var(--accent);font-weight:800;width:20px">#'+(i+1)+'</span>'+
      '<input type="checkbox" id="yt_en_'+i+'" '+(ch.enabled?'checked':'')+' style="width:16px;height:16px;cursor:pointer">'+
      '<input id="yt_name_'+i+'" value="'+ch.name+'" style="width:90px;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:11px">'+
      '<input id="yt_cid_'+i+'" value="'+(ch.channelId||'')+'" placeholder="Channel ID" style="flex:1;padding:4px 8px;border-radius:6px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:11px">'+
      '<button class="feed-order-btn" onclick="moveYTChannel('+i+',-1)">↑</button>'+
      '<button class="feed-order-btn" onclick="moveYTChannel('+i+',1)">↓</button>'+
      '<button class="btn btn-sm btn-danger" onclick="removeYTChannel('+i+')">🗑️</button></div>';
  }).join('');
  html+='<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"><div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">Channel ID: usa <a href="https://commentpicker.com/youtube-channel-id.php" target="_blank" style="color:var(--accent-light)">este site</a> para encontrar</div><div class="form-grid"><div class="form-row"><label>Nome</label><input id="yt_new_name" placeholder="Nome"></div><div class="form-row"><label>Channel ID</label><input id="yt_new_cid" placeholder="UCxxxxxxx"></div></div><div class="form-row"><label>Descrição</label><input id="yt_new_desc" placeholder="Investimentos..."></div></div>';

  showModal('Gerir Canais YouTube (ordem = prioridade)',html,function(){
    channels.forEach(function(ch,i){
      ch.name=document.getElementById('yt_name_'+i).value;
      ch.channelId=document.getElementById('yt_cid_'+i).value;
      ch.enabled=document.getElementById('yt_en_'+i).checked;
    });
    var newName=document.getElementById('yt_new_name').value.trim();
    var newCid=document.getElementById('yt_new_cid').value.trim();
    if(newName&&newCid){channels.push({id:'yt_'+Date.now(),name:newName,channelId:newCid,channelUrl:'https://www.youtube.com/channel/'+newCid,desc:document.getElementById('yt_new_desc').value||'',enabled:true})}
    state.ytChannels=channels;
  });
}

function moveYTChannel(i,dir){
  var channels=state.ytChannels||[];
  var newI=i+dir;
  if(newI<0||newI>=channels.length)return;
  var tmp=channels[i];channels[i]=channels[newI];channels[newI]=tmp;
  state.ytChannels=channels;saveData();render();
}

function removeYTChannel(i){
  var channels=state.ytChannels||[];
  channels.splice(i,1);
  state.ytChannels=channels;
  saveData();render();
}


// ══════════════════════════════════════════
// 🔬 ANALISADOR DE AÇÕES
// ══════════════════════════════════════════
var analyzerData=null;
var analyzerPeriod='6mo';

function renderAnalyzer(){
  var savedTicker=window._analyzerTicker||'';
  var html='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h2 style="font-size:18px;font-weight:800">🔬 Analisador de Ações</h2></div>';
  html+='<div class="analyzer-search"><input id="analyzer_ticker" placeholder="Ticker sem sufixo (ex: AAPL, MO, O, UVV, ENEL.MI...)" value="'+savedTicker+'" onkeydown="if(event.key===\'Enter\')analyzeStock()"><button class="btn btn-primary" onclick="analyzeStock()">🔍 Analisar</button></div>';
  html+='<div id="analyzerResult">';
  if(analyzerData){html+=renderAnalyzerResult()}
  else{html+='<div style="text-align:center;padding:60px;color:var(--text-dim)">Introduz um ticker e clica Analisar para ver dados detalhados</div>'}
  html+='</div>';
  return html;
}

async function analyzeStock(){
  var ticker=document.getElementById('analyzer_ticker').value.trim().toUpperCase();
  if(!ticker)return;
  window._analyzerTicker=ticker;
  var container=document.getElementById('analyzerResult');
  container.innerHTML='<div style="text-align:center;padding:40px"><span class="spinner"></span> A analisar '+ticker+'...</div>';

  try{
    // Fetch chart data
    var r=await fetch('https://corsproxy.io/?url='+encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/'+ticker+'?range=1y&interval=1d'));
    var d=await r.json();
    var meta=d.chart?.result?.[0]?.meta;
    var timestamps=d.chart?.result?.[0]?.timestamp||[];
    var closes=d.chart?.result?.[0]?.indicators?.quote?.[0]?.close||[];
    var highs=d.chart?.result?.[0]?.indicators?.quote?.[0]?.high||[];
    var lows=d.chart?.result?.[0]?.indicators?.quote?.[0]?.low||[];
    var volumes=d.chart?.result?.[0]?.indicators?.quote?.[0]?.volume||[];

    if(!meta){container.innerHTML='<div style="text-align:center;padding:40px;color:var(--red)">Ticker "'+ticker+'" não encontrado</div>';return}

    var price=meta.regularMarketPrice;
    var prevClose=meta.chartPreviousClose||meta.previousClose||price;
    var dayChange=price-prevClose;
    var dayChangePct=(dayChange/prevClose)*100;
    var high52w=Math.max(...closes.filter(function(v){return v}));
    var low52w=Math.min(...closes.filter(function(v){return v}));
    var avgVol=volumes.length>0?volumes.reduce(function(a,b){return a+(b||0)},0)/volumes.length:0;

    analyzerData={
      ticker:ticker,name:meta.shortName||meta.longName||ticker,
      currency:meta.currency||'USD',exchange:meta.exchangeName||'',
      price:price,prevClose:prevClose,dayChange:dayChange,dayChangePct:dayChangePct,
      high52w:high52w,low52w:low52w,avgVolume:avgVol,
      timestamps:timestamps,closes:closes,highs:highs,lows:lows,volumes:volumes
    };

    container.innerHTML=renderAnalyzerResult();
    setTimeout(function(){initAnalyzerChart()},100);

  }catch(e){
    container.innerHTML='<div style="text-align:center;padding:40px;color:var(--red)">Erro ao analisar: '+e.message+'</div>';
  }
}

function renderAnalyzerResult(){
  var d=analyzerData;if(!d)return '';
  var cur=d.currency==='EUR'?'\u20ac':'$';
  var isPos=d.dayChange>=0;
  var fromHigh=((d.price-d.high52w)/d.high52w*100);
  var fromLow=((d.price-d.low52w)/d.low52w*100);
  // Check if in portfolio
  var inPortfolio=state.stocks.find(function(s){return s.ticker===d.ticker});
  var portfolioInfo='';
  if(inPortfolio){
    var pl=inPortfolio.volume*(d.price-inPortfolio.buyPrice);
    var plPct=((d.price-inPortfolio.buyPrice)/inPortfolio.buyPrice*100);
    portfolioInfo='<div class="card" style="border-color:var(--accent)"><div class="card-title">📦 Na tua carteira</div><div class="analyzer-grid"><div class="analyzer-metric"><div class="analyzer-metric-label">Volume</div><div class="analyzer-metric-value">'+inPortfolio.volume.toFixed(4)+'</div></div><div class="analyzer-metric"><div class="analyzer-metric-label">Preço Compra</div><div class="analyzer-metric-value">'+cur+inPortfolio.buyPrice.toFixed(2)+'</div></div><div class="analyzer-metric"><div class="analyzer-metric-label">P&L</div><div class="analyzer-metric-value" style="color:'+(pl>=0?'var(--green)':'var(--red)')+'">'+cur+pl.toFixed(2)+' ('+plPct.toFixed(2)+'%)</div></div><div class="analyzer-metric"><div class="analyzer-metric-label">Div Yield</div><div class="analyzer-metric-value" style="color:var(--yellow)">'+inPortfolio.divYield+'%</div></div></div></div>';
  }

  return '<div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px"><div><div style="font-size:12px;color:var(--text-muted)">'+d.exchange+'</div><div style="font-size:22px;font-weight:800">'+d.name+' <span style="color:var(--accent)">('+d.ticker+')</span></div></div><div style="text-align:right"><div style="font-size:28px;font-weight:800">'+cur+d.price.toFixed(2)+'</div><div style="font-size:14px;font-weight:700;color:'+(isPos?'var(--green)':'var(--red)')+'">'+(isPos?'+':'')+d.dayChange.toFixed(2)+' ('+(isPos?'+':'')+d.dayChangePct.toFixed(2)+'%)</div></div></div>'+
    '<div class="analyzer-grid"><div class="analyzer-metric"><div class="analyzer-metric-label">Máximo 52 semanas</div><div class="analyzer-metric-value">'+cur+d.high52w.toFixed(2)+'<span style="font-size:11px;color:var(--red);margin-left:6px">'+fromHigh.toFixed(1)+'%</span></div></div><div class="analyzer-metric"><div class="analyzer-metric-label">Mínimo 52 semanas</div><div class="analyzer-metric-value">'+cur+d.low52w.toFixed(2)+'<span style="font-size:11px;color:var(--green);margin-left:6px">+'+fromLow.toFixed(1)+'%</span></div></div><div class="analyzer-metric"><div class="analyzer-metric-label">Volume Médio</div><div class="analyzer-metric-value">'+(d.avgVolume>1000000?(d.avgVolume/1000000).toFixed(1)+'M':(d.avgVolume/1000).toFixed(0)+'K')+'</div></div><div class="analyzer-metric"><div class="analyzer-metric-label">Moeda</div><div class="analyzer-metric-value">'+d.currency+'</div></div></div>'+
    '<div style="display:flex;gap:8px;margin:16px 0"><a href="https://seekingalpha.com/symbol/'+d.ticker+'" target="_blank" class="btn btn-sm" style="text-decoration:none">Seeking Alpha ↗</a><a href="https://finance.yahoo.com/quote/'+d.ticker+'" target="_blank" class="btn btn-sm" style="text-decoration:none">Yahoo Finance ↗</a><a href="https://www.google.com/finance/quote/'+d.ticker+'" target="_blank" class="btn btn-sm" style="text-decoration:none">Google Finance ↗</a></div></div>'+
    portfolioInfo+
    '<div class="card"><div class="card-title">Gráfico de Preços</div><div class="period-pills"><button class="period-pill '+(analyzerPeriod==='1mo'?'active':'')+'" onclick="changeAnalyzerPeriod(\'1mo\')">1M</button><button class="period-pill '+(analyzerPeriod==='3mo'?'active':'')+'" onclick="changeAnalyzerPeriod(\'3mo\')">3M</button><button class="period-pill '+(analyzerPeriod==='6mo'?'active':'')+'" onclick="changeAnalyzerPeriod(\'6mo\')">6M</button><button class="period-pill '+(analyzerPeriod==='1y'?'active':'')+'" onclick="changeAnalyzerPeriod(\'1y\')">1A</button><button class="period-pill '+(analyzerPeriod==='5y'?'active':'')+'" onclick="changeAnalyzerPeriod(\'5y\')">5A</button></div><div class="chart-wrap"><canvas id="chartAnalyzer" height="300"></canvas></div></div>';
}

async function changeAnalyzerPeriod(period){
  analyzerPeriod=period;
  var ticker=analyzerData?.ticker;
  if(!ticker)return;
  try{
    var interval=period==='5y'?'1wk':(period==='1y'?'1d':'1d');
    var r=await fetch('https://corsproxy.io/?url='+encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/'+ticker+'?range='+period+'&interval='+interval));
    var d=await r.json();
    var res=d.chart?.result?.[0];
    if(res){
      analyzerData.timestamps=res.timestamp||[];
      analyzerData.closes=res.indicators?.quote?.[0]?.close||[];
    }
    // Re-render period pills and chart
    destroyCharts();
    var container=document.getElementById('analyzerResult');
    if(container){container.innerHTML=renderAnalyzerResult();setTimeout(function(){initAnalyzerChart()},100)}
  }catch(e){console.warn('Period change error',e)}
}

function initAnalyzerChart(){
  if(!analyzerData)return;
  var ctx=document.getElementById('chartAnalyzer');if(!ctx)return;
  var dates=analyzerData.timestamps.map(function(t){return new Date(t*1000).toLocaleDateString('pt-PT')});
  var prices=analyzerData.closes;
  var firstPrice=prices.find(function(p){return p!=null})||0;
  
  charts.analyzer=new Chart(ctx,{
    type:'line',
    data:{labels:dates,datasets:[{
      label:analyzerData.ticker,
      data:prices,
      borderColor:prices[prices.length-1]>=firstPrice?'rgba(16,185,129,.9)':'rgba(239,68,68,.9)',
      backgroundColor:prices[prices.length-1]>=firstPrice?'rgba(16,185,129,.08)':'rgba(239,68,68,.08)',
      fill:true,tension:.2,borderWidth:2,pointRadius:0,pointHitRadius:10
    }]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
      plugins:{legend:{display:false},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1,callbacks:{label:function(tip){return ' '+analyzerData.currency+' '+tip.parsed.y.toFixed(2)}}}},
      scales:{y:{grid:{color:'#1e293b'},ticks:{callback:function(v){return analyzerData.currency==='EUR'?'\u20ac'+v:'$'+v}}},x:{grid:{display:false},ticks:{maxTicksLimit:8}}}
    }
  });
}



// ══════════════════════════════════════════
// 🔬 ANALISADOR DE ETFs
// ══════════════════════════════════════════
window._etfAnalyzerData=null;

function renderETFAnalyzer(){
  var html='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h2 style="font-size:18px;font-weight:800">🔬 Analisador de ETFs</h2></div>';
  html+='<div class="analyzer-search"><input id="etf_analyzer_ticker" placeholder="Ticker ou ISIN (ex: CSPX, VHYL, IE00B5BMR087...)" value="'+(window._etfAnalyzerTicker||'')+'" onkeydown="if(event.key===\'Enter\')analyzeETF()"><button class="btn btn-primary" onclick="analyzeETF()">🔍 Analisar</button></div>';
  html+='<div id="etfAnalyzerResult">';
  if(window._etfAnalyzerData){html+=renderETFAnalyzerResult()}
  else{html+='<div style="text-align:center;padding:60px;color:var(--text-dim)">Introduz um ticker de ETF para ver dados detalhados.<br><br>Dica: Para ETFs europeus, usa o ticker da bolsa (ex: CSPX.L, VHYL.L) ou o ticker curto (CSPX, IWDA)</div>'}
  html+='</div>';
  return html;
}

async function analyzeETF(){
  var ticker=document.getElementById('etf_analyzer_ticker').value.trim().toUpperCase();
  if(!ticker)return;
  window._etfAnalyzerTicker=ticker;
  var container=document.getElementById('etfAnalyzerResult');
  container.innerHTML='<div style="text-align:center;padding:40px"><span class="spinner"></span> A analisar '+ticker+'...</div>';

  try{
    var r=await fetch('https://corsproxy.io/?url='+encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/'+ticker+'?range=1y&interval=1d'));
    var d=await r.json();
    var meta=d.chart?.result?.[0]?.meta;
    var timestamps=d.chart?.result?.[0]?.timestamp||[];
    var closes=d.chart?.result?.[0]?.indicators?.quote?.[0]?.close||[];

    if(!meta){container.innerHTML='<div style="text-align:center;padding:40px;color:var(--red)">ETF "'+ticker+'" não encontrado. Tenta com sufixo de bolsa (ex: CSPX.L)</div>';return}

    var price=meta.regularMarketPrice;
    var prevClose=meta.chartPreviousClose||price;
    var dayChange=price-prevClose;
    var dayChangePct=(dayChange/prevClose)*100;
    var validCloses=closes.filter(function(v){return v!=null});
    var high52w=Math.max.apply(null,validCloses);
    var low52w=Math.min.apply(null,validCloses);

    // Calculate returns
    var returns={};
    if(validCloses.length>0){
      var latest=validCloses[validCloses.length-1];
      if(validCloses.length>=22)returns['1M']=((latest/validCloses[validCloses.length-22]-1)*100);
      if(validCloses.length>=66)returns['3M']=((latest/validCloses[validCloses.length-66]-1)*100);
      if(validCloses.length>=132)returns['6M']=((latest/validCloses[validCloses.length-132]-1)*100);
      if(validCloses.length>=252)returns['1A']=((latest/validCloses[0]-1)*100);
      // Volatility (annualized std dev of daily returns)
      var dailyReturns=[];
      for(var i=1;i<validCloses.length;i++){if(validCloses[i]&&validCloses[i-1])dailyReturns.push(validCloses[i]/validCloses[i-1]-1)}
      var mean=dailyReturns.reduce(function(a,b){return a+b},0)/dailyReturns.length;
      var variance=dailyReturns.reduce(function(a,b){return a+(b-mean)*(b-mean)},0)/dailyReturns.length;
      returns.volatility=Math.sqrt(variance)*Math.sqrt(252)*100;
    }

    // Check if in portfolio
    var inPortfolio=state.etfs.find(function(e){return e.ticker===ticker});
    var isin='';
    if(inPortfolio)isin=inPortfolio.isin||'';

    window._etfAnalyzerData={
      ticker:ticker,name:meta.shortName||meta.longName||ticker,
      currency:meta.currency||'USD',exchange:meta.exchangeName||'',
      price:price,dayChange:dayChange,dayChangePct:dayChangePct,
      high52w:high52w,low52w:low52w,returns:returns,
      timestamps:timestamps,closes:closes,inPortfolio:inPortfolio,isin:isin
    };

    container.innerHTML=renderETFAnalyzerResult();
    setTimeout(function(){initETFAnalyzerChart()},100);
  }catch(e){
    container.innerHTML='<div style="text-align:center;padding:40px;color:var(--red)">Erro: '+e.message+'</div>';
  }
}

function renderETFAnalyzerResult(){
  var d=window._etfAnalyzerData;if(!d)return '';
  var cur=d.currency==='EUR'?'\u20ac':'$';
  var isPos=d.dayChange>=0;
  var ret=d.returns||{};

  var portfolioInfo='';
  if(d.inPortfolio){
    var e=d.inPortfolio;
    var pl=e.current-e.invested;
    var plPct=e.invested>0?((pl/e.invested)*100):0;
    portfolioInfo='<div class="card" style="border-color:var(--accent)"><div class="card-title">📦 Na tua carteira</div><div class="analyzer-grid"><div class="analyzer-metric"><div class="analyzer-metric-label">Investido</div><div class="analyzer-metric-value">'+fmt(e.invested)+'</div></div><div class="analyzer-metric"><div class="analyzer-metric-label">Valor Atual</div><div class="analyzer-metric-value">'+fmt(e.current)+'</div></div><div class="analyzer-metric"><div class="analyzer-metric-label">P&L</div><div class="analyzer-metric-value" style="color:'+(pl>=0?'var(--green)':'var(--red)')+'">'+fmt(pl)+' ('+plPct.toFixed(2)+'%)</div></div><div class="analyzer-metric"><div class="analyzer-metric-label">Tipo</div><div class="analyzer-metric-value">'+e.type+'</div></div></div></div>';
  }

  var retHTML='';
  ['1M','3M','6M','1A'].forEach(function(p){
    if(ret[p]!=null){
      var col=ret[p]>=0?'var(--green)':'var(--red)';
      retHTML+='<div class="analyzer-metric"><div class="analyzer-metric-label">Retorno '+p+'</div><div class="analyzer-metric-value" style="color:'+col+'">'+(ret[p]>=0?'+':'')+ret[p].toFixed(2)+'%</div></div>';
    }
  });
  if(ret.volatility!=null){
    retHTML+='<div class="analyzer-metric"><div class="analyzer-metric-label">Volatilidade (anual)</div><div class="analyzer-metric-value" style="color:var(--yellow)">'+ret.volatility.toFixed(2)+'%</div></div>';
  }
  var sharpe='';
  if(ret['1A']!=null&&ret.volatility>0){
    var sr=(ret['1A']-3)/ret.volatility; // risk-free ~3%
    sharpe='<div class="analyzer-metric"><div class="analyzer-metric-label">Sharpe Ratio (1A)</div><div class="analyzer-metric-value" style="color:'+(sr>=1?'var(--green)':sr>=0.5?'var(--yellow)':'var(--red)')+'">'+sr.toFixed(2)+'</div></div>';
  }

  var justETFLink=d.isin?'https://www.justetf.com/en/etf-profile.html?isin='+d.isin:'https://www.justetf.com/en/search.html?search='+d.ticker;

  return '<div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px"><div><div style="font-size:12px;color:var(--text-muted)">'+d.exchange+'</div><div style="font-size:22px;font-weight:800">'+d.name+' <span style="color:var(--accent)">('+d.ticker+')</span></div></div><div style="text-align:right"><div style="font-size:28px;font-weight:800">'+cur+d.price.toFixed(2)+'</div><div style="font-size:14px;font-weight:700;color:'+(isPos?'var(--green)':'var(--red)')+'">'+(isPos?'+':'')+d.dayChange.toFixed(2)+' ('+(isPos?'+':'')+d.dayChangePct.toFixed(2)+'%)</div></div></div>'+
    '<div class="analyzer-grid"><div class="analyzer-metric"><div class="analyzer-metric-label">Máx 52 sem</div><div class="analyzer-metric-value">'+cur+d.high52w.toFixed(2)+'</div></div><div class="analyzer-metric"><div class="analyzer-metric-label">Mín 52 sem</div><div class="analyzer-metric-value">'+cur+d.low52w.toFixed(2)+'</div></div>'+retHTML+sharpe+'</div>'+
    '<div style="display:flex;gap:8px;margin:16px 0"><a href="'+justETFLink+'" target="_blank" class="btn btn-sm" style="text-decoration:none">justETF ↗</a><a href="https://finance.yahoo.com/quote/'+d.ticker+'" target="_blank" class="btn btn-sm" style="text-decoration:none">Yahoo Finance ↗</a><a href="https://www.morningstar.com/search?query='+d.ticker+'" target="_blank" class="btn btn-sm" style="text-decoration:none">Morningstar ↗</a></div></div>'+
    portfolioInfo+
    '<div class="card"><div class="card-title">Gráfico de Preços (1 Ano)</div><div class="chart-wrap"><canvas id="chartETFAnalyzer" height="300"></canvas></div></div>';
}

function initETFAnalyzerChart(){
  var d=window._etfAnalyzerData;if(!d)return;
  var ctx=document.getElementById('chartETFAnalyzer');if(!ctx)return;
  var dates=d.timestamps.map(function(t){return new Date(t*1000).toLocaleDateString('pt-PT')});
  var prices=d.closes;
  var first=prices.find(function(p){return p!=null})||0;
  charts.etfAnalyzer=new Chart(ctx,{
    type:'line',data:{labels:dates,datasets:[{label:d.ticker,data:prices,borderColor:prices[prices.length-1]>=first?'rgba(16,185,129,.9)':'rgba(239,68,68,.9)',backgroundColor:prices[prices.length-1]>=first?'rgba(16,185,129,.08)':'rgba(239,68,68,.08)',fill:true,tension:.2,borderWidth:2,pointRadius:0}]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1}},scales:{y:{grid:{color:'#1e293b'}},x:{grid:{display:false},ticks:{maxTicksLimit:8}}}}
  });
}

// ══════════════════════════════════════════
// 📐 ANÁLISE DE CORRELAÇÃO
// ══════════════════════════════════════════
function renderCorrelation(){
  var stocks=state.stocks||[];
  if(stocks.length<2){
    return '<div class="card"><div class="card-title">📐 Análise de Correlação</div><p style="color:var(--text-dim)">Precisas de pelo menos 2 ações no portfolio para ver a correlação.</p></div>';
  }
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h2 style="font-size:18px;font-weight:800">📐 Análise de Correlação</h2><button class="btn btn-primary" onclick="calcCorrelation()">🔄 Calcular Correlação</button></div>'+
    '<div class="card"><div class="card-title">Matriz de Correlação das Ações</div><div style="font-size:11px;color:var(--text-dim);margin-bottom:12px">Mostra como os preços das tuas ações se movem juntos. Valores próximos de 1 = muito correlacionados (risco), valores próximos de 0 = independentes (bom), negativos = movem-se em direções opostas (excelente diversificação)</div><div id="corrMatrix"><div style="text-align:center;padding:40px;color:var(--text-dim)">Clica "Calcular Correlação" para analisar (demora alguns segundos)</div></div></div>'+
    '<div class="card"><div class="card-title">Resumo de Diversificação</div><div id="corrSummary"></div></div>'+
    '<div class="card"><div class="card-title">Comparação de Performance (1 Ano)</div><div class="chart-wrap"><canvas id="chartCorrelation" height="300"></canvas></div></div>';
}

async function calcCorrelation(){
  var stocks=state.stocks||[];
  var container=document.getElementById('corrMatrix');
  var summary=document.getElementById('corrSummary');
  container.innerHTML='<div style="text-align:center;padding:30px"><span class="spinner"></span> A calcular correlações...</div>';

  // Fetch 1 year of daily data for each stock
  var allData={};
  for(var s of stocks){
    try{
      var r=await fetch('https://corsproxy.io/?url='+encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/'+s.ticker+'?range=1y&interval=1d'));
      var d=await r.json();
      var closes=d.chart?.result?.[0]?.indicators?.quote?.[0]?.close||[];
      // Calculate daily returns
      var returns=[];
      for(var i=1;i<closes.length;i++){
        if(closes[i]!=null&&closes[i-1]!=null&&closes[i-1]!==0){returns.push(closes[i]/closes[i-1]-1)}
        else{returns.push(0)}
      }
      allData[s.ticker]={returns:returns,closes:closes};
    }catch(e){console.warn('Corr fetch error for '+s.ticker,e)}
    await new Promise(function(r){setTimeout(r,300)});
  }

  // Calculate correlation matrix
  var tickers=stocks.map(function(s){return s.ticker}).filter(function(t){return allData[t]});
  var n=tickers.length;
  var matrix=[];

  for(var i=0;i<n;i++){
    matrix[i]=[];
    for(var j=0;j<n;j++){
      if(i===j){matrix[i][j]=1;continue}
      var r1=allData[tickers[i]].returns;
      var r2=allData[tickers[j]].returns;
      var minLen=Math.min(r1.length,r2.length);
      var a=r1.slice(-minLen),b=r2.slice(-minLen);
      var meanA=a.reduce(function(s,v){return s+v},0)/minLen;
      var meanB=b.reduce(function(s,v){return s+v},0)/minLen;
      var cov=0,varA=0,varB=0;
      for(var k=0;k<minLen;k++){
        cov+=(a[k]-meanA)*(b[k]-meanB);
        varA+=(a[k]-meanA)*(a[k]-meanA);
        varB+=(b[k]-meanB)*(b[k]-meanB);
      }
      matrix[i][j]=(varA>0&&varB>0)?(cov/Math.sqrt(varA*varB)):0;
    }
  }

  // Render matrix
  var cols=n+1;
  var html='<div class="corr-matrix" style="grid-template-columns:60px repeat('+n+',1fr)">';
  html+='<div></div>';
  for(var j=0;j<n;j++)html+='<div class="corr-label">'+tickers[j]+'</div>';
  for(var i=0;i<n;i++){
    html+='<div class="corr-label">'+tickers[i]+'</div>';
    for(var j=0;j<n;j++){
      var v=matrix[i][j];
      var bg,txt;
      if(i===j){bg='rgba(59,130,246,.2)';txt='var(--accent)'}
      else if(v>=0.7){bg='rgba(239,68,68,.3)';txt='var(--red)'}
      else if(v>=0.4){bg='rgba(245,158,11,.2)';txt='var(--yellow)'}
      else if(v>=-0.1){bg='rgba(16,185,129,.2)';txt='var(--green)'}
      else{bg='rgba(6,182,212,.2)';txt='var(--cyan)'}
      html+='<div class="corr-cell" style="background:'+bg+';color:'+txt+'">'+v.toFixed(2)+'</div>';
    }
  }
  html+='</div>';
  html+='<div style="display:flex;gap:16px;margin-top:12px;font-size:10px;color:var(--text-dim);justify-content:center"><span style="color:var(--red)">■ >0.7 Alta correlação (risco)</span><span style="color:var(--yellow)">■ 0.4-0.7 Moderada</span><span style="color:var(--green)">■ 0-0.4 Baixa (bom)</span><span style="color:var(--cyan)">■ <0 Negativa (excelente)</span></div>';
  container.innerHTML=html;

  // Summary
  var avgCorr=0,count=0,highPairs=[];
  for(var i=0;i<n;i++){for(var j=i+1;j<n;j++){avgCorr+=Math.abs(matrix[i][j]);count++;if(matrix[i][j]>=0.7)highPairs.push(tickers[i]+'/'+tickers[j]+' ('+matrix[i][j].toFixed(2)+')')}}
  avgCorr=count>0?avgCorr/count:0;
  var divScore=avgCorr<0.3?'Excelente':avgCorr<0.5?'Boa':avgCorr<0.7?'Moderada':'Fraca';
  var divColor=avgCorr<0.3?'var(--green)':avgCorr<0.5?'var(--yellow)':avgCorr<0.7?'var(--orange)':'var(--red)';

  summary.innerHTML='<div class="analyzer-grid"><div class="analyzer-metric"><div class="analyzer-metric-label">Diversificação</div><div class="analyzer-metric-value" style="color:'+divColor+'">'+divScore+'</div></div><div class="analyzer-metric"><div class="analyzer-metric-label">Correlação Média</div><div class="analyzer-metric-value">'+avgCorr.toFixed(2)+'</div></div></div>'+
    (highPairs.length>0?'<div style="margin-top:12px;padding:12px;background:rgba(239,68,68,.08);border-radius:8px;border:1px solid rgba(239,68,68,.2)"><div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:4px">⚠️ Pares altamente correlacionados:</div><div style="font-size:12px;color:var(--text)">'+highPairs.join(', ')+'</div><div style="font-size:10px;color:var(--text-dim);margin-top:4px">Considere diversificar — estas ações movem-se muito juntas</div></div>':'<div style="margin-top:12px;padding:12px;background:rgba(16,185,129,.08);border-radius:8px;border:1px solid rgba(16,185,129,.2)"><div style="font-size:11px;font-weight:700;color:var(--green)">✅ Sem pares altamente correlacionados — boa diversificação!</div></div>');

  // Performance comparison chart
  destroyCharts();
  var ctx=document.getElementById('chartCorrelation');
  if(ctx){
    var datasets=tickers.map(function(t,i){
      var cls=allData[t].closes.filter(function(v){return v!=null});
      var base=cls[0]||1;
      var normalized=cls.map(function(v){return((v/base)-1)*100});
      var colors=['rgba(59,130,246,.8)','rgba(16,185,129,.8)','rgba(245,158,11,.8)','rgba(239,68,68,.8)','rgba(139,92,246,.8)','rgba(236,72,153,.8)','rgba(6,182,212,.8)'];
      return{label:t,data:normalized,borderColor:colors[i%colors.length],borderWidth:2,tension:.3,pointRadius:0,fill:false};
    });
    charts.correlation=new Chart(ctx,{
      type:'line',data:{labels:Array.from({length:datasets[0]?.data.length||0},function(_,i){return i}),datasets:datasets},
      options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{labels:{usePointStyle:true,font:{size:11}}},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1,callbacks:{label:function(tip){return ' '+tip.dataset.label+': '+(tip.parsed.y>=0?'+':'')+tip.parsed.y.toFixed(2)+'%'}}}},scales:{y:{grid:{color:'#1e293b'},ticks:{callback:function(v){return v+'%'}}},x:{display:false}}}
    });
  }
}

function initCorrelationChart(){/* Chart is created in calcCorrelation */}

// ══════════════════════════════════════════
// 📄 RELATÓRIO PDF
// ══════════════════════════════════════════
function generatePDFReport(){
  if(typeof jspdf==='undefined'&&typeof window.jspdf==='undefined'){showToast('Biblioteca PDF a carregar, tenta novamente','error');return}
  var jsPDF=window.jspdf.jsPDF;
  var doc=new jsPDF();
  var t=calcTotals();
  var cal=calcDividendCalendar();
  var totalDiv=cal.reduce(function(a,b){return a+b.total},0);
  var pl=t.totalCur-t.totalInv;
  var plPct=t.totalInv>0?(pl/t.totalInv*100):0;
  var today=new Date().toLocaleDateString('pt-PT');
  var y=20;

  // Header
  doc.setFontSize(20);doc.setTextColor(59,130,246);
  doc.text('Portfolio de '+state.name,14,y);y+=10;
  doc.setFontSize(10);doc.setTextColor(100);
  doc.text('Relatório gerado em '+today,14,y);y+=12;

  // Summary
  doc.setFontSize(14);doc.setTextColor(0);
  doc.text('Resumo',14,y);y+=8;
  doc.setFontSize(10);doc.setTextColor(60);
  doc.text('Valor Total: '+fmt(t.totalCur),14,y);y+=6;
  doc.text('Total Investido: '+fmt(t.totalInv),14,y);y+=6;
  doc.text('Lucro/Perda: '+fmt(pl)+' ('+(plPct>=0?'+':'')+plPct.toFixed(2)+'%)',14,y);y+=6;
  doc.text('Dividendos Anuais Est.: '+fmt(totalDiv),14,y);y+=6;
  doc.text('Capital Não Investido: '+fmt(state.unusedCapital||0),14,y);y+=12;

  // Stocks table
  doc.setFontSize(14);doc.setTextColor(0);
  doc.text('Ações em Carteira',14,y);y+=8;
  doc.setFontSize(8);doc.setTextColor(100);
  doc.text('Ticker     Empresa              Volume    Compra    Atual     P&L       Yield',14,y);y+=5;
  doc.setTextColor(60);
  state.stocks.forEach(function(s){
    var plV=s.volume*(s.currentPrice-s.buyPrice);
    var line=s.ticker.padEnd(11)+s.name.substring(0,20).padEnd(21)+s.volume.toFixed(2).padEnd(10)+s.buyPrice.toFixed(2).padEnd(10)+s.currentPrice.toFixed(2).padEnd(10)+(plV>=0?'+':'')+plV.toFixed(2).padEnd(10)+s.divYield+'%';
    doc.text(line,14,y);y+=4.5;
    if(y>270){doc.addPage();y=20}
  });
  y+=8;

  // ETFs
  if(y>240){doc.addPage();y=20}
  doc.setFontSize(14);doc.setTextColor(0);
  doc.text('ETFs em Carteira',14,y);y+=8;
  doc.setFontSize(8);doc.setTextColor(100);
  doc.text('Plano          Nome                          Investido   Atual      P&L',14,y);y+=5;
  doc.setTextColor(60);
  state.etfs.forEach(function(e){
    var plan=getPlan(e.planId);
    var plV=e.current-e.invested;
    var line=plan.name.substring(0,14).padEnd(15)+e.name.substring(0,30).padEnd(31)+e.invested.toFixed(2).padEnd(12)+e.current.toFixed(2).padEnd(11)+(plV>=0?'+':'')+plV.toFixed(2);
    doc.text(line,14,y);y+=4.5;
    if(y>270){doc.addPage();y=20}
  });
  y+=8;

  // Dividends calendar
  if(y>220){doc.addPage();y=20}
  doc.setFontSize(14);doc.setTextColor(0);
  doc.text('Calendário de Dividendos',14,y);y+=8;
  doc.setFontSize(9);doc.setTextColor(60);
  cal.forEach(function(m){
    var stocks=m.details.map(function(d){return d.ticker}).join(', ');
    doc.text(m.monthFull+': '+fmt(m.total)+' ('+m.count+' ações: '+stocks+')',14,y);y+=5;
    if(y>270){doc.addPage();y=20}
  });

  // Footer
  doc.setFontSize(8);doc.setTextColor(150);
  doc.text('Este relatório é informativo. Não constitui aconselhamento financeiro.',14,285);

  doc.save('portfolio_relatorio_'+today.replace(/\//g,'-')+'.pdf');
  showToast('Relatório PDF gerado!');
}



// ══════════════════════════════════════════
// ⚖️ COMPARADOR DE ETFs
// ══════════════════════════════════════════
window._compData=null;

function renderComparador(){
  var t1=window._compTicker1||'';
  var t2=window._compTicker2||'';
  var html='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h2 style="font-size:18px;font-weight:800">⚖️ Comparador de ETFs</h2></div>';
  html+='<div class="comp-vs"><div class="comp-input"><label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">ETF 1</label><input id="comp_t1" placeholder="Ticker (ex: CSPX, IWDA...)" value="'+t1+'"></div><div class="comp-vs-label">VS</div><div class="comp-input"><label style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">ETF 2</label><input id="comp_t2" placeholder="Ticker (ex: VHYL, VWCE...)" value="'+t2+'"></div></div>';
  html+='<div style="text-align:center;margin-bottom:20px"><button class="btn btn-primary" onclick="compareETFs()" style="padding:12px 40px;font-size:14px">🔍 Comparar</button></div>';
  html+='<div id="compResult">';
  if(window._compData){html+=renderCompResult()}
  else{html+='<div style="text-align:center;padding:60px;color:var(--text-dim)">Introduz dois tickers de ETFs e clica Comparar</div>'}
  html+='</div>';
  return html;
}

async function fetchETFData(ticker){
  try{
    var r=await fetch('https://corsproxy.io/?url='+encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/'+ticker+'?range=1y&interval=1d'));
    if(!r.ok)return null;
    var d=await r.json();
    var meta=d.chart?.result?.[0]?.meta;
    var timestamps=d.chart?.result?.[0]?.timestamp||[];
    var closes=d.chart?.result?.[0]?.indicators?.quote?.[0]?.close||[];
    if(!meta)return null;
    
    var valid=closes.filter(function(v){return v!=null});
    var price=meta.regularMarketPrice;
    var prevClose=meta.chartPreviousClose||price;
    
    // Calculate returns
    var ret={};
    if(valid.length>0){
      var latest=valid[valid.length-1];
      if(valid.length>=22)ret.m1=((latest/valid[valid.length-22]-1)*100);
      if(valid.length>=66)ret.m3=((latest/valid[valid.length-66]-1)*100);
      if(valid.length>=132)ret.m6=((latest/valid[valid.length-132]-1)*100);
      if(valid.length>=252)ret.y1=((latest/valid[0]-1)*100);
      // Volatility
      var dailyRet=[];
      for(var i=1;i<valid.length;i++){if(valid[i]&&valid[i-1])dailyRet.push(valid[i]/valid[i-1]-1)}
      var mean=dailyRet.reduce(function(a,b){return a+b},0)/dailyRet.length;
      var vari=dailyRet.reduce(function(a,b){return a+(b-mean)*(b-mean)},0)/dailyRet.length;
      ret.vol=Math.sqrt(vari)*Math.sqrt(252)*100;
      // Sharpe
      if(ret.y1!=null&&ret.vol>0)ret.sharpe=(ret.y1-3)/ret.vol;
      // Max drawdown
      var peak=valid[0];var maxDD=0;
      for(var i=0;i<valid.length;i++){if(valid[i]>peak)peak=valid[i];var dd=(valid[i]-peak)/peak*100;if(dd<maxDD)maxDD=dd}
      ret.maxDD=maxDD;
    }
    
    return{ticker:ticker,name:meta.shortName||meta.longName||ticker,currency:meta.currency||'USD',
      price:price,dayChange:price-prevClose,dayChangePct:((price-prevClose)/prevClose)*100,
      high52w:Math.max.apply(null,valid),low52w:Math.min.apply(null,valid),
      returns:ret,timestamps:timestamps,closes:closes};
  }catch(e){return null}
}

async function compareETFs(){
  var t1=document.getElementById('comp_t1').value.trim().toUpperCase();
  var t2=document.getElementById('comp_t2').value.trim().toUpperCase();
  if(!t1||!t2){showToast('Preenche os dois tickers','error');return}
  window._compTicker1=t1;window._compTicker2=t2;
  
  var container=document.getElementById('compResult');
  container.innerHTML='<div style="text-align:center;padding:40px"><span class="spinner"></span> A comparar '+t1+' vs '+t2+'...</div>';
  
  var d1=await fetchETFData(t1);
  var d2=await fetchETFData(t2);
  
  if(!d1||!d2){
    container.innerHTML='<div style="text-align:center;padding:40px;color:var(--red)">Não foi possível obter dados de '+(d1?'':''+t1+' ')+(d2?'':''+t2)+'. Verifica os tickers.</div>';
    return;
  }
  
  window._compData={etf1:d1,etf2:d2};
  container.innerHTML=renderCompResult();
  setTimeout(initComparadorChart,100);
}

function renderCompResult(){
  var d=window._compData;if(!d)return '';
  var e1=d.etf1,e2=d.etf2;
  var r1=e1.returns||{},r2=e2.returns||{};
  var cur1=e1.currency==='EUR'?'€':'$';
  var cur2=e2.currency==='EUR'?'€':'$';
  
  function winner(v1,v2,higherBetter){
    if(v1==null||v2==null)return['',''];
    if(higherBetter)return v1>v2?['comp-winner','comp-loser']:v1<v2?['comp-loser','comp-winner']:['',''];
    return v1<v2?['comp-winner','comp-loser']:v1>v2?['comp-loser','comp-winner']:['',''];
  }
  
  function row(label,v1,v2,format,higherBetter){
    if(v1==null&&v2==null)return '';
    var f1=v1!=null?(format==='%'?(v1>=0?'+':'')+v1.toFixed(2)+'%':format==='$'?cur1+v1.toFixed(2):v1.toFixed(2)):'-';
    var f2=v2!=null?(format==='%'?(v2>=0?'+':'')+v2.toFixed(2)+'%':format==='$'?cur2+v2.toFixed(2):v2.toFixed(2)):'-';
    var w=winner(v1,v2,higherBetter);
    return '<tr><td>'+label+'</td><td class="'+w[0]+'">'+f1+'</td><td class="'+w[1]+'">'+f2+'</td></tr>';
  }
  
  var is1Pos=e1.dayChange>=0,is2Pos=e2.dayChange>=0;
  
  return '<div class="grid2"><div class="card" style="text-align:center"><div style="font-size:12px;color:var(--text-muted)">'+e1.exchange+'</div><div style="font-size:18px;font-weight:800">'+sanitizeHTML(e1.name)+'</div><div style="font-size:13px;color:var(--accent)">'+e1.ticker+'</div><div style="font-size:24px;font-weight:800;margin-top:8px">'+cur1+e1.price.toFixed(2)+'</div><div style="font-size:12px;color:'+(is1Pos?'var(--green)':'var(--red)')+'">'+(is1Pos?'+':'')+e1.dayChangePct.toFixed(2)+'%</div></div>'+
    '<div class="card" style="text-align:center"><div style="font-size:12px;color:var(--text-muted)">'+e2.exchange+'</div><div style="font-size:18px;font-weight:800">'+sanitizeHTML(e2.name)+'</div><div style="font-size:13px;color:var(--accent)">'+e2.ticker+'</div><div style="font-size:24px;font-weight:800;margin-top:8px">'+cur2+e2.price.toFixed(2)+'</div><div style="font-size:12px;color:'+(is2Pos?'var(--green)':'var(--red)')+'">'+(is2Pos?'+':'')+e2.dayChangePct.toFixed(2)+'%</div></div></div>'+
    '<div class="card"><div class="card-title">Comparação Detalhada</div><table class="comp-table"><thead><tr><th></th><th>'+e1.ticker+'</th><th>'+e2.ticker+'</th></tr></thead><tbody>'+
    row('Retorno 1 Mês',r1.m1,r2.m1,'%',true)+
    row('Retorno 3 Meses',r1.m3,r2.m3,'%',true)+
    row('Retorno 6 Meses',r1.m6,r2.m6,'%',true)+
    row('Retorno 1 Ano',r1.y1,r2.y1,'%',true)+
    row('Volatilidade',r1.vol,r2.vol,'%',false)+
    row('Sharpe Ratio',r1.sharpe,r2.sharpe,'x',true)+
    row('Max Drawdown',r1.maxDD,r2.maxDD,'%',true)+
    row('Máx 52 sem',e1.high52w,e2.high52w,'$',true)+
    row('Mín 52 sem',e1.low52w,e2.low52w,'$',false)+
    '</tbody></table><div style="font-size:10px;color:var(--text-dim);margin-top:8px;text-align:center">Verde = melhor nessa métrica</div></div>'+
    '<div class="card"><div class="card-title">Performance Comparada (1 Ano, normalizada)</div><div class="chart-wrap"><canvas id="chartComparador" height="300"></canvas></div></div>'+
    '<div style="display:flex;gap:8px;justify-content:center;margin-top:8px"><a href="https://www.justetf.com/en/search.html?search='+e1.ticker+'" target="_blank" class="btn btn-sm" style="text-decoration:none">'+e1.ticker+' no JustETF ↗</a><a href="https://www.justetf.com/en/search.html?search='+e2.ticker+'" target="_blank" class="btn btn-sm" style="text-decoration:none">'+e2.ticker+' no JustETF ↗</a></div>';
}

function initComparadorChart(){
  var d=window._compData;if(!d)return;
  var ctx=document.getElementById('chartComparador');if(!ctx)return;
  
  var c1=d.etf1.closes.filter(function(v){return v!=null});
  var c2=d.etf2.closes.filter(function(v){return v!=null});
  var minLen=Math.min(c1.length,c2.length);
  c1=c1.slice(-minLen);c2=c2.slice(-minLen);
  var base1=c1[0]||1,base2=c2[0]||1;
  var norm1=c1.map(function(v){return((v/base1)-1)*100});
  var norm2=c2.map(function(v){return((v/base2)-1)*100});
  var labels=d.etf1.timestamps.slice(-minLen).map(function(t){return new Date(t*1000).toLocaleDateString('pt-PT')});
  
  charts.comparador=new Chart(ctx,{
    type:'line',
    data:{labels:labels,datasets:[
      {label:d.etf1.ticker,data:norm1,borderColor:'rgba(59,130,246,.9)',backgroundColor:'rgba(59,130,246,.05)',fill:true,tension:.2,borderWidth:2.5,pointRadius:0},
      {label:d.etf2.ticker,data:norm2,borderColor:'rgba(16,185,129,.9)',backgroundColor:'rgba(16,185,129,.05)',fill:true,tension:.2,borderWidth:2.5,pointRadius:0}
    ]},
    options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
      plugins:{legend:{labels:{usePointStyle:true,font:{size:12,weight:'bold'}}},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1,callbacks:{label:function(tip){return ' '+tip.dataset.label+': '+(tip.parsed.y>=0?'+':'')+tip.parsed.y.toFixed(2)+'%'}}}},
      scales:{y:{grid:{color:'#1e293b'},ticks:{callback:function(v){return v+'%'}}},x:{grid:{display:false},ticks:{maxTicksLimit:8}}}
    }
  });
}


// ══════════════════════════════════════════
// 🔗 LINKS ÚTEIS
// ══════════════════════════════════════════
function renderLinks(){
  var allLinks=state.usefulLinks||DEFAULT_USEFUL_LINKS;
  var html='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h2 style="font-size:18px;font-weight:800">🔗 Links Úteis</h2><button class="btn btn-sm btn-primary" onclick="addUsefulLink()">+ Adicionar Link</button></div>';

  allLinks.forEach(function(cat){
    html+='<div class="link-category"><div class="link-category-title">'+cat.category+'</div><div class="links-grid">';
    cat.links.forEach(function(link,li){
      html+='<a href="'+link.url+'" target="_blank" class="link-card"><div class="link-icon" style="background:rgba(59,130,246,.1)">'+link.icon+'</div><div><div class="link-name">'+link.name+'</div><div class="link-desc">'+link.desc+'</div></div></a>';
    });
    html+='</div></div>';
  });

  return html;
}

function addUsefulLink(){
  var allLinks=state.usefulLinks||DEFAULT_USEFUL_LINKS;
  var catOptions=allLinks.map(function(cat){return '<option>'+cat.category+'</option>'}).join('');

  showModal('Adicionar Link Útil','<div class="form-row"><label>Categoria</label><select id="f_cat">'+catOptions+'<option>+ Nova Categoria</option></select></div><div class="form-row" id="f_newcat_row" style="display:none"><label>Nome nova categoria</label><input id="f_newcat"></div><div class="form-row"><label>Nome</label><input id="f_name"></div><div class="form-row"><label>URL</label><input id="f_url" placeholder="https://..."></div><div class="form-row"><label>Emoji/Ícone</label><input id="f_icon" value="🔗" style="width:60px"></div><div class="form-row"><label>Descrição curta</label><input id="f_desc"></div><script>document.getElementById("f_cat").onchange=function(){document.getElementById("f_newcat_row").style.display=this.value.includes("Nova")?"block":"none"}<\/script>',function(){
    var catName=document.getElementById('f_cat').value;
    if(catName.includes('Nova')){catName=document.getElementById('f_newcat').value.trim();if(!catName)return;allLinks.push({category:catName,links:[]})}
    var cat=allLinks.find(function(c){return c.category===catName});
    if(!cat)return;
    cat.links.push({name:document.getElementById('f_name').value,url:document.getElementById('f_url').value,icon:document.getElementById('f_icon').value||'🔗',desc:document.getElementById('f_desc').value});
    state.usefulLinks=allLinks;
  });
}


function renderDivGoal(){
  var goal=state.divGoal||{monthly:50,annual:600};
  var cal=calcDividendCalendar();
  var totalEst=cal.reduce(function(a,b){return a+b.total},0);
  var totalReceived=(state.dividendsReceived||[]).reduce(function(a,d){return a+(d.netEUR||0)},0);
  var monthlyEst=totalEst/12;
  var pctAnnual=goal.annual>0?Math.min(100,(totalEst/goal.annual)*100):0;
  var pctMonthly=goal.monthly>0?Math.min(100,(monthlyEst/goal.monthly)*100):0;
  var barColorA=pctAnnual>=100?'var(--green)':pctAnnual>=50?'var(--yellow)':'var(--red)';
  var barColorM=pctMonthly>=100?'var(--green)':pctMonthly>=50?'var(--yellow)':'var(--red)';

  return '<div class="div-goal"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-size:13px;font-weight:700">🎯 Meta de Dividendos</div><button class="btn btn-sm" onclick="editDivGoal()">✏️</button></div>'+
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Meta anual: '+fmt(goal.annual)+' — Estimado: '+fmt(totalEst)+' — Recebido: '+fmt(totalReceived)+'</div>'+
    '<div class="div-goal-bar"><div class="div-goal-fill" style="width:'+pctAnnual+'%;background:'+barColorA+'"></div></div>'+
    '<div class="div-goal-stats"><span>'+pctAnnual.toFixed(0)+'% da meta anual</span><span>Meta mensal: '+fmt(goal.monthly)+' | Est.: '+fmt(monthlyEst)+'</span></div></div>';
}

function editDivGoal(){
  var goal=state.divGoal||{monthly:50,annual:600};
  showModal('Meta de Dividendos','<div class="form-grid"><div class="form-row"><label>Meta mensal (\u20ac)</label><input id="f_goal_m" type="number" step="1" value="'+goal.monthly+'"></div><div class="form-row"><label>Meta anual (\u20ac)</label><input id="f_goal_a" type="number" step="1" value="'+goal.annual+'"></div></div>',function(){
    state.divGoal={monthly:parseFloat(document.getElementById('f_goal_m').value)||50,annual:parseFloat(document.getElementById('f_goal_a').value)||600};
  });
}

// ══════════════════════════════════════════
// OVERVIEW
// ══════════════════════════════════════════
function renderOverview(){
  const t=calcTotals();
  const pl=t.totalCur-t.totalInv;
  const plPct=t.totalInv>0?(pl/t.totalInv*100):0;
  const cal=calcDividendCalendar();
  const totalDiv=cal.reduce((a,b)=>a+b.total,0);
  const avgDiv=totalDiv/12;
  const maxDiv=Math.max(...cal.map(d=>d.total));
  const minDiv=Math.min(...cal.map(d=>d.total));
  const variance=maxDiv>0?((maxDiv-minDiv)/maxDiv*100):0;

  return `
    <div class="grid4">
      <div class="stat-card"><div class="glow" style="background:var(--accent)"></div><div class="stat-label">Valor Total</div><div class="stat-value">${fmt(t.totalCur)}</div><div class="stat-sub" style="color:var(--accent)">Investido: ${fmt(t.totalInv)}</div></div>
      <div class="stat-card"><div class="glow" style="background:${pl>=0?'var(--green)':'var(--red)'}"></div><div class="stat-label">Lucro / Perda</div><div class="stat-value" style="color:${pl>=0?'var(--green)':'var(--red)'}">${fmt(pl)}</div><div class="stat-sub" style="color:${pl>=0?'var(--green)':'var(--red)'}">${plPct>=0?'+':''}${plPct.toFixed(2)}%</div></div>
      <div class="stat-card"><div class="glow" style="background:var(--yellow)"></div><div class="stat-label">Dividendos/Ano (est.)</div><div class="stat-value">${fmt(totalDiv)}</div><div class="stat-sub" style="color:var(--yellow)">Média: ${fmt(avgDiv)}/mês</div></div>
      <div class="stat-card"><div class="glow" style="background:var(--purple)"></div><div class="stat-label">Variância Mensal</div><div class="stat-value">${variance.toFixed(1)}%</div><div class="stat-sub" style="color:var(--purple)">Min: ${fmt(minDiv)} | Max: ${fmt(maxDiv)}</div></div>
    </div>
    ${renderDivGoal()}
    <div class="capital-bar">
      <div class="capital-item">💰 Capital não investido: <strong>${fmt(state.unusedCapital||0)}</strong></div>
      <div class="capital-item">📈 Taxa juro: <strong>${state.interestRate||3.8}%</strong></div>
      <div class="capital-item">💵 Juro mensal est.: <strong style="color:var(--green)">${fmt((state.unusedCapital||0)*(state.interestRate||3.8)/100/12)}</strong></div>
      <button class="btn btn-sm" onclick="editUnusedCapital()">✏️ Editar</button>
    </div>
    <div class="card">
      <div class="card-title">Dividendos Esperados por Mês — ${selectedYear}</div>
      <div class="chart-wrap"><canvas id="chartDivMonth" height="300"></canvas></div>
      <div class="chart-stats">
        <div class="chart-stat"><div class="chart-stat-label">Média</div><div class="chart-stat-value" style="color:var(--accent)">${fmt(avgDiv)}</div></div>
        <div class="chart-stat"><div class="chart-stat-label">Máximo</div><div class="chart-stat-value" style="color:var(--green)">${fmt(maxDiv)}</div></div>
        <div class="chart-stat"><div class="chart-stat-label">Mínimo</div><div class="chart-stat-value" style="color:var(--red)">${fmt(minDiv)}</div></div>
        <div class="chart-stat"><div class="chart-stat-label">Variância</div><div class="chart-stat-value" style="color:${variance>50?'var(--red)':'var(--green)'}">${variance.toFixed(1)}%</div></div>
      </div>
    </div>
    <div class="grid2">
      <div class="card"><div class="card-title">Alocação — Ações por Setor</div><div class="chart-wrap"><canvas id="chartStockAlloc" height="260"></canvas></div></div>
      <div class="card"><div class="card-title">Alocação — ETFs por Plano</div><div class="chart-wrap"><canvas id="chartETFAlloc" height="260"></canvas></div></div>
    </div>
    <div class="card">
      <div class="card-title">Performance das Ações vs Dividend Yield</div>
      <div class="chart-wrap"><canvas id="chartPerformance" height="220"></canvas></div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div class="card-title" style="margin:0">Evolução do Portfolio</div>
        <div style="font-size:11px;color:var(--text-dim)">Tira snapshots mensais no Histórico</div>
      </div>
      <div class="chart-wrap"><canvas id="chartPortfolioHistory" height="220"></canvas></div>
    </div>`;
}

function editUnusedCapital(){
  var uc=state.unusedCapital||0;
  var ir=state.interestRate||3.8;
  showModal('Capital Não Investido','<div class="form-row"><label>Capital disponível na conta (EUR)</label><input id="f_unused" type="number" step="0.01" value="'+uc+'"></div><div class="form-row"><label>Taxa de juro anual (%)</label><input id="f_interest" type="number" step="0.1" value="'+ir+'"><div style="font-size:10px;color:var(--text-dim);margin-top:4px">XTB paga ~3.8% sobre capital não investido</div></div>',function(){
    state.unusedCapital=parseFloat(document.getElementById('f_unused').value)||0;
    state.interestRate=parseFloat(document.getElementById('f_interest').value)||3.8;
  });
}

// ══════════════════════════════════════════
// STOCKS TAB
// ══════════════════════════════════════════
function renderStocks(){
  const t=calcTotals();
  const totalDiv=state.stocks.reduce((a,s)=>a+toEUR(s.volume*s.divPerShare*s.months.length,s.currency),0);
  const plTotal=t.stocksCur-t.stocksInv;
  let rows=state.stocks.map((s,i)=>{
    const plE=toEUR(s.volume*(s.currentPrice-s.buyPrice),s.currency);
    const plPct=s.buyPrice>0?((s.currentPrice-s.buyPrice)/s.buyPrice*100):0;
    const annDiv=toEUR(s.volume*s.divPerShare*s.months.length,s.currency);
    const valE=toEUR(s.volume*s.currentPrice,s.currency);
    return `<tr>
      <td style="font-weight:800;color:var(--accent)">${s.ticker}</td>
      <td>${s.name}</td>
      <td><span class="badge badge-purple">${s.sector||'-'}</span></td>
      <td class="text-right">${s.volume.toFixed(4)}</td>
      <td class="text-right">${fmt(toEUR(s.buyPrice,s.currency))}</td>
      <td class="text-right" style="font-weight:600">${fmt(toEUR(s.currentPrice,s.currency))}</td>
      <td class="text-right">${fmt(valE)}</td>
      <td class="text-right" style="font-weight:700;color:${plE>=0?'var(--green)':'var(--red)'}">${plE>=0?'+':''}${fmt(plE)}</td>
      <td class="text-right"><span class="badge ${plPct>=0?'badge-green':'badge-red'}">${plPct>=0?'+':''}${plPct.toFixed(2)}%</span></td>
      <td class="text-right" style="font-weight:700;color:${s.divYield>=5?'var(--green)':'var(--yellow)'}">${s.divYield}%</td>
      <td class="text-right" style="font-weight:700;color:var(--green)">${fmt(annDiv)}</td>
      <td class="text-center"><button class="btn btn-sm" onclick="editStock(${i})">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteStock(${i})">🗑️</button></td>
    </tr>`;
  }).join('');

  return `
    <div class="toolbar">
      <button class="btn btn-primary" onclick="addStock()">+ Adicionar Ação</button>
      <button class="btn" onclick="updateAllPrices()">🔄 Atualizar Preços Manual</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow-x:auto"><table>
        <thead><tr><th>Ticker</th><th>Empresa</th><th>Setor</th><th class="text-right">Vol.</th><th class="text-right">Compra (€)</th><th class="text-right">Atual (€)</th><th class="text-right">Valor (€)</th><th class="text-right">P&L (€)</th><th class="text-right">P&L %</th><th class="text-right">Yield</th><th class="text-right">Div/Ano (€)</th><th class="text-center">Ações</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr style="background:rgba(59,130,246,.08)">
          <td colspan="6" style="font-weight:800;font-size:13px">TOTAL</td>
          <td class="text-right" style="font-weight:800">${fmt(t.stocksCur)}</td>
          <td class="text-right" style="font-weight:800;color:${plTotal>=0?'var(--green)':'var(--red)'}">${plTotal>=0?'+':''}${fmt(plTotal)}</td>
          <td class="text-right" style="font-weight:800">${t.stocksInv>0?((plTotal/t.stocksInv)*100).toFixed(2):'0'}%</td>
          <td></td>
          <td class="text-right" style="font-weight:800;color:var(--green)">${fmt(totalDiv)}</td>
          <td></td>
        </tr></tfoot>
      </table></div>
    </div>`;
}

// ══════════════════════════════════════════
// ETFs TAB
// ══════════════════════════════════════════
function renderETFs(){
  const plans=state.plans||[];
  let html=`<div class="toolbar">
    <button class="btn btn-primary" onclick="addETF()">+ Adicionar ETF</button>
    <button class="btn" onclick="managePlans()">⚙️ Gerir Planos</button>
  </div>`;

  plans.forEach(plan=>{
    const planETFs=state.etfs.filter(e=>e.planId===plan.id);
    if(!planETFs.length)return;
    const inv=planETFs.reduce((a,e)=>a+e.invested,0);
    const cur=planETFs.reduce((a,e)=>a+e.current,0);
    const pl=cur-inv;

    let rows=planETFs.map((e,gi)=>{
      const i=state.etfs.indexOf(e);
      const epl=e.current-e.invested;
      const eplPct=e.invested>0?(epl/e.invested*100):0;
      const justETFLink=e.isin?`https://www.justetf.com/en/etf-profile.html?isin=${e.isin}`:'';
      return `<tr>
        <td style="font-weight:700;color:var(--accent)">${e.ticker||'-'}</td>
        <td>${e.name}${justETFLink?` <a href="${justETFLink}" target="_blank" class="link-ext">↗ JustETF</a>`:''}</td>
        <td class="text-center"><span class="badge ${e.type==='DIST'?'badge-green':'badge-purple'}">${e.type}</span></td>
        <td class="text-right">${fmt(e.invested)}</td>
        <td class="text-right" style="font-weight:600">${fmt(e.current)}</td>
        <td class="text-right" style="font-weight:700;color:${epl>=0?'var(--green)':'var(--red)'}">${epl>=0?'+':''}${fmt(epl)} (${eplPct>=0?'+':''}${eplPct.toFixed(2)}%)</td>
        <td class="text-center"><button class="btn btn-sm" onclick="editETF(${i})">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteETF(${i})">🗑️</button></td>
      </tr>`;
    }).join('');

    html+=`<div class="card" style="padding:0;overflow:hidden;margin-bottom:16px">
      <div class="etf-plan">
        <div style="display:flex;align-items:center;gap:8px"><span class="etf-dot" style="background:${plan.color}"></span><strong>${plan.name}</strong></div>
        <div class="plan-summary"><span>Investido: <strong>${fmt(inv)}</strong></span><span>Atual: <strong>${fmt(cur)}</strong></span><span style="font-weight:700;color:${pl>=0?'var(--green)':'var(--red)'}">${pl>=0?'+':''}${fmt(pl)}</span></div>
      </div>
      <div style="overflow-x:auto"><table><thead><tr><th>Ticker</th><th>Nome</th><th class="text-center">Tipo</th><th class="text-right">Investido</th><th class="text-right">Atual</th><th class="text-right">P&L</th><th class="text-center">Ações</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
  });

  return html;
}


// ══════════════════════════════════════════
// DIVIDENDS TAB
// ══════════════════════════════════════════
function renderDividends(){
  const cal=calcDividendCalendar();
  const totalDiv=cal.reduce((a,b)=>a+b.total,0);
  const avgDiv=totalDiv/12;
  const maxDiv=Math.max(...cal.map(d=>d.total));
  const minDiv=Math.min(...cal.map(d=>d.total));
  const variance=maxDiv>0?((maxDiv-minDiv)/maxDiv*100):0;

  let detailHTML='';
  cal.forEach(m=>{
    if(m.details.length>0){
      detailHTML+=`<div style="margin-bottom:6px"><strong style="color:var(--accent-light)">${m.monthFull}:</strong> `;
      detailHTML+=m.details.map(d=>`<span class="badge badge-green">${d.ticker} ${fmt(d.amount)}</span>`).join(' ');
      detailHTML+=`</div>`;
    }
  });

  return `
    <div class="grid3">
      <div class="stat-card"><div class="stat-label">Total Anual Estimado</div><div class="stat-value" style="color:var(--green)">${fmt(totalDiv)}</div></div>
      <div class="stat-card"><div class="stat-label">Média Mensal</div><div class="stat-value" style="color:var(--accent)">${fmt(avgDiv)}</div></div>
      <div class="stat-card"><div class="stat-label">Variância</div><div class="stat-value" style="color:${variance>50?'var(--red)':'var(--green)'}">${variance.toFixed(1)}%</div><div class="stat-sub" style="color:${variance>50?'var(--red)':'var(--green)'}">${variance>50?'Desequilibrado':'Equilibrado'}</div></div>
    </div>
    <div class="card"><div class="card-title">Dividendos Esperados — ${selectedYear}</div><div class="chart-wrap"><canvas id="chartDivBig" height="320"></canvas></div></div>
    <div class="card"><div class="card-title">Dividend Yield por Ação</div><div class="chart-wrap"><canvas id="chartYield" height="220"></canvas></div></div>
    <div class="card"><div class="card-title">Detalhe por Mês</div>${detailHTML}</div>`;
}

// ══════════════════════════════════════════
// CALENDAR
// ══════════════════════════════════════════
function renderCalendar(){
  const cal=calcDividendCalendar();
  const now=new Date();const curMonth=now.getMonth();const curYear=now.getFullYear();
  // Calculate received dividends per month
  const received={};
  (state.dividendsReceived||[]).forEach(d=>{
    if(!d.date)return;
    const dt=new Date(d.date);
    if(dt.getFullYear()===selectedYear){
      const m=dt.getMonth();
      if(!received[m])received[m]=0;
      received[m]+=parseFloat(d.netEUR||0)||0;
    }
  });

  let cardsHTML=cal.map((m,idx)=>{
    const isPast=selectedYear===curYear&&idx<curMonth;
    let strength,sColor;
    if(m.count>=5){strength='EXCELENTE';sColor='var(--green)'}
    else if(m.count>=4){strength='FORTE';sColor='#22c55e'}
    else if(m.count>=3){strength='BOM';sColor='var(--yellow)'}
    else if(m.count>=2){strength='FRACO';sColor='var(--orange)'}
    else{strength='CRÍTICO';sColor='var(--red)'}

    const tags=m.details.map(d=>`<span class="month-tag">${d.ticker} ${fmt(d.amount)}</span>`).join('');
    const rec=received[idx]||0;
    const investedThisMonth=(state.decisions||[]).filter(d=>d.month&&d.month.includes(m.month)&&d.month.includes(String(selectedYear))).reduce((a,d)=>a+(d.amount||0),0);

    return `<div class="month-card ${isPast?'past':''}" style="border:1px solid ${isPast?'var(--border)':sColor}33">
      <div class="month-badge" style="background:${sColor}22;color:${sColor}">${strength}</div>
      <div class="month-name">${m.monthFull}</div>
      <div class="month-total" style="color:${sColor}">${fmt(m.total)}</div>
      <div class="month-count">${m.count} ações pagam</div>
      ${rec>0?`<div style="font-size:10px;color:var(--green);margin:4px 0">✅ Recebido: ${fmt(rec)}</div>`:''}
      ${investedThisMonth>0?`<div style="font-size:10px;color:var(--accent);margin:2px 0">💰 Investido: ${fmt(investedThisMonth)}</div>`:''}
      <div class="month-tags">${tags}</div>
    </div>`;
  }).join('');

  const weakMonths=cal.filter(m=>m.count<=2).map(m=>m.monthFull).join(', ')||'Nenhum!';
  const strongMonths=cal.filter(m=>m.count>=4).map(m=>m.monthFull).join(', ')||'Nenhum ainda';

  return `<div class="grid3">${cardsHTML}</div>
    <div class="card"><div class="card-title">Análise de Lacunas</div><div class="grid2">
      <div class="gap-box gap-red"><div class="gap-title" style="color:var(--red)">MESES FRACOS (≤2 ações)</div><div style="font-size:13px">${weakMonths}</div><div style="font-size:11px;color:var(--text-muted);margin-top:8px">Sugestão: AbbVie (ABBV) Fev/Mai/Ago/Nov • Main Street Capital (MAIN) mensal</div></div>
      <div class="gap-box gap-green"><div class="gap-title" style="color:var(--green)">MESES FORTES (≥4 ações)</div><div style="font-size:13px">${strongMonths}</div><div style="font-size:11px;color:var(--text-muted);margin-top:8px">Boa cobertura de dividendos</div></div>
    </div></div>`;
}

// ══════════════════════════════════════════
// WATCHLIST
// ══════════════════════════════════════════
function renderWatchlist(){
  let stockRows=(state.watchlistStocks||[]).map((w,i)=>{
    const intColor=w.interest==='SIM'?'badge-green':w.interest==='ANALISAR'?'badge-yellow':'badge-purple';
    return `<tr>
      <td style="font-weight:800;color:var(--accent)">${w.ticker}</td><td>${w.name}</td>
      <td><span class="badge badge-purple">${w.sector||'-'}</span></td>
      <td class="text-right" style="font-weight:700;color:${w.divYield>=5?'var(--green)':'var(--yellow)'}">${w.divYield}%</td>
      <td class="text-center">${w.freq}</td><td class="text-center">${w.months}</td>
      <td class="text-center"><span class="badge ${intColor}">${w.interest}</span></td>
      <td>${w.notes||''}</td>
      <td class="text-center"><button class="btn btn-sm" onclick="editWatchlistStock(${i})">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteWatchlistStock(${i})">🗑️</button></td>
    </tr>`;
  }).join('');

  let etfRows=(state.watchlistETFs||[]).map((w,i)=>`<tr>
    <td style="font-weight:800;color:var(--accent)">${w.ticker||'-'}</td><td>${w.name}${w.isin?` <a href="https://www.justetf.com/en/etf-profile.html?isin=${w.isin}" target="_blank" class="link-ext">↗ JustETF</a>`:''}</td>
    <td class="text-center"><span class="badge ${w.type==='DIST'?'badge-green':'badge-purple'}">${w.type||'ACC'}</span></td>
    <td class="text-center">${w.interest||'-'}</td><td>${w.notes||''}</td>
    <td class="text-center"><button class="btn btn-sm" onclick="editWatchlistETF(${i})">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteWatchlistETF(${i})">🗑️</button></td>
  </tr>`).join('');

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div class="card-title" style="margin:0">Watchlist — Ações</div>
        <button class="btn btn-primary" onclick="addWatchlistStock()">+ Ação</button>
      </div>
      <div style="overflow-x:auto"><table><thead><tr><th>Ticker</th><th>Empresa</th><th>Setor</th><th class="text-right">Yield</th><th class="text-center">Freq.</th><th class="text-center">Meses</th><th class="text-center">Interesse</th><th>Notas</th><th class="text-center">-</th></tr></thead>
      <tbody>${stockRows||'<tr><td colspan="9" style="text-align:center;color:var(--text-dim);padding:20px">Watchlist vazia</td></tr>'}</tbody></table></div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div class="card-title" style="margin:0">Watchlist — ETFs</div>
        <button class="btn btn-primary" onclick="addWatchlistETF()">+ ETF</button>
      </div>
      <div style="overflow-x:auto"><table><thead><tr><th>Ticker</th><th>Nome</th><th class="text-center">Tipo</th><th class="text-center">Interesse</th><th>Notas</th><th class="text-center">-</th></tr></thead>
      <tbody>${etfRows||'<tr><td colspan="6" style="text-align:center;color:var(--text-dim);padding:20px">Watchlist ETFs vazia</td></tr>'}</tbody></table></div>
    </div>`;
}

// ══════════════════════════════════════════
// HISTORY
// ══════════════════════════════════════════
function renderHistory(){
  let divRows=(state.dividendsReceived||[]).map((d,i)=>`<tr>
    <td>${d.date||'-'}</td><td style="font-weight:700;color:var(--accent)">${d.ticker}</td>
    <td class="text-right">${d.shares}</td><td class="text-right">${fmt(d.grossEUR||0)}</td>
    <td class="text-right">${fmt(d.taxEUR||0)}</td>
    <td class="text-right" style="font-weight:700;color:var(--green)">${fmt(d.netEUR||0)}</td>
    <td class="text-center"><button class="btn btn-sm btn-danger" onclick="deleteDivReceived(${i})">🗑️</button></td>
  </tr>`).join('');

  let decRows=(state.decisions||[]).map((d,i)=>`<tr>
    <td>${d.month||'-'}</td><td style="font-weight:700;color:var(--accent)">${d.ticker}</td>
    <td class="text-right">${fmt(d.amount||0)}</td><td>${d.reason||''}</td>
    <td class="text-center"><button class="btn btn-sm btn-danger" onclick="deleteDecision(${i})">🗑️</button></td>
  </tr>`).join('');

  var snapRows=(state.portfolioHistory||[]).map(function(h,i){
    return '<tr><td>'+h.date+'</td><td class="text-right">'+fmt(h.totalInvested)+'</td><td class="text-right" style="font-weight:600">'+fmt(h.totalValue)+'</td><td class="text-right" style="font-weight:700;color:'+(h.totalValue>=h.totalInvested?'var(--green)':'var(--red)')+'">'+fmt(h.totalValue-h.totalInvested)+'</td><td class="text-center"><button class="btn btn-sm btn-danger" onclick="deleteSnapshot('+i+')">🗑️</button></td></tr>';
  }).join('');

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div class="card-title" style="margin:0">📸 Snapshots do Portfolio</div>
        <div style="display:flex;gap:8px"><button class="pdf-btn" onclick="generatePDFReport()">📄 Gerar Relatório PDF</button>
        <button class="btn btn-primary" onclick="takeSnapshot()">+ Snapshot</button></div>
      </div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:12px">Tira um snapshot mensal para ver a evolução no gráfico do Resumo</div>
      <div style="overflow-x:auto"><table><thead><tr><th>Data</th><th class="text-right">Investido</th><th class="text-right">Valor</th><th class="text-right">P&L</th><th class="text-center">-</th></tr></thead>
      <tbody>${snapRows||'<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:20px">Nenhum snapshot</td></tr>'}</tbody></table></div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div class="card-title" style="margin:0">Dividendos Recebidos</div>
        <button class="btn btn-primary" onclick="addDivReceived()">+ Registar Dividendo</button>
      </div>
      <div style="overflow-x:auto"><table><thead><tr><th>Data</th><th>Ticker</th><th class="text-right">Nº Ações</th><th class="text-right">Bruto (€)</th><th class="text-right">Imposto (€)</th><th class="text-right">Líquido (€)</th><th class="text-center">-</th></tr></thead>
      <tbody>${divRows||'<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:20px">Nenhum dividendo registado</td></tr>'}</tbody></table></div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div class="card-title" style="margin:0">Decisões de Compra Mensais</div>
        <button class="btn btn-primary" onclick="addDecision()">+ Registar Compra</button>
      </div>
      <div style="overflow-x:auto"><table><thead><tr><th>Mês</th><th>Ticker</th><th class="text-right">Montante (€)</th><th>Razão</th><th class="text-center">-</th></tr></thead>
      <tbody>${decRows||'<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:20px">Nenhuma decisão registada</td></tr>'}</tbody></table></div>
    </div>`;
}


// ══════════════════════════════════════════
// CHARTS
// ══════════════════════════════════════════
function initCharts(){
  Chart.defaults.color='#94a3b8';
  Chart.defaults.borderColor='#1e293b';
  Chart.defaults.font.family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

  if(activeTab==='overview'){
    initDivMonthChart('chartDivMonth');
    initStockAllocationChart();
    initETFAllocationChart();
    initPerformanceChart();
    initPortfolioHistoryChart();
  }
  if(activeTab==='dividends'){
    initDivMonthChart('chartDivBig');
    initYieldChart();
  }
  if(activeTab==='fire'){
    initFIRECharts();
  }
  if(activeTab==='analyzer'&&analyzerData){
    initAnalyzerChart();
  }
  if(activeTab==='etfanalyzer'&&window._etfAnalyzerData){
    initETFAnalyzerChart();
  }
  if(activeTab==='correlation'){
    initCorrelationChart();
  }
  if(activeTab==='comparador'&&window._compData){
    initComparadorChart();
  }
}

function initDivMonthChart(canvasId){
  const cal=calcDividendCalendar();
  const avg=cal.reduce((a,b)=>a+b.total,0)/12;
  const now=new Date();const curMonth=now.getMonth();const curYear=now.getFullYear();
  const colors=cal.map((m,idx)=>{
    if(selectedYear===curYear&&idx<curMonth)return '#475569';
    if(selectedYear===curYear&&idx===curMonth)return '#60a5fa';
    if(m.count<=2)return '#ef4444';
    if(m.total>=avg)return '#3b82f6';
    return '#1e40af';
  });
  const ctx=document.getElementById(canvasId);if(!ctx)return;
  charts[canvasId]=new Chart(ctx,{
    type:'bar',data:{labels:MONTHS,datasets:[{data:cal.map(c=>parseFloat(c.total.toFixed(2))),backgroundColor:colors,borderRadius:6,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1,titleFont:{weight:'bold'},callbacks:{label:ctx=>'€'+ctx.parsed.y.toFixed(2),afterLabel:ctx=>{const m=cal[ctx.dataIndex];return m.details.map(d=>`  ${d.ticker}: €${d.amount.toFixed(2)}`).join('\n')}}}},scales:{y:{beginAtZero:true,grid:{color:'#1e293b'},ticks:{callback:v=>'€'+v}},x:{grid:{display:false}}}}
  });
}

function initStockAllocationChart(){
  const sectors={};
  state.stocks.forEach(s=>{
    const sec=s.sector||'Other';
    if(!sectors[sec])sectors[sec]=0;
    sectors[sec]+=toEUR(s.volume*s.currentPrice,s.currency);
  });
  const labels=Object.keys(sectors);
  const data=Object.values(sectors).map(v=>parseFloat(v.toFixed(2)));
  const colors=labels.map(l=>SECTOR_COLORS[l]||'#64748b');
  const ctx=document.getElementById('chartStockAlloc');if(!ctx)return;
  charts.stockAlloc=new Chart(ctx,{
    type:'doughnut',data:{labels,datasets:[{data,backgroundColor:colors,borderWidth:0,hoverOffset:8}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'55%',plugins:{legend:{position:'bottom',labels:{padding:12,usePointStyle:true,pointStyle:'circle',font:{size:10}}},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1,callbacks:{label:function(tip){var t=data.reduce(function(a,b){return a+b},0);return ' '+tip.label+': \u20ac'+tip.parsed.toFixed(2)+' ('+(tip.parsed/t*100).toFixed(1)+'%)'},afterLabel:function(tip){var sec=labels[tip.dataIndex];var list=state.stocks.filter(function(s){return(s.sector||'Other')===sec});return list.map(function(s){return '  '+s.ticker+': \u20ac'+toEUR(s.volume*s.currentPrice,s.currency).toFixed(2)}).join('\n')}}}}}
  });
}

function initETFAllocationChart(){
  const planTotals={};
  state.etfs.forEach(e=>{
    const plan=getPlan(e.planId);
    if(!planTotals[plan.name])planTotals[plan.name]={total:0,color:plan.color};
    planTotals[plan.name].total+=e.current;
  });
  const labels=Object.keys(planTotals);
  const data=labels.map(l=>parseFloat(planTotals[l].total.toFixed(2)));
  const colors=labels.map(l=>planTotals[l].color);
  const ctx=document.getElementById('chartETFAlloc');if(!ctx)return;
  charts.etfAlloc=new Chart(ctx,{
    type:'doughnut',data:{labels,datasets:[{data,backgroundColor:colors,borderWidth:0,hoverOffset:8}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'55%',plugins:{legend:{position:'bottom',labels:{padding:12,usePointStyle:true,pointStyle:'circle',font:{size:10}}},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1,callbacks:{label:function(tip){var t=data.reduce(function(a,b){return a+b},0);return ' '+tip.label+': \u20ac'+tip.parsed.toFixed(2)+' ('+(tip.parsed/t*100).toFixed(1)+'%)'},afterLabel:function(tip){var pName=labels[tip.dataIndex];var plan=(state.plans||[]).find(function(p){return p.name===pName});if(!plan)return '';var list=state.etfs.filter(function(e){return e.planId===plan.id});return list.map(function(e){return '  '+(e.ticker||'')+' '+e.name.substring(0,25)+': \u20ac'+e.current.toFixed(2)}).join('\n')}}}}}
  });
}

function initPerformanceChart(){
  const data=state.stocks.map(s=>({ticker:s.ticker,pl:((s.currentPrice-s.buyPrice)/s.buyPrice*100),yield:s.divYield}));
  const ctx=document.getElementById('chartPerformance');if(!ctx)return;
  charts.performance=new Chart(ctx,{
    type:'bar',data:{labels:data.map(d=>d.ticker),datasets:[
      {label:'P&L (%)',data:data.map(d=>parseFloat(d.pl.toFixed(2))),backgroundColor:data.map(d=>d.pl>=0?'rgba(16,185,129,.7)':'rgba(239,68,68,.7)'),borderRadius:6,yAxisID:'y',minBarLength:4},
      {label:'Div Yield (%)',data:data.map(d=>d.yield),type:'line',borderColor:'#f59e0b',backgroundColor:'#f59e0b',borderWidth:2.5,pointRadius:5,pointBackgroundColor:'#f59e0b',yAxisID:'y1'}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{usePointStyle:true,font:{size:11}}},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1}},scales:{y:{beginAtZero:true,grid:{color:'#1e293b'},ticks:{callback:v=>v+'%'}},y1:{position:'right',beginAtZero:true,grid:{display:false},ticks:{callback:v=>v+'%'}},x:{grid:{display:false}}}}
  });
}

function initYieldChart(){
  const data=state.stocks.map(s=>({ticker:s.ticker,yield:s.divYield})).sort((a,b)=>b.yield-a.yield);
  const ctx=document.getElementById('chartYield');if(!ctx)return;
  charts.yield=new Chart(ctx,{
    type:'bar',data:{labels:data.map(d=>d.ticker),datasets:[{data:data.map(d=>d.yield),backgroundColor:data.map(d=>d.yield>=5?'#10b981':d.yield>=4?'#f59e0b':'#3b82f6'),borderRadius:6}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1,callbacks:{label:ctx=>ctx.parsed.x+'%'}}},scales:{x:{beginAtZero:true,grid:{color:'#1e293b'},ticks:{callback:v=>v+'%'}},y:{grid:{display:false}}}}
  });
}



function initPortfolioHistoryChart(){
  var hist=state.portfolioHistory||[];
  var ctx=document.getElementById('chartPortfolioHistory');
  if(!ctx)return;
  if(hist.length<2){
    ctx.parentElement.innerHTML='<div style="text-align:center;padding:40px;color:var(--text-dim)">Adiciona snapshots mensais no Histórico para ver a evolução</div>';
    return;
  }
  charts.portfolioHistory=new Chart(ctx,{
    type:'line',
    data:{labels:hist.map(function(h){return h.date}),datasets:[
      {label:'Valor Total',data:hist.map(function(h){return h.totalValue}),borderColor:'rgba(59,130,246,.8)',backgroundColor:'rgba(59,130,246,.1)',fill:true,tension:.3,borderWidth:2,pointRadius:3},
      {label:'Investido',data:hist.map(function(h){return h.totalInvested}),borderColor:'rgba(148,163,184,.5)',borderWidth:1.5,pointRadius:2,borderDash:[5,5],fill:false}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{usePointStyle:true,font:{size:11}}},tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1}},
      scales:{y:{grid:{color:'#1e293b'},ticks:{callback:function(v){return '\u20ac'+v}}},x:{grid:{display:false}}}
    }
  });
}

// ══════════════════════════════════════════
// 🔥 FIRE CALCULATOR
// ══════════════════════════════════════════
function getFireDefaults(){
  const t=calcTotals();
  return{
    currentAge:30,retireAge:67,investYears:20,
    annualSpend:15000,currentAssets:Math.round(t.totalCur),monthlyContrib:200,
    growthRate:7,inflationRate:3,swr:4
  };
}

function renderFIRE(){
  const fd=state.fireSettings||getFireDefaults();
  // Pre-calculate to show results
  const calc=calcFIRE(fd);

  return `
    <div class="fire-layout">
      <div class="fire-panel">
        <h3 style="font-size:16px;font-weight:800;margin-bottom:20px;background:linear-gradient(135deg,#f97316,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Calculadora FIRE</h3>
        
        <div class="fire-input-group">
          <label>Idade Atual</label>
          <input type="number" id="fire_age" value="${fd.currentAge}" onchange="updateFIRE()">
        </div>
        <div class="fire-input-group">
          <label>Idade de Reforma</label>
          <input type="number" id="fire_retireAge" value="${fd.retireAge}" onchange="updateFIRE()">
        </div>
        <div class="fire-input-group">
          <label>Anos que pretendo investir</label>
          <input type="number" id="fire_investYears" value="${fd.investYears}" onchange="updateFIRE()">
          <div style="font-size:10px;color:var(--text-dim);margin-top:4px">Se investir menos anos que até à reforma</div>
        </div>
        <div class="fire-input-group">
          <label>Gastos Anuais na Reforma (€)</label>
          <input type="number" id="fire_spend" value="${fd.annualSpend}" onchange="updateFIRE()">
        </div>
        <div class="fire-input-group">
          <label>Capital Investido Atual (€)</label>
          <input type="number" id="fire_assets" value="${fd.currentAssets}" onchange="updateFIRE()">
        </div>
        <div class="fire-input-group">
          <label>Contribuição Mensal (€)</label>
          <input type="number" id="fire_monthly" value="${fd.monthlyContrib}" onchange="updateFIRE()">
        </div>
        
        <div class="fire-input-group">
          <label>Taxa de Crescimento do Investimento</label>
          <div class="fire-slider-row">
            <input type="range" id="fire_growth" min="2" max="14" step="0.5" value="${fd.growthRate}" oninput="document.getElementById('fire_growth_val').textContent=this.value+'%';updateFIRE()">
            <span class="fire-slider-val" id="fire_growth_val">${fd.growthRate}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-dim);margin-top:2px"><span>2%</span><span>Conservador</span><span>S&P500 ~10%</span><span>14%</span></div>
        </div>
        
        <div class="fire-input-group">
          <label>Taxa de Inflação</label>
          <div class="fire-slider-row">
            <input type="range" id="fire_inflation" min="1" max="6" step="0.5" value="${fd.inflationRate}" oninput="document.getElementById('fire_inflation_val').textContent=this.value+'%';updateFIRE()">
            <span class="fire-slider-val" id="fire_inflation_val">${fd.inflationRate}%</span>
          </div>
        </div>
        
        <div class="fire-input-group">
          <label>Taxa de Levantamento Segura (SWR)</label>
          <div class="fire-slider-row">
            <input type="range" id="fire_swr" min="2" max="6" step="0.5" value="${fd.swr}" oninput="document.getElementById('fire_swr_val').textContent=this.value+'%';updateFIRE()">
            <span class="fire-slider-val" id="fire_swr_val">${fd.swr}%</span>
          </div>
          <div style="font-size:9px;color:var(--text-dim);margin-top:2px">Regra dos 4%: Podes levantar 4% ao ano sem esgotar o capital</div>
        </div>
      </div>
      
      <div>
        <div class="card" style="margin-bottom:16px">
          <div class="card-title">Projeção do Património</div>
          <div class="chart-wrap"><canvas id="chartFIRE" height="350"></canvas></div>
        </div>
        
        <div class="fire-scenarios">
          <div class="fire-scenario" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3)">
            <div class="fire-scenario-title" style="color:var(--red)">🎯 Número FIRE</div>
            <div class="fire-scenario-value" style="color:var(--red)" id="fire_number">${fmt(calc.fireNumber)}</div>
            <div class="fire-scenario-sub" style="color:var(--text-muted)">Capital necessário para viver de rendimentos</div>
          </div>
          <div class="fire-scenario" style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.3)">
            <div class="fire-scenario-title" style="color:var(--accent)">🏖️ Coast FIRE</div>
            <div class="fire-scenario-value" style="color:var(--accent)" id="fire_coast">${fmt(calc.coastFIRE)}</div>
            <div class="fire-scenario-sub" style="color:var(--text-muted)">Capital hoje que cresce sozinho até à reforma</div>
          </div>
          <div class="fire-scenario" style="background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3)">
            <div class="fire-scenario-title" style="color:var(--green)">📊 Na Reforma Terás</div>
            <div class="fire-scenario-value" style="color:var(--green)" id="fire_atretire">${fmt(calc.atRetirement)}</div>
            <div class="fire-scenario-sub" style="color:var(--text-muted)">Se investires ${fd.investYears} anos</div>
          </div>
        </div>
        
        <div class="card" style="margin-top:16px">
          <div class="card-title">Marcos Importantes</div>
          <div id="fireMilestones">
            ${calc.milestones.map(m=>`<div class="fire-milestone">
              <div><div style="font-size:13px;font-weight:700;color:var(--text)">${m.label}</div><div class="fire-milestone-label">${m.desc}</div></div>
              <div class="fire-milestone-value" style="color:${m.color}">${m.value}</div>
            </div>`).join('')}
          </div>
        </div>
        
        <div class="card" style="margin-top:16px">
          <div class="card-title">Cenários de Crescimento</div>
          <div class="chart-wrap"><canvas id="chartFIREScenarios" height="250"></canvas></div>
        </div>
      </div>
    </div>`;
}

function calcFIRE(fd){
  const realReturn=(1+fd.growthRate/100)/(1+fd.inflationRate/100)-1;
  const fireNumber=fd.annualSpend/(fd.swr/100);
  const yearsToRetire=fd.retireAge-fd.currentAge;
  const coastFIRE=fireNumber/Math.pow(1+realReturn,yearsToRetire);
  
  // Project with contributions for investYears, then growth only
  const projFull=[];const projInvestOnly=[];const projNoContrib=[];
  let balFull=fd.currentAssets;let balInvest=fd.currentAssets;let balCoast=fd.currentAssets;
  const monthlyReturn=Math.pow(1+fd.growthRate/100,1/12)-1;
  
  for(let y=0;y<=yearsToRetire;y++){
    projFull.push({age:fd.currentAge+y,value:balFull});
    projInvestOnly.push({age:fd.currentAge+y,value:balInvest});
    projNoContrib.push({age:fd.currentAge+y,value:balCoast});
    
    // Full contributions until retirement
    for(let m=0;m<12;m++){
      balFull=balFull*(1+monthlyReturn)+fd.monthlyContrib;
    }
    // Contributions only for investYears
    for(let m=0;m<12;m++){
      if(y<fd.investYears){
        balInvest=balInvest*(1+monthlyReturn)+fd.monthlyContrib;
      }else{
        balInvest=balInvest*(1+monthlyReturn);
      }
    }
    // No contributions (coast)
    for(let m=0;m<12;m++){
      balCoast=balCoast*(1+monthlyReturn);
    }
  }

  const atRetirement=projInvestOnly[projInvestOnly.length-1]?.value||0;
  const atRetirementFull=projFull[projFull.length-1]?.value||0;
  
  // Coast FIRE age: when does balCoast reach fireNumber?
  let coastAge=null;
  for(const p of projNoContrib){if(p.value>=fireNumber){coastAge=p.age;break}}
  
  // FIRE age with full contributions
  let fireAge=null;
  for(const p of projFull){if(p.value>=fireNumber){fireAge=p.age;break}}
  
  // When investOnly reaches fireNumber
  let fireAgeInvest=null;
  for(const p of projInvestOnly){if(p.value>=fireNumber){fireAgeInvest=p.age;break}}

  // Milestones
  const milestones=[];
  if(fireAge&&fireAge<=fd.retireAge)milestones.push({label:`FIRE aos ${fireAge} anos`,desc:'Se investires todos os meses até lá',value:fmt(fireNumber),color:'var(--green)'});
  else{milestones.push({label:`FIRE não atingido antes dos ${fd.retireAge}`,desc:'Aumenta contribuição mensal ou reduz gastos anuais',value:'Faltam '+fmt(Math.max(0,fireNumber-atRetirementFull)),color:'var(--red)'});var fv=Math.pow(1+fd.growthRate/100,yearsToRetire);var needed=(fireNumber-fd.currentAssets*fv)/(((fv-1)/(fd.growthRate/100)));if(needed>0)milestones.push({label:'Contribuição necessária para FIRE',desc:'Valor anual necessário',value:fmt(Math.ceil(needed/12))+'/mês ('+fmt(Math.ceil(needed))+'/ano)',color:'var(--yellow)'})}
  
  if(fireAgeInvest)milestones.push({label:`FIRE aos ${fireAgeInvest} anos (${fd.investYears}a invest.)`,desc:`Se investires durante ${fd.investYears} anos e depois parares`,value:fmt(fireNumber),color:'var(--accent)'});
  else milestones.push({label:`Após ${fd.investYears} anos de investimento`,desc:'Capital acumulado quando parares de investir',value:fmt(projInvestOnly[Math.min(fd.investYears,projInvestOnly.length-1)]?.value||0),color:'var(--accent)'});
  
  milestones.push({label:'Na idade de reforma ('+fd.retireAge+')',desc:'Investindo '+fd.investYears+' anos',value:fmt(atRetirement),color:'var(--yellow)'});
  milestones.push({label:'Na idade de reforma ('+fd.retireAge+')',desc:'Investindo até à reforma',value:fmt(atRetirementFull),color:'var(--green)'});
  
  const annualIncome4pct=atRetirement*0.04;
  milestones.push({label:'Rendimento anual (regra 4%)',desc:'Quanto podes levantar por ano na reforma',value:fmt(annualIncome4pct)+'/ano ('+fmt(annualIncome4pct/12)+'/mês)',color:'var(--cyan)'});

  const totalContribInvest=fd.currentAssets+fd.monthlyContrib*12*fd.investYears;
  const totalContribFull=fd.currentAssets+fd.monthlyContrib*12*yearsToRetire;
  milestones.push({label:'Total contribuído ('+fd.investYears+'a)',desc:'Capital que colocaste do bolso',value:fmt(totalContribInvest),color:'var(--text-muted)'});
  milestones.push({label:'Juros compostos gerados',desc:'Dinheiro que o dinheiro fez',value:fmt(atRetirement-totalContribInvest),color:'var(--purple)'});

  return{fireNumber,coastFIRE,atRetirement,atRetirementFull,projFull,projInvestOnly,projNoContrib,milestones,fireAge,coastAge};
}

function updateFIRE(){
  const fd={
    currentAge:parseInt(document.getElementById('fire_age').value)||30,
    retireAge:parseInt(document.getElementById('fire_retireAge').value)||67,
    investYears:parseInt(document.getElementById('fire_investYears').value)||20,
    annualSpend:parseFloat(document.getElementById('fire_spend').value)||15000,
    currentAssets:parseFloat(document.getElementById('fire_assets').value)||0,
    monthlyContrib:parseFloat(document.getElementById('fire_monthly').value)||200,
    growthRate:parseFloat(document.getElementById('fire_growth').value)||7,
    inflationRate:parseFloat(document.getElementById('fire_inflation').value)||3,
    swr:parseFloat(document.getElementById('fire_swr').value)||4
  };
  state.fireSettings=fd;
  saveData();
  
  const calc=calcFIRE(fd);
  
  // Update results
  document.getElementById('fire_number').textContent=fmt(calc.fireNumber);
  document.getElementById('fire_coast').textContent=fmt(calc.coastFIRE);
  document.getElementById('fire_atretire').textContent=fmt(calc.atRetirement);
  
  // Update milestones
  document.getElementById('fireMilestones').innerHTML=calc.milestones.map(m=>`<div class="fire-milestone"><div><div style="font-size:13px;font-weight:700;color:var(--text)">${m.label}</div><div class="fire-milestone-label">${m.desc}</div></div><div class="fire-milestone-value" style="color:${m.color}">${m.value}</div></div>`).join('');
  
  // Update charts
  destroyCharts();
  setTimeout(initCharts,50);
}

function initFIRECharts(){
  const fd=state.fireSettings||getFireDefaults();
  const calc=calcFIRE(fd);
  
  // Main projection chart
  const labels=calc.projFull.map(p=>p.age);
  const ctx=document.getElementById('chartFIRE');
  if(ctx){
    charts.fire=new Chart(ctx,{
      type:'line',
      data:{
        labels,
        datasets:[
          {label:'Investir até à reforma',data:calc.projFull.map(p=>Math.round(p.value)),borderColor:'rgba(16,185,129,.8)',backgroundColor:'rgba(16,185,129,.1)',fill:true,tension:.3,borderWidth:2,pointRadius:0},
          {label:'Investir '+fd.investYears+' anos',data:calc.projInvestOnly.map(p=>Math.round(p.value)),borderColor:'rgba(59,130,246,.8)',backgroundColor:'rgba(59,130,246,.1)',fill:true,tension:.3,borderWidth:2,pointRadius:0},
          {label:'Sem contribuições (Coast)',data:calc.projNoContrib.map(p=>Math.round(p.value)),borderColor:'rgba(148,163,184,.5)',backgroundColor:'rgba(148,163,184,.05)',fill:true,tension:.3,borderWidth:1.5,pointRadius:0,borderDash:[5,5]},
          {label:'Número FIRE',data:labels.map(()=>calc.fireNumber),borderColor:'rgba(239,68,68,.7)',borderWidth:2,pointRadius:0,borderDash:[8,4],fill:false}
        ]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        interaction:{mode:'index',intersect:false},
        plugins:{
          legend:{labels:{usePointStyle:true,font:{size:11},padding:16}},
          tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1,callbacks:{label:ctx=>` ${ctx.dataset.label}: €${ctx.parsed.y.toLocaleString('pt-PT')}`}}
        },
        scales:{
          y:{beginAtZero:true,grid:{color:'#1e293b'},ticks:{callback:v=>{if(v>=1000000)return '€'+Math.round(v/1000000)+'M';if(v>=1000)return '€'+Math.round(v/1000)+'k';return '€'+v}}},
          x:{grid:{display:false},title:{display:true,text:'Idade (anos)',color:'var(--text-dim)'}}
        }
      }
    });
  }
  
  // Scenarios chart (pessimistic, realistic, optimistic)
  const ctx2=document.getElementById('chartFIREScenarios');
  if(ctx2){
    const scenarios=[
      {label:'Pessimista (4%)',rate:4,color:'rgba(239,68,68,.7)'},
      {label:'Conservador (6%)',rate:6,color:'rgba(245,158,11,.7)'},
      {label:'Realista S&P500 (8%)',rate:8,color:'rgba(59,130,246,.7)'},
      {label:'Otimista (10%)',rate:10,color:'rgba(16,185,129,.7)'}
    ];
    const yearsToRetire=fd.retireAge-fd.currentAge;
    const scenarioData=scenarios.map(s=>{
      let bal=fd.currentAssets;
      const mr=Math.pow(1+s.rate/100,1/12)-1;
      const points=[];
      for(let y=0;y<=yearsToRetire;y++){
        points.push(Math.round(bal));
        for(let m=0;m<12;m++){
          if(y<fd.investYears)bal=bal*(1+mr)+fd.monthlyContrib;
          else bal=bal*(1+mr);
        }
      }
      return{...s,data:points};
    });
    
    charts.fireScenarios=new Chart(ctx2,{
      type:'line',
      data:{
        labels:Array.from({length:yearsToRetire+1},(_,i)=>fd.currentAge+i),
        datasets:scenarioData.map(s=>({label:s.label,data:s.data,borderColor:s.color,borderWidth:2,tension:.3,pointRadius:0,fill:false}))
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        interaction:{mode:'index',intersect:false},
        plugins:{
          legend:{labels:{usePointStyle:true,font:{size:10}}},
          tooltip:{backgroundColor:'#1e293b',borderColor:'#334155',borderWidth:1,callbacks:{label:ctx=>` ${ctx.dataset.label}: €${ctx.parsed.y.toLocaleString('pt-PT')}`}}
        },
        scales:{
          y:{beginAtZero:true,grid:{color:'#1e293b'},ticks:{callback:v=>{if(v>=1000000)return '€'+Math.round(v/1000000)+'M';if(v>=1000)return '€'+Math.round(v/1000)+'k';return '€'+v}}},
          x:{grid:{display:false},title:{display:true,text:'Idade (anos)',color:'var(--text-dim)'}}
        }
      }
    });
  }
}

// ══════════════════════════════════════════
// CRUD OPERATIONS
// ══════════════════════════════════════════
function addStock(){
  showModal('Adicionar Ação',`
    <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:12px">
      <div style="flex:1" class="form-row"><label>Ticker</label><input id="f_ticker" placeholder="MO, O, VICI..."></div>
      <button class="fetch-btn" onclick="autoFillTicker('f_ticker','f_name','f_currentPrice','f_currency')" style="height:36px;margin-bottom:1px">🔍 Buscar</button>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Empresa</label><input id="f_name"></div>
      <div class="form-row"><label>Setor</label><select id="f_sector"><option>Technology</option><option>Healthcare</option><option>Financial</option><option>Energy</option><option>Consumer</option><option>Utilities</option><option>REIT</option><option>Tobacco</option><option>Industrial</option><option>Telecom</option><option>Other</option></select></div>
      <div class="form-row"><label>Moeda Original</label><select id="f_currency"><option>USD</option><option>EUR</option></select></div>
      <div class="form-row"><label>Volume</label><input id="f_volume" type="number" step="0.0001"></div>
      <div class="form-row"><label>Preço Compra</label><input id="f_buyPrice" type="number" step="0.01"></div>
      <div class="form-row"><label>Preço Atual</label><input id="f_currentPrice" type="number" step="0.01"></div>
      <div class="form-row"><label>Div Yield (%)</label><input id="f_divYield" type="number" step="0.01"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Div/Ação (moeda original)</label><input id="f_divPerShare" type="number" step="0.001"></div>
      <div class="form-row"><label>Frequência</label><select id="f_freq"><option>Trimestral</option><option>Mensal</option><option>Semestral</option><option>Anual</option></select></div>
    </div>
    <div class="form-row"><label>Meses de pagamento (1-12, separados por vírgula)</label><input id="f_months" placeholder="1,4,7,10"></div>
  `,()=>{
    state.stocks.push({
      ticker:document.getElementById('f_ticker').value.toUpperCase(),
      name:document.getElementById('f_name').value,
      sector:document.getElementById('f_sector').value,
      volume:parseFloat(document.getElementById('f_volume').value)||0,
      buyPrice:parseFloat(document.getElementById('f_buyPrice').value)||0,
      currentPrice:parseFloat(document.getElementById('f_currentPrice').value)||0,
      currency:document.getElementById('f_currency').value,
      divYield:parseFloat(document.getElementById('f_divYield').value)||0,
      divPerShare:parseFloat(document.getElementById('f_divPerShare').value)||0,
      freq:document.getElementById('f_freq').value,
      months:document.getElementById('f_months').value.split(',').map(Number).filter(n=>n>=1&&n<=12)
    });
  });
}

function editStock(i){
  const s=state.stocks[i];
  const sectors=["Technology","Healthcare","Financial","Energy","Consumer","Utilities","REIT","Tobacco","Industrial","Telecom","Other"];
  showModal('Editar — '+s.ticker,`
    <div class="form-grid">
      <div class="form-row"><label>Ticker</label><input id="f_ticker" value="${s.ticker}"></div>
      <div class="form-row"><label>Empresa</label><input id="f_name" value="${s.name}"></div>
      <div class="form-row"><label>Setor</label><select id="f_sector">${sectors.map(sec=>`<option ${s.sector===sec?'selected':''}>${sec}</option>`).join('')}</select></div>
      <div class="form-row"><label>Moeda</label><select id="f_currency"><option ${s.currency==='USD'?'selected':''}>USD</option><option ${s.currency==='EUR'?'selected':''}>EUR</option></select></div>
      <div class="form-row"><label>Volume</label><input id="f_volume" type="number" step="0.0001" value="${s.volume}"></div>
      <div class="form-row"><label>Preço Compra</label><input id="f_buyPrice" type="number" step="0.01" value="${s.buyPrice}"></div>
      <div class="form-row"><label>Preço Atual</label><input id="f_currentPrice" type="number" step="0.01" value="${s.currentPrice}"></div>
      <div class="form-row"><label>Div Yield (%)</label><input id="f_divYield" type="number" step="0.01" value="${s.divYield}"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Div/Ação</label><input id="f_divPerShare" type="number" step="0.001" value="${s.divPerShare}"></div>
      <div class="form-row"><label>Frequência</label><select id="f_freq"><option ${s.freq==='Trimestral'?'selected':''}>Trimestral</option><option ${s.freq==='Mensal'?'selected':''}>Mensal</option><option ${s.freq==='Semestral'?'selected':''}>Semestral</option><option ${s.freq==='Anual'?'selected':''}>Anual</option></select></div>
    </div>
    <div class="form-row"><label>Meses pagamento</label><input id="f_months" value="${s.months.join(',')}"></div>
  `,()=>{Object.assign(state.stocks[i],{ticker:document.getElementById('f_ticker').value.toUpperCase(),name:document.getElementById('f_name').value,sector:document.getElementById('f_sector').value,volume:parseFloat(document.getElementById('f_volume').value)||0,buyPrice:parseFloat(document.getElementById('f_buyPrice').value)||0,currentPrice:parseFloat(document.getElementById('f_currentPrice').value)||0,currency:document.getElementById('f_currency').value,divYield:parseFloat(document.getElementById('f_divYield').value)||0,divPerShare:parseFloat(document.getElementById('f_divPerShare').value)||0,freq:document.getElementById('f_freq').value,months:document.getElementById('f_months').value.split(',').map(Number).filter(n=>n>=1&&n<=12)})});
}

function deleteStock(i){if(confirm('Remover '+state.stocks[i].ticker+'?')){state.stocks.splice(i,1);saveData();render()}}

function updateAllPrices(){
  showModal('Atualizar Preços Manual',state.stocks.map((s,i)=>`<div class="form-row" style="display:flex;gap:10px;align-items:center"><label style="width:70px;font-weight:700;color:var(--accent)">${s.ticker}</label><input id="f_price_${i}" type="number" step="0.01" value="${s.currentPrice}" style="flex:1"><span style="font-size:10px;color:var(--text-dim)">${s.currency}</span></div>`).join(''),()=>{state.stocks.forEach((s,i)=>{s.currentPrice=parseFloat(document.getElementById('f_price_'+i).value)||s.currentPrice});state.lastPriceUpdate=new Date().toISOString()});
}

// ETF CRUD
function addETF(){
  const planOpts=(state.plans||[]).map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  showModal('Adicionar ETF',`
    <div class="form-row"><label>Plano</label><select id="f_plan">${planOpts}</select></div>
    <div class="form-grid">
      <div class="form-row"><label>Ticker</label><input id="f_ticker" placeholder="CSPX, VHYL..."></div>
      <div class="form-row"><label>ISIN</label><input id="f_isin" placeholder="IE00B5BMR087"></div>
    </div>
    <div class="form-row"><label>Nome</label><input id="f_name"></div>
    <div class="form-row"><label>Tipo</label><select id="f_type"><option>ACC</option><option>DIST</option></select></div>
    <div class="form-grid">
      <div class="form-row"><label>Investido (€)</label><input id="f_invested" type="number" step="0.01"></div>
      <div class="form-row"><label>Valor Atual (€)</label><input id="f_current" type="number" step="0.01"></div>
    </div>
  `,()=>{state.etfs.push({planId:document.getElementById('f_plan').value,ticker:document.getElementById('f_ticker').value.toUpperCase(),isin:document.getElementById('f_isin').value.trim(),name:document.getElementById('f_name').value,type:document.getElementById('f_type').value,invested:parseFloat(document.getElementById('f_invested').value)||0,current:parseFloat(document.getElementById('f_current').value)||0})});
}

function editETF(i){
  const e=state.etfs[i];
  const planOpts=(state.plans||[]).map(p=>`<option value="${p.id}" ${e.planId===p.id?'selected':''}>${p.name}</option>`).join('');
  showModal('Editar ETF',`
    <div class="form-row"><label>Plano</label><select id="f_plan">${planOpts}</select></div>
    <div class="form-grid">
      <div class="form-row"><label>Ticker</label><input id="f_ticker" value="${e.ticker||''}"></div>
      <div class="form-row"><label>ISIN</label><input id="f_isin" value="${e.isin||''}"></div>
    </div>
    <div class="form-row"><label>Nome</label><input id="f_name" value="${e.name}"></div>
    <div class="form-row"><label>Tipo</label><select id="f_type"><option ${e.type==='ACC'?'selected':''}>ACC</option><option ${e.type==='DIST'?'selected':''}>DIST</option></select></div>
    <div class="form-grid">
      <div class="form-row"><label>Investido (€)</label><input id="f_invested" type="number" step="0.01" value="${e.invested}"></div>
      <div class="form-row"><label>Valor Atual (€)</label><input id="f_current" type="number" step="0.01" value="${e.current}"></div>
    </div>
  `,()=>{Object.assign(state.etfs[i],{planId:document.getElementById('f_plan').value,ticker:document.getElementById('f_ticker').value.toUpperCase(),isin:document.getElementById('f_isin').value.trim(),name:document.getElementById('f_name').value,type:document.getElementById('f_type').value,invested:parseFloat(document.getElementById('f_invested').value)||0,current:parseFloat(document.getElementById('f_current').value)||0})});
}

function deleteETF(i){if(confirm('Remover '+state.etfs[i].name+'?')){state.etfs.splice(i,1);saveData();render()}}

// PLAN MANAGEMENT
function managePlans(){
  const plansHTML=(state.plans||[]).map((p,i)=>`
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;padding:8px;background:var(--bg);border-radius:8px">
      <span style="width:16px;height:16px;border-radius:50%;background:${p.color};flex-shrink:0"></span>
      <input id="pname_${i}" value="${p.name}" style="flex:1;padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px">
      <input id="pcolor_${i}" type="color" value="${p.color}" style="width:36px;height:30px;border:none;background:none;cursor:pointer">
      <button class="btn btn-sm btn-danger" onclick="deletePlan(${i})">🗑️</button>
    </div>
  `).join('');

  showModal('Gerir Planos de ETFs',`
    ${plansHTML}
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
      <div class="form-grid">
        <div class="form-row"><label>Novo Plano</label><input id="f_newPlanName" placeholder="Nome do plano"></div>
        <div class="form-row"><label>Cor</label><input id="f_newPlanColor" type="color" value="#06b6d4"></div>
      </div>
      <button class="btn btn-sm" onclick="document.getElementById('f_newPlanAdded').value='1'" style="margin-top:8px">+ Adicionar Plano</button>
      <input type="hidden" id="f_newPlanAdded" value="0">
    </div>
  `,()=>{
    state.plans.forEach((p,i)=>{
      p.name=document.getElementById('pname_'+i).value;
      p.color=document.getElementById('pcolor_'+i).value;
    });
    const newName=document.getElementById('f_newPlanName').value.trim();
    if(newName){
      state.plans.push({id:newName.toLowerCase().replace(/\s+/g,'_')+'_'+Date.now(),name:newName,color:document.getElementById('f_newPlanColor').value});
    }
  });
}

function deletePlan(i){
  const plan=state.plans[i];
  const hasETFs=state.etfs.some(e=>e.planId===plan.id);
  if(hasETFs){alert('Não podes remover um plano com ETFs. Remove os ETFs primeiro.');return}
  state.plans.splice(i,1);saveData();render();
}

// WATCHLIST CRUD
function addWatchlistStock(){
  showModal('Adicionar à Watchlist',`
    <div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:12px">
      <div style="flex:1" class="form-row"><label>Ticker</label><input id="f_ticker"></div>
      <button class="fetch-btn" onclick="autoFillTicker('f_ticker','f_name',null,null)" style="height:36px;margin-bottom:1px">🔍 Buscar</button>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Empresa</label><input id="f_name"></div>
      <div class="form-row"><label>Setor</label><select id="f_sector"><option>Technology</option><option>Healthcare</option><option>Financial</option><option>Energy</option><option>Consumer</option><option>Utilities</option><option>REIT</option><option>Tobacco</option><option>Industrial</option><option>Telecom</option><option>Other</option></select></div>
      <div class="form-row"><label>Div Yield (%)</label><input id="f_divYield" type="number" step="0.01"></div>
    </div>
    <div class="form-grid">
      <div class="form-row"><label>Frequência</label><select id="f_freq"><option>Trimestral</option><option>Mensal</option><option>Semestral</option></select></div>
      <div class="form-row"><label>Interesse</label><select id="f_interest"><option>SIM</option><option>TALVEZ</option><option>ANALISAR</option><option>NÃO</option></select></div>
    </div>
    <div class="form-row"><label>Meses Pagamento</label><input id="f_months" placeholder="Jan/Abr/Jul/Out"></div>
    <div class="form-row"><label>Notas</label><input id="f_notes"></div>
  `,()=>{if(!state.watchlistStocks)state.watchlistStocks=[];state.watchlistStocks.push({ticker:document.getElementById('f_ticker').value.toUpperCase(),name:document.getElementById('f_name').value,sector:document.getElementById('f_sector').value,divYield:parseFloat(document.getElementById('f_divYield').value)||0,freq:document.getElementById('f_freq').value,months:document.getElementById('f_months').value,interest:document.getElementById('f_interest').value,notes:document.getElementById('f_notes').value})});
}

function editWatchlistStock(i){
  const w=state.watchlistStocks[i];
  showModal('Editar Watchlist — '+w.ticker,`
    <div class="form-grid">
      <div class="form-row"><label>Ticker</label><input id="f_ticker" value="${w.ticker}"></div>
      <div class="form-row"><label>Empresa</label><input id="f_name" value="${w.name}"></div>
      <div class="form-row"><label>Div Yield (%)</label><input id="f_divYield" type="number" step="0.01" value="${w.divYield}"></div>
      <div class="form-row"><label>Interesse</label><select id="f_interest"><option ${w.interest==='SIM'?'selected':''}>SIM</option><option ${w.interest==='TALVEZ'?'selected':''}>TALVEZ</option><option ${w.interest==='ANALISAR'?'selected':''}>ANALISAR</option><option ${w.interest==='NÃO'?'selected':''}>NÃO</option></select></div>
    </div>
    <div class="form-row"><label>Meses</label><input id="f_months" value="${w.months}"></div>
    <div class="form-row"><label>Notas</label><input id="f_notes" value="${w.notes||''}"></div>
  `,()=>{Object.assign(state.watchlistStocks[i],{ticker:document.getElementById('f_ticker').value.toUpperCase(),name:document.getElementById('f_name').value,divYield:parseFloat(document.getElementById('f_divYield').value)||0,months:document.getElementById('f_months').value,interest:document.getElementById('f_interest').value,notes:document.getElementById('f_notes').value})});
}

function deleteWatchlistStock(i){if(confirm('Remover?')){state.watchlistStocks.splice(i,1);saveData();render()}}

function addWatchlistETF(){
  showModal('Adicionar ETF à Watchlist',`
    <div class="form-grid">
      <div class="form-row"><label>Ticker</label><input id="f_ticker"></div>
      <div class="form-row"><label>ISIN</label><input id="f_isin"></div>
    </div>
    <div class="form-row"><label>Nome</label><input id="f_name"></div>
    <div class="form-grid">
      <div class="form-row"><label>Tipo</label><select id="f_type"><option>ACC</option><option>DIST</option></select></div>
      <div class="form-row"><label>Interesse</label><select id="f_interest"><option>SIM</option><option>TALVEZ</option><option>ANALISAR</option></select></div>
    </div>
    <div class="form-row"><label>Notas</label><input id="f_notes"></div>
  `,()=>{if(!state.watchlistETFs)state.watchlistETFs=[];state.watchlistETFs.push({ticker:document.getElementById('f_ticker').value.toUpperCase(),isin:document.getElementById('f_isin').value.trim(),name:document.getElementById('f_name').value,type:document.getElementById('f_type').value,interest:document.getElementById('f_interest').value,notes:document.getElementById('f_notes').value})});
}

function editWatchlistETF(i){
  const w=state.watchlistETFs[i];
  showModal('Editar ETF Watchlist',`
    <div class="form-grid"><div class="form-row"><label>Ticker</label><input id="f_ticker" value="${w.ticker||''}"></div><div class="form-row"><label>ISIN</label><input id="f_isin" value="${w.isin||''}"></div></div>
    <div class="form-row"><label>Nome</label><input id="f_name" value="${w.name}"></div>
    <div class="form-grid"><div class="form-row"><label>Tipo</label><select id="f_type"><option ${w.type==='ACC'?'selected':''}>ACC</option><option ${w.type==='DIST'?'selected':''}>DIST</option></select></div><div class="form-row"><label>Interesse</label><select id="f_interest"><option ${w.interest==='SIM'?'selected':''}>SIM</option><option ${w.interest==='TALVEZ'?'selected':''}>TALVEZ</option><option ${w.interest==='ANALISAR'?'selected':''}>ANALISAR</option></select></div></div>
    <div class="form-row"><label>Notas</label><input id="f_notes" value="${w.notes||''}"></div>
  `,()=>{Object.assign(state.watchlistETFs[i],{ticker:document.getElementById('f_ticker').value.toUpperCase(),isin:document.getElementById('f_isin').value.trim(),name:document.getElementById('f_name').value,type:document.getElementById('f_type').value,interest:document.getElementById('f_interest').value,notes:document.getElementById('f_notes').value})});
}

function deleteWatchlistETF(i){if(confirm('Remover?')){state.watchlistETFs.splice(i,1);saveData();render()}}

// HISTORY CRUD
function addDivReceived(){
  showModal('Registar Dividendo Recebido (€)',`
    <div class="form-grid">
      <div class="form-row"><label>Data</label><input id="f_date" type="date"></div>
      <div class="form-row"><label>Ticker</label><input id="f_ticker"></div>
      <div class="form-row"><label>Nº Ações</label><input id="f_shares" type="number" step="0.0001"></div>
      <div class="form-row"><label>Bruto (€)</label><input id="f_gross" type="number" step="0.01"></div>
      <div class="form-row"><label>Imposto (€)</label><input id="f_tax" type="number" step="0.01" value="0"></div>
      <div class="form-row"><label>Líquido (€)</label><input id="f_net" type="number" step="0.01"></div>
    </div>
  `,()=>{if(!state.dividendsReceived)state.dividendsReceived=[];state.dividendsReceived.push({date:document.getElementById('f_date').value,ticker:document.getElementById('f_ticker').value.toUpperCase(),shares:parseFloat(document.getElementById('f_shares').value)||0,grossEUR:parseFloat(document.getElementById('f_gross').value)||0,taxEUR:parseFloat(document.getElementById('f_tax').value)||0,netEUR:parseFloat(document.getElementById('f_net').value)||0})});
}

function deleteDivReceived(i){if(confirm('Remover?')){state.dividendsReceived.splice(i,1);saveData();render()}}

function addDecision(){
  showModal('Registar Compra',`
    <div class="form-grid">
      <div class="form-row"><label>Mês</label><input id="f_month" placeholder="Abr 2026"></div>
      <div class="form-row"><label>Ticker</label><input id="f_ticker"></div>
    </div>
    <div class="form-row"><label>Montante (€)</label><input id="f_amount" type="number" step="0.01"></div>
    <div class="form-row"><label>Razão</label><input id="f_reason" placeholder="Cobrir mês fraco..."></div>
  `,()=>{if(!state.decisions)state.decisions=[];state.decisions.push({month:document.getElementById('f_month').value,ticker:document.getElementById('f_ticker').value.toUpperCase(),amount:parseFloat(document.getElementById('f_amount').value)||0,reason:document.getElementById('f_reason').value})});
}

function deleteDecision(i){if(confirm('Remover?')){state.decisions.splice(i,1);saveData();render()}}

function takeSnapshot(){
  if(!state.portfolioHistory)state.portfolioHistory=[];
  var t=calcTotals();
  state.portfolioHistory.push({date:new Date().toLocaleDateString('pt-PT'),totalInvested:Math.round(t.totalInv*100)/100,totalValue:Math.round(t.totalCur*100)/100});
  saveData();render();showToast('Snapshot guardado!');
}

function deleteSnapshot(i){if(confirm('Remover?')){state.portfolioHistory.splice(i,1);saveData();render()}}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
loadAllAccounts();
fetchFxRate().then(()=>{render();checkAutoRefresh()});