(function () {
  function getContentUrl() {
    var meta = document.querySelector('meta[name="cms-content"]');
    return meta && meta.content ? meta.content : "/content/home.json";
  }

  function getByPath(data, key) {
    return key.split(".").reduce(function (acc, k) {
      return acc && Object.prototype.hasOwnProperty.call(acc, k) ? acc[k] : undefined;
    }, data);
  }

  // Hide/show blocks. IMPORTANT: do nothing if the key is missing (undefined).
  function applyHide(data) {
    var nodes = document.querySelectorAll("[data-cms-hide]");
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-cms-hide");
      if (!key) return;

      var value = getByPath(data, key);

      // If key isn't present in JSON -> do not change anything
      if (value === undefined) return;

      var enabled = (value === true || value === "true" || value === 1 || value === "1");

      if (!enabled) {
        if (!el.hasAttribute("data-cms-hide-prev-display")) {
          el.setAttribute("data-cms-hide-prev-display", el.style.display || "");
        }
        el.style.display = "none";
      } else {
        if (el.hasAttribute("data-cms-hide-prev-display")) {
          el.style.display = el.getAttribute("data-cms-hide-prev-display") || "";
        } else {
          el.style.display = "";
        }
      }
    });
  }

  function applyAttr(data, cmsAttr, realAttr) {
    var selector = "[" + cmsAttr + "]";
    document.querySelectorAll(selector).forEach(function (el) {
      var key = el.getAttribute(cmsAttr);
      if (!key) return;

      var value = getByPath(data, key);

      // If key missing -> skip (do not overwrite defaults)
      if (value === undefined || value === null) return;

      el.setAttribute(realAttr, String(value));
    });
  }

  function applyAttributes(data) {
    applyAttr(data, "data-cms-src", "src");
    applyAttr(data, "data-cms-href", "href");
    applyAttr(data, "data-cms-alt", "alt");
    applyAttr(data, "data-cms-title", "title");
    applyAttr(data, "data-cms-placeholder", "placeholder");
    applyAttr(data, "data-cms-action", "action");
    applyAttr(data, "data-cms-uuid", "uuid");
  }

  function applyContent(data) {
    // Never let a small bug kill the whole page updates
    try {
      applyHide(data);
      applyAttributes(data);
    } catch (e) {
      // keep going to text updates
    }

    var nodes = document.querySelectorAll("[data-cms]");
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-cms");
      if (!key) return;

      var value = getByPath(data, key);
      if (value === undefined || value === null) return;

      var tag = el.tagName.toLowerCase();

      // Keep your original behavior:
      // data-cms on <a> sets href, on <img> sets src, etc.
      // (Text should be placed on inner <span>/<div> to avoid this)
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
        el.setAttribute("src", String(value));
        return;
      }

      el.textContent = String(value);
    });

    // Repeaters left as-is
    var listNodes = document.querySelectorAll("[data-cms-list]");
    listNodes.forEach(function (listEl) {
      var listKey = listEl.getAttribute("data-cms-list");
      if (!listKey) return;

      var arr = getByPath(data, listKey);
      if (!Array.isArray(arr)) return;

      var template = listEl.querySelector("[data-cms-item-template]");
      if (!template) return;

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

          var val = getByPath(item, itemKey);
          if (val === undefined || val === null) return;

          var tag = el.tagName.toLowerCase();
          if (tag === "img") el.setAttribute("src", String(val));
          else if (tag === "a") el.setAttribute("href", String(val));
          else el.textContent = String(val);
        });

        listEl.appendChild(clone);
      });

      template.style.display = "none";
    });
  }

  function init() {
    var url = getContentUrl();
    fetch(url, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
      .then(applyContent)
      .catch(function () {
        // ignore
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
