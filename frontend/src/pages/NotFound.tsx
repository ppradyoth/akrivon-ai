import { Link } from "react-router-dom";
import Section from "../components/Section";

export default function NotFound() {
  return (
    <Section
      eyebrow="404"
      title="Page not found"
      description="The page you requested does not exist or has moved."
    >
      <Link to="/" className="button-primary">
        Return Home
      </Link>
    </Section>
  );
}
