const express = require("express");
const Room = require("../models/room");

const router = express.Router();


// ✅ Add Classroom
router.post("/rooms", async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ✅ View All Classrooms
router.get("/rooms", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});


// ✅ Allocate Exam Seats (GREEDY LOGIC)
router.post("/allocate", async (req, res) => {
  const { totalStudents } = req.body;

  if (!totalStudents || totalStudents <= 0) {
    return res.status(400).json({ message: "Invalid student count" });
  }

  const rooms = await Room.find();

  // Sort by floor (ascending) then capacity (descending)
  rooms.sort((a, b) => {
    if (a.floorNo === b.floorNo) {
      return b.capacity - a.capacity;
    }
    return a.floorNo - b.floorNo;
  });

  let allocatedRooms = [];
  let totalCapacity = 0;

  for (let room of rooms) {
    if (totalCapacity >= totalStudents) break;

    allocatedRooms.push(room);
    totalCapacity += room.capacity;
  }

  if (totalCapacity < totalStudents) {
    return res.json({ message: "Not enough seats available" });
  }

  res.json({
    allocatedRooms,
    totalCapacity
  });
});

module.exports = router;