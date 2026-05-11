import Section from "../components/Section";

export default function Cookies() {
  return (
    <>
      <Section
        eyebrow="Legal"
        title="Cookie Policy"
        description="Information about cookies and similar technologies used on Akrivon properties."
      />

      <Section title="Cookie categories">
        <ul className="list">
          <li>Essential cookies for authentication and session security</li>
          <li>Performance cookies for product reliability insights</li>
          <li>Preference cookies to remember user interface settings</li>
        </ul>
      </Section>

      <Section title="Managing cookies">
        <p className="paragraph">
          You can control cookie behavior through browser settings. Disabling certain cookies may affect app
          functionality including authentication and saved preferences.
        </p>
      </Section>
    </>
  );
}
