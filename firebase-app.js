/* ===========================================================
   KHAMSA — Integración con Firebase
   - Reserva de turnos SIN duplicados (bloqueo real en Firestore)
   - Panel de administradora: login, horarios de atención,
     listado y cancelación de turnos
   =========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// -----------------------------------------------------------
// Configuración de tu proyecto Firebase (khamsa-web)
// -----------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyD78_0JyzOtEMZ3AyqWuGEc2kf3jfH-CFY",
  authDomain: "khamsa-web.firebaseapp.com",
  projectId: "khamsa-web",
  storageBucket: "khamsa-web.firebasestorage.app",
  messagingSenderId: "68550268214",
  appId: "1:68550268214:web:41b2cce4ae8c1ba911cf97",
};

// Único mail autorizado a administrar el sitio.
const ADMIN_EMAIL = "vercellifatima05@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Valores por defecto (se usan hasta que se cargue la configuración
// guardada en Firestore, y como respaldo si falla la conexión).
const DEFAULT_BUSINESS_DAYS = [1, 2, 3, 4, 5]; // lunes a viernes
const DEFAULT_BUSINESS_HOURS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const MIN_NOTICE_HOURS = 24;
const WHATSAPP_NUMBER = "542944319543";

let BUSINESS_DAYS = DEFAULT_BUSINESS_DAYS.slice();
let BUSINESS_HOURS = DEFAULT_BUSINESS_HOURS.slice();

function pad(n) { return n < 10 ? "0" + n : "" + n; }
function toISODate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function slotId(dia, horario) { return dia + "_" + horario.replace(":", ""); }

/* ===========================================================
   CONFIGURACIÓN DE HORARIOS (Firestore: config/horarios)
   Pública para leer (cualquiera puede ver qué días/horas hay
   disponibles), solo la administradora puede escribir.
   =========================================================== */
async function cargarConfiguracionHorarios() {
  try {
    const ref = doc(db, "config", "horarios");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.dias) && data.dias.length) BUSINESS_DAYS = data.dias;
      if (Array.isArray(data.horas) && data.horas.length) BUSINESS_HOURS = data.horas;
    }
  } catch (err) {
    console.warn("No se pudo cargar la configuración de horarios, uso los valores por defecto.", err);
  }
}

async function guardarConfiguracionHorarios(dias, horas) {
  const ref = doc(db, "config", "horarios");
  await setDoc(ref, { dias: dias, horas: horas, actualizado: serverTimestamp() });
  BUSINESS_DAYS = dias;
  BUSINESS_HOURS = horas;
}

/* ===========================================================
   RESERVA DE TURNOS
   - Colección "slots": UN documento por día+horario (ID fijo),
     así dos personas nunca pueden ocupar el mismo. Solo guarda
     dia/horario/estado — es pública para lectura.
   - Colección "turnos": los datos personales de cada reserva
     (nombre, teléfono, etc). Solo la administradora puede leerla.
   =========================================================== */
async function obtenerHorariosOcupados(diaISO) {
  try {
    const q = query(collection(db, "slots"), where("dia", "==", diaISO));
    const snap = await getDocs(q);
    const ocupados = new Set();
    snap.forEach((d) => ocupados.add(d.data().horario));
    return ocupados;
  } catch (err) {
    console.warn("No se pudo consultar disponibilidad, se mostrarán todos los horarios.", err);
    return new Set();
  }
}

async function reservarTurno(datos) {
  const id = slotId(datos.dia, datos.horario);
  const slotRef = doc(db, "slots", id);

  // Transacción: si el slot ya existe, la reserva se rechaza.
  // Esto es lo que garantiza que dos personas no puedan sacar
  // el mismo día y horario, incluso si aprietan "reservar" al
  // mismo tiempo.
  await runTransaction(db, async (tx) => {
    const slotSnap = await tx.get(slotRef);
    if (slotSnap.exists()) {
      throw new Error("SLOT_OCUPADO");
    }
    tx.set(slotRef, {
      dia: datos.dia,
      horario: datos.horario,
      creado: serverTimestamp(),
    });
  });

  // Si la transacción no lanzó error, el horario quedó reservado
  // para esta persona. Ahora sí guardamos sus datos de contacto.
  const turnoRef = doc(collection(db, "turnos"));
  await setDoc(turnoRef, {
    slotId: id,
    nombre: datos.nombre,
    apellido: datos.apellido,
    telefono: datos.telefono,
    edad: datos.edad,
    dia: datos.dia,
    horario: datos.horario,
    motivo: datos.motivo || "",
    creado: serverTimestamp(),
  });
}

