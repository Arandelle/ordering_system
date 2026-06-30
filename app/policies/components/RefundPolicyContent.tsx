import React from "react";

const LAST_UPDATED = "June 30, 2026";

/**
 * Refund Policy content for Harrison House of Inasal & BBQ.
 * Covers refund eligibility, process, and timelines
 * specific to the ordering platform's payment methods.
 */
const RefundPolicyContent = () => {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Refund Policy
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <p className="text-gray-700 leading-relaxed mb-6">
        This Refund Policy applies to orders placed through the Harrison –
        House of Inasal & BBQ Platform. We aim to ensure fair and transparent
        handling of refund requests.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        1. When You Are Eligible for a Refund
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          <strong>Failed payment</strong> — if Maya reports
          <em> PAYMENT_FAILED</em>, your payment was not captured and no refund
          is needed; the charge (if any temporary hold) is automatically
          released by Maya.
        </li>
        <li>
          <strong>Expired payment</strong> — if the 30-minute payment window
          passes and the order expires (<em>PAYMENT_EXPIRED</em>), any
          pre-auth hold on your card is released by Maya automatically.
        </li>
        <li>
          <strong>Order cancelled by us</strong> — if we cancel your order due
          to stock unavailability, branch closure, or operational issues,
          a full refund will be issued for Maya-paid orders.
        </li>
        <li>
          <strong>Duplicate payment</strong> — if you accidentally paid twice
          for the same order, the duplicate charge will be refunded upon
          verification.
        </li>
        <li>
          <strong>Wrong amount charged</strong> — if the charged amount differs
          from the order total shown at checkout, the difference will be
          refunded.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        2. When Refunds Are <em>Not</em> Available
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          <strong>Order completed</strong> — once an order is marked as
          <em> completed</em>, refunds are no longer available except for
          quality complaints (see Section 4).
        </li>
        <li>
          <strong>Customer-initiated cancellation after preparation begins</strong>
          — if the order status has moved past <em>pending</em> to
          <em>preparing</em>, cancellation and refund are no longer available.
        </li>
        <li>
          <strong>COD orders</strong> — Cash on Delivery orders that were
          successfully delivered are not eligible for refund via the Platform.
          Any concerns should be raised with the branch directly.
        </li>
        <li>
          <strong>Vouchers and promo cards</strong> — once a voucher is applied
          to a completed order, its value is consumed and cannot be refunded.
          Promo card purchases are non-refundable once the payment is confirmed.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        3. How to Request a Refund
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          Email us at <strong>info@jpfoodlab.com</strong> with your order reference
          number and reason for the refund request.
        </li>
        <li>
          Include any supporting details (e.g., payment confirmation, photos
          of incorrect items).
        </li>
        <li>
          Our team will review the request within <strong>3 business
          days</strong> and respond via email.
        </li>
        <li>
          Approved refunds for Maya-paid orders are processed through Maya and
          typically appear on your card/wallet within <strong>5–10 business
          days</strong>, depending on your bank or payment provider.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        4. Quality Complaints
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        If you receive an order with quality issues (incorrect items, missing
        items, or significantly unsatisfactory food quality), contact us within
        <strong> 24 hours</strong> of delivery/pickup with:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>Your order reference number.</li>
        <li>A description of the issue.</li>
        <li>Photos if applicable.</li>
      </ul>
      <p className="text-gray-700 leading-relaxed mb-6">
        We will assess the complaint and may offer a replacement, voucher
        credit, or refund depending on the circumstances.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        5. Refund Methods
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          <strong>Maya payments</strong> — refunded to the original payment
          method (card or Maya wallet).
        </li>
        <li>
          <strong>Voucher credit</strong> — in some cases, we may issue a
          voucher as an alternative to a direct refund.
        </li>
        <li>
          <strong>COD orders</strong> — since no payment was made online,
          refunds are handled at the branch level.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        6. Partial Refunds
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        In cases where only part of an order is affected (e.g., one missing
        item out of several), a partial refund proportional to the affected
        item&apos;s cost may be issued. Delivery fees are generally not refunded
        unless the entire order is cancelled by us.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        7. Changes to This Policy
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        We may update this Refund Policy from time to time. The "Last updated"
        date at the top reflects the most recent revision.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        8. Contact Us
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        For refund requests, quality complaints, or any questions about this policy, contact us:
      </p>
      <div className="rounded-lg bg-stone-50 border border-stone-200 px-4 py-3 mb-6">
        <p className="text-gray-700">
          <strong>Email:</strong> info@jpfoodlab.com
        </p>
        <p className="text-gray-700 mt-1">
          <strong>Address:</strong> Century Spire, Century City, Kalayaan Ave, Makati, Metro Manila, Philippines
        </p>
      </div>
    </article>
  );
};

export default RefundPolicyContent;
