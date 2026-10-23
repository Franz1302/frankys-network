/*
 * Frankys_Stuff Network v1.1
 * Copyright © 2026 Franz Schwenninger
 * Licensed under the PolyForm Noncommercial License 1.0.0.
 * Required Notice: Copyright © 2026 Franz Schwenninger
 * https://polyformproject.org/licenses/noncommercial/1.0.0
 */

class FrankysNetworkCard extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._handleClick = this._handleClick.bind(this);
    this._root.addEventListener("click", this._handleClick);
  }

  setConfig(config) {
    if (!config) throw new Error("Frankys Network: Konfiguration fehlt");

    this.config = {
      title: "Frankys_Stuff",
      subtitle: "NETWORK",
      tagline: "SMART HOME · NETWORK",
      background: "",
      public_mode: false,
      throughput_unit: "kB/s",
      dsl_unit: "kbit/s",
      uptime_mode: "start_time",
      uptime_unit: "seconds",
      entities: {},
      wifi: [],
      actions: [],
      mesh: [],
      ...config,
    };

    if (!Array.isArray(this.config.wifi)) this.config.wifi = [];
    if (!Array.isArray(this.config.actions)) this.config.actions = [];
    if (!Array.isArray(this.config.mesh)) this.config.mesh = [];

    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() {
    return 8;
  }

  _esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  _entity(id) {
    return id ? this._hass?.states?.[id] : null;
  }

  _num(id) {
    const s = this._entity(id)?.state;
    if (s == null || s === "unknown" || s === "unavailable") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  _fmt(n, digits = 1) {
    if (n == null) return "—";
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0
    }).format(n);
  }

  _stateLabel(id) {
    const s = this._entity(id)?.state;
    if (s === "on") return "Aktiv";
    if (s === "off") return "Aus";
    if (!s || s === "unknown" || s === "unavailable") return "Nicht verfügbar";
    return s;
  }

  _render() {
    const c = this.config;
    const bg = c.background
      ? `<video class="fsn-bg" autoplay muted loop playsinline preload="metadata"><source src="${this._esc(c.background)}" type="video/mp4"></video>`
      : `<div class="fsn-bg-fallback"></div>`;

    const wifi = c.wifi.map((x, i) => `
      <button class="fsn-row fsn-wifi-row" data-wifi="${i}">
        <span class="fsn-dot"></span>
        <span class="fsn-copy"><strong>${this._esc(x.label || `Wi-Fi ${i + 1}`)}</strong><small data-wifi-state="${i}">—</small></span>
        <span class="fsn-toggle"><span></span></span>
      </button>`).join("");

    const actions = c.actions.map((x, i) => `
      <button class="fsn-row fsn-action-row ${x.danger ? "danger" : ""}" data-action="${i}">
        <ha-icon icon="${this._esc(x.icon || "mdi:cog")}"></ha-icon>
        <span class="fsn-copy"><strong>${this._esc(x.label || "Aktion")}</strong><small>${this._esc(x.description || "")}</small></span>
      </button>`).join("");

    const mesh = c.mesh.map((x, i) => `
      <button class="fsn-mesh-card" data-mesh="${i}" aria-label="${this._esc((x.label || `Node ${i + 1}`) + " Details öffnen")}">
        <span class="fsn-dot"></span>
        <span class="fsn-copy"><strong>${this._esc(x.label || `Node ${i + 1}`)}</strong><small data-mesh-meta="${i}">—</small></span>
      </button>`).join("");

    this._root.innerHTML = `
      <ha-card>
        <div class="fsn-stage">
          ${bg}
          <div class="fsn-shade"></div>

          <header class="fsn-header">
            <div>
              <div class="fsn-brand"><b>${this._esc(c.title)}</b> <span>${this._esc(c.subtitle)}</span></div>
              <div class="fsn-tagline">${this._esc(c.tagline)}</div>
            </div>
            <div class="fsn-clock"><span data-date>—</span><b data-time>--:--</b></div>
          </header>

          <section class="fsn-stats">
            ${this._stat("mdi:download", "DOWNLOAD", "download")}
            ${this._stat("mdi:upload", "UPLOAD", "upload")}
            ${this._stat("mdi:link-variant", "DSL LINK", "dsl")}
            ${this._stat("mdi:chip", "CPU", "cpu")}
            ${this._stat("mdi:clock-outline", "UPTIME", "uptime")}
            ${this._stat("mdi:account-multiple-outline", "CLIENTS", "clients")}
          </section>

          <aside class="fsn-side">
            ${wifi ? `<section class="fsn-panel"><h3><ha-icon icon="mdi:wifi"></ha-icon> WLAN</h3>${wifi}</section>` : ""}
            ${c.entities?.guest_qr ? `<section class="fsn-panel fsn-qr-panel"><h3><ha-icon icon="mdi:qrcode"></ha-icon> GAST-WLAN</h3><img data-qr alt="Gast-WLAN QR-Code" hidden><small data-qr-status>Nicht verfügbar</small></section>` : ""}
            ${actions ? `<section class="fsn-panel"><h3><ha-icon icon="mdi:cog"></ha-icon> FUNKTIONEN</h3>${actions}</section>` : ""}
          </aside>

          <main class="fsn-mesh">
            ${mesh || `<div class="fsn-empty">Keine Mesh-Knoten konfiguriert</div>`}
          </main>

          <div class="fsn-status"><span class="fsn-dot"></span><span data-online>Systemstatus</span></div>

          <div class="fsn-dialog" data-dialog hidden>
            <div class="fsn-dialog-panel" role="dialog" aria-modal="true" aria-label="Mesh-Knoten Details">
              <button class="fsn-dialog-close" data-dialog-close aria-label="Schließen">×</button>
              <div class="fsn-dialog-kicker">NETWORK NODE</div>
              <div class="fsn-dialog-title"><span class="fsn-dot" data-dialog-dot></span><strong data-dialog-title>Mesh Node</strong></div>
              <div class="fsn-dialog-model" data-dialog-model>—</div>
              <div class="fsn-dialog-grid" data-dialog-grid></div>
            </div>
          </div>
        </div>
      </ha-card>

      <style>
        :host{display:block}
        ha-card{overflow:hidden;border:0;border-radius:0;background:#010611;color:#eafaff}
        .fsn-stage{position:relative;min-height:720px;height:calc(100dvh - 65px);overflow:hidden;font-family:Arial,Helvetica,sans-serif}
        .fsn-bg,.fsn-bg-fallback,.fsn-shade{position:absolute;inset:0;width:100%;height:100%}
        .fsn-bg{object-fit:cover;z-index:0}
        .fsn-bg-fallback{z-index:0;background:radial-gradient(circle at 50% 52%,rgba(0,174,255,.13),transparent 35%),linear-gradient(145deg,#020814 0%,#04182a 45%,#01040b 100%)}
        .fsn-shade{z-index:1;background:linear-gradient(rgba(0,5,15,.10),rgba(0,4,12,.36));pointer-events:none}
        .fsn-header,.fsn-stats,.fsn-side,.fsn-mesh,.fsn-status{position:absolute;z-index:2}
        .fsn-header{left:3%;right:3%;top:3%;display:flex;justify-content:space-between;align-items:flex-start}
        .fsn-brand{font-size:clamp(24px,2.7vw,48px);letter-spacing:.08em}.fsn-brand b{color:#49e8ff;text-shadow:0 0 14px rgba(73,232,255,.35)}.fsn-brand span{font-weight:300}
        .fsn-tagline{margin-top:6px;font-size:clamp(8px,.78vw,13px);letter-spacing:.25em;color:#62dfff}
        .fsn-clock{text-align:right;display:grid;gap:3px}.fsn-clock span{font-size:12px;opacity:.75}.fsn-clock b{font-size:28px}
        .fsn-stats{left:2%;right:2%;top:12%;display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
        .fsn-stat,.fsn-panel,.fsn-mesh-card{background:linear-gradient(180deg,rgba(5,18,31,.58),rgba(2,10,20,.66));border:1px solid rgba(111,162,187,.18);backdrop-filter:blur(3px);box-shadow:inset 0 0 20px rgba(42,96,122,.04);border-radius:10px}
        .fsn-stat{padding:13px 14px;min-height:76px}.fsn-stat .head{display:flex;gap:7px;align-items:center;color:rgba(205,226,235,.72);font-size:12px}.fsn-stat .head ha-icon{--mdc-icon-size:20px;color:#63dfff}
        .fsn-stat .value{margin-top:10px;font-size:clamp(18px,1.5vw,27px);font-weight:650}.fsn-stat .value small{font-size:.52em;font-weight:500;opacity:.78}
        .fsn-side{left:2%;top:28%;width:min(310px,21%);display:grid;gap:12px}.fsn-panel{padding:12px}
        h3{margin:0 0 10px;display:flex;gap:8px;align-items:center;font-size:12px;letter-spacing:.08em;color:rgba(205,226,235,.78)}h3 ha-icon{--mdc-icon-size:20px;color:#63dfff}
        .fsn-row{width:100%;display:flex;align-items:center;gap:10px;margin:7px 0;padding:9px 10px;border:1px solid rgba(111,162,187,.14);border-radius:8px;background:rgba(2,10,20,.46);color:inherit;text-align:left;cursor:pointer}
        .fsn-copy{min-width:0;display:grid;gap:3px;flex:1}.fsn-copy strong{font-size:13px}.fsn-copy small{font-size:10px;opacity:.72;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .fsn-dot{width:8px;height:8px;border-radius:50%;background:#ffc158;box-shadow:0 0 8px rgba(255,193,88,.6);flex:0 0 auto}
        .is-on .fsn-dot,.online .fsn-dot,.fsn-status.online .fsn-dot{background:#55ef78;box-shadow:0 0 8px rgba(85,239,120,.7)}
        .is-off .fsn-dot,.offline .fsn-dot,.fsn-status.offline .fsn-dot{background:#ff536d;box-shadow:0 0 8px rgba(255,83,109,.7)}
        .fsn-toggle{width:34px;height:18px;border-radius:10px;background:#283743;padding:2px;box-sizing:border-box}.fsn-toggle span{display:block;width:14px;height:14px;border-radius:50%;background:#cdd8dd;transition:.2s}.is-on .fsn-toggle{background:#158ab7}.is-on .fsn-toggle span{transform:translateX(16px)}
        .danger{border-color:rgba(255,83,109,.22)}
        .fsn-qr-panel{text-align:center}.fsn-qr-panel img{width:min(150px,75%);aspect-ratio:1;border-radius:8px;background:white;padding:6px;box-sizing:border-box}.fsn-qr-panel small{display:block;margin-top:6px;opacity:.7}
        .fsn-mesh{left:26%;right:3%;top:29%;bottom:8%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-content:start}
        .fsn-mesh-card{min-height:105px;padding:16px;color:inherit;text-align:left;display:flex;align-items:center;gap:12px;cursor:pointer}.fsn-mesh-card .fsn-copy strong{font-size:16px}.fsn-mesh-card .fsn-copy small{font-size:12px}
        .fsn-empty{opacity:.6}.fsn-status{right:3%;bottom:3%;display:flex;gap:8px;align-items:center;font-size:12px}
        .fsn-dialog{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(0,5,10,.34);backdrop-filter:blur(3px)}
        .fsn-dialog[hidden]{display:none!important}.fsn-dialog-panel{position:relative;width:min(560px,86%);padding:22px;border:1px solid rgba(94,170,197,.30);border-radius:12px;background:linear-gradient(180deg,rgba(4,18,31,.97),rgba(2,10,19,.98));box-shadow:0 0 34px rgba(0,27,42,.32)}
        .fsn-dialog-close{position:absolute;right:10px;top:8px;border:0;background:transparent;color:#eafaff;font-size:28px;cursor:pointer}.fsn-dialog-kicker{font-size:10px;letter-spacing:.18em;color:rgba(102,195,226,.66)}
        .fsn-dialog-title{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:24px}.fsn-dialog-model{margin-top:4px;color:rgba(143,213,236,.78);font-size:13px}
        .fsn-dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}.fsn-dialog-item{padding:10px;border:1px solid rgba(105,164,185,.14);border-radius:8px;background:rgba(9,28,43,.40)}.fsn-dialog-item span{display:block;font-size:9px;letter-spacing:.06em;text-transform:uppercase;opacity:.58}.fsn-dialog-item strong{display:block;margin-top:4px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        @media (max-width:1000px){.fsn-stats{grid-template-columns:repeat(3,1fr)}.fsn-side{top:38%;width:28%}.fsn-mesh{left:32%;top:38%;grid-template-columns:repeat(2,1fr)}}
      </style>`;

    this._update();
  }

  _stat(icon, label, key) {
    return `<div class="fsn-stat"><div class="head"><ha-icon icon="${icon}"></ha-icon><span>${label}</span></div><div class="value" data-stat="${key}">—</div></div>`;
  }

  _uptimeDays(state) {
    if (state == null || state === "" || state === "unknown" || state === "unavailable") return null;

    if (this.config.uptime_mode === "duration") {
      const n = Number(state);
      if (!Number.isFinite(n)) return null;
      const factors = {
        seconds: 1 / 86400,
        minutes: 1 / 1440,
        hours: 1 / 24,
        days: 1
      };
      const factor = factors[this.config.uptime_unit];
      return factor ? Math.floor(Math.max(0, n * factor)) : null;
    }

    const raw = String(state).trim();
    if (/^[+-]?\d+(?:\.\d+)?$/.test(raw)) return null;
    const ts = Date.parse(raw);
    if (!Number.isFinite(ts)) return null;
    return Math.floor(Math.max(0, Date.now() - ts) / 86400000);
  }

  _topologyNodes() {
    const id = this.config?.entities?.topology;
    const topo = this._entity(id)?.attributes?.mesh_nodes;
    return Array.isArray(topo) ? topo : [];
  }

  _meshNode(item) {
    if (!item?.topology_name) return null;
    return this._topologyNodes().find((n) => n?.name === item.topology_name) || null;
  }

  _meshStatus(node) {
    if (!node) return "unknown";
    if (node.parent_link_state === "CONNECTED") return "online";
    if (node.parent_link_state === "DISCONNECTED") return "offline";
    return "unknown";
  }

  _rateText(kbps) {
    const n = Number(kbps);
    return Number.isFinite(n) && n > 0 ? `${this._fmt(n / 1000, 0)} Mbit/s` : "—";
  }

  _handleClick(ev) {
    const close = ev.target.closest("[data-dialog-close]");
    const overlay = ev.target.closest("[data-dialog]");
    if (close || (overlay && ev.target === overlay)) {
      this._closeMeshDetails();
      return;
    }

    const mesh = ev.target.closest("[data-mesh]");
    if (mesh) {
      this._openMeshDetails(Number(mesh.dataset.mesh));
      return;
    }

    if (!this._hass || this.config.public_mode) return;

    const wifi = ev.target.closest("[data-wifi]");
    if (wifi) {
      const item = this.config.wifi?.[Number(wifi.dataset.wifi)];
      const id = item?.entity;
      const state = this._entity(id)?.state;
      if (id && (state === "on" || state === "off")) {
        this._hass.callService("switch", state === "on" ? "turn_off" : "turn_on", { entity_id: id });
      }
      return;
    }

    const action = ev.target.closest("[data-action]");
    if (action) {
      const item = this.config.actions?.[Number(action.dataset.action)];
      if (!item?.entity) return;
      if (item.confirm && !window.confirm(item.confirm)) return;
      this._hass.callService("button", "press", { entity_id: item.entity });
    }
  }

  _openMeshDetails(index) {
    const item = this.config.mesh?.[index];
    if (!item) return;

    const dialog = this._root.querySelector("[data-dialog]");
    if (!dialog) return;

    let node = this.config.public_mode ? {
      model: "Demo Mesh Node",
      firmware: "Demo",
      parent_link_state: "CONNECTED",
      parent_link_type: "WLAN",
      parent_cur_rx_kbps: 300000,
      parent_cur_tx_kbps: 240000,
      clients: [{connection_state:"CONNECTED"}, {connection_state:"CONNECTED"}]
    } : this._meshNode(item);

    const status = this.config.public_mode ? "online" : this._meshStatus(node);
    const title = this._root.querySelector("[data-dialog-title]");
    const model = this._root.querySelector("[data-dialog-model]");
    const grid = this._root.querySelector("[data-dialog-grid]");
    const dot = this._root.querySelector("[data-dialog-dot]");

    if (title) title.textContent = item.label || `Node ${index + 1}`;
    if (model) model.textContent = node?.model || (node ? "Mesh-Gerät" : "Nicht gefunden");

    if (dot) {
      dot.style.background = status === "online" ? "#55ef78" : status === "offline" ? "#ff536d" : "#ffc158";
    }

    const connectedClients = Array.isArray(node?.clients)
      ? node.clients.filter((c) => c?.connection_state === "CONNECTED").length
      : null;

    const rows = [
      ["Status", status === "online" ? "Online" : status === "offline" ? "Offline" : "Unbekannt"],
      ["Verbindung", node?.parent_link_type || "—"],
      ["Link RX", this._rateText(node?.parent_cur_rx_kbps)],
      ["Link TX", this._rateText(node?.parent_cur_tx_kbps)],
      ["Clients", connectedClients == null ? "—" : String(connectedClients)],
      ["Firmware", node?.firmware || "—"]
    ];

    if (grid) {
      grid.replaceChildren();
      rows.forEach(([label, value]) => {
        const box = document.createElement("div");
        box.className = "fsn-dialog-item";
        const l = document.createElement("span");
        const v = document.createElement("strong");
        l.textContent = label;
        v.textContent = value;
        box.append(l, v);
        grid.appendChild(box);
      });
    }

    dialog.hidden = false;
  }

  _closeMeshDetails() {
    const dialog = this._root.querySelector("[data-dialog]");
    if (dialog) dialog.hidden = true;
  }

  _update() {
    if (!this._hass || !this.config || !this._root) return;
    const e = this.config.entities || {};

    const now = new Date();
    const date = this._root.querySelector("[data-date]");
    const time = this._root.querySelector("[data-time]");
    if (date) date.textContent = new Intl.DateTimeFormat(undefined,{weekday:"short",day:"2-digit",month:"2-digit",year:"numeric"}).format(now);
    if (time) time.textContent = new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit",hour12:false}).format(now);

    const set = (k, html) => {
      const el = this._root.querySelector(`[data-stat="${k}"]`);
      if (el) el.innerHTML = html;
    };

    if (this.config.public_mode) {
      set("download",'84.7 <small>Mbit/s</small>');
      set("upload",'12.4 <small>Mbit/s</small>');
      set("dsl",'300 / 44 <small>Mbit/s</small>');
      set("cpu",'56 <small>°C</small>');
      set("uptime",'42 <small>Tage</small>');
      set("clients",'18');
    } else {
      const downRaw = this._num(e.download);
      const upRaw = this._num(e.upload);
      const factor = this.config.throughput_unit === "kB/s" ? 8/1000 : this.config.throughput_unit === "kbit/s" ? 1/1000 : 1;

      set("download", `${this._fmt(downRaw == null ? null : downRaw * factor, 2)} <small>Mbit/s</small>`);
      set("upload", `${this._fmt(upRaw == null ? null : upRaw * factor, 2)} <small>Mbit/s</small>`);

      const dslDown = this._num(e.dsl_down);
      const dslUp = this._num(e.dsl_up);
      const dslFactor = this.config.dsl_unit === "kbit/s" ? 1/1000 : 1;
      set("dsl", `${this._fmt(dslDown == null ? null : dslDown*dslFactor,1)} / ${this._fmt(dslUp == null ? null : dslUp*dslFactor,1)} <small>Mbit/s</small>`);

      set("cpu", `${this._fmt(this._num(e.cpu_temp),0)} <small>°C</small>`);

      const uptime = this._uptimeDays(this._entity(e.uptime)?.state);
      set("uptime", `${uptime == null ? "—" : uptime} <small>Tage</small>`);
      set("clients", this._fmt(this._num(e.clients),0));
    }

    this.config.wifi.forEach((item, i) => {
      const row = this._root.querySelector(`[data-wifi="${i}"]`);
      const label = this._root.querySelector(`[data-wifi-state="${i}"]`);
      if (!row) return;
      const state = this.config.public_mode ? (i < 2 ? "on" : "off") : this._entity(item.entity)?.state;
      row.classList.toggle("is-on", state === "on");
      row.classList.toggle("is-off", state === "off");
      if (label) label.textContent = this.config.public_mode ? (state === "on" ? "Demo aktiv" : "Demo aus") : this._stateLabel(item.entity);
    });

    const qr = this._root.querySelector("[data-qr]");
    const qrStatus = this._root.querySelector("[data-qr-status]");
    if (qr) {
      if (this.config.public_mode) {
        qr.removeAttribute("src");
        qr.hidden = true;
        if (qrStatus) qrStatus.textContent = "Demo · kein echter QR-Code";
      } else {
        const pic = this._entity(e.guest_qr)?.attributes?.entity_picture;
        if (pic) {
          if (qr.getAttribute("src") !== pic) qr.setAttribute("src", pic);
          qr.hidden = false;
          if (qrStatus) qrStatus.textContent = "Zum Verbinden scannen";
        } else {
          qr.removeAttribute("src");
          qr.hidden = true;
          if (qrStatus) qrStatus.textContent = "QR-Code nicht verfügbar";
        }
      }
    }

    const connection = this.config.public_mode ? "on" : this._entity(e.connection)?.state;
    const status = this._root.querySelector(".fsn-status");
    const online = this._root.querySelector("[data-online]");
    status?.classList.toggle("online", connection === "on");
    status?.classList.toggle("offline", connection === "off");
    if (online) online.textContent = connection === "on" ? "Alle Systeme online" : connection === "off" ? "Verbindung prüfen" : "Systemstatus";

    this.config.mesh.forEach((item, i) => {
      const card = this._root.querySelector(`[data-mesh="${i}"]`);
      const meta = this._root.querySelector(`[data-mesh-meta="${i}"]`);
      if (!card) return;

      if (this.config.public_mode) {
        card.classList.add("online");
        card.classList.remove("offline");
        if (meta) meta.textContent = "DEMO · verbunden";
        return;
      }

      const node = this._meshNode(item);
      const nodeStatus = this._meshStatus(node);
      card.classList.toggle("online", nodeStatus === "online");
      card.classList.toggle("offline", nodeStatus === "offline");

      const rx = Number(node?.parent_cur_rx_kbps) || 0;
      const tx = Number(node?.parent_cur_tx_kbps) || 0;
      const positive = [rx, tx].filter((n) => n > 0);
      const rate = positive.length ? Math.min(...positive) / 1000 : 0;
      const type = node?.parent_link_type || "—";
      if (meta) meta.textContent = node ? `${type} · ${rate > 0 ? this._fmt(rate,0)+" Mbit/s" : nodeStatus === "online" ? "verbunden" : "offline"}` : "Nicht gefunden";
    });
  }
}

if (!customElements.get("frankys-network-card")) {
  customElements.define("frankys-network-card", FrankysNetworkCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "frankys-network-card")) {
  window.customCards.push({
    type: "frankys-network-card",
    name: "Frankys_Stuff Network",
    description: "Konfigurierbare Home-Assistant-Netzwerkkarte ohne feste private Entity-IDs"
  });
}
