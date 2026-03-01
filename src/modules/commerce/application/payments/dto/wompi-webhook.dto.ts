export interface WompiWebhookPayload {
  event?: string;
  sent_at?: string;
  timestamp?: number;
  signature?: {
    properties?: string[];
    checksum?: string;
  };
  data?: {
    transaction?: {
      id?: string;
      status?: string;
      status_message?: string;
      reference?: string;
      amount_in_cents?: number;
      currency?: string;
    };
  };
}
