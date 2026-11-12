"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginRequestSchema = exports.RegisterRequestSchema = void 0;
const zod_1 = require("zod");
// ==========================================
// AUTHENTICATION SCHEMAS
// ==========================================
exports.RegisterRequestSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
    email: zod_1.z.string().trim().email('Invalid email address').toLowerCase(),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    workspaceName: zod_1.z
        .string()
        .trim()
        .min(2, 'Workspace name must be at least 2 characters')
        .max(50),
});
exports.LoginRequestSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Invalid email address').toLowerCase(),
    password: zod_1.z.string().min(1, 'Password is required'),
});
//# sourceMappingURL=index.js.map