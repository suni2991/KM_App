import React, { useState, useEffect} from 'react';
import { emailData } from '../Assets/EmailData';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import  Modal from 'react-modal';

function Registration() {
  
  const [formData, setFormData] = useState({
    role: '',
    category: '',
    fullName: '',
    email: '',
    topic: '',
    mgrName: '',
    mgrEmail: '',
    department: '',
  })

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  const [presenter, setPresenter] = useState('');
  const presentersArray = ['Adam Pawaskar', 'Arjun Mehra', 'Anuja Gaikwad', 'Ashish Kurvelli', 'Bhavesh Bhatu', 'Cajetan Franco', 'Danish Kably', 'Faizan Ansari','Faizan Dalla', 'Feroz Sumara','Gokul Gajbhiye', 'Harshad Halbe', 'Hibah Kazi', 'Jatin Salve', 'Mahek Shaikh','Manish Kareya', 'Madan Takalikar', 'Mohammed Shaikh', 'Munazir Ansari','Nimit Kumar Goyal', 'Parthiv Bhaskar', 'Reema Thakur', 'Sadaf Khan', 'Sahil Shah','Saili Salve', 'Salman Khan','Saraswata Biswas', 'Shahid Ansari',  'Sunil Saundalkar', 'Vaseem Ansari', 'Vedha Hiremath', 'Yusuf Khan']
  const topicsArray = [
  'HR',
  'Code Of Conduct',
  'Information Security',
  'Digital Marketing',
  'Values',
  'Learning & Development',
  'Dell',
  'Proctoring',
  'Adobe',
  'Tagging',
  'EDM',
  'SEO',
  'Email Etiquette',
  'Telephone Etiquette',
  'Corporate Etiquette',
  'Feedback',
  'Acknowledgement & Empathy',
  'Unconscious Bias',
  'Grammar & Punctuation',
  'Response vs Reaction',
  'Confidence Hacks',
  'Others'
];

  const [departmentSuggestions, setDepartmentSuggestions] = useState([]);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [managerSuggestions, setManagerSuggestions] = useState([]);
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedModalTopics, setSelectedModalTopics] = useState([]);
  const handleCheckboxChange = (topic) => {
    const isSelected = selectedTopics.includes(topic);
    if (isSelected) {
      setSelectedTopics(selectedTopics.filter((selectedTopic) => selectedTopic !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  
     if (name === 'role') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        role: value,
      }));
    }
    if (name === 'category' && value !== 'Assessment') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        topics: [], // Change 'topics' to 'topic'
      }));
    }
    if (name === 'topic' && formData.category === 'Induction') {
      const selectedTopics = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setFormData((prevFormData) => ({
        ...prevFormData,
        topics: selectedTopics, // Keep it as an array
      }), () => {
        console.log('Selected Topics:', formData.topics);
      });
    } else if (name === 'role') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        role: value,
      }));
    }else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
    if (name === 'fullName') {
      // Update fullName based on suggestions
      const filteredFullNames = emailData
        .map((item) => item.fullName)
        .filter((fullName) => fullName.toLowerCase().startsWith(value.toLowerCase()));
      
      setFullNameSuggestions(filteredFullNames);
  
      // Check if the entered value exactly matches one of the suggestions
      const selectedFullName = emailData.find(
        (item) => item.fullName.toLowerCase() === value.toLowerCase()
      );
  
      if (selectedFullName) {
        // Update other fields based on the selected fullName
        setFormData((prevFormData) => ({
          ...prevFormData,
          email: selectedFullName.email || '',
          mgrName: selectedFullName.mgrName || '',
          mgrEmail: selectedFullName.mgrEmail || '',
          department: selectedFullName.department || '',
        }));
      } else {
        // If the user is still typing, reset other fields
        setFormData((prevFormData) => ({
          ...prevFormData,
          email: '',
          mgrName: '',
          mgrEmail: '',
          department: '',
        }));
      }
    }}
  
    const [fullNameSuggestions, setFullNameSuggestions] = useState([]);


  const validateForm = () => {
    let isValid = true;

    if (!formData.fullName) {
      Swal.fire({
        title: 'Error!',
        text: 'Enter Full Name',
        icon: 'error',
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
        confirmButtonText: 'OK'
      })
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(formData.fullName)) {
      Swal.fire({
        title: 'Error!',
        text: 'Fullname should be of Alphabets only)',
        icon: 'error',
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
        confirmButtonText: 'OK'
      })
      isValid = false;
    }

   
    const emailRegex = /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      Swal.fire({
        title: 'Error!',
        text: 'Enter Valid EnFuse Email',
        icon: 'error',
        showConfirmButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#00B4D2'
      })
      isValid = false;
    }
    return isValid;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.email.endsWith('@enfuse-solutions.com')) {
      Swal.fire({
        icon: 'error',
        title: 'Email should end with @enfuse-solutions.com',
        text: 'Please use EnFuse email only',
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
      });
      return;
    }
  
    const randomNumber = Math.floor(Math.random() * 10000);
    const password = Math.random().toString(36).slice(-8);
    const createdAt = new Date();
    
    const username = formData.firstName + randomNumber
    const { category, mgrEmail, mgrName } = formData;
      
    let formDataWithFullName = {
      ...formData,
      
      username: username,
      password: password,
      confirmPassword: password,
      createdAt: createdAt,
      category: category,
      
    mgrName: mgrName, 
    mgrEmail: mgrEmail 
    };
  
    if (formData.category === 'Induction' && selectedModalTopics.length === 0) {
      return;
    } else if (formData.category === 'Induction') {
      formDataWithFullName = {
        ...formDataWithFullName,
        topics: selectedModalTopics.map((topic) => ({ topic, presenter })),
      };
    } else if (formData.category === 'Assessment' || 'Training') {
      formDataWithFullName = {
        ...formDataWithFullName,
        topics: [{ topic: formData.topic, presenter }],
      };
    }
    const isValid = validateForm();
    if (isValid) {
      const response = await fetch('http://52.44.231.112:6001/register/employee', {
        method: 'POST',
        body: JSON.stringify(formDataWithFullName),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json();
      console.log(data);
      if (response.status === 200) {
          Swal.fire({
          icon: 'success',
          title: 'Registered successfully',
          showConfirmButton: false,
          timer: 3000,
          confirmButtonText: 'OK'
        })
        navigate('/register')
        setFormData({
          fullName: '',
         
          email: '',
          role:''
        });
  
      } else if (response.status === 409) {
        Swal.fire({
          icon: 'error',
          title: 'Email or Username already in use',
          showConfirmButton: false,
          confirmButtonColor: '#00B4D2',
          confirmButtonText: 'OK',
          timer: 3000
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          showConfirmButton: false,
          confirmButtonColor: '#00B4D2',
          timer: 3000
        })
      }
    }
  }
  
  useEffect(() => {
    console.log('Selected Topics:', formData.topics);
  }, [formData.topics]); 

  const handleModalSubmit = () => {
    console.log('Selected Modal Topics:', selectedModalTopics);
    setFormData((prevFormData) => ({
      ...prevFormData,
      topics: selectedModalTopics,
    }));
    closeModal();
  };
  
  return (

    <div className="reg-container">

      <h1 style={{ fontSize: '25px', paddingBottom: ' 20px', fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: '#00B4D2' }}> Registration Form </h1>
      <form onSubmit={handleSubmit}>
        <label>Role:<span className='require'>*</span></label>
        <select name="role" className="reg-input" value={formData.role} onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
        </select>
        <br />
        <label>Full Name:<span className='require'>*</span></label>
<input
  type="text"
  className="reg-input"
  name="fullName"
  minLength={3}
  maxLength={20}
  value={formData.fullName}
  required
  onChange={handleChange}
  placeholder="Enter full name"
  list="fullNameSuggestions"
/>
<datalist id="fullNameSuggestions">
  {fullNameSuggestions.map((fullName, index) => (
    <option key={index} value={fullName} />
  ))}
</datalist><br />
        
        <label>Email:<span className='require'>*</span></label>
        <input
          className="reg-input"
          type="text"
          name="email"
          value={formData.email}
          maxLength={50}
          required
          onChange={handleChange}
          pattern="[a-zA-Z0-9._%+-]+@enfuse-solutions\.com"
          placeholder="@enfuse-solutions.com"
          
        />
        <datalist id="emailSuggestions">
          {emailSuggestions.map((email, index) => (
            <option key={index} value={email} />
          ))}
        </datalist>
        <br />
        <br />

        {formData.role === 'Employee' && (
          <div>
            <label>Category:<span className='require'>*</span></label>
            <select name="category" className="reg-input" value={formData.category} onChange={handleChange}>
              <option value="">Select Category</option>
              <option value="Induction">Induction</option>
              <option value="Assessment">Assessment</option>
              <option value="Training">Training</option>
            </select>
            
            {formData.category === 'Assessment' && (

              <select
                name="topic"
                value={formData.topic}
                required
                style={{ marginLeft: '15px' }}
                onChange={handleChange}
                className="reg-input"
              >
                <option value="">Select Topic</option>
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
            )}
            {formData.category === 'Training' && (

              <select
                name="topic"
                value={formData.topic}
                required
                style={{ marginLeft: '15px' }}
                onChange={handleChange}
                className="reg-input"
              >
                <option value="">Select Topic</option>
                <option value="Information Security">Information Security</option>
                <option value="Code Of Conduct">Code Of Conduct</option>
                <option value="EI for Managers">EI for Managers</option>
                <option value="Feedback">Feedback</option>
                <option value="Values">Values</option>
                <option value="Acknowledgement & Empathy">Acknowledgement & Empathy</option>
                <option value="Unconscious Bias">Unconscious Bias</option>
                <option value="Grammar & Punctuation">Grammar & Punctuation</option>
                <option value="Diversity, Inclusion and Equity">Diversity, Inclusion and Equity</option>
                <option value="Emotional intelligence">Emotional Intelligence</option>
                <option value="Parts of Speech">Parts of Speech</option>
                <option value="Others">Others</option>
              </select>
            )}

{formData.category === 'Induction' && (
        <>
          <button onClick={openModal}>Select Topics</button>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Induction Options"
            style={{
              content: {
                width: '300px', 
                height: '400px', 
                margin: 'auto',
                
              },
            }}
          >
            <div>
            <option disabled>Topics for Induction</option>
            <br/>
              {['HR', 'Code Of Conduct', 'Information Security', 'Digital Marketing','Values','Learning & Development','Dell','Proctoring','Adobe','Tagging','EDM','SEO','Email Etiquette','Telephone Etiquette','Corporate Etiquette','Feedback','Acknowledgement & Empathy','Unconscious Bias','Grammar & Punctuation','Response vs Reaction','Confidence Hacks','Others'].map(
                (option) => (
                  <div key={option}>
                    <input
                      type="checkbox"
                      id={option}
                      name={option}
                      checked={selectedModalTopics.includes(option)}
                      onChange={() => {
                        const updatedTopics = selectedModalTopics.includes(option)
                          ? selectedModalTopics.filter((topic) => topic !== option)
                          : [...selectedModalTopics, option];

                        setSelectedModalTopics(updatedTopics);
                      }}
                    />
                    <label htmlFor={option}>{option}</label>
                  </div>
                )
              )}
            </div>

            <button className='send-button' onClick={handleModalSubmit}>OK</button>
          </Modal>
        </>
      )}
  <br />
            <label>Presenter:</label>
            
<input
  type="text"
  className="reg-input"
  name="presenter"

  value={presenter}
  onChange={(e) => {
    const { value } = e.target;
    setPresenter(value);
  }}
  onBlur={() => {
    if (!presentersArray.includes(presenter)) {
      setPresenter('');  // Reset presenter if not in the list
      Swal.fire({
        title: 'Error!',
        text: 'Enter Valid Presenter Name',
        icon: 'error',
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
        confirmButtonText: 'OK'
      });
    }
  }}
  placeholder="Start typing presenter's name..."
  list="presenterSuggestions"
/>
<datalist id="presenterSuggestions">
  {presentersArray.map((name, index) => (
    <option key={index} value={name} />
  ))}
</datalist>
<br />
            <label>Department:<span className='require'>*</span></label>
            <input
              type="text"
              className="reg-input"
              name="department"
              value={formData.department}
              required
              onChange={handleChange}
              placeholder="Start typing department..."
              list="departmentSuggestions"
            />
            <datalist id="departmentSuggestions">
              {departmentSuggestions.map((department, index) => (
                <option key={index} value={department} />
              ))}
            </datalist>
            <br />
            <label>Manager Name:<span className='require'>*</span></label>
            <input
              type="text"
              className="reg-input"
              name="mgrName"
              minLength={3}
              maxLength={20}
              value={formData.mgrName}
              required
              onChange={handleChange}
              placeholder="Enter Manager Name"
              list="managerSuggestions"
              
            />
            <datalist id="managerSuggestions">
              {managerSuggestions.map((name, index) => (
                <option key={index} value={name} />
              ))}
            </datalist>
            <br />
            <label>Manager Email:<span className='require'>*</span></label>
            <input
              type="text"
              className="reg-input"
              name="mgrEmail"
              value={formData.mgrEmail}
              maxLength={50}
              required
              onChange={handleChange}
              placeholder="Manager Email will be autofilled"
              
            />

            <br />
          </div>
        )}
        <button
          className='send-button'
          type="submit"
          style={{ marginLeft: '80px' }}
        >
          Submit
        </button>
      </form>
      <center>
        <i><p style={{ color: '#00B4D2', fontWeight: 'bold' }}> *Register an Employee / Manager by selecting their Role</p></i></center>
    </div>
  )
}

export default Registration;