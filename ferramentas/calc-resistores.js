// ====== Mapa de cores ======
const COLORS = {
  'preto':   { digit:0, mult:1,        hex:'#000000' },
  'marrom':  { digit:1, mult:10,       hex:'#6b3b1f' },
  'vermelho':{ digit:2, mult:100,      hex:'#c62828' },
  'laranja': { digit:3, mult:1000,     hex:'#ff8f00' },
  'amarelo': { digit:4, mult:10000,    hex:'#f9a825' },
  'verde':   { digit:5, mult:100000,   hex:'#2e7d32' },
  'azul':    { digit:6, mult:1000000,  hex:'#1565c0' },
  'violeta': { digit:7, mult:10000000, hex:'#6a1b9a' },
  'cinza':   { digit:8, mult:100000000,hex:'#616161' },
  'branco':  { digit:9, mult:1000000000,hex:'#e0e0e0' },
  'ouro':    { digit:null, mult:0.1,   hex:'#d4af37' },
  'prata':   { digit:null, mult:0.01,  hex:'#c0c0c0' },
  'sem-faixa':{digit:null, mult:null,  hex:'#00000000' },
};
const TOL = { marrom:1, vermelho:2, ouro:5, prata:10, 'sem-faixa':20, verde:0.5, azul:0.25, violeta:0.1, cinza:0.05 };
const TEMPCO = { marrom:100, vermelho:50, laranja:15, amarelo:25, verde:20, azul:10, violeta:5 };
const STANDARD = ['preto','marrom','vermelho','laranja','amarelo','verde','azul','violeta','cinza','branco','ouro','prata','sem-faixa'];

// ====== DOM ======
const bandsCount = document.querySelector('#bandsCount');
const pickers = document.querySelector('#pickers');
const bandsPreview = document.querySelector('#bandsPreview');
const outValue = document.querySelector('#outValue');
const outTol = document.querySelector('#outTol');
const outTemp = document.querySelector('#outTemp');
const outDetails = document.querySelector('#outDetails');
const outInterpret = document.querySelector('#outInterpret');
const btnDecode = document.querySelector('#btnDecode');
const btnRandom = document.querySelector('#btnRandom');
const btnCopy = document.querySelector('#btnCopy');

// ====== Helpers ======
const human = (n)=>{
  if (n === Infinity || isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n/1e9).toFixed(3).replace(/\.0+$/,'') + ' GΩ';
  if (abs >= 1e6) return (n/1e6).toFixed(3).replace(/\.0+$/,'') + ' MΩ';
  if (abs >= 1e3) return (n/1e3).toFixed(3).replace(/\.0+$/,'') + ' kΩ';
  return (n).toFixed(2).replace(/\.00$/,'') + ' Ω';
};


function makePicker(labelText, role){
  const row = document.createElement('div');
  row.className = 'picker-row';

  const label = document.createElement('label');
  label.textContent = labelText;

  const select = document.createElement('select');
  select.dataset.role = role;
  STANDARD.forEach(k=>{
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = k;
    select.appendChild(opt);
  });

  const sw = document.createElement('span');
  sw.className = 'swatch';
  sw.style.background = '#000';

  select.addEventListener('change', ()=>{
    const c = COLORS[select.value]?.hex || '#000';
    sw.style.background = c;
    renderPreview();
  });

  row.appendChild(label);
  row.appendChild(select);
  row.appendChild(sw);
  return row;
}


function renderPickers(){
  pickers.innerHTML = '';
  const n = Number(bandsCount.value);

  // 4: d1 d2 mul tol
  // 5: d1 d2 d3 mul tol
  // 6: d1 d2 d3 mul tol temp
  const rows = [];
  if (n === 4){
    rows.push(makePicker('Faixa 1','sig'));
    rows.push(makePicker('Faixa 2','sig'));
    rows.push(makePicker('Multiplicador','mul'));
    rows.push(makePicker('Tolerância','tol'));
  } else if (n === 5){
    rows.push(makePicker('Faixa 1','sig'));
    rows.push(makePicker('Faixa 2','sig'));
    rows.push(makePicker('Faixa 3','sig'));
    rows.push(makePicker('Multiplicador','mul'));
    rows.push(makePicker('Tolerância','tol'));
  } else {
    rows.push(makePicker('Faixa 1','sig'));
    rows.push(makePicker('Faixa 2','sig'));
    rows.push(makePicker('Faixa 3','sig'));
    rows.push(makePicker('Multiplicador','mul'));
    rows.push(makePicker('Tolerância','tol'));
    rows.push(makePicker('Tempco','temp'));
  }

  rows.forEach(r=> pickers.appendChild(r));
  // valores iniciais
  pickers.querySelectorAll('select').forEach((sel,i)=>{
    // defaults razoáveis
    const defaults = ['marrom','preto','preto','marrom','ouro','marrom'];
    sel.value = defaults[i] || 'marrom';
    sel.dispatchEvent(new Event('change'));
  });

  renderPreview();
}

