import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';

import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown';

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
  const {auth, token} = useAuth();
  const [registeredEmployees, setRegisteredEmployees] = useState([]);
  const [emailSuggestions, setEmailSuggestions] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState('');

  const handleTopicSelect = (topic) => {
    setEmployeeData({ ...employeeData, trainingTopic: topic });
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
  

  const navigate = useNavigate();

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setEmployeeData({
      ...employeeData,
      [name]: name === 'trainingTopic' ? value : value, 
    });

    if (name === 'mode') {
      setEmployeeData({
        ...employeeData,
        mode: value,
      });
    } else {
      setEmployeeData({
        ...employeeData,
        [name]: value,
      });
    }



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
  
    // Check for missing fields
    const missingFields = [];
    if (!employeeData.fullName) missingFields.push('Full Name');
    if (!employeeData.email) missingFields.push('Email');
    if (!employeeData.trainingTopic) missingFields.push('Training Topic');
    if (!selectedDate) missingFields.push('Training Date');
    if (showCustomTime && (!employeeData.fromTime || !employeeData.toTime)) {
      missingFields.push('Custom Time Slot');
    } else if (!showCustomTime && !employeeData.timeSlot) {
      missingFields.push('Time Slot');
    }
  
    // Check if any fields are missing
    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        html: `Please fill the following field(s):<br>${missingFields.join('<br>')}`,
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
      });
      return;
    }
  
    // Check if email is in correct format
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
  
    // Check if the nomination already exists for the email, date, and topic
    const registeredEmployeeIndex = findRegisteredEmployeeIndex(
      employeeData.email,
      employeeData.date,
      employeeData.trainingTopic,
      employeeData.mode
    );
  
    if (registeredEmployeeIndex === -1) {
      // New registration
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
            mode: employeeData.mode, // Add mode to the dataToSend object
          },
        ],
      };
  
      fetch('http://localhost:6001/add/nominations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              // Check if the error message is about limit exceeded
              if (data.error && data.error.includes('Limit exceeded')) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'Limit exceeded for registrations on this day for this topic and mode.',
                  showConfirmButton: true,
                  confirmButtonColor: '#00B4D2',
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: data.error || 'Nomination already exists for this Email',
                  showConfirmButton: true,
                  confirmButtonColor: '#00B4D2',
                });
              }
            });
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
            timeSlot: '',
            mode: ''
          });
          setSelectedDate(null);
          setShowCustomTime(false);
        })
        .catch((error) => {
          console.error('Error submitting employee data:', error);
        });
    } else {
      // Existing registration update
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Nomination already exists for this Email, Date, and Topic.',
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
      });
    }
  };
  

 

  const handleRedirect =() =>{
    if(auth.role === 'Admin'){
      navigate('/training')
    } else if(auth.role === 'Manager'){
      navigate('/employees')
    }
  }

  const findRegisteredEmployeeIndex = (email, date, trainingTopic, mode) => {
    return registeredEmployees.findIndex(
      (employee) =>
        employee.email === email &&
        employee.date &&
        employee.date.toISOString().slice(0, 10) === date.toISOString().slice(0, 10) && // Compare only dates
        employee.trainingTopic === trainingTopic &&
        employee.mode === mode 
        
    );
  };
  


  return (
    <div className='reg-container'>
    <h1 style={{fontSize: '25px', paddingBottom: ' 20px', fontWeight: 'bold', color: '#00B4D2', textDecoration:'underline' , textDecorationColor: '#00B4D2'}}>Nomination Form </h1>
    <form>
    <div className="datepicker-container">
    <label>Training Date:<span className='require'>*</span></label><DatePicker selected={selectedDate} popperPlacement="bottom-end" onChange={handleDateChange} placeholderText='Pick a Date'/></div>
    <br />
    <label>Time Slot:<span className='require'>*</span></label>
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
        Full Name:<span className='require'>*</span></label>
        <input
          type="text"
          name="fullName"
          className='reg-input'
          value={employeeData.fullName}
          onChange={handleFormChange}
        />
      
      <br />
      <label>Email:<span className='require'>*</span></label>
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
        
        <Dropdown
        apiUrl="http://localhost:6001/topics/Training" // Adjust API URL as needed
        onSelect={handleTopicSelect}
        name="trainingTopic"
        label="Select Topic:"
        className="reg-input"
        value={employeeData.trainingTopic}
        required
      />
      <br />
      <label>Mode:<span className='require'>*</span></label>
<select
  name="mode"
  value={employeeData.mode}
  onChange={handleFormChange}
  className="reg-input"
>
  <option value="">Select Mode of Training</option>
  <option value="Online">Online - 15</option>
  <option value="Offline">Offline - 13</option>
 
</select>
<br/>
      <button       className='send-button'
      type="submit"
      style={{marginLeft: '80px'}} onClick={handleSubmit}>Register</button>
      <button  className='send-button' style={{marginLeft: '80px'}} onClick={handleRedirect}>BACK</button>
      </form>
    </div>
  );
};

export default Calender;
