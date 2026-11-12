import { Router } from 'express';
import { requireAuth, requireWorkspaceAccess } from '../../middleware/auth.middleware';
import {
  getWorkspaceOverview,
  createProjectHandler,
  createIssueHandler,
  updateIssueStatusHandler,
} from './workspace.controller';

const router = Router();

router.use('/:workspaceSlug', requireAuth, requireWorkspaceAccess);

router.get('/:workspaceSlug/overview', getWorkspaceOverview);
router.post('/:workspaceSlug/projects', createProjectHandler);
router.post('/:workspaceSlug/issues', createIssueHandler);
router.patch('/:workspaceSlug/issues/:issueId/status', updateIssueStatusHandler);

export default router;