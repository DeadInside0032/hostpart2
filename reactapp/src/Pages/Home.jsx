import React from "react";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center text-center bg-linear-to-r from-red-200 to-orange-200">
      <h1 className="text-6xl mt-10 text-gray-600">Whisp</h1>
      <Stack
        spacing={2}
        className="flex flex-col items-center justify-center h-screen"
      >
        <Button
          onClick={() => navigate("/login")}
          variant="outlined"
          size="large"
          style={{ color: "gray", borderColor: "gray" }}
        >
          Login
        </Button>
        <Button
          onClick={() => navigate("/register")}
          variant="outlined"
          size="large"
          style={{ color: "gray", borderColor: "gray" }}
        >
          Register
        </Button>
      </Stack>
    </div>
  );
}
