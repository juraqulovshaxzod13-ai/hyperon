import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Heart, ShoppingBag, Menu, Star, Plus, Minus, Trash2, Pencil, X, Sparkles, User, Home, LayoutGrid, SlidersHorizontal, ChevronRight, Package, Store, Settings, ArrowLeft, Lock } from "lucide-react";
import { supabase } from "./supabaseClient";

const CATEGORIES = ["Barchasi", "Erkaklar", "Ayollar", "Bolalar", "Aksessuarlar", "Sport", "Chegirmalar"];
const ADMIN_PASSWORD = "hyperon2026";

const BRAND_RATINGS = { Nike: 4.8, Adidas: 4.7, Zara: 4.8, "H&M": 4.6, "LC Waikiki": 4.6, "Pull&Bear": 4.5 };
const PLACEHOLDER_COLORS = ["#7c3aed", "#4f46e5", "#0891b2", "#059669", "#d97706", "#db2777", "#0284c7"];

function placeholderColor(name) {
  const hash = [...(name || "M")].reduce((a, c) => a + c.charCodeAt(0), 0);
  return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
}
function placeholderInitials(name) {
  return (name || "M").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function ProductImage({ name, image, className }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [image]);
  const isRealUrl = image && /^https?:\/\//.test(image.trim()) && !failed;
  if (isRealUrl) {
    return <img key={image} src={image} alt={name} className={className} onError={() => setFailed(true)} />;
  }
  return (
    <div className={`${className} flex items-center justify-center`} style={{ background: placeholderColor(name) }} aria-hidden="true">
      <span className="text-white font-bold" style={{ fontSize: "1.4rem" }}>{placeholderInitials(name)}</span>
    </div>
  );
}

const SEED_PRODUCTS = [
  { id: "p1", name: "Oversize futbolka", brand: "Zara", category: "Erkaklar", price: 129000, image: "", badge: "" },
  { id: "p2", name: "Basic Hoodie", brand: "H&M", category: "Erkaklar", price: 249000, image: "", badge: "" },
  { id: "p3", name: "Wide Jeans", brand: "Pull&Bear", category: "Erkaklar", price: 319000, image: "", badge: "" },
  { id: "p4", name: "Bomber Jacket", brand: "Nike", category: "Erkaklar", price: 590000, image: "", badge: "Yangi" },
  { id: "p5", name: "Campus 00s", brand: "Adidas", category: "Sport", price: 720000, image: "", badge: "" },
  { id: "p6", name: "Mini Handbag", brand: "Zara", category: "Aksessuarlar", price: 289000, image: "", badge: "Chegirma" },
];

function uid() { return "p" + Math.random().toString(36).slice(2, 9); }
function formatSum(n) { return new Intl.NumberFormat("uz-UZ").format(n) + " so'm"; }

async function loadProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Mahsulotlarni yuklashda xatolik:", error.message);
    return null;
  }
  return data;
}
async function seedProducts(products) {
  const { error } = await supabase.from("products").insert(products);
  if (error) console.error("Boshlang'ich mahsulotlarni qo'shishda xatolik:", error.message);
}
async function insertProduct(product) {
  const { error } = await supabase.from("products").insert(product);
  if (error) console.error("Mahsulot qo'shishda xatolik:", error.message);
}
async function updateProductRow(id, fields) {
  const { error } = await supabase.from("products").update(fields).eq("id", id);
  if (error) console.error("Mahsulotni yangilashda xatolik:", error.message);
}
async function deleteProductRow(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) console.error("Mahsulotni o'chirishda xatolik:", error.message);
}

async function loadStores() {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Do'konlarni yuklashda xatolik:", error.message);
    return null;
  }
  return data;
}
async function insertStore(store) {
  const { error } = await supabase.from("stores").insert(store);
  if (error) console.error("Do'kon qo'shishda xatolik:", error.message);
}
async function updateStoreRow(id, fields) {
  const { error } = await supabase.from("stores").update(fields).eq("id", id);
  if (error) console.error("Do'konni yangilashda xatolik:", error.message);
}
async function deleteStoreRow(id) {
  const { error } = await supabase.from("stores").delete().eq("id", id);
  if (error) console.error("Do'konni o'chirishda xatolik:", error.message);
}

async function loadReviews(productId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Sharhlarni yuklashda xatolik:", error.message);
    return null;
  }
  return data;
}
async function insertReview(review) {
  const { error } = await supabase.from("reviews").insert(review);
  if (error) return error;
  return null;
}
async function deleteReviewRow(id) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) console.error("Sharhni o'chirishda xatolik:", error.message);
}

