import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/View.css";
import { FadeLoader } from "react-spinners";
import { Modal, Table, Button } from "antd";
import axios from "axios";
import Swal from "sweetalert2";
import { AiOutlineDelete, AiOutlineHistory, AiOutlineHourglass } from "react-icons/ai";
import { RiEdit2Line } from "react-icons/ri";
import { MdOutlineDone } from "react-icons/md";
import useAuth from "../hooks/useAuth";
import { format } from "date-fns";

const HistoryModal = ({ visible, onCancel, data }) => {
  const columns = [
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => format(new Date(text), "MM/dd/yyyy HH:mm:ss"),
    },
  ];
  return (
    <Modal
      title="History Data"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Close
        </Button>,
      ]}
      style={{
        minWidth: "80vw",
        maxWidth: "80vw",
      }} // Set the width as a percentage of the viewport width
      bodyStyle={{ height: "60vh", overflow: "auto" }} //
    >
      <Table
        style={{ height: "100%" }}
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          total: data.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "15"],
        }}
      />
    </Modal>
  );
};

const WrongAnswersModalComponent = ({ visible, onCancel, data }) => {
  const columns = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
    },
    {
      title: "Selected Answer",
      dataIndex: "selectedAnswerValue",
      key: "selectedAnswerValue",
    },
    {
      title: "Correct Answer",
      dataIndex: "correctAnswerValue",
      key: "correctAnswerValue",
      // render: (text) => format(new Date(text), "MM/dd/yyyy HH:mm:ss"),
    },
  ];
  return (
    <Modal
      title="Wrong Answers Data"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Close
        </Button>,
      ]}
      style={{
        minWidth: "80vw",
        maxWidth: "80vw",
      }} // Set the width as a percentage of the viewport width
      bodyStyle={{ height: "60vh", overflow: "auto" }} //
    >
      <Table
        style={{ height: "100%" }}
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          total: data.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "15"],
        }}
      />
    </Modal>
  );
};

