# AprovaQuest V1

Site estático de questões para ensino médio, ENEM e vestibulares, usando **HTML5 + CSS3 + JavaScript + Supabase**. Não há framework pesado nem servidor próprio.

## 1. Estrutura

```text
aprovaquest/
├── index.html
├── questoes/
│   ├── index.html
│   └── matematica/...
├── questao/
│   ├── index.html
│   └── <slug>/index.html
├── simulados/index.html
├── sobre/index.html
├── contato/index.html
├── politica-de-privacidade/index.html
├── css/style.css
├── js/
│   ├── config.js
│   ├── supabase.js
│   ├── questoes.js
│   ├── questao.js
│   ├── simulados.js
│   └── app.js
├── admin/
├── scripts/generate-static.mjs
├── sql/schema.sql
├── sitemap.xml
├── robots.txt
└── README.md
```

A V1 inclui 20 questões originais: 5 de Matemática, 5 de Física, 5 de Química e 5 de Biologia.

## 2. Observação importante sobre URLs amigáveis no GitHub Pages

GitHub Pages é um host estático e **não faz rewrite de rotas dinâmicas**. Por isso, a V1 usa duas estratégias:

1. As 20 questões iniciais já possuem diretórios físicos, por exemplo:
   `/questao/desconto-camiseta/`
2. Para questões novas criadas pelo painel, elas aparecem imediatamente no banco, na busca, nos filtros e nos simulados. Para obter páginas físicas novas e o melhor cenário de SEO, execute o gerador `scripts/generate-static.mjs` no processo de publicação.

Existe também `404.html` para facilitar a navegação quando uma rota amigável ainda não foi materializada. Isso não substitui a geração física para SEO: para páginas novas indexáveis, prefira gerar os diretórios antes de atualizar o sitemap.

Essa solução evita editar centenas de HTML manualmente. O conteúdo continua no Supabase; os HTML são apenas uma camada de publicação/cache para as URLs públicas.

## 3. Como baixar e abrir

Depois de extrair o ZIP:

```bash
cd aprovaquest
```

Não abra apenas com `file://` se quiser testar módulos ES e o comportamento do Supabase. Use um servidor local simples:

```bash
python -m http.server 8000
```

Depois abra:

```text
http://localhost:8000/
```

O banco continuará vazio até você configurar o Supabase e executar o SQL.

## 4. Criar o projeto no Supabase

1. Crie um projeto no Supabase.
2. Abra o **SQL Editor**.
3. Copie todo o conteúdo de `sql/schema.sql`.
4. Execute o SQL.
5. Abra **Project Settings > API**.
6. Copie a URL do projeto e a chave pública (`anon`/publishable, conforme a interface da sua versão do Supabase).
7. Edite `js/config.js`:

```js
window.APROVAQUEST_CONFIG = {
  SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
  SUPABASE_ANON_KEY: "SUA_CHAVE_PUBLICA_ANON"
};
```

### Nunca coloque no frontend

Não coloque `service_role`, `secret key`, senha de banco ou qualquer credencial privilegiada em arquivos JavaScript públicos.

A chave pública pode estar no frontend. A proteção real vem do **Row Level Security (RLS)** configurado no banco.

## 5. Tabelas

O SQL cria:

### `questoes`

- `id`
- `materia`
- `assunto`
- `dificuldade`
- `titulo`
- `slug`
- `enunciado`
- `alternativa_a`
- `alternativa_b`
- `alternativa_c`
- `alternativa_d`
- `alternativa_e`
- `resposta_correta`
- `explicacao`
- `dica`
- `created_at`
- `updated_at`

### `assuntos`

- `id`
- `materia`
- `nome`
- `slug`
- `descricao`
- `created_at`

### `usuarios`

- `id` — UUID do usuário do Supabase Auth
- `nome`
- `email`
- `is_admin`
- `created_at`

Senhas **não** são armazenadas na tabela `usuarios`. O login é feito pelo Supabase Auth.

## 6. Row Level Security

O `schema.sql` habilita RLS.

Regras da V1:

- qualquer visitante pode ler `questoes`;
- qualquer visitante pode ler `assuntos`;
- somente um usuário autenticado cujo registro em `usuarios.is_admin` seja `true` pode inserir questões;
- somente administradores podem editar;
- somente administradores podem excluir;
- usuários autenticados só podem ler o próprio registro em `usuarios`.

