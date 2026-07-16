/* ================================================================
   app.js — Torn Travel Optimizer
   ================================================================ */

let stockData = null, priceData = {}, excludedCountries = new Set();
let recomputeTimer = null, departMode = 'now', departCustomTime = null;
let currentLang = localStorage.getItem('lang') || 'fr';

/* ── Traductions ─────────────────────────────────────────────── */
const T = {
  fr: {
    actualiser: 'Actualiser YATA',
    recalculer: 'Recalculer',
    session: 'Session de jeu',
    depart: 'Heure de départ',
    maintenant: 'Maintenant',
    duree: 'Durée de session',
    budget: 'Budget max par aller-retour',
    pasDeLimite: 'Pas de limite',
    preferences: 'Préférences de voyage',
    longueurMin: 'Longueur minimale du vol',
    tous: 'Tous',
    nbMaxTrips: 'Nombre max de trips',
    finSession: 'Fin de session',
    retourOblig: 'Retour à Torn obligatoire',
    finEtranger: 'Peut finir à l\'étranger',
    modeVol: 'Mode de vol',
    typeVoyage: 'Type de voyage',
    valise: 'Valise',
    aucune: 'Aucune',
    bonusFaction: 'Bonus faction (Excursion)',
    lingerie: 'Lingerie Store (3★)',
    cruise: 'Cruise Line',
    capaciteBase: 'Capacité de base',
    bonusJob: 'Bonus de job',
    peluches: 'Peluches',
    fleurs: 'Fleurs',
    filtres: 'Filtres',
    typesItems: 'Types d\'items',
    fraicheur: 'Fraîcheur données YATA',
    paysExclus: 'Pays exclus',
    meilleureRun: 'Meilleur run',
    autresOptions: 'Autres options',
    profit: 'PROFIT',
    profitH: 'PROFIT/HEURE',
    cashRequis: 'CASH REQUIS',
    trips: 'TRIPS',
    parTripBrut: 'Par trip (brut)',
    parTripNet: 'Par trip (net)',
    parHeure: 'Par heure',
    fraisVol: 'Frais vol',
    detail: 'Détail',
    finEtrangerBadge: 'Finit à l\'étranger',
    stockEstime: 'Stock estimé',
    itemsAcheter: 'Items à acheter',
    calcProfit: 'Calcul du profit',
    profitBrut: 'Profit brut / trip',
    probaStock: '× proba stock moy.',
    profitAjuste: '= profit ajusté / trip',
    fraisVolAR: '− frais vol A/R',
    profitNet: '= profit net / trip',
    profitTotal: '💰 Profit total',
    sessionUtilisee: 'Session utilisée',
    prediction: 'Prédiction de stock',
    stockActuel: 'Stock actuel',
    prochainTick: 'Prochain tick TCT',
    stockZero: 'Stock à 0 estimé à',
    restockAttendu: 'Restock attendu',
    arrivee: 'Arrivée',
    probaArr: 'Probabilité à l\'arrivée',
    enStock: 'en stock',
    stockFaible: 'stock faible',
    stockTresFaible: 'stock très faible',
    restockProb: 'restock probable à l\'arrivée',
    restockLointain: 'stock vide, restock lointain',
    inconnu: 'inconnu',
    donneesInconnues: 'Données YATA indisponibles — simulation sur paramètres moyens',
    cacheYATA: 'Cache YATA',
    minutesAgo: 'min',
    actualiserPour: 'Clique "Actualiser YATA" pour rafraîchir.',
    chargement: '⏳ Récupération des stocks YATA…',
    charge: '✅ Stocks YATA chargés.',
    inaccessible: '⚠️ YATA inaccessible — cache utilisé.',
    pasDeCache: '⚠️ YATA inaccessible — prix historiques.',
    prixCharge: '✅ Stocks YATA + prix marché Torn chargés.',
    prixIndispo: '⚠️ Prix Torn API indisponibles.',
    pret: 'Prêt à décoller',
    pretSub: 'Clique sur Actualiser YATA pour charger les stocks, ou Recalculer si tu as déjà des données en cache.',
    actualiserCalculer: 'Actualiser YATA + Calculer',
    recalculerCache: 'Recalculer (cache)',
    destinations: 'destinations',
    meilleureProfit: 'meilleur profit total',
    tripsLabel: 'trips (meilleur run)',
    parHeureLabel: '$/heure',
    voirAutres: 'Voir les',
    autresLabel: 'autres ▼',
    plusTrips: 'trips identiques',
    simulBasee: 'Simulation basée sur données réelles (yata_tracker.py)',
    detailRun: 'Détail du run',
    retour: 'Retour',
    depart_label: 'Départ',
    arrivee_label: 'Arrivée',
    resteEtranger: 'Reste à l\'étranger',
    min: 'min',
  },
  en: {
    actualiser: 'Refresh YATA',
    recalculer: 'Recalculate',
    session: 'Gaming session',
    depart: 'Departure time',
    maintenant: 'Now',
    duree: 'Session duration',
    budget: 'Max budget per round trip',
    pasDeLimite: 'No limit',
    preferences: 'Travel preferences',
    longueurMin: 'Minimum flight duration',
    tous: 'All',
    nbMaxTrips: 'Max trips',
    finSession: 'End of session',
    retourOblig: 'Must return to Torn',
    finEtranger: 'Can finish abroad',
    modeVol: 'Flight mode',
    typeVoyage: 'Travel type',
    valise: 'Suitcase',
    aucune: 'None',
    bonusFaction: 'Faction bonus (Excursion)',
    lingerie: 'Lingerie Store (3★)',
    cruise: 'Cruise Line',
    capaciteBase: 'Base capacity',
    bonusJob: 'Job bonus',
    peluches: 'Plushies',
    fleurs: 'Flowers',
    filtres: 'Filters',
    typesItems: 'Item types',
    fraicheur: 'YATA data freshness',
    paysExclus: 'Excluded countries',
    meilleureRun: 'Best run',
    autresOptions: 'Other options',
    profit: 'PROFIT',
    profitH: 'PROFIT/HOUR',
    cashRequis: 'CASH REQUIRED',
    trips: 'TRIPS',
    parTripBrut: 'Per trip (gross)',
    parTripNet: 'Per trip (net)',
    parHeure: 'Per hour',
    fraisVol: 'Flight cost',
    detail: 'Detail',
    finEtrangerBadge: 'Finishes abroad',
    stockEstime: 'Estimated stock',
    itemsAcheter: 'Items to buy',
    calcProfit: 'Profit breakdown',
    profitBrut: 'Gross profit / trip',
    probaStock: '× avg stock proba',
    profitAjuste: '= adjusted profit / trip',
    fraisVolAR: '− round trip cost',
    profitNet: '= net profit / trip',
    profitTotal: '💰 Total profit',
    sessionUtilisee: 'Session used',
    prediction: 'Stock prediction',
    stockActuel: 'Current stock',
    prochainTick: 'Next TCT tick',
    stockZero: 'Stock hits 0 at',
    restockAttendu: 'Restock expected',
    arrivee: 'Arrival',
    probaArr: 'Probability at arrival',
    enStock: 'in stock',
    stockFaible: 'low stock',
    stockTresFaible: 'very low stock',
    restockProb: 'restock likely at arrival',
    restockLointain: 'empty, restock far away',
    inconnu: 'unknown',
    donneesInconnues: 'No YATA data — using average parameters',
    cacheYATA: 'YATA cache',
    minutesAgo: 'min ago',
    actualiserPour: 'Click "Refresh YATA" to update.',
    chargement: '⏳ Fetching YATA stocks…',
    charge: '✅ YATA stocks loaded.',
    inaccessible: '⚠️ YATA unavailable — using cache.',
    pasDeCache: '⚠️ YATA unavailable — using historical prices.',
    prixCharge: '✅ YATA stocks + Torn market prices loaded.',
    prixIndispo: '⚠️ Torn API prices unavailable.',
    pret: 'Ready for takeoff',
    pretSub: 'Click Refresh YATA to load live stocks, or Recalculate if you already have cached data.',
    actualiserCalculer: 'Refresh YATA + Calculate',
    recalculerCache: 'Recalculate (cache)',
    destinations: 'destinations',
    meilleureProfit: 'best total profit',
    tripsLabel: 'trips (best run)',
    parHeureLabel: '$/hour',
    voirAutres: 'Show',
    autresLabel: 'more ▼',
    plusTrips: 'identical trips',
    simulBasee: 'Simulation based on real data (yata_tracker.py)',
    detailRun: 'Run detail',
    retour: 'Return',
    depart_label: 'Departure',
    arrivee_label: 'Arrival',
    resteEtranger: 'Stays abroad',
    min: 'min',
  }
};

