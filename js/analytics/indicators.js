// ══════════════════════════════════════════
// ANALYTICS - Technical indicators
// ══════════════════════════════════════════

export function calcMA(closes,period){
  var result=[];
  for(var i=0;i<closes.length;i++){
    if(i<period-1||closes[i]==null){result.push(null);continue}
    var sum=0,count=0;
    for(var j=i-period+1;j<=i;j++){if(closes[j]!=null){sum+=closes[j];count++}}
    result.push(count>0?sum/count:null);
  }
  return result;
}

export function calcRSI(closes,period){
  period=period||14;
  var result=[];var gains=[];var losses=[];
  for(var i=0;i<closes.length;i++){
    if(i===0||closes[i]==null||closes[i-1]==null){result.push(null);continue}
    var change=closes[i]-closes[i-1];
    gains.push(change>0?change:0);
    losses.push(change<0?-change:0);
    if(gains.length<period){result.push(null);continue}
    if(gains.length===period){
      var avgGain=gains.reduce(function(a,b){return a+b},0)/period;
      var avgLoss=losses.reduce(function(a,b){return a+b},0)/period;
    }else{
      var avgGain=(avgGain*(period-1)+gains[gains.length-1])/period;
      var avgLoss=(avgLoss*(period-1)+losses[losses.length-1])/period;
    }
    var rs=avgLoss===0?100:avgGain/avgLoss;
    result.push(100-100/(1+rs));
  }
  return result;
}

export function calcMACD(closes,fast,slow,signal){
  fast=fast||12;slow=slow||26;signal=signal||9;
  var emaFast=calcEMA(closes,fast);
  var emaSlow=calcEMA(closes,slow);
  var macdLine=[];
  for(var i=0;i<closes.length;i++){
    if(emaFast[i]!=null&&emaSlow[i]!=null)macdLine.push(emaFast[i]-emaSlow[i]);
    else macdLine.push(null);
  }
  var signalLine=calcEMA(macdLine,signal);
  var histogram=[];
  for(var i=0;i<macdLine.length;i++){
    if(macdLine[i]!=null&&signalLine[i]!=null)histogram.push(macdLine[i]-signalLine[i]);
    else histogram.push(null);
  }
  return{macd:macdLine,signal:signalLine,histogram:histogram};
}

export function calcEMA(data,period){
  var result=[];var multiplier=2/(period+1);var ema=null;
  for(var i=0;i<data.length;i++){
    if(data[i]==null){result.push(ema);continue}
    if(ema===null){
      // Use SMA for first value
      var sum=0,count=0;
      for(var j=Math.max(0,i-period+1);j<=i;j++){if(data[j]!=null){sum+=data[j];count++}}
      if(count>=period){ema=sum/count}
      result.push(ema);
    }else{
      ema=(data[i]-ema)*multiplier+ema;
      result.push(ema);
    }
  }
  return result;
}

export function calcATR(highs,lows,closes,period){
  period=period||14;
  var trs=[];var result=[];
  for(var i=0;i<closes.length;i++){
    if(i===0||highs[i]==null||lows[i]==null||closes[i-1]==null){result.push(null);trs.push(0);continue}
    var tr=Math.max(highs[i]-lows[i],Math.abs(highs[i]-closes[i-1]),Math.abs(lows[i]-closes[i-1]));
    trs.push(tr);
    if(trs.length<period+1){result.push(null);continue}
    var sum=0;for(var j=trs.length-period;j<trs.length;j++)sum+=trs[j];
    result.push(sum/period);
  }
  return result;
}

export function getTickerNotes(tickerNotes, ticker){
  var notes=tickerNotes||{};
  return notes[ticker]||{text:'',target:null,reinforcement:null,stop:null};
}

// Note: saveTickerNotes is in app.js (needs state write access)

