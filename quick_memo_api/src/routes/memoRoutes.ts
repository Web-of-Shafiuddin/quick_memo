import { Router } from 'express';
import {
    getAllMemos,
    getMemoById,
    createMemo,
    updateMemo,
    deleteMemo,
} from '../controllers/memoController.js';

const router = Router();

router.get('/', getAllMemos);
router.get('/:id', getMemoById);
router.post('/', createMemo);
router.put('/:id', updateMemo);
router.delete('/:id', deleteMemo);

export default router;
