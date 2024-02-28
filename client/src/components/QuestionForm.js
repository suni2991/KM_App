import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

function QuestionForm({ onSubmit, getEndpointForTopic }) {
  const location = useLocation();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [mark, setMark] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { id: question_Id } = useParams();
  const navigate = useNavigate();
  const handleUpdate = () => {

    const isAnswerCorrect = correctAnswer === options.indexOf(options[correctAnswer]);
    const newMark = isAnswerCorrect ? 1 : 0;
    setMark(newMark);

    const updatedQuestion = {
      question: question,
      options: options,
      correctAnswer: correctAnswer,
      mark: newMark,
      createdAt: new Date(),
    };
    

    const endpoint = `http://52.44.231.112:6001/question/${question_Id}`;
    axios.put(endpoint, updatedQuestion,{
      headers: {
        'Content-Type': 'application/json', // Set the appropriate content type
      },
    })
      
      .then(response => {
        console.log('Question updated successfully:', response.data);

        Swal.fire({
          icon: 'success',
          title: 'Question has been saved',
          showConfirmButton: true,
          confirmButtonColor: '#00B4D2',

        });
        navigate('/questionaire')

        setSubmitted(true);
      })
      .catch(error => {
        console.error('Error updating question:', error);

        Swal.fire({
          title: 'Error',
          text: 'There was an error updating your question. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#00B4D2'
        });
      });
  };

  const handleRedirect = () => {
    
      navigate('/questionaire');
   
  };


  const handleOptionChange = (optionIndex) => {
    setCorrectAnswer(optionIndex);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filledOptions = options.filter(option => option.trim() !== '');
  if (filledOptions.length < 2) {
    Swal.fire({
      title: 'Error',
      text: 'Please fill in at least 2 options.',
      icon: 'error',
      confirmButtonColor: '#00B4D2'
    });
    return;
  }

    Swal.fire({
      title: 'Submit Question?',
      text: 'Are you sure you want to submit this question?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00B4D2',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Submit'
    }).then((result) => {
      if (result.isConfirmed) {
        if (location.state) {

          handleUpdate();
        } else {

          const isAnswerCorrect = correctAnswer === options.indexOf(e.target.answer.value);

          const newMark = isAnswerCorrect ? 1 : 0;
          setMark(newMark);
          const newQuestion = {
            question: question,
            options: options,
            correctAnswer: correctAnswer,
            mark: newMark,
            createdAt: new Date(),
          };

          const endpoint = getEndpointForTopic();
          axios
            .post(endpoint, newQuestion)
            .then(response => {
              console.log('Question saved successfully:', response.data);
              Swal.fire({
                icon: 'success',
                title: 'Question has been saved',
                showConfirmButton: true,
                confirmButtonColor: '#00B4D2',
              });
              setQuestion('');
              setOptions(['', '', '', '']);
              setCorrectAnswer(0);
              setSubmitted(false);
              setMark(0);
            })
            .catch(error => {
              console.error('Error saving question:', error);
              
              Swal.fire({
                title: 'Error',
                text: 'There was an error submitting your question. Please try again later.',
                icon: 'error'
              });
            });
        }
        setSubmitted(true);
      }
    });
  };




  useEffect(() => {
    if (location.state) {
      const { question, options, correctAnswer, mark } = location.state;
      setQuestion(question);
      setOptions(options);
      setCorrectAnswer(correctAnswer);
      setMark(mark);
    }
  }, [location.state]);

  return (
    <div className="question-form">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Question:</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            placeholder="Set Question here"
          />
        </div>
        <br />
        {options.map((option, index) => (
          <label key={index} style={{ display: 'flex', justifyContent: 'space-around' }}>
            <input
              type="radio"
              name="answer"
              className='qestion_form_radio'
              value={option}
              checked={correctAnswer === index}
              onChange={() => handleOptionChange(index)}
              required
              disabled={submitted}
            />
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              
              disabled={submitted}
              placeholder="Add Options"
            />
          </label>
        ))}
        <br />
        <div style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
          {!submitted && <button type="submit" className='send-button'>SUBMIT</button>}
          <button className='send-button' onClick={handleRedirect} type="submit">BACK</button>
        </div>
      </form>
      {submitted && (
        <div>
          <p>Mark: {mark}</p>
        </div>
      )}
    </div>
  );
}

export default QuestionForm;
