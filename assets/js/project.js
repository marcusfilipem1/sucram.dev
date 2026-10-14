import { getJSON, projectHTML, footerHTML, brandHTML, withCodes } from "./common.js";
import { mountQuote, mountWhatsApp } from "./ui.js";
import { applyStatic, pick, t } from "./i18n.js";

(async () => {
  const slug = new URLSearchParams(location.search).get("p");
  const [profile, list] = await Promise.all([getJSON("data/profile.json"), getJSON("data/projects.json")]);
  const p = withCodes(list).find((x) => x.slug === slug);
  document.title = `${p ? pick(p, "title") : t("not_found")} — ${profile.handle}.dev`;
  document.querySelector("#brand").innerHTML = brandHTML(profile.handle);
  document.querySelector("#main").innerHTML = projectHTML(p, "./#projetos");
  document.querySelector("#rodape").innerHTML = footerHTML(profile, "./");
  applyStatic();
  mountQuote(profile);
  mountWhatsApp(profile);
})();
