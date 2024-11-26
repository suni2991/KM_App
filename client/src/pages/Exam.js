import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Exam.css";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Timer from "../components/Timer";
import Modal from "react-modal";
import Swal from "sweetalert2";

const Exam = () => {
  const { auth, setAuth } = useAuth();
  const [testCount, setTestCount] = useState(0);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(null);
  const passingScore = 0.8 * questions.length;
  const pendingTopics = auth.topics.filter((topic) => topic.score === -1);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const currentTopic = auth.topics[currentTopicIndex]?.topic;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [timerExpired, setTimerExpired] = useState(false);
  const { token } = useAuth();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const handleTimerExpired = () => {
    setTimerExpired(true);
    handleLogout(); // Logout when timer expires
  };

  useEffect(() => {
    const timer = setTimeout(handleTimerExpired, 20 * 60 * 1000); // 600 seconds = 10 minutes

    return () => clearTimeout(timer);
  }, []);

  // Rest of your component code...

  const handleLogout = async () => {
    setAuth({});
    setSubmitDisabled(true);
    Swal.fire({
      title: "Thank you!",
      text: "You are being logged out.",
      icon: "info",
      confirmButtonColor: "#00B4D2",
    });
    navigate("/");
  };

  const fetchQuestions = async () => {
    try {
      const currentTopic = auth.topics[currentTopicIndex];
      if (currentTopic.score !== -1) {
        setQuestions([]);
        console.log("Exam already attempted for this topic");
      } else {
        const endpoint = getEndpointForTopic();
        const response = await axios.get(endpoint, {
          headers: headers
        });
        const testCountResponse = await axios.get(
          `http://localhost:6001/employees/${auth._id}/topics/${currentTopic._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTestCount(testCountResponse.data.testCount);
        setQuestions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  useEffect(() => {
    if (auth.role === "Employee") {
      const firstNotAttemptedTopicIndex = auth.topics.findIndex(
        (topic) => topic.score === -1
      );
      if (firstNotAttemptedTopicIndex !== -1) {
        setCurrentTopicIndex(firstNotAttemptedTopicIndex);
      } else {
        setCurrentTopicIndex(auth.topics.length - 1);
      }
      try {
        fetchQuestions();
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    }
  }, [auth.role, auth.topics, currentTopicIndex]);

  const getEndpointForTopic = () => {
    const userTopic = auth.topics[currentTopicIndex]?.topic;
    if (userTopic) {
      return `http://localhost:6001/questions/${userTopic}`;
    } else {
      throw new Error("No topic found for the user.");
    }
  };

  const renderResult = () => {
    if (score !== null) {
      // Consider passing if the user scores 90% or above
      const hasPassed = score >= passingScore;

      return (
        <div>
          <center>
            <h2
              style={{ fontWeight: "bold", color: hasPassed ? "green" : "red" }}
            >
              You have {hasPassed ? "PASSED" : "FAILED"} in the exam, You scored{" "}
              {score} out of {questions.length}
            </h2>
          </center>
        </div>
      );
    }
    return null;
  };

  const areAllQuestionsAnswered = () => {
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === undefined) {
        return false; // Return false if any question is unanswered
      }
    }
    return true; // All questions are answered
  };

  const openModal = (imageURL) => {
    setSelectedImage(imageURL);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedImage("");
    setModalIsOpen(false);
  };

  const updateScore = async () => {
    try {
      if (!questions || questions.length === 0) {
        throw new Error("No questions found.");
      }
      const currentTopic = auth.topics[currentTopicIndex].topic;
      const passingScore = 0.8 * questions.length;
      let totalScore = 0;

      for (let i = 0; i < questions.length; i++) {
        const correctAnswerIndex = questions[i].correctAnswer;
        const userAnswer = userAnswers[i];

        if (
          userAnswer !== undefined &&
          correctAnswerIndex === parseInt(userAnswer)
        ) {
          totalScore++;
        }
      }

      setTestCount((prevTestCount) => prevTestCount + 1);

      const userTopic = auth.topics[currentTopicIndex]?.topic;
      if (userTopic) {
        const topicObj = auth.topics.find((topic) => topic.topic === userTopic);
        const topicId = topicObj._id;
        const endpoint = `http://localhost:6001/employees/${auth._id}/topics/${topicId}`;
        console.log("Endpoint:", endpoint);

        await axios.put(
          endpoint,
          {
            score: totalScore,
            testCount: testCount,
            assessmentStatus: "Attempted",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setScore(totalScore);
      setCurrentTopicIndex((prevIndex) => prevIndex + 1);
      // Send email notifications after updating the database
      await sendEmailToEmployee(
        auth.fullName,
        auth.email,
        currentTopic,
        totalScore
      );
      await sendEmailToManager(
        auth.fullName,
        auth.mgrEmail,
        auth.mgrName,
        currentTopic,
        totalScore
      );
    } catch (error) {
      console.error("Failed to update score:", error);
    }
  };

  const sendEmailToEmployee = async (fullName, email, topic, score) => {
    try {
      const result = score >= passingScore ? "Passed" : "Failed";

      const response = await axios.post(
        "http://localhost:6001/score/employee",
        {
          fullName,
          email,
          topic,
          score,
          result,
        },
        {
          headers: headers,
        }
      );

      console.log("Email sent to employee successfully:", response.data);
    } catch (error) {
      console.error("Failed to send email to employee:", error);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleAnswerChange = (event) => {
    const { name, value } = event.target;
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [name]: value === "null" ? null : parseInt(value),
    }));
  };

  const calculateScore = () => {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      const correctAnswerIndex = questions[i].correctAnswer;
      const userAnswer = userAnswers[i];
      if (
        userAnswer !== undefined &&
        correctAnswerIndex === parseInt(userAnswer)
      ) {
        score++;
      }
    }
    setScore(score);
    setCurrentQuestionIndex(questions.length);
    updateScore();
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Tab switched, terminate the exam
        setTimerExpired(true);
        handleLogout();
        Swal.fire({
          title: "Exam Terminated",
          text: "You navigated to another tab. The exam has been terminated.",
          icon: "info",
          confirmButtonColor: "#00B4D2",
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const sendEmailToManager = async (
    fullName,
    mgrEmail,
    mgrName,
    topic,
    score
  ) => {
    try {
      const result = score >= passingScore ? "Passed" : "Failed";
      const response = await axios.post(
        "http://localhost:6001/score/manager",
        {
          fullName,
          mgrEmail,
          mgrName,
          topic,
          score,
          result,
        },
        {
          headers: headers,
        }
      );
      console.log("Email sent to manager successfully:", response.data);
    } catch (error) {
      console.error("Failed to send email to manager:", error);
    }
  };

  return (
    <div className="main_Exam_control">
      <div className="quiz-container">
        {pendingTopics.length === 0 ? (
          <div>
            <center>
              <h2>No assessments pending.</h2>
              <p>Please Close this Window</p>
            </center>
          </div>
        ) : currentQuestionIndex < questions.length ? (
          <div className="que exam_h">
            <h1> {currentTopic}</h1>
            <br />

            <div className="que-container Quez_container">
              <div className="timer">
                <span
                  style={{
                    textAlign: "start",
                    color: "#800080",
                    fontWeight: "bolder",
                    marginTop: "14px",
                  }}
                >
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
                <Timer initialTimer={1200} />
              </div>
              <h2
                style={{
                  fontWeight: "500",
                  fontSize: "18px",
                  color: "#11052C",
                }}
              >
                {" "}
                Q: {questions[currentQuestionIndex].question}
              </h2>
              {questions[currentQuestionIndex].image && (
                <div>
                  <img
                    src={`http://localhost:6001/uploads/${questions[currentQuestionIndex].image}`}
                    alt="Question Image"
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() =>
                      openModal(
                        `http://localhost:6001/uploads/${questions[currentQuestionIndex].image}`
                      )
                    }
                  />
                </div>
              )}
            </div>
            <div>
              {questions[currentQuestionIndex].options &&
                questions[currentQuestionIndex].options.map((option, index) => (
                  <div key={index} className="ans-options">
                    <input
                      type="radio"
                      id={`option${index}`}
                      name={currentQuestionIndex.toString()} // Convert to string
                      value={index.toString()} // Convert to string
                      checked={userAnswers[currentQuestionIndex] === index} // Compare with index
                      onChange={handleAnswerChange}
                    />
                    <label className="options" htmlFor={`option${index}`}>
                      {option}
                    </label>
                  </div>
                ))}
            </div>
            <div className="back-button-container Exam_btn">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="send-button"
              >
                Previous
              </button>
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  className="send-button"
                  onClick={calculateScore}
                  disabled={!areAllQuestionsAnswered()}
                >
                  Finish
                </button>
              ) : (
                <button className="send-button" onClick={handleNext}>
                  Next
                </button>
              )}
            </div>
            <center>
              <p style={{ color: "#800080" }}>
                *Please answer all the Questions*
              </p>
            </center>
            {questions[currentQuestionIndex].image && (
              <center>
                <p style={{ color: "#800080" }}>
                  **Please answer all the Questions**
                </p>
              </center>
            )}
          </div>
        ) : (
          <div>
            {renderResult()}

            <center>
              <button
                onClick={handleLogout}
                disabled={!areAllQuestionsAnswered()}
                className="send-button"
                style={{ width: "20%" }}
              >
                Submit & Logout
              </button>
            </center>
          </div>
        )}

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Image Modal"
          style={{
            overlay: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
            },
            content: {
              position: "relative",
              top: "auto",
              left: "auto",
              right: "auto",
              bottom: "auto",
              maxWidth: "90vw", // Maximum width of the modal
              maxHeight: "90vh", // Maximum height of the modal
              padding: "20px",
              border: "none",
              background: "white",
              overflow: "hidden", // Hide overflow content
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              objectFit: "cover",
            },
          }}
        >
          {selectedImage && (
            <div style={{ textAlign: "center" }}>
              <img
                src={selectedImage}
                alt="modal-image"
                style={{ width: "80%", height: "60%", objectFit: "cover" }}
              />
              <br />
              <button className="send-button" onClick={closeModal}>
                Close
              </button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
export default Exam;
