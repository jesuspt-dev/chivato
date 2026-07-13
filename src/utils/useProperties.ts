import { useEffect, useState, useCallback } from "react";
import { Property, Review } from "../types";
import { loadFromStorage, saveToStorage } from "./storage";
import { normalizeProperty, recalculatePropertyScores } from "./propertyScoring";
import {
  isRemoteBackendAvailable,
  fetchProperties,
  createProperty,
  updateProperty,
  createReview,
  reportReview as reportReviewRemote,
} from "./supabase";

const PROPERTIES_STORAGE_KEY = "chivato_properties_v2";

interface UsePropertiesReturn {
  properties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  error: string | null;
  selectProperty: (property: Property) => void;
  clearSelection: () => void;
  addReview: (
    propertyId: string,
    review: Review,
    categoryRatings: { casero: number; mantenimiento: number; vecindad: number },
    alertText?: string
  ) => Promise<void>;
  addProperty: (
    address: string,
    flat: string,
    district: string,
    city: string,
    coords?: [number, number]
  ) => Promise<void>;
  reportReview: (propertyId: string, reviewId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProperties(
  initialProperties: Property[],
  onRecentSearch?: (id: string) => void
): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>(() => {
    const stored = loadFromStorage<Property[]>(PROPERTIES_STORAGE_KEY, initialProperties);
    return stored.map(normalizeProperty);
  });

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from remote on mount if available
  useEffect(() => {
    const loadRemote = async () => {
      if (!isRemoteBackendAvailable()) return;

      setIsLoading(true);
      setError(null);
      try {
        const remoteProperties = await fetchProperties();
        const normalized = remoteProperties.map(normalizeProperty);
        setProperties(normalized);
        saveToStorage(PROPERTIES_STORAGE_KEY, normalized);
      } catch (err) {
        console.error("Failed to load from remote, using local:", err);
        setError("No se pudo conectar al servidor. Usando datos locales.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRemote();
  }, []);

  // Sync local changes to storage
  useEffect(() => {
    saveToStorage(PROPERTIES_STORAGE_KEY, properties);
  }, [properties]);

  // Keep selected property in sync with latest data
  useEffect(() => {
    setSelectedProperty((current) =>
      current ? properties.find((p) => p.id === current.id) ?? null : null
    );
  }, [properties]);

  const selectProperty = useCallback(
    (property: Property) => {
      const liveProp = properties.find((p) => p.id === property.id);
      if (liveProp) {
        setSelectedProperty(liveProp);
        onRecentSearch?.(liveProp.id);
      }
    },
    [properties, onRecentSearch]
  );

  const clearSelection = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  const addReview = useCallback(
    async (
      propertyId: string,
      newReview: Review,
      categoryRatings: { casero: number; mantenimiento: number; vecindad: number },
      alertText?: string
    ) => {
      setError(null);
      try {
        const enrichedReview: Review = {
          ...newReview,
          rating: Number(
            ((categoryRatings.casero + categoryRatings.mantenimiento + categoryRatings.vecindad) / 3).toFixed(1)
          ),
          propertyId: propertyId,
          ratingsBreakdown: categoryRatings,
        };

        // Try to sync to remote if available
        if (isRemoteBackendAvailable()) {
          await createReview(propertyId, enrichedReview);
        }

        // Update local state
        setProperties((currentProps) =>
          currentProps.map((prop) => {
            if (prop.id !== propertyId) return prop;

            const reviewPhotos = enrichedReview.photos ?? [];
            const updatedGallery = [
              ...reviewPhotos.map((url, index) => ({
                url,
                caption: `Foto aportada en reseña ${index + 1}`,
              })),
              ...prop.gallery,
            ];

            const updatedAlerts = [...prop.alerts];
            if (alertText) {
              updatedAlerts.push({
                id: `alert-${Date.now()}`,
                title: enrichedReview.tags.includes("Problemas de humedad")
                  ? "Reporte de humedades"
                  : enrichedReview.tags.includes("Retención de fianza")
                  ? "Conflicto por fianza"
                  : "Reporte de ruido extremo",
                description: alertText,
                severity: "high",
              });
            }

            return recalculatePropertyScores({
              ...prop,
              reviews: [enrichedReview, ...prop.reviews],
              gallery: updatedGallery,
              alerts: updatedAlerts,
            });
          })
        );
      } catch (err) {
        console.error("Error adding review:", err);
        setError("Error al guardar la reseña. Intenta de nuevo.");
        throw err;
      }
    },
    []
  );

  const addProperty = useCallback(
    async (
      address: string,
      flat: string,
      district: string,
      city: string,
      coords?: [number, number]
    ) => {
      if (!address.trim() || !flat.trim() || !district.trim() || !city.trim()) {
        throw new Error("Por favor rellena todos los campos");
      }

      setError(null);
      try {
        const newProp: Omit<Property, "id" | "reviews"> = {
          address: `${address}, ${flat}`,
          flat,
          district,
          city,
          coords,
          overallRating: 0,
          ratingsBreakdown: { casero: 0, mantenimiento: 0, vecindad: 0 },
          alerts: [],
          gallery: [],
        };

        let createdProp: any;

        // Try to sync to remote if available
        if (isRemoteBackendAvailable()) {
          createdProp = await createProperty(newProp);
        } else {
          createdProp = {
            id: "prop-" + Date.now(),
            ...newProp,
            reviews: [],
          };
        }

        const normalized = normalizeProperty(createdProp);
        setProperties((prev) => [normalized, ...prev]);
      } catch (err) {
        console.error("Error adding property:", err);
        setError("Error al crear la propiedad. Intenta de nuevo.");
        throw err;
      }
    },
    []
  );

  const reportReview = useCallback(
    async (propertyId: string, reviewId: string) => {
      setError(null);
      try {
        // Try to sync to remote if available
        if (isRemoteBackendAvailable()) {
          await reportReviewRemote(propertyId, reviewId);
        }

        // Update local state
        setProperties((current) =>
          current.map((prop) => {
            if (prop.id !== propertyId) return prop;

            return {
              ...prop,
              reviews: prop.reviews.map((review) =>
                review.id === reviewId
                  ? {
                      ...review,
                      moderationStatus: "reported",
                      reportCount: (review.reportCount ?? 0) + 1,
                    }
                  : review
              ),
            };
          })
        );
      } catch (err) {
        console.error("Error reporting review:", err);
        setError("Error al reportar la reseña. Intenta de nuevo.");
        throw err;
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    if (!isRemoteBackendAvailable()) return;

    setIsLoading(true);
    setError(null);
    try {
      const remoteProperties = await fetchProperties();
      const normalized = remoteProperties.map(normalizeProperty);
      setProperties(normalized);
      saveToStorage(PROPERTIES_STORAGE_KEY, normalized);
    } catch (err) {
      console.error("Error refreshing properties:", err);
      setError("Error al actualizar los datos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    properties,
    selectedProperty,
    isLoading,
    error,
    selectProperty,
    clearSelection,
    addReview,
    addProperty,
    reportReview,
    refresh,
  };
}
