// Notes CRUD — requires notes table from supabase/schema.sql

async function loadNotes(client) {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return;

  const { data, error } = await client
    .from("notes")
    .select("id, content, created_at")
    .order("created_at", { ascending: false });

  const list = document.getElementById("notes-list");
  list.innerHTML = "";

  if (error) {
    list.innerHTML = `<li>${error.message}</li>`;
    return;
  }

  for (const note of data ?? []) {
    const li = document.createElement("li");
    li.textContent = note.content;
    list.appendChild(li);
  }
}

async function addNote() {
  const input = document.getElementById("note-input");
  const content = input.value.trim();
  if (!content) return;

  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return;

  const { error } = await client.from("notes").insert({ content, user_id: user.id });
  if (error) {
    alert(error.message);
    return;
  }

  input.value = "";
  loadNotes(client);
}
