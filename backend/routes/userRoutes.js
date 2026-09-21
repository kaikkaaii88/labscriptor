const express = require("express");
const router = express.Router();

router.get("/:email", async function (req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const email = req.params.email;

        const { data, error } =
            await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .single();

        if (error) {
            console.error(
                "Supabase error:",
                error
            );

            return res.status(404).json({
                message: "User not found",
                error: error.message
            });
        }

        res.json({
            message: "User retrieved successfully",
            user: data
        });

    } catch (error) {
        console.error(
            "Server error:",
            error
        );

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;