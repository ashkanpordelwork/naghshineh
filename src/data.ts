// Mock data for the prototype. Map coordinates are in Figma design pixels,
// read from the "Neighborhood World" (342:9382) and "School World" (342:10945) frames.

export type Stage = 'blooming' | 'active' | 'building' | 'ready';

export const STAGES: { id: Stage; label: string; color: string }[] = [
  { id: 'blooming', label: 'شکوفا', color: '#e2b54a' },
  { id: 'active', label: 'فعال', color: '#4fb86a' },
  { id: 'building', label: 'در حال ساخت', color: '#e8a33a' },
  { id: 'ready', label: 'آماده‌ی ساخت', color: '#9aa3ae' },
];
export const stageInfo = (s: Stage) => STAGES.find((x) => x.id === s)!;

export const user = {
  id: 'ali',
  name: 'علی رضایی',
  initials: 'ع ر',
  title: 'پیشگام فرهنگی',
  grade: 'پایه‌ی هشتم',
  level: 7,
  points: 6400,
  streak: 12,
  notifications: 2,
  photo: 'assets/avatars/student-01.webp',
};

type Rect = { x: number; y: number; w: number; h: number };

export interface Place {
  id: string;
  name: string;
  /** tag accent dot colour */
  dot: string;
  /** sprite image (relative to BASE_URL) and its box in world coordinates */
  sprite: string;
  box: Rect;
  /** iso lot (diamond) the place sits on */
  lot: Rect;
  /** tag frame and its pointer triangle, world coordinates */
  tag: Rect;
  pointer: Rect;
  stage?: Stage;
  /** 0..1 – fill of the tag progress bar */
  progress?: number;
  /** small caption shown before the name (e.g. «دفتر مدیر») */
  caption?: string;
  domain: string;
  rolesFilled: number;
  rolesTotal: number;
  head?: string;
  headRole?: string;
  icon: 'menu_book' | 'school' | 'groups' | 'science' | 'sports' | 'computer' | 'theater' | 'mosque' | 'park' | 'palette';
  description: string;
  /** only the library and the school are part of this prototype */
  enterable?: boolean;
}

export interface World {
  id: 'hood' | 'school';
  width: number;
  height: number;
  base: string;
  /** ground diamond used for pan bounds + minimap */
  ground: Rect;
  /** initial cameras (world point at the viewport centre + scale) */
  camera: { mobile: Cam; desktop: Cam };
  /** offset applied when a place is selected so it sits above the sheet */
  selectOffset: { mobile: number; desktop: number };
  /** tag scale (neighbourhood tags are 1.05× the school ones in Figma) */
  tagScale: number;
  places: Place[];
  labels?: { text: string; rect: Rect }[];
}
export type Cam = { x: number; y: number; s: number };

const lotHood = (x: number, y: number): Rect => ({ x, y, w: 163.67, h: 94.5 });
const lotSchool = (x: number, y: number): Rect => ({ x, y, w: 155, h: 90 });

