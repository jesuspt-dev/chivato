import { Property, Review } from "../types";

const roundOne = (value: number) => Number(value.toFixed(1));

function avg(values: number[], fallback = 0): number {
  if (values.length === 0) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function recalculatePropertyScores(property: Property): Property {
  const reviewsWithBreakdown = property.reviews.filter((review) => review.ratingsBreakdown);

  if (reviewsWithBreakdown.length === 0) {
    return {
      ...property,
      overallRating: 0,
      ratingsBreakdown: {
        casero: 0,
        mantenimiento: 0,
        vecindad: 0
      }
    };
  }

  const ratingsBreakdown = {
    casero: roundOne(avg(reviewsWithBreakdown.map((review) => review.ratingsBreakdown!.casero))),
    mantenimiento: roundOne(avg(reviewsWithBreakdown.map((review) => review.ratingsBreakdown!.mantenimiento))),
    vecindad: roundOne(avg(reviewsWithBreakdown.map((review) => review.ratingsBreakdown!.vecindad)))
  };

  return {
    ...property,
    ratingsBreakdown,
    overallRating: roundOne(avg([
      ratingsBreakdown.casero,
      ratingsBreakdown.mantenimiento,
      ratingsBreakdown.vecindad
    ]))
  };
}

export function normalizeProperty(property: Property): Property {
  return recalculatePropertyScores({
    ...property,
    reviews: property.reviews.map((review): Review => ({
      ...review,
      verified: review.verified ?? review.verificationStatus === "verified",
      verificationStatus: review.verificationStatus ?? (review.verified ? "verified" : "unverified"),
      moderationStatus: review.moderationStatus ?? "published",
      reportCount: review.reportCount ?? 0,
      propertyId: review.propertyId ?? property.id,
      propertyAddress: review.propertyAddress ?? property.address,
      propertyDistrict: review.propertyDistrict ?? property.district
    }))
  });
}
