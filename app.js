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
  const cached = localStorage.getItem('yataCache');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const ageMin = Math.round((Date.now()/1000 - parsed.timestamp) / 60);
      stockData = parsed;
      document.getElementById('lastFetchInfo').textContent = `Cache YATA (${ageMin} min)`;
      setBanner('info', `📦 Données en cache (${ageMin} min). Clique "Actualiser YATA" pour rafraîchir.`);
      compute();
    } catch(e) { localStorage.removeItem('yataCache'); }
  }
});

/* ── Heure de départ ───────────────────────────────────────────── */
function setDepartNow() {
  departMode = 'now'; departCustomTime = null;
  document.getElementById('btnNow').classList.add('active');
  document.getElementById('departTime').value = '';
  scheduleRecompute();
}
function setDepartCustom() {
  const val = document.getElementById('departTime').value;
  if (!val) return;
  departMode = 'custom'; departCustomTime = val;
  document.getElementById('btnNow').classList.remove('active');
  scheduleRecompute();
}
function getDepartTimestamp() {
  if (departMode === 'now') return Date.now()/1000;
  const [h,m] = departCustomTime.split(':').map(Number);
  const d = new Date(); d.setHours(h,m,0,0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate()+1);
  return d.getTime()/1000;
}
function fmtHour(ts) {
  const d = new Date(ts*1000);
  return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
}

/* ── Slider longueur de vol ────────────────────────────────────── */
function updateFlightLabel() {
  const v = parseInt(document.getElementById('minFlightTime').value);
  const lbl = document.getElementById('minFlightLabel');
  const hint = document.getElementById('minFlightHint');
  if (v===0) { lbl.textContent='Tous'; hint.textContent='Toutes les destinations incluses.'; return; }
  const h=Math.floor(v/60), m=v%60;
  lbl.textContent = (h>0?`${h}h`:'')+(m>0?`${m}min`:'')+' min';
  const n = COUNTRIES.filter(c=>c.timeMin.airstrip>=v).length;
  hint.textContent = `${n} destination${n>1?'s':''} retenue${n>1?'s':''}.`;
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
    btn.textContent = c.flag+' '+c.name.split(' ')[0];
    btn.onclick = () => {
      if (excludedCountries.has(c.code)) { excludedCountries.delete(c.code); btn.classList.remove('excluded'); }
      else { excludedCountries.add(c.code); btn.classList.add('excluded'); }
      scheduleRecompute();
    };
    container.appendChild(btn);
  });
}

/* ── Capacité ──────────────────────────────────────────────────── */
function getBaseCapacity() {
  const mode = document.getElementById('flightMode').value;
  const base = mode==='standard'?5:15;
  return base
    + (parseInt(document.getElementById('suitcase').value)||0)
    + (parseInt(document.getElementById('factionBonus').value)||0)
    + (parseInt(document.getElementById('lingerieBonus').value)||0)
    + (parseInt(document.getElementById('cruiseBonus').value)||0);
}
function updateCapacity() {
  document.getElementById('capacityDisplay').textContent = getBaseCapacity()+' items';
}

/* ── Debounce ──────────────────────────────────────────────────── */
function scheduleRecompute() {
  clearTimeout(recomputeTimer);
  recomputeTimer = setTimeout(()=>{ if(stockData!==null) compute(); }, 250);
}

/* ── Fetch YATA ────────────────────────────────────────────────── */
async function fetchAndCompute() {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('loading');
  setBanner('info','⏳ Récupération des stocks YATA…');
  document.getElementById('summaryCards').style.display='none';
  document.getElementById('emptyState').style.display='none';
  document.getElementById('runList').innerHTML='';
  try {
    const resp = await fetch('https://yata.yt/api/v1/travel/export/');
    if (resp.ok) {
      stockData = await resp.json();
      localStorage.setItem('yataCache', JSON.stringify(stockData));
      document.getElementById('lastFetchInfo').textContent = 'YATA '+timeAgo(stockData.timestamp);
      setBanner('info','✅ Stocks YATA chargés et mis en cache.');
    } else throw new Error('HTTP '+resp.status);
  } catch(e) {
    const cached = localStorage.getItem('yataCache');
    if (cached) {
      stockData = JSON.parse(cached);
      const ageMin = Math.round((Date.now()/1000-stockData.timestamp)/60);
      setBanner('warn',`⚠️ YATA inaccessible. Utilisation du cache (${ageMin} min).`);
    } else {
      stockData = {};
      setBanner('warn','⚠️ YATA inaccessible et pas de cache. Calcul sur prix historiques.');
    }
  }
  const key = sessionStorage.getItem('tornKey');
  if (key) {
    try {
      const r = await fetch(`https://api.torn.com/torn/?selections=items&key=${key}`);
      const d = await r.json();
      if (d.items) { priceData={}; Object.values(d.items).forEach(i=>{ priceData[i.name]=i.market_value; }); }
    } catch(_) {}
  }
  compute();
  btn.classList.remove('loading');
}

