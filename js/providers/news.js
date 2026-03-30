// ══════════════════════════════════════════
// PROVIDER - News (RSS feeds)
// ══════════════════════════════════════════
import { getState } from '../state.js';
import { sanitizeHTML, sanitizeURL } from '../helpers.js';
import { DEFAULT_FEED_SOURCES } from '../config.js';

export async function loadNewsFeed() {
  var container = document.getElementById('newsFeedContainer');
  if(!container) return;
  var sources = getState().feedSources || DEFAULT_FEED_SOURCES;
  var activeSources = sources.filter(s => s.enabled && s.rss);
  var allNews = [];

  for(var src of activeSources.slice(0, 5)) {
    try {
      var rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(src.rss);
      var r = await fetch(rssUrl);
      if(!r.ok) continue;
      var d = await r.json();
      if(d.items) {
        d.items.slice(0, 4).forEach(item => {
          var desc = item.description || '';
          desc = desc.replace(/<[^>]*>/g, '').substring(0, 150);
          allNews.push({
            source: src.name, color: src.color,
            title: item.title || '', desc: desc,
            link: item.link || src.url,
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('pt-PT') : '',
            thumb: item.thumbnail || item.enclosure?.link || ''
          });
        });
      }
    } catch(e) { console.warn('RSS error for ' + src.name, e); }
  }

  if(allNews.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-dim)">Não foi possível carregar notícias.</div>';
    return;
  }

  allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = '<div class="feed-grid">' + allNews.map(n =>
    '<a href="' + sanitizeURL(n.link) + '" target="_blank" class="feed-item">' +
    (n.thumb ? '<div style="width:100%;height:140px;border-radius:8px;overflow:hidden;margin-bottom:10px;background:var(--bg)"><img src="' + sanitizeURL(n.thumb) + '" style="width:100%;height:100%;object-fit:cover" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>' : '') +
    '<div class="feed-source" style="color:' + n.color + '">' + sanitizeHTML(n.source) + '</div>' +
    '<div class="feed-title">' + sanitizeHTML(n.title) + '</div>' +
    '<div class="feed-desc">' + sanitizeHTML(n.desc) + '</div>' +
    '<div class="feed-date">' + n.date + '</div></a>'
  ).join('') + '</div>';
}
