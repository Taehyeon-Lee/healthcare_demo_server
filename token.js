import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import {json} from "express";
dotenv.config();

let refreshTokens = [];

// TODO: extend expiration time for token
export function generateToken(user) {
    return jwt.sign(user, process.env.TOKEN_SECRET, {expiresIn: "10m"});
}

// accessTokens
export function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "10m"});
}

// refreshTokens
export function generateRefreshToken(user) {
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "20m"});
    refreshTokens.push(refreshToken);
    return refreshToken;
}

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

export function verifyToken (req, res, next) {
    const token =
        req.body.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

export function validateToken(req, res, next) {
    //get token from request header
    const authHeader = req.headers["authorization"];
    //the request header contains the token "Bearer <token>", split the string and use the second value in the split array.
    const token = authHeader.split(" ")[1];

    if (token == null) res.sendStatus(400).send("Token not present")
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            res.status(403).send("Token invalid")
        }
        else {
            req.u_name = user
            next(); //proceed to the next action in the calling function
        }
    }) //end of jwt.verify()
}; // end of validateToken

export { refreshTokens };