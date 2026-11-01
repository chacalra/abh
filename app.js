document.documentElement.classList.add('js');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const $ = selector => document.querySelector(selector);

// Menú móvil
const menuButton = $('.menu-toggle');
const mobileNav = $('.mobile-nav');
const header = $('.header');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  mobileNav.classList.toggle('open', open);
  mobileNav.inert = !open;
  header.classList.toggle('menu-open', open);
  document.body.classList.toggle('modal-open', open);
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (!mobileNav.classList.contains('open')) return;
  if (event.key === 'Escape') { setMenu(false); menuButton.focus(); }
  if (event.key === 'Tab') {
    const last = mobileNav.querySelector('a:last-of-type');
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuButton.focus(); }
    if (event.shiftKey && document.activeElement === menuButton) { event.preventDefault(); last.focus(); }
  }
});
window.matchMedia('(min-width:761px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

// Sección actual resaltada en la navegación
const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > section[id]').forEach(section => sectionObserver.observe(section));
}

// Filtros de obras
const filters = document.querySelectorAll('[data-filter]');
const rows = document.querySelectorAll('.project-row');
filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filters.forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
  let count = 0;
  rows.forEach(row => { row.parentElement.hidden = filter !== 'all' && row.dataset.category !== filter; if (!row.parentElement.hidden) count++; });
  $('.project-filter-status').textContent = `${count} ${count === 1 ? 'obra' : 'obras'}`;
}));

// Vista previa que sigue al cursor sobre el índice de obras
const preview = $('.project-preview');
const previewImage = preview.querySelector('img');
rows.forEach(row => {
  row.addEventListener('pointerenter', () => {
    if (!finePointer.matches || !row.dataset.preview) return;
    previewImage.src = `assets/${row.dataset.preview}.jpg`;
    preview.classList.add('visible');
  });
  row.addEventListener('pointerleave', () => preview.classList.remove('visible'));
});
$('.project-list').addEventListener('pointermove', e => {
  if (!finePointer.matches) return;
  preview.style.left = `${Math.min(e.clientX + 200, innerWidth - 190)}px`;
  preview.style.top = `${e.clientY}px`;
});

