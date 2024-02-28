import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { emailData } from '../Assets/EmailData';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { managerData } from '../Assets/ManagerData';


function Edit() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    category: '',
    fullName: '',
    mgrName: '',
    email: '',
    mgrEmail: '',
    topic: '',
    department: '',
  });

  const [employee, setEmployee] = useState({});
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [managerSuggestions, setManagerSuggestions] = useState([]);
  const { id } = useParams();
  const [presenter, setPresenter] = useState('');
  const presentersArray = ['Adam Pawaskar', 'Arjun Mehra', 'Anuja Gaikwad', 'Ashish Kurvelli', 'Bhavesh Bhatu', 'Cajetan Franco', 'Danish Kably', 'Faizan Ansari','Faizan Dalla', 'Feroz Sumara','Gokul Gajbhiye', 'Harshad Halbe', 'Hibah Kazi', 'Jatin Salve', 'Mahek Shaikh','Manish Kareya', 'Madan Takalikar', 'Mohammed Shaikh', 'Munazir Ansari','Nimit Kumar Goyal', 'Parthiv Bhaskar', 'Reema Thakur', 'Sadaf Khan', 'Sahil Shah','Saili Salve', 'Salman Khan','Saraswata Biswas', 'Shahid Ansari',  'Sunil Saundalkar', 'Vaseem Ansari', 'Vedha Hiremath', 'Yusuf Khan']
  const [setCategory] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`http://52.44.231.112:6001/employee/${id}`);
        const data = await response.json();
        if (response.ok) {
          setEmployee(data.data);
          setFormData(data.data);
          setCategory(data.data.category);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
      }
    };
    fetchEmployee();
  }, [id]);


  const handleRedirect = () => {
    if (employee.category === 'Assessment') {
      navigate('/admin');
    } else if (employee.category === 'Induction') {
      navigate('/induction');
    }
  };

  const validateForm = () => {
    let isValid = true;
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name === 'category' && value !== 'Assessment') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        topics: [],
      }));
    }
    if (name === 'email') {
      const filteredEmails = emailData
        .map((item) => item.email)
        .filter((email) => email.toLowerCase().startsWith(value.toLowerCase()));
      setEmailSuggestions(filteredEmails);
    }

    if (name === 'mgrName') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
        mgrEmail: managerData.find((item) => item.mgrName === value)?.mgrEmail || '',
      }));

      const filteredManagerNames = managerData
        .map((item) => item.mgrName)
        .filter((name) => name.toLowerCase().startsWith(value.toLowerCase()));

      setManagerSuggestions(filteredManagerNames);
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
    if (name === 'category') {
      if (value === 'Assessment') {

        setFormData((prevFormData) => ({
          ...prevFormData,
          topics: [],
        }));
      } else if (value === 'Induction') {

        setFormData((prevFormData) => ({
          ...prevFormData,
          topics: [],
        }));
      } else if (value === 'Training') {

        setFormData((prevFormData) => ({
          ...prevFormData,
          topics: [],
        }));
      }
    }
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

    const { topic, category, topics } = formData;
    const isValid = validateForm();
    const createdAt = new Date();
    const password = Math.random().toString(36).slice(-8);
  
    if (isValid) {
      // const fullName = `${formData.firstName} ${formData.lastName}`;
  
      let formDataToUpdate = {
        ...formData,
      
        createdAt: createdAt,
        category: category,
        password: password,
        confirmPassword: password
      };
  
      if (topic) {
        const lastIndex = topics ? topics.length : 0;
        const newTopic = {
          topic: topic,
          score: -1,
          presenter: presenter,
        };
  
        if (topics && topics.some((item) => item.topic === topic)) {
          Swal.fire({
            icon: 'error',
            title: 'Oops',
            text: 'The selected topic already exists',
            showConfirmButton: true,
            confirmButtonColor: '#00B4D2',
          });
          return;
        }
  
        if (!topics || lastIndex === topics.length) {
          formDataToUpdate.topics = [...topics, newTopic];
        } else {
          formDataToUpdate.topics[lastIndex] = newTopic;
        }
      }
  
      try {
        const result = await axios.put(`http://52.44.231.112:6001/employee/${id}`, formDataToUpdate);
        if (formData.category === 'Assessment') {
          navigate('/admin');
        } else if (formData.category === 'Induction') {
          navigate('/induction');
        } else if (formData.category === 'Training') {
          navigate('/training');
        }
        console.log(result.data);
      } catch (error) {
        console.error(error);
      }
    }
  };


  return (
    <div className="reg-container">
      <h1 style={{ fontSize: '25px', paddingBottom: ' 20px', fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: '#00B4D2' }}>
        Update an Employee
      </h1>

    

      <form onSubmit={handleSubmit}>
        
        <label>Full Name:</label>
        <input
          type="text"
          className="reg-input"
          name="fullName"
          minLength={3}
          maxLength={20}
          value={formData.fullName}
          required
          onChange={handleChange}
          placeholder="Enter Full name"
        />
        <br />
        <label>Email:</label>
        <input
          className="reg-input"
          type="text"
          name="email"
          value={formData.email}
          maxLength={50}
          required
          onChange={handleChange}
          placeholder="Enter valid Mail Id"
          list="emailSuggestions"
        />
        <datalist id="emailSuggestions">
          {emailSuggestions.map((email, index) => (
            <option key={index} value={email} />
          ))}
        </datalist>
        <br />
        <label>Category:</label>
        <select name="category" className="reg-input" value={formData.category} onChange={handleChange}>
          <option value="">Select Category</option>
          <option value="Induction">Induction</option>
          <option value="Assessment">Assessment</option>
        </select>
        {formData.category === 'Assessment' && (

          <select
            name="topic"
            value={formData.topic}
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

        

        {formData.category === 'Induction' && (
          <select
            name="topic"
            value={formData.topic}
            style={{ marginLeft: '15px' }}
            onChange={handleChange}
            className="reg-input"
          >
           <option value="">Select Topic</option>
                <option value="HR">HR</option>
            <option value="Code Of Conduct">Code Of Conduct</option>
            <option value="Information Security">Information Security</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Values">Values</option>
            <option value="Learning & Development">Learning & Development</option>
            <option value="Dell">Dell</option>
            <option value="Proctoring">Proctoring</option>
            <option value="Adobe">Adobe</option>
            <option value="Tagging">Tagging</option>
            <option value="EDM">EDM</option>
            <option value="SEO">SEO</option>
            <option value="Email Etiquette">Email Etiquette</option>
            <option value="Telephone Etiquette">Telephone Etiquette</option>
            <option value="Corporate Etiquette">Corporate Etiquette</option>
            <option value="Feedback">Feedback</option>
            <option value="Acknowledgement & Empathy">Acknowledgement & Empathy</option>
            <option value="Unconscious Bias">Unconscious Bias</option>
            <option value="Grammar & Punctuation">Grammar & Punctuation</option>
            <option value="Response vs Reaction">Response Vs Reaction</option>
            <option value="Confidence Hacks">Confidence Hacks</option>
            <option value="Others">Others</option>
          </select>
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
      setPresenter('');  
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
        <label>Manager Name:</label>
        <input
          type="text"
          className="reg-input"
          name="mgrName"
          minLength={3}
          maxLength={20}
          value={formData.mgrName}
          required
          onChange={handleChange}
          onBlur={() => {
            if (!managerData.some(manager => manager.mgrName === formData.mgrName)) {
              setFormData(prevFormData => ({
                ...prevFormData,
                mgrName: '', // Reset the manager name if it's not valid
                mgrEmail: '', // Reset the manager email as well
              }));
              Swal.fire({
                title: 'Error!',
                text: 'Enter Valid Manager Name',
                icon: 'error',
                showConfirmButton: true,
                confirmButtonColor: '#00B4D2',
                confirmButtonText: 'OK'
              });
            }
          }}
          placeholder="Enter Manager Name"
          list="managerSuggestions"
        />
        <datalist id="managerSuggestions">
          {managerSuggestions.map((name, index) => (
            <option key={index} value={name} />
          ))}
        </datalist>
        <br />
        <label>Manager Email:</label>
        <input
          type="text"
          className="reg-input"
          name="mgrEmail"
          value={formData.mgrEmail}
          maxLength={50}
          required
          onChange={handleChange}
          placeholder="Manager Email will be autofilled"
          disabled
        />
        <br />
        <div className='back-button-container'>
          <button className="send-button" type="submit" style={{ marginLeft: '80px' }}>UPDATE</button>
          <button className='send-button' onClick={handleRedirect} type="submit">BACK</button>
        </div>
      </form>
      <center><i><p style={{ color: '#00B4D2', fontWeight: 'bold' }}> *You can Edit the Employee details / can change the Category & Topic as well</p></i></center>
   </div>
  );
}

export default Edit;