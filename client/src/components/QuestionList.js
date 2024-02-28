import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {CiPen} from 'react-icons/ci'
import {AiOutlineDelete} from 'react-icons/ai'
import Swal from 'sweetalert2';

function QuestionList() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const [selectedCategoryCount, setSelectedCategoryCount] = useState(0);


  const fetchQuestions = async () => {
    try {
      const endpoint = `http://52.44.231.112:6001/questions/all/${selectedCategory}`;
      const response = await axios.get(endpoint);
      setQuestions(response.data);
      setSelectedCategoryCount(response.data.length);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchQuestions();
    }
  }, [selectedCategory]);

  const handleDeleteQuestion = async (id) => {
    console.log("Question ID to delete:", id);
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: 'Are you sure you want to delete this question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#00B4D2',
      cancelButtonColor: 'red',
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://52.44.231.112:6001/question/${id}`);
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleEditQuestion = (id) => {
    const selectedQuestion = questions.find((question) => question._id === id);
    if (selectedQuestion) {
      navigate('/question/edit/' + id, { state: { ...selectedQuestion } });
    }
  };
 

  return (
    <div className="question-list">
      <div className="question-list__category">
        
        <select
          id="category"
          className="reg-inputs"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Select Category / Topic</option>
          <option value="HR">HR</option>
          <option value="informationSecurity">Information Security</option>
          <option value="codeOfConduct">Code Of Conduct</option>
          <option value="emailEtiquette">Email Etiquette</option>
          <option value="telephoneEtiquette">Telephone Etiquette</option>
          <option value="corporateEtiquette">Corporate Etiquette</option>
          <option value="feedback">Feedback</option>
          <option value="values">Values</option>
          <option value="acknowledgementEmpathy">Acknowledgement & Empathy</option>
          <option value="unconsciousBias">Unconscious Bias</option>
          <option value="grammarPunctuation">Grammar & Punctuation</option>
          <option value="responseReaction">Response Vs Reaction</option>
          <option value="confidenceHacks">Confidence Hacks</option>
          <option value="Parts of Speech">Parts of Speech</option>
          <option value="Dress Code Policy">Dress Code Policy</option>
          <option value="Social Media Policy">Social Media Policy</option>
          <option value="others">Others</option>
        </select>
      </div>
      <div style={{float:'right', margin: '5px'}}>
    {selectedCategoryCount > 0 && (
      <p style={{fontWeight: 'bold', fontSize:'18px', color:'#00B4D2'}}>
        Total questions: {selectedCategoryCount}
      </p>
    )}
  </div>
      <ol className="question-list__items">
        {questions.map(question => (
          <li key={question._id} className="question-list__item">
            <h3 className="question-list__question">{question.question}</h3>
            <p className="question-list__options">Options: {question.options.join(', ')}</p>
            <p className="question-list__correct-answer">Correct Answer: {question.options[question.correctAnswer]}</p>
            <p className="question-list__submitted-date">Submitted Date: {new Date(question.createdAt).toLocaleString()}</p>

             <div style={{margin: '5px'}}>
             <button
             onClick={() => handleEditQuestion(question._id)}
             className='action-button'>
           <CiPen color= '#fff' />
           </button>
          
           <button onClick={() => handleDeleteQuestion(question._id)} className='action-button'>
           <AiOutlineDelete color= '#fff' /></button>
           </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default QuestionList;
