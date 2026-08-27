const header = document.querySelector('.header');
const menu = document.querySelector('.menu');

if (header && menu) {
  menu.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  header.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

const lightbox = document.querySelector('.lightbox');
let lightboxTrigger;

function showLightbox({ src, alt, caption, trigger }) {
  if (!lightbox) return;
  lightboxTrigger = trigger;
  const image = lightbox.querySelector('img');
  image.src = src;
  image.alt = alt;
  lightbox.querySelector('figcaption').textContent = caption;
  lightbox.showModal();
}

if (lightbox) {
  const image = lightbox.querySelector('img');
  const close = () => {
    lightbox.close();
    image.removeAttribute('src');
    lightboxTrigger?.focus();
  };
  lightbox.querySelector('.lightbox-close').addEventListener('click', close);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });
  lightbox.addEventListener('close', () => image.removeAttribute('src'));
}

const imagePaths = (folder, count) => Array.from(
  { length: count },
  (_, index) => `assets/galeria/${folder}/${String(index + 1).padStart(2, '0')}.jpg`
);

const projects = {
  impresoA: {
    type: 'Pavimento impreso · Proyecto A',
    title: 'Patio rural en tono terracota',
    description: 'Textura de piedra irregular y color integrado en un espacio exterior de carácter rural.',
    alt: 'Patio rural de pavimento impreso',
    images: imagePaths('impreso-obra-1', 7)
  },
  impresoB: {
    type: 'Pavimento impreso · Proyecto B',
    title: 'Acceso decorativo con brújula',
    description: 'Paños, cenefas y un motivo central personalizado para crear un acceso exterior único.',
    alt: 'Acceso decorativo de pavimento impreso',
    images: imagePaths('impreso-obra-2', 7)
  },
  hormigon: {
    type: 'Hormigón impreso',
    title: 'Losa y piedra con motivo central',
    description: 'Acabado en tono arena, varios moldes y una brújula decorativa como punto focal.',
    alt: 'Acceso residencial de hormigón impreso',
    images: imagePaths('hormigon-obra-3', 8)
  },
  pulido: {
    type: 'Pavimento pulido',
    title: 'Superficie exterior de alta resistencia',
    description: 'Proceso completo de preparación, vertido, nivelación y pulido de una superficie continua.',
    alt: 'Ejecución y acabado de pavimento pulido',
    images: imagePaths('pulido', 9)
  },
  vertical: {
    type: 'Revestimiento vertical',
    title: 'Muro decorativo efecto piedra',
    description: 'Modelado y coloración manual para transformar un cerramiento en un acabado pétreo continuo.',
    alt: 'Muro con revestimiento vertical efecto piedra',
    images: imagePaths('vertical', 8)
  }
};

const projectBrowser = document.querySelector('.project-browser');

if (projectBrowser) {
  const tabs = [...projectBrowser.querySelectorAll('[data-project]')];
  const photoButton = projectBrowser.querySelector('.project-photo');
  const image = photoButton.querySelector('img');
  const type = projectBrowser.querySelector('.project-type');
  const title = projectBrowser.querySelector('#project-title');
  const description = projectBrowser.querySelector('.project-description');
  const current = projectBrowser.querySelector('.project-counter b');
  const total = projectBrowser.querySelector('.project-counter span');
  const meter = projectBrowser.querySelector('.project-meter span');
  const thumbnails = projectBrowser.querySelector('.project-thumbnails');
  const previous = projectBrowser.querySelector('.stage-control.previous');
  const next = projectBrowser.querySelector('.stage-control.next');
  const fullscreen = projectBrowser.querySelector('.fullscreen-link');
  let activeProject = 'impresoA';
  let activeImage = 0;
  let touchStartX = 0;

  const caption = (project, index) => `${project.title} · Fotografía ${index + 1} de ${project.images.length}`;

  function openActivePhoto(trigger) {
    const project = projects[activeProject];
    showLightbox({
      src: project.images[activeImage],
      alt: `${project.alt}, fotografía ${activeImage + 1}`,
      caption: caption(project, activeImage),
      trigger
    });
  }

  function updatePhoto(index, animate = true, scrollThumbnail = animate) {
    const project = projects[activeProject];
    activeImage = (index + project.images.length) % project.images.length;
    if (animate) image.classList.add('changing');
    image.src = project.images[activeImage];
    image.alt = `${project.alt}, fotografía ${activeImage + 1}`;
    current.textContent = String(activeImage + 1).padStart(2, '0');
    meter.style.width = `${((activeImage + 1) / project.images.length) * 100}%`;
    thumbnails.querySelectorAll('button').forEach((button, buttonIndex) => {
      const selected = buttonIndex === activeImage;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-current', selected ? 'true' : 'false');
      if (selected && scrollThumbnail) button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  }

  function renderProject(projectId) {
    activeProject = projectId;
    activeImage = 0;
    const project = projects[projectId];
    tabs.forEach((tab) => {
      const selected = tab.dataset.project === projectId;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    type.textContent = project.type;
    title.textContent = project.title;
    description.textContent = project.description;
    total.textContent = String(project.images.length).padStart(2, '0');
    thumbnails.replaceChildren();
    project.images.forEach((src, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Ver fotografía ${index + 1} de ${project.images.length}`);
      const thumbnail = document.createElement('img');
      thumbnail.src = src;
      thumbnail.alt = '';
      thumbnail.loading = index < 3 ? 'eager' : 'lazy';
      thumbnail.decoding = 'async';
      button.append(thumbnail);
      button.addEventListener('click', () => updatePhoto(index));
      thumbnails.append(button);
    });
    updatePhoto(0, false);
  }

  image.addEventListener('load', () => image.classList.remove('changing'));
  tabs.forEach((tab, tabIndex) => {
    tab.addEventListener('click', () => renderProject(tab.dataset.project));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (tabIndex + direction + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      renderProject(tabs[nextIndex].dataset.project);
    });
  });
  previous.addEventListener('click', () => updatePhoto(activeImage - 1));
  next.addEventListener('click', () => updatePhoto(activeImage + 1));
  photoButton.addEventListener('click', () => openActivePhoto(photoButton));
  fullscreen.addEventListener('click', () => openActivePhoto(fullscreen));
  photoButton.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  photoButton.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) >= 45) updatePhoto(activeImage + (distance < 0 ? 1 : -1));
  }, { passive: true });
  renderProject(activeProject);
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const subject = encodeURIComponent(`Solicitud web · ${data.get('tipo')} · ${data.get('localidad')}`);
    const body = encodeURIComponent(
      `Nombre: ${data.get('nombre')}\nTeléfono: ${data.get('telefono')}\nEmail: ${data.get('email')}\n` +
      `Localidad: ${data.get('localidad')}\nTipo: ${data.get('tipo')}\n\n${data.get('mensaje')}`
    );
    window.location.href = `mailto:hola@nachopaveade.es?subject=${subject}&body=${body}`;
  });
}
