import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const Dropdown = ({ apiUrl, onSelect, label }) => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);

  const { token } = useAuth();
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(apiUrl, {
          headers: headers,
        });
        setOptions(response.data.topics);
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptions([]);
      }
    };

    fetchOptions();
  }, [apiUrl]);

  const handleOptionChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);

    const selectedTopicObject = options.find(
      (option) => option._id === selectedValue
    );

    if (selectedTopicObject) {
      onSelect(selectedTopicObject.topic, selectedTopicObject.subtopics);
      setSelectedTopic(selectedTopicObject);
    }
  };

  return (
    <div className="reg-input">
      <label>
        {label}
        <span className="require">*</span>
      </label>
      <select
        value={selectedOption}
        className="reg-input"
        onChange={handleOptionChange}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option._id} value={option._id}>
            {option.topic}
          </option>
        ))}
      </select>
      {selectedTopic &&
        selectedTopic.subTopics &&
        selectedTopic.subTopics.length > 0 && (
          <div>
            <label>Select Subtopic:</label>
            <select onChange={(e) => onSelect(e.target.value)}>
              <option value="">Select</option>
              {selectedTopic.subTopics.map((subTopic) => (
                <option key={subTopic._id} value={subTopic._id}>
                  {subTopic.topic}
                </option>
              ))}
            </select>
          </div>
        )}
    </div>
  );
};

export default Dropdown;
