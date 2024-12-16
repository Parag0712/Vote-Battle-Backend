import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import path from "path";
import ejs from "ejs";
import moment from "moment";
import { supportedMimes } from "./config/filesystem.js";
import fs from "fs";
// format error for zod
export const formatError = (error) => {
    let errors = {};
    error.errors?.map((issue) => {
        errors[issue.path[0]] = issue.message;
    });
    return errors;
};
// generate random number
export const generateRandomNum = () => {
    return uuidv4();
};
// render email ejs
export const renderEmailEjs = async (fileName, payload) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const html = await ejs.renderFile(__dirname + `/views/emails/${fileName}.ejs`, payload);
    return html;
};
// check date hour difference
export const checkDateHourDifference = (date) => {
    const now = moment();
    const tokenSentAt = moment(date);
    const difference = moment.duration(now.diff(tokenSentAt));
    const hoursDiff = difference.asHours();
    return hoursDiff;
};
// --------------------IMAGE FUNCTIONS--------------------
// image validator
export const imageValidator = (size, mime) => {
    if (bytesToMb(size) > 2) {
        return "Image size must be less than 2 MB";
    }
    else if (!supportedMimes.includes(mime)) {
        return "Image must be type of png,jpg,jpeg,svg,webp,gif..";
    }
    return null;
};
// bytes to mb
export const bytesToMb = (bytes) => {
    return bytes / (1024 * 1024);
};
// remove image
export const removeImage = (imageName) => {
    const path = process.cwd() + "/public/images/" + imageName;
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
};
// upload image
export const uploadImage = (image) => {
    const imgExt = image?.name.split(".");
    const imageName = generateRandomNum() + "." + imgExt[imgExt.length - 1];
    const uploadPath = process.cwd() + "/public/images/" + imageName;
    image.mv(uploadPath, (err) => {
        if (err)
            throw err;
    });
    return imageName;
};
