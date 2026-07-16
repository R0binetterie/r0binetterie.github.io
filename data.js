/* ================================================================
   data.js — Torn Travel Optimizer
   Paramètres vidageMin et restockDelai calibrés sur données réelles
   Source : yata_tracker.py — 97 appels sur ~10h (15/07/2026)
   
   Peluches :  vidage ~30-52 min | restock ~14-16 min (très stable)
   Fleurs    : vidage ~185-477 min | restock ~52-70 min
   Xanax     : comportement variable selon pays
   ================================================================ */

const COUNTRIES = [
  { name:'Mexico',         code:'mex', flag:'mx', timeMin:{ standard:26,  airstrip:18,  wlt:13,  business:8  }, cost:5000  },
  { name:'Cayman Islands', code:'cay', flag:'ky', timeMin:{ standard:36,  airstrip:25,  wlt:18,  business:11 }, cost:10000 },
  { name:'Canada',         code:'can', flag:'ca', timeMin:{ standard:41,  airstrip:29,  wlt:21,  business:12 }, cost:7500  },
  { name:'Hawaii',         code:'haw', flag:'us', timeMin:{ standard:134, airstrip:94,  wlt:67,  business:40 }, cost:12000 },
  { name:'United Kingdom', code:'uni', flag:'gb', timeMin:{ standard:159, airstrip:111, wlt:80,  business:48 }, cost:18000 },
  { name:'Argentina',      code:'arg', flag:'ar', timeMin:{ standard:167, airstrip:117, wlt:84,  business:50 }, cost:22000 },
  { name:'Switzerland',    code:'swi', flag:'ch', timeMin:{ standard:175, airstrip:123, wlt:88,  business:53 }, cost:20000 },
  { name:'Japan',          code:'jap', flag:'jp', timeMin:{ standard:226, airstrip:158, wlt:113, business:68 }, cost:25000 },
  { name:'China',          code:'chi', flag:'cn', timeMin:{ standard:242, airstrip:169, wlt:121, business:73 }, cost:35000 },
  { name:'UAE',            code:'uae', flag:'ae', timeMin:{ standard:271, airstrip:190, wlt:136, business:81 }, cost:32000 },
  { name:'South Africa',   code:'sou', flag:'za', timeMin:{ standard:297, airstrip:208, wlt:149, business:89 }, cost:40000 },
];

/* restockQty = quantité remise au restock (2500 pour peluches, variable pour fleurs)
   vidageMin  = temps moyen pour vider le stock (données réelles collectées)
   restockMin = délai moyen entre stock=0 et restock (données réelles collectées)
   Les prix sell sont des fallbacks — remplacés par l'API Torn si clé fournie */
