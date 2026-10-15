// Partes interativas: maquetes de site e de sistema, simulador, formulário de orçamento e botão de WhatsApp.
import { esc, waLink, statusPill, assetUrl, safeUrl } from "./common.js";
import { t, curLang, pick, tData } from "./i18n.js";

const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const en = () => curLang() === "en";

/* ---------- dados do simulador (pt / en) ---------- */
const SEG = {
  padaria: {
    label: ["Padaria ou confeitaria", "Bakery or café"], company: "Padaria Bom Grão",
    modules: ["Vendas / PDV", "Estoque", "Financeiro", "Nota fiscal"],
    kpis: [[["Vendas hoje", "Sales today"], ["R$ 4.812,90", "$ 4,812.90"]], [["Cupons", "Receipts"], ["312", "312"]], [["Ticket médio", "Avg. ticket"], ["R$ 15,42", "$ 15.42"]]],
    rows: [[["Pão francês 2 kg", "Bread rolls 2 kg"], ["R$ 38,00", "$ 38.00"]], [["Bolo de cenoura", "Carrot cake"], ["R$ 42,90", "$ 42.90"]], [["Café + pão na chapa", "Coffee + toast"], ["R$ 12,50", "$ 12.50"]], [["Encomenda: salgados 200 un", "Order: 200 savory snacks"], ["R$ 180,00", "$ 180.00"]]],
    bars: [30, 55, 90, 70, 45, 65, 85], tag: [["NFC-e emitida", "Receipt issued"], ["Estoque baixo: farinha", "Low stock: flour"]],
  },
  loja: {
    label: ["Loja ou varejo", "Store or retail"], company: "Casa & Obra Materiais",
    modules: ["Vendas / PDV", "Estoque", "Clientes", "Nota fiscal", "Relatórios"],
    kpis: [[["Vendas hoje", "Sales today"], ["R$ 12.390,00", "$ 12,390.00"]], [["Pedidos", "Orders"], ["47", "47"]], [["Ticket médio", "Avg. ticket"], ["R$ 263,62", "$ 263.62"]]],
    rows: [[["Cimento CP-II 50 kg ×20", "Cement 50 kg ×20"], ["R$ 780,00", "$ 780.00"]], [["Torneira monocomando", "Single-lever faucet"], ["R$ 219,90", "$ 219.90"]], [["Tinta acrílica 18 L", "Acrylic paint 18 L"], ["R$ 389,00", "$ 389.00"]], [["Kit ferramentas", "Tool kit"], ["R$ 149,00", "$ 149.00"]]],
    bars: [40, 62, 58, 80, 95, 70, 50], tag: [["Pedido #1043 faturado", "Order #1043 invoiced"], ["Reposição sugerida: 6 itens", "Restock suggested: 6 items"]],
  },
  clinica: {
    label: ["Clínica ou consultório", "Clinic or practice"], company: "Clínica Vida Plena",
    modules: ["Agenda", "Clientes", "Financeiro", "Relatórios"],
    kpis: [[["Consultas hoje", "Appointments today"], ["28", "28"]], [["Confirmadas", "Confirmed"], ["24", "24"]], [["Faturamento", "Revenue"], ["R$ 6.720", "$ 6,720"]]],
    rows: [[["09:00 · Ana Souza", "09:00 · Ana Souza"], ["Confirmada", "Confirmed"]], [["09:40 · Carlos Lima", "09:40 · Carlos Lima"], ["Confirmada", "Confirmed"]], [["10:20 · Beatriz Rocha", "10:20 · Beatriz Rocha"], ["Aguardando", "Pending"]], [["11:00 · João Pedro", "11:00 · João Pedro"], ["Confirmada", "Confirmed"]]],
    bars: [60, 75, 80, 50, 90, 85, 40], tag: [["Lembrete enviado no WhatsApp", "WhatsApp reminder sent"], ["3 horários livres amanhã", "3 open slots tomorrow"]],
  },
  oficina: {
    label: ["Oficina ou assistência", "Repair shop"], company: "Auto Center Prime",
    modules: ["Ordens de serviço", "Estoque", "Clientes", "Financeiro"],
    kpis: [[["OS abertas", "Open work orders"], ["14", "14"]], [["Concluídas hoje", "Done today"], ["6", "6"]], [["Faturamento", "Revenue"], ["R$ 9.180", "$ 9,180"]]],
    rows: [[["OS 2291 · Troca de embreagem", "WO 2291 · Clutch replacement"], ["Em execução", "In progress"]], [["OS 2290 · Revisão 40 mil km", "WO 2290 · 25k-mile service"], ["Pronta", "Ready"]], [["OS 2288 · Alinhamento", "WO 2288 · Wheel alignment"], ["Pronta", "Ready"]], [["OS 2287 · Freios dianteiros", "WO 2287 · Front brakes"], ["Aguardando peça", "Waiting for part"]]],
    bars: [35, 50, 65, 60, 75, 90, 55], tag: [["Orçamento aprovado pelo cliente", "Estimate approved by customer"], ["Peça chegou: pastilha Bosch", "Part arrived: brake pads"]],
  },
  restaurante: {
    label: ["Restaurante ou delivery", "Restaurant or delivery"], company: "Cantina da Orla",
    modules: ["Vendas / PDV", "Delivery", "Estoque", "Financeiro"],
    kpis: [[["Pedidos hoje", "Orders today"], ["186", "186"]], [["Delivery", "Delivery"], ["74", "74"]], [["Ticket médio", "Avg. ticket"], ["R$ 48,90", "$ 48.90"]]],
    rows: [[["Mesa 12 · 4 pessoas", "Table 12 · 4 guests"], ["R$ 236,00", "$ 236.00"]], [["Delivery #881 · Jardim", "Delivery #881 · Downtown"], ["Saiu", "Out"]], [["Balcão · 2 pratos do dia", "Counter · 2 daily specials"], ["R$ 59,80", "$ 59.80"]], [["Delivery #882 · Centro", "Delivery #882 · Beach"], ["Preparando", "Preparing"]]],
    bars: [20, 35, 85, 95, 40, 70, 90], tag: [["Novo pedido no delivery", "New delivery order"], ["Cozinha: 6 pedidos na fila", "Kitchen: 6 orders queued"]],
  },
};
const MODULES = {
  "Vendas / PDV": "Sales / POS", "Estoque": "Inventory", "Financeiro": "Finance", "Clientes": "Customers", "Agenda": "Scheduling",
  "Ordens de serviço": "Work orders", "Delivery": "Delivery", "Nota fiscal": "Invoicing", "Relatórios": "Reports", "App para celular": "Mobile app",
};
export const ALL_MODULES = Object.keys(MODULES);
const modName = (m) => (en() ? MODULES[m] || m : m);
const pickL = ([pt, eng]) => (en() ? eng : pt);