// Fichas de obra
const cepPhotos = [
  ['cep-exterior', 'Volumen de hormigón de la Casa Pastoral iluminado al anochecer, entre árboles'],
  ['cep-structure', 'Volumen de hormigón con lamas verticales de la Casa Pastoral, sobre un basamento de piedra'],
  ['cep-courtyard', 'Patio entre volúmenes de hormigón y ladrillo de la Casa Pastoral, con vegetación']
];
const projects = [
  {
    name: 'Casa Pastoral de la CEP', category: 'Institucional',
    description: 'Sede de la Conferencia Episcopal Paraguaya en Parque Seminario, un barrio arbolado con fuertes desniveles. Una plaza elevada separa dos volúmenes: abajo, oficinas, sala de asambleas y oratorio alrededor de un patio; arriba, el alojamiento de los obispos. Hormigón, ladrillo y mampostería de piedra.',
    facts: [['Ubicación', 'Asunción'], ['Año', '2020'], ['Arquitectura', 'Giacomo Favilli, Nicolás Berger, Sergio Ruggeri'], ['Participación de ABH', 'Colaboración']],
    note: 'Fotografías: Luis Ayala, Federico Cairoli y Daniel Ojeda.',
    images: cepPhotos
  },
  {
    name: 'Centric', category: 'Residencial',
    description: 'Torre de departamentos con terraza y piscina en la azotea.',
    facts: [['Ubicación', 'Asunción'], ['Tipo', 'Torre residencial'], ['Estado', 'Proyecto']],
    note: '',
    images: [['centric', 'Render de una torre residencial de unos quince pisos al atardecer'], ['centric-detail', 'Render de la azotea con piscina y vista a la ciudad']]
  },
  {
    name: 'Oficinas públicas en el Puerto de Asunción', category: 'Institucional',
    description: 'Edificios de oficinas del Gobierno en el área del puerto, ejecutados por el consorcio TBI, que integra ABH.',
    facts: [['Ubicación', 'Puerto de Asunción'], ['Participación de ABH', 'Integrante del consorcio TBI']],
    note: '',
    images: []
  },
  {
    name: 'Edificio de oficinas frente a la bahía', category: 'Corporativo',
    description: 'Edificio corporativo frente a la bahía de Asunción, desarrollado por BAGA SA. Obra iniciada en 2026.',
    facts: [['Ubicación', 'Bahía de Asunción'], ['Desarrolladora', 'BAGA SA'], ['Estado', 'En construcción']],
    note: '',
    images: []
  }
];
const projectDialog = $('#project-dialog');
const contactDialog = $('#contact-dialog');
let projectIndex = 0, photoIndex = 0;
function showPhoto() {
  const images = projects[projectIndex].images;
  projectDialog.classList.toggle('no-media', images.length === 0);
  if (!images.length) return;
  const [file, alt] = images[photoIndex];
  const image = $('#dialog-image');
  image.src = `assets/abh/${file}.jpg`;
  image.alt = alt;
  $('.gallery-count').textContent = `${photoIndex + 1} de ${images.length}`;
  $('.dialog-gallery').hidden = images.length < 2;
}
function openDialog(dialog) { setMenu(false); preview.classList.remove('visible'); dialog.showModal(); document.body.classList.add('modal-open'); }
document.querySelectorAll('[data-project]').forEach(trigger => trigger.addEventListener('click', () => {
  projectIndex = Number(trigger.dataset.project);
  photoIndex = 0;
  const project = projects[projectIndex];
  $('#dialog-title').textContent = project.name;
  $('#dialog-category').textContent = project.category;
  $('#dialog-description').textContent = project.description;
  $('#dialog-note').textContent = project.note;
  $('#dialog-note').hidden = !project.note;
  $('#dialog-facts').replaceChildren(...project.facts.flatMap(([term, value]) => {
    const dt = document.createElement('dt'); dt.textContent = term;
    const dd = document.createElement('dd'); dd.textContent = value;
    return [dt, dd];
  }));
  showPhoto();
  openDialog(projectDialog);
}));
function changePhoto(direction) {
  const total = projects[projectIndex].images.length;
  if (total < 2) return;
  photoIndex = (photoIndex + direction + total) % total;
  showPhoto();
}
$('.gallery-prev').addEventListener('click', () => changePhoto(-1));
$('.gallery-next').addEventListener('click', () => changePhoto(1));
projectDialog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') changePhoto(-1); if (e.key === 'ArrowRight') changePhoto(1); });
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open'); });
});
document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => openDialog(contactDialog)));
$('#project-contact').addEventListener('click', () => { projectDialog.close(); openDialog(contactDialog); });
$('#contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const result = $('#form-result');
  result.hidden = false;
  e.target.querySelector('[type=submit]').hidden = true;
  result.scrollIntoView({ block: 'nearest', behavior: motion.matches ? 'instant' : 'smooth' });
});

// Enlaces simulados: avisan a dónde llevarían en la web final
const toast = $('.toast');
let toastTimer;
document.querySelectorAll('[data-fake]').forEach(button => button.addEventListener('click', () => {
  toast.textContent = `Acá se abrirá ${button.dataset.fake}.`;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
}));

// Especialidades: la imagen acompaña al ítem abierto
const serviceImages = document.querySelectorAll('.services-media img');
document.querySelectorAll('.service-list details').forEach(item => item.addEventListener('toggle', () => {
  if (!item.open) return;
  serviceImages.forEach(img => img.classList.toggle('active', img.dataset.service === item.dataset.service));
}));

