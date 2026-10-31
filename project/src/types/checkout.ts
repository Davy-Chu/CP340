export interface CheckoutSession {
  sessionId: string;
  paymentStatus: string;
  amountTotal: number | null;
  currency: string | null;
  customerEmail: string | null;
  items: {
    name: string;
    quantity: number;
    amountTotal: number;
  }[];
}
