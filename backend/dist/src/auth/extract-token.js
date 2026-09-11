"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_COOKIE_NAME = void 0;
exports.extractToken = extractToken;
exports.SESSION_COOKIE_NAME = "session_token";
function extractToken(req) {
    const cookieToken = req.cookies?.[exports.SESSION_COOKIE_NAME];
    if (cookieToken)
        return cookieToken;
    const authHeader = req.headers["authorization"];
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice("Bearer ".length);
    }
    return null;
}
//# sourceMappingURL=extract-token.js.map