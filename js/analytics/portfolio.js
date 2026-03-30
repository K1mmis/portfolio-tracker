// ══════════════════════════════════════════
// ANALYTICS - Portfolio intelligence  
// ══════════════════════════════════════════
import { getState, getFxRate, getPlan } from '../state.js';
import { MONTHS, MONTHS_FULL } from '../config.js';
import { toEUR, fmt } from '../helpers.js';

export function calcDividendCalendar(){
  return MONTHS.map((name,idx)=>{
    const monthNum=idx+1;let total=0;const details=[];
    getState().stocks.forEach(s=>{
      if(s.months&&s.months.includes(monthNum)){
        const amt=toEUR(s.volume*s.divPerShare,s.currency);
        total+=amt;
        details.push({ticker:s.ticker,name:s.name,amount:amt});
      }
    });
    return{month:name,monthFull:MONTHS_FULL[idx],monthNum,total,details,count:details.length};
  });
}

export function calcTotals(){
  const si=getState().stocks.reduce((a,s)=>a+toEUR(s.volume*s.buyPrice,s.currency),0);
  const sc=getState().stocks.reduce((a,s)=>a+toEUR(s.volume*s.currentPrice,s.currency),0);
  const ei=getState().etfs.reduce((a,e)=>a+e.invested,0);
  const ec=getState().etfs.reduce((a,e)=>a+e.current,0);
  return{stocksInv:si,stocksCur:sc,etfsInv:ei,etfsCur:ec,totalInv:si+ei,totalCur:sc+ec};
}

export export function calcPortfolioScore(){
  var score=50;var reasons=[];
  var t=calcTotals();
  if(t.totalCur<=0)return{score:0,reasons:['Portfolio vazio']};

  // Diversification (max 20 pts)
  var sectors={};
  getState().stocks.forEach(function(s){var sec=s.sector||'Other';if(!sectors[sec])sectors[sec]=0;sectors[sec]+=toEUR(s.volume*s.currentPrice,s.currency)});
  var sectorCount=Object.keys(sectors).length;
  var maxConcentration=0;
  Object.values(sectors).forEach(function(v){var pct=v/t.stocksCur*100;if(pct>maxConcentration)maxConcentration=pct});
  if(sectorCount>=5){score+=10;reasons.push({good:true,text:'Boa diversificação ('+sectorCount+' setores)'})}
  else if(sectorCount>=3){score+=5;reasons.push({good:null,text:sectorCount+' setores — podia diversificar mais'})}
  else{score-=5;reasons.push({good:false,text:'Pouca diversificação ('+sectorCount+' setores)'})}
  if(maxConcentration>50){score-=10;reasons.push({good:false,text:'Concentração alta: 1 setor com '+maxConcentration.toFixed(0)+'%'})}
  else if(maxConcentration<30){score+=5;reasons.push({good:true,text:'Sem concentração excessiva'})}

  // Dividend coverage (max 15 pts)
  var cal=calcDividendCalendar();
  var weakMonths=cal.filter(function(m){return m.count<=1}).length;
  var strongMonths=cal.filter(function(m){return m.count>=4}).length;
  if(weakMonths===0){score+=10;reasons.push({good:true,text:'Todos os meses com dividendos'})}
  else if(weakMonths<=3){score+=5;reasons.push({good:null,text:weakMonths+' meses fracos em dividendos'})}
  else{score-=5;reasons.push({good:false,text:weakMonths+' meses fracos — equilibrar calendário'})}

  // Yield quality (max 15 pts)
  var avgYield=getState().stocks.length>0?getState().stocks.reduce(function(a,s){return a+s.divYield},0)/getState().stocks.length:0;
  if(avgYield>=4){score+=10;reasons.push({good:true,text:'Yield médio atrativo: '+avgYield.toFixed(1)+'%'})}
  else if(avgYield>=2.5){score+=5;reasons.push({good:null,text:'Yield médio ok: '+avgYield.toFixed(1)+'%'})}
  else{reasons.push({good:false,text:'Yield médio baixo: '+avgYield.toFixed(1)+'%'})}

  // P&L (max 10 pts)
  var plPct=t.totalInv>0?((t.totalCur-t.totalInv)/t.totalInv*100):0;
  if(plPct>5){score+=10;reasons.push({good:true,text:'Portfolio em lucro: +'+plPct.toFixed(1)+'%'})}
  else if(plPct>0){score+=5;reasons.push({good:null,text:'Ligeiramente positivo: +'+plPct.toFixed(1)+'%'})}
  else if(plPct>-5){reasons.push({good:null,text:'Ligeiramente negativo: '+plPct.toFixed(1)+'%'})}
  else{score-=5;reasons.push({good:false,text:'Portfolio em perda: '+plPct.toFixed(1)+'%'})}

  // ETF coverage
  if(getState().etfs.length>=5){score+=5;reasons.push({good:true,text:getState().etfs.length+' ETFs em carteira'})}

  // Number of stocks
  if(getState().stocks.length>=7){score+=5}
  else if(getState().stocks.length<3){score-=5;reasons.push({good:false,text:'Poucas ações ('+getState().stocks.length+')'})}

  score=Math.max(0,Math.min(100,score));
  return{score:score,reasons:reasons};
}

