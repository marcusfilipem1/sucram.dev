# sucram.dev — portfólio

Site estático (HTML, CSS e JavaScript puro, sem build) com painel `/admin` para cadastrar projetos.
Os projetos ficam em `data/projects.json` no próprio repositório. O painel grava nesse arquivo pela API do GitHub e o GitHub Pages republica o site sozinho em cerca de 1 minuto.

**Custo: R$ 0.** Hospedagem no GitHub Pages, sem domínio pago.

```
index.html          página inicial (apresentação, projetos, serviços, sobre, contato)
projeto.html        página de cada projeto → projeto.html?p=<slug>
admin/              painel para adicionar, editar e excluir projetos
data/profile.json   seus dados (nome, bio, contatos, serviços, stack)
data/projects.json  lista de projetos (o painel edita este arquivo)
assets/projects/    imagens enviadas pelo painel
```

## 1. Personalize seus dados
Edite `data/profile.json`: nome, textos, e-mail, WhatsApp (só números com DDI, ex. `5521999999999`), links do GitHub e LinkedIn, serviços e stack.
O nome exibido no topo do site vem do campo `handle` + `.dev` (ex. `sucram.dev`).

Os três projetos em `data/projects.json` são exemplos. Exclua pelo painel depois de cadastrar os seus.

## 2. Endereço gratuito
Sua conta no GitHub é **marcusfilipem1**. Crie um repositório público chamado **`sucram.dev`** e o site fica em:

**https://marcusfilipem1.github.io/sucram.dev/**

(Se preferir um endereço sem a barra no final, o repositório precisa se chamar `marcusfilipem1.github.io`, e o site fica em `https://marcusfilipem1.github.io`.)

## 3. Publique no GitHub Pages
1. Crie o repositório **público** escolhido acima.
2. Envie os arquivos desta pasta para a branch `main`:
   ```bash
   git init && git add . && git commit -m "Portfólio"
   git branch -M main
   git remote add origin https://github.com/marcusfilipem1/sucram.dev.git
   git push -u origin main
   ```
   (Sem usar terminal: na página do repositório, clique em **Add file → Upload files** e arraste o conteúdo da pasta.)
3. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)` → Save**.
4. Em 1 ou 2 minutos o site aparece no endereço acima.

## 4. Ative o formulário de contato (1 vez)
Os formulários do site (janela "Pedir orçamento", formulário do rodapé e simulador) enviam para o seu e-mail pelo **FormSubmit**, um serviço gratuito sem cadastro. O endereço fica em `formEndpoint` no `data/profile.json`.

1. Com o site no ar, envie um pedido de teste pelo próprio formulário.
2. Chega um e-mail do FormSubmit em `marcusmftom@gmail.com` pedindo confirmação. Clique em **Activate Form**. Olhe a caixa de spam se não aparecer.
3. A partir daí todo pedido chega no seu e-mail, com nome, empresa, WhatsApp, tipo de projeto, investimento, prazo e mensagem. Responder ao e-mail responde direto ao cliente.
4. (Recomendado) O FormSubmit também envia um código aleatório que substitui o seu e-mail. Troque em `formEndpoint` para `https://formsubmit.co/ajax/SEU-CODIGO`; assim seu e-mail não aparece no código do site.

O WhatsApp (botão flutuante e links) usa o número em `whatsapp` no `data/profile.json`.

## 5. Cadastre projetos pelo painel
1. Gere um token: **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
   - *Repository access*: **Only select repositories** → o repositório do portfólio
   - *Permissions → Contents*: **Read and write**
   - Escolha uma validade (ex. 1 ano) e gere outro quando expirar.
2. Abra `https://marcusfilipem1.github.io/sucram.dev/admin`.
3. Informe `marcusfilipem1/sucram.dev`, a branch `main` e o token, depois clique em **Entrar**.
4. **Novo projeto** → título, cliente, categoria, status, resumo, descrição, tecnologias, links, capa e prints → **Salvar e publicar**.

As imagens são reduzidas para no máximo 1600px (WebP) antes do envio. Cada publicação vira um commit, então o histórico de alterações fica no GitHub.

**Segurança:** a página `/admin` é pública, mas sem um token com permissão de escrita ninguém altera nada. O token fica salvo só no seu navegador; clique em **Sair** se usar um computador de outra pessoa.

## Testar no seu computador
```bash
python3 -m http.server 8000   # depois abra http://localhost:8000
```
Abrir o `index.html` com duplo clique não funciona, porque o navegador bloqueia a leitura dos arquivos JSON.

## Se um dia quiser um domínio próprio
Compre o domínio (ex. `sucram.dev`), aponte o DNS para o GitHub Pages e preencha **Settings → Pages → Custom domain**. Nada no código muda.
