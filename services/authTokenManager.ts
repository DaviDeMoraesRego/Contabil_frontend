let currentToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

export function setAuthToken(token: string) {
  currentToken = token;
  tokenPromise = null; 
}

export async function getToken(): Promise<string> {
  if (currentToken) return currentToken;

  if (!tokenPromise) {
    tokenPromise = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (currentToken) {
          clearInterval(interval);
          resolve(currentToken);
        }
      }, 50);
    });
  }

  return tokenPromise;
}
