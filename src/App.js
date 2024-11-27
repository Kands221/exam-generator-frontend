import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
}));

function App() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showScore, setShowScore] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setQuestions([]);
    setScore(null);
    setShowScore(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + '/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setQuestions(response.data.questions);
    } catch (err) {
      setError('Error generating questions. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });
    setScore((correctAnswers / questions.length) * 100);
    setShowScore(true);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#1a237e' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Exam Generator
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <StyledPaper elevation={3}>
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
            Generate Multiple Choice Questions from PDF
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Upload PDF
              <VisuallyHiddenInput type="file" onChange={handleFileChange} accept=".pdf" />
            </Button>

            {file && (
              <Typography variant="body2" color="textSecondary">
                Selected file: {file.name}
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!file || loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Questions'}
            </Button>
          </Box>
        </StyledPaper>

        {questions.length > 0 && (
          <StyledPaper elevation={3}>
            <Typography variant="h6" gutterBottom>
              Questions
            </Typography>
            <List>
              {questions.map((question, index) => (
                <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 3 }}>
                  <ListItemText
                    primary={`${index + 1}. ${question.question}`}
                    sx={{ mb: 2 }}
                  />
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={selectedAnswers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                    >
                      {question.options.map((option, optIndex) => (
                        <FormControlLabel
                          key={optIndex}
                          value={option.split(') ')[0]}
                          control={<Radio />}
                          label={option}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={calculateScore}
                disabled={Object.keys(selectedAnswers).length !== questions.length}
              >
                Submit Answers
              </Button>
            </Box>
          </StyledPaper>
        )}

        {showScore && (
          <StyledPaper elevation={3}>
            <Typography variant="h6" align="center" gutterBottom>
              Your Score
            </Typography>
            <Typography variant="h4" align="center" color="primary">
              {score.toFixed(1)}%
            </Typography>
          </StyledPaper>
        )}

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default App;
