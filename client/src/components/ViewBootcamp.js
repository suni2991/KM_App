import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Table, Input } from "antd";
import TrainingStatusDropdown from "./TrainingStatusDropdown";
import useAuth from "../hooks/useAuth";
import { AiOutlineDelete } from "react-icons/ai";
import { CiRead } from "react-icons/ci";

const { Search } = Input;

function ViewBootcamp() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [bootcampData, setBootcampData] = useState(null);
  const { auth } = useAuth();
  const [searchText, setSearchText] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    fetch(`http://localhost:6001/bootcamp/${email}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Bootcamp Data:", data);
        setBootcampData(data);
      })
      .catch((error) => {
        console.error("Error fetching bootcamp details:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to fetch bootcamp details.",
        });
      });
  }, [email]);

  if (!bootcampData) {
    return <div>Loading...</div>;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const handleTrainingStatusChange = (trainingId, newStatus) => {
    const trainingIndex = bootcampData.trainings.findIndex(
      (training) => training._id === trainingId
    );

    if (trainingIndex === -1) {
      console.error("Training not found with the given _id:", trainingId);
      return;
    }

    const updatedTrainings = [...bootcampData.trainings];
    updatedTrainings[trainingIndex] = {
      ...updatedTrainings[trainingIndex],
      trainingStatus: newStatus,
    };
    setBootcampData({
      ...bootcampData,
      trainings: updatedTrainings,
    });
    fetch(
      `http://localhost:6001/bootcamps/${bootcampData._id}/trainings/${trainingId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainingStatus: newStatus,
        }),
      }
    )
      .then((response) => response.json())
      .then((updatedBootcamp) => {
        console.log(
          "Training status updated in the database:",
          updatedBootcamp
        );
      })
      .catch((error) => {
        console.error("Error updating training status:", error);
      });
  };

  function formatTimeToAMPM(timeString) {
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    const [hourMinute, ampm] = new Date(`2000-01-01T${timeString}`)
      .toLocaleTimeString(undefined, options)
      .split(" ");
    return `${hourMinute} ${ampm}`;
  }

  const handleRedirect = () => {
    if (auth.role === "Admin") {
      navigate("/bootcamps");
    } else if (auth.role === "Manager") {
      navigate("/bootcamps");
    }
  };

  const handleDeleteTraining = (trainingId) => {
    fetch(
      `http://localhost:6001/bootcamps/${bootcampData._id}/trainings/${trainingId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          const updatedTrainings = bootcampData.trainings.filter(
            (training) => training._id !== trainingId
          );
          setBootcampData({
            ...bootcampData,
            trainings: updatedTrainings,
          });
          console.log("Training deleted successfully");
        } else {
          console.error("Failed to delete training");
        }
      })
      .catch((error) => {
        console.error("Error deleting training:", error);
      });
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => formatDate(date),
    },
    {
      title: "Topic Name",
      dataIndex: "trainingName",
      key: "trainingName",
      filterIcon: () => <Search />,
      onFilter: (value, record) =>
        record.trainingName.toLowerCase().includes(value.toLowerCase()),
      render: (text, record) => <div>{text}</div>,
    },
    {
      title: "Sub Topics",
      dataIndex: "subTrainings",
      key: "subTrainings",
      filterIcon: () => <Search />,
      onFilter: (value, record) =>
        record.subTrainings.toLowerCase().includes(value.toLowerCase()),
      render: (text, record) => (
        <div>
          {record.subTrainings.length > 0
            ? record.subTrainings.join(", ")
            : "-"}
        </div>
      ),
    },
    {
      title: "Time Slot",
      dataIndex: "timeSlot",
      key: "timeSlot",
      render: (timeSlot) => {
        if (typeof timeSlot === "string") {
          return timeSlot;
        } else if (timeSlot instanceof Date) {
          const [startTime, endTime] = timeSlot
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .split(":");
          const ampm = timeSlot
            .toLocaleTimeString([], { hour12: true, hour: "numeric" })
            .split(" ")[1];
          return `${startTime}:${endTime} ${ampm}`;
        } else {
          return "";
        }
      },
    },
    {
      title: "Training Status",
      dataIndex: "trainingStatus",
      key: "trainingStatus",
      render: (text, record) => (
        <TrainingStatusDropdown
          initialValue={text}
          onChange={(value) => handleTrainingStatusChange(record._id, value)}
        />
      ),
    },
    {
      title: "Delete",
      key: "delete",
      render: (text, record) => (
        <button
          onClick={() => handleDeleteTraining(record._id)}
          className="action-button"
        >
          <AiOutlineDelete color="#fff" />
        </button>
      ),
    },
  ];

  const filteredTrainings = bootcampData.trainings.filter((training) =>
    training.trainingName.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredTrainingsSorted = [...filteredTrainings].sort((a, b) => {
    return filteredTrainings.indexOf(b) - filteredTrainings.indexOf(a);
  });

  return (
    <div className="table-container">
      <h1
        style={{
          color: "#00B4D2",
          fontWeight: "bold",
          textDecoration: "underline",
        }}
      >
        Employee Bootcamp Details - {bootcampData.fullName}
      </h1>
      <p style={{ fontWeight: "bolder" }}>Email: {bootcampData.email}</p>

      <Search
        placeholder="Search by Training Name"
        onChange={(e) => setSearchText(e.target.value)}
        style={{
          marginBottom: 16,
          float: "right",
          width: "30%",
          color: "#00B4D2",
        }}
      />

      {filteredTrainingsSorted.length > 0 ? (
        <div>
          <Table
            dataSource={filteredTrainingsSorted}
            columns={columns}
            pagination={{
              total: filteredTrainingsSorted.length,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "15", "20"],
            }}
          />
        </div>
      ) : (
        <div style={{ margin: "5px 0px 5px 180px" }}>
          <center>
            <i>
              <p>No records found.</p>
            </i>
          </center>
        </div>
      )}

      <hr />
      <p>
        <b>Manager Name: </b>
        {bootcampData.mgrName}
      </p>
      <p>
        <b>Manager Email: </b>
        {bootcampData.mgrEmail}
      </p>

      <button
        className="submit-button"
        onClick={handleRedirect}
        style={{ margin: "0 auto" }}
        type="submit"
      >
        BACK
      </button>
      <br />
      <center>
        <i>
          <p style={{ color: "#00B4D2", fontWeight: "bold" }}>
            {" "}
            *You can view the Nominated Training details of the Employee & can
            update the status
          </p>
        </i>
      </center>
    </div>
  );
}

export default ViewBootcamp;
