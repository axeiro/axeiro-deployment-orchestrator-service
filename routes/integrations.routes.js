import express from "express";
import {
  getGithubRepos,
  getRepoPackageJson,
  saveIntegration,
} from "../controllers/deployment.controller.js";
import requireInternalAuth from "../middlewares/requireUserAuth.js";
import requireUserAuth from '../middlewares/authMiddleware.js'
const integrationsRouter = express.Router();

integrationsRouter.post(
    "/integrations/github",
    requireInternalAuth,
    saveIntegration
)

integrationsRouter.get(
  "/integrations/github/repos",
  requireUserAuth,
  getGithubRepos
);

integrationsRouter.get(
  "/integrations/github/repos/:username/:repo/package-json",
  requireUserAuth,
  getRepoPackageJson
);

export default integrationsRouter;
