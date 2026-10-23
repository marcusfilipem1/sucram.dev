import { getJSON, homeHTML, footerHTML, brandHTML, mountGrid, sortProjects, withCodes, esc } from "./common.js";
import { mountHeroDeck, mountQuote, mountWhatsApp } from "./ui.js";
import { applyStatic, fixLegacyLang } from "./i18n.js";

// A página já chega pronta em HTML (gerada no deploy, boa para o Google).
// Aqui o script atualiza com os dados mais recentes e liga as partes interativas.
(async () => {
  fixLegacyLang();
  const main = document.querySelector("#main");
  try {
    const [profile, list] = await Promise.all([getJSON("/data/profile.json"), getJSON("/data/projects.json")]);
    const projects = sortProjects(withCodes(list));
    document.querySelector("#brand").innerHTML = brandHTML(profile.handle);
    main.innerHTML = homeHTML(profile, projects);
    document.querySelector("#rodape").innerHTML = footerHTML(profile, "");
    applyStatic();
    const href = (slug) => `projetos/${encodeURIComponent(slug)}/`;
    mountGrid(main, projects, href);
    mountHeroDeck(main.querySelector("[data-hero-mock]"), projects, href);
    mountQuote(profile, main.querySelector("[data-inline-form]"));
    mountWhatsApp(profile);
  } catch (e) {
    console.error(e);
    if (!main.querySelector("section")) main.innerHTML = `<div class="wrap" style="padding-block:80px"><div class="empty">${esc("Não foi possível carregar o portfólio. Recarregue a página.")}</div></div>`;
  }
})();