export const hood: World = {
  id: 'hood',
  width: 1208.72,
  height: 819,
  base: 'assets/map/hood-base@2x.webp',
  ground: { x: 31.5, y: 94.5, w: 1145.72, h: 661.5 },
  camera: { mobile: { x: 714, y: 369, s: 1 }, desktop: { x: 605, y: 385.5, s: 1.0665 } },
  selectOffset: { mobile: 56, desktop: 68 },
  tagScale: 1.05,
  places: [
    {
      id: 'public-library', name: 'کتابخانه‌ی عمومی', dot: '#8c78d0',
      sprite: 'assets/map/hood-public-library@2x.png', box: { x: 520, y: 240, w: 169, h: 108 },
      lot: lotHood(522.52, 250.74), tag: { x: 541.88, y: 212.1, w: 125.75, h: 32.6 }, pointer: { x: 609.61, y: 249.9, w: 10.5, h: 6.3 },
      domain: 'حوزه‌ی فرهنگی', rolesFilled: 6, rolesTotal: 8, head: 'خانم احمدی', headRole: 'مسئول کتابخانه‌ی عمومی', icon: 'menu_book',
      description: 'کتابخانه‌ی عمومی محله با سالن مطالعه و بخش کودک و نوجوان.',
    },
    {
      id: 'mosque', name: 'مسجد محله', dot: '#2ba9b8',
      sprite: 'assets/map/hood-mosque@2x.png', box: { x: 411, y: 296, w: 169, h: 115 },
      lot: lotHood(413.41, 313.74), tag: { x: 447.47, y: 247.8, w: 95.75, h: 32.6 }, pointer: { x: 500.49, y: 285.6, w: 10.5, h: 6.3 },
      domain: 'حوزه‌ی اجتماعی', rolesFilled: 9, rolesTotal: 10, head: 'آقای کریمی', headRole: 'مسئول کانون مسجد', icon: 'mosque',
      description: 'کانون فرهنگی مسجد محله؛ کلاس‌های قرآن و برنامه‌های گروهی.',
    },
    {
      id: 'school', name: 'مدرسه', dot: '#e2a23a',
      sprite: 'assets/map/hood-school@2x.png', box: { x: 629, y: 298, w: 169, h: 113 },
      lot: lotHood(631.64, 313.74), tag: { x: 678.3, y: 268.8, w: 70.75, h: 32.6 }, pointer: { x: 718.72, y: 306.6, w: 10.5, h: 6.3 },
      domain: 'مدرسه‌ی شهید بهشتی', rolesFilled: 24, rolesTotal: 36, icon: 'school', enterable: true,
      description: 'مدرسه‌ی شهید بهشتی؛ ۶ مکان فعال برای نقش‌آفرینی دانش‌آموزان.',
    },
    {
      id: 'kanoon', name: 'کانون پرورش فکری', dot: '#e06a9a',
      sprite: 'assets/map/hood-kanoon@2x.png', box: { x: 738, y: 368, w: 169, h: 106 },
      lot: lotHood(740.75, 376.74), tag: { x: 754.87, y: 336, w: 135.75, h: 32.6 }, pointer: { x: 827.84, y: 373.8, w: 10.5, h: 6.3 },
      domain: 'حوزه‌ی هنری', rolesFilled: 5, rolesTotal: 8, head: 'خانم رحیمی', headRole: 'مربی کانون', icon: 'palette',
      description: 'کانون پرورش فکری کودکان و نوجوانان؛ کارگاه‌های هنر، نقاشی و داستان.',
    },
    {
      id: 'park', name: 'پارک محله', dot: '#5e9a48',
      sprite: 'assets/map/hood-park@2x.png', box: { x: 411, y: 434, w: 169, h: 103 },
      lot: lotHood(413.41, 439.74), tag: { x: 452.19, y: 411.6, w: 85.75, h: 32.6 }, pointer: { x: 500.49, y: 449.4, w: 10.5, h: 6.3 },
      domain: 'حوزه‌ی محیط زیست', rolesFilled: 3, rolesTotal: 6, head: 'آقای نوری', headRole: 'هماهنگ‌کننده‌ی پارک', icon: 'park',
      description: 'پارک محله؛ گروه‌های داوطلب نگهداری فضای سبز و برنامه‌های ورزش صبحگاهی.',
    },
    {
      id: 'hood-gym', name: 'سالن ورزشی محله', dot: '#e8854a',
      sprite: 'assets/map/hood-gym@2x.png', box: { x: 520, y: 500, w: 169, h: 100 },
      lot: lotHood(522.52, 502.74), tag: { x: 541.36, y: 466.2, w: 125.75, h: 32.6 }, pointer: { x: 609.61, y: 504, w: 10.5, h: 6.3 },
      domain: 'حوزه‌ی ورزشی', rolesFilled: 7, rolesTotal: 10, head: 'آقای صالحی', headRole: 'مربی سالن', icon: 'sports',
      description: 'سالن ورزشی محله با زمین فوتسال و والیبال.',
    },
  ],
};

