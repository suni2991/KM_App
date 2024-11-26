import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function QuestionForm({ onSubmit, selectedTopic }) {
  const location = useLocation();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [mark, setMark] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [image, setImage] = useState(null);
  const [showDragDrop, setShowDragDrop] = useState(false);
  const { id: question_Id } = useParams();
  const navigate = useNavigate();
  const selectedTopicName = "";
  const [topics, setTopics] = useState();
  const { token } = useAuth();
  let formType = "";

  useEffect(() => {
    console.log("id " + location.topics);
    const fetchTopics = async () => {
      try {
        const response = await axios.get(
          `http://localhost:6001/topics/Assessment`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTopics(response.data.topics);
        console.log("Fetched topics:", response.data.topics);
        // Update topics in the state or perform other actions as needed
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [selectedTopic]); // Trigger fetch when selectedTopic changes

  const getEndpointForTopic = (selectedTopicId) => {
    const selectedTopic = topics.find((topic) => topic._id === selectedTopicId);

    if (!selectedTopic) {
      throw new Error(`Invalid topic: ${selectedTopicId}`);
    }

    const selectedTopicName = selectedTopic.topic; // Assuming 'topic' is the property for the topic name

    return `http://localhost:6001/question/${selectedTopicName}`;
  };

  const handleRedirect = () => {
    navigate("/questionaire");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setImage(file);
  };

  const handleCheckboxChange = () => {
    setShowDragDrop(!showDragDrop); // Toggle the checkbox state
  };

  const handleOptionChange = (optionIndex) => {
    setCorrectAnswer(optionIndex);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filledOptions = options.filter((option) => option.trim() !== "");
    if (filledOptions.length < 2) {
      Swal.fire({
        title: "Error",
        text: "Please fill in at least 2 options.",
        icon: "error",
        confirmButtonColor: "#00B4D2",
      });
      return;
    }

    Swal.fire({
      title: "Submit Question?",
      text: "Are you sure you want to submit this question?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#00B4D2",
      cancelButtonColor: "#d33",
      confirmButtonText: "Submit",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const isAnswerCorrect =
          correctAnswer === options.indexOf(options[correctAnswer]);
        const newMark = isAnswerCorrect ? 1 : 0;

        const newQuestion = {
          question: question,
          options: filledOptions,
          correctAnswer: correctAnswer,
          mark: newMark,
          createdAt: new Date(),
          image: image,
        };
        const endpoint = getEndpointForTopic(selectedTopic);

        // const endpoint = 'http://localhost:6001/question'; // Endpoint for creating a new question
        try {
          const response = await axios.post(endpoint, newQuestion, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
          console.log("Question saved successfully:", response.data);

          Swal.fire({
            icon: "success",
            title: "Question has been saved",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
          setQuestion("");
          setOptions(["", "", "", ""]);
          setCorrectAnswer(0);
          setSubmitted(false);
          setMark(0);
          setImage(null);
        } catch (error) {
          console.error("Error saving question:", error);
          Swal.fire({
            title: "Error",
            text: "There was an error submitting your question. Please try again later.",
            icon: "error",
            confirmButtonColor: "#00B4D2",
          });
        }
      }
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    console.log(options[correctAnswer]);
    const isAnswerCorrect =
      correctAnswer === options.indexOf(options[correctAnswer]);
    const newMark = isAnswerCorrect ? 1 : 0;
    setMark(newMark);

    console.log("Image " + image);

    const updatedQuestion = {
      question: question,
      options: options,
      correctAnswer: correctAnswer,
      mark: newMark,
      createdAt: new Date(),
      image: image,
    };

    const endpoint = `http://localhost:6001/question/${question_Id}`;

    await axios
      .put(endpoint, updatedQuestion, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      .then(async (response) => {
        console.log("Question updated successfully:", response.data);

        Swal.fire({
          icon: "success",
          title: "Question has been saved",
          showConfirmButton: true,
          confirmButtonColor: "#00B4D2",
        });
        navigate("/questionaire");

        setSubmitted(true);
      })
      .catch((error) => {
        console.error("Error updating question:", error);

        Swal.fire({
          title: "Error",
          text: "There was an error updating your question. Please try again later.",
          icon: "error",
          confirmButtonColor: "#00B4D2",
        });
      });
  };

  useEffect(() => {
    if (location.state) {
      const { question, options, correctAnswer, mark } = location.state;
      setQuestion(question);
      setOptions(options);
      setCorrectAnswer(correctAnswer);
      setMark(mark);
    }
  }, [location.state]);

  if (question_Id) {
    formType = handleUpdate;
  } else {
    formType = handleSubmit;
  }

  return (
    <div className="question-form">
      {topics && topics.length > 0 ? (
        <form onSubmit={formType}>
          <div>
            <label htmlFor="imageCheckbox">
              <input
                type="checkbox"
                id="imageCheckbox"
                checked={showDragDrop}
                onChange={handleCheckboxChange}
              />
              Upload Image (Check to Enable Drag & Drop)
            </label>
          </div>
          {showDragDrop && (
            <div>
              <label htmlFor="image">Drag & Drop Image:</label>
              <div
                id="drop-zone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  width: "100%",
                  height: "100px",
                  border: "2px dashed #ccc",
                  borderRadius: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginBottom: "10px",
                }}
              >
                Drop Image Here or Click to Upload
              </div>
              {image && (
                <div>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Uploaded"
                    style={{ maxWidth: "200px", maxHeight: "200px" }}
                  />
                </div>
              )}
            </div>
          )}
          <div>
            <label>Question:</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="Set Question here"
            />
          </div>
          <br />
          {options.map((option, index) => (
            <label
              key={index}
              style={{ display: "flex", justifyContent: "space-around" }}
            >
              <input
                type="radio"
                name="answer"
                className="qestion_form_radio"
                value={option}
                checked={correctAnswer === index}
                onChange={() => handleOptionChange(index)}
                required
                disabled={submitted}
              />
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
                disabled={submitted}
                placeholder="Add Options"
              />
            </label>
          ))}
          <br />
          <div
            style={{ width: "100%", justifyContent: "center", display: "flex" }}
          >
            {!submitted && (
              <button className="send-button" type="submit">
                SUBMIT
              </button>
            )}
            {
              <button
                className="send-button"
                onClick={handleRedirect}
                type="submit"
              >
                BACK
              </button>
            }
          </div>
        </form>
      ) : (
        <p>Loading topics...</p>
      )}

      {submitted && (
        <div>
          <p>Mark: {mark}</p>
        </div>
      )}
    </div>
  );
}

export default QuestionForm;
