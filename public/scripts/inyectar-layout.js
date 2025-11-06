// scripts/inyectar-layout.js
// ========================================
// Inyectar Layout Global (Header, Banner, Footer)
// Funciona tanto en local (con /public/) como en Netlify (sin /public/)
// ========================================
(async function inyectarLayout() {
  try {
    const pathname = window.location.pathname;
    let basePath = "";

    if (pathname.includes("/public/")) {
      // ----- MODO LOCAL (sirves /public en la URL) -----
      // ej. /public/pages/global/encuesta.html
      const afterPublic = pathname.split("/public/")[1]; // "pages/global/encuesta.html"
      const parts = afterPublic.split("/").filter(Boolean); // ["pages","global","encuesta.html"]
      // cuántos niveles abajo de /public estoy
      const levels = parts.length - 1; // restamos el archivo
      basePath = levels > 0 ? "../".repeat(levels) : "";
    } else {
      // ----- MODO PRODUCCIÓN (Netlify publica el contenido de /public) -----
      // ahí los componentes quedan en la raíz del sitio: /componentes/header.html
      basePath = "/"; // importante: empezamos desde la raíz
    }

    // Inyectar Header
    const headerRes = await fetch(`${basePath}componentes/header.html`);
    if (headerRes.ok) {
      const headerHtml = await headerRes.text();
      document.body.insertAdjacentHTML("afterbegin", headerHtml);
    } else {
      console.warn("No se pudo cargar header.html", headerRes.status);
    }

    // Ajustar rutas relativas en <a data-rel="...">
    ajustarRutasRelativas(basePath);

    // Inyectar Banner (si existe)
    const bannerRes = await fetch(`${basePath}componentes/banner.html`);
    if (bannerRes.ok) {
      const bannerHtml = await bannerRes.text();
      const main = document.querySelector("main");
      if (main) main.insertAdjacentHTML("beforebegin", bannerHtml);
    }

    // Inyectar Footer
    const footerRes = await fetch(`${basePath}componentes/footer.html`);
    if (footerRes.ok) {
      const footerHtml = await footerRes.text();
      document.body.insertAdjacentHTML("beforeend", footerHtml);
    }

  } catch (error) {
    console.error("❌ Error al inyectar layout:", error);
  }
})();

// ========================================
// Insertar favicon institucional
// ========================================
(function insertarFavicon() {
  const faviconUrl = "https://framework-gb.cdn.gob.mx/applications/cms/favicon.png";

  const link1 = document.createElement("link");
  link1.rel = "shortcut icon";
  link1.href = faviconUrl;

  const link2 = document.createElement("link");
  link2.rel = "icon";
  link2.href = faviconUrl;
  link2.type = "image/png";

  document.head.appendChild(link1);
  document.head.appendChild(link2);
})();

// ========================================
// Función para ajustar <a data-rel="...">
// ========================================
function ajustarRutasRelativas(basePath) {
  document.querySelectorAll("a[data-rel]").forEach(link => {
    const relPath = link.getAttribute("data-rel") || "";
    // en producción basePath = "/" → queda "/pages/..."
    // en local basePath = "../../" → queda "../../pages/..."
    link.setAttribute("href", `${basePath}${relPath}`);
  });
}
