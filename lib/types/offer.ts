export type Offer = {
  id: string;
  name: string;
  image: string;
  link: string | null;
  source_link: string;
  price: number;
  old_price: number;
  coupon: boolean;
  coupon_price: number;
  price_with_coupon: number;
  seller: string;
  rating: number;
  rating_count: number;
  expiration: string | null;
  extracted_at: string | null;
  dispatched_at?: string | null;
};
