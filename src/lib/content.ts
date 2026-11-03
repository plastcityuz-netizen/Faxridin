export type ContentIcon = "quality" | "density" | "thickness" | "thermal" | "factory" | "order" | "raw" | "expand" | "mold" | "cut" | "check" | "package" | "light" | "price" | "delivery";

export const PRODUCTION_STEPS: { number: string; title: string; description: string; icon: ContentIcon }[] = [
  { number: "01", title: "Xomashyo", description: "EPS granulalari tayyorlanadi va ishlab chiqarishga uzatiladi.", icon: "raw" },
  { number: "02", title: "Ko‘pirtirish", description: "Granulalar bug‘ yordamida kengaytirilib, yengil tuzilma hosil qilinadi.", icon: "expand" },
  { number: "03", title: "Qoliplash", description: "Kengaygan granulalar kerakli shakl va zichlikda bloklanadi.", icon: "mold" },
  { number: "04", title: "Kesish", description: "Bloklar belgilangan qalinlikdagi plitalarga ajratiladi.", icon: "cut" },
  { number: "05", title: "Sifat nazorati", description: "O‘lcham, zichlik va mahsulotning tashqi ko‘rinishi tekshiriladi.", icon: "check" },
  { number: "06", title: "Tayyor mahsulot", description: "Buyurtma uchun tayyorlangan mahsulotlar qadoqlanadi.", icon: "package" },
];

export const ADVANTAGES: { number: string; title: string; description: string; icon: ContentIcon }[] = [
  { number: "01", title: "Sifatga e’tibor", description: "Qurilish ishlari uchun puxta tayyorlangan EPS mahsulotlari.", icon: "quality" },
  { number: "02", title: "Issiqlik izolyatsiyasi", description: "Binoda issiqlikni saqlashga ko‘maklashadigan material.", icon: "thermal" },
  { number: "03", title: "Yengil va qulay", description: "Yengil tuzilma bilan tashish va ishlov berish qulayligi.", icon: "light" },
  { number: "04", title: "Keng tanlov", description: "7–20 kg/m³ zichlik va 1–60 cm qalinlik variantlari.", icon: "thickness" },
  { number: "05", title: "Ochiq narx hisobi", description: "Miqdor va zichlikni tanlab, taxminiy narxni darhol ko‘ring.", icon: "price" },
  { number: "06", title: "Qulay buyurtma", description: "Buyurtma va yetkazib berish shartlarini operator bilan kelishing.", icon: "delivery" },
];

export const APPLICATIONS = [
  { title: "Uy-joy qurilishi", description: "Zamonaviy uylar fasadlari va konstruksiyalarini izolyatsiya qilish uchun.", image: "/images/application-building.jpg", alt: "Uy-joy fasadiga oq EPS plitalarini o‘rnatish — illustrativ vizual", featured: true },
  { title: "Devor izolyatsiyasi", description: "Tashqi devorlarda issiqlik yo‘qotishlarini kamaytirishga.", image: "/images/application-wall.jpg", alt: "G‘ishtli devorga o‘rnatilgan oq penaplast plitalari", featured: false },
  { title: "Tom izolyatsiyasi", description: "Yassi tom qatlamlarida yengil va qulay yechim.", image: "/images/application-roof.jpg", alt: "Yassi tomga terilgan EPS izolyatsiya plitalari", featured: false },
  { title: "Pol izolyatsiyasi", description: "Pol styajkasi ostida izolyatsiya qatlamini tashkil qilishga.", image: "/images/application-floor.jpg", alt: "Pol ustuniga yotqizilgan oq EPS plitalari", featured: false },
  { title: "Sanoat", description: "Ombor va sanoat binolari uchun izolyatsiya yechimlari.", image: "/images/application-industrial.jpg", alt: "Sanoat binosining izolyatsiyalangan sendvich panellari", featured: false },
  { title: "Sovutish tizimlari", description: "Sovutish kameralarida haroratni saqlashga ko‘maklashadi.", image: "/images/application-cold.jpg", alt: "Sovutish kamerasi va EPS izolyatsiya paneli kesimi", featured: false },
  { title: "Qadoqlash", description: "Mo‘rt va nozik buyumlarni tashishda zarbadan himoyalashga.", image: "/images/application-packaging.svg", alt: "Karton quti va himoya qiluvchi oq EPS qadoqlash qismlari illustratsiyasi", featured: false },
];
