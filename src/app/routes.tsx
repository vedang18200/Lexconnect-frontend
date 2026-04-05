import { createBrowserRouter } from "react-router";
import { RootLayoutWrapper } from "./components/RootLayoutWrapper";
import { Login } from "./pages/Login";
import { Register } from "./pages/Registration";
import { NotFound } from "./pages/NotFound";

// Citizen pages
import { CitizenDashboard } from "./pages/citizen/Dashboard";
import { FindLawyers } from "./pages/citizen/FindLawyers";
import { MyCases } from "./pages/citizen/MyCases";
import { MyConsultations } from "./pages/citizen/MyConsultations";
import { Messages } from "./pages/citizen/Messages";
import { CitizenProfile } from "./pages/citizen/Profile";

// Lawyer pages
import { LawyerDashboard } from "./pages/lawyer/Dashboard";
import { LawyerProfile } from "./pages/lawyer/Profile";
import { LawyerCases } from "./pages/lawyer/Cases";
import { LawyerClients } from "./pages/lawyer/Clients";
import { LawyerCalendar } from "./pages/lawyer/Calendar";
import { LawyerBilling } from "./pages/lawyer/Billing";
import { LawyerMessages } from "./pages/lawyer/Messages";

// Social Worker pages
import { SocialWorkerDashboard } from "./pages/social-worker/Dashboard";
import { Referrals } from "./pages/social-worker/Referrals";
import { LawyerDirectory } from "./pages/social-worker/LawyerDirectory";
import { ReferralCases } from "./pages/social-worker/ReferralCases";
import { SocialWorkerMessages } from "./pages/social-worker/Messages";
import { SocialWorkerProfile } from "./pages/social-worker/Profile";

export const router = createBrowserRouter([
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: RootLayoutWrapper,
    children: [
      // Citizen routes
      { index: true, Component: CitizenDashboard },
      { path: "find-lawyers", Component: FindLawyers },
      { path: "my-cases", Component: MyCases },
      { path: "my-consultations", Component: MyConsultations },
      { path: "messages", Component: Messages },
      { path: "citizen-profile", Component: CitizenProfile },

      // Lawyer routes
      { path: "lawyer-dashboard", Component: LawyerDashboard },
      { path: "lawyer-profile", Component: LawyerProfile },
      { path: "lawyer-cases", Component: LawyerCases },
      { path: "lawyer-clients", Component: LawyerClients },
      { path: "lawyer-calendar", Component: LawyerCalendar },
      { path: "lawyer-billing", Component: LawyerBilling },
      { path: "lawyer-messages", Component: LawyerMessages },

      // Social Worker routes
      { path: "social-worker-dashboard", Component: SocialWorkerDashboard },
      { path: "referrals", Component: Referrals },
      { path: "lawyer-directory", Component: LawyerDirectory },
      { path: "referral-cases", Component: ReferralCases },
      { path: "social-worker-messages", Component: SocialWorkerMessages },
      { path: "social-worker-profile", Component: SocialWorkerProfile },

      { path: "*", Component: NotFound },
    ],
  },
]);
