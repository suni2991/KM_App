import React, { useState, useEffect } from "react";
import { emailData } from "../Assets/EmailData";
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";

import axios from "axios";
import useAuth from "../hooks/useAuth";

function Registration() {
	const [formData, setFormData] = useState({
		role: "",
		category: "",
		fullName: "",
		email: "",
		topic: "",
		mgrName: "",
		mgrEmail: "",
		department: "",
		topics: [],

		selectedTopic: [],
	});

	const { token } = useAuth();

	useEffect(() => {
		if (formData.category) {
			fetchTopics(formData.category);
		}
	}, [formData.category]);

	const fetchTopics = async (selectedCategory) => {
		try {
			const response = await axios.get(
				`http://localhost:6001/topics/${selectedCategory}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			const { topics } = response.data;
			setFormData((prevFormData) => ({
				...prevFormData,
				topics: topics.map((topic) => topic.topic), // Assuming topics have a 'topic' field
			}));
		} catch (error) {
			console.error("Error fetching topics:", error);
		}
	};

	const [presenter, setPresenter] = useState("");
	const presentersArray = [
		"Adam Pawaskar",
		"Arjun Mehra",
		"Anuja Gaikwad",
		"Ashish Kurvelli",
		"Bhavesh Bhatu",
		"Cajetan Franco",
		"Danish Kably",
		"Faizan Ansari",
		"Faizan Dalla",
		"Feroz Sumara",
		"Gokul Gajbhiye",
		"Harshad Halbe",
		"Hibah Kazi",
		"Jatin Salve",
		"Mahek Shaikh",
		"Manish Kareya",
		"Madan Takalikar",
		"Mohammed Shaikh",
		"Munazir Ansari",
		"Nimit Kumar Goyal",
		"Parthiv Bhaskar",
		"Reema Thakur",
		"Sadaf Khan",
		"Sahil Shah",
		"Saili Salve",
		"Salman Khan",
		"Saraswata Biswas",
		"Shahid Ansari",
		"Sunil Saundalkar",
		"Vaseem Ansari",
		"Vedha Hiremath",
		"Yusuf Khan",
	];

	const [departmentSuggestions, setDepartmentSuggestions] = useState([]);
	const [emailSuggestions, setEmailSuggestions] = useState([]);
	const [managerSuggestions, setManagerSuggestions] = useState([]);
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevFormData) => ({
			...prevFormData,
			[name]: value,
		}));

		if (name === "role") {
			setFormData((prevFormData) => ({
				...prevFormData,
				role: value,
			}));
		}

		if (name === "mgrName") {
			// Find the corresponding mgrEmail based on mgrName from emailData
			//   const selectedManager = emailData.find(
			//       (item) => item.mgrName.toLowerCase() === value.toLowerCase()
			//   );
			const selectedManager = emailData.find(
				(item) =>
					typeof item.mgrName === "string" &&
					item.mgrName.toLowerCase() === value.toLowerCase()
			);

			if (selectedManager) {
				// If a matching manager is found, update mgrEmail
				setFormData((prevFormData) => ({
					...prevFormData,
					mgrEmail: selectedManager.mgrEmail || "",
				}));
			} else {
				// If no matching manager is found, reset mgrEmail
				setFormData((prevFormData) => ({
					...prevFormData,
					mgrEmail: "",
				}));
			}
		}

		if (name === "department" && /\d/.test(value)) {
			// If numeric characters are found, display an error message
			Swal.fire({
				title: "Error!",
				text: "Department field cannot contain numeric characters",
				icon: "error",
				showConfirmButton: true,
				confirmButtonColor: "#00B4D2",
				confirmButtonText: "OK",
			});
			return;
		}
		if (name === "mgrName" && /\d/.test(value)) {
			// If numeric characters are found, display an error message
			Swal.fire({
				title: "Error!",
				text: "Manager Name field cannot contain numeric characters",
				icon: "error",
				showConfirmButton: true,
				confirmButtonColor: "#00B4D2",
				confirmButtonText: "OK",
			});
		}

		if (name === "category" && value !== "Assessment") {
			setFormData((prevFormData) => ({
				...prevFormData,
				topics: [], // Change 'topics' to 'topic'
			}));
		}

		if (name === "role") {
			setFormData((prevFormData) => ({
				...prevFormData,
				role: value,
			}));
		} else {
			setFormData((prevFormData) => ({
				...prevFormData,
				[name]: value,
			}));
		}
		if (name === "fullName") {
			// Update fullName based on suggestions
			const filteredFullNames = emailData
				.map((item) => item.fullName)
				.filter((fullName) =>
					fullName.toLowerCase().startsWith(value.toLowerCase())
				);

			setFullNameSuggestions(filteredFullNames);

			// Check if the entered value exactly matches one of the suggestions
			const selectedFullName = emailData.find(
				(item) => item.fullName.toLowerCase() === value.toLowerCase()
			);

			if (selectedFullName) {
				// Update other fields based on the selected fullName
				setFormData((prevFormData) => ({
					...prevFormData,
					email: selectedFullName.email || "",
					mgrName: selectedFullName.mgrName || "",
					mgrEmail: selectedFullName.mgrEmail || "",
					department: selectedFullName.department || "",
				}));
			} else {
				// If the user is still typing, reset other fields
				setFormData((prevFormData) => ({
					...prevFormData,
					email: "",
					mgrName: "",
					mgrEmail: "",
					department: "",
				}));
			}
		}
	};

	const [fullNameSuggestions, setFullNameSuggestions] = useState([]);

	const validateForm = () => {
		let isValid = true;

		if (!formData.fullName) {
			Swal.fire({
				title: "Error!",
				text: "Enter Full Name",
				icon: "error",
				showConfirmButton: true,
				confirmButtonColor: "#00B4D2",
				confirmButtonText: "OK",
			});
			isValid = false;
		} else if (!/^[A-Za-z\s]+$/.test(formData.fullName)) {
			Swal.fire({
				title: "Error!",
				text: "Fullname should be of Alphabets only)",
				icon: "error",
				showConfirmButton: true,
				confirmButtonColor: "#00B4D2",
				confirmButtonText: "OK",
			});
			isValid = false;
		}

		if (formData.role === "Employee") {
			if (!formData.category) {
				Swal.fire({
					title: "Error!",
					text: "Please select a category",
					icon: "error",
					showConfirmButton: true,
					confirmButtonColor: "#00B4D2",
					confirmButtonText: "OK",
				});
				isValid = false;
			}
			if (!formData.department) {
				Swal.fire({
					title: "Error!",
					text: "Please select a Department",
					icon: "error",
					showConfirmButton: true,
					confirmButtonColor: "#00B4D2",
					confirmButtonText: "OK",
				});
				isValid = false;
			}
			if (!formData.selectedTopic || formData.selectedTopic.length === 0) {
				Swal.fire({
					title: "Error!",
					text: "Please select a topic",
					icon: "error",
					showConfirmButton: true,
					confirmButtonColor: "#00B4D2",
					confirmButtonText: "OK",
				});
				return false;
			}
		}

		const emailRegex = /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
		if (!formData.email || !emailRegex.test(formData.email)) {
			Swal.fire({
				title: "Error!",
				text: "Enter Valid EnFuse Email",
				icon: "error",
				showConfirmButton: true,
				confirmButtonText: "OK",
				confirmButtonColor: "#00B4D2",
			});
			isValid = false;
		}
		return isValid;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.email.endsWith("@enfuse-solutions.com")) {
			Swal.fire({
				icon: "error",
				title: "Email should end with @enfuse-solutions.com",
				text: "Please use EnFuse email only",
				showConfirmButton: true,
				confirmButtonColor: "#00B4D2",
			});
			return;
		}

		const randomNumber = Math.floor(Math.random() * 10000);
		const password = Math.random().toString(36).slice(-8);
		const createdAt = new Date();

		const username = formData.fullName.replace(/\s+/g, "") + randomNumber;
		const { category, mgrEmail, mgrName, role } = formData;

		let formDataWithFullName = {
			...formData,
			username: username,
			password: password,
			confirmPassword: password,
			createdAt: createdAt,
			category: category,
			mgrName: mgrName,
			mgrEmail: mgrEmail,
			role: role,
			topics: formData.role === "Employee" ? formData.selectedTopic.map((topic) => ({ topic })) : undefined,
			date: new Date(),
			//dateAssigned: moment().format("DD-MM-YYYY"), // Current date in "24-03-2025" format
			//timeAssigned: moment().format("hh:mm A"), // Current time in "02:39 PM" format
			// topics: formData.selectedTopic.map((topic) => ({ topic })),
		};

		console.log("FormData with Topic:", formDataWithFullName);

		const isValid = validateForm();
		if (isValid) {
			try {
				const response = await axios.post(
					"http://localhost:6001/register/employee",
					formDataWithFullName,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.status === 200) {
					console.log(response);
					Swal.fire({
						icon: "success",
						title: "Registered successfully",
						showConfirmButton: false,
						timer: 3000,
						confirmButtonText: "OK",
					});
					navigate("/register");
					setFormData({
						fullName: "",
						email: "",
						role: "",
					});
				} else if (response.status === 409) {
					Swal.fire({
						icon: "error",
						title: "Email or Username already in use",
						showConfirmButton: false,
						timer: 3000,
					});
				} else {
					Swal.fire({
						icon: "error",
						title: "Registration Failed",
						showConfirmButton: false,
						timer: 3000,
					});
				}
			} catch (error) {
				console.error("Error registering employee:", error);
				Swal.fire({
					icon: "error",
					title: "Registration Failed",
					showConfirmButton: false,
					timer: 3000,
				});
			}
		}
	};

	useEffect(() => {
		console.log("Selected Topics:", formData.topics);
	}, [formData.topics]);

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
				{" "}
				Registration Form{" "}
			</h1>
			<form onSubmit={handleSubmit}>
				<label>
					Role:<span className="require">*</span>
				</label>
				<select
					name="role"
					className="reg-input"
					value={formData.role}
					onChange={handleChange}
				>
					<option value="">Select Role</option>
					<option value="Employee">Employee</option>
					<option value="Manager">Manager</option>
				</select>
				<br />
				<label>
					Full Name:<span className="require">*</span>
				</label>
				<input
					type="text"
					className="reg-input"
					name="fullName"
					minLength={3}
					maxLength={30}
					value={formData.fullName}
					required
					onChange={handleChange}
					placeholder="Enter full name"
					list="fullNameSuggestions"
				/>
				<datalist id="fullNameSuggestions">
					{fullNameSuggestions.map((fullName, index) => (
						<option key={index} value={fullName} />
					))}
				</datalist>
				<br />

				<label>
					Email:<span className="require">*</span>
				</label>
				<input
					className="reg-input"
					type="text"
					name="email"
					value={formData.email}
					maxLength={50}
					required
					onChange={handleChange}
					pattern="[a-zA-Z0-9._%+-]+@enfuse-solutions\.com"
					placeholder="@enfuse-solutions.com"
				/>
				<datalist id="emailSuggestions">
					{emailSuggestions.map((email, index) => (
						<option key={index} value={email} />
					))}
				</datalist>
				<br />
				<br />

				{formData.role === "Employee" && (
					<div>
						<label>
							Category:<span className="require">*</span>
						</label>
						<select
							name="category"
							className="reg-input"
							value={formData.category}
							onChange={handleChange}
						>
							<option value="">Select Category</option>
							<option value="Induction">Induction</option>
							<option value="Assessment">Assessment</option>
						</select>
						{formData.category && (
							<Select
								name="selectedTopic"
								className="reg-select"
								value={formData.selectedTopic.map((topic) => ({
									value: topic,
									label: topic,
								}))}
								onChange={(selectedOptions) => {
									const selectedTopics = selectedOptions.map((option) => option.value);

									setFormData((prevFormData) => ({
										...prevFormData,
										selectedTopic: selectedTopics,
									}));
								}}
								options={formData.topics.map((topic) => ({
									value: topic,
									label: topic,
								}))}
								isMulti
							/>
						)}

						<br />
						<label>Presenter:</label>

						<input
							type="text"
							className="reg-input"
							name="presenter"
							value={presenter}
							onChange={(e) => {
								const { value } = e.target;
								setPresenter(value);
							}}
							onBlur={() => {
								if (!presentersArray.includes(presenter)) {
									setPresenter(""); // Reset presenter if not in the list
									Swal.fire({
										title: "Error!",
										text: "Enter Valid Presenter Name",
										icon: "error",
										showConfirmButton: true,
										confirmButtonColor: "#00B4D2",
										confirmButtonText: "OK",
									});
								}
							}}
							placeholder="Start typing presenter's name..."
							list="presenterSuggestions"
						/>
						<datalist id="presenterSuggestions">
							{presentersArray.map((name, index) => (
								<option key={index} value={name} />
							))}
						</datalist>
						<br />
						<label>
							Department:<span className="require">*</span>
						</label>
						<input
							type="text"
							className="reg-input"
							name="department"
							value={formData.department}
							required
							onChange={handleChange}
							placeholder="Start typing department..."
							list="departmentSuggestions"
						/>
						<datalist id="departmentSuggestions">
							{departmentSuggestions.map((department, index) => (
								<option key={index} value={department} />
							))}
						</datalist>
						<br />
						<label>
							Manager Name:<span className="require">*</span>
						</label>
						<input
							type="text"
							className="reg-input"
							name="mgrName"
							minLength={3}
							maxLength={20}
							value={formData.mgrName}
							required
							onChange={handleChange}
							placeholder="Enter Manager Name"
							list="managerSuggestions"
						/>
						<datalist id="managerSuggestions">
							{managerSuggestions.map((name, index) => (
								<option key={index} value={name} />
							))}
						</datalist>
						<br />
						<label>
							Manager Email:<span className="require">*</span>
						</label>
						<input
							type="text"
							className="reg-input"
							name="mgrEmail"
							value={formData.mgrEmail}
							maxLength={50}
							required
							onChange={handleChange}
							placeholder="Manager Email will be autofilled"
						/>

						<br />
					</div>
				)}
				<button
					className="send-button"
					type="submit"
					style={{ marginLeft: "80px" }}
				>
					Submit
				</button>
			</form>
			<center>
				<i>
					<p style={{ color: "#00B4D2", fontWeight: "bold" }}>
						{" "}
						*Register an Employee / Manager by selecting their Role
					</p>
				</i>
			</center>
		</div>
	);
}

export default Registration;