/* ---------- dados da prévia de site (pt / en) ---------- */
const SECTIONS = {
  "Serviços": "Services", "Cardápio / produtos": "Menu / products", "Galeria de fotos": "Photo gallery", "Agendamento online": "Online booking",
  "Loja virtual": "Online store", "Avaliações": "Reviews", "Mapa e horário": "Map and hours", "Botão de WhatsApp": "WhatsApp button",
};
export const ALL_SECTIONS = Object.keys(SECTIONS);
const secName = (x) => (en() ? SECTIONS[x] || x : x);
const COLORS = [["#1d4ed8", "Azul", "Blue"], ["#0f766e", "Verde", "Green"], ["#b4232c", "Vermelho", "Red"], ["#7c3aed", "Roxo", "Purple"], ["#c2410c", "Laranja", "Orange"]];
const SITE = {
  padaria: {
    kicker: ["Padaria artesanal", "Artisan bakery"], tagline: ["Pão quentinho saindo do forno o dia todo", "Fresh bread out of the oven all day"],
    cta: ["Encomendar pelo WhatsApp", "Order on WhatsApp"], color: "#c2410c",
    items: [[["Pães artesanais", "Artisan bread"], ["R$ 14,90", "$ 14.90"]], [["Bolos e tortas", "Cakes and pies"], ["R$ 42,90", "$ 42.90"]], [["Salgados para festa", "Party snacks"], ["R$ 90,00", "$ 90.00"]]],
    sections: ["Cardápio / produtos", "Galeria de fotos", "Mapa e horário", "Botão de WhatsApp"],
    tags: [["Encomenda recebida pelo WhatsApp", "Order received on WhatsApp"], ["Cliente chegou pelo Google", "Visitor found you on Google"]],
  },
  loja: {
    kicker: ["Materiais de construção", "Building supplies"], tagline: ["Tudo para a sua obra, com entrega no mesmo dia", "Everything for your build, delivered same day"],
    cta: ["Ver produtos", "Browse products"], color: "#1d4ed8",
    items: [[["Cimento CP-II 50 kg", "Cement 50 kg"], ["R$ 39,00", "$ 39.00"]], [["Tinta acrílica 18 L", "Acrylic paint 18 L"], ["R$ 389,00", "$ 389.00"]], [["Kit ferramentas", "Tool kit"], ["R$ 149,00", "$ 149.00"]]],
    sections: ["Loja virtual", "Serviços", "Mapa e horário", "Botão de WhatsApp"],
    tags: [["Pedido online pago no Pix", "Online order paid"], ["Orçamento pedido pelo site", "Quote requested on the site"]],
  },
  clinica: {
    kicker: ["Clínica médica e odontológica", "Medical and dental clinic"], tagline: ["Cuidado completo para toda a família", "Complete care for the whole family"],
    cta: ["Agendar consulta", "Book an appointment"], color: "#0f766e",
    items: [[["Clínico geral", "General practice"], ["Seg a sex", "Mon to Fri"]], [["Odontologia", "Dentistry"], ["Seg a sáb", "Mon to Sat"]], [["Pediatria", "Pediatrics"], ["Ter e qui", "Tue and Thu"]]],
    sections: ["Serviços", "Agendamento online", "Avaliações", "Botão de WhatsApp"],
    tags: [["Nova consulta agendada", "New appointment booked"], ["Paciente chegou pelo Google", "Patient found you on Google"]],
  },
  oficina: {
    kicker: ["Mecânica e funilaria", "Auto repair"], tagline: ["Seu carro revisado com orçamento na hora", "Your car serviced, with an instant estimate"],
    cta: ["Pedir orçamento", "Get an estimate"], color: "#b4232c",
    items: [[["Revisão completa", "Full service"], ["a partir de R$ 290", "from $ 290"]], [["Freios e suspensão", "Brakes and suspension"], ["Orçamento grátis", "Free estimate"]], [["Alinhamento", "Wheel alignment"], ["R$ 80,00", "$ 80.00"]]],
    sections: ["Serviços", "Galeria de fotos", "Avaliações", "Botão de WhatsApp"],
    tags: [["Orçamento pedido pelo WhatsApp", "Estimate requested on WhatsApp"], ["Visita vinda do Google Maps", "Visitor from Google Maps"]],
  },
  restaurante: {
    kicker: ["Restaurante à beira-mar", "Seaside restaurant"], tagline: ["Frutos do mar frescos, no salão ou em casa", "Fresh seafood, dine in or delivered"],
    cta: ["Ver cardápio", "See the menu"], color: "#7c3aed",
    items: [[["Moqueca para dois", "Fish stew for two"], ["R$ 118,00", "$ 118.00"]], [["Camarão na moranga", "Shrimp in pumpkin"], ["R$ 96,00", "$ 96.00"]], [["Prato do dia", "Daily special"], ["R$ 34,90", "$ 34.90"]]],
    sections: ["Cardápio / produtos", "Galeria de fotos", "Mapa e horário", "Botão de WhatsApp"],
    tags: [["Reserva feita pelo site", "Table booked on the site"], ["Pedido de delivery no WhatsApp", "Delivery order on WhatsApp"]],
  },
};
const slug = (n) => n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");