function t(key) { return T[currentLang][key] || T['fr'][key] || key; }

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  if (stockData !== null) compute();
}

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildCountryFilters();
  updateCapacity();
  updateFlightLabel();
  setDepartNow();
  const savedKey = sessionStorage.getItem('tornKey');
  if (savedKey) { document.getElementById('apiKey').value=savedKey; document.getElementById('keyStatus').textContent='✓'; }
  const cached = localStorage.getItem('yataCache');
  if (cached) {
    try {
      stockData = JSON.parse(cached);
      const age = Math.round((Date.now()/1000-stockData.timestamp)/60);
      document.getElementById('lastFetchInfo').textContent=`${t('cacheYATA')} (${age} ${t('minutesAgo')})`;
      setBanner('info',`📦 ${t('cacheYATA')} (${age} ${t('minutesAgo')}). ${t('actualiserPour')}`);
      compute();
    } catch(e) { localStorage.removeItem('yataCache'); }
  }
  setLang(currentLang);
});

/* ── Départ ─────────────────────────────────────────────────── */
function setDepartNow() {
  departMode='now'; departCustomTime=null;
  document.getElementById('btnNow').classList.add('active');
  document.getElementById('departTime').value='';
  scheduleRecompute();
}
function setDepartCustom() {
  const val=document.getElementById('departTime').value; if(!val) return;
  departMode='custom'; departCustomTime=val;
  document.getElementById('btnNow').classList.remove('active');
  scheduleRecompute();
}
function getDepartTs() {
  if (departMode==='now') return Date.now()/1000;
  const [h,m]=departCustomTime.split(':').map(Number);
  const d=new Date(); d.setHours(h,m,0,0);
  if (d.getTime()<Date.now()) d.setDate(d.getDate()+1);
  return d.getTime()/1000;
}
function fmtH(ts) {
  const d=new Date(ts*1000);
  return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
}

