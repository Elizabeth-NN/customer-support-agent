import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Data Processing | RafikiSupport AI",
  description:
    "Draft data-processing terms for businesses evaluating RafikiSupport AI.",
};

export default function DataProcessingPage() {
  return (
    <LegalPage
      title="Data Processing"
      summary="This page is a starting point for documenting the relationship between RafikiSupport AI and a business that uses it to process customer information. It is not, by itself, an executed data-processing agreement."
      sections={[
        {
          heading: "1. Roles and instructions",
          paragraphs: [
            "For customer information that a business submits to the service, the business and product operator must determine their respective roles under the applicable data-protection law. Where the business acts as controller and the operator as processor, a separate written agreement should define the processing instructions and responsibilities.",
          ],
        },
        {
          heading: "2. Subject matter and duration",
          paragraphs: [
            "Processing may include hosting support content, indexing documents, retrieving relevant passages, generating answers, and creating escalation tickets. The agreement should define its duration, the service scope, and what happens to data when the service ends.",
          ],
        },
        {
          heading: "3. Data and individuals",
          paragraphs: [
            "Depending on the deployment, data may include customer questions, support-ticket text, contact details included by users, and business knowledge documents. Individuals may include a business's customers, staff, and authorised account users. Each business must assess the actual data it chooses to submit.",
          ],
        },
        {
          heading: "4. Security and confidentiality",
          paragraphs: [
            "The operator should document the technical and organisational measures actually in place, including access controls, tenant isolation, secure configuration, incident handling, and personnel confidentiality. Do not promise a control until it has been implemented and verified.",
          ],
        },
        {
          heading: "5. Subprocessors and transfers",
          paragraphs: [
            "List the hosting, database, object-storage, authentication, and AI providers used for the particular deployment. Document approval or notice requirements for subprocessors and assess international data transfers and safeguards where required.",
          ],
        },
        {
          heading: "6. Assistance and data-subject requests",
          paragraphs: [
            "The agreement should explain how the operator assists the business with applicable access, correction, export, deletion, security, and impact-assessment obligations, taking into account the information available to the operator.",
          ],
        },
        {
          heading: "7. Retention, return, and deletion",
          paragraphs: [
            "Specify how original uploads, extracted text, chunks, embeddings, tickets, logs, and backups are returned or deleted at the end of the service or following a valid request. State any legal retention exceptions and the time required to complete deletion, based on verified operational capabilities.",
          ],
        },
        {
          heading: "8. Breach notification and audit",
          paragraphs: [
            "Define how suspected personal-data breaches are reported, what information is supplied, and how cooperation and reasonable audit evidence are handled. The agreed timelines and procedures must be reviewed against the applicable law and the actual incident-response process.",
          ],
        },
        {
          heading: "9. Completing an agreement",
          paragraphs: [
            "Before processing real customer data, complete the parties' legal details, processing instructions, security schedule, subprocessors, transfer terms, retention schedule, and signatures. Obtain legal review for the relevant jurisdictions.",
          ],
        },
      ]}
    />
  );
}
