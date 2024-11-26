import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import CustomStyles from "../components/CustomStyles";
import { FiDownload } from "react-icons/fi";
import { DatePicker, Space } from "antd";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const API = "http://localhost:6001/employee/assessment";
const { RangePicker } = DatePicker;

function Reports() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const { token } = useAuth();
  const [value, setValue] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [topicName, setTopicName] = useState();
  const [topics, setTopics] = useState();

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  useEffect(() => {
    fetch("http://localhost:6001/employee/assessment", {
      headers: headers,
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setFilteredData(data);
      })
      .catch((error) => console.error(error));

      const getTopics = async () => {
        const topics = await axios.get(
          "http://localhost:6001/topics/Assessment",
          {
            headers: headers,
          }
        );
        await setTopics(topics.data.topics);
      };
      getTopics();
  }, []);
  useEffect(() => {
    setFilteredData(
      data.filter(
        (row) =>
          row.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const fetchUsers = async (url) => {
    try {
      const res = await fetch(url, {
        headers: headers,
      });
      const data = await res.json();
      if (data.length > 0) {
        setData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = (e) => {
    e.preventDefault();
    const currentDate = new Date().toISOString().split("T")[0];
    const fileName = `Report_${currentDate}.xlsx`;

    const formattedData = filteredData.map((row) => {
      const topicScores = {};
      row.topics.forEach((topic) => {
        if (topicName) {
          if (topic.topic === topicName) {
            topicScores[topic.topic] = topic.score !== -1 ? topic.score : 0;
          }
        } else {
          topicScores[topic.topic] = topic.score !== -1 ? topic.score : 0;
        }
      });
      return {
        Name: row.fullName,
        Email: row.email,
        Department: row.department,
        Manager: row.mgrName,
        ...topicScores,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Topics Scores");
    XLSX.writeFile(workbook, fileName);
  };


  useEffect(() => {
    fetchUsers(API);
  }, []);

  const uniqueTopics = Array.from(
    new Set(data.flatMap((row) => row.topics.map((topic) => topic.topic)))
  );

  const dynamicColumns = uniqueTopics.map((topic) => ({
    name: topic,
    width: "130px",
    selector: (row) => {
      const topicData = row.topics.find((t) => t.topic === topic);
      return topicData ? (topicData.score !== -1 ? topicData.score : 0) : 0;
    },
    sortable: true,
  }));

  // const dynamicColumns = uniqueTopics
  // .filter(topic => data.some(row => row.topics.some(t => t.topic === topic && t.score !== -1)))
  // .map(topic => ({
  //   name: topic,
  //   width: "130px",
  //   selector: row => {
  //     const topicData = row.topics.find(t => t.topic === topic);
  //     return topicData && topicData.score !== -1 ? topicData.score : 0;
  //   },
  //   sortable: true,
  // }));

  const columns = [
    {
      name: "Full Name",
      width: "150px",
      selector: (row) => row.fullName,
      sortable: true,
      sortFunction: (a, b) => a.fullName.localeCompare(b.fullName),
      cell: (row) => <span className="custom-cells">{row.fullName}</span>,
    },
    {
      name: "Email",
      width: "250px",
      selector: (row) => row.email,
      sortable: true,
      cell: (row) => <span className="custom-cell">{row.email}</span>,
    },
    ...dynamicColumns,
  ];

  const onChange = (value, dateStrings) => {
    console.log("Selected Date: ", value);
    console.log("Formatted Selected Date: ", dateStrings);
    console.log("Start Date " + dateStrings[0]);
    console.log("End Date " + dateStrings[1]);
    setValue(value);
    setStartDate(dateStrings[0]);
    setEndDate(dateStrings[1]);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    let dataToSend = {};
     if (topicName) {
      console.warn(topicName);
      dataToSend["topic"] = topicName;
    }
    if (startDate && endDate) {
      dataToSend["startDate"] = startDate;
      dataToSend["endDate"] = endDate;
    }
  }
  return (
    <div className="table-container">
    <h1 style={{ color: "#00B4D2", fontWeight: "bold"}}>
    Total Employee : {data.length}
  </h1>
      <div className="search-filter2">
        <input
          type="text"
          value={searchQuery}
          className="send"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Employee by Name  / Email here"
        />
       
        <select
          value={topicName}
          className="download-filter"
          onChange={(e) => setTopicName(e.target.value)}
        >
          <option>Select Topic </option>
          {topics && topics.length > 0 ? (
            topics.map(
              (
                topic // use topic here
              ) => (
                <option key={topic.topic} value={topic.topic}>
                  {topic.topic}
                </option>
              )
            )
          ) : (
            <p>No records</p>
          )}
        </select>
      
        <RangePicker onChange={onChange} value={value} className="download-filter" />
     
        <button
          title="Download Report"
          onClick={handleDownload}
          className="download-button"
        >
          Report <FiDownload />
        </button>
       
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

      <center>
        <i>
          <p style={{ color: "#00B4D2", fontWeight: "bold" }}>
            {" "}
            *All fields are sortable
          </p>
        </i>
      </center>
    </div>
  );
}

export default Reports;