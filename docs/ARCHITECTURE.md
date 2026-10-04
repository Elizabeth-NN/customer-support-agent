# AI Customer Support Agent — Technical Architecture

**Version:** 1.0
**Status:** Draft
**Related Document:** `docs/PRD.md`

---

# 1. Architecture Overview

The AI Customer Support Agent is a multi-tenant SaaS application built around three primary capabilities:

1. **Retrieval-Augmented Generation (RAG)**
2. **Agentic tool execution**
3. **Human-in-the-loop escalation**

The system should be designed so that the AI model is **not the source of truth**.

Business knowledge lives in the application's knowledge system, while real-time business information is retrieved through controlled tools.

The core architecture is:

```text
                         ┌─────────────────────┐
                         │      CUSTOMER       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    CHAT FRONTEND    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    API / BACKEND    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   AGENT ORCHESTRATOR│
                         └──────┬──────┬───────┘
                                │      │
                    ┌───────────┘      └────────────┐
                    ▼                               ▼
             ┌──────────────┐               ┌──────────────┐
             │  RAG SYSTEM  │               │ TOOL SYSTEM  │
             └──────┬───────┘               └──────┬───────┘
                    │                              │
          ┌─────────┼─────────┐          ┌─────────┼─────────┐
          ▼         ▼         ▼          ▼         ▼         ▼
       Vector    Metadata   Sources    Orders   Tickets   External
       Search    Filters    / Chunks                       APIs
          │
          ▼
       LLM / Model
          │
          ▼
   Confidence / Policy
      Evaluation
          │
     ┌────┴─────┐
     ▼          ▼
   Answer    Escalation
     │          │
     ▼          ▼
 Customer     Human
```

---

# 2. Architectural Principles

## 2.1 Retrieval Before Generation

For knowledge-based questions, the system should retrieve relevant business information before asking the model to generate an answer.

The model should not be treated as the business knowledge database.

---

## 2.2 Tools for Real-Time Data

The model should not invent dynamic information.

For example:

```text
"What is your return policy?"
        ↓
RAG

"Where is order #10482?"
        ↓
Order Lookup Tool
```

---

## 2.3 Human Escalation Is a First-Class Capability

The system should not attempt to answer every question.

A correct escalation is preferable to an unsupported answer.

---

## 2.4 Backend-Enforced Security

The LLM must never be trusted to enforce:

* Tenant isolation
* Authorization
* Tool permissions
* Data access restrictions

These controls belong in the backend.

---

## 2.5 Observable AI

Every important AI operation should be traceable.

The system should be able to answer:

* What did the user ask?
* What documents were retrieved?
* Why were they retrieved?
* What sources were provided to the model?
* What answer was generated?
* Was a tool called?
* What was the tool result?
* Why was the conversation escalated?

---

# 3. System Components

The system is divided into the following logical components.

```text
Frontend
Backend API
Authentication
Business / Tenant Management
Document Ingestion
Knowledge / RAG
Agent Orchestrator
Tool Execution
Conversation Management
Escalation Management
Evaluation / Observability
Database
Vector Storage
Object Storage
LLM Provider
Embedding Provider
```

---

# 4. Frontend Architecture

The frontend provides two primary experiences.

## 4.1 Customer Interface

The customer-facing application provides:

* Chat interface
* Message history
* Loading state
* Sources
* Tool action status
* Escalation notification
* Human handoff

---

## 4.2 Business Dashboard

The business dashboard provides:

```text
Dashboard
├── Overview
├── Conversations
├── Escalations
├── Knowledge Base
├── FAQs
├── Tools
├── Agent Configuration
└── Settings
```

A future developer/admin interface may expose:

```text
Evaluation
Retrieval traces
Tool executions
Model performance
```

---

# 5. Backend Architecture

The backend should expose REST APIs initially.

Recommended logical structure:

