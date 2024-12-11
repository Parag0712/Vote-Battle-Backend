import { z } from "zod"

export const registerSchema = z.object({
    name: z.string({ message: "Name is required" })
        .min(3, { message: "Name must be at least 3 characters" }),
    email: z.string({ message: "Email is required" })
        .email({ message: "please enter a valid email" }),
    password: z.string({ message: "Password is required" })
        .min(6, { message: "Password must be at least 6 characters" }),
    confirm_password: z.string({ message: "Confirm Password is required" }),
}).refine((data) => data.password === data.confirm_password, {
    message: "Confirm Password does not match",
    path: ["confirm_password"]
})


export const loginSchema = z.object({
    email: z
        .string({ message: "Email is required." })
        .email({ message: "Please enter correct email" }),
    password: z.string({ message: "Password is required" }),
});
