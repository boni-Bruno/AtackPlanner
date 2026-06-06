/**
 * Attack Planner — Tribal Wars
 * github.com/boni-bruno/AtackPlanner
 *
 * Uso: javascript: $.getScript('https://raw.githubusercontent.com/boni-bruno/AtackPlanner/main/script.js');
 */

(function () {
  'use strict';

  /* ── Evita duplicata ── */
  if (document.getElementById('ap-overlay')) {
    document.getElementById('ap-overlay').remove();
    return;
  }

  /* ══════════════════════════════════════════
     LER DADOS DO JOGO
  ══════════════════════════════════════════ */
  var GD = window.game_data || {};

  /* Velocidade do mundo */
  var WORLD_SPEED = parseFloat(GD.speed) || 1;

  /* Unidades disponíveis no mundo (game_data.units lista as habilitadas) */
  var UNITS_ENABLED = GD.units || {};

  /* Aldeia atual */
  var CURRENT = (function(){
    var v = GD.village || {};
    return {
      name : v.name || '',
      x    : parseInt(v.x)    || null,
      y    : parseInt(v.y)    || null,
      coord: v.x && v.y ? '('+v.x+'|'+v.y+')' : ''
    };
  })();

  /* Jogador */
  var PLAYER_NAME = (GD.player && GD.player.name) || '';

  /* ── Definição completa de tropas ── */
  var ALL_TROOPS = [
    { id:'spear',    name:'Lanceiro',      emoji:'🗡️', speed:18 },
    { id:'sword',    name:'Espadachim',    emoji:'⚔️', speed:22 },
    { id:'axe',      name:'Bárbaro',       emoji:'🪓', speed:18 },
    { id:'archer',   name:'Arqueiro',      emoji:'🏹', speed:18 },
    { id:'spy',      name:'Batedor',       emoji:'👁️', speed:9  },
    { id:'light',    name:'Cav. Leve',     emoji:'🐴', speed:10 },
    { id:'marcher',  name:'Cav. Arqueira', emoji:'🎯', speed:10 },
    { id:'heavy',    name:'Cav. Pesada',   emoji:'🛡️', speed:11 },
    { id:'ram',      name:'Aríete',        emoji:'🪵', speed:30 },
    { id:'catapult', name:'Catapulta',     emoji:'🪨', speed:30 },
    { id:'knight',   name:'Paladino',      emoji:'🌟', speed:10 },
    { id:'snob',     name:'Nobre',         emoji:'👑', speed:35 },
  ];

  /* Filtra apenas tropas habilitadas no mundo atual */
  var TROOPS = ALL_TROOPS.filter(function(t){
    /* Se game_data.units existe e tem a tropa, usa; senão mostra todas */
    return Object.keys(UNITS_ENABLED).length === 0 || UNITS_ENABLED[t.id] !== undefined;
  });

  /* ══════════════════════════════════════════
     ESTADO
  ══════════════════════════════════════════ */
  var attacks    = loadAttacks();
  var selTroop   = null;
  var planMode   = 'send';
  var pickingMap = null;
  var _lastData  = null;

  /* ══════════════════════════════════════════
     PERSISTÊNCIA
  ══════════════════════════════════════════ */
  var STORE_KEY = 'tw_ap_' + (GD.world || 'default');

  function loadAttacks() {
    try {
      var key = 'tw_ap_' + ((window.game_data && window.game_data.world) || 'default');
      return JSON.parse(localStorage.getItem(key) || '[]').map(function(a){
        return Object.assign({}, a, {
          sendTime:   new Date(a.sendTime),
          arriveTime: new Date(a.arriveTime),
          createdAt:  new Date(a.createdAt)
        });
      });
    } catch(e){ return []; }
  }

  function persist() {
    localStorage.setItem(STORE_KEY, JSON.stringify(attacks));
  }

  /* ══════════════════════════════════════════
     UTILITÁRIOS
  ══════════════════════════════════════════ */
  function pad(n){ return String(Math.floor(n)).padStart(2,'0'); }

  function fmtDur(min){
    var h=Math.floor(min/60), m=Math.floor(min%60), s=Math.round((min%1)*60);
    return pad(h)+':'+pad(m)+':'+pad(s);
  }

  function fmtDT(d){ return d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR'); }

  function parseDT(ds, ts){
    if(!ds||!ts) return null;
    var dt=new Date(ds+'T'+ts);
    return isNaN(dt)?null:dt;
  }

  function eucl(ox,oy,dx,dy){ return Math.sqrt(Math.pow(dx-ox,2)+Math.pow(dy-oy,2)); }

  function esc(s){ return String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function g(id){ return document.getElementById(id); }

  /* ══════════════════════════════════════════
     SELEÇÃO POR CLIQUE NO MAPA
  ══════════════════════════════════════════ */
  function startPick(type){
    pickingMap=type;
    var hint=g('ap-hint');
    hint.textContent='🗺️ Clique em uma aldeia no mapa do jogo para definir como '+(type==='origin'?'ORIGEM':'DESTINO')+'...';
    hint.style.display='block';
    document.addEventListener('click', onMapClick, true);
  }

  function stopPick(){
    pickingMap=null;
    var hint=g('ap-hint');
    if(hint) hint.style.display='none';
    document.removeEventListener('click', onMapClick, true);
    ['ap-bmo','ap-bmd'].forEach(function(id){ var b=g(id); if(b) b.classList.remove('picking'); });
  }

  function onMapClick(e){
    var link=e.target.closest && e.target.closest('a[href]');
    if(!link) return;
    var href=link.href||'';
    var xm=href.match(/[?&]x=(\d+)/);
    var ym=href.match(/[?&]y=(\d+)/);
    if(!xm||!ym) return;
    e.preventDefault(); e.stopPropagation();
    var x=parseInt(xm[1]), y=parseInt(ym[1]);
    var name=(link.getAttribute('data-village-name')||link.title||link.textContent||'').trim()||'('+x+'|'+y+')';
    var pre=pickingMap==='origin'?'ap-o':'ap-d';
    g(pre+'-name').value=name;
    g(pre+'-x').value=x;
    g(pre+'-y').value=y;
    stopPick();
    recalc();
  }

  /* ══════════════════════════════════════════
     CSS
  ══════════════════════════════════════════ */
  var CSS=[
  '#ap-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center}',
  '#ap-modal{background:#f4e4c1;border:3px solid #7a5c1e;border-radius:6px;width:700px;max-width:97vw;max-height:93vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,.6);font-family:Verdana,sans-serif;font-size:12px;color:#3b2a0e;position:relative}',
  '#ap-modal *{box-sizing:border-box}',
  '#ap-hdr{background:#2c1a06;padding:10px 16px;display:flex;align-items:center;gap:10px;border-bottom:2px solid #8b6914}',
  '#ap-hdr h2{color:#f4d87a;font-size:15px;font-weight:700;margin:0;letter-spacing:1px;text-transform:uppercase;flex:1}',
  '#ap-hdr small{color:#a08040;font-size:10px}',
  '#ap-x{background:#7a2020;color:#fff;border:none;border-radius:4px;width:26px;height:26px;cursor:pointer;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
  '#ap-x:hover{background:#a03030}',
  '.ap-tabs{display:flex;background:#3d2805;border-bottom:1px solid #8b6914}',
  '.ap-tab{padding:8px 18px;background:transparent;border:none;color:#a08040;font-size:11px;font-weight:700;cursor:pointer;border-bottom:3px solid transparent;font-family:Verdana,sans-serif;text-transform:uppercase;letter-spacing:.5px;transition:all .15s}',
  '.ap-tab.on{color:#f4d87a;border-bottom-color:#d4941e;background:rgba(212,148,30,.12)}',
  '.ap-tab:hover:not(.on){color:#d4b060;background:rgba(255,255,255,.05)}',
  '.ap-pnl{display:none;padding:14px 16px}.ap-pnl.on{display:block}',
  '.ap-sec{background:#fffbe6;border:1px solid #c8a84b;border-radius:4px;margin-bottom:12px;overflow:hidden}',
  '.ap-sh{background:#e8d098;padding:6px 10px;font-weight:700;font-size:11px;color:#5a3a00;border-bottom:1px solid #c8a84b;display:flex;align-items:center;gap:6px}',
  '.ap-sb{padding:10px}',
  '.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
  '.ap-fld{display:flex;flex-direction:column;gap:4px}',
  '.ap-lbl{font-size:10px;font-weight:700;text-transform:uppercase;color:#6b4c10;letter-spacing:.4px}',
  '.ap-inp,.ap-sel{padding:6px 8px;border:1px solid #b8901a;border-radius:3px;background:#fffdf0;color:#3b2a0e;font-size:12px;font-family:Verdana,sans-serif;width:100%}',
  '.ap-inp:focus,.ap-sel:focus{outline:none;border-color:#d4941e;box-shadow:0 0 0 2px rgba(212,148,30,.2)}',
  '.ap-row{display:flex;gap:6px;align-items:flex-end;margin-top:6px}',
  '.btn-map{padding:6px 9px;background:#5a7a1e;color:#e8f8a0;border:1px solid #3a5a0e;border-radius:3px;cursor:pointer;font-size:11px;font-weight:700;font-family:Verdana,sans-serif;white-space:nowrap}',
  '.btn-map:hover{background:#6a9020}.btn-map.picking{background:#9a6010;border-color:#6a4008}',
  '.btn-cur{padding:6px 8px;background:#3a5a8a;color:#c8e0ff;border:1px solid #1a3a6a;border-radius:3px;cursor:pointer;font-size:10px;font-weight:700;font-family:Verdana,sans-serif;white-space:nowrap}',
  '.btn-cur:hover{background:#4a6a9a}',
  '#ap-hint{display:none;background:#e8f8a0;border:1px solid #5a7a1e;border-radius:3px;padding:7px 10px;font-size:11px;color:#3a5a00;margin-bottom:10px;font-weight:700}',
  '.ap-dist{display:none;background:#fff3cc;border:1px solid #d4941e;border-radius:3px;padding:6px 10px;margin-top:8px;font-size:11px}',
  '.ap-tgrd{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}',
  '.ap-trp{border:1px solid #c8a84b;border-radius:3px;padding:6px 4px;text-align:center;cursor:pointer;background:#fffbe6;transition:all .15s}',
  '.ap-trp:hover{border-color:#d4941e;background:#fff3cc}.ap-trp.on{border:2px solid #8b2020;background:#ffe0c0}',
  '.ap-trp .e{font-size:17px;display:block}.ap-trp .n{font-size:9px;color:#6b4c10;display:block;margin-top:2px}.ap-trp .s{font-size:9px;color:#8b2020;font-weight:700}',
  '.ap-tgl{display:flex;border:1px solid #b8901a;border-radius:3px;overflow:hidden;margin-bottom:10px}',
  '.ap-tgl-btn{flex:1;padding:7px;background:#fffbe6;border:none;font-size:11px;font-family:Verdana,sans-serif;cursor:pointer;color:#6b4c10;font-weight:700;transition:all .15s}',
  '.ap-tgl-btn.on{background:#8b2020;color:#fff8e0}',
  '#ap-res{display:none;margin-top:10px;background:#fff8e0;border:1px solid #d4941e;border-radius:4px;padding:10px}',
  '#ap-res.on{display:block}',
  '.ap-rg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px}',
  '.ap-rc{text-align:center;padding:8px;background:#fffbe6;border:1px solid #c8a84b;border-radius:3px}',
  '.ap-rc .v{font-size:14px;font-weight:700;color:#8b2020;display:block}.ap-rc .l{font-size:9px;color:#6b4c10;text-transform:uppercase}',
  '.ap-ir{display:flex;justify-content:space-between;font-size:11px;padding:3px 0}.ap-ir strong{color:#3b2a0e}',
  '.ap-sep{border:none;border-top:1px solid #e8d098;margin:8px 0}',
  '.btn-pri{width:100%;padding:9px;background:#8b2020;color:#fff8e0;border:1px solid #6a1010;border-radius:3px;font-size:12px;font-family:Verdana,sans-serif;font-weight:700;cursor:pointer;margin-top:10px}',
  '.btn-pri:hover{background:#a03030}',
  '.btn-sec{padding:6px 12px;background:#fffbe6;color:#5a3a00;border:1px solid #b8901a;border-radius:3px;font-size:11px;font-family:Verdana,sans-serif;cursor:pointer;font-weight:700}',
  '.btn-sec:hover{background:#fff3cc;border-color:#d4941e}',
  '.btn-del{padding:4px 8px;background:transparent;color:#8b2020;border:1px solid #c8a84b;border-radius:3px;font-size:10px;cursor:pointer;font-family:Verdana,sans-serif}',
  '.btn-del:hover{background:#ffe0e0}',
  '.ap-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}',
  '.ap-info-bar{background:#e8d098;border:1px solid #c8a84b;border-radius:3px;padding:6px 10px;font-size:11px;margin-bottom:12px;display:flex;gap:16px;flex-wrap:wrap}',
  '.ap-info-bar span{color:#5a3a00}.ap-info-bar strong{color:#3b2a0e}',
  '.ap-tbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}',
  '.ap-cnt{font-size:11px;color:#6b4c10}',
  '.ap-tw{overflow-x:auto}',
  'table.ap-t{width:100%;border-collapse:collapse;font-size:11px;min-width:580px}',
  'table.ap-t th{background:#3d2805;color:#f4d87a;padding:7px 8px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}',
  'table.ap-t td{padding:7px 8px;border-bottom:1px solid #e8d098;vertical-align:middle}',
  'table.ap-t tr:hover td{background:#fff8e0}',
  'table.ap-t tr:last-child td{border-bottom:none}',
  '.bdg{display:inline-block;padding:2px 7px;border-radius:10px;font-size:9px;font-weight:700;font-family:Verdana,sans-serif}',
  '.bdg-w{background:#ffe0e0;color:#6a1010}.bdg-r{background:#fff3cc;color:#6a4008}.bdg-d{background:#e0f0d0;color:#2a5a10}',
  '.ap-empty{text-align:center;padding:30px;color:#8b6914}',
  ].join('');

  /* ══════════════════════════════════════════
     HTML
  ══════════════════════════════════════════ */
  function buildHTML(){
    var today   = new Date().toISOString().split('T')[0];
    var nowTime = new Date().toTimeString().slice(0,8);

    var troopCards = TROOPS.map(function(t){
      return '<div class="ap-trp" id="ap-trp-'+t.id+'" onclick="AP.troop(\''+t.id+'\')" title="'+t.name+' — '+t.speed+' min/campo">'+
        '<span class="e">'+t.emoji+'</span>'+
        '<span class="n">'+t.name+'</span>'+
        '<span class="s">'+t.speed+'m</span>'+
      '</div>';
    }).join('');

    /* Linha de info do mundo */
    var worldInfo = '<div class="ap-info-bar">'+
      '<span>🌍 Mundo: <strong>'+(GD.world||'—')+'</strong></span>'+
      '<span>⚡ Velocidade: <strong>'+WORLD_SPEED+'×</strong></span>'+
      (PLAYER_NAME?'<span>👤 Jogador: <strong>'+esc(PLAYER_NAME)+'</strong></span>':'')+
      (CURRENT.coord?'<span>🏰 Aldeia atual: <strong>'+esc(CURRENT.name||CURRENT.coord)+'</strong> '+esc(CURRENT.coord)+'</span>':'')+
    '</div>';

    return '<div id="ap-overlay" onclick="if(event.target===this)AP.close()">'+
    '<div id="ap-modal">'+

    '<div id="ap-hdr">'+
      '<span style="font-size:22px">⚔️</span>'+
      '<div style="flex:1"><h2>Attack Planner</h2>'+
        '<small>Tribal Wars · Planejador de Ataques</small>'+
      '</div>'+
      '<button id="ap-x" onclick="AP.close()" title="Fechar">✕</button>'+
    '</div>'+

    '<div class="ap-tabs">'+
      '<button class="ap-tab on" id="ap-t-plan" onclick="AP.tab(\'plan\')">⚔ Planejar</button>'+
      '<button class="ap-tab" id="ap-t-list" onclick="AP.tab(\'list\')">📋 Ataques <span id="ap-badge"></span></button>'+
    '</div>'+

    /* ── PAINEL PLANEJAR ── */
    '<div class="ap-pnl on" id="ap-p-plan">'+

      worldInfo+
      '<div id="ap-hint"></div>'+

      /* Velocidade */
      '<div class="ap-sec">'+
        '<div class="ap-sh">🌍 Configuração do Mundo</div>'+
        '<div class="ap-sb g2">'+
          '<div class="ap-fld"><label class="ap-lbl">Velocidade do Mundo (×)</label>'+
            '<input type="number" class="ap-inp" id="ap-ws" value="'+WORLD_SPEED+'" min="0.1" step="0.1">'+
          '</div>'+
          '<div class="ap-fld"><label class="ap-lbl">Fator de unidade (padrão=1)</label>'+
            '<input type="number" class="ap-inp" id="ap-us" value="1" min="0.1" step="0.1" title="Velocidade das unidades do mundo (normalmente 1)">'+
          '</div>'+
        '</div>'+
      '</div>'+

      /* Aldeias */
      '<div class="ap-sec">'+
        '<div class="ap-sh">🏰 Aldeias</div>'+
        '<div class="ap-sb g2">'+
          '<div class="ap-fld">'+
            '<label class="ap-lbl">Aldeia de Origem</label>'+
            '<input type="text" class="ap-inp" id="ap-o-name" placeholder="Nome da aldeia" value="'+esc(CURRENT.name||'')+'">'+
            '<div class="ap-row">'+
              '<input type="number" class="ap-inp" id="ap-o-x" placeholder="X" min="0" max="999" style="width:62px;flex:none" value="'+(CURRENT.x||'')+'">'+
              '<input type="number" class="ap-inp" id="ap-o-y" placeholder="Y" min="0" max="999" style="width:62px;flex:none" value="'+(CURRENT.y||'')+'">'+
              '<button class="btn-map" id="ap-bmo" onclick="AP.pick(\'origin\')">🗺 Mapa</button>'+
              '<button class="btn-cur" onclick="AP.cur()" title="Recarregar aldeia atual">📍 Atual</button>'+
            '</div>'+
          '</div>'+
          '<div class="ap-fld">'+
            '<label class="ap-lbl">Aldeia de Destino</label>'+
            '<input type="text" class="ap-inp" id="ap-d-name" placeholder="Nome da aldeia">'+
            '<div class="ap-row">'+
              '<input type="number" class="ap-inp" id="ap-d-x" placeholder="X" min="0" max="999" style="width:62px;flex:none">'+
              '<input type="number" class="ap-inp" id="ap-d-y" placeholder="Y" min="0" max="999" style="width:62px;flex:none">'+
              '<button class="btn-map" id="ap-bmd" onclick="AP.pick(\'dest\')">🗺 Mapa</button>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="ap-dist" id="ap-dist"></div>'+
      '</div>'+

      /* Tropa */
      '<div class="ap-sec">'+
        '<div class="ap-sh">🛡 Tropa Mais Lenta do Ataque</div>'+
        '<div class="ap-sb"><div class="ap-tgrd">'+troopCards+'</div></div>'+
      '</div>'+

      /* Modo */
      '<div class="ap-sec">'+
        '<div class="ap-sh">🕐 Modo de Planejamento</div>'+
        '<div class="ap-sb">'+
          '<div class="ap-tgl">'+
            '<button class="ap-tgl-btn on" id="ap-ms" onclick="AP.mode(\'send\')">📤 Definir Horário de Envio</button>'+
            '<button class="ap-tgl-btn" id="ap-ma" onclick="AP.mode(\'arrive\')">🎯 Definir Horário de Chegada</button>'+
          '</div>'+
          '<div id="ap-fs" class="g2">'+
            '<div class="ap-fld"><label class="ap-lbl">Data de Envio</label><input type="date" class="ap-inp" id="ap-sd" value="'+today+'"></div>'+
            '<div class="ap-fld"><label class="ap-lbl">Hora de Envio</label><input type="time" class="ap-inp" id="ap-st" step="1" value="'+nowTime+'"></div>'+
          '</div>'+
          '<div id="ap-fa" style="display:none" class="g2">'+
            '<div class="ap-fld"><label class="ap-lbl">Data de Chegada</label><input type="date" class="ap-inp" id="ap-ad" value="'+today+'"></div>'+
            '<div class="ap-fld"><label class="ap-lbl">Hora de Chegada</label><input type="time" class="ap-inp" id="ap-at" step="1" value="'+nowTime+'"></div>'+
          '</div>'+
          '<div id="ap-res">'+
            '<div class="ap-rg">'+
              '<div class="ap-rc"><span class="v" id="ap-r1">—</span><span class="l">Distância</span></div>'+
              '<div class="ap-rc"><span class="v" id="ap-r2">—</span><span class="l">Duração da Viagem</span></div>'+
              '<div class="ap-rc"><span class="v" id="ap-r3">—</span><span class="l">Tropa</span></div>'+
            '</div>'+
            '<hr class="ap-sep">'+
            '<div class="ap-ir"><span>📤 Enviar em:</span><strong id="ap-r4">—</strong></div>'+
            '<div class="ap-ir"><span>🎯 Chega em:</span><strong id="ap-r5">—</strong></div>'+
          '</div>'+
        '</div>'+
      '</div>'+

      /* Obs */
      '<div class="ap-sec">'+
        '<div class="ap-sh">📝 Observações</div>'+
        '<div class="ap-sb">'+
          '<input type="text" class="ap-inp" id="ap-notes" placeholder="ex: Nobre + ram, Fake, coordenar com aliado...">'+
          '<div class="ap-act">'+
            '<button class="btn-pri" onclick="AP.save()">⚔ Calcular &amp; Salvar Ataque</button>'+
            '<button class="btn-sec" onclick="AP.clear()">🔄 Limpar</button>'+
          '</div>'+
        '</div>'+
      '</div>'+

    '</div>'+ /* fim plan */

    /* ── PAINEL LISTA ── */
    '<div class="ap-pnl" id="ap-p-list">'+
      '<div class="ap-tbar">'+
        '<span class="ap-cnt" id="ap-total">0 ataques</span>'+
        '<div style="display:flex;gap:6px;flex-wrap:wrap">'+
          '<button class="btn-sec" onclick="AP.sort()">⬆ Ordenar por envio</button>'+
          '<button class="btn-sec" onclick="AP.csv()">⬇ Exportar CSV</button>'+
          '<button class="btn-del" onclick="AP.clearAll()">🗑 Limpar tudo</button>'+
        '</div>'+
      '</div>'+
      '<div id="ap-tbl"></div>'+
    '</div>'+

    '</div></div>'; /* modal + overlay */
  }

  /* ══════════════════════════════════════════
     RECALCULAR
  ══════════════════════════════════════════ */
  function recalc(){
    var ox=parseFloat(g('ap-o-x').value);
    var oy=parseFloat(g('ap-o-y').value);
    var dx=parseFloat(g('ap-d-x').value);
    var dy=parseFloat(g('ap-d-y').value);
    var distEl=g('ap-dist'), resEl=g('ap-res');

    if(isNaN(ox)||isNaN(oy)||isNaN(dx)||isNaN(dy)){
      distEl.style.display='none'; resEl.classList.remove('on'); _lastData=null; return;
    }

    var d=eucl(ox,oy,dx,dy);
    distEl.style.display='block';
    distEl.innerHTML='📏 Distância: <strong style="color:#8b2020">'+d.toFixed(2)+'</strong> campos';

    if(!selTroop){ resEl.classList.remove('on'); _lastData=null; return; }

    var ws=parseFloat(g('ap-ws').value)||1;
    var us=parseFloat(g('ap-us').value)||1;
    /* Fórmula TW: tempo (min) = distância × velocidade_tropa / (vel_mundo × vel_unidade) */
    var tmin=(d * selTroop.speed) / (ws * us);
    var tms=tmin*60000;

    var sendT, arriveT;
    if(planMode==='send'){
      sendT=parseDT(g('ap-sd').value, g('ap-st').value);
      if(!sendT){ resEl.classList.remove('on'); _lastData=null; return; }
      arriveT=new Date(sendT.getTime()+tms);
    } else {
      arriveT=parseDT(g('ap-ad').value, g('ap-at').value);
      if(!arriveT){ resEl.classList.remove('on'); _lastData=null; return; }
      sendT=new Date(arriveT.getTime()-tms);
    }

    g('ap-r1').textContent=d.toFixed(2)+' c';
    g('ap-r2').textContent=fmtDur(tmin);
    g('ap-r3').textContent=selTroop.emoji+' '+selTroop.name;
    g('ap-r4').textContent=fmtDT(sendT);
    g('ap-r5').textContent=fmtDT(arriveT);
    resEl.classList.add('on');
    _lastData={d:d, tmin:tmin, sendT:sendT, arriveT:arriveT};
  }

  /* ══════════════════════════════════════════
     TABELA DE ATAQUES
  ══════════════════════════════════════════ */
  function renderTable(){
    var tbl=g('ap-tbl'), tot=g('ap-total'), bdg=g('ap-badge');
    if(!tbl) return;
    tot.textContent=attacks.length+' ataque(s)';
    bdg.textContent=attacks.length>0?'('+attacks.length+')':'';

    if(!attacks.length){
      tbl.innerHTML='<div class="ap-empty">⚔️<br>Nenhum ataque planejado.<br><small>Use a aba Planejar para adicionar.</small></div>';
      return;
    }

    var now=new Date();
    var rows=attacks.map(function(a,i){
      var badge;
      if(a.arriveTime<now)    badge='<span class="bdg bdg-d">✔ Chegou</span>';
      else if(a.sendTime<now) badge='<span class="bdg bdg-r">✈ Em rota</span>';
      else { var rem=(a.sendTime-now)/60000; badge='<span class="bdg bdg-w">⏳ em '+fmtDur(rem)+'</span>'; }
      return '<tr>'+
        '<td style="color:#8b6914;font-weight:700">#'+pad(i+1)+'</td>'+
        '<td style="font-weight:700">'+esc(a.origin)+'</td>'+
        '<td style="color:#8b2020;font-weight:700">'+esc(a.dest)+'</td>'+
        '<td>'+a.troop.emoji+' '+a.troop.name+'</td>'+
        '<td style="font-family:monospace;font-size:10px">'+a.sendTime.toLocaleString('pt-BR')+'</td>'+
        '<td style="font-family:monospace;font-size:10px">'+a.arriveTime.toLocaleString('pt-BR')+'</td>'+
        '<td style="font-family:monospace">'+fmtDur(a.travelMin)+'</td>'+
        '<td>'+badge+'</td>'+
        '<td style="color:#6b4c10;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(a.notes||'—')+'</td>'+
        '<td><button class="btn-del" onclick="AP.del('+a.id+')">🗑</button></td>'+
      '</tr>';
    }).join('');

    tbl.innerHTML='<div class="ap-tw"><table class="ap-t">'+
      '<thead><tr><th>#</th><th>Origem</th><th>Destino</th><th>Tropa</th>'+
      '<th>Envio</th><th>Chegada</th><th>Duração</th><th>Status</th><th>Obs.</th><th></th></tr></thead>'+
      '<tbody>'+rows+'</tbody></table></div>';
  }

  /* ══════════════════════════════════════════
     API PÚBLICA
  ══════════════════════════════════════════ */
  window.AP={
    close:function(){ var el=g('ap-overlay'); if(el) el.remove(); stopPick(); },
    tab:function(t){
      ['plan','list'].forEach(function(x){
        var tab=g('ap-t-'+x),pnl=g('ap-p-'+x);
        if(tab) tab.classList.toggle('on',x===t);
        if(pnl) pnl.classList.toggle('on',x===t);
      });
      if(t==='list') renderTable();
    },
    troop:function(id){
      document.querySelectorAll('.ap-trp').forEach(function(c){c.classList.remove('on')});
      var el=g('ap-trp-'+id); if(el) el.classList.add('on');
      selTroop=TROOPS.find(function(t){return t.id===id});
      recalc();
    },
    mode:function(m){
      planMode=m;
      g('ap-ms').classList.toggle('on',m==='send');
      g('ap-ma').classList.toggle('on',m==='arrive');
      g('ap-fs').style.display=m==='send'?'':'none';
      g('ap-fa').style.display=m==='arrive'?'':'none';
      recalc();
    },
    pick:function(type){
      if(pickingMap===type){ stopPick(); return; }
      stopPick();
      g('ap-bm'+(type==='origin'?'o':'d')).classList.add('picking');
      startPick(type);
    },
    cur:function(){
      var v=gameVillage();
      if(!v){ alert('Não foi possível detectar a aldeia atual. Informe as coordenadas manualmente.'); return; }
      g('ap-o-name').value=v.name; g('ap-o-x').value=v.x; g('ap-o-y').value=v.y;
      recalc();
    },
    save:function(){
      if(!_lastData){ alert('Preencha origem, destino, tropa e horário antes de salvar.'); return; }
      var origin=g('ap-o-name').value||'('+g('ap-o-x').value+'|'+g('ap-o-y').value+')';
      var dest=g('ap-d-name').value||'('+g('ap-d-x').value+'|'+g('ap-d-y').value+')';
      attacks.push({ id:Date.now(), origin:origin, dest:dest, troop:selTroop,
        distance:_lastData.d, travelMin:_lastData.tmin,
        sendTime:_lastData.sendT, arriveTime:_lastData.arriveT,
        notes:g('ap-notes').value, createdAt:new Date() });
      persist(); renderTable(); this.tab('list');
    },
    clear:function(){
      ['ap-o-name','ap-o-x','ap-o-y','ap-d-name','ap-d-x','ap-d-y','ap-notes'].forEach(function(id){
        var el=g(id); if(el) el.value='';
      });
      document.querySelectorAll('.ap-trp').forEach(function(c){c.classList.remove('on')});
      selTroop=null; _lastData=null;
      g('ap-res').classList.remove('on');
      g('ap-dist').style.display='none';
    },
    del:function(id){
      attacks=attacks.filter(function(a){return a.id!==id});
      persist(); renderTable();
    },
    sort:function(){
      attacks.sort(function(a,b){return a.sendTime-b.sendTime});
      persist(); renderTable();
    },
    clearAll:function(){
      if(!attacks.length) return;
      if(confirm('Remover todos os '+attacks.length+' ataques planejados?')){
        attacks=[]; persist(); renderTable();
      }
    },
    csv:function(){
      if(!attacks.length){ alert('Nenhum ataque para exportar.'); return; }
      var hdr='Origem\tDestino\tTropa\tDistância\tDuração\tEnvio\tChegada\tObs.';
      var rows=attacks.map(function(a){
        return [a.origin,a.dest,a.troop.name,a.distance.toFixed(2),fmtDur(a.travelMin),
                a.sendTime.toLocaleString('pt-BR'),a.arriveTime.toLocaleString('pt-BR'),a.notes||''].join('\t');
      });
      var blob=new Blob([[hdr].concat(rows).join('\n')],{type:'text/tab-separated-values'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url; a.download='attack_planner_tw.tsv'; a.click();
      URL.revokeObjectURL(url);
    }
  };

  /* gameVillage usa dados detectados no início */
  function gameVillage(){
    try {
      var v=window.game_data&&window.game_data.village;
      if(v) return {name:v.name,x:parseInt(v.x),y:parseInt(v.y)};
    } catch(e){}
    return null;
  }

  /* ══════════════════════════════════════════
     INJETAR E ABRIR DIRETO
  ══════════════════════════════════════════ */
  var styleEl=document.getElementById('ap-css')||document.createElement('style');
  styleEl.id='ap-css'; styleEl.textContent=CSS;
  document.head.appendChild(styleEl);

  var wrap=document.createElement('div');
  wrap.innerHTML=buildHTML();
  document.body.appendChild(wrap.firstElementChild);

  /* Listeners */
  ['ap-o-x','ap-o-y','ap-d-x','ap-d-y','ap-sd','ap-st','ap-ad','ap-at','ap-ws','ap-us'].forEach(function(id){
    var el=g(id);
    if(el){ el.addEventListener('input',recalc); el.addEventListener('change',recalc); }
  });

  /* Atualiza status da lista a cada 30s */
  setInterval(function(){
    var pnl=g('ap-p-list');
    if(pnl&&pnl.classList.contains('on')) renderTable();
  },30000);

  /* Recalc inicial se aldeia atual já preenchida */
  recalc();

})();
