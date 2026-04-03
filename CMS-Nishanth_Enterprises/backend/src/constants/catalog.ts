/** Allowed product classification values (DB allows NULL in addition). */
export const PRODUCT_CLASSIFICATIONS = ["inhouse", "branded", "hot", "cold"] as const;

export type ProductClassification = (typeof PRODUCT_CLASSIFICATIONS)[number];

export const PRODUCT_CLASSIFICATION_SET = new Set<string>(PRODUCT_CLASSIFICATIONS);
