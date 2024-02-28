const questionRouter = require("express").Router();
const Questionaire = require('../model/QuestionModel');

// POST a new question for a specific category
questionRouter.post('/question/:topic', async (req, res) => {
  const { question, options, correctAnswer, mark, createdAt } = req.body;
  const { topic } = req.params;
  const newQuestionaire = new Questionaire({
    question,
    options,
    correctAnswer,
    mark,
    topic,
    createdAt,
  });
  try {
    const savedQuestionaire = await newQuestionaire.save();
    res.json(savedQuestionaire);
  } catch (err) {
    res.json({ message: err });
  }
});

questionRouter.get('/questions/all/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const questions = await Questionaire.find({ topic });

    res.json(questions);
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});




const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};


questionRouter.get('/questions/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
      let questionCount = 10;


    if (topic === 'informationSecurity' || topic === 'unconsciousBias' || topic === 'grammarPunctuation') {
      questionCount = 20; 
    }

    const questions = await Questionaire.find({ topic }).limit(questionCount);

    if (questionCount === 20) {
      shuffleArray(questions);
    }


    res.json(questions);
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});






questionRouter.delete('/question/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Questionaire.findByIdAndDelete(id);
    
    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Failed to delete question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});


questionRouter.put('/question/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctAnswer, mark, createdAt } = req.body;

    const updatedQuestion = {};

    if (question) updatedQuestion.question = question;
    if (options) updatedQuestion.options = options;
    if (correctAnswer) updatedQuestion.correctAnswer = correctAnswer;
    if (mark) updatedQuestion.mark = mark;
    if (createdAt) updatedQuestion.createdAt = createdAt;

    const updatedQuestionResult = await Questionaire.findByIdAndUpdate(id, updatedQuestion, { new: true });

    if (!updatedQuestionResult) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(updatedQuestionResult);
  } catch (error) {
    console.error('Failed to update question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});


module.exports = questionRouter;