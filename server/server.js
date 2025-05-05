const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const path = require("path");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const http = require("http"); //!julio was here
const { Server } = require("socket.io"); // real time updates, chat, etc.
// const Message = require('./models/Message');

require("dotenv").config();
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
const uri =
  "mongodb+srv://va285:pass_word123@cluster0.yb05yyx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let client;
let db;

async function connectToMongo() {
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db("RUHousing");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToMongo();

let gfs;

function getGridFSBucket() {
  if (!db) throw new Error("No DB connection");
  return new GridFSBucket(db, { bucketName: "profilePictures" });
}

// ------------ Routes for saving house ----------- //
app.post("/api/house", async (req, res) => {
  console.log("Post House route called!!");
  const {
    userId,
    address,
    bathrooms,
    bedrooms,
    livingArea,
    propertyType,
    lotAreaValue,
    listingStatus,
    price,
    imgSrc,
    preferences,
    owner,
    carouselPhotos,
  } = req.body;

  try {
    const db = client.db("RUHousing");
    const savedHousesDb = db.collection("SavedHouses");
    // step1.) check if  userId and address are not empty
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    if (!address)
      return res.status(400).json({ error: "Missing house address" });

    // step2.) check if that house is already saved by the user
    const chechIfHouseIsSaved = await savedHousesDb.findOne({
      address: address,
      userId: userId,
    });
    if (chechIfHouseIsSaved) {
      console.log("The house is already saved");
      return res.status(400).json({ error: "This house is already saved" });
    }
    //step 3) save the house
    const saveHouse = await savedHousesDb.insertOne(req.body);
    if (saveHouse) return res.status(200).json({ message: "House is saved" });
  } catch (error) {
    console.error("❌ Error saving house:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// add and fetch reviews for a house

app.get("/api/houses/:id/reviews", async (req, res) => {
  const houseId = req.params.id;
  try {
    const collection = db.collection("reviews");
    const reviews = await collection.find({ houseId }).toArray();
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/zillow/propertyExtendedSearch", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch",
      {
        params: req.query,
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com",
        },
      }
    );
    res.json(data);
  } catch (err) {
    console.error("Zillow proxy failed:", err?.response?.data || err.message);
    res.status(500).json({ error: "Zillow lookup failed" });
  }
});
// Review get/post
app.post("/api/houses/:id/reviews", async (req, res) => {
  console.log("Review submission received:", req.params, req.body);
  const houseId = req.params.id;
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Review text required" });

  try {
    const collection = db.collection("reviews");

    await collection.insertOne({
      houseId,
      text,
      date: new Date(),
    });

    // Return all updated reviews
    const updatedReviews = await collection.find({ houseId }).toArray();
    res.json(updatedReviews);
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --------- Route to get saved houses ----------- //
app.get("/api/house/:userId", async (req, res) => {
  try {
    const db = client.db("RUHousing");
    const savedHousesDb = db.collection("SavedHouses");
    // step1) check if the userId is being sent
    const { userId } = req.params;
    console.log(userId);
    if (!userId) return res.status(400).json({ error: "UserId is missing" });

    //step 2) get the house
    const savedHouses = await savedHousesDb
      .find({ userId: userId.toString() })
      .toArray();
    if (savedHouses.length > 0) {
      console.log("Saved Houses found!!");
      return res.status(200).json({ props: savedHouses });
    } else {
      return res.status(404).json({ message: "No houses found for this user" });
    }
  } catch (error) {
    console.error("❌ Error Getting saved houses:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- Route to delete saved house -------- //
app.delete("/api/house/:id", async (req, res) => {
  try {
    console.log("Delete route CALLED !!!!");
    const db = client.db("RUHousing");
    const savedHousesDb = db.collection("SavedHouses");
    // step 1.) check if house id is being sent
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "missing house id" });

    // step2.) delete the house from saved houses
    const deleteHouse = await savedHousesDb.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteHouse.deletedCount === 1) {
      return res
        .status(200)
        .json({ message: "Successfully deleted the saved house" });
    } else {
      return res.status(404).json({ message: "Saved house not found" });
    }
  } catch (error) {
    console.error("❌ Error Deleting saved house:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- Upload profile picture (expects field name 'photo') -------- //
app.post("/api/profile-photo", upload.single("photo"), async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const usersCollection = db.collection("users");

    // Remove any existing image for this user (optional)
    const oldUser = await usersCollection.findOne({ uid });
    if (oldUser && oldUser.photoId) {
      const bucket = getGridFSBucket();
      try {
        await bucket.delete(new ObjectId(oldUser.photoId));
      } catch {
        /* Ignore if not found */
      }
    }

    // Store new image in GridFS
    const bucket = getGridFSBucket();
    const uploadStream = bucket.openUploadStream(
      uid + path.extname(req.file.originalname)
    );
    uploadStream.end(req.file.buffer, async (err) => {
      if (err) return res.status(500).json({ error: "Upload error" });
      // Save the file id reference in user profile
      await usersCollection.updateOne(
        { uid },
        { $set: { photoId: uploadStream.id } }
      );
      res.json({ message: "Profile photo uploaded" });
    });
  } catch (err) {
    console.error("Profile photo upload error:", err);
    res.status(500).json({ error: "Server error uploading photo" });
  }
});
// Get profile photo by UID
app.get("/api/profile-photo/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ uid });
    if (!user || !user.photoId) {
      // No picture? Return a default placeholder image instead.
      // You can also just send 404 or a redirect to a static resource.
      return res.status(404).send("No photo");
    }
    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(
      new ObjectId(user.photoId)
    );
    res.set("Content-Type", "image/jpeg"); // Set content-type or detect from DB
    downloadStream.pipe(res);
  } catch (err) {
    console.error("Profile photo get error:", err);
    res.status(500).send("Failed to fetch photo");
  }
});

//! post save or update profile
app.post("/api/profile", async (req, res) => {
  console.log("🔥 POST /api/profile hit:", req.body);

  const { uid, email, firstName, lastName, netID } = req.body;

  if (!uid || !email) {
    return res
      .status(400)
      .json({ error: "Missing required fields: uid or email" });
  }

  try {
    const db = client.db("RUHousing");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ uid });

    if (existingUser) {
      await usersCollection.updateOne(
        { uid },
        { $set: { firstName, lastName, email, netID } }
      );
      return res.json({ message: "✅ Profile updated" });
    }

    await usersCollection.insertOne({ uid, email, firstName, lastName });
    res.json({ message: "✅ Profile created" });
  } catch (error) {
    console.error("❌ Error saving profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});
//! GET, retrieve profile by UID
app.get("/api/profile", async (req, res) => {
  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: "UID is required" });
  }

  try {
    const db = client.db("RUHousing");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// ------------ Submit user preferences form ----------- //
app.post("/api/submit-preferences", async (req, res) => {
  const {
    first_name,
    last_name,
    graduation_year,
    graduation_year_importance,
    major,
    major_importance,
    preferred_location,
    preferred_location_importance,
    duration_of_stay,
    duration_of_stay_importance,
    allergies,
    allergies_importance,
    has_pets,
    has_pets_importance,
    cooking_frequency,
    cooking_frequency_importance,
    sleep_schedule,
    sleep_schedule_importance,
    study_habits,
    study_habits_importance,
    cleanliness,
    cleanliness_importance,
    userId,
    gender,
    gender_importance,
    self_description,
  } = req.body;

  if (!db) {
    return res
      .status(500)
      .json({ error: "Database connection not established." });
  }

  try {
    const roommatePreferencesCollection = db.collection("roommate_preferences");
    const result = await roommatePreferencesCollection.insertOne({
      userId,
      first_name: first_name ? first_name.trim() : "",
      last_name: last_name ? last_name.trim() : "",
      graduation_year: graduation_year ? graduation_year.trim() : "",
      graduation_year_importance: graduation_year_importance
        ? graduation_year_importance.trim()
        : "not important",
      major: major ? major.trim() : "",
      major_importance: major_importance
        ? major_importance.trim()
        : "not important",
      preferred_location: preferred_location ? preferred_location.trim() : "",
      preferred_location_importance: preferred_location_importance
        ? preferred_location_importance.trim()
        : "not important",
      duration_of_stay: duration_of_stay ? duration_of_stay.trim() : "",
      duration_of_stay_importance: duration_of_stay_importance
        ? duration_of_stay_importance.trim()
        : "not important",
      allergies: allergies ? allergies.trim() : "",
      allergies_importance: allergies_importance
        ? allergies_importance.trim()
        : "not important",
      has_pets: has_pets ? has_pets.trim() : "",
      has_pets_importance: has_pets_importance
        ? has_pets_importance.trim()
        : "not important",
      cooking_frequency: cooking_frequency ? cooking_frequency.trim() : "",
      cooking_frequency_importance: cooking_frequency_importance
        ? cooking_frequency_importance.trim()
        : "not important",
      sleep_schedule: sleep_schedule ? sleep_schedule.trim() : "",
      sleep_schedule_importance: sleep_schedule_importance
        ? sleep_schedule_importance.trim()
        : "not important",
      study_habits: study_habits ? study_habits.trim() : "",
      study_habits_importance: study_habits_importance
        ? study_habits_importance.trim()
        : "not important",
      cleanliness: cleanliness ? cleanliness.trim() : "",
      cleanliness_importance: cleanliness_importance
        ? cleanliness_importance.trim()
        : "not important",
      gender: gender ? gender.trim() : "",
      gender_importance: gender_importance
        ? gender_importance.trim()
        : "not important",
      self_description: req.body.self_description
        ? req.body.self_description.trim()
        : "",
    });

    console.log(
      "Preferences stored successfully. Inserted ID:",
      result.insertedId
    );
    res.status(200).json({ message: "Preferences submitted successfully!" });
  } catch (error) {
    console.error("Error storing preferences:", error);
    res.status(500).json({ error: "Failed to store preferences." });
  }
});

// ------------ Matching Profiles ----------- //Part 2
app.post("/api/matched-profiles", async (req, res) => {
  const userPreferences = req.body;
  const userId = userPreferences.userId;

  if (!db) {
    return res
      .status(500)
      .json({ error: "Database connection not established." });
  }

  try {
    const roommatePreferencesCollection = db.collection("roommate_preferences");
    const usersCollection = db.collection("users");
    const potentialMatches = await roommatePreferencesCollection
      .find({
        userId: { $ne: userId },
      })
      .toArray();

    const matchedProfilesWithLevel = [];

    // Function to get the weight based on importance level
    const getWeight = (importance) => {
      switch (importance) {
        case "very important":
          return 3;
        case "important":
          return 2;
        case "not important":
          return 1;
        default:
          return 1; 
      }
    };

    let matchScore = 0;

    for (const profile of potentialMatches) {
      const trimmedUserPreferences = {
        first_name: userPreferences.first_name
          ? userPreferences.first_name.trim()
          : "",
        last_name: userPreferences.last_name
          ? userPreferences.last_name.trim()
          : "",
        graduation_year: userPreferences.graduation_year
          ? userPreferences.graduation_year.trim()
          : "",
        major: userPreferences.major ? userPreferences.major.trim() : "",
        preferred_location: userPreferences.preferred_location
          ? userPreferences.preferred_location.trim()
          : "",
        duration_of_stay: userPreferences.duration_of_stay
          ? userPreferences.duration_of_stay.trim()
          : "",
        allergies: userPreferences.allergies
          ? userPreferences.allergies.trim()
          : "",
        has_pets: userPreferences.has_pets
          ? userPreferences.has_pets.trim()
          : "",
        cooking_frequency: userPreferences.cooking_frequency
          ? userPreferences.cooking_frequency.trim()
          : "",
        sleep_schedule: userPreferences.sleep_schedule
          ? userPreferences.sleep_schedule.trim()
          : "",
        study_habits: userPreferences.study_habits
          ? userPreferences.study_habits.trim()
          : "",
        cleanliness: userPreferences.cleanliness
          ? userPreferences.cleanliness.trim()
          : "",
        gender: userPreferences.gender ? userPreferences.gender.trim() : "",
        self_description: userPreferences.self_description
          ? userPreferences.self_description.trim()
          : "",
      };

      const trimmedProfile = {
        ...profile,
        first_name: profile.first_name ? profile.first_name.trim() : "",
        last_name: profile.last_name ? profile.last_name.trim() : "",
        graduation_year: profile.graduation_year
          ? profile.graduation_year.trim()
          : "",
        major: profile.major ? profile.major.trim() : "",
        preferred_location: profile.preferred_location
          ? profile.preferred_location.trim()
          : "",
        duration_of_stay: profile.duration_of_stay
          ? profile.duration_of_stay.trim()
          : "",
        allergies: profile.allergies ? profile.allergies.trim() : "",
        has_pets: profile.has_pets ? profile.has_pets.trim() : "",
        cooking_frequency: profile.cooking_frequency
          ? profile.cooking_frequency.trim()
          : "",
        sleep_schedule: profile.sleep_schedule
          ? profile.sleep_schedule.trim()
          : "",
        study_habits: profile.study_habits ? profile.study_habits.trim() : "",
        cleanliness: profile.cleanliness ? profile.cleanliness.trim() : "",
        gender: profile.gender ? profile.gender.trim() : "",
      };

      const maxPossibleScore =
        getWeight(userPreferences.graduation_year_importance) +
        getWeight(userPreferences.major_importance) +
        getWeight(userPreferences.preferred_location_importance) +
        getWeight(userPreferences.duration_of_stay_importance) +
        getWeight(userPreferences.allergies_importance) +
        getWeight(userPreferences.has_pets_importance) +
        getWeight(userPreferences.cooking_frequency_importance) +
        getWeight(userPreferences.sleep_schedule_importance) +
        getWeight(userPreferences.study_habits_importance) +
        getWeight(userPreferences.cleanliness_importance) +
        getWeight(userPreferences.gender_importance);

      if (
        trimmedProfile.graduation_year ===
        trimmedUserPreferences.graduation_year
      ) {
        matchScore += getWeight(userPreferences.graduation_year_importance);
      }
      if (trimmedProfile.major === trimmedUserPreferences.major) {
        matchScore += getWeight(userPreferences.major_importance);
      }
      if (
        trimmedProfile.preferred_location ===
        trimmedUserPreferences.preferred_location
      ) {
        matchScore += getWeight(userPreferences.preferred_location_importance);
      }
      if (
        trimmedProfile.duration_of_stay ===
        trimmedUserPreferences.duration_of_stay
      ) {
        matchScore += getWeight(userPreferences.duration_of_stay_importance);
      }
      if (trimmedProfile.allergies === trimmedUserPreferences.allergies) {
        matchScore += getWeight(userPreferences.allergies_importance);
      }
      if (trimmedProfile.has_pets === trimmedUserPreferences.has_pets) {
        matchScore += getWeight(userPreferences.has_pets_importance);
      }
      if (
        trimmedProfile.cooking_frequency ===
        trimmedUserPreferences.cooking_frequency
      ) {
        matchScore += getWeight(userPreferences.cooking_frequency_importance);
      }
      if (
        trimmedProfile.sleep_schedule === trimmedUserPreferences.sleep_schedule
      ) {
        matchScore += getWeight(userPreferences.sleep_schedule_importance);
      }
      if (trimmedProfile.study_habits === trimmedUserPreferences.study_habits) {
        matchScore += getWeight(userPreferences.study_habits_importance);
      }
      if (trimmedProfile.cleanliness === trimmedUserPreferences.cleanliness) {
        matchScore += getWeight(userPreferences.cleanliness_importance);
      }
      if (
        trimmedProfile.gender === trimmedUserPreferences.gender ||
        trimmedUserPreferences.gender === "Any"
      ) {
        matchScore += getWeight(userPreferences.gender_importance);
      }

      let matchLevel = "Fair Match"; 
      const bestMatchThreshold = maxPossibleScore * 0.8; // 80% or higher
      const goodMatchThreshold = maxPossibleScore * 0.5; // 50% or higher

      if (matchScore >= bestMatchThreshold) {
        matchLevel = "Best Match";
      } else if (matchScore >= goodMatchThreshold) {
        matchLevel = "Good Match";
      }
      const matchedUser = await usersCollection.findOne({
        userId: profile.userId,
      });
      const photoId = matchedUser ? matchedUser.photoId : null;

      matchedProfilesWithLevel.push({
        ...profile,
        matchLevel,
        matchScore,
        photoId,
      }); 
    }

    // Sort profiles by match score (descending from best to good percentages)
    matchedProfilesWithLevel.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(matchedProfilesWithLevel);
  } catch (error) {
    console.error("Error fetching and matching profiles:", error);
    res.status(500).json({ error: "Failed to fetch and match profiles." });
  }
});

// ------------ Reporting Issue Form ----------- //
app.post("/api/report-issue", async (req, res) => {
  const { name, ruid, issue } = req.body;

  if (!name || !ruid || !issue) {
    return res
      .status(400)
      .json({ error: "Please provide your name, RUID, and the issue." });
  }

  try {
    const complaintsCollection = db.collection("complaints"); 
    const result = await complaintsCollection.insertOne({
      name: name.trim(),
      ruid: ruid.trim(),
      issue: issue.trim(),
      timestamp: new Date(),
    });

    console.log(
      "Issue reported successfully. Inserted ID:",
      result.insertedId,
      'saved to "complaints"'
    );
    res.status(200).json({ message: "Issue reported successfully!" });
  } catch (error) {
    console.error("Error reporting issue:", error);
    res.status(500).json({ error: "Failed to report issue." });
  }
});


// ------------ Save a chat message ----------- //
app.post("/api/chat", async (req, res) => {
  if (!db) {
    return res
      .status(500)
      .json({ error: "Database connection not established." });
  }

  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
    return res
      .status(400)
      .json({ error: "Missing sender, receiver, or message" });
  }

  try {
    const chatsCollection = db.collection("chats");
    const newMessage = {
      senderId,
      receiverId,
      message,
      timestamp: new Date(),
    };

    const result = await chatsCollection.insertOne(newMessage);
    res
      .status(200)
      .json({ message: "Chat saved successfully!", chatId: result.insertedId });
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ error: "Failed to save chat." });
  }
});

// -- Get chat history between two users --- //
app.get("/api/chat", async (req, res) => {
  if (!db) {
    return res
      .status(500)
      .json({ error: "Database connection not established." });
  }

  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Both user IDs are required" });
  }

  try {
    const chatsCollection = db.collection("chats");
    const chatHistory = await chatsCollection
      .find({
        $or: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray();

    res.status(200).json(chatHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});

//!chat ends
//!get all users
// Get all users (for Find Users page)
app.get("/api/all-users", async (req, res) => {
  try {
    const usersCollection = db.collection("users");
    const users = await usersCollection.find().toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

app.get("/", (req, res) => {
  res.send("Hello from the RUHousing Express server!");
});

// ---------- Login Routes ----------- //
app.post("/user", async (req, res) => {
  const { uid, email, firstName, lastName, netID, photoURL } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: "Missing UID or email" });
  }

  try {
    const db = client.db("RUHousing");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ uid });

    if (existingUser) {
      await usersCollection.updateOne(
        { uid },
        { $set: { firstName, lastName, netID, photoURL, email } }
      );
      return res.json({ message: "✅ Profile updated" });
    }

    await usersCollection.insertOne({
      uid,
      email,
      firstName,
      lastName,
      netID,
      photoURL,
    });
    res.json({ message: "✅ Profile created" });
  } catch (err) {
    console.error("❌ Error saving profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/user/:userId", async (req, res) => {
  const { uid } = req.query;

  if (!uid) return res.status(400).json({ error: "UID is required" });

  try {
    const db = client.db("RUHousing");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ uid });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});
//! get chats for new chatpage
app.get("/api/chat/rooms", async (req, res) => {
  const { userId } = req.query;

  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const chatsCollection = db.collection("chats");
    const usersCollection = db.collection("users");

    const sent = await chatsCollection.distinct("receiverId", {
      senderId: userId,
    });
    const received = await chatsCollection.distinct("senderId", {
      receiverId: userId,
    });
    const allUserIds = Array.from(new Set([...sent, ...received])).filter(
      (id) => id !== userId
    );

    const chatRooms = [];

    for (const uid of allUserIds) {
      const lastMessage = await chatsCollection.findOne(
        {
          $or: [
            { senderId: userId, receiverId: uid },
            { senderId: uid, receiverId: userId },
          ],
        },
        { sort: { timestamp: -1 }, projection: { message: 1, timestamp: 1 } }
      );

      const userProfile = await usersCollection.findOne({ uid });

      if (userProfile) {
        chatRooms.push({
          ...userProfile,
          lastMessage: lastMessage?.message || "",
          lastMessageTime: lastMessage?.timestamp || new Date(0),
        });
      }
    }

    chatRooms.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
    res.json(chatRooms);
  } catch (error) {
    console.error("Error in chat rooms:", error);
    res.status(500).json({ error: "Failed to fetch chat rooms." });
  }
});

const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/api/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const fileName = uuidv4() + path.extname(req.file.originalname);
    const filePath = path.join(__dirname, "uploads", fileName);

    fs.writeFileSync(filePath, req.file.buffer);

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

    res.json({ imageUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Server error uploading image" });
  }
});
// post say hello!
app.post("/api/send-message", async (req, res) => {
  const { senderId, recipientId, content } = req.body;

  if (!senderId || !recipientId || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const chatsCollection = db.collection("chats"); // 
    const newMessage = {
      senderId,
      receiverId: recipientId,
      message: content,
      timestamp: new Date(),
    };

    await chatsCollection.insertOne(newMessage); // 
    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("sendMessage", (data) => {
    socket.broadcast.emit("receiveMessage", data);
    io.emit("messageSent", {
      senderId: data.senderId,
      receiverId: data.receiverId,
    }); // NEW
  });

  // Add these two handlers for typing
  socket.on("typing", ({ to, from }) => {
    io.emit("typing", { to, from });
  });

  socket.on("stopTyping", ({ to, from }) => {
    io.emit("stopTyping", { to, from });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(
    `🚀 WebSocket + Express server running at http://localhost:${PORT}`
  );
});