/* ── Slider vol ─────────────────────────────────────────────── */
function updateFlightLabel() {
  const v=parseInt(document.getElementById('minFlightTime').value);
  if (v===0){document.getElementById('minFlightLabel').textContent=t('tous');document.getElementById('minFlightHint').textContent='';return;}
  const h=Math.floor(v/60),m=v%60;
  document.getElementById('minFlightLabel').textContent=(h?h+'h':'')+(m?m+t('min'):'')+' '+t('min');
  const n=COUNTRIES.filter(c=>c.timeMin.airstrip>=v).length;
  document.getElementById('minFlightHint').textContent=`${n} destination${n>1?'s':''}.`;
}

function saveKey() {
  const k=document.getElementById('apiKey').value.trim(); if(!k) return;
  sessionStorage.setItem('tornKey',k); document.getElementById('keyStatus').textContent='✓';
}

/* ── Pays ───────────────────────────────────────────────────── */
function buildCountryFilters() {
  const container=document.getElementById('countryFilters');
  COUNTRIES.forEach(c=>{
    const btn=document.createElement('button');
    btn.className='country-btn';
    btn.innerHTML=`<img src="https://flagcdn.com/16x12/${c.flag}.png" width="16" height="12" style="vertical-align:middle;margin-right:3px;border-radius:1px" onerror="this.style.display='none'">${c.name.split(' ')[0]}`;
    btn.onclick=()=>{
      if(excludedCountries.has(c.code)){excludedCountries.delete(c.code);btn.classList.remove('excluded');}
      else{excludedCountries.add(c.code);btn.classList.add('excluded');}
      scheduleRecompute();
    };
    container.appendChild(btn);
  });
}

function getBaseCapacity() {
  const mode=document.getElementById('flightMode').value;
  return (mode==='standard'?5:15)
    +(parseInt(document.getElementById('suitcase').value)||0)
    +(parseInt(document.getElementById('factionBonus').value)||0)
    +(parseInt(document.getElementById('lingerieBonus').value)||0)
    +(parseInt(document.getElementById('cruiseBonus').value)||0);
}
function updateCapacity(){document.getElementById('capacityDisplay').textContent=getBaseCapacity()+' items';}

function scheduleRecompute(){
  clearTimeout(recomputeTimer);
  recomputeTimer=setTimeout(()=>{if(stockData!==null)compute();},250);
}

/* ── Fetch YATA ─────────────────────────────────────────────── */
async function fetchAndCompute() {
  const btn=document.getElementById('refreshBtn'); btn.classList.add('loading');
  setBanner('info',t('chargement'));
  ['globalStats','bestRunTimeline','otherRuns'].forEach(id=>document.getElementById(id).style.display='none');
  document.getElementById('emptyState').style.display='none';
  try {
    const r=await fetch('https://yata.yt/api/v1/travel/export/');
    if(!r.ok) throw new Error();
    stockData=await r.json();
    localStorage.setItem('yataCache',JSON.stringify(stockData));
    document.getElementById('lastFetchInfo').textContent='YATA '+timeAgo(stockData.timestamp);
    setBanner('info',t('charge'));
  } catch(e) {
    const c=localStorage.getItem('yataCache');
    if(c){stockData=JSON.parse(c);setBanner('warn',t('inaccessible'));}
    else{stockData={};setBanner('warn',t('pasDeCache'));}
  }
  const key=sessionStorage.getItem('tornKey');
  if(key){
    try{
      const r=await fetch(`https://api.torn.com/torn/?selections=items&key=${key}`);
      const d=await r.json();
      if(d.items){
        priceData={};
        Object.entries(d.items).forEach(([id,item])=>{
          if(item.market_value>0){priceData[parseInt(id)]=item.market_value;priceData[item.name]=item.market_value;}
        });
        setBanner('info',t('prixCharge'));
      }
    }catch(_){setBanner('warn',t('prixIndispo'));}
  }
  compute();
  btn.classList.remove('loading');
}

/* ── Modèle de stock calibré ────────────────────────────────────
   Distribution réelle des délais restock (109 cycles mesurés) :
   - Bimodale : pic à ~12-13 min et ~18-19 min
   - Moyenne globale : 15.0 min | Std : 3.5 min
   - P25=12.6 min | P75=18.1 min
   On modélise : 50% de chances dans [11.5-14] min, 50% dans [17-25] min
─────────────────────────────────────────────────────────────── */
const RESTOCK_DIST = {
  // [prob_cumulative, delai_min] — distribution empirique peluches
  p10: 11.5, p25: 12.6, p50: 14.7, p75: 18.1, p90: 20.5, p99: 31.8
};

function nextTCTTick(ts) {
  // Prochain multiple de 15 min en UTC
  return Math.ceil(ts / (15*60)) * (15*60);
}

