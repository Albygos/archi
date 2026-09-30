(function () {
  "use strict";

  function fitExactDesign() {
    var mobile = document.querySelector(".responsive-mobile");
    var desktop = document.querySelector(".responsive-desktop");
    var isMobile = window.innerWidth <= 768;
    var wrapper = isMobile ? mobile : desktop;
    if (!wrapper) return;

    var baseWidth = isMobile ? 390 : 1920;
    var scale = Math.min(1, window.innerWidth / baseWidth);

    wrapper.style.transform = "scale(" + scale + ")";
    wrapper.style.width = baseWidth + "px";

    // Preserve the original design's proportions while making the
    // transformed layout occupy exactly its visual height.
    var root = isMobile
      ? wrapper.querySelector("#__x2d_body")
      : wrapper.querySelector("#__0");

    var baseHeight = root ? root.getBoundingClientRect().height / scale : wrapper.scrollHeight;
    wrapper.style.height = (baseHeight * scale) + "px";
    wrapper.style.marginBottom = "0";
  }

  function initVideoCarousels() {
    var wrappers = document.querySelectorAll(".video-marquee-wrapper");
    wrappers.forEach(function (wrapper) {
      var track = wrapper.querySelector(".video-marquee-track");
      if (!track || track._initialized) return;
      track._initialized = true;

      var firstTrack = track.querySelector(".video-track");
      if (!firstTrack) return;

      var currentX = 0;
      var speed = 40; // pixels per second auto-scroll
      var isPaused = false;
      var isDragging = false;
      var startX = 0;
      var startY = 0;
      var startCurrentX = 0;
      var isHorizontalDrag = null;
      var resumeTimer = null;
      var lastTime = null;

      function getScale() {
        var mobile = document.querySelector(".responsive-mobile");
        var desktop = document.querySelector(".responsive-desktop");
        var isMobile = window.innerWidth <= 768;
        var parent = isMobile ? mobile : desktop;
        if (!parent) return 1;
        var baseWidth = isMobile ? 390 : 1920;
        return Math.min(1, window.innerWidth / baseWidth) || 1;
      }

      function getHalfWidth() {
        return firstTrack.offsetWidth || 2244;
      }

      function wrapX(x, halfWidth) {
        if (halfWidth <= 0) return x;
        while (x <= -halfWidth) x += halfWidth;
        while (x > 0) x -= halfWidth;
        return x;
      }

      function step(timestamp) {
        if (!lastTime) lastTime = timestamp;
        var dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (dt > 0.1) dt = 0.1;

        var halfWidth = getHalfWidth();

        if (!isPaused && !isDragging) {
          currentX -= speed * dt;
          currentX = wrapX(currentX, halfWidth);
          track.style.transform = "translate3d(" + currentX + "px, 0, 0)";
        }

        requestAnimationFrame(step);
      }

      requestAnimationFrame(step);

      // Desktop Hover Pause
      wrapper.addEventListener("mouseenter", function () {
        isPaused = true;
      });

      wrapper.addEventListener("mouseleave", function () {
        if (!isDragging) {
          isPaused = false;
        }
      });

      // Pointer / Touch Drag Handler
      function onPointerDown(e) {
        if (e.button && e.button !== 0) return;
        isPaused = true;
        isDragging = true;
        isHorizontalDrag = null;
        startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        startCurrentX = currentX;
        wrapper.classList.add("is-dragging");
        if (resumeTimer) clearTimeout(resumeTimer);
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        var clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        var clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        var dx = clientX - startX;
        var dy = clientY - startY;

        if (isHorizontalDrag === null) {
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
            isHorizontalDrag = Math.abs(dx) >= Math.abs(dy);
          }
        }

        if (isHorizontalDrag === false) {
          isDragging = false;
          wrapper.classList.remove("is-dragging");
          return;
        }

        var scale = getScale();
        var halfWidth = getHalfWidth();
        currentX = startCurrentX + (dx / scale);
        currentX = wrapX(currentX, halfWidth);
        track.style.transform = "translate3d(" + currentX + "px, 0, 0)";

        if (e.cancelable && isHorizontalDrag === true) {
          e.preventDefault();
        }
      }

      function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        wrapper.classList.remove("is-dragging");

        if (resumeTimer) clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () {
          if (!wrapper.matches(":hover")) {
            isPaused = false;
          }
        }, 1200);
      }

      // Support Mouse & Touch events
      if (window.PointerEvent) {
        wrapper.addEventListener("pointerdown", onPointerDown, { passive: true });
        window.addEventListener("pointermove", onPointerMove, { passive: false });
        window.addEventListener("pointerup", onPointerUp, { passive: true });
        window.addEventListener("pointercancel", onPointerUp, { passive: true });
      } else {
        wrapper.addEventListener("mousedown", onPointerDown);
        window.addEventListener("mousemove", onPointerMove);
        window.addEventListener("mouseup", onPointerUp);

        wrapper.addEventListener("touchstart", onPointerDown, { passive: true });
        window.addEventListener("touchmove", onPointerMove, { passive: false });
        window.addEventListener("touchend", onPointerUp, { passive: true });
        window.addEventListener("touchcancel", onPointerUp, { passive: true });
      }
    });
  }

  window.addEventListener("resize", fitExactDesign, { passive: true });
  window.addEventListener("orientationchange", fitExactDesign, { passive: true });
  document.addEventListener("DOMContentLoaded", function () {
    fitExactDesign();
    initVideoCarousels();
  });
  window.addEventListener("load", function () {
    fitExactDesign();
    initVideoCarousels();
  });
  fitExactDesign();
  initVideoCarousels();
})();