// Galería: movimiento continuo; cada foto se abre en grande
const marquee = $('.marquee');
const shotDialog = $('#shot-dialog');
const shotImage = $('#shot-image');
document.querySelectorAll('.shot').forEach(shot => shot.addEventListener('click', () => {
  shotImage.src = `assets/ref/${shot.dataset.shot}.jpg`;
  shotImage.alt = shot.dataset.alt;
  $('#shot-title').textContent = shot.dataset.name;
  marquee.classList.add('paused');
  openDialog(shotDialog);
}));
shotDialog.addEventListener('close', () => marquee.classList.remove('paused'));

// Portada: el plano se arma con el scroll en tres pasos (fundaciones, estructura, fachada)
const build = $('.build');
const buildSticky = $('.build-sticky');
const found = $('.axo-found');
const levels = [...document.querySelectorAll('.axo-level')];
const steps = document.querySelectorAll('.build-steps li');
const reveal = $('.reveal');
const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const ease = t => 1 - Math.pow(1 - t, 3);
let ticking = false, currentStep = -1;

// Al cargar se dibujan la grilla, las zapatas y la platea
setTimeout(() => {
  build.classList.add('ready');
  setTimeout(() => { found.classList.add('built'); levels[0].classList.add('built'); }, motion.matches ? 0 : 350);
}, 60);

const buildDetail = $('.build-detail');
const stepDetails = document.querySelectorAll('.step-detail');
const baseDetails = [...stepDetails].map(el => el.textContent);
const levelLabel = k => `Losa del nivel +${(k * 3.2).toFixed(2).replace('.', ',')}`;
let currentDetail = '';

function renderBuild() {
  const rect = build.getBoundingClientRect();
  const p = motion.matches ? 1 : clamp(-rect.top / Math.max(1, build.offsetHeight - buildSticky.offsetHeight));
  let top = 0;
  levels.forEach((level, k) => {
    if (k === 0) return;
    const built = p >= .05 + (k - 1) * .08;
    level.classList.toggle('built', built);
    level.classList.toggle('clad', p >= .5 + (k - 1) * .05);
    if (built) top = k;
  });
  const step = motion.matches ? 2 : p < .05 ? 0 : p < .5 ? 1 : 2;

  // Cada fase tiene su barra; lo que se construye en esa fase se marca en ocre en el dibujo
  const fills = [1, clamp((p - .05) / .4), clamp((p - .5) / .25)];
  steps.forEach((li, i) => li.style.setProperty('--fill', motion.matches ? 1 : fills[i].toFixed(3)));
  found.classList.toggle('current', !motion.matches && step === 0);
  levels.forEach((level, k) => level.classList.toggle('current', !motion.matches && ((step === 1 && k === top && k > 0) || (step === 0 && k === 0))));
  build.classList.toggle('cladding', !motion.matches && step === 2 && p < .78);

  if (step !== currentStep) {
    currentStep = step;
    steps.forEach((li, i) => { li.classList.toggle('active', i <= step); li.classList.toggle('current', i === step); });
  }
  const detail = step === 1 && top > 0 ? levelLabel(top) : baseDetails[step];
  if (detail !== currentDetail) {
    currentDetail = detail;
    stepDetails[1].textContent = step === 1 && top > 0 ? detail : baseDetails[1];
    buildDetail.textContent = detail;
  }
}

// La foto de la obra se abre a medida que su sección entra en pantalla
function renderReveal() {
  if (motion.matches) return;
  const top = reveal.getBoundingClientRect().top;
  reveal.style.setProperty('--r', ease(clamp(1 - top / innerHeight)).toFixed(4));
}

function renderScroll() {
  ticking = false;
  renderBuild();
  renderReveal();
  header.classList.toggle('scrolled', scrollY > 10);
}
function requestRender() { if (!ticking) { requestAnimationFrame(renderScroll); ticking = true; } }
window.addEventListener('scroll', requestRender, { passive: true });
window.addEventListener('resize', requestRender, { passive: true });
motion.addEventListener('change', renderScroll);
renderScroll();