export default function HyperOnMarketplace() {
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState({});
  const [cart, setCart] = useState({});

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState(null);

  const [profileSection, setProfileSection] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState("idle");
  const [checkoutError, setCheckoutError] = useState("");

  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [storeForm, setStoreForm] = useState(null);
  const [editingStoreId, setEditingStoreId] = useState(null);
  const [confirmDeleteStoreId, setConfirmDeleteStoreId] = useState(null);
  const [adminTab, setAdminTab] = useState("products");

  const [session, setSession] = useState(null);
  const [authModal, setAuthModal] = useState(null); // "login" | "signup" | null
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");

  const [detailProduct, setDetailProduct] = useState(null);
  const [previousPage, setPreviousPage] = useState("home");
  const [detailReviews, setDetailReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => listener.subscription.unsubscribe();
  }, []);

  const currentUser = session?.user || null;
  const currentUserName = currentUser?.user_metadata?.name || currentUser?.email || "";

  async function handleAuthSubmit() {
    setAuthError("");
    setAuthNotice("");
    if (!authForm.email.trim() || !authForm.password) {
      setAuthError("Email va parolni to'ldiring.");
      return;
    }
    if (authModal === "signup" && !authForm.name.trim()) {
      setAuthError("Ismingizni kiriting.");
      return;
    }
    setAuthLoading(true);
    if (authModal === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email.trim(),
        password: authForm.password,
        options: { data: { name: authForm.name.trim() } },
      });
      setAuthLoading(false);
      if (error) { setAuthError(error.message); return; }
      if (data.session) {
        setAuthModal(null);
        setAuthForm({ name: "", email: "", password: "" });
      } else {
        setAuthNotice("Ro'yxatdan o'tish muvaffaqiyatli! Emailingizga yuborilgan havolani tasdiqlang, so'ng tizimga kiring.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authForm.email.trim(),
        password: authForm.password,
      });
      setAuthLoading(false);
      if (error) { setAuthError("Email yoki parol noto'g'ri."); return; }
      setAuthModal(null);
      setAuthForm({ name: "", email: "", password: "" });
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setPage("home");
  }

  async function openProductDetail(p) {
    setDetailProduct(p);
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
    setPreviousPage(page);
    setPage("productDetail");
    setReviewsLoading(true);
    const data = await loadReviews(p.id);
    setDetailReviews(Array.isArray(data) ? data : []);
    setReviewsLoading(false);
  }

  function closeProductDetail() { setDetailProduct(null); setPage(previousPage || "home"); }

  async function submitReview() {
    if (!currentUser) { setAuthModal("login"); return; }
    if (!reviewComment.trim()) { setReviewError("Sharh matnini kiriting."); return; }
    setReviewSubmitting(true);
    setReviewError("");
    const review = {
      id: uid(),
      product_id: detailProduct.id,
      user_id: currentUser.id,
      user_name: currentUserName,
      rating: reviewRating,
      comment: reviewComment.trim(),
    };
    const err = await insertReview(review);
    setReviewSubmitting(false);
    if (err) { setReviewError("Sharh yuborilmadi. Qayta urinib ko'ring."); return; }
    setDetailReviews((prev) => [{ ...review, created_at: new Date().toISOString() }, ...prev]);
    setAllReviews((prev) => [...prev, { id: review.id, product_id: review.product_id, rating: review.rating }]);
    setReviewComment("");
    setReviewRating(5);
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hyperon_orders");
      if (raw) setOrders(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);

  const [allReviews, setAllReviews] = useState([]);

  useEffect(() => {
    (async () => {
      const stored = await loadProducts();
      setProducts(Array.isArray(stored) ? stored : []);
      const storesData = await loadStores();
      setStores(Array.isArray(storesData) ? storesData : []);
      const { data: reviewsData } = await supabase.from("reviews").select("id, product_id, rating");
      setAllReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setLoaded(true);
    })();
  }, []);

  const brands = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (!p.brand) return;
      if (!map[p.brand]) map[p.brand] = { name: p.brand, count: 0 };
      map[p.brand].count += 1;
    });
    return Object.values(map);
  }, [products]);

  const storeRatings = useMemo(() => {
    const productBrand = {};
    products.forEach((p) => { productBrand[p.id] = p.brand; });
    const sums = {};
    allReviews.forEach((r) => {
      const brand = productBrand[r.product_id];
      if (!brand) return;
      if (!sums[brand]) sums[brand] = { total: 0, count: 0 };
      sums[brand].total += r.rating;
      sums[brand].count += 1;
    });
    const result = {};
    Object.keys(sums).forEach((brand) => {
      result[brand] = { avg: sums[brand].total / sums[brand].count, count: sums[brand].count };
    });
    return result;
  }, [allReviews, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === "Barchasi" || p.category === activeCategory || (activeCategory === "Chegirmalar" && p.badge === "Chegirma");
      const q = query.trim().toLowerCase();
      const matchQuery = q === "" || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, activeCategory, query]);

  const favoriteProducts = products.filter((p) => favorites[p.id]);
  const cartEntries = Object.entries(cart).filter(([, qty]) => qty > 0).map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty })).filter((e) => e.product);
  const cartTotal = cartEntries.reduce((sum, e) => sum + e.product.price * e.qty, 0);
  const cartCount = cartEntries.reduce((a, e) => a + e.qty, 0);
  const favCount = favoriteProducts.length;

  function toggleFavorite(id) { setFavorites((f) => ({ ...f, [id]: !f[id] })); }
  function addToCart(id) { setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 })); }
  function changeQty(id, delta) { setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + delta) })); }
  function removeFromCart(id) { setCart((c) => ({ ...c, [id]: 0 })); }

  function handleLogoClick() {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 1500);
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      setShowAdminLogin(true);
      setPasswordInput("");
      setPasswordError(false);
    }
  }

  function submitPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setPage("admin");
      setPasswordInput("");
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  function logoutAdmin() {
    setIsAdmin(false);
    setPage("home");
  }

  async function generateLook() {
    if (!aiPrompt.trim() || products.length === 0) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    const catalog = products.map((p) => ({ id: p.id, name: p.name, brand: p.brand, category: p.category, price: p.price }));
    const systemInstruction = `Sen HyperOn kiyim-kechak do'konining AI stilistisan. Faqat berilgan katalogdagi mahsulotlardan foydalanib, foydalanuvchi so'roviga mos look (kiyim to'plami) yig'asan. Javobni FAQAT quyidagi JSON formatida qaytar, boshqa hech qanday matn, izoh yoki markdown belgilarisiz:
{"productIds": ["id1", "id2"], "note": "look haqida 1-2 gapli o'zbek tilidagi tushuntirish"}
Faqat katalogda mavjud id larni ishlat. 2 dan 4 tagacha mahsulot tanla, agar mos keladiganlari bo'lsa.`;
    try {
      const response = await fetch("/.netlify/functions/ai-stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemInstruction,
          messages: [
            { role: "user", content: `Katalog: ${JSON.stringify(catalog)}\n\nFoydalanuvchi so'rovi: ${aiPrompt}` },
          ],
        }),
      });
      if (!response.ok) throw new Error("Server xatosi");
      const data = await response.json();
      const text = (data.content || []).map((b) => b.text || "").join("").trim();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      const validIds = new Set(products.map((p) => p.id));
      const productIds = (parsed.productIds || []).filter((id) => validIds.has(id));
      if (productIds.length === 0) {
        setAiError("Mos mahsulot topilmadi. Boshqacha so'rov bilan urinib ko'ring.");
      } else {
        setAiResult({ productIds, note: parsed.note || "" });
      }
    } catch (err) {
      setAiError("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setAiLoading(false);
    }
  }

  function closeAIModal() {
    setShowAIModal(false);
    setAiPrompt("");
    setAiResult(null);
    setAiError("");
  }

  async function submitOrder() {
    if (!checkoutPhone.trim()) {
      setCheckoutError("Telefon raqamini kiriting.");
      return;
    }
    setCheckoutStatus("loading");
    setCheckoutError("");
    const order = {
      id: uid(),
      items: cartEntries.map((e) => ({ name: e.product.name, brand: e.product.brand, price: e.product.price, qty: e.qty })),
      total: cartTotal,
      phone: checkoutPhone.trim(),
      address: checkoutAddress.trim(),
      createdAt: new Date().toISOString(),
    };
    try {
      const res = await fetch("/.netlify/functions/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error("Server xatosi");
      const newOrders = [order, ...orders];
      setOrders(newOrders);
      localStorage.setItem("hyperon_orders", JSON.stringify(newOrders));
      setCart({});
      setCheckoutStatus("success");
    } catch (err) {
      setCheckoutStatus("idle");
      setCheckoutError("Buyurtmani yuborib bo'lmadi. Birozdan so'ng qayta urinib ko'ring.");
    }
  }

  function closeCheckout() {
    setShowCheckout(false);
    setCheckoutStatus("idle");
    setCheckoutError("");
    setCheckoutPhone("");
    setCheckoutAddress("");
  }

  function openAddForm() { setEditingId(null); setForm({ name: "", brand: "", category: "Erkaklar", price: "", image: "", badge: "" }); }
  function openEditForm(p) { setEditingId(p.id); setForm({ name: p.name, brand: p.brand, category: p.category, price: String(p.price), image: p.image, badge: p.badge || "" }); }
  function closeForm() { setEditingId(null); setForm(null); }

  function openAddStoreForm() { setEditingStoreId(null); setStoreForm({ name: "", logo: "", banner: "", description: "" }); setShowStoreForm(true); }
  function openEditStoreForm(s) { setEditingStoreId(s.id); setStoreForm({ name: s.name, logo: s.logo || "", banner: s.banner || "", description: s.description || "" }); setShowStoreForm(true); }
  function closeStoreForm() { setEditingStoreId(null); setStoreForm(null); setShowStoreForm(false); }

  async function handleStoreSubmit() {
    if (!storeForm.name.trim()) return;
    if (editingStoreId) {
      const fields = { name: storeForm.name, logo: storeForm.logo, banner: storeForm.banner, description: storeForm.description };
      setStores((prev) => prev.map((s) => (s.id === editingStoreId ? { ...s, ...fields } : s)));
      await updateStoreRow(editingStoreId, fields);
    } else {
      const newStore = { id: uid(), name: storeForm.name, logo: storeForm.logo, banner: storeForm.banner, description: storeForm.description };
      setStores((prev) => [newStore, ...prev]);
      await insertStore(newStore);
    }
    closeStoreForm();
  }

  async function deleteStore(id) {
    setStores((prev) => prev.filter((s) => s.id !== id));
    setConfirmDeleteStoreId(null);
    await deleteStoreRow(id);
  }

  function goToStore(id) {
    setSelectedStoreId(id);
    setPage("storeDetail");
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.name.trim() || !form.brand.trim() || !form.price) return;
    const priceNum = Number(form.price);
    const image = form.image.trim();
    if (editingId) {
      const fields = { name: form.name, brand: form.brand, category: form.category, price: priceNum, image, badge: form.badge };
      setProducts((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...fields } : p)));
      await updateProductRow(editingId, fields);
    } else {
      const newProduct = { id: uid(), name: form.name, brand: form.brand, category: form.category, price: priceNum, image, badge: form.badge };
      setProducts((prev) => [newProduct, ...prev]);
      await insertProduct(newProduct);
    }
    setSaveStatus(editingId ? "Mahsulot yangilandi" : "Mahsulot qo'shildi");
    setTimeout(() => setSaveStatus(""), 2000);
    setEditingId(null); setForm(null);
  }

  async function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
    setSaveStatus("Mahsulot o'chirildi");
    setTimeout(() => setSaveStatus(""), 2000);
    await deleteProductRow(id);
  }

  const showForm = form !== null;

  const navItems = [
    { key: "home", label: "Bosh sahifa", icon: Home },
    { key: "catalog", label: "Katalog", icon: LayoutGrid },
    { key: "fav", label: "Sevimlilar", icon: Heart },
    { key: "cart", label: "Savatcha", icon: ShoppingBag },
    { key: "profile", label: "Profil", icon: User },
  ];

  function goTo(key) {
    if (key === "home" || key === "catalog") setPage(key);
    else setPage(key);
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden max-w-md mx-auto pb-24 relative">
        <header className="flex items-center justify-between px-5 pt-6 pb-4">
          <button className="p-1" aria-label="Menu"><Menu size={22} /></button>
          <h1 onClick={handleLogoClick} className="text-2xl font-extrabold tracking-tight select-none cursor-pointer">
            Hyper<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">On</span>
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-1" aria-label="Sevimlilar" onClick={() => goTo("fav")}>
              <Heart size={20} className={favCount > 0 ? "fill-violet-400 text-violet-400" : ""} />
            </button>
            <button className="relative p-1" aria-label="Savatcha" onClick={() => goTo("cart")}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-violet-500 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </header>

        <div className="px-5">
          {page === "admin" && isAdmin ? (
            <AdminView {...{ products, showForm, form, setForm, editingId, openAddForm, openEditForm, closeForm, handleSubmit, confirmDeleteId, setConfirmDeleteId, deleteProduct, saveStatus, logoutAdmin, stores, showStoreForm, storeForm, setStoreForm, editingStoreId, openAddStoreForm, openEditStoreForm, closeStoreForm, handleStoreSubmit, confirmDeleteStoreId, setConfirmDeleteStoreId, deleteStore, adminTab, setAdminTab }} />
          ) : page === "fav" ? (
            <FavoritesView products={favoriteProducts} toggleFavorite={toggleFavorite} addToCart={addToCart} onBrowse={() => setPage("home")} onOpenDetail={openProductDetail} />
          ) : page === "cart" ? (
            <CartView entries={cartEntries} total={cartTotal} changeQty={changeQty} removeFromCart={removeFromCart} onBrowse={() => setPage("home")} onCheckout={() => setShowCheckout(true)} />
          ) : page === "profile" ? (
            <ProfileView onOpenSection={setProfileSection} user={currentUser} userName={currentUserName} onLogin={() => setAuthModal("login")} onSignup={() => setAuthModal("signup")} onLogout={handleLogout} />
          ) : page === "storeDetail" ? (
            <StoreDetailView store={stores.find((s) => s.id === selectedStoreId)} products={products.filter((p) => p.brand === (stores.find((s) => s.id === selectedStoreId) || {}).name)} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} gridCols="grid-cols-2" onBack={() => setPage("home")} onOpenDetail={openProductDetail} storeRatings={storeRatings} />
          ) : page === "productDetail" && detailProduct ? (
            <ProductDetailPage product={detailProduct} reviews={detailReviews} reviewsLoading={reviewsLoading} currentUser={currentUser} addToCart={addToCart} reviewRating={reviewRating} setReviewRating={setReviewRating} reviewComment={reviewComment} setReviewComment={setReviewComment} reviewError={reviewError} reviewSubmitting={reviewSubmitting} submitReview={submitReview} onBack={closeProductDetail} onRequireLogin={() => setAuthModal("login")} />
          ) : (
            <StoreView products={filteredProducts} brands={brands} stores={stores} storeRatings={storeRatings} onSelectStore={goToStore} query={query} setQuery={setQuery} activeCategory={activeCategory} setActiveCategory={setActiveCategory} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} gridCols="grid-cols-2" onOpenAI={() => setShowAIModal(true)} onOpenDetail={openProductDetail} />
          )}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0f] border-t border-white/10 px-2 py-2 flex items-center justify-around">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => goTo(key)} className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition ${page === key ? "text-violet-400" : "text-gray-500"}`}>
              <div className="relative">
                <Icon size={20} className={page === key && key === "fav" && favCount > 0 ? "fill-violet-400" : ""} />
                {key === "cart" && cartCount > 0 && <span className="absolute -top-1.5 -right-2 bg-violet-500 text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartCount}</span>}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block max-w-6xl mx-auto px-8 pb-16">
        <header className="flex items-center justify-between py-6 border-b border-white/10 mb-6">
          <h1 onClick={handleLogoClick} className="text-2xl font-extrabold tracking-tight select-none cursor-pointer">
            Hyper<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">On</span>
          </h1>
          <nav className="flex items-center gap-1">
            {navItems.filter((n) => n.key !== "catalog").map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => goTo(key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${page === key ? "bg-violet-600 text-white" : "text-gray-300 hover:bg-white/5"}`}>
                <div className="relative">
                  <Icon size={16} />
                  {key === "cart" && cartCount > 0 && <span className="absolute -top-1.5 -right-2 bg-white text-violet-700 text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartCount}</span>}
                </div>
                {label}
              </button>
            ))}
          </nav>
        </header>

        {page === "admin" && isAdmin ? (
          <AdminView desktop {...{ products, showForm, form, setForm, editingId, openAddForm, openEditForm, closeForm, handleSubmit, confirmDeleteId, setConfirmDeleteId, deleteProduct, saveStatus, logoutAdmin, stores, showStoreForm, storeForm, setStoreForm, editingStoreId, openAddStoreForm, openEditStoreForm, closeStoreForm, handleStoreSubmit, confirmDeleteStoreId, setConfirmDeleteStoreId, deleteStore, adminTab, setAdminTab }} />
        ) : page === "fav" ? (
          <FavoritesView desktop products={favoriteProducts} toggleFavorite={toggleFavorite} addToCart={addToCart} onBrowse={() => setPage("home")} onOpenDetail={openProductDetail} />
        ) : page === "cart" ? (
          <CartView desktop entries={cartEntries} total={cartTotal} changeQty={changeQty} removeFromCart={removeFromCart} onBrowse={() => setPage("home")} onCheckout={() => setShowCheckout(true)} />
        ) : page === "profile" ? (
          <ProfileView desktop onOpenSection={setProfileSection} user={currentUser} userName={currentUserName} onLogin={() => setAuthModal("login")} onSignup={() => setAuthModal("signup")} onLogout={handleLogout} />
        ) : page === "storeDetail" ? (
          <StoreDetailView desktop store={stores.find((s) => s.id === selectedStoreId)} products={products.filter((p) => p.brand === (stores.find((s) => s.id === selectedStoreId) || {}).name)} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} gridCols="grid-cols-4 lg:grid-cols-5" onBack={() => setPage("home")} onOpenDetail={openProductDetail} storeRatings={storeRatings} />
        ) : page === "productDetail" && detailProduct ? (
          <ProductDetailPage desktop product={detailProduct} reviews={detailReviews} reviewsLoading={reviewsLoading} currentUser={currentUser} addToCart={addToCart} reviewRating={reviewRating} setReviewRating={setReviewRating} reviewComment={reviewComment} setReviewComment={setReviewComment} reviewError={reviewError} reviewSubmitting={reviewSubmitting} submitReview={submitReview} onBack={closeProductDetail} onRequireLogin={() => setAuthModal("login")} />
        ) : (
          <StoreView desktop products={filteredProducts} brands={brands} stores={stores} storeRatings={storeRatings} onSelectStore={goToStore} query={query} setQuery={setQuery} activeCategory={activeCategory} setActiveCategory={setActiveCategory} favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} gridCols="grid-cols-4 lg:grid-cols-5" onOpenAI={() => setShowAIModal(true)} onOpenDetail={openProductDetail} />
        )}
      </div>

      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-6">
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={16} className="text-violet-400" />
              <p className="font-semibold">Admin kirish</p>
            </div>
            <p className="text-xs text-gray-400 mb-4">Faqat vakolatli xodimlar uchun.</p>
            <div className="relative mb-1">
              <input
                autoFocus
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") submitPassword(); }}
                placeholder="Parolni kiriting"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 pr-16 text-sm outline-none focus:border-violet-500"
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">{showPassword ? "Yashirish" : "Ko'rsatish"}</button>
            </div>
            {passwordError && <p className="text-xs text-red-400 mb-2">Parol noto'g'ri. Qayta urinib ko'ring.</p>}
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => submitPassword()} className="flex-1 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 transition rounded-xl py-2 text-sm font-semibold cursor-pointer">Kirish</button>
              <button type="button" onClick={() => setShowAdminLogin(false)} className="px-4 rounded-xl border border-white/10 text-sm text-gray-300">Bekor qilish</button>
            </div>
          </div>
        </div>
      )}

      {showAIModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-6">
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-400" />
                <p className="font-semibold">AI Stilist</p>
              </div>
              <button type="button" onClick={closeAIModal} aria-label="Yopish"><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Qanday tadbir yoki uslub uchun kerakligini yozing, AI katalogdan mos lookni yig'ib beradi.</p>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Masalan: do'stlar bilan uchrashuv uchun casual look, yoki sport mashg'uloti uchun kiyim..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 mb-3 resize-none"
            />

            <button
              type="button"
              onClick={generateLook}
              disabled={aiLoading || !aiPrompt.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 transition rounded-xl py-2.5 font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-default mb-4"
            >
              {aiLoading ? "Yaratilmoqda..." : "Look yaratish"}
            </button>

            {aiError && <p className="text-sm text-red-400 mb-3">{aiError}</p>}

            {aiResult && (
              <div>
                {aiResult.note && <p className="text-sm text-gray-300 mb-3">{aiResult.note}</p>}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {aiResult.productIds.map((id) => {
                    const p = products.find((prod) => prod.id === id);
                    if (!p) return null;
                    return <ProductCard key={p.id} p={p} isFav={!!favorites[p.id]} toggleFavorite={toggleFavorite} addToCart={addToCart} onOpenDetail={openProductDetail} />;
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => { setAiResult(null); setAiError(""); }}
                  className="w-full flex items-center justify-center gap-1.5 border border-white/10 rounded-xl py-2.5 text-sm text-gray-300"
                >
                  <ArrowLeft size={14} /> Orqaga, boshqa look so'rash
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-6">
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            {checkoutStatus === "success" ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag size={20} className="text-violet-300" />
                </div>
                <p className="font-semibold mb-1">Buyurtma qabul qilindi!</p>
                <p className="text-xs text-gray-400 mb-4">Tez orada operatorlarimiz siz bilan bog'lanadi.</p>
                <button type="button" onClick={closeCheckout} className="w-full bg-violet-600 hover:bg-violet-500 transition rounded-xl py-2.5 text-sm font-semibold">Yopish</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold">Buyurtmani rasmiylashtirish</p>
                  <button type="button" onClick={closeCheckout} aria-label="Yopish"><X size={18} className="text-gray-400" /></button>
                </div>
                <p className="text-xs text-gray-400 mb-4">Jami: <span className="text-white font-semibold">{formatSum(cartTotal)}</span> ({cartCount} ta mahsulot)</p>
                <label className="text-xs text-gray-400 mb-1 block">Telefon raqamingiz *</label>
                <input
                  autoFocus
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 mb-3"
                />
                <label className="text-xs text-gray-400 mb-1 block">Yetkazib berish manzili (ixtiyoriy)</label>
                <textarea
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  rows={2}
                  placeholder="Shahar, tuman, ko'cha..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 mb-3 resize-none"
                />
                {checkoutError && <p className="text-xs text-red-400 mb-2">{checkoutError}</p>}
                <button
                  type="button"
                  onClick={submitOrder}
                  disabled={checkoutStatus === "loading"}
                  className="w-full bg-violet-600 hover:bg-violet-500 transition rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {checkoutStatus === "loading" ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {profileSection && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] px-6">
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-6 max-w-sm w-full max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold">{profileSection}</p>
              <button type="button" onClick={() => setProfileSection(null)} aria-label="Yopish"><X size={18} className="text-gray-400" /></button>
            </div>

            {profileSection === "Buyurtmalarim" && (
              orders.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Hali buyurtmalar yo'q.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="bg-black/30 border border-white/10 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">{new Date(o.createdAt).toLocaleString("uz-UZ")}</p>
                      {o.items.map((it, idx) => (
                        <p key={idx} className="text-sm">{it.name} x{it.qty}</p>
                      ))}
                      <p className="text-sm font-semibold mt-1">{formatSum(o.total)}</p>
                    </div>
                  ))}
                </div>
              )
            )}

            {profileSection === "Yetkazib berish manzillari" && (
              <p className="text-sm text-gray-400">Hozircha saqlangan manzillar yo'q. Buyurtma berishda manzilingizni kiritishingiz mumkin.</p>
            )}

            {profileSection === "To'lov usullari" && (
              <p className="text-sm text-gray-400">Hozircha to'lov naqd pul yoki yetkazib beruvchi orqali amalga oshiriladi. Buyurtma berilgach, operator siz bilan bog'lanib, to'lov tafsilotlarini kelishadi.</p>
            )}

            {profileSection === "Sozlamalar" && (
              <p className="text-sm text-gray-400">Hisob sozlamalari hozircha mavjud emas — bu funksiya keyinchalik qo'shiladi.</p>
            )}

            {profileSection === "Yordam" && (
              <div className="text-sm text-gray-400 space-y-2">
                <p>Savollaringiz bo'lsa, biz bilan bog'laning:</p>
                <p className="text-white">Telegram: @hyperon_support</p>
                <p className="text-white">Telefon: +998 90 000 00 00</p>
              </div>
            )}
          </div>
        </div>
      )}

      {authModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] px-6">
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold">{authModal === "signup" ? "Ro'yxatdan o'tish" : "Tizimga kirish"}</p>
              <button type="button" onClick={() => { setAuthModal(null); setAuthError(""); setAuthNotice(""); }} aria-label="Yopish"><X size={18} className="text-gray-400" /></button>
            </div>

            {authNotice ? (
              <div className="text-center py-3">
                <p className="text-sm text-violet-300 mb-4">{authNotice}</p>
                <button type="button" onClick={() => { setAuthModal("login"); setAuthNotice(""); }} className="w-full bg-violet-600 hover:bg-violet-500 transition rounded-xl py-2.5 text-sm font-semibold">Kirish sahifasiga o'tish</button>
              </div>
            ) : (
              <>
                {authModal === "signup" && (
                  <div className="mb-3">
                    <label className="text-xs text-gray-400 block mb-1">Ismingiz</label>
                    <input value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder="Ismingizni kiriting" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500" />
                  </div>
                )}
                <div className="mb-3">
                  <label className="text-xs text-gray-400 block mb-1">Email</label>
                  <input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} placeholder="email@example.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500" />
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-400 block mb-1">Parol</label>
                  <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} placeholder="Kamida 6 belgi" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500" />
                </div>
                {authError && <p className="text-xs text-red-400 mb-2">{authError}</p>}
                <button type="button" onClick={handleAuthSubmit} disabled={authLoading} className="w-full bg-violet-600 hover:bg-violet-500 transition rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 mb-3">
                  {authLoading ? "Yuborilmoqda..." : authModal === "signup" ? "Ro'yxatdan o'tish" : "Kirish"}
                </button>
                <button type="button" onClick={() => { setAuthModal(authModal === "signup" ? "login" : "signup"); setAuthError(""); }} className="w-full text-center text-xs text-gray-400">
                  {authModal === "signup" ? "Hisobingiz bormi? Kirish" : "Hisobingiz yo'qmi? Ro'yxatdan o'ting"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

function ProductDetailPage({ product, reviews, reviewsLoading, currentUser, addToCart, reviewRating, setReviewRating, reviewComment, setReviewComment, reviewError, reviewSubmitting, submitReview, onBack, onRequireLogin, desktop }) {
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  return (
    <div className={desktop ? "max-w-3xl mx-auto" : ""}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 mb-3"><ArrowLeft size={15} /> Ortga</button>
      <div className={desktop ? "grid grid-cols-2 gap-8 items-start" : ""}>
        <div className="rounded-2xl overflow-hidden border border-white/10">
          <ProductImage name={product.name} image={product.image} className="w-full aspect-square object-cover" />
        </div>
        <div className={desktop ? "" : "pt-5"}>
          <p className="text-xl font-bold leading-tight">{product.name}</p>
          <p className="text-sm text-gray-400 mb-2">{product.brand}</p>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={16} className={n <= Math.round(avg) ? "fill-violet-400 text-violet-400" : "text-gray-600"} />
            ))}
            <span className="text-xs text-gray-400 ml-1">{reviews.length > 0 ? `${avg.toFixed(1)} (${reviews.length} sharh)` : "Hali sharh yo'q"}</span>
          </div>
          <p className="text-2xl font-extrabold mb-4">{formatSum(product.price)}</p>
          <button type="button" onClick={() => addToCart(product.id)} className="w-full bg-violet-600 hover:bg-violet-500 transition rounded-xl py-2.5 text-sm font-semibold mb-6">Savatchaga qo'shish</button>

          <div className="border-t border-white/10 pt-4">
            <p className="font-semibold mb-3">Sharhlar</p>

            {currentUser ? (
              <div className="bg-black/30 border border-white/10 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1.5">Bahoingiz</p>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewRating(n)} aria-label={`${n} yulduz`}>
                      <Star size={20} className={n <= reviewRating ? "fill-violet-400 text-violet-400" : "text-gray-600"} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={2} placeholder="Mahsulot haqida fikringiz..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 resize-none mb-2" />
                {reviewError && <p className="text-xs text-red-400 mb-2">{reviewError}</p>}
                <button type="button" onClick={submitReview} disabled={reviewSubmitting} className="w-full bg-violet-600/90 hover:bg-violet-500 transition rounded-xl py-2 text-xs font-semibold disabled:opacity-50">
                  {reviewSubmitting ? "Yuborilmoqda..." : "Sharh qoldirish"}
                </button>
              </div>
            ) : (
              <button type="button" onClick={onRequireLogin} className="w-full border border-white/10 rounded-xl py-2.5 text-sm text-gray-300 mb-4">Sharh qoldirish uchun tizimga kiring</button>
            )}

            {reviewsLoading ? (
              <p className="text-xs text-gray-500 text-center py-4">Yuklanmoqda...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">Hali sharhlar yo'q. Birinchi bo'lib fikr bildiring!</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-black/30 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{r.user_name}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={12} className={n <= r.rating ? "fill-violet-400 text-violet-400" : "text-gray-600"} />)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{r.comment}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{new Date(r.created_at).toLocaleDateString("uz-UZ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryChips({ activeCategory, setActiveCategory }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
      {CATEGORIES.map((cat) => (
        <button key={cat} onClick={() => setActiveCategory(cat)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border ${activeCategory === cat ? "bg-violet-600 border-violet-600 text-white" : "bg-[#14141c] border-white/10 text-gray-300"}`}>
          {cat}
        </button>
      ))}
    </div>
  );
}

