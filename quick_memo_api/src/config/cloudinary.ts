import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Get upload options for product images (organized by user)
export const getProductUploadOptions = (userId: number) => ({
  folder: `quickmemo/users/${userId}/products`,
  format: 'webp',
  transformation: [
    {
      width: 600,
      height: 600,
      crop: 'limit',
      quality: 60,
      fetch_format: 'webp',
    }
  ],
  resource_type: 'image' as const,
});

// Get upload options for shop logos (organized by user)
export const getShopLogoUploadOptions = (userId: number) => ({
  folder: `quickmemo/users/${userId}/logo`,
  format: 'webp',
  transformation: [
    {
      width: 400,
      height: 400,
      crop: 'limit',
      quality: 70,
      fetch_format: 'webp',
    }
  ],
  resource_type: 'image' as const,
});

// Get upload options for invoice/memo images (organized by user)
export const getInvoiceUploadOptions = (userId: number) => ({
  folder: `quickmemo/users/${userId}/invoices`,
  format: 'webp',
  transformation: [
    {
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 70,
      fetch_format: 'webp',
    }
  ],
  resource_type: 'image' as const,
});
