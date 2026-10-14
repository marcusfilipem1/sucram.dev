import { getJSON, homeHTML, footerHTML, brandHTML, mountGrid, sortProjects, withCodes, esc } from "./common.js";
import { mountHeroMock, mountSimulator, mountQuote, mountWhatsApp } from "./ui.js";
import { applyStatic, pick } from "./i18n.js";

(async () => {
  const main = document.querySelector("#main");
  try {
    const [profile, list] = await Promise.all([getJSON("data/profile.json"), getJSON("data/projects.json")]);
    const projects = sortProjects(withCodes(list));
    document.title = `${profile.handle}.dev — ${profile.name}, ${pick(profile, "role")}`;
    document.querySelector("#brand").innerHTML = brandHTML(profile.handle);
    main.innerHTML = homeHTML(profile, projects);
    document.querySelector("#rodape").innerHTML = footerHTML(profile);
    applyStatic();
    mountGrid(main, projects, (slug) => `projeto.html?p=${encodeURIComponent(slug)}`);
    mountHeroMock(main.querySelector("[data-hero-mock]"));
    const openQuote = mountQuote(profile, main.querySelector("[data-inline-form]"));
    mountSimulator(main.querySelector("[data-sim]"), openQuote);
    mountWhatsApp(profile);
  } catch (e) {
    main.innerHTML = `<div class="wrap" style="padding-block:80px"><div class="empty">${esc("Não foi possível carregar o portfólio. Recarregue a página.")}</div></div>`;
    console.error(e);
  }
})();
