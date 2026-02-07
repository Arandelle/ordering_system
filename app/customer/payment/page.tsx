"use client";

import { useState } from "react";

export default function PaymentPage() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const createPaymentLink = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/paymongo/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "50px auto" }}>
      <h2>Create PayMongo Payment Link</h2>

      <input
        placeholder="Amount (e.g. 10000 = ₱100)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={createPaymentLink} disabled={loading}>
        {loading ? "Creating..." : "Create Payment Link"}
      </button>

      {error && (
        <pre style={{ color: "red", marginTop: 20 }}>{error}</pre>
      )}

      {result && (
        <div style={{ marginTop: 20, padding: 15, border: "1px solid #ccc" }}>
          <p><strong>Amount:</strong> ₱{(result.amount / 100).toFixed(2)}</p>
          <p><strong>Reference:</strong> {result.reference}</p>
          <p>
            <strong>Mode:</strong>{" "}
            {result.livemode ? "LIVE" : "TEST"}
          </p>

          <a
            href={result.checkout_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            👉 Open Payment Page
          </a>
        </div>
      )}
    </div>
  );
}
