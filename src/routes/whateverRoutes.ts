import express from 'express';
import { getTest } from '../controllers/whateverController.js';

const router = express.Router();

router.route('/test').get(getTest);

export default router;