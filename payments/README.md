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

Tests cover payment signatures, stale events, pending access denial, paid fulfillment, duplicate delivery, credential scope, refunds and out-of-order success events. The live health endpoint and unpaid-access denial were checked without charging a card. A real paid transaction was not performed.

## Print and export controls
All nine print/text-download controls are disabled by default. Verified paid orders unlock them. Each button action rechecks paid access with the delivery API; a verification failure relocks them. Unpaid browser printing renders a payment-required notice. The export-lock tests exercise pending, paid and revoked access against the actual frontend code.

This is an export-control gate, not a private-content paywall. The current HTML preview, generators and repository history still contain document text. A visitor can copy publicly delivered text or inspect source. Protecting the template content itself requires serving the complete documents only after server-side payment verification and showing a limited public preview.

## PDF and TXT downloads
The paid-order controls offer Download PDF and Download TXT. The default automatic download is PDF; the existing Print / Save PDF option remains available. Both formats read the same verified server-stored bundle. PDF generation runs in the customer's browser using jsPDF 4.2.1 (MIT), loaded with a pinned URL and SHA-384 integrity check, plus the Noto Serif font from Google Fonts (SIL Open Font License). Customer document text is not sent to a PDF conversion service. If a browser blocks the dependency or an automatic download, the customer can retry Download PDF or choose TXT or Print / Save PDF. The PDF includes pagination and embedded font support for legal symbols.

A generated 51-document sample was checked as a valid 162-page PDF, with readable extracted text and section symbols. No live purchase was made for this test.
