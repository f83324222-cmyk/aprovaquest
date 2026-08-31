import { supabase, supabaseConfigured } from "./supabase.js";
import { esc, excerpt, questionUrl, subjectUrl, slugify, bindGlobal } from "./app.js";

const params=new URLSearchParams(location.search);
const list = document.querySelector("#question-list");
const materia = document.querySelector("#f-materia");
const assunto = document.querySelector("#f-assunto");
const dificuldade = document.querySelector("#f-dificuldade");
const busca = document.querySelector("#f-busca");
const status = document.querySelector("#list-status");

let allSubjects=[];
if(params.get('materia')){ /* aplicado após os options serem criados */ }
async function loadSubjects(){
  const {data,error}=await supabase.from("assuntos").select("materia,nome,slug").order("materia").order("nome");
  if(error) return;
  allSubjects=data||[];
  const materias=[...new Set(allSubjects.map(x=>x.materia))];
  materia.innerHTML='<option value="">Todas</option>'+materias.map(x=>`<option>${esc(x)}</option>`).join("");
  updateSubjectOptions();
  if(params.get('materia')){ materia.value=params.get('materia'); updateSubjectOptions(); }
  if(params.get('assunto')) assunto.value=params.get('assunto');
}
function updateSubjectOptions(){
  const m=materia.value;
  const subs=allSubjects.filter(x=>!m||x.materia===m);
  assunto.innerHTML='<option value="">Todos</option>'+subs.map(x=>`<option value="${esc(x.nome)}">${esc(x.nome)}</option>`).join("");
}
async function loadQuestions(){
  if(!supabaseConfigured){list.innerHTML='<div class="notice">Configure o Supabase em <code>js/config.js</code> para carregar as questões.</div>';return}
  status.textContent="Carregando…";
  let q=supabase.from("questoes").select("id,materia,assunto,dificuldade,titulo,slug,enunciado").order("created_at",{ascending:false});
  if(materia.value) q=q.eq("materia",materia.value);
  if(assunto.value) q=q.eq("assunto",assunto.value);
  if(dificuldade.value) q=q.eq("dificuldade",dificuldade.value);
  const {data,error}=await q;
  if(error){list.innerHTML=`<div class="notice error">${esc(error.message)}</div>`;return}
  const term=busca.value.trim().toLowerCase();
  const rows=(data||[]).filter(x=>!term || [x.titulo,x.enunciado,x.assunto,x.materia].some(v=>String(v||"").toLowerCase().includes(term)));
  status.textContent=`${rows.length} questão(ões) encontrada(s).`;
  list.innerHTML=rows.length?rows.map(x=>`<article class="card question-card">
    <div class="tags"><span class="tag">${esc(x.materia)}</span><span class="tag">${esc(x.assunto)}</span><span class="tag">${esc(x.dificuldade)}</span></div>
    <h3><a href="${questionUrl(x.slug)}">${esc(x.titulo)}</a></h3>
    <p class="excerpt">${esc(excerpt(x.enunciado))}</p>
    <a class="btn small" href="${questionUrl(x.slug)}">Resolver questão</a>
  </article>`).join(""):'<div class="empty">Nenhuma questão encontrada com esses filtros.</div>';
}
[materia,assunto,dificuldade].forEach(e=>e.addEventListener("change",()=>{if(e===materia)updateSubjectOptions();loadQuestions()}));
busca.addEventListener("input",()=>loadQuestions());
loadSubjects().then(loadQuestions);
bindGlobal();
