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
	const [employeeData, setEmployeeData] = useState(null);
	const [testCount, setTestCount] = useState(0);
	const [currentTopicIndex, setCurrentTopicIndex] = useState();
	const [currentTopic, setCurrentTopic] = useState(auth.topics[currentTopicIndex]?.topic);
	const navigate = useNavigate();
	const [questions, setQuestions] = useState([]);
	const [wrongAnswers, setWrongAnswers] = useState([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState([{}]);
	const [score, setScore] = useState(null);
	const passingScore = 0.8 * questions.length;
	const pendingTopics = auth.topics.filter((topic) => topic.score === -1);
	const [submitDisabled, setSubmitDisabled] = useState(false);
	//const currentTopic = auth.topics[currentTopicIndex]?.topic;
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
	}, [questions]);

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

	const getEndpointForTopic = () => {
		const userTopic = auth.topics[currentTopicIndex]?.topic;
		if (userTopic) {
			return `http://localhost:6001/questions/${userTopic}?deleted=false`;
		} else {
			throw new Error("No topic found for the user.");
		}
	};

	useEffect(() => {
		console.log('employeeData', employeeData);
	}, [employeeData])

	//useEffect(() => {
	//console.log('Questions state changed');
	//console.log('questions', questions);
	//console.log('questions.length', questions.length);
	//console.log('currentTopicIndex', currentTopicIndex);
	//console.log('score', score);

	//console.log('currentQuestionsIndex', currentQuestionIndex);
	//console.log(auth);
	//}, [questions, currentTopicIndex, score]);

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
						headers: headers
					}
				);
				setTestCount(testCountResponse.data.testCount);
				setQuestions(response.data);
				//setCurrentQuestionIndex(0);
			}
		} catch (error) {
			console.error("Failed to fetch questions:", error);
		}
	};
	
	const getEmployeeData = async () => {
		try {
			console.log("Hi 2");
			const response = await axios.get(
				`http://localhost:6001/employee/${auth._id}`,
				{ headers }
			);
			console.log("Hi 3");

			setEmployeeData(response.data.data);
		} catch (error) {
			console.error("Failed to fetch employee data:", error);
		}
	};
	
	useEffect(() => {
		if (auth.role === "Employee") {
			//console.log("Hi 1");
			getEmployeeData();
		}
	}, [auth.role, auth._id]);


	useEffect(() => {
		if (auth.role === "Employee") {
			//console.log('Hi 1');

			//let employeeData;

			//const getEmployeeData = async () => {
			//	try {
			//		console.log('Hi 2');
			//		const employeeDetails = await axios.get(`http://localhost:6001/employee/${auth._id}`,
			//			{
			//				headers: headers
			//			}
			//		);
			//		console.log('Hi 3');
			//		//console.log('employeeDetails.data', employeeDetails.data);
			//		setEmployeeData(employeeDetails.data.data);
			//		//return employeeData;
			//	} catch (error) {
			//		console.error("Failed to fetch employee data:", error);
			//		throw error; // Rethrow to allow outer logic to handle it
			//	}
			//};

			//getEmployeeData();

			//const employeeData = getEmployeeData().then(data => data).catch(err => err);

			//let employeeData;

			//getEmployeeData()
			//.then((data) => {
			//	employeeData = data;
			//	console.log('employeeData', employeeData);
			//})
			//.catch((err) => {
			//  console.error("Error in employeeData fetch:", err);
			//});

			console.log('employeeData b4 firstNotAttemptedTopicIndex ', employeeData);

			if (employeeData && employeeData.topics) {
				console.log('employeeData b4 firstNotAttemptedTopicIndex 2 ', employeeData);
				const firstNotAttemptedTopicIndex = employeeData.topics.findIndex(
					(topic) => topic.score === -1
				);

				if (firstNotAttemptedTopicIndex !== -1) {
					setCurrentTopicIndex(firstNotAttemptedTopicIndex);
					console.log('firstNotAttemptedTopicIndex', firstNotAttemptedTopicIndex);
				} else {
					setCurrentTopicIndex(auth.topics.length - 1);
					console.log('auth.topics.length - 1', auth.topics.length - 1);
				}
			}
			try {
				fetchQuestions();
			} catch (error) {
				console.error("Failed to fetch questions:", error);
			}
		}
	}, [auth.role, auth.topics, currentTopicIndex, employeeData]);


	const renderResult = () => {
		//setCurrentQuestionIndex(0);
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
				const userAnswer = userAnswers[i].selectedAnswerIndex;

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

				await axios.put(
					endpoint,
					{
						score: totalScore,
						testCount: testCount,
						assessmentStatus: "Attempted",
						wrongAnswers: wrongAnswers,
						wrongAnswersCount: questions.length - totalScore,
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				await getEmployeeData();
			}

			setScore(totalScore);
			console.log('totalScore', totalScore);

			//setCurrentTopicIndex((prevIndex) => prevIndex+1);
			setCurrentTopicIndex((prevIndex) => {
				const nextIndex = prevIndex + 1;
				console.log('nextIndex', nextIndex);

				if (nextIndex < auth.topics.length) {
					console.log('inside incrementing currentTopicIndex If condition ');

					// Reset question index if there's a next topic
					setCurrentQuestionIndex(0);
					console.log('inside incrementing currentTopicIndex If condition b4 return statement ');
					return nextIndex; // Proceed to the next topic
				} else {
					console.log('inside else condition ');
					setCurrentQuestionIndex(questions.length);
					console.log("All topics completed.");
					return prevIndex; // If at the end of topics, stay at the last topic
				}
			});
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

	const handleAnswerChange = (event, index, option) => {
		const { name } = event.target;

		// Find the selected option text based on the index
		// const selectedOptionIndex = value === "null" ? null : parseInt(value);
		// const selectedOptionValue = selectedOptionIndex !== null ? dataset.optionText : null;

		setUserAnswers((prevAnswers) => ({
			...prevAnswers,
			[name]: {
				selectedAnswerIndex: index, // Store the selected option index
				selectedAnswerValue: option, // Store the selected option text
			},
		}));
	};

	const calculateScore = () => {
		let score = 0;
		for (let i = 0; i < questions.length; i++) {
			const correctAnswerIndex = questions[i].correctAnswer;
			const correctAnswerValue = questions[i].options[correctAnswerIndex];
			// const userAnswer = userAnswers[i];

			const userAnswerIndex = userAnswers[i].selectedAnswerIndex;
			const userAnswerValue = userAnswers[i].selectedAnswerValue;

			if (
				userAnswerIndex !== undefined &&
				correctAnswerIndex === parseInt(userAnswerIndex)
			) {
				score++;
			}

			if (parseInt(userAnswerIndex) !== correctAnswerIndex) {
				const wrongAnswerObject = {
					question: questions[i].question,
					questionOptions: questions[i].options,
					correctAnswerIndex: correctAnswerIndex,
					correctAnswerValue: correctAnswerValue,
					selectedAnswerIndex: userAnswerIndex,
					selectedAnswerValue: userAnswerValue
				}

				setWrongAnswers((prevData) => {
					prevData.push(wrongAnswerObject)
					return prevData;
				});
				// setWrongAnswers((prevData) => [...prevData, wrongAnswerObject]);
			}
		}
		setScore(score);
		//setCurrentQuestionIndex(questions.length);
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
											checked={userAnswers[currentQuestionIndex]?.selectedAnswerIndex === index} // Compare with index
											// onChange={handleAnswerChange}
											onChange={(e) => handleAnswerChange(e, index, option)}
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
