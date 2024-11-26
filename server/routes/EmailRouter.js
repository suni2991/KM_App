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
const template6 = fs.readFileSync('./views/bootcampexam.hjs', 'utf-8')
const compiledTemplate = Hogan.compile(template);
const compiledTemplate2 = Hogan.compile(template2);
const compiledTemplate3 = Hogan.compile(template3);
const compiledTemplate4 = Hogan.compile(template4); // score to manager
const compiledTemplate5 = Hogan.compile(template5);
const compiledTemplate6 = Hogan.compile(template6);
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
                pass: "huzjfvqfpkejlcrf"
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

emailRouter.post("/user/induction", (req, res) => {
    const { email, fullName, confirmPassword, topics } = req.body;
    const lastSixTopics = topics.slice(-6); // Get the last 6 topics
  
    // Create variables for each topic
    const topic1 = lastSixTopics[0]?.topic || "";
    const topic2 = lastSixTopics[1]?.topic || "";
    const topic3 = lastSixTopics[2]?.topic || "";
    const topic4 = lastSixTopics[3]?.topic || "";
    const topic5 = lastSixTopics[4]?.topic || "";
    const topic6 = lastSixTopics[5]?.topic || "";
  
    // Create variables for each presenter
    const presenter1 = lastSixTopics[0]?.presenter || "";
    const presenter2 = lastSixTopics[1]?.presenter || "";
    const presenter3 = lastSixTopics[2]?.presenter || "";
    const presenter4 = lastSixTopics[3]?.presenter || "";
    const presenter5 = lastSixTopics[4]?.presenter || "";
    const presenter6 = lastSixTopics[5]?.presenter || "";
    
  
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "learninganddevelopment@enfuse-solutions.com",
          pass: "huzjfvqfpkejlcrf",
        },
      });
  
      const mailOptions = {
        from: "learninganddevelopment@enfuse-solutions.com",
        to: email,
        subject: "Enfuse Learning & Development",
        html: compiledTemplate2.render({
          fullName,
          email,
          confirmPassword,
          topic1,
          topic2,
          topic3,
          topic4,
          topic5,
          topic6,
          presenter1,
          presenter2,
          presenter3,
          presenter4,
          presenter5,
          presenter6,
        }),
        attachments: [
          {
            filename: "enfuse-logo.png",
            path: "./views/enfuse-logo.png",
            cid: "enfuse-logo",
          },
          {
            filename: "feedback.jpg",
            path: "./views/feedback.jpg",
            cid: "feedback",
          },
        ],
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error" + error);
          res.status(500).json({ status: 500, error });
        } else {
          console.log("Email sent:" + info.response);
          res.status(201).json({ status: 201, info });
        }
      });
    } catch (error) {
      console.log("Error" + error);
      res.status(401).json({ status: 401, error });
    }
  });
 
// Assessment link
emailRouter.post("/user/exam", (req, res) => {
  const { email, fullName, confirmPassword, topics } = req.body;
    const lastSixTopics = topics.slice(-6); // Get the last 6 topics
  
    // Create variables for each topic
    const topic1 = lastSixTopics[0]?.topic || "";
    const topic2 = lastSixTopics[1]?.topic || "";
    const topic3 = lastSixTopics[2]?.topic || "";
    const topic4 = lastSixTopics[3]?.topic || "";
    const topic5 = lastSixTopics[4]?.topic || "";
    const topic6 = lastSixTopics[5]?.topic || "";
  
    const link1 = `http://localhost:3000/exam`;
  const link2 = `http://localhost:3000/exam`;
  const link3 = `http://localhost:3000/exam`;
  const link4 = `http://localhost:3000/exam`;
  const link5 = `http://localhost:3000/exam`;
  const link6 = `http://localhost:3000/exam`;
    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "learninganddevelopment@enfuse-solutions.com",
                pass: "huzjfvqfpkejlcrf"
            }
        });

        const mailOptions = {
            from: 'learninganddevelopment@enfuse-solutions.com',
            to: email,
            subject: "Enfuse Learning & Development",
            html: compiledTemplate3.render({
              fullName,
          email,
          confirmPassword,
          topic1,
          topic2,
          topic3,
          topic4,
          topic5,
          topic6,
          link1,
          link2,
          link3,
          link4,
          link5,
          link6,}),
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

emailRouter.post("/user/bootcamp/exam", async (req, res) => {
  const { fullName, email, subTrainings, trainingName } = req.body;
  const lastTopics = subTrainings.slice(-6); // Get the last 6 topics



  // Create variables for each subTraining
  const subTraining1 = lastTopics[0] || {};
  const subTraining2 = lastTopics[1] || {};
  const subTraining3 = lastTopics[2] || {};
  const subTraining4 = lastTopics[3] || {};
  const subTraining5 = lastTopics[4] || {};
  const subTraining6 = lastTopics[5] || {};

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "learninganddevelopment@enfuse-solutions.com",
        pass: "huzjfvqfpkejlcrf",
      },
    });

    const mailOptions = {
      from: "learninganddevelopment@enfuse-solutions.com",
      to: email,
      subject: "Bootcamp Exam Details",
      html: compiledTemplate6.render({
        fullName,
        email,
        trainingName,
       
        subTraining1,
        subTraining2,
        subTraining3,
        subTraining4,
        subTraining5,
        subTraining6,
      }),
      attachments: [
        {
          filename: "bootcamp-logo.png",
          path: "./views/bootcamp-logo.png",
          cid: "bootcamp-logo",
        },
        {
          filename: "exam-details.pdf",
          path: "./views/exam-details.pdf",
          cid: "exam-details",
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error" + error);
        res.status(500).json({ status: 500, error });
      } else {
        console.log("Email sent:" + info.response);
        res.status(201).json({ status: 201, info });
      }
    });
  } catch (error) {
    console.log("Error" + error);
    res.status(401).json({ status: 401, error });
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
                pass: "huzjfvqfpkejlcrf"
            },
            
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
                pass: "huzjfvqfpkejlcrf"
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