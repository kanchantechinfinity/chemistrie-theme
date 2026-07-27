/* ───── Welcome / discount popup: show once per session, close + copy-code handlers ───── */
(function () {
  "use strict";
  var KEY = "chemistrie_promo_seen";
  var popup = document.getElementById("promoPopup");
  if (!popup) return;

  var backdrop = document.getElementById("promoPopupBackdrop");
  var closeBtn = document.getElementById("promoPopupClose");
  var copyBtn = document.getElementById("promoCodeCopy");
  var codeEl = document.getElementById("promoCodeValue");

  function open() {
    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("promo-locked");
  }
  function close() {
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("promo-locked");
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
  }

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (backdrop) backdrop.addEventListener("click", close);
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && popup.classList.contains("is-open")) close();
  });

  if (copyBtn && codeEl) {
    copyBtn.addEventListener("click", function () {
      var code = codeEl.textContent.trim();
      var done = function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        copyBtn.classList.add("is-copied");
        setTimeout(function () {
          copyBtn.textContent = original;
          copyBtn.classList.remove("is-copied");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(done);
      } else {
        done();
      }
    });
  }

  var alreadySeen = false;
  try { alreadySeen = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
  var justSubmitted = popup.querySelector(".promo-popup__sent[style]");

  if (!alreadySeen || justSubmitted) {
    setTimeout(open, justSubmitted ? 0 : 4000);
  }
})();
