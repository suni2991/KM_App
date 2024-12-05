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
  const [topicObject, setTopicObject] = useState("");
  const [topicTitle, setTopicTitle] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState();
  const [category, setCategory] = useState("");
  const [containsSubtopics, setContainsSubtopics] = useState(false);
  const [subtopics, setSubtopics] = useState([]);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    setTopicId(id);

    const fetchTopic = async () => {
      try {
        const response = await axios.get(`http://localhost:6001/topics/id/${id}`,  {
          headers: {
            Authorization: `Bearer ${token}`, // Replace 'Bearer' with the required scheme if different
          },
        });

        const fetchedTopic = await response.data.data; 

        setTopicObject(fetchedTopic);
        setTopicTitle(fetchedTopic.topic);
        setNumberOfQuestions(fetchedTopic.numberOfQuestions);
        setCategory(fetchedTopic.category);
        console.log("Fetched Topic : ");
        console.log(topicObject);  //this will show undefined because of asynchrnous behaviour of javascript.
        console.log("Selected Category : ");
        console.log(category);
      } catch (error) {
        // Handle errors
        console.error(`Error fetching the topic with id ${id}: `, error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while fetching topic.",
        });
      }
    }

    fetchTopic();
    

    // if (location.state) {
    //   console.log("location state: ");
    //   console.log(location.state);
    //   const { _id, topic, category, subtopics, numberOfQuestions } = location.state;
    //   setTopic(topic);
    //   if(numberOfQuestions){
    //     setNumberOfQuestions(numberOfQuestions);
    //   }
    //   if (category) {
    //     setCategory(category);
    //   }
    //   if (subtopics) {
    //     setSubtopics(subtopics);
    //   }
    // }
  }, [topicId]);
  
  // useEffect(() => {
  //   // if (topic) {
  //     console.log("Fetched Topic (Updated): ", topic); // Logs the updated topic
  //     // console.log(token);
      
  //   // }
  // }, [topic]); 

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
        topic: topicTitle,
        subtopics: filteredSubtopics,
      };
    } else {
      updatedData = {
        topic: topicTitle,
        numberOfQuestions: numberOfQuestions,
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
      setTopicObject("");
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
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            required
            placeholder="Set Topic here"
          />
          <br />

          <label>Enter Number of Questions to be attempted by the candidate:</label>
          <input
            type="number"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(e.target.value)}
            required
            placeholder="Set Number Of Questions here"
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
                      style={{ marginLeft: "10px", padding: "5px", backgroundColor: "red", cursor: "pointer" }}
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
