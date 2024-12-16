import { z } from "zod";
export const forgetPasswordSchema = z.object({
    email: z.string({ message: "Email is required" }).email()
});
export const resetPasswordSchema = z
    .object({
    email: z
        .string({ message: "Email is required." })
        .email({ message: "Please enter correct email" }),
    token: z.string({ message: "Please make sure you are using correct url." }),
    password: z
        .string({ message: "Password is required" })
        .min(6, { message: "Password must be 3 characters long" }),
    confirm_password: z.string({ message: "Confirm Password is required" }),
})
    .refine((data) => data.password === data.confirm_password, {
    message: "Confirm password not matched",
    path: ["confirm_password"],
});
