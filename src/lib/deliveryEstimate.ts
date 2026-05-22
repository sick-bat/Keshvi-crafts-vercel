function addBusinessDays(date: Date, days: number) {
  const next = new Date(date);
  let remaining = days;

  while (remaining > 0) {
    next.setDate(next.getDate() + 1);
    const day = next.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }

  return next;
}

export function getEstimatedDeliveryRange(createdAt: Date) {
  return {
    earliest: addBusinessDays(createdAt, 12),
    latest: addBusinessDays(createdAt, 20),
  };
}

export function formatDeliveryRange(createdAt: Date) {
  const { earliest, latest } = getEstimatedDeliveryRange(createdAt);
  const formatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(earliest)} - ${formatter.format(latest)}`;
}
