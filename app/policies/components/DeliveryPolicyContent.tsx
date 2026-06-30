import React from "react";

const LAST_UPDATED = "June 30, 2026";

/**
 * Delivery Policy content for Harrison House of Inasal & BBQ.
 * Covers delivery area, fees, timing, pickup instructions,
 * and failure handling specific to the ordering platform.
 */
const DeliveryPolicyContent = () => {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Delivery Policy
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        <em>Last updated: {LAST_UPDATED}</em>
      </p>

      <p className="text-gray-700 leading-relaxed mb-6">
        This Delivery Policy applies to all delivery and pickup orders placed
        through the Harrison – House of Inasal & BBQ Platform.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        1. Delivery Availability
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          Delivery is available only within the service area of the selected
          branch. Not all branches offer delivery — check availability when
          selecting your branch.
        </li>
        <li>
          Delivery may be unavailable when the branch is closed, marked as
          <em> busy</em>, or has reached its maximum active order capacity.
        </li>
        <li>
          Store operating hours and branch status are checked before every
          order. If the branch cannot accept your order, you will be notified
          at checkout.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        2. Delivery Fees
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          Delivery fees are calculated based on <strong>distance</strong> from
          the branch to your delivery address (in kilometers).
        </li>
        <li>
          The fee is displayed at checkout before you confirm the order. It is
          included in the total amount charged.
        </li>
        <li>
          <strong>Free delivery</strong> promotions may be available from time
          to time. When applied, the delivery fee will show as zero at
          checkout.
        </li>
        <li>
          Delivery fees are non-refundable unless the entire order is cancelled
          by us.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        3. Estimated Delivery Time
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          An estimated delivery time is provided when you place your order.
          This is an <em>approximation</em> and may vary based on branch
          capacity, order volume, and traffic conditions.
        </li>
        <li>
          Typical delivery times range from <strong>30–60 minutes</strong>,
          depending on distance and branch load.
        </li>
        <li>
          We are not liable for delays caused by factors beyond our control
          (weather, traffic, rider availability, etc.).
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        4. Delivery Address Requirements
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          You must provide a complete and accurate delivery address including:
          street, barangay, city, province, zip code, and any helpful landmark
          or place name.
        </li>
        <li>
          GPS coordinates are saved with your address to assist the rider in
          locating your destination.
        </li>
        <li>
          <strong>Incomplete or incorrect addresses</strong> may result in
          failed delivery. You are responsible for ensuring the address is
          correct.
        </li>
        <li>
          You can save multiple shipping addresses in your account for faster
          ordering.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        5. Rider Assignment and Contact
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          Once your order is dispatched, a rider is assigned. You will see the
          rider&apos;s name, phone number, and vehicle type in your order details.
        </li>
        <li>
          The rider will receive your name, phone number, and delivery address
          for coordination. This information is shared solely for delivery
          purposes.
        </li>
        <li>
          If you cannot be reached at the provided phone number, the delivery
          may be marked as failed.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        6. Pickup Orders
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          Pickup orders can be collected at the selected branch during its
          operating hours.
        </li>
        <li>
          When your order status changes to <em>ready_for_pickup</em>, proceed
          to the branch and present your order reference number.
        </li>
        <li>
          No delivery fee is charged for pickup orders.
        </li>
        <li>
          Please pick up your order within a reasonable time. Orders left
          uncollected for extended periods may affect food quality.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        7. Failed Deliveries
      </h2>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
        <li>
          If delivery fails because you are unreachable, the address is
          incorrect, or you refuse the order upon arrival, the order will be
          marked accordingly.
        </li>
        <li>
          For Maya-paid orders with failed delivery caused by customer-side
          issues, a refund may be issued minus the delivery fee.
        </li>
        <li>
          For COD orders with failed delivery, no payment is collected and no
          refund applies.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        8. Order Tracking
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        You can track your order status in real time through the Platform. The
        status updates you may see include:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-6">
        <li><em>pending</em> — order received, awaiting preparation</li>
        <li><em>preparing</em> — your food is being prepared</li>
        <li><em>dispatched</em> — rider is on the way (delivery orders)</li>
        <li><em>ready_for_pickup</em> — order is ready at the branch</li>
        <li><em>completed</em> — order delivered or picked up</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        9. Changes to This Policy
      </h2>
      <p className="text-gray-700 leading-relaxed mb-6">
        We may update this Delivery Policy from time to time. The "Last
        updated" date at the top reflects the most recent revision.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
        10. Contact Us
      </h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        For delivery concerns, scheduling questions, or any issues related to this policy, contact us:
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

export default DeliveryPolicyContent;
