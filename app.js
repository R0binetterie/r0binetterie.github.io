/* ================================================================
   app.js — Torn Travel Optimizer
   ================================================================ */

let stockData         = null;
let priceData         = {};
let excludedCountries = new Set();
let recomputeTimer    = null;
let departMode        = 'now';
let departCustomTime  = null;

/* ── Init ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildCountryFilters();
  updateCapacity();
  updateFlightLabel();
  setDepartNow();

  const savedKey = sessionStorage.getItem('tornKey');
  if (savedKey) {
    document.getElementById('apiKey').value = savedKey;
    document.getElementById('keyStatus').textContent = '✓ enregistrée';
  }

  /* Charger le cache YATA depuis localStorage */
  const cached = localStorage.getItem('yataCache');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const ageMin = (Date.now() / 1000 - parsed.timestamp) / 60;
      stockData = parsed;
      document.getElementById('lastFetchInfo').textContent =
        'Cache YATA (' + Math.round(ageMin) + ' min)';
      setBanner('info', '📦 Données YATA en cache (' + Math.round(ageMin) + ' min). Clique "Actualiser YATA" pour rafraîchir.');
      compute();
    } catch(e) { localStorage.removeItem('yataCache'); }
  }
});

/* ── Heure de départ ───────────────────────────────────────────── */
function setDepartNow() {
  departMode = 'now';
  departCustomTime = null;
  document.getElementById('btnNow').classList.add('active');
  document.getElementById('departTime').value = '';
  scheduleRecompute();
}

function setDepartCustom() {
  const val = document.getElementById('departTime').value;
  if (!val) return;
  departMode = 'custom';
  departCustomTime = val;
  document.getElementById('btnNow').classList.remove('active');
  scheduleRecompute();
}

function getDepartTimestamp() {
  if (departMode === 'now') return Date.now() / 1000;
  const [h, m] = departCustomTime.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d.getTime() / 1000;
}

function fmtHour(ts) {
  const d = new Date(ts * 1000);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

/* ── Slider longueur de vol ────────────────────────────────────── */
function updateFlightLabel() {
  const v   = parseInt(document.getElementById('minFlightTime').value);
  const lbl  = document.getElementById('minFlightLabel');
  const hint = document.getElementById('minFlightHint');
  if (v === 0) {
    lbl.textContent  = 'Tous';
    hint.textContent = 'Toutes les destinations incluses.';
  } else {
    const h   = Math.floor(v / 60);
    const m   = v % 60;
    const str = h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`;
    lbl.textContent = str + ' min';
    const dest = COUNTRIES.filter(c => c.timeMin.airstrip >= v);
    hint.textContent = `${dest.length} destination${dest.length > 1 ? 's' : ''} retenue${dest.length > 1 ? 's' : ''}.`;
  }
}

/* ── Clé API ───────────────────────────────────────────────────── */
function saveKey() {
  const k = document.getElementById('apiKey').value.trim();
  if (!k) return;
  sessionStorage.setItem('tornKey', k);
  document.getElementById('keyStatus').textContent = '✓ enregistrée';
}

/* ── Filtres pays ──────────────────────────────────────────────── */
function buildCountryFilters() {
  const container = document.getElementById('countryFilters');
  COUNTRIES.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'country-btn';
    btn.textContent = c.flag + ' ' + c.name.split(' ')[0];
    btn.dataset.code = c.code;
    btn.onclick = () => {
      if (excludedCountries.has(c.code)) {
        excludedCountries.delete(c.code);
        btn.classList.remove('excluded');
      } else {
        excludedCountries.add(c.code);
        btn.classList.add('excluded');
      }
      scheduleRecompute();
    };
    container.appendChild(btn);
  });
}

/* ── Capacité ──────────────────────────────────────────────────── */
function getBaseCapacity() {
  const mode    = document.getElementById('flightMode').value;
  const base    = mode === 'standard' ? 5 : 15;
  const suit    = parseInt(document.getElementById('suitcase').value)     || 0;
  const faction = parseInt(document.getElementById('factionBonus').value) || 0;
  const ling    = parseInt(document.getElementById('lingerieBonus').value)|| 0;
  const cruise  = parseInt(document.getElementById('cruiseBonus').value)  || 0;
  return base + suit + faction + ling + cruise;
}

function getCapacityForType(type) {
  const base = getBaseCapacity();
  if (type === 'plushie') return base + (parseInt(document.getElementById('jobToy').value)   || 0);
  if (type === 'flower')  return base + (parseInt(document.getElementById('jobFlower').value) || 0);
  return base;
}

function updateCapacity() {
  document.getElementById('capacityDisplay').textContent = getBaseCapacity() + ' items';
}

/* ── Debounce recompute ────────────────────────────────────────── */
function scheduleRecompute() {
  clearTimeout(recomputeTimer);
  recomputeTimer = setTimeout(() => {
    if (stockData !== null) compute();
  }, 250);
}

/* ── Fetch YATA ────────────────────────────────────────────────── */
async function fetchAndCompute() {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('loading');

  setBanner('info', '⏳ Récupération des stocks YATA…');
  document.getElementById('summaryCards').style.display = 'none';
  document.getElementById('emptyState').style.display   = 'none';
  document.getElementById('runList').innerHTML = '';

  try {
    const resp = await fetch('https://yata.yt/api/v1/travel/export/');
    if (resp.ok) {
      stockData = await resp.json();
      /* Mise en cache localStorage */
      localStorage.setItem('yataCache', JSON.stringify(stockData));
      document.getElementById('lastFetchInfo').textContent =
        'YATA ' + timeAgo(stockData.timestamp);
      setBanner('info', '✅ Stocks YATA chargés et mis en cache.');
    } else throw new Error('HTTP ' + resp.status);
  } catch (e) {
    /* Essai depuis le cache si fetch échoue */
    const cached = localStorage.getItem('yataCache');
    if (cached) {
      stockData = JSON.parse(cached);
      const ageMin = Math.round((Date.now() / 1000 - stockData.timestamp) / 60);
      setBanner('warn', `⚠️ YATA inaccessible (CORS). Utilisation du cache (${ageMin} min).`);
    } else {
      stockData = {};
      setBanner('warn', '⚠️ YATA inaccessible et pas de cache. Calcul sur prix historiques.');
    }
  }

  /* Fetch prix marché (rapide, optionnel) */
  const key = sessionStorage.getItem('tornKey');
  if (key) {
    try {
      const r = await fetch(`https://api.torn.com/torn/?selections=items&key=${key}`);
      const d = await r.json();
      if (d.items) {
        priceData = {};
        Object.values(d.items).forEach(item => { priceData[item.name] = item.market_value; });
      }
    } catch (_) {}
  }

  compute();
  btn.classList.remove('loading');
}

