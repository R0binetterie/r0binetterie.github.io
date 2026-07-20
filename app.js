/* ================================================================
   app.js — Torn Travel Optimizer
   ================================================================ */

let stockData=null,priceData={},excludedCountries=new Set();
let recomputeTimer=null,departMode='now',departCustomTime=null;
let currentLang=localStorage.getItem('lang')||'fr';

/* ── i18n ──────────────────────────────────────────────────────── */
const T={
  fr:{
    yataLabel:'YATA',instantLabel:'à l\'instant',
    actualiser:'Actualiser YATA',recalculer:'Recalculer',
    cleApi:'Clé API Torn',clePublique:'Clé publique (optionnel)',
    cleHint:'Niveau "Public Only" — pour les prix marché temps réel.',
    enregistrer:'Enregistrer',
    session:'Session de jeu',depart:'Heure de départ',maintenant:'Maintenant',
    duree:'Durée de session',budget:'Budget max par aller-retour',pasDeLimite:'Pas de limite',
    preferences:'Préférences de voyage',longueurMin:'Longueur minimale du vol',
    tous:'Tous',nbMaxTrips:'Nombre max de trips',
    finSession:'Fin de session',retourOblig:'Retour à Torn obligatoire',finEtranger:'Peut finir à l\'étranger',
    finEtrangerHint:'Si "finit à l\'étranger", le dernier aller ne compte pas le vol retour.',
    modeVol:'Mode de vol',typeVoyage:'Type de voyage',valise:'Valise',aucune:'Aucune',
    bonusFaction:'Bonus faction (Excursion)',
    lingerie:'Lingerie Store (3★)',cruise:'Cruise Line',capaciteBase:'Capacité de base',
    bonusJob:'Bonus de job',bonusJobHint:'Slots supplémentaires pour le type d\'item concerné uniquement.',
    toyShop:'Toy Shop (7★) — peluches',flowerShop:'Flower Shop (7★) — fleurs',
    filtres:'Filtres',typesItems:'Types d\'items',
    peluches:'🧸 Peluches',fleurs:'🌸 Fleurs',drogues:'💊 Drogues',
    fraicheur:'Fraîcheur données YATA',
    toutesData:'Toutes',moinsde4h:'Moins de 4h',moinsde2h:'Moins de 2h',moinsde1h:'Moins de 1h',
    paysExclus:'Pays exclus',
    meilleureRun:'Meilleur run',autresOptions:'Autres options',
    profit:'PROFIT',profitH:'PROFIT/HEURE',cashRequis:'CASH REQUIS',trips:'TRIPS',
    destinations:'destinations',meilleureProfit:'meilleur profit total',
    tripsLabel:'trips (meilleur run)',parHeureLabel:'$/heure',
    parTripBrut:'Par trip (brut)',parTripNet:'Par trip (net)',
    parHeure:'Par heure',fraisVol:'Frais vol',detail:'Détail',
    finEtrangerBadge:'Finit à l\'étranger',donneesLabel:'Données',
    pret:'Prêt à décoller',
    pretSub:'Clique sur Actualiser YATA pour charger les stocks, ou Recalculer si tu as déjà des données en cache.',
    actualiserCalculer:'Actualiser YATA + Calculer',recalculerCache:'Recalculer (cache)',
    voirAutres:'Voir les',autresLabel:'autres ▼',
    stockEstime:'Stock estimé',itemsAcheter:'Items à acheter',calcProfit:'Calcul du profit',
    profitBrut:'Profit brut / trip',probaStock:'× proba stock moy.',
    profitAjuste:'= profit ajusté / trip',fraisVolAR:'− frais vol A/R',
    profitNet:'= profit net / trip',
    profitTotal:'💰 Profit total',sessionUtilisee:'Session utilisée',
    prediction:'Prédiction de stock',stockActuel:'Stock actuel',
    prochainTick:'Prochain tick TCT',stockZero:'Stock à 0 estimé à',
    restockAttendu:'Restock attendu entre',arrivee:'Arrivée',probaArr:'Probabilité à l\'arrivée',
    enStock:'en stock',stockFaible:'stock faible',stockTresFaible:'stock très faible',
    restockProb:'restock probable à l\'arrivée',restockLointain:'stock vide, restock lointain',
    inconnu:'inconnu',simulBasee:'Simulation basée sur données réelles (yata_tracker.py)',
    detailRun:'Détail du run',depart_label:'Départ',arrivee_label:'Arrivée',
    resteEtranger:'Reste à l\'étranger',retour:'Retour',
    plusTrips:'trips identiques',min:'min',
    chargement:'⏳ Récupération des stocks YATA…',charge:'✅ Stocks YATA chargés.',
    inaccessible:'⚠️ YATA inaccessible — cache utilisé.',pasDeCache:'⚠️ YATA inaccessible — prix historiques.',
    prixCharge:'✅ Stocks YATA + prix marché Torn chargés.',prixIndispo:'⚠️ Prix Torn API indisponibles.',
    cacheYATA:'Cache YATA',minutesAgo:'min',actualiserPour:'Clique "Actualiser YATA" pour rafraîchir.',
    cyclesMesures:'cycles mesurés',
    airstrip:'Airstrip (−30%) — 15 items',standard:'Standard — 5 items',
    wlt:'WLT (−50%) — 15 items',business:'Business Class (−70%) — 15 items',
    small:'Small (+2)',medium:'Medium (+3)',large:'Large (+4)',
    tripMax1:'1 trip',tripMax2:'2 trips max',tripMax3:'3 trips max',tripMax5:'5 trips max',
    tripMaxNone:'Pas de limite',
  },
  en:{
    yataLabel:'YATA',instantLabel:'just now',
    actualiser:'Refresh YATA',recalculer:'Recalculate',
    cleApi:'Torn API Key',clePublique:'Public key (optional)',
    cleHint:'"Public Only" level — for real-time market prices.',
    enregistrer:'Save',
    session:'Gaming session',depart:'Departure time',maintenant:'Now',
    duree:'Session duration',budget:'Max budget per round trip',pasDeLimite:'No limit',
    preferences:'Travel preferences',longueurMin:'Minimum flight duration',
    tous:'All',nbMaxTrips:'Max trips',
    finSession:'End of session',retourOblig:'Must return to Torn',finEtranger:'Can finish abroad',
    finEtrangerHint:'If "finish abroad", the last trip doesn\'t count the return flight.',
    modeVol:'Flight mode',typeVoyage:'Travel type',valise:'Suitcase',aucune:'None',
    bonusFaction:'Faction bonus (Excursion)',
    lingerie:'Lingerie Store (3★)',cruise:'Cruise Line',capaciteBase:'Base capacity',
    bonusJob:'Job bonus',bonusJobHint:'Extra slots for the relevant item type only.',
    toyShop:'Toy Shop (7★) — plushies',flowerShop:'Flower Shop (7★) — flowers',
    filtres:'Filters',typesItems:'Item types',
    peluches:'🧸 Plushies',fleurs:'🌸 Flowers',drogues:'💊 Drugs',
    fraicheur:'YATA data freshness',
    toutesData:'All',moinsde4h:'Less than 4h',moinsde2h:'Less than 2h',moinsde1h:'Less than 1h',
    paysExclus:'Excluded countries',
    meilleureRun:'Best run',autresOptions:'Other options',
    profit:'PROFIT',profitH:'PROFIT/HOUR',cashRequis:'CASH REQUIRED',trips:'TRIPS',
    destinations:'destinations',meilleureProfit:'best total profit',
    tripsLabel:'trips (best run)',parHeureLabel:'$/hour',
    parTripBrut:'Per trip (gross)',parTripNet:'Per trip (net)',
    parHeure:'Per hour',fraisVol:'Flight cost',detail:'Detail',
    finEtrangerBadge:'Finishes abroad',donneesLabel:'Data',
    pret:'Ready for takeoff',
    pretSub:'Click Refresh YATA to load live stocks, or Recalculate if you already have cached data.',
    actualiserCalculer:'Refresh YATA + Calculate',recalculerCache:'Recalculate (cache)',
    voirAutres:'Show',autresLabel:'more ▼',
    stockEstime:'Estimated stock',itemsAcheter:'Items to buy',calcProfit:'Profit breakdown',
    profitBrut:'Gross profit / trip',probaStock:'× avg stock proba',
    profitAjuste:'= adjusted profit / trip',fraisVolAR:'− round trip cost',
    profitNet:'= net profit / trip',
    profitTotal:'💰 Total profit',sessionUtilisee:'Session used',
    prediction:'Stock prediction',stockActuel:'Current stock',
    prochainTick:'Next TCT tick',stockZero:'Stock hits 0 at',
    restockAttendu:'Restock expected between',arrivee:'Arrival',probaArr:'Probability at arrival',
    enStock:'in stock',stockFaible:'low stock',stockTresFaible:'very low stock',
    restockProb:'restock likely at arrival',restockLointain:'empty, restock far away',
    inconnu:'unknown',simulBasee:'Simulation based on real data (yata_tracker.py)',
    detailRun:'Run detail',depart_label:'Departure',arrivee_label:'Arrival',
    resteEtranger:'Stays abroad',retour:'Return',
    plusTrips:'identical trips',min:'min',
    chargement:'⏳ Fetching YATA stocks…',charge:'✅ YATA stocks loaded.',
    inaccessible:'⚠️ YATA unavailable — using cache.',pasDeCache:'⚠️ YATA unavailable — historical prices.',
    prixCharge:'✅ YATA stocks + Torn market prices loaded.',prixIndispo:'⚠️ Torn API prices unavailable.',
    cacheYATA:'YATA cache',minutesAgo:'min ago',actualiserPour:'Click "Refresh YATA" to update.',
    cyclesMesures:'measured cycles',
    airstrip:'Airstrip (−30%) — 15 items',standard:'Standard — 5 items',
    wlt:'WLT (−50%) — 15 items',business:'Business Class (−70%) — 15 items',
    small:'Small (+2)',medium:'Medium (+3)',large:'Large (+4)',
    tripMax1:'1 trip',tripMax2:'2 trips max',tripMax3:'3 trips max',tripMax5:'5 trips max',
    tripMaxNone:'No limit',
  }
};

