// Painel de projetos. Salva direto no repositório do GitHub via API;
// o GitHub Pages republica o site sozinho depois de cada commit.
// Em modo demonstração (prévia) tudo fica só na memória da página.

const DATA_PATH = "data/projects.json";
const IMG_DIR = "assets/projects";
const STORE_KEY = "portfolio-admin";
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const OK = ["Em produção", "Concluído"];
const pill = (s) => (s ? `<span class="pill ${OK.includes(s) ? "ok" : "warn"}">${esc(s)}</span>` : "");
const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "projeto";

/* ---------- marcação do painel ---------- */
const field = (id, label, input) => `<div class="field"><label for="${id}">${label}</label>${input}</div>`;
export const adminHTML = () => `
  <div class="wrap" data-view="login">
    <div class="panel login">
      <h1 style="font-size:26px">Entrar no painel</h1>
      <p class="hint" style="margin:6px 0 18px">Os projetos ficam salvos no seu repositório do GitHub. O site atualiza cerca de 1 minuto depois de cada publicação.</p>
      <form class="form-grid" data-login>
        ${field("l-repo", "Repositório (usuário/repositório)", `<input id="l-repo" placeholder="marcusfilipem1/sucram.dev" required>`)}
        ${field("l-branch", "Branch", `<input id="l-branch" value="main" required>`)}
        ${field("l-token", "Token de acesso do GitHub", `<input id="l-token" type="password" placeholder="github_pat_…" required autocomplete="off">`)}
        <p class="hint">Crie um <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">fine-grained token</a> só para este repositório, com a permissão <b>Contents: Read and write</b>. Ele fica salvo apenas neste navegador.</p>
        <div class="btns"><button class="btn primary" type="submit">Entrar</button></div>
      </form>
    </div>
  </div>

  <div class="wrap hidden" data-view="list">
    <div class="topbar"><h1>Projetos</h1><div class="btns"><button class="btn" data-logout>Sair</button><button class="btn primary" data-new>Novo projeto</button></div></div>
    <div class="stats" data-stats></div>
    <div data-confirm></div>
    <div class="panel" data-list style="padding-block:6px"></div>
  </div>

  <div class="wrap hidden" data-view="form">
    <div class="topbar"><h1 data-form-title>Novo projeto</h1><button class="btn" data-cancel>← Voltar à lista</button></div>
    <form class="panel form-grid" data-form style="margin-bottom:60px">
      ${field("f-title", "Título *", `<input id="f-title" required placeholder="Sistema de gestão para a Padaria Bom Grão">`)}
      <div class="row">
        ${field("f-client", "Cliente ou segmento", `<input id="f-client" placeholder="Padaria, clínica, loja de peças…">`)}
        ${field("f-category", "Categoria", `<input id="f-category" list="cats" placeholder="Sistema empresarial"><datalist id="cats"><option>Sistema empresarial</option><option>PDV / Comércio</option><option>E-commerce</option><option>API / Integração</option><option>Dashboard</option><option>Site institucional</option><option>Mobile</option></datalist>`)}
      </div>
      <div class="row">
        ${field("f-year", "Ano", `<input id="f-year" inputmode="numeric" placeholder="2026">`)}
        ${field("f-status", "Status", `<select id="f-status"><option>Em produção</option><option>Concluído</option><option>Em andamento</option><option>Protótipo</option></select>`)}
      </div>
      ${field("f-summary", "Resumo, aparece no card *", `<input id="f-summary" required maxlength="180" placeholder="Uma frase sobre o problema resolvido.">`)}
      ${field("f-description", "Descrição completa", `<textarea id="f-description" placeholder="Contexto do cliente, o que foi desenvolvido e os resultados. Deixe uma linha em branco para começar um novo parágrafo."></textarea>`)}
      ${field("f-stack", "Tecnologias, separadas por vírgula", `<input id="f-stack" placeholder="React, Node.js, PostgreSQL">`)}
      <div class="row">
        ${field("f-live", "Link do sistema online", `<input id="f-live" type="url" placeholder="https://…">`)}
        ${field("f-repo", "Link do código", `<input id="f-repo" type="url" placeholder="https://github.com/…">`)}
      </div>
      ${field("f-cover-file", "Imagem de capa", `<input id="f-cover-file" type="file" accept="image/*"><div class="imgs" data-cover></div>`)}
      ${field("f-gallery-file", "Galeria (prints das telas)", `<input id="f-gallery-file" type="file" accept="image/*" multiple><div class="imgs" data-gallery></div>`)}
      <label class="check" for="f-featured"><input type="checkbox" id="f-featured"> Destacar no topo da lista</label>
      <div class="btns"><button class="btn primary" type="submit" data-save>Salvar e publicar</button></div>
    </form>
  </div>
  <div class="toast" data-toast role="status"></div>`;

