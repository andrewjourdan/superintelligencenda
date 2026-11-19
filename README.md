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
