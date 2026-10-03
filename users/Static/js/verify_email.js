import { BASE_URL } from "../../../base_url.js";


// ==================================================
document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll(".otp-input");
    const verifyBtn = document.getElementById("verify-btn");
    const errorDiv = document.getElementById("verify-error");


    const getOtpCode = () => Array.from(inputs).map(input => input.value).join("");


    const updateButtonState = () => {
        const code = getOtpCode();
        verifyBtn.disabled = code.length !== 6;
    };

    inputs.forEach((input, index) => {

        input.addEventListener("input", (e) => {
            const value = e.target.value;


            if (value.length > 1) {
                const chars = value.split("");
                inputs.forEach((inp, i) => {
                    if (chars[i]) inp.value = chars[i];
                });
                if (inputs[5]) inputs[5].focus();
                updateButtonState();
                autoSubmit();
                return;
            }


            if (!/^[0-9]$/.test(value)) {
                input.value = "";
                return;
            }


            if (value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

            updateButtonState();
            autoSubmit();
        });


        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace") {
                if (input.value === "" && index > 0) {
                    inputs[index - 1].focus();
                    inputs[index - 1].value = "";
                } else {
                    input.value = "";
                }
                updateButtonState();
                e.preventDefault();
            }
        });


        input.addEventListener("paste", (e) => {
            e.preventDefault();
            const pasteData = e.clipboardData.getData("text").trim();
            if (/^\d{6}$/.test(pasteData)) {
                pasteData.split("").forEach((char, i) => {
                    if (inputs[i]) inputs[i].value = char;
                });
                inputs[5].focus();
                updateButtonState();
                autoSubmit();
            }
        });
    });


    function autoSubmit() {
        const code = getOtpCode();
        if (code.length === 6) {
            sendVerificationRequest(code);
        }
    }

    verifyBtn.addEventListener("click", () => {
        const code = getOtpCode();
        if (code.length === 6) {
            sendVerificationRequest(code);
        }
    });

    async function sendVerificationRequest(code) {
        errorDiv.textContent = "";
        const email = localStorage.getItem("email");

        try {
            const response = await fetch(`${BASE_URL}/users/api/verify/email/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    'email': email,
                    'code': code,
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Your email was verified successfully!");
                localStorage.removeItem("email");
                window.location.href = `${BASE_URL}/hotels/templates/home.html`;
            } else {
                errorDiv.textContent = data.detail || "The code does not match, try again";

                inputs.forEach(inp => inp.style.borderColor = "#ef4444");
            }
        } catch (err) {
            errorDiv.textContent = "Server connection Error";
        }
    }
});