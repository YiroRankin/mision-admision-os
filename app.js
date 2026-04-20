const ACCESS_KEY = "maos-access";

const accessGate = document.getElementById("accessGate");
const pageShell = document.getElementById("pageShell");
const enterButton = document.getElementById("enterButton");

const areasGrid = document.getElementById("areasGrid");
const resourceGrid = document.getElementById("resourceGrid");
const areaDetailTitle = document.getElementById("areaDetailTitle");
const areaDetailDescription = document.getElementById("areaDetailDescription");

const areaCardTemplate = document.getElementById("areaCardTemplate");
const resourceCardTemplate = document.getElementById("resourceCardTemplate");

let currentAreas = [];
let selectedAreaId = null;

function setAccessGranted() {
  localStorage.setItem(ACCESS_KEY, "true");
  accessGate.classList.add("is-hidden");
  pageShell.classList.remove("is-hidden");
}

function bootstrapAccess() {
  const hasAccess = localStorage.getItem(ACCESS_KEY) === "true";

  if (hasAccess) {
    accessGate.classList.add("is-hidden");
    pageShell.classList.remove("is-hidden");
  }

  enterButton.addEventListener("click", setAccessGranted);
}

function renderAreas() {
  areasGrid.innerHTML = "";

  currentAreas.forEach((area) => {
    const fragment = areaCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".area-card");
    const button = fragment.querySelector(".area-card__button");

    if (area.id === selectedAreaId) {
      card.classList.add("is-active");
    }

    fragment.querySelector("h3").textContent = area.nombre;
    fragment.querySelector(".area-card__count").textContent = `${area.recursos.length} recurso${area.recursos.length === 1 ? "" : "s"}`;
    fragment.querySelector(".area-card__description").textContent = area.descripcion;

    button.addEventListener("click", () => {
      selectedAreaId = area.id;
      renderAreas();
      renderSelectedArea();
      document.getElementById("areaDetail")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    areasGrid.appendChild(fragment);
  });
}

function buildResourceCard(resource, areaNombre) {
  const fragment = resourceCardTemplate.content.cloneNode(true);

  fragment.querySelector(".pill").textContent = areaNombre;
  fragment.querySelector(".status").textContent = (resource.estatus || "activo").toLowerCase();
  fragment.querySelector("h4").textContent = resource.nombre;
  fragment.querySelector(".resource-card__description").textContent = resource.descripcion || "Sin descripción disponible.";
  fragment.querySelector(".resource-type").textContent = resource.tipo || "Recurso";
  fragment.querySelector(".resource-owner").textContent = resource.responsable || "Por definir";

  const link = fragment.querySelector(".resource-link");
  link.textContent = resource.botonTexto || "Abrir recurso";

  if (resource.link) {
    link.classList.remove("is-disabled");
    link.removeAttribute("aria-disabled");
    link.href = resource.link;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
  }

  return fragment;
}

function renderSelectedArea() {
  const area = currentAreas.find((item) => item.id === selectedAreaId) || currentAreas[0];
  if (!area) return;

  selectedAreaId = area.id;
  areaDetailTitle.textContent = area.nombre;
  areaDetailDescription.textContent = area.descripcion;
  resourceGrid.innerHTML = "";

  if (!area.recursos.length) {
    const emptyCard = document.createElement("article");
    emptyCard.className = "resource-card";
    emptyCard.innerHTML = `
      <div class="resource-card__top">
        <span class="pill">${area.nombre}</span>
        <span class="status">próximamente</span>
      </div>
      <h4>Espacio listo para crecer</h4>
      <p class="resource-card__description">Esta área ya está contemplada y podrá llenarse conforme integremos nuevos recursos.</p>
    `;
    resourceGrid.appendChild(emptyCard);
    return;
  }

  area.recursos.forEach((resource) => {
    resourceGrid.appendChild(buildResourceCard(resource, area.nombre));
  });
}

async function loadCatalog() {
  try {
    const response = await fetch("data/catalogo.json");
    if (!response.ok) {
      throw new Error(`No se pudo cargar el catálogo: ${response.status}`);
    }

    const catalog = await response.json();
    currentAreas = catalog.areas || [];
    selectedAreaId = currentAreas[0]?.id || null;

    renderAreas();
    renderSelectedArea();
  } catch (error) {
    console.error(error);
    areasGrid.innerHTML = '<p class="section-heading__text">No fue posible cargar las áreas.</p>';
    resourceGrid.innerHTML = '<p class="section-heading__text">No fue posible cargar el detalle del área.</p>';
  }
}

bootstrapAccess();
loadCatalog();
