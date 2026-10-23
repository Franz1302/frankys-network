/*
 * Frankys_Stuff Network v1.3.2
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
      title: "Steve´s",
      subtitle: "NETWORK",
      tagline: "SMART HOME · STABIL · SICHER · VERBUNDEN",
      background: "/local/JARVIS_Netzwerk_Loop_Crossfade.mp4",
      public_mode: true,
      throughput_unit: "auto",
      dsl_unit: "auto",
      volume_unit: "auto",
      uptime_mode: "start_time",
      uptime_unit: "seconds",
      status_mode: "connection",
      entities: {},
      huds: {},
      wifi: [
        {label:"Wi-Fi 2,4 GHz",entity:""},
        {label:"Wi-Fi 5 GHz",entity:""},
        {label:"Gast-WLAN",entity:""}
      ],
      actions: [
        {label:"Neu verbinden",description:"Internetverbindung erneuern",icon:"mdi:sync",entity:""},
        {label:"Neu starten",description:"Router neu starten",icon:"mdi:power",entity:"",danger:true,confirm:"Router wirklich neu starten?"}
      ],
      clients: [],
      mesh: [
        {label:"Speedport Smart 4",topology_name:"",entity:""},
        {label:"NODE A",topology_name:"",entity:""},
        {label:"NODE B",topology_name:"",entity:""},
        {label:"NODE C",topology_name:"",entity:""},
        {label:"REPEATER",topology_name:"",entity:""},
        {label:"MESH ADAPTER",topology_name:"",entity:""},
        {label:"NODE D",topology_name:"",entity:""}
      ],
      ...config,
    };

    if (!Array.isArray(this.config.wifi)) this.config.wifi = [];
    if (!Array.isArray(this.config.actions)) this.config.actions = [];
    if (!Array.isArray(this.config.mesh)) this.config.mesh = [];
    if (!Array.isArray(this.config.clients)) this.config.clients = [];
    if (!this.config.huds || typeof this.config.huds !== "object" || Array.isArray(this.config.huds)) this.config.huds = {};
    this._historyLoaded = false;
    this._series = {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
    if (!this.config?.public_mode && !this._historyLoaded) this._loadHistory();
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

  _rateMbit(value, id, unitOverride, defaultUnit) {
    if (value === null || !Number.isFinite(value)) return null;
    const unit = (unitOverride && unitOverride !== "auto" ? unitOverride :
      this._entity(id)?.attributes?.unit_of_measurement || defaultUnit)
      .toString().trim().toLowerCase().replace(/\s/g, "");
    if (["mbit/s","mbps"].includes(unit)) return value;
    if (["kbit/s","kbps"].includes(unit)) return value/1000;
    if (["bit/s","bps"].includes(unit)) return value/1e6;
    if (["mbyte/s","mb/s"].includes(unit)) return value*8;
    if (["kbyte/s","kb/s"].includes(unit)) return value*8/1000;
    if (["byte/s","b/s"].includes(unit)) return value*8/1e6;
    return value*(defaultUnit === "kbit/s" ? .001 : .008);
  }

  _volumeGB(value, id) {
    if (value == null) return null;
    const unit = (this.config.volume_unit !== "auto" ? this.config.volume_unit :
      this._entity(id)?.attributes?.unit_of_measurement || "GB").toString().toLowerCase();
    if (unit === "tb") return value*1000;
    if (unit === "mb") return value/1000;
    if (unit === "byte" || unit === "b") return value/1e9;
    if (unit === "kb") return value/1e6;
    return value;
  }

  _volumeText(value) {
    if (value == null) return '— <small>GB</small>';
    return value >= 1000 ? `${this._fmt(value/1000,2)} <small>TB</small>` :
      `${this._fmt(value,2)} <small>GB</small>`;
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
            ${this._stat(c.public_mode ? "mdi:link-variant" : c.huds?.dsl?.icon || "mdi:link-variant",c.public_mode ? "DSL LINK" : c.huds?.dsl?.label || "DSL LINK","dsl")}
            ${this._stat(c.public_mode ? "mdi:chip" : c.huds?.cpu?.icon || "mdi:chip",c.public_mode ? "CPU" : c.huds?.cpu?.label || "CPU","cpu")}
            ${this._stat(c.public_mode ? "mdi:clock-outline" : c.huds?.uptime?.icon || "mdi:clock-outline",c.public_mode ? "UPTIME" : c.huds?.uptime?.label || "UPTIME","uptime")}
            ${this._stat("mdi:upload-network-outline", "GB GESENDET", "sent")}
            ${this._stat("mdi:download-network-outline", "GB EMPFANGEN", "received")}
            ${this._stat("mdi:account-multiple-outline", "VERBUNDENE CLIENTS", "clients")}
          </section>

          <aside class="fsn-side fsn-left">
            <section class="fsn-panel"><h3><ha-icon icon="mdi:wifi"></ha-icon> WLAN</h3>${wifi || '<small>Keine WLAN-Schalter</small>'}</section>
            <section class="fsn-panel fsn-qr-panel"><h3><ha-icon icon="mdi:qrcode"></ha-icon> GAST-WLAN QR</h3><div class="fsn-qr-area"><img data-qr alt="Gast-WLAN QR-Code" hidden></div><small data-qr-status>Noch kein QR-Code</small></section>
          </aside>

          <aside class="fsn-side fsn-right">
            <section class="fsn-panel"><h3><ha-icon icon="mdi:cog"></ha-icon> NETZWERK FUNKTIONEN</h3>${actions || '<small>Keine Aktionen</small>'}</section>
            <section class="fsn-panel fsn-clients"><h3><ha-icon icon="mdi:account-multiple-outline"></ha-icon> AKTUELLE CLIENTS</h3><div data-client-list></div></section>
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
              <section class="fsn-dialog-clients" data-dialog-clients hidden>
                <h4 data-dialog-client-heading>VERBUNDENE GERÄTE</h4>
                <div class="fsn-dialog-client-list" data-dialog-client-list></div>
              </section>
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
        .fsn-dialog[hidden]{display:none!important}.fsn-dialog-panel{position:relative;width:min(560px,86%);max-height:calc(100% - 68px);overflow:auto;padding:22px;border:1px solid rgba(94,170,197,.30);border-radius:12px;background:linear-gradient(180deg,rgba(4,18,31,.97),rgba(2,10,19,.98));box-shadow:0 0 34px rgba(0,27,42,.32)}
        .fsn-dialog-clients{margin-top:15px;border-top:1px solid rgba(94,170,197,.22);padding-top:12px}
        .fsn-dialog-clients[hidden]{display:none!important}
        .fsn-dialog-clients h4{margin:0 0 9px;font-size:11px;letter-spacing:.14em;color:#5fc5e4}
        .fsn-dialog-client-list{max-height:208px;overflow:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
        .fsn-dialog-client-list>div{padding:7px 9px;background:rgba(4,27,43,.55);border:1px solid rgba(94,170,197,.2);border-radius:5px;font-size:12px;overflow-wrap:anywhere}
        .fsn-dialog-close{position:absolute;right:10px;top:8px;border:0;background:transparent;color:#eafaff;font-size:28px;cursor:pointer}.fsn-dialog-kicker{font-size:10px;letter-spacing:.18em;color:rgba(102,195,226,.66)}
        .fsn-dialog-title{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:24px}.fsn-dialog-model{margin-top:4px;color:rgba(143,213,236,.78);font-size:13px}
        .fsn-dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}.fsn-dialog-item{padding:10px;border:1px solid rgba(105,164,185,.14);border-radius:8px;background:rgba(9,28,43,.40)}.fsn-dialog-item span{display:block;font-size:9px;letter-spacing:.06em;text-transform:uppercase;opacity:.58}.fsn-dialog-item strong{display:block;margin-top:4px;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        @media (max-width:1000px){.fsn-stats{grid-template-columns:repeat(3,1fr)}.fsn-side{top:38%;width:28%}.fsn-mesh{left:32%;top:38%;grid-template-columns:repeat(2,1fr)}}

        /* v1.2: complete desktop cockpit; original LCARS theme remains external. */
        .fsn-stats{left:1.5%;right:1.5%;top:11.4%;grid-template-columns:repeat(8,minmax(0,1fr));gap:7px}
        .fsn-stat{height:78px;min-height:78px;padding:10px 10px 6px;overflow:hidden}
        .fsn-stat .head{font-size:clamp(8px,.68vw,12px);white-space:nowrap;gap:5px}
        .fsn-stat .head ha-icon{--mdc-icon-size:17px}
        .fsn-stat .value{font-size:clamp(16px,1.5vw,27px);margin-top:9px;white-space:nowrap}
        .fsn-sparkline{display:block;width:100%;height:24px;margin-top:-1px;color:#4cdbff;opacity:.9}
        .fsn-sparkline polyline{stroke:currentColor;stroke-width:1.65;fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
        .fsn-stat-upload,.fsn-stat-received{color:#c98aff}.fsn-stat-upload .fsn-sparkline,.fsn-stat-received .fsn-sparkline{color:#d18afd}
        .fsn-stat-cpu .fsn-sparkline{color:#ffbf6c}
        .fsn-stat-uptime .fsn-sparkline{visibility:${!c.public_mode && c.huds?.uptime?.type === "sensor" ? "visible" : "hidden"}}
        .fsn-tunnel-readout{font-size:clamp(12px,1.06vw,19px);font-weight:650}
        .fsn-tunnel-readout .fsn-hud-on{color:#55ef78}
        .fsn-tunnel-readout .fsn-hud-off{color:#ff536d}
        .fsn-tunnel-readout .fsn-hud-unknown{color:#ffc158}
        .fsn-side{top:29%;width:min(272px,19%);max-height:69%;overflow:hidden;gap:12px}
        .fsn-left{left:1.6%}.fsn-right{left:auto;right:1.6%}
        .fsn-panel{padding:13px 14px}.fsn-panel h3{font-size:clamp(10px,.85vw,14px)}
        .fsn-row{padding:10px 8px;min-height:43px}
        .fsn-copy strong{font-size:clamp(10px,.85vw,14px)}
        .fsn-qr-area{min-height:146px;display:flex;align-items:center;justify-content:center}
        .fsn-qr-panel img{width:140px;max-width:90%}
        .fsn-clients{max-height:360px;overflow:auto}
        .fsn-client-row{display:flex;align-items:center;gap:8px;border:1px solid rgba(111,162,187,.18);border-radius:7px;margin:4px 0;padding:5px 7px;background:rgba(1,10,20,.62)}
        .fsn-client-copy{display:grid;gap:2px;min-width:0}.fsn-client-copy strong{font-size:12px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
        .fsn-client-copy small{font-size:10px;color:#64cce9;white-space:nowrap}
        .fsn-mesh{left:20%;right:20%;top:29%;bottom:4%;display:block;pointer-events:none}
        .fsn-mesh-card{position:absolute;width:135px;min-height:40px;padding:5px 7px;gap:6px;pointer-events:auto;border:0;background:rgba(1,10,23,.55);border-radius:4px;transform:translate(-50%,-50%);box-shadow:none;backdrop-filter:blur(2px)}
        .fsn-mesh-card::before{content:"";position:absolute;bottom:20px;left:50%;width:clamp(140px,14vw,215px);height:160px;transform:translateX(-50%);background:transparent;pointer-events:auto}
        .fsn-mesh-card:focus-visible{outline:2px solid #5cecff;outline-offset:4px}
        .fsn-mesh-card .fsn-copy strong{font-size:12px;color:#dcfaff}
        .fsn-mesh-card .fsn-copy small{font-size:10px;color:#79d5ec}
        .fsn-mesh-card:nth-child(1){left:50%;top:50%;width:170px}
        .fsn-mesh-card:nth-child(2){left:50%;top:12%}
        .fsn-mesh-card:nth-child(3){left:17%;top:30%}
        .fsn-mesh-card:nth-child(4){left:83%;top:32%}
        .fsn-mesh-card:nth-child(5){left:12%;top:66%}
        .fsn-mesh-card:nth-child(6){left:34%;top:87%}
        .fsn-mesh-card:nth-child(7){left:84%;top:84%}
        .fsn-mesh-card:nth-child(8){left:91%;top:59%}
        .fsn-empty{padding-top:90px;text-align:center}
        @media (max-width:1100px){.fsn-stats{grid-template-columns:repeat(4,1fr)}.fsn-side{top:36%;width:24%}.fsn-mesh{left:24%;right:24%;top:38%}.fsn-mesh-card{width:100px}.fsn-clients{max-height:220px}}
      </style>`;

    this._update();
  }

  _stat(icon, label, key) {
    return `<div class="fsn-stat fsn-stat-${key}"><div class="head"><ha-icon icon="${this._esc(icon)}"></ha-icon><span>${this._esc(label)}</span></div><div class="value" data-stat="${key}">—</div><svg class="fsn-sparkline" data-chart="${key}" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><polyline></polyline></svg></div>`;
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

  _mappedStatus(entityId) {
    const v = String(this._entity(entityId)?.state ?? "").trim().toLowerCase();
    if (["ok","online","connected","on","home","up"].includes(v)) return "online";
    if (["off","offline","disconnected","not_home","failed","error"].includes(v)) return "offline";
    return "unknown";
  }

  _speedportClientByName(name) {
    if (!name) return null;
    const source = this._entity(this.config?.entities?.clients);
    if (!source || ["unknown","unavailable"].includes(source.state)) return null;
    const devices = source.attributes?.devices;
    if (!Array.isArray(devices)) return null;
    const target = String(name).trim().toLocaleLowerCase();
    return devices.find(d => String(d?.name || "").trim().toLocaleLowerCase() === target) || null;
  }

  _speedportClientForItem(item) {
    if (!item) return null;
    const byName = item.client_name ? this._speedportClientByName(item.client_name) : null;
    if (byName) return byName;
    const address = String(item.client_ip || "").trim();
    if (!address) return null;
    const source = this._entity(this.config?.entities?.clients);
    if (!source || ["unknown","unavailable"].includes(source.state)) return null;
    const devices = source.attributes?.devices;
    if (!Array.isArray(devices)) return null;
    return devices.find(d => String(d?.ip || "").trim() === address) || null;
  }

  _clientPresence(name) {
    return this._speedportClientByName(name) ? "online" : "unknown";
  }

  _nodeConnectionStatus(item, node) {
    if (node) return this._meshStatus(node);
    if (item.client_name || item.client_ip) return this._speedportClientForItem(item) ? "online" : "unknown";
    return this._mappedStatus(item.entity);
  }

  _rateText(kbps) {
    const n = Number(kbps);
    return Number.isFinite(n) && n > 0 ? `${this._fmt(n / 1000, 0)} Mbit/s` : "—";
  }

  _updateClientList() {
    const host=this._root.querySelector("[data-client-list]");
    if(!host) return;
    const items = this.config.public_mode ? [
      {name:"NODE A",type:"WLAN",speed:"240 Mbit/s",on:true},
      {name:"NODE B",type:"WLAN",speed:"390 Mbit/s",on:true},
      {name:"NODE C",type:"WLAN",speed:"173 Mbit/s",on:true},
      {name:"NODE D",type:"WLAN",speed:"195 Mbit/s",on:true},
      {name:"REPEATER",type:"WLAN",speed:"78 Mbit/s",on:true},
      {name:"MESH ADAPTER",type:"LAN",speed:"390 Mbit/s",on:true}
    ] : this.config.clients.map((c) => ({
      name:c.label||c.name||"Client", type:c.connection||"",speed:c.speed||"",
      on:c.entity ? this._entity(c.entity)?.state==="home" || this._entity(c.entity)?.state==="on" : null
    }));
    if (!this.config.public_mode && !items.length) {
      const list = this._entity(this.config.entities?.clients)?.attributes?.devices;
      if (Array.isArray(list)) {
        const seen = new Set();
        for (const d of list) {
          if (!d || typeof d !== "object") continue;
          const name = String(d.name || "").trim();
          if (!name || seen.has(name)) continue;
          seen.add(name);
          items.push({name, type:"Verbunden", speed:"", on:true});
        }
        items.sort((a,b) => a.name.localeCompare(b.name,undefined,{sensitivity:"base"}));
      }
    }
    if(!this.config.public_mode && !items.length) {
      const unique=new Set();
      for(const n of this._topologyNodes())for(const c of n.clients||[]) {
        if(c.connection_state!=="CONNECTED")continue;
        const name=String(c.name||c.ha_entity_id||c.ip||"Client");
        if(unique.has(name))continue;
        unique.add(name);
        items.push({name,type:c.connection_type||"WLAN",speed:"",on:true});
      }
    }
    const signature=JSON.stringify(items);
    if(signature===this._previousClients)return;
    this._previousClients=signature;
    host.replaceChildren();
    if(!items.length){const x=document.createElement("small");x.textContent="Noch keine Clientdaten";host.appendChild(x);return;}
    for(const c of items.slice(0,100)){
      const row=document.createElement("div");row.className="fsn-client-row";
      const dot=document.createElement("span");dot.className="fsn-dot";
      dot.style.background=c.on===true?"#55ef78":c.on===false?"#ff536d":"#ffc158";
      const t=document.createElement("span");t.className="fsn-client-copy";
      const name=document.createElement("strong");name.textContent=c.name;
      const sub=document.createElement("small");sub.textContent=[c.type,c.speed].filter(Boolean).join(" · ")||"Status unbekannt";
      t.append(name,sub);row.append(dot,t);host.appendChild(row);
    }
  }

  _hudOverrideHtml(key) {
    if (this.config.public_mode) return null;
    const hud = this.config.huds?.[key];
    if (!hud || typeof hud !== "object") return null;
    if (hud.type === "sensor") {
      const value = this._num(hud.entity);
      const rawUnit = hud.unit ?? this._entity(hud.entity)?.attributes?.unit_of_measurement ?? "";
      const precision = Number.isInteger(hud.decimals) ? Math.max(0, Math.min(3, hud.decimals)) : 0;
      return `${this._fmt(value,precision)} <small>${this._esc(rawUnit)}</small>`;
    }
    if (key === "dsl" && hud.type === "tunnels") {
      const part = (text,id) => {
        const state = this._entity(id)?.state;
        const flag = state === "on" ? "on" : state === "off" ? "off" : "unknown";
        const value = flag === "on" ? "AN" : flag === "off" ? "AUS" : "—";
        return `<span class="fsn-hud-${flag}">${text} ${value}</span>`;
      };
      return `<span class="fsn-tunnel-readout">${part("LTE",hud.lte)} · ${part("HYB",hud.hybrid)}</span>`;
    }
    return null;
  }

  _seriesKeyIds(){const e=this.config.entities||{},h=this.config.huds||{};
    return {download:e.download,upload:e.upload,
      dsl:h.dsl?.type==="tunnels" ? null : h.dsl?.type==="sensor" ? h.dsl.entity : e.dsl_down,
      cpu:h.cpu?.type==="sensor" ? h.cpu.entity : e.cpu_temp,
      uptime:h.uptime?.type==="sensor" ? h.uptime.entity : null,
      sent:e.sent,received:e.received,clients:e.clients};}
  _addPoint(key,value,time=Date.now()){
    if(value===null||!Number.isFinite(value))return;
    const points=this._series[key]||[];
    if(!points.length||points[points.length-1].time!==time)points.push({time,value});
    this._series[key]=points.filter(p=>p.time>=Date.now()-3600000).slice(-150);
  }
  async _loadHistory(){
    this._historyLoaded=true;
    if(!this._hass?.callWS)return;
    const ids=Object.values(this._seriesKeyIds()).filter(Boolean);
    if(!ids.length)return;
    try{
      const now=new Date(),before=new Date(now.getTime()-3600000);
      const all=await this._hass.callWS({type:"history/history_during_period",start_time:before.toISOString(),end_time:now.toISOString(),entity_ids:ids,include_start_time_state:true,significant_changes_only:false,minimal_response:true});
      if(!Array.isArray(all))return;
      const reverse=Object.fromEntries(Object.entries(this._seriesKeyIds()).filter(([,v])=>v).map(([k,v])=>[v,k]));
      for(const row of all){if(!Array.isArray(row))continue;
        for(const obj of row){const k=reverse[obj.entity_id];if(!k)continue;
          const n=Number(obj.state),t=Date.parse(obj.last_changed||obj.last_updated);
          if(Number.isFinite(n)&&Number.isFinite(t))this._addPoint(k,n,t);
        }
      }
      this._updateSparklines();
    }catch(err){console.info("Frankys Network: optionaler Verlauf nicht verfügbar",err);}
  }
  _updateSparklines(){
    const keys=this._seriesKeyIds();
    for(const [k,id] of Object.entries(keys)){
      if(!this.config.public_mode)this._addPoint(k,this._num(id));
      const line=this._root.querySelector(`[data-chart="${k}"] polyline`);
      if(!line)continue;
      let values=(this._series[k]||[]).map(p=>p.value);
      if(this.config.public_mode)values=Array.from({length:36},(_,i)=>36+9*Math.sin(i*.74+(k.length*.8))+4*Math.sin(i*2.1+k.length));
      if(values.length<2){line.setAttribute("points","");continue;}
      const lo=Math.min(...values),hi=Math.max(...values),span=Math.max(.0001,hi-lo);
      line.setAttribute("points",values.map((v,i)=>`${(i*100/(values.length-1)).toFixed(1)},${(23-(v-lo)/span*21).toFixed(1)}`).join(" "));
    }
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

    const router = !this.config.public_mode && item.kind === "router";
    const status = this.config.public_mode ? "online" : this._nodeConnectionStatus(item,node);
    const title = this._root.querySelector("[data-dialog-title]");
    const model = this._root.querySelector("[data-dialog-model]");
    const grid = this._root.querySelector("[data-dialog-grid]");
    const dot = this._root.querySelector("[data-dialog-dot]");
    const kicker = this._root.querySelector(".fsn-dialog-kicker");
    if(title) title.textContent = item.label || `Node ${index+1}`;
    if(model) model.textContent = router ? item.model || "Router"
      : node?.model || item.model || (item.client_name || item.client_ip ? (item.kind === "access_point" ? "Access Point" : item.kind === "device" ? "Netzwerkgerät" : "WLAN-Verstärker") : item.entity ? "Netzwerkgerät" : "Keine Datenquelle zugeordnet");
    if(kicker) kicker.textContent = router ? "ROUTER DETAILS" : item.kind === "device" ? "NETZWERKGERÄT" : "NETWORK NODE";
    if(dot) dot.style.background = status==="online" ? "#55ef78" : status==="offline" ? "#ff536d" : "#ffc158";

    const onlineLabel = status==="online" ? "Online" : status==="offline" ? "Offline" : "Unbekannt";
    const routerStatus = this._entity(item.entity)?.state;
    const rate = (k) => {
      const id=this.config.entities?.[k];
      const mbps=this._rateMbit(this._num(id),id,this.config.throughput_unit,"kB/s");
      return mbps == null ? "—" : `${this._fmt(mbps,2)} Mbit/s`;
    };
    const totalClients = this._num(item.clients_entity || this.config.entities?.clients);
    const connectedClients = Array.isArray(node?.clients) ? node.clients.filter(x=>x?.connection_state==="CONNECTED").length : null;
    const trackedClient = !router && !this.config.public_mode && !!(item.client_name || item.client_ip) && !node;
    const isRepeater = trackedClient && item.kind !== "device" && item.kind !== "access_point";
    const clientData = trackedClient ? this._speedportClientForItem(item) : null;
    const rows = router ? [
      ["Routerstatus",routerStatus && !["unknown","unavailable"].includes(routerStatus) ? routerStatus : onlineLabel],
      ["Anschluss",item.connection_label || "—"],
      ["Download",rate("download")],
      ["Upload",rate("upload")],
      ["Clients",totalClients==null ? "—" : this._fmt(totalClients,0)],
      ["Firmware",item.firmware || "—"]
    ] : trackedClient ? [
      ["Status",onlineLabel],
      ["Gerätetyp",item.connection_label || (isRepeater ? "WLAN-Verstärker" : item.kind === "access_point" ? "Access Point" : "Netzwerkgerät")],
      ["IPv4-Adresse",clientData?.ip || item.client_ip || "—"],
      ["MAC-Adresse",clientData?.mac || "—"],
      ["Erkennung",clientData ? "Speedport-Geräteliste" : item.client_ip ? "Nur IP konfiguriert" : "Nicht in aktueller Liste"],
      [isRepeater ? "Firmware" : "Gerätename",isRepeater ? (item.firmware || "—") : (clientData?.name || item.client_name || item.label || "—")]
    ] : [
      ["Status",onlineLabel],
      ["Verbindung",node?.parent_link_type || item.connection_label || "—"],
      ["Link RX",this._rateText(node?.parent_cur_rx_kbps)],
      ["Link TX",this._rateText(node?.parent_cur_tx_kbps)],
      ["Clients",connectedClients==null ? "—" : String(connectedClients)],
      ["Firmware",node?.firmware || item.firmware || "—"]
    ];

    if (trackedClient && item.kind === "access_point") {
      if (item.firmware) rows.push(["Firmware (manuell)",item.firmware]);
      if (item.ssid) rows.push(["WLAN-SSID (manuell)",item.ssid]);
      if (item.mode) rows.push(["Betriebsart (manuell)",item.mode]);
    }

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

    const section = this._root.querySelector("[data-dialog-clients]");
    const host = this._root.querySelector("[data-dialog-client-list]");
    const heading = this._root.querySelector("[data-dialog-client-heading]");
    if (section && host) {
      section.hidden = true;
      host.replaceChildren();
      let names = [];
      if (router) {
        const devices = this._entity(this.config.entities?.clients)?.attributes?.devices;
        if (Array.isArray(devices)) names = devices.map(d => String(d?.name || "").trim()).filter(Boolean);
        const total = this._num(this.config.entities?.clients);
        if (heading) heading.textContent = `SPEEDPORT-CLIENTS: ${new Set(names).size} Namen${total != null ? " / " + this._fmt(total,0) + " gesamt" : ""}`;
        section.hidden = false;
      } else if (!this.config.public_mode && Array.isArray(node?.clients)) {
        names = node.clients.filter(d => d?.connection_state === "CONNECTED")
          .map(d => String(d?.name || d?.ha_entity_id || "").trim()).filter(Boolean);
        if (heading) heading.textContent = `CLIENTS AN DIESEM KNOTEN (${new Set(names).size})`;
        section.hidden = false;
      } else if (!this.config.public_mode && item.client_name && item.kind !== "device" && item.kind !== "access_point") {
        if (heading) heading.textContent = "CLIENTS AN DIESEM VERSTÄRKER";
        const notice = document.createElement("div");
        notice.textContent = "Speedport liefert keine Zuordnung der Clients zu diesem Verstärker.";
        host.appendChild(notice);
        section.hidden = false;
      }
      if (!section.hidden && host.children.length === 0) {
        const unique = [...new Set(names)].sort((a,b) => a.localeCompare(b,undefined,{sensitivity:"base"}));
        for (const name of unique.slice(0,100)) {
          const row = document.createElement("div");
          row.textContent = name;
          row.title = name;
          host.appendChild(row);
        }
        if (!unique.length) {
          const empty = document.createElement("div");
          empty.textContent = "Keine einzelnen Client-Namen verfügbar";
          host.appendChild(empty);
        }
      }
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
      set("sent",'103,1 <small>GB</small>');
      set("received",'1,11 <small>TB</small>');
      set("clients",'18');
    } else {
      const downRaw = this._num(e.download);
      const upRaw = this._num(e.upload);
      set("download", `${this._fmt(this._rateMbit(downRaw,e.download,this.config.throughput_unit,"kB/s"), 2)} <small>Mbit/s</small>`);
      set("upload", `${this._fmt(this._rateMbit(upRaw,e.upload,this.config.throughput_unit,"kB/s"), 2)} <small>Mbit/s</small>`);

      const dslDown = this._num(e.dsl_down);
      const dslUp = this._num(e.dsl_up);
      set("dsl", `${this._fmt(this._rateMbit(dslDown,e.dsl_down,this.config.dsl_unit,"kbit/s"),1)} / ${this._fmt(this._rateMbit(dslUp,e.dsl_up,this.config.dsl_unit,"kbit/s"),1)} <small>Mbit/s</small>`);

      set("cpu", `${this._fmt(this._num(e.cpu_temp),0)} <small>°C</small>`);

      const uptime = this._uptimeDays(this._entity(e.uptime)?.state);
      set("uptime", `${uptime == null ? "—" : uptime} <small>Tage</small>`);
      set("sent",this._volumeText(this._volumeGB(this._num(e.sent),e.sent)));
      set("received",this._volumeText(this._volumeGB(this._num(e.received),e.received)));
      set("clients", this._fmt(this._num(e.clients),0));
      for (const key of ["dsl","cpu","uptime"]) {
        const override = this._hudOverrideHtml(key);
        if (override !== null) set(key,override);
      }
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

    const connectionStatus = this.config.public_mode ? "online" : this._mappedStatus(e.connection);
    const status = this._root.querySelector(".fsn-status");
    const online = this._root.querySelector("[data-online]");
    status?.classList.toggle("online", connectionStatus === "online");
    status?.classList.toggle("offline", connectionStatus === "offline");
    if (online) {
      const routerMode = !this.config.public_mode && this.config.status_mode === "router";
      online.textContent = routerMode
        ? connectionStatus === "online" ? "Router OK" : connectionStatus === "offline" ? "Router prüfen" : "Routerstatus unbekannt"
        : connectionStatus === "online" ? "Alle Systeme online" : connectionStatus === "offline" ? "Verbindung prüfen" : "Systemstatus";
    }

    this._updateClientList();
    this._updateSparklines();

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
      const tracked=this._entity(item.entity)?.state;
      const nodeStatus = this._nodeConnectionStatus(item,node);
      card.classList.toggle("online", nodeStatus === "online");
      card.classList.toggle("offline", nodeStatus === "offline");

      const rx = Number(node?.parent_cur_rx_kbps) || 0;
      const tx = Number(node?.parent_cur_tx_kbps) || 0;
      const positive = [rx, tx].filter((n) => n > 0);
      const rate = positive.length ? Math.min(...positive) / 1000 : 0;
      const type = node?.parent_link_type || "—";
      if(meta) meta.textContent = node ? `${type} · ${rate>0 ? this._fmt(rate,0)+" Mbit/s" : nodeStatus==="online" ? "verbunden" : "offline"}`
        : item.client_name || item.client_ip ? (nodeStatus==="online" ? "In Speedport-Clientliste" : item.client_ip ? "IP manuell · nicht bestätigt" : "Nicht in aktueller Clientliste")
        : !item.entity ? "Keine Datenquelle" : item.kind==="router"
          ? (nodeStatus==="online" ? "Router · OK" : nodeStatus==="offline" ? "Routerstatus prüfen" : "Routerstatus unbekannt")
          : nodeStatus==="online" ? "Verbunden" : nodeStatus==="offline" ? "Offline" : "Status unbekannt";
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