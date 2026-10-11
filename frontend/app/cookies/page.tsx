import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy | RafikiSupport AI",
  description:
    "Information about authentication cookies, browser storage, and optional tracking on RafikiSupport AI.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      summary="This draft describes how cookies and similar browser technologies should be documented for RafikiSupport AI. The actual cookie inventory must be verified in each deployed environment."
      sections={[
        {
          heading: "1. What cookies and browser storage do",
          paragraphs: [
            "Cookies and similar technologies can maintain a signed-in session, protect accounts, remember preferences, measure usage, or support advertising. A technology's purpose and whether it is essential matter when deciding what notice or consent is required.",
          ],
        },
        {
          heading: "2. Essential authentication and security",
          paragraphs: [
            "The application uses Clerk for authentication. Clerk and the deployed infrastructure may use cookies or related storage to provide sign-in, session management, and security. Do not disable essential authentication mechanisms through a general-purpose preference control if doing so would prevent secure access.",
          ],
        },
        {
          heading: "3. Analytics and optional technologies",
          paragraphs: [
            "The current source-code inspection did not identify a configured analytics product, but this does not prove that the production website sets no optional cookies. Verify browser cookies, local storage, third-party scripts, hosting features, and any tools added later before making a definitive statement.",
            "If non-essential analytics, advertising, or tracking technologies are introduced, identify them, explain their purpose and duration, and obtain consent where required by applicable law. Provide a practical way to change or withdraw consent.",
          ],
        },
        {
          heading: "4. Managing cookies",
          paragraphs: [
            "You can usually inspect or remove cookies through your browser settings. Removing authentication cookies may sign you out or affect functionality. Browser controls do not necessarily replace consent controls required for non-essential technologies.",
          ],
        },
        {
          heading: "5. Changes and contact",
          paragraphs: [
            "Review this policy whenever authentication, analytics, advertising, or other browser technologies change. Publish a verified inventory of the technologies actually in use, including their purposes and lifetimes, before treating this draft as complete.",
          ],
        },
      ]}
    />
  );
}
