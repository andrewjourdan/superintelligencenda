# Verified Stripe delivery and document API

Production API: https://api.superintelligencenda.com
Website: https://www.superintelligencenda.com

## Purchase flow
1. Start checkout on the website. The browser submits the current master document and all 50 state document templates as one saved text bundle.
2. The API stores an order and returns an unpredictable access token. The browser saves it locally before opening the live Stripe Payment Link with client_reference_id.
3. A signed live Stripe webhook verifies payment for the configured bundle link. Unpaid, wrong-link, forged and stale events do not unlock documents.
4. Stripe redirects to the website. The browser polls the order and automatically downloads the saved bundle as a PDF after payment verification. Separate Download PDF and Download TXT buttons remain available. The page also exposes manual download and private API-configuration controls.
5. A private service API key is issued only for a verified paid order. Refunds and disputes revoke access.

Delivery is an in-browser PDF or TXT download, not email. Keep the private API configuration for future access. Checkout should begin on the website so the order is linked to the customer's document snapshot. A direct standalone Payment Link purchase lacks this snapshot and requires manual assistance.

## Customer API
Use Authorization: Bearer YOUR_PRIVATE_SERVICE_KEY:
- GET /v1/me — inspect verified document-access scope.
- GET /v1/documents/bundle — download the saved bundle with a payment receipt.

The API key is only for SuperintelligenceNDA document access. It does not authenticate to third-party AI providers, modify their data policies, or prove their assent to an NDA. Payment is recorded separately from legal execution.

## Owner configuration
- Cloudflare Worker: superintelligencenda-delivery
- Cloudflare D1 database: superintelligencenda-orders
- Bindings: DB, TOKEN_SECRET, STRIPE_WEBHOOK_SECRET
- Webhook path: /webhooks/stripe
- Payment link: plink_1UdUHCPLxF0ESp8cJlU9fYN5
- Live Stripe endpoint: we_1UdUSbPLxF0ESp8chdTPJQ0c
- Events: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired, charge.refunded, charge.dispute.created.
- Hourly cleanup deletes pending/failed orders older than 30 days and old rate-limit buckets. Paid order snapshots remain stored for repeat downloads.
- Secrets live in Cloudflare secret bindings and are not in this repository. Keep TOKEN_SECRET stable: changing it invalidates existing derived API keys.
- Worker logs omit document content, access tokens, API keys and webhook secrets. Query strings are redacted.

## Tax setup remains separate
Stripe Tax is enabled on the checkout link. No tax registrations were recorded at setup. Add only confirmed registrations obtained from tax authorities, and review the account's existing Legal Services product tax classification. International payment acceptance does not register the business for tax.

## Validation
Node's built-in sqlite is used for the backend integration tests:
    node payments/worker.test.mjs
    node payments/frontend.test.mjs
    node payments/export-lock.test.mjs
    node payments/document-format.test.mjs
    node payments/copy-lock.test.mjs
    node payments/per-user.test.mjs
    node payments/international.test.mjs

Tests cover payment signatures, stale events, pending access denial, paid fulfillment, duplicate delivery, credential scope, refunds and out-of-order success events. The live health endpoint and unpaid-access denial were checked without charging a card. A real paid transaction was not performed.

## Print and export controls
All nine print/text-download controls are disabled by default. Verified paid orders unlock them. Each button action rechecks paid access with the delivery API; a verification failure relocks them. Unpaid browser printing renders a payment-required notice. The export-lock tests exercise pending, paid and revoked access against the actual frontend code.

This is an export-control gate, not a private-content paywall. The current HTML preview, generators and repository history still contain document text. A visitor can copy publicly delivered text or inspect source. Protecting the template content itself requires serving the complete documents only after server-side payment verification and showing a limited public preview.

## PDF and TXT downloads
The paid-order controls offer Download PDF and Download TXT. The default automatic download is PDF; the existing Print / Save PDF option remains available. Both formats read the same verified server-stored bundle. PDF generation runs in the customer's browser using jsPDF 4.2.1 (MIT), loaded with a pinned URL and SHA-384 integrity check, plus the Noto Serif font from Google Fonts (SIL Open Font License). Customer document text is not sent to a PDF conversion service. If a browser blocks the dependency or an automatic download, the customer can retry Download PDF or choose TXT or Print / Save PDF. The PDF includes pagination and embedded font support for legal symbols.

A generated 51-document sample was checked as a valid multi-page PDF, with readable extracted text and section symbols. No live purchase was made for this test.

## Individual matrix entries
The matrix now has 62 separately selectable providers and research organizations. The earlier grouped rows were split, and Salesforce, Databricks/Mosaic AI, Snowflake, Samsung, NAVER, LG AI Research, Reka and Character.AI were added. Pika, Ideogram and the research collaborations previously named only inside model descriptions have individual entries. The count represents entries, not 62 independent corporate parents.

Each new entry retains past/present/future scope. Existing paid snapshots remain unchanged; new orders capture the updated selection. The all-selected 51-document test bundle was approximately 1.18 MB and produced a 293-page PDF. The API now permits document text up to 1,500,000 UTF-8 bytes and request bodies up to 1,800,000 bytes, below D1's 2,000,000-byte row limit. Oversized documents are rejected. Local payment/access and capacity checks passed. A production capacity request encountered a Cloudflare browser challenge, so production order creation was not confirmed in that check; no security settings were relaxed and no card was charged.

## International customer domicile

The frontend accepts a domicile country or territory and an optional region outside the United States; U.S. customers must select a valid U.S. state. It records domicile independently of the selected U.S. contract view. The purchased snapshot still contains the original 51 U.S. templates, not a separate international legal agreement. Country selection is not an authorization to transact in that country.

The update leaves the Stripe link, $275 USD base price, payment/webhook verification, paid-download checks, and existing stored snapshots intact. International card/local-currency eligibility and tax obligations must be verified separately before changing payment configuration. Tests exercise international data in every generated template and verify that the all-selected bundle stays below the existing 1,500,000-byte API document limit.
