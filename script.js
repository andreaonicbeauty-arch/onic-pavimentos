const header = document.querySelector('.header');
const menu = document.querySelector('.menu');
const mobileDock = document.querySelector('.mobile-dock');

if (mobileDock) {
  const currentPage = document.body.dataset.page;
  const current = (page) => currentPage === page ? ' aria-current="page"' : '';
  mobileDock.innerHTML = `
    <a href="index.html"${current('inicio')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z"/></svg><span>Inicio</span></a>
    <a href="servicios.html"${current('servicios')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg><span>Servicios</span></a>
    <a href="proyectos.html"${current('proyectos')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6"/></svg><span>Obras</span></a>
    <a href="contacto.html"${current('contacto')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM5 6l7 6 7-6"/></svg><span>Contacto</span></a>`;
}

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
      if (selected && scrollThumbnail) {
        thumbnails.scrollTo({ left: button.offsetLeft - (thumbnails.clientWidth - button.offsetWidth) / 2, behavior: 'smooth' });
      }
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

const serviceItems = [...document.querySelectorAll('.service-item')];

serviceItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    serviceItems.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

document.querySelectorAll('.service-gallery').forEach((gallery) => {
  const folder = gallery.dataset.folder;
  const count = Number(gallery.dataset.count);
  const alt = gallery.dataset.alt;
  const images = imagePaths(folder, count);
  const stage = gallery.querySelector('.service-stage');
  const image = stage.querySelector('img');
  const current = stage.querySelector('b');
  const thumbnails = gallery.querySelector('.service-thumbs');
  let active = 0;
  let touchStartX = 0;

  function select(index, scroll = true) {
    active = (index + images.length) % images.length;
    image.src = images[active];
    image.alt = `${alt}, fotografía ${active + 1}`;
    current.textContent = String(active + 1).padStart(2, '0');
    thumbnails.querySelectorAll('button').forEach((button, buttonIndex) => {
      const selected = buttonIndex === active;
      button.setAttribute('aria-current', String(selected));
      if (selected && scroll) {
        thumbnails.scrollTo({ left: button.offsetLeft - (thumbnails.clientWidth - button.offsetWidth) / 2, behavior: 'smooth' });
      }
    });
  }

  images.forEach((src, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Ver fotografía ${index + 1} de ${count}`);
    const thumbnail = document.createElement('img');
    thumbnail.src = src;
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    thumbnail.decoding = 'async';
    button.append(thumbnail);
    button.addEventListener('click', () => select(index));
    thumbnails.append(button);
  });

  gallery.querySelector('.service-prev').addEventListener('click', () => select(active - 1));
  gallery.querySelector('.service-next').addEventListener('click', () => select(active + 1));
  stage.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) >= 45) select(active + (distance < 0 ? 1 : -1));
  }, { passive: true });
  select(0, false);
});

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
