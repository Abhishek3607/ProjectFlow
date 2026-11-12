import { z } from 'zod';

// ==========================================
// AUTHENTICATION SCHEMAS
// ==========================================

export const RegisterRequestSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  workspaceName: z
    .string()
    .trim()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(50),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ==========================================
// SHARED RESPONSE TYPES
// ==========================================

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  defaultWorkspaceId?: string;
  defaultWorkspaceSlug?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// ==========================================
// PROJECT & ISSUE SCHEMAS (MILESTONE 2)
// ==========================================

export const CreateProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(50),
  identifier: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Key must be 2-5 characters')
    .max(5, 'Key must be 2-5 characters')
    .regex(/^[A-Z]+$/, 'Key must contain only uppercase letters (e.g. ENG)'),
  description: z.string().trim().max(500).optional(),
});

export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;

export const CreateIssueSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  title: z.string().trim().min(2, 'Title is required').max(200),
  description: z.string().trim().max(5000).optional(),
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  statusId: z.string().uuid('Invalid status ID').optional(),
});

export type CreateIssueRequest = z.infer<typeof CreateIssueSchema>;

export const UpdateIssueStatusSchema = z.object({
  statusId: z.string().uuid('Invalid status ID'),
});

export type UpdateIssueStatusRequest = z.infer<typeof UpdateIssueStatusSchema>;

// ==========================================
// ISSUE DETAIL & COMMENTS SCHEMAS (MILESTONE 3)
// ==========================================

export const UpdateIssueSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  statusId: z.string().uuid('Invalid status ID').optional(),
});

export type UpdateIssueRequest = z.infer<typeof UpdateIssueSchema>;

export const CreateCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
});

export type CreateCommentRequest = z.infer<typeof CreateCommentSchema>;