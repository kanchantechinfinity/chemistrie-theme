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
    const onScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
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

  /* ───── Pillars — sticky stacking + parallax ───── */
  if (window.ScrollTrigger) {
    const pillars = $$(".pillar");
    pillars.forEach((p, i) => {
      gsap.fromTo(p,
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
          scrollTrigger: { trigger: p, start: "top 90%" } });

      /* Inner content stagger */
      const inner = p.querySelectorAll(".pillar__title, .pillar__lede, .pillar__list li");
      gsap.fromTo(inner,
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", stagger: 0.07, delay: 0.2,
          scrollTrigger: { trigger: p, start: "top 80%" } });

      /* Crest entrance */
      const crest = p.querySelector(".pillar__crest");
      if (crest) {
        gsap.fromTo(crest,
          { opacity: 0, scale: 0.6, rotate: -10 },
          { opacity: 1, scale: 1, rotate: 0, duration: 1.0, ease: "back.out(1.5)", delay: 0.25,
            scrollTrigger: { trigger: p, start: "top 80%" } });
      }

      /* Scale + fade lower cards as the next one stacks over */
      if (i < pillars.length - 1) {
        gsap.to(p, {
          scale: 0.94 - (i * 0.02),
          opacity: 0.6,
          ease: "none",
          scrollTrigger: {
            trigger: pillars[i + 1],
            start: "top 85%",
            end: "top 20%",
            scrub: true,
          },
        });
      }
    });
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
    gsap.from(".founders__copy > *", {
      opacity: 0, y: 30, duration: 1, ease: "power2.out", stagger: 0.08,
      scrollTrigger: { trigger: ".founders__copy", start: "top 75%" },
    });
    /* photo parallax inside founders */
    gsap.to(".founders__photo--a", {
      y: -40, ease: "none",
      scrollTrigger: { trigger: ".founders", start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.to(".founders__photo--b", {
      y: 40, ease: "none",
      scrollTrigger: { trigger: ".founders", start: "top bottom", end: "bottom top", scrub: true },
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

    /* Intro head reveal */
    gsap.from(".actives__intro > *", {
      opacity: 0, y: 30, duration: 1, ease: "power2.out", stagger: 0.1,
      scrollTrigger: { trigger: ".actives__intro", start: "top 80%" },
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

    /* Per-card entrance animations tied to the horizontal container */
    cards.forEach((card, i) => {
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
      const mol = card.querySelector(".active-card__mol svg");
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
      const inner = card.querySelectorAll(".active-card__tier, .active-card__name, .active-card__dose, .active-card__desc, .active-card__specs > div");
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

  /* ───── Ritual — pinned horizontal scroll ───── */
  if (window.ScrollTrigger) {
    const track = $("#ritualTrack");
    const isPhone = window.matchMedia("(max-width: 640px)").matches;
    if (track && !isPhone) {
      const totalScroll = () => track.scrollWidth - window.innerWidth + 80;
      gsap.to(track, {
        x: () => -totalScroll(),
        ease: "none",
        scrollTrigger: {
          trigger: ".ritual__pin",
          start: "top top",
          end: () => "+=" + totalScroll(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }
    gsap.from(".ritual__intro > *", {
      opacity: 0, y: 30, duration: 1, ease: "power2.out", stagger: 0.1,
      scrollTrigger: { trigger: ".ritual__intro", start: "top 75%" },
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
    gsap.from(".pillars__intro > *", {
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

  /* expose for tweaks */
  window.__chemistrie = { gsap, ScrollTrigger: window.ScrollTrigger, lenis };

})();

/* ───── Shopify cart bridge (added for theme conversion — reference has no cart wiring) ───── */
(function () {
  const bagCount = document.querySelector(".nav__bag-count");

  document.querySelectorAll(".product__cta[data-product-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-product-id");
      if (!id) return;
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Adding…";
      fetch(window.Shopify && Shopify.routes && Shopify.routes.root ? Shopify.routes.root + "cart/add.js" : "/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ items: [{ id: id, quantity: 1 }] }),
      })
        .then((res) => res.json())
        .then(() => fetch("/cart.js"))
        .then((res) => res.json())
        .then((cart) => {
          if (bagCount) bagCount.textContent = cart.item_count;
          btn.textContent = "Added ✓";
          setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
          }, 1400);
        })
        .catch(() => {
          btn.textContent = original;
          btn.disabled = false;
        });
    });
  });
})();
