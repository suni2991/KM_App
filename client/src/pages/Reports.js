import React, { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import * as XLSX from 'xlsx';
import CustomStyles from '../components/CustomStyles';
import {FiDownload} from 'react-icons/fi'

const API = "http://52.44.231.112:6001/employee/assessment";

function Reports() {
  const [data, setData] = useState([])
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  useEffect(() => {
    fetch('http://52.44.231.112:6001/employee/assessment')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setFilteredData(data);
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
    const fileName = `Report_${currentDate}.xlsx`;
    
    const formattedData = filteredData.map(row => {
      const topicScores = {};
      row.topics.forEach(topic => {
        topicScores[topic.topic] = topic.score !== -1 ? topic.score : 0;
      });
      return {
        Name: row.fullName,
        Email: row.email,
        ...topicScores,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Topics Scores');
    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    fetchUsers(API);
  }, [])

  const uniqueTopics = Array.from(new Set(data.flatMap(row => row.topics.map(topic => topic.topic))));

  // Create columns dynamically based on unique topics
  const dynamicColumns = uniqueTopics.map(topic => ({
    name: topic,
    width: "130px",
    selector: row => {
      const topicData = row.topics.find(t => t.topic === topic);
      return topicData && topicData.score !== -1 ? topicData.score : 0;
    },
    sortable: true,
    
  }));

  

  const columns = [
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
      width: "250px",
      selector: row => row.email,
      sortable: true,
      cell: row => <span className="custom-cell">{row.email}</span>
    },
    ...dynamicColumns,
  ];
  
  
  return (
    <div className='table-container'>
      <div className='search-filter2'>
        <input type="text" value={searchQuery} className='send' onChange={(e) => setSearchQuery(e.target.value)} placeholder='Type Name here' />
        <h1 style={{ color: '#00B4D2', fontWeight: 'bold'}}>Total Employees:  {data.length}</h1>
        <button title="Download Report" onClick={handleDownload} className='download-button' >Report <FiDownload /></button>
        

      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        fixedheader
        pagination
        paginationPerPage={10}
        customStyles={CustomStyles}
      />
      <br />
      
      <center><i><p style={{ color: '#00B4D2', fontWeight: 'bold'}}> *All fields are sortable</p></i></center>
    </div>
  )
}

export default Reports;