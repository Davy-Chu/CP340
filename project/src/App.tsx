import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Leaf,
  Menu,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  X,
} from 'lucide-react';

type Page = 'home' | 'shop' | 'product' | 'about' | 'blog';
type Category = 'All' | 'Stands' | 'Lighting' | 'Organization' | 'Decor';

type Product = {
  id: number;
  name: string;
  price: number;
  category: Exclude<Category, 'All'>;
  image: string;
  description: string;
  features: string[];
};

const images = {
  hero: 'https://images.pexels.com/photos/10567351/pexels-photo-10567351.jpeg?auto=compress&cs=tinysrgb&w=1400',
  desk: 'https://images.pexels.com/photos/12278554/pexels-photo-12278554.jpeg?auto=compress&cs=tinysrgb&w=1400',
  journal: 'https://images.pexels.com/photos/6177596/pexels-photo-6177596.jpeg?auto=compress&cs=tinysrgb&w=1200',
  stand: 'https://images.pexels.com/photos/8004107/pexels-photo-8004107.jpeg?auto=compress&cs=tinysrgb&w=900',
  organizer: 'https://images.pexels.com/photos/11148009/pexels-photo-11148009.jpeg?auto=compress&cs=tinysrgb&w=900',
  lamp: 'https://images.pexels.com/photos/30107913/pexels-photo-30107913.png?auto=compress&cs=tinysrgb&w=900',
};

const products: Product[] = [
  {
    id: 1,
    name: 'Lift Laptop Stand',
    price: 59,
    category: 'Stands',
    image: images.stand,
    description: 'Raise your screen and create a more comfortable workspace.',
    features: ['Ergonomic design', 'Sturdy and stable build', 'Sleek, minimalist look', 'Fits most laptops up to 16”'],
  },
  {
    id: 2,
    name: 'Nest Desk Organizer',
    price: 39,
    category: 'Organization',
    image: images.organizer,
    description: 'A calm home for the small tools you use every day.',
    features: ['Solid wood construction', 'Modular compartments', 'Keeps essentials within reach', 'Designed for small desks'],
  },
  {
    id: 3,
    name: 'Halo Desk Lamp',
    price: 49,
    category: 'Lighting',
    image: images.lamp,
    description: 'Soft, focused light for your clearest hours.',
    features: ['Warm adjustable glow', 'Compact footprint', 'Touch dimmer', 'Low-energy LED'],
  },
  {
    id: 4,
    name: 'Rise Monitor Stand',
    price: 69,
    category: 'Stands',
    image: images.desk,
    description: 'A little more height, and a lot more breathing room.',
    features: ['Raises monitor to eye level', 'Hidden storage shelf', 'Solid bamboo finish', 'Supports up to 20kg'],
  },
  {
    id: 5,
    name: 'CableDock Organizer',
    price: 24,
    category: 'Organization',
    image: images.organizer,
    description: 'Keep every cable in its place and off the floor.',
    features: ['Six cable channels', 'Weighted non-slip base', 'Fits charging cables', 'Easy one-hand access'],
  },
  {
    id: 6,
    name: 'Quiet Ceramic Planter',
    price: 29,
    category: 'Decor',
    image: images.lamp,
    description: 'A small touch of green to make your desk feel alive.',
    features: ['Hand-finished ceramic', 'Drainage tray included', 'Fits small desk plants', 'Neutral matte glaze'],
  },
];

