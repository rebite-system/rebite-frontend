import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./SignIn.css";

function SignIn() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showForgotModal, setShowForgotModal] = useState(false);

    const [resetStep, setResetStep] = useState("email");

    const [forgotEmail, setForgotEmail] = useState("");
    const [enteredCode, setEnteredCode] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [resetMessage, setResetMessage] = useState("");

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

        setErrors({
            ...errors,
            [e.target.name]: "",
        });

        setServerError("");
    }

    function validate() {
        const newErrors = {};

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!form.password.trim()) {
            newErrors.password = "Password is required";
        }

        return newErrors;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const validationErrors = validate();

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length !== 0) return;

        try {
            setLoading(true);
            setServerError("");

            const res = await api.post("/login", {
                email: form.email,
                password: form.password,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            const role = res.data.user.role;

            if (role === "restaurant") {
                navigate("/restaurant");
            } else if (role === "charity") {
                navigate("/charity");
            } else if (role === "donor") {
                navigate("/donor");
            } else if (role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err) {
            setServerError(
                err.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    function openForgotModal() {
        setForgotEmail(form.email);
        setEnteredCode("");
        setNewPassword("");
        setResetMessage("");
        setResetStep("email");

        setShowForgotModal(true);
    }

    async function sendResetCode(e) {
        e.preventDefault();

        if (!forgotEmail.trim()) {
            setResetMessage("Please enter your email address.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
            setResetMessage("Please enter a valid email address.");
            return;
        }

        try {
            const res = await api.post("/forgot-password", {
                email: forgotEmail,
            });

            setResetMessage(
          "A verification code has been sent to your email."
         );

            setResetMessage("");
            setResetStep("code");
        } catch (err) {
            setResetMessage(
                err.response?.data?.message || "Email not found."
            );
        }
    }

    async function verifyCode(e) {
        e.preventDefault();

        if (!enteredCode.trim()) {
            setResetMessage("Please enter the reset code.");
            return;
        }

        try {
            await api.post("/verify-reset-code", {
                email: forgotEmail,
                code: enteredCode,
            });

            setResetMessage("");
            setResetStep("newPassword");
        } catch (err) {
            setResetMessage(
                err.response?.data?.message ||
                "Invalid or expired code."
            );
        }
    }

    async function resetPassword(e) {
        e.preventDefault();

        if (!newPassword.trim()) {
            setResetMessage("Please enter a new password.");
            return;
        }

        if (
            newPassword.length < 8 ||
            !/[A-Z]/.test(newPassword) ||
            !/[a-z]/.test(newPassword) ||
            !/[0-9]/.test(newPassword) ||
            !/[@$!%*#?&]/.test(newPassword)
        ) {
            setResetMessage(
                "Password must contain uppercase, lowercase, number, and special character."
            );
            return;
        }

        try {
            await api.post("/reset-password", {
                email: forgotEmail,
                code: enteredCode,
                password: newPassword,
                password_confirmation: newPassword,
            });

            setResetMessage(
                "Password reset successfully. Please sign in again."
            );

            setResetStep("done");
        } catch (err) {
            setResetMessage(
                err.response?.data?.message ||
                "Password reset failed."
            );
        }
    }

    return (
        <div className="signin">
            <div className="auth-shell">
                <div className="auth-brand-panel">
                    <button
                        className="auth-back"
                        onClick={() => navigate("/")}
                    >
                        ← Back to home
                    </button>

                    <div>
                        <div className="auth-logo">🌿 ReBite</div>

                        <h1>Welcome back to your community.</h1>

                        <p>
                            Sign in to continue reducing food waste and
                            helping meals reach people who need them most.
                        </p>
                    </div>

                    <div className="auth-benefits">
                        <div>🍽️ Save surplus meals</div>
                        <div>🤝 Connect with charities</div>
                        <div>🌱 Reduce food waste</div>
                    </div>
                </div>

                <div className="signin-container">
                    <h2 className="title">Sign In</h2>

                    <p className="subtitle">
                        Enter your account details to continue.
                    </p>

                    {serverError && (
                        <div className="server-error">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <label>Email</label>

                        <input
                            type="text"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                        />

                        {errors.email && (
                            <p className="error">{errors.email}</p>
                        )}

                        <div className="password-row">
                            <label>Password</label>

                            <button
                                type="button"
                                className="forgot"
                                onClick={openForgotModal}
                            >
                                Forgot password?
                            </button>
                        </div>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                        />

                        {errors.password && (
                            <p className="error">{errors.password}</p>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="footer-text">
                        Don&apos;t have an account?{" "}
                        <span onClick={() => navigate("/signup")}>
                            Sign up
                        </span>
                    </p>
                </div>
            </div>

            {showForgotModal && (
                <div
                    className="auth-modal-overlay"
                    onClick={() => setShowForgotModal(false)}
                >
                    <div
                        className="auth-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="auth-modal-close"
                            onClick={() => setShowForgotModal(false)}
                        >
                            ×
                        </button>

                        {resetStep === "email" && (
                            <>
                                <h2>Reset Password</h2>

                                <p>
                                    Enter your email to generate a reset code.
                                </p>

                                <form onSubmit={sendResetCode}>
                                    <input
                                        type="text"
                                        placeholder="you@example.com"
                                        value={forgotEmail}
                                        onChange={(e) =>
                                            setForgotEmail(e.target.value)
                                        }
                                    />

                                    {resetMessage && (
                                        <div className="forgot-message">
                                            {resetMessage}
                                        </div>
                                    )}

                                    <button
                                        className="btn-primary"
                                        type="submit"
                                    >
                                        Generate Reset Code
                                    </button>
                                </form>
                            </>
                        )}

                        {resetStep === "code" && (
                            <>
                                <h2>Verify Code</h2>

                               <p>
                                   We sent a verification code to your email.
                                   Please check your inbox and enter it below.
                                </p>

                                <form onSubmit={verifyCode}>
                                    <input
                                        type="text"
                                        placeholder="Enter reset code"
                                        value={enteredCode}
                                        onChange={(e) =>
                                            setEnteredCode(e.target.value)
                                        }
                                    />

                                    {resetMessage && (
                                        <div className="forgot-message">
                                            {resetMessage}
                                        </div>
                                    )}

                                    <button
                                        className="btn-primary"
                                        type="submit"
                                    >
                                        Verify Code
                                    </button>
                                </form>
                            </>
                        )}

                        {resetStep === "newPassword" && (
                            <>
                                <h2>New Password</h2>

                                <p>Enter your new password.</p>

                                <form onSubmit={resetPassword}>
                                    <input
                                        type="password"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                    />

                                    {resetMessage && (
                                        <div className="forgot-message">
                                            {resetMessage}
                                        </div>
                                    )}

                                    <button
                                        className="btn-primary"
                                        type="submit"
                                    >
                                        Reset Password
                                    </button>
                                </form>
                            </>
                        )}

                        {resetStep === "done" && (
                            <>
                                <h2>Password Reset</h2>

                                <p>{resetMessage}</p>

                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setShowForgotModal(false);

                                        setForm({
                                            ...form,
                                            email: forgotEmail,
                                            password: "",
                                        });
                                    }}
                                >
                                    Back to Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignIn;