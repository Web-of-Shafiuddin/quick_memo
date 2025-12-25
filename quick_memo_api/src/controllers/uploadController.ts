import { Request, Response } from 'express';
import cloudinary, { getProductUploadOptions, getShopLogoUploadOptions } from '../config/cloudinary.js';

// Upload product image
export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    // Convert buffer to base64 data URI for Cloudinary
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary with optimized settings
    const result = await cloudinary.uploader.upload(base64Image, {
      ...getProductUploadOptions(userId),
      public_id: `product_${Date.now()}`,
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      }
    });
  } catch (error: any) {
    console.error('Error uploading product image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    });
  }
};

// Upload shop logo
export const uploadShopLogo = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    // Convert buffer to base64 data URI for Cloudinary
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary with optimized settings
    const result = await cloudinary.uploader.upload(base64Image, {
      ...getShopLogoUploadOptions(userId),
      public_id: `logo_${Date.now()}`,
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      }
    });
  } catch (error: any) {
    console.error('Error uploading shop logo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload logo'
    });
  }
};

// Delete image from Cloudinary
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { public_id } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!public_id) {
      return res.status(400).json({ success: false, error: 'No public_id provided' });
    }

    // Verify the image belongs to this user (check folder path with exact match)
    const userFolderPattern = new RegExp(`^quickmemo/users/${userId}/`);
    if (!userFolderPattern.test(public_id)) {
      return res.status(403).json({ success: false, error: 'You can only delete your own images' });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Image not found or already deleted' });
    }
  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete image'
    });
  }
};
