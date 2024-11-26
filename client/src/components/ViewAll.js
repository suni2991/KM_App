import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select, Table, Button, Space } from "antd";
import useAuth from "../hooks/useAuth";
import { CiPen } from "react-icons/ci";
import { useNavigate} from "react-router-dom";
import { AiOutlineDelete } from "react-icons/ai";
import Swal from "sweetalert2";

const { Option } = Select;

const ViewAll = () => {
  const [selectedCategory, setSelectedCategory] = useState("Assessment");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  useEffect(() => {
    if (selectedCategory) {
      fetchTopics(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchTopics = async (selectedCategory) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:6001/topics/${selectedCategory}`,
        {
          headers: headers,
        }
      );
      const { topics } = response.data;
      setTopics(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    const selectedTopic = topics.find((topic) => topic._id === id);
    console.log("selectedTopic ", selectedTopic);
    if (selectedTopic) {
      navigate("/topic/edit/" + id, { state: { ...selectedTopic } });
    }
  };

  const handleDelete = async (e, topicId, category) => {
    e.preventDefault();
    Swal.fire({
      title: "Delete Topic",
      text: "Are you sure you want to delete this topic?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00B4D2",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `http://localhost:6001/topics/${category}/${topicId}`,
            {
              headers: headers,
            }
          );
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Topic has been deleted successfully",
              showConfirmButton: true,
              confirmButtonColor: "#00B4D2",
            }).then(() => {
              // navigate("/questionaire");
              fetchTopics(selectedCategory);
            });
          }
        } catch (error) {
          console.log("error ", error);
        }
      }
    });
  };
  const categoryOptions = [
    { value: "Assessment", label: "Assessment" },
    { value: "Induction", label: "Induction" },
    { value: "Bootcamp", label: "Bootcamp" },
    { value: "Training", label: "Training" },
  ];

  const columns = [
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      sorter: (a, b) => a.topic.localeCompare(b.topic),
    },
    {
      title: "Subtopics",
      dataIndex: "subtopics",
      key: "subtopics",
      render: (subtopics) => (subtopics ? subtopics.join(", ") : "-"),
      sorter: (a, b) =>
        (a.subtopics || [])
          .join(", ")
          .localeCompare((b.subtopics || []).join(", ")),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "100px",
      render: (text, topics) => (
        <Space size="middle">
          <Button
            className="action-button"
            icon={<CiPen color="#fff" />}
            onClick={(e) => handleEdit(e, topics._id)}
          ></Button>
          <Button
            className="action-button"
            icon={<AiOutlineDelete color="#fff" />}
            onClick={(e) => handleDelete(e, topics._id, topics.category)}
          ></Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div>
        <label htmlFor="categorySelect">Select Category:</label>
        <Select
          id="categorySelect"
          options={categoryOptions}
          onChange={handleCategoryChange}
          value={selectedCategory}
          style={{ width: "200px" }}
        >
          {categoryOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={topics}
        loading={loading}
        pagination={{ pageSize: 10 }}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default ViewAll;