/* ── Calcul principal ──────────────────────────────────────────── */
function compute() {
  const mode            = document.getElementById('flightMode').value;
  const sessionMin      = parseInt(document.getElementById('sessionHours').value)*60;
  const budgetCap       = parseInt(document.getElementById('travelBudget').value)||0;
  const freshMax        = parseFloat(document.getElementById('freshnessFilter').value);
  const minFlight       = parseInt(document.getElementById('minFlightTime').value)||0;
  const maxTripsAllowed = parseInt(document.getElementById('maxTrips').value)||999;
  const canFinishAbroad = document.getElementById('finishAbroad').value==='yes';
  const wantPlush       = document.getElementById('f_plushie').checked;
  const wantFlower      = document.getElementById('f_flower').checked;
  const wantDrug        = document.getElementById('f_drug').checked;
  const toyBonus        = parseInt(document.getElementById('jobToy').value)||0;
  const flowerBonus     = parseInt(document.getElementById('jobFlower').value)||0;
  const baseCapacity    = getBaseCapacity();

  const now=Date.now()/1000, departTs=getDepartTimestamp(), runs=[];

  COUNTRIES.forEach(country => {
    if (excludedCountries.has(country.code)) return;
    const tOneWay = country.timeMin[mode];
    if (tOneWay < minFlight) return;

    /* Calcul des trips selon si on peut finir à l'étranger ou non */
    /* Trip normal : aller + retour. Trip "finir à l'étranger" : dernier trip = aller seulement */
    const tripMinFull = tOneWay*2+5;
    let maxTrips = 0;
    let sessionUsed = 0;
    if (canFinishAbroad) {
      /* On peut faire N trips complets + 1 aller final */
      const tripsComplete = Math.floor((sessionMin - tOneWay) / tripMinFull);
      const tripsOneWay   = sessionMin >= tOneWay ? 1 : 0;
      maxTrips = Math.max(0, tripsComplete + (tripsOneWay > 0 ? 1 : 0));
      /* Cas simple : au moins 1 aller possible */
      if (maxTrips === 0 && sessionMin >= tOneWay) maxTrips = 1;
    } else {
      maxTrips = Math.floor(sessionMin / tripMinFull);
    }
    maxTrips = Math.min(maxTrips, maxTripsAllowed);
    if (maxTrips < 1) return;

    const countryStock = stockData?.stocks?.[country.code]??null;
    const lastUpdate   = countryStock?.update??0;
    const ageH         = lastUpdate?(now-lastUpdate)/3600:Infinity;
    if (lastUpdate && ageH>freshMax) return;
    const confidence   = stockConfidence(lastUpdate,ageH);

    const yataQty = {};
    if (countryStock?.stocks) countryStock.stocks.forEach(s=>{ yataQty[s.id]=s.quantity; });

    /* Items dispo dans ce pays */
    const avail = ITEMS.filter(item => {
      if (item.country!==country.code) return false;
      if (item.type==='plushie'&&!wantPlush) return false;
      if (item.type==='flower' &&!wantFlower) return false;
      if (item.type==='drug'   &&!wantDrug)   return false;
      return true;
    });
    if (avail.length===0) return;

    /* Trier par profit unitaire décroissant */
    const sorted = avail.map(item => {
      const sellPrice = priceData[item.name]||item.sell;
      return { ...item, effectiveSell:sellPrice, unitProfit:sellPrice-item.buy };
    }).sort((a,b)=>b.unitProfit-a.unitProfit);

    /* Allocation : remplir les slots de base avec les items les plus rentables
       puis ajouter les slots bonus toy/flower si applicable */
    const breakdown = [];
    let baseRemaining = baseCapacity;
    let bonusPlushieRemaining = toyBonus;
    let bonusFlowerRemaining  = flowerBonus;

    sorted.forEach(item => {
      let qty = 0;
      /* Slots de base disponibles */
      if (baseRemaining > 0) {
        qty = baseRemaining;
        baseRemaining -= qty;
      }
      /* Slots bonus pour ce type */
      if (item.type==='plushie' && bonusPlushieRemaining>0) {
        qty += bonusPlushieRemaining;
        bonusPlushieRemaining = 0;
      }
      if (item.type==='flower' && bonusFlowerRemaining>0) {
        qty += bonusFlowerRemaining;
        bonusFlowerRemaining = 0;
      }
      if (qty<=0) return;

      let stockProba;
      if (!lastUpdate) stockProba=0.5;
      else if (yataQty[item.id]!==undefined) stockProba=Math.min(1,yataQty[item.id]/100)*confidence.score;
      else stockProba=confidence.score*0.6;

      breakdown.push({
        ...item, qty, stockProba,
        grossProfit:    item.unitProfit*qty,
        adjustedProfit: item.unitProfit*qty*stockProba,
        yataQty:        yataQty[item.id]??null,
      });
    });
    if (breakdown.length===0) return;

    const travelCost    = budgetCap>0?Math.min(budgetCap,country.cost):country.cost;
    const rawProfitTrip = breakdown.reduce((s,b)=>s+b.grossProfit,0);
    const adjProfitTrip = breakdown.reduce((s,b)=>s+b.adjustedProfit,0);

    /* Coût voyage selon si finir à l'étranger */
    let totalTravelCost;
    if (canFinishAbroad) {
      /* N-1 trips complets + 1 aller sans retour */
      totalTravelCost = travelCost * 2 * (maxTrips-1) + travelCost;
    } else {
      totalTravelCost = travelCost * 2 * maxTrips;
    }
    const totalProfit   = adjProfitTrip * maxTrips - totalTravelCost;
    const profitPerHour = totalProfit / (sessionMin/60);

    /* Timeline des trips */
    const trips = Array.from({length:maxTrips},(_,i)=>{
      const startTs  = departTs + i*tripMinFull*60;
      const arriveTs = startTs + tOneWay*60;
      const returnTs = arriveTs + 5*60;
      const landTs   = (canFinishAbroad && i===maxTrips-1) ? null : returnTs+tOneWay*60;
      return { startTs, arriveTs, returnTs, landTs, isLastAbroad: canFinishAbroad&&i===maxTrips-1 };
    });

    runs.push({
      country, tOneWay, tripMin:tripMinFull, maxTrips,
      rawProfitTrip, adjProfitTrip, netPerTrip:adjProfitTrip-travelCost*2,
      totalProfit, profitPerHour,
      breakdown, confidence, lastUpdate, ageH,
      travelCost, trips, departTs, canFinishAbroad,
      totalCapacity: baseCapacity+toyBonus+flowerBonus,
    });
  });

  runs.sort((a,b)=>b.totalProfit-a.totalProfit);
  window._runs = runs;
  renderResults(runs, mode);
}

