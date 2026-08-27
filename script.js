/* Manuel Vial — Portafolio
   Lee content/settings.json y content/portfolio.json (editados desde /admin)
   y arma la página. No requiere build ni frameworks. */

(function () {
  "use strict";

  const CATEGORIES = [
    { key: "marca-colina", label: "Creación de marca Atlético Colina" },
    { key: "grafica-colina", label: "Trabajo Gráfico Atlético Colina" },
    { key: "ia", label: "Creación de videos con IA" },
    { key: "cambiemos", label: "Videos Cambiemos Chile" },
    { key: "otro", label: "Otros" },
  ];

  const state = { items: [], filter: "all" };

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "html") node.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else if (v !== null && v !== undefined && v !== false) node.setAttribute(k, v === true ? "" : v);
      }
    }
    for (const child of children.flat()) {
      if (child === null || child === undefined || child === false) continue;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    }
    return node;
  }

  function parseVideo(url) {
    if (!url) return null;
    try {
      const u = new URL(url.trim());
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") {
        return { provider: "youtube", id: u.pathname.slice(1) };
      }
      if (host.endsWith("youtube.com")) {
        if (u.pathname === "/watch") return { provider: "youtube", id: u.searchParams.get("v") };
        if (u.pathname.startsWith("/embed/")) return { provider: "youtube", id: u.pathname.split("/")[2] };
        if (u.pathname.startsWith("/shorts/")) return { provider: "youtube", id: u.pathname.split("/")[2] };
      }
      if (host === "vimeo.com") {
        const parts = u.pathname.split("/").filter(Boolean);
        const id = parts.find((p) => /^\d+$/.test(p));
        if (id) return { provider: "vimeo", id };
      }
      if (host === "player.vimeo.com") {
        const parts = u.pathname.split("/").filter(Boolean);
        return { provider: "vimeo", id: parts[parts.length - 1] };
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function embedSrc(video) {
    if (!video) return "";
    if (video.provider === "youtube") return `https://www.youtube-nocookie.com/embed/${video.id}?rel=0`;
    if (video.provider === "vimeo") return `https://player.vimeo.com/video/${video.id}`;
    return "";
  }

  function youtubeThumb(video) {
    if (video && video.provider === "youtube") return `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
    return null;
  }

  function playIcon() {
    return el("span", { class: "play-badge", html:
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.92)"/>' +
      '<path d="M10 8.2v7.6l6-3.8-6-3.8z" fill="#17181a"/></svg>' });
  }

  function typeLabel(type) {
    return type === "video" ? "Video" : "Gráfica";
  }

  /* ---------- hero ---------- */

  function renderHero(settings) {
    document.title = (settings.siteTitle || "Portafolio") + (settings.role ? " — " + settings.role : "");
    document.getElementById("wordmark").textContent = settings.siteTitle || "Portafolio";
    document.getElementById("role").textContent = settings.role || "";
    document.getElementById("about").textContent = settings.about || settings.tagline || "";

    const socials = document.getElementById("socials");
    socials.innerHTML = "";
    const links = [];
    if (settings.email) links.push({ label: settings.email, url: "mailto:" + settings.email });
    (settings.socialLinks || []).forEach((s) => { if (s && s.url) links.push(s); });
    links.forEach((s) => {
      socials.appendChild(el("a", { href: s.url, target: "_blank", rel: "noopener" }, s.label || s.url));
    });

    const video = document.getElementById("hero-video");
    if (settings.heroVideo) {
      video.src = settings.heroVideo;
      video.addEventListener("canplay", () => video.classList.add("is-ready"), { once: true });
      video.load();
    }
  }

  /* ---------- trayectoria ---------- */

  function renderTimeline(settings) {
    const list = document.getElementById("timeline");
    const section = document.getElementById("trayectoria");
    list.innerHTML = "";
    const items = settings.trayectoria || [];
    if (!items.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    items.forEach((step) => {
      const logos = [step.logo, step.logo2].filter(Boolean);
      const logoNode = logos.length > 1
        ? el(
            "span",
            { class: "timeline-logo-cluster" },
            logos.map((src) => el(
              "span",
              { class: "timeline-logo-wrap dark-badge" },
              el("img", { class: "timeline-logo", src, alt: step.organizacion || "" })
            ))
          )
        : el(
            "span",
            { class: "timeline-logo-wrap" + (logos[0] ? " dark-badge" : "") },
            logos[0] ? el("img", { class: "timeline-logo", src: logos[0], alt: step.organizacion || "" }) : null
          );

      list.appendChild(
        el(
          "li",
          { class: "timeline-item" },
          logoNode,
          el(
            "div",
            { class: "timeline-body" },
            el("h3", { class: "timeline-org" }, step.organizacion || ""),
            step.periodo ? el("p", { class: "timeline-period" }, step.periodo) : null,
            step.descripcion ? el("p", { class: "timeline-desc" }, step.descripcion) : null
          )
        )
      );
    });
  }

  /* ---------- pasiones ---------- */

  function renderPasiones(settings) {
    const section = document.getElementById("pasiones");
    const text = document.getElementById("pasiones-text");
    const tags = document.getElementById("pasiones-tags");
    if (!settings.pasiones) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    text.textContent = settings.pasiones;
    tags.innerHTML = "";
    (settings.pasionesTags || []).forEach((t) => {
      const label = typeof t === "string" ? t : t.tag;
      if (label) tags.appendChild(el("span", { class: "tag" }, label));
    });
  }

  /* ---------- proyectos ---------- */

  function renderFilters(items) {
    const counts = { all: items.length };
    CATEGORIES.forEach((c) => { counts[c.key] = 0; });
    items.forEach((i) => {
      const key = i.categoria || "otro";
      if (counts[key] === undefined) counts[key] = 0;
      counts[key]++;
    });

    const bar = document.getElementById("filters");
    bar.innerHTML = "";
    const defs = [{ key: "all", label: "Todos" }, ...CATEGORIES];
    defs.forEach((d) => {
      if (d.key !== "all" && !counts[d.key]) return;
      const btn = el(
        "button",
        {
          class: "pill",
          type: "button",
          "aria-pressed": String(state.filter === d.key),
          onclick: () => { state.filter = d.key; renderFilters(items); renderGrid(items); },
        },
        d.label,
        el("span", { class: "count" }, String(counts[d.key]))
      );
      bar.appendChild(btn);
    });
  }

  function renderCard(item) {
    const video = item.type === "video" ? parseVideo(item.videoUrl) : null;
    const thumb = item.image || (video ? youtubeThumb(video) : null);

    const frame = el(
      "span",
      { class: "frame" },
      el("span", { class: "corner-tl" }),
      el("span", { class: "corner-br" }),
      el("span", { class: "type-badge" }, typeLabel(item.type)),
      thumb ? el("img", { src: thumb, alt: "", loading: "lazy" }) : el("span", { class: "frame-fallback" }, typeLabel(item.type)),
      item.type === "video" ? playIcon() : null
    );

    const meta = el(
      "span",
      { class: "card-meta" },
      item.year ? el("span", {}, String(item.year)) : null,
      item.client ? el("span", {}, "· " + item.client) : null
    );

    return el(
      "button",
      { class: "card", type: "button", onclick: () => openLightbox(item) },
      frame,
      el(
        "span",
        { class: "card-body" },
        meta,
        el("span", { class: "card-title" }, item.title || "Sin título"),
        item.description ? el("p", { class: "card-desc" }, item.description) : null,
        (item.tags && item.tags.length)
          ? el("span", { class: "card-tags" }, item.tags.map((t) => el("span", { class: "tag" }, t)))
          : null
      )
    );
  }

  function renderGrid(items) {
    const grid = document.getElementById("grid");
    const empty = document.getElementById("empty");
    grid.innerHTML = "";

    const filtered = state.filter === "all" ? items : items.filter((i) => (i.categoria || "otro") === state.filter);

    if (items.length === 0) {
      empty.hidden = false;
      grid.hidden = true;
      return;
    }
    empty.hidden = true;
    grid.hidden = false;
    filtered.forEach((item) => grid.appendChild(renderCard(item)));
  }

  function openLightbox(item) {
    const overlay = document.getElementById("lightbox-overlay");
    const mediaBox = document.getElementById("lightbox-media");
    const body = document.getElementById("lightbox-body");
    mediaBox.innerHTML = "";
    body.innerHTML = "";

    if (item.type === "video") {
      const video = parseVideo(item.videoUrl);
      const src = embedSrc(video);
      if (src) {
        mediaBox.appendChild(
          el("iframe", {
            src,
            title: item.title || "Video",
            allow: "autoplay; fullscreen; picture-in-picture",
            allowfullscreen: true,
          })
        );
      } else if (item.image) {
        mediaBox.appendChild(el("img", { src: item.image, alt: "" }));
      }
    } else if (item.image) {
      mediaBox.appendChild(el("img", { src: item.image, alt: item.title || "" }));
    }

    const meta = el(
      "span",
      { class: "card-meta" },
      item.year ? el("span", {}, String(item.year)) : null,
      item.client ? el("span", {}, "· " + item.client) : null
    );
    body.appendChild(meta);
    body.appendChild(el("h2", { class: "card-title", style: "font-size:1.6rem;margin-top:0.5rem;" }, item.title || "Sin título"));
    if (item.description) body.appendChild(el("p", {}, item.description));
    if (item.tags && item.tags.length) {
      body.appendChild(el("span", { class: "card-tags" }, item.tags.map((t) => el("span", { class: "tag" }, t))));
    }

    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    const overlay = document.getElementById("lightbox-overlay");
    overlay.hidden = true;
    document.getElementById("lightbox-media").innerHTML = "";
    document.body.style.overflow = "";
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
    document.getElementById("lightbox-overlay").addEventListener("click", (e) => {
      if (e.target.id === "lightbox-overlay") closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });

    const dataSource = window.__PREVIEW_DATA
      ? Promise.resolve([window.__PREVIEW_DATA.settings, window.__PREVIEW_DATA.portfolio])
      : Promise.all([
          fetch("content/settings.json").then((r) => r.json()).catch(() => ({})),
          fetch("content/portfolio.json").then((r) => r.json()).catch(() => ({ items: [] })),
        ]);

    dataSource.then(([settings, portfolio]) => {
      settings = settings || {};
      renderHero(settings);
      renderTimeline(settings);
      renderPasiones(settings);

      const items = (portfolio && portfolio.items) || [];
      state.items = items;
      renderFilters(items);
      renderGrid(items);
    });
  });
})();