function sectionBlock(name, d) {
  const items = d.items;
  const title = `<h5>${esc(secName(name))}</h5>`;
  switch (name) {
    case "Serviços":
      return `<div class="sm-sec">${title}<div class="sm-cards">${items.map(([a]) => `<div><i></i><span>${esc(pickL(a))}</span></div>`).join("")}</div></div>`;
    case "Cardápio / produtos":
      return `<div class="sm-sec">${title}${items.map(([a, b]) => `<div class="sm-row"><span>${esc(pickL(a))}</span><b>${esc(pickL(b))}</b></div>`).join("")}</div>`;
    case "Loja virtual":
      return `<div class="sm-sec">${title}<div class="sm-cards">${items.map(([a, b]) => `<div><i></i><span>${esc(pickL(a))}</span><b>${esc(pickL(b))}</b><em>${en() ? "Buy" : "Comprar"}</em></div>`).join("")}</div></div>`;
    case "Galeria de fotos":
      return `<div class="sm-sec">${title}<div class="sm-gallery"><i></i><i></i><i></i><i></i></div></div>`;
    case "Agendamento online": {
      const slots = ["09:00", "10:30", "14:00", "15:30"];
      return `<div class="sm-sec">${title}<div class="sm-slots">${slots.map((h, i) => `<span class="${i === 1 ? "on" : ""}">${h}</span>`).join("")}</div></div>`;
    }
    case "Avaliações":
      return `<div class="sm-sec">${title}<div class="sm-stars">★★★★★ <small>4,9 · Google</small></div><div class="sm-lines"><i></i><i></i></div></div>`;
    case "Mapa e horário":
      return `<div class="sm-sec">${title}<div class="sm-map"><i></i></div><small class="sm-hours">${en() ? "Mon–Sat · 8am–8pm" : "Seg a sáb · 8h às 20h"}</small></div>`;
    default:
      return "";
  }
}

/* ---------- maquete de site ---------- */
export function siteMockHTML(seg, company, sections, color) {
  const d = SITE[seg] || SITE.padaria;
  const s = SEG[seg] || SEG.padaria;
  const name = company?.trim() || s.company;
  const secs = sections || d.sections;
  const blocks = secs.filter((x) => x !== "Botão de WhatsApp").slice(0, 4);
  const nav = blocks.slice(0, 3).map((x) => secName(x).split(" ")[0]);
  return `
  <div class="mock site-mock" aria-hidden="true" style="--sc:${esc(color || d.color)}">
    <div class="mock-bar"><i></i><i></i><i></i><span class="mock-url">${esc(slug(name))}.com.br</span></div>
    <div class="sm-nav"><b>${esc(name)}</b><span>${en() ? "Home" : "Início"}</span>${nav.map((n) => `<span>${esc(n)}</span>`).join("")}</div>
    <div class="sm-hero">
      <div><small>${esc(pickL(d.kicker))}</small><h4>${esc(pickL(d.tagline))}</h4><span class="sm-btn">${esc(pickL(d.cta))}</span></div>
      <div class="sm-img"><i></i><i></i></div>
    </div>
    <div class="sm-body">${blocks.length ? blocks.map((b) => sectionBlock(b, d)).join("") : `<div class="sm-sec"><div class="sm-lines"><i></i><i></i><i></i></div></div>`}</div>
    ${secs.includes("Botão de WhatsApp") ? `<span class="sm-wa">WhatsApp</span>` : ""}
    <div class="mock-tag t1" data-tag>${esc(pickL(d.tags[0]))}</div>
    <div class="mock-tag t2">${esc(pickL(d.tags[1]))}</div>
  </div>`;
}

