// ==UserScript==
// @name         Attack Planner - Tribal Wars
// @namespace    https://github.com/
// @version      1.0.0
// @description  Planejador e organizador de ataques para Tribal Wars
// @author       Você
// @match        https://*.tribalwars.com.br/game.php*
// @match        https://*.die-staemme.de/game.php*
// @match        https://*.tribalwars.net/game.php*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     DADOS DE TROPAS (velocidade em min/campo, base)
  ────────────────────────────────────────────── */
  const TROOPS = [
    { id: 'spear',    name: 'Lanceiro',      emoji: '🗡️',  speed: 18 },
    { id: 'sword',    name: 'Espadachim',    emoji: '⚔️',  speed: 22 },
    { id: 'axe',      name: 'Bárbaro',       emoji: '🪓',  speed: 18 },
    { id: 'archer',   name: 'Arqueiro',      emoji: '🏹',  speed: 18 },
    { id: 'scout',    name: 'Batedor',       emoji: '👁️',  speed: 9  },
    { id: 'lcav',     name: 'Cav. Leve',     emoji: '🐴',  speed: 10 },
    { id: 'hcav',     name: 'Cav. Pesada',   emoji: '🛡️',  speed: 11 },
    { id: 'ram',      name: 'Aríete',        emoji: '🪵',  speed: 30 },
    { id: 'catapult', name: 'Catapulta',     emoji: '🪨',  speed: 30 },
    { id: 'noble',    name: 'Nobre',         emoji: '👑',  speed: 35 },
  ];

  /* ──────────────────────────────────────────────
     ESTADO GLOBAL
  ────────────────────────────────────────────── */
  let attacks = loadAttacks();
  let selectedTroop = null;
  let planMode = 'send';
  let selectingMap = null; // 'origin' | 'dest'

  /* ──────────────────────────────────────────────
     PERSISTÊNCIA (localStorage)
  ────────────────────────────────────────────── */
  function loadAttacks() {
    try {
      return JSON.parse(localStorage.getItem('tw_attack_planner') || '[]').map(a => ({
        ...a,
        sendTime: new Date(a.sendTime),
        arriveTime: new Date(a.arriveTime),
        createdAt: new Date(a.createdAt),
      }));
    } catch { return []; }
  }

  function saveAttacks() {
    localStorage.setItem('tw_attack_planner', JSON.stringify(attacks));
  }

  /* ──────────────────────────────────────────────
     UTILITÁRIOS
  ────────────────────────────────────────────── */
  function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    const s = Math.round((minutes % 1) * 60);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function formatDateTime(date) {
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  }

  function parseDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    return new Date(dateStr + 'T' + timeStr);
  }

  function getDistance(ox, oy, dx, dy) {
    return Math.sqrt(Math.pow(dx - ox, 2) + Math.pow(dy - oy, 2));
  }

  /* ──────────────────────────────────────────────
     DETECTAR COORDENADAS DO JOGO (clique no mapa)
  ────────────────────────────────────────────── */
  function tryGetVillageFromPage() {
    // Tenta pegar aldeia atual do jogo via variáveis globais do TW
    try {
      if (window.game_data && window.game_data.village) {
        const v = window.game_data.village;
        return { name: v.name, x: parseInt(v.x), y: parseInt(v.y) };
      }
    } catch {}
    return null;
  }

  function tryGetWorldSpeed() {
    try {
      if (window.game_data && window.game_data.speed) return parseFloat(window.game_data.speed);
    } catch {}
    return 1;
  }

  function enableMapSelection(type) {
    selectingMap = type;
    showMapHint(true, type);
    // Listener para clique no mapa do TW
    document.addEventListener('click', onMapClick, true);
  }

  function onMapClick(e) {
    // O mapa do TW usa links com coordenadas: /game.php?screen=map&x=500&y=500
    // Também pode capturar via tooltip de aldeia
    const link = e.target.closest('a[href*="x="][href*="y="]');
    if (!link) return;
    const url = new URL(link.href, location.origin);
    const x = parseInt(url.searchParams.get('x') || url.searchParams.get('target_x'));
    const y = parseInt(url.searchParams.get('y') || url.searchParams.get('target_y'));
    if (!x || !y) return;
    e.preventDefault();
    e.stopPropagation();
    const name = link.querySelector('[data-id]')?.textContent?.trim() ||
                 link.title || link.textContent?.trim() || `(${x}|${y})`;
    applyMapSelection(selectingMap, { name, x, y });
    document.removeEventListener('click', onMapClick, true);
    selectingMap = null;
    showMapHint(false);
  }

  function applyMapSelection(type, village) {
    const prefix = type === 'origin' ? 'origin' : 'dest';
    document.getElementById(`ap-${prefix}-name`).value = village.name;
    document.getElementById(`ap-${prefix}-x`).value = village.x;
    document.getElementById(`ap-${prefix}-y`).value = village.y;
    recalculate();
  }

  function showMapHint(show, type) {
    const hint = document.getElementById('ap-map-hint');
    if (!hint) return;
    hint.style.display = show ? 'block' : 'none';
    if (show) hint.textContent = `🗺️ Clique em uma aldeia no mapa para definir como ${type === 'origin' ? 'ORIGEM' : 'DESTINO'}...`;
  }

  /* ──────────────────────────────────────────────
     CSS INJETADO
  ────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('ap-style')) return;
    const style = document.createElement('style');
    style.id = 'ap-style';
    style.textContent = `
      #ap-overlay {
        position: fixed; inset: 0; z-index: 99998;
        background: rgba(0,0,0,0.55);
        display: flex; align-items: center; justify-content: center;
      }
      #ap-modal {
        background: #f4e4c1;
        border: 2px solid #7a5c1e;
        border-radius: 6px;
        width: 700px; max-width: 96vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        font-family: 'Verdana', sans-serif;
        font-size: 12px;
        color: #3b2a0e;
        position: relative;
      }
      #ap-modal * { box-sizing: border-box; }
      #ap-header {
        background: #2c1a06;
        padding: 10px 16px;
        display: flex; align-items: center; gap: 10px;
        border-bottom: 2px solid #8b6914;
      }
      #ap-header h2 {
        color: #f4d87a; font-size: 15px; font-weight: bold;
        margin: 0; letter-spacing: 1px; text-transform: uppercase;
        flex: 1;
      }
      #ap-header p { color: #a08040; font-size: 10px; margin: 0; }
      #ap-close {
        background: #7a2020; color: #fff; border: none;
        border-radius: 4px; width: 24px; height: 24px;
        cursor: pointer; font-size: 14px; font-weight: bold;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      #ap-close:hover { background: #a03030; }
      .ap-tabs {
        display: flex; background: #3d2805;
        border-bottom: 1px solid #8b6914;
      }
      .ap-tab {
        padding: 8px 18px; background: transparent; border: none;
        color: #a08040; font-size: 11px; font-weight: bold;
        cursor: pointer; border-bottom: 3px solid transparent;
        transition: all .15s; font-family: 'Verdana', sans-serif;
        text-transform: uppercase; letter-spacing: .5px;
      }
      .ap-tab.active { color: #f4d87a; border-bottom-color: #d4941e; background: rgba(212,148,30,.12); }
      .ap-tab:hover:not(.active) { color: #d4b060; background: rgba(255,255,255,.05); }
      .ap-panel { display: none; padding: 14px 16px; }
      .ap-panel.active { display: block; }
      .ap-section {
        background: #fffbe6;
        border: 1px solid #c8a84b;
        border-radius: 4px;
        margin-bottom: 12px;
        overflow: hidden;
      }
      .ap-section-head {
        background: #e8d098;
        padding: 6px 10px;
        font-weight: bold; font-size: 11px;
        color: #5a3a00;
        border-bottom: 1px solid #c8a84b;
        display: flex; align-items: center; gap: 6px;
      }
      .ap-section-body { padding: 10px; }
      .ap-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .ap-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
      .ap-field { display: flex; flex-direction: column; gap: 4px; }
      .ap-label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #6b4c10; letter-spacing: .4px; }
      .ap-input, .ap-select {
        padding: 6px 8px; border: 1px solid #b8901a;
        border-radius: 3px; background: #fffdf0; color: #3b2a0e;
        font-size: 12px; font-family: 'Verdana', sans-serif; width: 100%;
      }
      .ap-input:focus, .ap-select:focus { outline: none; border-color: #d4941e; box-shadow: 0 0 0 2px rgba(212,148,30,.2); }
      .ap-row { display: flex; gap: 6px; align-items: flex-end; }
      .ap-row .ap-input { flex: 1; }
      .ap-btn-map {
        padding: 6px 10px; background: #5a7a1e; color: #e8f8a0;
        border: 1px solid #3a5a0e; border-radius: 3px;
        cursor: pointer; font-size: 11px; white-space: nowrap;
        font-family: 'Verdana', sans-serif; font-weight: bold;
      }
      .ap-btn-map:hover { background: #6a9020; }
      .ap-btn-map.selecting { background: #9a6010; border-color: #6a4008; }
      .ap-troop-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
      }
      .ap-troop {
        border: 1px solid #c8a84b; border-radius: 3px;
        padding: 6px 4px; text-align: center;
        cursor: pointer; background: #fffbe6;
        transition: all .15s;
      }
      .ap-troop:hover { border-color: #d4941e; background: #fff3cc; }
      .ap-troop.selected { border-color: #8b2020; background: #ffe0c0; border-width: 2px; }
      .ap-troop-emoji { font-size: 18px; display: block; }
      .ap-troop-name { font-size: 9px; color: #6b4c10; display: block; margin-top: 2px; }
      .ap-troop-spd { font-size: 9px; color: #8b2020; font-weight: bold; }
      .ap-toggle {
        display: flex; border: 1px solid #b8901a; border-radius: 3px; overflow: hidden; margin-bottom: 10px;
      }
      .ap-toggle-btn {
        flex: 1; padding: 7px; background: #fffbe6;
        border: none; font-size: 11px; font-family: 'Verdana', sans-serif;
        cursor: pointer; color: #6b4c10; transition: all .15s; font-weight: bold;
      }
      .ap-toggle-btn.active { background: #8b2020; color: #fff8e0; }
      .ap-result {
        display: none; margin-top: 10px;
        background: #fff8e0; border: 1px solid #d4941e;
        border-radius: 4px; padding: 10px;
      }
      .ap-result.show { display: block; }
      .ap-result-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
      .ap-result-card {
        text-align: center; padding: 8px;
        background: #fffbe6; border: 1px solid #c8a84b; border-radius: 3px;
      }
      .ap-result-card .val { font-size: 14px; font-weight: bold; color: #8b2020; display: block; }
      .ap-result-card .lbl { font-size: 9px; color: #6b4c10; text-transform: uppercase; }
      .ap-info-row { display: flex; justify-content: space-between; font-size: 11px; padding: 3px 0; }
      .ap-info-row strong { color: #3b2a0e; }
      .ap-btn-primary {
        width: 100%; padding: 9px; background: #8b2020; color: #fff8e0;
        border: 1px solid #6a1010; border-radius: 3px; font-size: 12px;
        font-family: 'Verdana', sans-serif; font-weight: bold; cursor: pointer; margin-top: 10px;
      }
      .ap-btn-primary:hover { background: #a03030; }
      .ap-btn-secondary {
        padding: 6px 12px; background: #fffbe6; color: #5a3a00;
        border: 1px solid #b8901a; border-radius: 3px;
        font-size: 11px; font-family: 'Verdana', sans-serif; cursor: pointer; font-weight: bold;
      }
      .ap-btn-secondary:hover { background: #fff3cc; border-color: #d4941e; }
      .ap-btn-danger {
        padding: 4px 8px; background: transparent; color: #8b2020;
        border: 1px solid #c8a84b; border-radius: 3px;
        font-size: 10px; cursor: pointer; font-family: 'Verdana', sans-serif;
      }
      .ap-btn-danger:hover { background: #ffe0e0; }
      .ap-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
      .ap-hint {
        display: none; background: #e8f8a0; border: 1px solid #5a7a1e;
        border-radius: 3px; padding: 7px 10px; font-size: 11px; color: #3a5a00; margin-bottom: 8px;
        font-weight: bold;
      }
      .ap-dist-info {
        display: none; background: #fff3cc; border: 1px solid #d4941e;
        border-radius: 3px; padding: 6px 10px; margin-top: 8px; font-size: 11px;
      }
      .ap-table-wrap { overflow-x: auto; }
      table.ap-table {
        width: 100%; border-collapse: collapse; font-size: 11px; min-width: 580px;
      }
      table.ap-table th {
        background: #3d2805; color: #f4d87a; padding: 7px 8px;
        text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .4px;
      }
      table.ap-table td {
        padding: 7px 8px; border-bottom: 1px solid #e8d098; vertical-align: middle;
      }
      table.ap-table tr:hover td { background: #fff8e0; }
      table.ap-table tr:last-child td { border-bottom: none; }
      .ap-badge {
        display: inline-block; padding: 2px 7px; border-radius: 10px;
        font-size: 9px; font-weight: bold; font-family: 'Verdana', sans-serif;
      }
      .ap-badge-wait { background: #ffe0e0; color: #6a1010; }
      .ap-badge-route { background: #fff3cc; color: #6a4008; }
      .ap-badge-done { background: #e0f0d0; color: #2a5a10; }
      .ap-empty { text-align: center; padding: 30px; color: #8b6914; }
      .ap-top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 6px; }
      .ap-cnt { font-size: 11px; color: #6b4c10; }
      #ap-launcher {
        position: fixed; bottom: 20px; right: 20px; z-index: 99997;
        background: #8b2020; color: #fff8e0; border: 2px solid #6a1010;
        border-radius: 50%; width: 52px; height: 52px; font-size: 22px;
        cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,.4);
        display: flex; align-items: center; justify-content: center;
        font-family: sans-serif; transition: all .15s; user-select: none;
      }
      #ap-launcher:hover { background: #a03030; transform: scale(1.08); }
      #ap-launcher title { display: none; }
      .ap-sep { border: none; border-top: 1px solid #e8d098; margin: 10px 0; }
      @media (max-width: 500px) {
        .ap-grid-2, .ap-grid-3 { grid-template-columns: 1fr; }
        .ap-troop-grid { grid-template-columns: repeat(4, 1fr); }
        .ap-result-grid { grid-template-columns: 1fr 1fr; }
        #ap-modal { width: 98vw; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ──────────────────────────────────────────────
     HTML DO POP-UP
  ────────────────────────────────────────────── */
  function buildHTML() {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 8);

    const troopCards = TROOPS.map(t => `
      <div class="ap-troop" id="ap-troop-${t.id}" onclick="APPlanner.selectTroop('${t.id}')" title="${t.name} — ${t.speed} min/campo">
        <span class="ap-troop-emoji">${t.emoji}</span>
        <span class="ap-troop-name">${t.name}</span>
        <span class="ap-troop-spd">${t.speed}m</span>
      </div>`).join('');

    return `
    <div id="ap-overlay">
      <div id="ap-modal" role="dialog" aria-label="Attack Planner">
        <div id="ap-header">
          <div style="font-size:22px; line-height:1">⚔️</div>
          <div style="flex:1">
            <h2>Attack Planner</h2>
            <p>Tribal Wars · Planejador de Ataques</p>
          </div>
          <button id="ap-close" onclick="APPlanner.close()" title="Fechar">✕</button>
        </div>

        <div class="ap-tabs">
          <button class="ap-tab active" id="ap-tab-plan" onclick="APPlanner.switchTab('plan')">⚔ Planejar</button>
          <button class="ap-tab" id="ap-tab-list" onclick="APPlanner.switchTab('list')">📋 Ataques <span id="ap-count-badge"></span></button>
        </div>

        <!-- ── PAINEL PLANEJAR ── -->
        <div class="ap-panel active" id="ap-panel-plan">

          <div id="ap-map-hint" class="ap-hint"></div>

          <!-- Mundo -->
          <div class="ap-section">
            <div class="ap-section-head">🌍 Mundo &amp; Velocidade</div>
            <div class="ap-section-body ap-grid-2">
              <div class="ap-field">
                <label class="ap-label">Mundo Predefinido</label>
                <select class="ap-select" id="ap-world-preset" onchange="APPlanner.applyPreset()">
                  <option value="1">Clássico (1x)</option>
                  <option value="2">Rápido (2x)</option>
                  <option value="3">Speed (3x)</option>
                  <option value="0.5">Lento (0.5x)</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <div class="ap-field">
                <label class="ap-label">Velocidade do Mundo (×)</label>
                <input type="number" class="ap-input" id="ap-world-speed" value="1" min="0.1" step="0.1">
              </div>
            </div>
          </div>

          <!-- Aldeias -->
          <div class="ap-section">
            <div class="ap-section-head">🏰 Aldeias</div>
            <div class="ap-section-body ap-grid-2">
              <div class="ap-field">
                <label class="ap-label">Aldeia de Origem</label>
                <input type="text" class="ap-input" id="ap-origin-name" placeholder="Nome da aldeia">
                <div class="ap-row" style="margin-top:6px">
                  <input type="number" class="ap-input" id="ap-origin-x" placeholder="X" min="0" max="999" style="width:65px; flex:none">
                  <input type="number" class="ap-input" id="ap-origin-y" placeholder="Y" min="0" max="999" style="width:65px; flex:none">
                  <button class="ap-btn-map" id="ap-map-origin" onclick="APPlanner.startMapSelect('origin')">🗺 Mapa</button>
                  <button class="ap-btn-secondary" onclick="APPlanner.useCurrentVillage()" title="Usar aldeia atual do jogo" style="padding:5px 8px; font-size:10px">📍 Atual</button>
                </div>
              </div>
              <div class="ap-field">
                <label class="ap-label">Aldeia de Destino</label>
                <input type="text" class="ap-input" id="ap-dest-name" placeholder="Nome da aldeia">
                <div class="ap-row" style="margin-top:6px">
                  <input type="number" class="ap-input" id="ap-dest-x" placeholder="X" min="0" max="999" style="width:65px; flex:none">
                  <input type="number" class="ap-input" id="ap-dest-y" placeholder="Y" min="0" max="999" style="width:65px; flex:none">
                  <button class="ap-btn-map" id="ap-map-dest" onclick="APPlanner.startMapSelect('dest')">🗺 Mapa</button>
                </div>
              </div>
            </div>
            <div class="ap-dist-info" id="ap-dist-info"></div>
          </div>

          <!-- Tropa -->
          <div class="ap-section">
            <div class="ap-section-head">🛡 Tropa Mais Lenta</div>
            <div class="ap-section-body">
              <div class="ap-troop-grid">${troopCards}</div>
            </div>
          </div>

          <!-- Horário -->
          <div class="ap-section">
            <div class="ap-section-head">🕐 Modo de Planejamento</div>
            <div class="ap-section-body">
              <div class="ap-toggle">
                <button class="ap-toggle-btn active" id="ap-mode-send" onclick="APPlanner.setMode('send')">📤 Horário de Envio</button>
                <button class="ap-toggle-btn" id="ap-mode-arrive" onclick="APPlanner.setMode('arrive')">🎯 Horário de Chegada</button>
              </div>
              <div id="ap-field-send" class="ap-grid-2">
                <div class="ap-field">
                  <label class="ap-label">Data de Envio</label>
                  <input type="date" class="ap-input" id="ap-send-date" value="${today}">
                </div>
                <div class="ap-field">
                  <label class="ap-label">Hora de Envio</label>
                  <input type="time" class="ap-input" id="ap-send-time" step="1" value="${nowTime}">
                </div>
              </div>
              <div id="ap-field-arrive" style="display:none" class="ap-grid-2">
                <div class="ap-field">
                  <label class="ap-label">Data de Chegada</label>
                  <input type="date" class="ap-input" id="ap-arrive-date" value="${today}">
                </div>
                <div class="ap-field">
                  <label class="ap-label">Hora de Chegada</label>
                  <input type="time" class="ap-input" id="ap-arrive-time" step="1" value="${nowTime}">
                </div>
              </div>

              <div class="ap-result" id="ap-result">
                <div class="ap-result-grid">
                  <div class="ap-result-card"><span class="val" id="ap-r-dist">—</span><span class="lbl">Distância</span></div>
                  <div class="ap-result-card"><span class="val" id="ap-r-dur">—</span><span class="lbl">Duração</span></div>
                  <div class="ap-result-card"><span class="val" id="ap-r-troop">—</span><span class="lbl">Tropa</span></div>
                </div>
                <hr class="ap-sep">
                <div class="ap-info-row"><span>📤 Enviar em:</span><strong id="ap-r-send">—</strong></div>
                <div class="ap-info-row"><span>🎯 Chega em:</span><strong id="ap-r-arrive">—</strong></div>
              </div>
            </div>
          </div>

          <!-- Obs -->
          <div class="ap-section">
            <div class="ap-section-head">📝 Observações</div>
            <div class="ap-section-body">
              <input type="text" class="ap-input" id="ap-notes" placeholder="ex: Nobre + ram, Ataque fake, coordenar com aliado...">
              <div class="ap-actions">
                <button class="ap-btn-primary" onclick="APPlanner.saveAttack()">⚔ Calcular &amp; Salvar Ataque</button>
                <button class="ap-btn-secondary" onclick="APPlanner.clearForm()">🔄 Limpar</button>
              </div>
            </div>
          </div>

        </div>

        <!-- ── PAINEL LISTA ── -->
        <div class="ap-panel" id="ap-panel-list">
          <div class="ap-top-bar">
            <span class="ap-cnt" id="ap-total-lbl">0 ataques planejados</span>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="ap-btn-secondary" onclick="APPlanner.sortByTime()">⬆ Ordenar por envio</button>
              <button class="ap-btn-secondary" onclick="APPlanner.exportCSV()">⬇ Exportar CSV</button>
              <button class="ap-btn-danger" onclick="APPlanner.clearAll()">🗑 Limpar tudo</button>
            </div>
          </div>
          <div id="ap-table-wrap"></div>
        </div>

      </div>
    </div>`;
  }

  /* ──────────────────────────────────────────────
     LÓGICA PRINCIPAL (namespace APPlanner)
  ────────────────────────────────────────────── */
  window.APPlanner = {

    open() {
      if (document.getElementById('ap-overlay')) return;
      injectCSS();
      const div = document.createElement('div');
      div.innerHTML = buildHTML();
      document.body.appendChild(div.firstElementChild);

      // Auto-detectar velocidade do mundo
      const ws = tryGetWorldSpeed();
      if (ws !== 1) document.getElementById('ap-world-speed').value = ws;

      // Inputs que disparam recalculate
      ['ap-origin-x','ap-origin-y','ap-dest-x','ap-dest-y',
       'ap-send-date','ap-send-time','ap-arrive-date','ap-arrive-time','ap-world-speed']
        .forEach(id => {
          const el = document.getElementById(id);
          if (el) { el.addEventListener('input', () => this.recalculate()); el.addEventListener('change', () => this.recalculate()); }
        });

      this.renderTable();
    },

    close() {
      const el = document.getElementById('ap-overlay');
      if (el) el.remove();
      document.removeEventListener('click', onMapClick, true);
      selectingMap = null;
    },

    switchTab(tab) {
      ['plan','list'].forEach(t => {
        document.getElementById(`ap-tab-${t}`)?.classList.toggle('active', t === tab);
        document.getElementById(`ap-panel-${t}`)?.classList.toggle('active', t === tab);
      });
      if (tab === 'list') this.renderTable();
    },

    applyPreset() {
      const v = document.getElementById('ap-world-preset').value;
      if (v !== 'custom') document.getElementById('ap-world-speed').value = v;
      this.recalculate();
    },

    selectTroop(id) {
      document.querySelectorAll('.ap-troop').forEach(c => c.classList.remove('selected'));
      document.getElementById(`ap-troop-${id}`)?.classList.add('selected');
      selectedTroop = TROOPS.find(t => t.id === id);
      this.recalculate();
    },

    setMode(mode) {
      planMode = mode;
      document.getElementById('ap-mode-send').classList.toggle('active', mode === 'send');
      document.getElementById('ap-mode-arrive').classList.toggle('active', mode === 'arrive');
      document.getElementById('ap-field-send').style.display = mode === 'send' ? '' : 'none';
      document.getElementById('ap-field-arrive').style.display = mode === 'arrive' ? '' : 'none';
      this.recalculate();
    },

    startMapSelect(type) {
      const btn = document.getElementById(`ap-map-${type}`);
      if (selectingMap === type) {
        selectingMap = null;
        btn.classList.remove('selecting');
        showMapHint(false);
        document.removeEventListener('click', onMapClick, true);
        return;
      }
      document.querySelectorAll('.ap-btn-map').forEach(b => b.classList.remove('selecting'));
      btn.classList.add('selecting');
      enableMapSelection(type);
    },

    useCurrentVillage() {
      const v = tryGetVillageFromPage();
      if (!v) { alert('Não foi possível detectar a aldeia atual. Informe as coordenadas manualmente.'); return; }
      document.getElementById('ap-origin-name').value = v.name;
      document.getElementById('ap-origin-x').value = v.x;
      document.getElementById('ap-origin-y').value = v.y;
      this.recalculate();
    },

    recalculate() {
      const ox = parseFloat(document.getElementById('ap-origin-x').value);
      const oy = parseFloat(document.getElementById('ap-origin-y').value);
      const dx = parseFloat(document.getElementById('ap-dest-x').value);
      const dy = parseFloat(document.getElementById('ap-dest-y').value);
      const distInfo = document.getElementById('ap-dist-info');
      const resultEl = document.getElementById('ap-result');

      if (isNaN(ox) || isNaN(oy) || isNaN(dx) || isNaN(dy)) {
        distInfo.style.display = 'none';
        resultEl.classList.remove('show');
        return;
      }

      const dist = getDistance(ox, oy, dx, dy);
      distInfo.style.display = 'block';
      distInfo.innerHTML = `📏 Distância: <strong style="color:#8b2020">${dist.toFixed(2)}</strong> campos`;

      if (!selectedTroop) { resultEl.classList.remove('show'); return; }

      const speed = parseFloat(document.getElementById('ap-world-speed').value) || 1;
      const travelMin = (dist * selectedTroop.speed) / speed;
      const travelMs = travelMin * 60000;

      let sendTime, arriveTime;
      if (planMode === 'send') {
        sendTime = parseDateTime(document.getElementById('ap-send-date').value, document.getElementById('ap-send-time').value);
        if (!sendTime) { resultEl.classList.remove('show'); return; }
        arriveTime = new Date(sendTime.getTime() + travelMs);
      } else {
        arriveTime = parseDateTime(document.getElementById('ap-arrive-date').value, document.getElementById('ap-arrive-time').value);
        if (!arriveTime) { resultEl.classList.remove('show'); return; }
        sendTime = new Date(arriveTime.getTime() - travelMs);
      }

      document.getElementById('ap-r-dist').textContent = dist.toFixed(2) + ' c';
      document.getElementById('ap-r-dur').textContent = formatDuration(travelMin);
      document.getElementById('ap-r-troop').textContent = selectedTroop.emoji + ' ' + selectedTroop.name;
      document.getElementById('ap-r-send').textContent = formatDateTime(sendTime);
      document.getElementById('ap-r-arrive').textContent = formatDateTime(arriveTime);
      resultEl.classList.add('show');
      resultEl._data = { dist, travelMin, sendTime, arriveTime };
    },

    saveAttack() {
      const result = document.getElementById('ap-result');
      if (!result.classList.contains('show') || !result._data) {
        alert('Preencha origem, destino, tropa e horário antes de salvar.');
        return;
      }
      const ox = document.getElementById('ap-origin-x').value;
      const oy = document.getElementById('ap-origin-y').value;
      const dx = document.getElementById('ap-dest-x').value;
      const dy = document.getElementById('ap-dest-y').value;
      const origin = document.getElementById('ap-origin-name').value || `(${ox}|${oy})`;
      const dest   = document.getElementById('ap-dest-name').value   || `(${dx}|${dy})`;
      const notes  = document.getElementById('ap-notes').value;
      const { dist, travelMin, sendTime, arriveTime } = result._data;

      attacks.push({ id: Date.now(), origin, dest, troop: selectedTroop, distance: dist, travelMin, sendTime, arriveTime, notes, createdAt: new Date() });
      saveAttacks();
      this.renderTable();
      this.switchTab('list');
    },

    clearForm() {
      ['ap-origin-name','ap-origin-x','ap-origin-y','ap-dest-name','ap-dest-x','ap-dest-y','ap-notes'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      document.querySelectorAll('.ap-troop').forEach(c => c.classList.remove('selected'));
      selectedTroop = null;
      document.getElementById('ap-result').classList.remove('show');
      document.getElementById('ap-dist-info').style.display = 'none';
    },

    renderTable() {
      const wrap = document.getElementById('ap-table-wrap');
      const badge = document.getElementById('ap-count-badge');
      const lbl = document.getElementById('ap-total-lbl');
      if (!wrap) return;

      if (badge) badge.textContent = attacks.length > 0 ? ` (${attacks.length})` : '';
      if (lbl) lbl.textContent = `${attacks.length} ataque(s) planejado(s)`;

      if (attacks.length === 0) {
        wrap.innerHTML = `<div class="ap-empty">⚔️<br>Nenhum ataque planejado ainda.<br><small>Use a aba Planejar para adicionar.</small></div>`;
        return;
      }

      const now = new Date();
      const rows = attacks.map((a, i) => {
        let badge;
        if (a.arriveTime < now)      badge = '<span class="ap-badge ap-badge-done">✔ Chegou</span>';
        else if (a.sendTime < now)   badge = '<span class="ap-badge ap-badge-route">✈ Em rota</span>';
        else {
          const min = (a.sendTime - now) / 60000;
          badge = `<span class="ap-badge ap-badge-wait">⏳ Aguardando</span> <small style="font-size:9px;color:#8b6914">em ${formatDuration(min)}</small>`;
        }
        return `<tr>
          <td style="color:#8b6914;font-weight:bold">#${pad(i+1)}</td>
          <td style="font-weight:bold">${a.origin}</td>
          <td style="color:#8b2020;font-weight:bold">${a.dest}</td>
          <td>${a.troop.emoji} ${a.troop.name}</td>
          <td style="font-family:monospace;font-size:10px">${a.sendTime.toLocaleString('pt-BR')}</td>
          <td style="font-family:monospace;font-size:10px">${a.arriveTime.toLocaleString('pt-BR')}</td>
          <td style="font-family:monospace">${formatDuration(a.travelMin)}</td>
          <td>${badge}</td>
          <td style="color:#6b4c10;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.notes || '—'}</td>
          <td><button class="ap-btn-danger" onclick="APPlanner.deleteAttack(${a.id})">🗑</button></td>
        </tr>`;
      }).join('');

      wrap.innerHTML = `
        <div class="ap-table-wrap">
          <table class="ap-table">
            <thead><tr>
              <th>#</th><th>Origem</th><th>Destino</th><th>Tropa</th>
              <th>Envio</th><th>Chegada</th><th>Duração</th><th>Status</th><th>Obs.</th><th></th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    },

    deleteAttack(id) {
      attacks = attacks.filter(a => a.id !== id);
      saveAttacks();
      this.renderTable();
    },

    sortByTime() {
      attacks.sort((a, b) => a.sendTime - b.sendTime);
      saveAttacks();
      this.renderTable();
    },

    clearAll() {
      if (!attacks.length) return;
      if (confirm(`Remover todos os ${attacks.length} ataques planejados?`)) {
        attacks = [];
        saveAttacks();
        this.renderTable();
      }
    },

    exportCSV() {
      if (!attacks.length) { alert('Nenhum ataque para exportar.'); return; }
      const header = 'Origem\tDestino\tTropa\tDistância\tDuração\tEnvio\tChegada\tObs.';
      const rows = attacks.map(a =>
        [a.origin, a.dest, a.troop.name, a.distance.toFixed(2), formatDuration(a.travelMin),
         a.sendTime.toLocaleString('pt-BR'), a.arriveTime.toLocaleString('pt-BR'), a.notes || ''].join('\t')
      );
      const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/tab-separated-values' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'attack_planner_tw.tsv'; a.click();
      URL.revokeObjectURL(url);
    },
  };

  /* ──────────────────────────────────────────────
     BOTÃO FLUTUANTE LAUNCHER
  ────────────────────────────────────────────── */
  function createLauncher() {
    if (document.getElementById('ap-launcher')) return;
    const btn = document.createElement('button');
    btn.id = 'ap-launcher';
    btn.title = 'Attack Planner';
    btn.innerHTML = '⚔️';
    btn.onclick = () => {
      if (document.getElementById('ap-overlay')) {
        APPlanner.close();
      } else {
        APPlanner.open();
      }
    };
    document.body.appendChild(btn);
    injectCSS();
  }

  /* ──────────────────────────────────────────────
     ATUALIZAÇÃO AUTOMÁTICA DOS STATUS (30s)
  ────────────────────────────────────────────── */
  setInterval(() => {
    const panel = document.getElementById('ap-panel-list');
    if (panel && panel.classList.contains('active')) APPlanner.renderTable();
  }, 30000);

  /* ──────────────────────────────────────────────
     INIT
  ────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createLauncher);
  } else {
    createLauncher();
  }

})();
