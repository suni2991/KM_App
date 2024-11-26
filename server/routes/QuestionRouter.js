const questionRouter = require("express").Router();
const Questionaire = require("../model/QuestionModel");
const multer = require("multer");
const path = require("path");
const { authenticate } = require("../middleware/CheckAuthMiddleware");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Destination folder for storing uploaded images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage: storage });

// POST a new question for a specific category
questionRouter.post(
  "/question/:topic",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    const { question, options, correctAnswer, mark, createdAt } = req.body;
    const { topic } = req.params;
    const image = req.file ? req.file.filename : null;
    const newQuestionaire = new Questionaire({
      question,
      options,
      correctAnswer,
      mark,
      topic,
      createdAt,
      image, // Add the image path to the Questionaire object
    });
    try {
      const savedQuestionaire = await newQuestionaire.save();
      res.json(savedQuestionaire);
    } catch (err) {
      res.json({ message: err });
    }
  }
);

questionRouter.get("/questions/all/:topic", authenticate, async (req, res) => {
  try {
    const { topic } = req.params;
    const questions = await Questionaire.find({ topic });

    // Map each question to include the image path if available
    const questionsWithImage = questions.map((question) => ({
      _id: question._id,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      mark: question.mark,
      createdAt: question.createdAt,
      topic: question.topic,
      image: question.image || null, // If image exists, include its path, otherwise, set to null
    }));

    res.json(questionsWithImage);
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

questionRouter.get("/questions/:topic", authenticate, async (req, res) => {
  try {
    const { topic } = req.params;
    let questionCount = 10;

    if (
      topic === "informationSecurity" ||
      topic === "unconsciousBias" ||
      topic === "grammarPunctuation"
    ) {
      questionCount = 20;
    }

    const questions = await Questionaire.find({ topic }).limit(questionCount);

    if (questionCount === 20) {
      shuffleArray(questions);
    }

    res.json(questions);
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

questionRouter.delete("/question/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Questionaire.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Failed to delete question:", error);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

questionRouter.put(
  "/question/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { question, options, correctAnswer, mark, createdAt } = req.body;

      const image = req.file ? req.file.filename : null;
      const updatedQuestion = {};

      if (question) updatedQuestion.question = question;
      if (options) updatedQuestion.options = options;
      if (correctAnswer) updatedQuestion.correctAnswer = correctAnswer;
      if (mark) updatedQuestion.mark = mark;
      if (createdAt) updatedQuestion.createdAt = createdAt;
      if (image) updatedQuestion.image = image;

      const updatedQuestionResult = await Questionaire.findByIdAndUpdate(
        id,
        updatedQuestion,
        { new: true }
      );

      if (!updatedQuestionResult) {
        return res.status(404).json({ message: "Question not found" });
      }
      res.json(updatedQuestionResult);
    } catch (error) {
      console.error("Failed to update question:", error);
      res.status(500).json({ error: "Failed to update question" });
    }
  }
);

module.exports = questionRouter;
