import express from 'express';
import { getTest } from '../controllers/testController.js';

const router = express.Router();

router.route('/test').get(getTest);

export default router;