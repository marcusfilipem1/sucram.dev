// Idiomas do site: português (padrão) e inglês.
// O idioma vem de ?lang=en|pt, depois da escolha salva, depois do idioma do navegador.

const KEY = "sucram-lang";

export function getLang() {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "en" || q === "pt") return q;
  try { const s = localStorage.getItem(KEY); if (s === "en" || s === "pt") return s; } catch {}
  return /^pt\b/i.test(navigator.language || "pt") ? "pt" : "en";
}

export function setLang(lang) {
  try { localStorage.setItem(KEY, lang); } catch {}
  const u = new URL(location.href);
  u.searchParams.delete("lang");
  location.replace(u.toString());
}

export let lang = getLang();
export const setCurrentLang = (l) => (lang = l); // usado pela prévia
export const curLang = () => lang;

const STR = {
  pt: {
    doc_title: "Criação de sites e sistemas para empresas",
    nav_projects: "Projetos", nav_sim: "Simulador", nav_faq: "Dúvidas", nav_contact: "Contato", nav_quote: "Orçamento",
    lang_switch: "EN", lang_switch_label: "Read in English",
    hero_quote: "Pedir orçamento", hero_wa: "Chamar no WhatsApp", hero_hint: "Resposta em até 1 dia útil. A primeira conversa não tem custo.",
    kpi_projects: "Projetos entregues", kpi_live: "Em produção agora", kpi_areas: "Áreas atendidas", kpi_service: "Atendimento", kpi_service_v: "Remoto e RJ",
    segments_label: "Segmentos atendidos",
    segments: ["Padarias", "Mercados", "Autopeças", "Clínicas", "Oficinas", "Restaurantes", "Materiais de construção", "Pet shops", "Lojas de roupa", "Distribuidoras"],
    portfolio: "Portfólio", projects_title: "Projetos entregues", filter_label: "Filtrar por categoria", all: "Todos", empty: "Nenhum projeto publicado ainda.",
    sim_label: "Simulador", sim_title: "Veja como pode ficar o seu site", sim_sub: "Digite o nome da empresa, escolha o segmento, as seções e a cor. A prévia muda na hora e o pedido de orçamento já vai preenchido.",
    sim_tab_site: "Site", sim_tab_system: "Sistema de gestão", sim_tabs_label: "O que você quer ver",
    sim_sections: "Seções do site", sim_color: "Cor principal", site_btn: "Quero um site assim",
    site_msg: (seg, secs) => `Quero um site para: ${seg}\nSeções: ${secs || "a definir"}\n\n`,
    services_label: "Serviços", services_title: "O que eu faço", service_cta: "Quero um orçamento →",
    process_label: "Como trabalho", process_title: "Da primeira conversa ao site no ar",
    steps: [
      ["Conversa", "Uma chamada de 30 minutos, sem custo, para entender o seu negócio, o seu público e o que o site precisa resolver."],
      ["Proposta", "Páginas, prazo e valor fechados por escrito. Você sabe exatamente o que vai receber."],
      ["Criação", "Você acompanha o site sendo montado em um endereço de teste e pede ajustes antes de publicar."],
      ["No ar e no Google", "Publico no seu domínio, cadastro no Google e acompanho as primeiras semanas."],
    ],
    about_label: "Sobre", about_title: "Do primeiro rascunho ao site no ar.", about_intro: (name, role) => `Sou ${name}, ${role.toLowerCase()}.`, stack_label: "Tecnologias",
    faq_label: "Dúvidas frequentes", faq_title: "Perguntas antes de começar", faq_more: "Não achou sua dúvida?", faq_more_cta: "Mande uma mensagem",
    faq: [
      ["Quanto custa um site?", "Depende do número de páginas e do que o site precisa fazer. Uma landing page sai mais barata que um site completo, e uma loja virtual custa mais que os dois. Depois da conversa inicial envio uma proposta com valor fechado, sem surpresas."],
      ["Em quanto tempo o site fica pronto?", "Uma landing page fica pronta em cerca de 1 semana e um site institucional em 2 a 4 semanas, dependendo de quando os textos e as fotos chegam. O prazo vai escrito na proposta."],
      ["O site vai aparecer no Google?", "Sim. O site é feito com as boas práticas de SEO, carrega rápido no celular e eu cadastro a empresa no Google Search Console e no Google Meu Negócio."],
      ["Preciso pagar domínio e hospedagem?", "O domínio .com.br tem uma taxa anual baixa, paga direto no Registro.br e registrada em seu nome. Para a maioria dos sites a hospedagem pode ser gratuita, e eu indico a melhor opção para o seu caso."],
      ["Consigo atualizar o site depois?", "Sim. Posso entregar um painel para você trocar textos, fotos e preços sozinho, ou cuidar das atualizações para você."],
      ["Você também faz sistemas?", "Sim. Desenvolvo sistemas de gestão sob medida, como estoque, caixa, agenda e ordens de serviço, e integro o site com o sistema quando faz sentido. Use o simulador para ver um exemplo."],
      ["Atende empresas de fora do Brasil?", "Sim. O trabalho é remoto, com reuniões por vídeo em português ou inglês. Na região de Maricá e Niterói, posso ir até a empresa."],
    ],
    contact_label: "Contato", contact_title: "Vamos colocar a sua empresa na internet?", contact_text: "Conte sobre o seu negócio e o que você precisa. Respondo com uma proposta e um prazo.",
    contact_alt: "Prefere conversar direto? Os contatos estão no rodapé.",
    footer_tagline: "Sites e sistemas para empresas e comércios.", footer_contact: "Contato", footer_nav: "Navegação", footer_admin: "Painel",
    wa_default: "Olá! Vi seu portfólio e quero um orçamento de site.",
    // projeto
    back: "← Todos os projetos", not_found: "Projeto não encontrado", f_client: "Cliente", f_category: "Categoria", f_year: "Ano", f_code: "Registro",
    open_system: "Ver no ar ↗", see_code: "Ver código ↗", tech: "Tecnologias", cta_title: "Precisa de algo parecido?", cta_text: "Conte sobre a sua empresa e eu monto uma proposta.", cta_btn: "Quero um projeto assim",
    cover_alt: (t) => `Tela do projeto ${t}`,
    // formulário
    modal_label: "Orçamento sem compromisso", modal_title: "Conte sobre o seu projeto", close: "Fechar",
    f_name: "Nome", f_company: "Empresa", f_email: "E-mail", f_phone: "WhatsApp", f_country: "País", f_type: "Tipo de projeto", f_msg: "Conte sobre o projeto",
    f_msg_ph: "O que a empresa faz, quem são os clientes e o que o site ou sistema precisa ter.",
    types: { "Site": "Site", "Sistema de gestão": "Sistema de gestão", "Integração / API": "Integração / API", "Outro": "Outro" },
    send: "Enviar pedido", sending: "Enviando…", privacy: "Seus dados são usados só para responder este contato.",
    sent_title: "Pedido enviado", sent_text: "Recebi suas informações e respondo em até 1 dia útil, por e-mail ou WhatsApp.", sent_wa: "Falar agora no WhatsApp", sent_again: "Enviar outro pedido",
    sent_wa_msg: (n) => `Olá, sou ${n}. Acabei de enviar um pedido de orçamento pelo site.`,
    send_fail: "Não consegui enviar agora. Tente de novo ou", send_fail_link: "fale direto pelo WhatsApp",
    e_name: "Informe seu nome.", e_email_empty: "Informe seu e-mail.", e_email: "E-mail inválido. Confira, ex.: nome@empresa.com.br",
    e_msg: "Conte um pouco sobre o projeto (mínimo de 10 caracteres).",
    e_phone_empty: "Informe seu WhatsApp.", e_phone_short: "Número incompleto. Inclua o DDD, ex.: (21) 99999-9999.", e_phone_long: "Número longo demais. Use só DDD e número.",
    e_ddd: (d) => `DDD ${d} não existe. Confira os dois primeiros dígitos.`, e_mobile9: "Celular com 11 dígitos começa com 9 depois do DDD.",
    e_intl: "Número inválido para o país escolhido. Confira os dígitos.", e_other: "Digite o número com o código do país, ex.: +44 20 7946 0958.",
    phone_ph_br: "(21) 99999-9999", phone_ph_intl: "Número com código de área", phone_ph_other: "+44 20 7946 0958",
    other_country: "Outro país",
    // botão flutuante
    fab_title: "Fale comigo", fab_text: "Respondo pelo WhatsApp em horário comercial (Brasília). Se preferir, mande os detalhes pelo formulário.", fab_wa: "Abrir WhatsApp", fab_form: "Preencher formulário", fab_open: "Abrir contato",
    // simulador
    sim_company: "Nome da empresa", sim_segment: "Segmento", sim_modules: "Módulos", sim_btn: "Quero um sistema assim", sim_hint: "Os dados digitados ficam só nesta página até você enviar o pedido.",
    sim_msg: (seg, mods) => `Segmento: ${seg}\nMódulos: ${mods || "a definir"}\n\n`, home: "Início",
    from_project: (t) => `Vi o projeto "${t}" no seu portfólio e preciso de algo parecido.\n\n`,
  },
  en: {
    doc_title: "Websites and custom software for businesses",
    nav_projects: "Projects", nav_sim: "Simulator", nav_faq: "FAQ", nav_contact: "Contact", nav_quote: "Get a quote",
    lang_switch: "PT", lang_switch_label: "Ler em português",
    hero_quote: "Get a quote", hero_wa: "Message on WhatsApp", hero_hint: "Reply within 1 business day. The first call is free.",
    kpi_projects: "Projects delivered", kpi_live: "Live right now", kpi_areas: "Industries served", kpi_service: "Working", kpi_service_v: "Remote, worldwide",
    segments_label: "Industries served",
    segments: ["Bakeries", "Grocery stores", "Auto parts", "Clinics", "Repair shops", "Restaurants", "Building supplies", "Pet shops", "Clothing stores", "Distributors"],
    portfolio: "Portfolio", projects_title: "Delivered projects", filter_label: "Filter by category", all: "All", empty: "No projects published yet.",
    sim_label: "Simulator", sim_title: "See what your website could look like", sim_sub: "Type your company name and pick your industry, sections and color. The preview updates as you go, and your quote request comes pre-filled.",
    sim_tab_site: "Website", sim_tab_system: "Business system", sim_tabs_label: "What you want to preview",
    sim_sections: "Website sections", sim_color: "Main color", site_btn: "I want a website like this",
    site_msg: (seg, secs) => `I need a website for: ${seg}\nSections: ${secs || "to be defined"}\n\n`,
    services_label: "Services", services_title: "What I do", service_cta: "Get a quote →",
    process_label: "How I work", process_title: "From the first call to a live website",
    steps: [
      ["Call", "A free 30-minute call to understand your business, your customers and what the website needs to achieve."],
      ["Proposal", "Pages, timeline and price agreed in writing. You know exactly what you will get."],
      ["Build", "You follow the website as it takes shape on a test address and ask for changes before launch."],
      ["Live and on Google", "I publish it on your domain, submit it to Google and stay close for the first weeks."],
    ],
    about_label: "About", about_title: "From the first sketch to a live website.", about_intro: (name, role) => `I'm ${name}, a ${role.toLowerCase()} based in Brazil.`, stack_label: "Technologies",
    faq_label: "FAQ", faq_title: "Questions before we start", faq_more: "Didn't find your question?", faq_more_cta: "Send me a message",
    faq: [
      ["How much does a website cost?", "It depends on the number of pages and what the site needs to do. A landing page costs less than a full website, and an online store costs more than both. After our first call I send a fixed-price proposal, with no surprises."],
      ["How long does it take?", "A landing page takes about 1 week and a company website 2 to 4 weeks, depending on when the texts and photos arrive. The timeline is written into the proposal."],
      ["Will my website show up on Google?", "Yes. The site follows SEO best practices, loads fast on phones, and I submit it to Google Search Console and set up your Google Business Profile."],
      ["Do I need to pay for a domain and hosting?", "A domain usually costs a small yearly fee, registered in your name. For most websites hosting can be free, and I recommend the best option for your case."],
      ["Can I update the website myself?", "Yes. I can give you a simple admin panel to change texts, photos and prices, or handle the updates for you."],
      ["Do you also build systems?", "Yes. I build custom management systems such as inventory, checkout, scheduling and work orders, and connect them to your website when it makes sense. Try the simulator to see an example."],
      ["Do you work with clients outside Brazil?", "Yes. I work remotely, with video calls in English or Portuguese, and adapt to your time zone for meetings."],
    ],
    contact_label: "Contact", contact_title: "Ready to put your business online?", contact_text: "Tell me about your business and what you need. I'll reply with a proposal and a timeline.",
    contact_alt: "Prefer to reach out directly? My contacts are in the footer.",
    footer_tagline: "Websites and software for businesses and retailers.", footer_contact: "Contact", footer_nav: "Navigation", footer_admin: "Admin",
    wa_default: "Hi! I saw your portfolio and would like a quote for a website.",
    back: "← All projects", not_found: "Project not found", f_client: "Client", f_category: "Category", f_year: "Year", f_code: "Record",
    open_system: "See it live ↗", see_code: "View code ↗", tech: "Technologies", cta_title: "Need something similar?", cta_text: "Tell me about your business and I'll put together a proposal.", cta_btn: "I want a project like this",
    cover_alt: (t) => `Screenshot of ${t}`,
    modal_label: "Free quote", modal_title: "Tell me about your project", close: "Close",
    f_name: "Name", f_company: "Company", f_email: "Email", f_phone: "WhatsApp / phone", f_country: "Country", f_type: "Project type", f_msg: "About the project",
    f_msg_ph: "What your business does, who your customers are and what the website or system needs.",
    types: { "Site": "Website", "Sistema de gestão": "Business system", "Integração / API": "Integration / API", "Outro": "Other" },
    send: "Send request", sending: "Sending…", privacy: "Your details are only used to reply to this message.",
    sent_title: "Request sent", sent_text: "I got your message and will reply within 1 business day, by email or WhatsApp.", sent_wa: "Message me on WhatsApp now", sent_again: "Send another request",
    sent_wa_msg: (n) => `Hi, I'm ${n}. I just sent a quote request through your website.`,
    send_fail: "I couldn't send it right now. Try again or", send_fail_link: "message me on WhatsApp",
    e_name: "Enter your name.", e_email_empty: "Enter your email.", e_email: "Invalid email. Check it, e.g. name@company.com",
    e_msg: "Tell me a bit about the project (at least 10 characters).",
    e_phone_empty: "Enter your phone number.", e_phone_short: "Incomplete number. Include the area code, e.g. (21) 99999-9999.", e_phone_long: "Number too long. Use only area code and number.",
    e_ddd: (d) => `Area code ${d} doesn't exist in Brazil. Check the first two digits.`, e_mobile9: "Brazilian mobile numbers with 11 digits start with 9 after the area code.",
    e_intl: "Invalid number for the selected country. Check the digits.", e_other: "Type the number with the country code, e.g. +44 20 7946 0958.",
    phone_ph_br: "(21) 99999-9999", phone_ph_intl: "Number with area code", phone_ph_other: "+44 20 7946 0958",
    other_country: "Other country",
    fab_title: "Talk to me", fab_text: "I reply on WhatsApp during business hours (Brasília time, UTC−3). You can also send details through the form.", fab_wa: "Open WhatsApp", fab_form: "Fill in the form", fab_open: "Open contact options",
    sim_company: "Company name", sim_segment: "Industry", sim_modules: "Modules", sim_btn: "I want a system like this", sim_hint: "What you type stays on this page until you send the request.",
    sim_msg: (seg, mods) => `Industry: ${seg}\nModules: ${mods || "to be defined"}\n\n`, home: "Home",
    from_project: (t) => `I saw the "${t}" project in your portfolio and need something similar.\n\n`,
  },
};

