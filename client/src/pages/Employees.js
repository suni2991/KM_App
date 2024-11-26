import React, { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import useAuth from '../hooks/useAuth';
import CustomStyles from '../components/CustomStyles';


function Employees() {

  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const { auth} = useAuth();
  const managerEmail = auth.email;
  const [employeeCount, setEmployeeCount] = useState(0);



  useEffect(() => {
    const fetchEmployeesUnderManager = async () => {
      try {
        const response = await fetch(`http://localhost:6001/employees?mgrEmail=${managerEmail}`);
        const employeeList = await response.json();
        setData(employeeList);
        setEmployeeCount(employeeList.length);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployeesUnderManager();
  }, [managerEmail]);



  useEffect(() => {
    setFilteredData(
      data.filter(
        row =>
          row.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const columns = [
    {
      name: "Full Name",
      selector: row => row.fullName,
      sortable: true,
      sortFunction: (a, b) => a.fullName.localeCompare(b.fullName),
      cell: row => <span className="custom-cells">{row.fullName}</span>,
      width: "250px"
    },
    
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
      cell: row => <span className="custom-cell">{row.email}</span>,
      width: "355px"
    },
    {
      name: "Category",
      selector: row => row.category,
      sortable: true,
      cell: row => <span className="custom-cell">{row.category}</span>,
      width: "200px"
    },
    {
      name: "Department",
      selector: row => row.department,
      sortable: true,
      cell: row => <span className="custom-cell">{row.department}</span>,
      width: "200px"
    },
  ];

  
  return (
  
      <div className="table-container">
      <h1 style={{ color: '#00B4D2', fontWeight: 'bold'}}> Welcome to Manager Dashboard <br/>
      Employees under your supervision: {employeeCount}
      </h1>
         <div className="search-filter2">
        <input
        placeholder="Search Employee by Name  / Email here"
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

export default Employees;