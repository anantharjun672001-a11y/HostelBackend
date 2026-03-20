import Maintenance from "../models/Maintenance.js";
import Resident from "../models/Resident.js";

// Create Maintenance Request
export const createMaintenance = async (req, res) => {
  try {
    const resident = await Resident.findOne({ userId: req.user.id });

    if (!resident) {
      return res.status(404).json({ message: "Resident profile not found" });
    }

    if (!resident.room) {
      return res.status(400).json({ message: "Room not assigned yet" });
    }


    const { issue, priority } = req.body;

    if (!issue || !priority) {
      return res.status(400).json({ message: "Issue and priority required" });
    }

    const request = await Maintenance.create({
      resident: resident._id,
      room: resident.room,
      issue,
      priority,
      status: "pending",
      assignedTo: null,
    });

    res.status(201).json(request);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Creating Maintenance" });
  }
};


// Get All Requests (Admin)

export const getMaintenance = async (req,res)=>{
  try{

    const requests = await Maintenance.find()
      .populate({
        path:"resident",
        populate:{
          path:"userId",
          select:"name"
        }
      })
      .populate("room","roomNumber")
      .populate("assignedTo","name")
      .sort({createdAt:-1});

    res.status(200).json(requests);

  }catch(error){

    res.status(500).json({message:"Error fetching maintenance requests"});

  }
}

//Get resident own requests

export const getMyMaintenance = async (req,res)=>{
  try{

    const resident = await Resident.findOne({ userId:req.user.id });

    const requests = await Maintenance.find({
      resident: resident._id
    })
    .populate("room","roomNumber")
    .sort({ createdAt:-1 });

    res.status(200).json(requests);

  }catch(error){

    res.status(500).json({message:"Error fetching requests"});

  }
}


// Assign Technician
export const assignMaintenance = async (req,res)=>{
  try{

    const { staffId } = req.body;

    if(!staffId){
      return res.status(400).json({message:"Staff ID required"});
    }

    const request = await Maintenance.findById(req.params.id);

    if(!request){
      return res.status(404).json({message:"Request not found"});
    }

    request.assignedTo = staffId;
    request.status = "in-progress";

    await request.save();

    res.status(200).json({
      message:"Staff assigned successfully",
      request
    });

  }catch(error){

    console.log(error);

    res.status(500).json({message:"Error assigning staff"});

  }
};


// Update Status (Technician)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status required" });
    }

    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json(request);

  } catch (error) {
    res.status(500).json({ message: "Error Updating Status" });
  }
};


// Filter by Priority
export const getPriorityMaintenance = async (req, res) => {
  try {
    const { priority } = req.query;

    const requests = await Maintenance.find({ priority })
      .populate("resident")
      .populate("room");

    res.status(200).json(requests);

  } catch (error) {
    res.status(500).json({ message: "Error Fetching Priority Requests" });
  }
};


//  Pending Requests
export const getPendingMaintenance = async (req,res)=>{
  try{

    const requests = await Maintenance.find({ status:"pending" })
      .populate({
        path:"resident",
        populate:{
          path:"userId",
          select:"name"
        }
      })
      .populate("room","roomNumber")
      .populate("assignedTo","name");

    res.status(200).json(requests);

  }catch(error){

    res.status(500).json({
      message:"Error Fetching Pending Requests"
    });

  }
};