/* ── Calcul principal ──────────────────────────────────────────── */
function compute() {
  const mode            = document.getElementById('flightMode').value;
  const sessionMin      = parseInt(document.getElementById('sessionHours').value) * 60;
  const budgetCap       = parseInt(document.getElementById('travelBudget').value) || 0;
  const freshMax        = parseFloat(document.getElementById('freshnessFilter').value);
  const minFlight       = parseInt(document.getElementById('minFlightTime').value) || 0;
  const maxTripsAllowed = parseInt(document.getElementById('maxTrips').value) || 999;
  const wantPlush       = document.getElementById('f_plushie').checked;
  const wantFlower      = document.getElementById('f_flower').checked;
  const wantDrug        = document.getElementById('f_drug').checked;

  const now      = Date.now() / 1000;
  const departTs = getDepartTimestamp();
  const runs     = [];

  COUNTRIES.forEach(country => {
    if (excludedCountries.has(country.code)) return;

    const tOneWay = country.timeMin[mode];
    if (tOneWay < minFlight) return;

    const tripMin = tOneWay * 2 + 5;
    if (tripMin > sessionMin) return;

    const maxTrips = Math.min(Math.floor(sessionMin / tripMin), maxTripsAllowed);
    if (maxTrips < 1) return;

    const countryStock = stockData?.stocks?.[country.code] ?? null;
    const lastUpdate   = countryStock?.update ?? 0;
    const ageH         = lastUpdate ? (now - lastUpdate) / 3600 : Infinity;
    if (lastUpdate && ageH > freshMax) return;

    const confidence = stockConfidence(lastUpdate, ageH);

    const yataQty = {};
    if (countryStock?.stocks) {
      countryStock.stocks.forEach(s => { yataQty[s.id] = s.quantity; });
    }

    const availableItems = ITEMS.filter(item => {
      if (item.country !== country.code)       return false;
      if (item.type === 'plushie' && !wantPlush) return false;
      if (item.type === 'flower'  && !wantFlower) return false;
      if (item.type === 'drug'    && !wantDrug)   return false;
      return true;
    });
    if (availableItems.length === 0) return;

    const typed = {};
    availableItems.forEach(item => {
      const sellPrice = priceData[item.name] || item.sell;
      const profit    = sellPrice - item.buy;
      if (!typed[item.type]) typed[item.type] = [];
      typed[item.type].push({ ...item, effectiveSell: sellPrice, unitProfit: profit });
    });
    Object.values(typed).forEach(arr => arr.sort((a, b) => b.unitProfit - a.unitProfit));

    const allItems = Object.values(typed).flat().sort((a, b) => b.unitProfit - a.unitProfit);
    let remainingSlots = getBaseCapacity();
    const breakdown = [];

    allItems.forEach(item => {
      if (remainingSlots <= 0) return;
      const cap        = getCapacityForType(item.type);
      const bonusSlots = cap - getBaseCapacity();
      const slots      = Math.min(remainingSlots + bonusSlots, cap);
      if (slots <= 0) return;
      const qty = Math.min(5, slots);

      let stockProba;
      if (!lastUpdate) {
        stockProba = 0.5;
      } else if (yataQty[item.id] !== undefined) {
        stockProba = Math.min(1, yataQty[item.id] / 100) * confidence.score;
      } else {
        stockProba = confidence.score * 0.6;
      }

      breakdown.push({
        ...item, qty, stockProba,
        grossProfit:    item.unitProfit * qty,
        adjustedProfit: item.unitProfit * qty * stockProba,
        yataQty:        yataQty[item.id] ?? null,
      });
      remainingSlots -= qty;
    });
    if (breakdown.length === 0) return;

    const travelCost    = budgetCap > 0 ? Math.min(budgetCap, country.cost) : country.cost;
    const rawProfitTrip = breakdown.reduce((s, b) => s + b.grossProfit, 0);
    const adjProfitTrip = breakdown.reduce((s, b) => s + b.adjustedProfit, 0);
    const netPerTrip    = adjProfitTrip - travelCost * 2;
    const totalProfit   = netPerTrip * maxTrips;
    const profitPerHour = totalProfit / (sessionMin / 60);

    /* Timeline des trips */
    const trips = Array.from({ length: maxTrips }, (_, i) => {
      const startTs  = departTs + i * tripMin * 60;
      const arriveTs = startTs + tOneWay * 60;
      const returnTs = arriveTs + 5 * 60;
      const landTs   = returnTs + tOneWay * 60;
      return { startTs, arriveTs, returnTs, landTs };
    });

    runs.push({
      country, tOneWay, tripMin, maxTrips,
      rawProfitTrip, adjProfitTrip, netPerTrip,
      totalProfit, profitPerHour,
      breakdown, confidence, lastUpdate, ageH,
      travelCost, trips, departTs,
    });
  });

  runs.sort((a, b) => b.totalProfit - a.totalProfit);
  renderResults(runs, mode);
}

