import React, { useState } from "react";
import {
  MapPin,
  AlertTriangle,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  CheckCircle,
  Share2,
  Bookmark,
  Plus,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  Compass,
  AlertCircle,
  Flag,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Property, Review } from "../types";

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
  onAddReviewClick: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onReportReview: (reviewId: string) => void;
}

export default function PropertyDetail({
  property,
  onBack,
  onAddReviewClick,
  isBookmarked,
  onToggleBookmark,
  onReportReview
}: PropertyDetailProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<number>(0);
  const [filterTag, setFilterTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [showShareNotification, setShowShareNotification] = useState(false);

  // Extract unique tags from this property's reviews for custom filtering
  const allTags = Array.from(new Set(property.reviews.flatMap((r) => r.tags)));

  // Filter & Sort reviews
  const filteredReviews = property.reviews.filter((r) => {
    if (filterTag === "all") return true;
    return r.tags.includes(filterTag);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "newest") {
      // Very basic date parsing since we have custom formats like "15 Feb 2023"
      return b.date.localeCompare(a.date);
    }
    if (sortBy === "highest") {
      return b.rating - a.rating;
    }
    if (sortBy === "lowest") {
      return a.rating - b.rating;
    }
    return 0;
  });

  const handleShare = () => {
    const propertyUrl = `${window.location.origin}/property/${property.id}`;
    navigator.clipboard.writeText(propertyUrl);
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 2500);
  };

  // Helper to color the progress bar according to score
  const getProgressBarColor = (score: number) => {
    if (score < 2.0) return "bg-red-500";
    if (score < 3.5) return "bg-amber-500";
    return "bg-slate-900";
  };

  // Helper to render stars
  const renderStars = (score: number) => {
    const fullStars = Math.floor(score);
    const halfStar = score % 1 >= 0.4;
    return (
      <div className="flex gap-1.5 text-[#fea619] justify-center">
        {[1, 2, 3, 4, 5].map((i) => {
          if (i <= fullStars) {
            return <Star key={i} className="w-5 h-5 fill-[#fea619]" />;
          } else if (i === fullStars + 1 && halfStar) {
            return (
              <div key={i} className="relative">
                <Star className="w-5 h-5 text-slate-300" />
                <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                  <Star className="w-5 h-5 fill-[#fea619] text-[#fea619]" />
                </div>
              </div>
            );
          } else {
            return <Star key={i} className="w-5 h-5 text-slate-300" />;
          }
        })}
      </div>
    );
  };

  const getVerificationLabel = (review: Review) => {
    const status = review.verificationStatus ?? (review.verified ? "verified" : "unverified");
    if (status === "verified") return "INQUILINO VERIFICADO";
    if (status === "pending") return "VERIFICACIÓN PENDIENTE";
    if (status === "rejected") return "NO VERIFICADA";
    return "NO VERIFICADA";
  };

  return (
    <div className="pb-32 bg-white dark:bg-slate-950">
      {/* Top action bar */}
      <div className="flex items-center justify-between py-4 border-b-4 border-black sticky top-0 bg-[#ffd100] z-40 px-5 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-black hover:text-black font-black text-sm uppercase transition bg-white border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={3} />
          <span>VOLVER</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-full border-2 border-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none ${
              isBookmarked
                ? "bg-black text-[#ffd100]"
                : "bg-white hover:bg-slate-100 text-black"
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" strokeWidth={3} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full border-2 border-black bg-white hover:bg-slate-100 text-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
          >
            <Share2 className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>

      {showShareNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black text-[#ffd100] text-xs font-black uppercase px-5 py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" strokeWidth={3} />
          <span>¡ENLACE COPIADO!</span>
        </div>
      )}

      {/* Property Heading */}
      <div className="mt-6 px-5">
        <h1 className="text-3xl font-black text-black dark:text-white leading-none tracking-tighter uppercase">
          {property.address}
        </h1>
        <div className="flex items-center gap-2 text-slate-800 mt-3 bg-[#ffd100] border-2 border-black inline-flex px-3 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <MapPin className="w-4 h-4 text-black" strokeWidth={3} />
          <span className="text-sm font-black uppercase">
            {property.district}, {property.city}
          </span>
        </div>
      </div>

      {/* Alert Banners Stack */}
      {property.alerts.length > 0 && (
        <div className="mt-6 px-5 space-y-4">
          {property.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border-4 border-black flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                alert.severity === "high"
                  ? "bg-red-500 text-white"
                  : "bg-[#ffd100] text-black"
              }`}
            >
              <AlertTriangle className={`w-6 h-6 shrink-0 mt-0.5 ${alert.severity === "high" ? "text-white" : "text-black"}`} strokeWidth={3} />
              <div>
                <h3 className="font-black text-base uppercase leading-tight">{alert.title}</h3>
                <p className="text-sm mt-1 font-bold">
                  {alert.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Puntuación General block */}
      <div className="mt-6 px-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-4 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-xs font-black text-black dark:text-white uppercase tracking-widest block mb-2">
            PUNTUACIÓN GENERAL
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-black text-black dark:text-white tracking-tighter">
              {property.overallRating.toFixed(1)}
            </span>
            <span className="text-2xl font-black text-slate-400">/5</span>
          </div>
          <div className="mt-2">{renderStars(property.overallRating)}</div>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-3 border-t-2 border-black dark:border-slate-800 pt-3">
            BASADO EN {property.reviews.length} {property.reviews.length === 1 ? "RESEÑA" : "RESEÑAS"}
          </p>
        </div>
      </div>

      {/* Desglose por categorías block */}
      <div className="mt-6 px-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-widest mb-4 border-b-2 border-black dark:border-slate-800 pb-2">
            DESGLOSE POR CATEGORÍAS
          </h3>

          <div className="space-y-4">
            {/* Casero */}
            <div>
              <div className="flex justify-between text-xs font-black text-black dark:text-white mb-1.5 uppercase">
                <span>CASERO / PROPIEDAD</span>
                <span className="text-black dark:text-white">
                  {property.ratingsBreakdown.casero.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 border-2 border-black rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressBarColor(property.ratingsBreakdown.casero)} border-r-2 border-black`}
                  style={{ width: `${(property.ratingsBreakdown.casero / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Mantenimiento */}
            <div>
              <div className="flex justify-between text-xs font-black text-black dark:text-white mb-1.5 uppercase">
                <span>MANTENIMIENTO</span>
                <span className="text-black dark:text-white">
                  {property.ratingsBreakdown.mantenimiento.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 border-2 border-black rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressBarColor(property.ratingsBreakdown.mantenimiento)} border-r-2 border-black`}
                  style={{ width: `${(property.ratingsBreakdown.mantenimiento / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Vecindad y Ruidos */}
            <div>
              <div className="flex justify-between text-xs font-black text-black dark:text-white mb-1.5 uppercase">
                <span>VECINDAD Y RUIDOS</span>
                <span className="text-black dark:text-white">
                  {property.ratingsBreakdown.vecindad.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 border-2 border-black rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressBarColor(property.ratingsBreakdown.vecindad)} border-r-2 border-black`}
                  style={{ width: `${(property.ratingsBreakdown.vecindad / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Photos Section */}
      <div className="mt-8 px-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-[#ffd100] border-2 border-black p-1.5 rounded-lg text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="w-5 h-5" strokeWidth={3} />
          </span>
          <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-widest">
            FOTOS REALES DE INQUILINOS
          </h3>
        </div>

        {/* Swipeable Carousel Layout */}
        <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group/carousel bg-slate-100 dark:bg-slate-800">
          {property.gallery.length > 0 ? (
            <>
              {/* Main Carousel Image */}
              <img
                src={property.gallery[activeCarouselIndex].url}
                alt={property.gallery[activeCarouselIndex].caption}
                referrerPolicy="no-referrer"
                onClick={() => setSelectedPhotoIndex(activeCarouselIndex)}
                className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover/carousel:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Navigation Arrows */}
              {property.gallery.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCarouselIndex((prev) =>
                        prev === 0 ? property.gallery.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black flex items-center justify-center transition hover:bg-[#ffd100] active:translate-y-[2px] active:shadow-none z-10"
                    title="Foto anterior"
                  >
                    <ChevronLeft className="w-6 h-6" strokeWidth={3} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCarouselIndex((prev) =>
                        prev === property.gallery.length - 1 ? 0 : prev + 1
                      );
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black flex items-center justify-center transition hover:bg-[#ffd100] active:translate-y-[2px] active:shadow-none z-10"
                    title="Foto siguiente"
                  >
                    <ChevronRight className="w-6 h-6" strokeWidth={3} />
                  </button>
                </>
              )}

              {/* Caption and Fullscreen button */}
              <span className="absolute bottom-4 left-4 bg-[#ffd100] border-2 border-black text-xs font-black uppercase text-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10">
                {property.gallery[activeCarouselIndex].caption}
              </span>
              <button
                onClick={() => setSelectedPhotoIndex(activeCarouselIndex)}
                className="absolute top-4 right-4 bg-white border-2 border-black text-black p-2 rounded-full cursor-pointer hover:bg-[#ffd100] transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none z-10"
              >
                <Maximize2 className="w-5 h-5" strokeWidth={3} />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
                {property.gallery.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 border-2 border-black rounded-full transition-all ${
                      idx === activeCarouselIndex
                        ? "bg-[#ffd100] w-4"
                        : "bg-white"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <Sparkles className="w-10 h-10 text-slate-400 mb-2" strokeWidth={2} />
              <p className="text-sm font-bold text-slate-500 uppercase">NO HAY FOTOS DISPONIBLES</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Reviews Header */}
      <div className="mt-10 px-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b-4 border-black dark:border-slate-800 pb-3">
          <MessageSquare className="w-6 h-6 text-black dark:text-white" strokeWidth={3} />
          <h3 className="text-base font-black text-black dark:text-white uppercase tracking-widest">
            RESEÑAS DETALLADAS ({property.reviews.length})
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-black dark:text-white font-black uppercase">
          <ArrowUpDown className="w-4 h-4" strokeWidth={3} />
          <span>ORDENAR POR:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-slate-800 border-2 border-black text-black dark:text-white p-1.5 rounded-lg cursor-pointer focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="newest">MÁS RECIENTES</option>
            <option value="highest">MEJOR PUNTUACIÓN</option>
            <option value="lowest">PEOR PUNTUACIÓN</option>
          </select>
        </div>

        {/* Filter tags toolbar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
          <button
            onClick={() => setFilterTag("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none uppercase ${
              filterTag === "all"
                ? "bg-black text-[#ffd100]"
                : "bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            TODAS
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none uppercase ${
                filterTag === tag
                  ? "bg-black text-[#ffd100]"
                  : "bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-4 px-5 space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 border-4 border-black border-dashed rounded-2xl">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={3} />
            <p className="text-sm text-slate-500 font-bold uppercase">NO HAY RESEÑAS CON LA ETIQUETA SELECCIONADA.</p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-black dark:text-white uppercase">
                      {review.author}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-bold uppercase">
                    VIVIÓ AQUÍ: {review.livePeriod}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[9px] font-black bg-[#ffd100] text-black border-2 border-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      {getVerificationLabel(review)}
                    </span>
                    <span className={`text-[9px] font-black border-2 border-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                      review.moderationStatus === "reported"
                        ? "bg-red-500 text-white"
                        : review.moderationStatus === "pending"
                        ? "bg-white text-black"
                        : "bg-black text-[#ffd100]"
                    }`}>
                      {review.moderationStatus === "reported"
                        ? "REPORTADA"
                        : review.moderationStatus === "pending"
                        ? "PENDIENTE DE MODERACIÓN"
                        : "PUBLICADA"}
                    </span>
                  </div>
                </div>
                <div className="bg-[#ffd100] text-black border-2 border-black px-3 py-1.5 rounded-xl text-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-sm font-black block">
                    {review.rating.toFixed(1)} / 5
                  </span>
                </div>
              </div>

              {/* Tag Chips */}
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {review.tags.map((tag, i) => (
                    <span
                      key={i}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        tag.includes("humedad") || tag.includes("ausente") || tag.includes("Ruidoso") || tag.includes("fianza") || tag.includes("pésimo")
                          ? "bg-red-500 text-white"
                          : "bg-black text-[#ffd100]"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Review Comment */}
              <p className="text-sm text-black dark:text-white leading-relaxed font-bold whitespace-pre-line bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-2 border-black dark:border-slate-800">
                "{review.comments}"
              </p>

              {/* Published Date */}
              <div className="pt-3 border-t-2 border-black dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase mt-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Publicado el {review.date}
                </span>
                <button
                  type="button"
                  onClick={() => onReportReview(review.id)}
                  className="text-red-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Reportar reseña{review.reportCount ? ` (${review.reportCount})` : ""}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox Photo Gallery Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-4">
            {/* Header */}
            <div className="flex justify-between items-center text-white py-2">
              <span className="text-xs font-medium">
                Foto {selectedPhotoIndex + 1} de {property.gallery.length}
              </span>
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Slider */}
            <div className="relative flex-1 flex items-center justify-center">
              {/* Prev Button */}
              <button
                onClick={() =>
                  setSelectedPhotoIndex(
                    (selectedPhotoIndex - 1 + property.gallery.length) %
                      property.gallery.length
                  )
                }
                className="absolute left-2 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <img
                src={property.gallery[selectedPhotoIndex].url}
                alt={property.gallery[selectedPhotoIndex].caption}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-xl"
              />

              {/* Next Button */}
              <button
                onClick={() =>
                  setSelectedPhotoIndex(
                    (selectedPhotoIndex + 1) % property.gallery.length
                  )
                }
                className="absolute right-2 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Caption */}
            <div className="text-center py-4">
              <p className="text-sm text-white font-semibold">
                {property.gallery[selectedPhotoIndex].caption}
              </p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
                Foto aportada por la comunidad
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
