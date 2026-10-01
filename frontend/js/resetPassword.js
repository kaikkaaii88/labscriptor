const SUPABASE_URL = "https://wxoisxojhqelzmeqhoml.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_HmZbJeN7C7bHRoPcDHSj1A_WxKjoHdy";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


const resetPasswordForm =
    document.getElementById("resetPasswordForm");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

const resetPasswordButton =
    document.getElementById("resetPasswordButton");

const resetPasswordMessage =
    document.getElementById("resetPasswordMessage");



/* ========================================
   SHOW / HIDE NEW PASSWORD
   ======================================== */

togglePassword.addEventListener(
    "click",
    function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.textContent =
                "Hide";

        } else {

            passwordInput.type = "password";

            togglePassword.textContent =
                "Show";
        }
    }
);



/* ========================================
   SHOW / HIDE CONFIRM PASSWORD
   ======================================== */

toggleConfirmPassword.addEventListener(
    "click",
    function () {

        if (confirmPasswordInput.type === "password") {

            confirmPasswordInput.type = "text";

            toggleConfirmPassword.textContent =
                "Hide";

        } else {

            confirmPasswordInput.type = "password";

            toggleConfirmPassword.textContent =
                "Show";
        }
    }
);



/* ========================================
   RESET PASSWORD
   ======================================== */

resetPasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        /* Check password fields */

        if (
            password === "" ||
            confirmPassword === ""
        ) {

            resetPasswordMessage.textContent =
                "Please enter and confirm your new password.";

            return;
        }


        /* Check password match */

        if (password !== confirmPassword) {

            resetPasswordMessage.textContent =
                "Passwords do not match.";

            confirmPasswordInput.focus();

            return;
        }


        /* Disable button */

        resetPasswordButton.disabled = true;

        resetPasswordMessage.textContent =
            "Updating your password...";


        const result =
            await supabaseClient.auth.updateUser({
                password: password
            });


        const error =
            result.error;


        if (error) {

            console.error(
                "Password reset error:",
                error
            );

            resetPasswordMessage.textContent =
                "Unable to reset your password. Please try again.";

            resetPasswordButton.disabled = false;

            return;
        }


        console.log(
            "Password updated successfully."
        );


        resetPasswordMessage.textContent =
            "Password updated successfully. Redirecting to login...";


        setTimeout(
            function () {

                window.location.href =
                    "/html/login.html";

            },
            2000
        );
    }
);