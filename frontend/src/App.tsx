import { useState } from "react";
import type { FormEvent } from "react";
import {
  Box,
  Button,
  Chip,
  CssBaseline,
  IconButton,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  CircularProgress,
  Alert,
  createTheme,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import Sidebar from "./Sidebar";

const theme = createTheme({
  palette: {
    primary: { main: "#246b68" },
    background: { default: "#f7f8fa", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
  },
  shape: { borderRadius: 12 },
});

type Mode = "general" | "documents";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function App() {
  const [mode, setMode] = useState<Mode>("general");
  const [question, setQuestion] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canSend =
    !isLoading && question.trim().length > 0 && (mode === "general" || document !== null);

  const  handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;
    if (mode === "documents") {
      setError("Document chat is not connected yet. Please use General mode.");
      return;
    }

    const submittedQuestion = question.trim();
    
    setError(null);
    setIsLoading(true);
    setQuestion("");
    setMessages((previous) => [
      ...previous,
      { role: "user", text: question.trim() },
    ]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ question }),
      });
      if(!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
      setMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        text: result.answer,
      },
    ]);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong.",);
      setQuestion(submittedQuestion);
    } finally {
      setIsLoading(false);
    }
  }

  const handleNewChat = () => {
    setMessages([]);
    setQuestion("");
    setDocument(null);
    setMode("general");
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          display: "flex",
          height: "100dvh",
          overflow: "hidden",
        }}
      >
        <Sidebar onHandleNewChat={handleNewChat} document={document}/>
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: 2, sm: 4 },
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Your workspace
            </Typography>

            <Button onClick={handleNewChat} disabled={isLoading}>New chat</Button>
          </Stack>

          <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 4 } }}>
            <Stack spacing={3} sx={{ maxWidth: 850, mx: "auto" }}>
              {messages.length === 0 && (
                <Box sx={{ py: 8, textAlign: "center" }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    What would you like to explore?
                  </Typography>

                  <Typography color="text.secondary">
                    Ask a general question or attach a document.
                  </Typography>

                  <Chip
                    label="Interface preview · Backend not connected"
                    size="small"
                    sx={{ mt: 3 }}
                  />
                </Box>
              )}

              {messages.map((message, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    maxWidth: "85%",
                    alignSelf:
                      message.role === "user" ? "flex-end" : "flex-start",
                    bgcolor:
                      message.role === "user" ? "#e4f0ed" : "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    {message.role === "user" ? "You" : "Lantern"}
                  </Typography>

                  <Typography
                    sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {message.text}
                  </Typography>
                </Paper>
              ))}
            {isLoading && (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center" }}
              role="status"
            >
              <CircularProgress size={18} />
              <Typography color="text.secondary">
                Lantern is generating an answer…
              </Typography>
            </Stack>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </Box>

          <Box
            component="form"
            onSubmit={handleSend}
            sx={{
              width: "100%",
              maxWidth: 914,
              mx: "auto",
              p: { xs: 2, sm: 4 },
              pt: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ mb: 1.5, flexWrap: "wrap", alignItems: "center" }}
            >
              <ToggleButtonGroup
                value={mode}
                exclusive
                size="small"
                aria-label="Answer mode"
                onChange={(_, nextMode: Mode | null) => {
                  if (nextMode) setMode(nextMode);
                }}
              >
                <ToggleButton value="general">General</ToggleButton>
                <ToggleButton value="documents">My documents</ToggleButton>
              </ToggleButtonGroup>

              <Button
                component="label"
                size="small"
                startIcon={<AttachFileIcon />}
              >
                Attach document
                <input
                  hidden
                  type="file"
                  accept=".txt,text/plain"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      setDocument(file);
                      setMode("documents");
                    }

                    event.target.value = "";
                  }}
                />
              </Button>

              {document && (
                <Chip
                  label={document.name}
                  size="small"
                  onDelete={() => setDocument(null)}
                  sx={{ maxWidth: "100%" }}
                />
              )}
            </Stack>

            <Paper
              variant="outlined"
              sx={{ display: "flex", alignItems: "center", p: 1 }}
            >
              <TextField
                fullWidth
                variant="standard"
                placeholder={
                  mode === "general"
                    ? "Ask a general question..."
                    : "Ask about your document..."
                }
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                slotProps={{
                  input: { disableUnderline: true },
                  htmlInput: { "aria-label": "Your question" },
                }}
                disabled={isLoading}
                sx={{ px: 1 }}
              />

              <IconButton
                type="submit"
                color="primary"
                disabled={!canSend}
                aria-label="Send message"
              >
                <SendIcon />
              </IconButton>
            </Paper>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              {mode === "general"
                ? "General mode answers without searching your documents."
                : document
                  ? "File selected locally. Processing will be added with the backend."
                  : "Attach a .txt document to use this mode."}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
