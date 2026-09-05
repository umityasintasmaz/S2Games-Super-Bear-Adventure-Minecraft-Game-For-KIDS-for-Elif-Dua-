import * as THREE from 'three';
import { BlockType } from './types';

// Helper to create pixel textures dynamically via Canvas 2D
function createPixelTexture(
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  size: number = 32
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  draw(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

export class TextureLibrary {
  private static materials: Map<string, THREE.Material | THREE.Material[]> = new Map();

  static init() {
    if (this.materials.size > 0) return;

    // Grass Top
    const grassTopTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#4da824';
      ctx.fillRect(0, 0, size, size);
      const greens = ['#3d8b1c', '#5ab82e', '#367c19', '#68c738'];
      for (let i = 0; i < 70; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
        ctx.fillRect(x, y, 1 + (i % 2), 1 + (i % 2));
      }
    });

    // Dirt
    const dirtTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#866043';
      ctx.fillRect(0, 0, size, size);
      const browns = ['#6d4e35', '#966d4c', '#5a3d28', '#7c573c'];
      for (let i = 0; i < 90; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        ctx.fillStyle = browns[Math.floor(Math.random() * browns.length)];
        ctx.fillRect(x, y, 1 + (i % 3 === 0 ? 1 : 0), 1 + (i % 2));
      }
    });

    // Grass Side (dirt + dripping grass on top)
    const grassSideTex = createPixelTexture((ctx, size) => {
      // Dirt base
      ctx.fillStyle = '#866043';
      ctx.fillRect(0, 0, size, size);
      const browns = ['#6d4e35', '#966d4c', '#5a3d28', '#7c573c'];
      for (let i = 0; i < 60; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        ctx.fillStyle = browns[Math.floor(Math.random() * browns.length)];
        ctx.fillRect(x, y, 1, 1);
      }
      // Grass dripping top (first ~7-10 pixels)
      ctx.fillStyle = '#4da824';
      ctx.fillRect(0, 0, size, 6);
      for (let x = 0; x < size; x++) {
        const drop = Math.floor(Math.sin(x * 0.8) * 3 + Math.random() * 3 + 6);
        ctx.fillRect(x, 0, 1, Math.min(size - 2, drop));
      }
      // Highlights
      ctx.fillStyle = '#5ab82e';
      for (let x = 0; x < size; x += 2) {
        ctx.fillRect(x, 1, 1, 2);
      }
    });

    // Stone
    const stoneTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(0, 0, size, size);
      const grays = ['#656565', '#8e8e8e', '#555555', '#9d9d9d'];
      for (let i = 0; i < 100; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        ctx.fillStyle = grays[Math.floor(Math.random() * grays.length)];
        ctx.fillRect(x, y, 1 + (i % 3 === 0 ? 2 : 1), 1 + (i % 2));
      }
    });

    // Wood Side
    const woodSideTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#6b4f2c';
      ctx.fillRect(0, 0, size, size);
      for (let x = 0; x < size; x += 4) {
        ctx.fillStyle = x % 8 === 0 ? '#50381c' : '#7f5e36';
        ctx.fillRect(x, 0, 2, size);
      }
      for (let i = 0; i < 40; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        ctx.fillStyle = Math.random() > 0.5 ? '#432f17' : '#8c673b';
        ctx.fillRect(x, y, 1, 2);
      }
    });

    // Wood Top (tree ring)
    const woodTopTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#bfa175';
      ctx.fillRect(0, 0, size, size);
      // Bark rim
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#50381c';
      ctx.strokeRect(2, 2, size - 4, size - 4);
      // Rings
      ctx.strokeStyle = '#9d8058';
      ctx.strokeRect(6, 6, size - 12, size - 12);
      ctx.strokeRect(10, 10, size - 20, size - 20);
      ctx.fillStyle = '#826540';
      ctx.fillRect(size / 2 - 2, size / 2 - 2, 4, 4);
    });

    // Leaves
    const leavesTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#2f7a1e';
      ctx.fillRect(0, 0, size, size);
      const greens = ['#225d15', '#3d9428', '#1c4911', '#4eb634'];
      for (let i = 0; i < 120; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
        ctx.fillRect(x, y, 1 + (i % 2), 1 + (i % 2));
      }
    });

    // Honey Block (Super Bear Adventure style - bouncy golden amber)
    const honeyTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(2, 2, size - 4, size - 4);
      ctx.fillStyle = '#fde68a';
      // glossy honey shine
      ctx.fillRect(4, 4, 6, 4);
      ctx.fillRect(10, 4, 4, 2);
      ctx.fillStyle = '#d97706';
      ctx.strokeRect(0, 0, size, size);
      // hexagon honeycomb pattern
      for (let i = 8; i < size; i += 8) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(i, 8, 2, 2);
        ctx.fillRect(i - 4, 16, 2, 2);
        ctx.fillRect(i, 24, 2, 2);
      }
    });

    // Diamond Ore
    const diamondTex = createPixelTexture((ctx, size) => {
      // Stone background
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#656565' : '#8e8e8e';
        ctx.fillRect(Math.floor(Math.random() * size), Math.floor(Math.random() * size), 2, 2);
      }
      // Cyan diamond flecks
      const gems = ['#38bdf8', '#0ea5e9', '#7dd3fc', '#0284c7', '#ffffff'];
      const gemCoords = [
        [6, 8], [7, 8], [6, 9], [7, 9],
        [18, 5], [19, 5], [18, 6],
        [12, 18], [13, 18], [14, 19],
        [22, 22], [23, 22], [22, 23], [24, 23],
        [5, 23], [6, 24]
      ];
      gemCoords.forEach(([x, y]) => {
        ctx.fillStyle = gems[Math.floor(Math.random() * gems.length)];
        ctx.fillRect(x, y, 2, 2);
      });
    });

    // Brick
    const brickTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#9b3824';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#c7cbd1'; // mortar
      for (let y = 0; y < size; y += 8) {
        ctx.fillRect(0, y, size, 1);
        const offset = (y / 8) % 2 === 0 ? 0 : 8;
        for (let x = offset; x < size; x += 16) {
          ctx.fillRect(x, y, 1, 8);
        }
      }
    });

    // TNT
    const tntSideTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 0, size, size);
      // White label in center
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 11, size, 10);
      // TNT text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TNT', size / 2, 16);
    });

    const tntTopTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#111827';
      ctx.fillRect(size / 2 - 2, size / 2 - 2, 4, 4); // fuse center
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(size / 2 - 1, size / 2 - 1, 2, 2);
    });

    // Portal (Obsidian & Nether swirl)
    const portalTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#4c1d95';
      ctx.fillRect(0, 0, size, size);
      const purples = ['#6d28d9', '#8b5cf6', '#a855f7', '#c084fc', '#3b0764'];
      for (let i = 0; i < 80; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        ctx.fillStyle = purples[Math.floor(Math.random() * purples.length)];
        ctx.fillRect(x, y, 2, 2);
      }
    });

    // Crystal Block (Secret dimension)
    const crystalTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#86198f';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#e879f9';
      for (let i = 0; i < size; i += 4) {
        ctx.fillRect(i, i, 2, 2);
        ctx.fillRect(size - i - 2, i, 2, 2);
      }
      ctx.fillStyle = '#f5d0fe';
      ctx.fillRect(size / 2 - 3, size / 2 - 3, 6, 6);
    });

    // Gold Block
    const goldTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(2, 2, size - 4, size - 4);
      ctx.fillStyle = '#ca8a04';
      ctx.strokeRect(1, 1, size - 2, size - 2);
      ctx.strokeRect(6, 6, size - 12, size - 12);
    });

    // Sand Block (Kum)
    const sandTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0, 0, size, size);
      const sandColors = ['#fef9c3', '#fde047', '#eab308', '#ca8a04'];
      for (let i = 0; i < 90; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        ctx.fillStyle = sandColors[Math.floor(Math.random() * sandColors.length)];
        ctx.fillRect(x, y, 1 + (i % 2), 1 + (i % 2));
      }
    });

    // Copper Block (Bakır)
    const copperTex = createPixelTexture((ctx, size) => {
      ctx.fillStyle = '#c2410c'; // rich copper reddish-orange
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(2, 2, size - 4, size - 4);
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(4, 4, size - 8, size - 8);
      ctx.fillStyle = '#9a3412';
      ctx.strokeRect(1, 1, size - 2, size - 2);
      ctx.strokeRect(6, 6, size - 12, size - 12);
      // Copper rivet highlights
      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(3, 3, 2, 2);
      ctx.fillRect(size - 5, 3, 2, 2);
      ctx.fillRect(3, size - 5, 2, 2);
      ctx.fillRect(size - 5, size - 5, 2, 2);
    });

    // Materials registry
    const standardOpts = { roughness: 0.8, metalness: 0.1 };

    // Grass block (multi-material: px, nx, py(top), ny(bottom), pz, nz)
    const grassMatSide = new THREE.MeshLambertMaterial({ map: grassSideTex });
    const grassMatTop = new THREE.MeshLambertMaterial({ map: grassTopTex });
    const dirtMat = new THREE.MeshLambertMaterial({ map: dirtTex });
    this.materials.set('grass', [
      grassMatSide, grassMatSide, grassMatTop, dirtMat, grassMatSide, grassMatSide
    ]);

    this.materials.set('dirt', dirtMat);
    this.materials.set('stone', new THREE.MeshLambertMaterial({ map: stoneTex }));
    this.materials.set('sand', new THREE.MeshLambertMaterial({ map: sandTex }));

    const woodSideMat = new THREE.MeshLambertMaterial({ map: woodSideTex });
    const woodTopMat = new THREE.MeshLambertMaterial({ map: woodTopTex });
    this.materials.set('wood', [
      woodSideMat, woodSideMat, woodTopMat, woodTopMat, woodSideMat, woodSideMat
    ]);

    this.materials.set('leaves', new THREE.MeshLambertMaterial({ 
      map: leavesTex, 
      transparent: true,
      opacity: 0.95
    }));

    // Honey: transparent, shiny
    this.materials.set('honey', new THREE.MeshStandardMaterial({
      map: honeyTex,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
      metalness: 0.1,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.2
    }));

    this.materials.set('diamond', new THREE.MeshStandardMaterial({
      map: diamondTex,
      roughness: 0.6,
      metalness: 0.3,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.15
    }));

    this.materials.set('brick', new THREE.MeshLambertMaterial({ map: brickTex }));

    const tntSideMat = new THREE.MeshLambertMaterial({ map: tntSideTex });
    const tntTopMat = new THREE.MeshLambertMaterial({ map: tntTopTex });
    this.materials.set('tnt', [
      tntSideMat, tntSideMat, tntTopMat, dirtMat, tntSideMat, tntSideMat
    ]);

    this.materials.set('portal', new THREE.MeshStandardMaterial({
      map: portalTex,
      emissive: new THREE.Color(0x9333ea),
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    }));

    this.materials.set('crystal', new THREE.MeshStandardMaterial({
      map: crystalTex,
      emissive: new THREE.Color(0xd946ef),
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.4
    }));

    this.materials.set('gold', new THREE.MeshStandardMaterial({
      map: goldTex,
      roughness: 0.3,
      metalness: 0.8,
      emissive: new THREE.Color(0xeab308),
      emissiveIntensity: 0.2
    }));

    this.materials.set('copper', new THREE.MeshStandardMaterial({
      map: copperTex,
      roughness: 0.35,
      metalness: 0.85,
      emissive: new THREE.Color(0xb45309),
      emissiveIntensity: 0.15
    }));
  }

  static getMaterial(type: BlockType): THREE.Material | THREE.Material[] {
    this.init();
    return this.materials.get(type) || this.materials.get('stone')!;
  }
}
