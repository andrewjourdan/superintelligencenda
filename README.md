# SuperintelligenceNDA

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

Section 03 (Per-User NDA Requirements) requires a full legal name or legal entity, valid contact email, and domicile country/territory before a new checkout can create an order. U.S. residents must select a U.S. state; other residents may enter an optional province/region. Brand/domain portfolio remains optional. Country choices describe domicile, not Stripe payment eligibility. Customer domicile is kept separate from the selected U.S. contract jurisdiction.

## International intake and document scope

The international index update retains the original U.S. master omnibus and all 50 individual state generators. It does not add an International Master NDA, country-specific contracts, or a claim of worldwide enforceability. Provider selection, payment, and a customer's signature do not establish a provider's assent; see [LEGAL.md](LEGAL.md).

All 250 country/territory choices start unselected. Region text is escaped before HTML rendering, and the same domicile is included in the preview, digest payload, and all 51 text templates. Checkout remains $275 USD through the existing Stripe link and API; local-currency pricing, tax registrations, and live fraud settings are separate configuration work. Existing paid snapshots remain unchanged.

Run `node payments/international.test.mjs` and `node payments/per-user.test.mjs` for country/state validation, per-user checkout and all 51 contract outputs. Continue running the existing payment, export-lock, copy-lock, and document-format tests from [payments/README.md](payments/README.md).
