// ══════════════════════════════════════════
// PROVIDER - YouTube feeds
// ══════════════════════════════════════════
import { getState } from '../state.js';
import { sanitizeHTML, sanitizeURL } from '../helpers.js';
import { DEFAULT_YT_CHANNELS } from '../config.js';

export async function loadYTFeed() {
  var container = document.getElementById('ytFeedContainer');
  if(!container) return;
  var channels = getState().ytChannels || DEFAULT_YT_CHANNELS;
  var activeChannels = channels.filter(ch => ch.enabled);
  var allVideos = [];
  var sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  for(var ci = 0; ci < activeChannels.length; ci++) {
    var ch = activeChannels[ci];
    var maxVids = (ci < 2) ? 3 : (ci < 4) ? 2 : 1;
    try {
      var rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=' + ch.channelId;
      var r = await fetch(rssUrl);
      if(!r.ok) continue;
      var d = await r.json();
      if(d.items) {
        var count = 0;
        for(var item of d.items) {
          if(count >= maxVids) break;
          var pubDate = item.pubDate ? new Date(item.pubDate) : null;
          if(pubDate && pubDate < sevenDaysAgo) continue;
          var vidId = '';
          if(item.link) { var m = item.link.match(/v=([^&]+)/); if(m) vidId = m[1]; }
          allVideos.push({
            channel: ch.name, priority: ci,
            title: item.title || '', link: item.link || ch.channelUrl,
            thumb: vidId ? 'https://img.youtube.com/vi/' + vidId + '/mqdefault.jpg' : '',
            date: pubDate ? pubDate.toLocaleDateString('pt-PT') : '',
            dateObj: pubDate, vidId: vidId
          });
          count++;
        }
      }
    } catch(e) { console.warn('YT feed error for ' + ch.name, e); }
  }

  allVideos.sort((a, b) => {
    if(a.priority !== b.priority) return a.priority - b.priority;
    return (b.dateObj || 0) - (a.dateObj || 0);
  });

  if(allVideos.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-dim)">Nenhum vídeo nos últimos 7 dias.</div>';
    return;
  }

  container.innerHTML = '<div class="yt-grid">' + allVideos.map(v =>
    '<a href="' + sanitizeURL(v.link) + '" target="_blank" class="yt-card">' +
    '<div class="yt-thumb">' + (v.thumb ? '<img src="' + sanitizeURL(v.thumb) + '" alt="" loading="lazy">' : '<div style="font-size:48px;opacity:.3">▶</div>') + '</div>' +
    '<div class="yt-info"><div class="yt-channel">' + sanitizeHTML(v.channel) + '</div><div class="yt-title">' + sanitizeHTML(v.title) + '</div><div style="font-size:10px;color:var(--text-dim);margin-top:4px">' + v.date + '</div></div></a>'
  ).join('') + '</div>';
}