/* ── Rendu ─────────────────────────────────────────────────────── */
function renderResults(runs, mode) {
  const runList = document.getElementById('runList');
  const summary = document.getElementById('summaryCards');
  const empty   = document.getElementById('emptyState');
  runList.innerHTML = '';

  if (runs.length === 0) {
    summary.style.display = 'none';
    empty.style.display   = 'flex';
    return;
  }

  empty.style.display   = 'none';
  summary.style.display = 'grid';

  const best = runs[0];
  document.getElementById('s_runs').textContent       = runs.length;
  document.getElementById('s_bestProfit').textContent  = '$' + fmt(best.totalProfit);
  document.getElementById('s_bestTrips').textContent   = best.maxTrips + 'x';
  document.getElementById('s_bestPerHour').textContent = '$' + fmt(best.profitPerHour) + '/h';

  /* Stocker les runs pour la modal */
  window._runs = runs;

  runs.slice(0, 8).forEach((run, i) => runList.appendChild(buildRunCard(run, i, mode)));

  if (runs.length > 8) {
    const more = document.createElement('p');
    more.style.cssText = 'text-align:center;color:var(--text3);font-size:12px;padding:.5rem';
    more.textContent   = `+ ${runs.length - 8} autres destinations`;
    runList.appendChild(more);
  }
}

