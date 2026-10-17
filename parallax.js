// One scroll listener and one animation frame, with no continuous animation loop.
const story = document.querySelector('.build-story');
if (story) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const steps = [...story.querySelectorAll('[data-build-step]')];
  let frame = 0;
  let lastProgress = -1;
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const ease = (value) => { const x = clamp(value); return x * x * (3 - 2 * x); };

  function render(progress) {
    if (Math.abs(progress - lastProgress) < .0001) return;
    lastProgress = progress;
    const pour = ease((progress - .12) / .4);
    const enter = ease((progress - .66) / .34);
    const stage = progress < .28 ? 0 : progress < .7 ? 1 : 2;
    story.style.setProperty('--progress', progress.toFixed(4));
    story.style.setProperty('--pour', pour.toFixed(4));
    story.style.setProperty('--finish', ease((progress - .48) / .15).toFixed(4));
    story.style.setProperty('--enter', enter.toFixed(4));
    story.style.setProperty('--inside', ease((progress - .86) / .14).toFixed(4));
    story.style.setProperty('--stream', progress > .14 && progress < .5 ? '1' : '0');
    story.style.setProperty('--flow', `${-progress * 450}px`);
    story.style.setProperty('--tool', progress > .3 && progress < .64 ? '1' : '0');
    story.style.setProperty('--tool-x', `${Math.sin(progress * 20) * 90}px`);
    story.style.setProperty('--tool-y', `${(1 - pour) * 120}px`);
    steps.forEach((button, index) => button.setAttribute('aria-pressed', String(stage === index)));
  }

  function update() {
    frame = 0;
    const rect = story.getBoundingClientRect();
    document.body.classList.toggle('in-build-story', rect.top < 140 && rect.bottom > innerHeight / 2);
    if (reducedMotion.matches) return;
    const pin = story.querySelector('.build-story-pin');
    const top = parseFloat(getComputedStyle(pin).top) || 72;
    render(clamp((top - rect.top) / Math.max(1, rect.height - pin.offsetHeight)));
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

  function configure() {
    const animated = !reducedMotion.matches;
    story.classList.toggle('is-animated', animated);
    lastProgress = -1;
    if (animated) schedule();
    else {
      render(1);
    }
  }
  steps.forEach((button) => button.addEventListener('click', () => {
    const progress = [0, .46, 1][Number(button.dataset.buildStep)];
    if (reducedMotion.matches) render(progress);
    else {
      const pin = story.querySelector('.build-story-pin');
      const top = parseFloat(getComputedStyle(pin).top) || 72;
      const target = scrollY + story.getBoundingClientRect().top - top + (story.offsetHeight - pin.offsetHeight) * progress;
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reducedMotion.addEventListener('change', configure);
  story.classList.add('is-ready');
  configure();
}
