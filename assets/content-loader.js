(function () {
  // Which content file to use for this page:
  // - default: /content/page.json
  // - override by adding <meta name="cms-content" content="/content/home.json">
  function getContentUrl() {
    var meta = document.querySelector('meta[name="cms-content"]');
    return meta && meta.content ? meta.content : "/content/page.json";
  }

  // Apply values to elements that have data-cms="key".
  // Supported:
  // - text elements: sets textContent
  // - links (<a>): sets href if value looks like a URL/path; sets text if separate key is provided
  // - images (<img>): sets src
  // - video/iframe: sets src for <iframe> or <video> (if used)
  function applyContent(data) {
    var nodes = document.querySelectorAll("[data-cms]");
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-cms");
      if (!key) return;

      // Support nested keys: e.g. hero.title
      var value = key.split(".").reduce(function (acc, k) {
        return acc && Object.prototype.hasOwnProperty.call(acc, k) ? acc[k] : undefined;
      }, data);

      if (value === undefined || value === null) return;

      var tag = el.tagName.toLowerCase();

      if (tag === "img") {
        el.setAttribute("src", String(value));
        return;
      }
      if (tag === "a") {
        el.setAttribute("href", String(value));
        return;
      }
      if (tag === "iframe") {
        el.setAttribute("src", String(value));
        return;
      }
      if (tag === "video") {
        // Optional: value may be a URL
        el.setAttribute("src", String(value));
        return;
      }

      // Default text
      el.textContent = String(value);
    });

    // Repeaters (optional advanced): elements with data-cms-list="key" and a child template [data-cms-item-template]
    var listNodes = document.querySelectorAll("[data-cms-list]");
    listNodes.forEach(function (listEl) {
      var listKey = listEl.getAttribute("data-cms-list");
      if (!listKey) return;

      var arr = listKey.split(".").reduce(function (acc, k) {
        return acc && Object.prototype.hasOwnProperty.call(acc, k) ? acc[k] : undefined;
      }, data);

      if (!Array.isArray(arr)) return;

      var template = listEl.querySelector("[data-cms-item-template]");
      if (!template) return;

      // Clear existing items except template
      Array.from(listEl.children).forEach(function (child) {
        if (child !== template) listEl.removeChild(child);
      });

      arr.forEach(function (item) {
        var clone = template.cloneNode(true);
        clone.removeAttribute("data-cms-item-template");
        clone.style.removeProperty("display");

        clone.querySelectorAll("[data-cms-item]").forEach(function (el) {
          var itemKey = el.getAttribute("data-cms-item");
          if (!itemKey) return;
          var val = itemKey.split(".").reduce(function (acc, k) {
            return acc && Object.prototype.hasOwnProperty.call(acc, k) ? acc[k] : undefined;
          }, item);
          if (val === undefined || val === null) return;

          var tag = el.tagName.toLowerCase();
          if (tag === "img") el.setAttribute("src", String(val));
          else if (tag === "a") el.setAttribute("href", String(val));
          else el.textContent = String(val);
        });

        listEl.appendChild(clone);
      });

      // Hide template
      template.style.display = "none";
    });
  }

  function init() {
    var url = getContentUrl();
    fetch(url, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
      .then(applyContent)
      .catch(function () {
        // Silently ignore if content file not found yet
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();