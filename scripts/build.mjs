// Gera o site estático em dist/ a cada publicação (a Cloudflare roda "node scripts/build.mjs").
// Cada página já sai com o conteúdo em HTML, título e descrição próprios, versão em inglês,
// dados estruturados para o Google, sitemap.xml e robots.txt.
import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setCurrentLang, t, pick, altPath } from "../assets/js/i18n.js";
import { homeHTML, footerHTML, brandHTML, projectHTML, gridHTML, filtersHTML, sortProjects, withCodes, esc, assetUrl } from "../assets/js/common.js";
import { siteMockHTML } from "../assets/js/ui.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "dist");
const json = async (p) => JSON.parse(await readFile(join(ROOT, p), "utf8"));

const profile = await json("data/profile.json");
const projects = sortProjects(withCodes(await json("data/projects.json")));
const SITE = (profile.siteUrl || "https://sucram.pages.dev").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);
const abs = (path) => SITE + path;
const clip = (s = "", n = 155) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s);
const ldJSON = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

const FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap";

function shell({ lang, path, title, description, main, script, ld = [], image, type = "website", isHome }) {
  const home = lang === "en" ? "/en/" : "/";
  const ptPath = altPath(path, "pt"), enPath = altPath(path, "en");
  const other = lang === "en" ? "pt" : "en";
  const anchor = (id) => (isHome ? `#${id}` : `${home}#${id}`);
  const img = abs(image || (lang === "en" ? "/assets/og-image-en.png" : "/assets/og-image.png"));
  const footer = footerHTML(profile, isHome ? "" : home).replace(
    '<a href="#" data-lang-switch data-lang-full></a>',
    `<a href="${altPath(path, other)}" hreflang="${other === "en" ? "en" : "pt-BR"}" lang="${other === "en" ? "en" : "pt-BR"}" data-lang-switch data-lang-full>${lang === "en" ? "Português" : "English"}</a>`
  );
  return `<!doctype html>
<html lang="${lang === "en" ? "en" : "pt-BR"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="${esc(profile.name)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#1d4ed8">
  <link rel="canonical" href="${abs(path)}">
  <link rel="alternate" hreflang="pt-BR" href="${abs(ptPath)}">
  <link rel="alternate" hreflang="en" href="${abs(enPath)}">
  <link rel="alternate" hreflang="x-default" href="${abs(ptPath)}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${esc(profile.handle)}.dev">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${abs(path)}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${lang === "en" ? "en_US" : "pt_BR"}">
  <meta property="og:locale:alternate" content="${lang === "en" ? "pt_BR" : "en_US"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${img}">
  <link rel="icon" href="/assets/logo.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/logo-512.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONTS}" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
  ${ld.map(ldJSON).join("\n  ")}
</head>
<body>
  <nav class="nav" aria-label="${lang === "en" ? "Main" : "Principal"}">
    <div class="wrap">
      <a class="brand" id="brand" href="${home}" aria-label="${esc(profile.handle)}.dev">${brandHTML(profile.handle)}</a>
      <ul>
        <li><a href="${anchor("projetos")}" data-i18n="nav_projects">${t("nav_projects")}</a></li>
        <li class="hide-sm"><a href="${anchor("simulador")}" data-i18n="nav_sim">${t("nav_sim")}</a></li>
        <li class="hide-sm"><a href="${anchor("faq")}" data-i18n="nav_faq">${t("nav_faq")}</a></li>
        <li class="hide-sm"><a href="${anchor("contato")}" data-i18n="nav_contact">${t("nav_contact")}</a></li>
        <li><a class="lang-btn" href="${altPath(path, other)}" hreflang="${other === "en" ? "en" : "pt-BR"}" lang="${other === "en" ? "en" : "pt-BR"}" aria-label="${t("lang_switch_label")}" data-lang-switch>${t("lang_switch")}</a></li>
        <li><button class="btn primary sm" data-quote data-i18n="nav_quote">${t("nav_quote")}</button></li>
      </ul>
    </div>
  </nav>
  <main id="main">${main}</main>
  <footer class="site" id="rodape">${footer}</footer>
  <script type="module" src="${script}"></script>
</body>
</html>
`;
}

// dados estruturados (schema.org) do negócio, lidos pelo Google
function businessLD(lang) {
  const services = pick(profile, "services") || [];
  const sameAs = [profile.linkedin, profile.github].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${SITE}/#negocio`,
        name: `${profile.handle}.dev`,
        alternateName: `${profile.name} — ${pick(profile, "role")}`,
        description: pick(profile, "seo")?.description || pick(profile, "bio"),
        url: abs(lang === "en" ? "/en/" : "/"),
        logo: abs("/assets/logo-512.png"),
        image: abs(lang === "en" ? "/assets/og-image-en.png" : "/assets/og-image.png"),
        email: profile.email,
        telephone: profile.whatsapp ? `+${profile.whatsapp}` : undefined,
        address: { "@type": "PostalAddress", addressCountry: "BR" },
        areaServed: { "@type": "Place", name: lang === "en" ? "Worldwide" : "Brasil e exterior (atendimento online)" },
        availableLanguage: ["pt-BR", "en"],
        knowsAbout: lang === "en" ? ["Website design", "Web development", "Landing pages", "Online stores", "SEO", "Management systems", ...(profile.stack || [])] : ["Criação de sites", "Desenvolvimento de sites", "Site profissional", "Landing pages", "Lojas virtuais", "SEO", "Sistemas de gestão", ...(profile.stack || [])],
        founder: { "@type": "Person", "@id": `${SITE}/#pessoa`, name: profile.name, jobTitle: pick(profile, "role"), sameAs },
        sameAs,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: lang === "en" ? "Services" : "Serviços",
          itemListElement: services.map((s) => ({ "@type": "Offer", areaServed: { "@type": "Place", name: lang === "en" ? "Worldwide" : "Brasil e exterior" }, itemOffered: { "@type": "Service", name: s.title, description: s.text, provider: { "@id": `${SITE}/#negocio` } } })),
        },
      },
      { "@type": "WebSite", "@id": `${SITE}/#site`, url: abs("/"), name: `${profile.handle}.dev`, inLanguage: ["pt-BR", "en"], publisher: { "@id": `${SITE}/#negocio` } },
    ],
  };
}
const faqLD = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: t("faq").map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

