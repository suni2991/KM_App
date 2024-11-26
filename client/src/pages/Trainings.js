import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import CustomStyles from "../components/CustomStyles";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { CiRead, CiPen } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import { message } from "antd";
import useAuth from "../hooks/useAuth";

const API = "http://localhost:6001/nominations";

function Training() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
  const { token } = useAuth();
  const fetchUsers = async (url) => {
    try {
      let res;
      if (searchQuery.trim() !== "") {
        res = await fetch(`${url}?search=${searchQuery}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      const data = await res.json();
      if (data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  const handleNominate = () => {
    navigate("/calendar");
  };

  useEffect(() => {
    const fetchData = async () => {
      const updatedUserList = await fetchUsers(API);
      setData(updatedUserList);
    };
    fetchData();
  }, [searchQuery]);

  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  //
  useEffect(() => {
    const reversedData = [...data].reverse();
    setFilteredData(
      reversedData.filter(
        (row) =>
          (row.fullName &&
            row.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (row.email &&
            row.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [data, searchQuery]);

  const viewEmployee = (email) => {
    navigate("/view/" + email);
  };

  const editEmployee = (email) => {
    navigate("/edit/" + email);
  };

  const handleDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00B4D2",
      cancelButtonColor: "#8C8C8C",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteRequests = selectedRows.map((row) =>
            fetch(`http://localhost:6001/nominations/${row._id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          );
          await Promise.all(deleteRequests);

          setData(data.filter((user) => !selectedRows.includes(user)));
          message.success("Employees have been deleted successfully");
        } catch (error) {
          message.error("Failed to delete Employee");
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        message.error("Cancelled by Admin");
      }
    });
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => {
        if (row.trainings && row.trainings.length > 0) {
          const lastTraining = row.trainings[row.trainings.length - 1];
          if (lastTraining.date) {
            const date = new Date(lastTraining.date);
            return date.toLocaleDateString();
          }
        }
        return "";
      },
      sortable: true,
      width: "125px",
    },

    {
      name: "Name",
      selector: (row) => row.fullName || "",
      sortable: true,
      sortFunction: (a, b) => a.fullName.localeCompare(b.fullName),
      cell: (row) => <span className="custom-cells">{row.fullName}</span>,
      width: "200px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      cell: (row) => <span className="custom-cell">{row.email}</span>,
      width: "300px",
    },
    {
      name: "Training",
      selector: (row) =>
        row.trainings.length > 0
          ? row.trainings[row.trainings.length - 1].trainingName
          : "",
      sortable: true,

      width: "200px",
    },
    {
      name: "Mode",
      selector: (row) =>
        row.trainings.length > 0
          ? row.trainings[row.trainings.length - 1].mode
          : "",
      sortable: true,

      width: "200px",
    },
    {
      name: "Time Slot",
      selector: (row) => {
        if (row.trainings && row.trainings.length > 0) {
          const timeSlot = row.trainings[row.trainings.length - 1].timeSlot;
          if (timeSlot) {
            const [fromTime, toTime] = timeSlot.split(" - ");
            const isValidFormat =
              /^\d{2}:\d{2}$/.test(fromTime) && /^\d{2}:\d{2}$/.test(toTime);

            if (isValidFormat) {
              const fromTimeParts = fromTime.split(":");
              const toTimeParts = toTime.split(":");

              const fromHour = parseInt(fromTimeParts[0]);
              const fromMinute = parseInt(fromTimeParts[1]);
              const toHour = parseInt(toTimeParts[0]);
              const toMinute = parseInt(toTimeParts[1]);

              const formattedFromTime = `${fromHour % 12 || 12}:${fromMinute
                .toString()
                .padStart(2, "0")} ${fromHour >= 12 ? "PM" : "AM"}`;
              const formattedToTime = `${toHour % 12 || 12}:${toMinute
                .toString()
                .padStart(2, "0")} ${toHour >= 12 ? "PM" : "AM"}`;

              return `${formattedFromTime} - ${formattedToTime}`;
            } else {
              return timeSlot;
            }
          }
        }
        return "";
      },
      sortable: true,
      width: "200px",
    },

    {
      name: "Training Status",
      selector: (row) =>
        row.trainings.length > 0
          ? row.trainings[row.trainings.length - 1].trainingStatus
          : "",
      sortable: true,

      width: "200px",
    },
    {
      name: "Nominated By",
      selector: (row) => row.mgrName,
      sortable: true,
      cell: (row) => (
        <span className="custom-cell">
          {row.mgrName !== "" ? row.mgrName : "Admin"}
        </span>
      ),
      width: "200px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <button
            title="View"
            onClick={() => viewEmployee(row.email)}
            className="action-button"
            style={{ margin: "5px" }}
          >
            <CiRead color="#fff" />
          </button>
          <button
            title="Edit"
            onClick={() => editEmployee(row.email)}
            className="action-button"
            style={{ margin: "5px" }}
          >
            <CiPen color="#fff" />
          </button>
          <button
            title="Delete"
            onClick={() => handleDelete(row)}
            className="action-button"
            style={{ margin: "5px", color: "red" }}
          >
            <AiOutlineDelete color="#fff" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "250px",
    },
  ];

  return (
    <div className="table-container">
      <h1 style={{ color: "#00B4D2", fontWeight: "bold" }}>
        {" "}
        Welcome to the Trainings Dashboard{" "}
      </h1>

      <div className="search-filter2">
        <input
          placeholder="Search Employee by Name  / Email here"
          type="text"
          value={searchQuery}
          className="search-field"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="send-button"
          title="Nominate an Employee"
          style={{ color: "#fff", width: "auto" }}
          onClick={handleNominate}
        >
          +Nominate For Training
        </button>
        {/* <button type="submit"><BsSearch/></button> */}
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        selectableRows
        onSelectedRowsChange={handleRowSelected}
        selectedRows={selectedRows}
        fixedheader
        pagination
        paginationPerPage={10}
        className="dataTable"
        customStyles={CustomStyles}
      />
      <br />
    </div>
  );
}

export default Training;
