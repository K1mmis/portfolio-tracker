// ══════════════════════════════════════════
// PROVIDER - Foreign exchange rates
// ══════════════════════════════════════════
import { setFxRate, getFxRate } from '../state.js';

export async function fetchFxRate() {
  try {
    const r = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const d = await r.json();
    var rate = d.rates.EUR || 0.92;
    setFxRate(rate);
    localStorage.setItem('cached_fx_rate', JSON.stringify({ rate, time: Date.now() }));
    document.getElementById('fxRate').textContent = '1 USD = ' + rate.toFixed(4) + ' EUR';
    return rate;
  } catch(e) {
    console.warn('FX fetch failed, trying cache', e);
    try {
      var cached = JSON.parse(localStorage.getItem('cached_fx_rate') || '{}');
      if(cached.rate) setFxRate(cached.rate);
    } catch(x) {}
    document.getElementById('fxRate').textContent = '1 USD = ' + getFxRate().toFixed(4) + ' EUR (cache)';
    return getFxRate();
  }
}
