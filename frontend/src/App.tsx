import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { VerificationPage } from "./pages/VerificationPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/verify" element={<VerificationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
