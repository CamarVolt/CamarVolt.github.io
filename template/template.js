(function(){
  const root = document.getElementById('mdRoot');
  const btnRefresh = document.getElementById('btnRefresh');
  const btnOpenRaw = document.getElementById('btnOpenRaw');
  const btnOpenGitHub = document.getElementById('btnOpenGitHub');

  // ----- helpers -----
  const qs = new URLSearchParams(location.search);

  // 1) Prioriza src=URL_RAW (ex.: https://raw.githubusercontent.com/owner/repo/branch/README.md)
  let rawUrl = qs.get('src')?.trim().replace(/^['"]|['"]$/g,'');
  // 2) Ou monta a partir de repo=owner/repo&path=README.md&ref=main
  const repo = qs.get('repo');
  const path = qs.get('path') || 'README.md';
  const ref  = qs.get('ref')  || 'main';

  if (!rawUrl && repo){
    rawUrl = `https://raw.githubusercontent.com/${repo}/${ref}/${path}`;
  }

  // default (troque pelo seu repositório se quiser)
  if (!rawUrl){
    rawUrl = 'https://raw.githubusercontent.com/CamarVolt/Template/main/README.md';
  }

  // base para reescrever imagens relativas
  let imgBase = rawUrl.replace(/\/[^\/]+$/, '/'); // pasta do arquivo
  // URL web do GitHub para o botão "Abrir no GitHub"
  let githubWeb = "https://github.com/CamarVolt/Template"

  btnOpenRaw.href = rawUrl;
  btnOpenGitHub.href = githubWeb;

  async function loadMarkdown(){
    try{
      root.innerHTML = '<div class="muted" style="text-align:center">Carregando…</div>';

      // força bust de cache leve
      const res = await fetch(rawUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const md = await res.text();

      // renderiza + sanitiza
      const html = marked.parse(md, { mangle:false, headerIds:true });
      const clean = DOMPurify.sanitize(html, { ADD_ATTR: ['target','rel'] });

      root.innerHTML = clean;

      // reescreve imagens e links relativos
      fixRelativeResources(root, imgBase, githubWeb);
    } catch (e){
      root.innerHTML = `
        <p>Não foi possível carregar o Markdown.</p>
        <p class="muted">Fonte: <code>${rawUrl}</code></p>
        <p><a class="btn-ghost" href="${rawUrl}" target="_blank" rel="noopener">Abrir RAW</a></p>
      `;
      console.error('Markdown load error:', e);
    }
  }

  function isAbsolute(u){
    return /^([a-z]+:)?\/\//i.test(u) || u?.startsWith('data:') || u?.startsWith('mailto:') || u?.startsWith('#');
  }

  function fixRelativeResources(scope, rawBase, ghWeb){
    // imagens -> base RAW (para exibir corretamente)
    scope.querySelectorAll('img').forEach(img=>{
      const src = img.getAttribute('src');
      if (src && !isAbsolute(src)){
        img.src = rawBase + src.replace(/^.\//,'');
      }
    });
    // links relativos -> GitHub web (experiência melhor para navegação)
    scope.querySelectorAll('a').forEach(a=>{
      const href = a.getAttribute('href');
      if (!href || isAbsolute(href)) return;
      const cleanHref = href.replace(/^.\//,'');
      // aponta para a UI do GitHub na mesma pasta do arquivo
      const baseWeb = ghWeb.replace(/\/blob\/[^\/]+\/.*$/, match => match); // mantém estrutura
      const repoRootMatch = ghWeb.match(/^(https:\/\/github\.com\/[^\/]+\/[^\/]+)\/blob\/([^\/]+)\/(.*)$/);
      if (repoRootMatch){
        const [_, repoRoot, refName, currPath] = repoRootMatch;
        const currDir = currPath.replace(/\/[^\/]*$/,'/'); // diretório do arquivo atual
        a.href = `${repoRoot}/blob/${refName}/${currDir}${cleanHref}`;
        a.setAttribute('target','_blank');
        a.setAttribute('rel','noopener');
      }
    });
  }

  btnRefresh.addEventListener('click', loadMarkdown);
  loadMarkdown();
})();
