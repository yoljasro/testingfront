import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import axios from 'axios';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userID, setUserID] = useState('');
  const [inputID, setInputID] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    companyName: '',
  });
  const [testAnswers, setTestAnswers] = useState([]);
  const [testSubmitted, setTestSubmitted] = useState(false);

  // Ro'yxatdan o'tish
  const handleRegister = async () => {
    if (!email || !password) {
      alert('Iltimos, barcha maydonlarni to‘ldiring!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/register', { email, password });
      if (response.data.alreadyRegistered) {
        alert('Siz allaqachon ro‘yxatdan o‘tganmisiz!');
      } else {
        alert(`Ro‘yxatdan muvaffaqiyatli o‘tildi! ID ${email} manziliga yuborildi.`);
        setUserID(response.data.userID);
        setIsRegistered(true);
      }
    } catch (err) {
      console.error(err);
      alert('Ro‘yxatdan o‘tishda xatolik yuz berdi.');
    }
  };

  // ID tasdiqlash
  const handleVerifyID = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/verify', { email, identifier: inputID });
      if (response.data.success) {
        alert('ID tasdiqlandi!');
        setIdVerified(true);
      } else {
        alert('Noto‘g‘ri ID kiritildi.');
      }
    } catch (err) {
      console.error(err);
      alert('ID tasdiqlashda xatolik yuz berdi.');
    }
  };

  // Foydalanuvchi ma'lumotlarini yuborish
  const handleFormSubmit = async () => {
    const { name, age, gender, companyName } = formData;

    if (!name || !age || !gender || !companyName) {
      alert('Barcha maydonlarni to‘ldiring!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/submit-form', {
        email,
        name,
        age,
        gender,
        companyName,
      });
      alert('Maʼlumotlar muvaffaqiyatli yuborildi!');
    } catch (err) {
      console.error(err);
      alert('Maʼlumotlarni yuborishda xatolik yuz berdi.');
    }
  };

  // Test natijalarini yuborish
  const handleSubmitTest = async () => {
    if (testAnswers.length === 0) {
      alert('Iltimos, kamida bir javobni tanlang!');
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/submit-test', { email, testAnswers });
      alert('Sizning javoblaringiz muvaffaqiyatli yuborildi. Rahmat!');
      setTestSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Javoblarni yuborishda xatolik yuz berdi.');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 5, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      {!isRegistered && (
        <>
          <Typography variant="h6" mb={2}>
            Ro‘yxatdan o‘tish
          </Typography>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Parol"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleRegister} sx={{ width: '100%' }}>
            Ro‘yxatdan o‘tish
          </Button>
        </>
      )}

      {isRegistered && !idVerified && (
        <>
          <Typography variant="h6" mb={2}>
            ID tasdiqlash
          </Typography>
          <TextField
            fullWidth
            label="ID ni kiriting"
            variant="outlined"
            value={inputID}
            onChange={(e) => setInputID(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleVerifyID} sx={{ width: '100%' }}>
            Tasdiqlash
          </Button>
        </>
      )}

      {idVerified && !testSubmitted && (
        <>
          <Typography variant="h6" mb={2}>
            Test javoblarini yuborish
          </Typography>
          <RadioGroup
            value={testAnswers} 
            onChange={(e) => setTestAnswers([...testAnswers, e.target.value])}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Ha" />
            <FormControlLabel value="no" control={<Radio />} label="Yo‘q" />
          </RadioGroup>
          <Button variant="contained" onClick={handleSubmitTest} sx={{ width: '100%' }}>
            Yuborish
          </Button>
        </>
      )}

      {testSubmitted && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Test yakunlandi. Ishtirok uchun rahmat!
        </Typography>
      )}
    </Box>
  );
};
