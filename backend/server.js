// REQUIRE MODULES

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const processSessionRoutes = require("./routes/processSessionRoutes");
const observationRoutes = require("./routes/observationRoutes");
const timerEventRoutes = require("./routes/timerEventRoutes");
const userRoutes = require("./routes/userRoutes");
const imageRoutes = require("./routes/imageRoutes");


// CREATE APP

const app = express();

app.use(cors());

app.use(express.json());


// SERVE FRONTEND

const frontendPath = path.join(
    __dirname,
    "..",
    "frontend"
);

app.use(
    express.static(frontendPath)
);


// CREATE SUPABASE CLIENT

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);


// STORE SUPABASE CLIENT

app.locals.supabase = supabase;


// DEFINE ROOT ROUTE

app.get("/", function (req, res) {

    res.sendFile(
        "index.html",
        {
            root: path.join(
                frontendPath,
                "html"
            )
        }
    );

});


// DEFINE API ROUTES

app.get("/api/test", function (req, res) {

    res.json({
        message: "LabScriptor backend is working"
    });

});


app.get("/api/test-database", async function (req, res) {

    const { data, error } = await supabase
        .from("users")
        .select("*");

    if (error) {

        console.error(
            "Supabase error:",
            error
        );

        return res.status(500).json({
            message: "Failed to connect to Supabase",
            error: error.message
        });

    }

    res.json({
        message: "Supabase connection is working",
        users: data
    });

});


app.use(
    "/api/process-sessions",
    processSessionRoutes
);

app.use(
    "/api/observations",
    observationRoutes
);

app.use(
    "/api/timer-events",
    timerEventRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/images",
    imageRoutes
);


// START SERVER

const PORT = 3000;

app.listen(
    PORT,
    function () {

        console.log(
            "LabScriptor running on port " + PORT
        );

    }
);