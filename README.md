# Nacho Paveade

Web corporativa mobile-first de Nacho Paveade: reformas generales, hormigón impreso y pavimentos decorativos con servicio en toda España.

La galería incluye una selección optimizada de obras reales de pavimento impreso, hormigón impreso, pavimento pulido y revestimiento vertical.

## Desarrollo

```bash
npm install
npm run start
```

`npm run build` genera todas las páginas y conserva las rutas de las galerías en `dist/`. La compilación no vacía una carpeta de salida existente.

La web incluye reformas integrales y parciales de viviendas, cocinas, baños y trabajos de albañilería, suelos y pintura, además de los servicios originales de pavimentos.

Las imágenes de `assets/reformas/` son ilustraciones generadas con IA, identificadas como tales en la web. No deben añadirse a la galería de obras reales. Las fotografías originales de pavimentos se conservan.

El formulario abre un correo preparado para funcionar sin servidor; el visitante revisa y envía desde su aplicación de correo. Contacto: 643 980 232 y nachopaveade@gmail.com.

## SEO de reformas

La página `reformas-madrid.html` presenta reformas integrales y parciales, cocinas, baños, albañilería, suelos y pintura con cobertura en Madrid. Mantener títulos y descripciones propios, un H1 por página, enlaces internos, canonical, datos estructurados coherentes con el contenido y sitemap con fechas reales de modificación. Conservar las páginas de pavimentos. No inventar direcciones, reseñas, precios ni obras realizadas; las imágenes de reformas son ilustrativas. Tras publicar, verificar las URLs públicas y enviar el sitemap actualizado en Google Search Console si hay acceso. La indexación y posición las decide Google.

Preferencia del usuario (2026-10-08): orientar los contenidos y el SEO de reformas a Madrid y provincias cercanas. No limitar las reformas solo a Madrid capital ni añadir sedes ficticias en otras provincias.

## Recorrido de obra al hacer scroll

La portada incorpora `parallax.css` y `parallax.js`: una ilustración arquitectónica con preparación del terreno, vertido y nivelación del hormigón, textura de pavimento y acercamiento al interior de la vivienda. La imagen interior es ilustrativa y está identificada como generada con IA. Las fotos de obras reales permanecen en su galería.

El movimiento sigue el scroll sin bloquearlo; los botones permiten elegir una fase, pausar el movimiento o saltar a los servicios. Se respeta `prefers-reduced-motion`, y sin JavaScript queda una escena estática con los enlaces accesibles. No se añaden dependencias ni vídeos de reproducción automática.

## Movimiento e imágenes en todas las páginas

`motion.js` y `motion.css` aplican profundidad, desplazamiento lateral, zoom, movimiento inverso y perspectiva a las fotografías. Los revelados usan máscaras verticales, laterales y diagonales. El cursor añade un desplazamiento ligero en escritorio; en móvil los efectos principales dependen del scroll. Un botón en la cabecera pausa todos los efectos y recuerda la preferencia. Las galerías conservan sus controles, miniaturas y visor del original completo.

Se actualizan únicamente las imágenes visibles mediante IntersectionObserver y un único requestAnimationFrame por evento, sin bucle permanente. Las miniaturas y fotos secundarias se cargan de forma diferida. `responsive-images.js` asigna srcset y sizes a las galerías; las imágenes HTML también los incluyen. Las copias JPEG de 160, 640 y 960 píxeles están en `assets/responsive/`; los originales permanecen intactos. Al incorporar fotos nuevas deben generarse sus copias y actualizarse el mapa de dimensiones.

Las nueve páginas tienen títulos y descripciones propios, canonical, datos de negocio GeneralContractor, entidad de página y migas de pan. Inicio y servicios incluyen un catálogo de los servicios que aparecen en el contenido. El sitemap conserva las URLs públicas y las fechas reales de modificación. No añadir reseñas, precios, direcciones ni garantías que no estén confirmados.
