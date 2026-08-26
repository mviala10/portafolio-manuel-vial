# Portafolio de Manuel Vial — guía de despliegue

Este es un sitio web simple (sin frameworks, sin proceso de compilación) con
un panel de edición integrado (`/admin`) para que agregues, edites o borres
tus trabajos de video y gráfica directamente desde el navegador, sin tocar
código nunca más. Costo total: **el dominio, si decides comprar uno (~10-15
USD/año)**. El hosting y el panel de edición son gratis.

## Qué incluye

- `index.html`, `style.css`, `script.js` — el sitio público.
- `content/settings.json` — tu nombre, rol, frase, "sobre mí" y redes.
- `content/portfolio.json` — tus trabajos (empieza vacío).
- `admin/` — el panel de edición (Decap CMS).
- `assets/img/` — ahí se guardan las imágenes que subas desde el panel.

## Paso 1 — Crear una cuenta en GitHub (gratis)

Si no tienes una: ve a github.com y crea una cuenta.

## Paso 2 — Subir estos archivos a un repositorio

1. En GitHub, crea un repositorio nuevo (por ejemplo `portafolio-manuel-vial`). Puede ser público o privado.
2. Sube TODA esta carpeta a ese repositorio (arrastrando los archivos en la
   página del repo, o con GitHub Desktop si prefieres una app).
3. Asegúrate de que la rama principal se llame `main` (si no, cambia
   `branch: main` en `admin/config.yml` por el nombre que corresponda).

## Paso 3 — Crear una cuenta en Netlify (gratis)

1. Ve a netlify.com y crea una cuenta (puedes entrar directo con tu cuenta de GitHub).
2. Click en "Add new site" → "Import an existing project" → elige GitHub →
   selecciona tu repositorio.
3. Deja los campos de "build command" vacíos y "publish directory" como `.`
   (punto). No hay nada que compilar.
4. Click en "Deploy site". En un minuto tendrás una URL tipo
   `https://algo-al-azar.netlify.app` — tu portafolio ya está en línea.
5. (Opcional) En "Site settings" puedes cambiar ese nombre por algo como
   `manuelvial.netlify.app` sin costo.

## Paso 4 — Activar Netlify Identity + Git Gateway (esto habilita el panel /admin)

1. Dentro de tu sitio en Netlify, ve a **Site configuration → Identity** →
   click en "Enable Identity".
2. Baja a **Registration** y déjalo en "Invite only" (así solo tú puedes
   entrar al panel).
3. Ve a **Site configuration → Identity → Services → Git Gateway** → click
   en "Enable Git Gateway". Esto le da permiso al panel de edición para
   guardar cambios en tu repositorio de GitHub sin que tengas que manejar
   tokens ni configuraciones técnicas.
4. Vuelve a **Identity** → pestaña de usuarios (Users) → **Invite users** →
   escribe tu propio email → te llegará un correo de invitación.
5. Abre ese correo y haz click en el enlace. Te va a llevar a tu sitio y te
   va a pedir crear una contraseña. Listo — ya puedes entrar a
   `tu-sitio.netlify.app/admin`.

## Paso 5 — Editar tu contenido

Entra a `tu-sitio.netlify.app/admin`, inicia sesión con el correo y
contraseña que creaste, y vas a ver dos secciones:

- **Datos del sitio**: tu nombre, rol, frase, texto "sobre mí" y redes.
- **Trabajos**: acá agregas cada pieza. Por cada trabajo eliges si es
  "Video" (pegas el link de YouTube o Vimeo) o "Gráfica" (subes una imagen).
  Puedes agregar cliente, año y etiquetas.

Cada vez que guardes ("Publish"), el cambio queda en línea en menos de un
minuto, sin que vuelvas a tocar código.

**Sobre las imágenes:** súbelas optimizadas para web (idealmente menos de
1-2 MB cada una, formato JPG o WEBP) para que el sitio cargue rápido.

**Sobre los videos:** primero súbelos a YouTube o Vimeo (pueden quedar como
"no listado" si no quieres que aparezcan en las búsquedas de esas
plataformas) y luego pega el link normal en el panel. El sitio genera el
reproductor automáticamente.

## Paso 6 (opcional) — Dominio propio

Si quieres algo como `manuelvial.com` en vez de `manuelvial.netlify.app`:

1. Compra el dominio donde prefieras (Namecheap, Cloudflare Registrar,
   NIC Chile si buscas `.cl` — un `.cl` ronda los 10.000-15.000 CLP/año,
   dentro de tu presupuesto).
2. En Netlify: **Site configuration → Domain management → Add a domain**,
   escribe tu dominio y sigue las instrucciones para apuntar el DNS.
   Netlify te da el certificado HTTPS gratis automáticamente.

## Si quieres que yo haga alguno de estos pasos contigo

Puedo guiarte en vivo compartiendo tu pantalla, o si conectas tu navegador
Chrome a esta conversación puedo hacer varios de estos clicks por ti la
próxima vez que hablemos.
