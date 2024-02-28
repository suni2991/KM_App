const employeeRouter = require("express").Router();
const CryptoJS = require("crypto-js");

const Employee = require("../model/EmployeeModel");
const emailRouter = require("./EmailRouter");

//Create User - or register, a simple post request to save user in db
employeeRouter.post("/register/employee", (req, res) => {
  const newUser = new Employee({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    fullName: req.body.fullName,
    category: req.body.category,
    email: req.body.email,
    mgrEmail: req.body.mgrEmail,
    mgrName: req.body.mgrName,
    
    testCount: req.body.testCount,
    status: req.body.status,
    topics:req.body.topics,
    createdAt: req.body.createdAt,
    username: req.body.username,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASSWORD_SECRET_KEY
    ).toString(),
    role: req.body.role,
    department: req.body.department,
    confirmPassword: req.body.confirmPassword
  });


  newUser.save()
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.status(409).json({ message: "Email already in use" });
      } else {
        res.status(400).json({ message: "Could not create user" });
      }
    });
})

// user login

employeeRouter.post("/api/login", (req, res) => {
  Employee.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Decrypt the stored password for comparison
      let decryptedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASSWORD_SECRET_KEY
      ).toString(CryptoJS.enc.Utf8);

      if (decryptedPassword !== req.body.password) {
        return res.status(401).json({ message: "Incorrect password" });
      }

     
      res.status(200).json(user);
    })
    .catch((err) => res.status(500).json({ message: "Could not login user" }));
});




employeeRouter.get('/employees', async (req, res) => {
  const mgrEmail = req.query.mgrEmail;

  try {
    
    const employees = await Employee.find({ mgrEmail: mgrEmail });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Error fetching employees' });
  }
});



employeeRouter.put('/employee/feedback/:id', (req, res) => {
  const employeeId = req.params.id;
  const formData = req.body;


  Employee.findById(employeeId, (err, employee) => {
    if (err) {
    
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!employee) {
      // Employee not found
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Find the topic index within the topics array based on the topic name
    const topicIndex = employee.topics.findIndex((topic) => topic.topic === formData.feedbackFor);

    if (topicIndex === -1) {
      // Topic not found
      return res.status(404).json({ error: 'Topic not found for the employee' });
    }

    // Update the feedback data for the specific topic
    employee.topics[topicIndex] = {
      ...employee.topics[topicIndex],
      ...formData
    };

    // Save the updated employee document
    employee.save((saveErr, updatedEmployee) => {
      if (saveErr) {
        // Handle the error
        return res.status(500).json({ error: 'Error updating employee data' });
      }

      // Return the updated employee data as the response
      res.json(updatedEmployee);
    });
  });
});

employeeRouter.get('/employees/:id/topics/:topicId', async (req, res) => {
  try {
    const employeeId = req.params.id;
    const topicId = req.params.topicId;

    // Find the employee by ID
    const employee = await Employee.findById(employeeId);

    // Find the topic with the specified ID in the employee's topics array
    const topic = employee.topics.find((topic) => topic._id.toString() === topicId);

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found for the employee.' });
    }

    // Return the testCount for the current topic
    res.json({ testCount: topic.testCount });
  } catch (error) {
    console.error('Error fetching testCount:', error);
    res.status(500).json({ message: 'Failed to fetch testCount.' });
  }
});

employeeRouter.get('/employees', async (req, res) => {
  const docs = await Employee.find({ role: "Employee" });
  res.json(docs)
})



employeeRouter.put("/employee/:id", (req, res) => {
  const { id } = req.params;
  const updatedData = req.body; 

  if (req.body.password) {
    updatedData.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASSWORD_SECRET_KEY
    ).toString();
  }

  Employee.findByIdAndUpdate(
    id,
    { $set: updatedData },
    { new: true }
  )
    .then((updatedEmployee) => {
      if (updatedEmployee) {
        res.json(updatedEmployee);
      } else {
        res.status(404).json({ message: "Employee not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Failed to update employee details" });
    });
});


employeeRouter.get('/employees/:email', async (req, res) => {
  const docs = await Employee.find({ email: req.params.email });
  res.json(docs)
})

employeeRouter.get('/employees/:id', async (req, res) => {
  const docs = await Employee.find({ id: req.params.id });
  res.json(docs)
})

employeeRouter.get('/employee/induction', async (req, res) => {
  const docs = await Employee.find({ category: "Induction" });
  res.json(docs)
})

