require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const Deadline = require('./model/deadline.model.js');
const cors = require('cors');



//Middleware
const app = express()
app.use(express.json());

//Allows communication between backend and frontend
app.use(cors());

//helper function to calculate days remaining/overdue for add and get requests dynamically
function computeDeadlineFields(deadline) {
  const daysRemaining = Math.ceil(
    (new Date(deadline.due_date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24) + 1
  );

  return {
    ...deadline,
    daysRemaining,
    overdue: daysRemaining < 0
  };
}

//Retrieves all deadlines sorted from database, computes days remaining
app.get('/', async (req,res) => {
    try{
        const deadlines = await Deadline.find({});
        const result = deadlines.map(d => computeDeadlineFields(d.toObject()));
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

//Add a new deadline to database
app.post('/', async (req,res) => {
    try{
        const deadline = await Deadline.create(req.body);
        const result = computeDeadlineFields(deadline.toObject());
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

//Update deadline
app.put('/:id', async (req,res)=>{
    try{
        const {id} = req.params;
        const deadline = await Deadline.findByIdAndUpdate(id,req.body,
            {
                new: true, //displays updated deadline
                runValidators: true // enforce deadline schema rules
            }
    );

        if(!Deadline) {
            return res.status(404).json({message: "Deadline Not Found"});
        }
        res.status(200).json(computeDeadlineFields(deadline.toObject()));
    } catch(error) {
        res.status(500).json({message: error.message});
    }
})

//Delete deadline
app.delete('/:id', async (req,res)=>{
    try{
    const {id} = req.params;
    const deadline = await Deadline.findByIdAndDelete(id);

    if(!Deadline) {
        return res.status(404).json({message: "Deadline Not Found"});
    }
    res.status(200).json({message: "Successfully deleted"});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
})


//Connecting to database, encrypting password using environment variable
mongoose.connect(process.env.MONGO_URI)
.then(()=> {
    console.log('Database connected successfully');
    app.listen(5000, () => {
    console.log('Server is running on port 5000');
    });
})
.catch((err) => {
    console.log('Error connecting to Database:', err);
});