export const school: World = {
  id: 'school',
  width: 2149.58,
  height: 1338,
  base: 'assets/map/school-base@2x.webp',
  ground: { x: 20, y: 40, w: 2110, h: 1218 },
  camera: { mobile: { x: 1075, y: 636, s: 1 }, desktop: { x: 1075, y: 648, s: 1 } },
  selectOffset: { mobile: 56, desktop: 68 },
  tagScale: 1,
  labels: [{ text: 'حیاط مرکزی', rect: { x: 1042.79, y: 676.2, w: 64, h: 22 } }],
  places: [
    {
      id: 'computer', name: 'کارگاه کامپیوتر و فناوری', dot: '#4fb86a', stage: 'active', progress: 0.6,
      sprite: 'assets/map/school-computer@2x.png', box: { x: 995, y: 412, w: 164, h: 114 },
      lot: lotSchool(997.19, 434.24), tag: { x: 997.79, y: 370.8, w: 154, h: 45 }, pointer: { x: 1079.79, y: 420.8, w: 10, h: 6 },
      domain: 'حوزه‌ی فناوری', rolesFilled: 4, rolesTotal: 6, head: 'پارسا نیکو', headRole: 'مسئول کارگاه', icon: 'computer',
      description: 'کارگاه کامپیوتر؛ آموزش برنامه‌نویسی و نگهداری سیستم‌های مدرسه.',
    },
    {
      id: 'hall', name: 'تالار فرهنگی', dot: '#4fb86a', stage: 'active', progress: 0.6,
      sprite: 'assets/map/school-hall@2x.png', box: { x: 849, y: 489, w: 165, h: 121 },
      lot: lotSchool(851.71, 518.24), tag: { x: 879.79, y: 449.2, w: 99, h: 45 }, pointer: { x: 934.29, y: 499.2, w: 10, h: 6 },
      domain: 'حوزه‌ی فرهنگی', rolesFilled: 6, rolesTotal: 8, head: 'کیان رحیمی', headRole: 'مسئول تالار', icon: 'theater',
      description: 'تالار فرهنگی؛ برگزاری نمایش، جشن‌ها و مراسم صبحگاه.',
    },
    {
      id: 'main', name: 'ساختمان اصلی', caption: 'دفتر مدیر', dot: '#d9a86a',
      sprite: 'assets/map/school-main@2x.png', box: { x: 1140, y: 480, w: 160, h: 134 },
      lot: lotSchool(1142.68, 518.24), tag: { x: 1142.29, y: 467.4, w: 156, h: 31 }, pointer: { x: 1225.29, y: 503.4, w: 10, h: 6 },
      domain: 'دفتر مدیر و کادر مدرسه', rolesFilled: 3, rolesTotal: 3, head: 'آقای مرادی', headRole: 'مدیر مدرسه', icon: 'school',
      description: 'ساختمان اصلی مدرسه؛ دفتر مدیر، معاونت و کلاس‌ها.',
    },
    {
      id: 'council', name: 'شورای دانش‌آموزی', dot: '#9aa3ae', stage: 'ready', progress: 0,
      sprite: 'assets/map/school-council@2x.png', box: { x: 704, y: 600, w: 160, h: 94 },
      lot: lotSchool(706.22, 602.24), tag: { x: 718.79, y: 568.2, w: 130, h: 45 }, pointer: { x: 788.79, y: 618.2, w: 10, h: 6 },
      domain: 'حوزه‌ی اجتماعی', rolesFilled: 0, rolesTotal: 5, icon: 'groups',
      description: 'شورای دانش‌آموزی هنوز ساخته نشده؛ با پر شدن نقش‌ها ساخت شروع می‌شه.',
    },
    {
      id: 'library', name: 'کتابخانه', dot: '#e2b54a', stage: 'blooming', progress: 1, enterable: true,
      sprite: 'assets/map/school-library@2x.png', box: { x: 1286, y: 564, w: 164, h: 130 },
      lot: lotSchool(1288.17, 602.24), tag: { x: 1326.76, y: 538.8, w: 78, h: 45 }, pointer: { x: 1370.76, y: 588.8, w: 10, h: 6 },
      domain: 'حوزه‌ی آموزشی', rolesFilled: 5, rolesTotal: 5, head: 'امیر حسینی', headRole: 'مسئول کتابخانه', icon: 'menu_book',
      description: 'کتابخانه‌ی مدرسه جای امانت کتاب، کتاب‌خوانی گروهی و مسابقه‌های کتاب‌خوانی است.',
    },
    {
      id: 'gym', name: 'سالن ورزشی و تربیت‌بدنی', dot: '#e8a33a', stage: 'building', progress: 0.2,
      sprite: 'assets/map/school-gym@2x.png', box: { x: 849, y: 636, w: 165, h: 142 },
      lot: lotSchool(851.71, 686.24), tag: { x: 850.79, y: 622.8, w: 157, h: 45 }, pointer: { x: 934.29, y: 672.8, w: 10, h: 6 },
      domain: 'حوزه‌ی ورزشی', rolesFilled: 2, rolesTotal: 6, head: 'آرش بهرامی', headRole: 'مسئول سالن', icon: 'sports',
      description: 'سالن ورزشی در حال ساخته؛ با فعالیت گروه ورزش مرحله‌ی بعد باز می‌شه.',
    },
    {
      id: 'lab', name: 'آزمایشگاه علوم', dot: '#e8a33a', stage: 'building', progress: 0.2,
      sprite: 'assets/map/school-lab@2x.png', box: { x: 1140, y: 626, w: 165, h: 152 },
      lot: lotSchool(1142.68, 686.24), tag: { x: 1163.29, y: 613, w: 114, h: 45 }, pointer: { x: 1225.29, y: 663, w: 10, h: 6 },
      domain: 'حوزه‌ی علمی', rolesFilled: 2, rolesTotal: 6, head: 'رضا احمدی', headRole: 'مسئول آزمایشگاه', icon: 'science',
      description: 'آزمایشگاه علوم در حال ساخته؛ آزمایش‌های گروهی و نمایشگاه علمی.',
    },
  ],
};