/* ---------- maquete de sistema ---------- */
export function mockHTML(seg, company, modules) {
  const s = SEG[seg] || SEG.padaria;
  const name = company?.trim() || s.company;
  const mods = modules?.length ? modules : s.modules;
  const max = Math.max(...s.bars);
  const days = en() ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
  return `
  <div class="mock" aria-hidden="true">
    <div class="mock-bar"><i></i><i></i><i></i><span class="mock-url">${esc(name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, ""))}.app/${en() ? "dashboard" : "painel"}</span></div>
    <div class="mock-body">
      <aside class="mock-side">
        <b>${esc(name)}</b>
        <span class="on">${t("home")}</span>
        ${mods.slice(0, 7).map((m) => `<span>${esc(modName(m))}</span>`).join("")}
      </aside>
      <div class="mock-main">
        <div class="mock-kpis">${s.kpis.map(([k, v]) => `<div><small>${esc(pickL(k))}</small><b>${esc(pickL(v))}</b></div>`).join("")}</div>
        <div class="mock-chart">${s.bars.map((b, i) => `<span style="height:${Math.round((b / max) * 100)}%" title="${days[i]}"></span>`).join("")}</div>
        <div class="mock-rows" data-rows>${s.rows.map(([a, b]) => `<div><span>${esc(pickL(a))}</span><b>${esc(pickL(b))}</b></div>`).join("")}</div>
      </div>
    </div>
    <div class="mock-tag t1">${esc(pickL(s.tag[0]))}</div>
    <div class="mock-tag t2">${esc(pickL(s.tag[1]))}</div>
  </div>`;
}

