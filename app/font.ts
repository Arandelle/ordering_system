import { DM_Sans, Syne } from "next/font/google";

export const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});