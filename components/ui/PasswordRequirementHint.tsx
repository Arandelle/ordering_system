import React from "react";
import { DynamicIcon } from "./DynamicIcon";

type Requirement = { check: boolean; text: string };

type Props = {
  password: string;
  requirements?: Requirement[];
};

// Default requriements matching the project's password policy

const DEFAULT_REQUIREMENTS = (pw: string): Requirement[] => [
  { check: pw.length >= 8, text: "At least 8 characters" },
  { check: /[A-Z]/.test(pw), text: "One uppercase letter" },
  { check: /[0-9]/.test(pw), text: "One number" },
  { check: /[^A-Za-z0-9]/.test(pw), text: "One symbol" },
];

/**
 *  Real-time password requirement hints
 * Green + check icon when satisfired, gray + X icon when not
 * @param param0
 * @returns
 */
export function PasswordRequirementHint({ password, requirements }: Props) {
  const items = requirements ?? DEFAULT_REQUIREMENTS(password);

  if (!password) return null;

  return (
    <ul className="space-y-1 mt-1">
      {items.map(({ check, text }) => (
        <li
          key={text}
          className="flex items-center gap-2 text-xs transition-colors"
        >
          {check ? (
            <DynamicIcon name="Check" size={14} className="text-green-500" />
          ) : (
            <DynamicIcon name="X" size={14} className="text-gray-400" />
          )}
          <span
            className={check ? "text-green-600 font-medium" : "text-gray-400"}
          >
            {text}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default PasswordRequirementHint;
