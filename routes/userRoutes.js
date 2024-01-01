import express from "express";
import userControllers from "../controllers/userControllers.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();
router.route('/').post(userControllers.registerUser)
router.get('/', auth, userControllers.allUsers);
router.post('/login', userControllers.authUser);

export default router