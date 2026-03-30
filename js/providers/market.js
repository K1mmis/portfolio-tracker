// ══════════════════════════════════════════
// PROVIDER - Market data (Yahoo Finance)
// ══════════════════════════════════════════

export async function robustYahooFetch(ticker, range, interval) {
  var params = 'range=' + range + '&interval=' + (interval || '1d');
  var proxies = ['https://corsproxy.io/?url=', 'https://api.allorigins.win/raw?url='];
  for(var proxy of proxies) {
    try {
      var r = await fetch(proxy + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/' + ticker + '?' + params));
      if(!r.ok) continue;
      var d = await r.json();
      if(d.chart?.result?.[0]) return d;
    } catch(e) { continue; }
  }
  if(ticker.indexOf('.') === -1) {
    var suffixes = ['.DE','.L','.AS','.MI','.PA','.MC','.SW','.CO'];
    for(var suf of suffixes) {
      for(var proxy of proxies) {
        try {
          var r = await fetch(proxy + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/' + ticker + suf + '?' + params));
          if(!r.ok) continue;
          var d = await r.json();
          if(d.chart?.result?.[0]) { console.log('Found ' + ticker + ' as ' + ticker + suf); return d; }
        } catch(e) { continue; }
      }
    }
  }
  return null;
}

export async function fetchStockPrice(ticker) {
  try {
    var d = await robustYahooFetch(ticker, '1d', '1d');
    if(d) {
      var meta = d.chart?.result?.[0]?.meta;
      if(meta && meta.regularMarketPrice) {
        return { price: meta.regularMarketPrice, currency: meta.currency || 'USD' };
      }
    }
  } catch(e) {}
  try {
    var cached = JSON.parse(localStorage.getItem('cached_prices') || '{}');
    if(cached.prices && cached.prices[ticker]) {
      var cp = cached.prices[ticker];
      if(typeof cp === 'object') return { price: cp.price, currency: cp.currency || 'USD', cached: true };
      return { price: cp, currency: 'USD', cached: true };
    }
  } catch(e) {}
  return null;
}

export async function fetchTickerData(ticker) {
  try {
    var d = await robustYahooFetch(ticker, '5d', '1d');
    if(!d) return null;
    var meta = d.chart?.result?.[0]?.meta;
    if(!meta) return null;
    return { price: meta.regularMarketPrice, currency: meta.currency || 'USD', name: meta.shortName || meta.longName || '', exchange: meta.exchangeName || '' };
  } catch(e) { return null; }
}
