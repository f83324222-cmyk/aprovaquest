// Gera páginas físicas de questões e sitemap a partir do Supabase.
// Uso:
//   SUPABASE_URL="https://....supabase.co" SUPABASE_ANON_KEY="..." SITE_URL="https://seu-dominio.com" node scripts/generate-static.mjs
// Não use service_role neste script; leitura pública é suficiente.
import fs from "node:fs/promises";
import path from "node:path";

const url=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_ANON_KEY;
const site=(process.env.SITE_URL||"").replace(/\/$/,"");
if(!url||!key||!site) throw new Error("Defina SUPABASE_URL, SUPABASE_ANON_KEY e SITE_URL.");

const headers={apikey:key,Authorization:`Bearer ${key}`};
const r=await fetch(`${url}/rest/v1/questoes?select=*&order=created_at.desc`,{headers});
if(!r.ok) throw new Error(`Supabase: ${r.status} ${await r.text()}`);
const qs=await r.json();

const root=process.cwd();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const page=q=>`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(q.titulo)} | AprovaQuest</title><meta name="description" content="Questão de ${esc(q.assunto)} com gabarito, explicação detalhada e dica de estudo."><link rel="canonical" href="${site}/questao/${encodeURIComponent(q.slug)}/"><link rel="stylesheet" href="../../../css/style.css"></head><body><header class="site-header"><div class="container nav"><a class="logo" href="../../../">Aprova<span>Quest</span></a><nav class="nav-links"><a href="../../../questoes/">Questões</a><a href="../../../simulados/">Simulados</a><a href="../../../sobre/">Sobre</a><a href="../../../contato/">Contato</a></nav></div></header><main><div class="container"><div id="question-app"><div class="loading">Carregando questão…</div></div></div></main><footer class="footer"><div class="container footer-inner"><div>© AprovaQuest</div><div><a href="../../../politica-de-privacidade/">Política de Privacidade</a></div></div></footer><script type="module" src="../../../js/questao.js"></script></body></html>`;

for(const q of qs){
  const dir=path.join(root,"questao",q.slug);
  await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,"index.html"),page(q));
}
const fixed=["/","/questoes/","/simulados/","/sobre/","/contato/","/politica-de-privacidade/","/questoes/matematica/porcentagem/","/questoes/matematica/juros-simples/","/questoes/matematica/juros-compostos/","/questoes/matematica/funcao-afim/","/questoes/matematica/funcao-quadratica/","/questoes/fisica/cinematica/","/questoes/quimica/estequiometria/","/questoes/biologia/genetica/"];
const xml=[...fixed,...qs.map(q=>`/questao/${encodeURIComponent(q.slug)}/`)].filter((v,i,a)=>a.indexOf(v)===i).map(u=>`  <url><loc>${site}${u}</loc></url>`).join("\n");
await fs.writeFile(path.join(root,"sitemap.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`);
console.log(`Geradas ${qs.length} páginas de questões e sitemap.`);
