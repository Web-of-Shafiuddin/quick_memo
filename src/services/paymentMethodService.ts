import api from "@/lib/api";

export interface PaymentMethod {
  payment_method_id: number;
  name: string;
  is_active: boolean;
  user_id: number | null;
  is_system_default: boolean;
  created_at: string;
  updated_at: string;
}

// Get all payment methods (system defaults + user custom)
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get("/payment-methods");
  return response.data.data;
};

// Get active payment methods only (for dropdowns)
export const getActivePaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get("/payment-methods/active");
  return response.data.data;
};

// Create a new custom payment method
export const createPaymentMethod = async (name: string): Promise<PaymentMethod> => {
  const response = await api.post("/payment-methods", { name });
  return response.data.data;
};

// Update a payment method
export const updatePaymentMethod = async (
  id: number,
  data: { name?: string; is_active?: boolean }
): Promise<PaymentMethod> => {
  const response = await api.put(`/payment-methods/${id}`, data);
  return response.data.data;
};

// Toggle payment method active status
export const togglePaymentMethodStatus = async (id: number): Promise<PaymentMethod> => {
  const response = await api.patch(`/payment-methods/${id}/toggle`);
  return response.data.data;
};

// Delete a payment method
export const deletePaymentMethod = async (id: number): Promise<void> => {
  await api.delete(`/payment-methods/${id}`);
};

export default {
  getPaymentMethods,
  getActivePaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethodStatus,
  deletePaymentMethod,
};
