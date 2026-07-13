import React, { useState } from "react";
import { User, Shield, Star, Award, Settings, CheckCircle2, FileText, MessageSquare, AlertTriangle, ShieldAlert, MapPin, Search, Plus, X } from "lucide-react";
import { Review, Property } from "../types";

interface ProfileTabProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export default function ProfileTab({
  properties,
  onSelectProperty
}: ProfileTabProps) {
  const userReviews = [
    {
      id: "my-rev-1",
      propertyId: "pirineos-45",
      propertyName: "Calle de la Pirineos, 45, 3º B",
      rating: 2.0,
      comments: "El barrio es fantástico y los vecinos son muy amables, cero ruidos. Sin embargo, la experiencia con el casero fue desastrosa. A los 3 meses empezó a salir humedad en el baño...",
      date: "15 Feb 2023",
      tags: ["Tranquilo", "Problemas de humedad"]
    }
  ];

  const [activeSubTab, setActiveSubTab] = useState<"profile" | "alerts">("profile");
  
  const [userZones, setUserZones] = useState<string[]>(["Centro"]);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  const availableDistricts = Array.from(new Set(properties.map(p => p.district)));
  const propertiesWithAlerts = properties.filter((p) => p.alerts.length > 0 && userZones.includes(p.district));

  const handleToggleZone = (zone: string) => {
    setUserZones(prev => 
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  return (
    <div className="space-y-6 pb-24 px-5 pt-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-3">
          TU PERFIL
        </h1>
        <p className="text-sm font-bold text-slate-800 bg-[#ffd100] border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Gestiona tus alertas, zonas y aportaciones.
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#ffd100] border-2 border-black flex items-center justify-center font-black text-2xl text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
          PT
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-black dark:text-white uppercase">jesuspt.dev</h2>
          </div>
          <span className="inline-block text-xs font-black bg-black text-white px-2 py-0.5 rounded-lg uppercase tracking-wider">
            Nivel 2 • Inquilino Defensor
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b-4 border-black dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab("profile")}
          className={`flex-1 py-2 text-sm font-black uppercase border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all ${
            activeSubTab === "profile" ? "bg-black text-[#ffd100]" : "bg-white dark:bg-slate-800 text-black dark:text-white"
          }`}
        >
          ACTIVIDAD
        </button>
        <button
          onClick={() => setActiveSubTab("alerts")}
          className={`flex-1 py-2 text-sm font-black uppercase border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "alerts" ? "bg-red-500 text-white" : "bg-white dark:bg-slate-800 text-red-500 dark:text-red-400"
          }`}
        >
          <AlertTriangle className="w-4 h-4" strokeWidth={3} />
          ALERTAS
        </button>
      </div>

      {activeSubTab === "profile" ? (
        <div className="space-y-6">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#ffd100] p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <span className="text-3xl font-black text-black block">3</span>
              <span className="text-[10px] font-black text-black uppercase tracking-widest mt-1 block">
                APORTACIONES
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <span className="text-3xl font-black text-black dark:text-white block">18</span>
              <span className="text-[10px] font-black text-black dark:text-slate-300 uppercase tracking-widest mt-1 block">
                VOTOS ÚTILES
              </span>
            </div>
          </div>

          {/* Written Reviews List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-black dark:text-white uppercase tracking-widest border-b-4 border-black dark:border-slate-800 pb-2">
              MIS RESEÑAS ({userReviews.length})
            </h3>

            {userReviews.map((rev) => (
              <div
                key={rev.id}
                onClick={() => {
                  const matchedProp = properties.find((p) => p.id === rev.propertyId);
                  if (matchedProp) onSelectProperty(matchedProp);
                }}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-black dark:text-white uppercase leading-tight group-hover:underline">
                      {rev.propertyName}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1 block">
                      {rev.date}
                    </span>
                  </div>
                  <span className="text-xs font-black bg-[#ffd100] text-black border-2 border-black px-2 py-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                    {rev.rating.toFixed(1)} <Star className="w-3 h-3 inline fill-black" />
                  </span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-bold leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border-2 border-black dark:border-slate-800">
                  "{rev.comments}"
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {rev.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-black bg-black text-[#ffd100] px-2 py-1 rounded-lg uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Settings / Actions */}
          <button className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-[#ffd100] dark:hover:bg-[#ffd100] p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between text-sm text-black dark:text-white hover:text-black dark:hover:text-black font-black uppercase transition-all active:translate-y-[4px] active:shadow-none">
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> Ajustes
            </span>
            <span className="text-xs">EDITAR</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Alert Zones */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-black dark:text-white" strokeWidth={3} />
                <h3 className="text-sm font-black text-black dark:text-white uppercase tracking-widest">
                  ZONAS DE ALERTA
                </h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {userZones.map(zone => (
                <span key={zone} className="bg-[#ffd100] border-2 border-black text-black text-xs font-black uppercase px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                  {zone}
                  <button onClick={() => handleToggleZone(zone)} className="hover:bg-black hover:text-[#ffd100] rounded-full p-0.5 transition-colors ml-1">
                    <X className="w-3 h-3" strokeWidth={4} />
                  </button>
                </span>
              ))}
              <button
                onClick={() => setIsZoneModalOpen(true)}
                className="bg-white dark:bg-slate-800 border-2 border-dashed border-black text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:border-solid hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-black uppercase px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" strokeWidth={4} /> AÑADIR ZONA
              </button>
            </div>
          </div>

          {/* Active Alerts List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-black dark:text-white uppercase tracking-widest border-b-4 border-black dark:border-slate-800 pb-2">
              ALERTAS EN TUS ZONAS ({propertiesWithAlerts.length})
            </h3>

            {propertiesWithAlerts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                <ShieldAlert className="w-12 h-12 text-emerald-500 mb-3" strokeWidth={3} />
                <p className="text-lg font-black text-black dark:text-white uppercase">SIN ALERTAS</p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">Tus zonas parecen libres de reportes graves.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesWithAlerts.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => onSelectProperty(property)}
                    className="bg-white dark:bg-slate-900 border-4 border-black rounded-2xl p-5 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all space-y-4 group h-full flex flex-col justify-between"
                  >
                    <div className="space-y-1 border-b-2 border-black dark:border-slate-800 pb-3">
                      <span className="text-[10px] font-black bg-[#ffd100] text-black border-2 border-black px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        {property.district}
                      </span>
                      <h3 className="text-base font-black text-black dark:text-white uppercase leading-tight group-hover:underline mt-2">
                        {property.address}
                      </h3>
                    </div>

                    {/* Alerts inside this property */}
                    <div className="space-y-3">
                      {property.alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border-2 border-red-500">
                          <span className="bg-red-500 text-white p-2 rounded-lg shrink-0 border-2 border-black">
                            <AlertTriangle className="w-5 h-5" strokeWidth={3} />
                          </span>
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-red-600 dark:text-red-400 uppercase">
                              {alert.title}
                            </h4>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                              {alert.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-5">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[80vh]">
            <div className="p-4 border-b-4 border-black flex justify-between items-center bg-[#ffd100] rounded-t-xl">
              <h3 className="font-black text-black uppercase text-lg">SELECCIONAR ZONAS</h3>
              <button 
                onClick={() => setIsZoneModalOpen(false)}
                className="bg-white dark:bg-slate-800 border-2 border-black text-black dark:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-2">
              {availableDistricts.map(district => (
                <button
                  key={district}
                  onClick={() => handleToggleZone(district)}
                  className={`w-full text-left p-3 rounded-xl border-2 border-black font-black uppercase text-sm flex justify-between items-center transition-all ${
                    userZones.includes(district) ? "bg-black text-[#ffd100]" : "bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {district}
                  {userZones.includes(district) && <CheckCircle2 className="w-5 h-5" strokeWidth={3} />}
                </button>
              ))}
              
              {availableDistricts.length === 0 && (
                <p className="text-center text-sm font-bold text-slate-500 dark:text-slate-400 py-4 uppercase">No hay zonas disponibles.</p>
              )}
            </div>
            
            <div className="p-4 border-t-4 border-black bg-slate-50 dark:bg-slate-850 rounded-b-xl">
              <button
                onClick={() => setIsZoneModalOpen(false)}
                className="w-full bg-[#ffd100] text-black font-black uppercase py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
              >
                LISTO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
