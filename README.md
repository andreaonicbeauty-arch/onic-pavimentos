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
