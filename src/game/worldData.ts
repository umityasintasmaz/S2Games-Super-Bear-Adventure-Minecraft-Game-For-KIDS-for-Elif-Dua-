import { BlockType, CollectibleItem, DimensionWorld } from './types';

export function createOverworld(): DimensionWorld {
  const blocks = new Map<string, BlockType>();
  const collectibles: CollectibleItem[] = [];

  const key = (x: number, y: number, z: number) => `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
  const setBlock = (x: number, y: number, z: number, type: BlockType) => {
    blocks.set(key(x, y, z), type);
  };

  // Base ground: 40x40 area with gentle rolling hills
  const size = 20;
  for (let x = -size; x <= size; x++) {
    for (let z = -size; z <= size; z++) {
      // Height calculation with hills
      const distFromCenter = Math.sqrt(x * x + z * z);
      let height = 1;

      // Small hill in northern area where portal is
      if (z < -8 && Math.abs(x) < 10) {
        height = 4 + Math.floor(Math.sin(x * 0.4) * 1.5 + Math.cos(z * 0.4) * 1.5);
      } else if (x > 8 && z > 0) {
        // Eastern platforming mountain
        height = 3 + Math.floor(Math.sin(x * 0.5) * 2);
      } else if (distFromCenter < 5) {
        // Flat spawn clearing
        height = 1;
      } else {
        height = 1 + Math.floor(Math.sin(x * 0.3) * Math.cos(z * 0.3) * 1.5);
      }
      height = Math.max(1, height);

      // Place stone layers below, dirt in middle, grass on top
      for (let y = 0; y < height; y++) {
        if (y === height - 1) {
          setBlock(x, y, z, 'grass');
        } else if (y >= height - 3) {
          setBlock(x, y, z, 'dirt');
        } else {
          setBlock(x, y, z, 'stone');
        }
      }
      // Bedrock / deep stone
      setBlock(x, -1, z, 'stone');
    }
  }

  // Helper to build an Oak Tree
  const buildTree = (tx: number, tz: number, height: number = 4) => {
    // Find ground height
    let gy = 1;
    for (let y = 10; y >= 0; y--) {
      if (blocks.has(key(tx, y, tz))) {
        gy = y + 1;
        break;
      }
    }
    // Trunk
    for (let y = 0; y < height; y++) {
      setBlock(tx, gy + y, tz, 'wood');
    }
    // Foliage canopy
    const leafStart = gy + height - 2;
    for (let ly = leafStart; ly <= gy + height + 1; ly++) {
      const radius = ly >= gy + height ? 1 : 2;
      for (let lx = -radius; lx <= radius; lx++) {
        for (let lz = -radius; lz <= radius; lz++) {
          if (lx === 0 && lz === 0 && ly < gy + height) continue;
          if (Math.abs(lx) === radius && Math.abs(lz) === radius && Math.random() > 0.4) continue;
          setBlock(tx + lx, ly, tz + lz, 'leaves');
        }
      }
    }
    // Tree top collectible (honey or coin)
    collectibles.push({
      id: `tree_honey_${tx}_${tz}`,
      type: Math.random() > 0.5 ? 'honey' : 'coin',
      x: tx,
      y: gy + height + 2.2,
      z: tz,
      collected: false,
      name: 'Ağaç Tepesi Balı'
    });
  };

  // Place several trees around the glade
  const treeLocations = [
    [-6, 6], [-10, 3], [-7, -5], [-12, -8],
    [7, -6], [12, -4], [6, 12], [-5, 13], [14, 8], [-14, 10]
  ];
  treeLocations.forEach(([tx, tz]) => buildTree(tx, tz, 4 + Math.floor(Math.random() * 2)));

  // Platforming Honey Pillars (Super Bear style)
  const pillarX = -8;
  const pillarZ = -12;
  for (let i = 0; i < 4; i++) {
    const px = pillarX - i * 2;
    const py = 4 + i * 2;
    const pz = pillarZ + i * 2;
    setBlock(px, py, pz, 'honey');
    collectibles.push({
      id: `coin_pillar_${i}`,
      type: 'coin',
      x: px,
      y: py + 1.2,
      z: pz,
      collected: false,
      name: `Altın Para #${i + 1}`
    });
  }

  // =========================================================================
  // 🏡 ELİF DUA & AYICIK'IN BÜYÜK KÖŞKÜ (THE GRAND BEAR MANSION)
  // Geniş, ayının rahatça girip çıkabileceği, içi mobilya ve eşyalarla dolu ev
  // =========================================================================
  const houseMinX = 4;
  const houseMaxX = 12;
  const houseMinZ = 0;
  const houseMaxZ = 8;
  const floorY = 1;
  const wallTopY = 6;

  // 1. Alanı temizle ve sağlam taş temel at
  for (let x = houseMinX - 2; x <= houseMaxX + 2; x++) {
    for (let z = houseMinZ - 1; z <= houseMaxZ + 1; z++) {
      for (let y = floorY + 1; y <= wallTopY + 4; y++) {
        blocks.delete(key(x, y, z));
      }
      setBlock(x, floorY - 1, z, 'stone');
    }
  }

  // 2. Cilalı meşe ahşap zemin
  for (let x = houseMinX; x <= houseMaxX; x++) {
    for (let z = houseMinZ; z <= houseMaxZ; z++) {
      setBlock(x, floorY, z, 'wood');
    }
  }

  // Saray Halısı (Ortada Elmas ve Altın geometrik desen)
  for (let x = houseMinX + 2; x <= houseMaxX - 2; x++) {
    for (let z = houseMinZ + 2; z <= houseMaxZ - 2; z++) {
      if (x === houseMinX + 2 || x === houseMaxX - 2 || z === houseMinZ + 2 || z === houseMaxZ - 2) {
        setBlock(x, floorY, z, 'gold');
      } else {
        setBlock(x, floorY, z, 'diamond');
      }
    }
  }

  // 3. Dört Köşe Ahşap Taşıyıcı Kolonlar (Meşe Kütüğü)
  for (let y = floorY; y <= wallTopY; y++) {
    setBlock(houseMinX, y, houseMinZ, 'wood');
    setBlock(houseMaxX, y, houseMinZ, 'wood');
    setBlock(houseMinX, y, houseMaxZ, 'wood');
    setBlock(houseMaxX, y, houseMaxZ, 'wood');
  }

  // 4. Duvarlar (Sağlam Kırmızı Tuğla & Ahşap Kirişler)
  for (let y = floorY + 1; y <= wallTopY; y++) {
    // Batı Duvarı (Giriş Kapısı - x = houseMinX)
    for (let z = houseMinZ + 1; z < houseMaxZ; z++) {
      // 3 blok genişliğinde, 3 blok yüksekliğinde ferah kapı girişi (Ayı rahatça geçer!)
      const isDoorway = (z >= houseMinZ + 3 && z <= houseMinZ + 5) && (y <= floorY + 3);
      if (!isDoorway) {
        setBlock(houseMinX, y, z, y === wallTopY ? 'wood' : 'brick');
      }
    }

    // Doğu Duvarı (Manzara Penceresi - x = houseMaxX)
    for (let z = houseMinZ + 1; z < houseMaxZ; z++) {
      const isWindow = (z >= houseMinZ + 3 && z <= houseMinZ + 5) && (y >= floorY + 2 && y <= floorY + 3);
      setBlock(houseMaxX, y, z, isWindow ? 'crystal' : (y === wallTopY ? 'wood' : 'brick'));
    }

    // Kuzey Duvarı (Şömine & Pencere - z = houseMinZ)
    for (let x = houseMinX + 1; x < houseMaxX; x++) {
      const isWindow = (x >= houseMinX + 2 && x <= houseMinX + 3) && (y >= floorY + 2 && y <= floorY + 3);
      const isChimney = (x >= houseMinX + 5 && x <= houseMinX + 6);
      if (isChimney) {
        setBlock(x, y, houseMinZ, 'brick');
      } else if (isWindow) {
        setBlock(x, y, houseMinZ, 'crystal');
      } else {
        setBlock(x, y, houseMinZ, y === wallTopY ? 'wood' : 'brick');
      }
    }

    // Güney Duvarı (Güneş Penceresi - z = houseMaxZ)
    for (let x = houseMinX + 1; x < houseMaxX; x++) {
      const isWindow = (x >= houseMinX + 3 && x <= houseMinX + 5) && (y >= floorY + 2 && y <= floorY + 3);
      setBlock(x, y, houseMaxZ, isWindow ? 'crystal' : (y === wallTopY ? 'wood' : 'brick'));
    }
  }

  // 5. Giriş Sundurması & Karşılama Kemeri (Ferah Giriş):
  // Ahşap veranda direkleri
  for (let py = floorY + 1; py <= floorY + 3; py++) {
    setBlock(houseMinX - 1, py, houseMinZ + 2, 'wood');
    setBlock(houseMinX - 1, py, houseMinZ + 6, 'wood');
  }
  for (let pz = houseMinZ + 2; pz <= houseMinZ + 6; pz++) {
    setBlock(houseMinX - 1, floorY + 4, pz, 'wood');
  }
  // Kapı üstü ışıl ışıl bal fenerleri
  setBlock(houseMinX - 1, floorY + 3, houseMinZ + 3, 'honey');
  setBlock(houseMinX - 1, floorY + 3, houseMinZ + 5, 'honey');
  // Altın giriş kemeri
  setBlock(houseMinX, floorY + 4, houseMinZ + 3, 'gold');
  setBlock(houseMinX, floorY + 4, houseMinZ + 4, 'gold');
  setBlock(houseMinX, floorY + 4, houseMinZ + 5, 'gold');

  // Başlangıç noktasından evin kapısına uzanan Kırmızı & Altın Karşılama Yolu
  for (let px = 1; px < houseMinX; px++) {
    for (let pz = houseMinZ + 3; pz <= houseMinZ + 5; pz++) {
      setBlock(px, floorY, pz, pz === houseMinZ + 4 ? 'gold' : 'brick');
    }
  }

  // 6. Ahşap & Tuğla Kırma Çatısı (Peaked Roof with Overhang)
  for (let x = houseMinX - 1; x <= houseMaxX + 1; x++) {
    for (let z = houseMinZ - 1; z <= houseMaxZ + 1; z++) {
      if (x === houseMinX - 1 || x === houseMaxX + 1 || z === houseMinZ - 1 || z === houseMaxZ + 1) {
        setBlock(x, wallTopY, z, 'wood');
      }
    }
  }
  // 1. Kademe çatı (y = 7)
  for (let x = houseMinX; x <= houseMaxX; x++) {
    for (let z = houseMinZ; z <= houseMaxZ; z++) {
      if (x === houseMinX || x === houseMaxX || z === houseMinZ || z === houseMaxZ) {
        setBlock(x, wallTopY + 1, z, 'wood');
      }
    }
  }
  // 2. Kademe çatı (y = 8)
  for (let x = houseMinX + 1; x <= houseMaxX - 1; x++) {
    for (let z = houseMinZ + 1; z <= houseMaxZ - 1; z++) {
      if (x === houseMinX + 1 || x === houseMaxX - 1 || z === houseMinZ + 1 || z === houseMaxZ - 1) {
        setBlock(x, wallTopY + 2, z, 'brick');
      }
    }
  }
  // 3. Tepe omurgası (y = 9)
  for (let x = houseMinX + 2; x <= houseMaxX - 2; x++) {
    for (let z = houseMinZ + 2; z <= houseMaxZ - 2; z++) {
      setBlock(x, wallTopY + 3, z, 'wood');
    }
  }

  // Göğe Yükselen Şömine Bacası
  setBlock(houseMinX + 5, wallTopY + 3, houseMinZ, 'brick');
  setBlock(houseMinX + 5, wallTopY + 4, houseMinZ, 'brick');
  setBlock(houseMinX + 5, wallTopY + 5, houseMinZ, 'brick');
  setBlock(houseMinX + 5, wallTopY + 6, houseMinZ, 'gold'); // Altın baca şapkası

  // 7. EVİN İÇİNDEKİ EŞYALAR VE MOBİLYALAR (FURNITURE & ROOM ITEMS)

  // A. BÜYÜK AYICIK YATAĞI (Cozy Corner Bed: x=10..11, z=1..2)
  setBlock(10, floorY + 1, 1, 'brick'); // Ayak ucu
  setBlock(11, floorY + 1, 1, 'brick');
  setBlock(10, floorY + 1, 2, 'honey'); // Yumuşak zıplayan bal yatak!
  setBlock(11, floorY + 1, 2, 'honey');
  setBlock(10, floorY + 1, 3, 'wood');  // Yatak başlığı & ahşap çerçeve
  setBlock(11, floorY + 1, 3, 'wood');
  setBlock(10, floorY + 2, 3, 'wood');
  setBlock(11, floorY + 2, 3, 'wood');

  // Komodin ve Gece Lambası
  setBlock(9, floorY + 1, 1, 'wood');
  setBlock(9, floorY + 2, 1, 'honey');

  // B. YEMEK VE ÇALIŞMA MASASI + SANDALYELER (x=7, z=4)
  setBlock(7, floorY + 1, 4, 'wood');  // Masa ayağı
  setBlock(7, floorY + 2, 4, 'stone'); // Taş tabla
  // İki adet bal minderli konforlu tabure
  setBlock(7, floorY + 1, 3, 'honey');
  setBlock(7, floorY + 1, 5, 'honey');

  // C. SICAK KÖŞK ŞÖMİNESİ (Kuzey Duvarı: x=9, z=1)
  setBlock(8, floorY + 1, 1, 'brick');
  setBlock(9, floorY + 1, 1, 'brick');
  setBlock(8, floorY + 1, 2, 'gold'); // Parlayan sıcak köz
  setBlock(8, floorY + 2, 1, 'brick');
  setBlock(9, floorY + 2, 1, 'brick');

  // D. KİTAPLIK VE BAL KİLERİ (Güney Duvarı: x=9..11, z=7)
  setBlock(9, floorY + 1, 7, 'wood');
  setBlock(10, floorY + 1, 7, 'honey');
  setBlock(11, floorY + 1, 7, 'wood');
  setBlock(9, floorY + 2, 7, 'crystal');
  setBlock(10, floorY + 2, 7, 'honey');
  setBlock(11, floorY + 2, 7, 'crystal');

  // E. KRALİYET HAZİNE SANDIĞI & KUPA KAİDESİ (x=5, z=6..7)
  setBlock(5, floorY + 1, 7, 'gold');
  setBlock(5, floorY + 2, 7, 'diamond');
  setBlock(5, floorY + 1, 6, 'wood');

  // F. TAVAN AYDINLATMASI (Ortada Bal Avizesi)
  setBlock(8, wallTopY - 1, 4, 'wood');
  setBlock(8, wallTopY - 2, 4, 'honey');

  // G. Evin İçindeki Ödüller ve Sevimli Ev Arkadaşı:
  // Masadaki taze bal
  collectibles.push({
    id: 'house_honey_dining',
    type: 'honey',
    x: 7,
    y: floorY + 3.2,
    z: 4,
    collected: false,
    name: 'Elif\'in Sofrasındaki Bal 🍯'
  });

  // Hazine sandığındaki altın
  collectibles.push({
    id: 'house_coin_chest',
    type: 'coin',
    x: 5,
    y: floorY + 2.2,
    z: 6,
    collected: false,
    name: 'Hazine Sandığı Altını 🪙'
  });

  // Evin yatağında bekleyen sevimli minik ev arkadaşı
  collectibles.push({
    id: 'bear_house_poncik',
    type: 'bearFriend',
    x: 10,
    y: floorY + 2.2,
    z: 2,
    collected: false,
    name: 'Ev Arkadaşı Ayıcık Ponçik 🐻'
  });

  // Brick watchtower with rescue bear #1
  const towerX = 12;
  const towerZ = -10;
  for (let y = 3; y <= 8; y++) {
    setBlock(towerX - 1, y, towerZ - 1, 'brick');
    setBlock(towerX + 1, y, towerZ - 1, 'brick');
    setBlock(towerX - 1, y, towerZ + 1, 'brick');
    setBlock(towerX + 1, y, towerZ + 1, 'brick');
  }
  // Tower platform
  for (let bx = -1; bx <= 1; bx++) {
    for (let bz = -1; bz <= 1; bz++) {
      setBlock(towerX + bx, 8, towerZ + bz, 'brick');
    }
  }
  // Cage made of wood
  setBlock(towerX, 9, towerZ - 1, 'wood');
  setBlock(towerX, 9, towerZ + 1, 'wood');
  setBlock(towerX - 1, 9, towerZ, 'wood');
  setBlock(towerX + 1, 9, towerZ, 'wood');
  setBlock(towerX, 10, towerZ, 'wood'); // roof of cage

  // Bear Friend #1 inside tower
  collectibles.push({
    id: 'bear_1',
    type: 'bearFriend',
    x: towerX,
    y: 9,
    z: towerZ,
    collected: false,
    name: 'Küçük Ayı Pamuk'
  });

  // Bear Friend #2 inside cave/stone mound
  const caveX = -13;
  const caveZ = 5;
  for (let cx = -2; cx <= 2; cx++) {
    for (let cz = -2; cz <= 2; cz++) {
      setBlock(caveX + cx, 2, caveZ + cz, 'wood');
      setBlock(caveX + cx, 3, caveZ + cz, 'wood');
    }
  }
  collectibles.push({
    id: 'bear_2',
    type: 'bearFriend',
    x: caveX,
    y: 4.2,
    z: caveZ,
    collected: false,
    name: 'Küçük Ayı Balcan'
  });

  // Bear Friend #3 on floating honey cloud
  const cloudX = -4;
  const cloudZ = 12;
  setBlock(cloudX, 5, cloudZ, 'honey');
  setBlock(cloudX + 1, 5, cloudZ, 'honey');
  setBlock(cloudX - 1, 5, cloudZ, 'honey');
  setBlock(cloudX, 5, cloudZ + 1, 'honey');
  setBlock(cloudX, 5, cloudZ - 1, 'honey');
  collectibles.push({
    id: 'bear_3',
    type: 'bearFriend',
    x: cloudX,
    y: 6.2,
    z: cloudZ,
    collected: false,
    name: 'Küçük Ayı Şeker'
  });

  // === OBSIDIAN NETHER/BEAR PORTAL (Top of North Mountain) ===
  const portalX = 0;
  const portalY = 5;
  const portalZ = -14;

  // Obsidian frame: 4 blocks wide, 5 blocks high
  // Base
  setBlock(portalX - 1, portalY, portalZ, 'stone');
  setBlock(portalX, portalY, portalZ, 'stone');
  setBlock(portalX + 1, portalY, portalZ, 'stone');
  setBlock(portalX + 2, portalY, portalZ, 'stone');
  // Left & right pillars
  for (let py = 1; py <= 3; py++) {
    setBlock(portalX - 1, portalY + py, portalZ, 'stone');
    setBlock(portalX + 2, portalY + py, portalZ, 'stone');
    // Swirling portal block inside
    setBlock(portalX, portalY + py, portalZ, 'portal');
    setBlock(portalX + 1, portalY + py, portalZ, 'portal');
  }
  // Top bar
  setBlock(portalX - 1, portalY + 4, portalZ, 'stone');
  setBlock(portalX, portalY + 4, portalZ, 'stone');
  setBlock(portalX + 1, portalY + 4, portalZ, 'stone');
  setBlock(portalX + 2, portalY + 4, portalZ, 'stone');

  // Decorative gold & crystal steps up to the portal
  setBlock(portalX, portalY, portalZ + 1, 'gold');
  setBlock(portalX + 1, portalY, portalZ + 1, 'gold');
  setBlock(portalX, portalY - 1, portalZ + 2, 'grass');
  setBlock(portalX + 1, portalY - 1, portalZ + 2, 'grass');

  // Collectible Coins on spawn path
  for (let i = 2; i <= 8; i += 2) {
    collectibles.push({
      id: `spawn_coin_${i}`,
      type: 'coin',
      x: 0,
      y: 2,
      z: -i,
      collected: false,
      name: `Yol Parası #${i}`
    });
  }

  // Honey jars in field
  collectibles.push({
    id: 'field_honey_1',
    type: 'honey',
    x: 4,
    y: 2,
    z: 3,
    collected: false,
    name: 'Doğal Çiçek Balı'
  });
  collectibles.push({
    id: 'field_honey_2',
    type: 'honey',
    x: -4,
    y: 2,
    z: -3,
    collected: false,
    name: 'Petek Balı'
  });

  return {
    name: '🌲 Orman Dünyası (Minecraft & Ayı Köyü)',
    skyColor: 0x7dd3fc, // Sunny Minecraft sky
    fogColor: 0xbae6fd,
    fogNear: 25,
    fogFar: 50,
    ambientColor: 0xffffff,
    sunColor: 0xfffaed,
    blocks,
    collectibles,
    spawnPoint: { x: 0, y: 3, z: 2 },
    portalLocation: { x: 0.5, y: portalY + 1, z: portalZ }
  };
}