function renderPreview(){
  bandsPreview.innerHTML = '';
  const selects = [...pickers.querySelectorAll('select')];

  selects.forEach(sel=>{
    const role = sel.dataset.role;
    const band = document.createElement('div');
    band.className = 'band ' + ((role==='tol'||role==='temp')?'small':'');
    band.style.background = COLORS[sel.value]?.hex || '#000';
    bandsPreview.appendChild(band);
  });
}

function decode(){
  const n = Number(bandsCount.value);
  const selects = [...pickers.querySelectorAll('select')].map(s=>s.value);

  let digits = [], mult, tol, temp;
  if (n===4){
    digits = [COLORS[selects[0]].digit, COLORS[selects[1]].digit];
    mult = COLORS[selects[2]].mult;
    tol = TOL[selects[3]];
  } else {
    digits = [COLORS[selects[0]].digit, COLORS[selects[1]].digit, COLORS[selects[2]].digit];
    mult = COLORS[selects[3]].mult;
    tol = TOL[selects[4]];
    if (n===6) temp = TEMPCO[selects[5]];
  }

  if (digits.some(d => d==null)){
    outInterpret.textContent = 'Escolhas inválidas para dígitos significativos.';
    outValue.textContent = '—'; outTol.textContent='—'; outTemp.textContent='—'; outDetails.textContent='—';
    return;
  }

  const sig = (n===4) ? (digits[0]*10 + digits[1]) : (digits[0]*100 + digits[1]*10 + digits[2]);
  const ohm = sig * (mult ?? 1);

  const tolPct = tol!=null ? tol/100 : null;
  const min = tolPct ? ohm*(1 - tolPct) : null;
  const max = tolPct ? ohm*(1 + tolPct) : null;

  outValue.textContent = human(ohm);
  outTol.textContent = tol!=null ? `±${tol}%` : '—';
  outTemp.textContent = (n===6 && temp!=null) ? `${temp} ppm/°C` : (n===6 ? '—' : '—');

  outInterpret.textContent = `Resistor de ${human(ohm)}${tol!=null ? ` ±${tol}%` : ''}`;
  let det = `Significantes: ${digits.join(', ')}\nMultiplicador: x${mult}\n`;
  if (tol!=null) det += `Tolerância: ±${tol}%\nMin: ${human(min)} | Max: ${human(max)}\n`;
  if (n===6 && temp!=null) det += `Tempco: ${temp} ppm/°C`;
  outDetails.textContent = det;
}



function randomize(){
  const selects = [...pickers.querySelectorAll('select')];
  selects.forEach(sel=>{
    const role = sel.dataset.role;
    let opts;
    if (role==='sig') opts = STANDARD.slice(0,10); // 0..9
    else if (role==='mul') opts = STANDARD.slice(0,12); // inclui ouro e prata
    else if (role==='tol') opts = Object.keys(TOL);
    else opts = Object.keys(TEMPCO); // tempco
    sel.value = opts[Math.floor(Math.random()*opts.length)];
    sel.dispatchEvent(new Event('change'));
  });
  decode();
}

function copyValue(){
  const text = `${outValue.textContent} ${outTol.textContent!== '—' ? outTol.textContent : ''}`.trim();
  navigator.clipboard?.writeText(text).then(()=>{
    btnCopy.textContent = 'Copiado!';
    setTimeout(()=> btnCopy.textContent='Copiar valor', 900);
  }).catch(()=>{
    btnCopy.textContent = 'Falha';
    setTimeout(()=> btnCopy.textContent='Copiar valor', 900);
  });
}


// ====== Events ======
bandsCount.addEventListener('change', renderPickers);
btnDecode.addEventListener('click', decode);
btnRandom.addEventListener('click', randomize);
btnCopy.addEventListener('click', copyValue);



// init
renderPickers();
randomize();
