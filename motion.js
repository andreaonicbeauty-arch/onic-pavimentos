const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const root = document.documentElement;
const frames = new Set();
const visible = new Set();
const registered = new WeakSet();
let paused = false;
let pending = 0;
let serial = 0;
try { paused = localStorage.getItem('nacho-motion-paused') === 'true'; } catch { /* Storage is optional. */ }

const clamp = (value, min = -1, max = 1) => Math.min(max, Math.max(min, value));
const moving = () => !paused && !reduced.matches;

function schedule() { if (!pending) pending = requestAnimationFrame(render); }
function render() {
  pending = 0;
  if (!moving()) return;
  // Batch layout reads before all style writes. Only nearby photos participate.
  const measurements = [...visible].filter((frame) => frame.isConnected).map((frame) => ({ frame, box: frame.getBoundingClientRect() }));
  const mobile = innerWidth <= 760;
  for (const { frame, box } of measurements) {
    if (!box.height) continue;
    const p = clamp((innerHeight / 2 - box.top - box.height / 2) / ((innerHeight + box.height) / 2));
    const strength = mobile ? .55 : 1;
    const maxTravel = Math.min(box.height * .055, 38) * strength;
    const type = frame.dataset.motion;
    let x = 0, y = -p * maxTravel, zoom = 1.14, roll = 0, rx = 0, ry = 0;
    if (type === 'depth') { y = -p * maxTravel * 1.25; zoom = 1.16; }
    if (type === 'pan') { x = p * Math.min(box.width * .04, 28) * Number(frame.dataset.direction) * strength; y *= .4; zoom = 1.14; }
    if (type === 'zoom') { zoom = 1.06 + (1 - (p + 1) / 2) * .16; y *= .4; }
    if (type === 'rise') { y *= -1; roll = p * .65 * strength; zoom = 1.15; }
    if (type === 'tilt') { rx = p * 2.5 * strength; ry = p * -3 * strength; zoom = 1.1; y *= .5; }
    if (type === 'thumbnail') { y = -p * 3; zoom = 1.07; }
    const pointerX = Number(frame.dataset.pointerX || 0);
    const pointerY = Number(frame.dataset.pointerY || 0);
    frame.style.setProperty('--np-x', `${(x + pointerX * 7).toFixed(2)}px`);
    frame.style.setProperty('--np-y', `${(y + pointerY * 5).toFixed(2)}px`);
    frame.style.setProperty('--np-scale', zoom.toFixed(4));
    frame.style.setProperty('--np-roll', `${roll.toFixed(3)}deg`);
    frame.style.setProperty('--np-rx', `${(rx - pointerY * 2).toFixed(3)}deg`);
    frame.style.setProperty('--np-ry', `${(ry + pointerX * 3).toFixed(3)}deg`);
    if (frame.classList.contains('hero')) frame.style.setProperty('--np-copy-y', `${(p * 20 * strength).toFixed(2)}px`);
  }
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const frame = entry.target;
    if (entry.isIntersecting) {
      visible.add(frame);
      frame.classList.add('np-active');
      if (entry.boundingClientRect.top < innerHeight * .98) frame.classList.add('np-seen');
    } else {
      visible.delete(frame);
      frame.classList.remove('np-active');
    }
  }
  schedule();
}, { rootMargin: '0px', threshold: [0, .02, .15] });

