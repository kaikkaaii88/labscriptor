// REQUIRE MODULES

const express = require("express");
const Groq = require("groq-sdk");


// CREATE ROUTER

const router = express.Router();


// FORMAT TIMESTAMP AS SINGAPORE TIME

function formatSingaporeTime(timestamp) {

    if (!timestamp) {

        return "Unknown time";

    }


    const date =
        new Date(timestamp);


    if (isNaN(date.getTime())) {

        return "Unknown time";

    }


    return new Intl.DateTimeFormat(
        "en-SG",
        {
            timeZone:
                "Asia/Singapore",

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit",

            second:
                "2-digit",

            hour12:
                false
        }
    ).format(date) +
        " SGT";

}


// PARSE AI ANALYSIS SECTIONS

function parseAIAnalysis(analysis) {

    const sections = {

        summary:
            "",

        keyObservations:
            [],

        patterns:
            [],

        potentialAnomalies:
            []

    };


    if (!analysis) {

        return sections;

    }


    const summaryMatch =
        analysis.match(
            /Summary\s*([\s\S]*?)(?=\n\s*Key Observations|\n\s*Patterns|\n\s*Potential Anomalies|$)/i
        );


    const keyObservationsMatch =
        analysis.match(
            /Key Observations\s*([\s\S]*?)(?=\n\s*Patterns|\n\s*Potential Anomalies|$)/i
        );


    const patternsMatch =
        analysis.match(
            /Patterns\s*([\s\S]*?)(?=\n\s*Potential Anomalies|$)/i
        );


    const potentialAnomaliesMatch =
        analysis.match(
            /Potential Anomalies\s*([\s\S]*)$/i
        );


    if (summaryMatch) {

        sections.summary =
            summaryMatch[1].trim();

    }


    if (keyObservationsMatch) {

        sections.keyObservations =
            parseAIList(
                keyObservationsMatch[1]
            );

    }


    if (patternsMatch) {

        sections.patterns =
            parseAIList(
                patternsMatch[1]
            );

    }


    if (potentialAnomaliesMatch) {

        sections.potentialAnomalies =
            parseAIList(
                potentialAnomaliesMatch[1]
            );

    }


    return sections;

}


// PARSE AI LIST

function parseAIList(text) {

    if (!text) {

        return [];

    }


    const lines =
        text
            .split("\n")
            .map(
                function (line) {

                    return line
                        .trim();

                }
            )
            .filter(
                function (line) {

                    return line.length >
                        0;

                }
            );


    const items = [];


    lines.forEach(
        function (line) {

            const cleanedLine =
                line.replace(
                    /^[-*•]\s*/,
                    ""
                ).replace(
                    /^\d+\.\s*/,
                    ""
                ).trim();


            if (
                cleanedLine.length >
                0
            ) {

                items.push(
                    cleanedLine
                );

            }

        }
    );


    return items;

}


// DEFINE ROUTES

