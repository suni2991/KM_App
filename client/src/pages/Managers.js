import React, { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import Swal from 'sweetalert2';
import {AiOutlineDelete} from 'react-icons/ai'
import CustomStyles from '../components/CustomStyles';


const API = "http://52.44.231.112:6001/employee/manager";
 

function Managers () {
  const [managerEmployeeCounts, setManagerEmployeeCounts] = useState({});
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
    
 
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
  setFilteredData(
    data.filter(
      row =>
        row.fullName &&
        row.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.email &&
        row.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
}, [data, searchQuery]);



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
          const response = await fetch(`http://52.44.231.112:6001/admin/users/${row._id}`, {
            method: 'DELETE'
          });
  
          if (response.ok) {
            // Update the user list in state after successful deletion
            setData(data.filter(user => user._id !== row._id));
            Swal.fire({
              icon: 'success',
              title: 'Manager has been deleted successfully',
              showConfirmButton: true,
              confirmButtonColor: '#00B4D2',
              
            });
          } else {
            console.error('Error deleting user:', data.message);
            Swal.fire({
              icon: 'error',
              title: 'Failed to delete the Manager',
              showConfirmButton: true,
              confirmButtonColor: '#00B4D2',
              
            });
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          Swal.fire({
            icon: 'error',
            title: 'Failed to delete the Manager',
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
    })
  };
  


  

  const columns = [
     {
        name: "Date",
        selector: row => {
          if(row.createdAt){
          const date = new Date(row.createdAt);
          const dateString = date.toLocaleDateString();
          
          return (
                  <span>{dateString}</span>
                 )
        } else{
          return "-"
        }
        },
        sortable: true,
        width: "150px"
      },
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
      width: "400px"
    },
    {
      name: "Password",
      selector: row => row.confirmPassword,
      sortable: true,
      cell: row => <span className="custom-cell">{row.confirmPassword}</span>,
      width: "200px"
    },
    
      {
        name: "Actions",
        cell: row => (
          <div>
            
            <button  title='Delete' onClick={() => handleDelete(row)} className="action-button" style={{margin: '5px' , color:'red'}} ><AiOutlineDelete color= '#fff' /></button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "150px"
      },
  ];

  
  return (
  
      <div className="table-container">
      <h1 style={{ color: '#00B4D2', fontWeight: 'bold'}}> Welcome to the Manager Dashboard </h1>
 
        <div className="search-filter2">
        <input
        placeholder="Search Manager by Name  / Email here"
        type="text"
        value={searchQuery}
        className="search-field"
        onChange={(e) => setSearchQuery(e.target.value)}
      />

       
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

export default Managers