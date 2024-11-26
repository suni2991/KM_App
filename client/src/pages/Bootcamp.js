import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { CiRead, CiPen } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import useAuth from "../hooks/useAuth";
import * as XLSX from "xlsx";
import CustomStyles from "../components/CustomStyles";

function Bootcamps() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { auth } = useAuth();
  const { token } = useAuth();
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();

  const fetchNominations = async () => {
    try {
      const response = await fetch(
        `http://localhost:6001/bootcamps/${auth.email}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const bootcampsData = await response.json();
        setData(bootcampsData);
      } else {
        console.error("Error fetching bootcamps:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching bootcamps:", error);
    }
  };

  useEffect(() => {
    fetchNominations();
  }, []);

  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  const handleRegister = () => {
    navigate("/addBootcamp");
  };

  const viewEmployee = (email) => {
    navigate("/viewBootcamp/" + email);
  };

  const editEmployee = (email) => {
    navigate("/editBootcamp/" + email);
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
            fetch(`http://localhost:6001/bootcamps/${row._id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          );
          await Promise.all(deleteRequests);

          // Update the user list in state after successful deletion
          setData(data.filter((user) => !selectedRows.includes(user)));

          Swal.fire({
            icon: "success",
            title: "Employees have been deleted successfully",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
        } catch (error) {
          console.error("Error deleting users:", error);
          Swal.fire({
            icon: "error",
            title: "Failed to delete the Employees",
            showConfirmButton: true,
            confirmButtonColor: "#00B4D2",
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          icon: "info",
          title: "Cancelled by Admin",
          showConfirmButton: true,
          confirmButtonColor: "#00B4D2",
        });
      }
    });
  };

  const handleDownload = () => {
    const header = columns
      .filter((column) => column.name !== "Actions")
      .map((column) => column.name);

    const rows = data.map((row) =>
      columns
        .filter((column) => column.name !== "Actions")
        .map((column) => {
          if (column.selector) {
            const cellData =
              typeof column.selector === "function"
                ? column.selector(row)
                : row[column.selector];

            if (column.name === "Training Date" && cellData instanceof Date) {
              return cellData.toLocaleDateString();
            }

            return cellData;
          }
          return "";
        })
    );

    const sheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Bootcamps");

    XLSX.writeFile(workbook, "bootcamps.xlsx");
  };

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

  const sendEmail = async (rowData) => {
    const { fullName, email, subTrainings, trainingName } = rowData;

    // Prepare sub-trainings list for email
    const subTrainingsList = subTrainings.map((subTraining, index) => ({
      name: `Sub-Training ${index + 1}`,
      topic: subTraining,
    }));

    // Prepare email payload
    const emailPayload = {
      email,
      fullName,
      trainingName,
      subTrainings: subTrainingsList,
    };

    try {
      const res = await fetch("http://localhost:6001/user/bootcamp/exam", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      if (!res.ok) {
        throw new Error(`Failed to send email. Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Email sent response:", data); // Log the response data

      const updateRes = await fetch(`http://localhost:6001/employee/${email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Email sent successfully",
        }),
      });

      if (!updateRes.ok) {
        throw new Error(
          `Failed to update status after sending email. Status: ${updateRes.status}`
        );
      }

      const updateData = await updateRes.json();
      console.log("Update response:", updateData);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error; // Rethrow the error to handle it in the calling code
    }
  };

  const handleSendEmail = async () => {
    const loadingSwal = Swal.fire({
      icon: "info",
      title: "Sending Emails...",
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
      for (const row of selectedRows) {
        await sendEmail(row);
      }

      loadingSwal.close();

      Swal.fire({
        icon: "success",
        title: "Credentials Sent successfully",
        showConfirmButton: false,
        confirmButtonColor: "#00B4D2",
        timer: 3000,
      });
    } catch (error) {
      loadingSwal.close();

      Swal.fire({
        icon: "error",
        title: "Failed to send email",
        showConfirmButton: true,
        confirmButtonColor: "#00B4D2",
      });
    }
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => {
        if (row.trainings && row.trainings.length > 0) {
          const latestTraining = row.trainings[row.trainings.length - 1];
          if (latestTraining.date) {
            const date = new Date(latestTraining.date);
            const dateString = date.toLocaleDateString();
            return <span>{dateString}</span>;
          }
        }
        return "-";
      },
      sortable: true,
      width: "125px",
    },

    {
      name: "Name",
      selector: (row) => row.fullName,
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
      name: "Time Slot",
      selector: (row) => {
        if (row.trainings && row.trainings.length > 0) {
          const timeSlot = row.trainings[row.trainings.length - 1].timeSlot;
          if (timeSlot) {
            const [fromTime, toTime] = timeSlot.split(" - ");

            // Check if the timeSlot is in valid HH:mm format
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
              // If timeSlot is not in HH:mm format, return it as it is
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
      <h1 style={{ color: "rgb(0, 180, 210)", fontWeight: "bold" }}>
        {" "}
        Welcome to the Training Bootcamps Dashboard{" "}
      </h1>

      <div className="search-filter2">
        <button
          className="send-button"
          title="Add Nomination"
          style={{ color: "#fff", width: "10%" }}
          onClick={handleRegister}
        >
          +Add New
        </button>
        <input
          placeholder="Search Employee by Name  / Email here"
          type="text"
          value={searchQuery}
          className="search-field"
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button
          onClick={handleDownload}
          className="submit-button"
          style={{
            width: "20%",
            fontWeight: "bold",
            padding: "5px 40px 5px ",
            margin: "25px",
          }}
        >
          Download Data
        </button>
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
      <center>
        <i>
          <p style={{ color: "#fff", fontWeight: "bold" }}>
            {" "}
            *Select an Applicant to send their credentials through Email
            respectively
          </p>
        </i>
      </center>
    </div>
  );
}

export default Bootcamps;
