import React, { useState } from 'react';
import axios from 'axios';
import QuestionForm from '../components/QuestionForm';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import QuestionList from '../components/QuestionList';

function Questionaire() {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questions, setQuestions] = useState([]);


  const getEndpointForTopic = () => {
    switch (selectedTopic) {
      case 'HR':
        return 'http://localhost:6001/question/HR';
      case 'Information Security':
          return 'http://localhost:6001/question/informationSecurity';
      case 'Email Etiquette':
        return 'http://localhost:6001/question/emailEtiquette';
      case 'Telephone Etiquette':
        return 'http://localhost:6001/question/telephoneEtiquette';
      case 'Corporate Etiquette':
        return 'http://localhost:6001/question/corporateEtiquette';
      case 'Code Of Conduct':
        return 'http://localhost:6001/question/codeOfConduct';
      case 'Feedback':
        return 'http://localhost:6001/question/feedback';
      case 'Acknowledgement & Empathy':
        return 'http://localhost:6001/question/acknowledgementEmpathy';
      case 'Values':
        return 'http://localhost:6001/question/values';
      case 'Unconscious Bias':
        return 'http://localhost:6001/question/unconsciousBias';
      case 'Grammar & Punctuation':
        return 'http://localhost:6001/question/grammarPunctuation';
      case 'Response vs Reaction':
        return 'http://localhost:6001/question/responseReaction';
      case 'Confidence Hacks':
        return 'http://localhost:6001/question/confidenceHacks';
      case 'Parts of Speech':
          return 'http://localhost:6001/question/partsOfSpeech';
      case 'Dress code Policy':
            return 'http://localhost:6001/question/dressCodePolicy';
      case 'Social Media Policy':
              return 'http://localhost:6001/question/socialMediaPolicy';
      case 'Others': 
          return 'http://localhost:6001/question/others';  
      default:
        throw new Error(`Invalid topic: ${selectedTopic}`);
    }
  };

  const handleSubmit = (data) => {
    const endpoint = getEndpointForTopic();
    axios
      .post(endpoint, data)
      .then(response => {
        console.log('Question saved successfully:', response.data);
        // Update the questions state with the newly added question
        setQuestions([...questions, response.data]);
      })
      .catch(error => {
        console.error('Error saving question:', error);
      });
  };

  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
  };

  return (
    <div className="table-container">
      <Tabs>
        <TabList style={{color: '#00B4D2'}}>
          <Tab>Add Question</Tab>
          <Tab>View Questions</Tab>
        </TabList>

        <TabPanel>
          <div className="question-form">
            <label>Select Topic:</label>
            <select className="reg-inputs" id="topic-select" value={selectedTopic} onChange={handleTopicChange}>
              <option value="">Select</option>
              <option value="HR">HR</option>
              <option value="Information Security">Information Security</option>
              <option value="Code Of Conduct">Code Of Conduct</option>
              <option value="Email Etiquette">Email Etiquette</option>
              <option value="Telephone Etiquette">Telephone Etiquette</option>
              <option value="Corporate Etiquette">Corporate Etiquette</option>
              <option value="Feedback">Feedback</option>
              <option value="Values">Values</option>
              <option value="Acknowledgement & Empathy">Acknowledgement & Empathy</option>
              <option value="Unconscious Bias">Unconscious Bias</option>
              <option value="Grammar & Punctuation">Grammar & Punctuation</option>
              <option value="Response vs Reaction">Response Vs Reaction</option>
              <option value="Confidence Hacks">Confidence Hacks</option>
              <option value="Parts of Speech">Parts of Speech</option>
              <option value="Dress Code Policy">Dress Code Policy</option>
              <option value="Social Media Policy">Social Media Policy</option>
              <option value="Others">Others</option>
            </select>
            {selectedTopic && (
              <QuestionForm onSubmit={handleSubmit} getEndpointForTopic={getEndpointForTopic} />
            )}
          </div>
          <center>
            <p style={{ color: '#00B4D2' }}>
              *Set a Question, add options, and set Correct Answer also
            </p>
          </center>
        </TabPanel>

        <TabPanel>
          <QuestionList />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default Questionaire;