/* ---------- vitrine do topo: os projetos reais cadastrados no painel ---------- */
// cor de cada projeto: sempre a mesma para o mesmo projeto, dentro de uma paleta escolhida
const HUES = [222, 262, 192, 338, 158, 12, 284, 205];
const hueOf = (str = "") => HUES[[...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % HUES.length];
const hostOf = (p) => { try { return new URL(p.liveUrl).hostname.replace(/^www\./, ""); } catch { return `${p.slug}`.slice(0, 32); } };

function deckCard(p, i, href) {
  const title = pick(p, "title");
  const cover = safeUrl(p.cover) ? assetUrl(p.cover) : "";
  const art = cover
    ? `<img src="${esc(cover)}" alt="${esc(t("cover_alt")(title))}" loading="${i ? "lazy" : "eager"}">`
    : `<div class="dk-art" style="--h:${hueOf(p.slug)}" aria-hidden="true"><i></i><i></i><span>${esc(tData(p.category) || "")}</span><b>${esc(title.replace(/\s*\((exemplo|example)\)\s*$/i, ""))}</b></div>`;
  return `
    <a class="dk-card" href="${href(p.slug)}" data-pos="${i}" ${i ? 'tabindex="-1" aria-hidden="true"' : ""}>
      <div class="dk-bar"><i></i><i></i><i></i><span>${esc(hostOf(p))}</span></div>
      <div class="dk-shot">${art}</div>
      <div class="dk-info">
        <div class="dk-top"><span class="code">${esc(p.code || "")}</span>${statusPill(p.status)}</div>
        <b>${esc(title)}</b>
        <small>${esc([pick(p, "client"), p.year].filter(Boolean).join(" · "))}</small>
        <span class="dk-cta">${t("deck_cta")}</span>
      </div>
    </a>`;
}

export function deckHTML(projects, href) {
  const list = projects.slice(0, 6);
  if (!list.length) return "";
  return `
  <div class="deck" data-deck aria-label="${t("deck_label")}">
    <div class="dk-stack">${list.map((p, i) => deckCard(p, i, href)).join("")}</div>
    <div class="dk-dots">${list.map((_, i) => `<button type="button" data-go="${i}" aria-label="${t("deck_next")} ${i + 1}" ${i ? "" : 'aria-current="true"'}></button>`).join("")}</div>
    <div class="mock-tag t1">${t("deck_tag1")}</div>
    <div class="mock-tag t2">${t("deck_tag2")}</div>
  </div>`;
}

export function mountHeroDeck(el, projects, href) {
  if (!el) return;
  el.innerHTML = deckHTML(projects, href);
  const cards = [...el.querySelectorAll(".dk-card")];
  const dots = [...el.querySelectorAll("[data-go]")];
  if (cards.length < 2) return;
  let front = 0;
  const show = (n) => {
    front = (n + cards.length) % cards.length;
    cards.forEach((c, i) => {
      const pos = (i - front + cards.length) % cards.length;
      c.dataset.pos = pos;
      if (pos) { c.setAttribute("tabindex", "-1"); c.setAttribute("aria-hidden", "true"); } else { c.removeAttribute("tabindex"); c.removeAttribute("aria-hidden"); }
    });
    dots.forEach((d, i) => d.toggleAttribute("aria-current", i === front));
  };
  dots.forEach((d) => d.addEventListener("click", () => { show(+d.dataset.go); restart(); }));
  // cartas de trás passam para a frente ao clicar
  cards.forEach((c, i) => c.addEventListener("click", (e) => { if (c.dataset.pos !== "0") { e.preventDefault(); show(i); restart(); } }));
  let timer;
  const restart = () => { clearInterval(timer); if (!reduceMotion()) timer = setInterval(() => { if (!document.body.contains(el)) return clearInterval(timer); if (!el.matches(":hover")) show(front + 1); }, 4800); };
  restart();
}

/* ---------- simulador: site (padrão) ou sistema ---------- */
export function mountSimulator(el, onQuote) {
  if (!el) return;
  let mode = "site", seg = "padaria", company = "";
  let mods = [...SEG.padaria.modules], secs = [...SITE.padaria.sections], color = SITE.padaria.color;
  el.innerHTML = `
    <div class="sim-tabs" role="tablist" aria-label="${t("sim_tabs_label")}">
      <button type="button" role="tab" data-mode="site" aria-selected="true">${t("sim_tab_site")}</button>
      <button type="button" role="tab" data-mode="system" aria-selected="false">${t("sim_tab_system")}</button>
    </div>
    <form class="sim-controls" data-sim-form>
      <div class="field"><label for="sim-company">${t("sim_company")}</label><input id="sim-company" placeholder="${esc(SEG.padaria.company)}" maxlength="40"></div>
      <div class="field"><label for="sim-seg">${t("sim_segment")}</label><select id="sim-seg">${Object.entries(SEG).map(([k, v]) => `<option value="${k}">${esc(pickL(v.label))}</option>`).join("")}</select></div>
      <fieldset class="field" data-site-only><legend>${t("sim_color")}</legend><div class="swatches" data-colors></div></fieldset>
      <fieldset class="field"><legend data-opts-label></legend><div class="mods" data-mods></div></fieldset>
      <button class="btn primary" type="submit" data-sim-btn></button>
      <p class="hint">${t("sim_hint")}</p>
    </form>
    <div class="sim-view" data-sim-view></div>`;
  const view = el.querySelector("[data-sim-view]");
  const q = (x) => el.querySelector(x);
  const drawColors = () => {
    q("[data-colors]").innerHTML = COLORS.map(([c, pt, eng]) =>
      `<label class="swatch" title="${esc(en() ? eng : pt)}"><input type="radio" name="sim-color" value="${c}" ${c === color ? "checked" : ""} aria-label="${esc(en() ? eng : pt)}"><span style="background:${c}"></span></label>`).join("");
    q("[data-colors]").querySelectorAll("input").forEach((r) => r.addEventListener("change", () => { color = r.value; draw(); }));
  };
  const drawOpts = () => {
    const site = mode === "site";
    const all = site ? ALL_SECTIONS : ALL_MODULES;
    const chosen = site ? secs : mods;
    const label = site ? secName : modName;
    q("[data-opts-label]").textContent = site ? t("sim_sections") : t("sim_modules");
    q("[data-site-only]").hidden = !site;
    q("[data-sim-btn]").textContent = site ? t("site_btn") : t("sim_btn");
    q("[data-mods]").innerHTML = all.map((m, i) =>
      `<label class="mod"><input type="checkbox" id="sim-m${i}" value="${esc(m)}" ${chosen.includes(m) ? "checked" : ""}><span>${esc(label(m))}</span></label>`).join("");
    q("[data-mods]").querySelectorAll("input").forEach((c) => c.addEventListener("change", () => {
      const picked = all.filter((m) => q(`[data-mods] input[value="${CSS.escape(m)}"]`)?.checked);
      if (mode === "site") secs = picked; else mods = picked;
      draw();
    }));
  };
  const draw = () => { view.innerHTML = mode === "site" ? siteMockHTML(seg, company, secs, color) : mockHTML(seg, company, mods); };
  el.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    el.querySelectorAll("[data-mode]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    drawOpts(); draw();
  }));
  q("#sim-company").addEventListener("input", (e) => { company = e.target.value; draw(); });
  q("#sim-seg").addEventListener("change", (e) => {
    seg = e.target.value; mods = [...SEG[seg].modules]; secs = [...SITE[seg].sections]; color = SITE[seg].color;
    q("#sim-company").placeholder = SEG[seg].company;
    drawColors(); drawOpts(); draw();
  });
  q("[data-sim-form]").addEventListener("submit", (e) => {
    e.preventDefault();
    const segLabel = pickL(SEG[seg].label);
    if (mode === "site") onQuote({ type: "Site", company: company.trim(), message: t("site_msg")(segLabel, secs.map(secName).join(", ")) });
    else onQuote({ type: "Sistema de gestão", company: company.trim(), message: t("sim_msg")(segLabel, mods.map(modName).join(", ")) });
  });
  drawColors(); drawOpts(); draw();
}

