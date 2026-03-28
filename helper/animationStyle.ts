export const animationStyle = (visible: boolean, delayMs = 0) =>
  ({
    className: `transform transition-all duration-700 ${
      visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
    }`,
    style: { transitionDelay: `${delayMs}ms` },
  }) as const;