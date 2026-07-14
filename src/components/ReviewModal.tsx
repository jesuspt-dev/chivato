import React, { useState } from "react";
import { Star, X, Check, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Property, Review } from "../types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  propertiesList: Property[];
  onSubmit: (propertyId: string, review: Review, ratings: { casero: number; mantenimiento: number; vecindad: number }, newAlert?: string) => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  property,
  propertiesList,
  onSubmit
}: ReviewModalProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(property?.id || propertiesList[0]?.id || "");
  const [author, setAuthor] = useState("");
  const [caseroRating, setCaseroRating] = useState(3);
  const [mantenimientoRating, setMantenimientoRating] = useState(3);
  const [vecindadRating, setVecindadRating] = useState(3);
  const [startYear, setStartYear] = useState("2022");
  const [endYear, setEndYear] = useState("2023");
  const [comments, setComments] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reportHumidity, setReportHumidity] = useState(false);
  const [reportDepositScam, setReportDepositScam] = useState(false);
  const [reportNoise, setReportNoise] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [hasVerificationProof, setHasVerificationProof] = useState(false);

  const tagPresets = [
    "Tranquilo",
    "Problemas de humedad",
    "Casero ausente",
    "Buena luz",
    "Bien comunicado",
    "Excelente casero",
    "Ruidoso",
    "Casero conflictivo",
    "Retención de fianza",
    "Mantenimiento pésimo",
    "Cocina reformada"
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 6);

    try {
      const encodedImages = await Promise.all(validFiles.map(readFileAsDataUrl));
      setUploadedPhotos((current) => [...current, ...encodedImages].slice(0, 10));
    } catch {
      setErrorMsg("No se pudieron procesar las imágenes seleccionadas.");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) {
      setErrorMsg("Primero selecciona una vivienda válida.");
      return;
    }
    if (!author.trim()) {
      setErrorMsg("Por favor, introduce tu nombre.");
      return;
    }
    if (comments.length < 15) {
      setErrorMsg("La opinión debe tener al menos 15 caracteres.");
      return;
    }

    const livePeriod = `Ene ${startYear} - Dic ${endYear} (${parseInt(endYear) - parseInt(startYear) || 1} año${parseInt(endYear) - parseInt(startYear) !== 1 ? "s" : ""})`;
    const today = new Date();
    const formattedDate = today.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    // Determine final tags
    const finalTags = [...selectedTags];
    if (reportHumidity && !finalTags.includes("Problemas de humedad")) {
      finalTags.push("Problemas de humedad");
    }
    if (reportDepositScam && !finalTags.includes("Retención de fianza")) {
      finalTags.push("Retención de fianza");
    }
    if (reportNoise && !finalTags.includes("Ruidoso")) {
      finalTags.push("Ruidoso");
    }

    const overall = parseFloat(((caseroRating + mantenimientoRating + vecindadRating) / 3).toFixed(1));

    const newReview: Review = {
      id: "rev-" + Date.now(),
      author,
      rating: overall,
      livePeriod,
      comments,
      tags: finalTags,
      verified: false,
      verificationStatus: hasVerificationProof ? "pending" : "unverified",
      moderationStatus: "pending",
      reportCount: 0,
      date: formattedDate,
      photos: uploadedPhotos,
      ratingsBreakdown: {
        casero: caseroRating,
        mantenimiento: mantenimientoRating,
        vecindad: vecindadRating
      }
    };

    let possibleAlertText = "";
    if (reportHumidity) {
      possibleAlertText = "Humedades severas reportadas por el último inquilino.";
    } else if (reportDepositScam) {
      possibleAlertText = "Problemas graves con la devolución de fianza reportados recientemente.";
    } else if (reportNoise) {
      possibleAlertText = "Alto nivel de contaminación acústica reportado por inquilinos.";
    }

    onSubmit(
      selectedPropertyId,
      newReview,
      {
        casero: caseroRating,
        mantenimiento: mantenimientoRating,
        vecindad: vecindadRating
      },
      possibleAlertText || undefined
    );

    // Reset Form
    setAuthor("");
    setComments("");
    setSelectedTags([]);
    setReportHumidity(false);
    setReportDepositScam(false);
    setReportNoise(false);
    setErrorMsg("");
    setUploadedPhotos([]);
    setHasVerificationProof(false);
    onClose();
  };

  // Sync state if property prop changes
  React.useEffect(() => {
    if (property) {
      setSelectedPropertyId(property.id);
      return;
    }

    if (!selectedPropertyId && propertiesList[0]) {
      setSelectedPropertyId(propertiesList[0].id);
    }
  }, [property, propertiesList, selectedPropertyId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative bg-[#f8f9ff] dark:bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 z-10"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#f8f9ff]/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-[#0b1c30] dark:text-white">Añadir Reseña</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ayuda a otros inquilinos contando tu experiencia real</p>
              </div>
              <button
                id="close-modal-btn"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 flex-1">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Property Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] dark:text-white uppercase tracking-wider mb-2">
                  ¿Para qué vivienda es la reseña?
                </label>
                {property ? (
                  <div className="p-3 bg-[#e5eeff] dark:bg-slate-800 text-[#0b1c30] dark:text-slate-200 font-medium text-sm rounded-lg border border-[#cbdbf5] dark:border-slate-700">
                    {property.address}
                  </div>
                ) : (
                  <select
                    id="property-select"
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 text-sm text-[#0b1c30] dark:text-white font-medium rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3980f4] focus:border-[#3980f4]"
                  >
                    {propertiesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.address}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Author & Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] dark:text-white uppercase tracking-wider mb-1.5">
                    Tu Nombre
                  </label>
                  <input
                    id="author-input"
                    type="text"
                    required
                    placeholder="Ej. Carlos M."
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 text-sm text-[#0b1c30] dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3980f4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] dark:text-white uppercase tracking-wider mb-1.5">
                    Años de Alquiler
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      id="start-year-select"
                      value={startYear}
                      onChange={(e) => setStartYear(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 text-sm text-[#0b1c30] dark:text-white rounded-lg border border-slate-300 dark:border-slate-700"
                    >
                      {Array.from({ length: 15 }, (_, i) => 2012 + i).map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="text-slate-400 text-xs">a</span>
                    <select
                      id="end-year-select"
                      value={endYear}
                      onChange={(e) => setEndYear(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 text-sm text-[#0b1c30] dark:text-white rounded-lg border border-slate-300 dark:border-slate-700"
                    >
                      {Array.from({ length: 15 }, (_, i) => 2012 + i).map((y) => (
                        <option key={y} value={y} disabled={y < parseInt(startYear)}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ratings Breakdown Grid */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3.5">
                <h4 className="text-xs font-bold text-[#0b1c30] dark:text-white uppercase tracking-wider">
                  Evaluación Detallada (1 a 5)
                </h4>

                {/* Casero */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0b1c30] dark:text-slate-300 font-medium">Casero / Propiedad</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setCaseroRating(s)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star className={`w-5 h-5 ${s <= caseroRating ? "fill-[#fea619] text-[#fea619]" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mantenimiento */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0b1c30] dark:text-slate-300 font-medium">Mantenimiento</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setMantenimientoRating(s)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star className={`w-5 h-5 ${s <= mantenimientoRating ? "fill-[#fea619] text-[#fea619]" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vecindad y Ruidos */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0b1c30] dark:text-slate-300 font-medium">Vecindad y Ruidos</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setVecindadRating(s)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star className={`w-5 h-5 ${s <= vecindadRating ? "fill-[#fea619] text-[#fea619]" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promedio Calculado */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Puntuación Promedio Calculada:</span>
                  <span className="text-sm text-[#fea619]">
                    {((caseroRating + mantenimientoRating + vecindadRating) / 3).toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              {/* Tags Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] dark:text-white uppercase tracking-wider mb-2">
                  Etiquetas descriptivas
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  {tagPresets.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-[#fea619] text-white border border-transparent"
                            : "bg-[#eff4ff] dark:bg-slate-700 text-[#0b1c30] dark:text-white border border-[#cbdbf5] dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Critic Alerts Checkbox (Report alerts) */}
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-[#fea619]/40 space-y-2.5">
                <span className="text-xs font-bold text-[#684000] dark:text-amber-400 uppercase tracking-wider block">
                  ⚠️ Reportar Incidencias Graves
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Si marcas alguna de estas casillas, se generará una alerta de alta prioridad para esta propiedad.
                </p>

                <div className="space-y-1.5 text-xs text-[#0b1c30] dark:text-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-[#684000] dark:hover:text-[#fea619]">
                    <input
                      type="checkbox"
                      checked={reportHumidity}
                      onChange={(e) => setReportHumidity(e.target.checked)}
                      className="rounded border-[#fea619] text-[#fea619] focus:ring-[#fea619]"
                    />
                    <span>Problemas graves de Humedad / Moho</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-[#684000] dark:hover:text-[#fea619]">
                    <input
                      type="checkbox"
                      checked={reportDepositScam}
                      onChange={(e) => setReportDepositScam(e.target.checked)}
                      className="rounded border-[#fea619] text-[#fea619] focus:ring-[#fea619]"
                    />
                    <span>Retención injustificada de la Fianza</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-[#684000] dark:hover:text-[#fea619]">
                    <input
                      type="checkbox"
                      checked={reportNoise}
                      onChange={(e) => setReportNoise(e.target.checked)}
                      className="rounded border-[#fea619] text-[#fea619] focus:ring-[#fea619]"
                    />
                    <span>Ruido extremo (vecinos o locales nocturnos)</span>
                  </label>
                </div>
              </div>

              {/* Photo Upload & Preset Defect Picker */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0b1c30] dark:text-white uppercase tracking-wider">
                    ¿Tienes fotos de pruebas? 📸
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {uploadedPhotos.length} Adjuntadas
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Sube tus propias fotos o selecciona presets de desperfectos comunes para probar tu reseña:
                </p>

                {/* Preset Options */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Moho en Baño 🍄",
                      url: getAssetUrl("images/bathroom_mould_1783253064111.jpg")
                    },
                    {
                      label: "Horno Roto 🍳",
                      url: getAssetUrl("images/broken_oven_1783253076646.jpg")
                    },
                    {
                      label: "Parqué Dañado 🪵",
                      url: getAssetUrl("images/damaged_floor_1783253088429.jpg")
                    },
                    {
                      label: "Ventana Podrida 🪟",
                      url: getAssetUrl("images/peeling_window_1783253100627.jpg")
                    }
                  ].map((preset) => {
                    const isSelected = uploadedPhotos.includes(preset.url);
                    return (
                      <button
                        type="button"
                        key={preset.url}
                        onClick={() => {
                          if (isSelected) {
                            setUploadedPhotos(uploadedPhotos.filter(u => u !== preset.url));
                          } else {
                            setUploadedPhotos([...uploadedPhotos, preset.url]);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left text-xs font-bold border transition flex items-center justify-between ${
                          isSelected
                            ? "bg-[#fea619]/10 border-[#fea619] text-[#684000] dark:text-[#ffd100]"
                            : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                        }`}
                      >
                        <span className="truncate">{preset.label}</span>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                          isSelected ? "bg-[#fea619] border-transparent text-white" : "border-slate-300 dark:border-slate-500"
                        }`}>
                          {isSelected && "✓"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Simulated File Dropzone / Real Upload */}
                <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50 dark:bg-slate-700">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      void handlePhotoUpload(e.target.files);
                      e.currentTarget.value = "";
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Arrastra fotos aquí o pulsa para subir</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400">Admite JPG, PNG. En esta demo se guardan localmente en el navegador</p>
                  </div>
                </div>

                {/* Preview bubbles */}
                {uploadedPhotos.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-thin">
                    {uploadedPhotos.map((url, index) => (
                      <div key={index} className="relative shrink-0 w-11 h-11 rounded-full border-2 border-white shadow-md overflow-hidden group">
                        <img referrerPolicy="no-referrer" src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedPhotos(uploadedPhotos.filter(u => u !== url))}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-black opacity-0 group-hover:opacity-100 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Comments */}
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] dark:text-white uppercase tracking-wider mb-1.5">
                  Comentario Detallado
                </label>
                <textarea
                  id="comments-textarea"
                  required
                  rows={4}
                  placeholder="Detalla tu experiencia: el trato del casero, estado general de la vivienda, aislamiento de ruido, calefacción, etc."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-800 text-sm text-[#0b1c30] dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#3980f4]"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVerificationProof}
                  onChange={(e) => setHasVerificationProof(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#3980f4] focus:ring-[#3980f4]"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                  Puedo aportar prueba de estancia si moderación la solicita. No subas documentos con DNI, teléfono, email o datos personales visibles.
                </span>
              </label>

              {/* Verified tenant agreement note */}
              <div className="flex items-start gap-2.5 p-3 bg-[#eff4ff] dark:bg-slate-800 rounded-xl border border-[#cbdbf5] dark:border-slate-700">
                <div className="bg-[#3980f4] text-white p-0.5 rounded-full mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                  Confirmo que he vivido en esta dirección durante el periodo señalado. La reseña puede quedar pendiente de revisión y debe evitar insultos, datos personales de terceros o acusaciones no verificables.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  id="cancel-modal-btn"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="submit-modal-btn"
                  className="flex-1 py-2.5 bg-[#0b1c30] dark:bg-white text-white dark:text-[#0b1c30] hover:bg-black dark:hover:bg-slate-100 text-sm font-semibold rounded-lg transition shadow-md"
                >
                  Enviar Reseña
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
