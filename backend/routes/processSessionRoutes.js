// REQUIRE MODULES

const express = require("express");


// CREATE ROUTER

const router = express.Router();


// DEFINE ROUTES

router.post("/", async function (req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const userId = req.body.user_id;
        const processName = req.body.process_name;
        const description = req.body.description;
        const startTime = req.body.start_time;
        const status = req.body.status;


        if (!userId || !processName) {
            return res.status(400).json({
                message: "user_id and process_name are required"
            });
        }


        const { data, error } = await supabase
            .from("process_sessions")
            .insert([
                {
                    user_id: userId,
                    process_name: processName,
                    description: description,
                    start_time: startTime,
                    status: status || "active"
                }
            ])
            .select()
            .single();


        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                message: "Failed to create process session",
                error: error.message
            });
        }


        res.status(201).json({
            message: "Process session created successfully",
            process_session: data
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


router.get("/", async function (req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const { data, error } = await supabase
            .from("process_sessions")
            .select("*")
            .order("session_id", { ascending: false });

        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                message: "Failed to retrieve process sessions",
                error: error.message
            });
        }

        res.json({
            message: "Process sessions retrieved successfully",
            process_sessions: data
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});



router.get("/:id", async function (req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const sessionId = req.params.id;

        const { data, error } = await supabase
            .from("process_sessions")
            .select("*")
            .eq("session_id", sessionId)
            .single();

        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                message: "Failed to retrieve process session",
                error: error.message
            });
        }

        res.json({
            message: "Process session retrieved successfully",
            process_session: data
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// UPDATE PROCESS SESSION

router.patch("/:id", async function (req, res) {

    try {

        const supabase =
            req.app.locals.supabase;

        const sessionId =
            req.params.id;

        const endTime =
            req.body.end_time;

        const status =
            req.body.status;


        if (!endTime || !status) {

            return res.status(400).json({
                message: "end_time and status are required"
            });

        }


        const { data, error } =
            await supabase
                .from("process_sessions")
                .update({
                    end_time: endTime,
                    status: status
                })
                .eq("session_id", sessionId)
                .select()
                .single();


        if (error) {

            console.error(
                "Supabase error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to update process session",
                error: error.message
            });

        }


        res.json({
            message:
                "Process session updated successfully",
            process_session: data
        });

    } catch (error) {

        console.error(
            "Server error:",
            error
        );

        res.status(500).json({
            message:
                "Internal server error"
        });

    }

});

// EXPORT ROUTER

module.exports = router;