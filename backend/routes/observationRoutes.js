// REQUIRE MODULES

const express = require("express");


// CREATE ROUTER

const router = express.Router();


// DEFINE ROUTES


// CREATE OBSERVATION

router.post("/", async function (req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const sessionId = req.body.session_id;
        const observation = req.body.observation;
        const recordedAt = req.body.recorded_at || new Date().toISOString();


        if (!sessionId || !observation) {
            return res.status(400).json({
                message: "session_id and observation are required"
            });
        }


        const { data, error } = await supabase
            .from("observations")
            .insert([
                {
                    session_id: sessionId,
                    observation: observation,
                    recorded_at: recordedAt
                }
            ])
            .select()
            .single();


        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                message: "Failed to create observation",
                error: error.message
            });
        }


        res.status(201).json({
            message: "Observation created successfully",
            observation: data
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// GET OBSERVATIONS FOR A SESSION

router.get("/:sessionId", async function (req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const sessionId = req.params.sessionId;


        const { data, error } = await supabase
            .from("observations")
            .select("*")
            .eq("session_id", sessionId)
            .order("recorded_at", { ascending: true });


        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                message: "Failed to retrieve observations",
                error: error.message
            });
        }


        res.json({
            message: "Observations retrieved successfully",
            observations: data
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// EXPORT ROUTER

module.exports = router;