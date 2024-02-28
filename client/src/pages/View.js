import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/View.css';
import { FadeLoader } from 'react-spinners';
import { Table } from 'antd';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AiOutlineDelete } from 'react-icons/ai'

function View() {
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();
  let { id } = useParams();



  
  const handleScoreReset = async (rowKey) => {
    const topicToUpdate = employee.topics[rowKey];
  
    if (topicToUpdate) {
      // Show SweetAlert confirmation dialog
      Swal.fire({
        title: `Reset Score for ${topicToUpdate.topic}?`,
        text: 'Are you sure you want to reset the score for this topic?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#00B4D2',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, reset it!',
        cancelButtonText: 'Cancel',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // Proceed with resetting the score
            const response = await axios.put(
              `http://localhost:6001/employee/${id}/resetScore`,
              {
                topicId: topicToUpdate._id,
                newScore: -1,
              }
            );
  
            if (response.status === 200) {
              // Update the state immediately after successful update in the backend
              setEmployee((prevEmployee) => {
                const updatedTopics = prevEmployee.topics.map((topic, index) =>
                  index === rowKey ? { ...topic, score: -1 } : topic
                );
                return { ...prevEmployee, topics: updatedTopics };
              });
  
              // Optionally, store the updated employee object in localStorage
              localStorage.setItem('employeeData', JSON.stringify(employee));
              Swal.fire({
                icon: 'success',
                title: 'Scores has been reset successfully',
                showConfirmButton: true,
                confirmButtonColor: '#00B4D2',
                
              });
             
            } else {
              // Handle the error if the API call is not successful
              console.error('Failed to update score in the backend');
              Swal.fire({
                icon: 'error',
                title: 'Failed to update Score',
                showConfirmButton: true,
                confirmButtonColor: '#00B4D2',
                
              });
             
            }
          } catch (error) {
            console.error('Error resetting score:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error resetting Score',
              showConfirmButton: true,
              confirmButtonColor: '#00B4D2',
              
            });
            
          }
        }
      });
    }
  };
  
  
  // Fetch employee data and handle score reset on component mount and when assessmentData changes
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`http://localhost:6001/employee/${id}`);
        const data = await response.json();
        if (response.ok) {
          setEmployee(data.data);
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
    }else if (employee.category === 'Training') {
      navigate('/training');
    }
  };

  if (!employee) {
    return (
      <div style={{ margin: "250px auto" }}>
        <center>
          <FadeLoader color={"#00B4D2"} size={20} margin={2} />
        </center>
      </div>
    );
  }

  const assessmentData = employee.topics
  ? employee.topics.map((topic, index) => ({
      key: index,
      topic: topic.topic,
      score: topic.score === -1 ? 0 : topic.score,
      testCount: topic.testCount,
      topicId: topic._id,
    }))
  : [];

  const handleTopicDelete = async (rowKey, topicId) => {
    try {
      // Show SweetAlert confirmation dialog
      Swal.fire({
        title: 'Delete Topic',
        text: 'Are you sure you want to delete this topic?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#00B4D2',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // Send a DELETE request to the backend endpoint
            const response = await axios.delete(
              `http://localhost:6001/employee/${id}/topic/${topicId}`
            );

            if (response.status === 200) {
              // Update the state to remove the deleted topic
              setEmployee((prevEmployee) => {
                const updatedTopics = prevEmployee.topics.filter((_, index) => index !== rowKey);
                return { ...prevEmployee, topics: updatedTopics };
              });

              Swal.fire({
                icon: 'success',
                title: 'Topic has been deleted successfully',
                showConfirmButton: true,
                confirmButtonColor: '#00B4D2',
              });
            } else {
              console.error('Failed to delete the topic');
              Swal.fire({
                icon: 'error',
                title: 'Failed to delete the topic',
                showConfirmButton: true,
                confirmButtonColor: '#00B4D2',
              });
            }
          } catch (error) {
            console.error('Error deleting topic:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error deleting topic',
              showConfirmButton: true,
              confirmButtonColor: '#00B4D2',
            });
          }
        }
      });
    } catch (error) {
      console.error('Error handling topic delete:', error);
    }
  };
  

 

  // Function to handle score reset

  if (employee && employee.category === 'Training') {
    const lastTopic = employee.topics[employee.topics.length - 1];
  
    return (
      <div className="table-container">
        <h1 style={{ color: 'rgb(8, 8, 68)', textTransform: 'capitalize', fontWeight: 'bold' }}>
          Training - {employee.fullName}
        </h1>
        <br />
     
        <p>
          <span style={{ fontWeight: 'bold' }}>Email:</span> {employee.email}
        </p>
        <br />
        <hr />
        <h3 style={{ fontWeight: 'bold' }}>Last Added Topic:</h3>
        {lastTopic ? (
          <div>
            <p style={{ textTransform: 'capitalize' }}>
              <span style={{ fontWeight: 'bold' }}>Topic:</span> {lastTopic.topic}
            </p>
            <p style={{ textTransform: 'capitalize' }}>
              <span style={{ fontWeight: 'bold' }}>Training Status:</span> {lastTopic.trainingStatus}
            </p>
          </div>
        ) : (
          <p>No topics added yet.</p>
        )}
  
        <hr />
        <h2 style={{ color: 'Green', fontSize: '18px' }}>Status: {lastTopic.trainingStatus}</h2>
  

        <div className='back-button-container'>
          <button className='submit-button' onClick={handleRedirect} type='submit'>
            BACK
          </button>
        </div>
      </div>
    );
  }
  
  if (employee.category === 'Assessment') {
    const columns = [
      {
        title: 'Topic',
        dataIndex: 'topic',
        key: 'topic',
      },
      {
        title: 'Score',
        dataIndex: 'score',
        key: 'score',
      },
      {
        title: 'Test Taken',
        dataIndex: 'testCount',
        key: 'testCount',
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <div className='act-btn'>
            <button title='Reset Topic' className='submit-button' onClick={() => handleScoreReset(record.key)} style={{marginTop: '7px'}}>Reset</button>
            <button title= 'Delete Topic' onClick={() => handleTopicDelete(record.key, record.topicId)} className="action-button" style={{margin: '5px'}}><AiOutlineDelete color='#fff' /></button>
          </div>
        ),
      },
    ];

    return (
      <div>
        <div className='table-container'>
          <h1  style={{ color: '#00B4D2',  textTransform: "capitalize" , fontWeight: "bold"}}>Assessment - {employee.fullName}</h1>
          <br />
         
          <p><span style={{fontWeight: "bold"}}>Email:</span> {employee.email}</p>
          <p><span style={{fontWeight: "bold"}}>Password:</span> {employee.confirmPassword}</p>
          <br />
          <hr />
          <h3 style={{fontWeight: "bold"}}>Test Results:</h3>
    
          <Table
            dataSource={assessmentData}
            columns={columns}
            pagination={{
            
              total: employee.topics.length, 
              showSizeChanger: true, 
              pageSizeOptions: ['5', '10', '15'], }}
          />
          <hr />
          <p><span style={{fontWeight: "bold"}}>Manager Name:</span> {employee.mgrName}</p>
          <p><span style={{fontWeight: "bold"}}>Manager Email:</span> {employee.mgrEmail}</p>
        </div>

        <div className='back-button-container'>
          <button className='submit-button' onClick={handleRedirect} type="submit">BACK</button>
        </div>
      </div>
    );
  } else if (employee.category === 'Induction') {
    const columns = [
      {
        title: 'Topic',
        dataIndex: 'topic',
        key: 'topic',
      },
      {
        title: 'Status',
        dataIndex: 'inductionStatus',
        key: 'inductionStatus',
      },
    ];

    const inductionData = employee.topics
    ? employee.topics
        .map((topic, index) => ({
          key: index,
          topic: topic.topic,
          inductionStatus: topic.inductionStatus || "Not Provided",
        }))
        
    : [];

   

    return (
      <div className='table-container'>
        <div>
          <h1  style={{ color: '#00B4D2', fontWeight: 'bold' , textTransform: 'capitalize'}}>Induction - {employee.fullName}</h1>
          <br />
         
          <p><b>Email:</b> {employee.email}</p>
          <p><b>Password:</b> {employee.confirmPassword}</p><br/ >
          <p><span style={{fontWeight: "bold"}}>Feedback Details:</span></p>
          {inductionData.length > 0 ? (
            <Table dataSource={inductionData} columns={columns} pagination={{
              // pageSize: 5, // Number of items per page
              total: employee.topics.length, // Total number of items
              showSizeChanger: true, // Allow users to change page size
              pageSizeOptions: ['5', '10', '15'], }} />
          ) : (
            <p style={{color: '#00B4D2', textAlign: 'center'}}>No feedback received yet.</p>
          )}
          <p><span style={{fontWeight: "bold"}}>Manager Name:</span> {employee.mgrName}</p>
          <p><span style={{fontWeight: "bold"}}>Manager Email:</span> {employee.mgrEmail}</p>
        </div>


        <div className='back-button-container'>
          <button className='submit-button' onClick={handleRedirect} type="submit">BACK</button>
        </div>
      </div>
    );
  } else {
    return null; // Handle other categories if necessary
  }
}

export default View;