function setupBookingForm() {
  const form = document.getElementById("bookingForm");
  if (!form) return;
  const diaInput = document.getElementById("fieldDia");
  const horarioSelect = document.getElementById("fieldHorario");
  const errorEl = document.getElementById("formError");
  const submitBtn = form.querySelector("button[type=submit]");

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  diaInput.min = toISODate(minDate);

  async function refreshHorarios() {
    horarioSelect.innerHTML = '<option value="" disabled selected>Elegí un horario</option>';
    if (!diaInput.value) return;
    const parts = diaInput.value.split("-").map(Number);
    const selected = new Date(parts[0], parts[1] - 1, parts[2]);
    if (BUSINESS_DAYS.indexOf(selected.getDay()) === -1) {
      const opt = document.createElement("option");
      opt.disabled = true;
      opt.textContent = "No hay atención ese día";
      horarioSelect.appendChild(opt);
      return;
    }

    const ocupados = await obtenerHorariosOcupados(diaInput.value);

    BUSINESS_HOURS.forEach((h) => {
      const candidate = new Date(parts[0], parts[1] - 1, parts[2], Number(h.split(":")[0]), Number(h.split(":")[1]));
      const diffHours = (candidate - new Date()) / 36e5;
      if (diffHours >= MIN_NOTICE_HOURS) {
        const opt = document.createElement("option");
        opt.value = h;
        if (ocupados.has(h)) {
          opt.disabled = true;
          opt.textContent = h + " hs — ya reservado";
        } else {
          opt.textContent = h + " hs";
        }
        horarioSelect.appendChild(opt);
      }
    });
  }

  diaInput.addEventListener("change", refreshHorarios);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorEl.hidden = true;

    const data = new FormData(form);
    const nombre = data.get("nombre").trim();
    const apellido = data.get("apellido").trim();
    const telefono = data.get("telefono").trim();
    const edad = data.get("edad");
    const dia = data.get("dia");
    const horario = data.get("horario");
    const motivo = (data.get("motivo") || "").trim();

    if (!nombre || !apellido || !telefono || !edad || !dia || !horario) {
      errorEl.textContent = "Por favor completá todos los campos obligatorios.";
      errorEl.hidden = false;
      return;
    }

    const parts = dia.split("-").map(Number);
    const chosen = new Date(parts[0], parts[1] - 1, parts[2], Number(horario.split(":")[0]), Number(horario.split(":")[1]));
    const diffHours = (chosen - new Date()) / 36e5;
    if (diffHours < MIN_NOTICE_HOURS) {
      errorEl.textContent = "Los turnos se reservan con un mínimo de 24 horas de anticipación. Elegí otro horario.";
      errorEl.hidden = false;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Reservando...";

    try {
      await reservarTurno({ nombre, apellido, telefono, edad, dia, horario, motivo });

      const diaFormateado = pad(parts[2]) + "/" + pad(parts[1]) + "/" + parts[0];
      const mensaje =
        "Nueva solicitud de turno KHAMSA\n\n" +
        "Nombre y apellido: " + nombre + " " + apellido + "\n" +
        "Teléfono: " + telefono + "\n" +
        "Edad: " + edad + "\n" +
        "Día: " + diaFormateado + "\n" +
        "Horario: " + horario + " hs" +
        (motivo ? "\nMotivo o descripción: " + motivo : "");

      window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(mensaje), "_blank");
      form.reset();
      horarioSelect.innerHTML = '<option value="" disabled selected>Elegí un horario</option>';
    } catch (err) {
      if (err && err.message === "SLOT_OCUPADO") {
        errorEl.textContent = "Uy, justo alguien reservó ese horario recién. Elegí otro, por favor.";
        await refreshHorarios();
      } else {
        console.error(err);
        errorEl.textContent = "Hubo un problema al reservar. Probá de nuevo en unos segundos.";
      }
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21l1.5-4.5A8 8 0 1 1 8 20L3 21z"/><path d="M8.5 9.5c0 3.5 2.5 6 6 6" stroke-linecap="round"/></svg> Reservar turno';
    }
  });
}

/* ===========================================================
   PANEL DE ADMINISTRADORA
   =========================================================== */
function setupAdminPanel() {
  const loginForm = document.getElementById("adminLoginForm");
  const loginError = document.getElementById("adminLoginError");
  const loginBox = document.getElementById("adminLoginBox");
  const panelBox = document.getElementById("adminPanelBox");
  const logoutBtn = document.getElementById("adminLogoutBtn");
  if (!loginForm) return; // sección de admin no está en esta página

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.hidden = true;
    const data = new FormData(loginForm);
    const email = (data.get("email") || "").trim();
    const password = data.get("password") || "";
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      loginError.textContent = "No pudimos iniciar sesión. Revisá el mail y la contraseña.";
      loginError.hidden = false;
    }
  });

  logoutBtn.addEventListener("click", () => signOut(auth));

  onAuthStateChanged(auth, async (user) => {
    const esAdmin = !!user && user.email === ADMIN_EMAIL;
    loginBox.hidden = esAdmin;
    panelBox.hidden = !esAdmin;
    if (esAdmin) {
      await cargarPanelHorarios();
      await cargarPanelTurnos();
    }
  });
}

