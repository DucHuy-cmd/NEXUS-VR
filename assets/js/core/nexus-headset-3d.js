/**
 * NEXUS VR — assets/js/core/nexus-headset-3d.js
 * Bộ Dựng Model 3D Kính VR Hoàn Chỉnh Siêu Chi Tiết Chuẩn Ảnh Thật (hero-vr-headset-xam.webp)
 * Khóa 3 Góc Máy Điện Ảnh Cố Định Cho 3 Ô Tính Năng Nổi Bật:
 * - Ô 1 (8K Màn hình): Cận cảnh trực diện Mặt kính cong Obsidian, rãnh quang học & vành vải dệt
 * - Ô 2 (120Hz Tần số quét): Macro sườn Khóa kim loại mạ Chrome gương & Quai đeo vải dệt
 * - Ô 3 (130° Trường nhìn): Macro khoang nội thất Cặp thấu kính Pancake kép & Vòm cong 130°
 */

(function (global) {
  "use strict";

  if (typeof THREE === "undefined") {
    console.warn("[NexusHeadset3D] Three.js chưa được tải.");
    return;
  }

  // 1. TẠO TEXTURE VẢI DỆT VI SỢI ĐỘ PHÂN GIẢI CAO (HIGH-RES PROCEDURAL TWILL WEAVE)
  function createDetailedWovenTexture(baseColor, threadColor, darkShade) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Nền vải cơ sở
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Vân dệt chéo Herringbone / Twill weave
    ctx.fillStyle = threadColor;
    const step = 6;
    for (let y = 0; y < 512; y += step) {
      for (let x = 0; x < 512; x += step) {
        const pattern = (Math.floor(x / step) + Math.floor(y / step)) % 3;
        if (pattern === 0) {
          ctx.fillStyle = threadColor;
          ctx.fillRect(x, y, step * 0.9, step * 0.9);
        } else if (pattern === 1) {
          ctx.fillStyle = darkShade;
          ctx.fillRect(x, y, step * 0.7, step * 0.7);
        }
      }
    }

    // Tạo vi sợi nhiễu hạt hữu cơ (Organic micro-fiber noise)
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 22;
      d[i] = Math.min(255, Math.max(0, d[i] + n));
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  }

  // 2. DỰNG MODEL 3D KÍNH VR SIÊU CHI TIẾT THEO ẢNH hero-vr-headset-xam.webp
  function createHeadsetDetailedModel(colorTone = "gray") {
    const root = new THREE.Group();

    const isWarm = colorTone === "warm";
    const isBlue = colorTone === "blue";

    // Phối màu vật liệu bám sát ảnh chụp
    const fabricBase = isWarm ? "#DFD8CD" : (isBlue ? "#B8C9D8" : "#9C9CA0");
    const fabricThread = isWarm ? "#C8BEAE" : (isBlue ? "#98ABC0" : "#7D7E83");
    const fabricDark = isWarm ? "#B5A795" : (isBlue ? "#7F96AE" : "#606166");

    const strapBase = isWarm ? "#A37750" : (isBlue ? "#E66F28" : "#2E2F34");
    const strapThread = isWarm ? "#845D3B" : (isBlue ? "#C95A19" : "#212226");
    const strapDark = isWarm ? "#674628" : (isBlue ? "#A8450F" : "#17181B");

    const buckleColor = isWarm ? 0xD4AF37 : (isBlue ? 0xEEEEF2 : 0xE5E6EB);
    const visorColor = isWarm ? 0x1E1916 : (isBlue ? 0x141E28 : 0x0F1114);

    const bodyFabricTex = createDetailedWovenTexture(fabricBase, fabricThread, fabricDark);
    const strapFabricTex = createDetailedWovenTexture(strapBase, strapThread, strapDark);

    // Vật liệu PBR
    const matFabric = new THREE.MeshStandardMaterial({
      map: bodyFabricTex,
      roughness: 0.88,
      metalness: 0.04
    });

    const matStrap = new THREE.MeshStandardMaterial({
      map: strapFabricTex,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    // Kính đen Obsidian bóng gương PBR
    const matVisor = new THREE.MeshPhysicalMaterial({
      color: visorColor,
      roughness: 0.04,
      metalness: 0.12,
      transmission: 0.28,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      ior: 1.54
    });

    // Kim loại Chrome sáng bóng
    const matChrome = new THREE.MeshStandardMaterial({
      color: buckleColor,
      metalness: 0.98,
      roughness: 0.12
    });

    // Khung kim loại than Anodized
    const matChassisDark = new THREE.MeshStandardMaterial({
      color: 0x222327,
      roughness: 0.48,
      metalness: 0.65
    });

    // Đệm mút cashmere đen
    const matCushion = new THREE.MeshStandardMaterial({
      color: 0x161719,
      roughness: 0.96,
      metalness: 0.0
    });

    // Thấu kính quang học tráng phủ Sapphire/Emerald
    const matOpticalLens = new THREE.MeshPhysicalMaterial({
      color: 0x06283D,
      emissive: 0x021622,
      roughness: 0.03,
      transmission: 0.75,
      transparent: true,
      opacity: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      ior: 1.62
    });

    // -------------------------------------------------------------
    // A. MẶT KÍNH CONG PARABOL PHÍA TRƯỚC (FRONT VISOR)
    // -------------------------------------------------------------
    const visorGeom = new THREE.BoxGeometry(2.36, 1.20, 0.14, 16, 12, 4);
    const vPos = visorGeom.attributes.position;
    for (let i = 0; i < vPos.count; i++) {
      const x = vPos.getX(i);
      const y = vPos.getY(i);
      // Uốn cong parabol tự nhiên theo cả 2 trục
      const curveX = (1 - (x / 1.22) * (x / 1.22)) * 0.18;
      const curveY = (1 - (y / 0.65) * (y / 0.65)) * 0.04;
      vPos.setZ(i, vPos.getZ(i) + curveX + curveY);
    }
    visorGeom.computeVertexNormals();
    const visorMesh = new THREE.Mesh(visorGeom, matVisor);
    visorMesh.position.set(0, 0, 0.72);
    root.add(visorMesh);

    // Rãnh cảm biến quang học dọc bên phải mặt kính
    const slotGeom = new THREE.BoxGeometry(0.045, 0.54, 0.04);
    const slotMesh = new THREE.Mesh(slotGeom, matChassisDark);
    slotMesh.position.set(0.82, 0, 0.81);
    root.add(slotMesh);

    // -------------------------------------------------------------
    // B. VÀNH VÁT 45 ĐỘ BỌC VẢI DỆT (BEVELED FRONT FABRIC BEZEL)
    // -------------------------------------------------------------
    const bezelGeom = new THREE.BoxGeometry(2.46, 1.28, 0.28, 8, 8, 4);
    const bPos = bezelGeom.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
      const x = bPos.getX(i);
      const curveX = (1 - (x / 1.25) * (x / 1.25)) * 0.16;
      bPos.setZ(i, bPos.getZ(i) + curveX);
    }
    bezelGeom.computeVertexNormals();
    const bezelMesh = new THREE.Mesh(bezelGeom, matFabric);
    bezelMesh.position.set(0, 0, 0.58);
    root.add(bezelMesh);

    // -------------------------------------------------------------
    // C. THÂN CHÍNH BỌC VẢI DỆT XÁM (MAIN BODY CHASSIS)
    // -------------------------------------------------------------
    const bodyGeom = new THREE.BoxGeometry(2.44, 1.26, 0.82, 8, 8, 8);
    const bodyMesh = new THREE.Mesh(bodyGeom, matFabric);
    bodyMesh.position.set(0, 0, 0.16);
    root.add(bodyMesh);

    // -------------------------------------------------------------
    // D. KHUNG KIM LOẠI GIỮA (MID CHASSIS RIM & AIR VENTS)
    // -------------------------------------------------------------
    const rimGeom = new THREE.BoxGeometry(2.48, 1.30, 0.16);
    const rimMesh = new THREE.Mesh(rimGeom, matChassisDark);
    rimMesh.position.set(0, 0, 0.22);
    root.add(rimMesh);

    // Khe thoát nhiệt sườn 2 bên
    const ventGeom = new THREE.BoxGeometry(0.06, 0.42, 0.12);
    const ventLeft = new THREE.Mesh(ventGeom, matChassisDark);
    ventLeft.position.set(-1.25, 0, 0.22);
    root.add(ventLeft);
    const ventRight = new THREE.Mesh(ventGeom, matChassisDark);
    ventRight.position.set(1.25, 0, 0.22);
    root.add(ventRight);

    // -------------------------------------------------------------
    // E. ĐỆM MÚT CASHMERE ÁP MẶT (FACIAL CUSHION VỚI RÃNH MŨI)
    // -------------------------------------------------------------
    const cushionGeom = new THREE.BoxGeometry(2.36, 1.22, 0.26, 8, 8, 4);
    const cushionMesh = new THREE.Mesh(cushionGeom, matCushion);
    cushionMesh.position.set(0, 0, -0.32);
    root.add(cushionMesh);

    // -------------------------------------------------------------
    // F. NỘI THẤT: CẶP THẤU KÍNH PANCAKE KÉP QUANG HỌC
    // -------------------------------------------------------------
    const lensRingGeom = new THREE.CylinderGeometry(0.44, 0.44, 0.14, 32);
    lensRingGeom.rotateX(Math.PI / 2);
    const lensRingLeft = new THREE.Mesh(lensRingGeom, matChassisDark);
    lensRingLeft.position.set(-0.54, 0.04, -0.28);
    const lensRingRight = new THREE.Mesh(lensRingGeom, matChassisDark);
    lensRingRight.position.set(0.54, 0.04, -0.28);
    root.add(lensRingLeft);
    root.add(lensRingRight);

    const lensCoreGeom = new THREE.CylinderGeometry(0.39, 0.39, 0.08, 32);
    lensCoreGeom.rotateX(Math.PI / 2);
    const lensCoreLeft = new THREE.Mesh(lensCoreGeom, matOpticalLens);
    lensCoreLeft.position.set(-0.54, 0.04, -0.27);
    const lensCoreRight = new THREE.Mesh(lensCoreGeom, matOpticalLens);
    lensCoreRight.position.set(0.54, 0.04, -0.27);
    root.add(lensCoreLeft);
    root.add(lensCoreRight);

    // -------------------------------------------------------------
    // G. KHÓA KIM LOẠI CHỮ NHẬT CHROME GƯƠNG 2 BÊN (CHROME BUCKLES)
    // -------------------------------------------------------------
    const buckleShape = new THREE.Shape();
    buckleShape.moveTo(-0.09, -0.26);
    buckleShape.lineTo(0.09, -0.26);
    buckleShape.lineTo(0.09, 0.26);
    buckleShape.lineTo(-0.09, 0.26);
    buckleShape.closePath();

    const buckleHole = new THREE.Path();
    buckleHole.moveTo(-0.045, -0.20);
    buckleHole.lineTo(0.045, -0.20);
    buckleHole.lineTo(0.045, 0.20);
    buckleHole.lineTo(-0.045, 0.20);
    buckleHole.closePath();
    buckleShape.holes.push(buckleHole);

    const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.022, bevelThickness: 0.022 };
    const buckleGeom = new THREE.ExtrudeGeometry(buckleShape, extrudeSettings);

    const buckleLeft = new THREE.Mesh(buckleGeom, matChrome);
    buckleLeft.position.set(-1.26, 0, 0.08);
    buckleLeft.rotation.y = -Math.PI / 2;
    root.add(buckleLeft);

    const buckleRight = new THREE.Mesh(buckleGeom, matChrome);
    buckleRight.position.set(1.26, 0, 0.08);
    buckleRight.rotation.y = Math.PI / 2;
    root.add(buckleRight);

    // Khớp nhựa đỡ khóa
    const anchorGeom = new THREE.BoxGeometry(0.12, 0.42, 0.18);
    const anchorLeft = new THREE.Mesh(anchorGeom, matChassisDark);
    anchorLeft.position.set(-1.23, 0, 0.08);
    root.add(anchorLeft);
    const anchorRight = new THREE.Mesh(anchorGeom, matChassisDark);
    anchorRight.position.set(1.23, 0, 0.08);
    root.add(anchorRight);

    // -------------------------------------------------------------
    // H. QUAI ĐEO VẢI DỆT SƯỜN ÔM ĐẦU (SIDE STRAPS)
    // -------------------------------------------------------------
    const strapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.26, 0, 0.08),
      new THREE.Vector3(-1.38, -0.04, -0.55),
      new THREE.Vector3(-0.95, -0.06, -1.35),
      new THREE.Vector3(0, -0.06, -1.48),
      new THREE.Vector3(0.95, -0.06, -1.35),
      new THREE.Vector3(1.38, -0.04, -0.55),
      new THREE.Vector3(1.26, 0, 0.08)
    ]);
    const strapGeom = new THREE.TubeGeometry(strapCurve, 40, 0.15, 10, false);
    strapGeom.scale(1, 0.32, 1);
    const sideStrapMesh = new THREE.Mesh(strapGeom, matStrap);
    root.add(sideStrapMesh);

    // -------------------------------------------------------------
    // I. QUAI VÒM ĐỈNH ĐẦU ĐẶC TRƯNG (OVERHEAD ARCH STRAP)
    // -------------------------------------------------------------
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.64, 0.18),
      new THREE.Vector3(0, 1.28, -0.42),
      new THREE.Vector3(0, 1.10, -1.02),
      new THREE.Vector3(0, -0.02, -1.46)
    ]);
    const archGeom = new THREE.TubeGeometry(archCurve, 32, 0.13, 10, false);
    archGeom.scale(1.7, 0.30, 1);
    const archMesh = new THREE.Mesh(archGeom, matStrap);
    root.add(archMesh);

    // Khớp gắn quai đỉnh đầu
    const topMountGeom = new THREE.BoxGeometry(0.36, 0.08, 0.14);
    const topMount = new THREE.Mesh(topMountGeom, matChassisDark);
    topMount.position.set(0, 0.64, 0.18);
    root.add(topMount);

    root.scale.set(1.18, 1.18, 1.18);
    return root;
  }

  // 3. CLASS ĐIỀU KHIỂN KHUNG NHÌN 3D CỐ ĐỊNH ĐIỆN ẢNH (FIXED CINEMATIC VIEWPORT)
  class Highlight3DFixedViewport {
    constructor(canvas, preset = "front", tone = "gray") {
      this.canvas = canvas;
      this.preset = preset;
      this.tone = tone;
      this.targetRot = { x: 0, y: 0, z: 0 };
      this.currRot = { x: 0, y: 0, z: 0 };
      this.targetCam = { x: 0, y: 0, z: 4.5 };
      this.parallax = { x: 0, y: 0 };
      this.clock = new THREE.Clock();

      this.init();
    }

    init() {
      // Scene
      this.scene = new THREE.Scene();

      // Camera
      const width = this.canvas.clientWidth || 400;
      const height = this.canvas.clientHeight || 300;
      this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);

      // Renderer Studio PBR
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.18;

      // Ánh sáng Studio 3 điểm Quiet Luxury
      const ambLight = new THREE.AmbientLight(0xfff7ee, 1.5);
      this.scene.add(ambLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
      keyLight.position.set(3.5, 4.5, 5);
      this.scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xebe2d5, 1.2);
      fillLight.position.set(-4, 2, 3);
      this.scene.add(fillLight);

      const rimGold = new THREE.DirectionalLight(0xc8a982, 1.8);
      rimGold.position.set(-3, -2, -3.5);
      this.scene.add(rimGold);

      const specHighlight = new THREE.DirectionalLight(0xffffff, 1.5);
      specHighlight.position.set(0, 5, 2);
      this.scene.add(specHighlight);

      // Model 3D Kính VR
      this.model = createHeadsetDetailedModel(this.tone);
      this.scene.add(this.model);

      // CÀI ĐẶT 3 GÓC MÁY ĐIỆN ẢNH CHUYÊN BIỆT THEO TỪNG Ô TÍNH NĂNG
      this.setupFixedAngle(this.preset);

      // Lắng nghe chuột để tạo hiệu ứng Parallax vi mô (không bị lệch góc máy)
      this.bindMicroParallax();

      // Vòng lặp render
      this.animate = this.animate.bind(this);
      this.rafId = requestAnimationFrame(this.animate);
    }

    setupFixedAngle(preset) {
      if (preset === "front") {
        // Ô 1: Màn hình 8K — Macro cận cảnh trực diện 3/4 mặt kính cong Obsidian
        this.camera.position.set(0, 0.08, 4.2);
        this.targetCam = { x: 0, y: 0.08, z: 4.2 };
        this.targetRot = { x: 0.10, y: -0.28, z: 0.02 };
        this.model.position.set(0.05, -0.05, 0);
      } else if (preset === "side") {
        // Ô 2: Tần số quét 120Hz — Macro ngang hông phô diễn Khóa kim loại Chrome & Quai vải dệt
        this.camera.position.set(0.1, 0.04, 3.8);
        this.targetCam = { x: 0.1, y: 0.04, z: 3.8 };
        this.targetRot = { x: 0.06, y: -1.42, z: 0.03 };
        this.model.position.set(-0.25, -0.02, 0);
      } else if (preset === "optics") {
        // Ô 3: Trường nhìn 130° — Macro khoang nội thất từ trên xuống phô diễn cặp thấu kính Pancake kép
        this.camera.position.set(0, 0.25, 4.0);
        this.targetCam = { x: 0, y: 0.25, z: 4.0 };
        this.targetRot = { x: 0.44, y: 2.72, z: -0.08 };
        this.model.position.set(0, -0.08, 0);
      }
      this.currRot = { ...this.targetRot };
      this.model.rotation.set(this.currRot.x, this.currRot.y, this.currRot.z);
    }

    bindMicroParallax() {
      const onMove = (clientX, clientY) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width - 0.5;
        const y = (clientY - rect.top) / rect.height - 0.5;
        // Chỉ cho phép nghiêng tối đa ± 3 độ (0.05 rad) để giữ góc máy hoàn hảo
        this.parallax.x = x * 0.06;
        this.parallax.y = y * 0.04;
      };

      const container = this.canvas.parentElement || this.canvas;
      container.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
      container.addEventListener("mouseleave", () => {
        this.parallax.x = 0;
        this.parallax.y = 0;
      });

      // Resize observer
      const ro = new ResizeObserver(() => {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        if (w === 0 || h === 0) return;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h, false);
      });
      ro.observe(this.canvas);
    }

    setColorTone(tone) {
      if (this.tone === tone) return;
      this.tone = tone;
      const rot = { x: this.model.rotation.x, y: this.model.rotation.y, z: this.model.rotation.z };
      const pos = { x: this.model.position.x, y: this.model.position.y, z: this.model.position.z };
      this.scene.remove(this.model);
      this.model = createHeadsetDetailedModel(tone);
      this.model.rotation.set(rot.x, rot.y, rot.z);
      this.model.position.set(pos.x, pos.y, pos.z);
      this.scene.add(this.model);
    }

    animate() {
      this.rafId = requestAnimationFrame(this.animate);

      // Chuyển động vi mô mượt mà (Smooth damping)
      const t = this.clock.getElapsedTime();
      const breathY = Math.sin(t * 1.8) * 0.025;
      const breathTilt = Math.sin(t * 1.2) * 0.015;

      this.currRot.y += (this.targetRot.y + this.parallax.x - this.currRot.y) * 0.08;
      this.currRot.x += (this.targetRot.x + this.parallax.y - this.currRot.x) * 0.08;

      this.model.rotation.y = this.currRot.y + breathTilt;
      this.model.rotation.x = this.currRot.x;
      this.model.position.y = (this.preset === "front" ? -0.05 : (this.preset === "side" ? -0.02 : -0.08)) + breathY;

      this.renderer.render(this.scene, this.camera);
    }

    destroy() {
      cancelAnimationFrame(this.rafId);
      this.renderer.dispose();
    }
  }

  // Quản lý các khung nhìn
  const activeViewports = [];

  function initHighlight3D() {
    const c1 = document.getElementById("canvas-highlight-1");
    const c2 = document.getElementById("canvas-highlight-2");
    const c3 = document.getElementById("canvas-highlight-3");

    if (c1 && !c1.__3dInit) {
      c1.__3dInit = true;
      activeViewports.push(new Highlight3DFixedViewport(c1, "front", "gray"));
    }
    if (c2 && !c2.__3dInit) {
      c2.__3dInit = true;
      activeViewports.push(new Highlight3DFixedViewport(c2, "side", "gray"));
    }
    if (c3 && !c3.__3dInit) {
      c3.__3dInit = true;
      activeViewports.push(new Highlight3DFixedViewport(c3, "optics", "gray"));
    }
  }

  function setAllColorTone(tone) {
    activeViewports.forEach(vp => vp.setColorTone(tone));
  }

  global.NexusHeadset3D = {
    init: initHighlight3D,
    setTone: setAllColorTone,
    Highlight3DFixedViewport: Highlight3DFixedViewport
  };

})(window);
