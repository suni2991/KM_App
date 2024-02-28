import React, { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {CiRead, CiPen} from 'react-icons/ci'
import {AiOutlineDelete} from 'react-icons/ai'
import useAuth from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import CustomStyles from '../components/CustomStyles';


function Nominations() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('');
  const { auth} = useAuth();
  const [filteredData, setFilteredData] = useState([]);
 const navigate = useNavigate();

 const fetchNominations = async () => {
  try {
    const response = await fetch(`http://localhost:6001/nominations/${auth.email}`);
    if (response.ok) {
      const nominationsData = await response.json();
      setData(nominationsData);
    } else {
      console.error('Error fetching nominations:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching nominations:', error);
  }
};

useEffect(() => {
  fetchNominations();
}, []);




  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  const handleRegister = () => {
    navigate('/calendar')
  }



  

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
            
            setData(data.filter(user => user._id !== row._id));
            Swal.fire(
              'Deleted!',
              'User has been deleted.',
              'success'
            )
          } else {
            console.error('Error deleting user:', data.message);
            Swal.fire(
              'Error!',
              'Failed to delete the user.',
              'error'
            )
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          Swal.fire(
            'Error!',
            'Failed to delete the user.',
            'error'
          )
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Cancelled',
          'Aborted',
          'info'
        )
      }
    })
  };
  
 
  
  const handleDownload = () => {
    const header = columns
      .filter(column => column.name !== "Actions")
      .map(column => column.name);
  
    const rows = data.map(row =>
      columns
        .filter(column => column.name !== "Actions")
        .map(column => {
          if (column.selector) {
            const cellData = typeof column.selector === 'function' ? column.selector(row) : row[column.selector];
         
            if (column.name === "Training Date" && cellData instanceof Date) {
              return cellData.toLocaleDateString();
            }
            
            return cellData;
          }
          return '';
        })
    );
  
    const sheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Nominations');
  
    XLSX.writeFile(workbook, 'nominations.xlsx');
  };
  
  useEffect(() => {
    setFilteredData(
      data.filter(
        row =>
          (row.fullName && row.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (row.email && row.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [data, searchQuery]);


  const columns = [
    {
        name: "Training Date",
        selector: row => {
          if (row.trainings && row.trainings[0]?.date) {
            const dates = new Date(row.trainings[0].date);
            const dateString = dates.toLocaleDateString();
            return <span>{dateString}</span>;
          } else {
            return "-";
          }
        },
        sortable: true,
        width: "125px",
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
      width: "300px"
    },
    {
        name: "Training",
        selector: (row) => row.trainings.length > 0 ? row.trainings[row.trainings.length - 1].trainingName : '',
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
    
        <h1 style={{color: 'rgb(0, 180, 210)', fontWeight: 'bold'}}> Welcome to the Training Nominations Dashboard </h1>
        
        <div className="search-filter2">
        <button className="send-button" title='Add Nomination' style={{ color:'#fff',  width: '10%'}} onClick={handleRegister} >+Add New</button>
          <input placeholder='Search Employee by Name  / Email here' type="text" value={searchQuery} className='search-field' onChange={(e) => setSearchQuery(e.target.value)} />
          <button onClick={handleDownload} className='submit-button' style={{width: '20%',fontWeight:'bold', padding: '5px 40px 5px ', margin: '25px'}}>Download Data</button>
          
          
         
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
       
        <i><p style={{ color: '#fff' , fontWeight: 'bold' }}> *Select an Applicant to send their credentials through Email respectively</p></i></center>
      </div>


   
  );

}

export default Nominations;