/* ──────────────────────────────────────────────
   CHEMISTRIE — scroll & motion
   ────────────────────────────────────────────── */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ───── Lenis smooth scroll ───── */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
  }

  /* ───── GSAP / ScrollTrigger setup ───── */
  if (!window.gsap) return;
  const gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  if (lenis && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ───── Nav scroll state ───── */
  const nav = $("#nav");
  if (nav) {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 24);
      if (y > lastY && y > 120) {
        nav.classList.add("nav--hidden");
      } else if (y < lastY) {
        nav.classList.remove("nav--hidden");
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ───── Hero — modern entrance ───── */
  gsap.from(".hero__eyebrow", { opacity: 0, y: 20, duration: 1, delay: 0.15, ease: "power2.out" });
  gsap.from(".hero__title-row", { opacity: 0, y: 40, duration: 1.1, delay: 0.3, ease: "power3.out", stagger: 0.12 });
  gsap.from(".hero__deck", { opacity: 0, y: 20, duration: 1, delay: 0.9, ease: "power2.out" });
  gsap.from(".hero__cta-row > *", { opacity: 0, y: 20, duration: 1, delay: 1.1, ease: "power2.out", stagger: 0.1 });
  gsap.from(".hero__trust > *", { opacity: 0, y: 16, duration: 0.9, delay: 1.3, ease: "power2.out", stagger: 0.08 });
  gsap.from(".hero__meta", { opacity: 0, duration: 1, delay: 0.5, ease: "power2.out" });
  gsap.from(".hero__bottle-wrap", { opacity: 0, y: 50, scale: 0.94, duration: 1.4, delay: 0.5, ease: "power3.out" });
  gsap.from(".hero__spec-card", { opacity: 0, y: 30, scale: 0.9, duration: 1, delay: 1.1, ease: "power2.out", stagger: 0.15 });
  gsap.from(".hero__pill", { opacity: 0, scale: 0.8, duration: 1, delay: 1.3, ease: "back.out(1.6)", stagger: 0.12 });
  gsap.from(".hero__strip", { opacity: 0, duration: 1.2, delay: 1.5, ease: "power2.out" });
  gsap.from(".hero__scroll-cue", { opacity: 0, duration: 1, delay: 1.8, ease: "power2.out" });

  /* hero blobs — slow drift */
  gsap.to(".hero__blob--sage", {
    x: 60, y: 30, duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut",
  });
  gsap.to(".hero__blob--tan", {
    x: -40, y: -20, duration: 14, repeat: -1, yoyo: true, ease: "sine.inOut",
  });

  /* hero bottle — parallax on scroll */
  if (window.ScrollTrigger) {
    gsap.to(".hero__bottle-wrap", {
      yPercent: 18,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.to(".hero__pill", {
      yPercent: -30,
      ease: "none",
      stagger: 0.08,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  /* ───── Vision — word-by-word reveal ───── */
  if (window.ScrollTrigger) {
    const words = $$(".vision__words > span");
    if (words.length) {
      ScrollTrigger.create({
        trigger: ".vision__quote",
        start: "top 70%",
        end: "bottom 60%",
        scrub: 1,
        onUpdate: (st) => {
          const progress = st.progress;
          const visible = Math.floor(progress * words.length * 1.1);
          words.forEach((w, i) => w.classList.toggle("is-on", i < visible));
        },
      });
    }

    /* vision grid — staggered up */
    gsap.fromTo(".vision__cell",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.12,
        scrollTrigger: { trigger: ".vision__grid", start: "top 85%" } });
  }

  /* ───── Pillars — Testimonial Chain entrance ─────
     The card-switching/autoplay logic lives in its own top-level script at
     the bottom of this file, outside this IIFE — see the comment there for
     why. Only the section's initial fade-in stays here. */
  if (window.ScrollTrigger) {
    gsap.fromTo(".pillars-chain",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".pillars-chain", start: "top 85%", once: true } }
    );
  }

  /* ───── Shop — product reveal ───── */
  if (window.ScrollTrigger) {
    gsap.fromTo(".product",
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.08,
        scrollTrigger: { trigger: ".shop__grid", start: "top 75%", once: true } }
    );
    gsap.fromTo(".shop__head > *",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.1,
        scrollTrigger: { trigger: ".shop__head", start: "top 80%", once: true } }
    );

    /* product bottles — gentle float on scroll */
    $$(".product__bottle").forEach((b, i) => {
      gsap.to(b, {
        y: -20,
        ease: "none",
        scrollTrigger: {
          trigger: b.closest(".product"),
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });
  }

  /* ───── Stat Bar ───── */
  if (window.ScrollTrigger) {
    gsap.fromTo(".statbar__cell",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.12,
        scrollTrigger: { trigger: ".statbar", start: "top 80%", once: true } }
    );
  }

  /* ───── Contact Steps — vertical progress line fills as each step scrolls past ───── */
  if (window.ScrollTrigger) {
    gsap.fromTo(".cstep",
      { opacity: 0, y: 70 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.15,
        scrollTrigger: { trigger: ".csteps__list", start: "top 80%", once: true } }
    );
    $$(".cstep__line-fill").forEach((fill) => {
      const step = fill.closest(".cstep");
      gsap.fromTo(fill,
        { scaleY: 0 },
        { scaleY: 1, ease: "none",
          scrollTrigger: { trigger: step, start: "top 75%", end: "bottom 55%", scrub: true } }
      );
    });
  }

  /* ───── Founders ───── */
  if (window.ScrollTrigger) {
    gsap.from(".founders__photo--a", {
      opacity: 0, x: -40, scale: 0.92, duration: 1.2, ease: "power2.out",
      scrollTrigger: { trigger: ".founders", start: "top 70%" },
    });
    gsap.from(".founders__photo--b", {
      opacity: 0, x: 40, scale: 0.92, duration: 1.2, ease: "power2.out", delay: 0.15,
      scrollTrigger: { trigger: ".founders", start: "top 70%" },
    });
    gsap.from(".founders__head > *, .founders__body > *", {
      opacity: 0, y: 30, duration: 1, ease: "power2.out", stagger: 0.08,
      scrollTrigger: { trigger: ".founders", start: "top 75%" },
    });
    /* Parallax only above 1024px: below that the photos are static grid items,
       so shifting them vertically drags them over the headline and caption. */
    gsap.matchMedia().add("(min-width: 1025px)", () => {
      gsap.to(".founders__photo--a", {
        y: -40, ease: "none",
        scrollTrigger: { trigger: ".founders", start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to(".founders__photo--b", {
        y: 40, ease: "none",
        scrollTrigger: { trigger: ".founders", start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  }

  /* ───── Active Index — pinned horizontal showcase + card animations ───── */
  (function initActivesScroll() {
    if (!window.ScrollTrigger) return;
    const pin = $("#activesPin");
    const track = $("#activesTrack");
    const currentEl = $("#activesCurrent");
    const progressEl = $("#activesProgress");
    if (!pin || !track) return;

    const cards = $$(".active-card", track);
    const isPhone = window.matchMedia("(max-width: 700px)").matches;

    /* Intro head reveal — fire as soon as it enters view, no lag */
    gsap.from(".actives__intro > *", {
      opacity: 0, y: 16, duration: 0.5, ease: "power2.out", stagger: 0.06,
      scrollTrigger: { trigger: ".actives__intro", start: "top 100%" },
    });

    if (isPhone) {
      pin.style.height = "auto";
      pin.style.overflowX = "auto";
      pin.style.overflowY = "hidden";
      pin.style.scrollSnapType = "x mandatory";
      pin.style.paddingBottom = "32px";
      cards.forEach(c => c.style.scrollSnapAlign = "start");
      return;
    }

    const totalScroll = () => track.scrollWidth - window.innerWidth + 80;

    const horizontalTween = gsap.to(track, {
      x: () => -totalScroll(),
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: () => "+=" + totalScroll(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (st) => {
          const idx = Math.min(cards.length - 1, Math.round(st.progress * (cards.length - 1)));
          if (currentEl) currentEl.textContent = String(idx + 1).padStart(2, "0");
          if (progressEl) progressEl.style.width = (st.progress * 100) + "%";
          cards.forEach((c, i) => c.classList.toggle("is-current", i === idx));
        },
      },
    });

    /* Per-card entrance animations tied to the horizontal container.
       Any card that already sits inside the initial viewport (not just card 0)
       starts left of the "left 95%"/"left 90%" trigger points at containerAnimation
       progress 0, so ScrollTrigger's start/end math resolves outside the valid
       [0,1] range for it and it can be left stuck at its opacity:0 initial state —
       showing as blank space instead of the card. Show every such card immediately
       in its final state instead, and let only the truly off-screen cards keep the
       normal scroll-revealed entrance. */
    const viewportW = window.innerWidth;
    cards.forEach((card, i) => {
      const mol = card.querySelector(".active-card__mol svg");
      const inner = card.querySelectorAll(".active-card__tier, .active-card__name, .active-card__dose, .active-card__desc, .active-card__specs > div");

      if (card.offsetLeft < viewportW) {
        gsap.set(card, { y: 0, opacity: 1, scale: 1 });
        if (mol) gsap.set(mol, { scale: 1, opacity: 1, rotation: 0 });
        gsap.set(inner, { y: 0, opacity: 1 });
        return;
      }

      gsap.fromTo(card,
        { y: 60, opacity: 0, scale: 0.92 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.8, ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            containerAnimation: horizontalTween,
            start: "left 95%",
            end: "left 60%",
            toggleActions: "play none none reverse",
          },
        });

      /* Molecule scale-bounce */
      if (mol) {
        gsap.fromTo(mol,
          { scale: 0.4, opacity: 0, rotation: -30 },
          {
            scale: 1, opacity: 1, rotation: 0,
            duration: 0.9, ease: "back.out(1.6)", delay: 0.2,
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontalTween,
              start: "left 90%",
              toggleActions: "play none none reverse",
            },
          });
      }

      /* Stagger inner content */
      gsap.fromTo(inner,
        { y: 24, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.55, ease: "power2.out", stagger: 0.05, delay: 0.25,
          scrollTrigger: {
            trigger: card,
            containerAnimation: horizontalTween,
            start: "left 90%",
            toggleActions: "play none none reverse",
          },
        });
    });

    /* Slow continuous molecule rotation per card */
    $$(".active-card__mol svg").forEach((svg, i) => {
      gsap.to(svg, {
        rotation: "+=360",
        duration: 24 + (i % 4) * 4,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    });
  })();

  /* ───── Brand Story + Instagram reveals — scroll listener with JS-driven animation ───── */

  /* Story is handled by GSAP ScrollTrigger now — skip from reveal logic */
  $$(".story__chapter").forEach((ch) => {
    [".story__chapter-body", ".story__chapter-photo", ".story__chapter-meta"].forEach((s) => {
      const el = ch.querySelector(s);
      if (el) el.style.opacity = "";
    });
  });

  /* Instagram: set initial hidden state via JS, defer transition to next frame */
  $$(".reel").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
  });

  /* Defer transition application by 2 rAFs so initial state paints first */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$(".reel").forEach((el) => {
      el.style.transition = "opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1)";
    });
    /* Now run initial reveal check after transitions are wired */
    checkReveals();
  }));

  function revealStoryChapter(_ch) { /* handled by GSAP now */ }
  function revealReel(el) {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  }

  const revealTargets = $$(".story__chapter, .reel, .story__intro, .insta__intro");
  function checkReveals() {
    const vh = window.innerHeight;
    revealTargets.forEach((el) => {
      if (el.classList.contains("is-in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0) {
        el.classList.add("is-in");
        if (el.classList.contains("story__chapter")) revealStoryChapter(el);
        else if (el.classList.contains("reel")) revealReel(el);
      }
    });
  }
  window.addEventListener("scroll", checkReveals, { passive: true });
  if (lenis) lenis.on("scroll", checkReveals);
  window.addEventListener("resize", checkReveals);

  /* ───── Brand Story — photo parallax (GSAP scrub, safe) ───── */
  if (window.ScrollTrigger) {
    $$(".story__chapter-photo svg").forEach((photo) => {
      gsap.to(photo, {
        yPercent: -8, ease: "none",
        scrollTrigger: { trigger: photo, start: "top bottom", end: "bottom top", scrub: 1 },
      });
    });
  }

  /* ───── Instagram — slider arrows + dots ───── */
  (function initInstaSlider() {
    const slider = document.getElementById("instaSlider");
    if (!slider) return;
    const arrows = $$(".insta__arrow");
    const dotsContainer = document.getElementById("instaDots");
    const reels = $$(".reel", slider);

    function step() {
      const first = reels[0];
      if (!first) return 320;
      const second = reels[1];
      if (second) return second.offsetLeft - first.offsetLeft;
      return first.offsetWidth + 20;
    }

    function update() {
      const max = slider.scrollWidth - slider.clientWidth - 4;
      arrows.forEach((a) => {
        const dir = parseInt(a.dataset.dir, 10);
        if (dir < 0) a.disabled = slider.scrollLeft <= 4;
        else a.disabled = slider.scrollLeft >= max;
      });
      if (dotsContainer) {
        const dots = $$(".insta__dot", dotsContainer);
        if (dots.length) {
          const stepPx = step();
          const idx = Math.round(slider.scrollLeft / stepPx);
          dots.forEach((d, i) => d.classList.toggle("is-active", i === Math.min(idx, dots.length - 1)));
        }
      }
    }

    arrows.forEach((a) => {
      a.addEventListener("click", () => {
        const dir = parseInt(a.dataset.dir, 10);
        const cardsVisible = Math.max(1, Math.floor(slider.clientWidth / step()));
        slider.scrollBy({ left: dir * step() * cardsVisible, behavior: "smooth" });
      });
    });

    /* dots */
    if (dotsContainer) {
      const pages = Math.max(1, Math.ceil(reels.length / Math.max(1, Math.floor(slider.clientWidth / step()))));
      const reelsPerPage = Math.max(1, Math.floor(slider.clientWidth / step()));
      const dotCount = Math.ceil(reels.length / reelsPerPage);
      dotsContainer.innerHTML = "";
      for (let i = 0; i < dotCount; i++) {
        const b = document.createElement("button");
        b.className = "insta__dot";
        b.setAttribute("aria-label", `Page ${i + 1}`);
        b.addEventListener("click", () => {
          slider.scrollTo({ left: i * reelsPerPage * step(), behavior: "smooth" });
        });
        dotsContainer.appendChild(b);
      }
    }

    slider.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* ───── Brand Story — GSAP scroll animations ───── */
  if (window.ScrollTrigger) {
    /* Intro head reveal */
    gsap.from(".story__intro > *", {
      opacity: 0, y: 40, duration: 1, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".story__intro", start: "top 80%" },
    });

    const chapters = $$(".story__chapter");
    const chaptersEl = $(".story__chapters");

    if (chaptersEl) {
      const dot = document.createElement("span");
      dot.className = "story__rail-dot";
      chaptersEl.appendChild(dot);
      dot.style.transition = "top 1.1s cubic-bezier(.22,1,.36,1), transform .35s ease";

      function snapDotToActive() {
        const containerRect = chaptersEl.getBoundingClientRect();
        let closest = null;
        let minDist = Infinity;
        let activeIdx = 0;
        chapters.forEach((ch, i) => {
          const meta = ch.querySelector(".story__chapter-meta");
          if (!meta) return;
          const r = meta.getBoundingClientRect();
          const center = r.top + r.height / 2;
          const dist = Math.abs(center - window.innerHeight / 2);
          if (dist < minDist) {
            minDist = dist;
            closest = meta;
            activeIdx = i;
          }
        });
        if (closest) {
          const r = closest.getBoundingClientRect();
          const top = r.top - containerRect.top + r.height / 2;
          dot.style.top = top + "px";
          /* progress = activeIdx / lastIdx */
          const p = chapters.length > 1 ? activeIdx / (chapters.length - 1) : 0;
          chaptersEl.style.setProperty("--p", p);
        }
      }

      window.addEventListener("scroll", snapDotToActive, { passive: true });
      if (lenis) lenis.on("scroll", snapDotToActive);
      window.addEventListener("resize", snapDotToActive);
      /* initial position */
      requestAnimationFrame(() => requestAnimationFrame(snapDotToActive));
    }

    chapters.forEach((ch, i) => {
      const isReverse = ch.classList.contains("story__chapter--reverse");
      const body = ch.querySelector(".story__chapter-body");
      const photo = ch.querySelector(".story__chapter-photo");
      const meta = ch.querySelector(".story__chapter-meta");
      const photoSvg = ch.querySelector(".story__chapter-photo svg");

      /* Set initial state IMMEDIATELY via inline styles so they're hidden before ScrollTrigger inits */
      if (body) { body.style.opacity = "0"; body.style.transform = `translateX(${isReverse ? 60 : -60}px)`; }
      if (photo) { photo.style.opacity = "0"; photo.style.transform = `translateX(${isReverse ? -60 : 60}px) scale(.92)`; }
      if (meta) { meta.style.opacity = "0"; meta.style.transform = "scale(.4) rotate(-8deg)"; }

      if (body) {
        gsap.to(body, {
          opacity: 1, x: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: ch, start: "top 90%", once: true },
        });
      }
      if (photo) {
        gsap.to(photo, {
          opacity: 1, x: 0, scale: 1, duration: 1.3, ease: "power3.out",
          scrollTrigger: { trigger: ch, start: "top 90%", once: true },
        });
      }
      if (meta) {
        gsap.to(meta, {
          opacity: 1, scale: 1, rotate: 0, duration: 1.1, ease: "back.out(1.6)", delay: 0.18,
          scrollTrigger: { trigger: ch, start: "top 90%", once: true },
        });
      }
      /* Photo parallax + entrance zoom */
      if (photoSvg) {
        gsap.to(photoSvg, {
          yPercent: -14, ease: "none",
          scrollTrigger: { trigger: ch, start: "top bottom", end: "bottom top", scrub: 1 },
        });
        gsap.fromTo(photoSvg,
          { scale: 1.08 },
          { scale: 1, ease: "power2.out",
            scrollTrigger: { trigger: ch, start: "top 90%", end: "top 40%", scrub: 1 } });
      }
    });

    /* Refresh after a moment to catch any layout shifts */
    setTimeout(() => ScrollTrigger.refresh(), 300);
  }

  /* ───── Proof — number counters ───── */  if (window.ScrollTrigger) {
    $$(".proof__num").forEach((el) => {
      const target = parseInt(el.dataset.count || "0", 10);
      const suffix = el.dataset.suffix || "";
      const numEl = el.querySelector(".proof__num-n") || el;
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: () => {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              numEl.textContent = Math.round(obj.v) + suffix;
            },
          });
        },
      });
    });
    gsap.from(".proof__cell", {
      opacity: 0, y: 30, duration: 1, ease: "power2.out", stagger: 0.1,
      scrollTrigger: { trigger: ".proof__grid", start: "top 75%" },
    });
  }

  /* ───── The Ritual Finder ───── */
  if (window.ScrollTrigger) {
    gsap.from(".ritual-finder__content > *", {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: { trigger: ".ritual-finder", start: "top 78%", once: true },
    });
    gsap.from(".ritual-finder__media", {
      opacity: 0,
      y: 40,
      scale: 0.96,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: { trigger: ".ritual-finder", start: "top 78%", once: true },
    });
  }

  /* ───── Testimonials ───── */
  if (window.ScrollTrigger) {
    gsap.from(".testimonials__head > *", {
      opacity: 0, y: 30, duration: 1, ease: "power2.out", stagger: 0.1,
      scrollTrigger: { trigger: ".testimonials__head", start: "top 80%" },
    });
    gsap.from(".testimonials__press em", {
      opacity: 0, y: 20, duration: 0.8, ease: "power2.out", stagger: 0.08,
      scrollTrigger: { trigger: ".testimonials__press", start: "top 85%" },
    });
  }

  /* ───── CTA ───── */
  if (window.ScrollTrigger) {
    gsap.from(".cta__card", {
      opacity: 0, y: 60, scale: 0.97, duration: 1.2, ease: "power2.out",
      scrollTrigger: { trigger: ".cta", start: "top 75%" },
    });
  }

  /* ───── Generic section-head reveals ───── */
  if (window.ScrollTrigger) {
    gsap.from(".pillars__intro > *:not(.pillars__cta)", {
      opacity: 0, y: 24, duration: 1, ease: "power2.out", stagger: 0.1,
      scrollTrigger: { trigger: ".pillars__intro", start: "top 84%" },
    });
    gsap.from(".vision .section__head", {
      opacity: 0, y: 24, duration: 1, ease: "power2.out",
      scrollTrigger: { trigger: ".vision", start: "top 82%" },
    });
    /* Subtle parallax lift on section dividers */
    [".vision", ".shop", ".actives", ".story"].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        gsap.fromTo(el,
          { backgroundPositionY: "0%" },
          { backgroundPositionY: "4%", ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }
        );
      }
    });
  }

  /* ───── Footer mega wordmark ───── */
  if (window.ScrollTrigger) {
    gsap.from(".footer__wordmark-huge", {
      letterSpacing: "0em", opacity: 0, duration: 1.6, ease: "power2.out",
      scrollTrigger: { trigger: ".footer", start: "top 80%" },
    });
  }

  /* ───── small misc: anchor smooth scroll integration ───── */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(tgt, { offset: -60, duration: 1.4 });
      } else {
        tgt.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ───── [data-reveal] IntersectionObserver ───── */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach((el) => revealIO.observe(el));

  /* ───── Recalculate scroll-trigger positions once layout has fully settled.
     Web fonts (Cormorant Garamond) and any section images (e.g. pillar crest
     photos) load asynchronously and reflow the page after ScrollTrigger's
     initial measurements are taken — without a refresh, every scroll-linked
     effect (actives/ritual pin, pillars tab-card reveal, etc.) keeps using stale
     start/end positions, causing exactly this "right for a moment, then
     drifts" symptom. Refresh once fonts are ready, once the window has fully
     loaded (images included), and again shortly after as a safety net. ───── */
  if (window.ScrollTrigger) {
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refresh);
    }
    if (document.readyState === "complete") {
      refresh();
    } else {
      window.addEventListener("load", refresh);
    }
    setTimeout(refresh, 600);
  }

  /* expose for tweaks */
  window.__chemistrie = { gsap, ScrollTrigger: window.ScrollTrigger, lenis };

})();

