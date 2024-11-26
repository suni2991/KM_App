import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import Dropdown from "./Dropdown";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { emailData } from "../Assets/EmailData";

const AddBootcamp = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    fullName: "",
    email: "",
    trainingTopic: "",
    date: null,
    fromTime: "",
    toTime: "",
    subTrainings: [],
  });

  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubTopic, setSelectedSubTopic] = useState("");

  const handleTopicSelect = (topic, subTopics) => {
    setSelectedSubTopic(subTopics);
    setSelectedTopic(topic);
    setEmployeeData({
      ...employeeData,
      trainingTopic: topic,
      subTrainings: subTopics || [],
    });
  };
  const { auth } = useAuth();
  const { token } = useAuth();
  const [registeredEmployees, setRegisteredEmployees] = useState([]);

  const handleDateChange = (date) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (date < currentDate) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "please enter a future date",
        showConfirmButton: true,
        confirmButtonColor: "#00B4D2",
      });
    } else {
      setSelectedDate(date);
      setEmployeeData({ ...employeeData, date });
    }
  };

  const navigate = useNavigate();

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setEmployeeData({
      ...employeeData,
      [name]: name === "trainingTopic" ? value : value,
    });

    if (name === "fullName") {
      const employee = emailData.find((emp) => emp.fullName === value);
      const email = employee ? employee.email : "";
      setEmployeeData({
        ...employeeData,
        [name]: value,
        email: email,
      });
    } else {
      setEmployeeData({
        ...employeeData,
        [name]: value,
      });
    }

    if (name === "timeSlot") {
      if (value === "custom") {
        setShowCustomTime(true);
      } else {
        const [fromTime, toTime] = value.split(" - ");
        setEmployeeData({
          ...employeeData,
          fromTime,
          toTime,
          timeSlot: value,
        });
        setShowCustomTime(false);
      }
      console.log(
        "Generated timeSlot:",
        `${employeeData.fromTime} - ${employeeData.toTime}`
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isoDate = employeeData.date ? employeeData.date.toISOString() : "";
    const registrationsForDateTopic = registeredEmployees.filter(
      (employee) =>
        employee.date === isoDate &&
        employee.trainingTopic === employeeData.trainingTopic
    );

    if (registrationsForDateTopic.length >= 50) {
      Swal.fire({
        icon: "error",
        title: "Limit Exceeded",
        text: "Please choose some other Date as it exceeds Limit of 50 for this topic on the same day.",
        showConfirmButton: true,
        confirmButtonColor: "#00B4D2",
      });
      return;
    }

    const missingFields = [];
    if (!employeeData.fullName) missingFields.push("Full Name");
    if (!employeeData.email) missingFields.push("Email");
    if (!employeeData.trainingTopic) missingFields.push("Training Topic");
    if (!selectedDate) missingFields.push("Training Date");
    if (showCustomTime && (!employeeData.fromTime || !employeeData.toTime)) {
      missingFields.push("Custom Time Slot");
    } else if (!showCustomTime && !employeeData.timeSlot) {
      missingFields.push("Time Slot");
    }

    // Check if any fields are missing
    if (missingFields.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        html: `Please fill the following field(s):<br>${missingFields.join(
          "<br>"
        )}`,
        showConfirmButton: true,
        confirmButtonColor: "#00B4D2",
      });
      return;
    }

    // Check if email is in correct format
    if (!employeeData.email.endsWith("@enfuse-solutions.com")) {
      Swal.fire({
        icon: "error",
        title: "Email should end with @enfuse-solutions.com",
        text: "Please use EnFuse email only",
        showConfirmButton: true,
        confirmButtonColor: "#00B4D2",
      });
      return;
    }

    // Check if the nomination already exists for the email, date, and topic
    const registeredEmployeeIndex = findRegisteredEmployeeIndex(
      employeeData.email,
      employeeData.date,
      employeeData.trainingTopic
    );

    // Submit data to the server
    const dataToSend = {
      mgrName: auth.fullName,
      mgrEmail: auth.email,
      fullName: employeeData.fullName,
      email: employeeData.email,
      trainings: [
        {
          trainingName: employeeData.trainingTopic,
          date: isoDate,
          timeSlot: showCustomTime
            ? `${employeeData.fromTime} - ${employeeData.toTime}`
            : employeeData.timeSlot,
          trainingStatus: "Initialised",
          subTrainings: employeeData.subTrainings, // Include subTopics here
        },
      ],
    };

    fetch("http://localhost:6001/add/bootcamps", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => {
        if (response.ok) {
          // Handle successful registration...
          return response.json();
        } else if (response.status === 400) {
          // Handle 400 (Bad Request) error - Limit Exceeded
          Swal.fire({
            icon: "error",
            title: "Limit Exceeded",
            text: "Please choose some other Date as it exceeds Limit of 5 for this topic on the same day.",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
          throw new Error("Limit Exceeded");
        } else if (response.status === 500) {
          // Handle 500 (Internal Server Error) - Nomination already exists
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Nomination already exists for this Email.",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
          throw new Error("Nomination already exists");
        } else {
          throw new Error("Network response was not ok.");
        }
      })
      .then((data) => {
        // Handle successful registration response...
        setRegisteredEmployees([...registeredEmployees, dataToSend]);
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Nomination successfully submitted.",
          showConfirmButton: true,
          confirmButtonColor: "#00B4D2",
        });
        setEmployeeData({
          fullName: "",
          email: "",
        });
        setSelectedDate(null);
        setShowCustomTime(false);
      })
      .catch((error) => {
        console.error("Error submitting employee data:", error);
        if (error.message === "Limit Exceeded") {
          Swal.fire({
            icon: "error",
            title: "Limit Exceeded",
            text: "Please choose some other Date as it exceeds Limit of 5 for this topic on the same day.",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
        } else if (error.message === "Nomination already exists") {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Nomination already exists for this Email.",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "An unexpected error occurred.",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
        }
      });
  };

  const emailPattern = /^[a-zA-Z0-9._%+-]+@enfuse-solutions\.com$/;

  const handleRedirect = () => {
    if (auth.role === "Admin") {
      navigate("/bootcamps");
    } else if (auth.role === "Manager") {
      navigate("/employees");
    }
  };

  const findRegisteredEmployeeIndex = (email, date, trainingTopic) => {
    return registeredEmployees.findIndex(
      (employee) =>
        employee.email === email &&
        employee.date &&
        employee.date.toISOString().slice(0, 10) ===
          date.toISOString().slice(0, 10) && // Compare only dates
        employee.trainingTopic === trainingTopic
    );
  };

  return (
    <div className="reg-container">
      <h1
        style={{
          fontSize: "25px",
          color: "#00B4D2",
          paddingBottom: " 20px",
          fontWeight: "bold",
          textDecoration: "underline",
          textDecorationColor: "#00B4D2",
        }}
      >
        Bootcamp Form{" "}
      </h1>
      <form>
        <div className="datepicker-container">
          <label>
            Training Date:<span className="require">*</span>
          </label>
          <DatePicker
            selected={selectedDate}
            popperPlacement="bottom-end"
            onChange={handleDateChange}
            placeholderText="Pick a Date"
          />
        </div>
        <br />
        <label>
          Time Slot:<span className="require">*</span>
        </label>
        <select
          name="timeSlot"
          value={employeeData.timeSlot}
          onChange={handleFormChange}
          className="reg-input"
        >
          <option value="">Select Time Slot</option>
          <option value="11:30 AM - 07:30 PM">11:30 AM - 07:30 PM</option>
          <option value="11:30 AM - 03:00 PM">11:00 AM - 03:00 PM</option>
          <option value="02:30 PM - 04:30 PM">02:30 PM - 04:30 PM</option>
          <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
          <option value="05:30 PM - 07:30 PM">05:30 PM - 07:30 PM</option>
          <option value="custom">Custom Slot</option>
        </select>
        {showCustomTime && (
          <>
            <input
              type="time"
              name="fromTime"
              value={employeeData.fromTime}
              onChange={handleFormChange}
              className="reg-input"
              style={{ width: "100px" }}
            />
            <span style={{ fontWeight: "bold" }}> To </span>
            <input
              type="time"
              name="toTime"
              value={employeeData.toTime}
              onChange={handleFormChange}
              className="reg-input"
              style={{ width: "100px" }}
              placeholder="To"
            />
          </>
        )}
        <br />
        <label>
          Full Name:<span className="require">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          className="reg-input"
          value={employeeData.fullName}
          onChange={handleFormChange}
        />

        <br />
        <label>
          Email:<span className="require">*</span>
        </label>
        <input
          className="reg-input"
          type="email"
          name="email"
          value={employeeData.email}
          maxLength={50}
          required
          pattern={emailPattern}
          onChange={handleFormChange}
          placeholder="@enfuse-solutions.com"
          list="emailSuggestions"
        />

        <br />

        <Dropdown
          apiUrl="http://localhost:6001/topics/Bootcamp" // Adjust the API URL accordingly
          onSelect={handleTopicSelect}
          name="trainingTopic"
          label="Select Topic:"
          className="reg-input"
          value={employeeData.trainingTopic}
        />

        <br />
        <button
          className="send-button"
          type="submit"
          style={{ marginLeft: "80px" }}
          onClick={handleSubmit}
        >
          Register
        </button>
        <button
          className="send-button"
          style={{ marginLeft: "80px" }}
          onClick={handleRedirect}
        >
          BACK
        </button>
      </form>
    </div>
  );
};

export default AddBootcamp;