router.post(
    "/analyse/:sessionId",
    async function (req, res) {

        try {

            const sessionId =
                req.params.sessionId;


            if (!sessionId) {

                return res.status(400).json({
                    message:
                        "Session ID is required."
                });

            }


            if (!process.env.GROQ_API_KEY) {

                console.error(
                    "GROQ_API_KEY is not configured."
                );

                return res.status(500).json({
                    message:
                        "Groq API key is not configured."
                });

            }


            const supabase =
                req.app.locals.supabase;


            if (!supabase) {

                return res.status(500).json({
                    message:
                        "Supabase client is not available."
                });

            }


            /* =========================
               LOAD PROCESS SESSION
               ========================= */

            const sessionResult =
                await supabase
                    .from("process_sessions")
                    .select("*")
                    .eq(
                        "session_id",
                        sessionId
                    )
                    .single();


            const session =
                sessionResult.data;

            const sessionError =
                sessionResult.error;


            if (sessionError || !session) {

                console.error(
                    "Failed to load process session:",
                    sessionError
                );

                return res.status(404).json({
                    message:
                        "Process session could not be found."
                });

            }


            /* =========================
               CHECK SESSION STATUS
               ========================= */

            if (
                session.status !==
                "completed"
            ) {

                return res.status(400).json({
                    message:
                        "AI analysis can only be generated for completed experiments."
                });

            }


            /* =========================
               LOAD OBSERVATIONS
               ========================= */

            const observationsResult =
                await supabase
                    .from("observations")
                    .select("*")
                    .eq(
                        "session_id",
                        sessionId
                    )
                    .order(
                        "recorded_at",
                        {
                            ascending: true
                        }
                    );


            const observations =
                observationsResult.data || [];

            const observationsError =
                observationsResult.error;


            if (observationsError) {

                console.error(
                    "Failed to load observations:",
                    observationsError
                );

                return res.status(500).json({
                    message:
                        "Failed to load experiment observations."
                });

            }


            /* =========================
               CHECK EXISTING ANALYSIS
               ========================= */

            const existingAnalysisResult =
                await supabase
                    .from("ai_analyses")
                    .select("*")
                    .eq(
                        "session_id",
                        sessionId
                    )
                    .maybeSingle();


            const existingAnalysis =
                existingAnalysisResult.data;

            const existingAnalysisError =
                existingAnalysisResult.error;


            if (existingAnalysisError) {

                console.error(
                    "Failed to check existing AI analysis:",
                    existingAnalysisError
                );

                return res.status(500).json({
                    message:
                        "Failed to check existing AI analysis."
                });

            }


            if (
                existingAnalysis &&
                existingAnalysis.status ===
                "completed"
            ) {

                return res.json({
                    message:
                        "AI analysis already exists.",

                    session_id:
                        sessionId,

                    model:
                        existingAnalysis.model,

                    analysis:
                        existingAnalysis
                });

            }


            /* =========================
               PREPARE OBSERVATIONS
               ========================= */

            let observationText =
                "No observations were recorded.";


            if (
                observations.length >
                0
            ) {

                observationText =
                    observations
                        .map(
                            function (
                                observation,
                                index
                            ) {

                                const text =
                                    observation.observation ||
                                    "No observation text.";

                                const recordedAt =
                                    formatSingaporeTime(
                                        observation.recorded_at
                                    );


                                return (
                                    (index + 1) +
                                    ". [" +
                                    recordedAt +
                                    "] " +
                                    text
                                );

                            }
                        )
                        .join("\n");

            }


            /* =========================
               CREATE PENDING ANALYSIS
               ========================= */

            const pendingData = {

                session_id:
                    sessionId,

                model:
                    "openai/gpt-oss-120b",

                status:
                    "pending",

                error_message:
                    null

            };


            let pendingResult;


            if (existingAnalysis) {

                pendingResult =
                    await supabase
                        .from("ai_analyses")
                        .update(
                            pendingData
                        )
                        .eq(
                            "session_id",
                            sessionId
                        )
                        .select()
                        .single();

            } else {

                pendingResult =
                    await supabase
                        .from("ai_analyses")
                        .insert(
                            pendingData
                        )
                        .select()
                        .single();

            }


            const pendingAnalysis =
                pendingResult.data;

            const pendingError =
                pendingResult.error;


            if (pendingError) {

                console.error(
                    "Failed to create AI analysis record:",
                    pendingError
                );

                return res.status(500).json({
                    message:
                        "Failed to create AI analysis record.",
                    error:
                        pendingError.message
                });

            }


            /* =========================
               CREATE AI PROMPT
               ========================= */

            const prompt =
                "You are an AI assistant for LabScriptor, " +
                "a laboratory experiment recording system.\n\n" +

                "Analyse the completed laboratory experiment " +
                "using ONLY the information provided below.\n\n" +

                "IMPORTANT RULES:\n" +

                "IMPORTANT RULES:\n" +

                "1. Use ONLY information explicitly contained in the experiment " +
                "data and observations provided below.\n" +

                "2. Do not invent experimental results, measurements, chemical " +
                "properties, causes, explanations, mechanisms, or conclusions.\n" +

                "3. Do not infer why an observed change occurred unless the reason " +
                "is explicitly stated in the recorded observations.\n" +

                "4. Do not describe an observation as normal, abnormal, expected, " +
                "unexpected, successful, unsuccessful, stable, or equivalent unless " +
                "the recorded data explicitly supports that description.\n" +

                "5. Do not use scientific knowledge to explain an observation. " +
                "For example, do not attribute an observation to sedimentation, " +
                "density, equilibrium, chemical reactions, temperature, or other " +
                "scientific mechanisms unless that explanation is explicitly recorded " +
                "in the experiment data.\n" +

                "6. When identifying patterns, describe only changes that can be " +
                "directly observed across the recorded observations. Do not explain " +
                "why the pattern occurred.\n" +

                "7. When identifying potential anomalies, only identify something as " +
                "a potential anomaly if the recorded observations explicitly describe " +
                "it as unusual, inconsistent, or noteworthy. Do not invent possible " +
                "causes or explanations for an anomaly.\n" +

                "8. If there is insufficient information to identify a pattern, " +
                "state that no pattern can be identified from the recorded observations.\n" +

                "9. If there is insufficient information to identify a potential " +
                "anomaly, state that no potential anomaly can be identified from " +
                "the recorded observations.\n" +

                "10. Observation timestamps are already converted to Singapore Time " +
                "(SGT, UTC+8). Preserve the provided timestamps when referring to " +
                "observations. Do not replace them with relative times such as " +
                "'0 minutes', 'approximately 5 minutes', or '10 minutes'.\n" +

                "11. Do not repeat information unnecessarily.\n\n" +

                "OUTPUT FORMAT:\n" +

                "Use EXACTLY these four headings in this exact order:\n\n" +

                "Summary\n" +
                "Write a concise factual summary using only the recorded information. " +
                "Do not add explanations or conclusions.\n\n" +

                "Key Observations\n" +
                "List the most important recorded observations. Include the actual " +
                "SGT timestamp when referring to a specific observation.\n\n" +

                "Patterns\n" +
                "Describe only directly observable changes or similarities across " +
                "multiple observations. Do not explain why the pattern occurred.\n\n" +

                "Potential Anomalies\n" +
                "Identify only observations that are explicitly unusual, inconsistent, " +
                "or noteworthy in the provided data. Do not provide possible causes. " +
                "If none can be identified, state that no potential anomaly can be " +
                "identified from the recorded observations.\n\n" +

                "Do NOT use Markdown formatting.\n" +
                "Do NOT use bold text.\n" +
                "Do NOT use horizontal separators.\n" +
                "Do NOT add additional headings.\n" +
                "Do NOT add an introduction or conclusion outside these four sections.\n\n" +
                "four sections.\n\n" +

                "Experiment Name: " +
                (session.process_name ||
                    "Not available") +
                "\n" +

                "Status: " +
                (session.status ||
                    "Not available") +
                "\n" +

                "Start Time: " +
                formatSingaporeTime(
                    session.start_time
                ) +
                "\n" +

                "End Time: " +
                formatSingaporeTime(
                    session.end_time
                ) +
                "\n\n" +

                "Observations:\n" +
                observationText;


            /* =========================
               CALL GROQ
               ========================= */

            const groq =
                new Groq({
                    apiKey:
                        process.env.GROQ_API_KEY
                });


            const completion =
                await groq.chat.completions.create({

                    model:
                        "openai/gpt-oss-120b",

                    messages: [
                        {
                            role:
                                "system",

                            content:
                                "You analyse laboratory experiment records " +
                                "carefully and only use information provided " +
                                "in the experiment data. Follow the requested " +
                                "output format exactly."
                        },
                        {
                            role:
                                "user",

                            content:
                                prompt
                        }
                    ],

                    temperature:
                        0.2
                });


            const analysis =
                completion
                    .choices[0]
                    .message
                    .content;


            if (!analysis) {

                throw new Error(
                    "Groq returned an empty analysis."
                );

            }


            /* =========================
            PARSE AI ANALYSIS
            ========================= */

            const parsedAnalysis =
                parseAIAnalysis(
                    analysis
                );


            /* =========================
            SAVE COMPLETED ANALYSIS
            ========================= */

            const completedResult =
                await supabase
                    .from("ai_analyses")
                    .update({

                        status:
                            "completed",

                        summary:
                            parsedAnalysis.summary,

                        key_observations:
                            parsedAnalysis.keyObservations,

                        patterns:
                            parsedAnalysis.patterns,

                        potential_anomalies:
                            parsedAnalysis.potentialAnomalies,

                        error_message:
                            null

                    })
                    .eq(
                        "session_id",
                        sessionId
                    )
                    .select()
                    .single();


            const completedAnalysis =
                completedResult.data;

            const completedError =
                completedResult.error;


            if (completedError) {

                console.error(
                    "Failed to save AI analysis:",
                    completedError
                );

                return res.status(500).json({
                    message:
                        "AI analysis was generated but could not be saved.",

                    error:
                        completedError.message
                });

            }


            console.log(
                "AI analysis completed for session:",
                sessionId
            );


            res.json({

                message:
                    "AI analysis generated successfully.",

                session_id:
                    sessionId,

                model:
                    "openai/gpt-oss-120b",

                analysis:
                    completedAnalysis

            });


        } catch (error) {

            console.error(
                "Groq AI analysis error:",
                error
            );


            const supabase =
                req.app.locals.supabase;


            const sessionId =
                req.params.sessionId;


            if (supabase && sessionId) {

                await supabase
                    .from("ai_analyses")
                    .update({

                        status:
                            "failed",

                        error_message:
                            error.message

                    })
                    .eq(
                        "session_id",
                        sessionId
                    );

            }


            res.status(500).json({

                message:
                    "Failed to generate AI analysis.",

                error:
                    error.message

            });

        }

    }
);


