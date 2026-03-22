export type Offer = {
  id: string;
  name: string;
  image: string;
  link: string;
  price: number;
  old_price: number;
  coupon: boolean;
  coupon_price: number;
  price_with_coupon: number;
  seller: string;
  rating: string;
  time_limited: boolean;
  expiration_datetime: string; // ISO string (serialized from Firestore Timestamp)
  scrapped_at: string;
};
