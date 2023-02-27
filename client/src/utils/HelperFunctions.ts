export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const setToken = async (val: string) => {
  await localStorage.setItem("token", val);
};
