const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const root = document.documentElement;
const frames = new Set();
const visible = new Set();
const registered = new WeakSet();
const positions = new WeakMap();
let pending = 0;
let serial = 0;
let lastFrame = 0;

const clamp = (value, min = -1, max = 1) => Math.min(max, Math.max(min, value));
const moving = () => !reduced.matches;

function schedule() { if (!pending && !document.hidden && moving()) pending = requestAnimationFrame(render); }
function render(time) {
  pending = 0;
  if (!moving() || document.hidden) return;
  const blend = 1 - Math.exp(-Math.min(time - lastFrame || 16, 64) / 75);
  lastFrame = time;
  let settling = false;
  // Batch layout reads before all style writes. Only nearby photos participate.
  const measurements = [...visible].filter((frame) => frame.isConnected).map((frame) => ({ frame, box: frame.getBoundingClientRect() }));
  const mobile = innerWidth <= 760;
  for (const { frame, box } of measurements) {
    if (!box.height) continue;
    const p = clamp((innerHeight / 2 - box.top - box.height / 2) / ((innerHeight + box.height) / 2));
    const strength = mobile ? .65 : 1;
    const maxTravel = Math.min(box.height * .07, 46) * strength;
    const type = frame.dataset.motion;
    let x = 0, y = -p * maxTravel, zoom = 1.17, roll = 0, rx = 0, ry = 0;
    if (type === 'depth') { y = -p * maxTravel * 1.15; zoom = 1.19; }
    if (type === 'pan') { x = p * Math.min(box.width * .045, 34) * Number(frame.dataset.direction) * strength; y *= .35; zoom = 1.17; }
    if (type === 'zoom') { zoom = 1.10 + (1 - (p + 1) / 2) * .15; y *= .35; }
    if (type === 'rise') { y *= -1; roll = p * .7 * strength; zoom = 1.18; }
    if (type === 'tilt') { rx = p * 2.5 * strength; ry = p * -3 * strength; zoom = 1.14; y *= .45; }
    if (type === 'thumbnail') { y = -p * 4; zoom = 1.12; }
    // Keep the complete photograph inside the enlarged viewer.
    if (type === 'viewer') { y = -p * 4; zoom = .97; }
    const pointerX = Number(frame.dataset.pointerX || 0);
    const pointerY = Number(frame.dataset.pointerY || 0);
    const target = { x: x + pointerX * 7, y: y + pointerY * 5, scale: zoom, roll, rx: rx - pointerY * 2, ry: ry + pointerX * 3, copy: p * 20 * strength };
    const current = positions.get(frame) || { ...target };
    for (const key of Object.keys(target)) {
      const distance = target[key] - current[key];
      const tolerance = key === 'scale' ? .0001 : .015;
      current[key] = Math.abs(distance) < tolerance ? target[key] : current[key] + distance * blend;
      if (Math.abs(distance) >= tolerance) settling = true;
    }
    positions.set(frame, current);
    frame.style.setProperty('--np-x', `${current.x.toFixed(2)}px`);
    frame.style.setProperty('--np-y', `${current.y.toFixed(2)}px`);
    frame.style.setProperty('--np-scale', current.scale.toFixed(4));
    frame.style.setProperty('--np-roll', `${current.roll.toFixed(3)}deg`);
    frame.style.setProperty('--np-rx', `${current.rx.toFixed(3)}deg`);
    frame.style.setProperty('--np-ry', `${current.ry.toFixed(3)}deg`);
    if (frame.classList.contains('hero')) frame.style.setProperty('--np-copy-y', `${current.copy.toFixed(2)}px`);
  }
  // Settle gently after a scroll, then stop requesting frames while idle.
  if (settling) schedule();
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
  // This image follows the house's dedicated scroll timeline.
  if (image.closest('.build-scene')) { image.classList.add('np-story-photo'); return; }
  let frame = image.parentElement;
  let type = 'depth';
  // Keep the headline and main call to action visible on the first paint.
  let reveal = frame.classList.contains('hero') ? 'none' : 'curtain';
  if (image.closest('.lightbox')) {
    type = 'viewer'; reveal = 'none';
  } else if (frame.classList.contains('page-hero')) {
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
  frame.style.setProperty('--np-delay', `${type === 'thumbnail' ? 0 : (serial % 3) * 65}ms`);
  image.classList.add('np-photo');
  image.removeAttribute('data-depth');
  frames.add(frame);
  observer.observe(frame);
  image.addEventListener('load', () => {
    schedule();
    if (moving() && image.closest('.project-photo, .service-stage, .lightbox')) {
      image.animate([{ opacity: .35, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: 550, easing: 'cubic-bezier(.2,.65,.2,1)' });
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

function configure() {
  root.classList.toggle('motion-reduced', !moving());
  if (!moving()) {
    frames.forEach((frame) => frame.querySelector('img')?.getAnimations().forEach((animation) => animation.cancel()));
  }
  schedule();
}
reduced.addEventListener('change', configure);
document.addEventListener('visibilitychange', () => { lastFrame = 0; schedule(); });
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