function estimateStock(item, yataQty, lastUpdateTs, targetTs) {
  const nowTs = Date.now()/1000;
  const { restockQty, vidageMin, restockMin } = item;

  // Pas de données YATA
  if (!lastUpdateTs || yataQty === undefined) {
    return { qty: null, proba: 0.5, label: t('inconnu'), prediction: null };
  }

  const decayPerSec = restockQty / (vidageMin * 60);
  const totalElapsed = (nowTs - lastUpdateTs) + (targetTs - nowTs);

  let stock = yataQty;
  let emptyAt = null;
  let restockAt = null;

  for (let elapsed = 0; elapsed < totalElapsed; elapsed += 30) {
    stock = Math.max(0, stock - decayPerSec * 30);
    if (stock === 0 && emptyAt === null) {
      emptyAt = lastUpdateTs + elapsed;
    }
    if (emptyAt !== null && restockAt === null) {
      const tick = nextTCTTick(emptyAt);
      // Restock après le tick + restockMin moyen
      const restockTs = tick + (restockMin || 15) * 60;
      if (lastUpdateTs + elapsed >= restockTs) {
        stock = restockQty;
        restockAt = restockTs;
        emptyAt = null;
      }
    }
  }

  // Calcul probabilité avec distribution réelle
  const absNow = nowTs;
  const absTarget = targetTs;

  let proba, label;
  const prediction = {
    stockAtNow: Math.round(Math.max(0, yataQty - decayPerSec * (nowTs - lastUpdateTs))),
    emptyAt: emptyAt ? fmtH(emptyAt) : null,
    nextTick: emptyAt ? fmtH(nextTCTTick(emptyAt)) : null,
    restockMin: restockMin || 15,
    restockWindow: emptyAt ? {
      early: fmtH(nextTCTTick(emptyAt) + RESTOCK_DIST.p10 * 60),
      mid:   fmtH(nextTCTTick(emptyAt) + RESTOCK_DIST.p50 * 60),
      late:  fmtH(nextTCTTick(emptyAt) + RESTOCK_DIST.p90 * 60),
    } : null,
  };

  if (stock >= restockQty * 0.5) { proba=0.90; label=`~${Math.round(stock)} ${t('enStock')}`; }
  else if (stock >= 100)          { proba=0.65; label=`~${Math.round(stock)} (${t('stockFaible')})`; }
  else if (stock > 0)             { proba=0.30; label=t('stockTresFaible'); }
  else if (emptyAt !== null) {
    const tick = nextTCTTick(emptyAt);
    const timeSinceTick = targetTs - tick;
    if (timeSinceTick < 0) { proba=0.05; label=t('restockLointain'); }
    else if (timeSinceTick < RESTOCK_DIST.p10 * 60) { proba=0.10; label=t('restockLointain'); }
    else if (timeSinceTick < RESTOCK_DIST.p25 * 60) { proba=0.25; label=t('restockProb'); }
    else if (timeSinceTick < RESTOCK_DIST.p50 * 60) { proba=0.50; label=t('restockProb'); }
    else if (timeSinceTick < RESTOCK_DIST.p75 * 60) { proba=0.75; label=t('restockProb'); }
    else if (timeSinceTick < RESTOCK_DIST.p90 * 60) { proba=0.90; label=t('enStock'); }
    else { proba=0.95; label=t('enStock'); }
  } else { proba=0.95; label=`~${Math.round(stock)} ${t('enStock')}`; }

  return { qty: Math.round(stock), proba, label, prediction };
}

/* ── Calcul ─────────────────────────────────────────────────── */
function compute() {
  const mode=document.getElementById('flightMode').value;
  const sessionMin=parseInt(document.getElementById('sessionHours').value)*60;
  const budgetCap=parseInt(document.getElementById('travelBudget').value)||0;
  const freshMax=parseFloat(document.getElementById('freshnessFilter').value);
  const minFlight=parseInt(document.getElementById('minFlightTime').value)||0;
  const maxTripsAllowed=parseInt(document.getElementById('maxTrips').value)||999;
  const canFinishAbroad=document.getElementById('finishAbroad').value==='yes';
  const wantPlush=document.getElementById('f_plushie').checked;
  const wantFlower=document.getElementById('f_flower').checked;
  const wantDrug=document.getElementById('f_drug').checked;
  const toyBonus=parseInt(document.getElementById('jobToy').value)||0;
  const flowerBonus=parseInt(document.getElementById('jobFlower').value)||0;
  const baseCapacity=getBaseCapacity();
  const now=Date.now()/1000, departTs=getDepartTs(), runs=[];

  COUNTRIES.forEach(country=>{
    if(excludedCountries.has(country.code)) return;
    const tOneWay=country.timeMin[mode]||country.timeMin.airstrip;
    if(tOneWay<minFlight) return;
    const tripMin=tOneWay*2+5;
    let maxTrips=canFinishAbroad
      ?(sessionMin>=tOneWay?Math.floor((sessionMin-tOneWay)/tripMin)+1:0)
      :Math.floor(sessionMin/tripMin);
    maxTrips=Math.min(maxTrips,maxTripsAllowed);
    if(maxTrips<1) return;

    const cs=stockData?.stocks?.[country.code]??null;
    const lastUpdate=cs?.update??0;
    const ageH=lastUpdate?(now-lastUpdate)/3600:Infinity;
    if(lastUpdate&&ageH>freshMax) return;

    const yataMap={};
    if(cs?.stocks) cs.stocks.forEach(s=>{yataMap[s.id]=s.quantity;});

    const avail=ITEMS.filter(item=>{
      if(item.country!==country.code) return false;
      if(item.type==='plushie'&&!wantPlush) return false;
      if(item.type==='flower'&&!wantFlower) return false;
      if(item.type==='drug'&&!wantDrug) return false;
      return true;
    });
    if(!avail.length) return;

    const firstArrival=departTs+tOneWay*60;
    const sorted=avail.map(item=>{
      const sell=priceData[item.tornId]||priceData[item.name]||item.sell;
      const est=estimateStock(item,yataMap[item.tornId]??yataMap[item.id],lastUpdate,firstArrival);
      return{...item,effectiveSell:sell,unitProfit:sell-item.buy,stockEst:est};
    }).sort((a,b)=>b.unitProfit-a.unitProfit);

    const breakdown=[];
    let baseRem=baseCapacity,toyRem=toyBonus,flowerRem=flowerBonus;
    sorted.forEach(item=>{
      let qty=0;
      if(baseRem>0){qty=baseRem;baseRem=0;}
      if(item.type==='plushie'&&toyRem>0){qty+=toyRem;toyRem=0;}
      if(item.type==='flower'&&flowerRem>0){qty+=flowerRem;flowerRem=0;}
      if(qty<=0) return;
      breakdown.push({
        ...item,qty,
        stockProba:item.stockEst.proba,
        stockLabel:item.stockEst.label,
        stockPred:item.stockEst.prediction,
        grossProfit:item.unitProfit*qty,
        adjustedProfit:item.unitProfit*qty*item.stockEst.proba,
        yataQtyNow:yataMap[item.tornId]??yataMap[item.id]??null,
      });
    });
    if(!breakdown.length) return;

    const travelCost=budgetCap>0?Math.min(budgetCap,country.cost):country.cost;
    const rawProfitTrip=breakdown.reduce((s,b)=>s+b.grossProfit,0);
    const adjProfitTrip=breakdown.reduce((s,b)=>s+b.adjustedProfit,0);
    const totalTravelCost=canFinishAbroad?travelCost*2*(maxTrips-1)+travelCost:travelCost*2*maxTrips;
    const totalProfit=adjProfitTrip*maxTrips-totalTravelCost;
    const profitPerHour=totalProfit/(sessionMin/60);
    const cashRequired=breakdown.reduce((s,b)=>s+b.buy*b.qty,0)+travelCost*2;

    const trips=Array.from({length:maxTrips},(_,i)=>{
      const startTs=departTs+i*(tOneWay*2+5)*60;
      const arriveTs=startTs+tOneWay*60;
      const returnTs=arriveTs+5*60;
      const isLast=canFinishAbroad&&i===maxTrips-1;
      return{startTs,arriveTs,returnTs,landTs:isLast?null:returnTs+tOneWay*60,isLastAbroad:isLast};
    });

    runs.push({
      country,tOneWay,tripMin,maxTrips,
      rawProfitTrip,adjProfitTrip,netPerTrip:adjProfitTrip-travelCost*2,
      totalProfit,profitPerHour,cashRequired,
      breakdown,lastUpdate,ageH,travelCost,trips,departTs,canFinishAbroad,
      totalCapacity:baseCapacity+toyBonus+flowerBonus,
    });
  });

  runs.sort((a,b)=>b.totalProfit-a.totalProfit);
  window._runs=runs;
  renderResults(runs,mode);
}

