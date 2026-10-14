// Partes interativas: maquete do sistema, simulador, formulário de orçamento e botão de WhatsApp.
import { esc, waLink } from "./common.js";

const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ---------- dados do simulador ---------- */
export const SEGMENTS = {
  padaria: {
    label: "Padaria ou confeitaria", company: "Padaria Bom Grão",
    modules: ["Vendas / PDV", "Estoque", "Financeiro", "Nota fiscal"],
    kpis: [["Vendas hoje", "R$ 4.812,90"], ["Cupons", "312"], ["Ticket médio", "R$ 15,42"]],
    rows: [["Pão francês 2 kg", "R$ 38,00"], ["Bolo de cenoura", "R$ 42,90"], ["Café + pão na chapa", "R$ 12,50"], ["Encomenda: salgados 200 un", "R$ 180,00"]],
    bars: [30, 55, 90, 70, 45, 65, 85], tag: ["NFC-e emitida", "Estoque baixo: farinha"],
  },
  loja: {
    label: "Loja ou varejo", company: "Casa & Obra Materiais",
    modules: ["Vendas / PDV", "Estoque", "Clientes", "Nota fiscal", "Relatórios"],
    kpis: [["Vendas hoje", "R$ 12.390,00"], ["Pedidos", "47"], ["Ticket médio", "R$ 263,62"]],
    rows: [["Cimento CP-II 50 kg ×20", "R$ 780,00"], ["Torneira monocomando", "R$ 219,90"], ["Tinta acrílica 18 L", "R$ 389,00"], ["Kit ferramentas", "R$ 149,00"]],
    bars: [40, 62, 58, 80, 95, 70, 50], tag: ["Pedido #1043 faturado", "Reposição sugerida: 6 itens"],
  },
  clinica: {
    label: "Clínica ou consultório", company: "Clínica Vida Plena",
    modules: ["Agenda", "Clientes", "Financeiro", "Relatórios"],
    kpis: [["Consultas hoje", "28"], ["Confirmadas", "24"], ["Faturamento", "R$ 6.720"]],
    rows: [["09:00 · Ana Souza", "Confirmada"], ["09:40 · Carlos Lima", "Confirmada"], ["10:20 · Beatriz Rocha", "Aguardando"], ["11:00 · João Pedro", "Confirmada"]],
    bars: [60, 75, 80, 50, 90, 85, 40], tag: ["Lembrete enviado no WhatsApp", "3 horários livres amanhã"],
  },
  oficina: {
    label: "Oficina ou assistência", company: "Auto Center Maricá",
    modules: ["Ordens de serviço", "Estoque", "Clientes", "Financeiro"],
    kpis: [["OS abertas", "14"], ["Concluídas hoje", "6"], ["Faturamento", "R$ 9.180"]],
    rows: [["OS 2291 · Troca de embreagem", "Em execução"], ["OS 2290 · Revisão 40 mil km", "Pronta"], ["OS 2288 · Alinhamento", "Pronta"], ["OS 2287 · Freios dianteiros", "Aguardando peça"]],
    bars: [35, 50, 65, 60, 75, 90, 55], tag: ["Orçamento aprovado pelo cliente", "Peça chegou: pastilha Bosch"],
  },
  restaurante: {
    label: "Restaurante ou delivery", company: "Cantina da Orla",
    modules: ["Vendas / PDV", "Delivery", "Estoque", "Financeiro"],
    kpis: [["Pedidos hoje", "186"], ["Delivery", "74"], ["Ticket médio", "R$ 48,90"]],
    rows: [["Mesa 12 · 4 pessoas", "R$ 236,00"], ["Delivery #881 · Itaipuaçu", "Saiu"], ["Balcão · 2 pratos do dia", "R$ 59,80"], ["Delivery #882 · Centro", "Preparando"]],
    bars: [20, 35, 85, 95, 40, 70, 90], tag: ["Novo pedido no delivery", "Cozinha: 6 pedidos na fila"],
  },
};
export const ALL_MODULES = ["Vendas / PDV", "Estoque", "Financeiro", "Clientes", "Agenda", "Ordens de serviço", "Delivery", "Nota fiscal", "Relatórios", "App para celular"];

