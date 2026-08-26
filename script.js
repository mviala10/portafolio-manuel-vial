/* Manuel Vial — Portafolio
   Lee content/settings.json y content/portfolio.json (editados desde /admin)
   y arma la página. No requiere build ni frameworks. */

(function () {
  "use strict";

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

  function renderHeader(settings) {
    document.title = (settings.siteTitle || "Portafolio") + " — Portafolio";
    document.getElementById("wordmark").textContent = settings.siteTitle || "Portafolio";
    document.getElementById("role").textContent = settings.role || "";
    document.getElementById("tagline").textContent = settings.tagline || "";

    const about = document.getElementById("about");
    if (settings.about) {
      about.textContent = settings.about;
      about.hidden = false;
    }

    const socials = document.getElementById("socials");
    socials.innerHTML = "";
    const links = [];
    if (settings.email) links.push({ label: settings.email, url: "mailto:" + settings.email });
    (settings.socialLinks || []).forEach((s) => { if (s && s.url) links.push(s); });
    links.forEach((s) => {
      socials.appendChild(el("a", { href: s.url, target: "_blank", rel: "noopener" }, s.label || s.url));
    });
  }

  function renderFilters(items) {
    const counts = { all: items.length, video: 0, graphic: 0 };
    items.forEach((i) => { if (counts[i.type] !== undefined) counts[i.type]++; });

    const bar = document.getElementById("filters");
    bar.innerHTML = "";
    const defs = [
      { key: "all", label: "Todos" },
      { key: "video", label: "Video" },
      { key: "graphic", label: "Gráfica" },
    ];
    defs.forEach((d) => {
      if (d.key !== "all" && counts[d.key] === 0) return;
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

    const filtered = state.filter === "all" ? items : items.filter((i) => i.type === state.filter);

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

    Promise.all([
      fetch("content/settings.json").then((r) => r.json()).catch(() => ({})),
      fetch("content/portfolio.json").then((r) => r.json()).catch(() => ({ items: [] })),
    ]).then(([settings, portfolio]) => {
      renderHeader(settings || {});
      const items = (portfolio && portfolio.items) || [];
      state.items = items;
      renderFilters(items);
      renderGrid(items);
    });
  });
})();