const ITEMS = [
  /* ── Peluches ─────────────────────────────────────────────────
     Vidage très stable ~30-52 min | Restock ~14-16 min (très consistant)
     restockQty fixe à 2500 pour toutes les peluches               */
  { id:'jaguar',    tornId:258, name:'Jaguar Plushie',         country:'mex', type:'plushie', buy:10000, sell:55000,  restockQty:2500, vidageMin:43,  restockMin:14 },
  { id:'stingray',  tornId:618, name:'Stingray Plushie',       country:'cay', type:'plushie', buy:2000,  sell:20000,  restockQty:2500, vidageMin:43,  restockMin:15 },
  { id:'wolverine', tornId:261, name:'Wolverine Plushie',      country:'can', type:'plushie', buy:30,    sell:8000,   restockQty:2500, vidageMin:37,  restockMin:14 },
  { id:'lion',      tornId:281, name:'Lion Plushie',           country:'sou', type:'plushie', buy:400,   sell:65000,  restockQty:2500, vidageMin:33,  restockMin:15 },
  { id:'monkey',    tornId:269, name:'Monkey Plushie',         country:'arg', type:'plushie', buy:400,   sell:48000,  restockQty:2500, vidageMin:41,  restockMin:16 },
  { id:'chamois',   tornId:273, name:'Chamois Plushie',        country:'swi', type:'plushie', buy:400,   sell:12000,  restockQty:2500, vidageMin:34,  restockMin:16 },
  { id:'nessie',    tornId:266, name:'Nessie Plushie',         country:'uni', type:'plushie', buy:200,   sell:38000,  restockQty:2500, vidageMin:52,  restockMin:15 },
  { id:'redfox',    tornId:268, name:'Red Fox Plushie',        country:'uni', type:'plushie', buy:1000,  sell:40000,  restockQty:2500, vidageMin:48,  restockMin:14 },
  { id:'cherry_p',  tornId:277, name:'Cherry Blossom Plushie', country:'jap', type:'plushie', buy:2500,  sell:30000,  restockQty:2500, vidageMin:40,  restockMin:15 },
  { id:'panda',     tornId:274, name:'Panda Plushie',          country:'chi', type:'plushie', buy:400,   sell:72000,  restockQty:2500, vidageMin:30,  restockMin:16 },
  { id:'camel',     tornId:384, name:'Camel Plushie',          country:'uae', type:'plushie', buy:14000, sell:55000,  restockQty:2500, vidageMin:39,  restockMin:15 },

  /* ── Fleurs ───────────────────────────────────────────────────
     restockQty élevée (~9000-10000) — les fleurs ont des stocks max bien plus grands
     Vidage lent ~185-477 min | Restock ~52-70 min               */
  { id:'dahlia',    tornId:260, name:'Dahlia',                 country:'mex', type:'flower',  buy:300,   sell:3500,   restockQty:9999, vidageMin:477, restockMin:58 },
  { id:'orchid_b',  tornId:617, name:'Banana Orchid',          country:'cay', type:'flower',  buy:4000,  sell:4500,   restockQty:9873, vidageMin:285, restockMin:63 },
  { id:'crocus',    tornId:263, name:'Crocus',                 country:'can', type:'flower',  buy:600,   sell:3000,   restockQty:9951, vidageMin:213, restockMin:55 },
  { id:'violet',    tornId:282, name:'African Violet',         country:'sou', type:'flower',  buy:2000,  sell:5000,   restockQty:9943, vidageMin:325, restockMin:52 },
  { id:'ceibo',     tornId:271, name:'Ceibo Flower',           country:'arg', type:'flower',  buy:500,   sell:9000,   restockQty:9653, vidageMin:280, restockMin:69 },
  { id:'edelweiss', tornId:272, name:'Edelweiss',              country:'swi', type:'flower',  buy:900,   sell:6000,   restockQty:9925, vidageMin:185, restockMin:64 },
  { id:'heather',   tornId:267, name:'Heather',                country:'uni', type:'flower',  buy:5000,  sell:10000,  restockQty:9971, vidageMin:300, restockMin:60 },
  { id:'cherry_f',  tornId:278, name:'Cherry Blossom',         country:'jap', type:'flower',  buy:500,   sell:14000,  restockQty:9843, vidageMin:218, restockMin:57 },
  { id:'peony',     tornId:276, name:'Peony',                  country:'chi', type:'flower',  buy:5000,  sell:20000,  restockQty:9744, vidageMin:403, restockMin:55 },
  { id:'tribulus',  tornId:385, name:'Tribulus Omanense',      country:'uae', type:'flower',  buy:6000,  sell:28000,  restockQty:9819, vidageMin:194, restockMin:70 },
  { id:'orchid',    tornId:264, name:'Orchid',                 country:'haw', type:'flower',  buy:700,   sell:7000,   restockQty:9890, vidageMin:220, restockMin:54 },

  /* ── Drogues ──────────────────────────────────────────────────
     Xanax très variable — restockQty ~1000-2000, vidage ~11-157 min selon pays
     Les autres drogues ont peu de cycles détectés (stock stable sur 10h) */
  { id:'xanax_can', tornId:206, name:'Xanax',                  country:'can', type:'drug',    buy:761000,sell:750000, restockQty:1854, vidageMin:11,  restockMin:157 },
  { id:'xanax_jap', tornId:206, name:'Xanax',                  country:'jap', type:'drug',    buy:733000,sell:750000, restockQty:2077, vidageMin:36,  restockMin:125 },
  { id:'xanax_uni', tornId:206, name:'Xanax',                  country:'uni', type:'drug',    buy:773000,sell:750000, restockQty:2489, vidageMin:157, restockMin:108 },
  { id:'cannabis',  tornId:196, name:'Cannabis',               country:'mex', type:'drug',    buy:500,   sell:2500,   restockQty:1000, vidageMin:300, restockMin:60  },
  { id:'ecstasy',   tornId:197, name:'Ecstasy',                country:'uni', type:'drug',    buy:3000,  sell:15000,  restockQty:1000, vidageMin:240, restockMin:60  },
  { id:'pcp',       tornId:201, name:'PCP',                    country:'arg', type:'drug',    buy:5000,  sell:20000,  restockQty:1000, vidageMin:240, restockMin:60  },
  { id:'lsd',       tornId:199, name:'LSD',                    country:'jap', type:'drug',    buy:2000,  sell:10000,  restockQty:1000, vidageMin:240, restockMin:60  },
  { id:'opium',     tornId:200, name:'Opium',                  country:'chi', type:'drug',    buy:8000,  sell:40000,  restockQty:1000, vidageMin:240, restockMin:60  },
  { id:'ketamine',  tornId:198, name:'Ketamine',               country:'uae', type:'drug',    buy:6000,  sell:25000,  restockQty:1000, vidageMin:240, restockMin:60  },
  { id:'vicodin',   tornId:205, name:'Vicodin',                country:'haw', type:'drug',    buy:1000,  sell:4000,   restockQty:1000, vidageMin:300, restockMin:60  },
  { id:'melatonin', tornId:464, name:'Melatonin',              country:'sou', type:'drug',    buy:200,   sell:1500,   restockQty:1000, vidageMin:360, restockMin:60  },
];

const TYPE_COLORS = { plushie:'#8b5cf6', flower:'#22c55e', drug:'#f59e0b' };