export const t = (k) => STR[lang][k] ?? STR.pt[k] ?? k;

// rótulos de dados que vêm em português (categoria e status dos projetos)
const DATA_EN = {
  "Em produção": "In production", "Concluído": "Completed", "Em andamento": "In progress", "Protótipo": "Prototype", "Disponível": "Available",
  "Sistema empresarial": "Business system", "PDV / Comércio": "POS / Retail", "E-commerce": "E-commerce", "API / Integração": "API / Integration",
  "Dashboard": "Dashboard", "Site institucional": "Company website", "Landing page": "Landing page", "Loja virtual": "Online store", "Mobile": "Mobile",
};
export const tData = (s) => (lang === "en" ? DATA_EN[s] || s : s);

// campo de projeto/perfil com versão opcional em inglês: obj.en.campo
export const pick = (obj, field) => (lang === "en" && obj?.en?.[field]) || obj?.[field];

// aplica traduções em elementos estáticos do HTML (data-i18n="chave")
export function applyStatic(root = document) {
  document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  root.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  root.querySelectorAll("[data-lang-switch]").forEach((b) => {
    b.textContent = "langFull" in b.dataset ? (lang === "en" ? "Português" : "English") : t("lang_switch");
    b.setAttribute("aria-label", t("lang_switch_label"));
    b.setAttribute("lang", lang === "en" ? "pt-BR" : "en");
    b.onclick = (e) => { e.preventDefault(); setLang(lang === "en" ? "pt" : "en"); };
  });
}
