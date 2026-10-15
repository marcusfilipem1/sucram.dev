// Funções compartilhadas: utilidades e renderização das páginas públicas.
import { t, tData, pick, curLang } from "./i18n.js";

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const safeUrl = (u = "") => (/^(https?:|mailto:|data:image\/|\.?\/|assets\/)/i.test(u) ? u : "");

// imagens enviadas pelo painel ficam em assets/…; com "/" funcionam em qualquer página do site
export const assetUrl = (u = "") => (/^\.?\/?assets\//.test(u) && !/^data:/.test(u) ? "/" + u.replace(/^\.?\//, "") : u);

export async function getJSON(path) {
  const res = await fetch(`${path}?v=${Date.now()}`); // sem cache: projeto novo aparece logo após o deploy
  if (!res.ok) throw new Error(`Falha ao carregar ${path}`);
  return res.json();
}

// Marca: "S." em segmentos, como o visor de um caixa
export const LOGO_MARK = `<svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="11" fill="#1d4ed8"/><g fill="#fff"><rect x="13" y="10" width="17" height="4.5" rx="2.25"/><rect x="11" y="12" width="4.5" height="12" rx="2.25"/><rect x="13" y="21.75" width="17" height="4.5" rx="2.25"/><rect x="27.5" y="24" width="4.5" height="12" rx="2.25"/><rect x="13" y="33.5" width="17" height="4.5" rx="2.25"/></g><rect x="35" y="33.5" width="4.5" height="4.5" rx="1.2" fill="#93b4ff"/></svg>`;
export const brandHTML = (handle = "sucram") => `${LOGO_MARK}<span class="brand-name">${esc(handle)}<span>.dev</span></span>`;

export const initials = (s = "") =>
  s.split(/\s+/).filter((w) => w.length > 2 && !/^(para|com|das|dos|the|and|for)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "··";

const OK = ["Em produção", "Concluído", "Disponível"];
export const statusPill = (s) => (s ? `<span class="pill ${OK.includes(s) ? "ok" : "warn"}">${esc(tData(s))}</span>` : "");

// Código de registro PRJ-001, PRJ-002… pela ordem de cadastro
export function withCodes(list) {
  const order = [...list].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const code = new Map(order.map((p, i) => [p.slug, `PRJ-${String(i + 1).padStart(3, "0")}`]));
  return list.map((p) => ({ ...p, code: code.get(p.slug) }));
}

export const sortProjects = (list) =>
  [...list].sort((a, b) => (b.featured === true) - (a.featured === true) || String(b.year).localeCompare(String(a.year)) || String(b.createdAt).localeCompare(String(a.createdAt)));

export const stackHTML = (stack = []) => `<div class="stack">${stack.map((s) => `<span>${esc(s)}</span>`).join("")}</div>`;

export const waLink = (profile, text = t("wa_default")) =>
  `https://wa.me/${String(profile.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

function coverHTML(p) {
  const src = safeUrl(p.cover);
  const title = pick(p, "title");
  return `<div class="cover">${src ? `<img src="${esc(assetUrl(src))}" alt="${esc(t("cover_alt")(title))}" loading="lazy">` : `<div class="ph">${esc(initials(title))}</div>`}</div>`;
}

/* ---------- página inicial ---------- */
export function homeHTML(profile, projects) {
  const live = projects.filter((p) => p.status === "Em produção").length;
  const segs = new Set(projects.map((p) => p.category).filter(Boolean)).size;
  const segments = t("segments");
  const role = pick(profile, "role");
  return `
  <header class="hero">
    <div class="wrap">
      <div class="hero-copy">
        <div class="label">${t("hero_label")}</div>
        <h1>${esc(pick(profile, "headlineStart"))} <em>${esc(pick(profile, "headlineEnd"))}</em></h1>
        <p class="lead">${esc(pick(profile, "bio"))}</p>
        <div class="btns">
          <button class="btn primary lg" data-quote>${t("hero_quote")}</button>
          <a class="btn lg" href="${waLink(profile)}" target="_blank" rel="noopener">${t("hero_wa")}</a>
        </div>
        <p class="hint" style="margin-top:14px">${t("hero_hint")}</p>
      </div>
      <div class="hero-mock" data-hero-mock></div>
    </div>
    <div class="wrap">
      <dl class="kpis">
        <div><dt class="label">${t("kpi_projects")}</dt><dd>${projects.length}</dd></div>
        <div><dt class="label">${t("kpi_live")}</dt><dd>${live}</dd></div>
        <div><dt class="label">${t("kpi_areas")}</dt><dd>${segs}</dd></div>
        <div><dt class="label">${t("kpi_service")}</dt><dd>${t("kpi_service_v")}</dd></div>
      </dl>
    </div>
  </header>

  <div class="marquee" aria-label="${t("segments_label")}"><div class="marquee-track">${[...segments, ...segments].map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>

  <section id="projetos">
    <div class="wrap">
      <div class="sec-head">
        <div><div class="label">${t("portfolio")}</div><h2>${t("projects_title")}</h2></div>
        <div class="filters" id="filters" role="toolbar" aria-label="${t("filter_label")}"></div>
      </div>
      <div class="grid" id="grid"></div>
    </div>
  </section>

  <section id="simulador" class="band">
    <div class="wrap">
      <div class="sec-head"><div><div class="label">${t("sim_label")}</div><h2>${t("sim_title")}</h2><p class="sub">${t("sim_sub")}</p></div></div>
      <div class="sim" data-sim></div>
    </div>
  </section>

  <section id="servicos">
    <div class="wrap">
      <div class="sec-head"><div><div class="label">${t("services_label")}</div><h2>${t("services_title")}</h2></div></div>
      <div class="services">${(pick(profile, "services") || []).map((s) => `<div class="service"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><button class="link" data-quote="${esc(s.title)}">${t("service_cta")}</button></div>`).join("")}</div>
    </div>
  </section>

  <section id="processo" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head"><div><div class="label">${t("process_label")}</div><h2>${t("process_title")}</h2></div></div>
      <ol class="steps">${t("steps").map(([a, d], i) => `<li><span class="code">${String(i + 1).padStart(2, "0")}</span><h3>${a}</h3><p>${d}</p></li>`).join("")}</ol>
    </div>
  </section>

  <section id="sobre" style="padding-top:0">
    <div class="wrap about">
      <div><div class="label">${t("about_label")}</div><h2>${t("about_title")}</h2><p>${esc(t("about_intro")(profile.name, role))} ${esc(pick(profile, "about") || pick(profile, "bio"))}</p></div>
      <div><div class="label">${t("stack_label")}</div>${stackHTML(profile.stack)}</div>
    </div>
  </section>

  <section id="faq" style="padding-top:0">
    <div class="wrap faq-wrap">
      <div><div class="label">${t("faq_label")}</div><h2 style="font-size:clamp(28px,3.6vw,40px);margin-top:6px">${t("faq_title")}</h2><p class="sub">${t("faq_more")} <button class="link" data-quote>${t("faq_more_cta")}</button>.</p></div>
      <div class="faq">${t("faq").map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
    </div>
  </section>

  <section class="contact" id="contato">
    <div class="wrap contact-grid">
      <div>
        <div class="label">${t("contact_label")}</div>
        <h2>${t("contact_title")}</h2>
        <p>${t("contact_text")}</p>
        <p class="contact-alt"><a href="#rodape">${t("contact_alt")}</a></p>
      </div>
      <div class="contact-form" data-inline-form></div>
    </div>
  </section>`;
}

/* ---------- rodapé com os contatos ---------- */
export function footerHTML(profile, base = "./") {
  const strip = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const contacts = [
    profile.whatsapp && `<li><span class="label">WhatsApp</span><a href="${waLink(profile)}" target="_blank" rel="noopener">${esc(profile.phoneDisplay || profile.whatsapp)}</a></li>`,
    profile.email && `<li><span class="label">E-mail</span><a href="mailto:${esc(profile.email)}" class="sel">${esc(profile.email)}</a></li>`,
    safeUrl(profile.github) && `<li><span class="label">GitHub</span><a href="${esc(profile.github)}" target="_blank" rel="noopener">${esc(strip(profile.github))}</a></li>`,
    safeUrl(profile.linkedin) && `<li><span class="label">LinkedIn</span><a href="${esc(profile.linkedin)}" target="_blank" rel="noopener">${esc(strip(profile.linkedin))}</a></li>`,
  ].filter(Boolean).join("");
  return `
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="brand" href="${base}">${brandHTML(profile.handle)}</a>
      <p>${t("footer_tagline")}</p>
      <p class="label">${esc(pick(profile, "location"))}</p>
    </div>
    <div><div class="label foot-h">${t("footer_contact")}</div><ul class="channels">${contacts}</ul></div>
    <div><div class="label foot-h">${t("footer_nav")}</div><ul class="foot-links">
      <li><a href="${base}#projetos">${t("nav_projects")}</a></li>
      <li><a href="${base}#simulador">${t("nav_sim")}</a></li>
      <li><a href="${base}#faq">${t("nav_faq")}</a></li>
      <li><button class="link" data-quote>${t("nav_quote")}</button></li>
      <li><a href="#" data-lang-switch data-lang-full></a></li>
    </ul></div>
  </div>
  <div class="wrap foot-bottom"><span>© ${new Date().getFullYear()} ${esc(profile.name)}</span></div>`;
}

export function gridHTML(projects, filter, href) {
  const list = filter === "Todos" ? projects : projects.filter((p) => p.category === filter);
  if (!list.length) return `<div class="empty">${t("empty")}</div>`;
  return list.map((p) => `
    <a class="card" href="${href(p.slug)}" data-slug="${esc(p.slug)}">
      ${coverHTML(p)}
      <div class="card-body">
        <div class="card-top"><span class="code">${esc(p.code || "")}</span>${statusPill(p.status)}</div>
        <h3>${esc(pick(p, "title"))}</h3>
        <div class="card-meta">${esc([tData(p.category), p.year].filter(Boolean).join(" · "))}</div>
        <p>${esc(pick(p, "summary") || "")}</p>
        ${stackHTML(p.stack)}
      </div>
    </a>`).join("");
}

export function filtersHTML(projects, active) {
  const cats = ["Todos", ...new Set(projects.map((p) => p.category).filter(Boolean))];
  return cats.map((c) => `<button class="chip ${c === active ? "on" : ""}" data-cat="${esc(c)}" aria-pressed="${c === active}">${esc(c === "Todos" ? t("all") : tData(c))}</button>`).join("");
}

export function mountGrid(root, projects, href) {
  let active = "Todos";
  const draw = () => {
    root.querySelector("#filters").innerHTML = filtersHTML(projects, active);
    root.querySelector("#grid").innerHTML = gridHTML(projects, active, href);
    root.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => { active = b.dataset.cat; draw(); }));
  };
  draw();
}

/* ---------- página do projeto ---------- */
export function projectHTML(p, backHref) {
  if (!p) return `<div class="wrap p-hero"><a class="back" href="${backHref}">${t("back")}</a><h1 style="margin-top:20px">${t("not_found")}</h1></div>`;
  const title = pick(p, "title");
  const facts = [[t("f_client"), pick(p, "client")], [t("f_category"), tData(p.category)], [t("f_year"), p.year], [t("f_code"), p.code]].filter(([, v]) => v);
  const actions = [];
  if (safeUrl(p.liveUrl)) actions.push(`<a class="btn" href="${esc(p.liveUrl)}" target="_blank" rel="noopener">${t("open_system")}</a>`);
  if (safeUrl(p.repoUrl)) actions.push(`<a class="btn" href="${esc(p.repoUrl)}" target="_blank" rel="noopener">${t("see_code")}</a>`);
  const paragraphs = String(pick(p, "description") || pick(p, "summary") || "").split(/\n{2,}/).map((x) => `<p>${esc(x).replace(/\n/g, "<br>")}</p>`).join("");
  const gallery = (p.gallery || []).filter(safeUrl);
  return `
  <div class="wrap p-hero">
    <a class="back" href="${backHref}">${t("back")}</a>
    <div class="p-head"><span class="code">${esc(p.code || "")}</span>${statusPill(p.status)}</div>
    <h1>${esc(title)}</h1>
    <p class="lead">${esc(pick(p, "summary") || "")}</p>
    <dl class="facts">${facts.map(([k, v]) => `<div><dt class="label">${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
    ${safeUrl(p.cover) ? `<div class="p-cover"><img src="${esc(assetUrl(p.cover))}" alt="${esc(t("cover_alt")(title))}"></div>` : ""}
    <div class="p-body">
      <div class="prose">${paragraphs}</div>
      <aside class="p-aside">
        ${p.stack?.length ? `<div class="label">${t("tech")}</div>${stackHTML(p.stack)}` : ""}
        ${actions.length ? `<div class="btns">${actions.join("")}</div>` : ""}
        <div class="cta-box"><b>${t("cta_title")}</b><p>${t("cta_text")}</p><button class="btn primary" data-quote="${esc(p.category || "")}" data-quote-ref="${esc(title)}">${t("cta_btn")}</button></div>
      </aside>
    </div>
    ${gallery.length ? `<div class="gallery">${gallery.map((g, i) => `<a href="${esc(assetUrl(g))}" target="_blank" rel="noopener"><img src="${esc(assetUrl(g))}" alt="${esc(t("cover_alt")(title))} (${i + 2})" loading="lazy"></a>`).join("")}</div>` : ""}
  </div>`;
}
