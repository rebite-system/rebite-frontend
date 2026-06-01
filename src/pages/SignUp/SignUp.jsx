import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./SignUp.css";

function SignUp() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
        setServerError("");
    }

    function selectRole(role) {
        setForm({ ...form, role });
        setErrors({ ...errors, role: "" });
    }

    function getPasswordStrength(password) {
        if (!password) return null;
        if (password.length < 8) return "weak";
        if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            return "strong";
        }
        return "medium";
    }

    function validate() {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Full name is required";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!form.password) {
            newErrors.password = "Password is required";
        } else if (form.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (
            !/[A-Z]/.test(form.password) ||
            !/[a-z]/.test(form.password) ||
            !/[0-9]/.test(form.password) ||
            !/[@$!%*#?&]/.test(form.password)
        ) {
            newErrors.password =
                "Password must contain uppercase, lowercase, number, and special character";
        }

        if (!form.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (form.confirmPassword !== form.password) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!form.role) {
            newErrors.role = "Please select your role";
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

            await api.post("/register", {
                name: form.name,
                email: form.email,
                password: form.password,
                password_confirmation: form.confirmPassword,
                role: form.role,
            });

            setShowVerifyModal(true);
        } catch (err) {
            if (err.response?.data?.errors) {
                const apiErrors = err.response.data.errors;

                setErrors({
                    name: apiErrors.name?.[0],
                    email: apiErrors.email?.[0],
                    password: apiErrors.password?.[0],
                    role: apiErrors.role?.[0],
                });
            } else {
                setServerError(err.response?.data?.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="signup">
            <div className="auth-shell">
                <div className="auth-brand-panel">
                    <button className="auth-back" onClick={() => navigate("/")}>
                        ← Back to home
                    </button>

                    <div>
                        <div className="auth-logo">🌿 ReBite</div>

                        <h1>Join the movement against food waste.</h1>

                        <p>
                            Create your account as a restaurant, charity, or donor and become
                            part of a community that turns surplus food into support.
                        </p>
                    </div>

                    <div className="auth-benefits">
                        <div>🍽️ Restaurants share surplus</div>
                        <div>🤲 Charities receive donations</div>
                        <div>💰 Donors support the mission</div>
                    </div>
                </div>

                <div className="signup-container">
                    <h2 className="title">Join ReBite</h2>

                    <p className="signup-sub">
                        Help reduce food waste and feed those in need.
                    </p>

                    {serverError && <div className="server-error">{serverError}</div>}

                    <form onSubmit={handleSubmit}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your full name"
                            value={form.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="error">{errors.name}</p>}

                        <label>Email</label>
                        <input
                            type="text"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="error">{errors.email}</p>}

                        <label>Password</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Min. 8 characters"
                                value={form.password}
                                onChange={handleChange}
                            />
<button
  type="button"
  className="password-toggle"
  onClick={() => setShowPassword(!showPassword)}
>
  {showPassword ? "Hide" : "Show"}
</button>
                        </div>
                        {errors.password && <p className="error">{errors.password}</p>}

                        {form.password && (
                            <div className={`strength strength--${getPasswordStrength(form.password)}`}>
                                <div className="strength-bars">
                                    <div className="strength-bar" />
                                    <div className="strength-bar" />
                                    <div className="strength-bar" />
                                </div>

                                <span className="strength-text">
                                    {getPasswordStrength(form.password) === "weak" && "Weak"}
                                    {getPasswordStrength(form.password) === "medium" && "Medium"}
                                    {getPasswordStrength(form.password) === "strong" && "Strong"}
                                </span>
                            </div>
                        )}

                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Repeat your password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && (
                            <p className="error">{errors.confirmPassword}</p>
                        )}

                        <label>Select Role</label>
                        <div className="roles">
                            <button
                                type="button"
                                className={form.role === "restaurant" ? "role active" : "role"}
                                onClick={() => selectRole("restaurant")}
                            >
                                🍽️ Restaurant
                            </button>

                            <button
                                type="button"
                                className={form.role === "charity" ? "role active" : "role"}
                                onClick={() => selectRole("charity")}
                            >
                                🤲 Charity
                            </button>

                            <button
                                type="button"
                                className={form.role === "donor" ? "role active" : "role"}
                                onClick={() => selectRole("donor")}
                            >
                                💰 Donor
                            </button>
                        </div>
                        {errors.role && <p className="error">{errors.role}</p>}

                        <button type="submit" className="signup-btn" disabled={loading}>
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="footer-text">
                        Already have an account?{" "}
                        <span onClick={() => navigate("/signin")}>Sign In</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;