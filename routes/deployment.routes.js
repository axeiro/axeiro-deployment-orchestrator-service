import express from "express";
import validateDeploymentPayload from "../utils/validatePayload.js";
import { deploy } from "../controllers/deployment.controller.js";
import requireUserAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/deploy' , requireUserAuth ,  deploy)

export default router;
