import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use | RafikiSupport AI",
  description: "Draft terms for using the RafikiSupport AI website and service.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      summary="These draft terms outline basic expectations for accessing the RafikiSupport AI website and software. They must be completed and reviewed by the responsible operator before they are used as a binding agreement."
      sections={[
        {
          heading: "1. Operator and acceptance",
          paragraphs: [
            "The final version must identify the legal entity providing the service, its contact details, and the date the terms take effect. By using the service after valid notice of the final terms, users may be subject to those terms to the extent permitted by applicable law.",
          ],
        },
        {
          heading: "2. Accounts and authorised use",
          paragraphs: [
            "Users are responsible for maintaining the confidentiality of their credentials, using accounts they are authorised to access, and notifying the operator of suspected unauthorised access. Users must not bypass access controls or attempt to access another business's data.",
          ],
        },
        {
          heading: "3. Acceptable use",
          bullets: [
            "Do not use the service for unlawful, deceptive, abusive, or harmful activities.",
            "Do not upload content you lack permission to use or disclose.",
            "Do not attempt to interfere with service availability, probe systems without authorisation, or introduce malicious code.",
            "Do not use generated answers as a substitute for professional advice or as the sole basis for high-impact decisions.",
          ],
        },
        {
          heading: "4. Customer content",
          paragraphs: [
            "You retain any rights you have in content you submit. You must have the rights and permissions needed to provide that content for processing. The final agreement should describe the limited permissions required to host, retrieve, process, and display content to provide the service.",
          ],
        },
        {
          heading: "5. AI-generated responses",
          paragraphs: [
            "Responses may be incomplete, inaccurate, outdated, or unsuitable for a particular situation. Source references can help explain an answer but do not guarantee its correctness. Businesses remain responsible for reviewing their published knowledge and deciding when human support is required.",
          ],
        },
        {
          heading: "6. Availability and changes",
          paragraphs: [
            "The service may be updated, suspended, or unavailable due to maintenance, provider outages, security concerns, or other operational reasons. Any service-level commitments, support hours, pricing, cancellation terms, and refund rules must be expressly documented rather than assumed from this template.",
          ],
        },
        {
          heading: "7. Third-party services",
          paragraphs: [
            "Some functions may depend on third-party infrastructure or services subject to their own terms. The operator should identify relevant providers and explain which third-party terms apply.",
          ],
        },
        {
          heading: "8. Liability and termination",
          paragraphs: [
            "Any warranties, liability limits, indemnities, suspension rights, termination procedures, and post-termination data handling must be drafted for the actual service and reviewed under applicable law. This template does not establish a valid liability exclusion or override mandatory consumer rights.",
          ],
        },
        {
          heading: "9. Governing law and updates",
          paragraphs: [
            "Specify the governing law, dispute-resolution process, and any mandatory consumer protections after obtaining appropriate legal advice. Record material revisions and provide notice where required.",
          ],
        },
      ]}
    />
  );
}