function buildRunCard(run, rank, mode) {
  const isBest    = rank === 0;
  const modeLabel = { standard: 'Standard', airstrip: 'Airstrip', wlt: 'WLT/BC' }[mode];

  const freshnessChip = run.lastUpdate
    ? `<span class="chip ${run.confidence.score > 0.8 ? 'chip-green' : run.confidence.score > 0.5 ? 'chip-amber' : 'chip-red'}">Données ${run.confidence.label}</span>`
    : `<span class="chip chip-amber">Stock inconnu</span>`;

  const itemsHTML = run.breakdown.map(b => {
    const color    = TYPE_COLORS[b.type] || '#888';
    const probaStr = Math.round(b.stockProba * 100) + '%';
    return `<span class="item-chip">
      <span class="dot" style="background:${color}"></span>
      <span>${b.name} ×${b.qty}</span>
      <span class="gain">+$${fmt(b.grossProfit)}</span>
      <span class="chip chip-amber" style="font-size:10px;padding:1px 5px">${probaStr}</span>
    </span>`;
  }).join('');

  const firstTrip = run.trips[0];
  const tlPreview = `Départ ${fmtHour(firstTrip.startTs)} → Arrivée ${fmtHour(firstTrip.arriveTs)} → Retour ${fmtHour(firstTrip.landTs)}`;

  const card = document.createElement('div');
  card.className = 'run-card' + (isBest ? ' best' : '');
  card.innerHTML = `
    ${isBest ? '<div class="best-badge">MEILLEUR RUN</div>' : ''}
    <div class="run-header">
      <div class="run-left">
        <span class="run-flag">${run.country.flag}</span>
        <div>
          <div class="run-country">${run.country.name}</div>
          <div class="run-meta-chips">
            <span class="chip">✈ ${run.tOneWay} min</span>
            <span class="chip">🔄 ${run.maxTrips} trip${run.maxTrips > 1 ? 's' : ''}</span>
            <span class="chip">${modeLabel}</span>
            ${freshnessChip}
          </div>
        </div>
      </div>
      <div class="run-profit-block">
        <div class="profit-total ${run.totalProfit < 0 ? 'red' : ''}">$${fmt(run.totalProfit)}</div>
        <div class="profit-sub">profit total estimé</div>
      </div>
    </div>
    <hr class="run-divider" />
    <div class="run-profit-row">
      <div class="prow-item">
        <div class="prow-label">Par trip (brut)</div>
        <div class="prow-val">$${fmt(run.rawProfitTrip)}</div>
      </div>
      <div class="prow-item">
        <div class="prow-label">Par trip (net)</div>
        <div class="prow-val ${run.netPerTrip < 0 ? 'red' : 'green'}">$${fmt(run.netPerTrip)}</div>
      </div>
      <div class="prow-item">
        <div class="prow-label">Par heure</div>
        <div class="prow-val accent">$${fmt(run.profitPerHour)}/h</div>
      </div>
      <div class="prow-item">
        <div class="prow-label">Frais vol (A/R)</div>
        <div class="prow-val" style="color:var(--text2)">$${fmt(run.travelCost * 2)}</div>
      </div>
    </div>
    <div class="items-grid">${itemsHTML}</div>
    <button class="btn-timeline" onclick="openTimeline(${rank})">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      Timeline — ${tlPreview}
    </button>
  `;
  return card;
}

/* ── Timeline modal ─────────────────────────────────────────────── */
function openTimeline(rank) {
  const run = window._runs?.[rank];
  if (!run) return;
  document.getElementById('modalTitle').textContent =
    run.country.flag + ' ' + run.country.name + ' — Timeline des stocks';
  document.getElementById('modalContent').innerHTML = buildTimelineHTML(run);
  document.getElementById('timelineModal').style.display = 'flex';
}

function closeModal(e) {
  if (e.target === document.getElementById('timelineModal'))
    document.getElementById('timelineModal').style.display = 'none';
}

