export function validateBody(requiredFields) {
    return function (req, res, next) {

        const missingFields = requiredFields.filter((field) => {
            return !req.body[field] || req.body[field] === "";
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(", ")}`
            });
        }

        next();
    };
}



  

