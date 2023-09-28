export interface I_ValidateError {
  isError: boolean;
  message?: string;
  name: string;
}

export const validateTitle = (title: string): I_ValidateError => {
  if (!title || title.length === 0)
    return { isError: true, message: "Title is required!", name: "title" };
  if (title.length > 40)
    return {
      isError: true,
      message: "Title max length - 40 symbols.",
      name: "title",
    };
  return { isError: false, name: "title" };
};

export const validateStatus = (status: string): I_ValidateError => {
  if (!status)
    return { isError: true, message: "Status is required!", name: "status" };
  return { isError: false, name: "status" };
};

export const parseValidationResult = (validationsResult: I_ValidateError[]) => {
  const errors: { [p: string]: { message: string } } = {};
  validationsResult.forEach((res) => {
    if (res.isError) {
      errors[res.name] = { message: res.message };
    }
  });
  return errors;
};