Isso é deliberado: esconder botões no JavaScript não é uma medida de segurança. A autorização precisa estar no banco.

## 7. Criar o administrador

Primeiro crie um usuário pelo painel do Supabase:

**Authentication > Users > Add user**

Use e-mail e senha.

Depois copie o UUID do usuário e execute no SQL Editor:

```sql
insert into public.usuarios (id, nome, email, is_admin)
values (
  'UUID-DO-USUARIO',
  'Administrador',
  'seu-email@exemplo.com',
  true
)
on conflict (id)
do update set
  is_admin = true,
  email = excluded.email,
  nome = excluded.nome;
```

Depois acesse:

```text
/admin/login.html
```

## 8. Adicionar uma questão

1. Faça login em `/admin/login.html`.
2. Abra **Adicionar questão**.
3. Escolha o assunto.
4. Preencha título, slug, enunciado, alternativas, resposta, explicação e dica.
5. Clique em **PUBLICAR QUESTÃO**.

A questão será gravada no Supabase e aparecerá automaticamente em:

- `/questoes/`
- filtros e busca;
- páginas de assunto correspondentes;
- simulados.

## 9. Editar e excluir

No painel `/admin/`:

- use **Editar** para alterar uma questão;
- use **Excluir** para removê-la.

A exclusão é protegida pela política RLS.

## 10. Como o slug funciona

O slug deve ser único, por exemplo:

```text
desconto-camiseta
funcao-quadratica-raizes
estequiometria-formacao-agua
```

A URL pública fica:

```text
/questao/desconto-camiseta/
```

Se você alterar o slug de uma questão que já foi indexada, a URL antiga deixa de representar aquela questão. Em uma evolução futura, vale criar uma tabela de redirecionamentos/aliases.

## 11. Páginas de assunto e SEO

A V1 possui páginas físicas para assuntos principais, como:

```text
/questoes/matematica/porcentagem/
/questoes/matematica/juros-simples/
/questoes/matematica/juros-compostos/
/questoes/matematica/funcao-afim/
/questoes/matematica/funcao-quadratica/
/questoes/fisica/cinematica/
/questoes/quimica/estequiometria/
/questoes/biologia/genetica/
```

Cada uma tem:

- `<title>` específico;
- meta description;
- H1 único;
- H2s;
- resumo educacional;
- lista das questões do assunto;
- links internos.

O objetivo é que a página seja útil por si só, e não apenas uma página para publicidade.

### Conteúdo original

As 20 questões da instalação foram criadas para este projeto. Não foram copiadas de provas do ENEM, universidades ou sites de terceiros.

## 12. Gerar páginas físicas após adicionar questões

Para melhorar o SEO de novas questões, use o script:

```bash
SUPABASE_URL="https://SEU-PROJETO.supabase.co" SUPABASE_ANON_KEY="SUA_CHAVE_PUBLICA_ANON" SITE_URL="https://SEU-DOMINIO.com" node scripts/generate-static.mjs
```

O script:

- consulta as questões públicas;
- cria `questao/<slug>/index.html`;
- atualiza `sitemap.xml`.

O script usa somente leitura pública. Não coloque `service_role` nele.

### GitHub Pages + geração automática

A forma mais prática de produção é rodar esse script em um GitHub Actions antes do deploy. Assim, você pode manter o banco como fonte de dados e publicar as páginas físicas sem editar HTML manualmente.

Em um fluxo mais avançado, um processo de CI pode ser disparado sempre que houver alteração no banco ou em uma rotina periódica.

## 13. Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie os arquivos do projeto.
3. Vá em **Settings > Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch principal e a pasta `/root`.
6. Salve.
7. Aguarde a publicação.

### Importante sobre caminho do repositório

Se o site for publicado como:

```text
https://seuusuario.github.io/aprovaquest/
```

o JavaScript da V1 identifica o prefixo do projeto automaticamente para os links internos.

Se você usar domínio próprio:

```text
https://www.seudominio.com/
```

os mesmos arquivos continuam funcionando.

## 14. Domínio próprio

No GitHub:

1. Abra **Settings > Pages**.
2. Informe o domínio personalizado.
3. Configure no seu provedor DNS os registros indicados pelo GitHub.
4. Ative HTTPS quando o GitHub disponibilizar.
5. Atualize `SITE_URL` no script de geração.

