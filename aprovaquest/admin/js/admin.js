import { supabase, supabaseConfigured } from "../../js/supabase.js";
import { esc, slugify } from "../../js/app.js";

const page=document.body.dataset.page||"dashboard";
const msg=document.querySelector("#admin-msg");
function message(t,ok=false){if(msg)msg.innerHTML=`<div class="notice ${ok?"success":"error"}">${esc(t)}</div>`}
async function requireAdmin(){
  if(!supabaseConfigured){message("Configure o Supabase em js/config.js.");return null}
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){location.href="login.html";return null}
  const {data:user,error}=await supabase.from("usuarios").select("id,nome,email,is_admin").eq("id",session.user.id).maybeSingle();
  if(error||!user?.is_admin){message("Acesso negado: este usuário não é administrador.");return null}
  return {session,user};
}
async function logout(){await supabase.auth.signOut();location.href="login.html"}
document.querySelectorAll("[data-logout]").forEach(b=>b.addEventListener("click",logout));

async function dashboard(){
  const auth=await requireAdmin(); if(!auth)return;
  const {count}=await supabase.from("questoes").select("*",{count:"exact",head:true});
  const el=document.querySelector("#stats"); if(el)el.textContent=`${count??0} questões cadastradas.`;
  const {data,error}=await supabase.from("questoes").select("id,titulo,materia,assunto,dificuldade,slug,created_at").order("created_at",{ascending:false});
  if(error){message(error.message);return}
  const table=document.querySelector("#admin-table"), search=document.querySelector("#admin-search"), mf=document.querySelector("#admin-materia"), df=document.querySelector("#admin-dificuldade");
  const mats=[...new Set((data||[]).map(q=>q.materia))].sort();
  mf.innerHTML='<option value="">Todas</option>'+mats.map(x=>`<option>${esc(x)}</option>`).join("");
  const render=()=>{
    const term=(search?.value||"").toLowerCase();
    const rows=(data||[]).filter(q=>
      (!term||[q.titulo,q.assunto,q.materia].some(v=>String(v||"").toLowerCase().includes(term))) &&
      (!mf?.value||q.materia===mf.value) && (!df?.value||q.dificuldade===df.value));
    table.innerHTML=rows.map(q=>`<tr><td>${esc(q.titulo)}</td><td>${esc(q.materia)}</td><td>${esc(q.assunto)}</td><td>${esc(q.dificuldade)}</td><td><a class="btn small" href="editar.html?id=${q.id}">Editar</a> <button class="btn small danger" data-delete="${q.id}">Excluir</button></td></tr>`).join("") || '<tr><td colspan="5">Nenhuma questão encontrada.</td></tr>';
    table.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{
      if(!confirm("Excluir esta questão?"))return;
      const {error}=await supabase.from("questoes").delete().eq("id",b.dataset.delete);
      if(error)message(error.message);else location.reload();
    });
  };
  [search,mf,df].forEach(e=>e?.addEventListener("input",render));
  render();
}
async function fillSubjects(select){
  const {data,error}=await supabase.from("assuntos").select("materia,nome").order("materia").order("nome");
  if(error){message(error.message);return []}
  select.innerHTML=(data||[]).map(x=>`<option value="${esc(x.nome)}" data-materia="${esc(x.materia)}">${esc(x.materia)} — ${esc(x.nome)}</option>`).join("");
  return data||[];
}
function collectForm(){
  const d=new FormData(document.querySelector("#question-form"));
  return {materia:d.get("materia"),assunto:d.get("assunto"),titulo:d.get("titulo"),slug:slugify(d.get("slug")||d.get("titulo")),dificuldade:d.get("dificuldade"),enunciado:d.get("enunciado"),alternativa_a:d.get("alternativa_a"),alternativa_b:d.get("alternativa_b"),alternativa_c:d.get("alternativa_c"),alternativa_d:d.get("alternativa_d"),alternativa_e:d.get("alternativa_e"),resposta_correta:d.get("resposta_correta"),explicacao:d.get("explicacao"),dica:d.get("dica")};
}
async function editor(){
  const auth=await requireAdmin();if(!auth)return;
  const select=document.querySelector("#assunto"); const subjects=await fillSubjects(select);
  const id=new URLSearchParams(location.search).get("id");
  if(id){
    const {data:q,error}=await supabase.from("questoes").select("*").eq("id",id).single();
    if(error){message(error.message);return}
    Object.entries(q).forEach(([k,v])=>{const e=document.querySelector(`[name="${k}"]`);if(e)e.value=v??""});
    document.querySelector("#page-title").textContent="Editar questão";
  } else if(subjects[0]){
    document.querySelector("[name=materia]").value=subjects[0].materia;
    select.value=subjects[0].nome;
  }
  select.addEventListener("change",()=>{const opt=select.selectedOptions[0];document.querySelector("[name=materia]").value=opt?.dataset.materia||""});
  document.querySelector("#question-form").addEventListener("submit",async e=>{
    e.preventDefault();
    const payload=collectForm(); const res=id
      ? await supabase.from("questoes").update(payload).eq("id",id)
      : await supabase.from("questoes").insert(payload);
    if(res.error)message(res.error.message);
    else{message("Questão salva com sucesso.",true);setTimeout(()=>location.href="index.html",700)}
  });
}
if(page==="dashboard")dashboard();
if(page==="editor")editor();
