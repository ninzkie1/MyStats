const USER_KEY = 'user';
const REMEMBER_USERNAME_KEY = 'rememberedUsername';
const REMEMBER_ME_KEY = 'rememberMe';

export const getStoredUser = () => {
  const fromLocal = localStorage.getItem(USER_KEY);
  if (fromLocal) {
    try {
      return JSON.parse(fromLocal);
    } catch {
      localStorage.removeItem(USER_KEY);
    }
  }

  const fromSession = sessionStorage.getItem(USER_KEY);
  if (fromSession) {
    try {
      return JSON.parse(fromSession);
    } catch {
      sessionStorage.removeItem(USER_KEY);
    }
  }

  return null;
};

export const getAccessToken = () => {
  const user = getStoredUser();
  return user?.data?.accessToken || null;
};

export const setStoredUser = (userData, rememberMe) => {
  const serialized = JSON.stringify(userData);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);

  if (rememberMe) {
    localStorage.setItem(USER_KEY, serialized);
  } else {
    sessionStorage.setItem(USER_KEY, serialized);
  }
};

export const updateStoredUser = (userData) => {
  const serialized = JSON.stringify(userData);

  if (localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, serialized);
  } else if (sessionStorage.getItem(USER_KEY)) {
    sessionStorage.setItem(USER_KEY, serialized);
  }
};

export const clearStoredUser = () => {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
};

export const getRememberedUsername = () =>
  localStorage.getItem(REMEMBER_USERNAME_KEY) || '';

export const setRememberedUsername = (username) => {
  localStorage.setItem(REMEMBER_USERNAME_KEY, username);
};

export const clearRememberedUsername = () => {
  localStorage.removeItem(REMEMBER_USERNAME_KEY);
};

export const getRememberMePreference = () =>
  localStorage.getItem(REMEMBER_ME_KEY) !== 'false';

export const setRememberMePreference = (rememberMe) => {
  localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
};