/* ── Rendu ─────────────────────────────────────────────────────── */
function renderResults(runs, mode) {
  const runList=document.getElementById('runList');
  const summary=document.getElementById('summaryCards');
  const empty=document.getElementById('emptyState');
  runList.innerHTML='';
  if (runs.length===0) { summary.style.display='none'; empty.style.display='flex'; return; }
  empty.style.display='none'; summary.style.display='grid';
  const best=runs[0];
  document.getElementById('s_runs').textContent       = runs.length;
  document.getElementById('s_bestProfit').textContent  = '$'+fmt(best.totalProfit);
  document.getElementById('s_bestTrips').textContent   = best.maxTrips+'x';
  document.getElementById('s_bestPerHour').textContent = '$'+fmt(best.profitPerHour)+'/h';
  runs.slice(0,8).forEach((run,i)=>runList.appendChild(buildRunCard(run,i,mode)));
  if (runs.length>8) {
    const more=document.createElement('p');
    more.style.cssText='text-align:center;color:var(--text3);font-size:12px;padding:.5rem';
    more.textContent=`+ ${runs.length-8} autres destinations`;
    runList.appendChild(more);
  }
}

function buildRunCard(run, rank, mode) {
  const isBest=rank===0;
  const modeLabel={standard:'Standard',airstrip:'Airstrip',wlt:'WLT/BC'}[mode];
  const freshnessChip = run.lastUpdate
    ? `<span class="chip ${run.confidence.score>0.8?'chip-green':run.confidence.score>0.5?'chip-amber':'chip-red'}">Données ${run.confidence.label}</span>`
    : `<span class="chip chip-amber">Stock inconnu</span>`;

  /* Items avec images */
  const itemsHTML = run.breakdown.map(b=>{
    const color=TYPE_COLORS[b.type]||'#888';
    const probaStr=Math.round(b.stockProba*100)+'%';
    return `<span class="item-chip">
      <img src="${b.img}" width="22" height="22" style="border-radius:3px;vertical-align:middle;margin-right:4px" onerror="this.style.display='none'">
      <span>${b.name} ×${b.qty}</span>
      <span class="gain">+$${fmt(b.grossProfit)}</span>
      <span class="chip chip-amber" style="font-size:10px;padding:1px 5px">${probaStr}</span>
    </span>`;
  }).join('');

  const firstTrip=run.trips[0];
  const tlPreview=`Départ ${fmtHour(firstTrip.startTs)} → Arrivée ${fmtHour(firstTrip.arriveTs)}${firstTrip.landTs?' → Retour '+fmtHour(firstTrip.landTs):''}`;
  const abroadBadge = run.canFinishAbroad
    ? `<span class="chip chip-blue">Finit à l'étranger</span>` : '';

  const card=document.createElement('div');
  card.className='run-card'+(isBest?' best':'');
  card.innerHTML=`
    ${isBest?'<div class="best-badge">MEILLEUR RUN</div>':''}
    <div class="run-header">
      <div class="run-left">
        <span class="run-flag">${run.country.flag}</span>
        <div>
          <div class="run-country">${run.country.name}</div>
          <div class="run-meta-chips">
            <span class="chip">✈ ${run.tOneWay} min</span>
            <span class="chip">🔄 ${run.maxTrips} trip${run.maxTrips>1?'s':''}</span>
            <span class="chip">${modeLabel} — ${run.totalCapacity} items</span>
            ${freshnessChip}${abroadBadge}
          </div>
        </div>
      </div>
      <div class="run-profit-block">
        <div class="profit-total ${run.totalProfit<0?'red':''}">$${fmt(run.totalProfit)}</div>
        <div class="profit-sub">profit total estimé</div>
      </div>
    </div>
    <hr class="run-divider"/>
    <div class="run-profit-row">
      <div class="prow-item"><div class="prow-label">Par trip (brut)</div><div class="prow-val">$${fmt(run.rawProfitTrip)}</div></div>
      <div class="prow-item"><div class="prow-label">Par trip (net)</div><div class="prow-val ${run.netPerTrip<0?'red':'green'}">$${fmt(run.netPerTrip)}</div></div>
      <div class="prow-item"><div class="prow-label">Par heure</div><div class="prow-val accent">$${fmt(run.profitPerHour)}/h</div></div>
      <div class="prow-item"><div class="prow-label">Frais vol</div><div class="prow-val" style="color:var(--text2)">$${fmt(run.travelCost*2)}/trip</div></div>
    </div>
    <div class="items-grid">${itemsHTML}</div>
    <button class="btn-timeline" onclick="openTimeline(${rank})">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      Timeline — ${tlPreview}
    </button>`;
  return card;
}

