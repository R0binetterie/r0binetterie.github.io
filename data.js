/* ================================================================
   data.js — Torn Travel Optimizer
   Modèles calibrés sur données réelles (yata_tracker.py, ~10h, 97 appels)
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

/* Modèles calibrés sur données réelles (yata_tracker.py)
   restockQty = max observé sur ~10h de collecte
   vidageMin  = moyenne sur N cycles mesurés
   restockMin = délai moyen stock=0 → restock
   modelKey   = clé dans STOCK_MODELS pour le graphe */
const ITEMS = [
  /* ── Peluches ── */
  { id:'jaguar',   tornId:258, name:'Jaguar Plushie',         country:'mex', type:'plushie', buy:10000, sell:55000,  restockQty:2500, vidageMin:43,  restockMin:14, modelKey:'mex_jaguar_plushie'    },
  { id:'stingray', tornId:618, name:'Stingray Plushie',       country:'cay', type:'plushie', buy:400,   sell:20000,  restockQty:2500, vidageMin:43,  restockMin:15, modelKey:'cay_stingray_plushie'  },
  { id:'wolverine',tornId:261, name:'Wolverine Plushie',      country:'can', type:'plushie', buy:30,    sell:8000,   restockQty:2500, vidageMin:37,  restockMin:14, modelKey:'can_wolverine_plushie' },
  { id:'lion',     tornId:281, name:'Lion Plushie',           country:'sou', type:'plushie', buy:400,   sell:65000,  restockQty:2428, vidageMin:33,  restockMin:15, modelKey:'sou_lion_plushie'      },
  { id:'monkey',   tornId:269, name:'Monkey Plushie',         country:'arg', type:'plushie', buy:400,   sell:48000,  restockQty:2480, vidageMin:41,  restockMin:16, modelKey:'arg_monkey_plushie'    },
  { id:'chamois',  tornId:273, name:'Chamois Plushie',        country:'swi', type:'plushie', buy:400,   sell:12000,  restockQty:2406, vidageMin:34,  restockMin:16, modelKey:'swi_chamois_plushie'   },
  { id:'nessie',   tornId:266, name:'Nessie Plushie',         country:'uni', type:'plushie', buy:200,   sell:38000,  restockQty:2500, vidageMin:52,  restockMin:15, modelKey:'uni_nessie_plushie'    },
  { id:'redfox',   tornId:268, name:'Red Fox Plushie',        country:'uni', type:'plushie', buy:1000,  sell:40000,  restockQty:2500, vidageMin:48,  restockMin:14, modelKey:'uni_red_fox_plushie'   },
  { id:'cherry_p', tornId:277, name:'Cherry Blossom Plushie', country:'jap', type:'plushie', buy:2500,  sell:30000,  restockQty:2500, vidageMin:40,  restockMin:15, modelKey:null                    },
  { id:'panda',    tornId:274, name:'Panda Plushie',          country:'chi', type:'plushie', buy:400,   sell:72000,  restockQty:2500, vidageMin:30,  restockMin:16, modelKey:'chi_panda_plushie'     },
  { id:'camel',    tornId:384, name:'Camel Plushie',          country:'uae', type:'plushie', buy:14000, sell:55000,  restockQty:2500, vidageMin:39,  restockMin:15, modelKey:'uae_camel_plushie'     },
  /* ── Fleurs ── */
  { id:'dahlia',   tornId:260, name:'Dahlia',                 country:'mex', type:'flower',  buy:300,   sell:3500,   restockQty:9999, vidageMin:477, restockMin:58, modelKey:'mex_dahlia'            },
  { id:'orchid_b', tornId:617, name:'Banana Orchid',          country:'cay', type:'flower',  buy:4000,  sell:4500,   restockQty:9873, vidageMin:285, restockMin:63, modelKey:'cay_banana_orchid'     },
  { id:'crocus',   tornId:263, name:'Crocus',                 country:'can', type:'flower',  buy:600,   sell:3000,   restockQty:9951, vidageMin:213, restockMin:55, modelKey:'can_crocus'            },
  { id:'violet',   tornId:282, name:'African Violet',         country:'sou', type:'flower',  buy:2000,  sell:5000,   restockQty:9943, vidageMin:325, restockMin:52, modelKey:'sou_african_violet'    },
  { id:'ceibo',    tornId:271, name:'Ceibo Flower',           country:'arg', type:'flower',  buy:500,   sell:9000,   restockQty:9653, vidageMin:280, restockMin:69, modelKey:'arg_ceibo_flower'      },
  { id:'edelweiss',tornId:272, name:'Edelweiss',              country:'swi', type:'flower',  buy:900,   sell:6000,   restockQty:9925, vidageMin:185, restockMin:64, modelKey:'swi_edelweiss'         },
  { id:'heather',  tornId:267, name:'Heather',                country:'uni', type:'flower',  buy:5000,  sell:10000,  restockQty:9971, vidageMin:300, restockMin:60, modelKey:null                    },
  { id:'cherry_f', tornId:278, name:'Cherry Blossom',         country:'jap', type:'flower',  buy:500,   sell:14000,  restockQty:9843, vidageMin:218, restockMin:57, modelKey:'jap_cherry_blossom'    },
  { id:'peony',    tornId:276, name:'Peony',                  country:'chi', type:'flower',  buy:5000,  sell:20000,  restockQty:9744, vidageMin:403, restockMin:55, modelKey:'chi_peony'             },
  { id:'tribulus', tornId:385, name:'Tribulus Omanense',      country:'uae', type:'flower',  buy:6000,  sell:28000,  restockQty:9819, vidageMin:194, restockMin:70, modelKey:'uae_tribulus_omanense'  },
  { id:'orchid',   tornId:264, name:'Orchid',                 country:'haw', type:'flower',  buy:700,   sell:7000,   restockQty:9890, vidageMin:220, restockMin:54, modelKey:'haw_orchid'            },
  /* ── Drogues ── */
  { id:'xanax_can',tornId:206, name:'Xanax',                  country:'can', type:'drug',    buy:761000,sell:750000, restockQty:1854, vidageMin:11,  restockMin:157,modelKey:'can_xanax'             },
  { id:'xanax_jap',tornId:206, name:'Xanax',                  country:'jap', type:'drug',    buy:733000,sell:750000, restockQty:2077, vidageMin:36,  restockMin:125,modelKey:'jap_xanax'             },
  { id:'xanax_uni',tornId:206, name:'Xanax',                  country:'uni', type:'drug',    buy:773000,sell:750000, restockQty:2489, vidageMin:157, restockMin:108,modelKey:'uni_xanax'             },
  { id:'cannabis', tornId:196, name:'Cannabis',               country:'mex', type:'drug',    buy:500,   sell:2500,   restockQty:1000, vidageMin:300, restockMin:60, modelKey:null                    },
  { id:'ecstasy',  tornId:197, name:'Ecstasy',                country:'uni', type:'drug',    buy:3000,  sell:15000,  restockQty:1000, vidageMin:240, restockMin:60, modelKey:null                    },
  { id:'pcp',      tornId:201, name:'PCP',                    country:'arg', type:'drug',    buy:5000,  sell:20000,  restockQty:1000, vidageMin:240, restockMin:60, modelKey:null                    },
  { id:'lsd',      tornId:199, name:'LSD',                    country:'jap', type:'drug',    buy:2000,  sell:10000,  restockQty:1000, vidageMin:240, restockMin:60, modelKey:null                    },
  { id:'opium',    tornId:200, name:'Opium',                  country:'chi', type:'drug',    buy:8000,  sell:40000,  restockQty:1000, vidageMin:240, restockMin:60, modelKey:null                    },
  { id:'ketamine', tornId:198, name:'Ketamine',               country:'uae', type:'drug',    buy:6000,  sell:25000,  restockQty:1000, vidageMin:240, restockMin:60, modelKey:null                    },
  { id:'vicodin',  tornId:205, name:'Vicodin',                country:'haw', type:'drug',    buy:1000,  sell:4000,   restockQty:1000, vidageMin:300, restockMin:60, modelKey:null                    },
  { id:'melatonin',tornId:464, name:'Melatonin',              country:'sou', type:'drug',    buy:200,   sell:1500,   restockQty:1000, vidageMin:360, restockMin:60, modelKey:null                    },
];

