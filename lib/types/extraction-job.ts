export type ExtractionJobStatus = "extracting" | "done" | "error";

export type ExtractionJob = {
  status: ExtractionJobStatus;
  slug: string | null;
  offer: Record<string, unknown> | null;
  error: string | null;
  createdAt: Date;
};