```text
backend/
└── app/
    ├── api/
    │   ├── auth/
    │   ├── businesses/
    │   ├── documents/
    │   ├── conversations/
    │   ├── escalations/
    │   ├── tickets/
    │   └── chat/
    │
    ├── agents/
    │   ├── orchestrator.py
    │   ├── prompts.py
    │   ├── policies.py
    │   └── confidence.py
    │
    ├── rag/
    │   ├── ingestion.py
    │   ├── chunking.py
    │   ├── embeddings.py
    │   ├── retrieval.py
    │   ├── reranking.py
    │   └── citations.py
    │
    ├── tools/
    │   ├── registry.py
    │   ├── order_lookup.py
    │   └── support_ticket.py
    │
    ├── conversations/
    ├── escalations/
    ├── documents/
    ├── database/
    └── main.py
```

The exact directory structure can evolve during implementation.

---

# 6. Data Architecture

PostgreSQL should be the primary relational database.

The database stores:

* Businesses
* Users
* Business memberships
* Documents
* Document metadata
* Document chunks
* FAQs
* Customers
* Conversations
* Messages
* Tickets
* Escalations
* Tool executions
* Agent configuration
* Evaluation records

---

# 7. Vector Architecture

The first implementation should favor **PostgreSQL with pgvector** rather than immediately introducing a separate vector database.

Reasons:

* Reduces infrastructure complexity.
* Keeps tenant metadata and vector data together.
* Simplifies local development.
* Supports relational filtering.
* Works well for the expected MVP scale.
* Makes deployment simpler.

Conceptually:

```text
PostgreSQL
│
├── Relational Tables
│
└── document_chunks
      ├── text
      ├── embedding
      ├── business_id
      ├── document_id
      └── metadata
```

A dedicated vector database can be introduced later if scale or retrieval requirements justify it.

---

# 8. Object Storage

Original uploaded documents should not be stored directly in PostgreSQL.

Use object storage for:

* PDFs
* DOCX files
* TXT files
* Other uploaded assets

The database stores metadata and the object-storage reference.

```text
Object Storage
     │
     └── business/{business_id}/documents/{document_id}
```

Documents should be private by default.

---

# 9. Document Ingestion Pipeline

The ingestion pipeline converts uploaded files into searchable knowledge.

```text
Upload
  ↓
Validate
  ↓
Store Original
  ↓
Extract Text
  ↓
Normalize
  ↓
Classify
  ↓
Chunk
  ↓
Generate Metadata
  ↓
Generate Embeddings
  ↓
Store Chunks
  ↓
Mark Indexed
```

---

# 10. File Validation

Before processing:

* Validate file type.
* Validate file size.
* Generate a unique document ID.
* Associate the file with the authenticated business.
* Store securely.
* Reject unsupported formats.

The backend must never trust the filename extension alone.

---

# 11. Text Extraction

The extraction layer should be abstracted behind an interface.

Example:

```python
class DocumentParser:
    def can_parse(self, content_type: str) -> bool:
        ...

    def parse(self, file_path: str) -> str:
        ...
```

This allows support for additional formats later without rewriting the ingestion pipeline.

---

# 12. Chunking Strategy

Chunking should preserve semantic meaning.

The initial strategy should use:

* Reasonable token/character limits.
* Paragraph-aware splitting.
* Heading awareness where available.
* Small overlap between chunks.

Example:

```text
Document
   ↓
Sections
   ↓
Paragraph groups
   ↓
Chunks
```

Avoid blindly splitting every N characters.

---

# 13. Chunk Metadata

Every chunk must retain enough information to reconstruct its source.

Example:

```json
{
  "chunk_id": "chunk_123",
  "business_id": "business_123",
  "document_id": "doc_456",
  "document_name": "Returns Policy.pdf",
  "document_type": "policy",
  "page_number": 4,
  "section": "Returns",
  "chunk_index": 12
}
```

This metadata supports:

* Tenant isolation.
* Filtering.
* Citations.
* Debugging.
* Evaluation.

---

# 14. Embedding Pipeline