/* Modèles calibrés — utilisés pour les graphes dans la modal */
const STOCK_MODELS = {
  'mex_jaguar_plushie':    { vidageMin:43,  restockMin:14, restockQty:2500, cycles:11 },
  'mex_dahlia':            { vidageMin:477, restockMin:58, restockQty:9999, cycles:1  },
  'cay_banana_orchid':     { vidageMin:285, restockMin:63, restockQty:9873, cycles:1  },
  'cay_stingray_plushie':  { vidageMin:43,  restockMin:15, restockQty:2500, cycles:10 },
  'can_xanax':             { vidageMin:11,  restockMin:157,restockQty:1854, cycles:3  },
  'can_wolverine_plushie': { vidageMin:37,  restockMin:14, restockQty:2500, cycles:11 },
  'can_crocus':            { vidageMin:213, restockMin:55, restockQty:9951, cycles:1  },
  'haw_orchid':            { vidageMin:220, restockMin:54, restockQty:9890, cycles:1  },
  'uni_xanax':             { vidageMin:157, restockMin:108,restockQty:2489, cycles:1  },
  'uni_nessie_plushie':    { vidageMin:52,  restockMin:15, restockQty:2500, cycles:9  },
  'uni_red_fox_plushie':   { vidageMin:48,  restockMin:14, restockQty:2500, cycles:10 },
  'arg_monkey_plushie':    { vidageMin:41,  restockMin:16, restockQty:2480, cycles:10 },
  'arg_ceibo_flower':      { vidageMin:280, restockMin:69, restockQty:9653, cycles:1  },
  'swi_edelweiss':         { vidageMin:185, restockMin:64, restockQty:9925, cycles:1  },
  'swi_chamois_plushie':   { vidageMin:34,  restockMin:16, restockQty:2406, cycles:12 },
  'jap_xanax':             { vidageMin:36,  restockMin:125,restockQty:2077, cycles:3  },
  'jap_cherry_blossom':    { vidageMin:218, restockMin:57, restockQty:9843, cycles:1  },
  'chi_panda_plushie':     { vidageMin:30,  restockMin:16, restockQty:2500, cycles:13 },
  'chi_peony':             { vidageMin:403, restockMin:55, restockQty:9744, cycles:1  },
  'uae_camel_plushie':     { vidageMin:39,  restockMin:15, restockQty:2500, cycles:11 },
  'uae_tribulus_omanense': { vidageMin:194, restockMin:70, restockQty:9819, cycles:1  },
  'sou_lion_plushie':      { vidageMin:33,  restockMin:15, restockQty:2428, cycles:12 },
  'sou_african_violet':    { vidageMin:325, restockMin:52, restockQty:9943, cycles:1  },
};

const TYPE_COLORS = { plushie:'#8b5cf6', flower:'#22c55e', drug:'#f59e0b' };