async function cargarPanelHorarios() {
  const diasWrap = document.getElementById("adminDias");
  const horasWrap = document.getElementById("adminHoras");
  const msg = document.getElementById("adminHorariosMsg");
  if (!diasWrap || !horasWrap) return;

  const nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  diasWrap.innerHTML = nombresDias.map((nombre, i) =>
    `<label class="admin-check"><input type="checkbox" value="${i}" ${BUSINESS_DAYS.includes(i) ? "checked" : ""}> ${nombre}</label>`
  ).join("");

  horasWrap.innerHTML = BUSINESS_HOURS.map((h) =>
    `<span class="admin-hour-chip" data-hour="${h}">${h}<button type="button" aria-label="Quitar ${h}">&times;</button></span>`
  ).join("");

  horasWrap.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".admin-hour-chip").remove());
  });

  const addHourBtn = document.getElementById("adminAddHourBtn");
  addHourBtn.onclick = () => {
    const input = document.getElementById("adminNewHour");
    const val = input.value;
    if (!val) return;
    if (![...horasWrap.querySelectorAll(".admin-hour-chip")].some((c) => c.dataset.hour === val)) {
      const chip = document.createElement("span");
      chip.className = "admin-hour-chip";
      chip.dataset.hour = val;
      chip.innerHTML = `${val}<button type="button" aria-label="Quitar ${val}">&times;</button>`;
      chip.querySelector("button").addEventListener("click", () => chip.remove());
      horasWrap.appendChild(chip);
    }
    input.value = "";
  };

  const form = document.getElementById("adminHorariosForm");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const dias = [...diasWrap.querySelectorAll("input:checked")].map((i) => Number(i.value)).sort();
    const horas = [...horasWrap.querySelectorAll(".admin-hour-chip")]
      .map((c) => c.dataset.hour)
      .sort();
    msg.hidden = true;
    try {
      await guardarConfiguracionHorarios(dias, horas);
      msg.textContent = "Horarios guardados. Ya se aplican en el formulario de reservas.";
      msg.className = "form-notice";
      msg.hidden = false;
    } catch (err) {
      console.error(err);
      msg.textContent = "No se pudo guardar. Probá de nuevo.";
      msg.className = "form-error";
      msg.hidden = false;
    }
  };
}

async function cargarPanelTurnos() {
  const lista = document.getElementById("adminTurnosLista");
  if (!lista) return;
  lista.innerHTML = "<p>Cargando turnos...</p>";

  try {
    const q = query(collection(db, "turnos"), orderBy("dia"), orderBy("horario"));
    const snap = await getDocs(q);
    const hoy = toISODate(new Date());
    const proximos = [];
    snap.forEach((d) => {
      const t = d.data();
      if (t.dia >= hoy) proximos.push({ id: d.id, ...t });
    });

    if (!proximos.length) {
      lista.innerHTML = "<p>No hay turnos próximos reservados.</p>";
      return;
    }

    lista.innerHTML = proximos.map((t) => `
      <div class="admin-turno" data-id="${t.id}" data-slot="${t.slotId || ""}">
        <div>
          <strong>${t.dia} · ${t.horario} hs</strong><br>
          ${t.nombre} ${t.apellido} — ${t.telefono} (${t.edad} años)
          ${t.motivo ? `<br><em>${t.motivo}</em>` : ""}
        </div>
        <button type="button" class="btn-secondary admin-cancel-btn">Cancelar turno</button>
      </div>
    `).join("");

    lista.querySelectorAll(".admin-cancel-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const card = btn.closest(".admin-turno");
        if (!confirm("¿Cancelar este turno? Esta acción no se puede deshacer.")) return;
        btn.disabled = true;
        btn.textContent = "Cancelando...";
        try {
          await deleteDoc(doc(db, "turnos", card.dataset.id));
          if (card.dataset.slot) {
            await deleteDoc(doc(db, "slots", card.dataset.slot));
          }
          card.remove();
        } catch (err) {
          console.error(err);
          btn.disabled = false;
          btn.textContent = "Cancelar turno";
          alert("No se pudo cancelar. Probá de nuevo.");
        }
      });
    });
  } catch (err) {
    console.error(err);
    lista.innerHTML = "<p>No se pudieron cargar los turnos.</p>";
  }
}

/* ===========================================================
   INIT
   =========================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  await cargarConfiguracionHorarios();
  setupBookingForm();
  setupAdminPanel();
});