export const schoolInfo = {
  name: 'مدرسه‌ی شهید بهشتی',
  subtitle: '۶ مکان، سطح ۴ مدرسه',
  students: '۱۲۸',
  activePlaces: '۳/۶',
  filledRoles: '۲۴/۳۶',
};

// ───────────────────────── People ─────────────────────────
export interface Person {
  id: string;
  name: string;
  initials: string;
  photo?: string;
  /** gradient start colour for initials avatars */
  tint?: string;
  grade?: string;
}

export const people: Record<string, Person> = {
  amir: { id: 'amir', name: 'امیر حسینی', initials: 'ا ح', photo: 'assets/avatars/student-02.webp', grade: 'پایه‌ی نهم' },
  sina: { id: 'sina', name: 'سینا کریمی', initials: 'س ک', photo: 'assets/avatars/student-03.webp', grade: 'پایه‌ی نهم' },
  mohammad: { id: 'mohammad', name: 'محمد نوری', initials: 'م ن', photo: 'assets/avatars/student-04.webp', grade: 'پایه‌ی هشتم' },
  reza: { id: 'reza', name: 'رضا احمدی', initials: 'ر ا', photo: 'assets/avatars/student-05.webp', grade: 'پایه‌ی هشتم' },
  mahdi: { id: 'mahdi', name: 'مهدی صالحی', initials: 'م ص', photo: 'assets/avatars/student-06.webp', grade: 'پایه‌ی هفتم' },
  ali: { id: 'ali', name: 'علی رضایی', initials: 'ع ر', photo: 'assets/avatars/student-01.webp', grade: 'پایه‌ی هشتم' },
  hossein: { id: 'hossein', name: 'حسین مرادی', initials: 'ح م', photo: 'assets/avatars/student-07.webp', grade: 'فارغ‌التحصیل' },
  parsa: { id: 'parsa', name: 'پارسا نیکو', initials: 'پ ن', photo: 'assets/avatars/student-08.webp', grade: 'پایه‌ی نهم' },
  kian: { id: 'kian', name: 'کیان رحیمی', initials: 'ک ر', photo: 'assets/avatars/student-09.webp', grade: 'فارغ‌التحصیل' },
  arash: { id: 'arash', name: 'آرش بهرامی', initials: 'آ ب', photo: 'assets/avatars/student-06.webp', grade: 'پایه‌ی نهم' },
  nima: { id: 'nima', name: 'نیما فرهادی', initials: 'ن ف', photo: 'assets/avatars/student-02.webp', grade: 'فارغ‌التحصیل' },
  matin: { id: 'matin', name: 'متین شریفی', initials: 'م ش', photo: 'assets/avatars/student-03.webp', grade: 'فارغ‌التحصیل' },
  hamed: { id: 'hamed', name: 'حامد یزدانی', initials: 'ح ی', photo: 'assets/avatars/student-04.webp', grade: 'فارغ‌التحصیل' },
  saeed: { id: 'saeed', name: 'سعید عبداللهی‌نژاد', initials: 'س ع', photo: 'assets/avatars/student-05.webp', grade: 'فارغ‌التحصیل' },
  yasin: { id: 'yasin', name: 'یاسین کاظمی', initials: 'ی ک', photo: 'assets/avatars/student-05.webp', grade: 'فارغ‌التحصیل' },
};

