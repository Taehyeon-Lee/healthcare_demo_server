import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as db from "./database.js";
import {refreshTokens, generateToken, generateRefreshToken, generateAccessToken, updateTokens} from "./token.js";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json()); // for read and parse json in req.body
dotenv.config();


// Create a new user
app.post('/registerUser', async (req, res) => {
    const user = req.body.u_name;
    const hashedPassword = await bcrypt.hash(req.body.u_password,10);
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;

    // Check if user already exists in database
    try {
        const checkUser = await db.getUser(user);
        if(checkUser != undefined){
            console.log("User already exists");
            res.sendStatus(409); // 409 is conflict
        } else{
            console.log("Creating new user now");
            const newUser = await db.createUser(user, hashedPassword, firstName, lastName);

            // const accessToken = generateAccessToken({user: req.body.u_name});
            // const refreshToken = generateRefreshToken({user: req.body.u_name});
            // newUser.accessToken = accessToken;
            // newUser.refreshToken = refreshToken;

            const token = generateToken({user: req.body.u_name});
            newUser.token = token;

            res.send(newUser).status(201);
        }
    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }; // end of catch
}); // end of app.post create new user


// Login user
app.post('/login', async (req, res) =>{
    const user = req.body.u_name;
    const password =req.body.u_password;

    // Check if user exists in database
    try {
        const checkUser = await db.getUser(user);
        if(checkUser === undefined){
            console.log("User does not exist");
            res.sendStatus(404);
        } else{
            // get hashed password for the user
            const hashedPassword = checkUser.u_password;

            // compare the password entered by the user with the hashed password in the database
            if(await bcrypt.compare(password, hashedPassword)){
                console.log("User login info matches");

                // const accessToken = generateAccessToken({user: req.body.u_name});
                // const refreshToken = generateRefreshToken({user: req.body.u_name});
                // checkUser.accessToken = accessToken;
                // checkUser.refreshToken = refreshToken;
                // console.log(checkUser);

                const token = generateToken({user: req.body.u_name});
                checkUser.token = token;

                res.send(checkUser).status(200);
                // res.send(`Welcome back ${user}!`).status(200);
            } else{
                console.log("Incorrect password");
                res.sendStatus(401);
            } // end of bcrypt compare
        } // end of checking if user exists
    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }; // end of catch

}); // end of app.post login user






app.listen(3000, () => {
    console.log("Server is running on port 3000");
});