async function write(path, html) {
  const file = join(OUT, path.endsWith("/") ? path + "index.html" : path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
for (const dir of ["assets", "data", "admin"]) await cp(join(ROOT, dir), join(OUT, dir), { recursive: true });

const urls = [];
for (const lang of ["pt", "en"]) {
  setCurrentLang(lang);
  const home = lang === "en" ? "/en/" : "/";
  const seo = pick(profile, "seo") || {};

  // página inicial: conteúdo completo, com a grade de projetos e a prévia de site já preenchidas
  let main = homeHTML(profile, projects)
    .replace('<div class="filters" id="filters" role="toolbar" aria-label="' + t("filter_label") + '"></div>',
      '<div class="filters" id="filters" role="toolbar" aria-label="' + t("filter_label") + '">' + filtersHTML(projects, "Todos") + "</div>")
    .replace('<div class="grid" id="grid"></div>', `<div class="grid" id="grid">${gridHTML(projects, "Todos", (slug) => `projetos/${encodeURIComponent(slug)}/`)}</div>`)
    .replace('<div class="hero-mock" data-hero-mock></div>', `<div class="hero-mock" data-hero-mock>${siteMockHTML("clinica")}</div>`);
  await write(home, shell({ lang, path: home, title: seo.title, description: seo.description, main, script: "/assets/js/main.js", ld: [businessLD(lang), faqLD()], isHome: true }));
  urls.push(home);

  // uma página por projeto
  for (const p of projects) {
    const path = `${home}projetos/${encodeURIComponent(p.slug)}/`;
    const title = pick(p, "title");
    const description = clip(pick(p, "summary") || pick(p, "description") || seo.description);
    const ld = [
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: title,
        description,
        url: abs(path),
        inLanguage: lang === "en" ? "en" : "pt-BR",
        genre: p.category,
        dateCreated: p.year || undefined,
        image: p.cover ? abs(assetUrl(p.cover)) : undefined,
        keywords: (p.stack || []).join(", ") || undefined,
        creator: { "@id": `${SITE}/#pessoa`, "@type": "Person", name: profile.name },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: lang === "en" ? "Home" : "Início", item: abs(home) },
          { "@type": "ListItem", position: 2, name: t("projects_title"), item: abs(`${home}#projetos`) },
          { "@type": "ListItem", position: 3, name: title, item: abs(path) },
        ],
      },
    ];
    const image = p.cover ? assetUrl(p.cover) : undefined;
    await write(path, shell({ lang, path, title: `${title} | ${profile.handle}.dev`, description, main: projectHTML(p, `${home}#projetos`), script: "/assets/js/project.js", ld, image, type: "article" }));
    urls.push(path);
  }
}

// endereço antigo dos projetos (projeto.html?p=…): redireciona e não entra no Google
setCurrentLang("pt");
await write("projeto.html", (await readFile(join(ROOT, "projeto.html"), "utf8"))
  .replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n  <meta name="viewport"')
  .replaceAll('href="assets/', 'href="/assets/').replaceAll('src="assets/', 'src="/assets/'));

// página 404 (sem ela a Cloudflare devolveria a página inicial para qualquer endereço)
await write("404.html", shell({
  lang: "pt", path: "/404.html", title: `Página não encontrada | ${profile.handle}.dev`, description: profile.seo?.description || "",
  main: `<div class="wrap p-hero"><a class="back" href="/">← Voltar ao início</a><h1 style="margin-top:20px">Página não encontrada</h1><p class="lead">O endereço pode ter mudado. Veja os projetos na página inicial ou fale comigo pelo WhatsApp.</p><p class="lead" lang="en">Page not found. <a href="/en/">Go to the English homepage</a>.</p></div>`,
  script: "/assets/js/notfound.js",
}).replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex">'));

await write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /projeto.html\n\nSitemap: ${SITE}/sitemap.xml\n`);

const entry = (path) => {
  const pt = altPath(path, "pt"), en = altPath(path, "en");
  return `  <url>
    <loc>${abs(path)}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${abs(pt)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${abs(en)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(pt)}"/>
  </url>`;
};
await write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(entry).join("\n")}
</urlset>
`);

// painel fora do Google e cache curto para os dados dos projetos
await write("_headers", `/admin/*
  X-Robots-Tag: noindex, nofollow
/data/*
  Cache-Control: no-cache
`);

console.log(`Site gerado em dist/ com ${urls.length} páginas.`);
