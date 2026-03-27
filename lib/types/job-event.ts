export type JobEventType =
  | "scrape_started"
  | "scrape_completed"
  | "scrape_failed"
  | "screenshot_saved"
  | "validation_failed"
  | "affiliate_link_started"
  | "affiliate_link_completed"
  | "offer_saved"
  | "offer_save_failed"
  | "completed"
  | "short_link_resolve_started"
  | "short_link_resolve_completed"
  | "short_link_resolve_failed";

export type JobEvent = {
  id: string;
  occurred_at: string;
  type: JobEventType;
  details?: string;
};
