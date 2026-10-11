import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | RafikiSupport AI",
  description:
    "Learn how RafikiSupport AI may collect, use, protect, and share personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary="This draft explains the main categories of information that may be processed when you visit RafikiSupport AI, use its dashboard, or interact with a support assistant deployed by a business."
      sections={[
        {
          heading: "1. Who is responsible for your information?",
          paragraphs: [
            "RafikiSupport AI is a customer-support software product. The operator of the product is responsible for its own website, account, and platform operations. A business that deploys a support assistant may separately determine why and how its customers' information is processed.",
            "Before production, identify the legal name, registered address, jurisdiction, and privacy contact of the product operator. Businesses using the product should identify their own responsible entity and provide customers with an appropriate privacy notice.",
          ],
        },
        {
          heading: "2. Information that may be processed",
          bullets: [
            "Account and authentication information needed to sign in and secure an account.",
            "Business configuration, support documents, FAQs, and other knowledge-base content uploaded by an authorised user.",
            "Questions submitted to a public support assistant, the assistant's responses, and source titles returned with those responses.",
            "Support-ticket information when an interaction is escalated to a business's support team.",
            "Technical information needed to operate and protect the service, such as request timestamps, response status, and security events, where those logs are enabled.",
          ],
        },
        {
          heading: "3. How information is used",
          paragraphs: [
            "Information may be used to provide and secure the service, retrieve relevant business knowledge, generate answers, create escalation tickets, maintain accounts, diagnose failures, prevent abuse, and improve reliability. The actual uses must be checked against the features enabled in the deployed environment.",
          ],
        },
        {
          heading: "4. AI processing and business documents",
          paragraphs: [
            "A support question may be compared with relevant knowledge-base content and sent to the configured language model to generate a response. Depending on deployment configuration, processing may use a locally hosted model or an external AI provider. Confirm the active provider and its applicable terms before launch.",
            "Do not upload information unless you have the right to use it for this purpose. Avoid submitting passwords, payment-card details, government identifiers, or other sensitive information unless the service is specifically designed and legally approved to handle it.",
          ],
        },
        {
          heading: "5. Escalations and support tickets",
          paragraphs: [
            "When an interaction meets the configured escalation conditions, the application may create a support ticket containing the customer's question and a reason for escalation. The business receiving the ticket may use that information to follow up and provide human support.",
          ],
        },
        {
          heading: "6. Service providers and disclosures",
          paragraphs: [
            "The service may rely on hosting, database, file-storage, authentication, and AI providers. The operator must maintain an accurate list of providers actually enabled in each deployment, explain their roles, and identify any relevant international transfers. Do not treat a provider as active merely because the application supports it.",
          ],
        },
        {
          heading: "7. Retention and deletion",
          paragraphs: [
            "Information should be kept only for as long as needed for a stated purpose, subject to applicable legal obligations and legitimate security requirements. Specific retention periods have not been established by this template. Before launch, define retention periods for uploaded documents, extracted text and embeddings, support tickets, account records, backups, and operational logs.",
            "Document how an authorised request to access, correct, export, or delete information is received and fulfilled. Deleting a source document should also address its derived chunks, embeddings, and stored copies where applicable.",
          ],
        },
        {
          heading: "8. Security",
          paragraphs: [
            "The operator should apply appropriate access controls, tenant isolation, secret management, secure transport, dependency updates, backups, and incident response procedures. No internet-connected system can be guaranteed completely secure.",
          ],
        },
        {
          heading: "9. Your choices and rights",
          paragraphs: [
            "Depending on the applicable law, individuals may have rights to access, correct, delete, restrict, object to, or obtain a copy of their information, and may be able to complain to a data-protection authority. Requests should be directed to the entity responsible for the relevant processing.",
          ],
        },
        {
          heading: "10. Changes and contact",
          paragraphs: [
            "This policy should be reviewed when data flows, providers, product features, or legal requirements change. Before publication, provide a verified contact address and an effective-date process for policy updates.",
          ],
        },
      ]}
    />
  );
}