/* ── Rendu ──────────────────────────────────────────────────── */
function renderResults(runs,mode) {
  const empty=document.getElementById('emptyState');
  if(!runs.length){
    empty.style.display='flex';
    ['globalStats','bestRunTimeline','otherRuns'].forEach(id=>document.getElementById(id).style.display='none');
    return;
  }
  empty.style.display='none';
  const best=runs[0];
  document.getElementById('gs_profit').textContent='$'+fmt(best.totalProfit);
  document.getElementById('gs_pph').textContent='$'+fmt(best.profitPerHour)+'/h';
  document.getElementById('gs_cash').textContent='$'+fmt(best.cashRequired);
  document.getElementById('gs_trips').textContent=best.maxTrips;
  document.getElementById('globalStats').style.display='grid';
  document.getElementById('bestRunTimeline').style.display='block';
  renderTimeline(best, 0);

  if(runs.length>1){
    document.getElementById('otherRuns').style.display='block';
    const list=document.getElementById('otherRunsList');
    list.innerHTML='';
    runs.slice(1,6).forEach((run,i)=>list.appendChild(buildCompactCard(run,i+1)));
    if(runs.length>6){
      const more=document.createElement('p');
      more.style.cssText='text-align:center;color:var(--text3);font-size:12px;padding:.75rem;cursor:pointer;border:1px solid var(--border);border-radius:var(--radius-sm);margin-top:.5rem';
      more.textContent=`${t('voirAutres')} ${runs.length-6} ${t('autresLabel')}`;
      more.onclick=()=>{runs.slice(6).forEach((r,i)=>list.insertBefore(buildCompactCard(r,i+6),more));more.remove();};
      list.appendChild(more);
    }
  } else {
    document.getElementById('otherRuns').style.display='none';
  }
}

