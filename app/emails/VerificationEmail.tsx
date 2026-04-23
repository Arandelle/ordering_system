import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Hr,
  Link,
  Img,
} from "@react-email/components";

interface VerificationEmailProps {
  name: string;
  verifyUrl: string;
  expiryMinutes?: number;
}

const publicUrl =
  process.env.NEXT_PUBLIC_URL ?? "https://harrisoninasalbbq.com.ph";

export function VerificationEmail({
  name,
  verifyUrl,
  expiryMinutes = 15,
}: VerificationEmailProps) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Verify your email to access your account</Preview>

        <Section className="bg-white py-8 px-4">
          <Section className="max-w-[600px] mx-auto bg-white rounded-xl border border-gray-100">

            {/* ── Header ── */}
            <Section className="px-8 py-7 border-b border-gray-100 text-center">
              <Img
                src={`${publicUrl}/images/harrison_logo_landscape.png`}
                width="200"
                alt="Harrison Logo"
                className="mx-auto mb-3"
              />
              <Text className="inline-block text-xs uppercase tracking-widest text-black border-b border-[#ef4501] pb-0.5 mb-2">
                Email Verification
              </Text>
              <Text className="text-sm text-gray-600 m-0">
                Hi{" "}
                <span className="font-medium text-black">{name}</span>,
                you're almost there. Click the button below to verify your
                email address and activate your account.
              </Text>
            </Section>

            {/* ── CTA ── */}
            <Section className="px-8 py-7 border-b border-gray-100 text-center">
              <Button
                href={verifyUrl}
                className="bg-[#ef4501] text-white text-sm font-medium tracking-[0.03em] px-7 py-3 rounded-md no-underline inline-block"
              >
                Verify email address →
              </Button>
            </Section>

            {/* ── Notices ── */}
            <Section className="px-8 py-5 border-b border-gray-100">
              {/* Expiry */}
              <Section className="bg-white rounded-lg px-3.5 py-2.5 mb-3">
                <Text className="text-[11px] uppercase tracking-[0.04em] text-gray-700 mb-0.5">
                  Link expiry
                </Text>
                <Text className="text-sm text-gray-600 m-0 leading-relaxed">
                  This link expires in{" "}
                  <span className="font-medium text-black">
                    {expiryMinutes} minutes
                  </span>
                  . After that you'll need to request a new one.
                </Text>
              </Section>

              {/* Warning */}
              <Section className="bg-[#FAEEDA] rounded-lg px-3.5 py-2.5 mb-3">
                <Text className="text-sm text-[#854F0B] m-0 leading-relaxed">
                  If you didn't request this, ignore this email. No action
                  is needed.
                </Text>
              </Section>

              {/* Fallback link */}
              <Text className="text-sm text-gray-600 m-0">
                Button not working? Copy this link:{" "}
                <Link href={verifyUrl} className="text-[#1D9E75]">
                  {verifyUrl}
                </Link>
              </Text>
            </Section>

            {/* ── Footer ── */}
            <Section className="px-8 py-5 text-center">
              <Text className="text-xs text-gray-700 m-0">
                © {new Date().getFullYear()} Harrison's Inasál BBQ · Do not
                reply to this email.
              </Text>
            </Section>

          </Section>
        </Section>
      </Html>
    </Tailwind>
  );
}