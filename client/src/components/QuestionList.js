import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from "react-router-dom";
import { CiPen, CiInboxIn } from "react-icons/ci";
import { FiDelete, FiDownload } from 'react-icons/fi';
import { AiOutlineDelete } from "react-icons/ai";
import Swal from "sweetalert2";
import useAuth from "../hooks/useAuth";

function QuestionList() {
  const [selectedCategory, setSelectedCategory] = useState("Assessment");
  const [questions, setQuestions] = useState([]);
  const [deletedQuestions, setDeletedQuestions] = useState([]);
  const navigate = useNavigate();
  const [selectedCategoryCount, setSelectedCategoryCount] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const { token } = useAuth();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

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
      const endpoint = `http://localhost:6001/questions/all/topic/${selectedTopic}?deleted=false`; // Use selectedTopic instead of selectedCategory
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

  const fetchDeletedQuestions = async () => {
    try {
      const endpoint = `http://localhost:6001/questions/all/topic/${selectedTopic}?deleted=true`;
      const response = await axios.get(endpoint);
      setDeletedQuestions(response.data);
      // setSelectedCategoryCount(response.data.length);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }

  useEffect(() => {
    if (selectedCategory && selectedTopic) {
      // Check if both category and topic are selected
      fetchQuestions();
    }
  }, [selectedCategory, selectedTopic]);

  const handleDeleteQuestion = async (id) => {
    console.log("Question ID to delete:", id);
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: 'Are you sure you want to delete this question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#00B4D2',
      cancelButtonColor: 'red',
    });

    if (result.isConfirmed) {
      try {
        // setDeletedQuestion()
        // await axios.delete(`http://localhost:6001/question/${id}`);
        // const response = await axios.put(`http://localhost:6001/question/${id}`, { deleted: true });

        setQuestions((prevQuestions) =>
          prevQuestions.filter((question) => question._id !== id)
        );

        // Fetch the current question data to preserve other fields
        const questionResponse = await axios.get(`http://localhost:6001/question/${id}`);
        const currentQuestion = questionResponse.data;
        // Update the `deleted` field and send the updated object
        const response = await axios.put(`http://localhost:6001/question/${id}`, { ...currentQuestion, deleted: true, });
        // setDeletedQuestion((prev) => [...prev, response.data]);
        // setReload((prev) => !prev);

        await fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  // const handleDeleteQuestion = async (id) => {
  //   console.log("Question ID to delete:", id);
  //   const result = await Swal.fire({
  //     title: "Confirm Deletion",
  //     text: "Are you sure you want to delete this question?",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "Yes, delete it",
  //     cancelButtonText: "No, cancel",
  //     confirmButtonColor: "#00B4D2",
  //     cancelButtonColor: "red",
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       await axios.delete(`http://localhost:6001/question/${id}`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       fetchQuestions();
  //     } catch (error) {
  //       console.error("Error deleting question:", error);
  //     }
  //   }
  // };

  const handleEditQuestion = (id) => {
    const selectedQuestion = questions.find((question) => question._id === id);
    if (selectedQuestion) {
      navigate("/question/edit/" + id, { state: { ...selectedQuestion } });
    }
  };

  const handleRestoreQuestion = async (id) => {
    // const selectedQuestion = questions.find((question) => question._id === id);
    // if (selectedQuestion) {
    //   navigate('/question/edit/' + id, { state: { ...selectedQuestion } });
    // }

    console.log("Question ID to restore", id);
    const result = await Swal.fire({
      title: 'Confirm Restoration',
      text: 'Are you sure you want to restore this question?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, restore it',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#00B4D2',
      cancelButtonColor: 'red',
    });

    if (result.isConfirmed) {
      try {
        //Updating the fontend-UI part and filtering the data after restoration.
        setDeletedQuestions((prevQuestions) =>
          prevQuestions.filter((question) => question._id !== id)
        );

        // Fetch the current question data to preserve other fields
        const questionResponse = await axios.get(`http://localhost:6001/question/${id}`);
        const currentQuestion = questionResponse.data;
        // Update the `deleted` field and send the updated object
        const response = await axios.put(`http://localhost:6001/question/${id}`, { ...currentQuestion, deleted: false, });

        await fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleConfirmDeleteQuestion = async (id) => {
    console.log("Question ID to delete:", id);
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: 'Are you sure you want to permanently delete this question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#00B4D2',
      cancelButtonColor: 'red',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:6001/question/${id}`);
        fetchDeletedQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const showModal = async () => {
    await fetchDeletedQuestions();
    setIsModalVisible(true);
    console.log("Modal is visible.");
    console.log("Modal Visibility : "+isModalVisible);
  }

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Questions List', 14, 20);

    // Content: Add questions to the PDF
    const questionData = questions.map((q, index) => [
      index + 1,
      q.question,
      q.options.join(', '),
      q.options[q.correctAnswer],
    ]);

    doc.autoTable({
      head: [['S.No', 'Question', 'Options', 'Correct Answer']],
      body: questionData,
      startY: 30, // Start position of the table
    });

    // Save the PDF
    doc.save(`Questions_${selectedCategory}.pdf`);
  }

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
        {selectedTopic &&
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <button onClick={showModal} className='deleted-questions-buton' style={{ marginRight: '10px', }} > Deleted Questions</button>
            <button title="Download Questions" onClick={downloadPDF} className='download-button' style={{ marginTop: '15px', marginRight: '7px', }}> <FiDownload /> </button>
          </div>
        }
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
      {isModalVisible && (
        <div className="deleted-questions-modal">
          <div className="modal-wrapper"></div>
          <div className="modal-deleted-questions-content">
            <h2 className="question-list__title">Deleted Questions</h2>
            {deletedQuestions && deletedQuestions.length > 0 ? (
              <ul>
                {deletedQuestions.map((question) => (
                  <li key={question._id}>
                    <h3 className="question-list__question">{question.question}</h3>
                    <p>Options: {question.options.join(', ')}</p>
                    <p>Correct Answer: {question.options[question.correctAnswer]}</p>
                    <p>Submitted Date: {new Date(question.createdAt).toLocaleString()}</p>

                    <div style={{ margin: '5px' }}>
                      <button
                        title="Restore Question"
                        onClick={() => handleRestoreQuestion(question._id)}
                        className='action-button'>
                        <CiInboxIn color='#fff' />
                      </button>

                      <button
                        title="Delete Question"
                        onClick={() => handleConfirmDeleteQuestion(question._id)}
                        className='action-button'>
                        <AiOutlineDelete color='#fff' /></button>
                    </div>

                  </li>
                ))
                }
              </ul>) : (<p>No data to display</p>)}
            <button onClick={() => setIsModalVisible(false)} className='modal-close-button'>Close</button>
          </div>
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
  );
}

export default QuestionList;
