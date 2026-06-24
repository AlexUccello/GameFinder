const BASE = 'https://www.cheapshark.com';
const FAV_KEY = 'gf_favorites';

// ── FAVORITES ─────────────────────────────────────────────────────────────────

function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}

function saveFavs(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

function isFav(id) {
  return getFavs().some(f => f.gameID === id);
}

function toggleFav(game) {
  const favs = getFavs();
  const idx  = favs.findIndex(f => f.gameID === game.gameID);
  if (idx === -1) favs.push(game);
  else favs.splice(idx, 1);
  saveFavs(favs);
  const btn = document.querySelector(`.fav-btn[data-id="${game.gameID}"]`);
  if (btn) btn.classList.toggle('active', isFav(game.gameID));
}

function removeFav(id) {

    var listafavoriti = getFavs();

    // var list = [];
    // listafavoriti.forEach(element => {
    //     if(element.gameID !== String(id) ){
    //         list.push(element);
    //     }
    // });



    var listamenoid = listafavoriti.filter(f => f.gameID !== id.toString());
    saveFavs(listamenoid);

    //saveFavs(getFavs().filter(f => f.gameID !== id));




  // se siamo nella pagina preferiti, ricarica la lista
  if (typeof renderFavsPage === 'function') renderFavsPage();
  // se siamo in index, aggiorna il bottone
  const btn = document.querySelector(`.fav-btn[data-id="${id}"]`);
  if (btn) btn.classList.remove('active');
}

// ── SEARCH (index.html) ───────────────────────────────────────────────────────

async function cerca() {
  const input   = document.getElementById('searchInput').value.trim();
  const results = document.getElementById('results');
  const loader  = document.getElementById('loader');

  if (!input) { results.innerHTML = ''; return; }

  loader.style.display = 'block';
  results.innerHTML = '';

  try {
    const res  = await fetch(`${BASE}/api/1.0/games?title=${encodeURIComponent(input)}`);
    const data = await res.json();

    if (!data.length) {
      results.innerHTML = `<div class="notfound">Nessun gioco trovato per "${input}".</div>`;
      return;
    }

    results.innerHTML = data.map(game => `
      <div class="game">
        <img class="thumb" src="${game.thumb}" alt="${game.external}">
        <div class="game-info">
          <a class="title"
             href="${BASE}/redirect?dealID=${game.cheapestDealID}"
             target="_blank" rel="noopener"
             title="${game.external}">${game.external}</a>
          <p class="price">da $${game.cheapest}</p>
        </div>
        <div class="game-actions">
          <button class="fav-btn ${isFav(game.gameID) ? 'active' : ''}"
                  data-id="${game.gameID}"
                  onclick='toggleFav(${JSON.stringify(game)})'
                  title="Aggiungi ai preferiti">&#9829;</button>
          <button class="popup" onclick="clickGioco(${game.gameID})">Dettagli</button>
        </div>
      </div>
    `).join('');

  } catch (e) {
    console.error(e);
    results.innerHTML = `<div class="notfound">Errore durante la ricerca. Riprova.</div>`;
  } finally {
    loader.style.display = 'none';
  }
}

function clickGioco(id) {
  window.open(`dettagli.html?id=${id}`, '_blank');
}

// ── PREFERITI PAGE (preferiti.html) ──────────────────────────────────────────

function renderFavsPage() {
  const container = document.getElementById('favs-container');
  if (!container) return;

  const favs = getFavs();

  if (!favs.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">&#9829;</div>
        <p>Nessun preferito salvato.<br>
           <a href="index.html">Cerca un gioco</a> e clicca &#9829; per salvarlo.</p>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="favs-grid">${
    favs.map(g => `
      <div class="fav-card">
        <img class="fav-thumb" src="${g.thumb}" alt="${g.external}">
        <div class="fav-info">
          <span class="fav-title" title="${g.external}">${g.external}</span>
          <span class="fav-price">da $${g.cheapest}</span>
        </div>
        <div class="fav-actions">
          <button class="popup" onclick="clickGioco(${g.gameID})">Dettagli</button>
          <button class="fav-remove" onclick="removeFav(${g.gameID})" title="Rimuovi">&#10005;</button>
        </div>
      </div>
    `).join('')
  }</div>`;
}

// ── DETTAGLI PAGE ─────────────────────────────────────────────────────────────

async function initDettagli() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return showDettagliError('ID gioco mancante nell\'URL.');

  try {
    const [gameRes, storesRes] = await Promise.all([
      fetch(`${BASE}/api/1.0/games?id=${id}`),
      fetch(`${BASE}/api/1.0/stores`)
    ]);
    if (!gameRes.ok || !storesRes.ok) throw new Error('Errore API');

    const game   = await gameRes.json();
    const stores = await storesRes.json();

    if (!game || !game.info) return showDettagliError('Gioco non trovato.');
    renderDettagli(game, stores);
  } catch (e) {
    showDettagliError('Impossibile caricare i dati. Riprova più tardi.');
    console.error(e);
  }
}

function renderDettagli(game, stores) {
  const storeMap = {};
  stores.forEach(s => { storeMap[s.storeID] = s; });

  document.getElementById('game-title').textContent = game.info.title;
  const thumb = document.getElementById('game-thumb');
  thumb.src = game.info.thumb;
  thumb.alt = game.info.title;

  const bestPrice = game.cheapestPriceEver?.price ?? '—';
  const bestDate  = game.cheapestPriceEver?.date
    ? new Date(game.cheapestPriceEver.date * 1000).toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';
  const dealCount = game.deals?.length ?? 0;
  const lowestNow = dealCount > 0
    ? Math.min(...game.deals.map(d => parseFloat(d.price))).toFixed(2)
    : null;

  document.getElementById('stats-row').innerHTML = `
    ${lowestNow !== null ? `
    <div class="stat">
      <div class="stat-label">Prezzo attuale</div>
      <div class="stat-value price">$${lowestNow}</div>
    </div>` : ''}
    <div class="stat">
      <div class="stat-label">Minimo storico</div>
      <div class="stat-value price">$${bestPrice}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Raggiunto il</div>
      <div class="stat-value small">${bestDate}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Store disponibili</div>
      <div class="stat-value">${dealCount}</div>
    </div>
  `;

  if (dealCount > 0) {
    const sorted = [...game.deals].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    document.getElementById('deals-grid').innerHTML = sorted.map(deal => {
      const store   = storeMap[deal.storeID];
      const name    = store?.storeName ?? `Store #${deal.storeID}`;
      const iconUrl = store?.images?.icon ? `${BASE}${store.images.icon}` : '';
      const savings = parseFloat(deal.savings).toFixed(0);
      const retail  = parseFloat(deal.retailPrice).toFixed(2);
      const sale    = parseFloat(deal.price).toFixed(2);
      const isFree  = sale === '0.00';
      return `
        <div class="deal-card">
          <div class="deal-store">
            ${iconUrl ? `<img class="store-icon" src="${iconUrl}" alt="${name}">` : ''}
            <span class="store-name">${name}</span>
          </div>
          <div class="deal-prices">
            <span class="deal-sale">${isFree ? 'GRATIS' : '$' + sale}</span>
            ${retail !== sale && !isFree ? `<span class="deal-retail">$${retail}</span>` : ''}
          </div>
          <div class="deal-footer">
            <span class="savings-badge">-${savings}%</span>
            <a class="deal-link" href="${BASE}/redirect?dealID=${deal.dealID}" target="_blank" rel="noopener">
              Vai all'offerta →
            </a>
          </div>
        </div>`;
    }).join('');
    document.getElementById('deals-section').style.display = 'block';
  }

  document.getElementById('loader-wrap').style.display = 'none';
  document.getElementById('hero').style.display = 'block';
}

function showDettagliError(msg) {
  document.getElementById('loader-wrap').style.display = 'none';
  const box = document.getElementById('error-box');
  box.style.display = 'block';
  document.getElementById('error-msg').textContent = msg;
}

// ── INIT ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // search page
  const input = document.getElementById('searchInput');
  if (input) input.addEventListener('keyup', e => { if (e.key === 'Enter') cerca(); });

  // preferiti page
  renderFavsPage();

  // dettagli page
  if (document.getElementById('loader-wrap')) initDettagli();
});
