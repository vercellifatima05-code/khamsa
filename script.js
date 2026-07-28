/* =========================================================
   KHAMSA — navegación, terapias, galería y reserva de turnos
   ========================================================= */
(function () {
  "use strict";

  var VALID_VIEWS = ["home", "sobre-mi", "terapias", "catalogo", "guia", "modo-uso", "galeria", "turno", "contacto", "admin"];

  /* ---------------------------------------------------------
     NAVEGACIÓN
     --------------------------------------------------------- */
  function showView(name) {
    if (VALID_VIEWS.indexOf(name) === -1) name = "home";

    document.querySelectorAll(".view").forEach(function (section) {
      section.classList.remove("active");
    });

    var target = document.getElementById("view-" + name);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.classList.toggle("current", link.getAttribute("data-nav") === name);
    });

    var nav = document.getElementById("mainNav");
    var toggle = document.getElementById("navToggle");
    if (nav && nav.classList.contains("open")) {
      nav.classList.remove("open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigate(name) {
    if (history.pushState) {
      history.pushState(null, "", "#" + name);
    } else {
      window.location.hash = name;
    }
    showView(name);
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-nav]");
    if (!el) return;
    e.preventDefault();
    navigate(el.getAttribute("data-nav"));
  });

  window.addEventListener("popstate", function () {
    var current = window.location.hash.replace("#", "") || "home";
    showView(current);
  });

  /* ---------------------------------------------------------
     MENÚ MÓVIL
     --------------------------------------------------------- */
  function setupMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------------------------------------------------------
     TERAPIAS — datos
     Para agregar, editar o quitar una terapia, modificá este
     arreglo. modality debe ser exactamente: "Presencial",
     "Online" o "Presencial y Online".
     --------------------------------------------------------- */
  var THERAPIES = [
    {
      id: "biomagnetismo",
      title: "Biomagnetismo Integral",
      modality: "Presencial",
      short: "Terapia que utiliza pares de imanes para favorecer el equilibrio del organismo.",
      body: [
        "El Biomagnetismo Integral es una técnica que utiliza imanes de polaridad específica, colocados en distintos puntos del cuerpo, con el propósito de favorecer el equilibrio del pH y acompañar procesos naturales de bienestar.",
        "En cada sesión se realiza una evaluación personalizada para identificar los pares a trabajar, respetando el momento y las necesidades particulares de cada persona.",
        "Es una terapia complementaria, no invasiva, pensada para acompañar procesos de salud integral junto a otros tratamientos."
      ]
    },
    {
      id: "auriculoterapia",
      title: "Auriculoterapia con imanes",
      modality: "Presencial",
      short: "Estimulación de puntos reflejos de la oreja mediante pequeños imanes.",
      body: [
        "La auriculoterapia parte de la idea de que en el pabellón auricular se reflejan distintas zonas y funciones del organismo.",
        "En lugar de agujas, en esta modalidad se utilizan pequeños imanes que se colocan sobre puntos específicos, generando una estimulación suave y sostenida en el tiempo.",
        "Puede ser un buen complemento dentro de un proceso de acompañamiento integral."
      ]
    },
    {
      id: "cuencos",
      title: "Masaje sonoro con cuencos tibetanos",
      modality: "Presencial",
      short: "El sonido y la vibración de los cuencos como experiencia corporal de relajación profunda.",
      body: [
        "El agua es uno de los elementos que mejor transmite las vibraciones sonoras. Nuestro cuerpo está compuesto en gran parte por agua, por eso el sonido puede sentirse no solo a través del oído, sino también como una experiencia vibracional en todo el cuerpo.",
        "Los cuencos tibetanos generan sonidos y armónicos que invitan a entrar en un estado profundo de relajación, presencia y escucha interior.",
        "En mis sesiones combino el masaje sonoro con protocolos de Biomagnetismo Integral, creando una experiencia personalizada que acompaña cada proceso de manera individual.",
        "Modalidad: sesiones individuales. Lugar: Pinamar, Buenos Aires."
      ]
    },
    {
      id: "ventosas",
      title: "Masaje con ventosas",
      modality: "Presencial",
      short: "Cupping: succión terapéutica para liberar tensión muscular y mejorar la circulación.",
      body: [
        "El masaje con ventosas, también conocido como Cupping, es una técnica que utiliza ventosas aplicadas sobre diferentes zonas del cuerpo, generando un efecto de succión que favorece la circulación y ayuda a liberar tensiones musculares.",
        "Es una terapia ideal para acompañar dolores musculares, contracturas y tensiones localizadas, especialmente en cuello, espalda y zona lumbar.",
        "Se combina una presión de intensidad media y profunda para trabajar las zonas de mayor tensión, ayudando a liberar contracturas y aliviar la sensación de rigidez y sobrecarga muscular.",
        "El tratamiento puede complementarse con manipulaciones relajantes en el resto del cuerpo, brindando una experiencia integral de bienestar y relajación.",
        "Duración aproximada: 60 minutos. Modalidad: individual. Atención: presencial."
      ]
    },
    {
      id: "gong",
      title: "Baño de Gong · Inversión sonora grupal",
      modality: "Presencial",
      short: "Gong, cuencos y voz entrelazados en una experiencia inmersiva de relajación grupal.",
      body: [
        "El GONG es un instrumento ancestral y poderoso. Su sonido no solo se escucha a través del oído: sus vibraciones pueden sentirse en todo el cuerpo y generar una profunda experiencia de conexión.",
        "Su sonido recorre un amplio espectro de tonos y vibraciones. A veces puede ser suave y sutil, casi imperceptible; otras, intenso y envolvente, creando un espacio donde es posible soltar, relajarse y simplemente dejarse llevar por la experiencia.",
        "Durante un Baño de Gong, la escucha profunda puede favorecer un estado de relajación y bienestar, ayudando a liberar tensiones y aquietar la mente. La respiración puede volverse más profunda y consciente, permitiendo conectar con el momento presente.",
        "El sonido, los cuencos y la voz se entrelazan para crear una experiencia inmersiva que invita a descansar, conectar con el cuerpo y abrir un espacio interior de calma.",
        "Puede ser una práctica complementaria para acompañar momentos de estrés, cansancio mental, dificultad para relajarse o simplemente para regalarse un momento de pausa y reconexión."
      ]
    },
    {
      id: "fito-esencias",
      title: "Fitoterapia + Esencias Florales",
      modality: "Presencial y Online",
      short: "Plantas medicinales, tinturas madre y esencias florales integradas en un acompañamiento personalizado.",
      featured: true,
      body: [
        "Un acompañamiento personalizado en el que se pueden integrar distintas herramientas según cada necesidad:",
        "• Plantas medicinales.\n• Fitoterapia.\n• Tinturas madre.\n• Esencias florales.\n• Flores de Bach.\n• Flores de El Bolsón.\n• Otras esencias florales.",
        "Esta atención puede realizarse tanto de manera presencial como online, adaptándose a tus tiempos y a la modalidad que te resulte más cómoda."
      ]
    },
    {
      id: "escucha",
      title: "Escucha atenta y acompañamiento personalizado",
      modality: "Online",
      short: "Un espacio de escucha para orientarte en tu proceso de bienestar.",
      body: [
        "Un espacio de conversación y escucha atenta, pensado para acompañarte a poner en palabras lo que te sucede y orientarte sobre qué herramientas pueden ayudarte en tu proceso.",
        "Se realiza por videollamada o llamada, según tu preferencia."
      ]
    },
    {
      id: "meditacion",
      title: "Meditación guiada",
      modality: "Online",
      short: "Sesiones guiadas para favorecer la calma, la presencia y la conexión interior.",
      body: [
        "Sesiones de meditación guiada, pensadas para favorecer estados de calma, presencia y conexión con el momento actual.",
        "Pueden realizarse de manera individual, según tus necesidades y tu disponibilidad de tiempo."
      ]
    },
    {
      id: "acompanamiento",
      title: "Acompañamiento en procesos de bienestar y sanación",
      modality: "Online",
      short: "Seguimiento sostenido en el tiempo para acompañar tu proceso integral.",
      body: [
        "Un espacio de seguimiento sostenido en el tiempo, pensado para acompañarte en procesos de bienestar y sanación desde una mirada integral.",
        "Se combinan distintas herramientas según el momento que estés atravesando, respetando siempre tus tiempos."
      ]
    },
    {
      id: "biomagnetismo-online",
      title: "Aplicación y enseñanza del uso del biomagnetismo",
      modality: "Online",
      short: "Para quienes ya cuentan con su botiquín de imanes y desean aprender a usarlo.",
      body: [
        "Pensado para quienes cuentan previamente con su botiquín de imanes y desean aprender a utilizar esta herramienta en su propio proceso.",
        "En estas sesiones te acompaño a comprender el uso del biomagnetismo, para que puedas aplicarlo con mayor autonomía en tu día a día."
      ]
    }
  ];

  function therapyCardHTML(t) {
    return (
      '<button class="therapy-card' + (t.featured ? " featured" : "") + '" data-id="' + t.id + '" data-modality="' + t.modality + '">' +
        '<span class="modality-tag">' + t.modality + '</span>' +
        '<h3>' + t.title + '</h3>' +
        '<p>' + t.short + '</p>' +
        '<span class="choice-cta">Ver más' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</span>' +
      '</button>'
    );
  }

  function renderTherapies(filter) {
    var grid = document.getElementById("therapyGrid");
    if (!grid) return;
    var list = filter && filter !== "todas" ? THERAPIES.filter(function (t) { return t.modality === filter; }) : THERAPIES;
    grid.innerHTML = list.map(therapyCardHTML).join("");
  }

  function setupTherapyFilters() {
    var pills = document.querySelectorAll(".filter-pills .pill");
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) { p.classList.remove("active"); });
        pill.classList.add("active");
        renderTherapies(pill.getAttribute("data-filter"));
      });
    });
  }

  function openTherapyModal(id) {
    var t = THERAPIES.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    document.getElementById("modalTag").textContent = t.modality;
    document.getElementById("modalTitle").textContent = t.title;
    document.getElementById("modalBody").innerHTML = t.body.map(function (p) {
      return "<p>" + p.replace(/\n/g, "<br>") + "</p>";
    }).join("");
    var modal = document.getElementById("therapyModal");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function setupTherapyModal() {
    document.addEventListener("click", function (e) {
      var card = e.target.closest(".therapy-card");
      if (card) openTherapyModal(card.getAttribute("data-id"));

      if (e.target.closest("#modalClose") || e.target === document.getElementById("therapyModal")) {
        closeModal(document.getElementById("therapyModal"));
      }
      if (e.target.closest("#lightboxClose") || e.target === document.getElementById("galleryLightbox")) {
        closeModal(document.getElementById("galleryLightbox"));
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeModal(document.getElementById("therapyModal"));
        closeModal(document.getElementById("galleryLightbox"));
      }
    });
  }

  /* ---------------------------------------------------------
     GALERÍA
     Para agregar fotos: subí el archivo a assets/gallery/ y
     agregá una línea acá abajo con su nombre y una leyenda.
     Mientras no exista un panel de administración con inicio
     de sesión, esta es la única forma de actualizar la
     galería (editando este archivo).
     --------------------------------------------------------- */
  var GALLERY = [ { src: "activos/gallery/bano-de-gong-1.png", caption: "Baño de Gong en la playa" },
    // { src: "assets/gallery/baño-de-gong-1.jpg", caption: "Baño de Gong grupal" },
    // { src: "assets/gallery/espacio-de-atencion.jpg", caption: "Espacio de atención — Pinamar" },
  ];

  function galleryCardHTML(item, i) {
    return (
      '<button class="gallery-item" data-i="' + i + '">' +
        '<img src="' + item.src + '" alt="' + item.caption + '" loading="lazy">' +
        '<span class="gallery-caption">' + item.caption + '</span>' +
      '</button>'
    );
  }

  function renderGallery() {
    var grid = document.getElementById("galleryGrid");
    if (!grid) return;
    if (!GALLERY.length) {
      grid.innerHTML =
        '<div class="gallery-empty">' +
          '<img src="assets/khamsa-logo.png" alt="">' +
          '<p><strong>Muy pronto vas a encontrar acá fotos de los espacios, talleres y encuentros de Khamsa.</strong></p>' +
          '<p>Para sumar imágenes, escribime y las incorporamos a la galería.</p>' +
        '</div>';
      return;
    }
    grid.innerHTML = GALLERY.map(galleryCardHTML).join("");
    grid.querySelectorAll(".gallery-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = GALLERY[Number(btn.getAttribute("data-i"))];
        document.getElementById("lightboxImg").src = item.src;
        document.getElementById("lightboxImg").alt = item.caption;
        document.getElementById("lightboxCaption").textContent = item.caption;
        var modal = document.getElementById("galleryLightbox");
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     RESERVA DE TURNOS
     Ahora la maneja por completo firebase-app.js (bloqueo real
     de horarios contra Firestore, para que dos personas nunca
     puedan reservar el mismo día y hora).
     --------------------------------------------------------- */

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var initial = window.location.hash.replace("#", "") || "home";
    showView(initial);

    setupMobileNav();
    renderTherapies("todas");
    setupTherapyFilters();
    setupTherapyModal();
    renderGallery();

    // Only one accordion item open at a time, for a calmer reading experience
    var plants = document.querySelectorAll(".plant");
    plants.forEach(function (plant) {
      plant.addEventListener("toggle", function () {
        if (plant.open) {
          plants.forEach(function (other) {
            if (other !== plant) other.removeAttribute("open");
          });
        }
      });
    });
  });
})();
