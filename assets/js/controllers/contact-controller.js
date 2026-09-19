/* ==========================================================================
   NEXUS VR — controllers/contact-controller.js   [PHỤ TRÁCH: Nguyễn Trường Vũ]
   HAUTE SPATIAL SHOWROOM & DUAL-FACED 3D VIP PASS CONTROLLER
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initHauteSpatialExperience);

  if (document.readyState === "interactive" || document.readyState === "complete") {
    initHauteSpatialExperience();
  }

  function initHauteSpatialExperience() {
    if (window.__hauteExperienceInitialized) return;
    window.__hauteExperienceInitialized = true;

    initAudioSynthesisEngine();
    initDualFacedVipPass();
    initSpatialAudioPreview();
    initPassExportSuite();
    initHeroPhotoTilt();
    initHudDualViewTabs();
    initKineticCausticsPhysics();
    initTimeSlotCapsules();
    initCustomServiceSelect();
    initCharacterCounter();
    initLiveShowroomClock();
    initFaqAccordion();
    handleUrlPreselection();
    setupConciergeFormValidation();
    initConciergeChannelsHub();
  }

  /* --------------------------------------------------------------------------
     1. WEB AUDIO API SOUND SYNTHESIS ENGINE (ZERO EXTERNAL ASSETS)
     -------------------------------------------------------------------------- */
  var audioCtx = null;

  function initAudioSynthesisEngine() {
    function getCtx() {
      if (!audioCtx) {
        var AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) audioCtx = new AudioClass();
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      return audioCtx;
    }

    // Tắt toàn bộ âm thanh của các nút bấm và thành phần khác (chỉ để lại âm thanh tấm thẻ VIP)
    window.playLuxuryClick = function () {
      // Intentionally empty no-op: Theo yêu cầu của người dùng, bỏ âm thanh của tất cả các nút
      // như khung giờ, dropdown, accordion, submit... CHỈ GIỮ LẠI âm thanh của tấm thẻ VIP.
    };

    // Âm thanh lật báo chân thực (Newspaper Page Turn / Paper Rustle)
    window.playCardFlipSound = function () {
      try {
        var ctx = getCtx();
        if (!ctx) return;

        var now = ctx.currentTime;
        var duration = 0.24;

        // 1. TẠO BUFFER NOISE MÔ PHỎNG ĐỘ MA SÁT CỦA SỢI GIẤY BÁO MỎNG
        var bufferSize = Math.floor(ctx.sampleRate * duration);
        var noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = noiseBuffer.getChannelData(0);

        var lastOut = 0.0;
        for (var i = 0; i < bufferSize; i++) {
          var white = Math.random() * 2 - 1;
          // Pink-filter 1 pole để tạo chất âm sột soạt ấm tự nhiên của giấy mỏng
          lastOut = (lastOut * 0.88) + (white * 0.12);
          data[i] = lastOut;
        }

        var noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // 2. BỘ LỌC BANDPASS QUÉT TẦN SỐ TRANG BÁO UỐN CONG VUNG TRONG GIÓ
        var bandpass = ctx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(2800, now);
        bandpass.frequency.exponentialRampToValueAtTime(1600, now + 0.05);
        bandpass.frequency.exponentialRampToValueAtTime(650, now + duration);
        bandpass.Q.setValueAtTime(2.0, now);

        // 3. BỘ LỌC HIGHPASS CẮT TẦN SỐ ĐỤC
        var highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.setValueAtTime(450, now);

        // 4. ĐƯỜNG CONG BIÊN ĐỘ MÔ PHỎNG 2 NHỊP XÀO XẠC ĐẶC TRƯNG CỦA BÁO GIẤY
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        // Nhịp 1: Gảy mép tờ báo
        gain.gain.linearRampToValueAtTime(0.24, now + 0.025);
        gain.gain.linearRampToValueAtTime(0.10, now + 0.055);
        // Nhịp 2: Cả trang báo vung lật qua
        gain.gain.linearRampToValueAtTime(0.28, now + 0.095);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noiseSource.connect(bandpass);
        bandpass.connect(highpass);
        highpass.connect(gain);
        gain.connect(ctx.destination);

        // 5. TIẾNG "PHẬP" ÊM NHẸ KHI TỜ BÁO ÁP VÀO TRANG ĐỐI DIỆN
        var flopOsc = ctx.createOscillator();
        var flopGain = ctx.createGain();
        flopOsc.type = "triangle";
        flopOsc.frequency.setValueAtTime(145, now + 0.04);
        flopOsc.frequency.exponentialRampToValueAtTime(60, now + 0.16);

        flopGain.gain.setValueAtTime(0.0001, now);
        flopGain.gain.setValueAtTime(0.06, now + 0.05);
        flopGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        flopOsc.connect(flopGain);
        flopGain.connect(ctx.destination);

        noiseSource.start(now);
        noiseSource.stop(now + duration);
        flopOsc.start(now + 0.04);
        flopOsc.stop(now + 0.16);
      } catch (e) {}
    };

    // Âm khắc laser siêu thanh
    window.playLaserTickSound = function () {
      try {
        var ctx = getCtx();
        if (!ctx) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(2400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.02);

        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.02);
      } catch (e) {}
    };

    // Âm màn trập cơ học quang học khi chụp ảnh xuất vé VIP
    window.playShutterAcoustics = function () {
      try {
        var ctx = getCtx();
        if (!ctx) return;
        var now = ctx.currentTime;

        // Transient 1: Mở màn trập
        var osc1 = ctx.createOscillator();
        var gain1 = ctx.createGain();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(3400, now);
        osc1.frequency.exponentialRampToValueAtTime(280, now + 0.025);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.025);

        // Body Resonance: Thân máy nhôm và kính
        var osc2 = ctx.createOscillator();
        var gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(420, now + 0.03);
        osc2.frequency.exponentialRampToValueAtTime(85, now + 0.14);
        gain2.gain.setValueAtTime(0.09, now + 0.03);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.03);
        osc2.stop(now + 0.14);
      } catch (e) {}
    };
  }

  /* --------------------------------------------------------------------------
     2. DUAL-FACED 3D FLIPPABLE VIP PASS & LIVE LASER ENGRAVER
     -------------------------------------------------------------------------- */
  function initDualFacedVipPass() {
    var passWrapper = document.getElementById("vip-pass-wrapper");
    var passCard = document.getElementById("vip-pass-card");
    var flipBtn = document.getElementById("btn-pass-flip");
    var flipLabel = document.getElementById("flip-btn-label");
    var nameInput = document.getElementById("contact-name");
    var passGuestName = document.getElementById("pass-guest-name");
    var passSigText = document.getElementById("pass-signature-text");
    var passLaserBeam = document.getElementById("pass-laser-beam");
    var passCode = document.getElementById("pass-code");
    var passQuantumHash = document.getElementById("pass-quantum-hash");

    if (!passCard) return;

    var isFlipped = false;
    var isFlippingAnim = false;
    var flipTimer = null;
    var typingTimer = null;

    var MAX_TILT = 11;
    var currentRotX = 0, currentRotY = 0;
    var targetRotX = 0, targetRotY = 0;
    var currentGlareX = 50, currentGlareY = 50;
    var targetGlareX = 50, targetGlareY = 50;
    var isTracking = false;
    var physicsRafId = null;

    // HÀM LẬT THẺ 180° TỨC THÌ KHI CLICK (XOAY LUÔN VÀ DUY TRÌ HIỆU ỨNG 3D CỰC MƯỢT)
    function toggleCardFlip() {
      if (isFlippingAnim) return;
      isFlippingAnim = true;

      isFlipped = !isFlipped;

      // Hủy theo dõi vật lý tạm thời trong quá trình lật
      isTracking = false;
      if (physicsRafId) {
        cancelAnimationFrame(physicsRafId);
        physicsRafId = null;
      }
      if (passWrapper) passWrapper.classList.remove("is-tracking");

      // Reset các góc xoay con trỏ về 0
      targetRotX = 0;
      targetRotY = 0;
      currentRotX = 0;
      currentRotY = 0;

      // Bật transition 0.8s và thực hiện xoay 180° ngay tức thì
      passCard.classList.add("is-flipping");
      passCard.classList.toggle("is-flipped", isFlipped);

      passCard.style.transition = "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
      passCard.style.transform = isFlipped ? "rotateY(180deg)" : "rotateY(0deg)";

      if (flipLabel) {
        flipLabel.textContent = isFlipped ? "XEM MẶT TRƯỚC" : "LẬT MẶT SAU";
      }

      if (typeof window.playCardFlipSound === "function") {
        window.playCardFlipSound();
      }

      clearTimeout(flipTimer);
      flipTimer = setTimeout(function () {
        passCard.classList.remove("is-flipping");
        isFlippingAnim = false;
      }, 820);
    }

    if (flipBtn) {
      flipBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleCardFlip();
      });
    }

    // Cho phép click trực tiếp vào thẻ để lật
    passCard.addEventListener("click", function (e) {
      if (e.target && e.target.closest("button, a, input, textarea")) return;
      toggleCardFlip();
    });

    // Khắc tên trực tiếp 2 mặt thẻ với âm thanh laser
    if (nameInput) {
      nameInput.addEventListener("input", function () {
        var val = nameInput.value.trim();

        if (typeof window.playLaserTickSound === "function") {
          window.playLaserTickSound();
        }

        if (passLaserBeam) {
          passLaserBeam.classList.add("is-typing");
          clearTimeout(typingTimer);
          typingTimer = setTimeout(function () {
            passLaserBeam.classList.remove("is-typing");
          }, 400);
        }

        if (val.length > 0) {
          if (passGuestName) passGuestName.textContent = val.toUpperCase();
          if (passSigText) passSigText.textContent = toTitleCase(val);

          var hash = 0;
          for (var i = 0; i < val.length; i++) {
            hash = (hash << 5) - hash + val.charCodeAt(i);
            hash |= 0;
          }
          var codeSuffix = Math.abs(hash % 9000 + 1000);
          var hexSuffix = Math.abs(hash).toString(16).toUpperCase().padStart(4, "0").slice(0, 4);

          if (passCode) passCode.textContent = "NX-8K-" + codeSuffix;
          if (passQuantumHash) passQuantumHash.textContent = "SHA-256: 8F4C-" + hexSuffix + "-992B-01FE";
        } else {
          if (passGuestName) passGuestName.textContent = "QUÝ KHÁCH";
          if (passSigText) passSigText.textContent = "Quý Khách";
          if (passCode) passCode.textContent = "NX-8K-9021";
          if (passQuantumHash) passQuantumHash.textContent = "SHA-256: 8F4C-A921-992B-01FE";
        }
      });
    }

    function toTitleCase(str) {
      return str.toLowerCase().replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
    }

    /* --------------------------------------------------------------------------
       ZERO-LATENCY 3D ROTATION PHYSICS ENGINE (TILT)
       -------------------------------------------------------------------------- */
    function applyCardTransform(rx, ry) {
      if (isFlippingAnim) return;

      if (isFlipped) {
        passCard.style.transform = 
          "rotateY(180deg) " +
          "rotateX(" + rx.toFixed(2) + "deg) " +
          "rotateY(" + (-ry).toFixed(2) + "deg) " +
          "translateY(-4px) scale3d(1.025, 1.025, 1.025)";
      } else {
        passCard.style.transform = 
          "rotateX(" + rx.toFixed(2) + "deg) " +
          "rotateY(" + ry.toFixed(2) + "deg) " +
          "translateY(-4px) scale3d(1.025, 1.025, 1.025)";
      }
    }

    function renderPhysicsFrame() {
      if (isFlippingAnim) {
        physicsRafId = null;
        return;
      }

      currentRotX += (targetRotX - currentRotX) * 0.28;
      currentRotY += (targetRotY - currentRotY) * 0.28;
      currentGlareX += (targetGlareX - currentGlareX) * 0.28;
      currentGlareY += (targetGlareY - currentGlareY) * 0.28;

      applyCardTransform(currentRotX, currentRotY);

      passCard.style.setProperty("--pass-x", currentGlareX.toFixed(1) + "%");
      passCard.style.setProperty("--pass-y", currentGlareY.toFixed(1) + "%");

      if (!isTracking && Math.abs(targetRotX - currentRotX) < 0.04 && Math.abs(targetRotY - currentRotY) < 0.04) {
        currentRotX = targetRotX;
        currentRotY = targetRotY;
        applyCardTransform(currentRotX, currentRotY);
        physicsRafId = null;
        if (passWrapper) passWrapper.classList.remove("is-tracking");
        return;
      }

      physicsRafId = requestAnimationFrame(renderPhysicsFrame);
    }

    function startPhysicsLoop() {
      if (isFlippingAnim) return;
      if (!physicsRafId) {
        physicsRafId = requestAnimationFrame(renderPhysicsFrame);
      }
    }

    var trackTarget = passWrapper || passCard;

    trackTarget.addEventListener("mouseenter", function () {
      if (isFlippingAnim) return;
      isTracking = true;
      if (passWrapper) passWrapper.classList.add("is-tracking");
      startPhysicsLoop();
    });

    trackTarget.addEventListener("mousemove", function (e) {
      if (isFlippingAnim) return;
      isTracking = true;
      if (passWrapper) passWrapper.classList.add("is-tracking");

      var rect = trackTarget.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      var normX = (x / rect.width) * 2 - 1;
      var normY = (y / rect.height) * 2 - 1;

      targetRotY = normX * MAX_TILT;
      targetRotX = -normY * MAX_TILT;

      targetGlareX = (x / rect.width) * 100;
      targetGlareY = (y / rect.height) * 100;

      startPhysicsLoop();
    });

    trackTarget.addEventListener("mouseleave", function () {
      if (isFlippingAnim) return;
      isTracking = false;
      targetRotX = 0;
      targetRotY = 0;
      targetGlareX = 50;
      targetGlareY = 50;

      passCard.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      passCard.style.transform = isFlipped ? "rotateY(180deg)" : "rotateY(0deg)";

      if (passWrapper) passWrapper.classList.remove("is-tracking");
      if (physicsRafId) {
        cancelAnimationFrame(physicsRafId);
        physicsRafId = null;
      }
    });

    // CẢM BIẾN GYROSCOPE CHO THIẾT BỊ DI ĐỘNG (SMARTPHONE TILT 3D)
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", function (e) {
        if (isTracking || isFlippingAnim) return;
        if (e.gamma === null || e.beta === null) return;

        var rect = passCard.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;

        var clampedGamma = Math.min(Math.max(e.gamma, -25), 25) / 25;
        var clampedBeta = Math.min(Math.max(e.beta - 45, -25), 25) / 25;

        targetRotY = clampedGamma * MAX_TILT;
        targetRotX = -clampedBeta * MAX_TILT;
        targetGlareX = 50 + clampedGamma * 35;
        targetGlareY = 50 + clampedBeta * 35;

        startPhysicsLoop();
      }, { passive: true });
    }

    // TOUCH PAN VÀ DOUBLE TAP TRÊN MOBILE
    var touchStartX = 0, touchStartY = 0;
    var lastTouchTap = 0;

    passCard.addEventListener("touchstart", function (e) {
      if (e.touches.length === 1) {
        var now = Date.now();
        if (now - lastTouchTap < 300) {
          toggleCardFlip();
          lastTouchTap = 0;
          return;
        }
        lastTouchTap = now;

        if (isFlippingAnim) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTracking = true;
        if (passWrapper) passWrapper.classList.add("is-tracking");
        startPhysicsLoop();
      }
    }, { passive: true });

    passCard.addEventListener("touchmove", function (e) {
      if (isFlippingAnim) return;
      if (e.touches.length === 1) {
        var rect = passCard.getBoundingClientRect();
        var touchX = e.touches[0].clientX;
        var touchY = e.touches[0].clientY;

        var dx = touchX - touchStartX;
        var dy = touchY - touchStartY;

        var normX = Math.min(Math.max(dx / (rect.width * 0.5), -1), 1);
        var normY = Math.min(Math.max(dy / (rect.height * 0.5), -1), 1);

        targetRotY = normX * MAX_TILT;
        targetRotX = -normY * MAX_TILT;
        targetGlareX = 50 + normX * 35;
        targetGlareY = 50 + normY * 35;

        startPhysicsLoop();
      }
    }, { passive: true });

    passCard.addEventListener("touchend", function () {
      if (isFlippingAnim) return;
      isTracking = false;
      targetRotX = 0;
      targetRotY = 0;
      targetGlareX = 50;
      targetGlareY = 50;

      passCard.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      passCard.style.transform = isFlipped ? "rotateY(180deg)" : "rotateY(0deg)";
      if (passWrapper) passWrapper.classList.remove("is-tracking");
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     2.1 NATIVE WEB AUDIO API SPATIAL AUDIO 360° PREVIEW SYNTHESIZER
     -------------------------------------------------------------------------- */
  var spatialAudioState = {
    isPlaying: false,
    ctx: null,
    droneOsc: null,
    binOsc1: null,
    binOsc2: null,
    pannerNode: null,
    masterGain: null,
    lfoOsc: null
  };

  function initSpatialAudioPreview() {
    var btn = document.getElementById("btn-audio-preview");
    if (!btn) return;

    btn.addEventListener("click", function () {
      if (typeof window.playLuxuryClick === "function") window.playLuxuryClick(1350);

      if (spatialAudioState.isPlaying) {
        stopSpatialAudio();
      } else {
        startSpatialAudio();
      }
    });

    function startSpatialAudio() {
      try {
        var AudioClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioClass) return;
        if (!spatialAudioState.ctx) spatialAudioState.ctx = new AudioClass();
        var ctx = spatialAudioState.ctx;
        if (ctx.state === "suspended") ctx.resume();

        var now = ctx.currentTime;

        // Master Gain với Fade-in 0.8s
        var master = ctx.createGain();
        master.gain.setValueAtTime(0.001, now);
        master.gain.exponentialRampToValueAtTime(0.08, now + 0.8);
        master.connect(ctx.destination);
        spatialAudioState.masterGain = master;

        // Drone âm trầm 55Hz (Nốt A1) ấm áp tạo cảm giác không gian phòng lounge cách âm
        var drone = ctx.createOscillator();
        var droneGain = ctx.createGain();
        drone.type = "sine";
        drone.frequency.setValueAtTime(55, now);
        droneGain.gain.setValueAtTime(0.6, now);
        drone.connect(droneGain);
        droneGain.connect(master);
        drone.start(now);
        spatialAudioState.droneOsc = drone;

        // Binaural Beat: 2 tần số lệch nhau 4Hz (432Hz & 436Hz)
        var bin1 = ctx.createOscillator();
        var bin2 = ctx.createOscillator();
        bin1.type = "sine";
        bin2.type = "sine";
        bin1.frequency.setValueAtTime(432, now);
        bin2.frequency.setValueAtTime(436, now);

        if (ctx.createStereoPanner) {
          var panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(0, now);

          var lfo = ctx.createOscillator();
          var lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.15, now);
          lfoGain.gain.setValueAtTime(0.7, now);
          lfo.connect(panner.pan);
          lfo.start(now);
          spatialAudioState.lfoOsc = lfo;

          bin1.connect(panner);
          bin2.connect(panner);
          panner.connect(master);
          spatialAudioState.pannerNode = panner;
        } else {
          bin1.connect(master);
          bin2.connect(master);
        }

        bin1.start(now);
        bin2.start(now);
        spatialAudioState.binOsc1 = bin1;
        spatialAudioState.binOsc2 = bin2;

        spatialAudioState.isPlaying = true;
        btn.classList.add("is-playing");
        var btnText = btn.querySelector(".audio-btn-text");
        if (btnText) btnText.textContent = "Đang phát 360° (Bấm dừng)";

        setTimeout(function () {
          if (spatialAudioState.isPlaying) stopSpatialAudio();
        }, 35000);
      } catch (err) {
        console.warn("[SpatialAudio] Error:", err);
      }
    }

    function stopSpatialAudio() {
      try {
        var ctx = spatialAudioState.ctx;
        if (ctx && spatialAudioState.masterGain) {
          var now = ctx.currentTime;
          spatialAudioState.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
          setTimeout(function () {
            if (spatialAudioState.droneOsc) { spatialAudioState.droneOsc.stop(); spatialAudioState.droneOsc.disconnect(); }
            if (spatialAudioState.binOsc1) { spatialAudioState.binOsc1.stop(); spatialAudioState.binOsc1.disconnect(); }
            if (spatialAudioState.binOsc2) { spatialAudioState.binOsc2.stop(); spatialAudioState.binOsc2.disconnect(); }
            if (spatialAudioState.lfoOsc) { spatialAudioState.lfoOsc.stop(); spatialAudioState.lfoOsc.disconnect(); }
          }, 550);
        }
      } catch (e) {}

      spatialAudioState.isPlaying = false;
      btn.classList.remove("is-playing");
      var btnText = btn.querySelector(".audio-btn-text");
      if (btnText) btnText.textContent = "Nghe thử Spatial Audio";
    }
  }

  /* --------------------------------------------------------------------------
     2.2 VIP PASS DIGITAL EXPORT SUITE (CAMERA FLASH, SHUTTER & VOUCHER MODAL)
     -------------------------------------------------------------------------- */
  function initPassExportSuite() {
    var exportBtn = document.getElementById("btn-export-pass");
    var flashOverlay = document.getElementById("camera-flash-overlay");
    var modal = document.getElementById("vip-export-modal");
    var modalClose = document.getElementById("vip-modal-close");
    var modalBackdrop = document.getElementById("vip-modal-backdrop");
    var modalCode = document.getElementById("modal-ticket-code");
    var modalName = document.getElementById("modal-ticket-name");
    var modalTime = document.getElementById("modal-ticket-time");
    var modalDownload = document.getElementById("btn-modal-download");
    var modalCopy = document.getElementById("btn-modal-copy");
    var modalCopyText = document.getElementById("modal-copy-text");

    if (!exportBtn) return;

    function getPassData() {
      var guestName = (document.getElementById("pass-guest-name") || {}).textContent || "QUÝ KHÁCH";
      var code = (document.getElementById("pass-code") || {}).textContent || "NX-8K-9021";
      var time = (document.getElementById("pass-time-slot") || {}).textContent || "09:00 — 12:00";
      var service = (document.getElementById("pass-service-label") || {}).textContent || "Trải nghiệm kính NEXUS Vision Pro 8K";
      var hash = (document.getElementById("pass-quantum-hash") || {}).textContent || "SHA-256: 8F4C-A921-992B-01FE";
      return {
        guestName: guestName,
        code: code,
        time: time,
        service: service,
        hash: hash
      };
    }

    function generatePassVoucherText(data) {
      return [
        "╔═════════════════════════════════════════════════════════════════════════════╗",
        "║                     NEXUS VR FLAGSHIP SHOWROOM                              ║",
        "║               DIGITAL CONCIERGE ACCESS CREDENTIAL                           ║",
        "╚═════════════════════════════════════════════════════════════════════════════╝",
        "",
        "  MÃ TIẾP ĐÓN (PASS NO) : " + data.code,
        "  VỊ KHÁCH (GUEST)      : " + data.guestName,
        "  KHUNG GIỜ HẸN (TIME)  : " + data.time,
        "  TRẢI NGHIỆM ĐĂNG KÝ   : " + data.service,
        "  ĐỊA ĐIỂM TIẾP ĐÓN     : Tầng 38, NEXUS Tower, Phố đi bộ Nguyễn Huệ, Q.1",
        "  ĐẶC QUYỀN VIP         : 45 phút Lounge riêng tư + Cân chỉnh IPD cá nhân",
        "  QUANTUM HASH          : " + data.hash,
        "  HOTLINE CONCIERGE     : 0889 378 929 (Dịch vụ hỗ trợ 24/7)",
        "",
        "─────────────────────────────────────────────────────────────────────────────",
        "  Vui lòng xuất trình tệp vé này tại quầy lễ tân VIP Lounge Tầng 38.",
        "  Trân trọng chào đón quý khách đến với không gian trải nghiệm quang học 8K.",
        "═════════════════════════════════════════════════════════════════════════════"
      ].join("\r\n");
    }

    function triggerFileDownload(filename, content) {
      var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }

    function handleExport() {
      var data = getPassData();

      // 1. Chạy âm thanh màn trập cơ học
      if (typeof window.playShutterAcoustics === "function") {
        window.playShutterAcoustics();
      }

      // 2. Chớp flash quang học
      if (flashOverlay) {
        flashOverlay.classList.remove("is-flashing");
        void flashOverlay.offsetWidth;
        flashOverlay.classList.add("is-flashing");
      }

      // 3. Tự động tải file vé (.PASS)
      var textContent = generatePassVoucherText(data);
      triggerFileDownload("NEXUS-VIP-PASS-" + data.code + ".pass", textContent);

      // 4. Cập nhật và mở modal thông báo
      if (modalCode) modalCode.textContent = data.code;
      if (modalName) modalName.textContent = data.guestName;
      if (modalTime) modalTime.textContent = data.time;

      if (modal) {
        setTimeout(function () {
          modal.classList.add("is-open");
          modal.setAttribute("aria-hidden", "false");
        }, 350);
      }
    }

    exportBtn.addEventListener("click", handleExport);

    function closeModal() {
      if (modal) {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
      }
    }

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

    if (modalDownload) {
      modalDownload.addEventListener("click", function () {
        var data = getPassData();
        var textContent = generatePassVoucherText(data);
        triggerFileDownload("NEXUS-VIP-PASS-" + data.code + ".pass", textContent);
      });
    }

    if (modalCopy && modalCode) {
      modalCopy.addEventListener("click", function () {
        var code = modalCode.textContent.trim();
        navigator.clipboard.writeText(code).then(function () {
          if (modalCopyText) modalCopyText.textContent = "Đã Sao Chép!";
          if (typeof window.playLuxuryClick === "function") window.playLuxuryClick(1600);
          setTimeout(function () {
            if (modalCopyText) modalCopyText.textContent = "Sao Chép Mã Vé";
          }, 2000);
        }).catch(function () {
          alert("Mã vé: " + code);
        });
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. HERO PHOTO MONOLITH 3D PARALLAX TILT & SPECULAR GLARE
     -------------------------------------------------------------------------- */
  function initHeroPhotoTilt() {
    var monolith = document.getElementById("hero-photo-card");
    var halo = document.getElementById("hero-optical-halo");
    if (!monolith) return;

    var MAX_HERO_TILT = 5;

    monolith.addEventListener("mousemove", function (e) {
      var rect = monolith.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      var normX = (x / rect.width) * 2 - 1;
      var normY = (y / rect.height) * 2 - 1;

      var rY = normX * MAX_HERO_TILT;
      var rX = -normY * MAX_HERO_TILT;

      monolith.style.transform = 
        "rotateX(" + rX.toFixed(2) + "deg) " +
        "rotateY(" + rY.toFixed(2) + "deg) " +
        "scale3d(1.02, 1.02, 1.02)";

      if (halo) {
        halo.style.transform = 
          "rotateX(" + (rX * 0.7).toFixed(2) + "deg) " +
          "rotateY(" + (rY * 0.7).toFixed(2) + "deg) " +
          "scale3d(1.04, 1.04, 1.04)";
      }

      monolith.style.setProperty("--mouse-x", x + "px");
      monolith.style.setProperty("--mouse-y", y + "px");
    });

    monolith.addEventListener("mouseleave", function () {
      monolith.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      if (halo) halo.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  }

  /* --------------------------------------------------------------------------
     4. HUD DUAL-VIEW TABS (BẢN ĐỒ VỆ TINH & KHÔNG GIAN SHOWROOM 360°)
     -------------------------------------------------------------------------- */
  function initHudDualViewTabs() {
    var tabMap = document.getElementById("tab-map-view");
    var tabLounge = document.getElementById("tab-lounge-view");
    var panelMap = document.getElementById("panel-map-view");
    var panelLounge = document.getElementById("panel-lounge-view");

    if (!tabMap || !tabLounge || !panelMap || !panelLounge) return;

    function switchTab(target) {
      if (typeof window.playLuxuryClick === "function") window.playLuxuryClick(1250);

      if (target === "map") {
        tabMap.classList.add("is-active");
        tabMap.setAttribute("aria-selected", "true");
        tabLounge.classList.remove("is-active");
        tabLounge.setAttribute("aria-selected", "false");

        panelMap.classList.add("is-active");
        panelLounge.classList.remove("is-active");
      } else {
        tabLounge.classList.add("is-active");
        tabLounge.setAttribute("aria-selected", "true");
        tabMap.classList.remove("is-active");
        tabMap.setAttribute("aria-selected", "false");

        panelLounge.classList.add("is-active");
        panelMap.classList.remove("is-active");
      }
    }

    tabMap.addEventListener("click", function () { switchTab("map"); });
    tabLounge.addEventListener("click", function () { switchTab("lounge"); });

    // Tương tác Hotspot 360 Showroom trên cả Desktop và Touch Mobile
    var hotspots = document.querySelectorAll(".lounge-hotspot");
    hotspots.forEach(function (hs) {
      hs.addEventListener("click", function (e) {
        e.stopPropagation();
        if (typeof window.playLuxuryClick === "function") window.playLuxuryClick(1500);

        var wasOpen = hs.classList.contains("is-open");
        hotspots.forEach(function (h) { h.classList.remove("is-open"); });
        if (!wasOpen) hs.classList.add("is-open");
      });
    });

    document.addEventListener("click", function () {
      hotspots.forEach(function (h) { h.classList.remove("is-open"); });
    });
  }

  /* --------------------------------------------------------------------------
     4.2 LUXURY CONCIERGE CHANNELS HUB (HOTLINE, SECURE EMAIL, FLAGSHIP LOCATION)
     -------------------------------------------------------------------------- */
  function initConciergeChannelsHub() {
    var copyButtons = document.querySelectorAll(".channel-btn--copy[data-copy-target]");
    copyButtons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var targetSelector = btn.getAttribute("data-copy-target");
        var targetEl = document.querySelector(targetSelector);
        if (!targetEl) return;

        var textToCopy = targetEl.textContent.trim();
        if (!textToCopy) return;

        if (typeof window.playLuxuryClick === "function") {
          window.playLuxuryClick(1400);
        }

        var copySpan = btn.querySelector(".copy-text");
        var originalText = copySpan ? copySpan.textContent : "Sao chép";

        function setSuccess() {
          btn.classList.add("is-copied");
          if (copySpan) copySpan.textContent = "✓ Đã chép!";
          setTimeout(function () {
            btn.classList.remove("is-copied");
            if (copySpan) copySpan.textContent = originalText;
          }, 2200);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(setSuccess).catch(function () {
            setSuccess();
          });
        } else {
          var ta = document.createElement("textarea");
          ta.value = textToCopy;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            setSuccess();
          } catch (err) {}
          document.body.removeChild(ta);
        }
      });
    });

    var mapScrollBtn = document.getElementById("btn-scroll-to-map");
    if (mapScrollBtn) {
      mapScrollBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (typeof window.playLuxuryClick === "function") {
          window.playLuxuryClick(1250);
        }

        var tabMap = document.getElementById("tab-map-view");
        if (tabMap && !tabMap.classList.contains("is-active")) {
          tabMap.click();
        }

        var targetSection = document.getElementById("showroom-map");
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    var primaryBtns = document.querySelectorAll(".concierge-channels-hub .channel-btn--primary:not(#btn-scroll-to-map)");
    primaryBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (typeof window.playLuxuryClick === "function") {
          window.playLuxuryClick(1300);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. KINETIC CAUSTICS MOUSE DRIFT (LERP 0.05, DAMPED ±25PX)
     -------------------------------------------------------------------------- */
  function initKineticCausticsPhysics() {
    var canvas = document.getElementById("caustic-canvas");
    if (!canvas) return;

    var targetX = 0, targetY = 0;
    var currentX = 0, currentY = 0;
    var rafId = null;

    window.addEventListener("mousemove", function (e) {
      var normX = (e.clientX / window.innerWidth) - 0.5;
      var normY = (e.clientY / window.innerHeight) - 0.5;

      targetX = -normX * 50;
      targetY = -normY * 50;

      if (!rafId) rafId = requestAnimationFrame(renderCausticLoop);
    }, { passive: true });

    function renderCausticLoop() {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      canvas.style.setProperty("--caustic-drift-x", currentX.toFixed(2) + "px");
      canvas.style.setProperty("--caustic-drift-y", currentY.toFixed(2) + "px");

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(renderCausticLoop);
      } else {
        rafId = null;
      }
    }
  }

  /* --------------------------------------------------------------------------
     6. TIME SLOT CAPSULES (TACTILE SOUND & LIVE PASS SYNC)
     -------------------------------------------------------------------------- */
  function initTimeSlotCapsules() {
    var container = document.getElementById("time-slot-capsules");
    var hiddenInput = document.getElementById("contact-time-slot");
    var passTimeSlot = document.getElementById("pass-time-slot");
    if (!container || !hiddenInput) return;

    var capsules = container.querySelectorAll(".c-capsule-btn");

    var timeLabelMap = {
      morning: "09:00 — 12:00",
      afternoon: "14:00 — 17:00",
      evening: "18:00 — 21:00"
    };

    capsules.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slot = btn.getAttribute("data-slot");
        if (!slot) return;

        capsules.forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-checked", "false");
        });

        btn.classList.add("is-active");
        btn.setAttribute("aria-checked", "true");
        hiddenInput.value = slot;

        if (passTimeSlot && timeLabelMap[slot]) {
          passTimeSlot.textContent = timeLabelMap[slot];
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. CUSTOM SERVICE SELECT & LIVE PASS SYNC
     -------------------------------------------------------------------------- */
  function initCustomServiceSelect() {
    var selectWrap = document.getElementById("custom-service-select");
    var nativeSelect = document.getElementById("contact-service");
    var triggerBtn = document.getElementById("custom-service-trigger");
    var triggerText = document.getElementById("custom-service-text");
    var triggerIcon = document.getElementById("custom-service-icon");
    var menu = document.getElementById("custom-service-menu");
    var passServiceLabel = document.getElementById("pass-service-label");

    if (!selectWrap || !nativeSelect || !triggerBtn || !menu) return;

    var options = Array.from(menu.querySelectorAll(".c-select-option"));

    function openMenu() {
      if (typeof window.playLuxuryClick === "function") window.playLuxuryClick(950);
      selectWrap.classList.add("is-open");
      triggerBtn.setAttribute("aria-expanded", "true");
      var current = menu.querySelector(".is-selected") || options[0];
      if (current) current.focus();
    }

    function closeMenu() {
      selectWrap.classList.remove("is-open");
      triggerBtn.setAttribute("aria-expanded", "false");
    }

    function selectItem(optEl) {
      if (typeof window.playLuxuryClick === "function") window.playLuxuryClick(1400);

      var val = optEl.getAttribute("data-value");
      var icon = optEl.getAttribute("data-icon") || "";
      var titleEl = optEl.querySelector(".opt-title");
      var text = titleEl ? titleEl.textContent.trim() : "";

      options.forEach(function (o) {
        o.classList.remove("is-selected");
        o.setAttribute("aria-selected", "false");
      });

      optEl.classList.add("is-selected");
      optEl.setAttribute("aria-selected", "true");

      if (triggerText) triggerText.textContent = text;
      if (triggerIcon) triggerIcon.textContent = icon;
      if (passServiceLabel) passServiceLabel.textContent = text;

      nativeSelect.value = val;
      nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));

      closeMenu();
      triggerBtn.focus();
    }

    triggerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      selectWrap.classList.contains("is-open") ? closeMenu() : openMenu();
    });

    options.forEach(function (opt) {
      opt.addEventListener("click", function (e) {
        e.stopPropagation();
        selectItem(opt);
      });
      opt.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectItem(opt);
        }
      });
    });

    document.addEventListener("click", function (e) {
      if (!selectWrap.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && selectWrap.classList.contains("is-open")) {
        closeMenu();
        triggerBtn.focus();
      }
    });
  }

  /* --------------------------------------------------------------------------
     8. CHARACTER COUNTER (0 / 500)
     -------------------------------------------------------------------------- */
  function initCharacterCounter() {
    var textarea = document.getElementById("contact-message");
    var counter = document.getElementById("message-char-count");
    if (!textarea || !counter) return;

    function update() {
      var count = textarea.value.length;
      counter.textContent = count + " / 500";
      if (count >= 480) {
        counter.style.color = "#EF4444";
      } else if (count >= 400) {
        counter.style.color = "var(--accent-gold)";
      } else {
        counter.style.color = "var(--text-dim)";
      }
    }

    textarea.addEventListener("input", update);
    update();
  }

  /* --------------------------------------------------------------------------
     9. LIVE SHOWROOM GMT+7 CLOCK
     -------------------------------------------------------------------------- */
  function initLiveShowroomClock() {
    var clockEl = document.getElementById("hud-live-clock");
    if (!clockEl) return;

    function tick() {
      var now = new Date();
      var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      var vnTime = new Date(utc + (3600000 * 7));

      var hours = String(vnTime.getHours()).padStart(2, "0");
      var minutes = String(vnTime.getMinutes()).padStart(2, "0");
      var seconds = String(vnTime.getSeconds()).padStart(2, "0");

      clockEl.textContent = hours + ":" + minutes + ":" + seconds + " ICT";
    }

    setInterval(tick, 1000);
    tick();
  }

  /* --------------------------------------------------------------------------
     10. EDITORIAL FAQ ACCORDION ENGINE
     -------------------------------------------------------------------------- */
  function initFaqAccordion() {
    var accordionEl = document.getElementById("contact-faq-accordion");
    if (!accordionEl) return;

    if (typeof window.initAccordion === "function") {
      window.initAccordion(accordionEl, {
        allowMultiple: false,
        speed: 380,
        activeClass: "is-active"
      });
      return;
    }

    var items = accordionEl.querySelectorAll(".accordion-item");
    items.forEach(function (item) {
      var trigger = item.querySelector(".accordion-trigger");
      var content = item.querySelector(".accordion-content");
      if (!trigger || !content) return;

      trigger.addEventListener("click", function () {
        if (typeof window.playLuxuryClick === "function") window.playLuxuryClick(1050);
        var isActive = item.classList.contains("is-active");

        items.forEach(function (other) {
          other.classList.remove("is-active");
          var c = other.querySelector(".accordion-content");
          if (c) c.style.maxHeight = "0";
        });

        if (!isActive) {
          item.classList.add("is-active");
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     11. URL PARAMETERS PRE-SELECTION
     -------------------------------------------------------------------------- */
  function handleUrlPreselection() {
    try {
      var params = new URLSearchParams(window.location.search);
      var serviceParam = params.get("service") || params.get("product");
      if (!serviceParam) return;

      var menu = document.getElementById("custom-service-menu");
      if (!menu) return;

      var target = menu.querySelector('.c-select-option[data-value="' + serviceParam + '"]');
      if (!target && (serviceParam.indexOf("vision") > -1 || serviceParam.indexOf("pro") > -1)) {
        target = menu.querySelector('.c-select-option[data-value="showroom-test"]');
      }

      if (target) target.click();
    } catch (err) {
      console.warn("[ContactController] URL parameter error:", err);
    }
  }

  /* --------------------------------------------------------------------------
     12. VALIDATOR ENGINE & CONCIERGE VIP RESERVATION
     -------------------------------------------------------------------------- */
  function setupConciergeFormValidation() {
    var form = document.getElementById("contact-form");
    var submitBtn = document.getElementById("contact-submit-btn");
    if (!form || !submitBtn) return;

    var fields = {
      name: {
        el: document.getElementById("contact-name"),
        errorEl: document.getElementById("name-error"),
        validate: function (v) {
          if (!v.trim()) return "Vui lòng nhập họ và tên của quý khách.";
          if (typeof window.Validator !== "undefined" && typeof window.Validator.isValidName === "function") {
            if (!window.Validator.isValidName(v)) return "Họ tên cần có ít nhất 2 từ, chỉ chứa chữ cái hợp lệ.";
          } else if (v.trim().split(/\s+/).length < 2) {
            return "Vui lòng nhập đầy đủ họ và tên (ít nhất 2 từ).";
          }
          return null;
        }
      },
      email: {
        el: document.getElementById("contact-email"),
        errorEl: document.getElementById("email-error"),
        validate: function (v) {
          if (!v.trim()) return "Vui lòng nhập địa chỉ email.";
          if (typeof window.Validator !== "undefined" && typeof window.Validator.isValidEmail === "function") {
            if (!window.Validator.isValidEmail(v)) return "Địa chỉ email không đúng định dạng chuẩn.";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
            return "Địa chỉ email không đúng định dạng.";
          }
          return null;
        }
      },
      phone: {
        el: document.getElementById("contact-phone"),
        errorEl: document.getElementById("phone-error"),
        validate: function (v) {
          if (!v.trim()) return "Vui lòng cung cấp số điện thoại liên hệ.";
          if (typeof window.Validator !== "undefined" && typeof window.Validator.isValidPhoneVN === "function") {
            if (!window.Validator.isValidPhoneVN(v)) return "Số điện thoại cần là số di động Việt Nam hợp lệ (10 chữ số).";
          } else if (!/^(0|\+84)[0-9]{9}$/.test(v.replace(/\s+/g, ""))) {
            return "Số điện thoại không hợp lệ (cần 10 chữ số).";
          }
          return null;
        }
      },
      message: {
        el: document.getElementById("contact-message"),
        errorEl: document.getElementById("message-error"),
        validate: function (v) {
          if (!v.trim()) return "Vui lòng chia sẻ lời nhắn hoặc nhu cầu trải nghiệm.";
          if (v.trim().length < 8) return "Lời nhắn cần ít nhất 8 ký tự để Concierge chuẩn bị chu đáo.";
          return null;
        }
      }
    };

    function validateField(name) {
      var field = fields[name];
      if (!field || !field.el) return true;
      var error = field.validate(field.el.value);
      if (field.errorEl) {
        field.errorEl.textContent = error || "";
      }
      return !error;
    }

    Object.keys(fields).forEach(function (name) {
      var field = fields[name];
      if (!field || !field.el) return;
      field.el.addEventListener("blur", function () {
        validateField(name);
      });
      field.el.addEventListener("input", function () {
        if (field.errorEl && field.errorEl.textContent) {
          validateField(name);
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (typeof window.playLuxuryClick === "function") window.playLuxuryClick(1500);

      var isValid = true;
      var firstInvalidField = null;

      Object.keys(fields).forEach(function (name) {
        var passed = validateField(name);
        if (!passed) {
          isValid = false;
          if (!firstInvalidField) firstInvalidField = fields[name].el;
        }
      });

      if (!isValid) {
        if (firstInvalidField) firstInvalidField.focus();
        showNotification("Vui lòng kiểm tra lại các trường thông tin được đánh dấu.", "warning");
        return;
      }

      var originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn-confirm-text">ĐANG XÁC THỰC THẺ TIẾP ĐÓN VIP...</span>';

      var formData = {
        name: fields.name.el.value.trim(),
        email: fields.email.el.value.trim(),
        phone: fields.phone.el.value.trim(),
        service: (document.getElementById("contact-service") || {}).value || "showroom-test",
        time_slot: (document.getElementById("contact-time-slot") || {}).value || "morning",
        message: fields.message.el.value.trim(),
        timestamp: new Date().toISOString()
      };

      setTimeout(function () {
        try {
          var saved = JSON.parse(localStorage.getItem("nexus_appointments") || "[]");
          saved.unshift(formData);
          localStorage.setItem("nexus_appointments", JSON.stringify(saved.slice(0, 50)));
        } catch (err) {
          console.warn("[Contact] LocalStorage error:", err);
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        form.reset();

        var counter = document.getElementById("message-char-count");
        if (counter) counter.textContent = "0 / 500";

        var defaultCapsule = document.querySelector('.c-capsule-btn[data-slot="morning"]');
        if (defaultCapsule) defaultCapsule.click();

        showNotification(
          "Thẻ Tiếp Đón VIP của quý khách đã được kích hoạt thành công! Concierge riêng sẽ gọi điện xác nhận trong vòng 15 phút.",
          "success"
        );
      }, 950);
    });
  }

  function showNotification(msg, type) {
    if (typeof window.showToast === "function") {
      window.showToast(msg, type);
    } else {
      alert(msg);
    }
  }

})();
