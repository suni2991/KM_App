import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Exam.css';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Exam = () => {
  const { auth, setAuth } = useAuth();
  const [testCount, setTestCount] = useState(0);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const passingScore = 0.9 * questions.length;
  const pendingTopics = auth.topics.filter((topic) => topic.score === -1);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const currentTopic = auth.topics[currentTopicIndex]?.topic;

  const fetchQuestions = async () => {
    try {
      const currentTopic = auth.topics[currentTopicIndex];
      if (currentTopic.score !== -1) {
        
        setQuestions([]);
        console.log('Exam already attempted for this topic');
      } else {
        const endpoint = getEndpointForTopic();
        const response = await axios.get(endpoint);
        const testCountResponse = await axios.get(`http://52.44.231.112:6001/employees/${auth._id}/topics/${currentTopic._id}`);
        setTestCount(testCountResponse.data.testCount);
        setQuestions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  useEffect(() => {
    if (auth.role === 'Employee') {
      
      const firstNotAttemptedTopicIndex = auth.topics.findIndex((topic) => topic.score === -1);
  
      if (firstNotAttemptedTopicIndex !== -1) {
        setCurrentTopicIndex(firstNotAttemptedTopicIndex);
      } else {
        setCurrentTopicIndex(auth.topics.length - 1);
      }
  
      try {
        fetchQuestions();
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      }
    }
  }, [auth.role, auth.topics, currentTopicIndex]);
  
  
  const getEndpointForTopic = () => {
    
    console.log('currentTopicIndex:', currentTopicIndex);
    const userTopic = auth.topics[currentTopicIndex]?.topic;
    console.log('userTopic:', userTopic);
    if (userTopic) {
      switch (userTopic) {
        case 'HR':
          return 'http://52.44.231.112:6001/questions/HR';
          case 'Information Security':
            return 'http://52.44.231.112:6001/question/informationSecurity';
        case 'Email Etiquette':
          return 'http://52.44.231.112:6001/questions/emailEtiquette';
        case 'Telephone Etiquette':
          return 'http://52.44.231.112:6001/questions/telephoneEtiquette';
        case 'Corporate Etiquette':
          return 'http://52.44.231.112:6001/questions/corporateEtiquette';
        case 'Code Of Conduct':
          return 'http://52.44.231.112:6001/questions/codeOfConduct';
        case 'Feedback':
          return 'http://52.44.231.112:6001/questions/feedback';
        case 'Acknowledgement & Empathy':
          return 'http://52.44.231.112:6001/questions/acknowledgementEmpathy';
        case 'Values':
          return 'http://52.44.231.112:6001/questions/values';
        case 'Unconscious Bias':
          return 'http://52.44.231.112:6001/questions/unconsciousBias';
        case 'Grammar & Punctuation':
          return 'http://52.44.231.112:6001/questions/grammarPunctuation';
        case 'Response vs Reaction':
          return 'http://52.44.231.112:6001/questions/responseReaction';
        case 'Confidence Hacks':
          return 'http://52.44.231.112:6001/questions/confidenceHacks';
        case 'Parts of Speech':
            return 'http://52.44.231.112:6001/questions/partsOfSpeech';
        case 'Dress code Policy':
            return 'http://52.44.231.112:6001/question/dressCodePolicy';
        case 'Social Media Policy':
            return 'http://52.44.231.112:6001/question/socialMediaPolicy';
        case 'Others':
          return 'http://52.44.231.112:6001/questions/others';
        default:
          throw new Error(`Invalid topic: ${userTopic}`);
      }
    } else {
      throw new Error('No topic found for the user.');
    }
  };
  
 const renderResult = () => {
  if (score !== null) {
    // Consider passing if the user scores 90% or above
    const hasPassed = score >= passingScore;

    return (
      <div>
        <center>
          <h2 style={{ fontWeight: 'bold', color: hasPassed ? 'green' : 'red' }}>
            You have {hasPassed ? 'PASSED' : 'FAILED'} in the exam, You scored {score} out of {questions.length}
          </h2>
        </center>
      </div>
    );
  }
  return null; 
};

const areAllQuestionsAnswered = () => {
  for (let i = 0; i < questions.length; i++) {
    if (userAnswers[i] === undefined) {
      return false; // Return false if any question is unanswered
    }
  }
  return true; // All questions are answered
};

const updateScore = async () => {
  try {
    if (!questions || questions.length === 0) {
      throw new Error('No questions found.');
    }
    const currentTopic = auth.topics[currentTopicIndex].topic;
    const passingScore = 0.9 * questions.length; 
    let totalScore = 0;

    for (let i = 0; i < questions.length; i++) {
      const correctAnswerIndex = questions[i].correctAnswer;
      const userAnswer = userAnswers[i];

      if (userAnswer !== undefined && correctAnswerIndex === parseInt(userAnswer)) {
        totalScore++;
      }
    }

    setTestCount((prevTestCount) => prevTestCount + 1);

    // Update the score in the database before sending emails
    const userTopic = auth.topics[currentTopicIndex]?.topic; 
    if (userTopic) {
      const topicObj = auth.topics.find((topic) => topic.topic === userTopic);
      const topicId = topicObj._id;
      const endpoint = `http://52.44.231.112:6001/employees/${auth._id}/topics/${topicId}`;
      console.log('Endpoint:', endpoint); 

      await axios.put(endpoint, {
        score: totalScore,
        testCount: testCount,
      });
    }

    setScore(totalScore); 
    setCurrentTopicIndex((prevIndex) => prevIndex + 1);
    // Send email notifications after updating the database
    await sendEmailToEmployee(auth.fullName, auth.email, currentTopic, totalScore);
    await sendEmailToManager(auth.fullName,  auth.mgrEmail, auth.mgrName, currentTopic, totalScore);

    
  } catch (error) {
    console.error('Failed to update score:', error);
  }
};

// const updateScore = async () => {
//   try {
//     if (!questions || questions.length === 0) {
//       throw new Error('No questions found.');
//     }
//     const currentTopic = auth.topics[currentTopicIndex].topic;
//     const passingScore = 0.9 * questions.length; 
//     let totalScore = 0;

//     for (let i = 0; i < questions.length; i++) {
//       const correctAnswerIndex = questions[i].correctAnswer;
//       const userAnswer = userAnswers[i];

//       if (userAnswer !== undefined && correctAnswerIndex === parseInt(userAnswer)) {
//         totalScore++;
//       }
//     }

//     setTestCount((prevTestCount) => prevTestCount +1 );

//     setScore(totalScore); 
//     await sendEmailToEmployee(auth.fullName, auth.email, currentTopic, totalScore);
//     await sendEmailToManager(auth.fullName,  auth.mgrEmail, auth.mgrName, currentTopic, totalScore)

//     const userTopic = auth.topics[currentTopicIndex]?.topic; 
//     if (userTopic) {
//       const topicObj = auth.topics.find((topic) => topic.topic === userTopic);
//       const topicId = topicObj._id;
//       const endpoint = `http://52.44.231.112:6001/employees/${auth._id}/topics/${topicId}`;
//       console.log('Endpoint:', endpoint); 

//       await axios.put(`http://52.44.231.112:6001/employees/${auth._id}/topics/${topicId}`, {
//         score: totalScore,
//         testCount: testCount,
//       });
//     }
//     setCurrentTopicIndex((prevIndex) => prevIndex + 1);
//   } catch (error) {
//     console.error('Failed to update score:', error);
//   }
// };


  const sendEmailToEmployee = async (fullName, email, topic, score) => {
    try {
      const result = score >= passingScore ? 'Passed' : 'Failed';

      const response = await axios.post("http://52.44.231.112:6001/score/employee", {
        fullName,
        email,
        topic,
        score,
        result,
      });

      console.log('Email sent to employee successfully:', response.data);
    } catch (error) {
      console.error('Failed to send email to employee:', error);
    }
  };
  

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleAnswerChange = (event) => {
    const { name, value } = event.target;
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [name]: value === 'null' ? null : parseInt(value),
    }));
  };

  const calculateScore = () => {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      const correctAnswerIndex = questions[i].correctAnswer;
      const userAnswer = userAnswers[i];
      if (userAnswer !== undefined && correctAnswerIndex === parseInt(userAnswer)) {
        score++;
      }
    }
    setScore(score);
    setCurrentQuestionIndex(questions.length);
    updateScore();

  };

  const handleLogout = async () => {
   
      setAuth({});
      setSubmitDisabled(true);
      navigate('/'); 
      console.log('Logged out');
    }
  
  

  const sendEmailToManager = async (fullName, mgrEmail, mgrName, topic, score) => {
    try {
      const result = score >= passingScore ? 'Passed' : 'Failed';
      const response = await axios.post("http://52.44.231.112:6001/score/manager", {
        fullName,
        mgrEmail,
        mgrName,
        topic,
        score,
        result,
      });
      console.log('Email sent to manager successfully:', response.data);
    } catch (error) {
      console.error('Failed to send email to manager:', error);
    }
  };
 
  
  return (
    <div className='main_Exam_control'>
    <div className='quiz-container'>
    {pendingTopics.length === 0 ? (
      <div>
        <center>
          <h2>No assessments pending.</h2>
          <p>Please Close this Window</p>
        </center>
      </div>
    ) : currentQuestionIndex < questions.length ? (
        <div className='que exam_h'>
        <h1> {currentTopic}</h1>
        <br/>
        <div className='que-container Quez_container'>
        
          <h2 style={{fontWeight: 'bolder', fontSize: '20px'}}> Q:  {questions[currentQuestionIndex].question}<span style={{float: 'right'}}>{currentQuestionIndex + 1} of {questions.length}</span></h2>
          </div>
          <div>
          {questions[currentQuestionIndex].options.map((option, index) => (
            <div key={index} className='ans-options'>
              <input
                type="radio"
                id={`option${index}`}
                name={currentQuestionIndex.toString()} // Converting to string
                value={index === questions[currentQuestionIndex].options.length ? "null" : index.toString()} // Convert to string, handle "Not answered" option
                checked={userAnswers[currentQuestionIndex] === (index === questions[currentQuestionIndex].options.length ? null : index)} // Compare with null for "Not answered" option
                onChange={handleAnswerChange}
              />
              <label className='options' htmlFor={`option${index}`}>{option}</label>
            </div>
          ))}
          
          </div>
          <div className='back-button-container Exam_btn'>
          <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className='send-button'>
            Previous
          </button>
          {currentQuestionIndex === questions.length - 1 ? (
            <button className='send-button' onClick={calculateScore} disabled={!areAllQuestionsAnswered()}>Finish</button>
          ) : (
            <button className='send-button' onClick={handleNext}>Next</button>
          )}
        </div>
        <center><p style={{color: '#00B4D2'}}>**Please answer all the Questions**</p></center>
        </div>
      ) : (
        <div>
        {renderResult()}
          
          <center><button onClick={handleLogout} disabled={!areAllQuestionsAnswered()} className='send-button' style={{width: '20%'}}>
          Submit & Logout
        </button></center>
        </div>
      )}
  
    </div>
    </div>
      
  )}
export default Exam