employeeRouter.get('/employee/assessment', async (req, res) => {
  const docs = await Employee.find({ category : "Assessment" });
  res.json(docs)
})

employeeRouter.get('/employee/manager', async (req, res) => {
  const docs = await Employee.find({ role : "Manager" });
  res.json(docs)
})

employeeRouter.get('/employee/training', async (req, res) => {
  const docs = await Employee.find({ category : "Training" });
  res.json(docs)
})

employeeRouter.put('/employee/:id/resetScore', async (req, res) => {
  const { id } = req.params;
  const { topicId, newScore } = req.body;

  try {
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const topicToUpdate = employee.topics.find(
      (topic) => topic._id.toString() === topicId
    );

    if (!topicToUpdate) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    topicToUpdate.score = newScore;
    await employee.save();

    return res.status(200).json({ message: 'Score reset successfully' });
  } catch (error) {
    console.error('Error resetting score:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


employeeRouter.put("/employee/:id/topics", (req, res) => {
  const { id } = req.params;
  const updatedTopics = req.body.topics;

  Employee.findByIdAndUpdate(
    id,
    { topics: updatedTopics },
    { new: true }
  )
    .then((updatedEmployee) => {
      if (updatedEmployee) {
        res.json(updatedEmployee);
      } else {
        res.status(404).json({ message: "Employee not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Failed to update employee topics" });
    });
});



employeeRouter.get("/employee/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Employee.findById(_id);
    if (!result) {
      res.json({
        status: "FAILED",
        message: "records not found on this ID"
      })
    }
    else {
      res.json({
        status: "SUCCESS",
        message: "records found",
        data: result
      })
    }
  }
  catch (e) {
    res.send(e)
  }

})

//update records
employeeRouter.put('/employee/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Employee.findByIdAndUpdate(_id, req.body, { new: true });
    if (!result) {
      res.json({
        status: "FAILED",
        message: "record is not updated successfully"
      })
    }
    else {
      res.json({
        status: "SUCCESS",
        message: "records updated successfully",
        data: result
      })
    }
  }
  catch (e) {
    res.send(e)
  }
})



//Delete records
employeeRouter.delete("/employee/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Employee.findByIdAndDelete(_id);
    if (!result) {
      res.json({
        status: "FAILED",
        message: "records is Delete successfully"
      })
    }
    else {
      res.json({
        status: "SUCCESS",
        message: "records not Delete successfully",
        data: result
      })
    }
  }
  catch (e) {
    res.send(e)
  }
})

// PUT endpoint to update the score of a respective topic for an employee
employeeRouter.put('/employees/:employeeId/topics/:topicId', async (req, res) => {
  const { employeeId, topicId } = req.params;
  const { score } = req.body;

  try {
    // Find the employee by ID
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Find the topic in the employee's topics array by ID
    const topicToUpdate = employee.topics.id(topicId);

    if (!topicToUpdate) {
      return res.status(404).json({ error: 'Topic not found' });
    }


    if (score !== -1) {
      topicToUpdate.testCount += 1;
    }

    topicToUpdate.score = score;


    await employee.save();

    return res.json(employee);
  } catch (err) {
    console.error('Error updating score and testCount:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


employeeRouter.delete("/admin/users/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const result = await Employee.findByIdAndDelete(_id);
    if (!result) {
      res.json({
        status: "FAILED",
        message: "Failed to delete the record"
      });
    } else {
      res.json({
        status: "SUCCESS",
        message: "Record deleted successfully",
        data: result
      });
    }
  } catch (e) {
    res.status(500).json({
      status: "ERROR",
      message: "An error occurred during deletion",
      error: e.message
    });
  }
});

employeeRouter.delete('/employee/:employeeId/topic/:topicId', async (req, res) => {
  try {
    const { employeeId, topicId } = req.params;

    // Check if the employee exists
    const existingEmployee = await Employee.findById(employeeId);
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find the index of the topic to delete in the topics array
    const topicIndexToDelete = existingEmployee.topics.findIndex(
      (topic) => topic._id.toString() === topicId
    );
    if (topicIndexToDelete === -1) {
      return res.status(404).json({ message: 'Topic not found for this employee' });
    }

    // Remove the topic at the found index
    existingEmployee.topics.splice(topicIndexToDelete, 1);
    await existingEmployee.save();

    // Respond with success
    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ message: 'Error deleting topic' });
  }
});



module.exports = employeeRouter;
