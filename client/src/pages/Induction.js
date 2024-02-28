import React, { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {CiRead, CiPen} from 'react-icons/ci'
import {AiOutlineDelete} from 'react-icons/ai'
import CustomStyles from '../components/CustomStyles';


const API = "http://localhost:6001/employee/induction";
 

function Induction() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);


const navigate = useNavigate();


  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  

  // const sendEmail = async (rowData) => {

  //   const { fullName, email, confirmPassword, topics} = rowData;
  //   const topicsList = topics.map(topic => ({
  //     topic: topic.topic,
  //     presenter: topic.presenter
  //   }));
  //   const res = await fetch("http://localhost:6001/user/induction", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       email, fullName, confirmPassword, topics: topicsList
  //     })
  //   });
  //   const data = await res.json();
  //   if (data.status === 401 || !data) {
  //     console.log("error")
  //   } else {
  //     const updateRes = await fetch(`http://localhost:6001/employee/${rowData._id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({
  //         status: "Email sent successfully"
  //       })
  //     });
      
  //     const updateData = await updateRes.json();
  //     console.log(updateData)
      
  //   }
  // }

  const sendEmail = async (rowData) => {
    const { fullName, email, confirmPassword, topics } = rowData;
    const topicsList = topics.map((topic) => ({
      topic: topic.topic,
      presenter: topic.presenter,
    }));
  
    const lastAddedTopic = topicsList.length > 0 ? topicsList[topicsList.length - 1].topic : '';
    const lastAddedPresenter = topicsList.length > 0 ? topicsList[topicsList.length - 1].presenter : '';
  
    const emailPayload = {
      email,
      fullName,
      confirmPassword,
      topics: topicsList,
      lastAddedTopic,
      lastAddedPresenter,
    };
  
    try {
      const res = await fetch("http://localhost:6001/user/induction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });
  
      const data = await res.json();
      if (data.status === 401 || !data) {
        console.log("error");
      } else {
        const updateRes = await fetch(`http://localhost:6001/employee/${rowData._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Email sent successfully",
          }),
        });
  
        const updateData = await updateRes.json();
        console.log(updateData);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      // Handle error scenario
    }
  };
  

  
  const fetchUsers = async (url) => {
    try {
      let res;
      if (searchQuery.trim() !== '') {
        res = await fetch(`${url}?search=${searchQuery}`);
      } else {
        res = await fetch(url);
      }
      const data = await res.json();
      if (data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      const updatedUserList = await fetchUsers(API);
      setData(updatedUserList);
    };
    fetchData();
  }, [searchQuery]);


  
  useEffect(() => {
    const reversedData = [...data].reverse();
    setFilteredData(
      reversedData.filter(
        row =>
          row.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const viewCandidate = (email) => {
    navigate('/hr/view/' + email)
  }

  const editCandidate = (id) => {
    navigate('/hr/edit/' + id)
  }

  const handleDelete = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00B4D2',
      cancelButtonColor: '#8C8C8C',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteRequests = selectedRows.map(row => fetch(`http://localhost:6001/admin/users/${row._id}`, {
            method: 'DELETE'
          }));
          await Promise.all(deleteRequests);
  
          // Update the user list in state after successful deletion
          setData(data.filter(user => !selectedRows.includes(user)));
  
          Swal.fire({
            icon: 'success',
            title: 'Employees have been deleted successfully',
            showConfirmButton: true,
            confirmButtonColor: '#00B4D2',
          });
        } catch (error) {
          console.error('Error deleting users:', error);
          Swal.fire({
            icon: 'error',
            title: 'Failed to delete the Employees',
            showConfirmButton: true,
            confirmButtonColor: '#00B4D2',
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          icon: 'info',
          title: 'Cancelled by Admin',
          showConfirmButton: true,
          confirmButtonColor: '#00B4D2',
        });
      }
    });
  };

  const columns = [
    {
      name: "Name",
      selector: row => row.fullName,
      sortable: true,
      sortFunction: (a, b) => a.fullName.localeCompare(b.fullName),
      cell: row => <span className="custom-cells">{row.fullName}</span>,
      width: "200px"
    },
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
      cell: row => <span className="custom-cell">{row.email}</span>,
      width: "300px"
    },
    {
      name: 'Training',
      selector: (row) => {
        // Extract the last added topic from the topics array
        const lastAddedTopic = row.topics.length > 0 ? row.topics[row.topics.length - 1].topic : 'No topics available';
        return lastAddedTopic;
      },
      sortable: true,
      width: "200px"
    },
    {
      name: 'Presenter',
      selector: (row) => {
        // Extract the last added topic from the topics array
        const lastAddedPresenter = row.topics.length > 0 ? row.topics[row.topics.length - 1].presenter : 'No topics available';
        return lastAddedPresenter;
      },
      sortable: true,
      width: "200px"
    },
    
    {
      name: "Actions",
      cell: row => (
        <div>
          <button  title='View' onClick={() => viewCandidate(row._id)} className="action-button" ><CiRead color='#fff' /></button>
          <button  title='Edit' onClick={() => editCandidate(row._id)} className="action-button" ><CiPen color= '#fff' /></button>
          <button  title='Delete' onClick={() => handleDelete(row)} className="action-button" ><AiOutlineDelete color= '#fff' /></button>
        </div>
      ),
      ignoreRowClick: true,
      
     
      width: "140px"
    },
  ];

  const handleSendEmail = async () => {

    const loadingSwal = Swal.fire({
      icon: 'info',
      title: 'Sending Emails...',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
      for (const row of selectedRows) {
        await sendEmail(row);
      }

      loadingSwal.close();

      Swal.fire({
        icon: 'success',
        title: 'Credentials Sent successfully',
        showConfirmButton: false,
        confirmButtonColor: '#00B4D2',
        timer: 3000,
      });
    } catch (error) {

      loadingSwal.close();

      Swal.fire({
        icon: 'error',
        title: 'Failed to send email',
        showConfirmButton: true,
        confirmButtonColor: '#00B4D2',
      });
    }
  };

  return (
  
      <div className="table-container">
      <h1 style={{ color: '#00B4D2', fontWeight: 'bold'}}> Welcome to the Induction Dashboard </h1>
 
        <div className="search-filter2">
        <input
        placeholder="Search Employee by Name  / Email here"
        type="text"
        value={searchQuery}
        className="search-field"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
          {/* <button type="submit"><BsSearch/></button> */}
          <button className="send-button" title='send Email' style={{ visibility: "visible", color:'#fff'}} disabled={selectedRows.length === 0} onClick={handleSendEmail} >
          Send Mail
        </button>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          selectableRows
          onSelectedRowsChange={handleRowSelected}
          selectedRows={selectedRows}
          fixedheader
          pagination
          paginationPerPage={10}
          className="dataTable"
          customStyles={CustomStyles}
        />
        <br />
        <center>
       
        <i><p style={{ color: '#00B4D2' }}> *Select an Employee and click on Send Email button to send their Feedback through Email</p></i></center>
      </div>


   
  );

}

export default Induction;