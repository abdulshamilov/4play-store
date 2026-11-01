export type Product = {
  id: number;
  brand: string;
  name: string;
  category: string;
  price: number;
  image: string;
  sizes: string[];
  color: string;
  description: string;
  ground?: string;
  club?: string;
  badge?: string;
};
const boots = ["39", "40", "41", "42", "43", "44", "45"];
const kits = ["S", "M", "L", "XL", "XXL"];
const photo = (name: string) => `/images/${name}.webp`;
export const products: Product[] = [
  {
    id: 1,
    brand: "NIKE",
    name: "Mercurial Vapor 16 Elite",
    category: "Бутсы",
    price: 9495,
    image: photo("vapor"),
    sizes: boots,
    color: "Голубой / белый",
    ground: "FG",
    badge: "Выбор 4PLAY",
    description:
      "Для тех, кто решает эпизод на скорости. Лёгкий силуэт Mercurial, низкий профиль и шипованная подошва для игры на натуральном газоне.",
  },
  {
    id: 2,
    brand: "ADIDAS",
    name: "Predator Elite",
    category: "Бутсы",
    price: 8495,
    image: photo("predator"),
    sizes: boots,
    color: "Красный / серебристый",
    ground: "FG",
    description:
      "Контроль с первого касания. Фактурный верх и выразительный силуэт Predator для уверенной работы с мячом на натуральном газоне.",
  },
  {
    id: 3,
    brand: "PUMA",
    name: "Future 7 Ultimate",
    category: "Бутсы",
    price: 7495,
    image: photo("future"),
    sizes: boots,
    color: "Белый / розовый",
    ground: "FG/AG",
    badge: "Для плеймейкеров",
    description:
      "Свобода для нестандартных решений. Гибкий верх и комфортная посадка для смены направления и игры в своём ритме.",
  },
  {
    id: 4,
    brand: "NIKE",
    name: "Phantom GX 2 Elite",
    category: "Бутсы",
    price: 6995,
    image: photo("phantom"),
    sizes: boots,
    color: "Розовый / чёрный",
    ground: "FG",
    description:
      "Точность в каждом движении. Асимметричная шнуровка и текстурированный верх для контроля мяча и решающего паса.",
  },
  {
    id: 5,
    brand: "ADIDAS",
    name: "F50 Elite",
    category: "Бутсы",
    price: 7495,
    image: photo("f50"),
    sizes: boots,
    color: "Голубой / розовый",
    ground: "FG",
    description:
      "Созданы для рывка. Лаконичный низкий силуэт, лёгкая конструкция и шипы для игры на твёрдом натуральном газоне.",
  },
  {
    id: 9,
    brand: "ADIDAS",
    name: "Real Madrid · Home 24/25",
    category: "Форма",
    price: 2745,
    image: photo("real"),
    sizes: kits,
    color: "Белый / чёрный",
    club: "Real Madrid",
    badge: "Клубная классика",
    description:
      "Домашняя футболка мадридского «Реала» сезона 2024/25. Знаменитый белый цвет и чёрные детали — для тех, чьё сердце на «Бернабеу».",
  },
  {
    id: 10,
    brand: "NIKE",
    name: "FC Barcelona · Home 24/25",
    category: "Форма",
    price: 2995,
    image: photo("barca"),
    sizes: kits,
    color: "Синий / гранатовый",
    club: "FC Barcelona",
    description:
      "Домашняя футболка «Барселоны» сезона 2024/25. Двухцветный дизайн к 125-летию клуба — больше, чем просто цвета.",
  },
  {
    id: 11,
    brand: "ADIDAS",
    name: "Manchester United · Home 24/25",
    category: "Форма",
    price: 2745,
    image: photo("united"),
    sizes: kits,
    color: "Красный / белый",
    club: "Manchester United",
    description:
      "Домашняя футболка «Манчестер Юнайтед» сезона 2024/25. Красный цвет, клубная эмблема и дух «Олд Траффорд».",
  },
  {
    id: 12,
    brand: "PUMA",
    name: "Manchester City · Home 24/25",
    category: "Форма",
    price: 2495,
    image: photo("city"),
    sizes: kits,
    color: "Небесно-голубой",
    club: "Manchester City",
    description:
      "Домашняя футболка «Манчестер Сити» сезона 2024/25. Небесно-голубой цвет и детали, вдохновлённые Манчестером.",
  },
  {
    id: 13,
    brand: "ADIDAS",
    name: "UCL League · 24/25",
    category: "Мячи",
    price: 2245,
    image: photo("ball"),
    sizes: ["5"],
    color: "Белый / чёрный",
    badge: "Ночи Лиги чемпионов",
    description:
      "Футбольный мяч в дизайне Лиги чемпионов сезона 2024/25. Узнаваемые звёзды — для большого футбола на твоём поле.",
  },
  {
    id: 15,
    brand: "NIKE",
    name: "Match Goalkeeper",
    category: "Аксессуары",
    price: 1995,
    image: photo("gloves"),
    sizes: ["7", "8", "9", "10", "11"],
    color: "Голубой / жёлтый",
    description:
      "Вратарские перчатки Nike Match с регулируемым ремешком на запястье. Для тренировок, сейвов и уверенности в своей штрафной.",
  },
  {
    id: 16,
    brand: "ADIDAS",
    name: "Rivalry Soccer 2.0",
    category: "Аксессуары",
    price: 695,
    image: photo("socks"),
    sizes: ["S", "M", "L"],
    color: "Чёрный / белый",
    description:
      "Высокие футбольные гетры adidas. Эластичная посадка и классический чёрный цвет — завершающий штрих твоей экипировки.",
  },
];
export const categories = ["Все", "Бутсы", "Форма", "Мячи", "Аксессуары"];
export const money = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(n) + " ₽";
export const productById = (id: number) => products.find((p) => p.id === id);
