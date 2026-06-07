/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              ATTACK PLANNER — Tribal Wars                   ║
 * ║          github.com/boni-bruno/AtackPlanner                 ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  Uso:                                                        ║
 * ║  javascript: $.getScript(                                    ║
 * ║    'https://raw.githubusercontent.com/boni-bruno/           ║
 * ║     AtackPlanner/main/script.js');                           ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  CHANGELOG                                                   ║
 * ╠══════════════╦═══════════════════════════════════════════════╣
 * ║  v1.0.0      ║  Versão inicial: pop-up, tropas, tabela,      ║
 * ║  2025-01-01  ║  localStorage por mundo.                      ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v1.1.0      ║  Script abre direto ao executar (sem botão    ║
 * ║  2025-01-02  ║  fixo). Lê game_data do jogo.                 ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v1.2.0      ║  Lê speed e unit_speed via API do servidor    ║
 * ║  2025-01-03  ║  (/interface.php?func=get_config).            ║
 * ║              ║  Fórmula correta: dist × base × us / ws.      ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v1.3.0      ║  Changelog no cabeçalho. Seção redundante     ║
 * ║  2025-06-06  ║  de config removida; ícone ✏️ no cabeçalho    ║
 * ║              ║  permite editar velocidades inline.           ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v1.4.0      ║  Campo X aceita colar coordenada completa     ║
 * ║  2025-06-06  ║  no formato 490|834 — X e Y preenchidos       ║
 * ║              ║  automaticamente, ignorando o |.              ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v1.5.0      ║  Botões separados: Calcular e Salvar Ataque.  ║
 * ║  2025-06-06  ║  Salvar só aparece após clicar em Calcular.   ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v1.6.0      ║  Fórmula corrigida: dist × base / (ws × us). ║
 * ║  2025-06-06  ║  Validado com dados reais do mundo br140.     ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v1.7.0      ║  Adicionado horário de retorno das tropas     ║
 * ║  2025-06-06  ║  (chegada + tempo de viagem). Exibido no      ║
 * ║              ║  resultado e na tabela de ataques.            ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v1.8.0      ║  Ícones reais das tropas carregados do        ║
 * ║  2025-06-06  ║  próprio servidor do TW. Fallback para emoji  ║
 * ║              ║  caso a imagem não carregue.                  ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v1.9.0      ║  Copiar/Colar JSON para portabilidade.        ║
 * ║  2025-06-06  ║  Status expandido: alerta <10min (pisca),     ║
 * ║              ║  em rota, chegou, retornou. Cor por linha.    ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v2.0.0      ║  Botão copiar JSON; badge de contagem sempre  ║
 * ║  2025-06-06  ║  visível; tabela responsiva sem scroll lateral;║
 * ║              ║  ataques sempre ordenados por horário envio.  ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v2.1.0      ║  Exportação BB-code para fórum TW com seleção ║
 * ║  2025-06-06  ║  individual de ataques; [coord], [unit] e     ║
 * ║              ║  botão copiar. Inclui coluna Obs.             ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v2.2.0      ║  BB-code simplificado: uma linha por ataque   ║
 * ║  2025-06-06  ║  no formato: Plano de Ataque contra [village] ║
 * ║              ║  (chegada em ...): Unidade mais lenta: [unit] ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v2.3.0      ║  Coordenadas de origem e destino salvas junto ║
 * ║  2025-06-06  ║  ao ataque. Ao abrir o AP, busca nomes atuais ║
 * ║              ║  via API get_villages e atualiza automaticam. ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v2.4.0      ║  Atualização de nomes via game_data da página ║
 * ║  2025-06-06  ║  atual + scripts inline. API get_villages     ║
 * ║              ║  removida (não suportada no TW BR).           ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v2.5.0      ║  Badge atualizado ao abrir. Origem somente    ║
 * ║  2025-06-06  ║  leitura. Campo Y removido (cola X|Y no X).  ║
 * ║              ║  Checkbox da tabela removido.                 ║
 * ╠══════════════╬═══════════════════════════════════════════════╣
 * ║  v2.6.0      ║  Badge corrigido (atualiza após HTML injetar).║
 * ║  2025-06-06  ║  Botão Mapa removido. Coluna # sem quebra de  ║
 * ║              ║  linha (#001 em vez de # / 0 / 1).           ║
 * ╚══════════════╩═══════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  var AP_VERSION = 'v2.6.0';

  /* ── Evita duplicata: executar de novo fecha o pop-up ── */
  if (document.getElementById('ap-overlay')) {
    document.getElementById('ap-overlay').remove();
    return;
  }

  /* ══════════════════════════════════════════════════════
     ESTADO
  ══════════════════════════════════════════════════════ */
  var attacks      = [];
  var selTroop     = null;
  var planMode     = 'send';
  var _lastData    = null;
  var _fromCalcBtn = false;
  var WORLD_SPEED  = 1;
  var UNIT_SPEED   = 1;
  var STORE_KEY    = 'tw_ap_default';

  /* ══════════════════════════════════════════════════════
     DADOS DO JOGO (game_data)
  ══════════════════════════════════════════════════════ */
  var GD = window.game_data || {};

  var CURRENT = (function () {
    var v = GD.village || {};
    return {
      name : v.name  || '',
      x    : parseInt(v.x) || null,
      y    : parseInt(v.y) || null,
      coord: (v.x && v.y) ? '(' + v.x + '|' + v.y + ')' : ''
    };
  })();

  var PLAYER_NAME   = (GD.player && GD.player.name) || '';
  var WORLD_ID      = GD.world || '';
  var UNITS_ENABLED = Array.isArray(GD.units) ? GD.units : [];

  STORE_KEY = 'tw_ap_' + (WORLD_ID || 'default');

  /* ══════════════════════════════════════════════════════
     ÍCONES DAS TROPAS
  ══════════════════════════════════════════════════════ */
  function detectIconBase() {
    var img = document.querySelector('img[src*="unit_"][src*="graphic"]');
    if (img) return img.src.replace(/graphic\/.*$/, 'graphic/unit/unit_');
    try { var gp = window.game_data && window.game_data.graphic_path; if (gp) return gp + 'unit/unit_'; } catch(e) {}
    return 'https://dsbr.innogamescdn.com/asset/graphic/unit/unit_';
  }
  var ICON_BASE = detectIconBase();

  /* ══════════════════════════════════════════════════════
     TABELA DE TROPAS
  ══════════════════════════════════════════════════════ */
  var ALL_TROOPS = [
    { id:'spear',    name:'Lanceiro',      emoji:'🗡️',  speed:18 },
    { id:'sword',    name:'Espadachim',    emoji:'⚔️',  speed:22 },
    { id:'axe',      name:'Bárbaro',       emoji:'🪓',  speed:18 },
    { id:'archer',   name:'Arqueiro',      emoji:'🏹',  speed:18 },
    { id:'marcher',  name:'Cav. Arqueira', emoji:'🎯',  speed:10 },
    { id:'spy',      name:'Batedor',       emoji:'👁️',  speed:9  },
    { id:'light',    name:'Cav. Leve',     emoji:'🐴',  speed:10 },
    { id:'heavy',    name:'Cav. Pesada',   emoji:'🛡️',  speed:11 },
    { id:'ram',      name:'Aríete',        emoji:'🪵',  speed:30 },
    { id:'catapult', name:'Catapulta',     emoji:'🪨',  speed:30 },
    { id:'knight',   name:'Paladino',      emoji:'🌟',  speed:10 },
    { id:'snob',     name:'Nobre',         emoji:'👑',  speed:35 },
    { id:'militia',  name:'Milícia',       emoji:'🧑',  speed:0  },
  ];

  var TROOPS = ALL_TROOPS.filter(function (t) {
    if (t.speed === 0) return false;
    if (!UNITS_ENABLED.length) return true;
    return UNITS_ENABLED.indexOf(t.id) !== -1;
  });

  /* ══════════════════════════════════════════════════════
     CONFIG DO MUNDO
  ══════════════════════════════════════════════════════ */
  function loadWorldConfig(cb) {
    fetch('/interface.php?func=get_config')
      .then(function (r) { return r.text(); })
      .then(function (xml) {
        var sp = xml.match(/<speed>([\d.]+)<\/speed>/);
        var us = xml.match(/<unit_speed>([\d.]+)<\/unit_speed>/);
        if (sp) WORLD_SPEED = parseFloat(sp[1]);
        if (us) UNIT_SPEED  = parseFloat(us[1]);
        cb();
      })
      .catch(function () { cb(); });
  }

  /* ══════════════════════════════════════════════════════
     ATUALIZA NOMES DAS ALDEIAS
  ══════════════════════════════════════════════════════ */
  function refreshVillageNames(cb) {
    if (!attacks.length) { cb(); return; }
    var updated = false;
    try {
      var gv = window.game_data && window.game_data.village;
      if (gv && gv.x && gv.y && gv.name) {
        var cx = parseInt(gv.x), cy = parseInt(gv.y), cname = gv.name;
        attacks.forEach(function(a) {
          if (a.originX === cx && a.originY === cy && a.origin !== cname) { a.origin = cname; updated = true; }
          if (a.destX   === cx && a.destY   === cy && a.dest   !== cname) { a.dest   = cname; updated = true; }
        });
      }
    } catch(e) {}
    try {
      var allScripts = Array.from(document.querySelectorAll('script:not([src])')).map(function(s){ return s.textContent; }).join('\n');
      var re = /"x":(\d+),"y":(\d+)[^}]*?"name":"([^"]+)"|"name":"([^"]+)"[^}]*?"x":(\d+),"y":(\d+)/g;
      var match, villageMap = {};
      while ((match = re.exec(allScripts)) !== null) {
        var vx = parseInt(match[1]||match[5]), vy = parseInt(match[2]||match[6]), vname = match[3]||match[4];
        if (vx && vy && vname) villageMap[vx+'|'+vy] = vname;
      }
      attacks.forEach(function(a) {
        var ok = a.originX+'|'+a.originY, dk = a.destX+'|'+a.destY;
        if (villageMap[ok] && villageMap[ok] !== a.origin) { a.origin = villageMap[ok]; updated = true; }
        if (villageMap[dk] && villageMap[dk] !== a.dest)   { a.dest   = villageMap[dk]; updated = true; }
      });
    } catch(e) {}
    if (updated) persist();
    cb();
  }

  /* ══════════════════════════════════════════════════════
     PERSISTÊNCIA
  ══════════════════════════════════════════════════════ */
  function loadAttacks() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '[]').map(function (a) {
        return Object.assign({}, a, {
          sendTime:   new Date(a.sendTime),
          arriveTime: new Date(a.arriveTime),
          returnTime: a.returnTime ? new Date(a.returnTime) : null,
          createdAt:  new Date(a.createdAt)
        });
      });
    } catch (e) { return []; }
  }

  function persist() {
    localStorage.setItem(STORE_KEY, JSON.stringify(attacks));
    var bdg = g('ap-badge'); if (bdg) bdg.textContent = attacks.length;
  }

  /* ══════════════════════════════════════════════════════
     UTILITÁRIOS
  ══════════════════════════════════════════════════════ */
  function pad(n)  { return String(Math.floor(n)).padStart(2, '0'); }
  function fmtDur(min) {
    var h = Math.floor(min/60), m = Math.floor(min%60), s = Math.round((min%1)*60);
    return pad(h)+':'+pad(m)+':'+pad(s);
  }
  function fmtDT(d) { return d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR'); }
  function parseDT(ds, ts) {
    if (!ds||!ts) return null;
    var dt = new Date(ds+'T'+ts);
    return isNaN(dt) ? null : dt;
  }
  function eucl(ox,oy,dx,dy) { return Math.sqrt(Math.pow(dx-ox,2)+Math.pow(dy-oy,2)); }
  function esc(s) { return String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function g(id)  { return document.getElementById(id); }

  /* ══════════════════════════════════════════════════════
     PARSE DE COORDENADAS
  ══════════════════════════════════════════════════════ */
  function parseCoordPaste(prefix, raw) {
    var m = raw.match(/(\d{1,3})\|(\d{1,3})/);
    if (m) {
      var ex = g(prefix+'-x'), ey = g(prefix+'-y');
      if (ex) ex.value = m[1];
      if (ey) ey.value = m[2];
      recalc();
      return true;
    }
    return false;
  }

  function bindCoordPaste(prefix) {
    var el = g(prefix+'-x');
    if (!el) return;
    el.addEventListener('paste', function(e) {
      var raw = (e.clipboardData||window.clipboardData).getData('text');
      if (raw.indexOf('|') !== -1) { e.preventDefault(); parseCoordPaste(prefix, raw); }
    });
    el.addEventListener('input', function() {
      if (el.value.indexOf('|') !== -1) { var v=el.value; el.value=''; parseCoordPaste(prefix, v); }
    });
  }

  /* ══════════════════════════════════════════════════════
     CSS
  ══════════════════════════════════════════════════════ */
  var CSS = [
    '#ap-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center}',
    '#ap-modal{background:#f4e4c1;border:3px solid #7a5c1e;border-radius:6px;width:98vw;max-width:1100px;max-height:95vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,.6);font-family:Verdana,sans-serif;font-size:12px;color:#3b2a0e;position:relative}',
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
    '.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}',
    '.ap-fld{display:flex;flex-direction:column;gap:4px}',
    '.ap-lbl{font-size:10px;font-weight:700;text-transform:uppercase;color:#6b4c10;letter-spacing:.4px}',
    '.ap-inp,.ap-sel{padding:6px 8px;border:1px solid #b8901a;border-radius:3px;background:#fffdf0;color:#3b2a0e;font-size:12px;font-family:Verdana,sans-serif;width:100%}',
    '.ap-inp:focus,.ap-sel:focus{outline:none;border-color:#d4941e;box-shadow:0 0 0 2px rgba(212,148,30,.2)}',
    '.ap-inp[readonly]{background:#f0e8d0;color:#6b4c10;cursor:default}',
    '.ap-row{display:flex;gap:6px;align-items:flex-end;margin-top:6px}',
    '.btn-cur{padding:6px 8px;background:#3a5a8a;color:#c8e0ff;border:1px solid #1a3a6a;border-radius:3px;cursor:pointer;font-size:10px;font-weight:700;font-family:Verdana,sans-serif;white-space:nowrap}',
    '.btn-cur:hover{background:#4a6a9a}',
    '.ap-dist{display:none;background:#fff3cc;border:1px solid #d4941e;border-radius:3px;padding:6px 10px;margin-top:8px;font-size:11px}',
    '.ap-tgrd{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}',
    '.ap-trp{border:1px solid #c8a84b;border-radius:3px;padding:6px 4px;text-align:center;cursor:pointer;background:#fffbe6;transition:all .15s}',
    '.ap-trp:hover{border-color:#d4941e;background:#fff3cc}.ap-trp.on{border:2px solid #8b2020;background:#ffe0c0}',
    '.ap-trp .e{display:block;width:32px;height:32px;margin:0 auto}',
    '.ap-trp .e img{width:32px;height:32px;image-rendering:pixelated}',
    '.ap-trp .e.emoji-fb{font-size:17px;line-height:32px}',
    '.ap-trp .n{font-size:9px;color:#6b4c10;display:block;margin-top:3px}',
    '.ap-trp .s{font-size:9px;color:#8b2020;font-weight:700}',
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
    '.ap-ibar{background:#e8d098;border:1px solid #c8a84b;border-radius:3px;padding:7px 10px;font-size:11px;margin-bottom:12px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}',
    '.ap-ibar span{color:#5a3a00}.ap-ibar strong{color:#3b2a0e}',
    '.ap-ibar .tag{background:#2c1a06;color:#f4d87a;padding:2px 7px;border-radius:3px;font-size:10px;font-weight:700}',
    '.ap-ibar .ap-edit-btn{margin-left:auto;background:transparent;border:1px solid #b8901a;border-radius:3px;padding:2px 8px;cursor:pointer;font-size:14px;color:#7a5c1e;line-height:1.4;transition:all .15s}',
    '.ap-ibar .ap-edit-btn:hover{background:#fff3cc;border-color:#d4941e}',
    '.ap-ibar .ap-edit-btn.active{background:#ffe0c0;border-color:#8b2020;color:#8b2020}',
    '#ap-edit-panel{display:none;background:#fff8e0;border:1px solid #d4941e;border-radius:3px;padding:10px;margin-bottom:12px}',
    '#ap-edit-panel.on{display:block}',
    '.btn-pri{width:100%;padding:9px;background:#8b2020;color:#fff8e0;border:1px solid #6a1010;border-radius:3px;font-size:12px;font-family:Verdana,sans-serif;font-weight:700;cursor:pointer;margin-top:10px}',
    '.btn-pri:hover{background:#a03030}',
    '.btn-sec{padding:6px 12px;background:#fffbe6;color:#5a3a00;border:1px solid #b8901a;border-radius:3px;font-size:11px;font-family:Verdana,sans-serif;cursor:pointer;font-weight:700}',
    '.btn-sec:hover{background:#fff3cc;border-color:#d4941e}',
    '.btn-del{padding:4px 8px;background:transparent;color:#8b2020;border:1px solid #c8a84b;border-radius:3px;font-size:10px;cursor:pointer;font-family:Verdana,sans-serif}',
    '.btn-del:hover{background:#ffe0e0}',
    '.ap-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}',
    '.ap-tbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}',
    '.ap-cnt{font-size:11px;color:#6b4c10}',
    '.ap-tw{width:100%}',
    'table.ap-t{width:100%;border-collapse:collapse;font-size:10px;table-layout:fixed}',
    'table.ap-t th,table.ap-t td{word-break:break-word;white-space:normal}',
    'table.ap-t .col-num{width:42px;white-space:nowrap !important;font-family:monospace}',
    'table.ap-t th{background:#3d2805;color:#f4d87a;padding:6px 4px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap}',
    'table.ap-t td{padding:5px 4px;border-bottom:1px solid #e8d098;vertical-align:middle}',
    'table.ap-t tr:hover td{background:#fff8e0}table.ap-t tr:last-child td{border-bottom:none}',
    'table.ap-t .col-village{width:18%}',
    'table.ap-t .col-troop{width:9%}',
    'table.ap-t .col-dt{width:11%;font-family:monospace;font-size:9px}',
    'table.ap-t .col-ret{width:11%;font-family:monospace;font-size:9px;color:#3a6010}',
    'table.ap-t .col-dur{width:8%;font-family:monospace;font-size:9px;text-align:center}',
    'table.ap-t .col-status{width:11%}',
    'table.ap-t .col-notes{width:10%}',
    'table.ap-t .col-del{width:28px;text-align:center}',
    '.bdg{display:inline-block;padding:2px 7px;border-radius:10px;font-size:9px;font-weight:700;font-family:Verdana,sans-serif}',
    '.bdg-w{background:#ffe0e0;color:#6a1010}',
    '.bdg-alert{background:#8b2020;color:#fff8e0;animation:ap-pulse 1s infinite}',
    '.bdg-sent{background:#5a7a1e;color:#e8f8a0}',
    '.bdg-d{background:#e0f0d0;color:#2a5a10}',
    '.bdg-ret{background:#3a5a8a;color:#c8e0ff}',
    '@keyframes ap-pulse{0%,100%{opacity:1}50%{opacity:.5}}',
    'tr.ap-row-alert td{background:#fff0f0 !important}',
    'tr.ap-row-sent td{background:#f0fff0 !important}',
    'tr.ap-row-returned td{background:#e8e8f8 !important;color:#888}',
    '.ap-json-box{width:100%;height:80px;font-family:monospace;font-size:10px;border:1px solid #b8901a;border-radius:3px;background:#fffdf0;padding:6px;resize:vertical}',
    '.ap-json-panel{display:none;background:#fff8e0;border:1px solid #d4941e;border-radius:3px;padding:10px;margin-bottom:10px}',
    '.ap-json-panel.on{display:block}',
    '.ap-bb-panel{display:none;background:#fffbe6;border:1px solid #c8a84b;border-radius:3px;padding:10px;margin-bottom:10px}',
    '.ap-bb-panel.on{display:block}',
    '.ap-sel-bar{background:#e8d098;border:1px solid #c8a84b;border-radius:3px;padding:6px 10px;margin-bottom:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:11px}',
    '.ap-sel-bar label{display:flex;align-items:center;gap:4px;cursor:pointer;color:#5a3a00;font-weight:700}',
    '.ap-chk{width:14px;height:14px;cursor:pointer;accent-color:#8b2020}',
    '.ap-empty{text-align:center;padding:30px;color:#8b6914}',
    '.ap-loading{text-align:center;padding:20px;color:#8b6914;font-size:13px}',
  ].join('');

  /* ══════════════════════════════════════════════════════
     HTML
  ══════════════════════════════════════════════════════ */
  function buildHTML() {
    var today   = new Date().toISOString().split('T')[0];
    var nowTime = new Date().toTimeString().slice(0, 8);

    var troopCards = TROOPS.map(function (t) {
      var tmin    = calcTroopTime(1, t.speed);
      var iconUrl = ICON_BASE + t.id + '.png';
      var iconHtml = '<span class="e"><img src="' + iconUrl + '" alt="' + t.name +
        '" onerror="this.parentNode.className=\'e emoji-fb\';this.parentNode.innerHTML=\'' + t.emoji + '\'"></span>';
      return '<div class="ap-trp" id="ap-trp-' + t.id + '" onclick="AP.troop(\'' + t.id + '\')" title="' + t.name + '">' +
        iconHtml + '<span class="n">' + t.name + '</span><span class="s">' + fmtDur(tmin) + '/c</span></div>';
    }).join('');

    var ibar = '<div class="ap-ibar">' +
      '<span class="tag">' + esc(WORLD_ID) + '</span>' +
      (PLAYER_NAME ? '<span>👤 <strong>' + esc(PLAYER_NAME) + '</strong></span>' : '') +
      '<span>⚡ Vel. mundo: <strong id="ap-ibar-ws">' + WORLD_SPEED + '×</strong></span>' +
      '<span>🐎 Vel. unidades: <strong id="ap-ibar-us">' + UNIT_SPEED + '×</strong></span>' +
      (CURRENT.coord ? '<span>🏰 <strong>' + esc(CURRENT.name||CURRENT.coord) + '</strong> ' + esc(CURRENT.coord) + '</span>' : '') +
      '<button class="ap-edit-btn" id="ap-edit-btn" onclick="AP.toggleEdit()" title="Editar velocidades">✏️</button>' +
      '</div>' +
      '<div id="ap-edit-panel">' +
        '<div class="g2">' +
          '<div class="ap-fld"><label class="ap-lbl">Velocidade do Mundo (×)</label>' +
            '<input type="number" class="ap-inp" id="ap-ws" value="' + WORLD_SPEED + '" min="0.1" step="0.1"></div>' +
          '<div class="ap-fld"><label class="ap-lbl">Velocidade das Unidades (×)</label>' +
            '<input type="number" class="ap-inp" id="ap-us" value="' + UNIT_SPEED + '" min="0.1" step="0.1"></div>' +
        '</div>' +
      '</div>';

    return '<div id="ap-overlay" onclick="if(event.target===this)AP.close()">' +
      '<div id="ap-modal">' +
      '<div id="ap-hdr">' +
        '<span style="font-size:22px">⚔️</span>' +
        '<div style="flex:1"><h2>Attack Planner</h2>' +
          '<small>Tribal Wars · Planejador de Ataques &nbsp;<span style="color:#f4d87a;font-weight:700">' + AP_VERSION + '</span></small></div>' +
        '<button id="ap-x" onclick="AP.close()" title="Fechar">✕</button>' +
      '</div>' +
      '<div class="ap-tabs">' +
        '<button class="ap-tab on" id="ap-t-plan" onclick="AP.tab(\'plan\')">⚔ Planejar</button>' +
        '<button class="ap-tab" id="ap-t-list" onclick="AP.tab(\'list\')">📋 Ataques&nbsp;<span id="ap-badge" style="background:#8b2020;color:#fff8e0;border-radius:10px;padding:1px 6px;font-size:10px">0</span></button>' +
      '</div>' +

      /* PLANEJAR */
      '<div class="ap-pnl on" id="ap-p-plan">' +
        ibar +
        '<div class="ap-sec"><div class="ap-sh">🏰 Aldeias</div><div class="ap-sb g2">' +
          '<div class="ap-fld">' +
            '<label class="ap-lbl">Aldeia de Origem</label>' +
            '<input type="text" class="ap-inp" id="ap-o-name" readonly style="background:#f0e8d0;color:#6b4c10;cursor:default" value="' + esc(CURRENT.name||'') + '">' +
            '<div class="ap-row">' +
              '<input type="text" class="ap-inp" id="ap-o-x" readonly style="background:#f0e8d0;color:#6b4c10;cursor:default;width:90px;flex:none" value="' + ((CURRENT.x&&CURRENT.y)?(CURRENT.x+'|'+CURRENT.y):'') + '">' +
              '<input type="hidden" id="ap-o-y" value="' + (CURRENT.y||'') + '">' +
              '<button class="btn-cur" onclick="AP.cur()">📍 Atualizar</button>' +
            '</div>' +
          '</div>' +
          '<div class="ap-fld">' +
            '<label class="ap-lbl">Aldeia de Destino</label>' +
            '<input type="text" class="ap-inp" id="ap-d-name" placeholder="Nome (opcional)">' +
            '<div class="ap-row">' +
              '<input type="text" class="ap-inp" id="ap-d-x" placeholder="Cole 490|834 aqui" style="flex:1">' +
              '<input type="hidden" id="ap-d-y">' +
            '</div>' +
          '</div>' +
        '</div><div class="ap-dist" id="ap-dist"></div></div>' +

        '<div class="ap-sec"><div class="ap-sh">🛡 Tropa Mais Lenta do Ataque</div>' +
          '<div class="ap-sb"><div class="ap-tgrd">' + troopCards + '</div></div></div>' +

        '<div class="ap-sec"><div class="ap-sh">🕐 Modo de Planejamento</div><div class="ap-sb">' +
          '<div class="ap-tgl">' +
            '<button class="ap-tgl-btn on" id="ap-ms" onclick="AP.mode(\'send\')">📤 Definir Horário de Envio</button>' +
            '<button class="ap-tgl-btn" id="ap-ma" onclick="AP.mode(\'arrive\')">🎯 Definir Horário de Chegada</button>' +
          '</div>' +
          '<div id="ap-fs" class="g2">' +
            '<div class="ap-fld"><label class="ap-lbl">Data de Envio</label><input type="date" class="ap-inp" id="ap-sd" value="' + today + '"></div>' +
            '<div class="ap-fld"><label class="ap-lbl">Hora de Envio</label><input type="time" class="ap-inp" id="ap-st" step="1" value="' + nowTime + '"></div>' +
          '</div>' +
          '<div id="ap-fa" style="display:none" class="g2">' +
            '<div class="ap-fld"><label class="ap-lbl">Data de Chegada</label><input type="date" class="ap-inp" id="ap-ad" value="' + today + '"></div>' +
            '<div class="ap-fld"><label class="ap-lbl">Hora de Chegada</label><input type="time" class="ap-inp" id="ap-at" step="1" value="' + nowTime + '"></div>' +
          '</div>' +
          '<div id="ap-res">' +
            '<div class="ap-rg">' +
              '<div class="ap-rc"><span class="v" id="ap-r1">—</span><span class="l">Distância</span></div>' +
              '<div class="ap-rc"><span class="v" id="ap-r2">—</span><span class="l">Duração</span></div>' +
              '<div class="ap-rc"><span class="v" id="ap-r3">—</span><span class="l">Tropa</span></div>' +
            '</div>' +
            '<hr class="ap-sep">' +
            '<div class="ap-ir"><span>📤 Enviar em:</span><strong id="ap-r4">—</strong></div>' +
            '<div class="ap-ir"><span>🎯 Chega em:</span><strong id="ap-r5">—</strong></div>' +
            '<div class="ap-ir" style="border-top:1px dashed #e8d098;margin-top:4px;padding-top:6px"><span>🔙 Retorna em:</span><strong id="ap-r6" style="color:#5a7a1e">—</strong></div>' +
          '</div>' +
        '</div></div>' +

        '<div class="ap-sec"><div class="ap-sh">📝 Observações</div><div class="ap-sb">' +
          '<input type="text" class="ap-inp" id="ap-notes" placeholder="ex: Nobre + ram, Fake, coordenar com aliado...">' +
          '<div class="ap-act">' +
            '<button class="btn-pri" id="ap-btn-calc" onclick="AP.calc()">⚔ Calcular</button>' +
            '<button class="btn-pri" id="ap-btn-save" onclick="AP.save()" style="display:none;background:#2a5a10;border-color:#1a3a08">💾 Salvar Ataque</button>' +
            '<button class="btn-sec" onclick="AP.clear()">🔄 Limpar</button>' +
          '</div>' +
        '</div></div>' +
      '</div>' +

      /* ATAQUES */
      '<div class="ap-pnl" id="ap-p-list">' +
        '<div class="ap-tbar">' +
          '<span class="ap-cnt" id="ap-total">0 ataques</span>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
            '<button class="btn-sec" onclick="AP.sort()">⬆ Ordenar por envio</button>' +
            '<button class="btn-sec" onclick="AP.toggleJson()">📋 JSON</button>' +
            '<button class="btn-sec" onclick="AP.toggleBB()">📜 BB-code</button>' +
            '<button class="btn-del" onclick="AP.clearAll()">🗑 Limpar tudo</button>' +
          '</div>' +
        '</div>' +

        '<div class="ap-json-panel" id="ap-json-panel">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
            '<span style="font-size:10px;font-weight:700;color:#6b4c10">📤 Exportar:</span>' +
            '<button class="btn-sec" style="font-size:10px;padding:3px 10px" onclick="AP.copyJson()">📋 Copiar tudo</button>' +
          '</div>' +
          '<textarea class="ap-json-box" id="ap-json-out" readonly onclick="this.select()"></textarea>' +
          '<div style="font-size:10px;font-weight:700;color:#6b4c10;margin:8px 0 4px">📥 Importar:</div>' +
          '<textarea class="ap-json-box" id="ap-json-in" placeholder="Cole o JSON aqui e clique em Importar..."></textarea>' +
          '<div style="display:flex;gap:6px;margin-top:6px">' +
            '<button class="btn-sec" onclick="AP.importJson()">✅ Importar JSON</button>' +
            '<button class="btn-sec" onclick="AP.clearJson()">✖ Fechar</button>' +
          '</div>' +
        '</div>' +

        '<div class="ap-bb-panel" id="ap-bb-panel">' +
          '<div class="ap-sel-bar">' +
            '<label><input type="checkbox" class="ap-chk" id="ap-bb-selall" onclick="AP.bbSelAll(this.checked)"> Selecionar todos</label>' +
            '<span style="color:#8b6914">Marque os ataques para exportar</span>' +
            '<button class="btn-sec" style="margin-left:auto;font-size:10px;padding:3px 10px" onclick="AP.genBB()">📜 Gerar BB-code</button>' +
          '</div>' +
          '<div id="ap-bb-sel-tbl"></div>' +
          '<div id="ap-bb-out-wrap" style="display:none;margin-top:10px">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
              '<span style="font-size:10px;font-weight:700;color:#6b4c10">📜 BB-code gerado:</span>' +
              '<button class="btn-sec" style="font-size:10px;padding:3px 10px" onclick="AP.copyBB()">📋 Copiar BB-code</button>' +
            '</div>' +
            '<textarea class="ap-json-box" id="ap-bb-out" readonly onclick="this.select()" style="height:120px"></textarea>' +
          '</div>' +
          '<div style="margin-top:8px"><button class="btn-sec" onclick="AP.closeBB()">✖ Fechar</button></div>' +
        '</div>' +

        '<div id="ap-tbl"></div>' +
      '</div>' +
      '</div></div>';
  }

  /* ══════════════════════════════════════════════════════
     CÁLCULO
  ══════════════════════════════════════════════════════ */
  function calcTroopTime(distance, baseSpeed) {
    var ws = parseFloat((g('ap-ws')&&g('ap-ws').value)||WORLD_SPEED)||1;
    var us = parseFloat((g('ap-us')&&g('ap-us').value)||UNIT_SPEED) ||1;
    return distance * baseSpeed / (ws * us);
  }

  function recalc() {
    /* Origem: campo exibe 'X|Y', separar corretamente */
    var _ox = (g('ap-o-x').value||'').split('|');
    var ox  = parseFloat(_ox[0]) || NaN;
    var oy  = _ox[1] !== undefined ? parseFloat(_ox[1]) : parseFloat(g('ap-o-y').value||'');
    /* Destino: campo aceita 'X|Y' ou só X (com Y no hidden) */
    var _dx = (g('ap-d-x').value||'').split('|');
    var dx  = parseFloat(_dx[0]) || NaN;
    var dy  = _dx[1] !== undefined ? parseFloat(_dx[1]) : parseFloat(g('ap-d-y').value||'');
    var distEl=g('ap-dist'), resEl=g('ap-res');

    if (isNaN(ox)||isNaN(oy)||isNaN(dx)||isNaN(dy)) {
      distEl.style.display='none'; resEl.classList.remove('on'); _lastData=null; return;
    }
    var d=eucl(ox,oy,dx,dy);
    distEl.style.display='block';
    distEl.innerHTML='📏 Distância: <strong style="color:#8b2020">'+d.toFixed(2)+'</strong> campos';
    if (!selTroop) { resEl.classList.remove('on'); _lastData=null; return; }

    var tmin=calcTroopTime(d,selTroop.speed), tms=tmin*60000;
    var sendT, arriveT;
    if (planMode==='send') {
      sendT=parseDT(g('ap-sd').value,g('ap-st').value);
      if (!sendT) { resEl.classList.remove('on'); _lastData=null; return; }
      arriveT=new Date(sendT.getTime()+tms);
    } else {
      arriveT=parseDT(g('ap-ad').value,g('ap-at').value);
      if (!arriveT) { resEl.classList.remove('on'); _lastData=null; return; }
      sendT=new Date(arriveT.getTime()-tms);
    }
    var returnT=new Date(arriveT.getTime()+tms);
    g('ap-r1').textContent=d.toFixed(2)+' c';
    g('ap-r2').textContent=fmtDur(tmin);
    g('ap-r3').textContent=selTroop.emoji+' '+selTroop.name;
    g('ap-r4').textContent=fmtDT(sendT);
    g('ap-r5').textContent=fmtDT(arriveT);
    g('ap-r6').textContent=fmtDT(returnT);
    resEl.classList.add('on');
    _lastData={d:d,tmin:tmin,sendT:sendT,arriveT:arriveT,returnT:returnT};
    if (!_fromCalcBtn) {
      var bs=g('ap-btn-save'); if(bs) bs.style.display='none';
      resEl.classList.remove('on'); _lastData=null;
    }
  }

  /* ══════════════════════════════════════════════════════
     TABELA
  ══════════════════════════════════════════════════════ */
  function renderTable() {
    var tbl=g('ap-tbl'), tot=g('ap-total'), bdg=g('ap-badge');
    if (!tbl) return;
    tot.textContent=attacks.length+' ataque(s)';
    if (bdg) bdg.textContent=attacks.length;
    if (!attacks.length) {
      tbl.innerHTML='<div class="ap-empty">⚔️<br>Nenhum ataque planejado.<br><small>Use a aba Planejar para adicionar.</small></div>';
      return;
    }
    var now=new Date();
    var rows=attacks.map(function(a,i){
      var badge,rowClass='';
      var retT=a.returnTime?new Date(a.returnTime):null;
      var remSend=(a.sendTime-now)/60000;
      if (retT&&retT<now)        { badge='<span class="bdg bdg-ret">🏠 Retornou</span>'; rowClass='ap-row-returned'; }
      else if (a.arriveTime<now) { badge='<span class="bdg bdg-d">⚔ Chegou</span>'; }
      else if (a.sendTime<now)   { badge='<span class="bdg bdg-sent">✈ Em rota</span>'; rowClass='ap-row-sent'; }
      else if (remSend<=10)      { badge='<span class="bdg bdg-alert">🚨 '+fmtDur(remSend)+'</span>'; rowClass='ap-row-alert'; }
      else                       { badge='<span class="bdg bdg-w">⏳ em '+fmtDur(remSend)+'</span>'; }
      return '<tr class="'+rowClass+'">' +
        '<td class="col-num" style="color:#8b6914;font-weight:700;text-align:center;white-space:nowrap">#'+pad(i+1)+'</td>' +
        '<td class="col-village" style="font-weight:700">'+esc(a.origin)+(a.originX?'<br><span style="font-size:9px;color:#8b6914;font-weight:normal">('+a.originX+'|'+a.originY+')</span>':'')+'</td>' +
        '<td class="col-village" style="color:#8b2020;font-weight:700">'+esc(a.dest)+(a.destX?'<br><span style="font-size:9px;color:#8b6914;font-weight:normal">('+a.destX+'|'+a.destY+')</span>':'')+'</td>' +
        '<td class="col-troop" style="text-align:center"><img src="'+ICON_BASE+a.troop.id+'.png" style="width:16px;height:16px;display:block;margin:0 auto;image-rendering:pixelated" onerror="this.style.display=\'none\'" alt=""><span style="font-size:9px">'+a.troop.name+'</span></td>' +
        '<td class="col-dt">'+a.sendTime.toLocaleString('pt-BR')+'</td>' +
        '<td class="col-dt">'+a.arriveTime.toLocaleString('pt-BR')+'</td>' +
        '<td class="col-ret">'+(a.returnTime?new Date(a.returnTime).toLocaleString('pt-BR'):'—')+'</td>' +
        '<td class="col-dur">'+fmtDur(a.travelMin)+'</td>' +
        '<td class="col-status">'+badge+'</td>' +
        '<td class="col-notes" style="color:#6b4c10;overflow:hidden;text-overflow:ellipsis">'+esc(a.notes||'—')+'</td>' +
        '<td class="col-del"><button class="btn-del" onclick="AP.del('+a.id+')">🗑</button></td>' +
        '</tr>';
    }).join('');
    tbl.innerHTML='<div class="ap-tw"><table class="ap-t">' +
      '<thead><tr>' +
        '<th class="col-num">#</th><th class="col-village">Origem</th><th class="col-village">Destino</th>' +
        '<th class="col-troop">Tropa</th><th class="col-dt">Envio</th><th class="col-dt">Chegada</th>' +
        '<th class="col-ret">Retorno</th><th class="col-dur">Duração</th><th class="col-status">Status</th>' +
        '<th class="col-notes">Obs.</th><th class="col-del"></th>' +
      '</tr></thead><tbody>'+rows+'</tbody></table></div>';
  }

  /* ══════════════════════════════════════════════════════
     API PÚBLICA
  ══════════════════════════════════════════════════════ */
  window.AP = {
    close: function(){ var el=g('ap-overlay'); if(el) el.remove(); },
    toggleEdit: function(){
      var panel=g('ap-edit-panel'), btn=g('ap-edit-btn');
      if (!panel) return;
      var open=panel.classList.toggle('on');
      if (btn) btn.classList.toggle('active',open);
      if (!open) {
        var ws=parseFloat(g('ap-ws').value)||WORLD_SPEED, us=parseFloat(g('ap-us').value)||UNIT_SPEED;
        var wsEl=g('ap-ibar-ws'); if(wsEl) wsEl.textContent=ws+'×';
        var usEl=g('ap-ibar-us'); if(usEl) usEl.textContent=us+'×';
        recalc();
      }
    },
    tab: function(t){
      ['plan','list'].forEach(function(x){
        var tab=g('ap-t-'+x), pnl=g('ap-p-'+x);
        if(tab) tab.classList.toggle('on',x===t);
        if(pnl) pnl.classList.toggle('on',x===t);
      });
      if(t==='list') renderTable();
    },
    troop: function(id){
      document.querySelectorAll('.ap-trp').forEach(function(c){c.classList.remove('on');});
      var el=g('ap-trp-'+id); if(el) el.classList.add('on');
      selTroop=TROOPS.find(function(t){return t.id===id;});
      recalc();
    },
    mode: function(m){
      planMode=m;
      g('ap-ms').classList.toggle('on',m==='send');
      g('ap-ma').classList.toggle('on',m==='arrive');
      g('ap-fs').style.display=m==='send'?'':'none';
      g('ap-fa').style.display=m==='arrive'?'':'none';
      recalc();
    },
    cur: function(){
      try {
        var v=window.game_data&&window.game_data.village; if(!v) throw 0;
        g('ap-o-name').value=v.name;
        g('ap-o-x').value=parseInt(v.x)+'|'+parseInt(v.y);
        g('ap-o-y').value=parseInt(v.y);
        recalc();
      } catch(e){ alert('Não foi possível detectar a aldeia atual.'); }
    },
    calc: function(){
      _fromCalcBtn=true; recalc(); _fromCalcBtn=false;
      var bs=g('ap-btn-save');
      if(_lastData&&bs) bs.style.display=''; else if(bs) bs.style.display='none';
    },
    save: function(){
      if(!_lastData){ alert('Calcule antes de salvar.'); return; }
      var _sox=(g('ap-o-x').value||'').split('|');
      var ox=parseInt(_sox[0])||null, oy=_sox[1]!==undefined?parseInt(_sox[1]):(parseInt(g('ap-o-y').value)||null);
      var _sdx=(g('ap-d-x').value||'').split('|');
      var dx=parseInt(_sdx[0])||null, dy=_sdx[1]!==undefined?parseInt(_sdx[1]):(parseInt(g('ap-d-y').value)||null);
      var origin=g('ap-o-name').value||(ox&&oy?'('+ox+'|'+oy+')':'?');
      var dest  =g('ap-d-name').value||(dx&&dy?'('+dx+'|'+dy+')':'?');
      attacks.push({ id:Date.now(), origin:origin, originX:ox, originY:oy,
        dest:dest, destX:dx, destY:dy, troop:selTroop,
        distance:_lastData.d, travelMin:_lastData.tmin,
        sendTime:_lastData.sendT, arriveTime:_lastData.arriveT, returnTime:_lastData.returnT,
        notes:g('ap-notes').value, createdAt:new Date() });
      attacks.sort(function(a,b){return new Date(a.sendTime)-new Date(b.sendTime);});
      persist(); renderTable(); this.tab('list');
    },
    clear: function(){
      ['ap-d-name','ap-d-x','ap-d-y','ap-notes'].forEach(function(id){ var el=g(id); if(el) el.value=''; });
      document.querySelectorAll('.ap-trp').forEach(function(c){c.classList.remove('on');});
      selTroop=null; _lastData=null;
      g('ap-res').classList.remove('on'); g('ap-dist').style.display='none';
      var bs=g('ap-btn-save'); if(bs) bs.style.display='none';
    },
    del: function(id){ attacks=attacks.filter(function(a){return a.id!==id;}); persist(); renderTable(); },
    sort: function(){ attacks.sort(function(a,b){return a.sendTime-b.sendTime;}); persist(); renderTable(); },
    clearAll: function(){
      if(!attacks.length) return;
      if(confirm('Remover todos os '+attacks.length+' ataques planejados?')){ attacks=[]; persist(); renderTable(); }
    },
    copyJson: function(){
      var out=g('ap-json-out'); if(!out||!out.value){ alert('Nenhum dado.'); return; }
      out.select();
      try { document.execCommand('copy'); var b=event.target,o=b.textContent; b.textContent='✅ Copiado!'; setTimeout(function(){b.textContent=o;},1500); }
      catch(e){ navigator.clipboard&&navigator.clipboard.writeText(out.value); }
    },
    toggleJson: function(){
      var panel=g('ap-json-panel'); if(!panel) return;
      var bp=g('ap-bb-panel'); if(bp) bp.classList.remove('on');
      var open=panel.classList.toggle('on');
      if(open){ var out=g('ap-json-out'); if(out) out.value=JSON.stringify(attacks,null,2); }
    },
    importJson: function(){
      var raw=(g('ap-json-in')&&g('ap-json-in').value.trim())||'';
      if(!raw){ alert('Cole um JSON válido antes de importar.'); return; }
      try {
        var imported=JSON.parse(raw);
        if(!Array.isArray(imported)) throw new Error('Não é um array');
        var parsed=imported.map(function(a){
          return Object.assign({},a,{ sendTime:new Date(a.sendTime), arriveTime:new Date(a.arriveTime),
            returnTime:a.returnTime?new Date(a.returnTime):null, createdAt:new Date(a.createdAt) });
        });
        var existIds=attacks.map(function(a){return a.id;});
        var news=parsed.filter(function(a){return existIds.indexOf(a.id)===-1;});
        attacks=attacks.concat(news);
        attacks.sort(function(a,b){return new Date(a.sendTime)-new Date(b.sendTime);});
        persist(); g('ap-json-in').value=''; g('ap-json-panel').classList.remove('on');
        renderTable(); alert('✅ '+news.length+' ataque(s) importado(s)!');
      } catch(e){ alert('❌ JSON inválido: '+e.message); }
    },
    clearJson: function(){ var p=g('ap-json-panel'); if(p) p.classList.remove('on'); var i=g('ap-json-in'); if(i) i.value=''; },
    toggleBB: function(){
      var panel=g('ap-bb-panel'); if(!panel) return;
      var jp=g('ap-json-panel'); if(jp) jp.classList.remove('on');
      var open=panel.classList.toggle('on');
      if(open) this._renderBBSel();
    },
    closeBB: function(){ var p=g('ap-bb-panel'); if(p) p.classList.remove('on'); var w=g('ap-bb-out-wrap'); if(w) w.style.display='none'; },
    bbSelAll: function(checked){ document.querySelectorAll('.ap-bb-chk').forEach(function(c){c.checked=checked;}); },
    _renderBBSel: function(){
      var wrap=g('ap-bb-out-wrap'); if(wrap) wrap.style.display='none';
      var tbl=g('ap-bb-sel-tbl'); if(!tbl) return;
      if(!attacks.length){ tbl.innerHTML='<div class="ap-empty">Nenhum ataque.</div>'; return; }
      var now=new Date();
      var rows=attacks.map(function(a,i){
        var retT=a.returnTime?new Date(a.returnTime):null;
        var st=retT&&retT<now?'🏠':a.arriveTime<now?'⚔':a.sendTime<now?'✈':'⏳';
        return '<tr><td style="text-align:center"><input type="checkbox" class="ap-chk ap-bb-chk" data-id="'+a.id+'" checked></td>'+
          '<td style="padding:4px 6px;font-weight:700">'+pad(i+1)+'</td>'+
          '<td style="padding:4px 6px">'+esc(a.origin)+'</td>'+
          '<td style="padding:4px 6px;color:#8b2020">'+esc(a.dest)+'</td>'+
          '<td style="padding:4px 6px">'+a.troop.name+'</td>'+
          '<td style="padding:4px 6px;font-family:monospace;font-size:10px">'+a.sendTime.toLocaleString('pt-BR')+'</td>'+
          '<td style="padding:4px 6px">'+st+'</td></tr>';
      }).join('');
      tbl.innerHTML='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px">'+
        '<thead><tr style="background:#e8d098"><th style="width:24px"></th><th style="padding:4px 6px">N°</th>'+
        '<th style="padding:4px 6px">Origem</th><th style="padding:4px 6px">Destino</th>'+
        '<th style="padding:4px 6px">Tropa</th><th style="padding:4px 6px">Envio</th><th style="padding:4px 6px">Status</th></tr></thead>'+
        '<tbody>'+rows+'</tbody></table></div>';
    },
    genBB: function(){
      var selected=[];
      document.querySelectorAll('.ap-bb-chk:checked').forEach(function(c){
        var id=parseInt(c.getAttribute('data-id'));
        var atk=attacks.find(function(a){return a.id===id;});
        if(atk) selected.push(atk);
      });
      if(!selected.length){ alert('Selecione ao menos um ataque.'); return; }
      var lines=selected.map(function(a){
        var dc=a.dest.match(/(\d+)\|(\d+)/);
        var destTag=dc?'[village]'+dc[1]+'|'+dc[2]+'[/village]':'[b]'+a.dest+'[/b]';
        var arr=a.arriveTime;
        var chegada=pad(arr.getDate())+'/'+pad(arr.getMonth()+1)+'/'+arr.getFullYear()+
          ' '+pad(arr.getHours())+':'+pad(arr.getMinutes())+':'+pad(arr.getSeconds());
        return 'Plano de Ataque contra a aldeia '+destTag+' (chegada em '+chegada+'): Unidade mais lenta: [unit]'+a.troop.id+'[/unit]';
      });
      var bbOut=g('ap-bb-out'); if(bbOut) bbOut.value=lines.join('\n');
      var wrap=g('ap-bb-out-wrap'); if(wrap) wrap.style.display='block';
    },
    copyBB: function(){
      var out=g('ap-bb-out'); if(!out||!out.value) return;
      out.select();
      try { document.execCommand('copy'); var b=event.target,o=b.textContent; b.textContent='✅ Copiado!'; setTimeout(function(){b.textContent=o;},1500); }
      catch(e){ navigator.clipboard&&navigator.clipboard.writeText(out.value); }
    }
  };

  /* ══════════════════════════════════════════════════════
     INJETAR E ABRIR
  ══════════════════════════════════════════════════════ */
  var styleEl=document.getElementById('ap-css')||document.createElement('style');
  styleEl.id='ap-css'; styleEl.textContent=CSS;
  document.head.appendChild(styleEl);

  var loader=document.createElement('div');
  loader.id='ap-overlay';
  loader.innerHTML='<div id="ap-modal"><div id="ap-hdr">'+
    '<span style="font-size:22px">⚔️</span>'+
    '<div style="flex:1"><h2>Attack Planner</h2><small>Carregando configuração do mundo...</small></div>'+
    '<button id="ap-x" onclick="AP.close()" style="background:#7a2020;color:#fff;border:none;border-radius:4px;width:26px;height:26px;cursor:pointer;font-size:15px;font-weight:700">✕</button>'+
    '</div><div class="ap-loading">⏳ Lendo velocidade e unidades do mundo <strong>'+esc(WORLD_ID)+'</strong>...</div></div>';
  document.body.appendChild(loader);

  loadWorldConfig(function () {
    attacks = loadAttacks();
    refreshVillageNames(function () {
      var old=g('ap-overlay'); if(old) old.remove();

      var wrap=document.createElement('div');
      wrap.innerHTML=buildHTML();
      document.body.appendChild(wrap.firstElementChild);

      var bdg=document.getElementById('ap-badge');
      if(bdg) bdg.textContent=attacks.length;

      ['ap-d-x','ap-d-y','ap-sd','ap-st','ap-ad','ap-at','ap-ws','ap-us'].forEach(function(id){
        var el=g(id); if(el){ el.addEventListener('input',recalc); el.addEventListener('change',recalc); }
      });
      bindCoordPaste('ap-d');

      setInterval(function(){
        var pnl=g('ap-p-list');
        if(pnl&&pnl.classList.contains('on')) renderTable();
      },30000);

      recalc();
    });
  });

})();
