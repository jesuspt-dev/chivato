import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Property } from "../types";

// Leaflet PNG assets do not ship TS declarations.
// @ts-ignore
import iconUrl from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
// @ts-ignore
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid black;
        box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${color === "#ffd100" ? "black" : "white"};
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const warningIcon = createCustomIcon("#ef4444");
const safeIcon = createCustomIcon("#ffd100");

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();

  React.useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

interface MapTabProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export default function MapTab({ properties, onSelectProperty }: MapTabProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query.trim());

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (!property.coords) return false;
      if (!normalizedQuery) return true;

      const searchable = normalize([
        property.address,
        property.flat,
        property.district,
        property.city,
        ...property.alerts.map((alert) => `${alert.title} ${alert.description}`),
        ...property.reviews.flatMap((review) => [review.comments, ...review.tags])
      ].join(" "));

      return searchable.includes(normalizedQuery);
    });
  }, [normalizedQuery, properties]);

  const center = useMemo<[number, number]>(() => {
    const coords = filteredProperties.map((property) => property.coords).filter((coords): coords is [number, number] => Boolean(coords));
    if (coords.length === 0) return [40.4168, -3.7038];

    const lat = coords.reduce((sum, current) => sum + current[0], 0) / coords.length;
    const lng = coords.reduce((sum, current) => sum + current[1], 0) / coords.length;
    return [lat, lng];
  }, [filteredProperties]);

  return (
    <div className="h-full flex flex-col relative pb-20">
      <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2">
        <div className="bg-white rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 flex items-center gap-3">
          <Search className="w-6 h-6 text-black shrink-0 ml-1 font-bold" />
          <input
            type="text"
            placeholder="BUSCAR EN EL MAPA..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-lg text-black font-black placeholder-slate-400 focus:outline-none uppercase tracking-wide"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs font-black uppercase text-black hover:underline">
              Borrar
            </button>
          )}
        </div>
        <div className="inline-flex bg-white border-2 border-black rounded-xl px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {filteredProperties.length} marcador{filteredProperties.length === 1 ? "" : "es"} visible{filteredProperties.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="flex-1 w-full h-full relative z-0">
        <MapContainer center={center} zoom={13} style={{ width: "100%", height: "100%" }} zoomControl={false}>
          <RecenterMap center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {filteredProperties.map((property) => {
            if (!property.coords) return null;

            const hasAlerts = property.alerts.length > 0;
            const icon = hasAlerts ? warningIcon : safeIcon;

            return (
              <Marker
                key={property.id}
                position={property.coords}
                icon={icon}
                eventHandlers={{ click: () => onSelectProperty(property) }}
              >
                <Popup className="custom-popup">
                  <div className="font-sans">
                    <p className="font-black text-xs uppercase bg-[#ffd100] border border-black px-1 py-0.5 inline-block mb-1">
                      {property.district}
                    </p>
                    <h3 className="font-black text-sm uppercase leading-tight mb-1">{property.address}</h3>
                    <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">
                      {property.reviews.length > 0 ? `${property.overallRating.toFixed(1)} / 5 · ${property.reviews.length} reseñas` : "Sin reseñas todavía"}
                    </p>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectProperty(property);
                      }}
                      className="w-full bg-black text-[#ffd100] font-black uppercase text-[10px] py-1.5 rounded-lg"
                    >
                      VER DETALLES
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
