import React, { useMemo, useState } from "react";
import { AlertTriangle, ChevronRight, MapPin, Search, Star, X } from "lucide-react";
import { Property, Review } from "../types";

interface SearchTabProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  recentSearches: Property[];
  onClearRecentSearches: () => void;
}

type ReviewWithProperty = Review & { property: Property };

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function matchesRating(rating: number, selectedRating: string, hasReviews: boolean) {
  if (selectedRating === "all") return true;
  if (!hasReviews) return false;
  if (selectedRating === "4+") return rating >= 4;
  if (selectedRating === "3-4") return rating >= 3 && rating < 4;
  if (selectedRating === "<3") return rating < 3;
  return true;
}

function VerificationPill({ review }: { review: Review }) {
  const status = review.verificationStatus ?? (review.verified ? "verified" : "unverified");
  const label =
    status === "verified"
      ? "Verificada"
      : status === "pending"
      ? "Verificación pendiente"
      : status === "rejected"
      ? "No verificada"
      : "No verificada";

  return (
    <span className="text-[9px] font-black bg-white text-black border-2 border-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
      {label}
    </span>
  );
}

export default function SearchTab({
  properties,
  onSelectProperty,
  recentSearches,
  onClearRecentSearches
}: SearchTabProps) {
  const [query, setQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedReview, setSelectedReview] = useState<ReviewWithProperty | null>(null);

  const normalizedQuery = normalize(query.trim());

  const districts = useMemo(
    () => Array.from(new Set(properties.map((p) => p.district))).sort((a, b) => a.localeCompare(b)),
    [properties]
  );

  const allReviews: ReviewWithProperty[] = useMemo(
    () => properties.flatMap((p) => p.reviews.map((r) => ({ ...r, property: p }))),
    [properties]
  );

  const filteredProperties = properties.filter((property) => {
    const searchable = normalize(
      [
        property.address,
        property.flat,
        property.district,
        property.city,
        ...property.alerts.map((alert) => `${alert.title} ${alert.description}`),
        ...property.reviews.flatMap((review) => [review.comments, ...review.tags])
      ].join(" ")
    );

    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesDistrict = selectedDistrict === "all" || property.district === selectedDistrict;
    return matchesQuery && matchesDistrict && matchesRating(property.overallRating, selectedRating, property.reviews.length > 0);
  });

  const filteredReviews = allReviews.filter((review) => {
    const searchable = normalize([
      review.property.address,
      review.property.district,
      review.property.city,
      review.comments,
      review.author,
      ...review.tags
    ].join(" "));

    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesDistrict = selectedDistrict === "all" || review.property.district === selectedDistrict;
    return matchesQuery && matchesDistrict && matchesRating(review.rating, selectedRating, true);
  });

  const resultCount = filteredProperties.length + filteredReviews.length;

  return (
    <div className="space-y-6 pb-24 px-5 pt-8">
      <div>
        <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-3">
          BUSCAR VIVIENDAS
        </h1>
        <p className="text-sm font-bold text-slate-800 bg-[#ffd100] border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Busca por calle, barrio, ciudad, incidencia o palabras dentro de las reseñas. Las viviendas sin reseñas también aparecen.
        </p>
      </div>

      <div className="relative">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 flex items-center gap-3">
          <Search className="w-6 h-6 text-black dark:text-white shrink-0 ml-1 font-bold" />
          <input
            id="search-tab-input"
            type="text"
            placeholder="CALLE, BARRIO, CIUDAD, HUMEDAD..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-lg text-black dark:text-white font-black placeholder-slate-400 focus:outline-none uppercase tracking-wide"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-black dark:text-white font-black uppercase hover:underline px-2"
            >
              BORRAR
            </button>
          )}
        </div>
      </div>

      {recentSearches.length > 0 && (
        <div className="space-y-2.5 bg-white dark:bg-slate-900 p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
              <span>🔍</span> Búsquedas recientes
            </span>
            <button
              onClick={onClearRecentSearches}
              className="text-[10px] font-black text-red-500 dark:text-red-400 uppercase tracking-widest hover:underline"
            >
              Borrar historial
            </button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x">
            {recentSearches.map((property) => (
              <button
                key={property.id}
                onClick={() => onSelectProperty(property)}
                className="snap-start shrink-0 flex items-center gap-1.5 bg-[#f8f9ff] dark:bg-slate-800 border-2 border-black px-3 py-1.5 rounded-xl text-xs font-black text-black dark:text-white uppercase transition hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                <span className="text-[#ffd100]">🏠</span>
                <span className="truncate max-w-[150px]">{property.address.split(",")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#ffd100] p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <span className="text-xs font-black text-black uppercase tracking-wider">BARRIO:</span>
          <select
            id="district-filter-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-white dark:bg-slate-800 border-2 border-black text-black dark:text-white text-xs font-black py-1 px-2.5 rounded-xl focus:outline-none uppercase cursor-pointer"
          >
            <option value="all">TODOS</option>
            {districts.map((district) => (
              <option key={district} value={district}>{district.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <span className="text-xs font-black text-black uppercase tracking-wider">VALORACIÓN:</span>
          <select
            id="rating-filter-select"
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="bg-white dark:bg-slate-800 border-2 border-black text-black dark:text-white text-xs font-black py-1 px-2.5 rounded-xl focus:outline-none uppercase cursor-pointer"
          >
            <option value="all">TODAS</option>
            <option value="4+">4+ ESTRELLAS</option>
            <option value="3-4">3 - 4 ESTRELLAS</option>
            <option value="<3">&lt; 3 ESTRELLAS</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-black dark:text-white font-black uppercase tracking-widest border-b-4 border-black dark:border-slate-800 pb-2">
          <span>VIVIENDAS ({filteredProperties.length})</span>
          <span>RESULTADOS TOTALES ({resultCount})</span>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Search className="w-12 h-12 text-black dark:text-white mx-auto mb-3" strokeWidth={3} />
            <p className="text-lg font-black text-black dark:text-white uppercase">SIN VIVIENDAS</p>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">Prueba con otra búsqueda o registra una dirección.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <button
                key={property.id}
                onClick={() => onSelectProperty(property)}
                className="text-left bg-white dark:bg-slate-900 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all flex flex-col group overflow-hidden h-full"
              >
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 relative border-b-4 border-black">
                  {property.gallery[0] ? (
                    <img src={property.gallery[0].url} alt={property.address} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-black uppercase text-slate-400">SIN FOTO</div>
                  )}
                  {property.alerts.length > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white border-2 border-black rounded-xl px-2 py-1 text-[10px] font-black uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {property.alerts.length} alerta{property.alerts.length > 1 ? "s" : ""}
                    </span>
                  )}
                  <div className="absolute top-2 right-2 bg-black border-2 border-black rounded-xl px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 z-10">
                    <span className="text-sm font-black text-[#ffd100] leading-none">
                      {property.reviews.length > 0 ? property.overallRating.toFixed(1) : "S/R"}
                    </span>
                    <Star className="w-3 h-3 fill-[#ffd100] text-[#ffd100]" />
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3 h-full justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-black bg-[#ffd100] text-black border-2 border-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      <MapPin className="w-3 h-3" strokeWidth={3} /> {property.district}
                    </span>
                    <h3 className="text-sm font-black text-black dark:text-white uppercase leading-tight mt-3 line-clamp-2">
                      {property.address}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">
                      {property.city} · {property.reviews.length} {property.reviews.length === 1 ? "reseña" : "reseñas"}
                    </p>
                  </div>
                  <div className="pt-3 border-t-2 border-black dark:border-slate-800 flex justify-between items-center mt-3">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                      Ver ficha completa
                    </span>
                    <span className="bg-[#ffd100] border-2 border-black text-black rounded-full p-1 group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <ChevronRight className="w-4 h-4" strokeWidth={3} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-black dark:text-white font-black uppercase tracking-widest border-b-4 border-black dark:border-slate-800 pb-2">
          <span>RESEÑAS ({filteredReviews.length})</span>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border-4 border-black border-dashed">
            <p className="text-sm font-black text-black dark:text-white uppercase">No hay reseñas con estos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                onClick={() => setSelectedReview(review)}
                className="bg-white dark:bg-slate-900 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all flex flex-col group overflow-hidden h-full justify-between"
              >
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 relative border-b-4 border-black flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
                  {(review.photos?.length ? review.photos : review.property.gallery.map((photo) => photo.url)).slice(0, 4).map((photoUrl, index) => (
                    <img
                      key={`${review.id}-${index}`}
                      src={photoUrl}
                      alt={review.property.address}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover shrink-0 snap-center"
                    />
                  ))}
                  <div className="absolute top-2 right-2 bg-black border-2 border-black rounded-xl px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 z-10">
                    <span className="text-sm font-black text-[#ffd100] leading-none">{review.rating.toFixed(1)}</span>
                    <Star className="w-3 h-3 fill-[#ffd100] text-[#ffd100]" />
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3 h-full justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black bg-[#ffd100] text-black border-2 border-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        {review.property.district}
                      </span>
                      <VerificationPill review={review} />
                      {review.moderationStatus === "reported" && (
                        <span className="text-[9px] font-black bg-red-500 text-white border-2 border-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          Reportada
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-black dark:text-white uppercase leading-tight mt-2 line-clamp-1">
                      {review.property.address}
                    </h3>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic line-clamp-3 leading-snug mt-2">
                      "{review.comments}"
                    </p>
                  </div>

                  <div className="pt-3 border-t-2 border-black dark:border-slate-800 flex justify-between items-center mt-3">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase">{review.date}</span>
                    <span className="bg-[#ffd100] border-2 border-black text-black rounded-full p-1 group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <ChevronRight className="w-4 h-4" strokeWidth={3} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReview && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-5">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b-4 border-black flex justify-between items-center bg-[#ffd100]">
              <h3 className="font-black text-black uppercase text-lg leading-tight line-clamp-1 flex-1 pr-2">
                RESEÑA EN {selectedReview.property.address}
              </h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="bg-white dark:bg-slate-800 border-2 border-black text-black dark:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none shrink-0"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 border-b-4 border-black flex overflow-x-auto snap-x snap-mandatory scrollbar-none relative">
                {(selectedReview.photos?.length ? selectedReview.photos : selectedReview.property.gallery.map((photo) => photo.url)).slice(0, 6).map((photoUrl, index) => (
                  <img
                    key={`${selectedReview.id}-modal-${index}`}
                    src={photoUrl}
                    alt={selectedReview.property.address}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover shrink-0 snap-center"
                  />
                ))}
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-black dark:text-white uppercase">{selectedReview.author}</p>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{selectedReview.date}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-[#ffd100] border-2 border-black px-2 py-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-lg font-black text-black">{selectedReview.rating.toFixed(1)}</span>
                    <Star className="w-4 h-4 fill-black text-black" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <VerificationPill review={selectedReview} />
                  <span className="text-[9px] font-black bg-[#ffd100] text-black border-2 border-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    {selectedReview.moderationStatus === "pending" ? "Pendiente de moderación" : "Publicada"}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-2 border-black">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    "{selectedReview.comments}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedReview.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-black bg-black text-[#ffd100] px-2 py-1 rounded-lg uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t-4 border-black bg-white dark:bg-slate-900">
              <button
                onClick={() => {
                  setSelectedReview(null);
                  onSelectProperty(selectedReview.property);
                }}
                className="w-full bg-black text-[#ffd100] font-black uppercase py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                VER PISO COMPLETO
                <ChevronRight className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
