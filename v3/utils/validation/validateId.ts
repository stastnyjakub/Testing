export const validateId = (id: string): string | number => {
  const validatedId = Number(id);
  if (!isNaN(validatedId)) {
    return validatedId;
  } else {
    return '';
  }
};
