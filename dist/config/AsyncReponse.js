export class ApiResponse {
    constructor(statusCode, data = null, message = "Success", errors = []) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.errors = errors; // Add errors as an optional parameter
    }
    static success(data, message = "Success", statusCode = 200) {
        return new ApiResponse(statusCode, data, message);
    }
    static created(data, message = "Resource created successfully", statusCode = 201) {
        return new ApiResponse(statusCode, data, message);
    }
    static error(message = "Something went wrong", statusCode = 500, errors = []) {
        return new ApiResponse(statusCode, null, message, errors);
    }
}
export class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    static badRequest(message = "Invalid request", errors = []) {
        return new ApiError(400, message, errors);
    }
    static unauthorized(message = "Unauthorized", errors = []) {
        return new ApiError(401, message, errors);
    }
    static forbidden(message = "Forbidden", errors = []) {
        return new ApiError(403, message, errors);
    }
    static notFound(message = "Resource not found", errors = []) {
        return new ApiError(404, message, errors);
    }
    static conflict(message = "Conflict", errors = []) {
        return new ApiError(409, message, errors);
    }
    static validationError(errors = []) {
        return new ApiError(422, "Validation failed", errors);
    }
    static tooManyRequests(message = "Too many requests", errors = []) {
        return new ApiError(429, message, errors);
    }
    static internalServerError(message = "Internal server error", errors = []) {
        return new ApiError(500, message, errors);
    }
}
