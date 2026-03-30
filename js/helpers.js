// helpers.js - Pure utility functions (stateless)

export function toEUR(value, currency, fxRate) {
  if(currency === 'EUR') return value;
  return value * fxRate;
}

export function fmt(v) {
  return new Intl.NumberFormat('pt-PT', {style:'currency', currency:'EUR'}).format(v);
}

export function sanitizeHTML(str) {
  if(!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

export function sanitizeURL(url) {
  if(!url) return '#';
  var s = String(url).trim();
  if(s.startsWith('http://') || s.startsWith('https://')) return s;
  return '#';
}
