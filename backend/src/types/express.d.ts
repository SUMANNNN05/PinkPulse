// Augments Express's Request type globally so that once auth.middleware.ts
// attaches the decoded JWT payload as req.user (Milestone 2), every
// controller gets type-checked, autocompleted access to it — no `as any`
// casts scattered around the codebase.
export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "CLINICIAN" | "ADMIN";
      };
    }
  }
}