export interface Member {
  personId: string;
  role: string;
  points: number;
  graduated?: boolean;
}

export interface YearRecord {
  id: string;
  label: string; // «۱۴۰۴ تا ۱۴۰۵»
  head?: string; // person id
  members: Member[];
  totalPoints: string;
  approvedReports: string;
  groupBadges: string;
}

// ───────────────────────── Library ─────────────────────────
export const library = {
  placeId: 'library',
  name: 'کتابخانه',
  subtitle: 'حوزه‌ی آموزشی، مدرسه‌ی شهید بهشتی',
  stage: 'blooming' as Stage,
  totalPoints: '۲٬۴۸۰ امتیاز کل',
  head: 'amir',
  headSince: 'پایه‌ی نهم، از مهر ۱۴۰۵',
  stats: { members: '۵', openRoles: '۲', years: '۳' },
  description: 'کتابخانه‌ی مدرسه جای امانت کتاب، کتاب‌خوانی گروهی و مسابقه‌های کتاب‌خوانی است.',
  openRoles: [
    {
      id: 'guide',
      name: 'راهنمای کتاب',
      desc: 'به بچه‌ها کتاب مناسب معرفی می‌کنی و توی انتخاب کمکشون می‌کنی.',
      perks: '+۱۵ امتیاز هفتگی',
      slots: 1,
      color: '#4da3ff',
    },
    {
      id: 'promo',
      name: 'تبلیغات',
      desc: 'پوستر و اطلاعیه‌ی برنامه‌ها و مسابقه‌های کتاب‌خوانی رو می‌سازی.',
      perks: '+۱۲ امتیاز هفتگی',
      slots: 1,
      color: '#e06a9a',
    },
  ],
  currentYear: '۱۴۰۵ تا ۱۴۰۶',
  updated: 'به‌روز: امروز',
  members: [
    { personId: 'sina', role: 'مسئول قفسه‌ها', points: 820 },
    { personId: 'mohammad', role: 'امانت‌دار', points: 640 },
    { personId: 'amir', role: 'مسئول', points: 590 },
    { personId: 'reza', role: 'راهنمای کتاب', points: 410 },
    { personId: 'mahdi', role: 'راهنمای کتاب', points: 270 },
  ] as Member[],
  activity: [
    { text: 'سینا کریمی قفسه‌ی علمی رو مرتب کرد', meta: '+۲۰ امتیاز، امروز', tone: 'green' },
    { text: 'محمد نوری امانت ۸ کتاب رو ثبت کرد', meta: '+۱۵ امتیاز، دیروز', tone: 'green' },
    { text: 'کتابخانه به سطح شکوفا رسید', meta: '۳ روز پیش', tone: 'gold' },
  ],
  records: [
    {
      id: '1404', label: '۱۴۰۴ تا ۱۴۰۵', head: 'hossein', totalPoints: '۱٬۹۲۰', approvedReports: '۱۴۸', groupBadges: '۲',
      members: [
        { personId: 'hossein', role: 'مسئول', points: 740 },
        { personId: 'sina', role: 'امانت‌دار', points: 580 },
        { personId: 'parsa', role: 'راهنمای کتاب', points: 460 },
        { personId: 'kian', role: 'مسئول قفسه‌ها', points: 390, graduated: true },
        { personId: 'mohammad', role: 'راهنمای کتاب', points: 310 },
        { personId: 'arash', role: 'راهنمای کتاب', points: 240 },
        { personId: 'ali', role: 'عضو افتخاری', points: 120 },
      ],
    },
    {
      id: '1403', label: '۱۴۰۳ تا ۱۴۰۴', head: 'nima', totalPoints: '۱٬۳۵۰', approvedReports: '۹۶', groupBadges: '۱',
      members: [
        { personId: 'nima', role: 'مسئول', points: 610, graduated: true },
        { personId: 'hossein', role: 'مسئول قفسه‌ها', points: 520 },
        { personId: 'saeed', role: 'امانت‌دار و هماهنگ‌کننده‌ی مسابقه‌های کتاب‌خوانی', points: 430, graduated: true },
        { personId: 'kian', role: 'راهنمای کتاب', points: 300 },
        { personId: 'matin', role: 'تبلیغات', points: 190, graduated: true },
      ],
    },
    {
      id: '1402', label: '۱۴۰۲ تا ۱۴۰۳', head: 'hamed', totalPoints: '۸۴۰', approvedReports: '۵۲', groupBadges: '۰',
      members: [
        { personId: 'hamed', role: 'مسئول', points: 460, graduated: true },
        { personId: 'yasin', role: 'امانت‌دار', points: 350, graduated: true },
        { personId: 'nima', role: 'مسئول قفسه‌ها', points: 280, graduated: true },
        { personId: 'matin', role: 'راهنمای کتاب', points: 150, graduated: true },
      ],
    },
    { id: '1401', label: '۱۴۰۱ تا ۱۴۰۲', totalPoints: '۰', approvedReports: '۰', groupBadges: '۰', members: [] },
  ] as YearRecord[],
};

