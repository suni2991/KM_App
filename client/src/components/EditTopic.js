import axios from "axios";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";

const EditTopic = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [topicId, setTopicId] = useState();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [containsSubtopics, setContainsSubtopics] = useState(false);
  const [subtopics, setSubtopics] = useState([]);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    setTopicId(id);
    if (location.state) {
      console.log(location.state);
      const { _id, topic, category, subtopics } = location.state;
      setTopic(topic);
      if (category) {
        setCategory(category);
      }
      if (subtopics) {
        setSubtopics(subtopics);
      }
    }
  }, [location.state]);
  const handleSubtopicChange = (index, value) => {
    const updatedSubtopics = [...subtopics];
    updatedSubtopics[index] = value;
    setSubtopics(updatedSubtopics);
  };
  const handleAddSubtopic = () => {
    setSubtopics([...subtopics, ""]);
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    let updatedData = {};
    if (category === "Bootcamp") {
      const filteredSubtopics = subtopics.filter((subtopic) => subtopic !== "");
      console.log("filteredSubtopics", filteredSubtopics);
      updatedData = {
        topic: topic,
        subtopics: filteredSubtopics,
      };
    } else {
      updatedData = {
        topic: topic,
      };
    }
    console.log("updatedData ", updatedData);

    try {
      const response = await axios.put(
        `http://localhost:6001/topics/${category}/${topicId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `${response.data.message}`,
      });
      setTopic("");
      setSubtopics("");
      setCategory("");
      navigate("/questionaire");
    } catch (error) {
      console.error("Error sending data to backend:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating data.",
      });
    }
  };
  const handleRemoveSubtopic = (index) => {
    const newSubtopics = [...subtopics];
    newSubtopics.splice(index, 1); // Remove the subtopic at the given index
    setSubtopics(newSubtopics);
  };
  const handleRedirect = () => {
    navigate("/questionaire");
  };
  return (
    <div className="question-form">
      <form onSubmit={handleUpdate}>
        <div>
          <label>Topic:</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            placeholder="Set Topic here"
          />
        </div>
        <div>
          {category === "Bootcamp" && (
            <>
              <div>
                <input
                  type="checkbox"
                  id="contains-subtopics"
                  checked={containsSubtopics}
                  style={{
                    width: "20px",
                    display: "inline-block",
                    marginRight: "10px",
                    verticalAlign: "middle",
                  }}
                  onChange={(e) => setContainsSubtopics(e.target.checked)}
                />
                <label
                  htmlFor="contains-subtopics"
                  style={{ display: "inline-block", verticalAlign: "middle" }}
                >
                  Contains subtopics
                </label>
              </div>
              <br />
              {containsSubtopics &&
                subtopics.map((subtopic, index) => (
                  <div key={index} style={{ margin: "10px" }}>
                    <input
                      type="text"
                      placeholder="Add subtopic"
                      value={subtopic}
                      onChange={(e) =>
                        handleSubtopicChange(index, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtopic(index)}
                      style={{marginLeft: "10px", padding: "5px", backgroundColor: "red", cursor:"pointer"}}
                    >
                      X
                    </button>
                  </div>
                ))}
              {containsSubtopics && (
                <button
                  type="button"
                  style={{ padding: "10px", marginTop: "10px" }}
                  onClick={handleAddSubtopic}
                >
                  + Add Subtopic
                </button>
              )}
            </>
          )}
        </div>
        <div
          style={{
            width: "100%",
            justifyContent: "center",
            display: "flex",
            margin: "10px",
          }}
        >
          {!submitted && (
            <button type="submit" className="send-button">
              Submit
            </button>
          )}
          {
            <button
              className="send-button"
              onClick={handleRedirect}
              type="submit"
            >
              Back
            </button>
          }
        </div>
      </form>
    </div>
  );
};

export default EditTopic;
