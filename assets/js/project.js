import { getJSON, projectHTML, footerHTML, brandHTML, withCodes } from "./common.js";
import { mountQuote, mountWhatsApp } from "./ui.js";
import { applyStatic, fixLegacyLang, curLang } from "./i18n.js";

// Endereço do projeto: /projetos/<slug>/ (ou /en/projetos/<slug>/).
// O antigo projeto.html?p=<slug> redireciona para ele.
(async () => {
  const fromPath = location.pathname.match(/\/projetos\/([^/]+)\/?$/)?.[1];
  const fromQuery = new URLSearchParams(location.search).get("p");
  if (!fromPath && fromQuery) {
    location.replace(`${curLang() === "en" ? "/en" : ""}/projetos/${encodeURIComponent(fromQuery)}/${location.hash}`);
    return;
  }
  fixLegacyLang();
  const slug = decodeURIComponent(fromPath || "");
  const home = curLang() === "en" ? "/en/" : "/";
  const [profile, list] = await Promise.all([getJSON("/data/profile.json"), getJSON("/data/projects.json")]);
  const p = withCodes(list).find((x) => x.slug === slug);
  document.querySelector("#brand").innerHTML = brandHTML(profile.handle);
  document.querySelector("#main").innerHTML = projectHTML(p, `${home}#projetos`);
  document.querySelector("#rodape").innerHTML = footerHTML(profile, home);
  applyStatic();
  mountQuote(profile);
  mountWhatsApp(profile);
})();
