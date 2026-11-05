export const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';

    return 'Good night';
  };

export const formatPrice = (value: number, currency: string = "INR"): string => {
  const locale = currency === "INR" ? "en-IN" : undefined;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};