/* ── Timeline ───────────────────────────────────────────────── */
function renderTimeline(run, rank) {
  const sessionEnd=run.departTs+parseInt(document.getElementById('sessionHours').value)*3600;
  const totalDuration=sessionEnd-run.departTs;

  const nodes=[];
  nodes.push({type:'depart',ts:run.departTs,label:t('depart_label')});
  run.trips.forEach((trip,i)=>{
    nodes.push({type:'arrive',ts:trip.arriveTs,country:run.country,trip:i+1,items:run.breakdown,profit:run.breakdown.reduce((s,b)=>s+b.grossProfit,0)});
    if(trip.isLastAbroad) nodes.push({type:'abroad',ts:trip.arriveTs+5*60,label:t('resteEtranger')});
    else nodes.push({type:'return',ts:trip.landTs,label:`${t('retour')} T${i+1}`});
  });
  nodes.forEach(n=>{ n.pct=Math.min(95,Math.max(5,(n.ts-run.departTs)/totalDuration*100)); });

  let html='<div class="tl-track-wrap"><div class="tl-line"></div>';
  nodes.forEach((n,i)=>{
    const pct=n.pct;
    const align=pct>70?'right':pct<30?'left':'center';
    const transformMap={left:'translateX(0)',center:'translateX(-50%)',right:'translateX(-100%)'};
    const transform=transformMap[align];
    const above=i%2===0;
    let dotHtml='',contentHtml='';
    if(n.type==='depart'||n.type==='return'){
      dotHtml=`<div class="tl-dot tl-dot-torn"></div>`;
      contentHtml=`<div class="tl-nc-time">${fmtH(n.ts)}</div><div class="tl-nc-label">${n.label}</div>`;
    } else if(n.type==='arrive'){
      const mainItem=n.items[0];
      const probaStr=Math.round(mainItem.stockProba*100)+'%';
      dotHtml=`<div class="tl-dot tl-dot-country"><img src="https://flagcdn.com/20x15/${n.country.flag}.png" width="20" height="15" style="border-radius:2px;display:block" onerror="this.style.display='none'"></div>`;
      contentHtml=`<div class="tl-nc-time">${fmtH(n.ts)}</div>
        <div class="tl-nc-country">${n.country.name}</div>
        <div class="tl-nc-item">
          <img src="https://www.torn.com/images/items/${mainItem.tornId}/large.png" style="width:34px;height:34px;object-fit:contain;border-radius:5px;background:var(--bg3);flex-shrink:0" onerror="this.style.display='none'">
          <div>
            <div style="font-size:11px;color:var(--text2)">×${mainItem.qty} ${mainItem.name}</div>
            <div class="tl-nc-profit">+$${fmt(n.profit)}</div>
            <div style="font-size:10px;color:var(--text3)">${probaStr} ${t('enStock')} · T${n.trip}</div>
          </div>
        </div>`;
    } else {
      dotHtml=`<div class="tl-dot tl-dot-end"></div>`;
      contentHtml=`<div class="tl-nc-time">${fmtH(n.ts)}</div><div class="tl-nc-label">${n.label}</div>`;
    }
    const contentEl=`<div class="tl-nc" style="transform:${transform};${above?'bottom:calc(100% + 14px)':'top:calc(100% + 14px)'};text-align:${align}">${contentHtml}</div>`;
    html+=`<div class="tl-node" style="left:${pct}%">${above?contentEl:''}${dotHtml}${!above?contentEl:''}</div>`;
  });
  html+=`</div>`;

  // Bouton détail pour le meilleur run
  html+=`<div style="margin-top:1rem;text-align:right">
    <button class="btn-detail" onclick="showRunDetail(${rank})" style="padding:6px 16px;font-size:12px">${t('detail')} →</button>
  </div>`;

  document.getElementById('timelineInner').innerHTML=html;
}

/* ── Cartes compactes ───────────────────────────────────────── */
function buildCompactCard(run,rank) {
  const card=document.createElement('div');
  card.className='compact-card';
  const freshnessChip=run.lastUpdate
    ?`<span class="chip ${run.ageH<1?'chip-green':run.ageH<4?'chip-amber':'chip-red'}">${run.ageH<1?'< 1h':run.ageH<4?'< 4h':'> 4h'}</span>`
    :`<span class="chip chip-amber">${t('inconnu')}</span>`;
  card.innerHTML=`
    <div class="compact-left">
      <img src="https://flagcdn.com/24x18/${run.country.flag}.png" width="24" height="18" style="border-radius:2px;flex-shrink:0" onerror="this.style.display='none'">
      <div>
        <div style="font-size:14px;font-weight:600">${run.country.name}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:2px;display:flex;align-items:center;gap:6px">
          ✈ ${run.tOneWay} ${t('min')} · ${run.maxTrips} trip${run.maxTrips>1?'s':''} · ${run.totalCapacity} items ${freshnessChip}
        </div>
      </div>
    </div>
    <div class="compact-items">
      ${run.breakdown.slice(0,3).map(b=>`<div class="compact-item">
        <img src="https://www.torn.com/images/items/${b.tornId}/large.png" style="width:32px;height:32px;object-fit:contain;border-radius:4px;background:var(--bg3)" onerror="this.style.display='none'">
        <div style="font-size:10px;color:var(--text2);text-align:center">×${b.qty}</div>
      </div>`).join('')}
    </div>
    <div class="compact-right">
      <div class="compact-profit">$${fmt(run.totalProfit)}</div>
      <div style="font-size:11px;color:var(--text2)">$${fmt(run.profitPerHour)}/h</div>
      <button class="btn-detail" onclick="showRunDetail(${rank-1})">${t('detail')}</button>
    </div>`;
  return card;
}

/* ── Modal détail ───────────────────────────────────────────── */
function showRunDetail(rank) {
  const run=window._runs?.[rank]; if(!run) return;
  document.getElementById('modalTitle').innerHTML=
    `<img src="https://flagcdn.com/20x15/${run.country.flag}.png" width="20" height="15" style="border-radius:2px;margin-right:8px;vertical-align:middle" onerror="this.style.display='none'">${run.country.name} — ${t('detailRun')}`;
  document.getElementById('modalContent').innerHTML=buildDetailHTML(run);
  document.getElementById('timelineModal').style.display='flex';
}
function closeModal(e){
  if(e.target===document.getElementById('timelineModal'))
    document.getElementById('timelineModal').style.display='none';
}