function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [cart, setCart] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProduct = (product: Product) => {
    setSelectedProduct(product);
    navigate('product');
  };

  const addToCart = (product: Product) => {
    setCart((current) => [...current, product]);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f5f0] text-[#17201b]">
      <header className="site-header">
        <div className="header-inner">
          <button className="wordmark" onClick={() => navigate('home')} aria-label="Go to WorkNest home">
            WorkNest
          </button>
          <nav className={`main-nav ${mobileMenuOpen ? 'is-open' : ''}`}>
            <button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}>Home</button>
            <button className={page === 'shop' || page === 'product' ? 'active' : ''} onClick={() => navigate('shop')}>Shop</button>
            <button className={page === 'blog' ? 'active' : ''} onClick={() => navigate('blog')}>Blog</button>
            <button className={page === 'about' ? 'active' : ''} onClick={() => navigate('about')}>About</button>
          </nav>
          <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Open cart with ${cart.length} items`}>
            <ShoppingCart size={21} strokeWidth={1.7} />
            {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </button>
          <button className="menu-button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        {page === 'home' && <HomePage navigate={navigate} viewProduct={viewProduct} />}
        {page === 'shop' && <ShopPage viewProduct={viewProduct} />}
        {page === 'product' && <ProductPage product={selectedProduct} addToCart={addToCart} />}
        {page === 'about' && <AboutPage navigate={navigate} />}
        {page === 'blog' && <BlogPage />}
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="footer-wordmark">WorkNest</span>
          <p>Simple tools for a calmer, more productive workspace.</p>
        </div>
        <div className="footer-links">
          <button onClick={() => navigate('shop')}>Shop</button>
          <button onClick={() => navigate('blog')}>Journal</button>
          <button onClick={() => navigate('about')}>About</button>
        </div>
        <p className="footer-note">© 2024 WorkNest. Made for better workdays.</p>
      </footer>

      {cartOpen && <CartDrawer cart={cart} close={() => setCartOpen(false)} remove={(index) => setCart((current) => current.filter((_, itemIndex) => itemIndex !== index))} />}
    </div>
  );
}

function HomePage({ navigate, viewProduct }: { navigate: (page: Page) => void; viewProduct: (product: Product) => void }) {
  return (
    <>
      <section className="hero-section page-width">
        <div className="hero-copy">
          <p className="eyebrow">Thoughtful tools for everyday focus</p>
          <h1>Build a Better<br />Workspace</h1>
          <p className="hero-description">Simple tools for a calmer,<br className="desktop-break" /> more productive you.</p>
          <button className="primary-button" onClick={() => navigate('shop')}>Shop Now <ArrowRight size={16} /></button>
        </div>
        <div className="hero-image-wrap">
          <img src={images.hero} alt="Minimal desk with a laptop, plants, and warm light" />
          <div className="hero-note">Good work<br /><em>brighter</em><br />days</div>
        </div>
      </section>

      <section className="pillars-section page-width">
        <Pillar icon={<Sparkles size={23} />} title="Organized" text="Clutter-free spaces." />
        <Pillar icon={<Leaf size={23} />} title="Comfortable" text="Work feels better." />
        <Pillar icon={<ArrowRight size={23} />} title="Focused" text="More done, less stress." />
      </section>

      <section className="story-section page-width">
        <div className="story-image"><img src={images.desk} alt="Bright, organized workspace" /></div>
        <div className="story-copy">
          <p className="eyebrow">The WorkNest approach</p>
          <h2>Your desk should help you focus — not distract you.</h2>
          <p>A better workday starts with the space around you. We bring together simple, affordable essentials designed to improve how your workspace looks, feels, and functions.</p>
          <button className="text-button" onClick={() => navigate('about')}>Our story <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="featured-section page-width">
        <div className="section-heading"><div><p className="eyebrow">Made for your desk</p><h2>Workspace essentials</h2></div><button className="text-button" onClick={() => navigate('shop')}>View all <ArrowRight size={15} /></button></div>
        <div className="product-grid product-grid-home">{products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} onClick={() => viewProduct(product)} />)}</div>
      </section>

      <section className="bundle-section page-width">
        <div><p className="eyebrow">The easy place to start</p><h2>Upgrade your entire desk.</h2><p>Everything you need for a more organized, comfortable setup — together for less.</p><button className="primary-button light-button" onClick={() => viewProduct(products[0])}>Explore the bundle <ArrowRight size={16} /></button></div>
        <div className="bundle-price"><span>WorkNest</span><strong>Starter</strong><small>Bundle</small><b>$84</b></div>
      </section>
    </>
  );
}

function Pillar({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="pillar"><div className="pillar-icon">{icon}</div><div><strong>{title}</strong><span>{text}</span></div></div>;
}

function ShopPage({ viewProduct }: { viewProduct: (product: Product) => void }) {
  const [category, setCategory] = useState<Category>('All');
  const filtered = useMemo(() => category === 'All' ? products : products.filter((product) => product.category === category), [category]);
  const categories: Category[] = ['All', 'Stands', 'Lighting', 'Organization', 'Decor'];
  return <section className="shop-page page-width"><div className="shop-heading"><div><p className="eyebrow">The WorkNest collection</p><h1>Shop</h1><p>Workspace essentials for a calmer, more productive you.</p></div><span className="product-total">{filtered.length} products</span></div><div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onClick={() => viewProduct(product)} />)}</div></section>;
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return <button className="product-card" onClick={onClick}><div className="product-image"><img src={product.image} alt={product.name} /><span>View details <ArrowRight size={14} /></span></div><div className="product-card-info"><div><h3>{product.name}</h3><p>{product.category}</p></div><strong>${product.price}</strong></div></button>;
}

function ProductPage({ product, addToCart }: { product: Product; addToCart: (product: Product) => void }) {
  const [quantity, setQuantity] = useState(1);
  return <section className="product-page page-width"><div className="product-gallery"><div className="gallery-thumbs"><img src={product.image} alt="" /><img src={images.desk} alt="" /><img src={images.organizer} alt="" /><img src={images.hero} alt="" /></div><div className="product-main-image"><img src={product.image} alt={product.name} /></div></div><div className="product-details"><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><div className="product-price">${product.price}</div><p className="product-description">{product.description}</p><ul className="feature-list">{product.features.map((feature) => <li key={feature}><Check size={17} />{feature}</li>)}</ul><label className="quantity-label">Quantity<div className="quantity-control"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span>{quantity}</span><button onClick={() => setQuantity((value) => value + 1)}><Plus size={14} /></button></div></label><button className="primary-button add-button" onClick={() => addToCart(product)}>Add to Cart <ShoppingCart size={17} /></button><p className="shipping-note">Free shipping on orders over $75</p></div></section>;
}

function AboutPage({ navigate }: { navigate: (page: Page) => void }) {
  return <section className="about-page page-width"><div className="about-intro"><div><p className="eyebrow">A little about us</p><h1>About<br />WorkNest</h1><p>WorkNest creates simple, thoughtful workspace essentials for a calmer, more productive everyday life.</p></div><img src={images.desk} alt="Calm home office with plants and a wooden desk" /></div><div className="about-body"><div className="about-quote">“The space where we work has a major impact on how we work.”</div><div><p>Many of us now study, work, and complete personal projects from the same desk every day. But building a comfortable and organized workspace can quickly become expensive or unnecessarily complicated.</p><p>WorkNest was created to offer simple, affordable products that solve everyday problems — from tangled cables and limited desk space to uncomfortable laptop placement.</p><button className="text-button" onClick={() => navigate('shop')}>Find your essentials <ArrowRight size={15} /></button></div></div></section>;
}

function BlogPage() {
  return <section className="blog-page page-width"><div className="blog-heading"><p className="eyebrow">The WorkNest Journal</p><h1>Ideas for a calmer,<br />more productive workspace.</h1><p>Small thoughts and practical inspiration for your everyday setup.</p></div><article className="featured-article"><img src={images.journal} alt="Journal, cup of coffee, and plant on a desk" /><div><span className="article-tag">Productivity</span><h2>5 Simple Ways to Create a More Focused Workspace</h2><p>Small changes can make a big difference in how you feel and get things done.</p><button className="text-button">Read more <ArrowRight size={15} /></button></div></article><div className="article-list"><Article title="Welcome to WorkNest: Why Your Workspace Matters" category="Our story" /><Article title="How to Build a Productive Workspace on a Budget" category="Workspace tips" /><Article title="Cable Management Tips for a Cleaner Desk" category="Organization" /></div></section>;
}

function Article({ title, category }: { title: string; category: string }) {
  return <article className="article-row"><div className="article-placeholder"><Leaf size={22} /></div><div><span className="article-tag">{category}</span><h3>{title}</h3><button className="text-button">Read more <ArrowRight size={14} /></button></div><ChevronRight size={18} /> </article>;
}

function CartDrawer({ cart, close, remove }: { cart: Product[]; close: () => void; remove: (index: number) => void }) {
  const total = cart.reduce((sum, product) => sum + product.price, 0);
  return <div className="cart-overlay" onClick={close}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="cart-header"><div><p className="eyebrow">Your workspace</p><h2>Your cart</h2></div><button onClick={close} aria-label="Close cart"><X size={21} /></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingCart size={30} /><p>Your cart is ready when you are.</p><button className="text-button" onClick={close}>Continue shopping <ArrowRight size={15} /></button></div> : <><div className="cart-items">{cart.map((product, index) => <div className="cart-item" key={`${product.id}-${index}`}><img src={product.image} alt={product.name} /><div><h3>{product.name}</h3><p>${product.price}</p><button onClick={() => remove(index)}>Remove</button></div></div>)}</div><div className="cart-total"><span>Subtotal</span><strong>${total}</strong></div><button className="primary-button checkout-button">Checkout <ArrowRight size={16} /></button></>}</aside></div>;
}

export default App;