export function calcSignals(ticker,closes,highs,lows,stocks){
  if(!closes||closes.length<50)return[];
  var signals=[];
  var price=closes[closes.length-1];
  var ma20=calcMA(closes,20);var ma50=calcMA(closes,50);var ma200=calcMA(closes,200);
  var rsi=calcRSI(closes,14);
  var atr=calcATR(highs||closes,lows||closes,closes,14);
  var valid=closes.filter(function(v){return v!=null});
  var high52=Math.max.apply(null,valid);
  var low52=Math.min.apply(null,valid);
  var lastRSI=null;for(var i=rsi.length-1;i>=0;i--){if(rsi[i]!=null){lastRSI=rsi[i];break}}
  var lastMA50=null;for(var i=ma50.length-1;i>=0;i--){if(ma50[i]!=null){lastMA50=ma50[i];break}}
  var lastMA200=null;for(var i=ma200.length-1;i>=0;i--){if(ma200[i]!=null){lastMA200=ma200[i];break}}
  var lastATR=null;for(var i=atr.length-1;i>=0;i--){if(atr[i]!=null){lastATR=atr[i];break}}

  // RSI signals
  if(lastRSI!=null){
    if(lastRSI<30)signals.push({type:'green',text:'RSI baixo ('+lastRSI.toFixed(0)+')'});
    else if(lastRSI>70)signals.push({type:'red',text:'RSI alto ('+lastRSI.toFixed(0)+')'});
  }
  // MA200 proximity
  if(lastMA200!=null&&price){
    var distMA200=((price-lastMA200)/lastMA200)*100;
    if(Math.abs(distMA200)<3)signals.push({type:'blue',text:'Perto da MA200'});
    if(price>lastMA200&&lastMA50&&lastMA50>lastMA200)signals.push({type:'green',text:'Acima MA50+MA200'});
    if(price<lastMA200)signals.push({type:'red',text:'Abaixo da MA200'});
  }
  // 52w proximity
  if(high52&&low52&&price){
    var distLow=((price-low52)/low52)*100;
    var distHigh=((price-high52)/high52)*100;
    if(distLow<10)signals.push({type:'green',text:'Perto mín 52s ('+distLow.toFixed(0)+'%)'});
    if(Math.abs(distHigh)<5)signals.push({type:'yellow',text:'Perto máx 52s'});
  }
  // Yield
  var stock=(stocks||[]).find(function(s){return s.ticker===ticker});
  if(stock&&stock.divYield>=5)signals.push({type:'green',text:'Yield >5% ('+stock.divYield+'%)'});
  // ATR
  if(lastATR!=null&&price){
    var atrPct=(lastATR/price)*100;
    if(atrPct>3)signals.push({type:'yellow',text:'Vol. alta (ATR '+atrPct.toFixed(1)+'%)'});
  }
  return signals;
}

export function interpretStock(closes,highs,lows){
  if(!closes||closes.length<50)return null;
  var price=closes[closes.length-1];
  var ma50=calcMA(closes,50);var ma200=calcMA(closes,200);
  var rsi=calcRSI(closes,14);
  var macdData=calcMACD(closes);
  var atr=calcATR(highs||closes,lows||closes,closes,14);
  var lastMA50=null,lastMA200=null,lastRSI=null,lastMACD=null,lastATR=null;
  for(var i=ma50.length-1;i>=0;i--){if(ma50[i]!=null){lastMA50=ma50[i];break}}
  for(var i=ma200.length-1;i>=0;i--){if(ma200[i]!=null){lastMA200=ma200[i];break}}
  for(var i=rsi.length-1;i>=0;i--){if(rsi[i]!=null){lastRSI=rsi[i];break}}
  for(var i=macdData.histogram.length-1;i>=0;i--){if(macdData.histogram[i]!=null){lastMACD=macdData.histogram[i];break}}
  for(var i=atr.length-1;i>=0;i--){if(atr[i]!=null){lastATR=atr[i];break}}

  var trend='Neutra',trendColor='var(--yellow)';
  if(lastMA50&&lastMA200){
    if(price>lastMA50&&lastMA50>lastMA200){trend='Bullish';trendColor='var(--green)'}
    else if(price<lastMA50&&lastMA50<lastMA200){trend='Bearish';trendColor='var(--red)'}
    else if(price>lastMA200){trend='Ligeiramente bullish';trendColor='var(--green)'}
    else{trend='Ligeiramente bearish';trendColor='var(--red)'}
  }

  var momentum='Neutro',momColor='var(--yellow)';
  if(lastRSI!=null){
    if(lastRSI>60&&lastMACD>0){momentum='Forte';momColor='var(--green)'}
    else if(lastRSI<40&&lastMACD<0){momentum='Fraco';momColor='var(--red)'}
    else if(lastRSI>70){momentum='Sobrecomprado';momColor='var(--red)'}
    else if(lastRSI<30){momentum='Sobrevendido';momColor='var(--green)'}
  }

  var risk='Médio',riskColor='var(--yellow)';
  if(lastATR!=null&&price){
    var atrPct=(lastATR/price)*100;
    if(atrPct<1.5){risk='Baixo';riskColor='var(--green)'}
    else if(atrPct>3){risk='Alto';riskColor='var(--red)'}
  }

  var valid=closes.filter(function(v){return v!=null});
  var low52=Math.min.apply(null,valid);
  var high52=Math.max.apply(null,valid);
  var distLow=low52>0?((price-low52)/low52)*100:0;
  var distHigh=high52>0?((price-high52)/high52)*100:0;
  var setup='Zona neutra',setupColor='var(--yellow)';
  if(distLow<10){setup='Perto de suporte';setupColor='var(--green)'}
  else if(Math.abs(distHigh)<5){setup='Esticada (perto do máximo)';setupColor='var(--red)'}
  else if(price>lastMA50&&lastRSI<50){setup='Zona de interesse';setupColor='var(--accent)'}

  return{trend:trend,trendColor:trendColor,momentum:momentum,momColor:momColor,risk:risk,riskColor:riskColor,setup:setup,setupColor:setupColor,rsi:lastRSI,atrPct:lastATR&&price?(lastATR/price)*100:null};
}
