import { z } from 'zod';
export declare const RegisterRequestSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    workspaceName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    workspaceName: string;
}, {
    name: string;
    email: string;
    password: string;
    workspaceName: string;
}>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
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
//# sourceMappingURL=index.d.ts.map