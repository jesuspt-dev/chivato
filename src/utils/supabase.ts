import { createClient } from "@supabase/supabase-js";
import { Property, Review } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const useRemoteBackend = import.meta.env.VITE_USE_REMOTE_BACKEND === "true";

// Initialize Supabase client only if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isRemoteBackendAvailable = () => {
  return useRemoteBackend && supabase !== null;
};

// User session management
export async function getCurrentUser() {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured");
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

export async function signOut() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
  }
}

// Properties API
export async function fetchProperties(): Promise<Property[]> {
  if (!supabase) throw new Error("Supabase not configured");

  try {
    const { data, error } = await supabase
      .from("properties")
      .select(`
        *,
        reviews: reviews(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
}

export async function createProperty(property: Omit<Property, "id" | "reviews">) {
  if (!supabase) throw new Error("Supabase not configured");

  try {
    const { data, error } = await supabase
      .from("properties")
      .insert([
        {
          address: property.address,
          flat: property.flat,
          district: property.district,
          city: property.city,
          coords: property.coords,
          overall_rating: property.overallRating,
          ratings_breakdown: property.ratingsBreakdown,
          alerts: property.alerts,
          gallery: property.gallery,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
}

export async function updateProperty(id: string, updates: Partial<Property>) {
  if (!supabase) throw new Error("Supabase not configured");

  try {
    const { data, error } = await supabase
      .from("properties")
      .update({
        address: updates.address,
        flat: updates.flat,
        district: updates.district,
        city: updates.city,
        coords: updates.coords,
        overall_rating: updates.overallRating,
        ratings_breakdown: updates.ratingsBreakdown,
        alerts: updates.alerts,
        gallery: updates.gallery,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
}

// Reviews API
export async function createReview(
  propertyId: string,
  review: Omit<Review, "id" | "propertyId" | "propertyAddress" | "propertyDistrict">
) {
  if (!supabase) throw new Error("Supabase not configured");

  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          property_id: propertyId,
          author: review.author,
          rating: review.rating,
          live_period: review.livePeriod,
          comments: review.comments,
          tags: review.tags,
          verified: review.verified,
          verification_status: review.verificationStatus || "unverified",
          moderation_status: review.moderationStatus || "pending",
          date: review.date,
          photos: review.photos,
          ratings_breakdown: review.ratingsBreakdown,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}

export async function reportReview(propertyId: string, reviewId: string) {
  if (!supabase) throw new Error("Supabase not configured");

  try {
    const { data, error } = await supabase.rpc("report_review", {
      p_property_id: propertyId,
      p_review_id: reviewId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error reporting review:", error);
    throw error;
  }
}

// Photo uploads
export async function uploadReviewPhoto(
  propertyId: string,
  reviewId: string,
  file: File
): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");

  try {
    const timestamp = Date.now();
    const fileName = `${propertyId}/${reviewId}/${timestamp}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("review-photos")
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from("review-photos")
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
}

// Favorites management (stored per user)
export async function fetchUserFavorites(): Promise<string[]> {
  if (!supabase) return [];

  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("user_favorites")
      .select("property_id")
      .eq("user_id", user.id);

    if (error) throw error;
    return data?.map((fav) => fav.property_id) || [];
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
}

export async function toggleFavorite(propertyId: string, isFavorite: boolean) {
  if (!supabase) throw new Error("Supabase not configured");

  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    if (isFavorite) {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("user_favorites")
        .insert([
          {
            user_id: user.id,
            property_id: propertyId,
          },
        ]);

      if (error) throw error;
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}
