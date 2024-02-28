import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';

import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Calender = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    fullName: '',
    email: '',
    trainingTopic: '',
    date: null,
    fromTime: '',
    toTime: '',
  });
  const {auth} = useAuth();
  const [registeredEmployees, setRegisteredEmployees] = useState([]);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
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
  

  const navigate = useNavigate();

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setEmployeeData({
      ...employeeData,
      [name]: name === 'trainingTopic' ? value : value, 
    });


    if (name === 'timeSlot') {
      if (value === 'custom') {
       
        setShowCustomTime(true);
      } else {
        const [fromTime, toTime] = value.split(' - ');
        setEmployeeData({
          ...employeeData,
          fromTime,
          toTime,
          timeSlot: value,
        });
        setShowCustomTime(false); 
      }
      console.log('Generated timeSlot:', `${employeeData.fromTime} - ${employeeData.toTime}`);
    }
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const isoDate = employeeData.date ? employeeData.date.toISOString() : '';

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
  
    if (
      employeeData.fullName &&
      employeeData.email &&
      employeeData.trainingTopic &&
      employeeData.date &&
      (
        (!showCustomTime && employeeData.fromTime && employeeData.toTime) ||
        (showCustomTime && employeeData.fromTime && employeeData.toTime)
      )
    ) {
      const registeredEmployeeIndex = findRegisteredEmployeeIndex(
        employeeData.email,
        employeeData.date
      );
  
      const dataToSend = {
        mgrEmail: auth.email,
        mgrName: auth.fullName,
        fullName: employeeData.fullName,
        email: employeeData.email,
        trainings: [
          {
            trainingName: employeeData.trainingTopic,
            date: isoDate,
            timeSlot: showCustomTime
              ? `${employeeData.fromTime} - ${employeeData.toTime}`
              : employeeData.timeSlot, 
            trainingStatus: 'Initialised',
          },
        ],
      };
  
      if (registeredEmployeeIndex === -1) {
        // New registration
        fetch('http://52.44.231.112:6001/add/nominations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        })
          .then((response) => {
            if (!response.ok) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Email already registered for Nomination.',
                showConfirmButton: true,
                confirmButtonColor: '#00B4D2',
              });
              throw new Error('Network response was not ok.');
            }
  
            setRegisteredEmployees([...registeredEmployees, dataToSend]);
  
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Nomination successfully submitted.',
              showConfirmButton: true,
              confirmButtonColor: '#00B4D2',
            });
  
            setEmployeeData({
              fullName: '',
              email: '',
              trainingTopic: '',
              date: null,
              fromTime: '',
              toTime: '',
              timeSlot:''
            });
            setSelectedDate(null);
            setShowCustomTime(false);
          })
          .catch((error) => {
            console.error('Error submitting employee data:', error);
          });
      } else {
        // Existing registration update
        fetch('http://52.44.231.112:6001/update/nominations', {
          method: 'PUT', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        })
          .then((response) => {
            if (!response.ok) {
              
              throw new Error('Network response was not ok.');
            }
              setEmployeeData({
              fullName: '',
              email: '',
              trainingTopic: '',
              date: null,
              fromTime: '',
              toTime: '',
            });
            setSelectedDate(null);
            setShowCustomTime(false);
          })
          .catch((error) => {
            console.error('Error updating employee data:', error);
          });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Please fill all the Fields',
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
      });
    }
  };
  

  const handleRedirect =() =>{
    if(auth.role === 'Admin'){
      navigate('/admin')
    } else if(auth.role === 'Manager'){
      navigate('/employees')
    }
  }

 const findRegisteredEmployeeIndex = (email, date) => {
  return registeredEmployees.findIndex(
    (employee) =>
      employee.email === email && employee.date.getMonth() === date.getMonth()
  );
};

  return (
    <div className='reg-container'>
    <h1 style={{fontSize: '25px', paddingBottom: ' 20px', fontWeight: 'bold', textDecoration:'underline' , textDecorationColor: '#00B4D2'}}>Nomination Form </h1>
    <form>
    <div className="datepicker-container">
    <label>Training Date:</label><DatePicker selected={selectedDate} popperPlacement="bottom-end" onChange={handleDateChange} placeholderText='Pick a Date'/></div>
    <br />
    <label>Time Slot:</label>
<select
  name="timeSlot"
  value={employeeData.timeSlot}
  onChange={handleFormChange}
  className="reg-input"
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
      <label>
        Full Name:</label>
        <input
          type="text"
          name="fullName"
          className='reg-input'
          value={employeeData.fullName}
          onChange={handleFormChange}
        />
      
      <br />
      <label>Email:</label>
      <input
      className="reg-input"
  type="email"
  name="email"
  value={employeeData.email}
  maxLength={50}
  required
  pattern="[a-zA-Z0-9._%+-]+@enfuse-solutions\.com$"
  onChange={handleFormChange}
  placeholder="@enfuse-solutions.com"
  list="emailSuggestions"
  />
  <datalist id="emailSuggestions">
            {emailSuggestions.map((email, index) => (
              <option key={index} value={email} />
            ))}
          </datalist>
          <br/>
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
      <br />
      <button       className='send-button'
      type="submit"
      style={{marginLeft: '80px'}} onClick={handleSubmit}>Register</button>
      <button  className='send-button' style={{marginLeft: '80px'}} onClick={handleRedirect}>BACK</button>
      </form>
    </div>
  );
};

export default Calender;
