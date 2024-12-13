import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import CustomStyles from "../components/CustomStyles";
import { useNavigate } from "react-router-dom";
import { CiRead, CiPen } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import useAuth from "../hooks/useAuth";
import { Modal, Select, Input,message } from "antd";

const API = "http://localhost:6001/employee/assessment";

const { Option } = Select;
const {TextArea} = Input;

function Admin() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [comment, setComment] = useState("");
  const { token } = useAuth();

  const navigate = useNavigate();

  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  useEffect(() => {
    const reversedData = [...data].reverse();
    setFilteredData(
      reversedData.filter(
        (row) =>
          (row.fullName &&
            row.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (row.email &&
            row.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [data, searchQuery]);

  const sendEmail = async (rowData) => {
    const { fullName, email, confirmPassword, topics } = rowData;
    const notAttemptedTopics = topics.filter(
      (topic) => topic.assessmentStatus === "Not Attempted"
    );
    const topicsList = notAttemptedTopics.map((topic) => ({
      topic: topic.topic,
      presenter: topic.presenter,
    }));
  
    const emailPayload = {
      email,
      fullName,
      confirmPassword,
      topics: topicsList,
    };
  
    try {
      const res = await fetch("http://localhost:6001/user/exam", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });
  
      const data = await res.json();
      if (data.status === 401 || !data) {
        message.error("Mail not sent . Please update your Credentials")
      } else {
        const updatedTopics = topics.map((topic) => ({
          ...topic,
          emailSent: topic.assessmentStatus === "Not Attempted" ? true : topic.emailSent,
        }));
  
        const updateRes = await fetch(
          `http://localhost:6001/employee/${rowData._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "Email sent successfully",
              topics: updatedTopics,
            }),
          }
        );
  
        const updateData = await updateRes.json();
        console.log(updateData);
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };
  

  const fetchUsers = async (url) => {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return [fetchUsers];
  };

  useEffect(() => {
    const fetchData = async () => {
      const updatedUserList = await fetchUsers(API);
      setData(updatedUserList);
    };
    fetchData();
  }, []);

  const viewCandidate = (id) => {
    navigate("/hr/view/" + id);
  };

  const editCandidate = (id) => {
    navigate("/hr/edit/" + id);
  };

  useEffect(() => {
    const fetchData = async () => {
      const updatedUserList = await fetchUsers(API);
      setData(updatedUserList);
    };
    fetchData();
  }, [searchQuery]);

  const fetchTopics = async () => {
    try {
      const res = await fetch("http://localhost:6001/topics/Assessment", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      // Check if the topics property is an array
      if (Array.isArray(data.topics)) {
        setAvailableTopics(data.topics);
      } else {
        console.error("Fetched data does not contain an array in 'topics' property:", data);
        setAvailableTopics([]); // Set to empty array if topics is not an array
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      setAvailableTopics([]); // Set to empty array on error
    }
  };
  
  useEffect(() => {
    fetchTopics(); // Fetch topics when the component mounts
  }, []);

  const handleDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00B4D2",
      cancelButtonColor: "#8C8C8C",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteRequests = selectedRows.map((row) =>
            fetch(`http://localhost:6001/admin/users/${row._id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          );
          await Promise.all(deleteRequests);

          // Update the user list in state after successful deletion
          setData(data.filter((user) => !selectedRows.includes(user)));

          Swal.fire({
            icon: "success",
            title: "Employees have been deleted successfully",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
        } catch (error) {
          console.error("Error deleting users:", error);
          Swal.fire({
            icon: "error",
            title: "Failed to delete the Employees",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          icon: "info",
          title: "Cancelled by Admin",
          showConfirmButton: true,
          confirmButtonColor: "#00B4D2",
        });
      }
    });
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.fullName,
      sortable: true,
      sortFunction: (a, b) => a.fullName.localeCompare(b.fullName),
      cell: (row) => <span className="custom-cells">{row.fullName}</span>,
      width: "200px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      cell: (row) => <span className="custom-cell">{row.email}</span>,
      width: "300px",
    },
    {
      name: "Topic",
      selector: (row) => {
        const lastAddedTopic =
          row.topics.length > 0
            ? row.topics[row.topics.length - 1].topic
            : "No topics available";
        return lastAddedTopic;
      },
      sortable: true,
      width: "220px",
    },
    {
      name: "Email sent",
      selector: (row) => {
        const lastAddedTopic =
          row.topics.length > 0
            ? row.topics[row.topics.length - 1].emailSent
            : false;
        return lastAddedTopic;
      },
      cell: (row) => {
        const emailSent =
          row.topics.length > 0 ? row.topics[row.topics.length - 1].emailSent : false;
        return (
          <span
            style={{
              color: emailSent ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {emailSent ? "Yes" : "No"}
          </span>
        );
      },
      sortable: true,
      width: "125px",
    },


    {
      name: "Actions",
      cell: (row) => (
        <div>
          <button
            title="View"
            onClick={() => viewCandidate(row._id)}
            className="action-button"
            style={{ margin: "5px" }}
          >
            <CiRead color="#fff" fontWeight={"bold"} />
          </button>
          <button
            title="Edit"
            onClick={() => editCandidate(row._id)}
            className="action-button"
            style={{ margin: "5px" }}
          >
            <CiPen color="#fff" />
          </button>
          <button
            title="Delete"
            onClick={() => handleDelete(row)}
            className="action-button"
            style={{ margin: "5px", color: "red" }}
          >
            <AiOutlineDelete color="#fff" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "150px",
    },
  ];

  const handleSendEmail = async () => {
    const loadingSwal = Swal.fire({
      icon: "info",
      title: "Sending Emails...",
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
        icon: "success",
        title: "Credentials Sent successfully",
        showConfirmButton: true,
        confirmButtonColor: "#00B4D2",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      loadingSwal.close();

      Swal.fire({
        icon: "error",
        title: "Failed to send credentials",
        showConfirmButton: true,
        confirmButtonColor: "#00B4D2",
      });
    }
  };

  const handleReset = () => {
    setIsModalVisible(true);
  };
  
  const handleModalOk = async () => {
    if (selectedTopics.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No Topics Selected",
        text: "Please select at least one topic to reset scores.",
        showConfirmButton: true,
        confirmButtonColor: "#00B4D2",
      });
      return;
    }
  
    try {
      for (const row of selectedRows) {
        const updatedTopics = row.topics.map((topic) => {
          if (selectedTopics.includes(topic.topic)) {
            // Store the existing score in the history array before resetting
            const updatedHistory = [
              ...topic.history,
              {
                score: topic.score, // Store the current score
                comment: comment,
                date: new Date(),
              },
            ];
  
            return {
              ...topic,
              score: -1,
              assessmentStatus: "Not Attempted", // Reset the score to 0
              history: updatedHistory,
            };
          }
          return topic;
        });
  
        const updateRes = await fetch(`http://localhost:6001/employee/${row._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topics: updatedTopics,
          }),
        });
  
        const updateData = await updateRes.json();
        console.log(updateData);
      }
  
      setIsModalVisible(false);
      setSelectedTopics([]);
  
      // Update the user list in state after resetting scores
      const updatedUserList = await fetchUsers(API);
      setData(updatedUserList);
  
      Swal.fire({
        icon: "success",
        title: "Scores Reset Successfully",
        showConfirmButton: true,
        confirmButtonColor: "#00B4D2",
      });
    } catch (error) {
      console.error("Error resetting scores:", error);
      Swal.fire({
        icon: "error",
        title: "Error Resetting Scores",
        text: error.message,
        showConfirmButton: true,
        confirmButtonColor: "#00B4D2",
      });
    }
  };
  
  
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedTopics([]);
  };
  
  const handleTopicsChange = (value) => {
    setSelectedTopics(value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  

  return (
    <div>
    <div className="table-container">
      <h1 style={{ color: '#00B4D2', fontWeight: 'bold' }}> Welcome to the Assessment Dashboard </h1>
      <div className="search-filter2">
       
        <input placeholder='Search Employee by Name  / Email here' type="text" value={searchQuery} className='search-field' onChange={(e) => setSearchQuery(e.target.value)} />

      <button
        onClick={handleSendEmail}
        className="send-button"
        style={{ visibility: "visible", color: '#fff' }} disabled={selectedRows.length === 0}
      >
        Send Email
      </button>
      <button
        onClick={handleReset}
        className="send-button"
        style={{ visibility: "visible", color: '#fff' }} disabled={selectedRows.length === 0}
      >
        Reset Scores
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
      <center><i><p style={{ color: '#00B4D2', fontWeight: 'bold' }}> *Select an Employee to send their credentials through Email respectively</p></i></center>
    </div>
    <Modal
    title="Select Topics to Reset Score"
    open={isModalVisible}
    onOk={handleModalOk}
    onCancel={handleModalCancel}
  >
    <Select
      mode="multiple"
      style={{ width: "100%", height:"30%", marginBottom:'10px' }}
      placeholder="Select topics"
      value={selectedTopics}
      onChange={setSelectedTopics}
    >r
      {availableTopics.map((topic) => (
        <Option key={topic.id} value={topic.topic}>
          {topic.topic}
        </Option>
        
      ))}
    </Select>
      <br />
    <Input.TextArea
    placeholder="Add a comment before resetting the score..."
    value={comment}
    onChange={handleCommentChange}
    required
    rows={4}
  />
  </Modal>

  </div>
  );
}
export default Admin;