document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("resetPasswordForm");
if (!form) return;

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("resetBtn");
const messageBox = document.getElementById("formMessage");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_URL = (window.API_BASE_URL || "http://localhost:5000") + "/recuperar-contrasena";

function setError(fieldName, message) {
    const group = form.querySelector(`[data-field="${fieldName}"]`);
    const errorEl = document.getElementById(`${fieldName}Error`);

    if (!group || !errorEl) return;

    group.classList.add("has-error");
    errorEl.textContent = message;
}

function clearError(fieldName) {
    const group = form.querySelector(`[data-field="${fieldName}"]`);
    const errorEl = document.getElementById(`${fieldName}Error`);

    if (!group || !errorEl) return;

    group.classList.remove("has-error");
    errorEl.textContent = "";
}

function clearAllErrors() {
    clearError("email");
    clearError("password");
    clearError("confirmPassword");
}

function showMessage(message, type = "error") {
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `form-message is-visible form-message--${type}`;
}

function hideMessage() {
    if (!messageBox) return;
    messageBox.textContent = "";
    messageBox.className = "form-message";
}

function toggleLoading(isLoading) {
    if (!submitBtn) return;

    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
}

function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) {
    setError("email", "Ingresa tu correo electrónico.");
    return false;
    }

    if (!EMAIL_REGEX.test(value)) {
    setError("email", "Ingresa un correo electrónico válido.");
    return false;
    }

    clearError("email");
    return true;
}

function validatePassword() {
    const value = passwordInput.value;

    if (!value.trim()) {
    setError("password", "Ingresa una nueva contraseña.");
    return false;
    }

    if (value.trim().length < 6) {
    setError("password", "La contraseña debe tener al menos 6 caracteres.");
    return false;
    }

    clearError("password");
    return true;
}

function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!confirmPassword.trim()) {
    setError("confirmPassword", "Confirma la contraseña.");
    return false;
    }

    if (password !== confirmPassword) {
    setError("confirmPassword", "Las contraseñas no coinciden.");
    return false;
    }

    clearError("confirmPassword");
    return true;
}

[emailInput, passwordInput, confirmPasswordInput].forEach((input) => {
    input.addEventListener("input", () => {
    const fieldName = input.id === "email" ? "email" : input.id === "password" ? "password" : "confirmPassword";
    if (input.value.trim() !== "") {
        clearError(fieldName);
    }

    if (messageBox && messageBox.classList.contains("is-visible")) {
        hideMessage();
    }
    });
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearAllErrors();
    hideMessage();

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
    const firstInvalid = !isEmailValid ? emailInput : !isPasswordValid ? passwordInput : confirmPasswordInput;
    firstInvalid.focus();
    return;
    }

    toggleLoading(true);

    try {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        correo: emailInput.value.trim(),
        nueva_contrasena: passwordInput.value
        })
    });

    let data = {};
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok || data.success === false) {
        showMessage(data.mensaje || "No se pudo actualizar la contraseña.", "error");
        return;
    }

    showMessage(data.mensaje || "Contraseña actualizada correctamente.", "success");

    window.setTimeout(() => {
        window.location.href = "index.html";
    }, 2500);
    } catch (error) {
    showMessage("No se pudo conectar con el servidor. Intenta nuevamente.", "error");
    } finally {
    toggleLoading(false);
    }
});
});
