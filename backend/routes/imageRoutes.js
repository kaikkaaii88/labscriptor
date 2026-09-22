// REQUIRE MODULES

const express = require("express");
const multer = require("multer");

// CREATE ROUTER

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// DEFINE ROUTES

router.post("/", upload.single("image"), async function (req, res) {
    try {
        const supabase = req.app.locals.supabase;

        if (!req.file) {
            return res.status(400).json({
                message: "No image file was provided"
            });
        }

        const sessionId = req.body.session_id;

        if (!sessionId) {
            return res.status(400).json({
                message: "session_id is required"
            });
        }

        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({
                message: "Only image files are allowed"
            });
        }

        const originalFileName =
            req.file.originalname;

        const fileExtension =
            originalFileName.includes(".")
                ? originalFileName.substring(
                    originalFileName.lastIndexOf(".")
                )
                : "";

        const uniqueFileName =
            Date.now() +
            "-" +
            Math.random().toString(36).substring(2, 10) +
            fileExtension;

        const filePath =
            sessionId +
            "/" +
            uniqueFileName;

        const { error: storageError } =
            await supabase
                .storage
                .from("experiment-images")
                .upload(
                    filePath,
                    req.file.buffer,
                    {
                        contentType:
                            req.file.mimetype,

                        upsert: false
                    }
                );

        if (storageError) {
            console.error(
                "Supabase Storage error:",
                storageError
            );

            return res.status(500).json({
                message:
                    "Failed to store image",
                error:
                    storageError.message
            });
        }

        const { data, error } =
            await supabase
                .from("images")
                .insert([
                    {
                        session_id: sessionId,
                        file_name:
                            originalFileName,
                        file_path:
                            filePath
                    }
                ])
                .select()
                .single();

        if (error) {
            console.error(
                "Supabase database error:",
                error
            );

            return res.status(500).json({
                message:
                    "Image stored but database record could not be created",
                error:
                    error.message
            });
        }

        res.status(201).json({
            message:
                "Image uploaded successfully",
            image: data
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

// GET IMAGES FOR A PROCESS SESSION

router.get("/:sessionId", async function (req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const sessionId = req.params.sessionId;

        const { data, error } =
            await supabase
                .from("images")
                .select("*")
                .eq("session_id", sessionId)
                .order("image_id", {
                    ascending: true
                });

        if (error) {
            console.error(
                "Supabase database error:",
                error
            );

            return res.status(500).json({
                message:
                    "Failed to retrieve images",
                error:
                    error.message
            });
        }

        const images = [];

        for (const image of data) {

            const { data: signedUrlData, error: signedUrlError } =
                await supabase
                    .storage
                    .from("experiment-images")
                    .createSignedUrl(
                        image.file_path,
                        3600
                    );

            if (signedUrlError) {
                console.error(
                    "Supabase Storage error:",
                    signedUrlError
                );

                continue;
            }

            images.push({
                image_id: image.image_id,
                session_id: image.session_id,
                file_name: image.file_name,
                file_path: image.file_path,
                recorded_at: image.recorded_at,
                image_url:
                    signedUrlData.signedUrl
            });
        }

        res.json({
            message:
                "Images retrieved successfully",
            images: images
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