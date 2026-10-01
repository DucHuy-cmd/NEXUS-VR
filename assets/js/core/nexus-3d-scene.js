/**
 * NEXUS VR — nexus-3d-scene.js (PHOTOREALISTIC 360° STUDIO ENGINE)
 * Mô hình 3D Kính VR Hoàn Chỉnh 360 Độ (Full 360° Volumetric Mesh)
 * Tái hiện sắc nét mọi góc nhìn: Mặt trước, Hai bên hông, Khoang thấu kính phía sau và Núm siết Fit Dial sau gáy
 *
 * Tính năng chính:
 * 1. MÔ HÌNH 3D 360 ĐỘ TOÀN DIỆN:
 *    - Mặt trước (0°): Mặt kính cong Parabol bóng gương PBR, cảm biến LiDAR & camera ẩn, viền Bezel Titanium.
 *    - Hai bên hông (90° & 270°): Thân Titanium Grade 5, loa Spatial Audio Pods, nút xoay Digital Crown, cổng USB-C.
 *    - Khoang mắt phía sau (180°): 2 thấu kính Pancake nhìn từ bên trong, đèn LED theo dõi mắt hồng ngoại (Eye-tracking), đệm Cashmere & rãnh vòm mũi.
 *    - Phía sau đầu (360°): Đệm tựa gáy và Núm xoay siết Fit Dial (Knurled Adjustment Wheel) mạ kim loại có dây cáp tăng đơ.
 *    - Mặt trên: Dây đai vòm đỉnh đầu và khe thoát nhiệt.
 * 2. TƯƠNG TÁC KÉO CHUỘT / TOUCH XOAY 360° TỰ DO (PHYSICS INERTIA ORBIT):
 *    - Người dùng có thể nhấp giữ và rê chuột hoặc vuốt chạm để xoay kính 360° ở mọi góc nhìn với lực quán tính mượt mà.
 * 3. CHẾ ĐỘ STUDIO TURNTABLE 360°:
 *    - Tự động quay tròn 360° ở Scene 5 để chiêm ngưỡng 3 phối màu (Titanium, Champagne, Sport).
 * 4. ĐIỂM DỪNG AN TOÀN TRƯỚC FOOTER:
 *    - Dừng render và ẩn canvas tuyệt đối trước khi chạm Chân trang.
 */

