const express = require("express");
const emailRouter = new express.Router();
const nodemailer = require("nodemailer");
const Hogan = require('hogan.js')
const fs = require('fs');


const template = fs.readFileSync('./views/email.hjs', 'utf-8')
const template2 = fs.readFileSync('./views/induction.hjs', 'utf-8') // Mail of induction Training
const template3 = fs.readFileSync('./views/exam.hjs', 'utf-8') // Mail of Assessment Credentials
const template4 = fs.readFileSync('./views/score.hjs', 'utf-8') // Mail of score to Manager
const template5 = fs.readFileSync('./views/scoreEmp.hjs', 'utf-8') // Mail of score to Manager

const compiledTemplate = Hogan.compile(template);
const compiledTemplate2 = Hogan.compile(template2);
const compiledTemplate3 = Hogan.compile(template3);
const compiledTemplate4 = Hogan.compile(template4); // score to manager
const compiledTemplate5 = Hogan.compile(template5);
// send mail Credentials
emailRouter.post("/user/register", (req, res) => {
    const { username } = req.body;
    const { confirmPassword } = req.body;
    const { email } = req.body;
    const { fullName } = req.body;

    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "learninganddevelopment@enfuse-solutions.com",
                pass: "foxjksrjbviqqvbv"
            }
        });

        const mailOptions = {
            from: 'learninganddevelopment@enfuse-solutions.com',
            to: email,
            subject: "Enfuse Learning & Development",
            html: compiledTemplate.render({ username, fullName, confirmPassword }),
            attachments: [
                {
                    filename: 'enfuse-logo.png',
                    path: './views/enfuse-logo.png',
                    cid: "enfuse-logo"
                },
                {
                    filename: 'welcome.jpg',
                    path: './views/welcome.jpg',
                    cid: "welcome"
                },
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error" + error)
            } else {
                console.log("Email sent:" + info.response);
                res.status(201).json({ status: 201, info })
            }
        })

    } catch (error) {
        console.loyg("Error" + error);
        res.status(401).json({ status: 401, error })
    }
});

//Induction Mail Link
emailRouter.post("/user/induction", (req, res) => {

    const { email } = req.body;
    const { fullName } = req.body;
    const { confirmPassword } = req.body;
    const {lastAddedTopic} = req.body;
    const {lastAddedPresenter} = req.body;

    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "learninganddevelopment@enfuse-solutions.com",
                pass: "foxjksrjbviqqvbv"
            }
        });

        const mailOptions = {
            from: 'learninganddevelopment@enfuse-solutions.com',
            to: email,
            subject: "Enfuse Learning & Development",
            html: compiledTemplate2.render({fullName,email,confirmPassword, lastAddedPresenter, lastAddedTopic}),
            attachments: [
                {
                    filename: 'enfuse-logo.png',
                    path: './views/enfuse-logo.png',
                    cid: "enfuse-logo"
                },
                {
                    filename: 'feedback.jpg',
                    path: './views/feedback.jpg',
                    cid: "feedback"
                },
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error" + error)
            } else {
                console.log("Email sent:" + info.response);
                res.status(201).json({ status: 201, info })
            }
        })

    } catch (error) {
        console.log("Error" + error);
        res.status(401).json({ status: 401, error })
    }
});

// Assessment link
emailRouter.post("/user/exam", (req, res) => {

    const { email } = req.body;
    const { fullName } = req.body;
    const { confirmPassword } = req.body;
    const {lastAddedTopic} = req.body;
    const {lastAddedPresenter} = req.body;

    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "learninganddevelopment@enfuse-solutions.com",
                pass: "foxjksrjbviqqvbv"
            }
        });

        const mailOptions = {
            from: 'learninganddevelopment@enfuse-solutions.com',
            to: email,
            subject: "Enfuse Learning & Development",
            html: compiledTemplate3.render({fullName,email,confirmPassword, lastAddedTopic, lastAddedPresenter}),
            attachments: [
                {
                    filename: 'enfuse-logo.png',
                    path: './views/enfuse-logo.png',
                    cid: "enfuse-logo"
                },
                {
                    filename: 'assessment.jpg',
                    path: './views/assessment.jpg',
                    cid: "assessment"
                },
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error" + error)
            } else {
                console.log("Email sent:" + info.response);
                res.status(201).json({ status: 201, info })
            }
        })

    } catch (error) {
        console.log("Error" + error);
        res.status(401).json({ status: 401, error })
    }
});

// scores to manager
emailRouter.post("/score/manager", (req, res) => {

    const { mgrEmail } = req.body;
    const { mgrName } = req.body;
    const { topic } = req.body;
    const {score} = req.body;
    const {result} = req.body;
    const {fullName} = req.body
    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "learninganddevelopment@enfuse-solutions.com",
                pass: "foxjksrjbviqqvbv"
            }
        });

        const mailOptions = {
            from: 'learninganddevelopment@enfuse-solutions.com',
            to: mgrEmail,
            subject: "Enfuse Learning & Development",
            html: compiledTemplate4.render({fullName, mgrName, topic, score, result}),
            attachments: [
                {
                    filename: 'enfuse-logo.png',
                    path: './views/enfuse-logo.png',
                    cid: "enfuse-logo"
                },
                {
                    filename: 'scores.jpg',
                    path: './views/scores.jpg',
                    cid: "scores"
                },
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error" + error)
            } else {
                console.log("Email sent:" + info.response);
                res.status(201).json({ status: 201, info })
            }
        })

    } catch (error) {
        console.log("Error" + error);
        res.status(401).json({ status: 401, error })
    }
});

//score to Employee
emailRouter.post("/score/employee", (req, res) => {

    const { email } = req.body;
    const { fullName } = req.body;
    const { topic } = req.body;
    const {score} = req.body;
    const {result} = req.body;
    
    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "learninganddevelopment@enfuse-solutions.com",
                pass: "foxjksrjbviqqvbv"
            }
        });

        const mailOptions = {
            from: 'learninganddevelopment@enfuse-solutions.com',
            to: email,
            subject: "Enfuse Learning & Development",
            html: compiledTemplate5.render({fullName, topic, score, result}),
            attachments: [
                {
                    filename: 'enfuse-logo.png',
                    path: './views/enfuse-logo.png',
                    cid: "enfuse-logo"
                },
                {
                    filename: 'scores.jpg',
                    path: './views/scores.jpg',
                    cid: "scores"
                },
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error" + error)
            } else {
                console.log("Email sent:" + info.response);
                res.status(201).json({ status: 201, info })
            }
        })

    } catch (error) {
        console.log("Error" + error);
        res.status(401).json({ status: 401, error })
    }
});



module.exports = emailRouter;