/* ---------- telefone: Brasil com DDD ou qualquer outro país ---------- */
// [código ISO, DDI, nome pt, nome en, mínimo e máximo de dígitos do número nacional]
const COUNTRIES = [
  ["BR", "55", "Brasil", "Brazil", 10, 11], ["PT", "351", "Portugal", "Portugal", 9, 9], ["US", "1", "Estados Unidos / Canadá", "United States / Canada", 10, 10],
  ["AR", "54", "Argentina", "Argentina", 10, 11], ["UY", "598", "Uruguai", "Uruguay", 8, 8], ["PY", "595", "Paraguai", "Paraguay", 9, 9],
  ["CL", "56", "Chile", "Chile", 9, 9], ["CO", "57", "Colômbia", "Colombia", 10, 10], ["PE", "51", "Peru", "Peru", 9, 9], ["MX", "52", "México", "Mexico", 10, 10],
  ["ES", "34", "Espanha", "Spain", 9, 9], ["FR", "33", "França", "France", 9, 9], ["DE", "49", "Alemanha", "Germany", 6, 13], ["IT", "39", "Itália", "Italy", 6, 11],
  ["GB", "44", "Reino Unido", "United Kingdom", 9, 10], ["IE", "353", "Irlanda", "Ireland", 7, 9], ["NL", "31", "Holanda", "Netherlands", 9, 9], ["CH", "41", "Suíça", "Switzerland", 9, 9],
  ["AO", "244", "Angola", "Angola", 9, 9], ["MZ", "258", "Moçambique", "Mozambique", 8, 9], ["JP", "81", "Japão", "Japan", 9, 10], ["AU", "61", "Austrália", "Australia", 9, 9],
  ["AE", "971", "Emirados Árabes", "United Arab Emirates", 8, 9],
];
// DDDs válidos no Brasil (Anatel)
const DDDS = new Set("11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(" "));
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

function defaultCountry() {
  if (!en()) return "BR";
  const region = (navigator.language || "").split("-")[1]?.toUpperCase();
  return COUNTRIES.some((c) => c[0] === region) ? region : "US";
}
// tira o DDI do começo quando a pessoa digitou o número completo
const national = (d, c) => (d.startsWith(c[1]) && d.length > c[5] ? d.slice(c[1].length) : d);

function phoneError(v, iso) {
  const d = v.replace(/\D/g, "");
  if (!d) return t("e_phone_empty");
  if (iso === "BR") {
    if (d.length < 10) return t("e_phone_short");
    if (d.length > 11) return t("e_phone_long");
    if (!DDDS.has(d.slice(0, 2))) return t("e_ddd")(d.slice(0, 2));
    if (d.length === 11 && d[2] !== "9") return t("e_mobile9");
    return "";
  }
  if (iso === "OTHER") return v.trim().startsWith("+") && d.length >= 8 && d.length <= 15 ? "" : t("e_other");
  const c = COUNTRIES.find((x) => x[0] === iso);
  const n = national(d, c);
  return n.length >= c[4] && n.length <= c[5] ? "" : t("e_intl");
}
function fullPhone(v, iso) {
  const d = v.replace(/\D/g, "");
  if (iso === "OTHER") return "+" + d;
  const c = COUNTRIES.find((x) => x[0] === iso);
  return `+${c[1]} ${national(d, c)}`;
}
function emailError(v) {
  const s = v.trim();
  if (!s) return t("e_email_empty");
  if (!EMAIL_RE.test(s) || s.includes("..")) return t("e_email");
  return "";
}
function maskBR(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

/* ---------- formulário de orçamento ---------- */
const TYPES = ["Site", "Sistema de gestão", "Integração / API", "Outro"];
// converte categorias e serviços (ex.: "API / Integração", "Comércio e PDV") em um dos tipos acima
const toType = (s = "") => (/api|integra/i.test(s) ? "Integração / API" : /sistema|gest|pdv|erp|estoque|dashboard|system|pos\b/i.test(s) ? "Sistema de gestão" : /outro|other/i.test(s) ? "Outro" : "Site");

function formHTML(prefix) {
  const id = (n) => `${prefix}-${n}`;
  const def = defaultCountry();
  const opts = COUNTRIES.map(([iso, ddi, pt, eng]) => `<option value="${iso}" ${iso === def ? "selected" : ""}>${esc(en() ? eng : pt)} (+${ddi})</option>`).join("")
    + `<option value="OTHER">${t("other_country")}</option>`;
  const err = (n) => `<small class="field-error" data-err="${n}" hidden></small>`;
  return `
  <form class="quote form-grid" novalidate data-quote-form>
    <div class="row">
      <div class="field"><label for="${id("name")}">${t("f_name")} *</label><input id="${id("name")}" name="nome" autocomplete="name" required>${err("nome")}</div>
      <div class="field"><label for="${id("company")}">${t("f_company")}</label><input id="${id("company")}" name="empresa" autocomplete="organization"></div>
    </div>
    <div class="field"><label for="${id("email")}">${t("f_email")} *</label><input id="${id("email")}" name="email" type="email" autocomplete="email" required>${err("email")}</div>
    <div class="field">
      <label for="${id("phone")}">${t("f_phone")} *</label>
      <div class="phone-row">
        <select id="${id("country")}" name="pais" aria-label="${t("f_country")}">${opts}</select>
        <input id="${id("phone")}" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel-national" required data-phone>
      </div>
      ${err("whatsapp")}
    </div>
    <fieldset class="field"><legend>${t("f_type")}</legend><div class="types">${TYPES.map((v, i) => `<label class="mod"><input type="radio" name="tipo" id="${id("t" + i)}" value="${v}" ${i === 0 ? "checked" : ""}><span>${t("types")[v]}</span></label>`).join("")}</div></fieldset>
    <div class="field"><label for="${id("msg")}">${t("f_msg")} *</label><textarea id="${id("msg")}" name="mensagem" required placeholder="${t("f_msg_ph")}"></textarea>${err("mensagem")}</div>
    <input type="text" name="_honey" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
    <p class="form-error" data-error hidden></p>
    <div class="btns"><button class="btn primary lg" type="submit" data-send>${t("send")}</button></div>
    <p class="hint">${t("privacy")}</p>
  </form>
  <div class="sent" data-sent hidden>
    <div class="sent-mark">✓</div>
    <h3>${t("sent_title")}</h3>
    <p>${t("sent_text")}</p>
    <div class="btns"><a class="btn" data-wa-after target="_blank" rel="noopener">${t("sent_wa")}</a><button class="btn" type="button" data-again>${t("sent_again")}</button></div>
  </div>`;
}

function bindForm(root, profile) {
  const form = root.querySelector("[data-quote-form]");
  const err = root.querySelector("[data-error]");
  const phone = form.querySelector("[data-phone]");
  const country = form.querySelector('[name="pais"]');

  const checks = {
    nome: (v) => (v.trim().length < 2 ? t("e_name") : ""),
    email: emailError,
    whatsapp: (v) => phoneError(v, country.value),
    mensagem: (v) => (v.trim().length < 10 ? t("e_msg") : ""),
  };
  const setErr = (name, msg) => {
    const input = form.querySelector(`[name="${name}"]`);
    const out = form.querySelector(`[data-err="${name}"]`);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    out.textContent = msg; out.hidden = !msg;
  };
  const syncPhone = () => {
    const iso = country.value;
    phone.placeholder = iso === "BR" ? t("phone_ph_br") : iso === "OTHER" ? t("phone_ph_other") : t("phone_ph_intl");
    if (iso === "BR") phone.value = maskBR(phone.value);
  };
  phone.addEventListener("input", () => {
    phone.value = country.value === "BR" ? maskBR(phone.value) : phone.value.replace(/[^\d\s()+-]/g, "");
  });
  country.addEventListener("change", () => { syncPhone(); if (phone.value) setErr("whatsapp", checks.whatsapp(phone.value)); });
  syncPhone();

  // valida ao sair do campo e atualiza o erro enquanto a pessoa corrige
  Object.keys(checks).forEach((name) => {
    const input = form.querySelector(`[name="${name}"]`);
    input.addEventListener("blur", () => { if (input.value) setErr(name, checks[name](input.value)); });
    input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") setErr(name, checks[name](input.value)); });
  });
  root.querySelector("[data-again]").addEventListener("click", () => {
    form.reset(); country.value = defaultCountry(); syncPhone();
    form.querySelectorAll("[data-err]").forEach((e) => (e.hidden = true));
    form.querySelectorAll("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid"));
    form.hidden = false; root.querySelector("[data-sent]").hidden = true;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.hidden = true;
    const data = Object.fromEntries(new FormData(form));
    let first = null;
    for (const [name, check] of Object.entries(checks)) {
      const msg = check(data[name] || "");
      setErr(name, msg);
      if (msg && !first) first = name;
    }
    if (first) { form.querySelector(`[name="${first}"]`).focus(); return; }
    if (data._honey) return; // robô

    const btn = form.querySelector("[data-send]");
    btn.disabled = true; btn.textContent = t("sending");
    try {
      const c = COUNTRIES.find((x) => x[0] === data.pais);
      const nome = data.nome.trim(), empresa = data.empresa.trim(), email = data.email.trim();
      const payload = {
        nome, empresa, email, whatsapp: fullPhone(data.whatsapp, data.pais), pais: c ? c[2] : "Outro país",
        tipo: data.tipo, mensagem: data.mensagem.trim(), idioma: en() ? "inglês" : "português",
        _subject: `${en() ? "[EN] " : ""}Novo pedido de orçamento: ${nome}${empresa ? " (" + empresa + ")" : ""}`,
        _replyto: email, _template: "table", _captcha: "false",
      };
      if (profile.formEndpoint) {
        const res = await fetch(profile.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || out.success === "false" || out.success === false) throw new Error(out.message || "falha no envio");
      } else {
        await new Promise((r) => setTimeout(r, 700)); // prévia: envio simulado
      }
      form.hidden = true;
      const sent = root.querySelector("[data-sent]");
      sent.hidden = false;
      sent.querySelector("[data-wa-after]").href = waLink(profile, t("sent_wa_msg")(nome));
    } catch {
      err.innerHTML = `${t("send_fail")} <a href="${waLink(profile)}" target="_blank" rel="noopener">${t("send_fail_link")}</a>.`;
      err.hidden = false;
    } finally { btn.disabled = false; btn.textContent = t("send"); }
  });

  // pré-preenchimento vindo de botões e do simulador
  return ({ type, company, message } = {}) => {
    form.hidden = false; root.querySelector("[data-sent]").hidden = true; err.hidden = true;
    if (type) { const r = [...form.querySelectorAll('input[name="tipo"]')].find((x) => x.value === toType(type)); if (r) r.checked = true; }
    if (company) form.querySelector('[name="empresa"]').value = company;
    if (message) form.querySelector('[name="mensagem"]').value = message;
  };
}

// formulário fixo na seção de contato
export function mountInlineForm(profile, el) {
  if (!el) return;
  el.innerHTML = formHTML("c");
  bindForm(el, profile);
}

let openQuoteFn = null; // um único listener global, mesmo se o formulário for montado de novo
export function mountQuote(profile, inlineEl) {
  document.querySelector(".modal")?.remove();
  const dlg = document.createElement("div");
  dlg.className = "modal"; dlg.hidden = true;
  dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-labelledby", "q-title");
  dlg.innerHTML = `<div class="modal-card"><button class="modal-x" type="button" aria-label="${t("close")}" data-close>×</button><div class="label">${t("modal_label")}</div><h2 id="q-title">${t("modal_title")}</h2>${formHTML("m")}</div>`;
  document.body.appendChild(dlg);
  const fillModal = bindForm(dlg, profile);
  const close = () => { dlg.hidden = true; document.documentElement.classList.remove("lock"); };
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) close(); });
  dlg.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  const open = (prefill) => {
    fillModal(prefill);
    dlg.hidden = false; document.documentElement.classList.add("lock");
    setTimeout(() => dlg.querySelector("input[name=nome]").focus(), 30);
  };
  mountInlineForm(profile, inlineEl);

  if (!openQuoteFn) {
    // qualquer botão com data-quote abre a janela
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-quote]");
      if (!b) return;
      e.preventDefault();
      const ref = b.dataset.quoteRef;
      openQuoteFn({ type: b.dataset.quote || undefined, message: ref ? t("from_project")(ref) : "" });
    });
  }
  openQuoteFn = open;
  return open;
}

