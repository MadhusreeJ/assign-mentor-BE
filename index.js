const express = require("express");
const app = express();
const {MongoClient , ObjectId} = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config()

const port = process.env.PORT || 3000;
app.listen(port,()=>{
console.log("Webser running");
})

app.use(cors("*"));
app.use(express.json());

const URL = process.env.DB;

//creating mentor
app.post("/creatementor", async(req,res)=>{
    try{
        const connection = await MongoClient.connect(URL);

        const db = connection.db("assign_mentor");

        const collection = db.collection("mentors");

        await collection.insertOne(req.body);

        await connection.close();

        res.status(200).json(
            {message:"Mentor created successfully"});

}  catch(error)
{
  res.status(500).json(
    {message:"Something went wrong"});
}
});

//get all mentor
app.get("/getallmentors", async(req,res)=>{
    try{
        const connection = await MongoClient.connect(URL);

        const db = connection.db("assign_mentor");

        const collection = db.collection("mentors");

        const mentors = await collection.find({}).toArray();

        await connection.close();

        res.status(200).json(mentors);

}  catch(error)
{
  res.status(500).json(
    {message:"Something went wrong"});
}
});

//creating student 
app.post("/createstudent" , async(req,res)=>{
    try{
        const connection = await MongoClient.connect(URL);

        const db = connection.db("assign_mentor");

        const collection = db.collection("students");

        await collection.insertOne(req.body);

        await connection.close();

        res.status(200).json(
            {message:"Stuent created successfully"});

}  catch(error)
{
  res.status(500).json(
    {message:"Something went wrong"});
}
});

//get all students
app.get("/getallstudents", async(req,res)=>{
    try{
        const connection = await MongoClient.connect(URL);

        const db = connection.db("assign_mentor");

        const collection = db.collection("students");

        const students = await collection.find({}).toArray();

        await connection.close();

        res.status(200).json(students);

}  catch(error)
{
  res.status(500).json(
    {message:"Something went wrong"});
}
});

//get mentor unassigned students
app.get("/unassignedstudents", async (req,res)=>{
    try{
        const connection = await MongoClient.connect(URL);

        const db = connection.db("assign_mentor");

        const collection = db.collection("students");

        const unassignedStudents = await collection.find({mentor : ""}).toArray();

        await connection.close();

        res.status(200).json(unassignedStudents);
    }catch(error){
        res.status(500).json(
            {message:"Something went wrong"});
    }
});

//Assigning mentor to students 
app.put('/assignmentor/:mentorId/students', async (req, res) => {
    try{
        const connection = await MongoClient.connect(URL);

        const db = connection.db("assign_mentor");

        const studentCollection = db.collection("students");
        const mentorCollection = db.collection("mentors")
        const mentor = await mentorCollection.findOne({"_id" : new ObjectId(req.params.mentorId)})
        console.log(req.body);
        await Promise.all (req.body.map(async(student)=>{
            await studentCollection.findOneAndUpdate({"_id" :new ObjectId (student._id)},
            { $set: { "mentor": mentor.mentor_name}})
        }));
        
        await connection.close();

        res.status(200).json({ message: 'Students assigned to mentor successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Error assigning students', error : error.message});
        console.log(error);
    }
});

//Assign or Change Mentor for particular Student
app.put("/changementor/:studentId", async (req,res)=>{
    try{
        const connection = await MongoClient.connect(URL);

        const db = connection.db("assign_mentor");

        const collection = db.collection("students");
        
        const currentMentor = await collection.findOne({"_id" : new ObjectId(req.params.studentId)});
    
        await collection.findOneAndUpdate({"_id" : new ObjectId(currentMentor._id)},
        {$push: { "previous_mentor": currentMentor.mentor}});

       await collection.findOneAndUpdate({"_id" : new ObjectId(req.params.studentId)},
       {$set: { "mentor": req.body.mentor_name}});
        
        await connection.close();

        res.status(200).json({ message: 'Student mentor updated successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Error updating students', error : error.message});
        console.log(error);
    }
});

// get all students for a particular mentor
app.get("/studentsmentor/:mentorId", async (req,res)=>{
    try{
        const connection = await MongoClient.connect(URL);

        const db = connection.db("assign_mentor");

        const studentCollection = db.collection("students");
        const mentorCollection = db.collection("mentors")

        const mentor = await mentorCollection.findOne({"_id" : new ObjectId(req.params.mentorId)})

       const studentMentor = await studentCollection.find({"mentor" : mentor.mentor_name}).toArray();
        
        await connection.close();

        res.status(200).json(studentMentor);
    } catch (error) {
        res.status(500).json({ message: 'Error updating students', error : error.message});
        console.log(error);
    }
})


//get student previous mentors
app.get("/previousmentors/:studentId", async (req,res)=>{
    try{
        const connection = await MongoClient.connect(URL);

        const db = connection.db("assign_mentor");

        const collection = db.collection("students");

        const student = await collection.findOne({"_id" : new ObjectId(req.params.studentId),
        previous_mentor : { $exists: true} });
        
        await connection.close();

        if (student) {
            res.status(200).json(student);
        } else {
            res.status(200).json({ message: 'This student does not have previous mentors.'})
        }
}catch(error){
    console.log(error);
}
});

