const estados = ["pendiente", "curso", "cursar", "acreditada"];

/* =========================
   CAMBIO DE ESTADO
========================= */
document.querySelectorAll(".materia").forEach(materia => {
  materia.addEventListener("click", () => {
    const actual = estados.find(e => materia.classList.contains(e));

    if (actual === "acreditada") {
      const seguro = confirm(
        "⚠️ Esta materia está ACREDITADA.\n¿Seguro que deseas cambiar su estado?"
      );
      if (!seguro) return;
    }

    materia.classList.remove(actual);
    const siguiente = estados[(estados.indexOf(actual) + 1) % estados.length];
    materia.classList.add(siguiente);

    localStorage.setItem(
      materia.querySelector("h4").innerText.trim(),
      siguiente
    );

    const badge = materia.querySelector(".badge");
    badge.className = "badge " + siguiente;
    badge.textContent =
      siguiente === "acreditada" ? "Acreditada" :
      siguiente === "curso" ? "En curso" :
      siguiente === "cursar" ? "Por cursar" :
      "Pendiente";

    actualizarProgreso();
    calcularProgreso();

    if (document.getElementById("modal-estadisticas").style.display === "flex") {
      abrirEstadisticas();
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CARGAR ESTADOS GUARDADOS
  ========================= */
  document.querySelectorAll(".materia").forEach(materia => {
    const nombre = materia.querySelector("h4").innerText.trim();
    const estado = localStorage.getItem(nombre);

    if (estado) {
      materia.classList.remove(...estados);
      materia.classList.add(estado);

      const badge = materia.querySelector(".badge");
      badge.className = "badge " + estado;
      badge.textContent =
        estado === "acreditada" ? "Acreditada" :
        estado === "curso" ? "En curso" :
        estado === "cursar" ? "Por cursar" :
        "Pendiente";
    }
  });

  /* =========================
     CALCULAR TODO DESPUÉS
  ========================= */
  actualizarProgreso();
  calcularProgreso();
  actualizarGraficoGlobal();

});

/* =========================
   PROGRESO POR SEMESTRE
========================= */
function actualizarProgreso() {
  document.querySelectorAll(".semestre").forEach(semestre => {
    const materias = semestre.querySelectorAll(".materia");
    const acreditadas = semestre.querySelectorAll(".materia.acreditada");

    const total = materias.length;
    const porcentaje = total
      ? Math.round((acreditadas.length / total) * 100)
      : 0;

    let progreso = semestre.querySelector(".progreso");

    if (!progreso) {
      progreso = document.createElement("div");
      progreso.className = "progreso";
      progreso.innerHTML = `
        <div class="barra">
          <div class="relleno"></div>
        </div>
        <small>0% acreditado</small>
      `;
      semestre.insertBefore(progreso, semestre.querySelector(".materia"));
    }

    const relleno = progreso.querySelector(".relleno");
    const texto = progreso.querySelector("small");
    const actual = parseInt(texto.textContent) || 0;

    relleno.style.width = porcentaje + "%";
    animarNumero(texto, actual, porcentaje, 500);
  });
}

function animarNumero(el, desde, hasta, duracion = 500) {
  const inicio = performance.now();

  function animar(t) {
    const p = Math.min((t - inicio) / duracion, 1);
    const valor = Math.round(desde + (hasta - desde) * p);
    el.textContent = `${valor}% acreditado`;
    if (p < 1) requestAnimationFrame(animar);
  }

  requestAnimationFrame(animar);
}

/* =========================
   PROGRESO GLOBAL (CÍRCULO)
========================= */
function calcularProgreso() {
  const materias = document.querySelectorAll(".materia");
  const acreditadas = document.querySelectorAll(".materia.acreditada");

  const total = materias.length;
  const hechas = acreditadas.length;
  const porcentaje = total ? Math.round((hechas / total) * 100) : 0;

  document.getElementById("creditos").innerHTML = `
    <strong>Progreso general:</strong> ${hechas} / ${total} materias
    <small>(${porcentaje}%)</small>
  `;

  const circulo = document.getElementById("avance-circular-barra");

  // 🔥 CIRCUNFERENCIA REAL (r = 28)
  const radio = 28;
  const circunferencia = 2 * Math.PI * radio;

  circulo.style.strokeDasharray = circunferencia;
  circulo.style.strokeDashoffset =
    circunferencia - (porcentaje / 100) * circunferencia;

  // ✅ Cierra visualmente al 100%
  circulo.style.strokeLinecap = porcentaje === 100 ? "butt" : "round";

  document.getElementById("avance-texto").textContent = porcentaje + "%";
}

/* =========================
   ESTADÍSTICAS POR SEMESTRE
========================= */
function abrirEstadisticas() {
  const cont = document.getElementById("estadisticasSemestres");
  cont.innerHTML = "";

  document.querySelectorAll(".semestre").forEach((sem, i) => {
    const mats = sem.querySelectorAll(".materia");
    const acc = sem.querySelectorAll(".materia.acreditada");
    if (!mats.length) return;

    const p = Math.round((acc.length / mats.length) * 100);

    const bloque = document.createElement("div");
    bloque.className = "semestre-stat";
    bloque.innerHTML = `
      <h4>Semestre ${i + 1}</h4>
      <div class="barra-semestre"><div></div></div>
      <div class="porcentaje">
        ${acc.length} / ${mats.length} acreditadas (${p}%)
      </div>
    `;

    cont.appendChild(bloque);

    requestAnimationFrame(() => {
      bloque.querySelector(".barra-semestre div").style.width = p + "%";
    });
  });

  document.getElementById("modal-estadisticas").style.display = "flex";
}

function cerrarEstadisticas() {
  document.getElementById("modal-estadisticas").style.display = "none";
}

/* =========================
   BUSCADOR
========================= */
function buscarMateria(texto) {
  const f = texto.toLowerCase();
  document.querySelectorAll(".materia").forEach(m => {
    m.style.display =
      m.querySelector("h4").textContent.toLowerCase().includes(f)
        ? "flex"
        : "none";
  });
}
function cargarEstadosGuardados() {
  document.querySelectorAll(".materia").forEach(materia => {
    const nombre = materia.querySelector("h4").innerText.trim();
    const estadoGuardado = localStorage.getItem(nombre);

    if (estadoGuardado) {
      materia.classList.remove("pendiente", "curso", "cursar", "acreditada");
      materia.classList.add(estadoGuardado);

      const badge = materia.querySelector(".badge");
      badge.className = "badge " + estadoGuardado;
      badge.textContent =
        estadoGuardado === "acreditada" ? "Acreditada" :
        estadoGuardado === "curso" ? "En curso" :
        estadoGuardado === "cursar" ? "Por cursar" :
        "Pendiente";
    }
  });
}
/* =========================
   EXPORTAR PROGRESO
========================= */
function exportarProgreso() {
  const datos = {};

  document.querySelectorAll(".materia").forEach(materia => {
    const nombre = materia.querySelector("h4").innerText.trim();
    const estado = estados.find(e => materia.classList.contains(e));
    datos[nombre] = estado;
  });

  const blob = new Blob(
    [JSON.stringify(datos, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "reticula_progreso.json";
  a.click();

  URL.revokeObjectURL(url);
}
/* =========================
   IMPORTAR PROGRESO
========================= */
document.getElementById("importarArchivo").addEventListener("change", e => {
  const archivo = e.target.files[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = () => {
    const datos = JSON.parse(lector.result);

    document.querySelectorAll(".materia").forEach(materia => {
      const nombre = materia.querySelector("h4").innerText.trim();
      const estado = datos[nombre];

      if (estado) {
        materia.classList.remove(...estados);
        materia.classList.add(estado);

        localStorage.setItem(nombre, estado);

        const badge = materia.querySelector(".badge");
        badge.className = "badge " + estado;
        badge.textContent =
          estado === "acreditada" ? "Acreditada" :
          estado === "curso" ? "En curso" :
          estado === "cursar" ? "Por cursar" :
          "Pendiente";
      }
    });

    actualizarProgreso();
    calcularProgreso();
  };

  lector.readAsText(archivo);
});

/* =========================
   INICIALIZAR
========================= */
actualizarProgreso();
calcularProgreso();
cargarEstadosGuardados();