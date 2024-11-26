const express = require("express");
const Settings = require("../model/SettingsModel");
const { authenticate } = require("../middleware/CheckAuthMiddleware");

const settingsRouter = express.Router();
settingsRouter.post("/saveData", authenticate, async (req, res) => {
  try {
    console.log("Received request data:", req.body); // Log request data

    const {
      selectedOption,
      mgrName,
      mgrEmail,
      presenter,
      category,
      topic,
      department,
      subtopics,
    } = req.body;

    // Check if topic and category are provided
    let settingsData;
    if (topic && category) {
      const existingTopic = await Settings.findOne({ topic, category });
      if (existingTopic) {
        // If the topic already exists in the same category, handle the update or merge logic
        console.log("Topic already exists in the same category, handle update or merge.");
        // Example of updating existing entry
        existingTopic.selectedOption = selectedOption;
        existingTopic.mgrName = mgrName;
        existingTopic.mgrEmail = mgrEmail;
        existingTopic.presenter = presenter;
        existingTopic.department = department;
        existingTopic.subtopics = subtopics;
        
        settingsData = await existingTopic.save();
      } else {
        // If it's a new entry, create a new document
        settingsData = new Settings({
          selectedOption,
          mgrName,
          mgrEmail,
          presenter,
          category,
          topic,
          department,
          subtopics,
        });

        settingsData = await settingsData.save();
      }
    } else {
      // Handle cases where topic or category might not be provided (optional handling)
      settingsData = new Settings({
        selectedOption,
        mgrName,
        mgrEmail,
        presenter,
        category,
        topic,
        department,
        subtopics,
      });

      settingsData = await settingsData.save();
    }

    res.status(201).json(settingsData);
  } catch (error) {
    console.error("Error processing request:", error);
    if (error.code === 11000) {
      res.status(409).json({ message: "Duplicate entry detected." });
    } else {
      res.status(500).json({ message: "Error processing request", error: error.message });
    }
  }
});


settingsRouter.get("/getData", async (req, res) => {
  try {
    const data = await Settings.find();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ message: "Error retrieving data" });
  }
});

settingsRouter.get("/topics/:category", authenticate, async (req, res) => {
  const { category } = req.params;

  try {
    let topics;
    if (category === "Assessment") {
      topics = await Settings.find({ category: "Assessment" }).select(
        "topic category"
      );
    } else if (category === "Induction") {
      topics = await Settings.find({ category: "Induction" }).select(
        "topic category"
      );
    } else if (category === "Bootcamp") {
      topics = await Settings.find({ category: "Bootcamp" }).select(
        "topic subtopics category"
      );
    } else if (category === "Training") {
      topics = await Settings.find({ category: "Training" }).select(
        "topic category"
      );
    } else {
      topics = await Settings.find({ category });
    }

    // Send the topics as a response
    res.status(200).json({ topics });
  } catch (err) {
    // Handle errors if any
    console.error("Error fetching topics:", err);
    res.status(500).json({ error: "Error fetching topics" });
  }
});

// Update topic data
settingsRouter.put(
  "/topics/:category/:topicId",
  authenticate,
  async (req, res) => {
    const updateData = req.body;
    const { category, topicId } = req.params;
    console.log(updateData);
    try {
      const checkTopic = await Settings.findOne({
        category: category,
        _id: topicId,
      });
      console.log("checkTopic ", checkTopic);
      if (checkTopic) {
        console.log("Topic Found");
        const updatedTopic = await Settings.findOneAndUpdate(
          {
            _id: topicId,
            category: category,
            topic: checkTopic.topic,
          },
          {
            $set: updateData,
          }
        );
        res
          .status(200)
          .json({ message: "Topic updated successfully", data: updatedTopic });
      } else {
        console.log("Topic Not Found");
        res.status(500).json({ message: "Topic Not Found" });
      }
    } catch (error) {
      res.status(500).json({
        message: "An error occurred while fetching topics",
        error: error,
      });
      // process.exit(0);
    }
  }
);

settingsRouter.delete("/topics/:category/:topicId", async (req, res) => {
  const { category, topicId } = req.params;
  try {
    const result = await Settings.findOneAndDelete({
      category: category,
      _id: topicId,
    });
    res
      .status(200)
      .json({ message: "data deleted successfully", data: result });
  } catch (error) {
    console.log("error ", error);
    res
      .status(500)
      .json({ message: "error while deleting data", error: error });
  }
});

settingsRouter.get("/departments", async (req, res) => {
  try {
    const departments = await Settings.find().distinct("department");
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error retrieving departments:", error);
    res.status(500).json({ message: "Error retrieving departments" });
  }
});

// Route to retrieve presenters
settingsRouter.get("/presenters", authenticate, async (req, res) => {
  try {
    const presenters = await Settings.find().distinct("presenter");
    res.status(200).json(presenters);
  } catch (error) {
    console.error("Error retrieving presenters:", error);
    res.status(500).json({ message: "Error retrieving presenters" });
  }
});

// Route to retrieve managers
settingsRouter.get("/managers", async (req, res) => {
  try {
    const managers = await Settings.find().select("mgrName mgrEmail");
    res.status(200).json(managers);
  } catch (error) {
    console.error("Error retrieving managers:", error);
    res.status(500).json({ message: "Error retrieving managers" });
  }
});

module.exports = settingsRouter;
