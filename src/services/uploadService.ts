import api from '@/lib/api';

export interface UploadResponse {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const uploadService = {
  // Upload product image
  uploadProductImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<{ success: boolean; data: UploadResponse }>(
      '/upload/product',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },

  // Upload shop logo
  uploadShopLogo: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<{ success: boolean; data: UploadResponse }>(
      '/upload/logo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },

  // Delete image
  deleteImage: async (public_id: string): Promise<void> => {
    await api.delete('/upload', { data: { public_id } });
  },

  // Upload verification images (NID/Trade License - multiple files)
  uploadVerificationImages: async (files: File[]): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await api.post<{ success: boolean; data: UploadResponse[] }>(
      '/upload/verification',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },
};
