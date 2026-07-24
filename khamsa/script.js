/* =========================================================
   KHAMSA — navegación entre vistas (sin recarga de página)
   Rutas: #home · #catalogo · #guia · #modo-uso
   ========================================================= */
(function () {
  "use strict";

  var VALID_VIEWS = ["home", "catalogo", "guia", "modo-uso"];

  function showView(name) {
    if (VALID_VIEWS.indexOf(name) === -1) name = "home";

    document.querySelectorAll(".view").forEach(function (section) {
      section.classList.remove("active");
    });

    var target = document.getElementById("view-" + name);
    if (target) target.classList.add("active");

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

  // clicks on any element with data-nav="..."
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-nav]");
    if (!el) return;
    e.preventDefault();
    navigate(el.getAttribute("data-nav"));
  });

  // back/forward browser buttons
  window.addEventListener("popstate", function () {
    var current = window.location.hash.replace("#", "") || "home";
    showView(current);
  });

  // deep-link on load, e.g. mipagina.com/#guia
  document.addEventListener("DOMContentLoaded", function () {
    var initial = window.location.hash.replace("#", "") || "home";
    showView(initial);

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
