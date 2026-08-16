const requireRole = (allowedRole) => {
    return (req, res, next) => {
        // Check if user object exists and role matches allowedRole
        if (!req.user || req.user.role !== allowedRole) {
            return res.status(403).json({
                status: 'FAIL',
                message: `Access Forbidden. Requires '${allowedRole}' privileges.`
            });
        }
        next(); // Role matches! Allow request through.
    };
};

module.exports = requireRole;