Each chunk is transformed into a vector representation.

```text
Chunk
  ↓
Embedding Model
  ↓
Vector
  ↓
PostgreSQL / pgvector
```

Embedding generation should be isolated behind a service interface so the provider can be replaced.

```python
class EmbeddingProvider:
    def embed_documents(self, texts):
        ...

    def embed_query(self, text):
        ...
```

---

# 15. Retrieval Pipeline

For a customer query:

```text
Customer Question
       ↓
Normalize Query
       ↓
Generate Query Embedding
       ↓
Apply Business Filter
       ↓
Vector Search
       ↓
Top-K Candidates
       ↓
Optional Reranking
       ↓
Relevant Context
```

---

# 16. Tenant Filtering

Tenant filtering must happen **inside the retrieval query**.

Conceptually:

```sql
SELECT *
FROM document_chunks
WHERE business_id = :current_business_id
ORDER BY embedding <=> :query_embedding
LIMIT :k;
```

The application must never retrieve all documents and then ask the LLM to decide which business they belong to.

---

# 17. Retrieval Configuration

The initial system should support configurable:

```text
top_k
similarity_threshold
reranking_enabled
maximum_context_chunks
```

Example:

```text
top_k = 8

similarity threshold = configurable

final context chunks = 4
```

Exact values should be established through evaluation rather than permanently hardcoded.

---

# 18. Reranking

The architecture should support an optional reranking stage.

```text
Vector Search
     ↓
8-10 Candidates
     ↓
Reranker
     ↓
Top 3-5
     ↓
LLM Context
```

Reranking is valuable because vector similarity alone does not always identify the best answer-supporting passages.

The MVP can initially operate without a dedicated reranker.

---

# 19. Context Construction

Retrieved chunks should be converted into structured context.

Example:

```text
SOURCE 1
Document: Returns Policy
Section: Returns
Page: 4

[content]


SOURCE 2
Document: FAQ
Question: How long do I have to return an item?

[content]
```

The model should receive source identifiers so citations can be mapped back to actual documents.

---

# 20. RAG Prompt Architecture

The model prompt should separate:

```text
SYSTEM INSTRUCTIONS
        ↓
BUSINESS CONFIGURATION
        ↓
CONVERSATION CONTEXT
        ↓
RETRIEVED KNOWLEDGE
        ↓
TOOL RESULTS
        ↓
CUSTOMER MESSAGE
```

Retrieved content must be explicitly identified as **reference material**, not instructions.

---

# 21. Grounding Rules

The agent should follow rules such as:

```text
1. Answer using retrieved business knowledge.
2. Do not invent business-specific facts.
3. Do not fabricate citations.
4. If evidence is insufficient, do not guess.
5. Use tools when current data is required.
6. Escalate when the request cannot safely be answered.
```

---

# 22. Source Citations

The model should produce structured source references rather than arbitrary citation text.

Example:

```json
{
  "answer": "Our standard delivery time is 2–5 business days.",
  "sources": [
    {
      "document_id": "doc_123",
      "chunk_id": "chunk_456"
    }
  ]
}
```

The frontend can then resolve these IDs into displayable sources.

This prevents the model from fabricating source names.

---

# 23. Agent Orchestration

The agent orchestrator controls the interaction between:

* Customer message
* RAG
* LLM
* Tools
* Confidence evaluation
* Escalation

Conceptually:

```text
                 Customer Message
                        │
                        ▼
                Agent Orchestrator
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
         Knowledge?           Action?
              │                   │
              ▼                   ▼
             RAG              Tool Registry
              │                   │
              └─────────┬─────────┘
                        ▼
                       LLM
                        │
                        ▼
                  Decision Layer
                  ┌─────┼─────┐
                  ▼     ▼     ▼
                Answer Tool Escalate
```

---

# 24. Agent State

The agent should maintain structured state rather than relying exclusively on conversation text.

Example:

