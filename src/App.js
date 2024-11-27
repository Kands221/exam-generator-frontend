import React, { useState } from 'react';
import axios from 'axios';
import {
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Paper,
  ThemeProvider,
  createTheme,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  LinearProgress,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload, Check, Clear, School } from '@mui/icons-material';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1565c0 30%, #7b1fa2 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
  },
});

// Styled components
const UploadZone = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  border: '2px dashed rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
  },
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

function App() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [rateLimit, setRateLimit] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setQuestions([]);
    setSelectedAnswers({});
    setScore(null);
    setSubmitted(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('questionType', questionType);

    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'exam-gen-backend.vercel.app';
      const apiUrl = baseUrl.replace(/\/+$/, '');
      
      const response = await axios.post(`${apiUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      setQuestions(response.data.questions);
      if (response.data.rate_limit) {
        setRateLimit(response.data.rate_limit);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        // Rate limit exceeded
        setError(`${err.response.data.message}`);
        setRateLimit(err.response.data.rate_limit);
      } else {
        console.error('Error:', err);
        setError(err.response?.data?.error || 'An error occurred while processing your request');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const isAnswerCorrect = (question, userAnswer) => {
    if (!userAnswer || !question?.correct_answer) return false;
    
    if (question.type === 'fill_in_blank') {
      return userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim();
    } else if (question.type === 'multiple_choice' || question.type === 'identification') {
      // Get the index of the selected answer (0 for first option, 1 for second, etc.)
      const selectedIndex = question.options?.findIndex(option => option === userAnswer) ?? -1;
      if (selectedIndex === -1) return false;
      // Convert index to letter (0 -> 'A', 1 -> 'B', etc.)
      const selectedLetter = String.fromCharCode(65 + selectedIndex);
      // Compare with correct answer letter
      return question.correct_answer?.trim() === selectedLetter;
    }
    return false;
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      const isCorrect = isAnswerCorrect(question, selectedAnswers[index]);
      if (isCorrect) {
        correctCount++;
      }
      console.log('Question:', question.question);
      console.log('User Answer:', selectedAnswers[index]);
      console.log('Correct Answer:', question.correct_answer);
      console.log('Is Correct:', isCorrect);
    });
    setScore((correctCount / questions.length) * 100);
    setSubmitted(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #e0f2ff 0%, #f5e6ff 100%)',
        py: 4
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <IconButton 
              sx={{ 
                mb: 2, 
                p: 2, 
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.2)' }
              }}
            >
              <School sx={{ fontSize: 40, color: 'primary.main' }} />
            </IconButton>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
              AI Exam Generator
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Transform your PDF documents into interactive multiple-choice questions
            </Typography>
          </Box>

          <Paper 
            elevation={3} 
            sx={{ 
              position: 'relative', 
              overflow: 'hidden',
              p: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {loading && (
              <LinearProgress 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)'
                }} 
              />
            )}

            <Box sx={{ mb: 4 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Question Type
                </Typography>
                <RadioGroup
                  row
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                >
                  <FormControlLabel
                    value="multiple_choice"
                    control={<Radio />}
                    label="Multiple Choice"
                    sx={{ 
                      flex: 1,
                      mr: 0,
                      '& .MuiFormControlLabel-label': { flex: 1 }
                    }}
                  />
                  <FormControlLabel
                    value="fill_in_blank"
                    control={<Radio />}
                    label="Fill in the Blanks"
                    sx={{ 
                      flex: 1,
                      mr: 0,
                      '& .MuiFormControlLabel-label': { flex: 1 }
                    }}
                  />
                  <FormControlLabel
                    value="identification"
                    control={<Radio />}
                    label="Identification"
                    sx={{ 
                      flex: 1,
                      mr: 0,
                      '& .MuiFormControlLabel-label': { flex: 1 }
                    }}
                  />
                </RadioGroup>
              </FormControl>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <UploadZone>
                  <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Drop your PDF here or click to browse
                  </Typography>
                  {file && (
                    <Typography variant="body2" color="text.secondary">
                      Selected: {file.name}
                    </Typography>
                  )}
                </UploadZone>
              </label>

              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                disabled={!file || loading}
                sx={{ mt: 2, height: 48 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Questions'}
              </Button>
            </Box>

            <Snackbar 
              open={!!error} 
              autoHideDuration={6000} 
              onClose={() => setError(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Snackbar>

            {rateLimit && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You have {rateLimit.remaining} questions generations remaining today. 
                Resets at {new Date(rateLimit.reset_time).toLocaleString()}
              </Alert>
            )}

            {questions.length > 0 && (
              <Box sx={{ mt: 4 }}>
                {questions.map((question, index) => (
                  <QuestionCard key={index}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {index + 1}. {question.question}
                      </Typography>
                      
                      {question.type === 'fill_in_blank' ? (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your answer here"
                            value={selectedAnswers[index] || ''}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            disabled={submitted}
                            sx={{ mb: 2 }}
                          />
                          {submitted && (
                            <Box sx={{ 
                              mt: 1,
                              p: 2,
                              borderRadius: 1,
                              bgcolor: 'background.paper',
                              border: 1,
                              borderColor: isAnswerCorrect(question, selectedAnswers[index])
                                ? 'success.main'
                                : 'error.main'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mr: 1 }}>
                                  Your Answer:
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: isAnswerCorrect(question, selectedAnswers[index])
                                      ? 'success.main'
                                      : 'error.main'
                                  }}
                                >
                                  {selectedAnswers[index] || '(No answer provided)'}
                                  {isAnswerCorrect(question, selectedAnswers[index]) ? (
                                    <Check sx={{ ml: 1, verticalAlign: 'middle' }} color="success" />
                                  ) : (
                                    <Clear sx={{ ml: 1, verticalAlign: 'middle' }} color="error" />
                                  )}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mr: 1 }}>
                                  Correct Answer:
                                </Typography>
                                <Typography variant="body1" color="success.main">
                                  {question.correct_answer}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box>
                          <FormControl component="fieldset" fullWidth>
                            <RadioGroup
                              value={selectedAnswers[index] || ''}
                              onChange={(e) => handleAnswerChange(index, e.target.value)}
                            >
                              {question.options?.map((option, optIndex) => {
                                const optionLetter = String.fromCharCode(65 + optIndex);
                                const isCorrect = question.correct_answer?.trim() === optionLetter;
                                return (
                                <FormControlLabel
                                  key={optIndex}
                                  value={option}
                                  control={<Radio />}
                                  label={
                                    <Box sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      width: '100%',
                                      p: 1,
                                      borderRadius: 1,
                                      ...(submitted && {
                                        bgcolor: isCorrect
                                          ? 'success.light'
                                          : selectedAnswers[index] === option
                                            ? 'error.light'
                                            : 'transparent'
                                      })
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography>
                                          {optionLetter}. {option}
                                        </Typography>
                                        {submitted && isCorrect && (
                                          <Typography 
                                            variant="body2" 
                                            color="success.main" 
                                            sx={{ ml: 1, fontWeight: 'medium' }}
                                          >
                                            (Correct Answer)
                                          </Typography>
                                        )}
                                      </Box>
                                      {submitted && (
                                        isCorrect ? (
                                          <Check color="success" />
                                        ) : selectedAnswers[index] === option ? (
                                          <Clear color="error" />
                                        ) : null
                                      )}
                                    </Box>
                                  }
                                  sx={{ 
                                    width: '100%',
                                    mb: 1,
                                    '&:hover': {
                                      bgcolor: 'action.hover',
                                      borderRadius: 1
                                    }
                                  }}
                                />
                              )})}
                            </RadioGroup>
                          </FormControl>
                          {submitted && !isAnswerCorrect(question, selectedAnswers[index]) && (
                            <Box sx={{ 
                              mt: 2,
                              p: 2,
                              borderRadius: 1,
                              bgcolor: 'error.light',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <Clear color="error" sx={{ mr: 1 }} />
                              <Typography variant="body1" color="error.dark">
                                Incorrect. The correct answer is: {question.correct_answer}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </QuestionCard>
                ))}

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={calculateScore}
                    disabled={Object.keys(selectedAnswers).length !== questions.length || submitted}
                    sx={{ minWidth: 200 }}
                  >
                    Submit Answers
                  </Button>

                  {score !== null && (
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        mt: 3, 
                        p: 3,
                        background: score >= 80 
                          ? 'linear-gradient(45deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.1))'
                          : score >= 60
                            ? 'linear-gradient(45deg, rgba(255, 152, 0, 0.1), rgba(255, 167, 38, 0.1))'
                            : 'linear-gradient(45deg, rgba(244, 67, 54, 0.1), rgba(239, 83, 80, 0.1))'
                      }}
                    >
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: score >= 80 
                            ? 'success.main'
                            : score >= 60
                              ? 'warning.main'
                              : 'error.main'
                        }}
                      >
                        Your Score: {score.toFixed(1)}%
                      </Typography>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          color: 'text.secondary',
                          mt: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {score >= 80 ? (
                          <>Excellent work! 🎉<Check color="success" sx={{ ml: 1 }} /></>
                        ) : score >= 60 ? (
                          <>Good job! 👍</>
                        ) : (
                          <>Keep practicing! 💪</>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Correct Answers: {Math.round((score / 100) * questions.length)} out of {questions.length}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
