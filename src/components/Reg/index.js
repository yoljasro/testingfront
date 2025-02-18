import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, RadioGroup, FormControlLabel, Radio, Select, MenuItem, Alert } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/router"; // Routerni import qilish
import { Modal, Backdrop } from "@mui/material";

const RegisterVerify = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [inputID, setInputID] = useState("");
  const [idName, setIdName] = useState(""); // ID Name o'zgarishi uchun yangi state
  const [isLoading, setIsLoading] = useState("")
  const [clientEmail, clientSetEmail] = useState("");
  const [alertData, setAlertData] = useState(null);
  const [message, setMessage] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState({
    name: "",
    age: "",
    gender: "",
    region: "",
    companyName: "",
  });
  const selectedID = additionalInfo.selectedID; // Tanlangan ID
  const [testStarted, setTestStarted] = useState(false);
  const [testResults, setTestResults] = useState({}); // To store test answers
  const [testResultsThree, settestResultsThree] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]); // To store questions from the backend
  const [filteredQuestions, setFilteredQuestions] = useState([]); // To store filtered questions based on selectedID
  const router = useRouter(); // Routerni ishlatish uchun
  const [openModal, setOpenModal] = useState(false); // Modalni boshqarish uchun state

  const handleModalClose = () => {
    setOpenModal(false); // Modalni yopish
  }

  const handleVerify = async () => {
    if (!idName) {
      setMessage("ID Name ni kiritish majburiy!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get("https://farxunda-khadji.uz/api/register-client", {
        params: { idName },
      });

      if (response.data.success) {
        setMessage("Success! ID Name mavjud.");
        setOpenModal(false); // Modalni yopish
      } else {
        setMessage("ID Name mos kelmadi.");
      }
    } catch (error) {
      // console.error("Xato yuz berdi:", error);
      setMessage("Tekshirishda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };


  // Fetch questions from backend when component mounts
  const fetchQuestions = async () => {
    try {
      let apiUrl = "";

      // Backend URLni tanlash
      if (selectedID === "1") {
        apiUrl = "https://farxunda-khadji.uz/api/test-questions";
      } else if (selectedID === "2") {
        apiUrl = "https://farxunda-khadji.uz/api/test-question-two";
      } else if (selectedID === "3") {
        apiUrl = "https://farxunda-khadji.uz/api/test-question-three";
      }

      // Backenddan testlarni olish
      if (apiUrl) {
        const response = await axios.get(apiUrl);
        if (response.data && Array.isArray(response.data.testQuestions)) {
          const fetchedQuestions = response.data.testQuestions;
          setQuestions(fetchedQuestions); // Testlarni o‘rnatish

          // Tanlangan ID uchun testlarni filtrlash
          const filtered = filterQuestionsByID(fetchedQuestions);
          setFilteredQuestions(filtered); // Filtrlangan testlarni o‘rnatish
        }
      }
    } catch (error) {
      console.error("Ошибка при получении вопросов:", error);
    }
  };

  //   fetchQuestions();
  // }, [selectedID]); // sel

  // Handle user registration
  const handleRegister = async () => {
    try {
        const response = await axios.post("https://farxunda-khadji.uz/api/register", { email, password });
        if (response.data.success) {
            setIsRegistered(true); // Email jo'natish yo'q, bevosita keyingi bosqichga o'tadi
        }
    } catch (error) {
        console.error(error);
        alert("Произошла ошибка при регистрации.");
    }
};


  // Handle ID verification
  const handleVerifyID = async () => {
    try {
      const response = await axios.post("https://farxunda-khadji.uz/api/verify-id", { email, inputID });
      if (response.data.success) {
        setIdVerified(true);
        setOpenModal(true); // Modalni ochish
      } else {
        alert("Неверный ID. Попробуйте снова.");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка при проверке ID.");
    }
  };

  // Filter questions based on selected ID
  const filterQuestionsByID = (questions) => {
    if (selectedID === "1") {
      return questions.filter((_, index) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26].includes(index));
    } else if (selectedID === "2") {
      return questions.filter((_, index) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].includes(index));
    } else if (selectedID === "3") {
      return questions.filter((_, index) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].includes(index));
    }
    return questions;
  };


  // Complete user registration and start test
  const handleCompleteRegistration = async () => {
    const { name, age, gender, companyName, region } = additionalInfo;

    if (!name || !age || !gender || !companyName || !region) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    try {
      const response = await axios.post("https://farxunda-khadji.uz/api/complete-registration", { email, ...additionalInfo });
      if (response.data.success) {
        // Testlarni yuklash va filtrlash
        await fetchQuestions(); // Testlarni qayta yuklash
        setTestStarted(true); // Testni boshlash
        alert("Добро пожаловать на тест!");
      }
    } catch (error) {
      console.error(error);
      alert("Произошла ошибка при завершении регистрации.");
    }
  };

  // Handle test answers selection
  const handleTestAnswer = (questionIndex, value) => {
    setTestResults((prevResults) => ({
      ...prevResults,
      [filteredQuestions[questionIndex]._id]: value // Savol ID'si bilan javobni saqlash
    }));
  };
  const handleSubmitTest = async () => {
    // **1️⃣ TestQuestionTwo natijalarini formatlash**
    const formattedTestResults = Object.keys(testResults).map((questionId) => ({
      questionId,
      answer: testResults[questionId],
    }));

    // **2️⃣ TestQuestionThree natijalarini formatlash (Belbin testi)**
    // **2️⃣ TestQuestionThree natijalarini formatlash (Belbin testi)**
    const formattedTestResultsThree = Object.entries(testResultsThree).map(([questionId, answer]) => ({
      questionId: questionId.trim(), // ✅ ID ning bo‘sh joylarini olib tashlash
      answer: answer.trim(), // ✅ Javob matnini tekislash
    }));


    const payload = {
      email,
      password,
      name: additionalInfo.name,
      age: additionalInfo.age,
      gender: additionalInfo.gender,
      companyName: additionalInfo.companyName,
      region: additionalInfo.region,
      selectedID: additionalInfo.selectedID,
      testResult: formattedTestResults, // ✅ TestQuestionTwo natijalari
      testResultThree: formattedTestResultsThree, // ✅ TestQuestionThree (Belbin) natijalari
      idName: idName,
    };

    // **3️⃣ Ma'lumotlarni localStorage'ga saqlash**
    localStorage.setItem("submittedTestData", JSON.stringify(payload));

    console.log("🟢 Yuborilayotgan ma'lumotlar:", payload);

    try {
      // **4️⃣ Test natijalarini bazaga saqlash**
      const response = await axios.post("https://farxunda-khadji.uz/api/submit-test", payload);

      if (response.data.message) {
        console.log("🟢 Test muvaffaqiyatli saqlandi");

        // **5️⃣ TestQuestionTwo natijalarini hisoblash**
        const calculationResponseTwo = await axios.post("https://farxunda-khadji.uz/api/test-question-two/calculate-results", {
          email,
          answers: formattedTestResults,
        });

        if (calculationResponseTwo.data.success) {
          console.log("🟢 TestQuestionTwo natijalari oborobotka qilindi");
        } else {
          console.warn("⚠️ TestQuestionTwo oborobotka vaqtida xatolik yuz berdi:", calculationResponseTwo.data.message);
        }

        // **6️⃣ TestQuestionThree natijalarini hisoblash (Belbin testi)**
        const calculationResponseThree = await axios.post("https://farxunda-khadji.uz/api/test-question-three/calculate-results", {
          email,
          answers: formattedTestResultsThree,
        });

        if (calculationResponseThree.data.success) {
          console.log("🟢 TestQuestionThree natijalari oborobotka qilindi");
        } else {
          console.warn("⚠️ TestQuestionThree oborobotka vaqtida xatolik yuz berdi:", calculationResponseThree.data.message);
        }

        // **7️⃣ Userga ogohlantirish**
        setAlertData({ type: "success", message: "Тест успешно отправлен. Ваши результаты будут обработаны." });

        setTimeout(() => {
          // window.location.href = "http://localhost:3000";
        }, 3000);
      } else {
        setAlertData({ type: "error", message: "Ошибка при отправке теста. Попробуйте еще раз." });
      }
    } catch (error) {
      console.error("🔴 Serverga yuborishda xatolik:", error);
      setAlertData({ type: "error", message: "Произошла ошибка при отправке теста. Попробуйте еще раз." });
    }
  };




  // Handle input changes for additional user information
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdditionalInfo({ ...additionalInfo, [name]: value });
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 5, p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
  {!isRegistered && !testStarted && (
    <>
      <Typography variant="h6" mb={2}>Регистрация</Typography>
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
        label="Пароль"
        variant="outlined"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleRegister} sx={{ width: "100%" }}>
        Зарегистрироваться
      </Button>
    </>
  )}

  {/* ID tasdiqlash bosqichi olib tashlandi */}

  {isRegistered && !testStarted && (
    <>
      <Typography variant="h6" mb={2}>Введите дополнительные данные</Typography>
      <TextField
        fullWidth
        label="Имя"
        name="name"
        variant="outlined"
        value={additionalInfo.name}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Возраст"
        name="age"
        type="number"
        variant="outlined"
        value={additionalInfo.age}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <Select
        fullWidth
        name="gender"
        value={additionalInfo.gender}
        onChange={handleChange}
        sx={{ mb: 2 }}
        displayEmpty
      >
        <MenuItem value="" disabled>Выберите пол</MenuItem>
        <MenuItem value="Мужчина">Мужчина</MenuItem>
        <MenuItem value="Женщина">Женщина</MenuItem>
      </Select>

          <TextField
            fullWidth
            label="Название компании"
            name="companyName"
            variant="outlined"
            value={additionalInfo.companyName}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <Select
            fullWidth
            label="Выберите регион"
            name="region"
            value={additionalInfo.region || ""}
            onChange={handleChange}
            sx={{ mb: 2 }}
            displayEmpty
          >

            <MenuItem value="" disabled>
              Выберите регион
            </MenuItem>
            <MenuItem value="Москва">Москва</MenuItem>
            <MenuItem value="Санкт-Петербург">Санкт-Петербург</MenuItem>
            <MenuItem value="Севастополь">Севастополь</MenuItem>
            <MenuItem value="Республика Адыгея">Республика Адыгея</MenuItem>
            <MenuItem value="Республика Алтай">Республика Алтай</MenuItem>
            <MenuItem value="Республика Башкортостан">Республика Башкортостан</MenuItem>
            <MenuItem value="Республика Бурятия">Республика Бурятия</MenuItem>
            <MenuItem value="Республика Дагестан">Республика Дагестан</MenuItem>
            <MenuItem value="Республика Ингушетия">Республика Ингушетия</MenuItem>
            <MenuItem value="Кабардино-Балкарская Республика">Кабардино-Балкарская Республика</MenuItem>
            <MenuItem value="Республика Калмыкия">Республика Калмыкия</MenuItem>
            <MenuItem value="Карачаево-Черкесская Республика">Карачаево-Черкесская Республика</MenuItem>
            <MenuItem value="Республика Карелия">Республика Карелия</MenuItem>
            <MenuItem value="Республика Коми">Республика Коми</MenuItem>
            <MenuItem value="Республика Крым">Республика Крым</MenuItem>
            <MenuItem value="Республика Марий Эл">Республика Марий Эл</MenuItem>
            <MenuItem value="Республика Мордовия">Республика Мордовия</MenuItem>
            <MenuItem value="Республика Саха (Якутия)">Республика Саха (Якутия)</MenuItem>
            <MenuItem value="Республика Северная Осетия — Алания">Республика Северная Осетия — Алания</MenuItem>
            <MenuItem value="Республика Татарстан">Республика Татарстан</MenuItem>
            <MenuItem value="Республика Тыва">Республика Тыва</MenuItem>
            <MenuItem value="Удмуртская Республика">Удмуртская Республика</MenuItem>
            <MenuItem value="Республика Хакасия">Республика Хакасия</MenuItem>
            <MenuItem value="Чеченская Республика">Чеченская Республика</MenuItem>
            <MenuItem value="Чувашская Республика">Чувашская Республика</MenuItem>
            <MenuItem value="Алтайский край">Алтайский край</MenuItem>
            <MenuItem value="Забайкальский край">Забайкальский край</MenuItem>
            <MenuItem value="Камчатский край">Камчатский край</MenuItem>
            <MenuItem value="Краснодарский край">Краснодарский край</MenuItem>
            <MenuItem value="Красноярский край">Красноярский край</MenuItem>
            <MenuItem value="Пермский край">Пермский край</MenuItem>
            <MenuItem value="Приморский край">Приморский край</MenuItem>
            <MenuItem value="Ставропольский край">Ставропольский край</MenuItem>
            <MenuItem value="Хабаровский край">Хабаровский край</MenuItem>
            <MenuItem value="Амурская область">Амурская область</MenuItem>
            <MenuItem value="Архангельская область">Архангельская область</MenuItem>
            <MenuItem value="Астраханская область">Астраханская область</MenuItem>
            <MenuItem value="Белгородская область">Белгородская область</MenuItem>
            <MenuItem value="Брянская область">Брянская область</MenuItem>
            <MenuItem value="Владимирская область">Владимирская область</MenuItem>
            <MenuItem value="Волгоградская область">Волгоградская область</MenuItem>
            <MenuItem value="Вологодская область">Вологодская область</MenuItem>
            <MenuItem value="Воронежская область">Воронежская область</MenuItem>
            <MenuItem value="Ивановская область">Ивановская область</MenuItem>
            <MenuItem value="Иркутская область">Иркутская область</MenuItem>
            <MenuItem value="Калининградская область">Калининградская область</MenuItem>
            <MenuItem value="Калужская область">Калужская область</MenuItem>
            <MenuItem value="Кемеровская область">Кемеровская область</MenuItem>
            <MenuItem value="Кировская область">Кировская область</MenuItem>
            <MenuItem value="Костромская область">Костромская область</MenuItem>
            <MenuItem value="Курганская область">Курганская область</MenuItem>
            <MenuItem value="Курская область">Курская область</MenuItem>
            <MenuItem value="Ленинградская область">Ленинградская область</MenuItem>
            <MenuItem value="Липецкая область">Липецкая область</MenuItem>
            <MenuItem value="Магаданская область">Магаданская область</MenuItem>
            <MenuItem value="Московская область">Московская область</MenuItem>
            <MenuItem value="Мурманская область">Мурманская область</MenuItem>
            <MenuItem value="Нижегородская область">Нижегородская область</MenuItem>
            <MenuItem value="Новгородская область">Новгородская область</MenuItem>
            <MenuItem value="Новосибирская область">Новосибирская область</MenuItem>
            <MenuItem value="Омская область">Омская область</MenuItem>
            <MenuItem value="Оренбургская область">Оренбургская область</MenuItem>
            <MenuItem value="Орловская область">Орловская область</MenuItem>
            <MenuItem value="Пензенская область">Пензенская область</MenuItem>
            <MenuItem value="Псковская область">Псковская область</MenuItem>
            <MenuItem value="Ростовская область">Ростовская область</MenuItem>
            <MenuItem value="Рязанская область">Рязанская область</MenuItem>
            <MenuItem value="Самарская область">Самарская область</MenuItem>
            <MenuItem value="Саратовская область">Саратовская область</MenuItem>
            <MenuItem value="Сахалинская область">Сахалинская область</MenuItem>
            <MenuItem value="Свердловская область">Свердловская область</MenuItem>
            <MenuItem value="Смоленская область">Смоленская область</MenuItem>
            <MenuItem value="Тамбовская область">Тамбовская область</MenuItem>
            <MenuItem value="Тверская область">Тверская область</MenuItem>
            <MenuItem value="Томская область">Томская область</MenuItem>
            <MenuItem value="Тульская область">Тульская область</MenuItem>
            <MenuItem value="Тюменская область">Тюменская область</MenuItem>
            <MenuItem value="Ульяновская область">Ульяновская область</MenuItem>
            <MenuItem value="Челябинская область">Челябинская область</MenuItem>
            <MenuItem value="Ярославская область">Ярославская область</MenuItem>
            <MenuItem value="Еврейская автономная область">Еврейская автономная область</MenuItem>
            <MenuItem value="Ненецкий автономный округ">Ненецкий автономный округ</MenuItem>
            <MenuItem value="Ханты-Мансийский автономный округ — Югра">Ханты-Мансийский автономный округ — Югра</MenuItem>
            <MenuItem value="Чукотский автономный округ">Чукотский автономный округ</MenuItem>
            <MenuItem value="Ямало-Ненецкий автономный округ">Ямало-Ненецкий автономный округ</MenuItem>
          </Select>


          <Select
            fullWidth
            label="ID"
            name="selectedID"
            value={additionalInfo.selectedID}
            onChange={handleChange}
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Выберите ИД
            </MenuItem>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
          </Select>

          <Button variant="contained" onClick={handleCompleteRegistration} sx={{ width: "100%" }}>
            Завершить
          </Button>
        </>
      )}

      {testStarted && filteredQuestions.length > 0 && (
        <>
          <Typography variant="h6" mb={2}>
            Тест
          </Typography>
          {filteredQuestions.map((question, index) => (
            <Box key={question._id} sx={{ mb: 3 }}>
              <Typography variant="body1" mb={2}>
                <strong>{index + 1}. {question.question}</strong>
              </Typography>
              <RadioGroup
                value={testResults[question._id] || ""}
                onChange={(e) => handleTestAnswer(index, e.target.value)}
              >
                {question.options.map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </Box>
          ))}
          <Button variant="contained" color="primary" onClick={handleSubmitTest} sx={{ width: "100%", mt: 2 }}>
            Отправить
          </Button>

          {alertData && (
            <Alert severity={alertData.type} sx={{ mt: 2 }}>
              {alertData.message}
            </Alert>
          )}
        </>
      )}

      {testStarted && filteredQuestions.length === 0 && (
        <Alert severity="error">Нет доступных тестовых вопросов для выбранного ID!</Alert>
      )}

    </Box>
  );
};

export default RegisterVerify;
