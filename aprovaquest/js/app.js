import { supabase } from "./supabase.js";

const lista = document.getElementById("listaQuestoes");
const filtroMateria = document.getElementById("materia");
const filtroDificuldade = document.getElementById("dificuldade");

async function mostrarQuestoes() {
  if (!lista) return;

  lista.innerHTML = "<p>Carregando questões...</p>";

  let query = supabase
    .from("questoes")
    .select("*")
    .order("id", { ascending: true });

  if (filtroMateria && filtroMateria.value) {
    query = query.eq("materia", filtroMateria.value);
  }

  if (filtroDificuldade && filtroDificuldade.value) {
    query = query.eq("dificuldade", filtroDificuldade.value);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    lista.innerHTML = "<p>Erro ao carregar as questões.</p>";
    return;
  }

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhuma questão encontrada.</p>";
    return;
  }

  lista.innerHTML = "";

  data.forEach(q => {
    const div = document.createElement("div");
    div.className = "questao-card";

    div.innerHTML = `
      <span class="tag">${q.materia}</span>
      <h2>${q.titulo}</h2>
      <p>${q.enunciado}</p>
      <a class="botao" href="../questao/?slug=${encodeURIComponent(q.slug)}">
        Resolver questão
      </a>
    `;

    lista.appendChild(div);
  });
}

if (filtroMateria) {
  filtroMateria.addEventListener("change", mostrarQuestoes);
}

if (filtroDificuldade) {
  filtroDificuldade.addEventListener("change", mostrarQuestoes);
}

mostrarQuestoes();