function t(k){return T[currentLang]?.[k]||T.fr[k]||k;}

function setLang(lang){
  currentLang=lang;
  localStorage.setItem('lang',lang);
  // Mettre à jour tous les éléments avec data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.getAttribute('data-i18n');
    el.textContent=t(k);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    el.placeholder=t(el.getAttribute('data-i18n-ph'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{
    el.title=t(el.getAttribute('data-i18n-title'));
  });
  // Options des selects
  document.querySelectorAll('select[data-i18n-select]').forEach(sel=>{
    const type=sel.getAttribute('data-i18n-select');
    if(type==='flightMode'){
      sel.options[0].text=t('standard');
      sel.options[1].text=t('airstrip');
      sel.options[2].text=t('wlt');
      sel.options[3].text=t('business');
    } else if(type==='suitcase'){
      sel.options[0].text=t('aucune');
      sel.options[1].text=t('small');
      sel.options[2].text=t('medium');
      sel.options[3].text=t('large');
    } else if(type==='maxTrips'){
      sel.options[0].text=t('tripMaxNone');
      sel.options[1].text=t('tripMax1');
      sel.options[2].text=t('tripMax2');
      sel.options[3].text=t('tripMax3');
      sel.options[4].text=t('tripMax5');
    } else if(type==='budget'){
      sel.options[0].text=t('pasDeLimite');
    } else if(type==='finishAbroad'){
      sel.options[0].text=t('retourOblig');
      sel.options[1].text=t('finEtranger');
    } else if(type==='freshness'){
      sel.options[0].text=t('toutesData');
      sel.options[1].text=t('moinsde4h');
      sel.options[2].text=t('moinsde2h');
      sel.options[3].text=t('moinsde1h');
    }
  });
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  if(stockData!==null && Object.keys(stockData).length>0) compute();
}

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  buildCountryFilters();
  updateCapacity();
  updateFlightLabel();
  setDepartNow();
  const savedKey=sessionStorage.getItem('tornKey');
  if(savedKey){document.getElementById('apiKey').value=savedKey;document.getElementById('keyStatus').textContent='✓';}
  const cached=localStorage.getItem('yataCache');
  if(cached){
    try{
      stockData=JSON.parse(cached);
      const age=Math.round((Date.now()/1000-stockData.timestamp)/60);
      document.getElementById('lastFetchInfo').textContent=`${t('cacheYATA')} (${age} ${t('minutesAgo')})`;
      setBanner('info',`📦 ${t('cacheYATA')} (${age} ${t('minutesAgo')}). ${t('actualiserPour')}`);
      compute();
    }catch(e){localStorage.removeItem('yataCache');}
  }
  setLang(currentLang);
});

/* ── Départ ─────────────────────────────────────────────────────── */
function setDepartNow(){
  departMode='now';departCustomTime=null;
  document.getElementById('btnNow').classList.add('active');
  document.getElementById('departTime').value='';
  scheduleRecompute();
}
function setDepartCustom(){
  const val=document.getElementById('departTime').value;if(!val)return;
  departMode='custom';departCustomTime=val;
  document.getElementById('btnNow').classList.remove('active');
  scheduleRecompute();
}
function getDepartTs(){
  if(departMode==='now')return Date.now()/1000;
  const [h,m]=departCustomTime.split(':').map(Number);
  const d=new Date();d.setHours(h,m,0,0);
  if(d.getTime()<Date.now())d.setDate(d.getDate()+1);
  return d.getTime()/1000;
}
function fmtH(ts){
  const d=new Date(ts*1000);
  return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
}

/* ── Slider vol ──────────────────────────────────────────────────── */
function updateFlightLabel(){
  const v=parseInt(document.getElementById('minFlightTime').value);
  if(v===0){document.getElementById('minFlightLabel').textContent=t('tous');document.getElementById('minFlightHint').textContent='';return;}
  const h=Math.floor(v/60),m=v%60;
  document.getElementById('minFlightLabel').textContent=(h?h+'h':'')+(m?m+t('min'):'')+' '+t('min');
  const n=COUNTRIES.filter(c=>c.timeMin.airstrip>=v).length;
  document.getElementById('minFlightHint').textContent=`${n} destination${n>1?'s':''}.`;
}

function saveKey(){
  const k=document.getElementById('apiKey').value.trim();if(!k)return;
  sessionStorage.setItem('tornKey',k);document.getElementById('keyStatus').textContent='✓';
}

