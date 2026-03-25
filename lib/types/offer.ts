export type Offer = {
  id: string;
  name: string;
  image: string;
  link: string | null;
  product_link: string;
  price: number;
  old_price: number;
  coupon: boolean;
  coupon_description: string;
  coupon_price: number;
  price_with_coupon: number;
  seller: string;
  rating: string;
  time_limited: boolean;
  expiration_datetime: string; // ISO string (serialized from Firestore Timestamp)
  trigger: "manual" | "automatic" | null;
  scrapped_at: string;
  dispatched_at: string | null;
};