/* ── Contenu modal ──────────────────────────────────────────── */
function buildDetailHTML(run) {
  const sessionMin=parseInt(document.getElementById('sessionHours').value)*60;
  const departTs=run.departTs, endTs=departTs+sessionMin*60;
  const WINDOW_SEC=Math.min(2.5*3600,endTs-departTs);
  const chartH=120, W=640;
  const mainItem=run.breakdown[0];
  const RESTOCK=mainItem?.restockQty??2500;
  const vidageSec=(mainItem?.vidageMin??60)*60;
  const decay=RESTOCK/vidageSec;
  const restockDelaySec=(mainItem?.restockMin??15)*60;

  let stock=mainItem?.yataQtyNow??RESTOCK, emptyAt=null;
  const pts=[];
  for(let t2=departTs;t2<=endTs;t2+=60){
    stock=Math.max(0,stock-decay*60);
    if(stock===0&&emptyAt===null) emptyAt=t2;
    if(emptyAt!==null){
      const tick=nextTCTTick(emptyAt);
      if(t2>=tick+restockDelaySec){stock=RESTOCK;emptyAt=null;}
    }
    pts.push({ts:t2,qty:stock});
  }

  const totalSec=endTs-departTs;
  const numPanels=Math.ceil(totalSec/WINDOW_SEC);
  function tsX(ts,ps){return((ts-ps)/WINDOW_SEC*W).toFixed(1);}
  function qY(q){return(chartH-(q/RESTOCK)*chartH).toFixed(1);}

  let svgs='';
  for(let p=0;p<numPanels;p++){
    const ps=departTs+p*WINDOW_SEC, pe=Math.min(ps+WINDOW_SEC,endTs);
    const pp=pts.filter(pt=>pt.ts>=ps&&pt.ts<=pe);
    if(!pp.length) continue;
    const pathD=pp.map((pt,i)=>`${i===0?'M':'L'}${tsX(pt.ts,ps)},${qY(pt.qty)}`).join(' ');
    let ticks='',tk=Math.ceil(ps/(15*60))*15*60;
    while(tk<=pe){ticks+=`<line x1="${tsX(tk,ps)}" y1="0" x2="${tsX(tk,ps)}" y2="${chartH}" stroke="rgba(255,255,255,.06)" stroke-width="0.8"/>`;tk+=15*60;}
    let evs='';
    run.trips.forEach(t2=>{
      if(t2.startTs>=ps&&t2.startTs<=pe) evs+=`<line x1="${tsX(t2.startTs,ps)}" y1="0" x2="${tsX(t2.startTs,ps)}" y2="${chartH}" stroke="#4f7ef8" stroke-width="1" stroke-dasharray="4,3"/>`;
      if(t2.arriveTs>=ps&&t2.arriveTs<=pe) evs+=`<line x1="${tsX(t2.arriveTs,ps)}" y1="0" x2="${tsX(t2.arriveTs,ps)}" y2="${chartH}" stroke="#ef4444" stroke-width="2"/>`;
    });
    let lbls='',lt=Math.ceil(ps/(30*60))*30*60;
    while(lt<=pe){lbls+=`<text x="${tsX(lt,ps)}" y="${chartH+13}" font-size="9" fill="rgba(255,255,255,.3)" text-anchor="middle">${fmtH(lt)}</text>`;lt+=30*60;}
    svgs+=`<svg viewBox="0 0 ${W} ${chartH+16}" width="${W}" height="${chartH+16}" style="display:block;flex-shrink:0">
      <text x="2" y="9" font-size="8" fill="rgba(255,255,255,.2)">${RESTOCK}</text>
      <text x="2" y="${chartH-1}" font-size="8" fill="rgba(255,255,255,.2)">0</text>
      ${ticks}${evs}
      <path d="${pathD} L${W},${chartH} L0,${chartH} Z" fill="rgba(79,126,248,.08)"/>
      <path d="${pathD}" fill="none" stroke="#4f7ef8" stroke-width="1.5"/>
      ${lbls}
    </svg>`;
  }

  // Prédiction textuelle pour le premier trip
  const firstTrip=run.trips[0];
  const pred=mainItem?.stockPred;
  let predHTML='';
  if(pred){
    predHTML=`<div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid #4fc3f7;padding:1rem;margin-bottom:1rem;font-size:12px">
      <div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#4fc3f7;margin-bottom:.6rem">${t('prediction')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem .75rem">
        <span style="color:var(--text2)">${t('stockActuel')}</span><span>${pred.stockAtNow??'?'}</span>
        ${pred.emptyAt?`<span style="color:var(--text2)">${t('stockZero')}</span><span>${pred.emptyAt}</span>`:''}
        ${pred.nextTick?`<span style="color:var(--text2)">${t('prochainTick')}</span><span style="color:#c8f542">${pred.nextTick}</span>`:''}
        ${pred.restockWindow?`<span style="color:var(--text2)">${t('restockAttendu')}</span><span style="color:#f5a623">${pred.restockWindow.early} – ${pred.restockWindow.late}<br><span style="font-size:10px;color:var(--text3)">(moy. ${pred.restockWindow.mid})</span></span>`:''}
        <span style="color:var(--text2)">${t('arrivee')}</span><span style="color:#ef4444">${fmtH(firstTrip.arriveTs)}</span>
        <span style="color:var(--text2)">${t('probaArr')}</span><span style="color:var(--green);font-weight:600">${Math.round(mainItem.stockProba*100)}% — ${mainItem.stockLabel}</span>
      </div>
    </div>`;
  }

  // Items
  const itemRows=run.breakdown.map(b=>{
    const color=TYPE_COLORS[b.type]||'#888';
    const barW=Math.round(b.stockProba*100);
    return `<div class="tl-item-row">
      <img src="https://www.torn.com/images/items/${b.tornId}/large.png" style="width:40px;height:40px;object-fit:contain;border-radius:6px;background:var(--bg3);flex-shrink:0" onerror="this.style.display='none'">
      <div style="flex:1;min-width:0">
        <div style="font-weight:500;font-size:13px">${b.name}</div>
        <div style="font-size:11px;color:var(--text3)">${b.stockLabel}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-right:12px">
        <div style="font-size:12px;color:var(--text2)">×${b.qty} · $${fmt(b.buy*b.qty)}</div>
        <div style="font-size:13px;color:var(--green);font-weight:600">+$${fmt(b.grossProfit)}</div>
      </div>
      <div style="width:70px;flex-shrink:0">
        <div class="tl-proba-bar"><div class="tl-proba-fill" style="width:${barW}%;background:${color}"></div></div>
        <div style="font-size:10px;color:${color};text-align:right;margin-top:2px">${barW}%</div>
      </div>
    </div>`;
  }).join('');

  const avgProba=Math.round(run.breakdown.reduce((s,b)=>s+b.stockProba,0)/run.breakdown.length*100);
  const profitExplain=`<div class="profit-explain">
    <div class="pe-row"><span>${t('profitBrut')}</span><span>$${fmt(run.rawProfitTrip)}</span></div>
    <div class="pe-row"><span>${t('probaStock')}</span><span>${avgProba}%</span></div>
    <div class="pe-row"><span>${t('profitAjuste')}</span><span>$${fmt(run.adjProfitTrip)}</span></div>
    <div class="pe-row"><span>${t('fraisVolAR')}</span><span>−$${fmt(run.travelCost*2)}</span></div>
    <div class="pe-row"><span>${t('profitNet')}</span><span class="green">$${fmt(run.netPerTrip)}</span></div>
    <div class="pe-row pe-total"><span>× ${run.maxTrips} trips</span><span class="green">$${fmt(run.totalProfit)}</span></div>
  </div>`;

  const tripRows=run.trips.slice(0,3).map((tr,i)=>`
    <div class="tl-trip-row">
      <span class="tl-trip-num">T${i+1}</span>
      <span class="tl-trip-seg" style="background:rgba(79,126,248,.15);border:1px solid rgba(79,126,248,.3)">✈ ${fmtH(tr.startTs)}</span>
      <span class="tl-arrow">→</span>
      <span class="tl-trip-seg" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3)">🛬 ${fmtH(tr.arriveTs)}</span>
      ${tr.isLastAbroad
        ?`<span class="tl-arrow">→</span><span class="tl-trip-seg" style="background:rgba(34,197,94,.2)">🏖 ${t('resteEtranger')}</span>`
        :`<span class="tl-arrow">→</span><span class="tl-trip-seg" style="background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3)">✈ ${fmtH(tr.returnTs)}</span>
          <span class="tl-arrow">→</span><span class="tl-trip-seg" style="background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3)">🛬 ${fmtH(tr.landTs)}</span>`
      }
    </div>`).join('');
  const moreTrips=run.maxTrips>3?`<p style="font-size:11px;color:var(--text3);margin-top:6px">… + ${run.maxTrips-3} ${t('plusTrips')}</p>`:'';

  return `
    <div class="tl-section-title">${t('stockEstime')} — ${mainItem?.name||''}
      <span style="font-size:11px;font-weight:400;margin-left:10px;color:var(--text3)">
        <span style="display:inline-block;width:10px;height:2px;background:#4f7ef8;vertical-align:middle"></span> ${t('depart_label')} &nbsp;
        <span style="display:inline-block;width:10px;height:2px;background:#ef4444;vertical-align:middle"></span> ${t('arrivee_label')}
      </span>
    </div>
    <div style="overflow-x:auto;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg3);padding:.5rem .75rem">
      <div style="display:flex;width:${W*numPanels}px">${svgs}</div>
    </div>
    <p style="font-size:10px;color:var(--text3);margin-top:4px">${t('simulBasee')}</p>

    ${predHTML}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1.25rem">
      <div><div class="tl-section-title">${t('itemsAcheter')}</div>${itemRows}</div>
      <div><div class="tl-section-title">${t('calcProfit')}</div>${profitExplain}</div>
    </div>

    <div class="tl-section-title" style="margin-top:1.25rem">Trips</div>
    <div class="tl-trips">${tripRows}${moreTrips}</div>

    <div class="tl-summary">
      <span>${t('profitTotal')} : <strong class="green">$${fmt(run.totalProfit)}</strong></span>
      <span>${t('sessionUtilisee')} : <strong>${Math.round(run.tripMin*run.maxTrips/60*10)/10}h / ${document.getElementById('sessionHours').value}h</strong></span>
    </div>`;
}

/* ── Helpers ────────────────────────────────────────────────── */
function timeAgo(ts){const d=Math.round((Date.now()/1000-ts)/60);if(d<1)return'à l\'instant';if(d<60)return`il y a ${d} min`;return`il y a ${Math.round(d/60)}h`;}
function fmt(n){return Math.round(n).toLocaleString('fr-FR');}
function setBanner(type,msg){const el=document.getElementById('statusBanner');el.className=`banner banner-${type}`;el.textContent=msg;el.style.display='flex';}
