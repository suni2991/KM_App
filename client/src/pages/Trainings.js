import React, { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import CustomStyles from '../components/CustomStyles';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {CiRead, CiPen} from 'react-icons/ci'
import {AiOutlineDelete} from 'react-icons/ai'

const API = "http://localhost:6001/nominations";
 

function Training() {

  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
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

  const handleNominate = () => {
    navigate('/calendar')
  }

  useEffect(() => {
    const fetchData = async () => {
      const updatedUserList = await fetchUsers(API);
      setData(updatedUserList);
    };
    fetchData();
  }, [searchQuery]);

 
  //   
  useEffect(() => {
    const reversedData = [...data].reverse();
    setFilteredData(
      reversedData.filter(
        row =>
          (row.fullName && row.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (row.email && row.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [data, searchQuery]);
  

  const viewEmployee = (email) => {
    navigate('/view/' + email)
  }

  const editEmployee = (email) => {
    navigate('/edit/' + email)
  }

  const handleDelete = async (row) => {
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
          const response = await fetch(`http://localhost:6001/nominations/${row._id}`, {
            method: 'DELETE'
          });
  
          if (response.ok) {
            // Update the user list in state after successful deletion
            setData(data.filter(user => user._id !== row._id));
            Swal.fire({
              icon: 'success',
              title: 'Employee has been deleted',
              showConfirmButton: true,
              confirmButtonColor: '#00B4D2',
              
            });
          } else {
            console.error('Error deleting user:', data.message);
            Swal.fire({
              icon: 'error',
              title: 'Failed to delete the Employee',
              showConfirmButton: true,
              confirmButtonColor: '#00B4D2',
              
            });
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          Swal.fire({
            icon: 'error',
            title: 'Failed to delete the Employee',
            showConfirmButton: true,
            confirmButtonColor: '#00B4D2',
            
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          icon: 'error',
          title: 'Cancelled',
          showConfirmButton: true,
          confirmButtonColor: '#00B4D2',
          
        });
      }
    })
  };
  
  

  const columns = [

  
    {
      name: "Date",
      selector: (row) => {
        if (row.trainings && row.trainings.length > 0) {
          const lastTraining = row.trainings[row.trainings.length - 1];
          if (lastTraining.date) {
            const date = new Date(lastTraining.date);
            return date.toLocaleDateString();
          }
        }
        return '';
      },
      sortable: true,
      width: "125px",
    },
    

  {
    name: "Name",
    selector: row => row.fullName || '',
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
      name: "Training",
      selector: (row) => row.trainings.length > 0 ? row.trainings[row.trainings.length - 1].trainingName : '',
      sortable: true,
      
      width: "200px"
    },  
    {
      name: "Time Slot",
      selector: (row) => {
        if (row.trainings && row.trainings.length > 0) {
          const timeSlot = row.trainings[row.trainings.length - 1].timeSlot;
          if (timeSlot) {
            const [fromTime, toTime] = timeSlot.split(' - ');
    
            // Check if the timeSlot is in valid HH:mm format
            const isValidFormat = /^\d{2}:\d{2}$/.test(fromTime) && /^\d{2}:\d{2}$/.test(toTime);
    
            if (isValidFormat) {
              const fromTimeParts = fromTime.split(':');
              const toTimeParts = toTime.split(':');
    
              const fromHour = parseInt(fromTimeParts[0]);
              const fromMinute = parseInt(fromTimeParts[1]);
              const toHour = parseInt(toTimeParts[0]);
              const toMinute = parseInt(toTimeParts[1]);
    
              const formattedFromTime = `${fromHour % 12 || 12}:${fromMinute.toString().padStart(2, '0')} ${fromHour >= 12 ? 'PM' : 'AM'}`;
              const formattedToTime = `${toHour % 12 || 12}:${toMinute.toString().padStart(2, '0')} ${toHour >= 12 ? 'PM' : 'AM'}`;
    
              return `${formattedFromTime} - ${formattedToTime}`;
            } else {
              // If timeSlot is not in HH:mm format, return it as it is
              return timeSlot;
            }
          }
        }
        return '';
      },
      sortable: true,
      width: "200px"
    },
    
    {
      name: "Training Status",
      selector: (row) => row.trainings.length > 0 ? row.trainings[row.trainings.length - 1].trainingStatus : '',
      sortable: true,
      
      width: "200px"
    },
    {
      name: "Nominated By",
      selector: row => row.mgrName,
      sortable: true,
      cell: row => <span className="custom-cell">{row.mgrName !== '' ? row.mgrName : 'Admin'}</span>,
      width: "200px"
    }, 
    {
      name: "Actions",
      cell: row => (
        <div>
          <button  title='View' onClick={() => viewEmployee(row.email)} className="action-button" style={{margin: '5px'}}><CiRead color='#fff' /></button>
          <button  title='Edit' onClick={() => editEmployee(row.email)} className="action-button" style={{margin: '5px'}} ><CiPen color= '#fff' /></button>
          <button  title='Delete' onClick={() => handleDelete(row)} className="action-button" style={{margin: '5px' , color:'red'}} ><AiOutlineDelete color= '#fff' /></button>

        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "250px"
    },  
  ];

  
  return (
  
      <div className="table-container">
      <h1 style={{ color: '#00B4D2', fontWeight: 'bold'}}> Welcome to the Nominations Dashboard </h1>
    
        <div className="search-filter2">
        <input
        placeholder="Search Employee by Name  / Email here"
        type="text"
        value={searchQuery}
        className="search-field"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
       <button className="send-button" title='Nominate an Employee' style={{ color: '#fff', width: 'auto' }} onClick={handleNominate} >+Nominate For Training</button>
          {/* <button type="submit"><BsSearch/></button> */}
          
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
       
          fixedheader
          pagination
          paginationPerPage={10}
          className="dataTable"
          customStyles={CustomStyles}
        />
        <br />
        
      </div>


   
  );

}

export default Training;