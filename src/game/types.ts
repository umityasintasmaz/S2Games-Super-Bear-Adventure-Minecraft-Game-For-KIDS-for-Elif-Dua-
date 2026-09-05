export type BlockType = 
  | 'grass'
  | 'dirt'
  | 'stone'
  | 'wood'
  | 'leaves'
  | 'honey'
  | 'diamond'
  | 'brick'
  | 'tnt'
  | 'portal'
  | 'crystal'
  | 'gold'
  | 'sand'
  | 'copper';

export interface BlockData {
  id: string;
  x: number;
  y: number;
  z: number;
  type: BlockType;
}

export interface CollectibleItem {
  id: string;
  type: 'coin' | 'honey' | 'bearFriend' | 'crown';
  x: number;
  y: number;
  z: number;
  collected: boolean;
  name?: string;
}

export interface DimensionWorld {
  name: string;
  skyColor: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  ambientColor: number;
  sunColor: number;
  blocks: Map<string, BlockType>;
  collectibles: CollectibleItem[];
  spawnPoint: { x: number; y: number; z: number };
  portalLocation: { x: number; y: number; z: number };
}

export interface InventorySlot {
  type: BlockType;
  name: string;
  count: number;
  iconColor: string;
  emoji?: string;
}

export interface BlockDefinition {
  type: BlockType;
  name: string;
  emoji: string;
  iconColor: string;
  description: string;
}

export const AVAILABLE_BLOCKS: BlockDefinition[] = [
  { type: 'gold', name: 'Altın Blok', emoji: '👑', iconColor: '#eab308', description: 'Değerli parıldayan altın' },
  { type: 'sand', name: 'Kum Bloğu', emoji: '🏖️', iconColor: '#fde047', description: 'Yumuşacık sarı sahil kumu' },
  { type: 'copper', name: 'Bakır Bloğu', emoji: '🟫', iconColor: '#b45309', description: 'Parlak turuncu bakır madeni' },
  { type: 'diamond', name: 'Elmas Bloğu', emoji: '💎', iconColor: '#0ea5e9', description: 'Parlak mavi elmas' },
  { type: 'honey', name: 'Zıplayan Bal', emoji: '🍯', iconColor: '#f59e0b', description: 'Üzerine basınca göğe fırlatır!' },
  { type: 'grass', name: 'Çimen Bloğu', emoji: '🌱', iconColor: '#4da824', description: 'Doğal yeşil çimen' },
  { type: 'brick', name: 'Tuğla Bloğu', emoji: '🧱', iconColor: '#9b3824', description: 'Kırmızı kale tuğlası' },
  { type: 'wood', name: 'Meşe Odunu', emoji: '🪵', iconColor: '#78350f', description: 'Güçlü ağaç kütüğü' },
  { type: 'stone', name: 'Taş Bloğu', emoji: '🪨', iconColor: '#7a7a7a', description: 'Sert gri taş blok' },
  { type: 'crystal', name: 'Mor Kristal', emoji: '🔮', iconColor: '#d946ef', description: 'Büyülü mor kristal' },
  { type: 'tnt', name: 'Eğlenceli TNT', emoji: '💣', iconColor: '#dc2626', description: 'Kırmızı patlayıcı kutu' },
  { type: 'leaves', name: 'Ağaç Yaprağı', emoji: '🍃', iconColor: '#2f7a1e', description: 'Yumuşak yeşil yaprak' },
  { type: 'dirt', name: 'Toprak Bloğu', emoji: '🟤', iconColor: '#866043', description: 'Kahverengi toprak blok' }
];

export interface GameState {
  dimension: 'overworld' | 'portalWorld';
  coins: number;
  honey: number;
  rescuedBears: number;
  totalBearsToRescue: number;
  blocksMined: number;
  hasFoundCrown: boolean;
  currentDimensionName: string;
  selectedSlot: number;
  inventory: InventorySlot[];
  hp: number;
  maxHp: number;
}
