import { getJSON, projectHTML, withCodes, esc } from "./common.js";
import { mountQuote, mountWhatsApp } from "./ui.js";

(async () => {
  const slug = new URLSearchParams(location.search).get("p");
  const [profile, list] = await Promise.all([getJSON("data/profile.json"), getJSON("data/projects.json")]);
  const p = withCodes(list).find((x) => x.slug === slug);
  document.title = p ? `${p.title} — ${profile.handle}.dev` : `Projeto não encontrado — ${profile.handle}.dev`;
  document.querySelector("#brand").innerHTML = `${esc(profile.handle)}<span>.dev</span>`;
  document.querySelector("#foot").textContent = `© ${new Date().getFullYear()} ${profile.name}`;
  document.querySelector("#main").innerHTML = projectHTML(p, "./#projetos");
  mountQuote(profile);
  mountWhatsApp(profile);
})();