/* ── Pays ────────────────────────────────────────────────────────── */
function buildCountryFilters(){
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

function getBaseCapacity(){
  const mode=document.getElementById('flightMode').value;
  const base=(mode==='standard'?10:15);
  const suitcase=parseInt(document.getElementById('suitcase').value)||0;
  const faction=parseInt(document.getElementById('factionBonus').value)||0;
  const job=document.getElementById('jobType').value;
  const smuggling=parseInt(document.getElementById('smuggling').value)||0;
  let jobBonus=0;
  if(job==='lingerie3')jobBonus=2;
  else if(job==='lingerie10')jobBonus=4;
  else if(job==='cruise3')jobBonus=2;
  else if(job==='cruise10')jobBonus=5;
  // toy7 et flower7 : bonus spécifique géré dans compute()
  return base+suitcase+faction+jobBonus+smuggling;
}
function getJobItemBonus(type){
  const job=document.getElementById('jobType').value;
  if(job==='toy7'&&type==='plushie')return 5;
  if(job==='flower7'&&type==='flower')return 5;
  return 0;
}
function updateJobUI(){
  const job=document.getElementById('jobType').value;
  // Si lingerie 10* → BC gratuite, forcer le mode BC
  if(job==='lingerie10'){
    document.getElementById('flightMode').value='business';
  }
}
function updateCapacity(){
  const cap=getBaseCapacity();
  document.getElementById('capacityDisplay').textContent=cap;
  const d2=document.getElementById('capacityDisplay2');if(d2)d2.textContent=cap;
  const mode=document.getElementById('flightMode').value;
  const base=(mode==='standard'?10:15);
  const suit=parseInt(document.getElementById('suitcase').value)||0;
  const fact=parseInt(document.getElementById('factionBonus').value)||0;
  const job=document.getElementById('jobType').value;
  const smug=parseInt(document.getElementById('smuggling').value)||0;
  const parts=[];
  parts.push(base+'base');
  if(suit)parts.push('+'+suit+'valise');
  if(fact)parts.push('+'+fact+'faction');
  if(job!=='none'&&job!=='toy7'&&job!=='flower7'){
    const jb=job.includes('10')?'lingerie10'===job?4:5:2;
    parts.push('+'+jb+'job');
  }
  if(smug)parts.push('+'+smug+'livre');
  document.getElementById('capacityBreakdown').textContent='('+parts.join(' ')+')';
}

function openDropdown(id){
  const allDDs=['profil','session','filtres','api'];
  // Fermer si déjà ouvert (toggle)
  const dd=document.getElementById('dd-'+id);
  const wasOpen=dd.classList.contains('open');
  // Fermer tous
  allDDs.forEach(n=>{
    document.getElementById('dd-'+n).classList.remove('open');
    document.getElementById('tab-'+n)?.classList.remove('active');
  });
  document.getElementById('dropdownOverlay').classList.remove('active');
  if(!wasOpen){
    dd.classList.add('open');
    document.getElementById('tab-'+id)?.classList.add('active');
    document.getElementById('dropdownOverlay').classList.add('active');
    // Positionner la flèche sous le tab cliqué
    const tab=document.getElementById('tab-'+id);
    if(tab){
      const rect=tab.getBoundingClientRect();
      const ddRect=dd.getBoundingClientRect();
      const centerX=rect.left+rect.width/2;
      const arrow=dd.querySelector('.dd-arrow');
      if(arrow){
        const ddLeft=window.innerWidth/2-ddRect.width/2;
        arrow.style.left=Math.max(20,Math.min(ddRect.width-20,centerX-ddLeft))+'px';
      }
    }
  }
}
function closeAllDropdowns(){
  ['profil','session','filtres','api'].forEach(n=>{
    document.getElementById('dd-'+n)?.classList.remove('open');
    document.getElementById('tab-'+n)?.classList.remove('active');
  });
  document.getElementById('dropdownOverlay')?.classList.remove('active');
}

function getFlightTime(country,mode){
  const base=country.timeMin[mode]||country.timeMin.airstrip;
  const mailing=parseInt(document.getElementById('mailing').value)||0;
  return mailing?Math.round(base*0.75):base;
}

function scheduleRecompute(){
  clearTimeout(recomputeTimer);
  recomputeTimer=setTimeout(()=>{if(stockData!==null)compute();},250);
}

/* ── Fetch YATA ──────────────────────────────────────────────────── */
async function fetchAndCompute(){
  const btn=document.getElementById('refreshBtn');btn.classList.add('loading');
  setBanner('info',t('chargement'));
  ['globalStats','bestRunSection','otherRuns'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  document.getElementById('emptyState').style.display='none';
  try{
    const r=await fetch('https://yata.yt/api/v1/travel/export/');
    if(!r.ok)throw new Error();
    stockData=await r.json();
    localStorage.setItem('yataCache',JSON.stringify(stockData));
    document.getElementById('lastFetchInfo').textContent=`${t('yataLabel')} ${timeAgo(stockData.timestamp)}`;
    setBanner('info',t('charge'));
  }catch(e){
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

/* ── Modèle de stock basé sur position dans le cycle TCT ─────────
   Pour les vols longs (>1h), le snapshot YATA est peu utile car
   plusieurs cycles s'écoulent avant l'arrivée.
   
   Approche : à l'heure d'arrivée, on calcule combien de minutes
   après le dernier tick TCT on se trouve, et on utilise la
   distribution empirique TICK_RESTOCK_DIST pour calculer
   P(restock déjà fait à ce moment).
   
   Résumé données (106 cycles vidage + 100 mesures tick→restock) :
   Vidage moyen peluches : 40.7 min | Cycle total : ~55.5 min
   Tick→Restock : P10=3.5 P50=9.4 P90=14.7 min
──────────────────────────────────────────────────────────────── */

function nextTick(ts){return Math.ceil(ts/(15*60))*(15*60);}
function prevTick(ts){return Math.floor(ts/(15*60))*(15*60);}

function probaRestockDone(minutesAfterTick){
  if(!minutesAfterTick||minutesAfterTick<=0) return 0;
  const done=TICK_RESTOCK_DIST.filter(d=>d<=minutesAfterTick).length;
  return done/TICK_RESTOCK_DIST.length;
}

/* ── Espérance corrigée ──────────────────────────────────────────
   Stock estimé à l'arrivée → espérance de remplissage de l'inventaire
   Si stock >= capacité → 100% (on remplit quoi qu'il arrive)
   Si stock < 20% capacité → dégradation linéaire jusqu'à 0
──────────────────────────────────────────────────────────────── */
function getStockAtTime(item, yataQty, lastUpdateTs, targetTs) {
  // Estime le stock à un instant donné à partir du dernier snapshot YATA
  const { restockQty, vidageMin, restockMin } = item;
  const decay = restockQty / (vidageMin * 60);
  const nowTs = Date.now() / 1000;
  let stock = yataQty ?? restockQty;
  let emptyAt = null;
  const totalElapsed = (nowTs - lastUpdateTs) + (targetTs - nowTs);
  for (let e = 0; e < totalElapsed; e += 30) {
    stock = Math.max(0, stock - decay * 30);
    if (stock === 0 && emptyAt === null) emptyAt = lastUpdateTs + e;
    if (emptyAt !== null) {
      const tick = nextTick(emptyAt);
      if (lastUpdateTs + e >= tick + (restockMin || 15) * 60) { stock = restockQty; emptyAt = null; }
    }
  }
  return Math.round(Math.max(0, stock));
}

function computeEsperance(item, yataQty, lastUpdateTs, targetTs, capacity) {
  // Retourne { stockEst, esperance (0-1), proba, label, prediction }
  const stockEst = getStockAtTime(item, yataQty, lastUpdateTs, targetTs);
  const SEUIL = capacity * 0.2; // 20% de la capacité

  let esperance;
  if (stockEst >= capacity) {
    esperance = 1.0; // stock largement suffisant
  } else if (stockEst >= SEUIL) {
    esperance = 1.0; // entre 20% et 100% de la capacité = on remplit quand même
  } else if (stockEst > 0) {
    esperance = stockEst / SEUIL; // dégradation linéaire de 0 à SEUIL
  } else {
    // Stock à 0 : espérance basée sur la proba de restock
    const tickBefore = prevTick(targetTs);
    const minAfterTick = (targetTs - tickBefore) / 60;
    const probaR = probaRestockDone(minAfterTick);
    esperance = probaR * 0.8; // si restock probable, on peut encore avoir du stock
  }
  esperance = Math.min(1, Math.max(0, esperance));

  // Label
  const tickBefore = prevTick(targetTs);
  const minAfterTick = (targetTs - tickBefore) / 60;
  const probaR = probaRestockDone(minAfterTick);

  let label;
  if (esperance >= 0.9) label = `~${stockEst} ${t('enStock')}`;
  else if (esperance >= 0.6) label = t('stockFaible');
  else if (esperance >= 0.3) label = t('restockProb');
  else label = t('restockLointain');

  const prediction = {
    stockEst,
    tickBefore: fmtH(tickBefore),
    tickNext: fmtH(tickBefore + 15*60),
    minAfterTick: Math.round(minAfterTick * 10) / 10,
    probaRestockFait: Math.round(probaR * 100),
    esperancePct: Math.round(esperance * 100),
    dataAge: lastUpdateTs ? Math.round((Date.now()/1000 - lastUpdateTs) / 60) : null,
  };

  return { stockEst, esperance, proba: esperance, label, prediction };
}

/* ── Optimisation départ : teste 0-10 min de décalage ─────────── */
function optimizeDepart(departTs, country, mode, capacity, yataMap, lastUpdate, canWaitAbroad, waitAbroadMin) {
  const tOneWay = getFlightTime(country, mode);
  const avail = ITEMS.filter(item => item.country === country.code);
  if (!avail.length) return { bestDelay: 0, bestEsp: 0 };

  let bestDelay = 0;
  let bestEsp = -1;

  for (let delay = 0; delay <= 10; delay++) {
    const arriveTs = departTs + delay * 60 + tOneWay * 60;
    let totalEsp = 0;
    avail.forEach(item => {
      const yQty = yataMap[item.tornId] ?? yataMap[item.id];
      const { esperance } = computeEsperance(item, yQty, lastUpdate, arriveTs, capacity);
      totalEsp += esperance;
    });
    if (totalEsp > bestEsp) { bestEsp = totalEsp; bestDelay = delay; }
  }
  return { bestDelay, bestEsp };
}

function simulateStock(item,yataQty,lastUpdateTs,targetTs){
  const nowTs=Date.now()/1000;
  const{restockQty,vidageMin,restockMin}=item;

  // Position dans le cycle TCT à l'arrivée
  const tickBefore=prevTick(targetTs);
  const tickNext=tickBefore+15*60;
  const minAfterTick=(targetTs-tickBefore)/60;
  const minToNextTick=(tickNext-targetTs)/60;
  const cycleDuration=vidageMin+(restockMin||15);

  let proba,label;

  if(item.type==='plushie'||item.type==='flower'){
    // P(en phase de vidage = stock dispo) = vidageMin / cycleDuration
    const probaInStockPhase=Math.min(0.95,vidageMin/cycleDuration);
    // P(en phase vide mais restock déjà fait)
    const probaVide=1-probaInStockPhase;
    const probaRestockFait=probaRestockDone(minAfterTick);
    proba=probaInStockPhase+probaVide*probaRestockFait;
    proba=Math.min(0.97,Math.max(0.03,proba));

    if(proba>=0.85) label=t('enStock');
    else if(proba>=0.60) label=t('stockFaible');
    else if(proba>=0.35) label=t('restockProb');
    else label=t('restockLointain');

    // Si données YATA fraîches (<30 min) et vol court (<60 min) : affiner
    if(lastUpdateTs&&yataQty!==undefined&&(nowTs-lastUpdateTs)<1800&&(targetTs-nowTs)<3600){
      const decay=restockQty/(vidageMin*60);
      const stockNow=Math.max(0,yataQty-decay*(nowTs-lastUpdateTs));
      const stockAtArrival=Math.max(0,stockNow-decay*(targetTs-nowTs));
      if(stockAtArrival>restockQty*0.3){proba=0.90;label=`~${Math.round(stockAtArrival)} ${t('enStock')}`;}
      else if(stockAtArrival>0){proba=0.50;label=`~${Math.round(stockAtArrival)} (${t('stockFaible')})`;}
    }
  } else {
    proba=0.5; label=t('inconnu');
  }

  const prediction={
    tickBefore:fmtH(tickBefore),
    tickNext:fmtH(tickNext),
    minAfterTick:Math.round(minAfterTick*10)/10,
    minToNextTick:Math.round(minToNextTick*10)/10,
    probaRestockFait:Math.round(probaRestockDone(minAfterTick)*100),
    probaInStockPhase:Math.round(Math.min(0.95,vidageMin/cycleDuration)*100),
    cycleDuration:Math.round(cycleDuration),
    vidageMin,
    restockMin:restockMin||15,
    dataAge:lastUpdateTs?Math.round((nowTs-lastUpdateTs)/60):null,
  };

  return{qty:null,proba,label,prediction};
}

/* ── Génère la courbe de stock simulée pour un item/période ─── */
function generateStockCurve(item,yataQty,lastUpdateTs,startTs,endTs){
  const{restockQty,vidageMin,restockMin}=item;
  const decay=restockQty/(vidageMin*60);
  const nowTs=Date.now()/1000;

  // Simuler depuis lastUpdate jusqu'au début de la fenêtre
  let stock=yataQty??restockQty;
  let emptyAt=null;
  const preElapsed=Math.max(0,startTs-lastUpdateTs);
  for(let e=0;e<preElapsed;e+=30){
    stock=Math.max(0,stock-decay*30);
    if(stock===0&&emptyAt===null)emptyAt=lastUpdateTs+e;
    if(emptyAt!==null){
      const tick=nextTick(emptyAt);
      if(lastUpdateTs+e>=tick+(restockMin||15)*60){stock=restockQty;emptyAt=null;}
    }
  }

  // Générer les points sur la fenêtre
  const pts=[];
  for(let ts=startTs;ts<=endTs;ts+=60){
    stock=Math.max(0,stock-decay*60);
    if(stock===0&&emptyAt===null)emptyAt=ts;
    if(emptyAt!==null){
      const tick=nextTick(emptyAt);
      if(ts>=tick+(restockMin||15)*60){
        pts.push({ts,qty:0}); // juste avant le restock
        stock=restockQty;
        emptyAt=null;
        pts.push({ts,qty:restockQty}); // restock instantané
        continue;
      }
    }
    pts.push({ts,qty:stock});
  }
  return pts;
}

/* ── Helpers pour sélection meilleur item/destination ─────────── */
function getBestItemsForCountry(country, arriveTs, capacity, yataMap, lastUpdate, wantPlush, wantFlower, wantDrug) {
  const avail = ITEMS.filter(item => {
    if (item.country !== country.code) return false;
    if (item.type === 'plushie' && !wantPlush) return false;
    if (item.type === 'flower' && !wantFlower) return false;
    if (item.type === 'drug' && !wantDrug) return false;
    return true;
  });
  if (!avail.length) return null;

  // Calculer espérance pour chaque item
  const scored = avail.map(item => {
    const sell = priceData[item.tornId] || priceData[item.name] || item.sell;
    const yQty = yataMap[item.tornId] ?? yataMap[item.id];
    const est = computeEsperance(item, yQty, lastUpdate, arriveTs, capacity);
    // Préserver TOUS les champs de l'item (vidageMin, restockMin, etc.)
    return { 
      ...item,  // vidageMin, restockMin, restockQty, etc.
      effectiveSell: sell, 
      unitProfit: sell - item.buy, 
      yataQtyNow: yQty,
      stockEst: est.prediction,
      stockProba: est.esperance,
      stockLabel: est.label,
      stockPred: est.prediction,
      esperance: est.esperance,
    };
  }).sort((a, b) => b.unitProfit * b.esperance - a.unitProfit * a.esperance);

  // Allouer la capacité
  const breakdown = [];
  let baseRem = capacity;
  let toyJobRem = getJobItemBonus('plushie');
  let flowerJobRem = getJobItemBonus('flower');
  scored.forEach(item => {
    let qty = 0;
    if (baseRem > 0) { qty = baseRem; baseRem = 0; }
    if (item.type === 'plushie' && toyJobRem > 0) { qty += toyJobRem; toyJobRem = 0; }
    if (item.type === 'flower' && flowerJobRem > 0) { qty += flowerJobRem; flowerJobRem = 0; }
    if (qty <= 0) return;
    const grossProfit = item.unitProfit * qty;
    const adjProfit = grossProfit * item.esperance;
    breakdown.push({ 
      ...item,  // préserve vidageMin, restockMin, restockQty
      qty, grossProfit, adjustedProfit: adjProfit,
    });
  });

  const totalEsp = breakdown.reduce((s, b) => s + b.adjustedProfit, 0);
  return { breakdown, totalEsp };
}

/* ── Calcul trip-par-trip avec optimisation départ ─────────── */
function compute(){try{
  const mode = document.getElementById('flightMode').value;
  const sessionMin = parseInt(document.getElementById('sessionHours').value) * 60;
  const budgetCap = parseInt(document.getElementById('travelBudget').value) || 0;
  const freshMax = parseFloat(document.getElementById('freshnessFilter').value);
  const minFlight = parseInt(document.getElementById('minFlightTime').value) || 0;
  const maxTripsAllowed = parseInt(document.getElementById('maxTrips').value) || 999;
  const canFinishAbroad = document.getElementById('finishAbroad').value === 'yes';
  const canWaitAbroad = document.getElementById('waitAbroad')?.value === 'yes' || false;
  const wantPlush = document.getElementById('f_plushie').checked;
  const wantFlower = document.getElementById('f_flower').checked;
  const wantDrug = document.getElementById('f_drug').checked;
  const baseCapacity = getBaseCapacity();
  const now = Date.now() / 1000;
  const sessionEndTs = getDepartTs() + sessionMin * 60;

  // Construire la liste des destinations disponibles avec leurs données YATA
  const availCountries = COUNTRIES.filter(c => {
    if (excludedCountries.has(c.code)) return false;
    const cs = stockData?.stocks?.[c.code] ?? null;
    if (!cs) return true; // pas de données = on inclut quand même
    const ageH = (now - cs.update) / 3600;
    if (cs.update && ageH > freshMax) return false;
    return true;
  }).map(country => {
    const cs = stockData?.stocks?.[country.code] ?? null;
    const lastUpdate = cs?.update ?? 0;
    const yataMap = {};
    if (cs?.stocks) cs.stocks.forEach(s => { yataMap[s.id] = s.quantity; });
    return { country, lastUpdate, yataMap, ageH: lastUpdate ? (now - lastUpdate) / 3600 : Infinity };
  });

  // ── Simulation trip-par-trip ──
  // On génère un "run optimal" : à chaque trip on choisit la meilleure destination
  let currentTs = getDepartTs();
  const trips = [];
  let totalProfit = 0;
  let totalCash = 0;
  let tripCount = 0;

  while (tripCount < maxTripsAllowed) {
    let bestTripOption = null;
    let bestTripEsp = -1;

    // Tester chaque destination possible pour ce trip
    for (const { country, lastUpdate, yataMap } of availCountries) {
      const tOneWay = getFlightTime(country, mode);
      if (tOneWay < minFlight) continue;

      const travelCost = budgetCap > 0 ? Math.min(budgetCap, country.cost) : country.cost;
      const tripDuration = tOneWay * 2 * 60 + 5 * 60;

      // Vérifier qu'on a le temps (au moins un aller-retour)
      const returnTs = currentTs + tripDuration;
      if (!canFinishAbroad && returnTs > sessionEndTs) continue;
      if (canFinishAbroad && currentTs + tOneWay * 60 > sessionEndTs) continue;

      // Tester 0-10 min de décalage à Torn pour optimiser l'arrivée
      let bestDelay = 0;
      let bestEspDelay = -1;
      for (let delay = 0; delay <= 10; delay++) {
        const departDelayed = currentTs + delay * 60;
        const arriveTs = departDelayed + tOneWay * 60;
        if (!canFinishAbroad && arriveTs + tOneWay * 60 + 5 * 60 > sessionEndTs) break;
        const result = getBestItemsForCountry(country, arriveTs, baseCapacity, yataMap, lastUpdate, wantPlush, wantFlower, wantDrug);
        if (!result) break;
        if (result.totalEsp > bestEspDelay) { bestEspDelay = result.totalEsp; bestDelay = delay; }
      }

      // Calculer avec le meilleur delay
      const departTs = currentTs + bestDelay * 60;
      const arriveTs = departTs + tOneWay * 60;
      const result = getBestItemsForCountry(country, arriveTs, baseCapacity, yataMap, lastUpdate, wantPlush, wantFlower, wantDrug);
      if (!result || !result.breakdown.length) continue;

      const netEsp = result.totalEsp - travelCost * 2;
      if (netEsp > bestTripEsp) {
        bestTripEsp = netEsp;
        bestTripOption = {
          country, tOneWay, lastUpdate, yataMap, travelCost,
          departTs,
          startTs: departTs,  // alias pour rétrocompatibilité
          waitMin: bestDelay,
          arriveTs,
          returnTs: arriveTs + 5 * 60,
          landTs: arriveTs + 5 * 60 + tOneWay * 60,
          breakdown: result.breakdown,
          rawProfit: result.breakdown.reduce((s, b) => s + b.grossProfit, 0),
          adjProfit: result.totalEsp,
          netProfit: netEsp,
          isLastAbroad: false,
        };
      }
    }

    if (!bestTripOption) break;

    // Dernière chance : finir à l'étranger ?
    if (canFinishAbroad && tripCount === maxTripsAllowed - 1) {
      bestTripOption.isLastAbroad = true;
      bestTripOption.landTs = null;
    }

    trips.push(bestTripOption);
    totalProfit += bestTripOption.netProfit;
    totalCash = Math.max(totalCash, bestTripOption.breakdown.reduce((s, b) => s + b.buy * b.qty, 0) + bestTripOption.travelCost * 2);
    tripCount++;

    // Avancer le temps
    if (bestTripOption.isLastAbroad) break;
    currentTs = bestTripOption.landTs;

    // Patienter à l'étranger entre trips si activé
    if (canWaitAbroad && tripCount < maxTripsAllowed) {
      // Tester 0-15 min d'attente à l'étranger pour le prochain trip
      // (logique simplifiée : on avance currentTs de 0-15 min)
      // L'optimisation se fera au prochain tour de boucle
    }
  }

  if (!trips.length) {
    window._runs = [];
    renderResults([], mode);
    return;
  }

  // Construire le "run" final
  const sessionMinUsed = (trips[trips.length-1].landTs || trips[trips.length-1].arriveTs) - getDepartTs();
  const profitPerHour = totalProfit / (sessionMin / 60);

  const run = {
    trips,
    totalProfit,
    profitPerHour,
    cashRequired: totalCash,
    maxTrips: trips.length,
    // Pour rétrocompatibilité avec les fonctions de rendu
    country: trips[0].country,
    breakdown: trips[0].breakdown,
    departTs: getDepartTs(),
    travelCost: trips[0].travelCost,
    tOneWay: trips[0].tOneWay,
    tripMin: trips[0].tOneWay * 2 + 5,
    rawProfitTrip: trips[0].rawProfit,
    adjProfitTrip: trips[0].adjProfit,
    netPerTrip: trips[0].netProfit,
    lastUpdate: trips[0].lastUpdate,
    ageH: trips[0].lastUpdate ? (now - trips[0].lastUpdate) / 3600 : Infinity,
    canFinishAbroad,
    totalCapacity: baseCapacity + getJobItemBonus('plushie'),
  };

  // Générer aussi les runs "mono-destination" pour "Autres options"
  const monoRuns = [];
  for (const { country, lastUpdate, yataMap, ageH } of availCountries) {
    const tOneWay = getFlightTime(country, mode);
    if (tOneWay < minFlight) continue;
    const tripMin = tOneWay * 2 + 5;
    let maxT = canFinishAbroad
      ? (sessionMin >= tOneWay ? Math.floor((sessionMin - tOneWay) / (tripMin)) + 1 : 0)
      : Math.floor(sessionMin / tripMin);
    maxT = Math.min(maxT, maxTripsAllowed);
    if (maxT < 1) continue;

    const travelCost = budgetCap > 0 ? Math.min(budgetCap, country.cost) : country.cost;
    const firstArrival = getDepartTs() + tOneWay * 60;
    const result = getBestItemsForCountry(country, firstArrival, baseCapacity, yataMap, lastUpdate, wantPlush, wantFlower, wantDrug);
    if (!result || !result.breakdown.length) continue;

    const adjProfitTrip = result.totalEsp;
    const totalTravelCost = canFinishAbroad ? travelCost * 2 * (maxT - 1) + travelCost : travelCost * 2 * maxT;
    const totalP = adjProfitTrip * maxT - totalTravelCost;

    const monoTrips = Array.from({length: maxT}, (_, i) => {
      const startTs = getDepartTs() + i * tripMin * 60;
      const arriveTs = startTs + tOneWay * 60;
      const returnTs = arriveTs + 5 * 60;
      const isLast = canFinishAbroad && i === maxT - 1;
      return { country, startTs, arriveTs, waitMin: 0, returnTs, landTs: isLast ? null : returnTs + tOneWay * 60, isLastAbroad: isLast, breakdown: result.breakdown, adjProfit: adjProfitTrip, rawProfit: result.breakdown.reduce((s,b)=>s+b.grossProfit,0), netProfit: adjProfitTrip - travelCost * 2, travelCost, lastUpdate, yataMap };
    });

    monoRuns.push({
      country, tOneWay, tripMin, maxTrips: maxT,
      rawProfitTrip: result.breakdown.reduce((s,b)=>s+b.grossProfit,0),
      adjProfitTrip, netPerTrip: adjProfitTrip - travelCost * 2,
      totalProfit: totalP, profitPerHour: totalP / (sessionMin / 60),
      cashRequired: result.breakdown.reduce((s,b)=>s+b.buy*b.qty,0) + travelCost * 2,
      breakdown: result.breakdown, lastUpdate, ageH, travelCost,
      trips: monoTrips, departTs: getDepartTs(), canFinishAbroad,
      totalCapacity: baseCapacity + getJobItemBonus('plushie'),
    });
  }

  monoRuns.sort((a, b) => b.totalProfit - a.totalProfit);
  window._bestRun = run;
  window._runs = monoRuns;
  renderResults(run, monoRuns, mode);
  }catch(err){console.error('Compute error:',err);setBanner('warn','⚠️ Erreur de calcul: '+err.message);}}

/* ── Rendu ───────────────────────────────────────────────────── */
function renderResults(bestRun, monoRuns, mode){
  const empty=document.getElementById('emptyState');
  if(!bestRun || !bestRun.trips || !bestRun.trips.length){
    empty.style.display='flex';
    ['globalStats','bestRunSection','otherRuns'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
    return;
  }
  empty.style.display='none';

  // Stats globales
  const _gs=(id,k)=>{const el=document.getElementById(id);if(el)el.textContent=t(k);};
  _gs('gs_profit_label','profit');_gs('gs_pph_label','profitH');_gs('gs_cash_label','cashRequis');_gs('gs_trips_label','trips');
  document.getElementById('gs_profit').textContent='$'+fmt(bestRun.totalProfit);
  document.getElementById('gs_pph').textContent='$'+fmt(bestRun.profitPerHour)+'/h';
  document.getElementById('gs_cash').textContent='$'+fmt(bestRun.cashRequired);
  document.getElementById('gs_trips').textContent=bestRun.maxTrips;
  document.getElementById('globalStats').style.display='grid';

  // Meilleur run : timeline + détail intégré
  const _sb=document.getElementById('section_bestrun');if(_sb)_sb.textContent=t('meilleureRun');
  document.getElementById('bestRunSection').style.display='block';
  renderTimeline(bestRun, 0);
  document.getElementById('bestRunDetail').innerHTML=buildDetailHTML(bestRun);

  // Autres destinations — cachées par défaut
  if(monoRuns && monoRuns.length>0){
    document.getElementById('otherRuns').style.display='block';
    document.getElementById('otherRunsList').style.display='none';
    const toggle=document.getElementById('otherRunsToggle');
    if(toggle)toggle.textContent=`▼ ${monoRuns.length} autres destinations`;
    const list=document.getElementById('otherRunsList');list.innerHTML='';
    monoRuns.forEach((run,i)=>list.appendChild(buildCompactCard(run,i)));
  }else{
    const el=document.getElementById('otherRuns');if(el)el.style.display='none';
  }
}

function toggleOtherRuns(){
  const list=document.getElementById('otherRunsList');
  const btn=document.getElementById('otherRunsToggle');
  const isOpen=list.style.display!=='none';
  list.style.display=isOpen?'none':'block';
  btn.textContent=isOpen
    ?`▼ ${window._runs?.length-1||''} autres destinations`
    :`▲ Masquer les autres destinations`;
}

/* ── Timeline scrollable ─────────────────────────────────────── */
function renderTimeline(run,rank){
  const DISPLAY_TRIPS = Math.min(4, run.maxTrips);

  const nodes = [];
  nodes.push({type:'depart', ts:run.departTs || getDepartTs(), label:t('depart_label')});
  run.trips.slice(0, DISPLAY_TRIPS).forEach((trip,i)=>{
    // Attente à Torn (waitMin > 0) → nœud rose
    if(trip.waitMin > 0 && trip.departTs){
      nodes.push({type:'wait', ts:trip.departTs - trip.waitMin*60, waitMin:trip.waitMin});
    }
    const country = trip.country || run.country;
    const breakdown = trip.breakdown || run.breakdown;
    const profit = breakdown.reduce((s,b)=>s+b.grossProfit,0);
    nodes.push({type:'arrive', ts:trip.arriveTs, country, trip:i+1, items:breakdown, profit});
    if(trip.isLastAbroad)
      nodes.push({type:'abroad', ts:trip.arriveTs+5*60, label:t('resteEtranger')});
    else
      nodes.push({type:'return', ts:trip.landTs, label:`${t('retour')} T${i+1}`});
  });

  // Positions en % : étalées de 4% à 96%
  const firstTs = nodes[0].ts;
  const lastTs  = nodes[nodes.length-1].ts;
  const span    = Math.max(lastTs - firstTs, 1);
  nodes.forEach(n => { n.pct = 4 + ((n.ts - firstTs) / span) * 92; });

  let nodesHTML = '';
  nodes.forEach((n,i) => {
    const above = i % 2 === 0;
    const align = n.pct > 72 ? 'right' : n.pct < 28 ? 'left' : 'center';
    const tx    = align==='right' ? 'calc(-100% + 16px)' : align==='left' ? '-16px' : '-50%';

    let dot='', body='';
    if(n.type==='wait'){
      dot  = `<div class="tl-dot" style="background:#ec4899;border-color:var(--bg2)"></div>`;
      body = `<div class="tl-nc-time" style="color:#ec4899">${fmtH(n.ts)}</div><div class="tl-nc-label" style="color:#ec4899">⏳ +${n.waitMin}min</div>`;
    } else if(n.type==='depart' || n.type==='return'){
      dot  = `<div class="tl-dot tl-dot-torn"></div>`;
      body = `<div class="tl-nc-time">${fmtH(n.ts)}</div><div class="tl-nc-label">${n.label}</div>`;
    } else if(n.type==='arrive'){
      const mi = n.items[0];
      const probaColor = mi.stockProba>=0.75?'var(--green)':mi.stockProba>=0.4?'#f5a623':'var(--red)';
      dot = `<div class="tl-dot tl-dot-country">
        <img src="https://flagcdn.com/20x15/${n.country.flag}.png" width="20" height="15"
          style="border-radius:2px;display:block" onerror="this.style.display='none'">
      </div>`;
      body = `<div class="tl-nc-time">${fmtH(n.ts)}</div>
        <div class="tl-nc-country">${n.country.name}</div>
        <div style="font-size:10px;margin-top:1px;color:${probaColor};font-weight:600">+$${fmt(n.profit)} · ${Math.round(mi.stockProba*100)}%</div>`;
    } else {
      dot  = `<div class="tl-dot tl-dot-end"></div>`;
      body = `<div class="tl-nc-time">${fmtH(n.ts)}</div><div class="tl-nc-label">${n.label}</div>`;
    }

    const nc = `<div style="position:absolute;${above?'bottom:calc(100% + 12px)':'top:calc(100% + 12px)'};left:0;transform:translateX(${tx});width:130px;text-align:${align};pointer-events:none">${body}</div>`;
    nodesHTML += `<div style="position:absolute;left:${n.pct.toFixed(1)}%;top:0;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center">
      ${above ? nc : ''}${dot}${!above ? nc : ''}
    </div>`;
  });

  document.getElementById('timelineInner').innerHTML =
    `<div style="position:relative;width:100%;height:10px">
      <div style="position:absolute;top:50%;left:0;right:0;height:2px;background:var(--border2);transform:translateY(-50%)"></div>
      ${nodesHTML}
    </div>`;

  // Badge "+ X trips" affiché DANS la track, collé à droite
  const moreTripsHTML = run.maxTrips > DISPLAY_TRIPS ? (() => {
    const n = run.maxTrips - DISPLAY_TRIPS;
    const dots = Array(Math.min(n,5)).fill(0)
      .map(()=>'<span style="width:5px;height:5px;border-radius:50%;background:var(--text3);display:inline-block"></span>').join('');
    return `<div style="position:absolute;right:0;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text3);background:var(--bg2);padding:2px 8px;border-radius:20px;white-space:nowrap">
      <span style="display:flex;gap:2px">${dots}</span>+${n} trips
    </div>`;
  })() : '';

  document.getElementById('timelineInner').innerHTML =
    `<div style="position:relative;width:100%;height:10px">
      <div style="position:absolute;top:50%;left:0;right:0;height:2px;background:var(--border2);transform:translateY(-50%)"></div>
      ${nodesHTML}
      ${moreTripsHTML}
    </div>`;
}

/* ── Cartes compactes ────────────────────────────────────────── */
function buildCompactCard(run,rank){
  const card=document.createElement('div');card.className='compact-card';
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

/* ── Modal ───────────────────────────────────────────────────── */
function showRunDetail(rank){
  const run=window._runs?.[rank];if(!run)return;
  document.getElementById('modalTitle').innerHTML=
    `<img src="https://flagcdn.com/20x15/${run.country.flag}.png" width="20" height="15" style="border-radius:2px;margin-right:8px;vertical-align:middle" onerror="this.style.display='none'">${run.country.name} — ${t('detailRun')}`;
  document.getElementById('modalContent').innerHTML=buildDetailHTML(run);
  document.getElementById('timelineModal').style.display='flex';
}
function closeModal(e){
  if(e.target===document.getElementById('timelineModal'))
    document.getElementById('timelineModal').style.display='none';
}

/* ── Courbe historique ancrée sur stock YATA ────────────────────
   Logique :
   1. Prendre les points bruts du JSON (vraies irrégularités)
   2. Trouver dans l'historique le moment où le stock ≈ yataQty
   3. Décaler les timestamps pour commencer à startTs
   4. Si la session dépasse la durée de l'historique → répéter le pattern
──────────────────────────────────────────────────────────────── */
function buildHistoricalCurve(item, hKey, hist, yataQty, lastUpdateTs, startTs, endTs) {
  const windowDuration = endTs - startTs;

  // Pas de données historiques → fallback simulation
  if (!hist || !hist.pts || hist.pts.length < 5) {
    return generateStockCurve(item, yataQty, lastUpdateTs, startTs, endTs);
  }

  const rawPts = hist.pts; // [[ts, qty], ...]
  const histFirstTs = rawPts[0][0];
  const histLastTs  = rawPts[rawPts.length-1][0];
  const histDuration = histLastTs - histFirstTs;

  // Trouver le point d'ancrage : moment dans l'historique où qty ≈ yataQty
  // Si pas de données YATA fraîches → partir du début du cycle historique
  let anchorIdx = 0;
  if (yataQty !== null && yataQty !== undefined && lastUpdateTs) {
    const nowTs = Date.now() / 1000;
    const dataAge = nowTs - lastUpdateTs; // âge des données YATA en secondes

    // Chercher dans l'historique le point qui correspond le mieux au stock actuel
    // On cherche le point avec qty le plus proche de yataQty dans une phase descendante
    let bestDiff = Infinity;
    for (let i = 0; i < rawPts.length; i++) {
      const diff = Math.abs(rawPts[i][1] - yataQty);
      if (diff < bestDiff) {
        bestDiff = diff;
        anchorIdx = i;
      }
    }
  }

  // Décaler les timestamps : anchorIdx correspond à startTs
  const tsOffset = startTs - rawPts[anchorIdx][0];
  let basePts = rawPts.map(p => ({ ts: p[0] + tsOffset, qty: p[1] }));

  // Ajouter des cycles si la session dépasse la durée de l'historique
  const needed = endTs - (basePts[basePts.length-1].ts);
  if (needed > 0) {
    let cycles = 1;
    while (cycles * histDuration < needed + histDuration) {
      const cycleOffset = tsOffset + cycles * histDuration;
      rawPts.forEach(p => {
        basePts.push({ ts: p[0] + cycleOffset, qty: p[1] });
      });
      cycles++;
    }
  }

  // Filtrer pour ne garder que la fenêtre startTs → endTs
  return basePts.filter(p => p.ts >= startTs - 60 && p.ts <= endTs + 60);
}

/* ── Graphe SVG pour un item — utilise données historiques réelles ── */
function getHistoricalKey(item){
  const nameKey=item.name.toLowerCase().replace(/ /g,'_').replace(/-/g,'_').replace(/'/g,'');
  return item.country+'_'+nameKey;
}

function buildItemChart(item,yataQty,lastUpdateTs,startTs,endTs,trips,W,H){
  // Utiliser les vraies courbes JSON si disponibles, ancrées sur le stock YATA actuel
  const hKey = getHistoricalKey(item);
  const hist = HISTORICAL_DATA?.[hKey];
  let pts;

  if(hist && hist.pts && hist.pts.length >= 5 && yataQty !== null && yataQty !== undefined && lastUpdateTs){
    const rawPts = hist.pts.map(p => [p[0], p[1]]);
    const histMax = hist.max || item.restockQty;
    const windowDur = endTs - startTs;
    const histDur = rawPts[rawPts.length-1][0] - rawPts[0][0];

    // Trouver dans les données historiques un point avec quantité proche de yataQty
    // pour ancrer le décalage temporel
    const nowTs = Date.now()/1000;
    const dataAge = nowTs - lastUpdateTs; // âge des données YATA en secondes

    // Chercher le point historique le plus proche de yataQty
    let bestIdx = 0;
    let bestDiff = Infinity;
    rawPts.forEach((p, i) => {
      const diff = Math.abs(p[1] - yataQty);
      if(diff < bestDiff){ bestDiff = diff; bestIdx = i; }
    });

    // Décaler les données historiques pour que rawPts[bestIdx] corresponde à lastUpdateTs
    const anchorHistTs = rawPts[bestIdx][0];
    const offset = lastUpdateTs - anchorHistTs;

    // Générer les points sur la fenêtre startTs→endTs
    // En répétant le pattern historique si nécessaire
    pts = [];
    let cycleOffset = 0;
    while(true){
      rawPts.forEach(p => {
        const ts = p[0] + offset + cycleOffset;
        if(ts >= startTs - 60 && ts <= endTs + 60){
          pts.push({ts, qty: p[1]});
        }
      });
      cycleOffset += histDur;
      if(rawPts[0][0] + offset + cycleOffset > endTs) break;
      if(cycleOffset > windowDur * 3) break; // sécurité
    }
    pts.sort((a,b) => a.ts - b.ts);

    // Si pas assez de points dans la fenêtre, fallback simulation
    if(pts.length < 3) pts = generateStockCurve(item, yataQty, lastUpdateTs, startTs, endTs);
  } else {
    pts = generateStockCurve(item, yataQty, lastUpdateTs, startTs, endTs);
  }
  const RESTOCK=item.restockQty;
  function tsX(ts){return((ts-startTs)/(endTs-startTs)*W).toFixed(1);}
  function qY(q){return(H-(q/RESTOCK)*H).toFixed(1);}

  // Chemin avec restock vertical
  let d='';
  for(let i=0;i<pts.length;i++){
    const p=pts[i];
    if(i===0){d+=`M${tsX(p.ts)},${qY(p.qty)}`;continue;}
    const prev=pts[i-1];
    if(p.qty>prev.qty*2&&prev.qty<100){
      // Restock instantané : descendre à 0 puis monter verticalement
      d+=` L${tsX(p.ts)},${qY(0)} L${tsX(p.ts)},${qY(p.qty)}`;
    }else{
      d+=` L${tsX(p.ts)},${qY(p.qty)}`;
    }
  }

  // Ticks TCT
  let ticks='';
  let tk=Math.ceil(startTs/(15*60))*15*60;
  while(tk<=endTs){
    const x=tsX(tk);
    ticks+=`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="rgba(255,255,255,.05)" stroke-width="0.8"/>`;
    tk+=15*60;
  }

  // Events : départ (bleu) + arrivée (rouge)
  let evs='';
  trips.forEach(trip=>{
    if(trip.startTs>=startTs&&trip.startTs<=endTs)
      evs+=`<line x1="${tsX(trip.startTs)}" y1="0" x2="${tsX(trip.startTs)}" y2="${H}" stroke="#4f7ef8" stroke-width="1" stroke-dasharray="4,3"/>`;
    if(trip.arriveTs>=startTs&&trip.arriveTs<=endTs)
      evs+=`<line x1="${tsX(trip.arriveTs)}" y1="0" x2="${tsX(trip.arriveTs)}" y2="${H}" stroke="#ef4444" stroke-width="2"/>`;
  });

  // Labels horaires
  let lbls='';
  let lt=Math.ceil(startTs/(30*60))*30*60;
  while(lt<=endTs){
    lbls+=`<text x="${tsX(lt)}" y="${H+13}" font-size="9" fill="rgba(255,255,255,.3)" text-anchor="middle">${fmtH(lt)}</text>`;
    lt+=30*60;
  }

  // Modèle info
  const model=item.modelKey?STOCK_MODELS[item.modelKey]:null;
  const modelInfo=model?`${model.cycles} ${t('cyclesMesures')} · vidage ~${model.vidageMin}min · restock ~${model.restockMin}min`:'';

  return`<div style="margin-bottom:1rem">
    <div style="font-size:11px;font-weight:600;color:${TYPE_COLORS[item.type]||'#888'};margin-bottom:4px">
      ${item.name}
      ${model?`<span style="font-size:9px;color:var(--text3);font-weight:400;margin-left:8px">${modelInfo}</span>`:''}
    </div>
    <div class="stock-chart-wrap">
      <svg viewBox="0 0 ${W} ${H+16}" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;min-width:300px">
        <text x="2" y="9" font-size="8" fill="rgba(255,255,255,.2)">${RESTOCK}</text>
        <text x="2" y="${H-1}" font-size="8" fill="rgba(255,255,255,.2)">0</text>
        ${ticks}${evs}
        <path d="${d} L${W},${H} L0,${H} Z" fill="rgba(79,126,248,.08)"/>
        <path d="${d}" fill="none" stroke="#4f7ef8" stroke-width="1.5"/>
        ${lbls}
      </svg>
    </div>
  </div>`;
}

/* ── Graphe multi-destinations continu ───────────────────────── */
function buildMultiDestChart(run, startTs, endTs, W, H) {
  const trips = run.trips;
  if (!trips || !trips.length) return '';

  // Regrouper les tronçons consécutifs par pays
  const segments = [];
  let curCountry = null, segStart = startTs;

  trips.forEach((trip, i) => {
    const country = trip.country || run.country;
    const breakdown = trip.breakdown || run.breakdown;
    const mainItem = breakdown[0];
    const segEnd = trip.landTs || trip.arriveTs + 30*60;

    if (curCountry && curCountry.code === country.code) {
      // Même pays → prolonger le segment
      segments[segments.length-1].segEnd = segEnd;
      segments[segments.length-1].arrivals.push({ts:trip.arriveTs, tripNum:i+1});
      if(trip.departTs) segments[segments.length-1].departures.push({ts:trip.departTs});
    } else {
      // Nouveau pays
      if (curCountry) segments[segments.length-1].segEnd = trip.departTs || trip.arriveTs - (trip.tOneWay||0)*60;
      const segStartTs = trip.startTs || trip.departTs || (trip.arriveTs - (trip.tOneWay||run.tOneWay||30)*60);
      segments.push({
        country, mainItem, breakdown,
        segStart: segStartTs,
        segEnd,
        arrivals: [{ts:trip.arriveTs, tripNum:i+1}],
        departures: (trip.departTs && trip.departTs !== segStartTs) ? [{ts:trip.departTs}] : [],
        yataQtyNow: mainItem?.yataQtyNow,
        lastUpdate: trip.lastUpdate || run.lastUpdate,
        yataMap: trip.yataMap || {},
      });
      curCountry = country;
    }
  });

  // Générer un SVG par segment
  const svgs = segments.map((seg, si) => {
    const item = seg.mainItem;
    if (!item) return '';
    const hKey = getHistoricalKey(item);
    const hist = HISTORICAL_DATA?.[hKey];
    const pts = buildHistoricalCurve(item, seg.yataQtyNow, seg.lastUpdate, seg.segStart, seg.segEnd);
    const RESTOCK = item.restockQty;
    const segW = Math.round((seg.segEnd - seg.segStart) / (endTs - startTs) * W);
    if (segW < 10) return '';

    function tsX(ts){ 
      const v = (seg.segEnd - seg.segStart) > 0 ? ((ts - seg.segStart) / (seg.segEnd - seg.segStart) * segW) : 0;
      return isNaN(v) ? 0 : v.toFixed(1); 
    }
    function qY(q){ return (H - (q / RESTOCK) * H).toFixed(1); }

    // Chemin
    let d = '';
    for(let i=0;i<pts.length;i++){
      const p=pts[i];
      if(i===0){d+=`M${tsX(p.ts)},${qY(p.qty)}`;continue;}
      const prev=pts[i-1];
      if(p.qty>prev.qty*2&&prev.qty<100){
        d+=` L${tsX(p.ts)},${qY(0)} L${tsX(p.ts)},${qY(p.qty)}`;
      }else{d+=` L${tsX(p.ts)},${qY(p.qty)}`;}
    }

    // Ticks TCT
    let ticks='';
    let tk = Math.ceil(seg.segStart/(15*60))*(15*60);
    while(tk<=seg.segEnd){ticks+=`<line x1="${tsX(tk)}" y1="0" x2="${tsX(tk)}" y2="${H}" stroke="rgba(255,255,255,.05)" stroke-width="0.8"/>`;tk+=15*60;}

    // Arrivées (rouge) et départs (bleu)
    let evs = '';
    seg.arrivals.forEach(a=>{if(a.ts>=seg.segStart&&a.ts<=seg.segEnd)evs+=`<line x1="${tsX(a.ts)}" y1="0" x2="${tsX(a.ts)}" y2="${H}" stroke="#ef4444" stroke-width="2"/><text x="${tsX(a.ts)}" y="${H-4}" font-size="8" fill="#ef4444" text-anchor="middle">T${a.tripNum}</text>`;});
    seg.departures.forEach(d2=>{if(d2.ts>=seg.segStart&&d2.ts<=seg.segEnd)evs+=`<line x1="${tsX(d2.ts)}" y1="0" x2="${tsX(d2.ts)}" y2="${H}" stroke="#4f7ef8" stroke-width="1" stroke-dasharray="4,3"/>`;});

    // Labels horaires
    let lbls='';
    let lt=Math.ceil(seg.segStart/(30*60))*30*60;
    while(lt<=seg.segEnd){lbls+=`<text x="${tsX(lt)}" y="${H+13}" font-size="9" fill="rgba(255,255,255,.3)" text-anchor="middle">${fmtH(lt)}</text>`;lt+=30*60;}

    // Label pays en haut
    const flag = seg.country.flag;

    return `<div style="display:inline-block;vertical-align:top;${si>0?'border-left:2px dashed var(--border2);':''}">
      <div style="font-size:10px;color:${TYPE_COLORS[item.type]||'#888'};padding:2px 4px;display:flex;align-items:center;gap:4px">
        <img src="https://flagcdn.com/14x11/${flag}.png" width="14" height="11" style="border-radius:1px" onerror="this.style.display='none'">
        ${item.name}
      </div>
      <svg viewBox="0 0 ${segW} ${H+16}" width="${segW}" height="${H+16}" style="display:block">
        <text x="2" y="9" font-size="8" fill="rgba(255,255,255,.2)">${RESTOCK}</text>
        <text x="2" y="${H-1}" font-size="8" fill="rgba(255,255,255,.2)">0</text>
        ${ticks}${evs}
        <path d="${d} L${segW},${H} L0,${H} Z" fill="rgba(79,126,248,.08)"/>
        <path d="${d}" fill="none" stroke="#4f7ef8" stroke-width="1.5"/>
        ${lbls}
      </svg>
    </div>`;
  }).join('');

  return `<div style="margin-bottom:1rem">
    <div class="stock-chart-wrap" style="overflow-x:auto">
      <div style="display:flex;min-width:300px">${svgs}</div>
    </div>
  </div>`;
}

/* ── Contenu modal ───────────────────────────────────────────── */
function buildDetailHTML(run){
  const sessionMin=parseInt(document.getElementById('sessionHours').value)*60;
  const startTs=run.departTs;
  const endTs=run.departTs+sessionMin*60;
  const W=900;  // sera adapté par le viewBox SVG responsive
  const H=120;

  // Graphe continu multi-destinations
  // Pour chaque tronçon de trip, afficher la courbe du pays correspondant
  const chartsHTML = buildMultiDestChart(run, startTs, endTs, W, H);

  // Prédiction du premier trip
  const mainItem=run.breakdown[0];
  const firstTrip=run.trips?.[0] || {arriveTs: run.departTs + (run.tOneWay||0)*60};
  const pred=mainItem?.stockPred;
  let predHTML='';
  if(pred){
    // Couleur selon probabilité
    const proba = Math.round(mainItem.stockProba*100);
    const probaColor = proba>=75?'var(--green)':proba>=40?'#f5a623':'var(--red)';
    const probaIcon = proba>=75?'✅':proba>=40?'⚠️':'❌';

    // Scénario textuel basé sur le nouveau modèle TCT
    const model = mainItem.modelKey ? STOCK_MODELS[mainItem.modelKey] : null;
    const nCycles = model?.cycles || '?';
    let scenario = '';

    if(pred.tickBefore){
      // Nouveau modèle : position dans le cycle TCT
      scenario = `
        Arrivée à <b style="color:#ef4444">${fmtH(firstTrip.arriveTs)}</b> —
        soit <b>${pred.minAfterTick} min</b> après le tick TCT de <b style="color:#c8f542">${pred.tickBefore}</b>
        (prochain tick : <b style="color:#c8f542">${pred.tickNext}</b> dans ${pred.minToNextTick} min).<br><br>
        Cycle calibré sur <b>${nCycles} cycles mesurés</b> :
        vidage ~${pred.vidageMin} min + restock ~${pred.restockMin} min = <b>cycle total ~${pred.cycleDuration} min</b>.<br><br>
        <b style="color:${probaColor}">${pred.probaInStockPhase}%</b> de chance d'être en phase de vidage (stock présent).
        Si vide : <b style="color:${probaColor}">${pred.probaRestockFait}%</b> de chance que le restock soit déjà fait
        ${pred.minAfterTick} min après le tick
        <span style="font-size:10px;color:var(--text3)">(distribution empirique 100 mesures · P50=9.4min · P90=14.7min)</span>.
        ${pred.dataAge!==null?`<br><span style="font-size:10px;color:var(--text3)">Données YATA vieilles de ${pred.dataAge} min — ${pred.dataAge<30?'utilisées pour affiner':'trop vieilles pour vol long, modèle TCT utilisé'}</span>`:''}
      `.trim().replace(/\n\s+/g,' ');
    } else {
      scenario = `Probabilité estimée à ${proba}% selon le cycle moyen (${nCycles} cycles mesurés).`;
    }

    predHTML=`<div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid #4fc3f7;padding:1rem;margin-bottom:1rem;font-size:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
        <span style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#4fc3f7">${t('prediction')} — T1 · arrivée ${fmtH(firstTrip.arriveTs)}</span>
        <span style="font-size:16px;font-weight:700;color:${probaColor}">${probaIcon} ${proba}%</span>
      </div>
      <p style="color:var(--text2);line-height:1.7;margin-bottom:.5rem">${scenario}</p>
      <div style="display:flex;align-items:center;gap:8px;margin-top:.5rem">
        <div style="flex:1;height:6px;background:var(--bg2);border-radius:3px;overflow:hidden">
          <div style="width:${proba}%;height:100%;background:${probaColor};border-radius:3px;transition:width .3s"></div>
        </div>
        <span style="font-size:11px;color:${probaColor};font-weight:600;min-width:32px">${proba}%</span>
      </div>
    </div>`;
  }

  // Items
  const itemRows=run.breakdown.map(b=>{
    const color=TYPE_COLORS[b.type]||'#888';
    const barW=Math.round(b.stockProba*100);
    return`<div class="tl-item-row">
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

  // Profit
  const avgProba=Math.round(run.breakdown.reduce((s,b)=>s+b.stockProba,0)/run.breakdown.length*100);
  const profitExplain=`<div class="profit-explain">
    <div class="pe-row"><span>${t('profitBrut')}</span><span>$${fmt(run.rawProfitTrip)}</span></div>
    <div class="pe-row"><span>${t('probaStock')}</span><span>${avgProba}%</span></div>
    <div class="pe-row"><span>${t('profitAjuste')}</span><span>$${fmt(run.adjProfitTrip)}</span></div>
    <div class="pe-row"><span>${t('fraisVolAR')}</span><span>−$${fmt(run.travelCost*2)}</span></div>
    <div class="pe-row"><span>${t('profitNet')}</span><span class="green">$${fmt(run.netPerTrip)}</span></div>
    <div class="pe-row pe-total"><span>× ${run.maxTrips} trips</span><span class="green">$${fmt(run.totalProfit)}</span></div>
  </div>`;

  // Trips
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

  return`
    <div class="tl-section-title">${t('stockEstime')}
      <span style="font-size:11px;font-weight:400;margin-left:10px;color:var(--text3)">
        <span style="display:inline-block;width:10px;height:2px;background:#4f7ef8;vertical-align:middle"></span> ${t('depart_label')} &nbsp;
        <span style="display:inline-block;width:10px;height:2px;background:#ef4444;vertical-align:middle"></span> ${t('arrivee_label')}
      </span>
    </div>
    ${chartsHTML}
    <p style="font-size:10px;color:var(--text3);margin-top:-4px;margin-bottom:1rem">${t('simulBasee')}</p>

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

/* ── Helpers ─────────────────────────────────────────────────── */
function timeAgo(ts){const d=Math.round((Date.now()/1000-ts)/60);if(d<1)return t('instantLabel');if(d<60)return`il y a ${d} ${t('min')}`;return`il y a ${Math.round(d/60)}h`;}
function fmt(n){return Math.round(n).toLocaleString('fr-FR');}
function setBanner(type,msg){const el=document.getElementById('statusBanner');el.className=`banner banner-${type}`;el.textContent=msg;el.style.display='flex';}
