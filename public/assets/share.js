/* Share bar for articles on vishnuvardhan.io.
   Plain share links only: no third-party SDKs, so no tracking cookies and no extra page weight.
   Colours come from each article's own CSS variables, with fallbacks. */
(function () {
  "use strict";

  var canonical = document.querySelector('link[rel="canonical"]');
  var url = canonical ? canonical.href : location.origin + location.pathname.replace(/\.html$/, "");
  var titleMeta = document.querySelector('meta[property="og:title"]');
  var title = titleMeta ? titleMeta.content : document.title.replace(/\s*·\s*Vishnu Vardhan\s*$/, "");
  var u = encodeURIComponent(url);
  var t = encodeURIComponent(title);

  var icons = {
    linkedin: ["0 0 24 24", "M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 21 11.2 21 14.5V21h-4v-5.8c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V21H9z"],
    x: ["0 0 24 24", "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"],
    facebook: ["0 0 320 512", "M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"],
    whatsapp: ["0 0 24 24", "M12 2.2a9.8 9.8 0 00-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1012 2.2zm0 1.8a8 8 0 11-4.1 14.9l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 0112 4zm-3.3 4c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 2.2.9 2.6.7 3.1.6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.3 0-.4.1-.5l.4-.5.3-.4c.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5z"],
    hn: ["0 0 24 24", "M3 3h18v18H3zm2 2v14h14V5zm3.2 2.5h1.9l1.9 3.8 1.9-3.8h1.9l-2.9 5.4v3.6h-1.8v-3.6z"],
    link: ["0 0 24 24", "M10.6 13.4a1 1 0 010-1.4l3.2-3.2a1 1 0 111.4 1.4L12 13.4a1 1 0 01-1.4 0zM8.5 17.6a3 3 0 01-4.2-4.2l2.8-2.8a1 1 0 00-1.4-1.4l-2.8 2.8a5 5 0 007 7l2.8-2.8a1 1 0 00-1.4-1.4zm11.1-13.3a5 5 0 00-7 0L9.8 7.1a1 1 0 001.4 1.4L14 5.7a3 3 0 014.2 4.2l-2.8 2.8a1 1 0 001.4 1.4l2.8-2.8a5 5 0 000-7z"],
    share: ["0 0 24 24", "M12 2.6l4.7 4.7-1.4 1.4L13 6.4V15h-2V6.4L8.7 8.7 7.3 7.3zM4 12h2v7h12v-7h2v9H4z"]
  };

  var targets = [
    { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/sharing/share-offsite/?url=" + u },
    { key: "x", label: "X", href: "https://x.com/intent/post?text=" + t + "&url=" + u + "&via=DipEngineer" },
    { key: "facebook", label: "Facebook", href: "https://www.facebook.com/sharer/sharer.php?u=" + u },
    { key: "whatsapp", label: "WhatsApp", href: "https://wa.me/?text=" + t + "%20" + u },
    { key: "hn", label: "Hacker News", href: "https://news.ycombinator.com/submitlink?u=" + u + "&t=" + t }
  ];

  var css =
    ".vv-share{margin:2.6rem 0 0;padding:1.1rem 0 0;border-top:1px solid var(--rule,#E3E5E8);font-family:inherit}" +
    ".vv-share h2.vv-share-h{all:unset;display:block;font-size:12.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#6B6F76);margin:0 0 12px}" +
    ".vv-share ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px}" +
    ".vv-share li{margin:0;padding:0;max-width:none}" +
    ".vv-share a,.vv-share button{display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:0 13px;border:1px solid var(--rule,#E3E5E8);border-radius:999px;background:transparent;color:var(--accent,#1A55A6);font:inherit;font-size:14px;font-weight:600;line-height:1;text-decoration:none;cursor:pointer;transition:background-color .15s,border-color .15s}" +
    ".vv-share a:hover,.vv-share button:hover{background:var(--accent-soft,rgba(26,85,166,.08));border-color:var(--accent,#1A55A6);color:var(--accent,#1A55A6)}" +
    ".vv-share a:focus-visible,.vv-share button:focus-visible{outline:2px solid var(--accent,#1A55A6);outline-offset:2px}" +
    ".vv-share svg{width:15px;height:15px;fill:currentColor;flex:none}" +
    ".vv-share .vv-copied{color:#1E7A3D;border-color:#1E7A3D}" +
    "@media print{.vv-share{display:none}}";

  function svg(key) {
    var i = icons[key];
    return '<svg viewBox="' + i[0] + '" aria-hidden="true" focusable="false"><path d="' + i[1] + '"/></svg>';
  }

  function build() {
    if (document.querySelector(".vv-share")) return;
    var host = document.querySelector("article") || document.querySelector("main") || document.querySelector(".page");
    if (!host) return;

    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var section = document.createElement("section");
    section.className = "vv-share";
    section.setAttribute("aria-labelledby", "vv-share-h");

    var items = "";
    if (navigator.share) {
      items += '<li><button type="button" data-act="native">' + svg("share") + "Share</button></li>";
    }
    targets.forEach(function (s) {
      var ext = s.self ? "" : ' target="_blank" rel="noopener noreferrer"';
      items += '<li><a href="' + s.href + '"' + ext + ' aria-label="Share on ' + s.label + '">' + svg(s.key) + s.label + "</a></li>";
    });
    items += '<li><button type="button" data-act="copy">' + svg("link") + '<span>Copy link</span></button></li>';

    section.innerHTML = '<h2 class="vv-share-h" id="vv-share-h">Share this article</h2><ul>' + items + "</ul>";

    var footer = host.querySelector(":scope > footer");
    if (footer) host.insertBefore(section, footer);
    else host.appendChild(section);

    section.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      if (btn.dataset.act === "native") {
        navigator.share({ title: title, url: url }).catch(function () {});
      } else if (btn.dataset.act === "copy") {
        copy(url).then(function () {
          var label = btn.querySelector("span");
          label.textContent = "Link copied";
          btn.classList.add("vv-copied");
          setTimeout(function () { label.textContent = "Copy link"; btn.classList.remove("vv-copied"); }, 2000);
        });
      }
    });
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
