const header = document.querySelector('.header');
const menu = document.querySelector('.menu');

menu.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => {
    header.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  });
});

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('figcaption');
const lightboxClose = lightbox.querySelector('.lightbox-close');
let lightboxTrigger;

document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    lightboxTrigger = button;
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.querySelector('img').alt;
    lightboxCaption.textContent = button.dataset.caption || '';
    lightbox.showModal();
  });
});

function closeLightbox() {
  lightbox.close();
  lightboxImage.removeAttribute('src');
  lightboxTrigger?.focus();
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox.addEventListener('close', () => {
  lightboxImage.removeAttribute('src');
});

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Solicitud web · ${data.get('tipo')} · ${data.get('localidad')}`);
  const body = encodeURIComponent(
    `Nombre: ${data.get('nombre')}\n` +
    `Teléfono: ${data.get('telefono')}\n` +
    `Email: ${data.get('email')}\n` +
    `Localidad: ${data.get('localidad')}\n` +
    `Tipo: ${data.get('tipo')}\n\n` +
    `${data.get('mensaje')}`
  );

  window.location.href = `mailto:hola@nachopaveade.es?subject=${subject}&body=${body}`;
});
