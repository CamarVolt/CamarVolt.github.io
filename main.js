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
