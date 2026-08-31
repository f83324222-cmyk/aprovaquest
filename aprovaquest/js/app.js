export const BASE = (() => {
  const p=location.pathname;
  const markers=["/questoes/","/questao/","/simulados/","/sobre/","/contato/","/politica-de-privacidade/","/admin/"];
  const hits=markers.map(m=>p.indexOf(m)).filter(i=>i>=0);
  if(hits.length) return p.slice(0,Math.min(...hits)+1);
  return p.endsWith("/") ? p : p.slice(0,p.lastIndexOf("/")+1);
})();

export function esc(value=""){
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
export function slugify(s=""){
  return s.toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
    .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
export function questionUrl(slug){ return `${BASE}questao/${encodeURIComponent(slug)}/`; }
export function subjectUrl(materia, assunto){
  return `${BASE}questoes/${slugify(materia)}/${slugify(assunto)}/`;
}
export function excerpt(s,n=180){ s=String(s||""); return s.length>n ? s.slice(0,n).trim()+"…" : s; }
export function setMeta(name,content){
  let el=document.querySelector(`meta[name="${name}"]`);
  if(!el){el=document.createElement("meta");el.name=name;document.head.appendChild(el)}
  el.content=content;
}
export function setCanonical(url){
  let el=document.querySelector('link[rel="canonical"]');
  if(!el){el=document.createElement("link");el.rel="canonical";document.head.appendChild(el)}
  el.href=url;
}
export function showError(el,msg){el.innerHTML=`<div class="notice error">${esc(msg)}</div>`}
export function bindGlobal(){
  document.querySelectorAll("[data-year]").forEach(e=>e.textContent=new Date().getFullYear());
}
