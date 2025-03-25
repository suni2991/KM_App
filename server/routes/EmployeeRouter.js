const employeeRouter = require("express").Router();
const CryptoJS = require("crypto-js");

const Employee = require("../model/EmployeeModel");
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/CheckAuthMiddleware");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

//Create User - or register, a simple post request to save user in db
employeeRouter.post("/register/employee", (req, res) => {
	
	let { topics, date } = req.body;

	topics = topics.map((topic) => ({
		...topic,
		history: [...(topic.history || []), { date }]
	}));

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
		topics: topics,
		createdAt: req.body.createdAt,
		username: req.body.username,
		password: CryptoJS.AES.encrypt(
			req.body.password,
			process.env.PASSWORD_SECRET_KEY
		).toString(),
		role: req.body.role,
		department: req.body.department,
		confirmPassword: req.body.confirmPassword,
	});

	newUser
		.save()
		.then((user) => {
			res.json(user); // Send user data if creation is successful
		})
		.catch((err) => {
			if (err.code === 11000) {
				// Duplicate key error (e.g., email already in use)
				res.status(409).json({ message: "Email already in use" });
			} else if (err.name === "ValidationError") {
				// Handle validation errors (e.g., required fields missing)
				res.status(400).json({ message: err.message });
			} else {
				// Other unexpected errors
				console.error("Error creating user:", err);
				res.status(500).json({ message: "Internal server error" });
			}
		});
});

// user login

employeeRouter.post("/api/login", (req, res) => {
	// console.log(req.body);
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

			const token = jwt.sign(
				{ userId: user.id, role: user.role },
				JWT_SECRET_KEY
			);

			const userData = {
				...user.toObject(),
				token: token,
			};

			res.status(200).json(userData);
		})
		.catch((err) => res.status(500).json({ message: "Could not login user" }));
});

