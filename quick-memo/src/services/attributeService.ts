import api from "@/lib/api";

export interface AttributeValue {
  attribute_value_id: number;
  attribute_def_id: number;
  value: string;
}

export interface AttributeDefinition {
  attribute_def_id: number;
  user_id: number;
  name: string;
  values: AttributeValue[] | null;
}

export const attributeService = {
  getAll: async () => {
    const response = await api.get<{
      success: boolean;
      data: AttributeDefinition[];
    }>("/attributes");
    return response.data;
  },

  create: async (name: string) => {
    const response = await api.post<{
      success: boolean;
      data: AttributeDefinition;
    }>("/attributes", { name });
    return response.data;
  },

  update: async (id: number, name: string) => {
    const response = await api.put<{
      success: boolean;
      data: AttributeDefinition;
    }>(`/attributes/${id}`, { name });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/attributes/${id}`
    );
    return response.data;
  },

  createValue: async (attribute_def_id: number, value: string) => {
    const response = await api.post<{ success: boolean; data: AttributeValue }>(
      "/attributes/values",
      { attribute_def_id, value }
    );
    return response.data;
  },

  deleteValue: async (id: number) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/attributes/values/${id}`
    );
    return response.data;
  },
};
