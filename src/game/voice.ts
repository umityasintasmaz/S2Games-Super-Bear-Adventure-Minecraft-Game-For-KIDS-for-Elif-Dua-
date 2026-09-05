/**
 * Turkish Voice Guidance System for Elif Dua (Super Bear Craft)
 * Uses Web Speech API with cheerful, friendly Turkish child-directed speech.
 */

class VoiceGuide {
  private synth: SpeechSynthesis | null = null;
  public enabled: boolean = true;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private cachedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoice();
      }
      this.loadVoice();
    }
  }

  private loadVoice(): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    // Prefer Turkish voices: tr-TR or any Turkish voice
    const trVoice = voices.find(v => v.lang.toLowerCase().startsWith('tr')) || null;
    this.cachedVoice = trVoice;
    return trVoice;
  }

  public speak(text: string, priority: boolean = false) {
    if (!this.enabled || !this.synth) return;

    const now = Date.now();
    // Avoid rapid duplicate speech unless priority
    if (!priority && text === this.lastSpokenText && now - this.lastSpokenTime < 2000) {
      return;
    }
    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    try {
      if (priority || this.synth.speaking) {
        this.synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 1.05; // Lively, clear pace
      utterance.pitch = 1.2; // Cheerful friendly voice for children

      const voice = this.cachedVoice || this.loadVoice();
      if (voice) {
        utterance.voice = voice;
      }

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Element / Blok seçildiğinde sesli söyleme:
   * "Altın mı kum mu bakır mı..."
   */
  public speakElement(elementName: string, type?: string) {
    const lower = (type || elementName).toLowerCase();

    if (lower.includes('gold') || lower.includes('altın')) {
      this.speak('Altın bloğu seçildi! Işıl ışıl parıldayan saf altın.', true);
    } else if (lower.includes('sand') || lower.includes('kum')) {
      this.speak('Kum bloğu seçildi! Yumuşacık sarı sahil kumu.', true);
    } else if (lower.includes('copper') || lower.includes('bakır')) {
      this.speak('Bakır bloğu seçildi! Parlak turuncu bakır madeni.', true);
    } else if (lower.includes('diamond') || lower.includes('elmas')) {
      this.speak('Elmas bloğu seçildi! En değerli mavi elmas.', true);
    } else if (lower.includes('honey') || lower.includes('bal')) {
      this.speak('Zıplayan bal seçildi! Üzerine basınca göğe zıplatır.', true);
    } else if (lower.includes('grass') || lower.includes('çimen')) {
      this.speak('Çimen bloğu seçildi! Doğal yeşil çimen.', true);
    } else if (lower.includes('wood') || lower.includes('odun') || lower.includes('meşe')) {
      this.speak('Meşe odunu seçildi! Güçlü ağaç kütüğü.', true);
    } else if (lower.includes('stone') || lower.includes('taş')) {
      this.speak('Taş bloğu seçildi! Sağlam gri kaya.', true);
    } else if (lower.includes('brick') || lower.includes('tuğla')) {
      this.speak('Tuğla bloğu seçildi! Ev ve köşk tuğlası.', true);
    } else if (lower.includes('tnt')) {
      this.speak('Eğlenceli patlayıcı TNT seçildi!', true);
    } else if (lower.includes('crystal') || lower.includes('kristal')) {
      this.speak('Büyülü mor kristal seçildi!', true);
    } else if (lower.includes('leaves') || lower.includes('yaprak')) {
      this.speak('Ağaç yaprağı seçildi!', true);
    } else if (lower.includes('dirt') || lower.includes('toprak')) {
      this.speak('Toprak bloğu seçildi!', true);
    } else {
      this.speak(`${elementName} seçildi!`, true);
    }
  }

  /**
   * Görevlere geldiğinde sesli yönlendirme
   */
  public speakQuestGuidance(questId: string, current: number = 0, target: number = 1) {
    if (questId === 'bears') {
      if (current >= target) {
        this.speak('Tebrikler Elif Dua! Bütün küçük ayı arkadaşlarını kurtardın! Şimdi dağın zirvesindeki mor portala git!', true);
      } else {
        this.speak(`Görev: Köşkte ve ormanda bekleyen 4 sevimli ayı arkadaşını kurtar! Şu an ${current} ayı kurtardın, ${target - current} ayı kaldı.`, true);
      }
    } else if (questId === 'mine') {
      if (current >= target) {
        this.speak('Harika! Blok kırma görevini tamamladın! Şimdi altın, kum ve bakır bloklarınla köşkünü süsle!', true);
      } else {
        this.speak(`Görev: Blokları Kır ve İnşa Et! Sol tıkla blok koyabilir, sağ tıkla blokları kırabilirsin. ${target} blok kırmalısın, ${current} tanesini kırdın.`, true);
      }
    } else if (questId === 'portal') {
      this.speak('Görev: Dağın zirvesindeki gizemli mor kapıya git ve içine girerek sihirli dünyaya ışınlan!', true);
    } else if (questId === 'crown') {
      this.speak('Büyük Hedef: Uçan adaların en zirvesindeki Kutsal Ayı Tacını bul ve başına takarak oyunu kazan!', true);
    } else if (questId === 'elements' || questId === 'gold' || questId === 'sand' || questId === 'copper') {
      this.speak('Element Seçimi: Altın bloğu kraliyet odaları için, sarı kum kumsallar için, parlak bakır ise sağlam şömineler için harikadır! Aşağıdaki çubuktan istediğin elementi seçebilirsin!', true);
    } else {
      this.speak('Elif Dua, görevlerini tamamlamak için köşkü ve ormanı keşfet!', true);
    }
  }

  /**
   * Sıradaki aktif görevi Elif Dua'ya seslendirir
   */
  public speakActiveNextQuest(rescuedBears: number, totalBears: number, blocksMined: number, dimension: string, hasFoundCrown: boolean) {
    if (rescuedBears < totalBears) {
      this.speak(`Elif Dua, şu anki öncelikli görevin: Köşkteki yatakta ve ormanda bekleyen yavru ayıları kurtarmak! Kurtarılacak ${totalBears - rescuedBears} sevimli ayı kaldı.`, true);
    } else if (blocksMined < 5) {
      this.speak(`Elif Dua, sıradaki görevin: Altın, kum veya bakır blokları kırmak ve yeni yapılar inşa etmek!`, true);
    } else if (dimension !== 'portalWorld' && !hasFoundCrown) {
      this.speak('Elif Dua, bütün ayıları kurtardın! Şimdi dağın zirvesindeki mor portaldan geç ve sihirli boyuta ışınlan!', true);
    } else if (!hasFoundCrown) {
      this.speak('Elif Dua, son ve en büyük görevin: Uçan adaların tepesindeki Altın Tacı bulup başına takmak!', true);
    } else {
      this.speak('Tebrikler Elif Dua! Bütün görevleri başarıyla tamamladın ve Tacı kazandın!', true);
    }
  }

  /**
   * Önemli oyun içi olaylarda sesli yönlendirme
   */
  public speakEvent(event: 'bear_rescued' | 'all_bears_rescued' | 'honey_found' | 'portal_entered' | 'crown_found' | 'near_house' | 'near_portal', details?: string) {
    if (event === 'bear_rescued') {
      this.speak(`Aferin Elif Dua! ${details || 'Sevimli bir ayı arkadaşını'} kurtardın!`, true);
    } else if (event === 'all_bears_rescued') {
      this.speak('Yaşasın Elif Dua! Bütün ayı arkadaşlarını kurtardın! Şimdi dağın tepesindeki mor portaldan geç ve sihirli boyuta git!', true);
    } else if (event === 'honey_found') {
      this.speak('Nefis! Tatlı bir bal çömleği topladın!', false);
    } else if (event === 'portal_entered') {
      this.speak('Gizemli Mor Boyuta ışınlandın! Şimdi uçan adaların zirvesindeki Kutsal Tacı ara!', true);
    } else if (event === 'crown_found') {
      this.speak('TEBRİKLER ELİF DUA! Kutsal Ayı Tacını kazandın! Sen gerçek bir süper kahramansın!', true);
    } else if (event === 'near_portal') {
      this.speak('İşte gizemli portal burada! İçinden geçebilirsin!', false);
    }
  }
}

export const voice = new VoiceGuide();
