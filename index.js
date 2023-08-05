const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
//multer for file
const multer = require("multer");
const { ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("uploads"));

const uri = `mongodb+srv://filmmonks001:b7L9ymptKqX3xljB@cluster0.evset20.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads/home");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const teamImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/team"); // Specify the destination directory for team images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename for each team image
  },
});
const AboutImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/about");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const monksGalaryImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/monks");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const timelineImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/timeline");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// files of multer
const upload = multer({ storage });
const teamImageUpload = multer({ storage: teamImageStorage });
const aboutImageUpload = multer({ storage: AboutImageStorage });
const monksGalaryImageUpload = multer({ storage: monksGalaryImageStorage });
const timeLineImageUpload = multer({ storage: timelineImageStorage });
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    /*..........................................
      ..................here is all the collection.........................
        ................................................*/

    const teamsCollection = client.db("team").collection("teamdb");
    const showreelCollection = client.db("showreel").collection("showreeldb");
    const workTimeLineCollection = client
      .db("workTimeline")
      .collection("workTimelinedb");
    const aboutCollection = client.db("about").collection("aboutdb");
    const homeCollection = client.db("home").collection("homedb");
    const galaryCollection = client.db("galary").collection("galarydb");

    /*..........................................
      .................. Home.........................
        ................................................*/
    // get for the cover home
    app.get("/upload", async (req, res) => {
      const result = await homeCollection.find().toArray();
      res.send(result);
    });

    // get one for the cover
    app.get("/upload/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await homeCollection.findOne(query);
      res.send(result);
    });
    // post for the cover home
    app.post("/upload", upload.array("files"), async (req, res) => {
      const uploadedFiles = req.files;
      const filesArray = uploadedFiles.map((file, index) => ({
        id: index + 1,
        pathname: file.filename,
      }));

      console.log(filesArray);

      // Process the file as needed
      const result = await homeCollection.insertOne({ path: filesArray });
      console.log(result);
      res.send(result);
    });
    // delete api for cover
    app.delete("/upload/:id", async (req, res) => {
      console.log("delete is called");
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await homeCollection.deleteOne(query);
      res.send(result);
    });

    /* ..................About .........................
        ................................................*/

    // get all the about
    app.get("/api/about", async (req, res) => {
      const result = await aboutCollection.find().toArray();
      res.send(result);
    });

    // get one item
    app.get("/api/about/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await aboutCollection.findOne(query);
      res.send(result);
    });

    // post api for about
    app.post(
      "/api/about",
      aboutImageUpload.single("about"),
      async (req, res) => {
        try {
          const AboutData = {
            image: req.file.filename,
            description: req.body.description,
          };

          const result = await aboutCollection.insertOne(AboutData);
          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send("Error adding Data");
        }
      }
    );

    //delete api for about
    app.delete("/api/about/:id", async (req, res) => {
      console.log("delete is called");
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await aboutCollection.deleteOne(query);
      res.send(result);
    });

    //put api for about

    app.put("/api/about/:id", async (req, res) => {
      const id = req.params.id;
      const aboutData = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: aboutData,
      };
      const result = await aboutCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });

    /*..........................................
      ..................Monks galary Data.........................
        ................................................*/

    app.get("/api/monks-galary", async (req, res) => {
      const result = await galaryCollection.find().toArray();
      res.send(result);
    });

    // get one item monks-galary
    app.get("/api/monks-galary/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await galaryCollection.findOne(query);
      res.send(result);
    });

    // post api for monks-galary
    app.post(
      "/api/monks-galary",
      monksGalaryImageUpload.single("monks-galary"),
      async (req, res) => {
        try {
          const galaryData = {
            image: req.file.filename,
          };

          const result = await galaryCollection.insertOne(galaryData);
          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send("Error adding Data");
        }
      }
    );

    // delete api for monks galary
    app.delete("/api/monks-galary/:id", async (req, res) => {
      console.log("delete is called");
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await galaryCollection.deleteOne(query);
      res.send(result);
    });

    /*..........................................
      ..................Teams Data.........................
        ................................................*/

    // get all the teams
    app.get("/api/teams", async (req, res) => {
      const result = await teamsCollection.find().toArray();

      res.send(result);
    });

    // get one item
    app.get("/api/teams/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await teamsCollection.findOne(query);
      res.send(result);
    });

    // post api for team
    app.post(
      "/api/teams",
      teamImageUpload.single("image"),
      async (req, res) => {
        try {
          const teamMember = {
            image: req.file.filename,
            title: req.body.title,
            email: req.body.email,
            fb_link: req.body.fb_link,
            linkedin: req.body.linkedin,
            name: req.body.name,
          };

          const result = await teamsCollection.insertOne(teamMember);
          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send("Error adding team member");
        }
      }
    );

    //delete api for teams
    app.delete("/api/teams/:id", async (req, res) => {
      console.log("deletw is called");
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await teamsCollection.deleteOne(query);
      res.send(result);
    });

    //put api for teams

    app.put("/api/teams/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      console.log(user);
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await teamsCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });

    /*..........................................
      .................. show reels.........................
        ................................................*/

    // get all the showreels link
    app.get("/api/showreels-link", async (req, res) => {
      const result = await showreelCollection.find().toArray();
      res.send(result);
    });

    // get one item
    app.get("/api/showreels-link/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await showreelCollection.findOne(query);
      res.send(result);
    });

    // post all the showreels link
    app.post("/api/showreels-link", async (req, res) => {
      const showreel = req.body;
      const result = await showreelCollection.insertOne(showreel);
      res.send(result);
    });

    //delete api for showreels link
    app.delete("/api/showreels-link/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await showreelCollection.deleteOne(query);
      res.send(result);
    });

    //put api for showreels link

    app.put("/api/showreels-link/:id", async (req, res) => {
      const id1 = req.params._id;
      console.log(id1);
      const item = req.body;
      const id = item._id;
      console.log(item._id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: item,
      };
      const result = await showreelCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("successfully edit");
      res.send(result);
    });

    /*..........................................
      .................. Work Timeline.........................
        ................................................*/

    // get all the work-timeline link
    app.get("/api/work-timeline", async (req, res) => {
      const result = await workTimeLineCollection.find().toArray();
      res.send(result);
    });

    // get one item
    app.get("/api/work-timeline/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await workTimeLineCollection.findOne(query);
      res.send(result);
    });

    // post all the work-timeline link
    app.post(
      "/api/work-timeline",
      timeLineImageUpload.single("timeline"),
      async (req, res) => {
        try {
          const timelineData = {
            image: req.file.filename,
            headline: req.body.headline,
            content: req.body.content,
            type: req.body.type,
            director: req.body.director,
            year: req.body.year,
            producer: req.body.producer,
            language: req.body.language,
            writer: req.body.writer,
            videoLink: req.body.videoLink,
          };

          const result = await workTimeLineCollection.insertOne(timelineData);
          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send("Error adding timeline Data");
        }
      }
    );

    //delete api for worktimeline link
    app.delete("/api/work-timeline/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await workTimeLineCollection.deleteOne(query);
      res.send(result);
    });

    //put api for worktimeline link

    app.put("/api/work-timeline/:id", async (req, res) => {
      const id = req.params.id;
      const timeLineData = req.body;
      console.log(req.body, id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: timeLineData,
      };
      const result = await workTimeLineCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// app.patch("/api/teams/:id", (req, res) => {
//   console.log("post method calle d");
//   const team = req.body;
//   console.log(team);
// });
// app.delete("/api/teams/:id", (req, res) => {
//   console.log("post method calle d");
//   const team = req.body;
//   console.log(team);
// });

app.listen(port, () => {
  console.log(` server is running on port${port}`);
});