function buildTimelineHTML(run) {
  const sessionMin = parseInt(document.getElementById('sessionHours').value) * 60;
  const departTs   = run.departTs;
  const endTs      = departTs + sessionMin * 60;
  const totalSec   = endTs - departTs;
  const chartH     = 140;

  /* ── Modèle de stock ────────────────────────────────────────────
     On part du stock YATA au moment "now", puis :
     - décroissance linéaire (joueurs qui achètent)
     - restock instantané à chaque tick de 15 min (quantité fixe Torn : 2500)
     Le stock est plafonné à 2500.
  ──────────────────────────────────────────────────────────────── */
  const mainItem    = run.breakdown[0];
  const RESTOCK_QTY = 2500;
  const DECAY_RATE  = 8;    /* items perdus par minute (estimation moyenne) */

  /* Stock initial = donnée YATA si dispo, sinon 50% */
  const yataInit = (mainItem?.yataQty != null) ? mainItem.yataQty : 1250;

  /* Générer points toutes les 2 min */
  const STEP = 2 * 60; /* secondes */
  const points = [];
  let curStock = yataInit;
  let prevTickMin = Math.floor(departTs / (15 * 60)) * 15 * 60; /* dernier tick avant départ */

  for (let t = departTs; t <= endTs; t += STEP) {
    /* Ticks de restock passés depuis le dernier point */
    let nextTick = prevTickMin + 15 * 60;
    while (nextTick <= t) {
      curStock = Math.min(RESTOCK_QTY, curStock + RESTOCK_QTY);
      prevTickMin = nextTick;
      nextTick += 15 * 60;
    }
    curStock = Math.max(0, curStock - DECAY_RATE * (STEP / 60));
    points.push({ ts: t, qty: curStock });
  }

  /* ── SVG chemin ─────────────────────────────────────────────── */
  function tsToX(ts) { return ((ts - departTs) / totalSec * 100).toFixed(2); }
  function qtyToY(q) { return (chartH - (q / RESTOCK_QTY) * chartH).toFixed(2); }

  /* Courbe principale */
  const pathD = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${tsToX(p.ts)},${qtyToY(p.qty)}`
  ).join(' ');
  const fillD = pathD + ` L100,${chartH} L0,${chartH} Z`;

  /* Ticks de restock (lignes verticales grises) */
  const tickLines = [];
  let tk = Math.ceil(departTs / (15 * 60)) * 15 * 60;
  while (tk <= endTs) {
    const x = tsToX(tk);
    tickLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${chartH}" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>`);
    tk += 15 * 60;
  }

  /* Événements (arrivée = rouge, départ retour = orange, atterrissage = violet) */
  const evColors = { arrive: '#ef4444', return_dep: '#f59e0b', land: '#a78bfa', depart: '#4f7ef8' };
  const evLines  = [];
  const evLabels = [];

  run.trips.forEach((t, i) => {
    const evs = [
      { ts: t.startTs,  color: evColors.depart,     label: `T${i+1} Départ` },
      { ts: t.arriveTs, color: evColors.arrive,      label: `T${i+1} Arrivée` },
      { ts: t.returnTs, color: evColors.return_dep,  label: `T${i+1} Décollage retour` },
      { ts: t.landTs,   color: evColors.land,        label: `T${i+1} Atterrissage` },
    ];
    evs.forEach(ev => {
      if (ev.ts < departTs || ev.ts > endTs) return;
      const x = tsToX(ev.ts);
      evLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${chartH}" stroke="${ev.color}" stroke-width="1.2" stroke-dasharray="${ev.color === evColors.arrive ? 'none' : '4,3'}"/>`);
      evLabels.push({ x: parseFloat(x), color: ev.color, label: ev.label, time: fmtHour(ev.ts) });
    });
  });

  /* Légende événements */
  const legendHTML = evLabels.map(e =>
    `<span class="tl-legend-item">
      <span style="display:inline-block;width:12px;height:2px;background:${e.color};vertical-align:middle;margin-right:5px;border-radius:1px"></span>
      ${e.label} <span style="color:var(--text3);margin-left:3px">${e.time}</span>
    </span>`
  ).join('');

  /* ── Items ─────────────────────────────────────────────────── */
  const itemRows = run.breakdown.map(b => {
    const color    = TYPE_COLORS[b.type] || '#888';
    const probaStr = Math.round(b.stockProba * 100) + '%';
    const barW     = Math.round(b.stockProba * 100);
    const qtyStr   = b.yataQty != null ? `${b.yataQty} en stock` : 'Stock inconnu';
    return `<div class="tl-item-row">
      <span class="dot" style="background:${color}"></span>
      <span style="flex:1">${b.name}</span>
      <span style="color:var(--text3);font-size:11px">${qtyStr}</span>
      <span style="color:var(--text2)">×${b.qty}</span>
      <div class="tl-proba-bar"><div class="tl-proba-fill" style="width:${barW}%;background:${color}"></div></div>
      <span style="color:${color};min-width:32px;text-align:right">${probaStr}</span>
      <span style="color:var(--green);min-width:90px;text-align:right">+$${fmt(b.grossProfit)}</span>
    </div>`;
  }).join('');

  /* ── Trips ─────────────────────────────────────────────────── */
  const tripRows = run.trips.map((t, i) => `
    <div class="tl-trip-row">
      <span class="tl-trip-num">T${i+1}</span>
      <span class="tl-trip-seg" style="background:rgba(79,126,248,.15);border:1px solid rgba(79,126,248,.3)">✈ ${fmtHour(t.startTs)}</span>
      <span class="tl-arrow">→</span>
      <span class="tl-trip-seg" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3)">🛬 ${fmtHour(t.arriveTs)}</span>
      <span class="tl-arrow">→</span>
      <span class="tl-trip-seg" style="background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3)">🛒 5 min</span>
      <span class="tl-arrow">→</span>
      <span class="tl-trip-seg" style="background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3)">✈ ${fmtHour(t.returnTs)}</span>
      <span class="tl-arrow">→</span>
      <span class="tl-trip-seg" style="background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3)">🛬 ${fmtHour(t.landTs)}</span>
    </div>`).join('');

  return `
    <div class="tl-section-title">Évolution du stock — ${mainItem ? mainItem.name : 'item principal'}</div>
    <div class="tl-chart-wrap">
      <div class="tl-chart-ylabels"><span>2500</span><span style="margin-top:auto">0</span></div>
      <svg viewBox="0 0 100 ${chartH}" preserveAspectRatio="none"
           style="width:100%;height:${chartH}px;display:block;margin-left:28px;width:calc(100% - 28px)">
        <!-- Grille horizontale -->
        <line x1="0" y1="${chartH/2}" x2="100" y2="${chartH/2}" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
        <!-- Ticks de restock -->
        ${tickLines.join('')}
        <!-- Événements -->
        ${evLines.join('')}
        <!-- Courbe stock -->
        <path d="${fillD}" fill="rgba(79,126,248,0.08)"/>
        <path d="${pathD}" fill="none" stroke="#4f7ef8" stroke-width="1.5"/>
      </svg>
      <div class="tl-chart-labels">
        <span>${fmtHour(departTs)}</span>
        <span style="color:var(--text3);font-size:10px">— Ticks de restock toutes les 15 min (estimé)</span>
        <span>${fmtHour(endTs)}</span>
      </div>
    </div>
    <div class="tl-legend">${legendHTML}</div>

    <div class="tl-section-title" style="margin-top:1.25rem">Items à acheter</div>
    ${itemRows}

    <div class="tl-section-title" style="margin-top:1.25rem">Détail des trips</div>
    <div class="tl-trips">${tripRows}</div>

    <div class="tl-summary">
      <span>💰 Profit total : <strong class="green">$${fmt(run.totalProfit)}</strong></span>
      <span>⏱ Session utilisée : <strong>${Math.round(run.tripMin * run.maxTrips / 60 * 10) / 10}h / ${document.getElementById('sessionHours').value}h</strong></span>
    </div>
  `;
}

/* ── Helpers ────────────────────────────────────────────────────── */
function stockConfidence(lastUpdate, ageH) {
  if (!lastUpdate || ageH === Infinity) return { score: 0.5, label: 'inconnue', color: '#888' };
  if (ageH < 1)  return { score: 0.95, label: '< 1h',  color: '#22c55e' };
  if (ageH < 2)  return { score: 0.80, label: '< 2h',  color: '#84cc16' };
  if (ageH < 4)  return { score: 0.60, label: '< 4h',  color: '#f59e0b' };
  if (ageH < 8)  return { score: 0.35, label: '< 8h',  color: '#f97316' };
  return           { score: 0.15, label: '> 8h',  color: '#ef4444' };
}

function timeAgo(ts) {
  const diff = Math.round((Date.now() / 1000 - ts) / 60);
  if (diff < 1)  return 'à l\'instant';
  if (diff < 60) return `il y a ${diff} min`;
  return `il y a ${Math.round(diff / 60)}h`;
}

function fmt(n) {
  return Math.round(n).toLocaleString('fr-FR');
}

function setBanner(type, msg) {
  const el = document.getElementById('statusBanner');
  el.className = `banner banner-${type}`;
  el.textContent = msg;
  el.style.display = 'flex';
}
