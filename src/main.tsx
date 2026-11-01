import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Search,
  Heart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  Truck,
  Ruler,
  Check,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  Instagram,
  Home,
  Grid2X2,
  RotateCcw,
  CircleCheck,
  Expand,
  Package,
  MoveUpRight,
} from "lucide-react";
import { products, categories, money, productById, type Product } from "./data";
import "./style.css";

type Item = { id: number; size: string; qty: number };
type Info = "delivery" | "sizes" | "about" | null;
type Store = {
  cart: Item[];
  favorites: number[];
  add: (p: Product, size: string) => void;
  change: (id: number, size: string, n: number) => void;
  remove: (id: number, size: string) => void;
  clear: () => void;
  toggle: (id: number) => void;
  quick: (p: Product) => void;
  info: (v: Info) => void;
  count: number;
  total: number;
};
const StoreContext = createContext<Store>(null!);
const useStore = () => useContext(StoreContext);
function readSaved(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function savedCart(): Item[] {
  const value = readSaved("4play-cart");
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (x): x is Item =>
        !!x &&
        typeof x === "object" &&
        !!productById(x.id)?.sizes.includes(x.size) &&
        Number.isInteger(x.qty) &&
        x.qty > 0,
    )
    .map((x) => ({ ...x, qty: Math.min(99, x.qty) }));
}
function savedFavorites(): number[] {
  const v = readSaved("4play-favorites");
  return Array.isArray(v)
    ? [...new Set(v.filter((x) => typeof x === "number" && productById(x)))]
    : [];
}
function usePersist(key: string, value: unknown) {
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* The shop also works without persistent storage. */
    }
  }, [key, value]);
}
function Logo() {
  return (
    <span className="wordmark">
      4PLAY<span className="logo-dot">®</span>
    </span>
  );
}
function Modal({
  title,
  children,
  close,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const all = ref.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]',
        );
        if (!all?.length) return;
        const first = all[0],
          last = all[all.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      before?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`modal ${wide ? "modal-wide" : ""}`}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button className="icon-button" aria-label="Закрыть" onClick={close}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Item[]>(savedCart),
    [favorites, setFavorites] = useState<number[]>(savedFavorites);
  const [quick, setQuick] = useState<Product | null>(null),
    [info, setInfo] = useState<Info>(null),
    [toast, setToast] = useState("");
  usePersist("4play-cart", cart);
  usePersist("4play-favorites", favorites);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const value: Store = {
    cart,
    favorites,
    quick: setQuick,
    info: (v) => {
      setQuick(null);
      setInfo(v);
    },
    add: (p, size) => {
      setCart((old) => {
        const exists = old.find((x) => x.id === p.id && x.size === size);
        return exists
          ? old.map((x) =>
              x === exists ? { ...x, qty: Math.min(99, x.qty + 1) } : x,
            )
          : [...old, { id: p.id, size, qty: 1 }];
      });
      setToast(`${p.name} · ${size} — в корзине`);
      setQuick(null);
    },
    change: (id, size, n) =>
      setCart((old) =>
        old
          .map((x) =>
            x.id === id && x.size === size
              ? { ...x, qty: Math.min(99, x.qty + n) }
              : x,
          )
          .filter((x) => x.qty > 0),
      ),
    remove: (id, size) =>
      setCart((old) => old.filter((x) => x.id !== id || x.size !== size)),
    clear: () => setCart([]),
    toggle: (id) =>
      setFavorites((old) =>
        old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
      ),
    count: cart.reduce((sum, x) => sum + x.qty, 0),
    total: cart.reduce(
      (sum, x) => sum + (productById(x.id)?.price || 0) * x.qty,
      0,
    ),
  };
  return (
    <StoreContext.Provider value={value}>
      {children}
      {quick && (
        <Modal title="Твоя следующая экипировка" close={() => setQuick(null)}>
          <QuickProduct key={quick.id} p={quick} />
        </Modal>
      )}
      {info && (
        <Modal
          title={
            info === "sizes"
              ? "Как выбрать размер"
              : info === "delivery"
                ? "Доставка и заказ"
                : "Футбол — наш язык"
          }
          close={() => setInfo(null)}
        >
          <InfoContent kind={info} />
        </Modal>
      )}
      {toast && (
        <div role="status" className="toast">
          <CircleCheck size={20} />
          <div>
            {toast}
            <Link to="/cart" onClick={() => setToast("")}>
              Перейти в корзину <ArrowRight size={14} />
            </Link>
          </div>
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Скрыть уведомление"
          >
            <X size={17} />
          </button>
        </div>
      )}
    </StoreContext.Provider>
  );
}
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function Header() {
  const store = useStore(),
    [search, setSearch] = useState(false),
    [menu, setMenu] = useState(false);
  return (
    <>
      <div className="announcement">
        <span>ДЛЯ ТЕХ, КТО ЖИВЁТ ИГРОЙ</span>
        <span className="announcement-right">
          МАХАЧКАЛА · ДОСТАВКА ПО РОССИИ <ArrowUpRight size={12} />
        </span>
      </div>
      <header className="header">
        <div className="container header-inner">
          <button
            className="icon-button menu-button"
            onClick={() => setMenu(true)}
            aria-label="Открыть меню"
          >
            <Menu />
          </button>
          <Link to="/" aria-label="4PLAY — главная">
            <Logo />
          </Link>
          <nav aria-label="Основная навигация">
            <NavLink to="/catalog" end>
              Каталог <ChevronDown size={12} />
            </NavLink>
            <Link to="/catalog?category=Бутсы">Бутсы</Link>
            <Link to="/catalog?category=Форма">Клубная форма</Link>
            <Link to="/catalog?category=Мячи">Мячи</Link>
            <button onClick={() => store.info("about")}>О 4PLAY</button>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={() => setSearch(true)}
              aria-label="Поиск товаров"
            >
              <Search size={21} />
            </button>
            <Link
              className="icon-button header-favorite"
              to="/favorites"
              aria-label={`Избранное: ${store.favorites.length}`}
            >
              <Heart size={21} />
              {store.favorites.length > 0 && <i />}
            </Link>
            <Link
              className="bag-button"
              to="/cart"
              aria-label={`Корзина: ${store.count}`}
            >
              <ShoppingBag size={20} />
              <span className="bag-text">Корзина</span>
              <b>{store.count}</b>
            </Link>
          </div>
        </div>
      </header>
      {search && (
        <Modal title="Найди свою игру" wide close={() => setSearch(false)}>
          <SearchContent close={() => setSearch(false)} />
        </Modal>
      )}
      {menu && (
        <Modal title="4PLAY / МЕНЮ" close={() => setMenu(false)}>
          <nav className="mobile-menu">
            {categories.map((c) => (
              <Link
                key={c}
                to={c === "Все" ? "/catalog" : `/catalog?category=${c}`}
                onClick={() => setMenu(false)}
              >
                {c === "Все" ? "Весь каталог" : c}
                <ArrowUpRight />
              </Link>
            ))}
            <Link to="/favorites" onClick={() => setMenu(false)}>
              Избранное <Heart />
            </Link>
          </nav>
          <a
            className="social-link"
            href="https://www.instagram.com/4playru/"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={18} /> @4playru <ArrowUpRight size={18} />
          </a>
        </Modal>
      )}
    </>
  );
}
function SearchContent({ close }: { close: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const found = products.filter((p) =>
    `${p.name} ${p.brand} ${p.category} ${p.club || ""}`
      .toLowerCase()
      .includes(q.trim().toLowerCase()),
  );
  return (
    <>
      <form
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/catalog?q=${encodeURIComponent(q)}`);
          close();
        }}
      >
        <Search />
        <input
          autoFocus
          placeholder="Модель, бренд или любимый клуб"
          aria-label="Поисковый запрос"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="icon-button"
          type="submit"
          aria-label="Показать все результаты"
        >
          <ArrowRight />
        </button>
      </form>
      <p className="muted search-label">
        {q ? `Найдено: ${found.length}` : "Сейчас в игре"}
      </p>
      <div className="search-results">
        {found.slice(0, 5).map((p) => (
          <Link to={`/product/${p.id}`} key={p.id} onClick={close}>
            <img src={p.image} alt="" />
            <span>
              <small>
                {p.brand} / {p.category}
              </small>
              <b>{p.name}</b>
            </span>
            <strong>{money(p.price)}</strong>
            <ArrowUpRight size={18} />
          </Link>
        ))}
      </div>
      {!found.length && (
        <div className="empty-small">
          Попробуй другое название — например, Nike или Real Madrid.
        </div>
      )}
    </>
  );
}
function HomePage() {
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src="/images/rashford.webp"
          alt="Маркус Рэшфорд в футбольной кампании Nike — удар по мячу"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="container hero-content">
          <div className="hero-kicker">
            <i /> FOOTBALL CULTURE. EVERY DAY.
          </div>
          <h1>
            ЖИВИ
            <br />
            <span>ИГРОЙ.</span>
          </h1>
          <p>
            Твоя скорость. Твои цвета. Твоё поле.
            <br />
            Экипировка для футбола, которым ты живёшь.
          </p>
          <Link className="button button-orange" to="/catalog">
            НАЙТИ СВОЮ ИГРУ <ArrowUpRight size={20} />
          </Link>
          <div className="hero-foot">
            <span>
              <b>01</b> / THE GAME NEVER STOPS
            </span>
            <span>NIKE · ADIDAS · PUMA</span>
          </div>
        </div>
        <div className="hero-side-label">4PLAY® — MADE FOR THE PITCH</div>
        <div className="hero-photo-label">MARCUS RASHFORD / NIKE FOOTBALL</div>
      </section>
      <div className="brand-strip">
        <div className="container">
          <span>
            НА ПОЛЕ
            <br />
            <b>ВСЁ ПО-НАСТОЯЩЕМУ.</b>
          </span>
          <b className="brand-nike">NIKE</b>
          <b className="brand-adidas">adidas</b>
          <b className="brand-puma">
            PUMA<span>®</span>
          </b>
          <span className="strip-note">
            ТРИ БРЕНДА.
            <br />
            БЕСКОНЕЧНОСТЬ ВОЗМОЖНОСТЕЙ.
          </span>
        </div>
      </div>
      <section className="container section category-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">01 / ВЫХОДИ НА ПОЛЕ</div>
            <h2>
              У КАЖДОЙ ИГРЫ
              <br />
              СВОЯ ЭКИПИРОВКА<span className="accent">.</span>
            </h2>
          </div>
          <Link className="text-link" to="/catalog">
            Весь каталог <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="category-grid">
          <Link
            className="category-card boots-category"
            to="/catalog?category=Бутсы"
          >
            <div className="category-top">
              <span>СКОРОСТЬ. КОНТРОЛЬ. ХАРАКТЕР.</span>
              <span>01</span>
            </div>
            <img
              src="/images/phantom.webp"
              alt="Розовые футбольные бутсы Nike Phantom GX 2"
              loading="lazy"
            />
            <div className="category-bottom">
              <div>
                <small>Найди свою пару</small>
                <h3>БУТСЫ</h3>
              </div>
              <span className="round-arrow">
                <ArrowUpRight />
              </span>
            </div>
          </Link>
          <Link
            className="category-card kits-category"
            to="/catalog?category=Форма"
          >
            <div className="category-top">
              <span>БОЛЬШЕ, ЧЕМ ЦВЕТА.</span>
              <span>02</span>
            </div>
            <div className="kit-stack">
              <img
                src="/images/barca.webp"
                alt="Форма FC Barcelona"
                loading="lazy"
              />
              <img
                src="/images/real.webp"
                alt="Форма Real Madrid"
                loading="lazy"
              />
            </div>
            <div className="category-bottom">
              <div>
                <small>Твой клуб. Твоя история.</small>
                <h3>КЛУБНАЯ ФОРМА</h3>
              </div>
              <span className="round-arrow">
                <ArrowUpRight />
              </span>
            </div>
          </Link>
          <Link
            className="category-card ball-category"
            to="/catalog?category=Мячи"
          >
            <div className="category-top">
              <span>ИГРА НАЧИНАЕТСЯ ЗДЕСЬ.</span>
              <span>03</span>
            </div>
            <img
              src="/images/ball.webp"
              alt="Мяч adidas в дизайне Лиги чемпионов"
              loading="lazy"
            />
            <div className="category-bottom">
              <div>
                <small>От двора до стадиона</small>
                <h3>МЯЧИ</h3>
              </div>
              <span className="round-arrow">
                <ArrowUpRight />
              </span>
            </div>
          </Link>
        </div>
      </section>
      <Featured />
      <section className="campaign">
        <div className="campaign-photo">
          <img
            src="/images/mbappe-dark.webp"
            alt="Килиан Мбаппе в футбольной кампании Nike Mercurial"
            loading="lazy"
          />
          <span>KYLIAN MBAPPÉ / NIKE MERCURIAL</span>
        </div>
        <div className="campaign-copy">
          <div className="eyebrow">ТВОЯ СЛЕДУЮЩАЯ ПАРА</div>
          <h2>
            ПУСТЬ
            <br />
            ЗАПОМНЯТ
            <br />
            <span>ТВОЮ СКОРОСТЬ.</span>
          </h2>
          <p>
            Первый шаг решает. Найди бутсы, которые поддержат твой темп — от
            стартового свистка до последней атаки.
          </p>
          <Link className="button button-orange" to="/catalog?category=Бутсы">
            ВЫБРАТЬ БУТСЫ <ArrowUpRight size={20} />
          </Link>
          <div className="campaign-note">
            <span>01 / SPEED</span>
            <span>02 / CONTROL</span>
            <span>03 / YOU</span>
          </div>
        </div>
      </section>
      <section className="container section clubs-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">03 / НОСИ СВОИ ЦВЕТА</div>
            <h2>
              ОДИН КЛУБ.
              <br />
              НА ВСЮ ЖИЗНЬ<span className="accent">.</span>
            </h2>
          </div>
          <p className="section-description">
            В день матча и каждый день.
            <br />
            Для тех, кто с командой до конца.
          </p>
        </div>
        <div className="clubs-grid">
          {[
            {
              name: "Real Madrid",
              tag: "HALA MADRID",
              image: "real",
              cls: "madrid",
            },
            {
              name: "FC Barcelona",
              tag: "MÉS QUE UN CLUB",
              image: "barca",
              cls: "barcelona",
            },
            {
              name: "Manchester United",
              tag: "GLORY, GLORY",
              image: "united",
              cls: "united",
            },
            {
              name: "Manchester City",
              tag: "BLUE MOON",
              image: "city",
              cls: "city",
            },
          ].map((c, i) => (
            <Link
              to={`/catalog?category=Форма&club=${encodeURIComponent(c.name)}`}
              className={`club-card ${c.cls}`}
              key={c.name}
            >
              <div className="club-number">
                0{i + 1} <ArrowUpRight size={18} />
              </div>
              <div className="club-shirt">
                <img
                  src={`/images/${c.image}.webp`}
                  alt={`Домашняя футболка ${c.name}`}
                  loading="lazy"
                />
              </div>
              <div className="club-info">
                <small>{c.tag}</small>
                <h3>{c.name}</h3>
                <span>
                  Смотреть форму <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="manifesto">
        <div className="container manifesto-inner">
          <div className="eyebrow">4PLAY / БОЛЬШЕ, ЧЕМ МАГАЗИН</div>
          <h2>
            90 МИНУТ НА ПОЛЕ.
            <br />
            <span>ФУТБОЛ — НАВСЕГДА.</span>
          </h2>
          <div className="manifesto-bottom">
            <p>
              Мы знаем это чувство. Запах газона, звук удара, гол на последней
              минуте. 4PLAY — для тех, кому не нужно объяснять, почему футбол
              значит так много.
            </p>
            <a
              className="text-link"
              href="https://www.instagram.com/4playru/"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={20} /> Быть в игре <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>
      <ServiceStrip />
    </>
  );
}
function ServiceStrip() {
  const { info } = useStore();
  return (
    <section className="service-strip container">
      <button onClick={() => info("delivery")}>
        <Truck />
        <span>
          <b>В твоём городе</b>
          <small>Доставка по России</small>
        </span>
        <ArrowUpRight size={16} />
      </button>
      <button onClick={() => info("sizes")}>
        <Ruler />
        <span>
          <b>Твоя идеальная посадка</b>
          <small>Поможем выбрать размер</small>
        </span>
        <ArrowUpRight size={16} />
      </button>
      <button onClick={() => info("about")}>
        <Instagram />
        <span>
          <b>На одной волне</b>
          <small>Больше футбола в @4playru</small>
        </span>
        <ArrowUpRight size={16} />
      </button>
    </section>
  );
}
function ProductCard({ p }: { p: Product }) {
  const { favorites, toggle, quick } = useStore();
  const active = favorites.includes(p.id);
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/product/${p.id}`} aria-label={p.name}>
          <img
            src={p.image}
            alt={`${p.brand} ${p.name}, ${p.color}`}
            loading="lazy"
            width="600"
            height="600"
          />
        </Link>
        {p.badge && <span className="product-badge">{p.badge}</span>}
        <button
          className={`favorite-button ${active ? "is-favorite" : ""}`}
          onClick={() => toggle(p.id)}
          aria-label={
            active ? `Убрать ${p.name} из избранного` : `В избранное: ${p.name}`
          }
          aria-pressed={active}
        >
          <Heart size={18} fill={active ? "currentColor" : "none"} />
        </button>
        <button className="quick-button" onClick={() => quick(p)}>
          Быстрый выбор <Plus size={16} />
        </button>
      </div>
      <div className="product-meta">
        <span>{p.brand}</span>
        <span>{p.ground || (p.club ? "24/25" : p.category)}</span>
      </div>
      <Link className="product-name" to={`/product/${p.id}`}>
        {p.name}
      </Link>
      <div className="product-color">{p.color}</div>
      <div className="product-price">
        <strong>{money(p.price)}</strong>
        <button
          onClick={() => quick(p)}
          className="icon-button add-product"
          aria-label={`Выбрать размер ${p.name}`}
        >
          <Plus size={20} />
        </button>
      </div>
    </article>
  );
}
function Featured() {
  const [category, setCategory] = useState("Бутсы");
  const shown = products
    .filter((p) => category === "Все" || p.category === category)
    .slice(0, 4);
  return (
    <section className="container section featured">
      <div className="section-heading">
        <div>
          <div className="eyebrow">02 / В ФОКУСЕ 4PLAY</div>
          <h2>
            ВЫБОР ЗА ТОБОЙ<span className="accent">.</span>
          </h2>
        </div>
        <Link className="text-link" to="/catalog">
          Смотреть всё <ArrowUpRight size={18} />
        </Link>
      </div>
      <div
        className="featured-tabs"
        role="group"
        aria-label="Категории товаров"
      >
        {["Бутсы", "Форма", "Мячи", "Аксессуары"].map((c) => (
          <button
            onClick={() => setCategory(c)}
            key={c}
            className={c === category ? "active" : ""}
            aria-pressed={c === category}
          >
            {c}
            <span>
              {products
                .filter((p) => p.category === c)
                .length.toString()
                .padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
      <div className="product-grid">
        {shown.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
function Catalog({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const [params, setParams] = useSearchParams();
  const { favorites } = useStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const category = params.get("category") || "Все",
    q = params.get("q") || "",
    brand = params.get("brand") || "",
    size = params.get("size") || "",
    club = params.get("club") || "",
    sort = params.get("sort") || "default",
    max = params.get("max") || "";
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "category") {
      next.delete("size");
      next.delete("club");
    }
    setParams(next, { replace: true });
  };
  let shown = products.filter(
    (p) =>
      (!favoritesOnly || favorites.includes(p.id)) &&
      (category === "Все" || p.category === category) &&
      (!brand || p.brand === brand) &&
      (!size || p.sizes.includes(size)) &&
      (!club || p.club === club) &&
      (!max || p.price <= Number(max)) &&
      `${p.name} ${p.brand} ${p.category} ${p.club || ""}`
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );
  if (sort === "low") shown.sort((a, b) => a.price - b.price);
  if (sort === "high") shown.sort((a, b) => b.price - a.price);
  if (sort === "name") shown.sort((a, b) => a.name.localeCompare(b.name));
  const hasFilters = brand || size || club || max || q || category !== "Все";
  const sizes = [
    ...new Set(
      products
        .filter((p) => category === "Все" || p.category === category)
        .flatMap((p) => p.sizes),
    ),
  ];
  return (
    <main className="container catalog-page">
      <div className="breadcrumbs">
        <Link to="/">Главная</Link>
        <span>/</span>
        <span>{favoritesOnly ? "Избранное" : "Каталог"}</span>
      </div>
      <div className="catalog-title">
        <div>
          <div className="eyebrow">
            {favoritesOnly
              ? "СОХРАНИ ДЛЯ СВОЕЙ ИГРЫ"
              : "4PLAY / THE COLLECTION"}
          </div>
          <h1>
            {favoritesOnly
              ? "ИЗБРАННОЕ"
              : club ||
                (category === "Все" ? "ВСЁ ДЛЯ ИГРЫ" : category.toUpperCase())}
            <span className="accent">.</span>
          </h1>
        </div>
        <span>
          {shown.length} из {favoritesOnly ? favorites.length : products.length}{" "}
          товаров
        </span>
      </div>
      <div className="catalog-categories">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => set("category", c === "Все" ? "" : c)}
            className={category === c ? "active" : ""}
          >
            {c}
            <small>
              {
                products.filter(
                  (p) =>
                    (c === "Все" || p.category === c) &&
                    (!favoritesOnly || favorites.includes(p.id)),
                ).length
              }
            </small>
          </button>
        ))}
      </div>
      <div className="catalog-layout">
        <aside className={`filter-panel ${filtersOpen ? "filter-open" : ""}`}>
          <div className="filter-heading">
            <b>ФИЛЬТРЫ</b>
            <SlidersHorizontal size={17} />
          </div>
          <fieldset>
            <legend>Бренд</legend>
            {["NIKE", "ADIDAS", "PUMA"].map((b) => (
              <label className="check-label" key={b}>
                <input
                  type="checkbox"
                  checked={brand === b}
                  onChange={() => set("brand", brand === b ? "" : b)}
                />
                <span>{b}</span>
                <small>
                  {
                    products.filter(
                      (p) =>
                        p.brand === b &&
                        (category === "Все" || p.category === category),
                    ).length
                  }
                </small>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Размер</legend>
            <div className="filter-sizes">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => set("size", size === s ? "" : s)}
                  className={size === s ? "active" : ""}
                  aria-pressed={size === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Цена до</legend>
            <label className="price-filter">
              <input
                type="number"
                aria-label="Максимальная цена в рублях"
                min="0"
                value={max}
                placeholder="Любая"
                onChange={(e) => set("max", e.target.value)}
              />
              <span>₽</span>
            </label>
          </fieldset>
          {hasFilters && (
            <button className="reset-filters" onClick={() => setParams({})}>
              <RotateCcw size={15} /> Сбросить фильтры
            </button>
          )}
          <div className="filter-help">
            <Ruler size={24} />
            <b>Не уверен в размере?</b>
            <p>
              Начни с длины стопы.
              <br />
              Поможем разобраться.
            </p>
            <SizeHelp />
          </div>
        </aside>
        <div className="catalog-results">
          <div className="catalog-tools">
            <label className="catalog-search">
              <Search size={18} />
              <input
                aria-label="Поиск по каталогу"
                placeholder="Название, бренд или клуб"
                value={q}
                onChange={(e) => set("q", e.target.value)}
              />
              {q && (
                <button
                  className="icon-button"
                  onClick={() => set("q", "")}
                  aria-label="Очистить поиск"
                >
                  <X size={15} />
                </button>
              )}
            </label>
            <button
              className="filter-toggle"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={16} /> Фильтры
            </button>
            <label className="sort-label">
              <select
                aria-label="Сортировка товаров"
                value={sort}
                onChange={(e) => set("sort", e.target.value)}
              >
                <option value="default">Выбор 4PLAY</option>
                <option value="low">Сначала дешевле</option>
                <option value="high">Сначала дороже</option>
                <option value="name">По названию</option>
              </select>
              <ChevronDown size={15} />
            </label>
          </div>
          {club && (
            <div className="active-filters">
              <button onClick={() => set("club", "")}>
                {club} <X size={13} />
              </button>
            </div>
          )}
          {shown.length ? (
            <div className="product-grid catalog-grid">
              {shown.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {favoritesOnly && !favorites.length ? (
                <Heart size={40} />
              ) : (
                <Search size={40} />
              )}
              <h2>
                {favoritesOnly && !favorites.length
                  ? "ТВОИ ФАВОРИТЫ БУДУТ ЗДЕСЬ"
                  : "ПОКА НИЧЕГО"}
              </h2>
              <p>
                {favoritesOnly && !favorites.length
                  ? "Нажми на сердечко у товара, который тебе нравится."
                  : "Попробуй изменить запрос или сбросить фильтры."}
              </p>
              {hasFilters ? (
                <button
                  className="button button-dark"
                  onClick={() => setParams({})}
                >
                  СБРОСИТЬ ФИЛЬТРЫ <RotateCcw size={16} />
                </button>
              ) : (
                <Link className="button button-dark" to="/catalog">
                  В КАТАЛОГ <ArrowUpRight size={18} />
                </Link>
              )}
            </div>
          )}
          <div className="catalog-end">
            <span>
              {shown.length
                ? "ТЫ ВИДЕЛ ВСЁ. ОСТАЛОСЬ ВЫБРАТЬ СВОЁ."
                : "ТВОЯ ИГРА ОБЯЗАТЕЛЬНО НАЙДЁТСЯ."}
            </span>
            <span>4PLAY®</span>
          </div>
        </div>
      </div>
    </main>
  );
}
function SizeHelp() {
  const { info } = useStore();
  return (
    <button className="text-link" onClick={() => info("sizes")}>
      Гид по размерам <ArrowUpRight size={15} />
    </button>
  );
}
function SizeSelector({
  p,
  size,
  setSize,
  error,
}: {
  p: Product;
  size: string;
  setSize: (s: string) => void;
  error?: boolean;
}) {
  return (
    <>
      <div className="size-heading">
        <b>Размер {p.category === "Бутсы" ? "(EU)" : ""}</b>
        <SizeHelp />
      </div>
      <div className="sizes" role="group" aria-label="Выберите размер">
        {p.sizes.map((s) => (
          <button
            className={s === size ? "active" : ""}
            key={s}
            onClick={() => setSize(s)}
            aria-pressed={s === size}
          >
            {s}
          </button>
        ))}
      </div>
      {error && !size && (
        <p className="field-error" role="alert">
          Выбери размер, чтобы добавить товар.
        </p>
      )}
    </>
  );
}
function QuickProduct({ p }: { p: Product }) {
  const [size, setSize] = useState(""),
    [error, setError] = useState(false);
  const { add } = useStore();
  return (
    <div className="quick-product">
      <div className="quick-product-info">
        <img src={p.image} alt={p.name} />
        <div>
          <div className="eyebrow">{p.brand}</div>
          <h3>{p.name}</h3>
          <strong>{money(p.price)}</strong>
        </div>
      </div>
      <SizeSelector p={p} size={size} setSize={setSize} error={error} />
      <button
        className="button button-orange full-width"
        onClick={() => (size ? add(p, size) : setError(true))}
      >
        В КОРЗИНУ <ShoppingBag size={19} />
      </button>
    </div>
  );
}
function ProductPage() {
  const { id } = useParams();
  const p = productById(Number(id));
  return p ? <ProductDetails key={p.id} p={p} /> : <NotFound />;
}
function ProductDetails({ p }: { p: Product }) {
  const [size, setSize] = useState(""),
    [error, setError] = useState(false),
    [zoom, setZoom] = useState(false);
  const store = useStore();
  const favorite = store.favorites.includes(p.id);
  const related = products
    .filter((x) => x.id !== p.id && x.category === p.category)
    .slice(0, 4);
  return (
    <main>
      <section className="container product-page">
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to={`/catalog?category=${p.category}`}>{p.category}</Link>
          <span>/</span>
          <span>{p.name}</span>
        </div>
        <div className="product-detail">
          <div className="detail-image">
            <img src={p.image} alt={`${p.brand} ${p.name} — ${p.color}`} />
            {p.badge && <span className="product-badge">{p.badge}</span>}
            <button
              className="zoom-button icon-button"
              onClick={() => setZoom(true)}
              aria-label="Увеличить фото"
            >
              <Expand size={22} />
            </button>
            <span className="detail-image-caption">
              {p.brand} / {p.ground || p.category.toUpperCase()}
            </span>
          </div>
          <div className="detail-copy">
            <div className="eyebrow">
              {p.brand} / {p.category}
            </div>
            <h1>{p.name}</h1>
            <p className="detail-color">{p.color}</p>
            <div className="detail-price">{money(p.price)}</div>
            <p className="detail-description">{p.description}</p>
            <SizeSelector p={p} size={size} setSize={setSize} error={error} />
            <div className="detail-actions">
              <button
                className="button button-orange"
                onClick={() => (size ? store.add(p, size) : setError(true))}
              >
                ДОБАВИТЬ В КОРЗИНУ <ShoppingBag size={20} />
              </button>
              <button
                className={`detail-favorite ${favorite ? "is-favorite" : ""}`}
                onClick={() => store.toggle(p.id)}
                aria-label="Сохранить в избранное"
                aria-pressed={favorite}
              >
                <Heart size={22} fill={favorite ? "currentColor" : "none"} />
              </button>
            </div>
            <button
              className="detail-delivery"
              onClick={() => store.info("delivery")}
            >
              <Truck size={19} />
              <span>
                Доставка по России <small>Условия уточняются при заказе</small>
              </span>
              <ArrowUpRight size={18} />
            </button>
            <details className="product-accordion" open>
              <summary>
                Характеристики <Plus size={16} />
              </summary>
              <dl>
                <div>
                  <dt>Бренд</dt>
                  <dd>{p.brand}</dd>
                </div>
                <div>
                  <dt>Категория</dt>
                  <dd>{p.category}</dd>
                </div>
                <div>
                  <dt>Цвет</dt>
                  <dd>{p.color}</dd>
                </div>
                {p.ground && (
                  <div>
                    <dt>Покрытие</dt>
                    <dd>
                      {p.ground === "FG/AG"
                        ? "Натуральный / искусственный газон"
                        : "Натуральный газон (FG)"}
                    </dd>
                  </div>
                )}
                {p.club && (
                  <div>
                    <dt>Сезон</dt>
                    <dd>2024/25 · домашняя</dd>
                  </div>
                )}
              </dl>
            </details>
            <details className="product-accordion">
              <summary>
                Как ухаживать <Plus size={16} />
              </summary>
              <p>
                {p.category === "Бутсы"
                  ? "После игры убери грязь мягкой щёткой. Суши при комнатной температуре, вдали от батарей. Не стирай бутсы в машине."
                  : p.category === "Форма"
                    ? "Следуй инструкции на ярлыке. Стирай наизнанку с похожими цветами, без отбеливателя. Не гладь принты и эмблемы."
                    : "Соблюдай рекомендации производителя на упаковке. Храни экипировку в сухом месте и очищай после тренировок."}
              </p>
            </details>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="container section related-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">ПРОДОЛЖАЙ ВЫБИРАТЬ</div>
              <h2>
                ЕЩЁ В ИГРЕ<span className="accent">.</span>
              </h2>
            </div>
            <Link className="text-link" to={`/catalog?category=${p.category}`}>
              Вся коллекция <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="product-grid">
            {related.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </div>
        </section>
      )}
      {zoom && (
        <Modal title={p.name} wide close={() => setZoom(false)}>
          <img
            className="zoomed-image"
            src={p.image}
            alt={`${p.brand} ${p.name}, увеличенное фото`}
          />
        </Modal>
      )}
    </main>
  );
}
function CartPage() {
  const { cart, count, total, change, remove } = useStore();
  return (
    <main className="container page">
      <div className="breadcrumbs">
        <Link to="/">Главная</Link>
        <span>/</span>
        <span>Корзина</span>
      </div>
      <div className="catalog-title">
        <div>
          <div className="eyebrow">4PLAY / ТВОЙ СОСТАВ</div>
          <h1>
            ГОТОВ К ИГРЕ<span className="accent">?</span>
          </h1>
        </div>
        <span>{count} шт. в корзине</span>
      </div>
      {!cart.length ? (
        <div className="empty-state">
          <ShoppingBag size={44} />
          <h2>СОБЕРИ СВОЙ СОСТАВ</h2>
          <p>Твоя следующая любимая экипировка уже ждёт в каталоге.</p>
          <Link className="button button-dark" to="/catalog">
            ВЫБРАТЬ ЭКИПИРОВКУ <ArrowUpRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            <div className="cart-table-head">
              <span>ТОВАР</span>
              <span>КОЛИЧЕСТВО / СУММА</span>
            </div>
            {cart.map((x) => {
              const p = productById(x.id)!;
              return (
                <article className="cart-row" key={`${x.id}-${x.size}`}>
                  <Link className="cart-image" to={`/product/${p.id}`}>
                    <img src={p.image} alt={p.name} />
                  </Link>
                  <div className="cart-product">
                    <small>{p.brand}</small>
                    <Link to={`/product/${p.id}`}>
                      <b>{p.name}</b>
                    </Link>
                    <span>
                      Размер: {x.size} · {p.color}
                    </span>
                    <div className="quantity">
                      <button
                        onClick={() => change(x.id, x.size, -1)}
                        aria-label={`Уменьшить количество ${p.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{x.qty}</span>
                      <button
                        disabled={x.qty >= 99}
                        onClick={() => change(x.id, x.size, 1)}
                        aria-label={`Увеличить количество ${p.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-row-end">
                    <button
                      className="icon-button"
                      onClick={() => remove(x.id, x.size)}
                      aria-label={`Удалить ${p.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                    <strong>{money(p.price * x.qty)}</strong>
                    <small>{money(p.price)} / шт.</small>
                  </div>
                </article>
              );
            })}
            <Link className="text-link continue-shopping" to="/catalog">
              <ArrowLeft size={16} /> Продолжить выбирать
            </Link>
          </div>
          <aside className="order-summary">
            <span className="eyebrow">ТВОЙ СТАРТОВЫЙ СОСТАВ</span>
            <h2>ВСЁ СОШЛОСЬ.</h2>
            <div>
              <span>Товары ({count})</span>
              <b>{money(total)}</b>
            </div>
            <div>
              <span>Доставка</span>
              <small>Уточняется отдельно</small>
            </div>
            <div className="order-total">
              <span>Итого за товары</span>
              <strong>{money(total)}</strong>
            </div>
            <Link className="button button-orange full-width" to="/checkout">
              ОФОРМИТЬ <ArrowUpRight size={20} />
            </Link>
            <p className="demo-note">
              <ShieldCheck size={15} /> Демонстрационный заказ без оплаты
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
function Checkout() {
  const { cart, count, total, clear } = useStore();
  const [done, setDone] = useState(false),
    [method, setMethod] = useState("delivery");
  if (done)
    return (
      <main className="container page">
        <div className="empty-state success-state">
          <CircleCheck size={56} />
          <div className="eyebrow">ХОРОШИЙ ВЫБОР</div>
          <h1>
            ТЫ ГОТОВ К ИГРЕ<span className="accent">.</span>
          </h1>
          <p>
            Демо-заказ собран. Данные никуда не отправлены, оплата не
            проводилась.
          </p>
          <Link className="button button-orange" to="/catalog">
            ПРОДОЛЖИТЬ ВЫБИРАТЬ <ArrowUpRight size={18} />
          </Link>
        </div>
      </main>
    );
  if (!count) return <CartPage />;
  return (
    <main className="container page">
      <div className="breadcrumbs">
        <Link to="/cart">Корзина</Link>
        <span>/</span>
        <span>Оформление</span>
      </div>
      <div className="catalog-title">
        <div>
          <div className="eyebrow">ОСТАЛСЯ ПОСЛЕДНИЙ ПАС</div>
          <h1>
            ТВОЙ ЗАКАЗ<span className="accent">.</span>
          </h1>
        </div>
      </div>
      <form
        className="checkout-layout"
        onSubmit={(e) => {
          e.preventDefault();
          setDone(true);
          clear();
        }}
      >
        <div className="checkout-fields">
          <h2>
            <span>01</span> Контактные данные
          </h2>
          <div className="form-grid">
            <label>
              Имя
              <input
                required
                name="name"
                autoComplete="given-name"
                placeholder="Как к тебе обращаться"
                maxLength={80}
              />
            </label>
            <label>
              Телефон
              <input
                type="tel"
                required
                name="phone"
                autoComplete="tel"
                minLength={10}
                maxLength={22}
                pattern="[+0-9 ()-]{10,22}"
                placeholder="+7 (999) 000-00-00"
              />
            </label>
          </div>
          <h2>
            <span>02</span> Получение
          </h2>
          <div className="delivery-options">
            <label className={method === "delivery" ? "active" : ""}>
              <input
                type="radio"
                name="method"
                checked={method === "delivery"}
                onChange={() => setMethod("delivery")}
              />
              <Truck size={20} />
              <span>
                Доставка<small>По России</small>
              </span>
            </label>
            <label className={method === "pickup" ? "active" : ""}>
              <input
                type="radio"
                name="method"
                checked={method === "pickup"}
                onChange={() => setMethod("pickup")}
              />
              <Package size={20} />
              <span>
                Самовывоз<small>Махачкала</small>
              </span>
            </label>
          </div>
          {method === "delivery" && (
            <div className="form-grid">
              <label>
                Город
                <input
                  name="city"
                  required
                  autoComplete="address-level2"
                  placeholder="Твой город"
                />
              </label>
              <label>
                Адрес или пункт выдачи
                <input
                  name="address"
                  required
                  autoComplete="street-address"
                  placeholder="Улица, дом или адрес ПВЗ"
                />
              </label>
            </div>
          )}
          <label className="comment-field">
            Комментарий
            <textarea
              name="comment"
              placeholder="Что нам нужно знать о твоём заказе?"
              rows={3}
              maxLength={500}
            />
          </label>
          <p className="checkout-explainer">
            Это демонстрация оформления. Форма не отправляет персональные данные
            и не принимает оплату. Стоимость и сроки доставки в рабочем магазине
            подтверждает менеджер.
          </p>
        </div>
        <aside className="order-summary">
          <div className="eyebrow">В ТВОЁМ ЗАКАЗЕ</div>
          <div className="mini-order">
            {cart.map((x) => {
              const p = productById(x.id)!;
              return (
                <div key={`${x.id}-${x.size}`}>
                  <img src={p.image} alt="" />
                  <span>
                    <b>{p.name}</b>
                    <small>
                      Размер {x.size} · {x.qty} шт.
                    </small>
                  </span>
                  <strong>{money(p.price * x.qty)}</strong>
                </div>
              );
            })}
          </div>
          <div className="order-total">
            <span>За товары</span>
            <strong>{money(total)}</strong>
          </div>
          <button className="button button-orange full-width" type="submit">
            СОБРАТЬ ДЕМО-ЗАКАЗ <Check size={19} />
          </button>
          <p className="demo-note">
            Деньги не списываются. Заказ не отправляется.
          </p>
        </aside>
      </form>
    </main>
  );
}
function InfoContent({ kind }: { kind: Info }) {
  if (kind === "sizes")
    return (
      <div className="info-content">
        <p>
          Для бутс измерь длину обеих стоп в футбольных гетрах. Поставь пятку к
          стене и измерь расстояние до самого длинного пальца. Ориентируйся на
          большую стопу.
        </p>
        <div className="size-tip">
          <Ruler />
          <span>
            Сетки Nike, adidas и PUMA различаются. Размер EU сам по себе не
            гарантирует одинаковую посадку.
          </span>
        </div>
        <h3>Для клубной формы</h3>
        <p>
          Измерь обхват груди и сравни с размерной сеткой конкретного
          производителя. Между двумя размерами? Выбирай в зависимости от того,
          любишь ли ты более плотную или свободную посадку.
        </p>
        <a
          className="button button-dark full-width"
          href="https://www.instagram.com/4playru/"
          target="_blank"
          rel="noreferrer"
        >
          УТОЧНИТЬ РАЗМЕР В 4PLAY <ArrowUpRight size={18} />
        </a>
      </div>
    );
  if (kind === "delivery")
    return (
      <div className="info-content">
        <div className="info-row">
          <Truck />
          <div>
            <h3>Доставка по России</h3>
            <p>
              Способ, сроки и стоимость отправки зависят от города и состава
              заказа. Перед оформлением уточни условия у магазина.
            </p>
          </div>
        </div>
        <div className="info-row">
          <Package />
          <div>
            <h3>Самовывоз в Махачкале</h3>
            <p>Адрес и время получения согласовываются с магазином.</p>
          </div>
        </div>
        <div className="size-tip">
          <ShieldCheck />
          <span>
            Сейчас открыт демо-магазин. Корзина и оформление показывают процесс
            заказа; покупка и оплата не выполняются.
          </span>
        </div>
        <a
          className="button button-dark full-width"
          href="https://www.instagram.com/4playru/"
          target="_blank"
          rel="noreferrer"
        >
          СВЯЗАТЬСЯ С 4PLAY <ArrowUpRight size={18} />
        </a>
      </div>
    );
  return (
    <div className="info-content">
      <div className="about-logo">
        <Logo />
      </div>
      <h3>Футбол — наш язык.</h3>
      <p>
        Бутсы для первого рывка. Форма любимого клуба. Мяч, который всегда с
        тобой. Мы собираем футбольную экипировку для тех, у кого игра
        продолжается после финального свистка.
      </p>
      <a
        className="button button-dark full-width"
        href="https://www.instagram.com/4playru/"
        target="_blank"
        rel="noreferrer"
      >
        <Instagram size={18} /> @4playru <ArrowUpRight size={18} />
      </a>
    </div>
  );
}
function Footer() {
  const { info, count } = useStore();
  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <Link to="/" aria-label="На главную 4PLAY">
                <Logo />
              </Link>
              <p>FOOTBALL IS OUR LANGUAGE.</p>
              <a
                className="social-link"
                href="https://www.instagram.com/4playru/"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram size={18} /> @4playru <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="footer-links">
              <b>В ИГРЕ</b>
              <Link to="/catalog?category=Бутсы">Бутсы</Link>
              <Link to="/catalog?category=Форма">Клубная форма</Link>
              <Link to="/catalog?category=Мячи">Мячи</Link>
              <Link to="/catalog?category=Аксессуары">Аксессуары</Link>
            </div>
            <div className="footer-links">
              <b>ПОМОЩЬ</b>
              <button onClick={() => info("delivery")}>Доставка и заказ</button>
              <button onClick={() => info("sizes")}>Как выбрать размер</button>
              <Link to="/favorites">Избранное</Link>
              <button onClick={() => info("about")}>О 4PLAY</button>
            </div>
            <div className="footer-statement">
              THE GAME
              <br />
              NEVER
              <br />
              <span>STOPS.</span>
              <MoveUpRight />
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} 4PLAY</span>
            <span>Демо-магазин. Ассортимент и цены — для демонстрации.</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Наверх <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </footer>
      <nav className="mobile-bar" aria-label="Мобильная навигация">
        <NavLink to="/" end>
          <Home size={19} />
          <span>Главная</span>
        </NavLink>
        <NavLink to="/catalog">
          <Grid2X2 size={19} />
          <span>Каталог</span>
        </NavLink>
        <NavLink to="/favorites">
          <Heart size={19} />
          <span>Избранное</span>
        </NavLink>
        <NavLink to="/cart">
          <ShoppingBag size={19} />
          <span>Корзина{count ? ` · ${count}` : ""}</span>
        </NavLink>
      </nav>
    </>
  );
}
function NotFound() {
  return (
    <main className="container page">
      <div className="empty-state">
        <div className="eyebrow">404 / МЯЧ ЗА ПРЕДЕЛАМИ ПОЛЯ</div>
        <h1>
          ТУТ ВНЕ ИГРЫ<span className="accent">.</span>
        </h1>
        <p>Такой страницы нет. Вернёмся в игру?</p>
        <Link className="button button-dark" to="/catalog">
          В КАТАЛОГ <ArrowUpRight size={18} />
        </Link>
      </div>
    </main>
  );
}
function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <ScrollToTop />
        <a className="skip-link" href="#content">
          Перейти к содержимому
        </a>
        <Header />
        <div id="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/favorites" element={<Catalog favoritesOnly />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </StoreProvider>
    </BrowserRouter>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
