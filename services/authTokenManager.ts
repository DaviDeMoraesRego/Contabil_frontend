import axios from "axios";

const AUTH_URL = process.env.NEXT_PUBLIC_API_AUTH!;

let currentToken: string | null = null;
let loginPromise: Promise<string | null> | null = null;

async function login(): Promise<string | null> {
  if (loginPromise) return loginPromise; 

  loginPromise = axios.post(AUTH_URL, {
    username: "Davizeira69",
    password: "Fabiola01#",
  })
    .then(response => {
      currentToken = response.data.token;
      return currentToken;
    })
    .catch(error => {
      console.error("[authTokenManager] Erro ao gerar token:", error);
      currentToken = null;
      throw error;
    })
    .finally(() => {
      loginPromise = null; 
    });

  return loginPromise;
}

(async () => {
  try {
    await login();
  } catch {
  }
  setInterval(login, 5 * 60 * 1000);
})();

export async function getToken(): Promise<string> {
  if (currentToken) return currentToken;
  const token = await login();
  if (!token) throw new Error("Token não disponível");
  return token;
}

