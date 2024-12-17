import { Request, Response, Router } from "express";
import { FileArray, UploadedFile } from "express-fileupload";
import { ZodError } from "zod";
import prisma from "../config/database.js";
import { formatError, imageValidator, removeImage, uploadImage } from "../helper.js";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { clashSchema } from "../validations/clashValidation.js";
const router = Router();

// get all clashes
router.get("/", authMiddleware,async (req: Request, res: Response) => {
    try {
        const clashes = await prisma.clash.findMany({
            where: {
                user_id: req.user?.id
            }
        })
        return res.json({ message: "Data Fetched", data: clashes });
    } catch (error) {
        console.log("The error is ", error);
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid Inputs", errors: errors });
        } else {
            res
                .status(500)
                .json({ error: "Something went wrong. Please try again!", data: error });
        }
    }
})

// create clash
router.post("/", authMiddleware,async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const payload = clashSchema.parse(body);

        // image upload
        if (req.files?.image) {
            const image: UploadedFile = req.files.image as UploadedFile;
            const validMsg = imageValidator(image?.size, image?.mimetype);
            if (validMsg) {
                return res.status(422).json({ errors: { image: validMsg } });
            }
            payload.image = uploadImage(image);
        } else {
            return res
                .status(422)
                .json({ errors: { image: "Image field is required." } });
        }

        await prisma.clash.create({
            data: {
                title: payload.title,
                description: payload?.description,
                image: payload?.image,
                user_id: req.user?.id!,
                expire_at: new Date(payload.expire_at),
            },
        })

        return res.json({ message: "Clash created successfully!" });
    } catch (error) {
        console.log("The error is ", error);
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid data", errors });
        } else {
            res
                .status(500)
                .json({ error: "Something went wrong.please try again!", data: error });
        }
    }
})

router.get("/:id", authMiddleware,async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const clash = await prisma.clash.findUnique({
            where: { id: Number(id) },
            include: {
                ClashItem: {
                    select: {
                        image: true,
                        id: true,
                        count: true,
                    },
                },
                ClashComments: {
                    select: {
                        id: true,
                        comment: true,
                        created_at: true,
                    },
                    orderBy: {
                        id: "desc",
                    },
                },
            },
        });
        return res.json({ message: "Data Fetched", data: clash });
    } catch (error) {
        console.log("The error is ", error);
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid Inputs", errors: errors });
        } else {
            res
                .status(500)
                .json({ error: "Something went wrong. Please try again!", data: error });
        }
    }
})

// delete clash
router.delete("/:id", authMiddleware,async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const clash = await prisma.clash.findUnique({
            select: { image: true, user_id: true },
            where: { id: Number(id) },
        });

        if (clash?.user_id !== req.user?.id) {
            return res.status(401).json({ message: "Un Authorized" });
        }
        if (clash?.image) removeImage(clash.image);
        const clashItems = await prisma.clashItem.findMany({
            select: {
                image: true,
            },
            where: {
                clash_id: Number(id),
            },
        });

        // * Remove Clash items images
        if (clashItems.length > 0) {
            clashItems.forEach((item: { image: string }) => {
                removeImage(item.image);
            });
        }

        await prisma.clash.delete({
            where: { id: Number(id) },
        });


        return res.json({ message: "Clash Deleted successfully!" });

    } catch (error) {
        console.log("The error is ", error);
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid Inputs", errors: errors });
        } else {
            res
                .status(500)
                .json({ error: "Something went wrong. Please try again!", data: error });
        }
    }
})

// put
router.put("/:id", authMiddleware,async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const payload = clashSchema.parse(body);
        if (req.files?.image) {
            const image: UploadedFile = req.files.image as UploadedFile;
            const validMsg = imageValidator(image?.size, image?.mimetype);
            if (validMsg) {
                return res.status(422).json({ errors: { image: validMsg } });
            }

            // * Delete Old Image
            const clash = await prisma.clash.findUnique({
                select: { id: true, image: true },
                where: { id: Number(id) },
            });
            if (clash?.image) removeImage(clash?.image);
            payload.image = uploadImage(image);
        }
        await prisma.clash.update({
            data: {
                ...payload,
                expire_at: new Date(payload.expire_at),
            },
            where: { id: Number(id) },
        });
        return res.json({ message: "Clash updated successfully!" });
    } catch (error) {
        console.log("The error is ", error);
        if (error instanceof ZodError) {
            const errors = formatError(error);
            res.status(422).json({ message: "Invalid Inputs", errors: errors });
        } else {
            res
                .status(500)
                .json({ error: "Something went wrong. Please try again!", data: error });
        }
    }
})

// ** clash item
router.post("/items", authMiddleware, authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const files: FileArray | null = req.files || null;
        let imgErros: Array<string> = [];
        const images = files?.["images[]"] as UploadedFile[];

        if (images.length >= 2) {
            // * Check validation
            images.map((img) => {
                const validMsg = imageValidator(img?.size, img?.mimetype);
                if (validMsg) {
                    imgErros.push(validMsg);
                }
            });
            if (imgErros.length > 0) {
                return res.status(422).json({ errors: imgErros });
            }

            let uploadedImages: string[] = [];
            images.map((img) => {
                uploadedImages.push(uploadImage(img));
            });

            uploadedImages.map(async (item:string) => {
                await prisma.clashItem.create({
                    data: {
                        image: item,
                        clash_id: Number(id),
                    },
                });
            });
            return res.json({ message: "Clash Items updated successfully!" });
        }
        return res
            .status(404)
            .json({ message: "Please select at least 2 images for clashing." });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Something went wrong.please try again" });
    }
})

export default router;
