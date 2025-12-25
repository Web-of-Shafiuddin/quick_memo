import { Router } from 'express';
import multer from 'multer';
import { uploadProductImage, uploadShopLogo, deleteImage } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkImageUploadPermission } from '../middleware/subscriptionLimits.js';

const router = Router();

// Configure multer for memory storage (we'll upload to Cloudinary directly)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size (Cloudinary will optimize it)
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authMiddleware);

// Product image upload (requires image upload permission from subscription)
router.post('/product', checkImageUploadPermission, upload.single('image'), uploadProductImage);

// Shop logo upload (requires image upload permission from subscription)
router.post('/logo', checkImageUploadPermission, upload.single('image'), uploadShopLogo);

// Delete image
router.delete('/', deleteImage);

export default router;
