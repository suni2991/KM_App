const nominationRouter = require("express").Router();
const Nomination = require("../model/NominationModel");


nominationRouter.post('/add/nominations', async (req, res) => {
  const { mgrName, mgrEmail, fullName, email, trainings } = req.body;

  try {
    let existingNomination = await Nomination.findOne({ email });

    if (!existingNomination) {
      existingNomination = new Nomination({
        mgrName,
        mgrEmail,
        fullName,
        email,
        trainings,
      });

      await existingNomination.save();
      res.status(201).json({ message: 'Nomination successfully registered.' });
    } else {
      existingNomination.trainings.push(...trainings); 
      await existingNomination.save();
      res.status(200).json({ message: 'Nomination successfully updated.' });
    }
  } catch (error) {
    console.error('Error registering/updating nomination:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});




// GET method to fetch all nominations
nominationRouter.get('/nominations', async (req, res) => {
    try {
      const nominations = await Nomination.find({});
      res.status(200).json(nominations);
    } catch (err) {
      console.error('Error fetching nominations:', err);
      res.status(500).json({ error: 'An error occurred while fetching nominations.' });
    }
  });

  nominationRouter.get('/nominations/:mgrEmail', async (req, res) => {
    const mgrEmail = req.params.mgrEmail;
  
    try {
      const nominations = await Nomination.find({ mgrEmail: mgrEmail }).exec();
      res.json(nominations);
    } catch (error) {
      console.error('Error fetching nominations:', error);
      res.status(500).json({ error: 'Error fetching nominations' });
    }
  });
  
  // PUT method to update a nomination's training
  nominationRouter.put('/nominations/:id/trainings/:trainingId', async (req, res) => {
    const { id, trainingId } = req.params;
    const {trainingStatus } = req.body;
  
    try {
      const nomination = await Nomination.findById(id);
  
      if (!nomination) {
        return res.status(404).json({ error: 'Nomination not found.' });
      }
  
      const trainingIndex = nomination.trainings.findIndex((training) => training._id.toString() === trainingId);
  
      if (trainingIndex === -1) {
        return res.status(404).json({ error: 'Training not found for the given nomination.' });
      }
  
 
      nomination.trainings[trainingIndex].trainingStatus = trainingStatus;
  
      const updatedNomination = await nomination.save();
      res.status(200).json(updatedNomination);
    } catch (err) {
      console.error('Error updating nomination:', err);
      res.status(500).json({ error: 'An error occurred while updating the nomination.' });
    }
  });

   
  nominationRouter.put('/nominations/:email', async (req, res) => {
    const email = req.params.email;
    const { fullName, email: newEmail, trainings } = req.body;
  
    try {
      const existingNomination = await Nomination.findOne({ email });
  
      if (!existingNomination) {
        return res.status(404).json({ message: 'Nomination not found.' });
      }
  
      // Check if the trainingName already exists
      const existingTraining = existingNomination.trainings.find(training => training.trainingName === trainings[0].trainingName);
  
      if (existingTraining) {
        // Update existing training's date and timeSlot
        existingTraining.date = trainings[0].date;
        existingTraining.timeSlot = trainings[0].timeSlot;
      } else {
        // Create a new training and add it to the trainings array
        const newTraining = {
          date: trainings[0].date,
          trainingName: trainings[0].trainingName,
          timeSlot: trainings[0].timeSlot
        };
        existingNomination.trainings.push(newTraining);
      }
  
      // Update other fields
      existingNomination.fullName = fullName;
      existingNomination.email = newEmail;
  
      // Save the updated document
      await existingNomination.save();
  
      res.status(200).json({ message: 'Nomination updated successfully.' });
    } catch (error) {
      console.error('Error updating nomination:', error);
      res.status(500).json({ message: 'An error occurred while updating the nomination.', error: error.message });
    }
  });
  
  


  nominationRouter.get('/nomination/:email', async (req, res) => {
    const email = req.params.email;
  
    try {
      const nomination = await Nomination.findOne({ email }); // Finding by email
      if (!nomination) {
        return res.status(404).json({ message: 'Nomination not found' });
      }
      res.json(nomination);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  nominationRouter.delete('/nominations/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedNomination = await Nomination.findByIdAndDelete(id);
  
      if (!deletedNomination) {
        return res.status(404).json({ error: 'Nomination not found.' });
      }
  
      res.status(200).json({ message: 'Nomination deleted successfully.' });
    } catch (err) {
      console.error('Error deleting nomination:', err);
      res.status(500).json({ error: 'An error occurred while deleting the nomination.' });
    }
  });


 // DELETE endpoint to delete a training entry
 nominationRouter.delete('/nominations/:nominationId/trainings/:trainingId', async (req, res) => {
  const { nominationId, trainingId } = req.params;

  try {
    // Find the corresponding nomination
    const nomination = await Nomination.findById(nominationId);

    if (!nomination) {
      return res.status(404).json({ message: 'Nomination not found' });
    }

    // Find the index of the training to delete
    const trainingIndex = nomination.trainings.findIndex((training) => training._id.toString() === trainingId);

    if (trainingIndex === -1) {
      return res.status(404).json({ message: 'Training not found' });
    }

    // Remove the training from the array
    nomination.trainings.splice(trainingIndex, 1);

    // Save the updated nomination
    await nomination.save();

    return res.json({ message: 'Training deleted successfully' });
  } catch (error) {
    console.error('Error deleting training:', error);
    return res.status(500).json({ message: 'An error occurred while deleting the training' });
  }
});

module.exports = nominationRouter;