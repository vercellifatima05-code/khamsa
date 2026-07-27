# KHAMSA — Qué se hizo y qué falta

## ✅ Lo que ya funciona (Fase 1 — sitio estático, mismo link de GitHub Pages)

- **Sobre mí**: presentación de Fátima con el texto que enviaste.
- **Terapias**: 10 tarjetas (Biomagnetismo, Auriculoterapia, Cuencos, Ventosas,
  Baño de Gong, Fitoterapia + Esencias Florales, y las 4 modalidades online),
  cada una con su propio detalle en una ventana modal, filtrables por
  Presencial / Online / Presencial y Online.
- **Texto de "Asesoramiento personalizado"** corregido exactamente como pediste.
- **Fitoterapia y Esencias Florales**: tarjeta destacada con toda la lista
  (plantas medicinales, tinturas madre, flores de Bach, de El Bolsón, etc.),
  aclarando que es presencial y online.
- **Galería**: sección lista para mostrar fotos (por ahora vacía, ver abajo
  cómo agregarlas).
- **Reservá tu turno**: formulario con nombre, apellido, teléfono, edad, día,
  horario y motivo. Valida que el turno se pida con 24 hs de anticipación,
  solo ofrece horarios de días hábiles (lun-vie 10-18, editable en `script.js`)
  y, al confirmar, abre WhatsApp con el mensaje ya redactado para vos.
- **Contacto**: sección con botón directo a WhatsApp e Instagram.
- **Menú de navegación** nuevo (Inicio · Sobre mí · Terapias · Productos ·
  Galería · Reservá tu turno · Contacto), adaptado a celular.
- Se conservó todo el catálogo de tinturas y la guía de plantas que ya tenías.

Podés publicar esta carpeta tal como está — reemplazando los archivos actuales
en tu repositorio de GitHub — y el sitio sigue funcionando en el mismo link.

## ✋ Lo que todavía no se puede hacer con este tipo de sitio

Pediste varias cosas que, para funcionar de verdad y de forma segura, **necesitan
un servidor con base de datos** — no alcanza con un sitio de solo HTML/CSS/JS
como este, ni siquiera ocultando botones con código, porque cualquiera podría
editar el sitio en su propio navegador y saltarse esa protección. Vos misma lo
señalaste en el pedido, y tenés razón:

- **Login de administradora con permisos reales** (que solo tu cuenta pueda
  editar contenido, y que eso se verifique del lado del servidor).
- **Productos, categorías y galería administrables desde la web**, sin tocar
  código, con botones de agregar/editar/eliminar.
- **Calendario de turnos compartido**: que un horario reservado por una
  persona quede bloqueado automáticamente para todas las demás, en tiempo real.
- **Cancelación de turnos por parte del cliente**, verificando que solo
  pueda cancelar el suyo.
- **Notificación automática** cuando entra una reserva nueva.

### La solución recomendada: Firebase (de Google)

Es gratuita para el volumen de uso de un sitio como este, no requiere que
aprendas a programar un servidor, y se integra con el mismo sitio estático que
ya tenés en GitHub Pages. Permite:

- **Authentication**: vos iniciás sesión con tu cuenta
  `vercellifatima05@gmail.com`; nadie más puede entrar como administradora.
- **Firestore** (base de datos): ahí viven los productos, categorías, turnos
  y horarios. Se actualiza al instante para todas las personas que estén
  viendo el sitio.
- **Storage**: para subir y borrar las fotos de la galería y de los productos
  desde el propio sitio, sin tocar código.
- **Reglas de seguridad**: le decís a Firebase "solo
  vercellifatima05@gmail.com puede escribir en la base de datos; cualquier
  otra persona solo puede leer". Esa regla la aplica el servidor de Google,
  no el navegador del visitante — por eso sí es una seguridad real.

Esto es un trabajo aparte (crear el proyecto de Firebase, conectar el sitio,
construir el panel de administración y el calendario compartido). Si querés
seguir con esta segunda etapa, decime y te voy guiando paso a paso — incluida
la creación gratuita de la cuenta de Firebase.

## Cómo agregar fotos a la Galería mientras tanto

Como todavía no hay panel de administración con login, por ahora la galería
se administra editando el código (algo que solo podés hacer vos, ya que sos
quien sube los archivos al repositorio):

1. Subí las imágenes a la carpeta `assets/gallery/`.
2. Abrí `script.js`, buscá la lista `GALLERY` (cerca de la línea 220) y
   agregá una línea por cada foto, por ejemplo:
   ```js
   { src: "assets/gallery/bano-de-gong-1.jpg", caption: "Baño de Gong grupal" },
   ```
3. Subí los cambios al repositorio y listo.

## Cómo cambiar días y horarios de atención

En `script.js`, buscá `BUSINESS_DAYS` y `BUSINESS_HOURS` (cerca de la línea 300)
y modificá los valores. `BUSINESS_DAYS` usa 0=domingo, 1=lunes … 6=sábado.
