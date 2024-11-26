const nominationRouter = require("express").Router();
const { authenticate } = require("../middleware/CheckAuthMiddleware");
const Nomination = require("../model/NominationModel");

nominationRouter.post("/add/nominations", authenticate, async (req, res) => {
  const { mgrName, mgrEmail, fullName, email, trainings } = req.body;

  try {
    // Check if there's an existing nomination with the same email
    let existingNomination = await Nomination.findOne({ email });
    if (existingNomination) {
      // Check if there's an existing training for the same date, topic, and mode
      const existingTraining = existingNomination.trainings.find(
        (training) =>
          training.date.toISOString() === trainings[0].date &&
          training.trainingName === trainings[0].trainingName &&
          training.mode === trainings[0].mode
      );

      if (existingTraining) {
        return res.status(400).json({
          error:
            "Nomination already exists for this Email, Date, Topic, and Mode.",
        });
      }

      // Count the existing registrations for the same date and topic based on mode
      const registrationCount = existingNomination.trainings.filter(
        (training) =>
          training.date.toISOString() === trainings[0].date &&
          training.trainingName === trainings[0].trainingName &&
          training.mode === trainings[0].mode
      ).length;

      // Check if the mode limit is exceeded
      const modeLimit = trainings[0].mode === "Offline" ? 3 : 2;
      if (registrationCount >= modeLimit) {
        return res.status(400).json({
          error: `Limit Exceeded: Maximum ${modeLimit} registrations allowed for this topic on the same day.`,
        });
      }

      // Add the new training to the existing nomination and save
      existingNomination.trainings.push(...trainings);
      existingNomination = await existingNomination.save(); // Save changes to existing nomination
      return res
        .status(200)
        .json({ message: "Nomination successfully updated." });
    }

    // If no existing nomination found, create a new one
    const newNomination = new Nomination({
      mgrName,
      mgrEmail,
      fullName,
      email,
      trainings,
    });

    await newNomination.save();
    res.status(201).json({ message: "Nomination successfully registered." });
  } catch (error) {
    console.error("Error registering/updating nomination:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

nominationRouter.get("/nominations", authenticate, async (req, res) => {
  try {
    const nominations = await Nomination.find({});
    res.status(200).json(nominations);
  } catch (err) {
    console.error("Error fetching nominations:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching nominations." });
  }
});

nominationRouter.get(
  "/nominations/:mgrEmail",
  authenticate,
  async (req, res) => {
    const mgrEmail = req.params.mgrEmail;

    try {
      const nominations = await Nomination.find({ mgrEmail: mgrEmail }).exec();
      res.json(nominations);
    } catch (error) {
      console.error("Error fetching nominations:", error);
      res.status(500).json({ error: "Error fetching nominations" });
    }
  }
);

// PUT method to update a nomination's training
nominationRouter.put(
  "/nominations/:id/trainings/:trainingId",
  authenticate,
  async (req, res) => {
    const { id, trainingId } = req.params;
    const { trainingStatus } = req.body;

    try {
      const nomination = await Nomination.findById(id);

      if (!nomination) {
        return res.status(404).json({ error: "Nomination not found." });
      }

      const trainingIndex = nomination.trainings.findIndex(
        (training) => training._id.toString() === trainingId
      );

      if (trainingIndex === -1) {
        return res
          .status(404)
          .json({ error: "Training not found for the given nomination." });
      }

      nomination.trainings[trainingIndex].trainingStatus = trainingStatus;

      const updatedNomination = await nomination.save();
      res.status(200).json(updatedNomination);
    } catch (err) {
      console.error("Error updating nomination:", err);
      res
        .status(500)
        .json({ error: "An error occurred while updating the nomination." });
    }
  }
);

nominationRouter.put("/nominations/:email", authenticate, async (req, res) => {
  const email = req.params.email;
  const { fullName, email: newEmail, trainings } = req.body;

  try {
    const existingNomination = await Nomination.findOne({ email });

    if (!existingNomination) {
      return res.status(404).json({ message: "Nomination not found." });
    }

    // Check if the trainingName already exists for the given date
    const existingTraining = existingNomination.trainings.find(
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

    // Create a new training and add it to the trainings array
    const newTraining = {
      date: trainings[0].date,
      trainingName: trainings[0].trainingName,
      timeSlot: trainings[0].timeSlot,
    };
    existingNomination.trainings.push(newTraining);

    // Update other fields
    existingNomination.fullName = fullName;
    existingNomination.email = newEmail;

    // Save the updated document
    await existingNomination.save();

    res.status(200).json({ message: "Nomination updated successfully." });
  } catch (error) {
    console.error("Error updating nomination:", error);
    res.status(500).json({
      message: "An error occurred while updating the nomination.",
      error: error.message,
    });
  }
});

nominationRouter.get("/nomination/:email", authenticate, async (req, res) => {
  const email = req.params.email;

  try {
    const nomination = await Nomination.findOne({ email }); // Finding by email
    if (!nomination) {
      return res.status(404).json({ message: "Nomination not found" });
    }
    res.json(nomination);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

nominationRouter.delete("/nominations/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedNomination = await Nomination.findByIdAndDelete(id);

    if (!deletedNomination) {
      return res.status(404).json({ error: "Nomination not found." });
    }

    res.status(200).json({ message: "Nomination deleted successfully." });
  } catch (err) {
    console.error("Error deleting nomination:", err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the nomination." });
  }
});

nominationRouter.delete(
  "/nominations/:nominationId/trainings/:trainingId",
  authenticate,
  async (req, res) => {
    const { nominationId, trainingId } = req.params;

    try {
      const nomination = await Nomination.findById(nominationId);

      if (!nomination) {
        return res.status(404).json({ message: "Nomination not found" });
      }

      const trainingIndex = nomination.trainings.findIndex(
        (training) => training._id.toString() === trainingId
      );

      if (trainingIndex === -1) {
        return res.status(404).json({ message: "Training not found" });
      }

      nomination.trainings.splice(trainingIndex, 1);

      await nomination.save();

      return res.json({ message: "Training deleted successfully" });
    } catch (error) {
      console.error("Error deleting training:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while deleting the training" });
    }
  }
);

module.exports = nominationRouter;
