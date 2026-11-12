import { Router } from 'express';
import { requireAuth, requireWorkspaceAccess } from '../../middleware/auth.middleware';
import {
  getWorkspaceOverview,
  createProjectHandler,
  createIssueHandler,
  updateIssueStatusHandler,
  getIssueDetailHandler,
  updateIssueHandler,
  deleteIssueHandler,
  addCommentHandler,
} from './workspace.controller';

const router = Router();

router.use('/:workspaceSlug', requireAuth, requireWorkspaceAccess);

router.get('/:workspaceSlug/overview', getWorkspaceOverview);
router.post('/:workspaceSlug/projects', createProjectHandler);
router.post('/:workspaceSlug/issues', createIssueHandler);
router.patch('/:workspaceSlug/issues/:issueId/status', updateIssueStatusHandler);

// Milestone 3: Issue Detail, Edit, Delete & Comments
router.get('/:workspaceSlug/issues/:issueId', getIssueDetailHandler);
router.patch('/:workspaceSlug/issues/:issueId', updateIssueHandler);
router.delete('/:workspaceSlug/issues/:issueId', deleteIssueHandler);
router.post('/:workspaceSlug/issues/:issueId/comments', addCommentHandler);

export default router;