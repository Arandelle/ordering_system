import React from "react";

const LAST_UPDATED = "June 30, 2026";

/**
 * Privacy Policy content for Harrison House of Inasal & BBQ.
 * Covers data collection, usage, storage, and user rights
 * specific to the ordering platform.
 */
const PrivacyPolicyContent = () => {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <p className="text-gray-700 leading-relaxed mb-6">
        Harrison – House of Inasal & BBQ ("we", "us", or "our") respects your
        privacy and is committed to protecting your personal data. This Privacy
        Policy explains how we collect, use, store, and protect your
        information when you use our website and mobile application
        (collectively, the "Platform").
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        1. Information We Collect
      </h2>

      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
        a. Information You Provide
      </h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          <strong>Account details</strong> — first name, last name, email
          address (limited to Gmail accounts), phone number, and password when
          you register.
        </li>
        <li>
          <strong>Shipping address</strong> — street, city, province, barangay,
          zip code, landmark, and GPS coordinates for delivery orders.
        </li>
        <li>
          <strong>Order information</strong> — selected items, quantities,
          branch, fulfillment type (delivery or pickup), and any order notes
          you add.
        </li>
        <li>
          <strong>Payment details</strong> — we do <em>not</em> store full
          credit/debit card numbers. Only the last four digits, card scheme
          (e.g., Visa, Mastercard), and a payment description (e.g., "Visa
          ending 0008") are retained on our records. Full card data is handled
          exclusively by our payment provider, Maya (PayMaya).
        </li>
        <li>
          <strong>Reviews and feedback</strong> — ratings, comments, and
          item-level reviews you submit after completing an order.
        </li>
        <li>
          <strong>Voucher and promo card data</strong> — voucher codes you
          apply and promo card purchases you make.
        </li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
        b. Information Collected Automatically
      </h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          <strong>Session data</strong> — your IP address and browser/device
          user agent string are recorded when you log in or interact with the
          Platform.
        </li>
        <li>
          <strong>Activity logs</strong> — we maintain an internal audit trail
          recording key actions (order creation, status changes, cancellations,
          payment events) linked to your account and IP address.
        </li>
        <li>
          <strong>Device storage</strong> — before you log in, your cart items
          are temporarily stored in your browser&apos;s local storage. Upon login,
          they are merged into your database-stored cart.
        </li>
        <li>
          <strong>Cookies</strong> — we use authentication cookies (HTTP-only,
          secure) to keep you logged in. No third-party analytics or tracking
          cookies are used.
        </li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">
        c. Information from Third-Party Services
      </h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          <strong>Google Sign-In</strong> — if you log in via Google, we
          receive your Google profile name and email as provided by Google&apos;s
          OAuth service.
        </li>
        <li>
          <strong>Maya (PayMaya)</strong> — our payment gateway. We send your
          name, email, phone, shipping address, and order details to Maya to
          process your payment. Maya may collect additional data per its own
          privacy policy.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>To create and manage your account and authenticate you.</li>
        <li>
          To process and fulfill your orders (delivery, pickup, and
          payment).
        </li>
        <li>
          To calculate applicable taxes (VAT), discounts, delivery fees, and
          order totals.
        </li>
        <li>
          To send order confirmation, status update, and notification emails.
        </li>
        <li>
          To coordinate delivery with assigned riders (name, phone shared with
          the rider for your order).
        </li>
        <li>
          To verify your email address and handle password reset requests.
        </li>
        <li>
          To manage vouchers, promo cards, and promotional discounts.
        </li>
        <li>To maintain an internal audit trail for security and debugging.</li>
        <li>
          To display and moderate your reviews on our Platform.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        3. Data Storage and Retention
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        Your data is stored in secure MongoDB databases hosted on protected
        servers. We retain your data as follows:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          <strong>Account data</strong> — retained while your account is active.
          You may request deletion at any time (see Section 6).
        </li>
        <li>
          <strong>Order history</strong> — retained indefinitely for record-keeping,
          dispute resolution, and legal compliance.
        </li>
        <li>
          <strong>Cart data</strong> — automatically deleted after 7 days of
          inactivity.
        </li>
        <li>
          <strong>Session data</strong> — expires when you log out or when the
          session token expires.
        </li>
        <li>
          <strong>Activity logs</strong> — retained for internal auditing and
          security purposes.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        4. Data Sharing
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        We do <em>not</em> sell, rent, or trade your personal data. We share
        information only in the following circumstances:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          <strong>Maya (PayMaya)</strong> — your name, email, phone, shipping
          address, and order details are shared to process online payments.
        </li>
        <li>
          <strong>Resend</strong> — your email address is shared with our email
          service provider to send transactional emails (verification, order
          updates, password reset).
        </li>
        <li>
          <strong>Delivery riders</strong> — your name, phone, and delivery
          address are shared with the assigned rider to fulfill your delivery
          order.
        </li>
        <li>
          <strong>Legal requirements</strong> — we may disclose data if required
          by Philippine law, regulation, or legal process.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        5. Data Security
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        We implement industry-standard measures to protect your data:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          Passwords are hashed using bcrypt and are never stored in plain text.
        </li>
        <li>
          Authentication cookies are HTTP-only and flagged as secure in
          production.
        </li>
        <li>
          Staff/admin tokens use JWT with 8-hour expiry and are stored in
          HTTP-only cookies.
        </li>
        <li>
          Payment webhook endpoints are restricted to Maya&apos;s whitelisted IPs.
        </li>
        <li>
          We validate all incoming request data and enforce authentication on
          protected endpoints.
        </li>
        <li>
          <em>No system is completely secure.</em> While we take reasonable
          precautions, we cannot guarantee absolute security against all
          threats.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        6. Your Rights
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Under the Philippine Data Privacy Act of 2012 (RA 10173), you have the
        right to:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate or incomplete data.</li>
        <li>
          Request deletion of your personal data, subject to legal retention
          requirements (e.g., order records for tax/compliance).
        </li>
        <li>Withdraw consent for data processing where consent is the basis.</li>
        <li>Lodge a complaint with the National Privacy Commission.</li>
      </ul>
      <p className="text-gray-700 leading-relaxed mb-6">
        To exercise any of these rights, contact us at the email provided below.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        7. Children&apos;s Privacy
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        Our Platform is not intended for children under 13. We do not knowingly
        collect personal data from children under 13. If we discover that we
        have inadvertently collected such data, we will promptly delete it.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        8. Changes to This Policy
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        We may update this Privacy Policy from time to time. The "Last updated"
        date at the top of this page reflects the most recent revision. We
        encourage you to review this page periodically.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        9. Contact Us
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        If you have questions or concerns about this Privacy Policy or your
        personal data, please contact us:
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

export default PrivacyPolicyContent;
