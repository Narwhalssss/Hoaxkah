import React, { useState } from "react";
import axios from "axios";

const Hoaxkah = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Halo! Saya adalah Hoaxkah, pendeteksi berita hoaks. Masukkan judul berita atau artikel yang ingin Anda cek, dan saya akan membantu memberikan analisisnya.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Tambahkan input pengguna ke obrolan
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Kirim permintaan ke backend
      const response = await axios.post("http://localhost:8000/check", { title: input });

      // Tambahkan respons bot ke obrolan
      const botResponse = `Keputusan: ${response.data.decision}\nPenjelasan: ${response.data.explanation}\nSkor Kepercayaan: ${response.data.confidence}%`;
      setMessages([...newMessages, { sender: "bot", text: botResponse }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        { sender: "bot", text: "Maaf, terjadi kesalahan saat memproses permintaan Anda. Coba lagi nanti." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Hoaxkah</h2>
      <div style={styles.chatbox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...styles.bubble,
                backgroundColor: msg.sender === "user" ? "#0078D7" : "#e5e5e5",
                color: msg.sender === "user" ? "#fff" : "#000",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ ...styles.message, justifyContent: "flex-start" }}>
            <div style={{ ...styles.bubble, backgroundColor: "#e5e5e5" }}>Mengetik...</div>
          </div>
        )}
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Ketik judul berita di sini..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.button}>
          Kirim
        </button>
      </div>
    </div>
  );
};

const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center", 
      alignItems: "center", 
      width: "100vw", 
      height: "100vh", 
      padding: "20px",
      backgroundColor: "#f4f4f4",
    },
    title: {
      textAlign: "center",
      color: "#333",
      fontSize: "2rem",
      marginBottom: "20px",
    },
    chatbox: {
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "10px",
      height: "70%", 
      width: "100%", 
      maxWidth: "800px", 
      overflowY: "auto",
      border: "1px solid #ddd",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    message: {
      display: "flex",
      margin: "10px 0",
    },
    bubble: {
      maxWidth: "75%",
      padding: "10px",
      borderRadius: "12px",
      lineHeight: "1.6",
      fontSize: "1rem",
    },
    inputArea: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      maxWidth: "800px", 
      marginTop: "20px",
    },
    input: {
      flex: 1,
      padding: "15px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      fontSize: "1rem",
    },
    button: {
      marginLeft: "10px",
      padding: "15px 30px",
      backgroundColor: "#0078D7",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "1rem",
      cursor: "pointer",
    },
  };
  
  

export default Hoaxkah;