/* ---------- armazenamento: GitHub ou memória ---------- */
const b64encode = (str) => { const b = new TextEncoder().encode(str); let s = ""; b.forEach((x) => (s += String.fromCharCode(x))); return btoa(s); };
const b64decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0)));

function githubBackend(cfg) {
  async function gh(path, opts = {}) {
    const res = await fetch(`https://api.github.com/repos/${cfg.repo}/${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = { 401: "Token inválido ou expirado. Gere um novo token e entre de novo.", 403: "O token não tem permissão de escrita neste repositório.", 404: "Repositório, branch ou arquivo não encontrado. Confira o nome do repositório.", 409: "O arquivo mudou enquanto você editava. Tente salvar de novo." }[res.status];
      throw new Error(msg || body.message || `Erro ${res.status} do GitHub`);
    }
    return res.json();
  }
  return {
    async read() {
      const f = await gh(`contents/${DATA_PATH}?ref=${encodeURIComponent(cfg.branch)}&t=${Date.now()}`);
      return { list: JSON.parse(b64decode(f.content)), sha: f.sha };
    },
    async write(list, sha, message) {
      await gh(`contents/${DATA_PATH}`, { method: "PUT", body: JSON.stringify({ message, content: b64encode(JSON.stringify(list, null, 2) + "\n"), sha, branch: cfg.branch }) });
    },
    async upload(img, slug) {
      const path = `${IMG_DIR}/${slug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${img.ext}`;
      await gh(`contents/${path}`, { method: "PUT", body: JSON.stringify({ message: `Imagem: ${path}`, content: img.dataUrl.split(",")[1], branch: cfg.branch }) });
      return path;
    },
  };
}

function memoryBackend(state) {
  return {
    async read() { return { list: structuredClone(state.list), sha: "demo" }; },
    async write(list) { state.list = structuredClone(list); state.onChange?.(state.list); },
    async upload(img) { return img.dataUrl; },
  };
}

/* ---------- imagens: redimensiona para no máximo 1600px antes de enviar ---------- */
function prepareImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Não foi possível ler esta imagem."));
      img.onload = () => {
        const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        const webp = c.toDataURL("image/webp", 0.85);
        resolve(webp.startsWith("data:image/webp") ? { dataUrl: webp, ext: "webp" } : { dataUrl: c.toDataURL("image/jpeg", 0.85), ext: "jpg" });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- painel ---------- */
// opts: { demo: {list, onChange} | undefined, base: prefixo para imagens do repositório, siteHref(slug) }
export function mountAdmin(root, opts = {}) {
  root.innerHTML = adminHTML();
  const q = (s) => root.querySelector(s);
  const base = opts.base ?? "../";
  const siteHref = opts.siteHref || ((slug) => `../projeto.html?p=${encodeURIComponent(slug)}`);
  const src = (i) => i.dataUrl || (/^(https?:|data:)/.test(i.path) ? i.path : base + i.path);

  let backend = null, projects = [], editing = null, cover = null, gallery = [];

  const toast = (msg, err = false) => {
    const t = q("[data-toast]");
    t.textContent = msg; t.className = `toast show${err ? " err" : ""}`;
    clearTimeout(toast.tm); toast.tm = setTimeout(() => (t.className = "toast"), err ? 6000 : 3500);
  };
  const show = (v) => { root.querySelectorAll("[data-view]").forEach((el) => el.classList.toggle("hidden", el.dataset.view !== v)); window.scrollTo?.(0, 0); };

  function renderList() {
    q("[data-confirm]").innerHTML = "";
    const live = projects.filter((p) => p.status === "Em produção").length;
    q("[data-stats]").innerHTML = `<span class="pill">${projects.length} publicados</span><span class="pill ok">${live} em produção</span><span class="pill warn">${projects.filter((p) => p.featured).length} em destaque</span>`;
    q("[data-list]").innerHTML = projects.length ? projects.map((p) => `
      <div class="list-item">
        <div class="thumb">${p.cover ? `<img src="${esc(src({ path: p.cover }))}" alt="">` : esc(p.title.slice(0, 2).toUpperCase())}</div>
        <div class="info"><b>${p.featured ? "★ " : ""}${esc(p.title)}</b><small>${pill(p.status)}<span>${esc([p.category, p.year].filter(Boolean).join(" · "))}</span></small></div>
        <div class="actions">
          <a class="btn sm" href="${siteHref(p.slug)}" ${opts.demo ? `data-open="${esc(p.slug)}"` : 'target="_blank"'}>Ver no site</a>
          <button class="btn sm" data-edit="${esc(p.slug)}">Editar</button>
          <button class="btn sm danger" data-del="${esc(p.slug)}">Excluir</button>
        </div>
      </div>`).join("") : `<p class="hint" style="text-align:center;padding:28px 0">Nenhum projeto ainda. Clique em Novo projeto para cadastrar o primeiro.</p>`;
    root.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => openForm(b.dataset.edit)));
    root.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => askDelete(b.dataset.del)));
    root.querySelectorAll("[data-open]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); opts.onOpenProject?.(a.dataset.open); }));
  }

  async function loadList() {
    q("[data-list]").innerHTML = `<p class="hint" style="padding:20px 0">Carregando projetos…</p>`;
    projects = (await backend.read()).list;
    renderList();
  }

  // confirmação dentro da página (sem confirm() do navegador)
  function askDelete(slug) {
    const p = projects.find((x) => x.slug === slug);
    q("[data-confirm]").innerHTML = `<div class="confirm-bar"><span>Excluir <b>${esc(p.title)}</b> do portfólio?</span><span class="btns"><button class="btn sm" data-no>Cancelar</button><button class="btn sm danger" data-yes>Excluir</button></span></div>`;
    q("[data-no]").onclick = () => (q("[data-confirm]").innerHTML = "");
    q("[data-yes]").onclick = async () => {
      try {
        const { list, sha } = await backend.read();
        const next = list.filter((x) => x.slug !== slug);
        await backend.write(next, sha, `Remove projeto: ${p.title}`);
        projects = next; renderList();
        toast(opts.demo ? "Projeto excluído." : "Projeto excluído. O site atualiza em cerca de 1 minuto.");
      } catch (e) { toast(e.message, true); }
    };
  }

  function renderImages() {
    q("[data-cover]").innerHTML = cover ? `<figure><img src="${esc(src(cover))}" alt=""><button type="button" data-rm-cover aria-label="Remover capa">×</button></figure>` : "";
    q("[data-gallery]").innerHTML = gallery.map((g, i) => `<figure><img src="${esc(src(g))}" alt=""><button type="button" data-rm-g="${i}" aria-label="Remover imagem">×</button></figure>`).join("");
    q("[data-rm-cover]")?.addEventListener("click", () => { cover = null; renderImages(); });
    root.querySelectorAll("[data-rm-g]").forEach((b) => b.addEventListener("click", () => { gallery.splice(+b.dataset.rmG, 1); renderImages(); }));
  }

  function openForm(slug = null) {
    editing = slug;
    const p = projects.find((x) => x.slug === slug) || {};
    q("[data-form-title]").textContent = slug ? "Editar projeto" : "Novo projeto";
    const set = (id, v) => (q(`#${id}`).value = v ?? "");
    set("f-title", p.title); set("f-client", p.client); set("f-category", p.category);
    set("f-year", p.year || String(new Date().getFullYear())); set("f-status", p.status || "Em produção");
    set("f-summary", p.summary); set("f-description", p.description); set("f-stack", (p.stack || []).join(", "));
    set("f-live", p.liveUrl); set("f-repo", p.repoUrl);
    q("#f-featured").checked = !!p.featured;
    q("#f-cover-file").value = ""; q("#f-gallery-file").value = "";
    cover = p.cover ? { path: p.cover } : null;
    gallery = (p.gallery || []).map((path) => ({ path }));
    renderImages();
    show("form");
  }

  async function save(ev) {
    ev.preventDefault();
    const btn = q("[data-save]");
    btn.disabled = true;
    try {
      const v = (id) => q(`#${id}`).value.trim();
      const { list } = await backend.read();
      let slug = editing;
      if (!slug) { const b = slugify(v("f-title")); slug = b; let n = 2; while (list.some((x) => x.slug === slug)) slug = `${b}-${n++}`; }

      btn.textContent = "Enviando imagens…";
      const up = async (i) => (i.path ? i.path : backend.upload(i, slug));
      const coverPath = cover ? await up(cover) : "";
      const galleryPaths = [];
      for (const g of gallery) galleryPaths.push(await up(g));

      const old = list.find((x) => x.slug === slug) || {};
      const project = {
        slug, title: v("f-title"), client: v("f-client"), category: v("f-category"), year: v("f-year"),
        status: q("#f-status").value, featured: q("#f-featured").checked, summary: v("f-summary"), description: v("f-description"),
        stack: v("f-stack").split(",").map((s) => s.trim()).filter(Boolean),
        cover: coverPath, gallery: galleryPaths, liveUrl: v("f-live"), repoUrl: v("f-repo"),
        createdAt: old.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(),
      };

      btn.textContent = "Publicando…";
      const fresh = await backend.read(); // relê para pegar a versão mais recente
      const next = editing ? fresh.list.map((x) => (x.slug === slug ? project : x)) : [project, ...fresh.list];
      await backend.write(next, fresh.sha, `${editing ? "Atualiza" : "Adiciona"} projeto: ${project.title}`);
      projects = next; renderList(); show("list");
      toast(opts.demo ? "Projeto publicado. Abra a aba Site para ver." : "Projeto publicado. O site atualiza em cerca de 1 minuto.");
    } catch (e) { toast(e.message, true); }
    finally { btn.disabled = false; btn.textContent = "Salvar e publicar"; }
  }

  /* eventos */
  q("[data-login]").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const cfg = { repo: q("#l-repo").value.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/$/, ""), branch: q("#l-branch").value.trim() || "main", token: q("#l-token").value.trim() };
    backend = opts.demo ? memoryBackend(opts.demo) : githubBackend(cfg);
    try {
      await loadList();
      if (!opts.demo) try { localStorage.setItem(STORE_KEY, JSON.stringify(cfg)); } catch {}
      show("list");
    } catch (e) { toast(e.message, true); }
  });
  q("[data-logout]").addEventListener("click", () => {
    try { localStorage.removeItem(STORE_KEY); } catch {}
    backend = null; q("#l-token").value = ""; show("login");
  });
  q("[data-new]").addEventListener("click", () => openForm(null));
  q("[data-cancel]").addEventListener("click", () => show("list"));
  q("[data-form]").addEventListener("submit", save);
  q("#f-cover-file").addEventListener("change", async (e) => {
    try { const f = e.target.files[0]; if (f) { cover = await prepareImage(f); renderImages(); } } catch (err) { toast(err.message, true); }
  });
  q("#f-gallery-file").addEventListener("change", async (e) => {
    try { for (const f of e.target.files) gallery.push(await prepareImage(f)); } catch (err) { toast(err.message, true); }
    e.target.value = ""; renderImages();
  });

  /* início */
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch {}
  if (opts.demo) {
    backend = memoryBackend(opts.demo);
    q("#l-repo").value = "marcusfilipem1/sucram.dev";
    return { show, loadList: () => loadList().then(() => show("list")), openForm };
  }
  if (saved?.token) {
    q("#l-repo").value = saved.repo; q("#l-branch").value = saved.branch;
    backend = githubBackend(saved);
    loadList().then(() => show("list")).catch((e) => { toast(e.message, true); show("login"); });
  } else {
    const m = location.hostname.match(/^([^.]+)\.github\.io$/);
    // usuario.github.io/<repo>/admin → usuario/<repo>; usuario.github.io/admin → usuario/usuario.github.io
    const seg = location.pathname.split("/").filter(Boolean)[0];
    if (m) q("#l-repo").value = seg && seg !== "admin" ? `${m[1]}/${seg}` : `${m[1]}/${m[1]}.github.io`;
    show("login");
  }
}
