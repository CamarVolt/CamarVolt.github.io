// Fallback de imagem: se não houver PNG do componente, usa o logo
document.querySelectorAll('.comp-thumb').forEach(img => {
  img.addEventListener('error', () => {
    img.onerror = null;
    img.src = '../CamarVolt-Logo-Transparent.png';
    img.style.objectFit = 'contain';
    img.style.filter = 'brightness(0.95)';
    img.style.background = 'linear-gradient(180deg,#0f1013,#0a0b0d)';
  });
});
