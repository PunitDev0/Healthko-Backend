const getFieldValue = (v) => (Array.isArray(v) ? v[0] : v);

export const getArrayField = (v) => {
  if (!v) return [];

  // Case 1: Already array of values
  if (Array.isArray(v)) {
    // ["ICU Training", "Emergency Care"]
    if (v.length > 1) return v;

    // ["ICU Training,Emergency Care"]
    return v[0].split(",").map(s => s.trim());
  }

  // Case 2: String
  return v.split(",").map(s => s.trim());
};
