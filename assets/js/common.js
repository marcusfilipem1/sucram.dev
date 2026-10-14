// Funções compartilhadas: utilidades e renderização das páginas públicas.

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const safeUrl = (u = "") => (/^(https?:|mailto:|data:image\/|\.?\/|assets\/)/i.test(u) ? u : "");

export async function getJSON(path) {
  const res = await fetch(`${path}?v=${Date.now()}`); // sem cache: projeto novo aparece logo após o deploy
  if (!res.ok) throw new Error(`Falha ao carregar ${path}`);
  return res.json();
}

export const initials = (t = "") =>
  t.split(/\s+/).filter((w) => w.length > 2 && !/^(para|com|das|dos|the|and)$/i.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "··";

const OK = ["Em produção", "Concluído", "Disponível"];
export const statusPill = (s) => (s ? `<span class="pill ${OK.includes(s) ? "ok" : "warn"}">${esc(s)}</span>` : "");

// Código de registro PRJ-001, PRJ-002… pela ordem de cadastro
export function withCodes(list) {
  const order = [...list].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const code = new Map(order.map((p, i) => [p.slug, `PRJ-${String(i + 1).padStart(3, "0")}`]));
  return list.map((p) => ({ ...p, code: code.get(p.slug) }));
}

export const sortProjects = (list) =>
  [...list].sort((a, b) => (b.featured === true) - (a.featured === true) || String(b.year).localeCompare(String(a.year)) || String(b.createdAt).localeCompare(String(a.createdAt)));

export const stackHTML = (stack = []) => `<div class="stack">${stack.map((s) => `<span>${esc(s)}</span>`).join("")}</div>`;

export const waLink = (profile, text = "Olá! Vi seu portfólio e quero conversar sobre um sistema.") =>
  `https://wa.me/${String(profile.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

function coverHTML(p) {
  const src = safeUrl(p.cover);
  return `<div class="cover">${src ? `<img src="${esc(src)}" alt="Tela do projeto ${esc(p.title)}" loading="lazy">` : `<div class="ph">${esc(initials(p.title))}</div>`}</div>`;
}

/* ---------- página inicial ---------- */
const STEPS = [
  ["Conversa", "Uma chamada de 30 minutos, sem custo, para entender a rotina da empresa e onde o processo trava."],
  ["Proposta", "Escopo, prazo e valor fechados por escrito. Você sabe exatamente o que vai receber."],
  ["Desenvolvimento", "Entregas semanais com acesso a uma versão de teste, para você validar antes de ir ao ar."],
  ["Implantação e suporte", "Coloco no ar, treino a equipe e acompanho as primeiras semanas de uso."],
];
const SEGMENTS = ["Padarias", "Mercados", "Autopeças", "Clínicas", "Oficinas", "Restaurantes", "Materiais de construção", "Pet shops", "Lojas de roupa", "Distribuidoras"];
const FAQ = [
  ["Quanto custa um sistema sob medida?", "Depende dos módulos e integrações. Um sistema enxuto com um ou dois módulos sai bem mais barato que um ERP completo. Depois da conversa inicial envio uma proposta com valor fechado, sem surpresas no meio do projeto."],
  ["Quanto tempo leva?", "Projetos menores ficam prontos em 3 a 6 semanas. Sistemas com vários módulos e integrações levam de 2 a 4 meses. O prazo vai escrito na proposta, com entregas semanais."],
  ["Preciso comprar servidor ou programa?", "Não. O sistema roda no navegador, no computador, tablet ou celular. Eu cuido da hospedagem e indico a opção mais econômica para o tamanho da sua operação."],
  ["O sistema emite nota fiscal?", "Sim. Integro emissão de NF-e, NFC-e e NFS-e por meio de provedores homologados, além de boletos, Pix e maquininhas."],
  ["O código fica com a minha empresa?", "Sim. O sistema é seu: entrego o código-fonte e os acessos, e você não fica preso a mensalidade de licença."],
  ["Atende empresas fora do Rio de Janeiro?", "Sim. O trabalho é remoto, com reuniões por vídeo. Para clientes na região de Maricá e Niterói, a implantação pode ser presencial."],
];

export function homeHTML(profile, projects) {
  const live = projects.filter((p) => p.status === "Em produção").length;
  const segs = new Set(projects.map((p) => p.category).filter(Boolean)).size;
  return `
  <header class="hero">
    <div class="wrap">
      <div class="hero-copy">
        <div class="label">${esc(profile.role)} · ${esc(profile.location)}</div>
        <h1>${esc(profile.headlineStart || "Sistemas sob medida para")} <em>${esc(profile.headlineEnd || "empresas e comércios.")}</em></h1>
        <p class="lead">${esc(profile.bio)}</p>
        <div class="btns">
          <button class="btn primary lg" data-quote>Pedir orçamento</button>
          <a class="btn lg" href="${waLink(profile)}" target="_blank" rel="noopener" data-wa>Chamar no WhatsApp</a>
        </div>
        <p class="hint" style="margin-top:14px">Resposta em até 1 dia útil. A primeira conversa não tem custo.</p>
      </div>
      <div class="hero-mock" data-hero-mock></div>
    </div>
    <div class="wrap">
      <dl class="kpis">
        <div><dt class="label">Projetos entregues</dt><dd>${projects.length}</dd></div>
        <div><dt class="label">Em produção agora</dt><dd>${live}</dd></div>
        <div><dt class="label">Áreas atendidas</dt><dd>${segs}</dd></div>
        <div><dt class="label">Atendimento</dt><dd>Remoto e RJ</dd></div>
      </dl>
    </div>
  </header>

  <div class="marquee" aria-label="Segmentos atendidos"><div class="marquee-track">${[...SEGMENTS, ...SEGMENTS].map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>

  <section id="projetos">
    <div class="wrap">
      <div class="sec-head">
        <div><div class="label">Portfólio</div><h2>Projetos entregues</h2></div>
        <div class="filters" id="filters" role="toolbar" aria-label="Filtrar por categoria"></div>
      </div>
      <div class="grid" id="grid"></div>
    </div>
  </section>

  <section id="simulador" class="band">
    <div class="wrap">
      <div class="sec-head"><div><div class="label">Simulador</div><h2>Monte a prévia do seu sistema</h2><p class="sub">Escolha o segmento e os módulos. A tela ao lado muda na hora e o pedido de orçamento já vai preenchido.</p></div></div>
      <div class="sim" data-sim></div>
    </div>
  </section>

  <section id="servicos">
    <div class="wrap">
      <div class="sec-head"><div><div class="label">Serviços</div><h2>O que eu desenvolvo</h2></div></div>
      <div class="services">${(profile.services || []).map((s) => `<div class="service"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><button class="link" data-quote="${esc(s.title)}">Quero um orçamento →</button></div>`).join("")}</div>
    </div>
  </section>

  <section id="processo" style="padding-top:0">
    <div class="wrap">
      <div class="sec-head"><div><div class="label">Como trabalho</div><h2>Da primeira conversa ao sistema no ar</h2></div></div>
      <ol class="steps">${STEPS.map(([t, d], i) => `<li><span class="code">${String(i + 1).padStart(2, "0")}</span><h3>${t}</h3><p>${d}</p></li>`).join("")}</ol>
    </div>
  </section>

  <section id="sobre" style="padding-top:0">
    <div class="wrap about">
      <div><div class="label">Sobre</div><h2>Do banco de dados à tela do caixa.</h2><p>Sou ${esc(profile.name)}, ${esc(String(profile.role).toLowerCase())}. ${esc(profile.about || profile.bio)}</p></div>
      <div><div class="label">Stack principal</div>${stackHTML(profile.stack)}</div>
    </div>
  </section>

  <section id="faq" style="padding-top:0">
    <div class="wrap faq-wrap">
      <div><div class="label">Dúvidas frequentes</div><h2 style="font-size:clamp(28px,3.6vw,40px);margin-top:6px">Perguntas antes de começar</h2><p class="sub">Não achou sua dúvida? <button class="link" data-quote>Mande uma mensagem</button>.</p></div>
      <div class="faq">${FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
    </div>
  </section>

  <section class="contact" id="contato">
    <div class="wrap contact-grid">
      <div>
        <div class="label">Contato</div>
        <h2>Tem um sistema para tirar do papel?</h2>
        <p>Conte o que sua empresa precisa. Respondo com uma proposta e um prazo.</p>
        <ul class="channels">
          <li><span class="label">WhatsApp</span><a href="${waLink(profile)}" target="_blank" rel="noopener" data-wa>${esc(profile.phoneDisplay || profile.whatsapp)}</a></li>
          <li><span class="label">E-mail</span><span class="sel">${esc(profile.email)}</span></li>
          ${safeUrl(profile.github) ? `<li><span class="label">GitHub</span><a href="${esc(profile.github)}" target="_blank" rel="noopener">${esc(profile.github.replace(/^https?:\/\/(www\.)?/, ""))}</a></li>` : ""}
          ${safeUrl(profile.linkedin) ? `<li><span class="label">LinkedIn</span><a href="${esc(profile.linkedin)}" target="_blank" rel="noopener">${esc(profile.linkedin.replace(/^https?:\/\/(www\.)?/, ""))}</a></li>` : ""}
        </ul>
      </div>
      <div class="contact-form" data-inline-form></div>
    </div>
  </section>`;
}

export function gridHTML(projects, filter, href) {
  const list = filter === "Todos" ? projects : projects.filter((p) => p.category === filter);
  if (!list.length) return `<div class="empty">Nenhum projeto publicado ainda.</div>`;
  return list.map((p) => `
    <a class="card" href="${href(p.slug)}" data-slug="${esc(p.slug)}">
      ${coverHTML(p)}
      <div class="card-body">
        <div class="card-top"><span class="code">${esc(p.code || "")}</span>${statusPill(p.status)}</div>
        <h3>${esc(p.title)}</h3>
        <div class="card-meta">${esc([p.category, p.year].filter(Boolean).join(" · "))}</div>
        <p>${esc(p.summary || "")}</p>
        ${stackHTML(p.stack)}
      </div>
    </a>`).join("");
}

export function filtersHTML(projects, active) {
  const cats = ["Todos", ...new Set(projects.map((p) => p.category).filter(Boolean))];
  return cats.map((c) => `<button class="chip ${c === active ? "on" : ""}" data-cat="${esc(c)}" aria-pressed="${c === active}">${esc(c)}</button>`).join("");
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
  if (!p) return `<div class="wrap p-hero"><a class="back" href="${backHref}">← Todos os projetos</a><h1 style="margin-top:20px">Projeto não encontrado</h1></div>`;
  const facts = [["Cliente", p.client], ["Categoria", p.category], ["Ano", p.year], ["Registro", p.code]].filter(([, v]) => v);
  const actions = [];
  if (safeUrl(p.liveUrl)) actions.push(`<a class="btn" href="${esc(p.liveUrl)}" target="_blank" rel="noopener">Abrir sistema ↗</a>`);
  if (safeUrl(p.repoUrl)) actions.push(`<a class="btn" href="${esc(p.repoUrl)}" target="_blank" rel="noopener">Ver código ↗</a>`);
  const paragraphs = String(p.description || p.summary || "").split(/\n{2,}/).map((t) => `<p>${esc(t).replace(/\n/g, "<br>")}</p>`).join("");
  const gallery = (p.gallery || []).filter(safeUrl);
  return `
  <div class="wrap p-hero">
    <a class="back" href="${backHref}">← Todos os projetos</a>
    <div class="p-head"><span class="code">${esc(p.code || "")}</span>${statusPill(p.status)}</div>
    <h1>${esc(p.title)}</h1>
    <p class="lead">${esc(p.summary || "")}</p>
    <dl class="facts">${facts.map(([k, v]) => `<div><dt class="label">${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
    ${safeUrl(p.cover) ? `<div class="p-cover"><img src="${esc(p.cover)}" alt="Tela do projeto ${esc(p.title)}"></div>` : ""}
    <div class="p-body">
      <div class="prose">${paragraphs}</div>
      <aside class="p-aside">
        ${p.stack?.length ? `<div class="label">Tecnologias</div>${stackHTML(p.stack)}` : ""}
        ${actions.length ? `<div class="btns">${actions.join("")}</div>` : ""}
        <div class="cta-box"><b>Precisa de algo parecido?</b><p>Conte como funciona a sua empresa e eu monto uma proposta.</p><button class="btn primary" data-quote="${esc(p.category || "")}" data-quote-ref="${esc(p.title)}">Quero um sistema assim</button></div>
      </aside>
    </div>
    ${gallery.length ? `<div class="gallery">${gallery.map((g) => `<a href="${esc(g)}" target="_blank" rel="noopener"><img src="${esc(g)}" alt="" loading="lazy"></a>`).join("")}</div>` : ""}
  </div>`;
}