export const badgesByPerson: Record<string, string[]> = {
  sina: ['قفسه‌دار نمونه', 'کتاب‌خوان طلایی', 'همیار ماه'],
  mohammad: ['امانت‌دار دقیق', 'کتاب‌خوان نقره‌ای', 'منظم'],
  amir: ['مسئول شکوفا', 'رهبر گروه', 'کتاب‌خوان طلایی'],
  reza: ['راهنمای مهربان', 'کتاب‌خوان برنزی', 'تازه‌نفس'],
  mahdi: ['تازه‌نفس', 'کنجکاو', 'همیار ماه'],
  ali: ['پیشگام فرهنگی', 'عضو افتخاری', '۱۲ روز پیاپی'],
};
export const defaultBadges = ['کتاب‌خوان', 'همیار', 'منظم'];

// ───────────────────────── Navigation ─────────────────────────
export type NavKey = 'hood' | 'profile' | 'badges' | 'office' | 'roles' | 'tasks';
export interface NavItem {
  key: NavKey;
  label: string;
  icon: 'map' | 'person' | 'premium' | 'dashboard' | 'group' | 'task';
  /** tile gradient + hard shadow (from Figma) */
  from: string;
  to: string;
  shadow: string;
  path: string;
}
export const hoodNav: NavItem[] = [
  { key: 'hood', label: 'محله من', icon: 'map', from: '#8cf0ff', to: '#3ddcff', shadow: '#0e8fb0', path: '/' },
  { key: 'profile', label: 'پروفایل', icon: 'person', from: '#9af5c3', to: '#5be49b', shadow: '#1e9e63', path: '/soon/profile' },
  { key: 'badges', label: 'نشان‌ها', icon: 'premium', from: '#ffe08a', to: '#f5c451', shadow: '#b88a1e', path: '/soon/badges' },
];
export const schoolNav: NavItem[] = [
  { key: 'office', label: 'دفتر کار', icon: 'dashboard', from: '#9ccbff', to: '#4da3ff', shadow: '#2a6fc4', path: '/school' },
  { key: 'roles', label: 'نقش‌ها', icon: 'group', from: '#d2b3ff', to: '#b07cff', shadow: '#7446c9', path: '/soon/roles' },
  { key: 'tasks', label: 'مسئولیت‌ها', icon: 'task', from: '#ffc88a', to: '#ff9f43', shadow: '#c46a16', path: '/soon/tasks' },
];

export const soonPages: Record<string, { title: string; section: 'hood' | 'school'; nav: NavKey; text: string }> = {
  profile: { title: 'پروفایل', section: 'hood', nav: 'profile', text: 'پروفایل علی رضایی به‌زودی اینجا میاد: سطح، امتیازها و نقش‌هات.' },
  badges: { title: 'نشان‌ها', section: 'hood', nav: 'badges', text: 'ویترین نشان‌هات به‌زودی آماده می‌شه.' },
  roles: { title: 'نقش‌ها', section: 'school', nav: 'roles', text: 'فهرست نقش‌های خالی و پرشده‌ی مدرسه به‌زودی اینجاست.' },
  tasks: { title: 'مسئولیت‌ها', section: 'school', nav: 'tasks', text: 'مسئولیت‌های هفتگی و گزارش‌هات به‌زودی اینجا میاد.' },
  notifications: { title: 'اعلان‌ها', section: 'hood', nav: 'hood', text: '۲ اعلان تازه داری. صفحه‌ی اعلان‌ها به‌زودی آماده می‌شه.' },
};

export const fa = (n: number) => n.toLocaleString('fa-IR');
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
