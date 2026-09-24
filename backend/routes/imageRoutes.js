// REQUIRE MODULES
const express = require("express");
const multer = require("multer");

// CREATE ROUTER
const router = express.Router();

// CREATE UPLOAD CONFIGURATION
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// DEFINE ROUTES

// UPLOAD IMAGE
router.post("/", upload.single("image"), async function(req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const sessionId = req.body.session_id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "Image is required"
            });
        }

        if (!sessionId) {
            return res.status(400).json({
                message: "session_id is required"
            });
        }

        if (!file.mimetype.startsWith("image/")) {
            return res.status(400).json({
                message: "Only image files are allowed"
            });
        }

        const originalFileName = file.originalname;

        const fileExtension = originalFileName.includes(".")
            ? originalFileName.substring(
                originalFileName.lastIndexOf(".")
            )
            : "";

        const uniqueFileName =
            Date.now() +
            "-" +
            Math.floor(Math.random() * 1000000) +
            fileExtension;

        const filePath = sessionId + "/" + uniqueFileName;

        // UPLOAD TO SUPABASE STORAGE
        const { error: uploadError } = await supabase.storage
            .from("experiment-images")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) {
            console.error("Image upload error:", uploadError);

            return res.status(500).json({
                message: "Failed to upload image",
                error: uploadError.message
            });
        }

        // INSERT IMAGE RECORD
        const { data, error } = await supabase
            .from("images")
            .insert([
                {
                    session_id: sessionId,
                    file_name: originalFileName,
                    file_path: filePath
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Image database insert error:", error);

            // REMOVE ORPHANED STORAGE FILE
            await supabase.storage
                .from("experiment-images")
                .remove([filePath]);

            return res.status(500).json({
                message: "Failed to save image record",
                error: error.message
            });
        }

        res.status(201).json({
            message: "Image uploaded successfully",
            image: data
        });
    } catch (error) {
        console.error("Upload image error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// GET IMAGES FOR SESSION
router.get("/:sessionId", async function(req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const sessionId = req.params.sessionId;

        const { data, error } = await supabase
            .from("images")
            .select("*")
            .eq("session_id", sessionId)
            .order("image_id", {
                ascending: true
            });

        if (error) {
            console.error("Get images error:", error);

            return res.status(500).json({
                message: "Failed to retrieve images",
                error: error.message
            });
        }

        const images = [];

        for (const image of data) {
            const { data: signedUrlData, error: signedUrlError } =
                await supabase.storage
                    .from("experiment-images")
                    .createSignedUrl(
                        image.file_path,
                        3600
                    );

            if (signedUrlError) {
                console.error(
                    "Signed URL error:",
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
                image_url: signedUrlData.signedUrl
            });
        }

        res.json({
            message: "Images retrieved successfully",
            images: images
        });
    } catch (error) {
        console.error("Get images error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// DELETE IMAGE
router.delete("/:imageId", async function(req, res) {
    try {
        const supabase = req.app.locals.supabase;

        const imageId = req.params.imageId;

        // FIND IMAGE RECORD
        const { data: image, error: findError } = await supabase
            .from("images")
            .select("*")
            .eq("image_id", imageId)
            .single();

        if (findError) {
            console.error("Find image error:", findError);

            return res.status(404).json({
                message: "Image not found",
                error: findError.message
            });
        }

        // DELETE FILE FROM STORAGE
        const { error: storageError } = await supabase.storage
            .from("experiment-images")
            .remove([image.file_path]);

        if (storageError) {
            console.error(
                "Storage image delete error:",
                storageError
            );

            return res.status(500).json({
                message: "Failed to delete image from storage",
                error: storageError.message
            });
        }

        // DELETE DATABASE RECORD
        const { error: databaseError } = await supabase
            .from("images")
            .delete()
            .eq("image_id", imageId);

        if (databaseError) {
            console.error(
                "Database image delete error:",
                databaseError
            );

            return res.status(500).json({
                message: "Image file was deleted but database record could not be deleted",
                error: databaseError.message
            });
        }

        res.json({
            message: "Image deleted successfully"
        });
    } catch (error) {
        console.error("Delete image error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

// EXPORT ROUTER
module.exports = router;