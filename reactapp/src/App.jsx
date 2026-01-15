import React, {useState} from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Home from "./Pages/Home";
import Chat from "./Pages/Chat";
import MySnackbar from "./Components/MySnackbar";

export default function App() {

  const [toastData, setToastData] = useState({
    open: false,
    message: "",
    severity: "", //error, success, info, warning
  })


  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setToastData={setToastData} />} />
        <Route path="/register" element={<Register setToastData={setToastData} />} />
        <Route path="/chat" element={<Chat setToastData={setToastData}  />} />
      </Routes>
      {toastData.open && <MySnackbar toastData = {toastData} setToastData = {setToastData}/>}
    </>
  );
}