```python
AgentState(
    business_id=...,
    conversation_id=...,
    customer_id=...,
    messages=...,
    retrieved_sources=...,
    tool_calls=...,
    confidence=...,
    escalation_required=False
)
```

---

# 25. Tool Architecture

Tools should be registered centrally.

Example:

```python
Tool(
    name="lookup_order",
    description="Look up the current status of a customer order",
    input_schema=...,
    handler=lookup_order
)
```

The LLM sees the tool definition.

The backend executes the actual implementation.

---

# 26. Tool Execution Flow

```text
LLM
 ↓
Requests lookup_order
 ↓
Backend validates request
 ↓
Authorization check
 ↓
Tool executes
 ↓
Structured result
 ↓
Result returned to agent
 ↓
LLM generates response
```

The model should never execute code directly.

---

# 27. Tool Authorization

Every tool execution must verify:

```text
Authenticated user/session
        ↓
Business ownership
        ↓
Customer access
        ↓
Tool permission
        ↓
Input validation
        ↓
Execution
```

This is especially important for tools that access customer-specific data.

---

# 28. Tool Categories

Tools should be classified by risk.

## Read-only

Examples:

```text
lookup_order
get_order_status
get_ticket_status
```

These can generally be automatically executed when authorized.

---

## Mutating

Examples:

```text
create_support_ticket
update_ticket
```

These require stricter validation.

---

## High-risk

Future examples:

```text
issue_refund
cancel_order
change_delivery_address
```

These should require explicit confirmation and potentially human approval.

---

# 29. Tool Results

Tools should return structured data.

Example:

```json
{
  "success": true,
  "order": {
    "id": "10482",
    "status": "dispatched",
    "estimated_delivery": "2026-10-07"
  }
}
```

Tool errors should also be structured.

```json
{
  "success": false,
  "error_code": "ORDER_NOT_FOUND",
  "message": "Order could not be found."
}
```

---

# 30. Confidence Architecture

Confidence should be treated as a system-level decision rather than a single LLM number.

Potential signals:

```text
Retrieval relevance
        +
Source coverage
        +
Answer support
        +
Tool success
        +
Policy checks
        ↓
Confidence Decision
```

Possible outcomes:

```text
HIGH
 → answer

MEDIUM
 → answer cautiously / clarify

LOW
 → escalate
```

---

# 31. Retrieval Confidence

The retrieval layer should expose:

```text
best_similarity_score
average_similarity_score
number_of_relevant_chunks
```

These values can contribute to the confidence decision.

They should not automatically be interpreted as probabilities.

---

# 32. Answer Grounding Evaluation

The system should evaluate whether the generated answer is supported by the retrieved context.

Conceptually:

```text
Question
   ↓
Retrieved Context
   ↓
Generated Answer
   ↓
Grounding Evaluator
   ↓
Supported / Unsupported
```

An unsupported answer should be blocked or escalated depending on severity.

---

# 33. Escalation Architecture

Escalation should be generated as a structured event.

```json
{
  "conversation_id": "...",
  "reason": "INSUFFICIENT_KNOWLEDGE",
  "confidence": 0.31,
  "status": "open"
}
```

---

# 34. Escalation Reasons

Standard reason codes:

```text
INSUFFICIENT_KNOWLEDGE
LOW_RETRIEVAL_CONFIDENCE
CONFLICTING_INFORMATION
CUSTOMER_REQUESTED_HUMAN
TOOL_FAILURE
SENSITIVE_REQUEST
UNSUPPORTED_ACTION
POLICY_EXCEPTION
```

---

# 35. Human Handoff

When escalation occurs:

```text
Customer
   ↓
AI
   ↓
Escalation created
   ↓
Conversation assigned
   ↓
Human support agent
   ↓
Human response
```

The conversation should preserve all relevant context.

---

# 36. Conversation State

A conversation can have:

```text
ACTIVE
ESCALATED
HUMAN_ACTIVE
RESOLVED
CLOSED
```

The AI should stop automatically responding once a human has taken ownership, unless the business explicitly enables AI assistance.

