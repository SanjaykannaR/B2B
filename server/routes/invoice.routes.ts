import { Router } from 'express';
import {
  listInvoices,
  getMyInvoices,
  getOne,
  generateInvoice,
  markPaid,
  getStats,
} from '../controllers/invoice.controller';
import { auth } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(auth);

router.get('/', roleGuard('admin', 'executive'), listInvoices);
router.get('/my', getMyInvoices);
router.get('/stats', roleGuard('admin', 'executive'), getStats);
router.get('/:id', getOne);

router.post('/generate/:manifestId', roleGuard('admin'), generateInvoice);
router.patch('/:id/pay', roleGuard('admin'), markPaid);

export default router;
