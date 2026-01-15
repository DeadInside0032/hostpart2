import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function Register({ setToastData }) {
  const navigate = useNavigate();

  const [validPassword, setValidPassword] = useState(true);

  const checkValidPassword = (pw) => {
    if (pw.length <= 7) {
      setValidPassword(false);
    } else {
      setValidPassword(true);
    }
  };

  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [matchingPasswords, setMatchingPasswords] = useState(true);

  const checkMatchingPasswords = (password, passwordAgain) => {
    if (password === passwordAgain) {
      setMatchingPasswords(true);
    } else {
      setMatchingPasswords(false);
    }
  };

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);

  const checkValidEmail = (email) => {
    const splitEmail = email.split("@");
    //console.log(splitEmail);

    const splitAfterAt = splitEmail[1]?.split(".");
    //console.log(splitAfterAt);

    if (email.length == 0 || !email.includes("@")) {
      setValidEmail(false);
      //console.log("első")
    }
    if (splitEmail[0].length == 0 || splitEmail[1].length == 0) {
      setValidEmail(false);
      //console.log("második")
    }
    if (!splitEmail[1].includes(".")) {
      setValidEmail(false);
      //console.log("harmadik")
    }
    if (splitAfterAt[0].length == 0 || splitAfterAt[1].length < 2) {
      setValidEmail(false);
      //console.log("negyedik")
    } else {
      setValidEmail(true);
    }
  };

  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(true);

  const checkValidUsername = (username) => {
    if (username.length < 3) {
      setValidUsername(false);
    } else {
      setValidUsername(true);
    }
  };

  const handleRegister = async () => {
    if (
      validUsername &&
      validEmail &&
      validPassword &&
      matchingPasswords &&
      username.length != 0 &&
      email.length != 0 &&
      password.length != 0 &&
      passwordAgain.length != 0
    ) {
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      }).then(async (responseJSON) => {
        const response = await responseJSON.json();
        console.log(response);
      });
      setToastData({
        open: true,
        message: "Registration successful!",
        severity: "success",
      });
      navigate("/login");
    } else {
      setToastData({
        open: true,
        message: "Error in registration data!",
        severity: "error",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-linear-to-r from-red-200 to-orange-200">
      <Stack
        spacing={2}
        className="flex flex-col items-center justify-center h-screen"
      >
        <div className="flex flex-col items-center justify-center gap-4 h-112.5 w-100">
          <h1 className="text-2xl pb-2 text-gray-600 font-bold">Register</h1>

          <TextField
            id="outlined-basic"
            label="Username"
            variant="outlined"
            required
            className="w-75"
            onChange={(e) => {
              setUsername(e.target.value);

              checkValidUsername(e.target.value);
            }}
          />
          <TextField
            id="outlined-basic"
            label="Email"
            variant="outlined"
            required
            className="w-75"
            onChange={(e) => {
              setEmail(e.target.value);

              checkValidEmail(e.target.value);
            }}
          />
          <TextField
            id="outlined-basic"
            label="Password"
            variant="outlined"
            required
            type="password"
            className="w-75"
            onChange={(e) => {
              setPassword(e.target.value);

              checkValidPassword(e.target.value);
              checkMatchingPasswords(e.target.value, passwordAgain);
            }}
          />
          <TextField
            id="outlined-basic"
            label="Password Again"
            variant="outlined"
            required
            type="password"
            className="w-75"
            onChange={(e) => {
              setPasswordAgain(e.target.value);

              checkMatchingPasswords(password, e.target.value);
            }}
          />
          <p className="text-red-500 text-[12px]">
            {!validUsername && "Username must 3 characters long!"}
          </p>
          <p className="text-red-500 text-[12px]">
            {!validEmail && "Invalid email format!"}
          </p>
          <p className="text-red-500 text-[12px]">
            {!validPassword && "Password must be at least 8 characters long!"}
          </p>
          <p className="text-red-500 text-[12px]">
            {!matchingPasswords && "Passwords do not match!"}
          </p>
          <div className="flex flex-row justify-center gap-5">
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleRegister();
              }}
              variant="outlined"
              style={{ color: "gray", borderColor: "gray" }}
            >
              Register
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outlined"
              style={{ color: "gray", borderColor: "gray" }}
            >
              Back
            </Button>
          </div>
        </div>
      </Stack>
    </div>
  );
}