---

# 37. Prompt Injection Defense

The architecture must treat:

* Customer messages
* Uploaded documents
* Retrieved chunks
* Tool results

as untrusted data.

A malicious document must not be able to override system instructions.

Example:

```text
System Instructions
        ↓
Business Rules
        ↓
Agent Policies
        ↓
Retrieved Content
        ↓
Customer Content
```

The lower layers must not override the higher layers.

---

# 38. Data Flow — Customer Question

Example:

> "What is your return policy?"

Flow:

```text
Customer
  ↓
POST /conversations/{id}/messages
  ↓
Authentication
  ↓
Tenant resolution
  ↓
Conversation retrieval
  ↓
RAG retrieval
  ↓
Candidate chunks
  ↓
Reranking
  ↓
Context construction
  ↓
LLM
  ↓
Grounding evaluation
  ↓
Structured response
  ↓
Sources
  ↓
Customer
```

---

# 39. Data Flow — Tool Call

Example:

> "Where is my order #10482?"

Flow:

```text
Customer
  ↓
Agent
  ↓
Determine real-time information required
  ↓
Tool selection
  ↓
lookup_order
  ↓
Authorization
  ↓
Order database
  ↓
Structured result
  ↓
Agent
  ↓
Final answer
```

---

# 40. Data Flow — Escalation

Example:

> "I was charged twice and need my money back."

Flow:

```text
Customer
  ↓
Agent
  ↓
Retrieve payment policy
  ↓
Determine insufficient authority/evidence
  ↓
Escalation decision
  ↓
Create escalation
  ↓
Generate internal summary
  ↓
Notify dashboard
  ↓
Human agent
```

The AI should not claim that a refund has been issued unless an authorized refund tool actually confirms it.

---

# 41. Multi-Tenant Architecture

Every request should establish the current tenant.

```text
Authenticated Identity
        ↓
Business Membership
        ↓
business_id
        ↓
Scoped Data Access
```

Every business-owned table should contain a `business_id` directly or through a secure relationship.

---

# 42. Tenant Isolation Layers

Tenant isolation should exist at multiple levels.

### API Layer

Validate business membership.

### Database Layer

Filter queries by `business_id`.

### Vector Layer

Filter vector searches by `business_id`.

### Object Storage

Restrict document paths/access by business.

### Tool Layer

Validate customer/business ownership.

This defense-in-depth approach reduces the impact of implementation mistakes.

---

# 43. Database Transactions

Operations that modify multiple related records should use database transactions.

Example:

```text
Create escalation
        +
Update conversation
        +
Create notification
```

These operations should be consistent.

---

# 44. Asynchronous Processing

Document ingestion should not block the HTTP request.

Instead:

```text
Upload
  ↓
Create document record
  ↓
Queue processing job
  ↓
Return response
  ↓
Background worker
  ↓
Parse
  ↓
Chunk
  ↓
Embed
  ↓
Index
```

The initial MVP can implement this with a simple background worker architecture before introducing a larger job queue.

---

# 45. Caching

Caching can be introduced selectively.

Potential cache targets:

* Frequently retrieved knowledge.
* Agent configuration.
* Business configuration.
* Tool metadata.

Do not cache customer-specific information without carefully considering isolation and invalidation.

---

# 46. Knowledge Versioning

Documents should eventually support versions.

Example:

```text
Returns Policy v1
       ↓
Returns Policy v2
       ↓
Current version
```

Only active versions should participate in normal retrieval.

This helps prevent outdated policies from being returned.

---

# 47. Knowledge Freshness

The system should track:

```text
created_at
updated_at
indexed_at
version
status
```

Future versions may warn businesses when knowledge becomes stale.

---

# 48. Evaluation Architecture

Evaluation should be separate from normal customer traffic.

```text
Evaluation Dataset
        ↓
RAG Pipeline
        ↓
Agent
        ↓
Evaluation Metrics
        ↓
Results
```

