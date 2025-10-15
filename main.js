// Header background shift on scroll
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  const y = window.scrollY || 0;
  header.style.background = y > 8
    ? 'color-mix(in oklab, #000 78%, transparent)'
    : 'color-mix(in oklab, #000 70%, transparent)';
});

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length>1){
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

// Menu hamburguer
const hamb = document.querySelector('.hamb');
const nav  = document.querySelector('#primary-nav');
hamb.addEventListener('click', () => {
  const open = hamb.classList.toggle('is-open');
  nav.classList.toggle('is-open', open);
  hamb.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// Reveal animations (IntersectionObserver)
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
},{ threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el=> observer.observe(el));

// === Timeline: marcar aulas concluídas (bolinha preenchida) ===
(function markTimeline() {
  const today = new Date(); // data do acesso
  document.querySelectorAll('.timeline .tl-item').forEach(item => {
    const iso = item.getAttribute('data-date'); // YYYY-MM-DD
    if (!iso) return;
    // considera concluída até o fim do dia (23:59) da data
    const limit = new Date(iso + 'T23:59:59');
    const badge = item.querySelector('.tl-badge');
    if (badge && limit <= today) {
      badge.classList.add('done');
    }
  });
})();

// === Timeline: concluídas, AULA ATUAL (gutter) e selos N1/N2/N3 ===
(function markTimelineV3() {
  const today = new Date();
  const items = Array.from(document.querySelectorAll('.timeline .tl-item'));
  let firstFuture = null;

  items.forEach(item => {
    const iso = item.getAttribute('data-date'); // YYYY-MM-DD
    if (!iso) return;
    const endOfDay = new Date(iso + 'T23:59:59');
    const badge = item.querySelector('.tl-badge');
    if (!badge) return;

    if (endOfDay <= today) {
      badge.classList.add('done'); // concluída
    } else if (!firstFuture) {
      firstFuture = item;          // primeira futura = aula atual
    }

    // Selo N1/N2/N3 (se marcado no HTML via data-grade)
    const card = item.querySelector('.tl-card');
    const grade = card?.dataset?.grade; // "N1" | "N2" | "N3"
    if (card && grade && !card.querySelector('.grade-badge')) {
      const g = document.createElement('span');
      g.className = 'grade-badge';
      g.textContent = grade;
      card.appendChild(g);
    }
  });

  // AULA ATUAL: cria a bolacha amarela grande no lado esquerdo
  const subtitle = document.querySelector('#roadmap .muted.center');
  if (firstFuture) {
    const now = document.createElement('span');
    now.className = 'tl-now';
    now.textContent = 'AULA\nATUAL';
    firstFuture.appendChild(now);
    subtitle && (subtitle.textContent = 'Próxima parada: Aula Atual');
  } else {
    subtitle && (subtitle.textContent = '✅ Projeto concluído');
  }
})();

// === Ativa a "linha de energia" só quando #roadmap está visível ===
(function energyLineToggle(){
  const tl = document.querySelector('.timeline');
  if(!tl) return;
  const io = new IntersectionObserver(([entry])=>{
    tl.classList.toggle('flow', entry.isIntersecting);
  }, { threshold: 0.12 });
  io.observe(tl);
})();