function attach(image) {
  if (registered.has(image)) return;
  registered.add(image);
  if (image.closest('.brand')) { image.classList.add('np-logo'); return; }
  // The construction scene already has its own scroll narrative, while the
  // full-size viewer keeps the whole original photo visible without cropping.
  if (image.closest('.build-scene, .lightbox')) return;
  let frame = image.parentElement;
  let type = 'depth';
  let reveal = 'curtain';
  if (frame.classList.contains('page-hero')) {
    const wrapper = document.createElement('span');
    wrapper.className = 'np-media np-page-media';
    image.before(wrapper); wrapper.append(image); frame = wrapper;
    reveal = 'side';
  } else if (frame.classList.contains('work-gallery-grid')) {
    const wrapper = document.createElement('span');
    wrapper.className = 'np-media np-work-media';
    image.before(wrapper); wrapper.append(image); frame = wrapper;
    type = ['pan', 'rise', 'zoom'][serial % 3]; reveal = ['side', 'curtain', 'diagonal'][serial % 3];
  } else if (image.closest('.renovation-photo, .renovation-feature')) {
    const wrapper = document.createElement('span');
    wrapper.className = 'np-media np-renovation-media';
    image.before(wrapper); wrapper.append(image); frame = wrapper;
    type = image.closest('.renovation-feature') ? 'rise' : (serial % 2 ? 'zoom' : 'rise'); reveal = 'focus';
  } else if (image.closest('.project-thumbnails, .service-thumbs')) {
    type = 'thumbnail'; reveal = 'none';
  } else if (frame.matches('.project-photo, .service-stage')) {
    type = 'tilt'; reveal = 'side';
  } else if (frame.classList.contains('featured-image')) {
    type = 'zoom'; reveal = 'diagonal';
  } else if (frame.classList.contains('process-visual')) {
    type = 'pan'; reveal = 'curtain';
  } else if (!frame.classList.contains('hero')) {
    const wrapper = document.createElement('span');
    wrapper.className = 'np-media np-renovation-media';
    image.before(wrapper); wrapper.append(image); frame = wrapper;
    type = ['pan', 'zoom', 'rise'][serial % 3]; reveal = 'focus';
  }
  serial++;
  frame.classList.add('np-frame');
  frame.dataset.motion = type;
  frame.dataset.reveal = reveal;
  frame.dataset.direction = serial % 2 ? '1' : '-1';
  image.classList.add('np-photo');
  image.removeAttribute('data-depth');
  frames.add(frame);
  observer.observe(frame);
  image.addEventListener('load', () => {
    schedule();
    if (moving() && image.closest('.project-photo, .service-stage')) {
      image.animate([{ opacity: .4, filter: 'blur(3px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: 480, easing: 'ease-out' });
    }
  });
  if (type !== 'thumbnail') {
    frame.addEventListener('pointermove', (event) => {
      if (!moving() || !finePointer.matches || event.pointerType !== 'mouse') return;
      const box = frame.getBoundingClientRect();
      frame.dataset.pointerX = String(clamp((event.clientX - box.left) / box.width * 2 - 1));
      frame.dataset.pointerY = String(clamp((event.clientY - box.top) / box.height * 2 - 1));
      schedule();
    }, { passive: true });
    frame.addEventListener('pointerleave', () => { frame.dataset.pointerX = '0'; frame.dataset.pointerY = '0'; schedule(); });
  }
}

function scan(container) {
  if (container.nodeType !== Node.ELEMENT_NODE && container !== document) return;
  if (container.matches?.('img')) attach(container);
  container.querySelectorAll('img').forEach(attach);
}

const header = document.querySelector('.header');
const switchButton = document.createElement('button');
switchButton.type = 'button';
switchButton.className = 'motion-switch';
switchButton.innerHTML = '<svg class="motion-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h3v12H3zm7 0h3v12h-3z"/></svg><svg class="motion-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2v12l10-6z"/></svg><span>Efectos</span>';
if (header) header.insertBefore(switchButton, header.querySelector('.menu'));

function configure() {
  root.classList.toggle('motion-paused', !moving());
  switchButton.setAttribute('aria-pressed', String(paused));
  switchButton.setAttribute('aria-label', paused ? 'Activar todos los efectos de movimiento' : 'Pausar todos los efectos de movimiento');
  switchButton.title = paused ? 'Activar efectos' : 'Pausar efectos';
  document.dispatchEvent(new CustomEvent('site-motion-change', { detail: { enabled: moving() } }));
  if (!moving()) {
    frames.forEach((frame) => frame.querySelector('img')?.getAnimations().forEach((animation) => animation.cancel()));
  }
  schedule();
}
function toggle() {
  paused = !paused;
  try { localStorage.setItem('nacho-motion-paused', String(paused)); } catch { /* No storage requirement. */ }
  configure();
}
switchButton.addEventListener('click', toggle);
document.addEventListener('site-motion-toggle', toggle);
reduced.addEventListener('change', configure);
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule, { passive: true });
scan(document);
new MutationObserver((records) => {
  for (const record of records) {
    record.removedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const removed = node.matches('.np-frame') ? [node] : [...node.querySelectorAll('.np-frame')];
      removed.forEach((frame) => { observer.unobserve(frame); visible.delete(frame); frames.delete(frame); });
    });
    record.addedNodes.forEach(scan);
  }
}).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
root.classList.add('motion-ready');
configure();
