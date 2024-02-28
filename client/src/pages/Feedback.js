import React, { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import * as XLSX from 'xlsx';
import {FiDownload} from 'react-icons/fi'
import Modal from 'react-modal';


const API = "http://52.44.231.112:6001/employee/induction";
Modal.setAppElement('#root'); 

function Feedback() {
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [expandedFeedbacks, setExpandedFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);


  const openModal = (feedback) => {
    setSelectedFeedback(feedback);
  };

  const closeModal = () => {
    setSelectedFeedback(null);
  };

  useEffect(() => {
    fetch('http://52.44.231.112:6001/employee/induction')
      .then(response => response.json())
      .then(data => {
        // Sort the data by createdAt timestamp or any other unique identifier in descending order
        const sortedData = data.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
        setData(sortedData);
        setFilteredData(sortedData);
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    setFilteredData(
      data.filter(
        row =>
          row.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const fetchUsers = async (url) => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.length > 0) {
        setData(data);
      }
    } catch (e) {
      console.error(e)
    }
  }
  
  const handleDownload = () => {
    const currentDate = new Date().toISOString().split('T')[0]; 
  const fileName = `feedback_${currentDate}.xlsx`;

    const formattedData = filteredData.map((row) => {
      const feedbacksData = row.feedbacks.map((feedback, index) => ({
        'Date of Joining': feedback.joiningDate
        ? new Date(feedback.joiningDate).toLocaleDateString('en-GB')
        : '-',
      'Date of Induction': feedback.dateOfInduction
        ? new Date(feedback.dateOfInduction).toLocaleDateString('en-GB')
        : '-',
        'Feedback For': feedback.feedbackFor,
        'Presenter': feedback.presenter,
        '1. Did you find the training relevant to your role and daily interactions?': feedback.question1,
        '2. Were the concepts explained clearly and effectively?': feedback.question2,
        '3. Was the trainer easy to understand?': feedback.question3,
        '4. Did the trainer effectively engage you and create a supportive and inclusive learning environment?': feedback.question4,
        '5. Do you feel that the training helped you enhance your understanding and knowledge?': feedback.question5,
        '6. Was the session conducted in a professional manner?':feedback.question6,
        
        '7.  Do you have any suggestions for enhancing the training experience?': feedback.comment,
      }));
  
      return {
        'Name': row.fullName,
        'Email': row.email,
        ...Object.assign({}, ...feedbacksData), // Spread the feedback data into the object
      };
    });
  
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedbacks');
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    fetchUsers(API);
  }, [])

 
  
  const customStyles = {
    rows: {
      padding: '12px',
      
      style: {
        minHeight: '30px',
        lineHeight: '30px',
        backgroundColor: '#fff',
        overflowX: 'hidden auto',
       
      },
    },
    table: {
      style: {
        minWidth: "100%", 
      },
    },
    headCells: {
      style: {
        backgroundColor: 'rgb(8, 8, 68)',
        color: '#FFFF',
        paddingLeft: '15px',
        height: '40px !important',
        fontWeight: 'bolder',
        textAlign: 'center',
      },
    },
    cells: {
      style: {
        padding: '15px',
        width: "100px",
        
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        alignItems: 'center',
        textAlign: 'center',
      },
    },
    pagination: {
      style: {
        backgroundColor: '#fff',
        height: '30px !important',
        border: 'none',
        color: 'rgba(3, 4, 44, 0.87)',
        display: "flex",
        alignItems: "center",
        minHeight: '30px',
        lineHeight: '30px',
        fontWeight: 'bold'
      },
      pageButtonsStyle: {
        border: 'none',
        cursor: 'pointer',
        margin: '0 5px',
        padding: '1px',
        width: '20%',
        height: '23px !important',
        color: '#fff !important',
     
      },
    },
  };

  const columns = [
    {
      name: "Induction Date",
      selector: row => {
        if (row.feedbacks && row.feedbacks.length > 0) {
          const lastFeedback = row.feedbacks[row.feedbacks.length - 1];
          if (lastFeedback.dateOfInduction) {
            return new Date(lastFeedback.dateOfInduction);
          }
        }
        return new Date(0); // Default date if there are no feedbacks
      },
      sortable: true,
      format: row => {
        if (row.feedbacks && row.feedbacks.length > 0) {
          const lastFeedback = row.feedbacks[row.feedbacks.length - 1];
          if (lastFeedback.dateOfInduction) {
            const date = new Date(lastFeedback.dateOfInduction);
            return date.toLocaleDateString();
          }
        }
        return "-";
      },
      width: "175px",
    },
    
   
    // {
    //   name: "Induction Date",
    //   selector: row => {
    //     if (row.feedbacks && row.feedbacks[0]?.dateOfInduction) {
    //       return new Date(row.feedbacks[0].dateOfInduction);
    //     } else {
    //       return new Date(0); 
    //     }
    //   },
    //   sortable: true,
    //   format: row => {
    //     if (row.feedbacks && row.feedbacks[0]?.dateOfInduction) {
    //       const date = new Date(row.feedbacks[0].dateOfInduction);
    //       return date.toLocaleDateString();
    //     } else {
    //       return "-";
    //     }
    //   },
    //   width: "175px",
    // },
    
    {
      name: "Full Name",
      width: "150px",
      selector: row => row.fullName,
      sortable: true,
      sortFunction: (a, b) => a.fullName.localeCompare(b.fullName),
      cell: row => <span className="custom-cells">{row.fullName}</span>
    },
    {
      name: "Email",
      width: "300px",
      selector: row => row.email,
      sortable: true,
      cell: row => <span className="custom-cell">{row.email}</span>,
      
    },
    {
      name: "Feedback",
      selector: "feedbacks",
      cell: (row) => (
        <div>
          <div style={{ display: 'flex' }}>
            {row.feedbacks.slice(-3).map((feedback, index) => (
              <button
                key={index}
                className={expandedFeedbacks[row._id]?.[feedback._id] ? 'active-feedback-button' : 'feedback-button'}
                style={{ marginRight: '5px' }}
                onClick={() => toggleFeedback(row._id, feedback._id)}
              >
                {feedback.feedbackFor}
              </button>
            ))}
          </div>
          {row._id in expandedFeedbacks &&
            row.feedbacks.slice(-3).map((feedback, index) => (
              <div
                key={index}
                style={{ marginBottom: '5px', textAlign: 'left', display: expandedFeedbacks[row._id][feedback._id] ? 'block' : 'none' }}
              >
                <div style={{fontWeight: 'bold'}}>
                  Presenter:{feedback.presenter}
                </div>
                <div>
                  <strong>1. Did you find the training relevant to your role and daily interactions?: </strong> {feedback.question1}
                </div>
                <div>
                  <strong>2. Were the concepts explained clearly and effectively?: </strong> {feedback.question2}
                </div>
                <div>
                <strong>3. Was the trainer easy to understand?: </strong> {feedback.question3}
              </div>
              <div>
                <strong>4. Did the trainer effectively engage you and create a supportive and inclusive learning environment?: </strong> {feedback.question4}
              </div>
              <div>
                <strong>5. Do you feel that the training helped you enhance your understanding and knowledge?: </strong> {feedback.question5}
              </div>
              <div>
                <strong>6. Was the session conducted in a professional manner?: </strong> {feedback.question6}
              </div>
              <hr />
              <div>
                <strong>7.  Do you have any suggestions for enhancing the training experience?:</strong> {feedback.comment}
              </div>              
              </div>
            ))}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      cellWrap: true,
    },
  ];
  
  const toggleFeedback = (rowId, feedbackId) => {
    setExpandedFeedbacks((prevState) => ({
      ...prevState,
      [rowId]: {
        ...prevState[rowId],
        [feedbackId]: !prevState[rowId]?.[feedbackId],
      },
    }));
  };

  
  return (
    <div className='table-container'>
      <div className='search-filter2'>
        <input type="text" value={searchQuery} className='send' onChange={(e) => setSearchQuery(e.target.value)} placeholder='Type Name here' />
        <h1 style={{ color: '#00B4D2', fontWeight: 'bold'}}>Total Employees:  {data.length}</h1>
        <button title="Download Feedback" onClick={handleDownload} className='download-button' >Feedback <FiDownload /></button>
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        fixedheader
        pagination
        paginationPerPage={10}
        customStyles={customStyles}
        className="data-table-container"
      />
      
      <br />
      
      <center><i><p style={{ color: '#00B4D2', fontWeight: 'bold'}}> *Displaying the most recent induction details, including up to 3 feedbacks</p></i></center>
    </div>
  )
}

export default Feedback;