(function () {
  "use strict";

  class Nexus3DScene {
    constructor(canvasId = "nexus-webgl-canvas") {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) {
        console.warn(`[Nexus3DScene] Không tìm thấy canvas với id: ${canvasId}`);
        return;
      }

      if (typeof THREE === "undefined") {
        console.error("[Nexus3DScene] Three.js chưa được nạp!");
        return;
      }

      this.scene = new THREE.Scene();
      this.renderer = null;
      this.camera = null;

      // Nhóm gốc chứa toàn bộ mô hình 3D Kính VR
      this.headsetGroup = new THREE.Group();

      // Các nhóm bộ phận 3D độc lập (360 độ hoàn chỉnh)
      this.groupVisor = null;          // Mặt kính cong phía trước (0°)
      this.groupFrontBody = null;      // Thân bọc vải dệt xám
      this.groupMidRim = null;         // Khung trung tâm, Digital Crown, khe tản nhiệt, cổng USB-C
      this.groupSideArms = null;       // Quai sườn cứng & Loa Spatial Audio Pods (90° & 270°)
      this.groupBuckles = null;        // Khóa kim loại mạ chrome
      this.groupStraps = null;         // Dây đai sau & dây đai vòm đỉnh đầu
      this.groupFacialCushion = null;  // Đệm mút xốp áp mặt & rãnh mũi (180°)
      this.groupCoreOptics = null;     // Thấu kính Pancake kép nhìn từ cả 2 phía & bo mạch Neural
      this.groupEyeTracking = null;    // Đèn LED hồng ngoại theo dõi mắt trong khoang kính
      this.groupRearDial = null;       // Đệm tựa gáy & Núm xoay siết Fit Dial sau đầu (180° - 360°)
      this.groupChassis = null;        // Khung Titanium Grade 5
      this.shadowMesh = null;          // Bóng tiếp xúc mặt sàn

      // Lưu trữ Material để đổi màu thời gian thực
      this.materials = {
        visor: null,
        frontBody: null,
        midRim: null,
        sideArms: null,
        speakers: null,
        buckles: null,
        straps: null,
        rearDial: null,
        cushion: null,
        lenses: null,
        opticsRim: null,
        chassis: null,
        crown: null
      };

      // Đèn Glint Light tương tác chuột
      this.glintLight = null;

      // Cấu hình 3 phối màu
      this.colorways = {
        "titanium": {
          bodyColor: 0x8c9096,
          strapColor: 0x22252a,
          buckleColor: 0xeeeeee,
          dialColor: 0xd8dadf,
          visorColor: 0x0f1115,
          accentColor: 0x00f0ff,
          cushionColor: 0x2a2c32
        },
        "champagne": {
          bodyColor: 0xdcd3c5,
          strapColor: 0x3e2b20,
          buckleColor: 0xd4af37,
          dialColor: 0xd4af37,
          visorColor: 0x181412,
          accentColor: 0xc8a982,
          cushionColor: 0x362c26
        },
        "sport": {
          bodyColor: 0x1c2938,
          strapColor: 0xff5500,
          buckleColor: 0xff6a00,
          dialColor: 0xff5500,
          visorColor: 0x0b1017,
          accentColor: 0xff4400,
          cushionColor: 0x161d26
        }
      };

      // Trạng thái Scrollytelling & Tương tác Kéo Chuột 360°
      this.state = {
        // Scrollytelling Targets (Điều khiển từ cuộn chuột)
        exploded: 0.0,
        targetExploded: 0.0,
        rotationX: 0.05,
        rotationY: -0.28,
        rotationZ: 0.0,
        targetRotX: 0.05,
        targetRotY: -0.28,
        targetRotZ: 0.0,
        cameraZ: 5.6,
        targetCameraZ: 5.6,
        posX: 0.0,
        targetPosX: 0.0,
        posY: 0.18,
        targetPosY: 0.18,
        scale: 0.65,
        targetScale: 0.65,
        opacity: 1.0,
        targetOpacity: 1.0,

        // Chuột di chuyển (Glint Light & Micro Parallax)
        mouseNormX: 0.0,
        mouseNormY: 0.0,
        mouseCurrentX: 0.0,
        mouseCurrentY: 0.0,

        // KÉO CHUỘT XOAY 360 ĐỘ TỰ DO (INTERACTIVE ORBIT DRAG)
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        userRotX: 0.0,
        userRotY: 0.0,
        userVelX: 0.0,
        userVelY: 0.0,
        userDragInfluence: 0.0, // 1.0 khi đang kéo, giảm dần về 0 khi ngừng kéo
        lastPointerTime: 0,

        // Chế độ Turntable 360° Tự động ở Scene 5
        isTurntableActive: false,
        turntableSpeed: 0.006,

        // Màu nền
        bgColor: new THREE.Color(0xf8f5f0),
        targetBgColor: new THREE.Color(0xf8f5f0),

        currentColor: "titanium",
        isStopped: false,
        animationId: null
      };

      this.init();
    }

    init() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 1. Camera Studio
      this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      this.camera.position.set(0, 0, this.state.cameraZ);

      // 2. Renderer Hiệu năng cao
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.25;
      this.renderer.outputEncoding = THREE.sRGBEncoding;

      this.scene.background = this.state.bgColor;

      // 3. Hệ thống Ánh sáng Studio 360 Đa Chiều
      this.setupStudioLighting();

      // 4. Texture Vải dệt và Kim loại chuyên biệt
      const textures = this.createProceduralTextures();

      // 5. Dựng Mô hình Kính VR 360 Độ Hoàn Chỉnh Từng Chi Tiết
      this.buildFull360Headset(textures);

      this.scene.add(this.headsetGroup);

      // 6. Đăng ký Sự kiện (Chuột, Kéo Xoay 360°, Cửa sổ)
      this.setupEventListeners();

      // 7. Bắt đầu Vòng lặp Render 120 FPS
      this.animate = this.animate.bind(this);
      this.state.animationId = requestAnimationFrame(this.animate);

      console.log("[Nexus3DScene] Khởi tạo thành công mô hình 3D Kính VR Hoàn chỉnh 360°.");
    }

    /* --------------------------------------------------------------------------
       ÁNH SÁNG STUDIO ĐA HƯỚNG 360 ĐỘ (STUDIO OMNI LIGHTING)
       Đảm bảo mặt trước, hai bên hông và khoang mắt sau đều sáng đẹp rõ khối
       -------------------------------------------------------------------------- */
    setupStudioLighting() {
      // Đèn Môi trường Ấm
      const ambientLight = new THREE.AmbientLight(0xfff7ee, 1.25);
      this.scene.add(ambientLight);

      // Đèn Key chính từ góc trước phải
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
      keyLight.position.set(5, 6, 6);
      this.scene.add(keyLight);

      // Đèn Fill làm dịu khối bên trái
      const fillLight = new THREE.DirectionalLight(0xdcd0c2, 1.4);
      fillLight.position.set(-6, -2, 5);
      this.scene.add(fillLight);

      // Đèn Rim Light mặt sau & chiếu vào khoang mắt sau (Back Rim / Interior Fill)
      const rearLight = new THREE.DirectionalLight(0xfff0e4, 1.8);
      rearLight.position.set(0, 4, -6);
      this.scene.add(rearLight);

      // Đèn sườn chiếu viền kim loại núm xoay Fit Dial
      const sideLight = new THREE.DirectionalLight(0xdc5000, 1.2);
      sideLight.position.set(6, 1, -3);
      this.scene.add(sideLight);

      // Đèn Glint Light tương tác quét sáng theo chuột
      this.glintLight = new THREE.PointLight(0xffffff, 1.8, 9);
      this.glintLight.position.set(0, 0, 3.5);
      this.scene.add(this.glintLight);
    }

    /* --------------------------------------------------------------------------
       TẠO TEXTURE VẢI DỆT XÁM CAO CẤP & BUMP MAP
       -------------------------------------------------------------------------- */
    createProceduralTextures() {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#8c9096";
      ctx.fillRect(0, 0, size, size);

      ctx.lineWidth = 1.0;
      for (let x = 0; x < size; x += 3) {
        ctx.strokeStyle = (x % 6 === 0) ? "rgba(255, 255, 255, 0.16)" : "rgba(30, 30, 35, 0.14)";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + size * 0.4, size);
        ctx.stroke();
      }

      for (let y = 0; y < size; y += 3) {
        ctx.strokeStyle = (y % 6 === 0) ? "rgba(255, 255, 255, 0.12)" : "rgba(20, 20, 25, 0.12)";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y + size * 0.4);
        ctx.stroke();
      }

      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 16;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);

      const fabricTexture = new THREE.CanvasTexture(canvas);
      fabricTexture.wrapS = THREE.RepeatWrapping;
      fabricTexture.wrapT = THREE.RepeatWrapping;
      fabricTexture.repeat.set(4, 2);

      const bumpCanvas = document.createElement("canvas");
      bumpCanvas.width = 256;
      bumpCanvas.height = 256;
      const bCtx = bumpCanvas.getContext("2d");
      bCtx.fillStyle = "#808080";
      bCtx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 256; i += 4) {
        bCtx.fillStyle = (i % 8 === 0) ? "#ffffff" : "#333333";
        bCtx.fillRect(i, 0, 2, 256);
        bCtx.fillRect(0, i, 256, 2);
      }
      const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
      bumpTexture.wrapS = THREE.RepeatWrapping;
      bumpTexture.wrapT = THREE.RepeatWrapping;
      bumpTexture.repeat.set(8, 4);

      return { fabricTexture, bumpTexture };
    }

    createRoundedRectShape(width, height, radius) {
      const shape = new THREE.Shape();
      const x = -width / 2;
      const y = -height / 2;
      shape.moveTo(x + radius, y);
      shape.lineTo(x + width - radius, y);
      shape.quadraticCurveTo(x + width, y, x + width, y + radius);
      shape.lineTo(x + width, y + height - radius);
      shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      shape.lineTo(x + radius, y + height);
      shape.quadraticCurveTo(x, y + height, x, y + height - radius);
      shape.lineTo(x, y + radius);
      shape.quadraticCurveTo(x, y, x + radius, y);
      return shape;
    }

    /* --------------------------------------------------------------------------
       DỰNG MÔ HÌNH 3D KÍNH VR 360 ĐỘ TOÀN DIỆN (FULL 360° MESH)
       -------------------------------------------------------------------------- */
    buildFull360Headset(textures) {
      const { fabricTexture, bumpTexture } = textures;

      // =======================================================================
      // 1. MẶT KÍNH CONG 3D PHÍA TRƯỚC (FRONT CURVED VISOR - 0°)
      // =======================================================================
      this.groupVisor = new THREE.Group();

      const visorShape = this.createRoundedRectShape(3.04, 1.68, 0.44);
      const visorGeo = new THREE.ExtrudeGeometry(visorShape, {
        steps: 3,
        depth: 0.08,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.06,
        bevelSegments: 8
      });

      const vPos = visorGeo.attributes.position;
      for (let i = 0; i < vPos.count; i++) {
        const x = vPos.getX(i);
        const y = vPos.getY(i);
        const z = vPos.getZ(i);
        const curveZ = - (Math.pow(x / 1.52, 2) * 0.25 + Math.pow(y / 0.84, 2) * 0.08);
        vPos.setZ(i, z + curveZ);
      }
      visorGeo.computeVertexNormals();

      this.materials.visor = new THREE.MeshPhysicalMaterial({
        color: 0x0f1115,
        metalness: 0.15,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        reflectivity: 0.96,
        transmission: 0.26,
        transparent: true,
        opacity: 1.0
      });

      const visorMesh = new THREE.Mesh(visorGeo, this.materials.visor);
      visorMesh.position.set(0, 0, 0.42);
      this.groupVisor.add(visorMesh);

      // Viền Bezel kim loại Titanium
      const bezelGeo = new THREE.TorusGeometry(1.33, 0.032, 16, 48);
      const bezelMat = new THREE.MeshStandardMaterial({ color: 0x5a5e66, metalness: 0.88, roughness: 0.20 });
      const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
      bezelMesh.scale.set(1.15, 0.65, 1.0);
      bezelMesh.position.set(0, 0, 0.44);
      this.groupVisor.add(bezelMesh);

      // 2 Cụm cảm biến LiDAR/Camera trước ẩn sau kính
      const camSensorGeo = new THREE.CircleGeometry(0.045, 24);
      const camSensorMat = new THREE.MeshBasicMaterial({ color: 0x010305 });
      const leftSensor = new THREE.Mesh(camSensorGeo, camSensorMat);
      leftSensor.position.set(-1.18, 0.38, 0.46);
      this.groupVisor.add(leftSensor);
      const rightSensor = new THREE.Mesh(camSensorGeo, camSensorMat);
      rightSensor.position.set(1.18, 0.38, 0.46);
      this.groupVisor.add(rightSensor);

      this.headsetGroup.add(this.groupVisor);

      // =======================================================================
      // 2. THÂN KÍNH CHÍNH BỌC VẢI DỆT XÁM (MAIN BODY HOUSING)
      // =======================================================================
      this.groupFrontBody = new THREE.Group();

      const bodyShape = this.createRoundedRectShape(3.20, 1.78, 0.45);
      const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
        steps: 3,
        depth: 0.74,
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.12,
        bevelSegments: 8
      });

      const bPos = bodyGeo.attributes.position;
      for (let i = 0; i < bPos.count; i++) {
        const x = bPos.getX(i);
        const y = bPos.getY(i);
        const z = bPos.getZ(i);
        if (z > 0.3) {
          const curveZ = - (Math.pow(x / 1.5, 2) * 0.22 + Math.pow(y / 0.85, 2) * 0.08);
          bPos.setZ(i, z + curveZ);
        }
      }
      bodyGeo.computeVertexNormals();

      this.materials.frontBody = new THREE.MeshStandardMaterial({
        color: 0x8c9096,
        map: fabricTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.04,
        roughness: 0.62,
        metalness: 0.32
      });

      const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.frontBody);
      bodyMesh.position.set(0, 0, -0.32);
      this.groupFrontBody.add(bodyMesh);

      this.headsetGroup.add(this.groupFrontBody);

      // =======================================================================
      // 3. VÀNH NGĂN CÁCH TRUNG TÂM, NÚM DIGITAL CROWN & CỔNG USB-C (MID RIM)
      // =======================================================================
      this.groupMidRim = new THREE.Group();

      const midShape = this.createRoundedRectShape(3.14, 1.74, 0.42);
      const midGeo = new THREE.ExtrudeGeometry(midShape, {
        steps: 2,
        depth: 0.28,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 6
      });

      this.materials.midRim = new THREE.MeshStandardMaterial({
        color: 0x1e2024,
        roughness: 0.85,
        metalness: 0.15
      });

      const midMesh = new THREE.Mesh(midGeo, this.materials.midRim);
      midMesh.position.set(0, 0, -0.58);
      this.groupMidRim.add(midMesh);

      // Hai khe tản nhiệt xẻ dọc hai bên sườn
      const ventGeo = new THREE.BoxGeometry(0.04, 0.58, 0.16);
      const ventMat = new THREE.MeshBasicMaterial({ color: 0x050608 });
      const leftVent = new THREE.Mesh(ventGeo, ventMat);
      leftVent.position.set(-1.60, 0, -0.45);
      this.groupMidRim.add(leftVent);
      const rightVent = new THREE.Mesh(ventGeo, ventMat);
      rightVent.position.set(1.60, 0, -0.45);
      this.groupMidRim.add(rightVent);

      // Nút xoay Digital Crown mạ kim loại có rãnh khía răng cưa ở đỉnh bên phải
      const crownGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 32);
      this.materials.crown = new THREE.MeshStandardMaterial({
        color: 0xd8dadf,
        metalness: 0.95,
        roughness: 0.16
      });
      const crownMesh = new THREE.Mesh(crownGeo, this.materials.crown);
      crownMesh.position.set(0.92, 0.93, -0.46);
      this.groupMidRim.add(crownMesh);

      // Nút Action Pill trên đỉnh bên trái
      const pillGeo = new THREE.BoxGeometry(0.24, 0.04, 0.08);
      const pillMesh = new THREE.Mesh(pillGeo, this.materials.crown);
      pillMesh.position.set(-0.85, 0.93, -0.46);
      this.groupMidRim.add(pillMesh);

      // Cổng sạc quang học USB-C vát cạnh kim cương ở sườn máy trái
      const usbcRimGeo = new THREE.TorusGeometry(0.07, 0.015, 12, 24);
      const usbcRimMesh = new THREE.Mesh(usbcRimGeo, this.materials.crown);
      usbcRimMesh.rotation.y = Math.PI * 0.5;
      usbcRimMesh.position.set(-1.62, -0.32, -0.45);
      this.groupMidRim.add(usbcRimMesh);

      this.headsetGroup.add(this.groupMidRim);

      // =======================================================================
      // 4. QUAI SƯỜN CỨNG & CỤM LOA SPATIAL AUDIO PODS (90° & 270°)
      // =======================================================================
      this.groupSideArms = new THREE.Group();

      this.materials.sideArms = new THREE.MeshStandardMaterial({
        color: 0x363940,
        metalness: 0.65,
        roughness: 0.35
      });

      // Cụm quai sườn cứng chứa mạch dẫn âm thanh
      const armGeo = new THREE.BoxGeometry(0.08, 0.36, 1.15);
      const leftArm = new THREE.Mesh(armGeo, this.materials.sideArms);
      leftArm.position.set(-1.72, 0.0, -1.02);
      this.groupSideArms.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, this.materials.sideArms);
      rightArm.position.set(1.72, 0.0, -1.02);
      this.groupSideArms.add(rightArm);

      // Loa Spatial Audio Pods (Màng loa dạng khoang oval có lưới thoát âm)
      const speakerGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32);
      this.materials.speakers = new THREE.MeshStandardMaterial({
        color: 0x15171a,
        metalness: 0.85,
        roughness: 0.25
      });

      const leftSpeaker = new THREE.Mesh(speakerGeo, this.materials.speakers);
      leftSpeaker.rotation.z = Math.PI * 0.5;
      leftSpeaker.position.set(-1.77, 0.0, -1.15);
      this.groupSideArms.add(leftSpeaker);

      const rightSpeaker = new THREE.Mesh(speakerGeo, this.materials.speakers);
      rightSpeaker.rotation.z = -Math.PI * 0.5;
      rightSpeaker.position.set(1.77, 0.0, -1.15);
      this.groupSideArms.add(rightSpeaker);

      this.headsetGroup.add(this.groupSideArms);

      // =======================================================================
      // 5. KHÓA KIM LOẠI MẠ CHROME HAI BÊN (SIDE CHROME BUCKLES)
      // =======================================================================
      this.groupBuckles = new THREE.Group();

      this.materials.buckles = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        metalness: 0.96,
        roughness: 0.12
      });

      const buckleShape = this.createRoundedRectShape(0.12, 0.44, 0.04);
      const buckleHole = this.createRoundedRectShape(0.06, 0.36, 0.02);
      buckleShape.holes.push(buckleHole);
      const buckleGeo = new THREE.ExtrudeGeometry(buckleShape, {
        depth: 0.06,
        bevelEnabled: false
      });

      const leftBuckle = new THREE.Mesh(buckleGeo, this.materials.buckles);
      leftBuckle.position.set(-1.66, 0, -0.48);
      this.groupBuckles.add(leftBuckle);

      const rightBuckle = new THREE.Mesh(buckleGeo, this.materials.buckles);
      rightBuckle.position.set(1.66, 0, -0.48);
      this.groupBuckles.add(rightBuckle);

      this.headsetGroup.add(this.groupBuckles);

      // =======================================================================
      // 6. KHOANG MẮT PHÍA SAU, ĐỆM CASHMERE & RÃNH MŨI (REAR INTERIOR - 180°)
      // =======================================================================
      this.groupFacialCushion = new THREE.Group();

      const cushionShape = this.createRoundedRectShape(3.02, 1.66, 0.48);
      // Khoang mắt rộng công thái học
      const eyeHole = this.createRoundedRectShape(2.16, 1.02, 0.32);
      cushionShape.holes.push(eyeHole);

      const cushionGeo = new THREE.ExtrudeGeometry(cushionShape, {
        steps: 3,
        depth: 0.42,
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.12,
        bevelSegments: 8
      });

      this.materials.cushion = new THREE.MeshStandardMaterial({
        color: 0x2a2c32,
        roughness: 0.96,
        metalness: 0.04
      });

      const cushionMesh = new THREE.Mesh(cushionGeo, this.materials.cushion);
      cushionMesh.position.set(0, 0, -1.06);
      this.groupFacialCushion.add(cushionMesh);

      // Cánh đệm chặn sáng sống mũi (Nose Light-Seal Flap) mềm mại
      const noseFlapGeo = new THREE.ConeGeometry(0.24, 0.32, 16);
      const noseFlapMat = new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.95 });
      const noseFlap = new THREE.Mesh(noseFlapGeo, noseFlapMat);
      noseFlap.rotation.x = Math.PI;
      noseFlap.position.set(0, -0.46, -0.92);
      this.groupFacialCushion.add(noseFlap);

      this.headsetGroup.add(this.groupFacialCushion);

      // =======================================================================
      // 7. CỤM THẤU KÍNH PANCAKE KÉP & ĐÈN HỒNG NGOẠI EYE-TRACKING (OPTICS - 180°)
      // Nhìn được hoàn hảo từ cả mặt trước (bóc tách) và mặt sau (nhìn vào thấu kính)
      // =======================================================================
      this.groupCoreOptics = new THREE.Group();

      const lensGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.10, 48);
      this.materials.lenses = new THREE.MeshPhysicalMaterial({
        color: 0x051d2b,
        emissive: 0x003f54,
        roughness: 0.03,
        metalness: 0.90,
        transmission: 0.72,
        transparent: true,
        opacity: 0.96,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02
      });

      // Thấu kính Trái & Phải
      const leftLens = new THREE.Mesh(lensGeo, this.materials.lenses);
      leftLens.rotation.x = Math.PI * 0.5;
      leftLens.position.set(-0.56, 0.04, -0.2);
      this.groupCoreOptics.add(leftLens);

      const rightLens = new THREE.Mesh(lensGeo, this.materials.lenses);
      rightLens.rotation.x = Math.PI * 0.5;
      rightLens.position.set(0.56, 0.04, -0.2);
      this.groupCoreOptics.add(rightLens);

      // Vành đèn LED quang học phát sáng Cyan
      const rimGeo = new THREE.TorusGeometry(0.40, 0.022, 16, 48);
      this.materials.opticsRim = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

      const leftRim = new THREE.Mesh(rimGeo, this.materials.opticsRim);
      leftRim.position.set(-0.56, 0.04, -0.15);
      this.groupCoreOptics.add(leftRim);

      const rightRim = new THREE.Mesh(rimGeo, this.materials.opticsRim);
      rightRim.position.set(0.56, 0.04, -0.15);
      this.groupCoreOptics.add(rightRim);

      // 6 Đèn LED hồng ngoại theo dõi chuyển động mắt (Eye-Tracking IR LEDs) quanh mỗi thấu kính
      const irGeo = new THREE.SphereGeometry(0.015, 8, 8);
      const irMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const lx = -0.56 + Math.cos(angle) * 0.44;
        const ly = 0.04 + Math.sin(angle) * 0.44;
        const irDotL = new THREE.Mesh(irGeo, irMat);
        irDotL.position.set(lx, ly, -0.24);
        this.groupCoreOptics.add(irDotL);

        const rx = 0.56 + Math.cos(angle) * 0.44;
        const ry = 0.04 + Math.sin(angle) * 0.44;
        const irDotR = new THREE.Mesh(irGeo, irMat);
        irDotR.position.set(rx, ry, -0.24);
        this.groupCoreOptics.add(irDotR);
      }

      // Màn hình kép Micro-OLED siêu nét
      const displayGeo = new THREE.BoxGeometry(0.68, 0.68, 0.02);
      const displayMat = new THREE.MeshBasicMaterial({ color: 0x02070c });
      const leftDisplay = new THREE.Mesh(displayGeo, displayMat);
      leftDisplay.position.set(-0.56, 0.04, -0.06);
      this.groupCoreOptics.add(leftDisplay);

      const rightDisplay = new THREE.Mesh(displayGeo, displayMat);
      rightDisplay.position.set(0.56, 0.04, -0.06);
      this.groupCoreOptics.add(rightDisplay);

      // Bo mạch xử lý kép Dual Neural Engine
      const boardGeo = new THREE.BoxGeometry(1.92, 0.72, 0.03);
      const boardMat = new THREE.MeshStandardMaterial({
        color: 0x12171f,
        metalness: 0.82,
        roughness: 0.35
      });
      const circuitBoard = new THREE.Mesh(boardGeo, boardMat);
      circuitBoard.position.set(0, -0.16, -0.08);
      this.groupCoreOptics.add(circuitBoard);

      this.groupCoreOptics.position.set(0, 0, 0.0);
      this.headsetGroup.add(this.groupCoreOptics);

      // =======================================================================
      // 8. HỆ THỐNG DÂY ĐAI 3D ÔM ĐẦU & VÒM ĐỈNH ĐẦU (3D STRAPS)
      // =======================================================================
      this.groupStraps = new THREE.Group();

      this.materials.straps = new THREE.MeshStandardMaterial({
        color: 0x22252a,
        roughness: 0.88,
        metalness: 0.08
      });

      // A. Dây đai ngang phía sau ôm quanh đầu (Rear Horizontal Strap)
      const rearCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.72, 0, -1.5),
        new THREE.Vector3(-1.85, -0.04, -2.15),
        new THREE.Vector3(-1.45, -0.06, -2.65),
        new THREE.Vector3(0, -0.08, -2.85),
        new THREE.Vector3(1.45, -0.06, -2.65),
        new THREE.Vector3(1.85, -0.04, -2.15),
        new THREE.Vector3(1.72, 0, -1.5)
      ]);

      const rearStrapGeo = new THREE.TubeGeometry(rearCurve, 48, 0.12, 12, false);
      const rearStrapMesh = new THREE.Mesh(rearStrapGeo, this.materials.straps);
      rearStrapMesh.scale.set(1.0, 1.8, 0.35);
      this.groupStraps.add(rearStrapMesh);

      // B. Dây đai vòm đỉnh đầu (Top Overhead Arch Strap)
      const topCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.88, -0.48),
        new THREE.Vector3(0, 1.48, -1.35),
        new THREE.Vector3(0, 1.15, -2.25),
        new THREE.Vector3(0, -0.06, -2.82)
      ]);

      const topStrapGeo = new THREE.TubeGeometry(topCurve, 36, 0.11, 12, false);
      const topStrapMesh = new THREE.Mesh(topStrapGeo, this.materials.straps);
      topStrapMesh.scale.set(1.9, 0.35, 1.0);
      this.groupStraps.add(topStrapMesh);

      this.headsetGroup.add(this.groupStraps);

      // =======================================================================
      // 9. ĐỆM TỰA GÁY & NÚM XOAY SIẾT FIT DIAL SAU GÁY (REAR FIT DIAL - 360°)
      // Chi tiết đặc trưng mang lại vẻ đẹp 360 độ hoàn hảo như Apple Vision Pro
      // =======================================================================
      this.groupRearDial = new THREE.Group();

      // Đệm tựa gáy phía sau cong theo hộp sọ (Occipital Cushion Pad)
      const rearPadShape = this.createRoundedRectShape(1.4, 0.72, 0.22);
      const rearPadGeo = new THREE.ExtrudeGeometry(rearPadShape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.06,
        bevelSegments: 6
      });
      const rearPadMesh = new THREE.Mesh(rearPadGeo, this.materials.cushion);
      rearPadMesh.position.set(0, -0.08, -2.86);
      this.groupRearDial.add(rearPadMesh);

      // Núm xoay siết Fit Dial kim loại dạng răng cưa (Knurled Metal Adjustment Wheel)
      const dialWheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.09, 36);
      this.materials.rearDial = new THREE.MeshStandardMaterial({
        color: 0xd8dadf,
        metalness: 0.94,
        roughness: 0.15
      });
      const dialWheel = new THREE.Mesh(dialWheelGeo, this.materials.rearDial);
      dialWheel.rotation.x = Math.PI * 0.5;
      dialWheel.position.set(0, -0.08, -2.98);
      this.groupRearDial.add(dialWheel);

      // Nắp trung tâm núm xoay khắc logo "NEXUS"
      const dialCapGeo = new THREE.CircleGeometry(0.16, 32);
      const dialCapMat = new THREE.MeshStandardMaterial({
        color: 0x1a1c20,
        metalness: 0.85,
        roughness: 0.3
      });
      const dialCap = new THREE.Mesh(dialCapGeo, dialCapMat);
      dialCap.rotation.y = Math.PI;
      dialCap.position.set(0, -0.08, -3.03);
      this.groupRearDial.add(dialCap);

      // Vòng viền vàng/bạc quanh nắp núm xoay
      const dialRimGeo = new THREE.RingGeometry(0.15, 0.17, 32);
      const dialRimMesh = new THREE.Mesh(dialRimGeo, this.materials.rearDial);
      dialRimMesh.rotation.y = Math.PI;
      dialRimMesh.position.set(0, -0.08, -3.035);
      this.groupRearDial.add(dialRimMesh);

      this.headsetGroup.add(this.groupRearDial);

      // =======================================================================
      // 10. KHUNG TITANIUM GRADE 5 CHỊU LỰC (CHASSIS FRAME)
      // =======================================================================
      this.groupChassis = new THREE.Group();
      const chassisGeo = new THREE.BoxGeometry(2.9, 1.5, 0.12);
      this.materials.chassis = new THREE.MeshStandardMaterial({
        color: 0x2e3036,
        metalness: 0.88,
        roughness: 0.28
      });
      const chassisMesh = new THREE.Mesh(chassisGeo, this.materials.chassis);
      chassisMesh.position.set(0, 0, -0.2);
      this.groupChassis.add(chassisMesh);

      this.headsetGroup.add(this.groupChassis);

      // =======================================================================
      // 11. BÓNG TIẾP XÚC MẶT SÀN THỰC TẾ (GROUND CONTACT SHADOW)
      // =======================================================================
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 256;
      shadowCanvas.height = 256;
      const sCtx = shadowCanvas.getContext("2d");
      const grad = sCtx.createRadialGradient(128, 128, 0, 128, 128, 120);
      grad.addColorStop(0, "rgba(18, 14, 10, 0.42)");
      grad.addColorStop(0.5, "rgba(18, 14, 10, 0.16)");
      grad.addColorStop(1, "rgba(18, 14, 10, 0.0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);

      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      const shadowGeo = new THREE.PlaneGeometry(4.8, 3.6);
      this.shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false
      });
      this.shadowMesh = new THREE.Mesh(shadowGeo, this.shadowMat);
      this.shadowMesh.rotation.x = -Math.PI * 0.5;
      this.shadowMesh.position.set(0, -1.6, -0.6);
      this.scene.add(this.shadowMesh);

      // Đặt vị trí ban đầu
      this.headsetGroup.position.set(this.state.posX, this.state.posY, 0);
      this.headsetGroup.rotation.set(this.state.rotationX, this.state.rotationY, this.state.rotationZ);
    }

    /* --------------------------------------------------------------------------
       ĐĂNG KÝ SỰ KIỆN: KÉO CHUỘT / TOUCH XOAY 360 ĐỘ TỰ DO
       -------------------------------------------------------------------------- */
    setupEventListeners() {
      this.onWindowResize = this.onWindowResize.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);

      window.addEventListener("resize", this.onWindowResize);
      window.addEventListener("mousemove", this.onMouseMove);

      // Tương tác kéo xoay 360° trực tiếp trên toàn màn hình hoặc canvas
      window.addEventListener("pointerdown", this.onPointerDown, { passive: false });
      window.addEventListener("pointermove", this.onPointerMove, { passive: false });
      window.addEventListener("pointerup", this.onPointerUp);
      window.addEventListener("pointercancel", this.onPointerUp);
    }

    onPointerDown(e) {
      // Chỉ kích hoạt khi click chuột trái hoặc chạm ngón tay
      if (e.button !== undefined && e.button !== 0) return;

      // Không chặn sự kiện nếu click vào nút bấm, thẻ link hoặc input
      if (e.target.closest("button, a, input, select, textarea, .colorway-btn")) {
        return;
      }

      this.state.isDragging = true;
      this.state.dragStartX = e.clientX;
      this.state.dragStartY = e.clientY;
      this.state.userDragInfluence = 1.0;
      this.state.userVelX = 0;
      this.state.userVelY = 0;
      this.state.lastPointerTime = performance.now();

      document.body.classList.add("is-orbit-dragging");
      if (this.canvas) {
        this.canvas.style.cursor = "grabbing";
      }
    }

    onPointerMove(e) {
      if (!this.state.isDragging) return;

      const now = performance.now();
      const dt = Math.max(1, now - this.state.lastPointerTime);
      this.state.lastPointerTime = now;

      const deltaX = e.clientX - this.state.dragStartX;
      const deltaY = e.clientY - this.state.dragStartY;
      this.state.dragStartX = e.clientX;
      this.state.dragStartY = e.clientY;

      // Tính toán góc xoay 360 độ trực tiếp
      const sensitivity = 0.0058;
      this.state.userRotY += deltaX * sensitivity;
      this.state.userRotX += deltaY * sensitivity;

      // Giới hạn góc nghiêng pitch X để không bị lộn ngược đáy
      this.state.userRotX = THREE.MathUtils.clamp(this.state.userRotX, -Math.PI * 0.42, Math.PI * 0.42);

      // Lưu vận tốc để tạo lực quán tính vật lý (Inertia Flick)
      this.state.userVelX = (deltaX * sensitivity) / (dt * 0.06);
      this.state.userVelY = (deltaY * sensitivity) / (dt * 0.06);
    }

    onPointerUp() {
      if (this.state.isDragging) {
        this.state.isDragging = false;
        document.body.classList.remove("is-orbit-dragging");
        if (this.canvas) {
          this.canvas.style.cursor = "grab";
        }
      }
    }

    onMouseMove(e) {
      this.state.mouseNormX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.state.mouseNormY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Di chuyển đèn Glint quét sáng qua kính
      if (this.glintLight) {
        this.glintLight.position.x = this.state.mouseNormX * 2.8;
        this.glintLight.position.y = -this.state.mouseNormY * 2.2;
      }
    }

    onWindowResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    /* --------------------------------------------------------------------------
       API ĐIỀU KHIỂN TỪ CONTROLLER SCROLLYTELLING
       -------------------------------------------------------------------------- */
    setRotation(rx, ry, rz = 0) {
      this.state.targetRotX = rx;
      this.state.targetRotY = ry;
      this.state.targetRotZ = rz;
    }

    setCameraDistance(dist) {
      this.state.targetCameraZ = dist;
    }

    setPosY(y) {
      this.state.targetPosY = y;
    }

    setScale(s) {
      this.state.targetScale = s;
    }

    setOpacity(alpha) {
      this.state.targetOpacity = THREE.MathUtils.clamp(alpha, 0.0, 1.0);
    }

    setBackgroundColor(colorHex) {
      this.state.targetBgColor.set(colorHex);
    }

    setExplodedProgress(p) {
      this.state.targetExploded = THREE.MathUtils.clamp(p, 0.0, 1.0);
    }

    setTurntable(isActive) {
      this.state.isTurntableActive = isActive;
    }

    setColorway(theme) {
      if (!this.colorways[theme]) return;
      this.state.currentColor = theme;
      const cfg = this.colorways[theme];

      if (this.materials.frontBody) this.materials.frontBody.color.set(cfg.bodyColor);
      if (this.materials.straps) this.materials.straps.color.set(cfg.strapColor);
      if (this.materials.buckles) this.materials.buckles.color.set(cfg.buckleColor);
      if (this.materials.rearDial) this.materials.rearDial.color.set(cfg.dialColor);
      if (this.materials.visor) this.materials.visor.color.set(cfg.visorColor);
      if (this.materials.opticsRim) this.materials.opticsRim.color.set(cfg.accentColor);
      if (this.materials.cushion) this.materials.cushion.color.set(cfg.cushionColor);
    }

    setStopped(isStopped) {
      this.state.isStopped = isStopped;

      if (isStopped) {
        this.state.targetOpacity = 0.0;
        this.state.targetScale = 0.35;
        if (this.canvas) {
          this.canvas.style.opacity = "0";
          this.canvas.style.visibility = "hidden";
          this.canvas.style.pointerEvents = "none";
        }
      } else {
        if (this.canvas) {
          this.canvas.style.visibility = "visible";
          this.canvas.style.opacity = "1";
        }
      }
    }

    /* --------------------------------------------------------------------------
       VÒNG LẶP RENDER CHÍNH (FRAME-BY-FRAME SMOOTH LERP & 360° ORBIT)
       -------------------------------------------------------------------------- */
    animate() {
      this.state.animationId = requestAnimationFrame(this.animate);

      if (this.state.isStopped && this.state.opacity < 0.005) {
        return;
      }

      // 1. Quán tính vật lý kéo chuột 360° (Inertia Friction)
      if (!this.state.isDragging) {
        this.state.userRotY += this.state.userVelX;
        this.state.userRotX += this.state.userVelY;
        this.state.userVelX *= 0.92;
        this.state.userVelY *= 0.92;

        // Giảm dần độ chi phối của người dùng để trả lại nhịp Scrollytelling
        this.state.userDragInfluence *= 0.97;
        if (this.state.userDragInfluence < 0.005) {
          this.state.userDragInfluence = 0.0;
          this.state.userRotX *= 0.94;
          this.state.userRotY *= 0.94;
        }
      }

      // 2. Chế độ Studio Turntable 360° tự động ở Scene 5
      if (this.state.isTurntableActive && !this.state.isDragging) {
        this.state.targetRotY += this.state.turntableSpeed;
      }

      // 3. Damping chuột mượt mà
      this.state.mouseCurrentX += (this.state.mouseNormX - this.state.mouseCurrentX) * 0.06;
      this.state.mouseCurrentY += (this.state.mouseNormY - this.state.mouseCurrentY) * 0.06;

      // 4. Nội suy Góc xoay kết hợp giữa Scrollytelling và Kéo xoay tự do 360°
      this.state.rotationX += (this.state.targetRotX - this.state.rotationX) * 0.08;
      this.state.rotationY += (this.state.targetRotY - this.state.rotationY) * 0.08;
      this.state.rotationZ += (this.state.targetRotZ - this.state.rotationZ) * 0.08;

      this.headsetGroup.rotation.x = this.state.rotationX + this.state.userRotX + this.state.mouseCurrentY * 0.035;
      this.headsetGroup.rotation.y = this.state.rotationY + this.state.userRotY + this.state.mouseCurrentX * 0.05;
      this.headsetGroup.rotation.z = this.state.rotationZ - this.state.mouseCurrentX * 0.015;

      // 5. Nội suy Vị trí trục Y & Nhịp thở lơ lửng nhẹ nhàng
      this.state.posY += (this.state.targetPosY - this.state.posY) * 0.08;
      if (this.state.exploded < 0.05 && !this.state.isDragging) {
        const time = performance.now() * 0.0014;
        this.headsetGroup.position.y = this.state.posY + Math.sin(time) * 0.018;
      } else {
        this.headsetGroup.position.y = this.state.posY;
      }

      // 6. Nội suy Camera Distance & Scale
      this.state.cameraZ += (this.state.targetCameraZ - this.state.cameraZ) * 0.08;
      this.camera.position.z = this.state.cameraZ;

      this.state.scale += (this.state.targetScale - this.state.scale) * 0.08;
      this.headsetGroup.scale.set(this.state.scale, this.state.scale, this.state.scale);

      // 7. Nội suy Bóc tách giải phẫu (Exploded View Z-Separation - Vừa vặn không tràn)
      this.state.exploded += (this.state.targetExploded - this.state.exploded) * 0.08;
      const ex = this.state.exploded;

      if (this.groupVisor) {
        this.groupVisor.position.z = ex * 1.30;
      }
      if (this.groupFrontBody) {
        this.groupFrontBody.position.z = ex * 0.72;
      }
      if (this.groupCoreOptics) {
        this.groupCoreOptics.position.z = ex * 0.25;
      }
      if (this.groupChassis) {
        this.groupChassis.position.z = 0;
      }
      if (this.groupMidRim) {
        this.groupMidRim.position.z = -ex * 0.30;
      }
      if (this.groupSideArms) {
        this.groupSideArms.position.z = -ex * 0.55;
      }
      if (this.groupFacialCushion) {
        this.groupFacialCushion.position.z = -ex * 0.85;
      }
      if (this.groupStraps) {
        this.groupStraps.position.z = -ex * 1.25;
      }
      if (this.groupRearDial) {
        this.groupRearDial.position.z = -ex * 1.45;
      }

      // 8. Nội suy Màu Nền Canvas
      this.state.bgColor.lerp(this.state.targetBgColor, 0.06);
      if (this.scene) {
        this.scene.background = this.state.bgColor;
      }

      // 9. Nội suy Opacity
      this.state.opacity += (this.state.targetOpacity - this.state.opacity) * 0.1;
      const alpha = this.state.opacity;
      if (this.materials.visor) this.materials.visor.opacity = alpha;
      if (this.shadowMat) this.shadowMat.opacity = alpha * 0.85;

      // 10. Bóng đổ sàn 360 độ
      if (this.shadowMesh) {
        const shadowScale = (1.0 - (this.headsetGroup.position.y - this.state.posY) * 0.4) * this.state.scale;
        this.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
        this.shadowMesh.position.x = this.headsetGroup.position.x * 0.5;
      }

      this.renderer.render(this.scene, this.camera);
    }

    destroy() {
      if (this.state.animationId) {
        cancelAnimationFrame(this.state.animationId);
      }
      window.removeEventListener("resize", this.onWindowResize);
      window.removeEventListener("mousemove", this.onMouseMove);
      window.removeEventListener("pointerdown", this.onPointerDown);
      window.removeEventListener("pointermove", this.onPointerMove);
      window.removeEventListener("pointerup", this.onPointerUp);
      window.removeEventListener("pointercancel", this.onPointerUp);
    }
  }

  window.Nexus3DScene = Nexus3DScene;
})();
