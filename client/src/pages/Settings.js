import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import useAuth from "../hooks/useAuth";

const Settings = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [category, setCategory] = useState("");
  const [topic, setTopicName] = useState("");
  const [presenter, setPresenter] = useState("");
  const [department, setDepartment] = useState("");
  const [mgrName, setMgrName] = useState("");
  const [mgrEmail, setMgrEmail] = useState("");
  const [containsSubtopics, setContainsSubtopics] = useState(false); // New state for the checkbox
  const [subtopics, setSubtopics] = useState([]);
  const { token } = useAuth();

  const handleDropdownChange = (e) => {
    const { value } = e.target;
    setSelectedOption(value);
    setCategory("");
    setTopicName("");
    setPresenter("");
    setDepartment("");
    setMgrName("");
    setMgrEmail("");
    setContainsSubtopics(false);
    setSubtopics([]);
  };

  const handleAddSubtopic = () => {
    setSubtopics([...subtopics, ""]);
  };

  const handleSubtopicChange = (index, value) => {
    const updatedSubtopics = [...subtopics];
    updatedSubtopics[index] = value;
    setSubtopics(updatedSubtopics);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let dataToSend = {};

    if (selectedOption === "Topic") {
      dataToSend = {
        selectedOption,
        category,
        topic,
        containsSubtopics,
        subtopics,
      };
    } else if (selectedOption === "Presenter") {
      dataToSend = {
        selectedOption,
        presenter,
      };
    } else if (selectedOption === "Manager") {
      dataToSend = {
        selectedOption,
        mgrName,
        mgrEmail,
      };
    } else if (selectedOption === "Department") {
      dataToSend = {
        selectedOption,
        department,
      };
    }

    try {
      const response = await axios.post(
        "http://localhost:6001/saveData",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Data sent to backend:", response.data);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Data saved successfully!",
      });
    } catch (error) {
      console.error("Error sending data to backend:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving data.",
      });
      // Optionally, you can handle errors or display an error message to the user
    }
  };

  return (
    <div className="reg-container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="dropdown">Select Option:</label>
        <select
          id="dropdown"
          value={selectedOption}
          onChange={handleDropdownChange}
        >
          <option value="">Select...</option>

          <option value="Topic">Topic</option>
          <option value="Presenter">Presenter</option>
          <option value="Manager">Manager</option>
        </select>
        <br />

        {selectedOption === "Topic" && (
          <>
            <label htmlFor="category">Select Category:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select...</option>
              <option value="Assessment">Assessment</option>
              <option value="Induction">Induction</option>
              <option value="Training">Training</option>
              <option value="Bootcamp">Bootcamp</option>
            </select>
            <br />
            <label htmlFor="topic">Enter Topic Name:</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopicName(e.target.value)}
            />
            {category === "Bootcamp" && (
              <>
                <input
                  type="checkbox"
                  id="contains-subtopics"
                  checked={containsSubtopics}
                  style={{ width: "20px" }}
                  onChange={(e) => setContainsSubtopics(e.target.checked)}
                />
                <label htmlFor="contains-subtopics">Contains subtopics</label>
                <br />
                {containsSubtopics &&
                  subtopics.map((subtopic, index) => (
                    <div key={index}>
                      <input
                        type="text"
                        placeholder="Add subtopic"
                        value={subtopic}
                        onChange={(e) =>
                          handleSubtopicChange(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                {containsSubtopics && (
                  <button type="button" onClick={handleAddSubtopic}>
                    + Add Subtopic
                  </button>
                )}
              </>
            )}
          </>
        )}

        {selectedOption === "Presenter" && (
          <>
            <label htmlFor="presenter-name">Presenter Name:</label>
            <input
              type="text"
              id="presenter-name"
              value={presenter}
              onChange={(e) => setPresenter(e.target.value)}
            />
          </>
        )}

        {selectedOption === "Department" && (
          <>
            <label htmlFor="department-name">Department Name:</label>
            <input
              type="text"
              id="department-name"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </>
        )}

        {selectedOption === "Manager" && (
          <>
            <label htmlFor="mgr-name">Manager Name:</label>
            <input
              type="text"
              id="mgr-name"
              value={mgrName}
              onChange={(e) => setMgrName(e.target.value)}
            />
            <br />
            <label htmlFor="mgr-email">Manager Email:</label>
            <input
              type="email"
              id="mgr-email"
              value={mgrEmail}
              onChange={(e) => setMgrEmail(e.target.value)}
            />
          </>
        )}

        <br />
        <button style={{ marginLeft: "22%" }} type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Settings;
