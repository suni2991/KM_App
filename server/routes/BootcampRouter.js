const bootcampRouter = require("express").Router();
const { authenticate } = require("../middleware/CheckAuthMiddleware");
const Bootcamp = require("../model/BootcampModel");

bootcampRouter.post("/add/bootcamps", authenticate, async (req, res) => {
  const { mgrName, mgrEmail, fullName, email, trainings, subTrainings } =
    req.body;

  try {
    const existingBootcamp = await Bootcamp.findOne({ email });
    if (existingBootcamp) {
      const existingTraining = existingBootcamp.trainings.find(
        (training) =>
          training.date.toISOString() === trainings[0].date &&
          training.trainingName === trainings[0].trainingName
      );

      if (existingTraining) {
        return res.status(400).json({
          error: "Bootcamp already exists for this Email, Date, and Topic.",
        });
      }

      if (!existingBootcamp.trainings) {
        existingBootcamp.trainings = [];
      }
      if (!existingBootcamp.subTopics) {
        existingBootcamp.subTopics = [];
      }

      let updatedSubTrainings = subTrainings; // Change const to let here

      if (!Array.isArray(updatedSubTrainings)) {
        updatedSubTrainings = []; // Initialize updatedSubTrainings as an empty array if it's not already an array
      }

      // Count existing registrations for the same topic and date
      const registrationsForTopicDate = existingBootcamp.trainings.filter(
        (training) =>
          training.date.toISOString() === trainings[0].date &&
          training.trainingName === trainings[0].trainingName
      );

      if (registrationsForTopicDate.length >= 5) {
        return res.status(400).json({
          error:
            "Maximum registrations reached for this topic on the same day.",
        });
      }

      // If the bootcamp exists but not for the same date and topic, add the new training to it
      existingBootcamp.trainings.push(...trainings);
      existingBootcamp.subTopics.push(...updatedSubTrainings); // Use updatedSubTrainings here
      await existingBootcamp.save();
      return res
        .status(200)
        .json({ message: "Bootcamp successfully updated." });
    }

    // If no existing bootcamp found, create a new one
    const newBootcamp = new Bootcamp({
      mgrName,
      mgrEmail,
      fullName,
      email,
      trainings,
      subTrainings, // Include subTopics in the new bootcamp
    });

    // Count registrations for the same topic and date across all bootcamps
    const allRegistrationsForTopicDate = await Bootcamp.aggregate([
      { $unwind: "$trainings" },
      {
        $match: {
          "trainings.date": new Date(trainings[0].date),
          "trainings.trainingName": trainings[0].trainingName,
        },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    if (
      allRegistrationsForTopicDate.length > 0 &&
      allRegistrationsForTopicDate[0].count >= 50
    ) {
      return res.status(400).json({
        error: "Maximum registrations reached for this topic on the same day.",
      });
    }

    await newBootcamp.save();
    res.status(201).json({ message: "Bootcamp successfully registered." });
  } catch (error) {
    console.error("Error registering/updating bootcamp:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

bootcampRouter.get("/bootcamps/:mgrEmail", authenticate, async (req, res) => {
  const mgrEmail = req.params.mgrEmail;

  try {
    const bootcamps = await Bootcamp.find({ mgrEmail: mgrEmail }).exec();
    res.json(bootcamps);
  } catch (error) {
    console.error("Error fetching bootcamps:", error);
    res.status(500).json({ error: "Error fetching bootcamps" });
  }
});

// PUT method to update a bootcamp's training
bootcampRouter.put(
  "/bootcamps/:id/trainings/:trainingId",
  authenticate,
  async (req, res) => {
    const { id, trainingId } = req.params;
    const { trainingStatus } = req.body;

    try {
      const bootcamp = await Bootcamp.findById(id);

      if (!bootcamp) {
        return res.status(404).json({ error: "Bootcamp not found." });
      }

      const trainingIndex = bootcamp.trainings.findIndex(
        (training) => training._id.toString() === trainingId
      );

      if (trainingIndex === -1) {
        return res
          .status(404)
          .json({ error: "Training not found for the given bootcamp." });
      }

      bootcamp.trainings[trainingIndex].trainingStatus = trainingStatus;

      const updatedBootcamp = await bootcamp.save();
      res.status(200).json(updatedBootcamp);
    } catch (err) {
      console.error("Error updating bootcamp:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating the bootcamp." });
    }
  }
);

bootcampRouter.put("/bootcamps/:email", authenticate, async (req, res) => {
  const email = req.params.email;
  const { fullName, email: newEmail, trainings } = req.body;

  try {
    const existingBootcamp = await Bootcamp.findOne({ email });

    if (!existingBootcamp) {
      return res.status(404).json({ message: "Bootcamp not found." });
    }

    // Check if the trainingName already exists for the given date
    const existingTraining = existingBootcamp.trainings.find(
      (training) =>
        training.trainingName === trainings[0].trainingName &&
        training.date.toDateString() ===
          new Date(trainings[0].date).toDateString()
    );

    if (existingTraining) {
      return res.status(400).json({
        message:
          "Training with the same date and topic already exists for this employee.",
      });
    }

    // Count existing registrations for the same topic and date
    const registrationsForTopicDate = existingBootcamp.trainings.filter(
      (training) =>
        training.date.toDateString() ===
          new Date(trainings[0].date).toDateString() &&
        training.trainingName === trainings[0].trainingName
    );

    if (registrationsForTopicDate.length >= 5) {
      return res.status(400).json({
        message:
          "Maximum registrations reached for this topic on the same day.",
      });
    }

    // Create a new training and add it to the trainings array
    const newTraining = {
      date: trainings[0].date,
      trainingName: trainings[0].trainingName,
      timeSlot: trainings[0].timeSlot,
    };
    existingBootcamp.trainings.push(newTraining);

    // Update other fields
    existingBootcamp.fullName = fullName;
    existingBootcamp.email = newEmail;

    // Save the updated document
    await existingBootcamp.save();

    res.status(200).json({ message: "Bootcamp updated successfully." });
  } catch (error) {
    console.error("Error updating bootcamp:", error);
    res.status(500).json({
      message: "An error occurred while updating the bootcamp.",
      error: error.message,
    });
  }
});

bootcampRouter.get("/bootcamp/:email", authenticate, async (req, res) => {
  const email = req.params.email;

  try {
    const bootcamp = await Bootcamp.findOne({ email }); // Finding by email
    if (!bootcamp) {
      return res.status(404).json({ message: "Bootcamp not found" });
    }
    res.json(bootcamp);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

bootcampRouter.delete("/bootcamps/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBootcamp = await Bootcamp.findByIdAndDelete(id);

    if (!deletedBootcamp) {
      return res.status(404).json({ error: "Bootcamp not found." });
    }

    res.status(200).json({ message: "Bootcamp deleted successfully." });
  } catch (err) {
    console.error("Error deleting bootcamp:", err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the bootcamp." });
  }
});

// DELETE endpoint to delete a training entry
bootcampRouter.delete(
  "/bootcamps/:bootcampId/trainings/:trainingId",
  authenticate,
  async (req, res) => {
    const { bootcampId, trainingId } = req.params;

    try {
      const bootcamp = await Bootcamp.findById(bootcampId);

      if (!bootcamp) {
        return res.status(404).json({ message: "Bootcamp not found" });
      }

      const trainingIndex = bootcamp.trainings.findIndex(
        (training) => training._id.toString() === trainingId
      );

      if (trainingIndex === -1) {
        return res.status(404).json({ message: "Training not found" });
      }

      bootcamp.trainings.splice(trainingIndex, 1);

      await bootcamp.save();

      return res.json({ message: "Training deleted successfully" });
    } catch (error) {
      console.error("Error deleting training:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while deleting the training" });
    }
  }
);

module.exports = bootcampRouter;