The evaluation system should be able to compare different:

* Chunking strategies.
* Retrieval parameters.
* Embedding models.
* Rerankers.
* Prompt versions.

---

# 49. Evaluation Dataset

Example:

```json
{
  "question": "How long is the return period?",
  "expected_answer": "30 days",
  "expected_sources": [
    "returns-policy.pdf"
  ]
}
```

The evaluation system should measure:

```text
Retrieval
Generation
Citation
Grounding
Tool selection
Escalation
```

---

# 50. Observability

Each AI request should receive a trace ID.

Example:

```text
trace_id = "trace_123"
```

Associated events:

```text
Query received
Retrieval started
Retrieval completed
Chunks selected
LLM request
Tool requested
Tool executed
LLM response
Grounding evaluated
Escalation created
```

This makes debugging significantly easier.

---

# 51. Logging

Logs should include operational information but avoid unnecessarily storing sensitive customer information.

Recommended:

```text
trace_id
business_id
conversation_id
operation
duration
status
error_code
```

Avoid logging complete sensitive customer messages by default.

---

# 52. API Architecture

Example API structure:

```text
/api/v1

/auth
/businesses
/documents
/knowledge
/faqs
/conversations
/messages
/escalations
/tickets
/tools
/agent
/evaluations
```

---

# 53. Example Chat API

```http
POST /api/v1/conversations/{conversation_id}/messages
```

Request:

```json
{
  "content": "Where is my order #10482?"
}
```

Response:

```json
{
  "message_id": "msg_123",
  "content": "Your order has been dispatched...",
  "sources": [],
  "tool_actions": [
    {
      "tool": "lookup_order",
      "status": "completed"
    }
  ],
  "escalated": false
}
```

---

# 54. Example RAG Response

```json
{
  "message_id": "msg_456",
  "content": "Our standard delivery time is 2–5 business days.",
  "sources": [
    {
      "document_id": "doc_123",
      "document_name": "Shipping Policy",
      "page": 2
    }
  ],
  "confidence": {
    "level": "high"
  }
}
```

---

# 55. Error Handling

Errors should be categorized.

```text
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
DOCUMENT_PROCESSING_ERROR
RETRIEVAL_ERROR
LLM_ERROR
TOOL_ERROR
DATABASE_ERROR
INTERNAL_ERROR
```

Customer-facing responses should not expose internal stack traces or implementation details.

---

# 56. Security Architecture

Sensitive credentials must remain server-side.

Examples:

```text
LLM API keys
Embedding API keys
Database credentials
Object storage credentials
External integration tokens
```

They must never be exposed to the customer frontend.

---

# 57. Secrets Management

Environment variables should be used during development.

Example:

```text
DATABASE_URL=
LLM_API_KEY=
EMBEDDING_API_KEY=
AUTH_SECRET=
OBJECT_STORAGE_KEY=
```

Production secrets should use the deployment platform's secure secret management.

---

# 58. Authentication

The authentication provider should issue the user's identity.

The backend remains responsible for authorization.

```text
Authentication
     ↓
Identity
     ↓
Business membership
     ↓
Role
     ↓
Permission
```

Authentication alone must not grant access to business data.

---

# 59. Role-Based Access Control

Initial roles:

### Owner

Full business access.

### Admin

Manage knowledge, configuration, conversations, and escalations.

### Support Agent

View and manage assigned support conversations.

---

# 60. Deployment Architecture

The system should be deployable using managed services rather than requiring a VPS for the MVP.

Conceptually:

```text
                    Internet
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
         Frontend              API
         Hosting              Hosting
             │                   │
             └─────────┬─────────┘
                       │
              ┌────────┼─────────┐
              ▼        ▼         ▼
           Database  Storage    LLM
```

The exact hosting providers can be selected during implementation.

---

# 61. Local Development

Local development should support:

```text
Frontend
Backend
PostgreSQL
Vector extension
Object storage / local equivalent
```