/* ---------- maquete de sistema ---------- */
export function mockHTML(seg, company, modules) {
  const s = SEGMENTS[seg] || SEGMENTS.padaria;
  const name = company?.trim() || s.company;
  const mods = modules?.length ? modules : s.modules;
  const max = Math.max(...s.bars);
  return `
  <div class="mock" aria-hidden="true">
    <div class="mock-bar"><i></i><i></i><i></i><span class="mock-url">${esc(name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, ""))}.app/painel</span></div>
    <div class="mock-body">
      <aside class="mock-side">
        <b>${esc(name)}</b>
        <span class="on">Início</span>
        ${mods.slice(0, 7).map((m) => `<span>${esc(m)}</span>`).join("")}
      </aside>
      <div class="mock-main">
        <div class="mock-kpis">${s.kpis.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join("")}</div>
        <div class="mock-chart">${s.bars.map((b, i) => `<span style="height:${Math.round((b / max) * 100)}%" title="${["seg", "ter", "qua", "qui", "sex", "sáb", "dom"][i]}"></span>`).join("")}</div>
        <div class="mock-rows" data-rows>${s.rows.map(([a, b]) => `<div><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join("")}</div>
      </div>
    </div>
    <div class="mock-tag t1">${esc(s.tag[0])}</div>
    <div class="mock-tag t2">${esc(s.tag[1])}</div>
  </div>`;
}

// faz as linhas da maquete do topo "rodarem", como vendas chegando
function animateRows(container, seg) {
  if (reduceMotion()) return;
  const s = SEGMENTS[seg];
  let i = 0;
  clearInterval(container._timer);
  container._timer = setInterval(() => {
    const rows = container.querySelector("[data-rows]");
    if (!rows || !document.body.contains(rows)) return clearInterval(container._timer);
    const [a, b] = s.rows[i++ % s.rows.length];
    const el = document.createElement("div");
    el.className = "new";
    el.innerHTML = `<span>${esc(a)}</span><b>${esc(b)}</b>`;
    rows.prepend(el);
    while (rows.children.length > 4) rows.lastElementChild.remove();
  }, 2600);
}

export function mountHeroMock(el) {
  if (!el) return;
  el.innerHTML = mockHTML("padaria");
  animateRows(el, "padaria");
}

/* ---------- simulador ---------- */
export function mountSimulator(el, onQuote) {
  if (!el) return;
  let seg = "padaria", company = "", mods = [...SEGMENTS.padaria.modules];
  el.innerHTML = `
    <form class="sim-controls" data-sim-form>
      <div class="field"><label for="sim-company">Nome da empresa</label><input id="sim-company" placeholder="${esc(SEGMENTS.padaria.company)}" maxlength="40"></div>
      <div class="field"><label for="sim-seg">Segmento</label><select id="sim-seg">${Object.entries(SEGMENTS).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join("")}</select></div>
      <fieldset class="field"><legend>Módulos</legend><div class="mods" data-mods></div></fieldset>
      <button class="btn primary" type="submit">Quero um sistema assim</button>
      <p class="hint">Os dados digitados ficam só nesta página até você enviar o pedido.</p>
    </form>
    <div class="sim-view" data-sim-view></div>`;
  const view = el.querySelector("[data-sim-view]");
  const drawMods = () => {
    el.querySelector("[data-mods]").innerHTML = ALL_MODULES.map((m, i) =>
      `<label class="mod"><input type="checkbox" id="sim-m${i}" value="${esc(m)}" ${mods.includes(m) ? "checked" : ""}><span>${esc(m)}</span></label>`).join("");
    el.querySelectorAll("[data-mods] input").forEach((c) => c.addEventListener("change", () => {
      mods = ALL_MODULES.filter((m) => el.querySelector(`[data-mods] input[value="${CSS.escape(m)}"]`)?.checked);
      draw();
    }));
  };
  const draw = () => { view.innerHTML = mockHTML(seg, company, mods); };
  el.querySelector("#sim-company").addEventListener("input", (e) => { company = e.target.value; draw(); });
  el.querySelector("#sim-seg").addEventListener("change", (e) => { seg = e.target.value; mods = [...SEGMENTS[seg].modules]; drawMods(); draw(); });
  el.querySelector("[data-sim-form]").addEventListener("submit", (e) => {
    e.preventDefault();
    onQuote({
      type: "Sistema de gestão",
      company: company.trim(),
      message: `Segmento: ${SEGMENTS[seg].label}\nMódulos: ${mods.join(", ") || "a definir"}\n\n`,
    });
  });
  drawMods(); draw();
}

/* ---------- formulário de orçamento ---------- */
const TYPES = ["Sistema de gestão", "Integração / API", "Site", "Outro"];
// converte categorias e serviços (ex.: "API / Integração", "Comércio e PDV") em um dos tipos acima
const toType = (t = "") => (/api|integra/i.test(t) ? "Integração / API" : /^site|institucional/i.test(t) ? "Site" : /outro/i.test(t) ? "Outro" : "Sistema de gestão");
// DDDs válidos no Brasil (Anatel)
const DDDS = new Set("11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(" "));
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

function phoneError(v) {
  const d = v.replace(/\D/g, "");
  if (!d) return "Informe seu WhatsApp com DDD.";
  if (d.length < 10) return "Número incompleto. Inclua o DDD, ex.: (21) 99999-9999.";
  if (d.length > 11) return "Número longo demais. Use só DDD e número.";
  if (!DDDS.has(d.slice(0, 2))) return `DDD ${d.slice(0, 2)} não existe. Confira os dois primeiros dígitos.`;
  if (d.length === 11 && d[2] !== "9") return "Celular com 11 dígitos começa com 9 depois do DDD.";
  return "";
}
function emailError(v) {
  const t = v.trim();
  if (!t) return "Informe seu e-mail.";
  if (!EMAIL_RE.test(t) || t.includes("..")) return "E-mail inválido. Confira, ex.: nome@empresa.com.br";
  return "";
}

function formHTML(prefix) {
  const id = (n) => `${prefix}-${n}`;
  return `
  <form class="quote form-grid" novalidate data-quote-form>
    <div class="row">
      <div class="field"><label for="${id("name")}">Nome *</label><input id="${id("name")}" name="nome" autocomplete="name" required><small class="field-error" data-err="nome" hidden></small></div>
      <div class="field"><label for="${id("company")}">Empresa</label><input id="${id("company")}" name="empresa" autocomplete="organization"></div>
    </div>
    <div class="row">
      <div class="field"><label for="${id("email")}">E-mail *</label><input id="${id("email")}" name="email" type="email" autocomplete="email" required><small class="field-error" data-err="email" hidden></small></div>
      <div class="field"><label for="${id("phone")}">WhatsApp com DDD *</label><input id="${id("phone")}" name="whatsapp" inputmode="tel" autocomplete="tel" placeholder="(21) 99999-9999" required data-phone><small class="field-error" data-err="whatsapp" hidden></small></div>
    </div>
    <fieldset class="field"><legend>Tipo de projeto</legend><div class="types">${TYPES.map((t, i) => `<label class="mod"><input type="radio" name="tipo" id="${id("t" + i)}" value="${t}" ${i === 0 ? "checked" : ""}><span>${t}</span></label>`).join("")}</div></fieldset>
    <div class="field"><label for="${id("msg")}">Conte sobre o projeto *</label><textarea id="${id("msg")}" name="mensagem" required placeholder="O que a empresa faz hoje, o que precisa resolver e quem vai usar o sistema."></textarea><small class="field-error" data-err="mensagem" hidden></small></div>
    <input type="text" name="_honey" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
    <p class="form-error" data-error hidden></p>
    <div class="btns"><button class="btn primary lg" type="submit" data-send>Enviar pedido</button></div>
    <p class="hint">Seus dados são usados só para responder este contato.</p>
  </form>
  <div class="sent" data-sent hidden>
    <div class="sent-mark">✓</div>
    <h3>Pedido enviado</h3>
    <p>Recebi suas informações e respondo em até 1 dia útil, por e-mail ou WhatsApp.</p>
    <div class="btns"><a class="btn" data-wa-after target="_blank" rel="noopener">Falar agora no WhatsApp</a><button class="btn" type="button" data-again>Enviar outro pedido</button></div>
  </div>`;
}

function maskPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

function bindForm(root, profile) {
  const form = root.querySelector("[data-quote-form]");
  const err = root.querySelector("[data-error]");
  form.querySelector("[data-phone]").addEventListener("input", (e) => (e.target.value = maskPhone(e.target.value)));

  const checks = {
    nome: (v) => (v.trim().length < 2 ? "Informe seu nome." : ""),
    email: emailError,
    whatsapp: phoneError,
    mensagem: (v) => (v.trim().length < 10 ? "Conte um pouco sobre o projeto (mínimo de 10 caracteres)." : ""),
  };
  const setErr = (name, msg) => {
    const input = form.querySelector(`[name="${name}"]`);
    const out = form.querySelector(`[data-err="${name}"]`);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    out.textContent = msg; out.hidden = !msg;
  };
  // valida ao sair do campo e limpa o erro enquanto a pessoa corrige
  Object.keys(checks).forEach((name) => {
    const input = form.querySelector(`[name="${name}"]`);
    input.addEventListener("blur", () => { if (input.value) setErr(name, checks[name](input.value)); });
    input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") setErr(name, checks[name](input.value)); });
  });
  root.querySelector("[data-again]").addEventListener("click", () => { form.reset(); form.querySelectorAll("[data-err]").forEach((e) => (e.hidden = true)); form.querySelectorAll("[aria-invalid]").forEach((e) => e.removeAttribute("aria-invalid")); form.hidden = false; root.querySelector("[data-sent]").hidden = true; });

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
    data.email = data.email.trim();
    if (data._honey) return; // robô

    const btn = form.querySelector("[data-send]");
    btn.disabled = true; btn.textContent = "Enviando…";
    try {
      const payload = { ...data, _subject: `Novo pedido de orçamento: ${data.nome}${data.empresa ? " (" + data.empresa + ")" : ""}`, _replyto: data.email, _template: "table", _captcha: "false" };
      delete payload._honey;
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
      sent.querySelector("[data-wa-after]").href = waLink(profile, `Olá, sou ${data.nome}. Acabei de enviar um pedido de orçamento pelo site.`);
    } catch {
      err.innerHTML = `Não consegui enviar agora. Tente de novo ou <a href="${waLink(profile)}" target="_blank" rel="noopener">fale direto pelo WhatsApp</a>.`;
      err.hidden = false;
    } finally { btn.disabled = false; btn.textContent = "Enviar pedido"; }
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

export function mountQuote(profile, inlineEl) {
  // janela (modal)
  const dlg = document.createElement("div");
  dlg.className = "modal"; dlg.hidden = true;
  dlg.setAttribute("role", "dialog"); dlg.setAttribute("aria-modal", "true"); dlg.setAttribute("aria-labelledby", "q-title");
  dlg.innerHTML = `<div class="modal-card"><button class="modal-x" type="button" aria-label="Fechar" data-close>×</button><div class="label">Orçamento sem compromisso</div><h2 id="q-title">Conte sobre o seu projeto</h2>${formHTML("m")}</div>`;
  document.body.appendChild(dlg);
  const fillModal = bindForm(dlg, profile);
  const close = () => { dlg.hidden = true; document.documentElement.classList.remove("lock"); };
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !dlg.hidden) close(); });
  const open = (prefill) => {
    fillModal(prefill);
    dlg.hidden = false; document.documentElement.classList.add("lock");
    setTimeout(() => dlg.querySelector("input[name=nome]").focus(), 30);
  };

  mountInlineForm(profile, inlineEl);

  // qualquer botão com data-quote abre a janela
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-quote]");
    if (!b) return;
    e.preventDefault();
    const ref = b.dataset.quoteRef;
    open({ type: b.dataset.quote || undefined, message: ref ? `Vi o projeto "${ref}" no seu portfólio e preciso de algo parecido.\n\n` : "" });
  });
  return open;
}

/* ---------- botão flutuante de WhatsApp ---------- */
export function mountWhatsApp(profile) {
  if (!profile.whatsapp) return;
  const box = document.createElement("div");
  box.className = "fab";
  box.innerHTML = `
    <div class="fab-panel" hidden data-panel>
      <b>Fale comigo</b>
      <p>Respondo pelo WhatsApp em horário comercial. Se preferir, mande os detalhes pelo formulário.</p>
      <a class="btn primary" href="${waLink(profile)}" target="_blank" rel="noopener">Abrir WhatsApp</a>
      <button class="btn" type="button" data-quote>Preencher formulário</button>
      <span class="label" style="margin-top:4px">${esc(profile.phoneDisplay || "")}</span>
    </div>
    <button class="fab-btn" type="button" aria-label="Abrir contato" aria-expanded="false" data-toggle>
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.66 15l-1.3 4.76 4.88-1.28A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-2.9.76.78-2.83-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.13-.16.24-.63.8-.78.96-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.44.25-.4.72-1.34.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.85 2.03c0 1.2.87 2.36 1 2.52.12.16 1.72 2.62 4.16 3.68 1.55.67 2.15.73 2.93.61.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.15-1.17-.06-.1-.22-.16-.47-.28Z"/></svg>
    </button>`;
  document.body.appendChild(box);
  const panel = box.querySelector("[data-panel]");
  const t = box.querySelector("[data-toggle]");
  t.addEventListener("click", () => { panel.hidden = !panel.hidden; t.setAttribute("aria-expanded", String(!panel.hidden)); });
  box.querySelector("[data-quote]").addEventListener("click", () => { panel.hidden = true; t.setAttribute("aria-expanded", "false"); });
}