export function generateInsights(){
  var insights=[];
  var t=calcTotals();
  var cal=calcDividendCalendar();

  // Sector concentration
  var sectors={};
  getState().stocks.forEach(function(s){var sec=s.sector||'Other';if(!sectors[sec])sectors[sec]=0;sectors[sec]+=toEUR(s.volume*s.currentPrice,s.currency)});
  var topSector=null,topPct=0;
  Object.entries(sectors).forEach(function(kv){var pct=t.stocksCur>0?(kv[1]/t.stocksCur*100):0;if(pct>topPct){topPct=pct;topSector=kv[0]}});
  if(topPct>45){
    insights.push({icon:'⚠️',bg:'rgba(245,158,11,.1)',border:'rgba(245,158,11,.3)',title:'Sobre-exposição a '+topSector,desc:topPct.toFixed(0)+'% do portfolio em '+topSector+'. Considera diversificar para reduzir risco.',action:'Ver alocação',color:'var(--yellow)'});
  }

  // Weak dividend months
  var weakMs=cal.filter(function(m){return m.count<=1});
  if(weakMs.length>0){
    var names=weakMs.map(function(m){return m.monthFull}).join(', ');
    insights.push({icon:'📅',bg:'rgba(239,68,68,.1)',border:'rgba(239,68,68,.3)',title:'Meses fracos em dividendos',desc:names+'. Procura ações que paguem nestes meses (ex: AbbVie, Main Street Capital).',action:'Ver calendário',color:'var(--red)'});
  }

  // Dividend goal progress
  var goal=getState().divGoal||{annual:600};
  var totalEst=cal.reduce(function(a,b){return a+b.total},0);
  var goalPct=goal.annual>0?(totalEst/goal.annual*100):0;
  if(goalPct<50){
    insights.push({icon:'🎯',bg:'rgba(139,92,246,.1)',border:'rgba(139,92,246,.3)',title:'Meta de dividendos a '+goalPct.toFixed(0)+'%',desc:'Precisas de '+fmt(goal.annual-totalEst)+' mais em dividendos anuais para atingir a meta.',action:'Editar meta',color:'var(--purple)'});
  }else if(goalPct>=100){
    insights.push({icon:'🎉',bg:'rgba(16,185,129,.1)',border:'rgba(16,185,129,.3)',title:'Meta de dividendos atingida!',desc:'Parabéns! Dividendos estimados: '+fmt(totalEst)+' vs meta: '+fmt(goal.annual),color:'var(--green)'});
  }

  // Stocks with high loss
  getState().stocks.forEach(function(s){
    var plPct=s.buyPrice>0?((s.currentPrice-s.buyPrice)/s.buyPrice*100):0;
    if(plPct<-15){
      insights.push({icon:'📉',bg:'rgba(239,68,68,.1)',border:'rgba(239,68,68,.3)',title:s.ticker+' em queda de '+plPct.toFixed(1)+'%',desc:'Considera se vale manter ou se o dividendo compensa a perda. Yield: '+s.divYield+'%',action:'Analisar '+s.ticker,color:'var(--red)'});
    }
  });

  // Unused capital opportunity
  var unused=getState().unusedCapital||0;
  if(unused>100){
    insights.push({icon:'💰',bg:'rgba(59,130,246,.1)',border:'rgba(59,130,246,.3)',title:fmt(unused)+' de capital parado',desc:'Tens capital não investido. Verifica o calendário para oportunidades de compra este mês.',color:'var(--accent)'});
  }

  // Backup reminder
  var lastBackup=localStorage.getItem('last_backup_date');
  if(lastBackup){
    var days=(Date.now()-parseInt(lastBackup))/(1000*60*60*24);
    if(days>14){
      insights.push({icon:'💾',bg:'rgba(245,158,11,.1)',border:'rgba(245,158,11,.3)',title:'Backup há '+Math.floor(days)+' dias',desc:'Exporta um backup JSON para não perderes dados.',color:'var(--yellow)'});
    }
  }

  return insights;
}

export function generateNextMove(){
  var cal=calcDividendCalendar();
  var curMonth=new Date().getMonth();
  var t=calcTotals();
  var moves=[];

  // Check which months are weak next
  for(var i=1;i<=3;i++){
    var m=(curMonth+i)%12;
    if(cal[m].count<=2){
      moves.push('Mês de '+cal[m].monthFull+' é fraco em dividendos ('+cal[m].count+' ações). Procura ações que paguem nesse mês.');
      break;
    }
  }

  // Check diversification
  var sectors={};
  getState().stocks.forEach(function(s){sectors[s.sector||'Other']=(sectors[s.sector||'Other']||0)+1});
  if(Object.keys(sectors).length<4)moves.push('Diversifica: tens poucos setores. Considera Healthcare (JNJ, ABBV) ou Consumer (KO, PEP).');

  // Check if should rebalance ETFs
  getState().etfs.forEach(function(e){
    var plan=getPlan(e.planId);
    var pl=((e.current-e.invested)/e.invested*100);
    if(pl<-10)moves.push('ETF '+e.ticker+' em queda de '+pl.toFixed(0)+'%. Oportunidade de reforço?');
  });

  // Default
  if(moves.length===0)moves.push('Portfolio equilibrado. Continua a contribuir regularmente e faz snapshot mensal.');

  return moves;
}

export function calcPortfolioBreakdown(){
  var t=calcTotals();
  var sectors={},regions={},assets={};

  // Sector breakdown
  getState().stocks.forEach(function(s){
    var sec=s.sector||'Other';
    if(!sectors[sec])sectors[sec]={value:0,tickers:[]};
    sectors[sec].value+=toEUR(s.volume*s.currentPrice,s.currency);
    sectors[sec].tickers.push(s.ticker);
  });

  // Asset type breakdown
  assets['Ações']={value:t.stocksCur,color:'var(--accent)'};
  assets['ETFs']={value:t.etfsCur,color:'var(--green)'};
  var unused=getState().unusedCapital||0;
  if(unused>0)assets['Liquidez']={value:unused,color:'var(--yellow)'};

  return{sectors:sectors,assets:assets,total:t.totalCur+unused};
}
