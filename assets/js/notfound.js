import { getJSON } from "./common.js";
import { mountQuote, mountWhatsApp } from "./ui.js";

// página 404: só liga o botão de orçamento e o WhatsApp
getJSON("/data/profile.json").then((profile) => { mountQuote(profile); mountWhatsApp(profile); });
