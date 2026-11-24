# SuperintelligenceNDA

## Mode C review proposal

The local review adds a standalone International Worldwide Superintelligence Non-Disclosure & Cross-Border Intellectual Property Protection Agreement, with 18 articles and an 18-entry Exhibit C. Open `/ mode=international` for its preview. `mode-c.js` owns its particulars, text, regime schedule and independent SHA-256 digest. U.S. contract generators and payment backend remain separate.

Mode C requires international particulars instead of a U.S. domicile state. It uses an agreed non-U.S. governing law and seat, preserves mandatory-law exceptions and requires both parties' actual assent. Exhibit C is a reference schedule, not simultaneous adoption of 18 governing laws. Neither payment, a selected provider, a hash nor a service credential executes this agreement. Obtain transaction-specific legal review before use.

New order snapshots include the standalone international draft followed by the existing 51 U.S. templates. Existing paid snapshots and the $275 checkout configuration are unchanged. Mode C's TXT export uses the existing fresh server verification and revocation gate. Localhost checkout is disabled for review; no production deployment or pull request is part of this preview.

Run `node payments/mode-c.test.mjs` in addition to the existing payment, frontend, export-lock, copy-lock, document-format and per-user suites.

Website and document generator for a master 50-state omnibus NDA and 50 individual state templates, with a selectable AI-provider matrix and verified Stripe document delivery.

- [Website](https://www.superintelligencenda.com/)
- [Payment, delivery, configuration, and test documentation](payments/README.md)

## Repository resources

| Resource | Purpose |
| --- | --- |
| [LICENSE](LICENSE) | Proprietary rights notice for original project materials |
| [LEGAL.md](LEGAL.md) | Legal scope, document execution, purchases, and permissions |
| [INTELLECTUAL_PROPERTY.md](INTELLECTUAL_PROPERTY.md) | Copyright, reuse, and ownership boundaries |
| [TRADEMARKS.md](TRADEMARKS.md) | Project branding and third-party attribution |
| [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) | Browser libraries, fonts, and upstream licenses |
| [SECURITY.md](SECURITY.md) | Private vulnerability reporting and delivery process |
| [AGENTS.md](AGENTS.md) | Repository instructions for automated coding agents |

## Project layout

- index.html: website, provider matrix, and document generators.
- payments/worker.mjs and payments/schema.sql: payment verification and saved-document API.
- payments/document-pdf.mjs: browser-side PDF generation.
- payments/*.test.mjs: payment, export, document-format, and copy-control checks.

## Access and execution

Original project materials are proprietary; third-party components retain their licenses. Payment grants the document access implemented by the service and does not establish any AI provider's signature or assent. Customer rights remain subject to applicable purchase terms and separate agreements. Public previews contain document text; export controls are not a complete content paywall. See LEGAL.md for details.

## Per-user intake

Public intake starts with blank identity fields. Each user's name, commercial brand, contact email, and primary domicile populate the master contract and all 50 individual state templates. Signature blocks use that user's name; no founder name or signature is inserted by default. Enter a name before choosing Auto-Sign, or draw a signature. Existing paid document snapshots remain unchanged.

Run `node payments/per-user.test.mjs` to check blank intake, two separate user identities across all 51 templates, cleared fields, Auto-Sign's name requirement, and frontend JavaScript syntax.

Section 03 (Per-User NDA Requirements) requires a full legal name or legal entity, valid contact email, and primary domicile state before a new checkout can create an order. Brand/domain portfolio remains optional. The per-user test also checks checkout rejection for incomplete details and successful continuation with optional brand details blank.
