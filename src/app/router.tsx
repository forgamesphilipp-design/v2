import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ExplorePage from "../pages/ExplorePage";
import LearnPage from "../pages/LearnPage";
import QuizPage from "../pages/QuizPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
