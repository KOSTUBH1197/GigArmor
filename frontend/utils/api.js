const API = process.env.NEXT_PUBLIC_API_URL;

export const registerUser = async (data) => {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};