/* ── Timeline modal ─────────────────────────────────────────────── */
function openTimeline(rank) {
  const run=window._runs?.[rank];
  if(!run) return;
  document.getElementById('modalTitle').textContent=run.country.flag+' '+run.country.name+' — Timeline';
  document.getElementById('modalContent').innerHTML=buildTimelineHTML(run);
  document.getElementById('timelineModal').style.display='flex';
}
function closeModal(e) {
  if(e.target===document.getElementById('timelineModal'))
    document.getElementById('timelineModal').style.display='none';
}

function buildTimelineHTML(run) {
  const sessionMin=parseInt(document.getElementById('sessionHours').value)*60;
  const departTs=run.departTs;
  const endTs=departTs+sessionMin*60;

  /* Fenêtre visible : 2h30 ou toute la session si plus courte */
  const WINDOW_SEC = Math.min(2.5*3600, endTs-departTs);
  const chartH=130;

  /* Décroissance réaliste : on utilise le decay par item le plus chargé */
  const mainItem=run.breakdown[0];
  const DECAY_RATE=mainItem?.decay??50;
  const RESTOCK_QTY=2500;
  const yataInit=(mainItem?.yataQty!=null)?mainItem.yataQty:RESTOCK_QTY;

  /* Générer courbe de stock sur toute la session */
  const STEP=60; /* 1 point par minute */
  const allPoints=[];
  let cur=yataInit;
  let lastTickTs=Math.floor(departTs/(15*60))*15*60;
  for(let t=departTs;t<=endTs;t+=STEP) {
    let nextTick=lastTickTs+15*60;
    while(nextTick<=t) { cur=Math.min(RESTOCK_QTY,cur+RESTOCK_QTY); lastTickTs=nextTick; nextTick+=15*60; }
    cur=Math.max(0,cur-DECAY_RATE*(STEP/60));
    allPoints.push({ts:t,qty:cur});
  }

  /* Construire N panneaux scrollables de WINDOW_SEC chacun */
  const totalSec=endTs-departTs;
  const numPanels=Math.ceil(totalSec/WINDOW_SEC);
  const panelW=700; /* px */

  function tsToX(ts,panelStart) { return ((ts-panelStart)/WINDOW_SEC*panelW).toFixed(1); }
  function qtyToY(q) { return (chartH-(q/RESTOCK_QTY)*chartH).toFixed(1); }

  let svgContent='';
  for(let p=0;p<numPanels;p++) {
    const pStart=departTs+p*WINDOW_SEC;
    const pEnd=Math.min(pStart+WINDOW_SEC,endTs);
    const pts=allPoints.filter(pt=>pt.ts>=pStart&&pt.ts<=pEnd);

    /* Courbe stock */
    const pathD=pts.map((pt,i)=>`${i===0?'M':'L'}${tsToX(pt.ts,pStart)},${qtyToY(pt.qty)}`).join(' ');
    const fillD=pathD+` L${panelW},${chartH} L0,${chartH} Z`;

    /* Ticks restock */
    let tkLines='';
    let tk=Math.ceil(pStart/(15*60))*15*60;
    while(tk<=pEnd) {
      const x=tsToX(tk,pStart);
      tkLines+=`<line x1="${x}" y1="0" x2="${x}" y2="${chartH}" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>`;
      tk+=15*60;
    }

    /* Barres événements (arrivées uniquement = rouge plein) */
    let evLines='';
    run.trips.forEach(t=>{
      /* Arrivée = barre rouge pleine */
      if(t.arriveTs>=pStart&&t.arriveTs<=pEnd) {
        const x=tsToX(t.arriveTs,pStart);
        evLines+=`<line x1="${x}" y1="0" x2="${x}" y2="${chartH}" stroke="#ef4444" stroke-width="1.5"/>`;
      }
      /* Départ = barre bleue pointillée */
      if(t.startTs>=pStart&&t.startTs<=pEnd) {
        const x=tsToX(t.startTs,pStart);
        evLines+=`<line x1="${x}" y1="0" x2="${x}" y2="${chartH}" stroke="#4f7ef8" stroke-width="1" stroke-dasharray="4,3"/>`;
      }
    });

    /* Labels horaires en bas */
    const labelStep=30*60; /* toutes les 30 min */
    let lbls='';
    let lt=Math.ceil(pStart/(labelStep))*labelStep;
    while(lt<=pEnd) {
      const x=parseFloat(tsToX(lt,pStart));
      lbls+=`<text x="${x}" y="${chartH+14}" font-size="9" fill="rgba(255,255,255,0.3)" text-anchor="middle">${fmtHour(lt)}</text>`;
      lt+=labelStep;
    }

    svgContent+=`<svg viewBox="0 0 ${panelW} ${chartH+18}" width="${panelW}" height="${chartH+18}" style="display:block;flex-shrink:0">
      ${tkLines}${evLines}
      <path d="${fillD}" fill="rgba(79,126,248,0.08)"/>
      <path d="${pathD}" fill="none" stroke="#4f7ef8" stroke-width="1.5"/>
      ${lbls}
      <text x="4" y="10" font-size="9" fill="rgba(255,255,255,0.25)">2500</text>
      <text x="4" y="${chartH-2}" font-size="9" fill="rgba(255,255,255,0.25)">0</text>
    </svg>`;
  }

  /* Items */
  const itemRows=run.breakdown.map(b=>{
    const color=TYPE_COLORS[b.type]||'#888';
    const probaStr=Math.round(b.stockProba*100)+'%';
    const barW=Math.round(b.stockProba*100);
    const qtyStr=b.yataQty!=null?`${b.yataQty} en stock`:'inconnu';
    return `<div class="tl-item-row">
      <img src="${b.img}" width="28" height="28" style="border-radius:4px;flex-shrink:0" onerror="this.style.display='none'">
      <span style="flex:1;font-weight:500">${b.name}</span>
      <span style="color:var(--text3);font-size:11px">${qtyStr}</span>
      <span style="color:var(--text2)">×${b.qty}</span>
      <div class="tl-proba-bar"><div class="tl-proba-fill" style="width:${barW}%;background:${color}"></div></div>
      <span style="color:${color};min-width:36px;text-align:right;font-weight:600">${probaStr}</span>
      <span style="color:var(--green);min-width:90px;text-align:right">+$${fmt(b.grossProfit)}</span>
    </div>`;
  }).join('');

  /* Trips */
  const tripRows=run.trips.map((t,i)=>`
    <div class="tl-trip-row">
      <span class="tl-trip-num">T${i+1}</span>
      <span class="tl-trip-seg" style="background:rgba(79,126,248,.15);border:1px solid rgba(79,126,248,.3)">✈ ${fmtHour(t.startTs)}</span>
      <span class="tl-arrow">→</span>
      <span class="tl-trip-seg" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3)">🛬 ${fmtHour(t.arriveTs)}</span>
      <span class="tl-arrow">→</span>
      ${t.isLastAbroad
        ? `<span class="tl-trip-seg" style="background:rgba(34,197,94,.2);border:1px solid rgba(34,197,94,.4)">🏖 Reste à l'étranger</span>`
        : `<span class="tl-trip-seg" style="background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3)">✈ retour ${fmtHour(t.returnTs)}</span>
           <span class="tl-arrow">→</span>
           <span class="tl-trip-seg" style="background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3)">🛬 ${fmtHour(t.landTs)}</span>`
      }
    </div>`).join('');

  return `
    <div class="tl-section-title">Stock estimé — ${mainItem?mainItem.name:'item principal'}
      <span style="font-weight:400;margin-left:8px;color:var(--text3)">
        <span style="display:inline-block;width:12px;height:2px;background:#4f7ef8;vertical-align:middle"></span> Départ &nbsp;
        <span style="display:inline-block;width:12px;height:2px;background:#ef4444;vertical-align:middle"></span> Arrivée &nbsp;
        <span style="display:inline-block;width:12px;height:2px;background:rgba(255,255,255,.2);vertical-align:middle"></span> Tick restock
      </span>
    </div>
    <div style="overflow-x:auto;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg3);padding:.5rem">
      <div style="display:flex;width:${panelW*numPanels}px">
        ${svgContent}
      </div>
    </div>
    <p style="font-size:10px;color:var(--text3);margin-top:4px">Défilement horizontal si besoin — courbe estimative basée sur la popularité de la destination</p>

    <div class="tl-section-title" style="margin-top:1.25rem">Items à acheter</div>
    ${itemRows}

    <div class="tl-section-title" style="margin-top:1.25rem">Détail des trips</div>
    <div class="tl-trips">${tripRows}</div>

    <div class="tl-summary">
      <span>💰 Profit total : <strong class="green">$${fmt(run.totalProfit)}</strong></span>
      <span>⏱ Session : <strong>${Math.round(run.tripMin*run.maxTrips/60*10)/10}h / ${document.getElementById('sessionHours').value}h</strong></span>
      ${run.canFinishAbroad?'<span class="chip chip-blue">Finit à l\'étranger</span>':''}
    </div>`;
}

/* ── Helpers ────────────────────────────────────────────────────── */
function stockConfidence(lastUpdate,ageH) {
  if(!lastUpdate||ageH===Infinity) return{score:0.5,label:'inconnue'};
  if(ageH<1)  return{score:0.95,label:'< 1h'};
  if(ageH<2)  return{score:0.80,label:'< 2h'};
  if(ageH<4)  return{score:0.60,label:'< 4h'};
  if(ageH<8)  return{score:0.35,label:'< 8h'};
  return          {score:0.15,label:'> 8h'};
}
function timeAgo(ts) {
  const diff=Math.round((Date.now()/1000-ts)/60);
  if(diff<1) return 'à l\'instant';
  if(diff<60) return `il y a ${diff} min`;
  return `il y a ${Math.round(diff/60)}h`;
}
function fmt(n) { return Math.round(n).toLocaleString('fr-FR'); }
function setBanner(type,msg) {
  const el=document.getElementById('statusBanner');
  el.className=`banner banner-${type}`;
  el.textContent=msg;
  el.style.display='flex';
}
