import { createBrowserRouter } from "react-router";
import CreateCard from "./pages/CreateCard";
import CardLanding from "./pages/CardLanding";
import CardReveal from "./pages/CardReveal";
import GiftSelection from "./pages/GiftSelection";
import CardSummary from "./pages/CardSummary";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/create",
    Component: CreateCard,
  },
  {
    path: "/card/:cardId",
    Component: CardLanding,
  },
  {
    path: "/card/:cardId/reveal",
    Component: CardReveal,
  },
  {
    path: "/card/:cardId/gift",
    Component: GiftSelection,
  },
  {
    path: "/card/:cardId/summary",
    Component: CardSummary,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);