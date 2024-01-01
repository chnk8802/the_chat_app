import express from 'express'
import auth from '../middlewares/authMiddleware.js'
import chatControllers from '../controllers/chatControllers.js';

const router = express.Router();
router.route('/').post(auth, chatControllers.accessChat);
router.route('/').get(auth, chatControllers.fetchChat);
router.route('/group').post(auth, chatControllers.createGroup);
router.route('/renamegroup').put(auth, chatControllers.renameGroup);
router.route('/groupadd').put(auth, chatControllers.addTogroup);
router.route('/groupremove').put(auth, chatControllers.removeFromGroup);


export default router