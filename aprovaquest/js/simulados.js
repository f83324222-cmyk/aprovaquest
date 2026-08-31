import { supabase, supabaseConfigured } from "./supabase.js";
import { esc, bindGlobal } from "./app.js";

const setup=document.querySelector("#sim-setup"), quiz=document.querySelector("#sim-quiz"), result=document.querySelector("#sim-result");
const materia=document.querySelector("#sim-materia"), dificuldade=document.querySelector("#sim-dificuldade"), quantidade=document.querySelector("#sim-qtd");
let questions=[], index=0, answers=[];

async function start(){
  if(!supabaseConfigured){setup.innerHTML='<div class="notice">Configure o Supabase em <code>js/config.js</code> antes de iniciar.</div>';return}
  let q=supabase.from("questoes").select("*");
  if(materia.value) q=q.eq("materia",materia.value);
  if(dificuldade.value) q=q.eq("dificuldade",dificuldade.value);
  const {data,error}=await q;
  if(error){setup.insertAdjacentHTML("beforeend",`<div class="notice error">${esc(error.message)}</div>`);return}
  questions=(data||[]).sort(()=>Math.random()-.5).slice(0,Number(quantidade.value));
  if(!questions.length){setup.insertAdjacentHTML("beforeend",'<div class="notice">Não há questões com esses filtros.</div>');return}
  index=0;answers=[];setup.hidden=true;quiz.hidden=false;result.hidden=true;render();
}
function render(){
  const q=questions[index];
  quiz.innerHTML=`<div class="sim-card">
    <div class="quiz-meta"><span>Questão ${index+1} de ${questions.length}</span><span>${esc(q.materia)}</span></div>
    <div class="progress"><span style="width:${((index)/questions.length)*100}%"></span></div>
    <article class="card" style="margin-top:18px"><div class="tags"><span class="tag">${esc(q.assunto)}</span><span class="tag">${esc(q.dificuldade)}</span></div>
    <h1>${esc(q.titulo)}</h1><div>${esc(q.enunciado)}</div>
    <div class="options">${["A","B","C","D","E"].map(l=>`<label class="option"><input type="radio" name="sim-answer" value="${l}"><strong>${l})</strong><span>${esc(q["alternativa_"+l.toLowerCase()])}</span></label>`).join("")}</div>
    <button class="btn" id="next"> ${index===questions.length-1?"Finalizar":"Próxima"} </button>
    </article></div>`;
  document.querySelector("#next").onclick=()=>{
    const sel=document.querySelector('input[name="sim-answer"]:checked');
    if(!sel){alert("Escolha uma alternativa.");return}
    answers[index]=sel.value;
    index++;
    if(index<questions.length)render();else finish();
  };
}
function finish(){
  let correct=questions.reduce((n,q,i)=>n+(answers[i]===q.resposta_correta?1:0),0);
  const pct=Math.round(correct/questions.length*100);
  quiz.hidden=true;result.hidden=false;
  result.innerHTML=`<div class="sim-card card"><h1>Resultado</h1><p>Você acertou <strong>${correct} de ${questions.length}</strong>.</p><p>Aproveitamento: <strong>${pct}%</strong></p><button class="btn" id="again">Fazer novamente</button></div>`;
  document.querySelector("#again").onclick=()=>{result.hidden=true;setup.hidden=false}
}
document.querySelector("#start-sim").onclick=start;
bindGlobal();
