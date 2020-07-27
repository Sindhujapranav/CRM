const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const objectID = mongodb.ObjectID;

const dbURL = "mongodb+srv://Sindhuja:SWqUqvaBsuBcLmlf@cluster0.milcm.mongodb.net/CRM?retryWrites=true&w=majority"
const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 4000;




app.listen(port, () => console.log("your app is running in", port));

app.post("/register", (req, res) => {

    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db("CRM");
        db.collection("employees").findOne({ username: req.body.username }, (err, data) => {
            if (err) throw err;
            if (data) {
                res.status(400).json({ message: "Email already exists..!!" });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, cryptPassword) => {
                        if (err) throw err;
                        req.body.password = cryptPassword;
                        db.collection("employees").insertOne(req.body, (err, result) => {
                            if (err) throw err;
                            client.close();
                            res
                                .status(200)
                                .json({ message: " Employee Registration successful..!! " });
                        });
                    });
                });
            }
        });
    });
});


app.get("/register", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db("CRM");
        db.collection("employees")
            .find()
            .toArray()
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                res.status(404).json({
                    message: "No data Found or some error happen",
                    error: err,
                });
            });
    });
});

app.post("/login", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        client
            .db("CRM")
            .collection("employees")
            .findOne({ username: req.body.username }, (err, data) => {
                if (err) throw err;
                if (data) {
                    if (data.type == "Employee") {
                        bcrypt.compare(req.body.password, data.password, (err, validUser) => {
                            if (err) throw err;
                            if (validUser) {
                                jwt.sign(
                                    { userId: data._id, email: data.email },
                                    "uzKfyTDx4v5z6NSV",
                                    { expiresIn: "1h" },
                                    (err, token) => {
                                        res.status(200).json({ message: " Employee Login success..!!", token });
                                    }
                                );
                            } else {
                                res
                                    .status(403)
                                    .json({ message: "Unauthorized Login....!! Only Employees are allowed to login here" });
                            }
                        });
                    }
                    if (data.type == "manager") {
                        bcrypt.compare(req.body.password, data.password, (err, validUser) => {
                            if (err) throw err;
                            if (validUser) {
                                jwt.sign(
                                    { userId: data._id, email: data.email },
                                    "uzKfyTDx4v5z6NSV",
                                    { expiresIn: "1h" },
                                    (err, token) => {
                                        res.status(200).json({ message: " Manager Login success..!!", token });
                                    }
                                );
                            } else {
                                res
                                    .status(403)
                                    .json({ message: "Unauthorized Login....!!Only managers are allowed to login" });
                            }
                        });
                    }
                }

                else {
                    res.status(401).json({
                        message: "Email is not registered, Kindly register..!!",
                    });
                }

            });
    });
});



app.post("/service/:username", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db("CRM");
        db.collection("employees").findOne(
            { username: req.params.username },
            (err, data) => {
                if (err) throw err;
                if (data.type == "Employee") {
                    res.status(400).json({ message: "employee not allowed to create service..!!" });
                } else {

                    db.collection("service").insertOne(req.body, (err, result) => {
                        if (err) throw err;
                        client.close();
                        res
                            .status(200)
                            .json({ message: " service created successfully..!! " });
                    });


                }
            }
        );
    });
});


app.get("/service", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db("CRM");
        db.collection("service")
            .find()
            .toArray()
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                res.status(404).json({
                    message: "No data Found or some error happen",
                    error: err,
                });
            });
    });
});


app.put("/service/:username/:id", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db("CRM");
        db.collection("employees").findOne(
            { username: req.params.username },
            (err, data) => {
                if (err) throw err;
                if (data.username === "nivas@gmail.com") {
                    db.collection("service")
                        .findOneAndUpdate({ _id: objectID(req.params.id) }, { $set: req.body })
                        .then((data) => {
                            console.log("Service update successfully..!!");
                            client.close();
                            res.status(200).json({
                                message: "Service updated..!!",
                            });
                        });
                }
                else {
                    res.status(400).json({ message: " you are not allowed to update a service..!!" });
                }
            }
        );
    });
});


app.delete("/service/:username/:id", (req, res) => {
    mongoClient.connect(dbURL, (err, client) => {
        if (err) throw err;
        let db = client.db("CRM");
        db.collection("employees").findOne(
            { username: req.params.username },
            (err, data) => {
                if (err) throw err;
                if (data.username === "nivas@gmail.com") {
                    db.collection("service")
                        .deleteOne({ _id: objectID(req.params.id) }, { $set: req.body })
                        .then((data) => {
                            console.log("Service deleted successfully..!!");
                            client.close();
                            res.status(200).json({
                                message: "Service deleted..!!",
                            });
                        });
                }
                else {
                    res.status(400).json({ message: " you are not allowed to update a service..!!" });
                }
            }
        );
    });
});
