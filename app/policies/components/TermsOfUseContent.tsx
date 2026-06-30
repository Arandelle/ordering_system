import React from "react";

const LAST_UPDATED = "June 30, 2026";

/**
 * Terms of Use content for Harrison House of Inasal & BBQ.
 * Covers user obligations, ordering rules, payment terms,
 * intellectual property, and limitation of liability.
 */
const TermsOfUseContent = () => {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Terms of Use
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <p className="text-gray-700 leading-relaxed mb-6">
        These Terms of Use ("Terms") govern your access to and use of the
        Harrison – House of Inasal & BBQ website and mobile application
        ("Platform"). By using the Platform, you agree to be bound by these
        Terms. If you do not agree, please do not use the Platform.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        1. Account Registration
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          You must register with a valid Gmail email address and provide
          accurate personal information (name, phone number).
        </li>
        <li>
          You must verify your email address before placing orders.
        </li>
        <li>
          Your password must be at least 8 characters and include an uppercase
          letter, a number, and a symbol.
        </li>
        <li>
          You are responsible for keeping your password confidential. Notify us
          immediately if you suspect unauthorized access.
        </li>
        <li>
          You may also register using Google Sign-In, which links your Google
          account to our Platform.
        </li>
        <li>
          One account per person. Creating multiple accounts is prohibited.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        2. Ordering
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          All orders are subject to the selected branch&apos;s availability,
          operating hours, and order capacity. If a branch is marked as busy or
          closed, orders may not be accepted.
        </li>
        <li>
          Orders have a <strong>30-minute payment window</strong>. If payment
          is not completed within this period, the order will expire
          automatically.
        </li>
        <li>
          Prices displayed include applicable VAT. Final totals are calculated
          server-side — do not rely solely on client-side calculations.
        </li>
        <li>
          We reserve the right to cancel orders if inventory is insufficient,
          the store is closed, or for any valid operational reason.
        </li>
        <li>
          <strong>Double orders:</strong> clicking "Place Order" more than once
          may result in duplicate orders. Please wait for confirmation before
          retrying.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        3. Payment
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          We accept <strong>Maya (PayMaya)</strong> online payments (credit/debit
          cards and Maya Wallet) and <strong>Cash on Delivery (COD)</strong>.
        </li>
        <li>
          Online payments are processed entirely by Maya. We do not handle your
          full card details — only limited information (last four digits, card
          scheme) is stored on our end.
        </li>
        <li>
          Payment status is confirmed via Maya&apos;s webhook callback —
          <em> frontend confirmation alone does not constitute proof of
          payment.</em>
        </li>
        <li>
          <strong>Do not</strong> attempt to mark an order as paid from the
          client side. Payment confirmation is authoritative only when received
          from our backend.
        </li>
        <li>
          If you close the browser or app during payment, check your email or
          order history to verify the payment outcome before re-ordering.
        </li>
        <li>
          Payment buttons are designed to prevent duplicate submission. Do not
          bypass this mechanism.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        4. Order Status and Fulfillment
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Orders follow this status flow:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-6">
        <li>
          <em>Maya orders:</em> pending_payment → pending → preparing →
          dispatched/ready_for_pickup → completed
        </li>
        <li>
          <em>COD orders:</em> pending → preparing → dispatched/ready_for_pickup
          → completed
        </li>
        <li>
          Orders may also be cancelled, failed, or expired at various stages.
        </li>
      </ul>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          You may cancel an order only while it is in <strong>pending</strong>
          status. Once preparation has begun, cancellation is no longer
          available.
        </li>
        <li>
          Estimated delivery/pickup times are approximate and may vary based on
          branch capacity and order volume.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        5. Delivery and Pickup
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          Delivery is available only within the service area of the selected
          branch. Delivery fees are calculated based on distance.
        </li>
        <li>
          You must provide a valid and complete delivery address. Incomplete or
          incorrect addresses may result in failed delivery.
        </li>
        <li>
          For delivery orders, your name and phone number will be shared with
          the assigned rider for coordination purposes.
        </li>
        <li>
          For pickup orders, please arrive at the branch during the estimated
          ready time and present your order reference number.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        6. Reviews and Feedback
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          You may submit one review per completed order. Reviews are subject to
          moderation and may be hidden if they violate community standards.
        </li>
        <li>
          Reviews must be honest and not contain offensive, misleading, or
          defamatory content.
        </li>
        <li>
          We reserve the right to remove reviews that violate these standards.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        7. Vouchers and Promotions
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          Vouchers and promotions are subject to their specific terms
          (minimum purchase, validity period, one-time use, etc.).
        </li>
        <li>
          Vouchers cannot be combined unless explicitly allowed.
        </li>
        <li>
          Promo cards are separate purchases with their own validity and usage
          rules as described at the time of purchase.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        8. Intellectual Property
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        All content on the Platform — including logos, branding, images, menu
        descriptions, and design — is the property of Harrison – House of
        Inasal & BBQ or its licensors. You may not reproduce, distribute, or
        modify any such content without our written permission.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        9. Prohibited Conduct
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          Using the Platform for any unlawful purpose.
        </li>
        <li>
          Attempting to bypass payment, authentication, or security mechanisms.
        </li>
        <li>
          Submitting fraudulent orders or false payment claims.
        </li>
        <li>
          Creating multiple accounts to exploit promotions or circumvent
          restrictions.
        </li>
        <li>
          Uploading malicious code or exploiting vulnerabilities in the
          Platform.
        </li>
        <li>
          Impersonating another person or misrepresenting your identity.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        10. Limitation of Liability
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        To the fullest extent permitted by Philippine law, Harrison – House of
        Inasal & BBQ shall not be liable for any indirect, incidental, or
        consequential damages arising from your use of the Platform, including
        but not limited to:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>Order delays or fulfillment failures beyond our control.</li>
        <li>Payment processing errors by third-party providers (Maya).</li>
        <li>Delivery issues caused by incorrect address information you
          provided.</li>
        <li>Temporary unavailability of the Platform due to maintenance or
          technical issues.</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        11. Termination
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        We may suspend or terminate your access to the Platform at any time if
        you violate these Terms. You may also deactivate your account by
        contacting us. Upon termination, your right to use the Platform ceases,
        though certain data (such as completed order records) may be retained as
        required by law.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        12. Governing Law
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        These Terms are governed by the laws of the Republic of the Philippines.
        Any disputes shall be resolved in the appropriate courts of Makati,
        Metro Manila.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        13. Changes to These Terms
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        We may revise these Terms from time to time. The "Last updated" date at
        the top of this page indicates the latest revision. Continued use of
        the Platform after changes constitutes acceptance of the revised Terms.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        14. Contact Us
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        For questions about these Terms, please contact us:
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

export default TermsOfUseContent;
