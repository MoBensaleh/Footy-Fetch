import "./styles/App.module.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage";
import { ThemeProvider, GlobalStyles } from "@mui/material";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: ["Noto Sans Buhid", "sans-serif"].join(","),
  },
  palette: {
    background: {
      default: "#242424"

    },
    primary: {
      main: "#48a4c8",
      contrastText: "#fff",
    },
    secondary: {
      main: "#377892",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles
          styles={{
            body: { backgroundColor: "#242424" },
          }}
        />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
