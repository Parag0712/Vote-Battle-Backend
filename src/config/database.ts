import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient({
    log: [],
    errorFormat: "pretty",
});
export default prisma;
