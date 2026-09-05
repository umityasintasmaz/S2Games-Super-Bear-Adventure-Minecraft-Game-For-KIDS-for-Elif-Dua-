import * as THREE from 'three';
import { BearCharacter } from './character';
import { sound } from './sound';
import { voice } from './voice';
import { TextureLibrary } from './textures';
import { BlockType, CollectibleItem, DimensionWorld, GameState, InventorySlot, AVAILABLE_BLOCKS } from './types';
import { createOverworld, createPortalDimension } from './worldData';

export class GameEngine {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public player: BearCharacter;

  // Camera settings
  public cameraMode: 'third' | 'first' | 'close' = 'third';
  public cameraYaw: number = 0;
  public cameraPitch: number = 0.3;
  private cameraDistance: number = 5.5;

  // World & dimensions
  public currentDimension: 'overworld' | 'portalWorld' = 'overworld';
  private overworldData: DimensionWorld;
  private portalWorldData: DimensionWorld;
  public currentWorld: DimensionWorld;

  // Blocks management
  private blockMeshes: Map<string, THREE.Mesh> = new Map();
  private sharedBoxGeo = new THREE.BoxGeometry(1, 1, 1);
  private highlightBox: THREE.LineSegments;
  public targetedBlockPos: { x: number; y: number; z: number } | null = null;
  public targetedBlockNormal: { x: number; y: number; z: number } | null = null;

  // Collectibles meshes
  private collectibleMeshes: Map<string, THREE.Group> = new Map();

  // Portal particles
  private portalParticles: THREE.Points | null = null;

  // Particle systems for mining & effects
  private activeParticles: {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
  }[] = [];

  // Physics
  public playerPos: THREE.Vector3 = new THREE.Vector3(0, 3, 2);
  public playerVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public isGrounded: boolean = false;
  private canDoubleJump: boolean = true;
  private playerRadius = 0.35;
  private playerHeight = 1.6;

