import { getJSON, homeHTML, mountGrid, sortProjects, withCodes, esc } from "./common.js";
import { mountHeroMock, mountSimulator, mountQuote, mountWhatsApp } from "./ui.js";

(async () => {
  const main = document.querySelector("#main");
  try {
    const [profile, list] = await Promise.all([getJSON("data/profile.json"), getJSON("data/projects.json")]);
    const projects = sortProjects(withCodes(list));
    document.title = `${profile.handle}.dev — ${profile.name}, ${profile.role}`;
    document.querySelector("#brand").innerHTML = `${esc(profile.handle)}<span>.dev</span>`;
    document.querySelector("#foot").textContent = `© ${new Date().getFullYear()} ${profile.name}`;
    main.innerHTML = homeHTML(profile, projects);
    mountGrid(main, projects, (slug) => `projeto.html?p=${encodeURIComponent(slug)}`);
    mountHeroMock(main.querySelector("[data-hero-mock]"));
    const openQuote = mountQuote(profile, main.querySelector("[data-inline-form]"));
    mountSimulator(main.querySelector("[data-sim]"), openQuote);
    mountWhatsApp(profile);
  } catch (e) {
    main.innerHTML = `<div class="wrap" style="padding-block:80px"><div class="empty">Não foi possível carregar o portfólio. Recarregue a página.</div></div>`;
    console.error(e);
  }
})();
