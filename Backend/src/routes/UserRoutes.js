import express from 'express';
import { getUserDetails, loginUser, logout, refreshAccessToken } from '../controllers/UserController.js';
const router=express.Router();

router.post("/login",loginUser);
router.get("/getUserDetails",getUserDetails);
router.post("/logout",logout);
router.get("/refresh",refreshAccessToken)

export default router;