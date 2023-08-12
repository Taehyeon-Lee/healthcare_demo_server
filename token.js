import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import {json} from "express";
dotenv.config();

let refreshTokens = [];


/**
 * This function is used to generate an access token
 * @param user
 * @returns {*}
 */
// accessTokens
export function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "10m"});
}

/**
 * This function is used to generate a refresh token
 * @param user
 * @returns {*}
 */
// refreshTokens
export function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"});
    refreshTokens.push(refreshToken);
    return refreshToken;
}


/**
 * This function is used to update the tokens
 * @param user
 * @param oldToken
 * @returns {string}
 */
export function updateTokens(user, oldToken) {
    // remove old refresh token from the array
    refreshTokens = refreshTokens.filter(token => token !== oldToken);

    // regenerate new refresh and access tokens
    const newRefreshToken = generateRefreshToken(user);
    const newAccessToken = generateAccessToken(user);

    const tokenObject = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }

    const tokensJson = JSON.stringify(tokenObject);
    return tokensJson;
}

/**
 * This function is used to verify the token
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export function verifyToken (req, res, next) {
    // in the request header, the token is stored in the "x-access-token" field
    const accessToken = req.body.accessToken || req.headers["x-access-token"];
    const refreshToken = req.body.refreshToken || req.headers["x-refresh-token"];

    if (!accessToken && !refreshToken) {
        return res.send("Tokens are required for authentication").status(401);
    }

    // Verify refresh token first
    try{
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("Refresh token is valid");

        // if refresh token is valid, verify access token
        try{
            const accessDecoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            req.user = accessDecoded;
            return next();
        } catch(accessError){
            if (accessError.name === "TokenExpiredError") {
                // Access token has expired, return an error response
                return res.status(401).send("Access token has expired. Please log in again.");
            } else {
                // Some other error occurred with the access token
                return res.status(401).send("Invalid access token");
            }
        } // end of verify access token catch
    } catch(err){
        return res.status(401).send("Invalid refresh Token. Please login again");
    } // end of verify refresh token catch
};


export { refreshTokens };