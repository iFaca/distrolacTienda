const formatNumber = (value: number) => {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
};

export const normalizeCapToKg = (cap?: number | null) => {
  const numericCap = Number(cap);

  if (!Number.isFinite(numericCap) || numericCap <= 0) {
    return 0;
  }

  return numericCap;
};

export const formatCapWeight = (cap?: number | null) => {
  const numericCap = Number(cap);

  if (!Number.isFinite(numericCap) || numericCap <= 0) {
    return "0 kg";
  }

  return `${formatNumber(numericCap)} kg`;
};
