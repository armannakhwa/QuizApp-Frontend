import React, { useState, useEffect } from "react";
import { Route, Routes,useParams  } from "react-router-dom";
import {
  Box,
  Text,
  VStack,
  Radio,
  RadioGroup,
  Button,
  Container,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Center,
} from "@chakra-ui/react";
import axios from "axios";
import Navbar from "./navbar";

const TestLink = () => {
  const [questions, setQuestions] = useState([]);
  const [category, setCategory] = useState("");
  const [lang_id, setLangId] = useState("");
  const [initialRenderQuestions, setInitialRenderQuestions] = useState(true);
  const [initialRenderAnswers, setInitialRenderAnswers] = useState(true);
  if(!localStorage.getItem("userInfo"))
  {
    // alert("please login first");
    window.location.href="/"
  }
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [languages, setLanguages] = useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [responseDetails, setResponseDetails] = useState({});
  const [shouldShow, setShouldShow] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  let { id } = useParams(); 
  console.log(id)


  const fetchLanguages = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.get(
        `https://quizapp-l0he.onrender.com/quiz/languages`,
        config
      );
      setLanguages(response.data);
    } catch (error) {
      console.error("Error fetching language data:", error);
    }
  };

  const getQuestions = async (lang_id, category) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.post(
        "https://quizapp-l0he.onrender.com/quiz/questions",
        {
          language_id: lang_id,
          category: category,
        },
        config
      );
      if (lang_id && category) {
        setQuestions(response.data);
      }
    } catch (err) {
      console.log("Error occurred in fetching questions from the database");
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLanguages();
 
      setCategory("easy")

  }, []);

  useEffect(() => {
    // This will prevent the first render
    if (initialRenderQuestions) {
      setInitialRenderQuestions(false);
      return;
    }
    if (lang_id !== "" && category !== "") {
      getQuestions(lang_id, category);
      setShouldShow(true);
    } else {
      setShouldShow(false);
    }
  }, [lang_id, category]);

  // This part of code will fill "-1" as answer of every mcq questions whenever the questions are set
  useEffect(() => {
    // This will prevent the first render
    if (initialRenderAnswers) {
      setInitialRenderAnswers(false);
      return;
    }
    if (questions.length) {
      setSelectedAnswers((prevSelectedAnswers) => {
        const updatedAnswers = { ...prevSelectedAnswers };
        questions.forEach((question) => {
          updatedAnswers[question._id] = "-1";
        });
        return updatedAnswers;
      });
    }
  }, [questions]);

  const handleOptionSelect = (questionId, selectedOption) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: selectedOption,
    });
  };
  const handleSubmit = async () => {
    try {
      const dataToSend = {
        uid: userInfo._id,
        pairs: Object.entries(selectedAnswers).map(
          ([objectId, givenAnswer]) => ({
            objectId: objectId,
            givenAnswer: givenAnswer,
          })
        ),
      };
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.post(
        "https://quizapp-l0he.onrender.com/quiz/answers",
        dataToSend,
        config
      );
      setResponseDetails(response.data);
      onOpen();
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Error submitting test. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
        <ModalOverlay />
        <ModalContent
          textAlign="center"
          maxW={{ base: "95%", md: "lg", lg: "2xl" }}
        >
          <ModalHeader fontSize="3xl">Quiz Result</ModalHeader>
          <ModalCloseButton />
          <ModalBody fontSize="xl">
            <Text>Total Questions: {responseDetails.totalMarks}</Text>
            <Text>Attempted: {responseDetails.attempted}</Text>
            <Text>Unattempted: {responseDetails.unAttempted}</Text>
            <Text>Correctly Answered: {responseDetails.corrected}</Text>
            <Text>Incorectly Answered: {responseDetails.incorrected}</Text>
            <Text>Total Marks: {responseDetails.totalMarks}</Text>
            <Text>Your Score: {responseDetails.score}</Text>
            <Text>Accuracy: {responseDetails.accuracy}%</Text>
            <Text>Negative Marking Per Each Question: -0.5(50%)</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Container maxW="xl" py={8} px={4} mt={12}>
        <Text
          textAlign="center"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight="bold"
          color="white"
          mt={3}
          mb={5}
        >
           Quiz
        </Text>
        <Select
          placeholder="Select Language"
          value={lang_id}
          onChange={(e) => {
            setLangId(e.target.value);
            console.log(e.target.value)
            
          }}
          background="white"
          mb={5}
          fontSize="xl"
          textAlign="center"
        >
          {languages.map((language) => (
            <option key={language} value={language}>
              {language.toUpperCase()}
            </option>
          ))}
        </Select>

        {/* <Select
          id="difficulty"
          background="white"
          mb={5}
          placeholder="Select Difficulty"
          value={category}
          fontSize="xl"
          textAlign="center"
          onChange={(e) => {
            setCategory(e.target.value);
          }}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select> */}
        {shouldShow ? (
          <VStack spacing={4}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="white"
              textAlign="center"
            >
             Test Link: {window.location.origin}/testpage/{lang_id}
            </Text>
            <form>
              {questions.map((question, ind) => (
                <Box
                  key={question._id}
                  borderWidth="1px"
                  p={4}
                  borderRadius="md"
                  background="white"
                  fontSize="xl"
                  mb={5}
                >
                  <Text mb={5}>
                    {ind + 1}. {question.desc}
                  </Text>
                  <RadioGroup
                    value={selectedAnswers[question._id] || "-1"}
                    onChange={(value) =>
                      handleOptionSelect(question._id, value)
                    }
                    display="flex"
                    flexDirection="column"
                  >
                    {JSON.parse(question.options).map((option, index) => (
                      <Radio key={index} value={index.toString()} mb={5}>
                        {option}
                      </Radio>
                    ))}
                  </RadioGroup>
                </Box>
              ))}
              <Center>
                {/* <Button colorScheme="blue" mt={4} onClick={handleSubmit}>
                  Submit Test
                </Button> */}
              </Center>
            </form>
          </VStack>
        ) : (
          <Text mt={5} fontSize="xl" color="white" textAlign="center">
            {/* Select a language and the difficulty level for the quiz */}
          </Text>
        )}
      </Container>
    </>
  );
};

export default TestLink;