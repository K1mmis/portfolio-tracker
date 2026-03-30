// ══════════════════════════════════════════
// CHARTS - Factory and lifecycle
// ══════════════════════════════════════════
import { getCharts, setCharts } from '../state.js';

export function destroyCharts() {
  var charts = getCharts();
  Object.entries(charts).forEach(function(kv) {
    var v = kv[1];
    try {
      if(!v) return;
      if(typeof v.remove === 'function') v.remove();
      else if(typeof v.destroy === 'function') v.destroy();
      else if(typeof v.disconnect === 'function') v.disconnect();
      else if(typeof v === 'object') {
        if(v.chart && typeof v.chart.remove === 'function') v.chart.remove();
        if(v.resize && typeof v.resize.disconnect === 'function') v.resize.disconnect();
        if(v.chart && typeof v.chart.destroy === 'function') v.chart.destroy();
      }
    } catch(e) {}
  });
  setCharts({});
}

export function storeChart(key, chart) {
  var charts = getCharts();
  // Cleanup existing if any
  if(charts[key]) {
    try {
      if(typeof charts[key].remove === 'function') charts[key].remove();
      else if(typeof charts[key].destroy === 'function') charts[key].destroy();
      else if(typeof charts[key].disconnect === 'function') charts[key].disconnect();
    } catch(e) {}
  }
  charts[key] = chart;
  setCharts(charts);
}

export function getChartDefaults() {
  return {
    lwLayout: {
      background: { type: 'solid', color: '#0a0f1a' },
      textColor: '#94a3b8',
      fontSize: 11
    },
    lwGrid: {
      vertLines: { color: '#1e293b' },
      horzLines: { color: '#1e293b' }
    },
    cjDefaults: function() {
      Chart.defaults.color = '#94a3b8';
      Chart.defaults.borderColor = '#1e293b';
      Chart.defaults.font.family = "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
    }
  };
}