// GET SAVED AI ANALYSIS

router.get(
    "/:sessionId",
    async function (req, res) {

        try {

            const sessionId =
                req.params.sessionId;


            if (!sessionId) {

                return res.status(400).json({
                    message:
                        "Session ID is required."
                });

            }


            const supabase =
                req.app.locals.supabase;


            if (!supabase) {

                return res.status(500).json({
                    message:
                        "Supabase client is not available."
                });

            }


            const result =
                await supabase
                    .from("ai_analyses")
                    .select("*")
                    .eq(
                        "session_id",
                        sessionId
                    )
                    .maybeSingle();


            const analysis =
                result.data;

            const error =
                result.error;


            if (error) {

                console.error(
                    "Failed to load AI analysis:",
                    error
                );

                return res.status(500).json({
                    message:
                        "Failed to load AI analysis."
                });

            }


            if (!analysis) {

                return res.status(404).json({
                    message:
                        "AI analysis has not been generated for this experiment."
                });

            }


            res.json({
                message:
                    "AI analysis loaded successfully.",

                analysis:
                    analysis
            });


        } catch (error) {

            console.error(
                "Load AI analysis error:",
                error
            );


            res.status(500).json({
                message:
                    "Failed to load AI analysis.",

                error:
                    error.message
            });

        }

    }
);


// EXPORT ROUTER

module.exports = router;