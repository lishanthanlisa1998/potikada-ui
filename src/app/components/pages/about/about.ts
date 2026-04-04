import { Component, signal, computed, OnInit } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type Lang = 'en' | 'ta' | 'si';

interface PageContent {
  tag: string;
  heroH1: string;
  heroEm: string;
  heroSub: string;
  cardH: string;
  cardP: string;
  floatTag: string;
  storyH: string;
  storySpan: string;
  p1: string;
  p2: string;
  p3: string;
  valH: string;
  valSpan: string;
  valSub: string;
  v1h: string; v1p: string;
  v2h: string; v2p: string;
  v3h: string; v3p: string;
  quote: string;
  quoteAttr: string;
  s1a: string; s1b: string;
  s2a: string; s2b: string;
  s3a: string; s3b: string;
  ctaH: string;
  ctaSpan: string;
  ctaP: string;
  ctaBtn: string;
  lsLabel: string;
  lsFlag: string;
}

const TRANSLATIONS: Record<Lang, PageContent> = {
  en: {
    tag: '📍 Sri Lanka',
    heroH1: 'We Exist For The',
    heroEm: 'Everyday Entrepreneur',
    heroSub: "Potikada is not just a shop — it's a helping hand for every local maker, home cook, and small seller who deserves to be seen.",
    cardH: 'Handmade with love ❤️ | shipped from the heart 📦',
    cardP: 'Every product on Potikada carries the effort, love, and dreams of a local person in our community.',
    floatTag: '🌿 100% Local',
    storyH: 'A Story Born From',
    storySpan: 'Our Streets',
    p1: 'In the lanes of Sri Lanka, there are talented people with big dreams — a grandmother making the best homemade pickle, a young mother weaving beautiful crafts, a local farmer with the freshest produce.',
    p2: 'But they had no easy way to reach customers. No platform, no support, no voice.',
    p3: 'Potikada was created to change that. We believe that the smallest seller deserves the same opportunity as any big brand. When you shop here, you\'re not just buying a product — you\'re changing someone\'s life.',
    valH: 'What We', valSpan: 'Stand For',
    valSub: 'Three promises we make to every local entrepreneur and every customer who trusts us.',
    v1h: 'We Support the Small',
    v1p: 'We give priority to homemade, handcrafted, and locally produced items — the real heart of our community.',
    v2h: 'Quality You Can Trust',
    v2p: 'Every seller on Potikada is from our community. We know them personally and stand behind their products.',
    v3h: 'Growing Together',
    v3p: 'When a local seller grows, the whole community grows. We celebrate every order and every milestone together.',
    quote: '"Behind every product on Potikada is a real person, a real dream, and a real story from the heart of Hatton."',
    quoteAttr: '— The Potikada Team',
    s1a: 'Rooted in', s1b: 'Sri Lankan Community',
    s2a: 'Supporting', s2b: 'Local Entrepreneurs',
    s3a: 'Every Order', s3b: 'Makes a Difference',
    ctaH: 'Want to Sell on', ctaSpan: 'Potikada?',
    ctaP: "Are you a local maker or small business in hatton? We'd love to have you. Let's grow together.",
    ctaBtn: 'Get In Touch →',
    lsLabel: 'EN', lsFlag: '🇬🇧',
  },
  ta: {
    tag: '📍 இலங்கை',
    heroH1: 'சுயதொழில் முனைவோரா நீங்கள்!',
    heroEm: 'உங்களுக்காக நாங்கள் இருக்கிறோம்',
    heroSub:'பொட்டிக்கடை — ஊரிலிருந்து உலகத்திற்கு.',
    cardH: 'ஒவ்வொரு தயாரிப்பும் எங்கள் மனதிலிருந்து உங்கள் வாசல் வரை 📦',
    cardP: 'ஒவ்வொரு தயாரிப்பும் தரம், அன்பு மற்றும் உண்மையான மனித உழைப்பின் சான்று.',
    floatTag: '🌿 100% உள்ளூர்',
    storyH: 'நம் தெருக்களில் பிறந்த',
    storySpan: 'ஒரு கதை',
    p1: 'இலங்கையின் ஒவ்வொரு மூலையிலும், பெரிய கனவுகளை கொண்ட திறமையான மனிதர்கள் இருக்கிறார்கள் — சுவையான ஊறுகாய் செய்யும் பாட்டி, அழகான கைவினை நெய்யும் இளம் தாய், புதிய விளைபொருட்களை வழங்கும் உள்ளூர் விவசாயி.',
    p2: 'ஆனால் அவர்களின் திறமையை உலகம் காண ஒரு எளிய வழி இல்லை. அவர்களுக்கு தளம் இல்லை, ஆதரவு இல்லை, அவர்களின் குரல் கேட்கப்படவில்லை.',
    p3: 'பொட்டிக்கடை இந்த நிலையை மாற்ற உருவாக்கப்பட்டது. சிறிய விற்பனையாளருக்கும் பெரிய பிராண்டுக்கு சமமான வாய்ப்பு கிடைக்க வேண்டும் என்பதே எங்கள் நம்பிக்கை.',
    valH: 'நாங்கள்', valSpan: 'நம்பும் விடயங்கள்',
    valSub: 'உள்ளூர் தொழில்முனைவோருக்கான எங்கள் மூன்று முக்கிய உறுதிமொழிகள்.',

v1h: 'உள்ளூர் திறமைகளுக்கு முன்னுரிமை',
v1p: 'கைவினை மற்றும் வீட்டில் தயாரிக்கப்படும் பொருட்களை ஆதரித்து, உள்ளூர் தயாரிப்பாளர்களுக்கு வளர்ச்சிப் பாதை அமைக்கிறோம்.',

v2h: 'உறுதியான தரம்',
v2p: 'எங்கள் விற்பனையாளர்கள் அனைவரும் நம்பிக்கைக்குரியவர்கள். அவர்களின் தயாரிப்புகள் தரமானவை என்பதை நாங்கள் உறுதி செய்கிறோம்.',
    v3h: 'ஒன்றாக வளர்வோம்',
    v3p: 'ஒரு உள்ளூர் விற்பனையாளர் வளரும்போது, முழு சமூகமும் வளர்கிறது. ஒவ்வொரு மைல்கல்லையும் கொண்டாடுகிறோம்.',
    quote: '"பொட்டிக்கடையில் உள்ள ஒவ்வொரு பொருளின் பின்னாலும் ஒரு உண்மையான மனிதர், ஒரு கனவு, மற்றும் இதயத்திலிருந்து பிறந்த ஒரு கதை இருக்கிறது."',
    quoteAttr: '— பொட்டிக்கடை குழு',
    s1a: 'வேரூன்றியது', s1b: 'இலங்கை சமூகத்தில்',
    s2a: 'ஆதரிக்கிறோம்', s2b: 'உள்ளூர் தொழில்முனைவோரை',
    s3a: 'ஒவ்வொரு ஆர்டரும்', s3b: 'மாற்றத்தை உருவாக்கும்',
    ctaH: 'உங்கள் தயாரிப்புகளை விற்க விரும்புகிறீர்களா', ctaSpan: 'பொட்டிக்கடையில்?',
    ctaP: 'நீங்கள் ஹட்டனில் ஒரு உள்ளூர் தயாரிப்பாளரா? நாங்கள் உங்களை வரவேற்கிறோம். ஒன்றாக வளர்வோம்.',
    ctaBtn: 'தொடர்பு கொள்ளுங்கள் →',
    lsLabel: 'தமிழ்', lsFlag: '🇱🇰',
  },
  si: {
    tag: '📍 ශ්‍රී ලංකාව',
    heroH1: 'අපි සිටින්නේ',
    heroEm: 'සාමාන්‍ය ව්‍යවසායකයා සඳහා',
    heroSub: 'පොතිකඩ යනු හුදෙක් සාප්පුවක් නොවේ — එය සෑම දේශීය නිෂ්පාදකයෙකුටම, ගෘහ පිසීමකාරියටම, කුඩා විකුණුම්කරුවෙකුටම ඇති උදව් අතකි.',
    cardH: 'ආදරයෙන් හදන ❤️ | හදවතින් යවන 📦',
    cardP: 'පොතිකඩාවේ සෑම නිෂ්පාදනයක්ම අපේ ප්‍රජාවේ දේශීය පුද්ගලයෙකුගේ ශ්‍රමය, ආදරය සහ සිහිනය දරාගෙන යයි.',
    floatTag: '🌿 100% දේශීය',
    storyH: 'අපේ වීදිවලින් බිහිවූ',
    storySpan: 'කතාවක්',
    p1: 'ශ්‍රී ලංකාවේ ගල්-මං වලායෙ විශාල සිහිනති දක්ෂ මිනිසුන් ඉන්නවා — හොඳම ගෙදර ෆිකල් හදන ආච්චි, ලස්සන ශිල්ප නිර්මාණ කරන තරුණ අම්මා, නැවුම් බෝග ගෙනෙන ගොවියා.',
    p2: 'නමුත් ඔවුන්ට ගනුදෙනුකරුවන් වෙත ළඟා වීමට පහසු ක්‍රමයක් නොතිබුණි. කිසිදු වේදිකාවක්, සහයක්, හෝ හඬක් නොතිබුණි.',
    p3: 'පොතිකඩ නිර්මාණය කළේ ඒ වෙනස් කිරීමටයි. කුඩාම විකුණුම්කරුට ඕනෑම විශාල ව්‍යාපාරයකට සමාන අවස්ථාව ලැබිය යුතු යැයි අපි විශ්වාස කරමු.',
    valH: 'අපි', valSpan: 'විශ්වාස කරන දේ',
    valSub: 'සෑම දේශීය ව්‍යවසායකයෙකුටම සහ අපව විශ්වාස කරන සෑම ගනුදෙනුකරුවෙකුටම අපි ලබා දෙන පොරොන්දු තුන.',
    v1h: 'කුඩා අයව සහය ලබා දෙමු',
    v1p: 'ගෙදර හදපු, අතින් නිර්මාණ කළ, දේශීය නිෂ්පාදිත ද්‍රව්‍යවලට ප්‍රමුඛත්වය ලබා දෙමු.',
    v2h: 'විශ්වාස කළ හැකි ගුණාත්මකභාවය',
    v2p: 'පොතිකඩාවේ සෑම විකුණුම්කරුවෙක්ම අපේ ප්‍රජාවෙන් කෙනෙකි. අපි ඔවුන්ව පෞද්ගලිකව දනිමු.',
    v3h: 'එකට වැඩෙමු',
    v3p: 'දේශීය විකුණුම්කරු වැඩෙන විට, සමස්ත ප්‍රජාවම වැඩෙයි. සෑම සන්ධිස්ථානයක්ම අපි සමරමු.',
    quote: '"පොතිකඩාවේ සෑම නිෂ්පාදනයකටම පිටුපස සැබෑ පුද්ගලයෙක්, සැබෑ සිහිනයක්, හැටන් හදවතෙන් සැබෑ කතාවක් සිටියි."',
    quoteAttr: '— පොතිකඩ කණ්ඩායම',
    s1a: 'වේරූ බැසගෙන', s1b: 'ශ්‍රී ලාංකික ප්‍රජාවේ',
    s2a: 'සහය ලබා දීම', s2b: 'දේශීය ව්‍යවසායකයන්ට',
    s3a: 'සෑම ඇණවුමක්ම', s3b: 'වෙනසක් ඇති කරයි',
    ctaH: 'විකිණීමට කැමතිද', ctaSpan: 'පොතිකඩාවේ?',
    ctaP: 'හැටන් ප්‍රදේශයේ දේශීය නිෂ්පාදකයෙකු හෝ කුඩා ව්‍යාපාරයක්ද? ඔබගේ නිර්මාණ ලෝකයට ගෙන යාමට අපි සූදානම් — ආදරයෙන් ඔබව පිළිගනිමු.',
    ctaBtn: 'සම්බන්ධ වන්න →',
    lsLabel: 'සිංහල', lsFlag: '🇱🇰',
  },
};

@Component({
  selector: 'app-about',
  imports: [Header, CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  // Language state
  showOverlay = signal(false);
  dropdownOpen = signal(false);
  selectedLang = signal<Lang | null>(null);
  activeLang = signal<Lang>('ta');

  // Derived content
  content = computed(() => TRANSLATIONS[this.activeLang()]);

  showLaunchPopup = signal(true);

closeLaunchPopup() {
  this.showLaunchPopup.set(false);
}

  constructor(private router: Router) {}

  ngOnInit() {
    const saved = localStorage.getItem('pk_lang') as Lang | null;
    if (saved && TRANSLATIONS[saved]) {
      this.activeLang.set(saved);
      this.showOverlay.set(false);
    }
  }

  // Overlay
  pickLang(l: Lang) {
    this.selectedLang.set(l);
  }

  confirmLang() {
    const l = this.selectedLang();
    if (!l) return;
    this.activeLang.set(l);
    localStorage.setItem('pk_lang', l);
    this.showOverlay.set(false);
  }

  // Switcher
  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }

  switchLang(l: Lang) {
    this.activeLang.set(l);
    localStorage.setItem('pk_lang', l);
    this.dropdownOpen.set(false);
  }

  closeDropdown() {
    this.dropdownOpen.set(false);
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}