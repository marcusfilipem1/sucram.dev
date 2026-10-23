// Partes interativas: vitrine de projetos do topo, formulário de orçamento e botão de WhatsApp.
import { esc, waLink, statusPill, previewSrc } from "./common.js";
import { t, curLang, pick, tData } from "./i18n.js";

const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const en = () => curLang() === "en";

/* ---------- vitrine do topo: os projetos reais cadastrados no painel ---------- */
// cor de cada projeto: sempre a mesma para o mesmo projeto, dentro de uma paleta escolhida
const HUES = [222, 262, 192, 338, 158, 12, 284, 205];
const hueOf = (str = "") => HUES[[...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % HUES.length];
const hostOf = (p) => { try { return new URL(p.liveUrl).hostname.replace(/^www\./, ""); } catch { return `${p.slug}`.slice(0, 32); } };

function deckCard(p, i, href) {
  const title = pick(p, "title");
  const cover = previewSrc(p);
  const art = cover
    ? `<img src="${esc(cover)}" alt="${esc(t("cover_alt")(title))}" loading="${i ? "lazy" : "eager"}" onerror="this.remove()">`
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

  // pré-preenchimento vindo dos botões de orçamento
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
