// Vanilla Supabase starter — mirrors the HTML snippet you shared.
// Open supabase-starter/index.html in a browser after setting URL/key and running schema.sql.

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await client.auth.signUp({ email, password });
  document.getElementById("auth-msg").textContent = error
    ? error.message
    : "Check your email to confirm, then sign in.";
}

async function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await client.auth.signInWithPassword({ email, password });
  document.getElementById("auth-msg").textContent = error ? error.message : "";
}

async function signOut() {
  await client.auth.signOut();
}