export function createPortalDimension(): DimensionWorld {
  const blocks = new Map<string, BlockType>();
  const collectibles: CollectibleItem[] = [];

  const key = (x: number, y: number, z: number) => `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
  const setBlock = (x: number, y: number, z: number, type: BlockType) => {
    blocks.set(key(x, y, z), type);
  };

  // Center Spawn Island (Floating in the Nether/Honey Dimension)
  for (let x = -4; x <= 4; x++) {
    for (let z = -4; z <= 4; z++) {
      const d = Math.sqrt(x * x + z * z);
      if (d <= 4) {
        setBlock(x, 0, z, 'crystal');
        setBlock(x, -1, z, 'crystal');
        if (d <= 2) {
          setBlock(x, -2, z, 'stone');
        }
      }
    }
  }

  // Return Portal on Spawn Island
  const portalX = 0;
  const portalY = 1;
  const portalZ = -3;
  setBlock(portalX - 1, portalY, portalZ, 'stone');
  setBlock(portalX, portalY, portalZ, 'stone');
  setBlock(portalX + 1, portalY, portalZ, 'stone');
  setBlock(portalX + 2, portalY, portalZ, 'stone');
  for (let py = 1; py <= 3; py++) {
    setBlock(portalX - 1, portalY + py, portalZ, 'stone');
    setBlock(portalX + 2, portalY + py, portalZ, 'stone');
    setBlock(portalX, portalY + py, portalZ, 'portal');
    setBlock(portalX + 1, portalY + py, portalZ, 'portal');
  }
  setBlock(portalX - 1, portalY + 4, portalZ, 'stone');
  setBlock(portalX, portalY + 4, portalZ, 'stone');
  setBlock(portalX + 1, portalY + 4, portalZ, 'stone');
  setBlock(portalX + 2, portalY + 4, portalZ, 'stone');

  // Floating Island Chain with bouncy Honey blocks leading up to the Crown Altar!
  // Island 1: Bouncy honey pad
  for (let x = 6; x <= 9; x++) {
    for (let z = -2; z <= 2; z++) {
      setBlock(x, 2, z, 'honey');
      setBlock(x, 1, z, 'crystal');
    }
  }
  collectibles.push({
    id: 'dim_coin_1',
    type: 'coin',
    x: 7.5,
    y: 3.5,
    z: 0,
    collected: false,
    name: 'Gizemli Boyut Parası'
  });

  // Island 2: Gold & diamond platform higher up
  for (let x = 8; x <= 12; x++) {
    for (let z = 6; z <= 10; z++) {
      setBlock(x, 5, z, 'gold');
      setBlock(x, 4, z, 'diamond');
    }
  }
  collectibles.push({
    id: 'dim_honey_1',
    type: 'honey',
    x: 10,
    y: 6.5,
    z: 8,
    collected: false,
    name: 'Kutsal Kristal Bal'
  });

  // Island 3: Giant stepping stone pillars
  const steps = [
    { x: 5, y: 7, z: 12 },
    { x: 0, y: 9, z: 13 },
    { x: -5, y: 11, z: 12 },
    { x: -9, y: 13, z: 7 },
  ];
  steps.forEach((step, idx) => {
    setBlock(step.x, step.y, step.z, 'honey');
    setBlock(step.x, step.y - 1, step.z, 'crystal');
    collectibles.push({
      id: `step_coin_${idx}`,
      type: 'coin',
      x: step.x,
      y: step.y + 1.5,
      z: step.z,
      collected: false
    });
  });

  // Grand Crown Temple Island at high altitude!
  const templeX = -10;
  const templeY = 15;
  const templeZ = 0;
  for (let x = -3; x <= 3; x++) {
    for (let z = -3; z <= 3; z++) {
      setBlock(templeX + x, templeY, templeZ + z, 'gold');
      setBlock(templeX + x, templeY - 1, templeZ + z, 'crystal');
    }
  }
  // Temple Pillars
  setBlock(templeX - 2, templeY + 1, templeZ - 2, 'crystal');
  setBlock(templeX - 2, templeY + 2, templeZ - 2, 'crystal');
  setBlock(templeX + 2, templeY + 1, templeZ - 2, 'crystal');
  setBlock(templeX + 2, templeY + 2, templeZ - 2, 'crystal');
  setBlock(templeX - 2, templeY + 1, templeZ + 2, 'crystal');
  setBlock(templeX - 2, templeY + 2, templeZ + 2, 'crystal');
  setBlock(templeX + 2, templeY + 1, templeZ + 2, 'crystal');
  setBlock(templeX + 2, templeY + 2, templeZ + 2, 'crystal');

  // THE GOLDEN HONEY CROWN!
  collectibles.push({
    id: 'golden_crown',
    type: 'crown',
    x: templeX,
    y: templeY + 1.8,
    z: templeZ,
    collected: false,
    name: '👑 Elif Dua Kutsal Ayı Tacı'
  });

  return {
    name: '🔮 Gizemli Bal ve Kristal Boyutu',
    skyColor: 0x2e1065, // Mystic deep purple
    fogColor: 0x581c87,
    fogNear: 15,
    fogFar: 45,
    ambientColor: 0xf5d0fe,
    sunColor: 0xfbbf24,
    blocks,
    collectibles,
    spawnPoint: { x: 0, y: 2, z: 1 },
    portalLocation: { x: 0.5, y: portalY + 1, z: portalZ }
  };
}
