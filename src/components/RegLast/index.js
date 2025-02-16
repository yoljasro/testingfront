import React, { useState } from 'react';
import { Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import axios from 'axios';

const RegLast = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    id: '',
    companyName: '',
  });
  const [tests, setTests] = useState([]);
  const [answers, setAnswers] = useState({});

  const handleLogin = async () => {
    try {
      await axios.post('http://localhost:4000/api/send-code', { email });
      alert('Код отправлен на ваш email');
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/verify-code', { email, code: verificationCode });
      if (response.data.success) setIsVerified(true);
      else alert('Неверный код!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/get-tests', formData);
      setTests(response.data.tests);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTestSubmit = async () => {
    try {
      await axios.post('http://localhost:4000/api/submit-tests', { formData, answers });
      alert('Тесты отправлены успешно!');
    } catch (error) {
      console.error(error);
    }
  };

  if (!isVerified) {
    return (
      <div>
        <Typography variant="h4">Войти в систему</Typography>
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={handleLogin}>Отправить код</Button>

        <TextField label="Код подтверждения" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
        <Button onClick={handleVerify}>Подтвердить</Button>
      </div>
    );
  }

  if (!tests.length) {
    return (
      <div>
        <Typography variant="h4">Введите свои данные</Typography>
        <TextField label="Имя" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        <TextField label="Возраст" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
        <FormControl>
          <InputLabel>Пол</InputLabel>
          <Select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
            <MenuItem value="male">Мужчина</MenuItem>
            <MenuItem value="female">Женщина</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>ID</InputLabel>
          <Select value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })}>
            <MenuItem value="1">ID 1</MenuItem>
            <MenuItem value="2">ID 2</MenuItem>
            <MenuItem value="3">ID 3</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Название компании" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
        <Button onClick={handleFormSubmit}>Получить тесты</Button>
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h4">Пройти тесты</Typography>
      {tests.map((test, index) => (
        <div key={index}>
          <Typography>{test.question}</Typography>
          <RadioGroup
            value={answers[test.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [test.id]: e.target.value })}>
            {test.options.map((option, i) => (
              <FormControlLabel key={i} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        </div>
      ))}
      <Button onClick={handleTestSubmit}>Отправить</Button>
    </div>
  );
};

export default RegLast;
