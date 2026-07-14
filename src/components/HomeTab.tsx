import React from "react";
import { Flame, ShieldAlert, ArrowRight, Star, MapPin, Navigation } from "lucide-react";
import { Property } from "../types";
import { getAssetUrl } from "../utils/assets";

interface HomeTabProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onNavigateToTab: (tabIndex: number) => void;
}

export default function HomeTab({
  properties,
  onSelectProperty,
  onNavigateToTab
}: HomeTabProps) {

  // Sort properties
  const goodProperties = [...properties]
    .filter(p => p.overallRating >= 4.0 && p.alerts.length === 0)
    .sort((a, b) => b.overallRating - a.overallRating);

  const badProperties = [...properties]
    .filter(p => p.alerts.length > 0 || p.overallRating <= 2.5)
    .sort((a, b) => a.overallRating - b.overallRating);

  return (
    <div className="space-y-8 pb-20 px-5">
      {/* Brand Hero & Location */}
      <div className="pt-6 pb-2">
        <div className="flex flex-col items-center gap-4 mb-4 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-slate-900 shrink-0">
            <img
              referrerPolicy="no-referrer"
              src={getAssetUrl("images/nuevo_logo.png")}
              alt="Mascota chivato"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-2 mt-2">
            <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">
              Que no te<br/>la cuelen.
            </h1>
            <button className="flex items-center justify-center gap-2 text-sm text-black dark:text-white font-black mx-auto border-4 border-black bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <Navigation className="w-4 h-4 fill-black dark:fill-white" />
              MI UBICACIÓN: MADRID CENTRO
            </button>
          </div>
        </div>
      </div>

      {/* Good Properties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-black dark:text-[#ffd100] fill-black dark:fill-[#ffd100]" strokeWidth={3} />
            <h2 className="text-lg font-black text-black dark:text-white uppercase tracking-widest">
              ZONA SEGURA
            </h2>
          </div>
          <button
            onClick={() => onNavigateToTab(1)} // navigate to Buscar tab
            className="text-xs font-black text-black uppercase hover:underline flex items-center gap-1 bg-[#ffd100] border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
          >
            BUSCAR MÁS <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-x-visible gap-4 md:gap-6 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none">
          {goodProperties.slice(0, 3).map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProperty(p)}
              className="snap-start min-w-[260px] md:min-w-0 w-full bg-white dark:bg-slate-900 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className="space-y-2">
                <span className="inline-block text-xs font-black text-black uppercase bg-[#ffd100] border-2 border-black px-2 py-0.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {p.district}
                </span>
                <h3 className="font-black text-sm text-black dark:text-white uppercase leading-tight line-clamp-2">
                  {p.address}
                </h3>
              </div>
              <div className="mt-4 flex justify-between items-end">
                <div className="flex items-center gap-1 bg-black dark:bg-slate-800 text-white px-2 py-1 rounded-lg">
                  <span className="text-sm font-black">{p.overallRating.toFixed(1)}</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{p.reviews.length} RESEÑAS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges Stats Row */}
      <div className="grid grid-cols-3 gap-0 bg-white dark:bg-slate-900 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center overflow-hidden divide-x-4 divide-black">
        <div className="py-3 px-1 xs:p-4 flex flex-col items-center justify-center min-w-0">
          <span className="text-xl xs:text-2xl font-black text-black dark:text-white block truncate w-full">
            {properties.length}
          </span>
          <span className="text-[9px] xs:text-[10px] font-black text-black dark:text-slate-300 uppercase tracking-wider mt-1 block truncate w-full">
            PISOS
          </span>
        </div>
        <div className="py-3 px-1 xs:p-4 bg-[#ffd100] flex flex-col items-center justify-center min-w-0">
          <span className="text-xl xs:text-2xl font-black text-black block truncate w-full">
            {properties.reduce((sum, p) => sum + p.reviews.length, 0)}
          </span>
          <span className="text-[9px] xs:text-[10px] font-black text-black uppercase tracking-wider mt-1 block truncate w-full">
            RESEÑAS
          </span>
        </div>
        <div className="py-3 px-1 xs:p-4 flex flex-col items-center justify-center min-w-0">
          <span className="text-xl xs:text-2xl font-black text-red-500 block truncate w-full">
            {properties.filter(p => p.alerts.length > 0).length}
          </span>
          <span className="text-[9px] xs:text-[10px] font-black text-black dark:text-slate-300 uppercase tracking-wider mt-1 block truncate w-full">
            EN ALERTA
          </span>
        </div>
      </div>

      {/* Bad Properties Highlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" strokeWidth={3} />
            <h2 className="text-lg font-black text-black dark:text-white uppercase tracking-widest">
              A EVITAR
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 space-y-0">
          {badProperties.slice(0, 3).map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProperty(p)}
              className="p-4 bg-white dark:bg-slate-900 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all flex items-start gap-4"
            >
              <div className="p-3 bg-red-500 border-2 border-black rounded-xl text-white shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Flame className="w-6 h-6" strokeWidth={3} />
              </div>
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-black uppercase tracking-wider bg-[#ffd100] border-2 border-black px-2 py-0.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {p.district}
                  </span>
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border-2 border-black px-1.5 py-0.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-xs font-black text-black dark:text-white">{p.overallRating.toFixed(1)}</span>
                    <Star className="w-3 h-3 fill-black dark:fill-white text-black dark:text-white" />
                  </div>
                </div>
                <h3 className="font-black text-sm text-black dark:text-white uppercase leading-tight line-clamp-2">
                  {p.address}
                </h3>
                {p.alerts.length > 0 && (
                  <p className="text-xs font-bold text-red-600 line-clamp-1">
                    ! {p.alerts[0].title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