/* ──────────────────────────────────────────────
   CHEMISTRIE — Hero Anchor Smooth Scroll
   ────────────────────────────────────────────── */
document.querySelectorAll('a[href="#ritual-finder-app"]').forEach(function (anchor) {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    var app = document.getElementById("ritual-finder-app");
    if (app) {
      if (window.__chemistrie && window.__chemistrie.lenis) {
        window.__chemistrie.lenis.scrollTo(app, { offset: -40, duration: 1 });
      } else {
        app.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});


/* ──────────────────────────────────────────────
   CHEMISTRIE — Pillars Testimonial Chain
   Deliberately its own top-level script, not nested inside the IIFE
   above. That IIFE returns early if window.gsap isn't loaded, and
   everything after that point never runs if it does - none of this
   carousel logic (card switching, autoplay, dots, swipe) uses gsap for
   anything, so it shouldn't be able to go dark because an unrelated
   animation library failed to load or an earlier animation block threw.
   Runs unconditionally once the DOM for it exists.
   ────────────────────────────────────────────── */
(function initPillarsChain() {
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var container = document.getElementById("pillarsChain");
  if (!container) return;

  var cards = $$(".pchain-card", container);
  var dots = $$(".pillars-chain__dot", container);
  var total = cards.length;
  if (total === 0) return;

  var activeIndex = 0;
  var autoplayInterval = parseInt(container.getAttribute("data-autoplay-speed"), 10) || 5000;
  var startTime = null;
  var isPaused = false;
  var animFrame = null;

  function updateCardClasses(idx) {
    cards.forEach(function (card, i) {
      card.classList.remove("is-active", "is-prev-1", "is-next-1", "is-prev-2", "is-next-2", "is-hidden");

      var diff = (i - idx + total) % total;
      if (diff > total / 2) diff -= total;

      if (diff === 0) {
        card.classList.add("is-active");
      } else if (diff === -1 || (total === 2 && diff === 1)) {
        card.classList.add("is-prev-1");
      } else if (diff === 1) {
        card.classList.add("is-next-1");
      } else if (diff === -2) {
        card.classList.add("is-prev-2");
      } else if (diff === 2) {
        card.classList.add("is-next-2");
      } else {
        card.classList.add("is-hidden");
      }
    });

    dots.forEach(function (dot, i) {
      var isActive = i === idx;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", isActive ? "true" : "false");
      var fill = dot.querySelector(".pillars-chain__dot-fill");
      if (fill) fill.style.width = "0%";
    });
  }

  function setSlide(idx) {
    activeIndex = (idx + total) % total;
    updateCardClasses(activeIndex);
    resetTimer();
  }

  function tick() {
    if (isPaused) return;
    var elapsed = Date.now() - startTime;
    var progress = Math.min(1, elapsed / autoplayInterval);

    var activeDot = dots[activeIndex];
    if (activeDot) {
      var fill = activeDot.querySelector(".pillars-chain__dot-fill");
      if (fill) fill.style.width = (progress * 100) + "%";
    }

    if (progress >= 1) {
      setSlide(activeIndex + 1);
    } else {
      animFrame = requestAnimationFrame(tick);
    }
  }

  function startTimer() {
    cancelAnimationFrame(animFrame);
    startTime = Date.now();
    animFrame = requestAnimationFrame(tick);
  }

  function resetTimer() {
    cancelAnimationFrame(animFrame);
    startTime = Date.now();
    if (!isPaused) {
      animFrame = requestAnimationFrame(tick);
    }
  }

  function pauseTimer() {
    isPaused = true;
    cancelAnimationFrame(animFrame);
  }

  function resumeTimer() {
    if (!isPaused) return;
    isPaused = false;
    var activeDot = dots[activeIndex];
    var currentWidth = 0;
    if (activeDot) {
      var fill = activeDot.querySelector(".pillars-chain__dot-fill");
      if (fill && fill.style.width) {
        currentWidth = parseFloat(fill.style.width) || 0;
      }
    }
    var elapsed = (currentWidth / 100) * autoplayInterval;
    startTime = Date.now() - elapsed;
    animFrame = requestAnimationFrame(tick);
  }

  /* Honour an OS-level reduced-motion preference: render the first slide
     and let clicks/dots still work, just no automatic advance. */
  var mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = !!(mq && mq.matches);

  container.addEventListener("mouseenter", pauseTimer);
  container.addEventListener("mouseleave", resumeTimer);

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      if (dragMoved) return;
      if (card.classList.contains("is-active")) return;
      var idx = parseInt(card.getAttribute("data-chain-index"), 10);
      setSlide(idx);
    });
  });

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var idx = parseInt(dot.getAttribute("data-dot-index"), 10);
      setSlide(idx);
    });
  });

  /* Manual sliding — one Pointer Events implementation covers mouse, touch
     and pen, so there's no separate touch path that could double-fire on
     touch devices (they emit pointer events too). dragMoved suppresses a
     flanking card's own click when the pointerup that ends a drag happens
     to land on one, so a drag never also jumps straight to that card. */
  var dragMoved = false;
  var dragStartX = 0;
  var dragDelta = 0;
  var isDragging = false;
  var DRAG_THRESHOLD = 40;

  var stage = document.getElementById("pillarsChainStage");
  if (stage) {
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragDelta = 0;
      stage.classList.add("is-dragging");
      pauseTimer();
    });

    stage.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      dragDelta = e.clientX - dragStartX;
      if (Math.abs(dragDelta) > 6) dragMoved = true;
    });

    function endChainDrag() {
      if (!isDragging) return;
      isDragging = false;
      stage.classList.remove("is-dragging");

      if (Math.abs(dragDelta) > DRAG_THRESHOLD) {
        setSlide(activeIndex + (dragDelta < 0 ? 1 : -1));
      }
      resumeTimer();

      /* Clear on the next frame so the click that follows this pointerup
         still sees dragMoved and suppresses itself. */
      requestAnimationFrame(function () { dragMoved = false; });
    }

    stage.addEventListener("pointerup", endChainDrag);
    stage.addEventListener("pointercancel", endChainDrag);
    stage.addEventListener("pointerleave", endChainDrag);
  }

  updateCardClasses(0);
  if (!reduceMotion && total > 1) startTimer();
})();