/* ---------- botão flutuante de WhatsApp ---------- */
export function mountWhatsApp(profile) {
  if (!profile.whatsapp) return;
  document.querySelector(".fab")?.remove();
  const box = document.createElement("div");
  box.className = "fab";
  box.innerHTML = `
    <div class="fab-panel" hidden data-panel>
      <b>${t("fab_title")}</b>
      <p>${t("fab_text")}</p>
      <a class="btn primary" href="${waLink(profile)}" target="_blank" rel="noopener">${t("fab_wa")}</a>
      <button class="btn" type="button" data-quote>${t("fab_form")}</button>
      <span class="label" style="margin-top:4px">${esc(profile.phoneDisplay || "")}</span>
    </div>
    <button class="fab-btn" type="button" aria-label="${t("fab_open")}" aria-expanded="false" data-toggle>
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.66 15l-1.3 4.76 4.88-1.28A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-2.9.76.78-2.83-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.13-.16.24-.63.8-.78.96-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.44.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.85 2.03c0 1.2.87 2.36 1 2.52.12.16 1.72 2.62 4.16 3.68 1.55.67 2.15.73 2.93.61.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.15-1.17-.06-.1-.22-.16-.47-.28Z"/></svg>
    </button>`;
  document.body.appendChild(box);
  const panel = box.querySelector("[data-panel]");
  const tg = box.querySelector("[data-toggle]");
  tg.addEventListener("click", () => { panel.hidden = !panel.hidden; tg.setAttribute("aria-expanded", String(!panel.hidden)); });
  box.querySelector("[data-quote]").addEventListener("click", () => { panel.hidden = true; tg.setAttribute("aria-expanded", "false"); });
}