function ProductCard({ p, isFav, toggleFavorite, addToCart, onOpenDetail }) {
  return (
    <div className="bg-[#14141c] border border-white/10 rounded-2xl overflow-hidden">
      <div className="relative">
        <div onClick={() => onOpenDetail && onOpenDetail(p)} role="button" tabIndex={0} className="cursor-pointer">
          <ProductImage name={p.name} image={p.image} className="w-full aspect-square object-cover" />
        </div>
        <button onClick={() => toggleFavorite(p.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center" aria-label="Sevimliga qo'shish">
          <Heart size={14} className={isFav ? "fill-violet-400 text-violet-400" : "text-white"} />
        </button>
        {p.badge && <span className="absolute top-2 left-2 bg-violet-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{p.badge}</span>}
      </div>
      <div className="p-3">
        <div onClick={() => onOpenDetail && onOpenDetail(p)} role="button" tabIndex={0} className="cursor-pointer">
          <p className="text-sm font-medium leading-tight truncate">{p.name}</p>
          <p className="text-xs text-gray-400 mb-1.5">{p.brand}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">{formatSum(p.price)}</span>
          <button onClick={() => addToCart(p.id)} className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center" aria-label="Savatchaga qo'shish">
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StoreView({ products, brands, stores, storeRatings, onSelectStore, query, setQuery, activeCategory, setActiveCategory, favorites, toggleFavorite, addToCart, gridCols, desktop, onOpenAI, onOpenDetail }) {
  return (
    <div>
      <div className={`flex items-center gap-2 bg-[#14141c] border border-white/10 rounded-2xl px-4 py-3 mb-4 ${desktop ? "max-w-xl" : ""}`}>
        <Search size={18} className="text-gray-500 shrink-0" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Kiyim, brend yoki magazin qidiring..." className="bg-transparent outline-none text-sm flex-1 placeholder:text-gray-500" />
        <SlidersHorizontal size={18} className="text-gray-500 shrink-0" />
      </div>

      <CategoryChips activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {stores.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Mashhur magazinlar</h2>
          </div>
          <div className={desktop ? "grid grid-cols-6 gap-3" : "flex gap-3 overflow-x-auto no-scrollbar"}>
            {stores.map((s) => {
              const info = storeRatings[s.name];
              return (
                <button key={s.id} onClick={() => onSelectStore(s.id)} className={`${desktop ? "" : "shrink-0 w-24"} bg-[#14141c] border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-2 text-left hover:border-violet-500/50 transition`}>
                  {s.logo ? (
                    <img src={s.logo} alt={s.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                  ) : null}
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center" style={s.logo ? { display: "none" } : {}}><Store size={18} className="text-gray-300" /></div>
                  <p className="text-xs font-medium text-center truncate w-full">{s.name}</p>
                  {info ? (
                    <p className="text-[11px] text-violet-300 flex items-center gap-0.5"><Star size={11} className="fill-violet-300" /> {info.avg.toFixed(1)}</p>
                  ) : (
                    <p className="text-[11px] text-gray-500">Yangi</p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Mahsulotlar</h2>
          <span className="text-xs text-gray-400">{products.length} ta topildi</span>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            <Package size={28} className="mx-auto mb-2 opacity-50" />
            Hech narsa topilmadi. Boshqa so'z yoki kategoriya sinab ko'ring.
          </div>
        ) : (
          <div className={`grid ${gridCols} gap-3`}>
            {products.map((p) => <ProductCard key={p.id} p={p} isFav={!!favorites[p.id]} toggleFavorite={toggleFavorite} addToCart={addToCart} onOpenDetail={onOpenDetail} />)}
          </div>
        )}
      </section>

      <section className={`rounded-3xl bg-gradient-to-br from-violet-900/60 to-indigo-950 border border-violet-500/20 p-5 mb-4 relative overflow-hidden ${desktop ? "max-w-xl" : ""}`}>
        <span className="inline-block bg-violet-600 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">YANGI</span>
        <h3 className="text-xl font-extrabold mb-1 flex items-center gap-1.5">AI Stilist <Sparkles size={16} className="text-violet-300" /></h3>
        <p className="text-sm text-gray-300 mb-4 max-w-[65%]">O'zingizga mos uslubni AI yordamida toping.</p>
        <button onClick={onOpenAI} type="button" className="bg-white text-black text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer">Look yaratish <ChevronRight size={15} /></button>
      </section>
    </div>
  );
}

function StoreDetailView({ store, products, favorites, toggleFavorite, addToCart, gridCols, onBack, desktop, onOpenDetail, storeRatings }) {
  if (!store) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">Do'kon topilmadi.</p>
        <button onClick={onBack} className="text-violet-400 text-sm flex items-center gap-1 mx-auto"><ArrowLeft size={14} /> Bosh sahifaga qaytish</button>
      </div>
    );
  }
  const info = storeRatings[store.name];
  return (
    <div className={desktop ? "max-w-4xl" : ""}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 mb-3"><ArrowLeft size={15} /> Ortga</button>

      <div className="rounded-3xl overflow-hidden border border-white/10 mb-5">
        <div className="h-36 md:h-52 w-full bg-gradient-to-br from-violet-900/60 to-indigo-950 relative">
          {store.banner ? (
            <img src={store.banner} alt={store.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
          ) : null}
        </div>
        <div className="bg-[#14141c] p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            {store.logo ? (
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
            ) : null}
            <Store size={22} className="text-gray-300" style={store.logo ? { display: "none" } : {}} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold truncate">{store.name}</h2>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Star size={12} className="fill-violet-300 text-violet-300" />
              {info ? `${info.avg.toFixed(1)} (${info.count} baho)` : "Hali baho yo'q"} · {products.length} ta mahsulot
            </p>
            {store.description && <p className="text-sm text-gray-300 mt-2">{store.description}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">Mahsulotlar</h3>
        <span className="text-xs text-gray-400">{products.length} ta topildi</span>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          <Package size={28} className="mx-auto mb-2 opacity-50" />
          Bu do'konda hali mahsulot yo'q.
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-3`}>
          {products.map((p) => <ProductCard key={p.id} p={p} isFav={!!favorites[p.id]} toggleFavorite={toggleFavorite} addToCart={addToCart} onOpenDetail={onOpenDetail} />)}
        </div>
      )}
    </div>
  );
}

function FavoritesView({ products, toggleFavorite, addToCart, onBrowse, desktop, onOpenDetail }) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Sevimlilar</h2>
      {products.length === 0 ? (
        <div className="text-center py-14 text-gray-500 text-sm">
          <Heart size={28} className="mx-auto mb-2 opacity-40" />
          Hali sevimli mahsulotlar yo'q.
          <div><button onClick={onBrowse} className="mt-3 text-violet-400 font-medium">Xarid qilishni boshlash</button></div>
        </div>
      ) : (
        <div className={`grid ${desktop ? "grid-cols-4 lg:grid-cols-5" : "grid-cols-2"} gap-3`}>
          {products.map((p) => <ProductCard key={p.id} p={p} isFav toggleFavorite={toggleFavorite} addToCart={addToCart} onOpenDetail={onOpenDetail} />)}
        </div>
      )}
    </div>
  );
}

function CartView({ entries, total, changeQty, removeFromCart, onBrowse, onCheckout, desktop }) {
  return (
    <div className={desktop ? "max-w-2xl" : ""}>
      <h2 className="text-lg font-bold mb-4">Savatcha</h2>
      {entries.length === 0 ? (
        <div className="text-center py-14 text-gray-500 text-sm">
          <ShoppingBag size={28} className="mx-auto mb-2 opacity-40" />
          Savatcha bo'sh.
          <div><button onClick={onBrowse} className="mt-3 text-violet-400 font-medium">Xarid qilishni boshlash</button></div>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-5">
            {entries.map(({ product, qty }) => (
              <div key={product.id} className="bg-[#14141c] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                <ProductImage name={product.name} image={product.image} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
                  <p className="text-sm font-semibold">{formatSum(product.price)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => changeQty(product.id, -1)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center" aria-label="Kamaytirish"><Minus size={13} /></button>
                  <span className="text-sm font-medium w-4 text-center">{qty}</span>
                  <button onClick={() => changeQty(product.id, 1)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center" aria-label="Ko'paytirish"><Plus size={13} /></button>
                  <button onClick={() => removeFromCart(product.id)} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center" aria-label="O'chirish"><Trash2 size={13} className="text-red-400" /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-gray-300">Jami</span>
            <span className="text-lg font-bold">{formatSum(total)}</span>
          </div>
          <button onClick={onCheckout} className="w-full bg-violet-600 hover:bg-violet-500 transition rounded-2xl py-3 font-semibold mt-3">Buyurtma berish</button>
        </>
      )}
    </div>
  );
}

function ProfileView({ desktop, onOpenSection, user, userName, onLogin, onSignup, onLogout }) {
  return (
    <div className={desktop ? "max-w-md" : ""}>
      <h2 className="text-lg font-bold mb-4">Profil</h2>
      <div className="bg-[#14141c] border border-white/10 rounded-2xl p-5 flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center"><User size={20} className="text-violet-300" /></div>
        <div className="min-w-0 flex-1">
          {user ? (
            <>
              <p className="font-semibold truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </>
          ) : (
            <>
              <p className="font-semibold">Mehmon foydalanuvchi</p>
              <p className="text-xs text-gray-400">Kirish uchun ro'yxatdan o'ting</p>
            </>
          )}
        </div>
      </div>

      {!user && (
        <div className="flex gap-2 mb-4">
          <button onClick={onLogin} className="flex-1 border border-white/10 rounded-xl py-2.5 text-sm font-medium">Kirish</button>
          <button onClick={onSignup} className="flex-1 bg-violet-600 hover:bg-violet-500 transition rounded-xl py-2.5 text-sm font-semibold">Ro'yxatdan o'tish</button>
        </div>
      )}

      <div className="space-y-2 mb-6">
        {["Buyurtmalarim", "Yetkazib berish manzillari", "To'lov usullari", "Sozlamalar", "Yordam"].map((item) => (
          <button key={item} onClick={() => onOpenSection(item)} className="w-full bg-[#14141c] border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between text-sm">
            {item} <ChevronRight size={16} className="text-gray-500" />
          </button>
        ))}
      </div>

      {user && (
        <button onClick={onLogout} className="w-full text-center text-sm text-red-400 py-2">Tizimdan chiqish</button>
      )}
    </div>
  );
}

function AdminView({ products, showForm, form, setForm, editingId, openAddForm, openEditForm, closeForm, handleSubmit, confirmDeleteId, setConfirmDeleteId, deleteProduct, saveStatus, logoutAdmin, desktop, stores, showStoreForm, storeForm, setStoreForm, editingStoreId, openAddStoreForm, openEditStoreForm, closeStoreForm, handleStoreSubmit, confirmDeleteStoreId, setConfirmDeleteStoreId, deleteStore, adminTab, setAdminTab }) {
  const listSection = (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-300">Barcha mahsulotlar ({products.length})</h3>
      </div>
      <div className="space-y-2">
        {products.length === 0 && <p className="text-sm text-gray-500 text-center py-6">Hali mahsulot qo'shilmagan.</p>}
        {products.map((p) => (
          <div key={p.id} className="bg-[#14141c] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <ProductImage name={p.name} image={p.image} className="w-14 h-14 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-xs text-gray-400">{p.brand} · {p.category}</p>
              <p className="text-sm font-semibold mt-0.5">{formatSum(p.price)}</p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={() => openEditForm(p)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center" aria-label="Tahrirlash"><Pencil size={14} /></button>
              <button onClick={() => setConfirmDeleteId(p.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center" aria-label="O'chirish"><Trash2 size={14} className="text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const formSection = showForm && (
    <div className="bg-[#14141c] border border-white/10 rounded-2xl p-4 mb-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">{editingId ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</h3>
        <button type="button" onClick={closeForm} aria-label="Yopish"><X size={18} className="text-gray-400" /></button>
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Mahsulot nomi</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Masalan: Bomber Jacket" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Do'kon (magazin)</label>
          {stores.length === 0 ? (
            <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">Avval "Do'konlar" bo'limidan kamida bitta do'kon qo'shing.</p>
          ) : (
            <select required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500">
              <option value="">Tanlang...</option>
              {stores.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Kategoriya</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500">
            {CATEGORIES.filter((c) => c !== "Barchasi").map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Narxi (so'm)</label>
          <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="250000" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Belgi (ixtiyoriy)</label>
          <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Yangi, Chegirma..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500" />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Rasm URL (ixtiyoriy)</label>
        <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500" />
        <p className="text-[11px] text-gray-500 mt-1">Bo'sh qoldirsangiz, avtomatik rangli belgi qo'yiladi. Eslatma: ba'zi ko'rish muhitlari (masalan shu chat ichidagi preview) xavfsizlik sababli tashqi rasm manzillarini bloklashi mumkin — bunday holda rangli belgi ko'rinaveradi, lekin sayt haqiqiy hostingga joylashtirilganda rasm to'liq ishlaydi.</p>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => handleSubmit()} className="flex-1 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 transition rounded-xl py-2.5 font-semibold text-sm cursor-pointer">{editingId ? "Saqlash" : "Qo'shish"}</button>
        <button type="button" onClick={closeForm} className="px-4 rounded-xl border border-white/10 text-sm text-gray-300">Bekor qilish</button>
      </div>
    </div>
  );

  const storeListSection = (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-300">Barcha do'konlar ({stores.length})</h3>
      </div>
      <div className="space-y-2">
        {stores.length === 0 && <p className="text-sm text-gray-500 text-center py-6">Hali do'kon qo'shilmagan.</p>}
        {stores.map((s) => (
          <div key={s.id} className="bg-[#14141c] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {s.logo ? (
                <img src={s.logo} alt={s.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
              ) : null}
              <Store size={18} className="text-gray-300" style={s.logo ? { display: "none" } : {}} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.name}</p>
              <p className="text-xs text-gray-400 truncate">{s.description || "Tavsif kiritilmagan"}</p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={() => openEditStoreForm(s)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center" aria-label="Tahrirlash"><Pencil size={14} /></button>
              <button onClick={() => setConfirmDeleteStoreId(s.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center" aria-label="O'chirish"><Trash2 size={14} className="text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const storeFormSection = showStoreForm && (
    <div className="bg-[#14141c] border border-white/10 rounded-2xl p-4 mb-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">{editingStoreId ? "Do'konni tahrirlash" : "Yangi do'kon"}</h3>
        <button type="button" onClick={closeStoreForm} aria-label="Yopish"><X size={18} className="text-gray-400" /></button>
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Do'kon nomi</label>
        <input required value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} placeholder="Masalan: Zara" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500" />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Logotip rasm URL (ixtiyoriy)</label>
        <input value={storeForm.logo} onChange={(e) => setStoreForm({ ...storeForm, logo: e.target.value })} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500" />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Sarlavha (banner) rasm URL (ixtiyoriy)</label>
        <input value={storeForm.banner} onChange={(e) => setStoreForm({ ...storeForm, banner: e.target.value })} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500" />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Qisqa tavsif (ixtiyoriy)</label>
        <textarea rows={2} value={storeForm.description} onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })} placeholder="Do'kon haqida qisqacha..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500 resize-none" />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => handleStoreSubmit()} className="flex-1 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 transition rounded-xl py-2.5 font-semibold text-sm cursor-pointer">{editingStoreId ? "Saqlash" : "Qo'shish"}</button>
        <button type="button" onClick={closeStoreForm} className="px-4 rounded-xl border border-white/10 text-sm text-gray-300">Bekor qilish</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-violet-400" />
          <h2 className="text-lg font-bold">Admin panel</h2>
        </div>
        <button onClick={logoutAdmin} className="text-xs text-gray-400 flex items-center gap-1 border border-white/10 rounded-lg px-3 py-1.5"><ArrowLeft size={13} /> Chiqish</button>
      </div>

      <div className="flex gap-2 mb-5 bg-[#14141c] border border-white/10 rounded-xl p-1">
        <button onClick={() => setAdminTab("products")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${adminTab === "products" ? "bg-violet-600 text-white" : "text-gray-400"}`}>Mahsulotlar</button>
        <button onClick={() => setAdminTab("stores")} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${adminTab === "stores" ? "bg-violet-600 text-white" : "text-gray-400"}`}>Do'konlar</button>
      </div>

      {saveStatus && <div className="bg-violet-600/20 border border-violet-500/40 text-violet-200 text-sm rounded-xl px-4 py-2.5 mb-4">{saveStatus}</div>}

      {adminTab === "products" ? (
        <>
          {!showForm && (
            <button onClick={openAddForm} className="w-full bg-violet-600 hover:bg-violet-500 transition rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold mb-5">
              <Plus size={18} /> Yangi mahsulot qo'shish
            </button>
          )}
          {desktop ? (
            <div className="grid grid-cols-2 gap-6 items-start">
              <div>{formSection}{!showForm && <p className="text-sm text-gray-500">Mahsulot qo'shish yoki tahrirlash shu yerda ko'rinadi.</p>}</div>
              {listSection}
            </div>
          ) : (
            <>{formSection}{listSection}</>
          )}
        </>
      ) : (
        <>
          {!showStoreForm && (
            <button onClick={openAddStoreForm} className="w-full bg-violet-600 hover:bg-violet-500 transition rounded-2xl py-3 flex items-center justify-center gap-2 font-semibold mb-5">
              <Plus size={18} /> Yangi do'kon qo'shish
            </button>
          )}
          {desktop ? (
            <div className="grid grid-cols-2 gap-6 items-start">
              <div>{storeFormSection}{!showStoreForm && <p className="text-sm text-gray-500">Do'kon qo'shish yoki tahrirlash shu yerda ko'rinadi.</p>}</div>
              {storeListSection}
            </div>
          ) : (
            <>{storeFormSection}{storeListSection}</>
          )}
        </>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-5 max-w-sm w-full">
            <p className="font-semibold mb-1">Mahsulotni o'chirish</p>
            <p className="text-sm text-gray-400 mb-4">Bu amalni ortga qaytarib bo'lmaydi. Davom etasizmi?</p>
            <div className="flex gap-2">
              <button onClick={() => deleteProduct(confirmDeleteId)} className="flex-1 bg-red-500 rounded-xl py-2 text-sm font-semibold">O'chirish</button>
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 border border-white/10 rounded-xl py-2 text-sm">Bekor qilish</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteStoreId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
          <div className="bg-[#14141c] border border-white/10 rounded-2xl p-5 max-w-sm w-full">
            <p className="font-semibold mb-1">Do'konni o'chirish</p>
            <p className="text-sm text-gray-400 mb-4">Bu do'konga tegishli mahsulotlar ro'yxatda qolaveradi, lekin ular endi hech qanday do'konga bog'lanmaydi. Davom etasizmi?</p>
            <div className="flex gap-2">
              <button onClick={() => deleteStore(confirmDeleteStoreId)} className="flex-1 bg-red-500 rounded-xl py-2 text-sm font-semibold">O'chirish</button>
              <button onClick={() => setConfirmDeleteStoreId(null)} className="flex-1 border border-white/10 rounded-xl py-2 text-sm">Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
