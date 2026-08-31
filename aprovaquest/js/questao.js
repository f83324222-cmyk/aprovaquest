import { supabase, supabaseConfigured } from "./supabase.js";
import { esc, questionUrl, subjectUrl, setMeta, setCanonical, slugify, bindGlobal } from "./app.js";

const app=document.querySelector("#question-app");
const slug=decodeURIComponent(location.pathname.replace(/\/+$/,"").split("/").pop()||"");
function currentSlug(){
  const qs=new URLSearchParams(location.search);
  return qs.get("slug") || slug;
}
async function run(){
  if(!supabaseConfigured){app.innerHTML='<div class="notice">Configure o Supabase em <code>js/config.js</code> para visualizar esta questão.</div>';return}
  const s=currentSlug();
  if(!s){app.innerHTML='<div class="notice error">Questão não identificada.</div>';return}
  const {data:q,error}=await supabase.from("questoes").select("*").eq("slug",s).maybeSingle();
  if(error||!q){app.innerHTML='<div class="empty"><h1>Questão não encontrada</h1><p>Verifique o endereço ou volte para a lista de questões.</p><a class="btn" href="../questoes/">Ver questões</a></div>';return}
  document.title=`${q.titulo} — ${q.assunto} | AprovaQuest`;
  setMeta("description",`${q.titulo}: questão original de ${q.assunto}, com gabarito, explicação e dica para estudar.`);
  setCanonical(new URL(questionUrl(q.slug),location.origin).href);
  app.innerHTML=`<div class="question-layout">
    <div class="breadcrumbs"><a href="../../questoes/">Questões</a> / <a href="${subjectUrl(q.materia,q.assunto)}">${esc(q.assunto)}</a></div>
    <header class="question-header">
      <div class="tags"><span class="tag">${esc(q.materia)}</span><span class="tag">${esc(q.assunto)}</span><span class="tag">${esc(q.dificuldade)}</span></div>
      <h1>${esc(q.titulo)}</h1>
    </header>
    <article class="card">
      <div class="enunciado">${esc(q.enunciado)}</div>
      <form id="answer-form" class="options">
        ${["A","B","C","D","E"].map(l=>`<label class="option"><input type="radio" name="answer" value="${l}"><strong>${l})</strong><span>${esc(q["alternativa_"+l.toLowerCase()])}</span></label>`).join("")}
        <button class="btn" type="submit">Responder questão</button>
      </form>
      <div id="feedback" aria-live="polite"></div>
      <div id="solution" hidden>
        <div class="answer-box"><strong>Resposta correta: ${esc(q.resposta_correta)}</strong></div>
        <div class="explanation"><h2>Resolução</h2><p>${esc(q.explicacao)}</p></div>
        ${q.dica?`<div class="card"><h2>Dica</h2><p>${esc(q.dica)}</p></div>`:""}
      </div>
    </article>
    <section class="section"><h2>Continue estudando</h2><div id="related" class="related"></div></section>
  </div>`;
  document.querySelector("#answer-form").addEventListener("submit",e=>{
    e.preventDefault();
    const selected=document.querySelector('input[name="answer"]:checked');
    const feedback=document.querySelector("#feedback");
    if(!selected){feedback.innerHTML='<p class="error">Escolha uma alternativa antes de responder.</p>';return}
    const correct=selected.value===q.resposta_correta;
    feedback.innerHTML=`<div class="notice ${correct?"success":"error"}"><strong>${correct?"Acertou!":"Não foi dessa vez."}</strong> ${correct?"Muito bem.":"Revise a resolução abaixo e tente novamente."}</div>`;
    document.querySelector("#solution").hidden=false;
  });
  loadRelated(q);
}
async function loadRelated(q){
  const el=document.querySelector("#related");
  const {data}=await supabase.from("questoes").select("titulo,slug,materia,assunto").eq("assunto",q.assunto).neq("id",q.id).limit(3);
  const links=(data||[]).map(x=>`<a class="card" href="${questionUrl(x.slug)}">${esc(x.titulo)} <span class="muted">— ${esc(x.materia)}</span></a>`).join("");
  el.innerHTML=links||`<a href="${subjectUrl(q.materia,q.assunto)}">Ver mais questões de ${esc(q.assunto)}</a>`;
}
run();bindGlobal();
