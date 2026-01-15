import React, { useState, useEffect, useRef } from "react";
import Badge from "@mui/material/Badge";
import { useNavigate } from "react-router-dom";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export default function Chat({ setToastData }) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [showOtherUsers, setshowOtherUsers] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [friendRequests, setFriendRequests] = useState(false);
  const [friendRequestUsers, setFriendRequestUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const messagesEndRef = useRef(null);
  // Olvasatlan üzenetek lekérdezése 5 másodpercenként
  useEffect(() => {
    let interval = setInterval(() => {
      fetch(`/api/messages?user1=${currentUser.username}`)
        .then(async (res) => {
          const data = await res.json();
          // Számoljuk, hogy kitől van olvasatlan üzenet (amit nem én küldtem, és nem az aktív chat)
          const unread = {};
          (data.messages || []).forEach(msg => {
            if (
              msg.receiver === currentUser.username &&
              msg.sender !== activeChat &&
              !msg.read
            ) {
              unread[msg.sender] = (unread[msg.sender] || 0) + 1;
            }
          });
          setUnreadMessages(unread);
        });
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser.username, activeChat]);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleSearch = (value) => {
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        search: value,
        currentUser: currentUser.username,
      }),
    }).then(async (res) => {
      const data = await res.json();
      setUsers(data.users || []);
    });
  };

  const addFriend = (username) => {
    fetch("/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requesterName: currentUser.username,
        receiverName: username,
        status: "pending",
      }),
    }).then(async (responseJSON) => {
      const response = await responseJSON.json();

      if (response.status === 200) {
        setToastData({
          open: true,
          message: "Friend request sent!",
          severity: "success",
        });
      } else {
        setToastData({
          open: true,
          message: "Error while adding friend",
          severity: "error",
        });
      }
    });
  };

  const denyFriendRequest = (requesterName) => {
    fetch("/api/denyfriendrequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requesterName,
        receiverName: currentUser.username,
        status: "denied",
      }),
    }).then(async (responseJSON) => {
      const response = await responseJSON.json();

      if (response.status === 200) {
        setToastData({
          open: true,
          message: "Friend request denied",
          severity: "error",
        });
      }
    });
  };

  const acceptFriendRequest = (requesterName) => {
    fetch("/api/acceptfriendrequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requesterName,
        receiverName: currentUser.username,
        status: "accepted",
      }),
    }).then(async (responseJSON) => {
      const response = await responseJSON.json();

      console.log("Ezt adta vissza a genyó: " + response.message);

      if (response.status === 200) {
        setToastData({
          open: true,
          message: "Friend request accepted",
          severity: "success",
        });
        setFriends((prev) => [...prev, response.message]);
      }
      console.log(friends)
      
    });
  };

  const deleteFriendRequest = (requesterName) => {
    setFriendRequestUsers((prev) =>
      prev.filter((name) => name !== requesterName)
    );
  };

  /*const fetchFriends = (requesterName) => {
    fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requesterName,
        receiverName: currentUser.username,
      }),
    }).then(async (responseJSON) => {
      const response = await responseJSON.json();

      console.log(response);
      if (response.status === 200) {
        setFriends(
          response.acceptedFriends.map((row) =>
            row.requester_name === currentUser.username
              ? row.receiver_name
              : row.requester_name
          )
        );
      }
      console.log("friends frissítve");
      console.log(friends);
    });
  };*/

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    // Lekérjük a barátokat
    fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser.username }),
    })
      .then(async (res) => {
        const data = await res.json();
        setFriends(data.friends || []);
      });

    fetch("/api/friendrequests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentUser: currentUser.username,
      }),
    }).then(async (responseJSON) => {
      const response = await responseJSON.json();
      if (response.requester.length > 0) {
        setFriendRequests(true);
        setFriendRequestUsers(response.requester);
      } else {
        setFriendRequests(false);
      }
    });

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Üzenetek lekérése, ha activeChat változik
  useEffect(() => {
    if (activeChat) {
      fetch(`/api/messages?user1=${currentUser.username}&user2=${activeChat}`)
        .then(async (res) => {
          const data = await res.json();
          setMessages(data.messages || []);
        });
    }
  }, [activeChat]);

  // Scroll to bottom, ha messages változik
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    const body = {
      sender: currentUser.username,
      receiver: activeChat,
      content: newMessage.trim(),
    };
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setNewMessage("");
      // Frissítjük az üzeneteket
      fetch(`/api/messages?user1=${currentUser.username}&user2=${activeChat}`)
        .then(async (res) => {
          const data = await res.json();
          setMessages(data.messages || []);
        });
    } else {
      setToastData({ open: true, message: "Error sending message", severity: "error" });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "linear-gradient(to right, #fecaca, #fed7aa)",
        overflow: "hidden",
      }}
    >
      {/* BAL OLDALI PANEL */}
      <div
        style={{
          width: isMobileView ? "100%" : "24rem",
          backgroundColor: "rgba(255,255,255,0.6)",
          borderRight: isMobileView ? "none" : "1px solid black",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: "22px", marginBottom: "20px" }}>
            Your chats,
            <span style={{ color: "gray" }}> {currentUser?.username}</span>
          </h1>

          {!isMobileView && (
            <div className="flex" style={{ flexDirection: "column", alignItems: "center" }}>
              <div>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setshowOtherUsers(true);
                    handleSearch("");
                  }}
                  style={{
                    marginRight: "10px",
                    color: "gray",
                    borderColor: "gray",
                  }}
                >
                  Others
                </Button>

                <Button
                  variant="outlined"
                  style={{ color: "gray", borderColor: "gray" }}
                  onClick={() => {
                    localStorage.removeItem("user");
                    navigate("/");
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}

          {isMobileView && (
            <Button
              variant="outlined"
              style={{ color: "gray", borderColor: "gray" }}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              ☰
            </Button>
          )}

          {friendRequests && (
            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                overscrollBehavior: "none",
                marginTop: "20px",
                width: "100%",
              }}
            >
              {friendRequestUsers.map((username, index) => (
                <div
                  key={index}
                  style={{
                    marginTop: "10px",
                    padding: "5px",
                    backgroundColor: "white",
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span className="mb-2.5">
                    Friend request from: {username}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-around",
                      marginTop: "5px",
                      marginBottom: "5px",
                    }}
                  >
                    <Button
                      variant="outlined"
                      style={{
                        backgroundColor: "red",
                        height: "40px",
                        color: "white",
                        borderColor: "red",
                      }}
                      onClick={() => {
                        denyFriendRequest(username);
                        deleteFriendRequest(username);
                      }}
                    >
                      X
                    </Button>
                    <Button
                      variant="outlined"
                      style={{
                        backgroundColor: "green",
                        height: "40px",
                        color: "white",
                        borderColor: "green",
                      }}
                      onClick={() => {
                        acceptFriendRequest(username);
                        deleteFriendRequest(username);

                        //fetchFriends(username);
                      }}
                    >
                      ✓
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: "80px",
              width: "100%",
              maxHeight: "250px",
              overflowY: "auto",
              overscrollBehavior: "none",
            }}
          >
            {friends.map((friend, index) => (
              <div
                key={index}
                style={{
                  height: "80px",
                  borderTop: "1px solid rgba(0,0,0,0.3)",
                  background:
                    "linear-gradient(to right, rgba(255,0,0,0.2), rgba(255,165,0,0.2))",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Badge
                  color="error"
                  variant="dot"
                  invisible={!unreadMessages[friend]}
                  anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  <span>{friend}</span>
                </Badge>
                <Button
                  variant="text"
                  style={{ color: activeChat === friend ? "#1976d2" : "gray", fontWeight: activeChat === friend ? "bold" : "normal" }}
                  onClick={() => setActiveChat(friend)}
                >
                  Message
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JOBB OLDALI CHAT PANEL */}
      {!isMobileView && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {activeChat ? (
            <div
              style={{
                backgroundColor: "white",
                height: "80%",
                width: "80%",
                borderRadius: "16px",
                border: "1px solid #ccc",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                padding: "24px",
              }}
            >
              <h2 style={{ marginBottom: "16px", color: "#1976d2" }}>Chat with {activeChat}</h2>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginBottom: "16px",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                  padding: "12px",
                  border: "1px solid #eee",
                  minHeight: "200px",
                  maxHeight: "400px"
                }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: msg.sender === currentUser.username ? "flex-end" : "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        background: msg.sender === currentUser.username ? "#cce5ff" : "#ffe0b2",
                        color: "#333",
                        padding: "8px 12px",
                        borderRadius: "16px",
                        maxWidth: "60%",
                        wordBreak: "break-word",
                        fontSize: "16px",
                        display: "inline-flex",
                        alignItems: "center"
                      }}
                    >
                      {msg.content}
                      {msg.sender === currentUser.username && (
                        <span style={{ marginLeft: 8, fontSize: 14 }}>
                          {msg.read ? "✔️" : ""}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>
                      {msg.sender === currentUser.username ? "You" : msg.sender} • {msg.sent_at ? new Date(msg.sent_at).toLocaleString() : ""}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
                />
                <Button variant="contained" color="primary" onClick={handleSendMessage}>
                  Send
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ color: "#aaa", fontSize: "24px" }}>Select a friend to start chatting!</div>
          )}
        </div>
      )}

      {!isMobileView && showOtherUsers && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              height: "700px",
              width: "800px",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              border: "1px solid black",
              fontSize: "24px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                borderBottom: "1px solid black",
              }}
            >
              <TextField
                label="Search"
                variant="outlined"
                style={{ width: "80%", marginBottom: "20px" }}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Button
                style={{
                  color: "gray",
                  borderColor: "gray",
                  height: "40px",
                  width: "40px",
                  marginTop: "10px",
                  marginRight: "10px",
                  marginBottom: "10px",
                }}
                onClick={() => setshowOtherUsers(false)}
                variant="outlined"
              >
                X
              </Button>
            </div>

            <div
              style={{
                width: "100%",
                overflowY: "auto",
                overscrollBehavior: "none",
              }}
            >
              {users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    height: "80px",
                    borderTop: "1px solid black",
                    background:
                      "linear-gradient(to right, rgba(255,0,0,0.2), rgba(255,165,0,0.2))",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 20px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{user.username}</span>
                  <Button
                    variant="text"
                    style={{ color: "gray" }}
                    onClick={() => {
                      addFriend(user.username);
                    }}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isMobileView && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: isMobileMenuOpen ? 0 : "-100%",
            width: "70%",
            height: "100vh",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "0 16px 16px 0",
            boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
            transition: "left 0.3s ease",
            zIndex: 2000,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            style={{ marginBottom: "10px", color: "gray", borderColor: "gray" }}
            onClick={() => {
              setshowOtherUsers(true);
              setIsMobileMenuOpen(false);

              handleSearch("");
            }}
          >
            Others
          </Button>

          <Button
            fullWidth
            variant="outlined"
            style={{ marginBottom: "10px", color: "gray", borderColor: "gray" }}
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
          >
            Logout
          </Button>

          <Button
            fullWidth
            variant="outlined"
            style={{ color: "gray", borderColor: "gray" }}
            onClick={() => {
              setIsMobileMenuOpen(false);
            }}
          >
            Close
          </Button>
        </div>
      )}

      {isMobileView && showOtherUsers && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            zIndex: 3000,
            fontSize: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "10px",
              borderBottom: "1px solid black",
            }}
          >
            <TextField
              label="Search"
              variant="outlined"
              style={{
                width: "80%",
                marginBottom: "20px",
                marginRight: "10px",
              }}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Button
              style={{
                color: "gray",
                borderColor: "gray",
                height: "40px",
                width: "40px",
                marginTop: "10px",
                marginRight: "10px",
                marginBottom: "10px",
              }}
              onClick={() => setshowOtherUsers(false)}
              variant="outlined"
            >
              X
            </Button>
          </div>

          <div
            style={{
              width: "100%",
              overflowY: "auto",
              overscrollBehavior: "none",
            }}
          >
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  height: "80px",
                  borderTop: "1px solid black",
                  background:
                    "linear-gradient(to right, rgba(255,0,0,0.2), rgba(255,165,0,0.2))",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 20px",
                }}
              >
                <span style={{ fontSize: "20px" }}>{user.username}</span>
                <Button
                  variant="text"
                  style={{ color: "gray" }}
                  onClick={() => {
                    addFriend(user.username);
                  }}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
