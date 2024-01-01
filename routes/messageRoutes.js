import express from 'express';
import auth from '../middlewares/authMiddleware.js';
import messageControllers from '../controllers/messageControllers.js';

const router = express.Router();

router.route('/').post(auth, messageControllers.sendMessage);
router.route('/:chatId').get(auth, messageControllers.allMessages);

export default router