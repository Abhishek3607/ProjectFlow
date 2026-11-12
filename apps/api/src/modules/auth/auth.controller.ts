import { Request, Response } from 'express';
import { RegisterRequestSchema, LoginRequestSchema } from '@projectflow/contracts';
import { prisma } from '../../lib/prisma';
import { hashPassword, comparePassword, generateToken } from '../../lib/auth';

export async function registerHandler(req: Request, res: Response) {
  const parseResult = RegisterRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: parseResult.error.flatten().fieldErrors,
      },
    });
  }

  const { name, email, password, workspaceName } = parseResult.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'An account with this email already exists',
        },
      });
    }

    const hashedPassword = await hashPassword(password);
    const slugBase = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;

    // Create User, Workspace, and Owner WorkspaceMember atomically
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
          ownerId: user.id,
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'OWNER',
        },
      });

      // Default Kanban Workflow States
      await tx.workflowState.createMany({
        data: [
          { workspaceId: workspace.id, name: 'Backlog', category: 'BACKLOG', position: 0 },
          { workspaceId: workspace.id, name: 'Todo', category: 'UNSTARTED', position: 1 },
          { workspaceId: workspace.id, name: 'In Progress', category: 'STARTED', position: 2 },
          { workspaceId: workspace.id, name: 'Done', category: 'COMPLETED', position: 3 },
          { workspaceId: workspace.id, name: 'Canceled', category: 'CANCELED', position: 4 },
        ],
      });

      return { user, workspace };
    });

    const token = generateToken({ userId: result.user.id, email: result.user.email });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        workspace: {
          id: result.workspace.id,
          name: result.workspace.name,
          slug: result.workspace.slug,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('[AUTH_REGISTER_ERROR]', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Registration failed due to a server error',
      },
    });
  }
}

export async function loginHandler(req: Request, res: Response) {
  const parseResult = LoginRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email or password format',
        details: parseResult.error.flatten().fieldErrors,
      },
    });
  }

  const { email, password } = parseResult.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const defaultMembership = user.memberships[0];

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        workspace: defaultMembership
          ? {
              id: defaultMembership.workspace.id,
              name: defaultMembership.workspace.name,
              slug: defaultMembership.workspace.slug,
              role: defaultMembership.role,
            }
          : null,
        token,
      },
    });
  } catch (error: any) {
    console.error('[AUTH_LOGIN_ERROR]', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Login failed due to a server error',
      },
    });
  }
}