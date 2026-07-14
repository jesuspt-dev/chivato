import React, { useEffect, useState } from "react";
import {
  Home as HomeIcon,
  Search,
  PlusCircle,
  Bell,
  User,
  Shield,
  MessageSquarePlus,
  Compass,
  FileText,
  AlertTriangle,
  Building,
  ChevronLeft,
  Sun,
  Moon,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { INITIAL_PROPERTIES } from "./data";
import { Property, Review } from "./types";
import { geocodeAddress } from "./utils/geocode";
import { loadFromStorage, removeFromStorage } from "./utils/storage";
import { normalizeProperty } from "./utils/propertyScoring";
import { useProperties } from "./utils/useProperties";
import { isRemoteBackendAvailable, getCurrentUser, signOut } from "./utils/supabase";
import { AuthModal, UserMenu } from "./components/AuthModal";
import HomeTab from "./components/HomeTab";
import SearchTab from "./components/SearchTab";
import MapTab from "./components/MapTab";
import ProfileTab from "./components/ProfileTab";
import PropertyDetail from "./components/PropertyDetail";
import ReviewModal from "./components/ReviewModal";
import { getAssetUrl } from "./utils/assets";

const PROPERTIES_STORAGE_KEY = "chivato_properties_v2";

export default function App() {
  // Forward declare addToRecentSearches for hook
  const addToRecentSearches = (id: string) => {
    setRecentSearchesIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, 5);
      localStorage.setItem("recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  // Core state management using the new hook
  const {
    properties,
    selectedProperty,
    isLoading,
    error: syncError,
    selectProperty,
    clearSelection,
    addReview,
    addProperty,
    reportReview: reportReviewRemote,
    refresh,
  } = useProperties(INITIAL_PROPERTIES, addToRecentSearches);

  // UI state
  const [currentTab, setCurrentTab] = useState<number>(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Local favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newPropError, setNewPropError] = useState("");

  // Update recent searches state
  const [recentSearchesIds, setRecentSearchesIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initialize auth
  useEffect(() => {
    const checkAuth = async () => {
      if (isRemoteBackendAvailable()) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    };
    checkAuth();
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearchesIds([]);
    localStorage.removeItem("recent_searches");
  };

  const handleSelectProperty = (property: Property) => {
    selectProperty(property);
  };

  const handleAddReviewSubmit = async (
    propertyId: string,
    newReview: Review,
    categoryRatings: { casero: number; mantenimiento: number; vecindad: number },
    newAlertText?: string
  ) => {
    try {
      await addReview(propertyId, newReview, categoryRatings, newAlertText);
      setIsReviewModalOpen(false);
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };

  const handleReportReview = async (propertyId: string, reviewId: string) => {
    try {
      await reportReviewRemote(propertyId, reviewId);
    } catch (err) {
      console.error("Error reporting review:", err);
    }
  };

  const resetDemoData = () => {
    removeFromStorage(PROPERTIES_STORAGE_KEY);
    location.reload();
  };

  const handleCreatePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const address = formData.get("address") as string;
    const flat = formData.get("flat") as string;
    const district = formData.get("district") as string;
    const city = formData.get("city") as string;

    if (!address.trim() || !flat.trim() || !district.trim() || !city.trim()) {
      setNewPropError("Por favor rellena todos los campos");
      return;
    }

    try {
      const coords = await geocodeAddress(address, district, city);
      await addProperty(address, flat, district, city, coords);
      setIsNewPropertyModalOpen(false);
      setNewPropError("");
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Error creating property:", err);
      setNewPropError("No se pudo registrar la vivienda");
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
  };

  const renderActiveTabContent = () => {
    const recentSearches = recentSearchesIds
      .map((id) => properties.find((p) => p.id === id))
      .filter((p): p is Property => !!p);

    switch (currentTab) {
      case 0:
        return (
          <HomeTab
            properties={properties}
            onSelectProperty={handleSelectProperty}
            onNavigateToTab={(tabIdx) => {
              setCurrentTab(tabIdx);
            }}
          />
        );
      case 1:
        return (
          <SearchTab
            properties={properties}
            onSelectProperty={handleSelectProperty}
            recentSearches={recentSearches}
            onClearRecentSearches={clearRecentSearches}
          />
        );
      case 2:
        return <MapTab properties={properties} onSelectProperty={handleSelectProperty} />;
      case 3:
        return <ProfileTab properties={properties} onSelectProperty={handleSelectProperty} />;
      case 4:
        return <ProfileTab properties={properties} onSelectProperty={handleSelectProperty} />;
      default:
        return (
          <SearchTab
            properties={properties}
            onSelectProperty={handleSelectProperty}
            recentSearches={recentSearches}
            onClearRecentSearches={clearRecentSearches}
          />
        );
    }
  };

  const favoriteProperties = properties.filter((p) => favorites.includes(p.id));
  const favoriteAlerts = favoriteProperties.flatMap((p) =>
    p.alerts.map((alert) => ({
      ...alert,
      propertyAddress: p.address,
      propertyId: p.id,
      property: p,
    }))
  );

  return (
    <div className="bg-[#f8f9ff] dark:bg-slate-950 min-h-screen text-[#0b1c30] dark:text-slate-100 font-sans antialiased flex justify-center selection:bg-amber-100 p-0 md:p-4 lg:p-6">
      {/* Full-width container on mobile, expanding to standard grids/containers on larger screens */}
      <div className="w-full md:max-w-3xl lg:max-w-5xl xl:max-w-7xl bg-[#f8f9ff] dark:bg-slate-950 min-h-screen md:min-h-[85vh] md:h-[90vh] flex flex-col relative md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:md:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] md:border-4 md:border-black md:rounded-3xl overflow-hidden">
        
        {/* Top Header (Fully Responsive with Desktop Horizontal Nav and Mobile Hamburger) */}
        {!selectedProperty && (
          <header className="px-5 py-4 flex items-center justify-between border-b-4 border-black dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-sm relative">
            
            {/* Brand Logo & Name */}
            <div 
              onClick={() => { setCurrentTab(0); clearSelection(); }}
              className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <span className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border-2 border-black bg-[#fea619]/10">
                <img
                  referrerPolicy="no-referrer"
                  src={getAssetUrl("images/nuevo_logo.png")}
                  alt="chivato logo"
                  className="w-full h-full object-cover"
                />
              </span>
              <span className="font-black text-[#0b1c30] dark:text-white text-xl tracking-tighter uppercase">
                chivato
              </span>
            </div>

            {/* Desktop Navigation (visible on >= 768px tablet & desktop) */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => { setCurrentTab(0); clearSelection(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-black ${
                  currentTab === 0 ? "bg-[#ffd100] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => { setCurrentTab(1); clearSelection(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-black ${
                  currentTab === 1 ? "bg-[#ffd100] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
                }`}
              >
                Buscar
              </button>
              <button
                onClick={() => { setCurrentTab(2); clearSelection(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-black ${
                  currentTab === 2 ? "bg-[#ffd100] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
                }`}
              >
                Mapa
              </button>
              <button
                onClick={() => setIsNewPropertyModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-black bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
              >
                Registrar
              </button>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-black bg-black text-[#ffd100] hover:bg-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                + Reseña
              </button>
              <button
                onClick={resetDemoData}
                className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-black bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
              >
                Reset demo
              </button>
              <button
                onClick={() => { setCurrentTab(4); clearSelection(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-black ${
                  currentTab === 4 ? "bg-[#ffd100] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
                }`}
              >
                Perfil
              </button>
            </nav>
            
            {/* Action Buttons Container */}
            <div className="flex items-center gap-1 z-30">
              {/* Auth Button */}
              {isRemoteBackendAvailable() && (
                <button
                  onClick={() => (user ? handleLogout() : setIsAuthModalOpen(true))}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-black transition-all"
                  title={user ? "Cerrar sesión" : "Iniciar sesión"}
                >
                  {user ? (
                    <>
                      <LogOut className="w-4 h-4" />
                      Salir
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Entrar
                    </>
                  )}
                </button>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-black dark:text-white transition"
                title={isDarkMode ? "Modo claro" : "Modo oscuro"}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>

              {/* Notification Bell with Dropdown */}
              <div className="relative">
                <button
                  id="notifications-bell-btn"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-2 rounded-xl transition relative hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    isNotificationsOpen ? "text-[#fea619]" : "text-black dark:text-white"
                  }`}
                  title="Alertas de Favoritos"
                >
                  <Bell className="w-5 h-5" strokeWidth={2.5} />
                  {favoriteAlerts.length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full border border-white dark:border-slate-900 flex items-center justify-center animate-pulse">
                      {favoriteAlerts.length}
                    </span>
                  )}
                </button>

                {/* Notifications Popup Panel */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border-4 border-black dark:border-slate-700 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 z-50 text-left max-h-[400px] overflow-y-auto"
                    >
                      <div className="flex items-center justify-between border-b-2 border-black dark:border-slate-800 pb-2 mb-3">
                        <span className="text-xs font-black uppercase text-black dark:text-white flex items-center gap-1.5">
                          <span>🔔</span> Alertas de Favoritos
                        </span>
                        <button
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-[10px] font-black uppercase text-slate-400 hover:text-black dark:hover:text-white"
                        >
                          Cerrar
                        </button>
                      </div>

                      {favoriteAlerts.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-bold uppercase text-black dark:text-white">Sin alertas activas</p>
                          <p className="text-[10px] mt-1 normal-case leading-normal text-slate-600 dark:text-slate-400">
                            Guarda tus pisos como favoritos marcando el marcador (<span className="font-extrabold">bookmark</span>) en sus detalles para enterarte de sus incidencias aquí.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {favoriteAlerts.map((alert) => (
                            <div
                              key={alert.id}
                              onClick={() => {
                                selectProperty(alert.property);
                                setIsNotificationsOpen(false);
                              }}
                              className="p-3 bg-red-50 dark:bg-red-950/20 hover:bg-[#ffd100]/20 dark:hover:bg-amber-950/20 rounded-xl border-2 border-black dark:border-slate-800 transition cursor-pointer"
                            >
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={3} />
                                <div className="space-y-0.5">
                                  <p className="text-xs font-black uppercase text-black dark:text-white leading-tight">
                                    {alert.title}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase truncate">
                                    📍 {alert.propertyAddress.split(",")[0]}
                                  </p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal normal-case line-clamp-2">
                                    {alert.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Hamburger Menu Button (visible on < 768px only) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-black dark:text-white border-2 border-black bg-[#ffd100] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all ml-1"
                title="Menú"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" strokeWidth={3} /> : <Menu className="w-5 h-5" strokeWidth={3} />}
              </button>
            </div>
          </header>
        )}

        {/* Collapsible Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
              />
              {/* Sliding Menu Panel */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 border-r-4 border-black z-50 md:hidden p-6 flex flex-col justify-between shadow-2xl"
              >
                <div className="space-y-6">
                  {/* Drawer Brand Header */}
                  <div className="flex items-center justify-between border-b-4 border-black pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center border-2 border-black bg-[#fea619]/10">
                        <img
                          referrerPolicy="no-referrer"
                          src={getAssetUrl("images/nuevo_logo.png")}
                          alt="chivato logo"
                          className="w-full h-full object-cover"
                        />
                      </span>
                      <span className="font-extrabold text-[#0b1c30] dark:text-white text-lg tracking-tight uppercase">
                        chivato
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-black bg-white dark:bg-slate-800 text-black dark:text-white"
                    >
                      <X className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>

                  {/* Drawer Items */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setCurrentTab(0);
                        clearSelection();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wide border-2 border-black transition-all flex items-center gap-3 ${
                        currentTab === 0 ? "bg-[#ffd100] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-slate-50 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
                      }`}
                    >
                      <HomeIcon className="w-5 h-5 shrink-0" />
                      <span>Inicio</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab(1);
                        clearSelection();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wide border-2 border-black transition-all flex items-center gap-3 ${
                        currentTab === 1 ? "bg-[#ffd100] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-slate-50 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
                      }`}
                    >
                      <Search className="w-5 h-5 shrink-0" />
                      <span>Buscar</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab(2);
                        clearSelection();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wide border-2 border-black transition-all flex items-center gap-3 ${
                        currentTab === 2 ? "bg-[#ffd100] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-slate-50 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
                      }`}
                    >
                      <Compass className="w-5 h-5 shrink-0" />
                      <span>Mapa</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsNewPropertyModalOpen(true);
                      }}
                      className="w-full text-left py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wide border-2 border-black transition-all flex items-center gap-3 bg-slate-50 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
                    >
                      <Building className="w-5 h-5 shrink-0" />
                      <span>Registrar Dirección</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsReviewModalOpen(true);
                      }}
                      className="w-full text-left py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wide border-2 border-black transition-all flex items-center gap-3 bg-black text-[#ffd100] hover:bg-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <PlusCircle className="w-5 h-5 shrink-0" />
                      <span>Añadir Reseña</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentTab(4);
                          clearSelection();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wide border-2 border-black transition-all flex items-center gap-3 ${
                        currentTab === 4 ? "bg-[#ffd100] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-slate-50 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100"
                      }`}
                    >
                      <User className="w-5 h-5 shrink-0" />
                      <span>Mi Perfil</span>
                    </button>
                  </div>
                </div>

                <div className="border-t-2 border-black pt-4 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Chivato App &copy; 2026
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-0 pb-16 md:pb-0">
          {selectedProperty ? (
            <div className="flex-1 overflow-y-auto">
              <PropertyDetail
                property={selectedProperty}
                onBack={() => clearSelection()}
                onAddReviewClick={() => setIsReviewModalOpen(true)}
                isBookmarked={favorites.includes(selectedProperty.id)}
                onToggleBookmark={() => toggleFavorite(selectedProperty.id)}
                onReportReview={(reviewId) => handleReportReview(selectedProperty.id, reviewId)}
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`w-full flex-1 flex flex-col ${currentTab !== 2 ? "overflow-y-auto" : "min-h-0"}`}
              >
                {renderActiveTabContent()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Floating Bottom action pencil button like in the image */}
        {selectedProperty && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-20 pointer-events-none md:absolute md:bottom-6 md:left-auto md:right-6 md:translate-x-0 md:w-auto">
            <button
              id="floating-add-review-btn"
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full pointer-events-auto bg-black hover:bg-slate-900 text-white font-extrabold text-sm py-4 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 border-2 border-[#ffd100]"
            >
              <MessageSquarePlus className="w-5 h-5 text-[#fea619]" />
              <span>Añadir mi reseña</span>
            </button>
          </div>
        )}

        {/* Bottom Navigation precisely styled with active search bar orange indicator as shown in screenshot */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-slate-900 border-t-4 border-black py-2.5 px-4 flex items-center justify-between z-30 shadow-lg">
          {/* Inicio Tab */}
          <button
            onClick={() => {
              setCurrentTab(0);
              clearSelection();
            }}
            className={`flex flex-col items-center justify-center flex-1 transition ${
              currentTab === 0 && !selectedProperty ? "text-[#0b1c30] dark:text-[#ffd100]" : "text-slate-400 dark:text-slate-500 hover:text-[#0b1c30] dark:hover:text-white"
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Inicio</span>
          </button>

          {/* Buscar Tab (High priority styled active indicator matching screenshot) */}
          <button
            onClick={() => {
              setCurrentTab(1);
              clearSelection();
            }}
            className="flex flex-col items-center justify-center flex-1 relative"
          >
            {currentTab === 1 && !selectedProperty ? (
              <div className="flex flex-col items-center">
                <div className="bg-[#fea619] text-white p-2.5 rounded-full shadow-md transition transform -translate-y-2">
                  <Search className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-extrabold text-[#0b1c30] dark:text-white -mt-1.5">Buscar</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400 dark:text-slate-500 hover:text-[#0b1c30] dark:hover:text-white">
                <Search className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-1">Buscar</span>
              </div>
            )}
          </button>

          {/* Mapa Tab */}
          <button
            onClick={() => {
              setCurrentTab(2);
              clearSelection();
            }}
            className={`flex flex-col items-center justify-center flex-1 transition ${
              currentTab === 2 && !selectedProperty ? "text-[#0b1c30] dark:text-[#ffd100]" : "text-slate-400 dark:text-slate-500 hover:text-[#0b1c30] dark:hover:text-white"
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Mapa</span>
          </button>

          {/* Reseña Tab */}
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex flex-col items-center justify-center flex-1 text-slate-400 dark:text-slate-500 hover:text-[#0b1c30] dark:hover:text-white"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Reseña</span>
          </button>
        </nav>

        {/* Add Review Dialog Modal */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          property={selectedProperty}
          propertiesList={properties}
          onSubmit={handleAddReviewSubmit}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={() => {
            setIsAuthModalOpen(false);
            // Refresh properties after auth
            refresh();
          }}
        />

        {/* Create New Property Modal */}
        <AnimatePresence>
          {isNewPropertyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                onClick={() => setIsNewPropertyModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 z-10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#0b1c30]">Registrar Dirección</h3>
                  <button
                    onClick={() => setIsNewPropertyModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                  >
                    Cerrar
                  </button>
                </div>

                {newPropError && (
                  <p className="text-red-600 text-xs font-semibold">{newPropError}</p>
                )}

                <form onSubmit={handleCreatePropertySubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Calle / Vía Pública
                    </label>
                    <input
                      name="address"
                      type="text"
                      required
                      placeholder="Ej. Calle de Serrano, 88"
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#3980f4]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-1">
                        PISO Y PUERTA
                      </label>
                      <input
                        name="flat"
                        type="text"
                        required
                        placeholder="Ej. 2º Izq"
                        className="w-full p-2 border-2 border-black rounded-lg text-xs font-black uppercase bg-slate-50 focus:outline-none focus:bg-[#ffd100] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-1">
                        ZONA / BARRIO
                      </label>
                      <input
                        name="district"
                        type="text"
                        required
                        placeholder="Ej. Centro"
                        className="w-full p-2 border-2 border-black rounded-lg text-xs font-black uppercase bg-slate-50 focus:outline-none focus:bg-[#ffd100] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-1">
                      CIUDAD
                    </label>
                    <input
                      name="city"
                      type="text"
                      required
                      placeholder="Ej. Barcelona"
                      className="w-full p-2 border-2 border-black rounded-lg text-xs font-black uppercase bg-slate-50 focus:outline-none focus:bg-[#ffd100] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black text-[#ffd100] text-sm font-black uppercase rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all mt-2"
                  >
                    CREAR Y EVALUAR
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