Docker Compose may be used to simplify local setup.

---

# 62. Environment Separation

Environments:

```text
Development
Staging
Production
```

Each environment should have separate:

* Database
* Storage
* Secrets
* API credentials
* Configuration

Production data must never be used casually in development.

---

# 63. Testing Strategy

Testing should exist at multiple levels.

## Unit Tests

Test:

* Chunking.
* Metadata.
* Retrieval filters.
* Tool validation.
* Confidence calculations.

---

## Integration Tests

Test:

* Document ingestion.
* Database operations.
* Vector search.
* Tool execution.
* Escalation creation.

---

## End-to-End Tests

Test:

```text
Upload document
      ↓
Ask question
      ↓
Retrieve knowledge
      ↓
Generate answer
      ↓
Display source
```

and:

```text
Customer question
      ↓
Tool call
      ↓
Tool result
      ↓
Answer
```

---

# 64. RAG Testing

Specific tests should verify:

### Tenant isolation

Business A cannot retrieve Business B's documents.

### Citation correctness

The cited document actually supports the answer.

### Retrieval relevance

Relevant chunks appear in the retrieved results.

### Hallucination resistance

Questions without supporting knowledge produce escalation rather than fabricated answers.

---

# 65. Agent Testing

Tests should verify:

```text
Correct tool selected
Correct parameters generated
Unauthorized tool rejected
Tool failure handled
Tool result correctly interpreted
High-risk action blocked/confirmed
```

---

# 66. Performance Targets

Initial targets:

| Operation             |                   Target |
| --------------------- | -----------------------: |
| API response overhead |      <500ms excluding AI |
| Retrieval             |            <500ms target |
| Tool execution        | <1s for local demo tools |
| Typical AI response   |                    <5–8s |
| Document processing   |             Asynchronous |
| Dashboard load        |               <2s target |

These are engineering targets rather than guarantees.

---

# 67. Scalability Strategy

The first implementation should optimize for correctness and maintainability rather than premature scale.

Expected evolution:

```text
MVP
PostgreSQL + pgvector
        ↓
Growing usage
        ↓
Background workers
        ↓
Caching
        ↓
Dedicated vector infrastructure if necessary
        ↓
Horizontal API scaling
```

---

# 68. Architecture Decision Records

Important architectural decisions should be documented in:

```text
docs/adr/
```

Examples:

```text
ADR-001-vector-storage.md
ADR-002-llm-provider.md
ADR-003-chunking-strategy.md
ADR-004-authentication.md
ADR-005-background-processing.md
```

This provides useful evidence of engineering decision-making in the portfolio.

---

# 69. Initial Technology Strategy

Technology choices should prioritize:

1. Demonstrating RAG expertise.
2. Simplicity.
3. Low infrastructure cost.
4. Good developer experience.
5. Production scalability.
6. Replaceable AI providers.

The application should avoid unnecessary vendor lock-in where practical.

---

# 70. Recommended Initial Stack

A strong initial implementation would be:

```text
Frontend
Next.js
TypeScript
Tailwind CSS

Backend
Python
FastAPI

Database
PostgreSQL

Vector Search
pgvector

Object Storage
S3-compatible storage

AI
LLM provider with tool/function calling
Embedding model

Authentication
Managed authentication provider

Deployment
Managed frontend + backend + database services
```

The exact providers can be selected after reviewing current project constraints and cost.

---

# 71. Why PostgreSQL + pgvector

For this project, PostgreSQL + pgvector provides an especially useful balance.

It allows the system to demonstrate:

* Relational data modeling.
* Vector search.
* Metadata filtering.
* Multi-tenancy.
* SQL.
* Transactional operations.

It also keeps the architecture understandable to potential clients.

A prospective client can understand:

```text
Their business data
        +
Their knowledge
        +
Vector search
        +
AI agent
```

without requiring a complicated collection of infrastructure services.

---

# 72. Why the LLM Should Not Own the Architecture

The model is one component of the system.

