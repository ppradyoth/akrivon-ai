import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import About from "./pages/About";
import Architecture from "./pages/Architecture";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Careers from "./pages/Careers";
import CaseStudies from "./pages/CaseStudies";
import Changelog from "./pages/Changelog";
import Contact from "./pages/Contact";
import Cookies from "./pages/Cookies";
import Demo from "./pages/Demo";
import Docs from "./pages/Docs";
import Enforce from "./pages/Enforce";
import Ethics from "./pages/Ethics";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Product from "./pages/Product";
import Research from "./pages/Research";
import Security from "./pages/Security";
import Terms from "./pages/Terms";
import Trust from "./pages/Trust";
import UseCases from "./pages/UseCases";
import Why from "./pages/Why";
import WhyAkrivon from "./pages/WhyAkrivon";
import WhatsUnique from "./pages/WhatsUnique";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="product" element={<Product />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="use-cases" element={<UseCases />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="why" element={<Why />} />
        <Route path="why-akrivon" element={<WhyAkrivon />} />
        <Route path="whats-unique" element={<WhatsUnique />} />
        <Route path="enforce" element={<Enforce />} />
        <Route path="intentscan" element={<Demo />} />
        <Route path="demo" element={<Navigate to="/intentscan" replace />} />

        <Route path="security" element={<Security />} />
        <Route path="trust" element={<Trust />} />
        <Route path="ethics" element={<Ethics />} />

        <Route path="docs" element={<Docs />} />
        <Route path="architecture" element={<Architecture />} />
        <Route path="research" element={<Research />} />

        <Route path="about" element={<About />} />
        <Route path="careers" element={<Careers />} />
        <Route path="contact" element={<Contact />} />

        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="case-studies" element={<CaseStudies />} />
        <Route path="changelog" element={<Changelog />} />

        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="cookies" element={<Cookies />} />

        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