employeeRouter.put(
	"/employee/:employeeId/topic/:topicId/updatePresenter",
	authenticate,
	async (req, res) => {
		const { employeeId, topicId } = req.params;
		const { newPresenter } = req.body;

		try {
			const employee = await Employee.findById(employeeId);

			if (!employee) {
				return res.status(404).json({ error: "Employee not found" });
			}

			// Find the topic in the employee's topics array
			const topicToUpdate = employee.topics.find(
				(topic) => topic._id.toString() === topicId
			);

			if (!topicToUpdate) {
				return res
					.status(404)
					.json({ error: "Topic not found for the employee" });
			}

			// Update the presenter name
			topicToUpdate.presenter = newPresenter;

			// Save the changes
			await employee.save();

			res.status(200).json({ message: "Presenter name updated successfully" });
		} catch (error) {
			console.error("Error updating presenter name:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	}
);

employeeRouter.put("/employees/update", authenticate, async (req, res) => {
	const { selectedRows, newTopic, newPresenter } = req.body;
	if (
		!selectedRows ||
		!Array.isArray(selectedRows) ||
		!newTopic ||
		!newPresenter
	) {
		return res.status(400).json({ error: "Invalid request data" });
	}

	try {
		// Iterate through selectedRows and update topics and presenters
		for (const row of selectedRows) {
			const employee = await Employee.findById(row._id);
			if (!employee) {
				console.log(`Employee with ID ${row._id} not found`);
				continue; // Skip to the next iteration
			}
			employee.topics.push({ topic: newTopic, presenter: newPresenter });
			await employee.save();
		}

		return res
			.status(200)
			.json({ message: "Topics and presenters updated successfully" });
	} catch (error) {
		console.error("Error updating topics and presenters:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
});

employeeRouter.get(
	"/employees/:id/topics/:topicId",
	authenticate,
	async (req, res) => {
		try {
			const employeeId = req.params.id;
			const topicId = req.params.topicId;

			// Find the employee by ID
			const employee = await Employee.findById(employeeId);

			// Find the topic with the specified ID in the employee's topics array
			const topic = employee.topics.find(
				(topic) => topic._id.toString() === topicId
			);

			if (!topic) {
				return res
					.status(404)
					.json({ message: "Topic not found for the employee." });
			}

			// Return the testCount for the current topic
			res.json({ topic: topic });
		} catch (error) {
			console.error("Error fetching testCount:", error);
			res.status(500).json({ message: "Failed to fetch testCount." });
		}
	}
);

employeeRouter.put("/employee/:id", authenticate, (req, res) => {
	const { id } = req.params;
	const updatedData = req.body;

	if (req.body.password) {
		updatedData.password = CryptoJS.AES.encrypt(
			req.body.password,
			process.env.PASSWORD_SECRET_KEY
		).toString();
	}

	Employee.findByIdAndUpdate(id, { $set: updatedData }, { new: true })
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

employeeRouter.get("/employee/induction", authenticate, async (req, res) => {
	const docs = await Employee.find({ category: "Induction" });
	res.json(docs);
});

employeeRouter.get("/employee/assessment", authenticate, async (req, res) => {
	const docs = await Employee.find({ category: "Assessment" });
	res.json(docs);
});

employeeRouter.get("/topics/all", async (req, res) => {
	try {
		const uniqueTopics = await Employee.aggregate([
			{ $unwind: "$topics" },
			{ $match: { "topics.topic": { $ne: null, $ne: "" } } },
			{ $group: { _id: "$topics.topic" } },
			{ $project: { topic: "$_id" } },
		]);

		res.json(uniqueTopics);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
});

employeeRouter.post("/employee/reports", authenticate, async (req, res) => {
	let query = {};
	let pipeline = [];
	try {
		pipeline = [
			{
				$match: { role: "Employee", category: "Assessment" },
			},
		];
		if (req.body.topic !== "Select Topic") {
			const { nameOrEmail, topic, startDate, endDate } = req.body;

			if (nameOrEmail) {
				const names = nameOrEmail.trim().split(" ");
				const firstName = names[0];
				const lastName = names[names.length - 1];
				query.$or = [
					{ firstName: { $regex: firstName, $options: "i" } },
					{ lastName: { $regex: lastName, $options: "i" } },
					{ email: { $regex: nameOrEmail, $options: "i" } },
				];
				pipeline.push({ $match: query });
			}

			if (topic) {
				pipeline.push({
					$match: {
						topics: { $elemMatch: { topic } },
					},
				});
			}
			if (startDate && endDate) {
				query.createdAt = {
					$gte: new Date(startDate + " 00:00:00"),
					$lte: new Date(endDate + " 23:59:59"),
				};
				pipeline.push({
					$match: query,
				});
			}
		}
		let employees = await Employee.aggregate(pipeline);

		res
			.status(200)
			.json({ message: "search results", data: employees, query: query });
	} catch (error) {
		res.status(500).json({ message: "Error", error: error.message });
	}
});

employeeRouter.get("/employee/manager", authenticate, async (req, res) => {
	const docs = await Employee.find({ role: "Manager" });
	res.json(docs);
});

// employeeRouter.get("/employee/training", async (req, res) => {
//   const docs = await Employee.find({ category: "Training" });
//   res.json(docs);
// });

employeeRouter.put(
	"/employee/:id/resetScore",
	authenticate,
	async (req, res) => {
		const { id } = req.params;
		const { topicId, newScore, assessmentStatus, oldScore, comment } = req.body;

		try {
			const employee = await Employee.findById(id);

			if (!employee) {
				return res.status(404).json({ message: "Employee not found" });
			}

			const topicToUpdate = employee.topics.find(
				(topic) => topic._id.toString() === topicId
			);

			if (!topicToUpdate) {
				return res.status(404).json({ message: "Topic not found" });
			}

			const history = {
				score: oldScore,
				comment: comment,
				date: new Date(),
			};
			if (!topicToUpdate.history) {
				topicToUpdate.history = [];
			}

			topicToUpdate.score = newScore;
			topicToUpdate.assessmentStatus = assessmentStatus;
			topicToUpdate.history.push(history);
			await employee.save();

			return res.status(200).json({ message: "Score reset successfully" });
		} catch (error) {
			console.error("Error resetting score:", error);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
);

employeeRouter.get(
	"/employee/:id/:topic/topicHistory",
	authenticate,
	async (req, res) => {
		try {
			const _id = req.params.id;
			const topicName = req.params.topic;
			let result, sortedData;
			const employee = await Employee.findOne(
				{ _id: _id, "topics.topic": topicName },
				{ "topics.$": 1 } // Projection to get only the specific topic
			);

			if (employee && employee.topics.length > 0) {
				const topic = employee.topics[0];
				result = topic.history;
				sortedData = result.sort((a, b) => new Date(b.date) - new Date(a.date));
				console.log(sortedData);
			}
			if (!sortedData) {
				res.json({
					status: "FAILED",
					message: "records not found on this ID",
				});
			} else {
				res.json({
					status: "SUCCESS",
					message: "records found",
					data: sortedData,
				});
			}
		} catch (error) {
			console.error("Error resetting score:", error);
			return res
				.status(500)
				.json({ message: "Internal server error", error: error });
		}
	}
);

employeeRouter.get("/employee/:id", authenticate, async (req, res) => {
	try {
		const _id = req.params.id;
		const result = await Employee.findById(_id);
		if (!result) {
			res.json({
				status: "FAILED",
				message: "records not found on this ID",
			});
		} else {
			res.json({
				status: "SUCCESS",
				message: "records found",
				data: result,
			});
		}
	} catch (e) {
		res.send(e);
	}
});

//update records
employeeRouter.put("/employee/:id", async (req, res) => {
	try {
		const _id = req.params.id;
		const result = await Employee.findByIdAndUpdate(_id, req.body, {
			new: true,
		});
		if (!result) {
			res.json({
				status: "FAILED",
				message: "record is not updated successfully",
			});
		} else {
			res.json({
				status: "SUCCESS",
				message: "records updated successfully",
				data: result,
			});
		}
	} catch (e) {
		res.send(e);
	}
});

employeeRouter.put(
	"/employees/:employeeId/topics/:topicId",
	authenticate,
	async (req, res) => {
		console.log("Hi");
		console.log("request body: ");
		console.log(req.body);

		const { employeeId, topicId } = req.params;
		const { score, assessmentStatus, wrongAnswersCount, wrongAnswers } = req.body;

		try {
			// Find the employee by ID
			const employee = await Employee.findById(employeeId);

			if (!employee) {
				return res.status(404).json({ error: "Employee not found" });
			}

			//wrongAnswers
			console.log("wrongAnswers");
			console.log(wrongAnswers);

			// Find the topic in the employee's topics array by ID
			const topicToUpdate = employee.topics.id(topicId);
			console.log("topicToUpdate:");
			console.log(topicToUpdate);


			if (!topicToUpdate) {
				return res.status(404).json({ error: "Topic not found" });
			}

			if (score !== -1) {
				topicToUpdate.testCount += 1;
			}

			topicToUpdate.score = score;
			topicToUpdate.wrongAnswersCount = wrongAnswersCount;
			topicToUpdate.assessmentStatus = assessmentStatus;
			// topicToUpdate.wrongAnswers = wrongAnswers;


			topicToUpdate.wrongAnswers = wrongAnswers.map((wrongAnswer) => ({
				question: wrongAnswer.question,
				options: wrongAnswer.options,
				correctAnswerIndex: wrongAnswer.correctAnswerIndex,
				correctAnswerValue: wrongAnswer.correctAnswerValue,
				selectedAnswerIndex: wrongAnswer.selectedAnswerIndex,
				selectedAnswerValue: wrongAnswer.selectedAnswerValue,
			}));


			await employee.save();

			return res.json(employee);
		} catch (err) {
			console.error("Error updating score and testCount:", err);
			return res.status(500).json({ error: "Internal server error" });
		}
	}
);

employeeRouter.delete("/admin/users/:id", authenticate, async (req, res) => {
	console.log('Hi delete');

	try {
		const _id = req.params.id;
		const result = await Employee.findByIdAndDelete(_id);
		if (!result) {
			res.json({
				status: "FAILED",
				message: "Failed to delete the record",
			});
		} else {
			res.json({
				status: "SUCCESS",
				message: "Record deleted successfully",
				data: result,
			});
		}
	} catch (e) {
		res.status(500).json({
			status: "ERROR",
			message: "An error occurred during deletion",
			error: e.message,
		});
	}
});

employeeRouter.delete(
	"/employee/:employeeId/topic/:topicId",
	authenticate,
	async (req, res) => {
		try {
			const { employeeId, topicId } = req.params;

			// Check if the employee exists
			const existingEmployee = await Employee.findById(employeeId);
			if (!existingEmployee) {
				return res.status(404).json({ message: "Employee not found" });
			}

			// Find the index of the topic to delete in the topics array
			const topicIndexToDelete = existingEmployee.topics.findIndex(
				(topic) => topic._id.toString() === topicId
			);
			if (topicIndexToDelete === -1) {
				return res
					.status(404)
					.json({ message: "Topic not found for this employee" });
			}

			// Remove the topic at the found index
			existingEmployee.topics.splice(topicIndexToDelete, 1);
			await existingEmployee.save();

			// Respond with success
			res.status(200).json({ message: "Topic deleted successfully" });
		} catch (error) {
			console.error("Error deleting topic:", error);
			res.status(500).json({ message: "Error deleting topic" });
		}
	}
);

module.exports = employeeRouter;
