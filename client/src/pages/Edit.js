import React, { useState, useEffect } from "react";
import axios from "axios";
import { emailData } from "../Assets/EmailData";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { managerData } from "../Assets/ManagerData";
import useAuth from "../hooks/useAuth";

function Edit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    category: "",
    fullName: "",
    mgrName: "",
    email: "",
    mgrEmail: "",
    topic: "",
    department: "",
  });

  const [employee, setEmployee] = useState({});
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [managerSuggestions, setManagerSuggestions] = useState([]);
  const [presenter, setPresenter] = useState("");
  const [topics, setTopics] = useState([]);

  const { token } = useAuth();

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

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`http://localhost:6001/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setEmployee(data.data);
          setFormData(data.data);
          fetchTopics(data.data.category); // Fetch topics based on the employee's category
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      }
    };
    fetchEmployee();
  }, [id]);

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
      setTopics(topics.map((topic) => topic.topic)); // Assuming topics have a 'topic' field
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleRedirect = () => {
    if (employee.category === "Assessment") {
      navigate("/admin");
    } else if (employee.category === "Induction") {
      navigate("/induction");
    }
  };

  const validateForm = () => {
    let isValid = true;
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      const filteredEmails = emailData
        .map((item) => item.email)
        .filter((email) => email.toLowerCase().startsWith(value.toLowerCase()));
      setEmailSuggestions(filteredEmails);
    }

    if (name === "mgrName") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
        mgrEmail:
          managerData.find((item) => item.mgrName === value)?.mgrEmail || "",
      }));

      const filteredManagerNames = managerData
        .map((item) => item.mgrName)
        .filter((name) => name.toLowerCase().startsWith(value.toLowerCase()));

      setManagerSuggestions(filteredManagerNames);
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
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

    const { topic, category, topics } = formData;
    const isValid = validateForm();
    const createdAt = new Date();
    const password = Math.random().toString(36).slice(-8);

    if (isValid) {
      let formDataToUpdate = {
        ...formData,
        createdAt: createdAt,
        category: category,
        password: password,
        confirmPassword: password,
      };

      if (topic) {
        const lastIndex = topics ? topics.length : 0;
        const newTopic = {
          topic: topic,
          score: -1,
          presenter: presenter,
        };

        if (topics && topics.some((item) => item.topic === topic)) {
          Swal.fire({
            icon: "error",
            title: "Oops",
            text: "The selected topic already exists",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
          return;
        }

        if (!topics || lastIndex === topics.length) {
          formDataToUpdate.topics = [...topics, newTopic];
        } else {
          formDataToUpdate.topics[lastIndex] = newTopic;
        }
      }

      try {
        const result = await axios.put(
          `http://localhost:6001/employee/${id}`,
          formDataToUpdate,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (formData.category === "Assessment") {
          navigate("/admin");
        } else if (formData.category === "Induction") {
          navigate("/induction");
        } else if (formData.category === "Training") {
          navigate("/training");
        }
        console.log(result.data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="reg-container">
      <h1
        style={{
          fontSize: "25px",
          paddingBottom: "20px",
          fontWeight: "bold",
          textDecoration: "underline",
          textDecorationColor: "#00B4D2",
        }}
      >
        Update an Employee
      </h1>

      <form onSubmit={handleSubmit}>
        <label>Full Name:</label>
        <input
          type="text"
          className="reg-input"
          name="fullName"
          minLength={3}
          maxLength={20}
          value={formData.fullName}
          required
          onChange={handleChange}
          placeholder="Enter Full name"
        />
        <br />
        <label>Email:</label>
        <input
          className="reg-input"
          type="text"
          name="email"
          value={formData.email}
          maxLength={50}
          required
          onChange={handleChange}
          placeholder="Enter valid Mail Id"
          list="emailSuggestions"
        />
        <datalist id="emailSuggestions">
          {emailSuggestions.map((email, index) => (
            <option key={index} value={email} />
          ))}
        </datalist>
        <br />
        <label>Category:</label>
        <select
          name="category"
          className="reg-input"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          <option value="Induction">Induction</option>
          <option value="Assessment">Assessment</option>
          <option value="Training">Training</option>
        </select>
        <br />
        <label>Topic:</label>
        <select
          name="topic"
          className="reg-input"
          value={formData.topic}
          onChange={handleChange}
        >
          <option value="">Select Topic</option>
          {topics.map((topic, index) => (
            <option key={index} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <br />
        <label>Presenter:</label>
        <input
          type="text"
          className="reg-input"
          name="presenter"
          value={presenter}
          onChange={(e) => setPresenter(e.target.value)}
          onBlur={() => {
            if (!presentersArray.includes(presenter)) {
              setPresenter("");
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
          placeholder="Start typing to get the options"
          list="presentersList"
        />
        <datalist id="presentersList">
          {presentersArray.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </datalist>
        <br />
        <label>Manager Name:</label>
        <input
          className="reg-input"
          type="text"
          name="mgrName"
          value={formData.mgrName}
          minLength={3}
          maxLength={20}
          required
          onChange={handleChange}
          placeholder="Enter valid Manager Name"
          list="managerSuggestions"
        />
        <datalist id="managerSuggestions">
          {managerSuggestions.map((mgrName, index) => (
            <option key={index} value={mgrName} />
          ))}
        </datalist>
        <br />
        <label>Manager Email:</label>
        <input
          className="reg-input"
          type="text"
          name="mgrEmail"
          value={formData.mgrEmail}
          required
          placeholder="Manager email will auto populate"
        />
        <br />
        <label>Department:</label>
        <input
          className="reg-input"
          type="text"
          name="department"
          value={formData.department}
          minLength={3}
          maxLength={20}
          required
          onChange={handleChange}
          placeholder="Enter department"
        />
        <br />
        <center>
          <button
            type="submit"
            className="submit-button"
            style={{ width: "fit-content" }}
          >
            Update
          </button>
        </center>
        <br />
        <br />
      </form>
    </div>
  );
}

export default Edit;