The architecture should remain useful even if the underlying model changes.

```text
Application
    │
    ├── RAG
    ├── Tools
    ├── Policies
    ├── Database
    └── Evaluation
          │
          ▼
        LLM
```

The LLM should therefore be treated as a replaceable reasoning/generation component.

---

# 73. Provider Abstraction

The application should abstract AI providers where practical.

Example:

```python
class LLMProvider:
    def generate(self, request):
        ...
```

and:

```python
class EmbeddingProvider:
    def embed(self, texts):
        ...
```

This allows the system to switch models without rewriting the entire application.

---

# 74. Core Architectural Boundary

The most important boundary is:

```text
                    AI LAYER
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
        RAG          Agent         Tools
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
                 APPLICATION
                    LAYER
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Database      Storage      Auth
```

The AI layer should request operations from the application layer.

The application layer remains responsible for enforcing business rules.

---

# 75. Final Architecture

The intended production-style architecture is:

```text
                         CUSTOMER
                            │
                            ▼
                    ┌───────────────┐
                    │ Web Chat / UI │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   API Layer   │
                    └───────┬───────┘
                            │
                    Authentication
                    Authorization
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Agent Orchestrator  │
                 └──────────┬──────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
          RAG Engine     Tool Engine    Policies
             │              │
       ┌─────┴─────┐   ┌────┴─────┐
       ▼           ▼   ▼          ▼
    Vector       Metadata       Orders
    Search       Filters        Tickets
       │
       ▼
    Reranker
       │
       ▼
    Context
       │
       └──────────────┐
                      ▼
                 ┌─────────┐
                 │   LLM   │
                 └────┬────┘
                      │
              ┌───────┼────────┐
              ▼       ▼        ▼
            Answer   Tool    Escalate
              │       │        │
              │       ▼        ▼
              │     Result   Human Agent
              │       │        │
              └───────┴────────┘
                      │
                      ▼
                   Customer


Business Data
──────────────────────────────────────────────

          ┌───────────────┐
          │  PostgreSQL   │
          │ + pgvector    │
          └───────┬───────┘
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    Business   Documents  Conversations
    Data       Chunks      Tickets


          ┌───────────────┐
          │ Object Storage│
          └───────┬───────┘
                  │
             Original Files


Observability
──────────────────────────────────────────────

Agent
  ↓
Traces
  ↓
Retrieval Results
  ↓
Tool Calls
  ↓
Confidence
  ↓
Escalations
  ↓
Evaluation
```

---

# 76. Architectural Success Criteria

The architecture is successful if it allows us to demonstrate all of the following without major redesign:

* Multi-tenant RAG.
* Document ingestion.
* Semantic retrieval.
* Metadata filtering.
* Source citations.
* Retrieval evaluation.
* Grounded generation.
* Tool/function calling.
* Tool authorization.
* Human escalation.
* Conversation state.
* Prompt-injection resistance.
* AI observability.
* RAG evaluation.
* Business dashboard.
* Customer-facing chat.
* Embeddable deployment.
* Future business integrations.

The architecture should make the system feel like a **real AI product**, while keeping the first implementation small enough to actually finish.

---

# 77. Implementation Priority

The implementation should follow this dependency order:

```text
1. Application foundation
        ↓
2. Authentication + tenancy
        ↓
3. Database
        ↓
4. Document storage
        ↓
5. Document ingestion
        ↓
6. Chunking + embeddings
        ↓
7. Vector retrieval
        ↓
8. Basic RAG responses
        ↓
9. Source citations
        ↓
10. Evaluation
        ↓
11. Agent orchestration
        ↓
12. Tool calling
        ↓
13. Confidence / escalation
        ↓
14. Human dashboard
        ↓
15. Customer chat polish
        ↓
16. Demo + deployment
```

The priority is to get the **RAG pipeline working correctly before adding sophisticated agent behavior**.

That gives the project a solid technical foundation and makes each subsequent capability demonstrable and testable.