Depois substitua no `robots.txt`:

```text
Sitemap: https://SEU-DOMINIO.com/sitemap.xml
```

pelo domínio real.

Também substitua as URLs de exemplo do `sitemap.xml`.

## 15. Sitemap

O `sitemap.xml` incluído contém as páginas principais, páginas de assunto e as 20 questões iniciais.

Quando novas questões forem adicionadas, execute:

```bash
node scripts/generate-static.mjs
```

com as três variáveis de ambiente configuradas.

Isso recria o sitemap usando os slugs existentes no Supabase.

Não coloque no sitemap URLs que retornem erro ou páginas sem conteúdo útil.

## 16. robots.txt

O arquivo inicial contém:

```text
User-agent: *
Allow: /

Sitemap: https://SEU-DOMINIO.com/sitemap.xml
```

Substitua `SEU-DOMINIO.com` pelo domínio real.

## 17. Google Search Console

Depois de publicar:

1. Abra o Google Search Console.
2. Adicione o domínio ou prefixo de URL.
3. Faça a verificação solicitada.
4. Abra a área **Sitemaps**.
5. Informe:

```text
sitemap.xml
```

6. Solicite indexação das páginas principais quando apropriado.

O Search Console não garante indexação. Conteúdo útil, páginas acessíveis, boa performance e arquitetura interna continuam sendo importantes.

## 18. Performance

A V1 evita:

- frameworks pesados;
- grandes bibliotecas de UI;
- imagens desnecessárias;
- processamento no servidor.

O frontend usa módulos JavaScript pequenos e consulta apenas os campos necessários em várias telas.

Para produção, mantenha o banco indexado e evite consultas sem filtros quando o volume crescer muito.

## 19. Simulados

`/simulados/` permite selecionar:

- matéria;
- dificuldade;
- quantidade.

As questões são embaralhadas no navegador, e o resultado mostra:

- acertos;
- total;
- percentual.

A V1 não grava histórico individual. A tabela `usuarios` já prepara a autenticação para uma futura tabela de tentativas/histórico.

## 20. Futuro histórico de desempenho

Uma evolução recomendada é criar, por exemplo:

```text
tentativas
- id
- usuario_id
- questao_id
- resposta
- acertou
- criado_at
```

e outra tabela para simulados completos.

As políticas RLS devem permitir que cada estudante veja apenas seus próprios registros.

## 21. Monetização futura

Não há anúncios na V1.

Quando o projeto tiver conteúdo suficiente e estiver pronto para publicidade, você pode integrar Google AdSense ou outro provedor.

Antes disso:

- mantenha a Política de Privacidade atualizada;
- informe cookies/tecnologias quando aplicável;
- não clique nos próprios anúncios;
- não incentive cliques;
- não crie páginas artificiais apenas para anúncios;
- preserve espaço e legibilidade no celular.

A qualidade educacional deve ser o objetivo principal.

## 22. Política de Privacidade e contato

Antes de colocar o site em produção, substitua o texto genérico da página de contato pelo e-mail/canal real.

A Política de Privacidade da V1 é um ponto de partida e deve ser revisada conforme os serviços realmente utilizados, especialmente quando forem adicionados:

- Analytics;
- publicidade;
- cookies;
- formulários;
- histórico de desempenho;
- ferramentas externas.

## 23. Checklist antes de publicar

- [ ] `js/config.js` configurado com URL e chave pública.
- [ ] Nenhuma `service_role` ou secret no frontend.
- [ ] `sql/schema.sql` executado.
- [ ] RLS habilitado.
- [ ] Usuário administrador criado.
- [ ] `usuarios.is_admin` conferido.
- [ ] E-mail de contato substituído.
- [ ] Política de Privacidade revisada.
- [ ] Domínio colocado no `robots.txt`.
- [ ] `sitemap.xml` atualizado.
- [ ] Site verificado no Search Console.
- [ ] Teste de login administrativo.
- [ ] Teste de adicionar, editar e excluir.
- [ ] Teste de filtros e busca.
- [ ] Teste de simulado.
- [ ] Teste no celular.

## 24. Licença e conteúdo

As questões incluídas nesta V1 foram produzidas para o AprovaQuest. Ao adicionar conteúdo de terceiros no futuro, verifique licença, direitos autorais e permissão de uso antes de publicar.
