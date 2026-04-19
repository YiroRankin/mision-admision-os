const ACCESS_KEY = "maos-access";
const QUICK_ACCESS_IDS = ["contratos", "cotizador", "folios", "documentos"];

const accessGate = document.getElementById("accessGate");
const pageShell = document.getElementById("pageShell");
const enterButton = document.getElementById("enterButton");

const quickAccessGrid = document.getElementById("quickAccessGrid");
const areasGrid = document.getElementById("areasGrid");
const resourceGroups = document.getElementById("resourceGroups");

const quickAccessCardTemplate = document.getElementById("quickAccessCardTemplate");
const areaCardTemplate = document.getElementById("areaCardTemplate");
const resourceGroupTemplate = document.getElementById("resourceGroupTemplate");
const resourceCardTemplate = document.getElementById("resourceCardTemplate");

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

function createQuickAccessMap(areas) {
  const allResources = areas.flatMap((area) =>
    area.recursos.map((resource) => ({ ...resource, areaNombre: area.nombre }))
  );

  return QUICK_ACCESS_IDS.map((resourceId) =>
    allResources.find((resource) => resource.id === resourceId)
  ).filter(Boolean);
}

function renderQuickAccess(resources) {
  quickAccessGrid.innerHTML = "";

  resources.forEach((resource) => {
    const fragment = quickAccessCardTemplate.content.cloneNode(true);
    fragment.querySelector(".pill").textContent = resource.areaNombre;
    fragment.querySelector(".quick-card__type").textContent = resource.tipo;
    fragment.querySelector("h3").textContent = resource.nombre;
    fragment.querySelector("p").textContent = resource.descripcion;
    quickAccessGrid.appendChild(fragment);
  });
}

function renderAreas(areas) {
  areasGrid.innerHTML = "";

  areas.forEach((area) => {
    const fragment = areaCardTemplate.content.cloneNode(true);
    fragment.querySelector("h3").textContent = area.nombre;
    fragment.querySelector(".area-card__count").textContent = `${area.recursos.length} recurso${area.recursos.length === 1 ? "" : "s"}`;
    fragment.querySelector(".area-card__description").textContent = area.descripcion;
    fragment.querySelector(".area-card__link").setAttribute("href", `#area-${area.id}`);
    areasGrid.appendChild(fragment);
  });
}

function buildResourceCard(resource, areaNombre) {
  const fragment = resourceCardTemplate.content.cloneNode(true);

  fragment.querySelector(".pill").textContent = areaNombre;
  fragment.querySelector(".status").textContent = resource.estatus || "activo";
  fragment.querySelector("h4").textContent = resource.nombre;
  fragment.querySelector(".resource-card__description").textContent = resource.descripcion || "Sin descripción disponible.";
  fragment.querySelector(".resource-type").textContent = resource.tipo || "Recurso";
  fragment.querySelector(".resource-owner").textContent = resource.responsable || "Por definir";

  const link = fragment.querySelector(".resource-link");
  if (resource.link) {
    link.classList.remove("is-disabled");
    link.removeAttribute("aria-disabled");
    link.href = resource.link;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
  }

  return fragment;
}

function renderResourceGroups(areas) {
  resourceGroups.innerHTML = "";

  areas.forEach((area) => {
    const fragment = resourceGroupTemplate.content.cloneNode(true);
    const section = fragment.querySelector(".resource-group");
    const grid = fragment.querySelector(".resource-group__grid");

    section.id = `area-${area.id}`;
    fragment.querySelector(".resource-group__label").textContent = "Área";
    fragment.querySelector("h3").textContent = area.nombre;
    fragment.querySelector(".resource-group__count").textContent = `${area.recursos.length} recurso${area.recursos.length === 1 ? "" : "s"}`;
    fragment.querySelector(".resource-group__description").textContent = area.descripcion;

    if (area.recursos.length === 0) {
      const emptyCard = document.createElement("article");
      emptyCard.className = "resource-card";
      emptyCard.innerHTML = `
        <div class="resource-card__top">
          <span class="pill pill--soft">${area.nombre}</span>
          <span class="status">próximamente</span>
        </div>
        <h4>Espacio listo para crecer</h4>
        <p class="resource-card__description">Esta área ya está contemplada en la arquitectura del sistema y podrá llenarse conforme se integren nuevos recursos.</p>
      `;
      grid.appendChild(emptyCard);
    } else {
      area.recursos.forEach((resource) => {
        grid.appendChild(buildResourceCard(resource, area.nombre));
      });
    }

    resourceGroups.appendChild(fragment);
  });
}

async function loadCatalog() {
  try {
    const response = await fetch("data/catalogo.json");
    if (!response.ok) {
      throw new Error(`No se pudo cargar el catálogo: ${response.status}`);
    }

    const catalog = await response.json();
    const areas = catalog.areas || [];

    renderQuickAccess(createQuickAccessMap(areas));
    renderAreas(areas);
    renderResourceGroups(areas);
  } catch (error) {
    console.error(error);

    quickAccessGrid.innerHTML = '<p class="section-heading__text">No fue posible cargar los accesos rápidos.</p>';
    areasGrid.innerHTML = '<p class="section-heading__text">No fue posible cargar las áreas.</p>';
    resourceGroups.innerHTML = '<p class="section-heading__text">No fue posible cargar el catálogo inicial.</p>';
  }
}

bootstrapAccess();
loadCatalog();
