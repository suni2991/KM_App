import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import logo from "../Assets/LnD Logo2.png"
import Swal from 'sweetalert2';
import "../styles/FeedbackForm.css"
import { FaStroopwafel } from 'react-icons/fa';

const FeedbackForm = () => {
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfInduction: '',
    joiningDate: '',
    feedbackFor: '',
    presenter: '',
    question1: 0,
    question2: 0,
    question3: 0,
    question4: 0,
    question5: 0,
    question6: 0,
    comment: ''
  });
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const employeeId = auth._id;
  const presentersArray = ['Arjun Mehra', 'Anuja Gaikwad', 'Ashish Kurvelli', 'Bhavesh Bhatu', 'Danish Kably', 'Faizan Ansari', 'Feroz Sumara', 'Imran Ansari', 'Kamran Shaikh', 'Mahek Shaikh', 'Manish Kareya', 'Munazir Ansari', 'Parthiv Bhaskar', 'Reema Thakur', 'Ruhail Shaikh', 'Sadaf Khan', 'Sahil Shah', 'Salman Khan', 'Shahid Ansari', 'Sridhar Mogli', 'Suhail Syed', 'Sunil Saundalkar', 'Vaseem Ansari', 'Vedha Hiremath', 'Yusuf Khan', 'Zaynulabedin Mira', 'Zeeshan Dabir']
  // const presenterArray =const [userEmail, setUserEmail] = useState('');
  const [searchText, setSearchText] = useState('');
  const [autoSuggestData, setAutoSuggestData] = useState([]);
  const [isEmailSelected, setIsPresenterSelected] = useState(false);




  const searchPresenter = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value
    }));
    let searchText = e.target.value;
    setIsPresenterSelected(false);
    setSearchText(searchText);
    let emails = presentersArray.filter(presenter => {
      const regex = new RegExp(`^${searchText}`, 'gi');
      return presenter.match(regex)
    })
    setAutoSuggestData(emails)
  };

  const handleInputChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value
    }));

  };

  const handleRatingChange = (question, newRating) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [question]: newRating
    }));
  };

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      email: auth.email,
      fullName: auth.fullName,
      feedbackFor: auth.topics[auth.topics.length - 1].topic,
      presenter: auth.topics[auth.topics.length -1].presenter // Pre-fill the email with the logged-in user's email
    }));
  }, [auth.email, auth.fullName, auth.topics, auth.presenter]);

  const handleSubmit = (e) => {
    e.preventDefault();

  if (
    formData.fullName === '' ||
    formData.email === '' ||
    formData.dateOfInduction === '' ||
    formData.joiningDate === '' ||
    formData.feedbackFor === '' ||
    formData.presenter === '' ||
    formData.question1 === 0 ||
    formData.question2 === 0 ||
    formData.question3 === 0 ||
    formData.question4 === 0 ||
    formData.question5 === 0 ||
    formData.question6 === 0 ||
    formData.comment === ''
  ) {
    // Show an alert if any field is not filled
    Swal.fire({
      icon: 'error',
      title: 'Please Answer all the Questions',
      showConfirmButton: false,
      timer: 3000,
      confirmButtonText: 'OK',
    });
    return;
  }

    // Create a new feedback object using the formData
    const newFeedback = {
      dateOfInduction: formData.dateOfInduction,
      joiningDate: formData.joiningDate,
      feedbackFor: formData.feedbackFor,
      presenter: formData.presenter,
      question1: formData.question1,
      question2: formData.question2,
      question3: formData.question3,
      question4: formData.question4,
      question5: formData.question5,
      question6: formData.question6,
      comment: formData.comment,
      feedbackStatus: 'Received',
      topics: [
        {
          inductionStatus: 'Received', // Update the inductionStatus here
        },
      ],
    };

 
    const employeeId = auth._id; 


    fetch(`http://52.44.231.112:6001/employee/${employeeId}`)
      .then((response) => response.json())
      .then((data) => {
       
        const feedbacksArray = data.data.feedbacks || [];
        const topicsArray = data.data.topics || [];
       
        if (newFeedback.feedbackStatus === 'Received') {
          feedbacksArray.push(newFeedback);
        }

        const currentTopic = formData.feedbackFor;
        const currentTopicIndex = topicsArray.findIndex(topic => topic.topic === currentTopic);

      if (currentTopicIndex !== -1) {
      
        topicsArray[currentTopicIndex].inductionStatus = 'Received';
      }
      const updatedEmployeeData = { ...data.data, feedbacks: feedbacksArray, topics: topicsArray };
        
        return fetch(`http://52.44.231.112:6001/employee/${employeeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedEmployeeData),
        });
      })
      .then((response) => response.json())
      .then((updatedData) => {
        console.log('Feedback data added successfully:', updatedData);
        Swal.fire({
          icon: 'success',
          title: 'Thanks for your Feedback',
          showConfirmButton: false,
          timer: 3000,
          confirmButtonText: 'OK',
        });
        setTimeout(() => {
          setAuth({});
          navigate('/');
        }, 3000);
      })
      .catch((error) => {
        console.error('Error adding feedback data:', error);
      });
  };

  const nextPage = () => {
    if (
      formData.fullName === '' ||
      formData.email === '' ||
      formData.dateOfInduction === '' ||
      formData.joiningDate === '' ||
      formData.feedbackFor === '' ||
      formData.presenter === ''
    ) {
      
      Swal.fire({
        icon: 'error',
        title: 'Please fill all the fields',
        showConfirmButton: false,
        timer: 3000,
        confirmButtonText: 'OK',
      });
      return; 
    }

    const currentDate = new Date();
    const dateOfInduction = new Date(formData.dateOfInduction);
    const dateOfJoining = new Date(formData.joiningDate);
  
  if (dateOfJoining >= dateOfInduction) {
    Swal.fire({
      icon: 'error',
      title: 'Date of Joining should be Older than Date of Induction',
      showConfirmButton: false,
      timer: 3000,
      confirmButtonText: 'OK',
    });
    return; 
  }
  if (dateOfInduction <= currentDate) {
    setPage((prevPage) => prevPage + 1);
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Enter Date of Induction as current Date or future Date',
      showConfirmButton: false,
      timer: 3000,
      confirmButtonText: 'OK',
    });
  }
}
 
  const clearForm = () => {
    setFormData({
      fullName: '',
      email: '',
      dateOfInduction: '',
      joiningDate: '',
      feedbackFor: '',
      presenter: '',
      question1: 0,
      question2: 0,
      question3: 0,
      question4: 0,
      question5: 0,
      question6: 0,
      comment: ''
    });
  };


  const prevPage = () => {
    setPage((prevPage) => prevPage - 1);
  };

  const renderPageOne = () => {
    const isFeedbackForChanged = formData.feedbackFor !== auth.topics[auth.topics.length - 1].topic;
    return (
      <>
        <div className='fd-container Feedback_form_wrapper '>
         <div className='multiple_align_content'>
         <label className='fd-label' htmlFor="name">Name:</label>
          <br />
          <input
            autoFocus
            // className='width-50'
            className='reg-inputs'
            type="text"
            id="name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            readOnly
          />
          <br />
          </div>
          <div className='multiple_align_content'>
          <label className='fd-label' htmlFor="email">Email:</label>
          <br />
          <input
            autoFocus
            // className='width-50'
            className='reg-inputs'
            type="text"
            id="email"
            name="email"
            readOnly
            value={formData.email}
            onChange={handleInputChange}
          />
         </div>
          <br />
          <div className='multiple_align_content'>
          <label className='fd-label' htmlFor="date-of-induction">Date Of Induction:</label>
          <br />
          <input
            autoFocus
            // className='width-50'
            type="date"
            className='reg-inputs-dd'
            id="date-of-induction"
            name="dateOfInduction"
            value={formData.dateOfInduction}
            onChange={handleInputChange}
          />
          </div>
          <br />
          <div className='multiple_align_content'>
          <label className='fd-label' htmlFor="joining-date">Joining Date:</label>
          <br />
          <input
            autoFocus
            // className='width-50'
            type="date"
            id="joining-date"
            className='reg-inputs-dd'
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleInputChange}
          />
          </div>
          <br />
          <div className='multiple_align_content'>
          <label className='fd-label' htmlFor="feedback">Feedback being provided for:</label>
          <br />
          <select
            className='reg-inputs'
            name="feedbackFor"
            id="feedback"
            readOnly={isFeedbackForChanged}
            value={formData.feedbackFor}
            onChange={handleInputChange}
          >
            <option value="chooseone">Choose One</option>
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

          <br />
          </div>
          <div className='multiple_align_content'>
          <label className='fd-label' htmlFor="presenter">Presenter:</label>
          <br />

          <input
            autoFocus
            className='reg-inputs'
            // className='width-50'
            type="text"
            name="presenter"
            id="presenter"
            value={formData.presenter}
            onChange={searchPresenter}
          />
          </div>
          <div className='next-button'>
            {searchText.length > 0 && !isEmailSelected && Array.isArray(autoSuggestData) && autoSuggestData.map((el) => (
              <span
                onClick={() => {
                  setIsPresenterSelected(true)
                  // setUserEmail(el.email);
                  setFormData((prev) => ({ ...prev, presenter: el }))
                }}
                style={{
                  background: '#fff',
                  width: '185px',
                  height: '20px',
                  margin: '5px',
                  cursor: 'pointer'
                }}
              >
                {el}
              </span>
            ))}
          </div >

          <br />
          <div className='multiple_align_content next_pre_btn'>
          <div className='fd-buttons feedback_form'>
            <button type="button" className='send-button' style={{ float: 'left', margin: '0px 25px 0px 110px', width: '20%' }} onClick={nextPage}>
              Next
            </button>
            <button type="button" className='send-button' style={{ float: 'right', margin: '0px 115px 0px 25px', width: '20%' }} onClick={clearForm}>Clear Form</button>
          </div>
          </div>
        </div>
      </>
    );
  };

  const renderPageTwo = () => {
    return (

      <>

        <div className='fd-container'>
          <h2>We'd Like to Here From you! </h2>
          <h3>Provide Your Rating <span>(1 Being the Lowest, 5 Being the Highest )</span></h3>
          <div className='fd-rating'>

            <div>
              <label>
                1. Did you find the training relevant to your role and daily interactions?
                              </label>
              <br />
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  filled={star <= formData.question1}
                  onClick={() => handleRatingChange('question1', star)}
                />
              ))}
            </div>

            <div>
              <label>2. Were the concepts explained clearly and effectively?</label>
              <br />
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  filled={star <= formData.question2}
                  onClick={() => handleRatingChange('question2', star)}
                />
              ))}
            </div>

            <div>

              <label>3. Was the trainer easy to understand?</label>
              <br />
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  filled={star <= formData.question3}
                  onClick={() => handleRatingChange('question3', star)}
                />
              ))}
            </div>

            <div>

              <label>
                4. Did the trainer effectively engage you and create a supportive and inclusive learning environment?          </label>
              <br />
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  filled={star <= formData.question4}
                  onClick={() => handleRatingChange('question4', star)}
                />
              ))}
            </div>

            <div>

              <label>5. Do you feel that the training helped you enhance your understanding and knowledge?</label>
              <br />
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  filled={star <= formData.question5}
                  onClick={() => handleRatingChange('question5', star)}
                />
              ))}
            </div>
            <div>

              <label>6. Was the session conducted in a professional manner?</label>
              <br />
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  filled={star <= formData.question6}
                  onClick={() => handleRatingChange('question6', star)}
                />
              ))}
            </div>

            <div className='kindly_wrapper'>
              <div>
                <label>7.  Do you have any suggestions for enhancing the training experience?:</label>
              </div>
              <div className='text_area_dv'>
                <textarea
                  name="comment"
                  placeholder="Write Your Comment Here"
                  value={formData.comment}
                  onChange={handleInputChange}
                  cols={90} rows={3}
                />
              </div>
            </div>
            <div className='fd-buttons'>
              <button type="button" className='send-button' style={{ float: 'left', margin: '5px 0px 25px 0px' }} onClick={prevPage}>
                Previous
              </button>
              <button type="submit" className='send-button' style={{ float: 'right', margin: '5px 0px 25px 0px' }}>SUBMIT</button>
            </div>


          </div>
        </div>




      </>

    );
  };

  return (
    <div>
      <div className='header-banner'>
        <img width='2%' src={logo} alt="" />
        <h1>FEEDBACK FORM</h1>

      </div>

      <form onSubmit={handleSubmit}>
        {page === 1 ? renderPageOne() : renderPageTwo()}
      </form>
    </div>
  );
};

const Star = ({ filled, onClick }) => {
  // const starIcon = filled ? fasStar : farStar; 
  const starColor = filled ? '#ffb800' : 'lightgrey';


  return (
    <span className="star" onClick={onClick}>

      <FontAwesomeIcon icon={fasStar} style={{ color: starColor }} />
    </span>
  );
};



export default FeedbackForm