function View() {
  const { auth, setAuth } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [newPresenter, setNewPresenter] = useState("");
  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [filteredPresenters, setFilteredPresenters] = useState([]);

  const [presenters, setPresenters] = useState([]);

  const { token } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [wrongAnswersData, setWrongAnswersData] = useState([]);
  const [wrongAnswersModalVisible, setWrongAnswersModalVisible] = useState(false);

  const handleRowSelection = async (record) => {
    setSelectedRowKey(record.key);
    setSelectedTopicId(record.topicId);
    if (employee.category === "Induction") {
      // Fetch all presenter names when a row is selected in the 'Induction' category
      try {
        const response = await axios.get(`http://localhost:6001/presenters`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          console.log(response);
          setPresenters(response.data.presenters);
          setFilteredPresenters(response.data.presenters); // Set filtered presenters initially
          setNewPresenter(record.presenter); // Set the selected presenter
        } else {
          console.error("Failed to fetch presenters");
          setPresenters([]);
          setFilteredPresenters([]);
          setNewPresenter("");
        }
      } catch (error) {
        console.error("Error fetching presenters:", error);
        setPresenters([]);
        setFilteredPresenters([]);
        setNewPresenter("");
      }
    }
  };

  const handlePresenterUpdate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:6001/employee/${id}/topic/${selectedTopicId}/updatePresenter`,
        {
          newPresenter: newPresenter, // Corrected key name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Refresh employee data after successful update
        fetchEmployee();

        // Reset selected topic
        setSelectedRowKey(null);
        setSelectedTopicId(null);
        // Show success message
        Swal.fire({
          icon: "success",
          title: "Presenter name updated successfully",
          showConfirmButton: true,
          confirmButtonColor: "#00B4D2",
        });
      } else {
        // Show error message if update fails
        Swal.fire({
          icon: "error",
          title: "Failed to update presenter name",
          showConfirmButton: true,
          confirmButtonColor: "#00B4D2",
        });
      }
    } catch (error) {
      console.error("Error updating presenter name:", error);
    }
  };

  const navigate = useNavigate();
  let { id } = useParams();

  const handlePresenterFilter = (inputValue) => {
    if (inputValue.length >= 1) {
      const filtered = presenters.filter((presenter) =>
        presenter.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredPresenters(filtered);
    } else {
      setFilteredPresenters([]);
    }
  };

  const handleScoreReset = async (rowKey) => {
    const topicToUpdate = employee.topics[rowKey];
    console.log(topicToUpdate);
    if (topicToUpdate) {
      if (topicToUpdate.score <= 0) {
        Swal.fire("You already reset score for this topic");
      } else {
        // Show SweetAlert confirmation dialog
        Swal.fire({
          title: `Reset Score for ${topicToUpdate.topic}?`,
          text: "Are you sure you want to reset the score for this topic?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#00B4D2",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, reset it!",
          cancelButtonText: "Cancel",
        }).then(async (result) => {
          if (result.isConfirmed) {
            const { value: comment } = await Swal.fire({
              input: "textarea",
              inputLabel: "Reset Message",
              inputPlaceholder: "Type your message here...",
              inputAttributes: {
                "aria-label": "Type your message here",
              },
              showCancelButton: true,
              confirmButtonColor: "#00B4D2",
              confirmButtonText: "Submit",
              cancelButtonColor: "#d33",
              cancelButtonText: "Cancel",
              preConfirm: (inputValue) => {
                if (!inputValue) {
                  Swal.showValidationMessage("Input is required"); // Show an error message if input is empty
                }
                return inputValue;
              },
            });
            if (comment) {
              try {
                console.log("OLD SCORE ", topicToUpdate.score);

                // Proceed with resetting the score
                const response = await axios.put(
                  `http://localhost:6001/employee/${id}/resetScore`,
                  {
                    topicId: topicToUpdate._id,
                    newScore: -1,
                    assessmentStatus: "Not Attempted",
                    oldScore: topicToUpdate.score,
                    comment: comment,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (response.status === 200) {
                  // Update the state immediately after successful update in the backend
                  setEmployee((prevEmployee) => {
                    const updatedTopics = prevEmployee.topics.map(
                      (topic, index) =>
                        index === rowKey
                          ? {
                            ...topic,
                            score: -1,
                            assessmentStatus: "Not attempted",
                          }
                          : topic
                    );
                    return { ...prevEmployee, topics: updatedTopics };
                  });

                  // Optionally, store the updated employee object in localStorage
                  localStorage.setItem(
                    "employeeData",
                    JSON.stringify(employee)
                  );
                  Swal.fire({
                    icon: "success",
                    title: "Scores has been reset successfully",
                    showConfirmButton: true,
                    confirmButtonColor: "#00B4D2",
                  });
                } else {
                  // Handle the error if the API call is not successful
                  console.error("Failed to update score in the backend");
                  Swal.fire({
                    icon: "error",
                    title: "Failed to update Score",
                    showConfirmButton: true,
                    confirmButtonColor: "#00B4D2",
                  });
                }
              } catch (error) {
                console.error("Error resetting score:", error);
                Swal.fire({
                  icon: "error",
                  title: "Error resetting Score",
                  showConfirmButton: true,
                  confirmButtonColor: "#00B4D2",
                });
              }
            }
          }
        });
      }
    }
  };

  useEffect(() => {
    const fetchPresenters = async () => {
      try {
        const response = await axios.get("http://localhost:6001/presenters", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPresenters(response.data); // Assuming response.data is an array of presenter names
      } catch (error) {
        console.error("Error fetching presenters:", error);
        setPresenters([]); // Set presenters to empty array on error
      }
    };

    fetchPresenters();
  }, []);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`http://localhost:6001/employee/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        console.log("emp ", data);
        setEmployee(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const handleRedirect = () => {
    if (employee.category === "Assessment") {
      navigate("/admin");
    } else if (employee.category === "Induction") {
      navigate("/induction");
    } else if (employee.category === "Training") {
      navigate("/training");
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
      wrongAnswersCount: topic.wrongAnswersCount === -1 ? 0 : topic.wrongAnswersCount,
      testCount: topic.testCount,
      topicId: topic._id,
      assessmentStatus: topic.assessmentStatus || "Not Attempted",
    }))
    : [];

  const handleTopicDelete = async (rowKey, topicId) => {
    try {
      // Show SweetAlert confirmation dialog
      Swal.fire({
        title: "Delete Topic",
        text: "Are you sure you want to delete this topic?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#00B4D2",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // Send a DELETE request to the backend endpoint
            const response = await axios.delete(
              `http://localhost:6001/employee/${id}/topic/${topicId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.status === 200) {
              // Update the state to remove the deleted topic
              setEmployee((prevEmployee) => {
                const updatedTopics = prevEmployee.topics.filter(
                  (_, index) => index !== rowKey
                );
                return { ...prevEmployee, topics: updatedTopics };
              });

              Swal.fire({
                icon: "success",
                title: "Topic has been deleted successfully",
                showConfirmButton: true,
                confirmButtonColor: "#00B4D2",
              });
            } else {
              console.error("Failed to delete the topic");
              Swal.fire({
                icon: "error",
                title: "Failed to delete the topic",
                showConfirmButton: true,
                confirmButtonColor: "#00B4D2",
              });
            }
          } catch (error) {
            console.error("Error deleting topic:", error);
            Swal.fire({
              icon: "error",
              title: "Error deleting topic",
              showConfirmButton: true,
              confirmButtonColor: "#00B4D2",
            });
          }
        }
      });
    } catch (error) {
      console.error("Error handling topic delete:", error);
    }
  };

  const handleWrongAnswers = async (topic, topicId) => {
    console.log("topic: ");
    console.log(topic);

    console.log("topicId: ");
    console.log(topicId);
    
    const response = await axios.get(
      `http://localhost:6001/employees/${employee._id}/topics/${topicId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // const data = await response.json();
    const wrongAnswers = response.data.topic?.wrongAnswers;
    console.log("wrong answers get Sahil: ");
    console.log(wrongAnswers);

    setWrongAnswersData((prevData) => [...prevData, ...wrongAnswers]);
    setWrongAnswersModalVisible(true);
  }

  const closeWrongAnswersModal = () => {
    setWrongAnswersModalVisible(false);
    setWrongAnswersData([]);
  };

  const handleTopicHistory = async (topic, topicId) => {
    const response = await fetch(
      `http://localhost:6001/employee/${id}/${topic}/topicHistory`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();

    console.log(data.data);
    setHistoryData(data.data);
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };
  // Function to handle score reset

  if (employee && employee.category === "Training") {
    const lastTopic = employee.topics[employee.topics.length - 1];

    return (
      <div className="table-container">
        <h1
          style={{
            color: "rgb(8, 8, 68)",
            textTransform: "capitalize",
            fontWeight: "bold",
          }}
        >
          Training - {employee.fullName}
        </h1>
        <br />

        <p>
          <span style={{ fontWeight: "bold" }}>Email:</span> {employee.email}
        </p>
        <br />
        <hr />
        <h3 style={{ fontWeight: "bold" }}>Last Added Topic:</h3>
        {lastTopic ? (
          <div>
            <p style={{ textTransform: "capitalize" }}>
              <span style={{ fontWeight: "bold" }}>Topic:</span>{" "}
              {lastTopic.topic}
            </p>
            <p style={{ textTransform: "capitalize" }}>
              <span style={{ fontWeight: "bold" }}>Training Status:</span>{" "}
              {lastTopic.trainingStatus}
            </p>
          </div>
        ) : (
          <p>No topics added yet.</p>
        )}

        <hr />
        <h2 style={{ color: "Green", fontSize: "18px" }}>
          Status: {lastTopic.trainingStatus}
        </h2>

        <div className="back-button-container">
          <button
            className="submit-button"
            onClick={handleRedirect}
            type="submit"
          >
            BACK
          </button>
        </div>
      </div>
    );
  }

  if (employee.category === "Assessment") {
    const columns = [
      {
        title: "Topic",
        dataIndex: "topic",
        key: "topic",
      },
      {
        title: "Score",
        dataIndex: "score",
        key: "score",
      },
      {
        title: "Errors",
        dataIndex: "wrongAnswersCount",
        key: "wrongAnswersCount",
        render: (_, record) => (
        <button
              title="Wrong Answers"
              onClick={() => handleWrongAnswers(record.topic, record.topicId)}
              // className="action-button"
              style={{ margin: "5px", textDecoration: "underline", color: '#00B4D2', background: 'none', border: 'none', cursor: 'pointer',  }}
            >
              {record.wrongAnswersCount}
            </button>
        )
      },
      {
        title: "Status",
        dataIndex: "assessmentStatus",
        key: "assessmentStatus",
      },
      {
        title: "Test Taken",
        dataIndex: "testCount",
        key: "testCount",
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <div className="act-btn">
            <button
              title="Reset Topic"
              className="submit-button"
              onClick={() => handleScoreReset(record.key)}
              style={{ marginTop: "7px" }}
            >
              Reset
            </button>
            <button
              title="Delete Topic"
              onClick={() => handleTopicDelete(record.key, record.topicId)}
              className="action-button"
              style={{ margin: "5px" }}
            >
              <AiOutlineDelete color="#fff" />
            </button>
            <button
              title="Check History"
              onClick={() => handleTopicHistory(record.topic, record.topicId)}
              className="action-button"
              style={{ margin: "5px" }}
            >
              <AiOutlineHistory color="#fff" />
            </button>
            <HistoryModal
              visible={modalVisible}
              onCancel={closeModal}
              data={historyData}
            />

            <WrongAnswersModalComponent
              visible={wrongAnswersModalVisible}
              onCancel={closeWrongAnswersModal}
              data={wrongAnswersData}
            />

          </div>
        ),
      },
    ];

    return (
      <div>
        <div className="table-container">
          <h1
            style={{
              color: "#00B4D2",
              textTransform: "capitalize",
              fontWeight: "bold",
            }}
          >
            Assessment - {employee.fullName}
          </h1>
          <br />

          <p>
            <span style={{ fontWeight: "bold" }}>Email:</span> {employee.email}
          </p>
          <p>
            <span style={{ fontWeight: "bold" }}>Password:</span>{" "}
            {employee.confirmPassword}
          </p>
          <br />
          <hr />
          <h3 style={{ fontWeight: "bold" }}>Test Results:</h3>

          <Table
            dataSource={assessmentData}
            columns={columns}
            pagination={{
              total: employee.topics.length,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "15"],
            }}
          />
          <hr />
          <p>
            <span style={{ fontWeight: "bold" }}>Manager Name:</span>{" "}
            {employee.mgrName}
          </p>
          <p>
            <span style={{ fontWeight: "bold" }}>Manager Email:</span>{" "}
            {employee.mgrEmail}
          </p>
        </div>

        <div className="back-button-container">
          <button
            className="submit-button"
            onClick={handleRedirect}
            type="submit"
          >
            BACK
          </button>
        </div>
      </div>
    );
  } else if (employee.category === "Induction") {
    const columns = [
      {
        title: "Topic",
        dataIndex: "topic",
        key: "topic",
      },
      {
        title: "Status",
        dataIndex: "inductionStatus",
        key: "inductionStatus",
      },
      {
        title: "Presenter",
        dataIndex: "presenter",
        key: "presenter",
        render: (_, record) => (
          <div>
            {record.key === selectedRowKey ? (
              <input
                type="text"
                value={newPresenter}
                onChange={(e) => setNewPresenter(e.target.value)}
                placeholder="Enter new presenter name"
                style={{
                  color: "green",
                  border: "1px solid #00B4D2",
                  borderRadius: "5px",
                  padding: "4px",
                }}
              />
            ) : (
              record.presenter
            )}
          </div>
        ),
      },
      {
        title: "Actions XXXX",
        key: "actions",
        render: (_, record) => (
          <div className="act-btn">
            {record.key === selectedRowKey ? (
              <button className="action-button" onClick={handlePresenterUpdate}>
                <MdOutlineDone color="#fff" />
              </button>
            ) : (
              <button
                className="action-button"
                onClick={() => handleRowSelection(record)}
              >
                <RiEdit2Line color="#fff" />
              </button>
            )}

            <button
              title="Delete Topic"
              onClick={() => handleTopicDelete(record.key, record.topicId)}
              className="action-button"
              style={{ margin: "5px" }}
            >
              <AiOutlineDelete color="#fff" />
            </button>
          </div>
        ),
      },
    ];

    const inductionData = employee.topics
      ? employee.topics.map((topic, index) => ({
        key: index,
        topic: topic.topic,
        inductionStatus: topic.inductionStatus || "Not Provided",
        presenter: topic.presenter || "Not Provided",
        topicId: topic._id,
      }))
      : [];

    return (
      <div className="table-container">
        <div>
          <h1
            style={{
              color: "#00B4D2",
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            Induction - {employee.fullName}
          </h1>
          <br />

          <p>
            <b>Email:</b> {employee.email}
          </p>
          <p>
            <b>Password:</b> {employee.confirmPassword}
          </p>
          <br />
          <p>
            <span style={{ fontWeight: "bold" }}>Feedback Details:</span>
          </p>
          {inductionData.length > 0 ? (
            <Table
              dataSource={inductionData}
              columns={columns}
              pagination={{
                total: employee.topics.length,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "15"],
              }}
            />
          ) : (
            <p style={{ color: "#00B4D2", textAlign: "center" }}>
              No feedback received yet.
            </p>
          )}
          <p>
            <span style={{ fontWeight: "bold" }}>Manager Name:</span>{" "}
            {employee.mgrName}
          </p>
          <p>
            <span style={{ fontWeight: "bold" }}>Manager Email:</span>{" "}
            {employee.mgrEmail}
          </p>
        </div>

        <div className="back-button-container">
          <button
            className="submit-button"
            onClick={handleRedirect}
            type="submit"
          >
            BACK
          </button>
        </div>
      </div>
    );
  } else {
    return null; // Handle other categories if necessary
  }
}

export default View;
