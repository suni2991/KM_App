import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useAuth from '../hooks/useAuth';
import Swal from 'sweetalert2';

const EditNomination = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const { auth} = useAuth();
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    fullName: '',
    email: '',
    trainingTopic: '',
    fromTime: '',
    toTime: '',
    date: null,
  });
  const navigate = useNavigate();
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [existingTrainingTopics, setExistingTrainingTopics] = useState([]);
  const [duplicateTopicError, setDuplicateTopicError] = useState(false);

  const { email } = useParams(); // Get the nomination ID from the URL

  useEffect(() => {
    fetchExistingDataForEditing();
  }, [email]);

    const handleRedirect = () => {
    if (auth.role === 'Admin') {
      navigate('/training');
    } else if (auth.role === 'Manager') {
      navigate('/nominations');
    }
  };

  const fetchExistingDataForEditing = async () => {
    try {
      const response = await fetch(`http://52.44.231.112:6001/nomination/${email}`);
      if (response.ok) {
        const nominationData = await response.json();
        const nextTraining = nominationData.trainings[0] || {};
        const lastTraining = nominationData.trainings[nominationData.trainings.length - 1] || {};
  
        setSelectedDate(nextTraining.date ? new Date(nextTraining.date) : null);
  
        setEmployeeData({
          fullName: nominationData.fullName,
          email: nominationData.email,
          trainingTopic: lastTraining.trainingName || '',
          timeSlot: lastTraining.timeSlot || '',
          fromTime: lastTraining.fromTime || '',
          toTime: lastTraining.toTime || '',
          date: lastTraining.date ? new Date(lastTraining.date) : null,
        });
  
        const trainingTopics = nominationData.trainings.map(training => training.trainingName);
        setExistingTrainingTopics(trainingTopics);
      } else {
        console.error('Error fetching nomination data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching nomination data:', error);
    }
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeData.email.endsWith('@enfuse-solutions.com')) {
      Swal.fire({
        icon: 'error',
        title: 'Email should end with @enfuse-solutions.com',
        text: 'Please use EnFuse email only',
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
      });
      return;
    }

    if (
      !employeeData.fullName ||
      !employeeData.email ||
      !employeeData.trainingTopic ||
      !selectedDate ||
      (showCustomTime && (!employeeData.fromTime || !employeeData.toTime)) ||
    (!showCustomTime && !employeeData.timeSlot)
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Please fill all the Fields',
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
      });
      return;
    }
    const isoDate = selectedDate ? selectedDate.toISOString() : '';
    if (!duplicateTopicError) {
      try {
        const response = await fetch(`http://52.44.231.112:6001/nominations/${email}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: employeeData.fullName,
            email: employeeData.email,
            trainings: [
              {
                date: isoDate,
                trainingName: employeeData.trainingTopic,
                timeSlot: showCustomTime
                  ? `${employeeData.fromTime} - ${employeeData.toTime}`
                  : employeeData.timeSlot,
                trainingStatus: 'Initialised'
              },
            ],
          }),
        });

        if (response.ok) {
          if (auth.role === 'Admin'){
          navigate('/training')
        } else if (auth.role === 'Manager') {
          navigate ('/nominations')
        }  
          console.error('Errors updating nomination data:', response.statusText);
        }
      } catch (error) {
        console.error('Error updating nomination data:', error);
      }
    }
  };


  const handleDateChange = (date) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (date < currentDate) {
      
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'please enter a future date',
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
      });
    } else {
      setSelectedDate(date);
      setEmployeeData({ ...employeeData, date });
    }

  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    
      if (name === 'timeSlot') {
    if (value === 'custom') {
      setShowCustomTime(true);
    } else {
      const [fromTime, toTime] = value.split(' - ');
      setEmployeeData({
        ...employeeData,
        fromTime,
        toTime,
        timeSlot: value, // Set the timeSlot value to the selected predefined time slot
      });
      setShowCustomTime(false);
    }
    console.log('Generated timeSlot:', `${employeeData.fromTime} - ${employeeData.toTime}`);
  }

  if (name === 'trainingTopic') {
    setEmployeeData((prevData) => ({
      ...prevData,
      [name]: name === 'trainingTopic' ? value : value.trim(),
    }));
  }
  };

  return (
    <div className='reg-container'>
      <h1 style={{ fontSize: '25px', paddingBottom: '20px', fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: '#00B4D2' }}>Edit / Add New Nomination Form</h1>
      <form>
        <label>Training Date:</label>
        <DatePicker selected={selectedDate} required onChange={handleDateChange} placeholderText='Pick a Date' />
        <br />
        <label>Time Slot:</label>
        <select
          name="timeSlot"
          value={employeeData.timeSlot}
          onChange={handleFormChange}
          className="reg-input"
          required
        >
          <option value="">Select Time Slot</option>
          <option value="11:30 AM - 07:30 PM">11:30 AM - 07:30 PM</option>
          <option value="11:30 AM - 03:00 PM">11:00 AM - 03:00 PM</option>
          <option value="02:30 PM - 04:30 PM">02:30 PM - 04:30 PM</option>
          <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
          <option value="05:30 PM - 07:30 PM">05:30 PM - 07:30 PM</option>
          <option value="custom">Custom Slot</option>
        </select>
        {showCustomTime && ( 
          <>
            <input
              type="time"
              name="fromTime"
              value={employeeData.fromTime}
              onChange={handleFormChange}
              className="reg-input"
              style={{ width: '100px' }}
            />
            <span style={{ fontWeight: 'bold' }}> To </span>
            <input
              type="time"
              name="toTime"
              value={employeeData.toTime}
              onChange={handleFormChange}
              className="reg-input"
              style={{ width: '100px' }}
              placeholder="To"
            />
          </>
        )}
        <br />
        <label>Full Name:</label>
        <input
          type="text"
          name="fullName"
          className='reg-input'
          value={employeeData.fullName}
          onChange={handleFormChange}
          required
        />
        <br />
        <label>Email:</label>
        <input
          className="reg-input"
          type="text"
          name="email"
          value={employeeData.email}
          maxLength={50}
          required
          onChange={handleFormChange}
          placeholder="Enter valid Mail Id"
          list="emailSuggestions"
        />
        <datalist id="emailSuggestions">
            {emailSuggestions.map((email, index) => (
              <option key={index} value={email} />
            ))}
          </datalist>
        <br />
        <label>Training Topic:</label>
        <select
          name="trainingTopic"
          value={employeeData.trainingTopic}
          required
          onChange={handleFormChange}
          className="reg-input"
        >
          <option value="">Select Topic</option>
          <option value="Information Security">Information Security</option>
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
          <option value="Others">Others</option>
        </select>
        {duplicateTopicError && <p style={{ color: 'red' }}>This training topic is already taken.</p>}
        <br />
        
        <button className='send-button' type="submit" style={{ marginLeft: '80px', marginRight: '10px'}} onClick={handleSubmit}>EDIT / UPDATE</button>
         <button className='send-button' onClick={handleRedirect} type="submit">BACK</button>
      </form>
    </div>
  );
};

export default EditNomination;
