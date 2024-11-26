import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { CiPen } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import useAuth from "../hooks/useAuth";

function QuestionList() {
  const [selectedCategory, setSelectedCategory] = useState("Assessment");
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const [selectedCategoryCount, setSelectedCategoryCount] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const { token } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const openModal = (imageURL) => {
    setSelectedImage(imageURL);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedImage("");
    setModalIsOpen(false);
  };

  useEffect(() => {
    fetchTopicsForCategory(selectedCategory); // Fetch topics when the component mounts or when selectedCategory changes
  }, [selectedCategory, selectedTopic]);

  const fetchTopicsForCategory = async (category) => {
    try {
      const response = await axios.get(
        `http://localhost:6001/topics/${category}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTopics(response.data.topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const endpoint = `http://localhost:6001/questions/all/${selectedTopic}`; // Use selectedTopic instead of selectedCategory
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuestions(response.data);
      setSelectedCategoryCount(response.data.length);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    if (selectedCategory && selectedTopic) {
      // Check if both category and topic are selected
      fetchQuestions();
    }
  }, [selectedCategory, selectedTopic]);

  const handleDeleteQuestion = async (id) => {
    console.log("Question ID to delete:", id);
    const result = await Swal.fire({
      title: "Confirm Deletion",
      text: "Are you sure you want to delete this question?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      confirmButtonColor: "#00B4D2",
      cancelButtonColor: "red",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:6001/question/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  const handleEditQuestion = (id) => {
    const selectedQuestion = questions.find((question) => question._id === id);
    if (selectedQuestion) {
      navigate("/question/edit/" + id, { state: { ...selectedQuestion } });
    }
  };

  return (
    <div className="question-list">
      <div className="question-list__category">
        <select
          id="category"
          className="reg-inputs"
          value={selectedTopic} // Use selectedTopic for the value
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">Select Topic</option>
          {topics.map((topic) => (
            <option key={topic._id} value={topic.topic}>
              {" "}
              {/* Use topic.topic as value */}
              {topic.topic}
            </option>
          ))}
        </select>
      </div>
      <div style={{ float: "right", margin: "5px" }}>
        {selectedCategoryCount > 0 && (
          <p style={{ fontWeight: "bold", fontSize: "18px", color: "#00B4D2" }}>
            Total questions: {selectedCategoryCount}
          </p>
        )}
      </div>
      <ol className="question-list__items">
        {questions.map((question) => (
          <li key={question._id} className="question-list__item">
            {question.image && (
              <img
                src={`http://localhost:6001/uploads/${question.image}`}
                alt="question"
                style={{
                  maxWidth: "50px",
                  maxHeight: "50px",
                  cursor: "pointer",
                  float: "right",
                }}
                onMouseEnter={() =>
                  openModal(`http://localhost:6001/uploads/${question.image}`)
                }
                // onMouseLeave={closeModal}
                // onClick={() => openModal(`http://localhost:6001/uploads/${question.image}`)}
              />
            )}
            <h3 className="question-list__question">{question.question}</h3>
            <p className="question-list__options">
              Options: {question.options.join(", ")}
            </p>
            <p className="question-list__correct-answer">
              Correct Answer: {question.options[question.correctAnswer]}
            </p>
            <p className="question-list__submitted-date">
              Submitted Date: {new Date(question.createdAt).toLocaleString()}
            </p>

            <div style={{ margin: "5px" }}>
              <button
                onClick={() => handleEditQuestion(question._id)}
                className="action-button"
              >
                <CiPen color="#fff" />
              </button>

              <button
                onClick={() => handleDeleteQuestion(question._id)}
                className="action-button"
              >
                <AiOutlineDelete color="#fff" />
              </button>
            </div>
          </li>
        ))}
      </ol>

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
  );
}

export default QuestionList;
