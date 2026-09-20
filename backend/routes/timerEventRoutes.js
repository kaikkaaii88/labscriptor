// REQUIRE MODULES

const express = require("express");


// CREATE ROUTER

const router = express.Router();


// DEFINE ROUTES


// CREATE TIMER EVENT

router.post("/", async function (req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const sessionId = req.body.session_id;
        const eventType = req.body.event_type;
        const eventTime = req.body.event_time || new Date().toISOString();


        if (!sessionId || !eventType) {
            return res.status(400).json({
                message: "session_id and event_type are required"
            });
        }


        const { data, error } = await supabase
            .from("timer_events")
            .insert([
                {
                    session_id: sessionId,
                    event_type: eventType,
                    event_time: eventTime
                }
            ])
            .select()
            .single();


        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                message: "Failed to create timer event",
                error: error.message
            });
        }


        res.status(201).json({
            message: "Timer event created successfully",
            timer_event: data
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// GET TIMER EVENTS FOR A SESSION

router.get("/:sessionId", async function (req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const sessionId = req.params.sessionId;


        const { data, error } = await supabase
            .from("timer_events")
            .select("*")
            .eq("session_id", sessionId)
            .order("event_time", { ascending: true });


        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                message: "Failed to retrieve timer events",
                error: error.message
            });
        }


        res.json({
            message: "Timer events retrieved successfully",
            timer_events: data
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