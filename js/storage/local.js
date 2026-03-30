// ══════════════════════════════════════════
// STORAGE - Import/Export/CSV
// ══════════════════════════════════════════
import { getAllAccounts, getState, setAllAccounts, normalizeAccountState, getCurrentAccountId, saveData, loadAllAccounts } from '../state.js';
import { sanitizeHTML, showToast, showModal } from '../helpers.js';

export function exportData() {
  localStorage.setItem('last_backup_date', Date.now().toString());
  var reminder = document.getElementById('backupReminder');
  if(reminder) reminder.remove();
  var allAccounts = getAllAccounts();
  var blob = new Blob([JSON.stringify(allAccounts, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'portfolio_backup_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  showToast('Backup exportado!');
}

export function importData(e) {
  var file = e.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var imported = JSON.parse(ev.target.result);
      if(typeof imported !== 'object' || imported === null) throw new Error('Formato inválido');
      var allAccounts = getAllAccounts();
      if(imported._current) {
        var validAccounts = 0;
        Object.keys(imported).forEach(k => {
          if(k === '_current') return;
          if(typeof imported[k] === 'object' && imported[k].name) {
            imported[k] = normalizeAccountState(imported[k]);
            validAccounts++;
          }
        });
        if(validAccounts === 0) throw new Error('Nenhuma conta válida encontrada');
        setAllAccounts(imported);
      } else if(imported.name || imported.stocks) {
        var normalized = normalizeAccountState(imported);
        allAccounts[getCurrentAccountId()] = normalized;
        setAllAccounts(allAccounts);
      } else {
        throw new Error('Formato não reconhecido');
      }
      localStorage.setItem('portfolio_accounts_v3', JSON.stringify(getAllAccounts()));
      showToast('Dados importados! A recarregar...');
      setTimeout(() => location.reload(), 1000);
    } catch(err) {
      alert('Erro ao importar: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

export function importCSVData(e) {
  var file = e.target.files[0];
  if(!file) return;
  var state = getState();
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var text = ev.target.result;
      var lines = text.split('\n').filter(l => l.trim());
      if(lines.length < 2) { showToast('CSV vazio', 'error'); return; }
      var headers = lines[0].split(/[,;\t]/).map(h => h.trim().replace(/"/g, '').toLowerCase());
      var format = 'generic';
      var headerStr = headers.join(',');
      if(headerStr.includes('symbol') && headerStr.includes('open price')) format = 'xtb';
      else if(headerStr.includes('ticker') && headerStr.includes('average price')) format = 'trading212';
      var separator = lines[0].includes(';') ? ';' : (lines[0].includes('\t') ? '\t' : ',');
      var imported = [];

      for(var i = 1; i < lines.length; i++) {
        var cols = lines[i].split(separator).map(c => c.trim().replace(/"/g, ''));
        if(cols.length < 3) continue;
        var row = {};
        headers.forEach((h, j) => { row[h] = cols[j] || ''; });
        var stock = null;
        if(format === 'xtb') {
          stock = { ticker: row['symbol'] || '', name: row['symbol'] || '', volume: parseFloat(row['volume'] || 0), buyPrice: parseFloat(row['open price'] || 0), currentPrice: parseFloat(row['close price'] || row['open price'] || 0), currency: 'EUR', sector: 'Other', divYield: 0, divPerShare: 0, freq: 'Trimestral', months: [] };
        } else if(format === 'trading212') {
          stock = { ticker: row['ticker'] || '', name: row['name'] || row['ticker'] || '', volume: parseFloat(row['shares'] || row['quantity'] || 0), buyPrice: parseFloat(row['average price'] || 0), currentPrice: parseFloat(row['current price'] || row['average price'] || 0), currency: row['currency'] || 'EUR', sector: 'Other', divYield: 0, divPerShare: 0, freq: 'Trimestral', months: [] };
        } else {
          var ticker = row['ticker'] || row['symbol'] || cols[0] || '';
          stock = { ticker: ticker, name: row['name'] || ticker, volume: parseFloat(row['volume'] || row['quantity'] || cols[1] || 0), buyPrice: parseFloat(row['buy price'] || row['price'] || cols[2] || 0), currentPrice: parseFloat(row['current price'] || cols[2] || 0), currency: 'EUR', sector: 'Other', divYield: 0, divPerShare: 0, freq: 'Trimestral', months: [] };
        }
        if(stock && stock.ticker && stock.volume > 0) {
          stock.ticker = stock.ticker.replace(/\.US$/i, '').replace(/\.UK$/i, '').toUpperCase();
          imported.push(stock);
        }
      }

      if(imported.length === 0) { showToast('Nenhuma posição válida', 'error'); return; }
      var preview = imported.slice(0, 5).map(s => s.ticker + ' (' + s.volume.toFixed(2) + ')').join(', ');

      showModal('Importar ' + imported.length + ' posições (' + format + ')',
        '<div style="font-size:12px;margin-bottom:16px">Posições: ' + sanitizeHTML(preview) + '</div>' +
        '<div class="form-row"><label>Modo</label><select id="f_csv_mode"><option value="add">Adicionar</option><option value="replace">Substituir tudo</option></select></div>',
        function() {
          if(document.getElementById('f_csv_mode').value === 'replace') state.stocks = [];
          imported.forEach(s => {
            var existing = state.stocks.find(ex => ex.ticker === s.ticker);
            if(existing) { existing.volume = s.volume; existing.buyPrice = s.buyPrice; existing.currentPrice = s.currentPrice; }
            else state.stocks.push(s);
          });
          saveData();
          showToast(imported.length + ' posições importadas!');
        }
      );
    } catch(err) { showToast('Erro CSV: ' + err.message, 'error'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}
