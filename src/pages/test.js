import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router"; 

const Test = () => {
  const [idName, setIdName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
    const router = useRouter(); // Routerni ishlatish uchun

  const handleVerify = async () => {
    if (!idName) {
      alert("ID Name ni kiritish majburiy!");
      return;
    }

    try {
      const response = await axios.get("http://localhost:4000/api/register-client", {
        params: { idName, email },

      });

      if (response.data.success) {
        setMessage(`Success! ID Name mavjud. Email: ${response.data.client.email || "Noma'lum"}`);
        router.push("/"); 
      } else {
        setMessage("ID Name yoki email mos kelmadi.");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage("ID Name yoki email mos kelmadi.");
      } else {
        console.error("Xato yuz berdi:", error);
        setMessage("Tekshirishda xatolik yuz berdi.");
      }
    }
  };

  return (
    <div>
      <h1>ID Name va Email ni tekshirish</h1>
      <input
        type="text"
        placeholder="ID Name kiriting"
        value={idName}
        onChange={(e) => setIdName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email kiriting (ixtiyoriy)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleVerify}>Tekshirish</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Test;