  // Controls input state
  public input = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    mine: false,
    place: false
  };

  // State callback
  public onStateChange: ((state: GameState) => void) | null = null;
  public onMessage: ((msg: { text: string; icon?: string; color?: string }) => void) | null = null;
  public onWin: (() => void) | null = null;
  public onInputStateChange: ((input: { forward: boolean; backward: boolean; left: boolean; right: boolean }) => void) | null = null;

  public state: GameState = {
    dimension: 'overworld',
    coins: 0,
    honey: 0,
    rescuedBears: 0,
    totalBearsToRescue: 4,
    blocksMined: 0,
    hasFoundCrown: false,
    currentDimensionName: '🌲 Orman Dünyası',
    selectedSlot: 0,
    inventory: [
      { type: 'gold', name: 'Altın Blok', count: 999, iconColor: '#eab308', emoji: '👑' },
      { type: 'sand', name: 'Kum Bloğu', count: 999, iconColor: '#fde047', emoji: '🏖️' },
      { type: 'copper', name: 'Bakır Bloğu', count: 999, iconColor: '#b45309', emoji: '🟫' },
      { type: 'diamond', name: 'Elmas Bloğu', count: 999, iconColor: '#0ea5e9', emoji: '💎' },
      { type: 'honey', name: 'Zıplayan Bal', count: 999, iconColor: '#f59e0b', emoji: '🍯' },
      { type: 'grass', name: 'Çimen Bloğu', count: 999, iconColor: '#4da824', emoji: '🌱' },
      { type: 'brick', name: 'Tuğla Bloğu', count: 999, iconColor: '#9b3824', emoji: '🧱' },
      { type: 'wood', name: 'Meşe Odunu', count: 999, iconColor: '#78350f', emoji: '🪵' },
      { type: 'crystal', name: 'Mor Kristal', count: 999, iconColor: '#d946ef', emoji: '🔮' },
    ],
    hp: 5,
    maxHp: 5
  };

  private isRunning: boolean = true;
  private lastTime: number = performance.now();
  private portalCooldown: number = 0;
  private raycaster = new THREE.Raycaster();
  private mouseCoords = new THREE.Vector2(0, 0); // Raycast pointer coords
  private lastUpArrowTime: number = 0;
  private eventCleanups: (() => void)[] = [];
  private proximityTimer: number = 0;
  private warnedBearIds: Set<string> = new Set();
  private warnedPortal: boolean = false;
  private warnedHouse: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 120);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Player
    this.player = new BearCharacter();
    this.scene.add(this.player.mesh);

    // 5. Highlight wireframe box for targeted block (Klasik Minecraft tarzı net siyah çerçeve)
    const wireGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.008, 1.008, 1.008));
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 3,
      depthTest: true,
      transparent: true,
      opacity: 0.95
    });
    this.highlightBox = new THREE.LineSegments(wireGeo, wireMat);
    this.highlightBox.renderOrder = 999;
    this.highlightBox.visible = false;
    this.scene.add(this.highlightBox);

    // 6. Init worlds
    this.overworldData = createOverworld();
    this.portalWorldData = createPortalDimension();
    this.currentWorld = this.overworldData;

    // Load initial world
    this.loadWorld(this.currentWorld);

    // 7. Bind resize & input events
    window.addEventListener('resize', this.onWindowResize);
    this.setupPointerEvents();

    // Start loop
    this.animate();
  }

  private loadWorld(world: DimensionWorld) {
    // Clear old block meshes
    this.blockMeshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.blockMeshes.clear();

    // Clear old collectibles
    this.collectibleMeshes.forEach(group => {
      this.scene.remove(group);
    });
    this.collectibleMeshes.clear();

    // Scene ambiance
    this.scene.background = new THREE.Color(world.skyColor);
    this.scene.fog = new THREE.Fog(world.fogColor, world.fogNear, world.fogFar);

    // Lights
    const existingLights = this.scene.children.filter(c => c instanceof THREE.Light);
    existingLights.forEach(l => this.scene.remove(l));

    const hemiLight = new THREE.HemisphereLight(world.ambientColor, 0x334155, 0.7);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(world.sunColor, 1.1);
    sunLight.position.set(20, 35, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 70;
    const d = 25;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    // Build blocks in scene
    world.blocks.forEach((type, key) => {
      const [x, y, z] = key.split(',').map(Number);
      this.createBlockMesh(x, y, z, type);
    });

    // Build collectibles in scene
    world.collectibles.forEach(item => {
      if (!item.collected) {
        this.createCollectibleMesh(item);
      }
    });

    // Create portal particle aura
    this.setupPortalParticles(world.portalLocation);

    // Set player position at spawn
    this.playerPos.set(world.spawnPoint.x, world.spawnPoint.y, world.spawnPoint.z);
    this.playerVel.set(0, 0, 0);

    this.notifyState();
  }

  private createBlockMesh(x: number, y: number, z: number, type: BlockType): THREE.Mesh {
    const mat = TextureLibrary.getMaterial(type);
    const mesh = new THREE.Mesh(this.sharedBoxGeo, mat);
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
    mesh.receiveShadow = true;
    mesh.castShadow = type !== 'leaves' && type !== 'honey';
    mesh.userData = { isBlock: true, blockType: type, x, y, z, blockKey: `${x},${y},${z}` };

    this.scene.add(mesh);
    this.blockMeshes.set(`${x},${y},${z}`, mesh);
    return mesh;
  }

  private setupPortalParticles(loc: { x: number; y: number; z: number }) {
    if (this.portalParticles) {
      this.scene.remove(this.portalParticles);
    }
    const particleCount = 45;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = loc.x + (Math.random() - 0.5) * 1.8;
      positions[i * 3 + 1] = loc.y + Math.random() * 2.8;
      positions[i * 3 + 2] = loc.z + (Math.random() - 0.5) * 0.8;

      colors[i * 3] = 0.7 + Math.random() * 0.3;     // R
      colors[i * 3 + 1] = 0.2;                        // G
      colors[i * 3 + 2] = 0.9 + Math.random() * 0.1; // B
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.portalParticles = new THREE.Points(geo, mat);
    this.scene.add(this.portalParticles);
  }

  private createCollectibleMesh(item: CollectibleItem) {
    const group = new THREE.Group();
    group.position.set(item.x + 0.5, item.y, item.z + 0.5);
    group.userData = { collectibleId: item.id, type: item.type, itemRef: item };

    if (item.type === 'coin') {
      // Golden coin
      const coinGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0xeab308,
        emissiveIntensity: 0.4
      });
      const coinMesh = new THREE.Mesh(coinGeo, coinMat);
      coinMesh.rotation.x = Math.PI / 2;
      group.add(coinMesh);

      // Star shine
      const starGeo = new THREE.OctahedronGeometry(0.1);
      const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(0, 0.2, 0);
      group.add(star);
    } else if (item.type === 'honey') {
      // Golden honey pot
      const potGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.45, 12);
      const potMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.2,
        roughness: 0.1,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.9
      });
      const pot = new THREE.Mesh(potGeo, potMat);
      group.add(pot);

      // Lid
      const lidGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 12);
      const lidMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.position.y = 0.26;
      group.add(lid);
    } else if (item.type === 'bearFriend') {
      // Mini rescued bear (cute little friend!)
      const miniFur = new THREE.MeshLambertMaterial({ color: 0xb45309 });
      const miniSnout = new THREE.MeshLambertMaterial({ color: 0xfef3c7 });
      const miniEye = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const heartMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

      // Mini body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.3), miniFur);
      body.position.y = 0.22;
      group.add(body);

      // Mini head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.35, 0.35), miniFur);
      head.position.set(0, 0.55, 0.05);
      group.add(head);

      // Snout
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.14), miniSnout);
      snout.position.set(0, 0.5, 0.26);
      group.add(snout);

      // Eyes
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), miniEye);
      eyeL.position.set(-0.1, 0.6, 0.23);
      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), miniEye);
      eyeR.position.set(0.1, 0.6, 0.23);
      group.add(eyeL);
      group.add(eyeR);

      // Floating heart above head
      const heart = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), heartMat);
      heart.position.set(0, 0.95, 0);
      group.add(heart);
    } else if (item.type === 'crown') {
      // THE GOLDEN HONEY CROWN
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.6
      });
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8
      });

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16), crownMat);
      group.add(base);

      // 4 Crown points
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 6), crownMat);
        tip.position.set(Math.cos(angle) * 0.35, 0.2, Math.sin(angle) * 0.35);
        group.add(tip);

        const gem = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), gemMat);
        gem.position.set(Math.cos(angle) * 0.35, 0.34, Math.sin(angle) * 0.35);
        group.add(gem);
      }
    }

    this.scene.add(group);
    this.collectibleMeshes.set(item.id, group);
  }

  private setupPointerEvents() {
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let totalDragDistance = 0;
    let mouseDownButton = -1;

    const dom = this.renderer.domElement;

    const updateCoords = (clientX: number, clientY: number) => {
      const rect = dom.getBoundingClientRect();
      this.mouseCoords.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseCoords.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      this.updateRaycastTarget();
    };

    const onMouseDown = (e: MouseEvent) => {
      // Ignore clicks on UI elements (buttons, hotbar, etc.)
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, input, select, textarea, [role="dialog"], #minecraft-hotbar, #bottom-right-directional-controls')) {
        return;
      }

      updateCoords(e.clientX, e.clientY);

      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      totalDragDistance = 0;
      mouseDownButton = e.button;
    };

    const onMouseMove = (e: MouseEvent) => {
      updateCoords(e.clientX, e.clientY);

      if (isDragging) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        totalDragDistance += Math.abs(dx) + Math.abs(dy);

        this.cameraYaw -= dx * 0.005;
        this.cameraPitch = Math.max(-0.6, Math.min(1.1, this.cameraPitch + dy * 0.005));
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;

      // If mouse barely moved (< 6px), trigger precise click action on targeted block!
      if (totalDragDistance < 6) {
        updateCoords(e.clientX, e.clientY);

        if (mouseDownButton === 0) {
          // Sol Tık: Koy (Place)
          if (e.shiftKey) {
            this.mineBlock();
          } else {
            this.placeBlock();
          }
        } else if (mouseDownButton === 2) {
          // Sağ Tık: Kır (Mine)
          e.preventDefault();
          this.mineBlock();
        }
      }
      mouseDownButton = -1;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.cameraDistance = Math.max(2.5, Math.min(12.0, this.cameraDistance + e.deltaY * 0.005));
    };

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', onContextMenu);

    // Keyboard controls (Arrow keys primary for Elif Dua, WASD also supported)
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if user is typing in an input or dialog
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const code = e.code || '';
      const key = e.key || '';

      const isUp =
        code === 'ArrowUp' ||
        key === 'ArrowUp' ||
        key === 'Up' ||
        code === 'KeyW' ||
        key === 'w' ||
        key === 'W' ||
        code === 'Numpad8';

      const isDown =
        code === 'ArrowDown' ||
        key === 'ArrowDown' ||
        key === 'Down' ||
        code === 'KeyS' ||
        key === 's' ||
        key === 'S' ||
        code === 'Numpad2';

      const isLeft =
        code === 'ArrowLeft' ||
        key === 'ArrowLeft' ||
        key === 'Left' ||
        code === 'KeyA' ||
        key === 'a' ||
        key === 'A' ||
        code === 'Numpad4';

      const isRight =
        code === 'ArrowRight' ||
        key === 'ArrowRight' ||
        key === 'Right' ||
        code === 'KeyD' ||
        key === 'd' ||
        key === 'D' ||
        code === 'Numpad6';

      // Always prevent default page scroll for arrow keys and space in iframe
      if (isUp || isDown || isLeft || isRight || code === 'Space' || key === ' ' || key === 'Spacebar') {
        e.preventDefault();
      }

      let inputChanged = false;

      if (isUp) {
        if (!e.repeat) {
          const now = performance.now();
          // Double-tap Up Arrow to jump!
          if (now - this.lastUpArrowTime < 380) {
            this.jump();
            this.showMessage('🦘 Çift Ok Zıplaması!', '🦘', '#fbbf24');
          }
          this.lastUpArrowTime = now;
        }
        if (!this.input.forward) {
          this.input.forward = true;
          inputChanged = true;
        }
      }
      if (isDown) {
        if (!this.input.backward) {
          this.input.backward = true;
          inputChanged = true;
        }
      }
      if (isLeft) {
        if (!this.input.left) {
          this.input.left = true;
          inputChanged = true;
        }
      }
      if (isRight) {
        if (!this.input.right) {
          this.input.right = true;
          inputChanged = true;
        }
      }
      if (code === 'Space' || key === ' ' || key === 'Spacebar') {
        if (!e.repeat) {
          this.jump();
        }
      }
      if (code === 'KeyF' || key === 'f' || key === 'F' || code === 'Enter' || key === 'Enter' || code === 'NumpadEnter') {
        if (!e.repeat) this.mineBlock();
      }
      if (code === 'KeyE' || key === 'e' || key === 'E' || code === 'KeyB' || key === 'b' || key === 'B') {
        if (!e.repeat) this.placeBlock();
      }
      if (code === 'KeyR' || key === 'r' || key === 'R') {
        if (!e.repeat) this.cycleSlotBlock(this.state.selectedSlot);
      }
      if (code === 'KeyC' || key === 'c' || key === 'C') {
        if (!e.repeat) this.toggleCamera();
      }
      // Hotbar selection 1-9
      if (key >= '1' && key <= '9') {
        const slotIdx = parseInt(key, 10) - 1;
        this.selectSlot(slotIdx);
      } else if (code.startsWith('Digit') || code.startsWith('Numpad')) {
        const digitStr = code.replace('Digit', '').replace('Numpad', '');
        const slotIdx = parseInt(digitStr, 10) - 1;
        if (!isNaN(slotIdx) && slotIdx >= 0 && slotIdx < this.state.inventory.length) {
          this.selectSlot(slotIdx);
        }
      }

      if (inputChanged && this.onInputStateChange) {
        this.onInputStateChange({ ...this.input });
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const code = e.code || '';
      const key = e.key || '';

      const isUp =
        code === 'ArrowUp' ||
        key === 'ArrowUp' ||
        key === 'Up' ||
        code === 'KeyW' ||
        key === 'w' ||
        key === 'W' ||
        code === 'Numpad8';

      const isDown =
        code === 'ArrowDown' ||
        key === 'ArrowDown' ||
        key === 'Down' ||
        code === 'KeyS' ||
        key === 's' ||
        key === 'S' ||
        code === 'Numpad2';

      const isLeft =
        code === 'ArrowLeft' ||
        key === 'ArrowLeft' ||
        key === 'Left' ||
        code === 'KeyA' ||
        key === 'a' ||
        key === 'A' ||
        code === 'Numpad4';

      const isRight =
        code === 'ArrowRight' ||
        key === 'ArrowRight' ||
        key === 'Right' ||
        code === 'KeyD' ||
        key === 'd' ||
        key === 'D' ||
        code === 'Numpad6';

      if (isUp || isDown || isLeft || isRight) {
        e.preventDefault();
      }

      let inputChanged = false;

      if (isUp && this.input.forward) {
        this.input.forward = false;
        inputChanged = true;
      }
      if (isDown && this.input.backward) {
        this.input.backward = false;
        inputChanged = true;
      }
      if (isLeft && this.input.left) {
        this.input.left = false;
        inputChanged = true;
      }
      if (isRight && this.input.right) {
        this.input.right = false;
        inputChanged = true;
      }

      if (inputChanged && this.onInputStateChange) {
        this.onInputStateChange({ ...this.input });
      }
    };

    const onBlur = () => {
      // Release all movement keys if window loses focus
      if (this.input.forward || this.input.backward || this.input.left || this.input.right) {
        this.input.forward = false;
        this.input.backward = false;
        this.input.left = false;
        this.input.right = false;
        if (this.onInputStateChange) {
          this.onInputStateChange({ ...this.input });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp, { passive: false });
    window.addEventListener('blur', onBlur);

    this.eventCleanups.push(
      () => dom.removeEventListener('mousedown', onMouseDown),
      () => window.removeEventListener('mousemove', onMouseMove),
      () => window.removeEventListener('mouseup', onMouseUp),
      () => dom.removeEventListener('wheel', onWheel),
      () => dom.removeEventListener('contextmenu', onContextMenu),
      () => window.removeEventListener('keydown', onKeyDown),
      () => window.removeEventListener('keyup', onKeyUp),
      () => window.removeEventListener('blur', onBlur)
    );
  }

  public triggerUpArrow() {
    const now = performance.now();
    if (now - this.lastUpArrowTime < 380) {
      this.jump();
      this.showMessage('🦘 Çift Dokunuş Zıplaması!', '🦘', '#fbbf24');
    }
    this.lastUpArrowTime = now;
  }

  public setMovement(action: 'forward' | 'backward' | 'left' | 'right', active: boolean) {
    this.input[action] = active;
    if (this.onInputStateChange) {
      this.onInputStateChange({ ...this.input });
    }
  }

  public toggleCamera() {
    if (this.cameraMode === 'third') {
      this.cameraMode = 'close';
      this.cameraDistance = 3.2;
    } else if (this.cameraMode === 'close') {
      this.cameraMode = 'first';
      this.cameraDistance = 0.1;
      this.player.mesh.visible = false;
    } else {
      this.cameraMode = 'third';
      this.cameraDistance = 5.5;
      this.player.mesh.visible = true;
    }
  }

  public selectSlot(idx: number) {
    if (idx >= 0 && idx < this.state.inventory.length) {
      this.state.selectedSlot = idx;
      const current = this.state.inventory[idx];
      if (current) {
        sound.playBlockSwitch();
        voice.speakElement(current.name, current.type);
      }
      this.notifyState();
    }
  }

  public jump() {
    if (this.isGrounded) {
      this.playerVel.y = 8.5;
      this.isGrounded = false;
      this.canDoubleJump = true;
      sound.playJump();
    } else if (this.canDoubleJump) {
      // Super Bear Adventure signature double jump!
      this.playerVel.y = 8.0;
      this.canDoubleJump = false;
      sound.playDoubleJump();
      this.spawnJumpParticles(this.playerPos);
    }
  }

  public mineBlock() {
    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let key = '';

    if (this.targetedBlockPos) {
      targetX = this.targetedBlockPos.x;
      targetY = this.targetedBlockPos.y;
      targetZ = this.targetedBlockPos.z;
      key = `${targetX},${targetY},${targetZ}`;
    } else {
      // Fallback: mine block directly in front of bear
      const facing = this.player.mesh.rotation.y;
      targetX = Math.floor(this.playerPos.x + Math.sin(facing) * 1.5);
      targetZ = Math.floor(this.playerPos.z + Math.cos(facing) * 1.5);
      targetY = Math.floor(this.playerPos.y);
      key = `${targetX},${targetY},${targetZ}`;

      if (!this.currentWorld.blocks.has(key)) {
        targetY = Math.floor(this.playerPos.y) - 1;
        key = `${targetX},${targetY},${targetZ}`;
      }
    }

    const blockType = this.currentWorld.blocks.get(key);
    if (!blockType) return;

    if (blockType === 'portal') {
      // Cannot break active nether portal blocks
      this.showMessage('✨ Bu gizemli bir portal, içinden geçmelisin!', '🔮');
      return;
    }

    // Trigger bear swing animation
    this.player.triggerMineAnimation();
    sound.playBreakBlock();

    // Spawn break particles
    this.spawnBlockBreakParticles(targetX + 0.5, targetY + 0.5, targetZ + 0.5, blockType);

    // Remove block mesh and record
    const mesh = this.blockMeshes.get(key);
    if (mesh) {
      this.scene.remove(mesh);
      this.blockMeshes.delete(key);
    }
    this.currentWorld.blocks.delete(key);

    // Add block to inventory (always keep infinite)
    const invSlot = this.state.inventory.find(s => s.type === blockType);
    if (!invSlot) {
      const def = AVAILABLE_BLOCKS.find(b => b.type === blockType);
      this.state.inventory.push({
        type: blockType,
        name: def ? def.name : blockType.toUpperCase(),
        count: 999,
        iconColor: def ? def.iconColor : '#a855f7',
        emoji: def?.emoji
      });
    }

    this.state.blocksMined += 1;

    // Diamond bonus
    if (blockType === 'diamond') {
      this.state.coins += 5;
      sound.playCoin();
      this.showMessage('💎 Elmas buldun! +5 Altın kazandın!', '💎', '#38bdf8');
    }

    this.notifyState();
  }

  public placeBlock() {
    const currentSlot = this.state.inventory[this.state.selectedSlot];
    if (!currentSlot) {
      return;
    }

    let placeX: number;
    let placeY: number;
    let placeZ: number;

    if (this.targetedBlockPos && this.targetedBlockNormal) {
      placeX = this.targetedBlockPos.x + this.targetedBlockNormal.x;
      placeY = this.targetedBlockPos.y + this.targetedBlockNormal.y;
      placeZ = this.targetedBlockPos.z + this.targetedBlockNormal.z;
    } else {
      // Fallback: place directly in front of bear so placing ALWAYS works!
      const facing = this.player.mesh.rotation.y;
      const fwdX = Math.sin(facing);
      const fwdZ = Math.cos(facing);
      placeX = Math.floor(this.playerPos.x + fwdX * 1.5);
      placeZ = Math.floor(this.playerPos.z + fwdZ * 1.5);
      placeY = Math.floor(this.playerPos.y);

      // If there's already a block at foot level, place on top
      if (this.currentWorld.blocks.has(`${placeX},${placeY},${placeZ}`)) {
        placeY += 1;
      }
    }

    const key = `${placeX},${placeY},${placeZ}`;

    // Prevent placing where block already exists
    if (this.currentWorld.blocks.has(key)) return;

    // Pillar jump: if placing right at feet, bump player up!
    const isUnderFeet =
      placeX === Math.floor(this.playerPos.x) &&
      placeZ === Math.floor(this.playerPos.z) &&
      (placeY === Math.floor(this.playerPos.y) || placeY === Math.floor(this.playerPos.y - 0.2));

    if (isUnderFeet) {
      this.playerPos.y = placeY + 1.05;
      this.playerVel.y = 0;
    } else {
      // Prevent placing a block directly inside player body
      const r = this.playerRadius;
      const h = this.playerHeight;
      const overlapsBody =
        this.playerPos.x - r < placeX + 0.95 &&
        this.playerPos.x + r > placeX + 0.05 &&
        this.playerPos.y < placeY + 0.95 &&
        this.playerPos.y + h > placeY + 0.05 &&
        this.playerPos.z - r < placeZ + 0.95 &&
        this.playerPos.z + r > placeZ + 0.05;

      if (overlapsBody) {
        this.showMessage('⚠️ Kendi içine blok koyamazsın!', '⚠️', '#f87171');
        return;
      }
    }

    // Place block (Infinite blocks: does not deplete count)
    this.currentWorld.blocks.set(key, currentSlot.type);
    this.createBlockMesh(placeX, placeY, placeZ, currentSlot.type);

    this.player.triggerMineAnimation();
    sound.playPlaceBlock();
    this.showMessage(`🧱 ${currentSlot.emoji || ''} ${currentSlot.name} koyuldu!`, currentSlot.emoji || '🧱', '#10b981');
    this.notifyState();
  }

  public cycleSlotBlock(slotIndex: number) {
    if (slotIndex < 0 || slotIndex >= this.state.inventory.length) return;
    const current = this.state.inventory[slotIndex];
    const currentIndex = AVAILABLE_BLOCKS.findIndex(b => b.type === current.type);
    const nextDef = AVAILABLE_BLOCKS[(currentIndex + 1) % AVAILABLE_BLOCKS.length];

    this.state.inventory[slotIndex] = {
      type: nextDef.type,
      name: nextDef.name,
      count: 999,
      iconColor: nextDef.iconColor,
      emoji: nextDef.emoji
    };
    this.state.selectedSlot = slotIndex;
    sound.playBlockSwitch();
    voice.speakElement(nextDef.name, nextDef.type);
    this.showMessage(`✨ Yeni Blok: ${nextDef.emoji} ${nextDef.name} (Sınırsız!)`, nextDef.emoji, nextDef.iconColor);
    this.notifyState();
  }

  public setSlotBlock(slotIndex: number, type: BlockType) {
    if (slotIndex < 0 || slotIndex >= this.state.inventory.length) return;
    const def = AVAILABLE_BLOCKS.find(b => b.type === type);
    if (!def) return;

    this.state.inventory[slotIndex] = {
      type: def.type,
      name: def.name,
      count: 999,
      iconColor: def.iconColor,
      emoji: def.emoji
    };
    this.state.selectedSlot = slotIndex;
    sound.playBlockSwitch();
    voice.speakElement(def.name, def.type);
    this.showMessage(`✨ ${def.emoji} ${def.name} seçildi! (Sınırsız)`, def.emoji, def.iconColor);
    this.notifyState();
  }

  private spawnJumpParticles(pos: THREE.Vector3) {
    const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.4,
        pos.y + 0.1,
        pos.z + (Math.random() - 0.5) * 0.4
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2.5,
        Math.random() * 1.5,
        (Math.random() - 0.5) * 2.5
      );
      this.scene.add(mesh);
      this.activeParticles.push({ mesh, velocity: vel, life: 0, maxLife: 0.45 });
    }
  }

  private spawnBlockBreakParticles(x: number, y: number, z: number, type: BlockType) {
    let color = 0x866043;
    if (type === 'grass') color = 0x4da824;
    if (type === 'stone') color = 0x7a7a7a;
    if (type === 'wood') color = 0x6b4f2c;
    if (type === 'leaves') color = 0x2f7a1e;
    if (type === 'honey') color = 0xf59e0b;
    if (type === 'diamond') color = 0x38bdf8;
    if (type === 'crystal') color = 0xd946ef;

    const geo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const mat = new THREE.MeshBasicMaterial({ color });
    for (let i = 0; i < 14; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        x + (Math.random() - 0.5) * 0.6,
        y + (Math.random() - 0.5) * 0.6,
        z + (Math.random() - 0.5) * 0.6
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3.5 + 1,
        (Math.random() - 0.5) * 4
      );
      this.scene.add(mesh);
      this.activeParticles.push({ mesh, velocity: vel, life: 0, maxLife: 0.65 });
    }
  }

  private switchDimension(target: 'overworld' | 'portalWorld') {
    if (this.portalCooldown > 0) return;
    this.portalCooldown = 3.0; // 3 seconds immunity

    sound.playPortalTeleport();
    this.currentDimension = target;
    this.state.dimension = target;

    if (target === 'portalWorld') {
      this.currentWorld = this.portalWorldData;
      this.state.currentDimensionName = '🔮 Gizemli Ayı & Bal Boyutu';
      voice.speakEvent('portal_entered');
      this.showMessage('🌀 Gizemli Ayı Boyutuna ışınlandın! Kutsal Tacı bul!', '👑', '#c084fc');
    } else {
      this.currentWorld = this.overworldData;
      this.state.currentDimensionName = '🌲 Orman Dünyası (Ana Boyut)';
      this.showMessage('🌲 Orman Dünyasına geri döndün!', '🐻', '#4ade80');
    }

    this.loadWorld(this.currentWorld);
  }

  private checkPortalTrigger() {
    if (this.portalCooldown > 0) return;
    const portal = this.currentWorld.portalLocation;
    const dx = this.playerPos.x - portal.x;
    const dy = this.playerPos.y - portal.y;
    const dz = this.playerPos.z - portal.z;
    const distSq = dx * dx + dz * dz;

    // Check if player enters portal column
    if (distSq < 1.4 && Math.abs(dy) < 2.0) {
      if (this.currentDimension === 'overworld') {
        this.switchDimension('portalWorld');
      } else {
        this.switchDimension('overworld');
      }
    }
  }

  private checkCollectibles() {
    this.currentWorld.collectibles.forEach(item => {
      if (item.collected) return;
      const dx = this.playerPos.x - (item.x + 0.5);
      const dy = (this.playerPos.y + 0.8) - item.y;
      const dz = this.playerPos.z - (item.z + 0.5);
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 1.4) {
        item.collected = true;
        const mesh = this.collectibleMeshes.get(item.id);
        if (mesh) {
          this.scene.remove(mesh);
          this.collectibleMeshes.delete(item.id);
        }

        if (item.type === 'coin') {
          this.state.coins += 1;
          sound.playCoin();
        } else if (item.type === 'honey') {
          this.state.honey += 1;
          sound.playHoney();
          voice.speakEvent('honey_found');
          this.showMessage('🍯 Tatlı bir Bal Çömleği topladın!', '🍯', '#f59e0b');
        } else if (item.type === 'bearFriend') {
          this.state.rescuedBears += 1;
          sound.playRescueBear();
          this.showMessage(`🐻 Yaşasın! ${item.name || 'Ayı Arkadaş'} kurtarıldı!`, '🎉', '#fb7185');
          // If all 4 are saved:
          if (this.state.rescuedBears >= this.state.totalBearsToRescue) {
            voice.speakEvent('all_bears_rescued');
            this.showMessage('⭐ Bütün küçük ayıları kurtardın! Şimdi Portaldan geç!', '🌟', '#38bdf8');
          } else {
            voice.speakEvent('bear_rescued', item.name);
          }
        } else if (item.type === 'crown') {
          this.state.hasFoundCrown = true;
          sound.playRescueBear();
          voice.speakEvent('crown_found');
          this.showMessage('👑 TEBRİKLER ELİF DUA! Kutsal Ayı Tacını kazandın!', '👑', '#fbbf24');
          if (this.onWin) {
            this.onWin();
          }
        }

        this.notifyState();
      }
    });
  }

  private updateRaycastTarget() {
    this.raycaster.setFromCamera(this.mouseCoords, this.camera);
    const intersects = this.raycaster.intersectObjects(Array.from(this.blockMeshes.values()));

    if (intersects.length > 0) {
      const hit = intersects[0];
      // Target if within reach of player (within 16 blocks)
      if (hit.point) {
        const distToPlayer = hit.point.distanceTo(this.playerPos);
        if (distToPlayer <= 16.0) {
          const normal = hit.face?.normal ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0);

          let bx = 0;
          let by = 0;
          let bz = 0;
          if (hit.object.userData && hit.object.userData.isBlock) {
            bx = hit.object.userData.x;
            by = hit.object.userData.y;
            bz = hit.object.userData.z;
          } else {
            const blockPos = hit.point.clone().sub(normal.clone().multiplyScalar(0.2));
            bx = Math.floor(blockPos.x);
            by = Math.floor(blockPos.y);
            bz = Math.floor(blockPos.z);
          }

          const nx = Math.round(normal.x);
          const ny = Math.round(normal.y);
          const nz = Math.round(normal.z);

          this.targetedBlockPos = { x: bx, y: by, z: bz };
          this.targetedBlockNormal = { x: nx, y: ny, z: nz };

          this.highlightBox.position.set(bx + 0.5, by + 0.5, bz + 0.5);
          this.highlightBox.visible = true;
          return;
        }
      }
    }

    this.targetedBlockPos = null;
    this.targetedBlockNormal = null;
    this.highlightBox.visible = false;
  }

  private updatePhysics(delta: number) {
    // 1. Movement vector from camera yaw
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (this.input.forward) moveDir.z -= 1;
    if (this.input.backward) moveDir.z += 1;
    if (this.input.left) moveDir.x -= 1;
    if (this.input.right) moveDir.x += 1;

    const isMoving = moveDir.lengthSq() > 0;
    if (isMoving) {
      moveDir.normalize();
      // Rotate by camera yaw
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);

      const speed = 7.0;
      this.playerVel.x = moveDir.x * speed;
      this.playerVel.z = moveDir.z * speed;

      // Face movement direction smoothly
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.player.mesh.rotation.y = THREE.MathUtils.lerp(
        this.player.mesh.rotation.y,
        targetAngle,
        15 * delta
      );
    } else {
      this.playerVel.x = THREE.MathUtils.lerp(this.playerVel.x, 0, 12 * delta);
      this.playerVel.z = THREE.MathUtils.lerp(this.playerVel.z, 0, 12 * delta);
    }

    // 2. Gravity
    this.playerVel.y -= 24 * delta; // standard responsive gravity

    // 3. Complete AABB Voxel Collision Resolution (Minecraft standard)
    // 3A. Horizontal Collision X
    const dx = this.playerVel.x * delta;
    if (Math.abs(dx) > 1e-5) {
      const targetX = this.playerPos.x + dx;
      if (!this.checkPlayerCollisionAt(targetX, this.playerPos.y, this.playerPos.z)) {
        this.playerPos.x = targetX;
      } else {
        // Check 1-block auto step-up for smooth walking over 1-block terrain steps
        let stepped = false;
        if (this.isGrounded) {
          const stepHeight = 1.0;
          const currentHeadClear = !this.checkPlayerCollisionAt(this.playerPos.x, this.playerPos.y + stepHeight, this.playerPos.z);
          const targetClear = !this.checkPlayerCollisionAt(targetX, this.playerPos.y + stepHeight, this.playerPos.z);
          if (currentHeadClear && targetClear) {
            this.playerPos.y += stepHeight;
            this.playerPos.x = targetX;
            stepped = true;
          }
        }
        if (!stepped) {
          // Clamp directly against obstacle face - zero penetration
          if (dx > 0) {
            const bx = Math.floor(targetX + this.playerRadius);
            this.playerPos.x = bx - this.playerRadius - 0.001;
          } else {
            const bx = Math.floor(targetX - this.playerRadius);
            this.playerPos.x = bx + 1 + this.playerRadius + 0.001;
          }
          this.playerVel.x = 0;
        }
      }
    }

    // 3B. Horizontal Collision Z
    const dz = this.playerVel.z * delta;
    if (Math.abs(dz) > 1e-5) {
      const targetZ = this.playerPos.z + dz;
      if (!this.checkPlayerCollisionAt(this.playerPos.x, this.playerPos.y, targetZ)) {
        this.playerPos.z = targetZ;
      } else {
        // Check 1-block auto step-up for smooth walking over 1-block terrain steps
        let stepped = false;
        if (this.isGrounded) {
          const stepHeight = 1.0;
          const currentHeadClear = !this.checkPlayerCollisionAt(this.playerPos.x, this.playerPos.y + stepHeight, this.playerPos.z);
          const targetClear = !this.checkPlayerCollisionAt(this.playerPos.x, this.playerPos.y + stepHeight, targetZ);
          if (currentHeadClear && targetClear) {
            this.playerPos.y += stepHeight;
            this.playerPos.z = targetZ;
            stepped = true;
          }
        }
        if (!stepped) {
          // Clamp directly against obstacle face - zero penetration
          if (dz > 0) {
            const bz = Math.floor(targetZ + this.playerRadius);
            this.playerPos.z = bz - this.playerRadius - 0.001;
          } else {
            const bz = Math.floor(targetZ - this.playerRadius);
            this.playerPos.z = bz + 1 + this.playerRadius + 0.001;
          }
          this.playerVel.z = 0;
        }
      }
    }

    // 3C. Vertical Collision Y
    const dy = this.playerVel.y * delta;
    if (dy < 0) {
      // Falling down: check landing on any block under entire foot footprint
      const r = this.playerRadius;
      const startX = Math.floor(this.playerPos.x - r + 1e-4);
      const endX = Math.floor(this.playerPos.x + r - 1e-4);
      const startZ = Math.floor(this.playerPos.z - r + 1e-4);
      const endZ = Math.floor(this.playerPos.z + r - 1e-4);

      let maxLandingY = -Infinity;
      let landingBlockType: BlockType | null = null;
      const targetY = this.playerPos.y + dy;

      for (let bx = startX; bx <= endX; bx++) {
        for (let bz = startZ; bz <= endZ; bz++) {
          const minBY = Math.floor(targetY);
          const maxBY = Math.ceil(this.playerPos.y + 0.1);
          for (let by = minBY; by <= maxBY; by++) {
            const type = this.currentWorld.blocks.get(`${bx},${by},${bz}`);
            if (type) {
              const topY = by + 1.0;
              if (topY <= this.playerPos.y + 0.15 && topY >= targetY - 1e-3) {
                if (topY > maxLandingY) {
                  maxLandingY = topY;
                  landingBlockType = type;
                }
              }
            }
          }
        }
      }

      if (maxLandingY !== -Infinity) {
        this.playerPos.y = maxLandingY;
        this.isGrounded = true;
        this.canDoubleJump = true;

        if (landingBlockType === 'honey') {
          this.playerVel.y = 14.5;
          this.isGrounded = false;
          sound.playHoneyBounce();
          this.spawnJumpParticles(this.playerPos);
          this.showMessage('🍯 Bal Bloğu Süper Zıplatması!', '✨', '#f59e0b');
        } else {
          this.playerVel.y = 0;
        }
      } else {
        this.playerPos.y = targetY;
        this.isGrounded = false;
      }
    } else if (dy > 0) {
      // Jumping up: check ceiling collision above head
      const r = this.playerRadius;
      const h = this.playerHeight;
      const startX = Math.floor(this.playerPos.x - r + 1e-4);
      const endX = Math.floor(this.playerPos.x + r - 1e-4);
      const startZ = Math.floor(this.playerPos.z - r + 1e-4);
      const endZ = Math.floor(this.playerPos.z + r - 1e-4);

      let minCeilingY = Infinity;
      const targetY = this.playerPos.y + dy;
      const currentHeadY = this.playerPos.y + h;
      const targetHeadY = targetY + h;

      for (let bx = startX; bx <= endX; bx++) {
        for (let bz = startZ; bz <= endZ; bz++) {
          const minBY = Math.floor(currentHeadY - 0.1);
          const maxBY = Math.ceil(targetHeadY + 0.1);
          for (let by = minBY; by <= maxBY; by++) {
            if (this.currentWorld.blocks.has(`${bx},${by},${bz}`)) {
              const bottomY = by;
              if (bottomY >= currentHeadY - 0.15 && bottomY <= targetHeadY + 1e-3) {
                if (bottomY < minCeilingY) {
                  minCeilingY = bottomY;
                }
              }
            }
          }
        }
      }

      if (minCeilingY !== Infinity) {
        this.playerPos.y = minCeilingY - h - 0.001;
        this.playerVel.y = 0;
      } else {
        this.playerPos.y = targetY;
      }
    }

    // 3D. Anti-stuck safeguard: ensure player is NEVER embedded inside any block
    if (this.checkPlayerCollisionAt(this.playerPos.x, this.playerPos.y, this.playerPos.z)) {
      for (let up = 0.1; up <= 1.5; up += 0.1) {
        if (!this.checkPlayerCollisionAt(this.playerPos.x, this.playerPos.y + up, this.playerPos.z)) {
          this.playerPos.y += up;
          this.playerVel.y = 0;
          this.isGrounded = true;
          break;
        }
      }
    }

    // Void respawn check
    if (this.playerPos.y < -15) {
      this.playerPos.set(this.currentWorld.spawnPoint.x, this.currentWorld.spawnPoint.y + 2, this.currentWorld.spawnPoint.z);
      this.playerVel.set(0, 0, 0);
      this.showMessage('Hop! Düştün ama merak etme, Super Bear tekrar doğdu!', '🐻');
    }

    // Update player 3D mesh position
    this.player.mesh.position.copy(this.playerPos);
    this.player.update(delta, isMoving, !this.isGrounded, this.player.isMining);

    // 4. Update Camera position
    const targetCamLook = this.playerPos.clone().add(new THREE.Vector3(0, 1.2, 0));
    const offset = new THREE.Vector3(
      Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance,
      Math.sin(this.cameraPitch) * this.cameraDistance,
      Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance
    );
    this.camera.position.copy(targetCamLook).add(offset);
    this.camera.lookAt(targetCamLook);
  }

  private checkPlayerCollisionAt(x: number, y: number, z: number): boolean {
    const r = this.playerRadius;
    const h = this.playerHeight;
    return this.isAABBColliding(x - r, y, z - r, x + r, y + h, z + r);
  }

  private isAABBColliding(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): boolean {
    const eps = 1e-4;
    const startX = Math.floor(minX + eps);
    const endX = Math.floor(maxX - eps);
    const startY = Math.floor(minY + eps);
    const endY = Math.floor(maxY - eps);
    const startZ = Math.floor(minZ + eps);
    const endZ = Math.floor(maxZ - eps);

    for (let bx = startX; bx <= endX; bx++) {
      for (let by = startY; by <= endY; by++) {
        for (let bz = startZ; bz <= endZ; bz++) {
          if (this.currentWorld.blocks.has(`${bx},${by},${bz}`)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private getBlockAt(x: number, y: number, z: number): BlockType | null {
    const bx = Math.floor(x);
    const by = Math.floor(y);
    const bz = Math.floor(z);
    return this.currentWorld.blocks.get(`${bx},${by},${bz}`) || null;
  }

  private updateParticles(delta: number) {
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.activeParticles.splice(i, 1);
      } else {
        p.velocity.y -= 14 * delta; // particle gravity
        p.mesh.position.addScaledVector(p.velocity, delta);
        const scale = 1 - (p.life / p.maxLife);
        p.mesh.scale.setScalar(Math.max(0.01, scale));
      }
    }

    // Animate collectibles (spinning & bobbing)
    const time = performance.now() * 0.003;
    this.collectibleMeshes.forEach(mesh => {
      mesh.rotation.y += delta * 2.5;
      mesh.position.y += Math.sin(time * 3 + mesh.position.x) * 0.003;
    });

    // Animate portal particles
    if (this.portalParticles) {
      const posAttr = this.portalParticles.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const portalLoc = this.currentWorld.portalLocation;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] += delta * 1.5; // float upward
        if (arr[i + 1] > portalLoc.y + 3.0) {
          arr[i + 1] = portalLoc.y;
          arr[i] = portalLoc.x + (Math.random() - 0.5) * 1.8;
          arr[i + 2] = portalLoc.z + (Math.random() - 0.5) * 0.8;
        }
      }
      posAttr.needsUpdate = true;
    }
  }

  private showMessage(text: string, icon: string = '✨', color?: string) {
    if (this.onMessage) {
      this.onMessage({ text, icon, color });
    }
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  private checkProximityGuidance(delta: number) {
    this.proximityTimer += delta;
    if (this.proximityTimer < 1.5) return;
    this.proximityTimer = 0;

    // Check near uncollected bears
    for (const item of this.currentWorld.collectibles) {
      if (item.type === 'bearFriend' && !item.collected && !this.warnedBearIds.has(item.id)) {
        const dx = this.playerPos.x - (item.x + 0.5);
        const dy = this.playerPos.y - item.y;
        const dz = this.playerPos.z - (item.z + 0.5);
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 7.0) {
          this.warnedBearIds.add(item.id);
          voice.speak('Dikkat et Elif Dua! Yakında kurtarılmayı bekleyen bir ayı arkadaşın var!', false);
          return;
        }
      }
    }

    // Check near Portal
    if (this.currentDimension === 'overworld' && !this.warnedPortal) {
      const portal = this.currentWorld.portalLocation;
      const dx = this.playerPos.x - portal.x;
      const dy = this.playerPos.y - portal.y;
      const dz = this.playerPos.z - portal.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 8.0) {
        this.warnedPortal = true;
        voice.speak('İşte dağın zirvesindeki gizemli portal! İçine girerek sihirli dünyaya ışınlanabilirsin!', false);
        return;
      }
    }

    // Check near Bear Mansion
    if (this.currentDimension === 'overworld' && !this.warnedHouse) {
      const dx = this.playerPos.x - 8;
      const dz = this.playerPos.z - 4;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 7.0) {
        this.warnedHouse = true;
        voice.speak('Elif Dua, Ayıcığın büyük köşküne geldin! İçerideki yatakta bekleyen ayı arkadaşını kurtarabilirsin!', false);
        return;
      }
    }
  }

  private animate = () => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.portalCooldown > 0) {
      this.portalCooldown = Math.max(0, this.portalCooldown - delta);
    }

    this.updatePhysics(delta);
    this.updateRaycastTarget();
    this.checkCollectibles();
    this.checkPortalTrigger();
    this.checkProximityGuidance(delta);
    this.updateParticles(delta);

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public destroy() {
    this.isRunning = false;
    window.removeEventListener('resize', this.onWindowResize);
    this.eventCleanups.forEach(cleanup => {
      try {
        cleanup();
      } catch (err) {
        console.error('Error during event cleanup', err);
      }
    });
    this.eventCleanups = [];
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
