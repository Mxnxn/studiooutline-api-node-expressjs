const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./Models/User");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const options = {
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
};
mongoose
    .connect(process.env.DB_URL, options)
    .then(() => {
        console.log(`Connected Mongodb!`);
    })
    .catch((err) => {
        console.log(`Error connecting Mongodb :`, err.message);
    });

app.post("/login", async (req, res) => {
    try {
        if (!req.body.username || !req.body.password) {
            return res.json({ code: 400, msg: "Bad Request", data: "" });
        }
        const mUser = await User.findOne({ username: req.body.username, password: req.body.password });
        if (mUser) {
            const token = jwt.sign({ username: req.body.username }, process.env.JWT_KEY, { expiresIn: 60 });
            return res.json({
                code: 200,
                data: token,
                msg: "Successfully Logged In.",
            });
        }
        return res.json({
            code: 403,
            data: "",
            msg: "Account Does'nt Exists",
        });
    } catch (error) {
        return res.json({ code: 500 });
    }
});

// app.post("/register", async (req, res) => {
//     if (!req.body.username || !req.body.password) {
//         return res.json({ code: 400, msg: "Bad Request", data: "" });
//     }
//     const mUser = await new User({ username: req.body.username, password: req.body.password });
//     mUser.save();
//     return res.json({
//         code: 200,
//         msg: "Successfully Registered!",
//     });
// });

app.post("/gentoken", async (req, res) => {
    try {
        if (!req.body.username || !req.body.password) {
            return res.json({ code: 400, msg: "Bad Request", data: "" });
        }
        const mUser = await User.findOne({ username: req.body.username, password: req.body.password });
        if (mUser) {
            const token = jwt.sign({ username: req.body.username }, process.env.JWT_KEY, { expiresIn: 180 });
            return res.json({
                code: 200,
                data: token,
                msg: "Successfully Logged In.",
            });
        } else {
            return res.json({
                code: 200,
                data: "",
                msg: "Can't Generate Token",
            });
        }
    } catch (error) {
        return res.json({ code: 500 });
    }
});

app.post("/verify", async (req, res) => {
    try {
        const result = jwt.verify(req.body.token, process.env.JWT_KEY);
        return res.json({ code: 200, data: result, msg: "Successfully Verified" });
    } catch (error) {
        return res.json({ code: 401, data: error.message, msg: "Unauthorized/Expired!" });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`StudioOutline has started on ${process.env.PORT}`);
});
