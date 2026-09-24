// REQUIRE MODULES
const express = require("express");

// CREATE ROUTER
const router = express.Router();

// DEFINE ROUTES

// CREATE OBSERVATION
router.post("/", async function(req, res) {
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
            console.error("Create observation error:", error);

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
        console.error("Create observation error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// GET OBSERVATIONS FOR SESSION
router.get("/:sessionId", async function(req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const sessionId = req.params.sessionId;

        const { data, error } = await supabase
            .from("observations")
            .select("*")
            .eq("session_id", sessionId)
            .order("recorded_at", {
                ascending: true
            });

        if (error) {
            console.error("Get observations error:", error);

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
        console.error("Get observations error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// UPDATE OBSERVATION
router.patch("/:observationId", async function(req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const observationId = req.params.observationId;
        const observation = req.body.observation;

        if (!observation || !observation.trim()) {
            return res.status(400).json({
                message: "Observation is required"
            });
        }

        const { data, error } = await supabase
            .from("observations")
            .update({
                observation: observation.trim()
            })
            .eq("observation_id", observationId)
            .select()
            .single();

        if (error) {
            console.error("Update observation error:", error);

            return res.status(500).json({
                message: "Failed to update observation",
                error: error.message
            });
        }

        res.json({
            message: "Observation updated successfully",
            observation: data
        });
    } catch (error) {
        console.error("Update observation error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// EXPORT ROUTER
module.exports = router;