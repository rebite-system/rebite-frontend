import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function ForgotPassword() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");

  const [code, setCode] = useState("");

  const [password, setPassword] = useState("");

  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  async function sendCode(e) {

    e.preventDefault();

    try {

      const res = await api.post(
        "/forgot-password",
        {
          email,
        }
      );

      alert(
        "Your reset code is: " +
          res.data.code
      );

      setStep(2);

    } catch (err) {

      console.log(
        err.response?.data
      );

      alert("Something went wrong");
    }
  }

  async function verifyCode(e) {

    e.preventDefault();

    try {

      await api.post(
        "/verify-reset-code",
        {
          email,
          code,
        }
      );

      alert("Code verified");

      setStep(3);

    } catch (err) {

      console.log(
        err.response?.data
      );

      alert("Invalid code");
    }
  }

  async function resetPassword(e) {

    e.preventDefault();

    try {

      await api.post(
        "/reset-password",
        {
          email,
          code,
          password,
          password_confirmation:
            passwordConfirmation,
        }
      );

      alert(
        "Password reset successfully"
      );

      navigate("/signin");

    } catch (err) {

      console.log(
        err.response?.data
      );

      alert("Something went wrong");
    }
  }

  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f7f5ef",
      }}
    >

      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "20px",
          width: "400px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >

        <h2
          style={{
            marginBottom: "10px",
            color: "#1f3b10",
          }}
        >
          Forgot Password
        </h2>

        <p
          style={{
            marginBottom: "25px",
            color: "#666",
          }}
        >
          Reset your password securely
        </p>

        {step === 1 && (

          <form onSubmit={sendCode}>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <button
              type="submit"
              style={buttonStyle}
            >
              Send Code
            </button>

          </form>

        )}

        {step === 2 && (

          <form onSubmit={verifyCode}>

            <input
              type="text"
              placeholder="Enter reset code"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <button
              type="submit"
              style={buttonStyle}
            >
              Verify Code
            </button>

          </form>

        )}

        {step === 3 && (

          <form onSubmit={resetPassword}>

            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={
                passwordConfirmation
              }
              onChange={(e) =>
                setPasswordConfirmation(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <button
              type="submit"
              style={buttonStyle}
            >
              Reset Password
            </button>

          </form>

        )}

      </div>

    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "16px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  fontSize: "15px",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  background: "#1f3b10",
  color: "#fff",
  fontSize: "16px",
  cursor: "pointer",
};

export default ForgotPassword;