import { useEffect, useState } from "react";

function App() {
  //State variables
  const [deadlines, setDeadlines] = useState([]);

  // Add form state
  const [newDeadline, setNewDeadline] = useState({
    course: "",
    title: "",
    type: "",
    due_date: ""
  });

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // -------------------- FETCH --------------------
  useEffect(() => {
    const fetchDeadlines = async () => {
      const res = await fetch("http://localhost:5000/");
      const data = await res.json();
      setDeadlines(data);
    };
    fetchDeadlines();
  }, []);

  // -------------------- DELETE --------------------
  const deleteDeadline = async (id) => {
    await fetch(`http://localhost:5000/${id}`, { method: "DELETE" });

    setDeadlines(prev =>
      prev.filter(deadline => deadline._id !== id)
    );
  };

  // -------------------- ADD --------------------
  const addDeadline = async (e) => {
    e.preventDefault();

    const allowedTypes = ["exam", "midterm", "assignment"];
    if (!allowedTypes.includes(newDeadline.type.toLowerCase())) {
      alert('Type must be "exam", "midterm", or "assignment".');
      return;
    }

    const res = await fetch("http://localhost:5000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newDeadline,
        type: newDeadline.type.toLowerCase()
      })
    });

    const saved = await res.json();

    setDeadlines(prev => [...prev, saved]);

    setNewDeadline({
      course: "",
      title: "",
      type: "",
      due_date: ""
    });
  };

  // -------------------- UPDATE --------------------
  const updateDeadline = async (e) => {
    e.preventDefault();

    const allowedTypes = ["exam", "midterm", "assignment"];
    if (!allowedTypes.includes(editForm.type.toLowerCase())) {
      alert('Type must be "exam", "midterm", or "assignment".');
      return;
    }

    const res = await fetch(
      `http://localhost:5000/${editForm._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: editForm.course,
          title: editForm.title,
          type: editForm.type.toLowerCase(),
          due_date: editForm.due_date
        })
      }
    );

    const updated = await res.json();

    setDeadlines(prev =>
      prev.map(d => (d._id === updated._id ? updated : d))
    );

    setIsEditing(false);
    setEditForm(null);
  };

  // -------------------- UI --------------------
  return (
    <div>
      <h1>Your Deadlines</h1>

      <ul>
        {deadlines
          .slice()
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .map(deadline => (
            <li key={deadline._id}>
              {deadline.course} – {deadline.title} – {deadline.type} – Due:{" "}
              {new Date(deadline.due_date).toLocaleDateString()} –{" "}
              {deadline.overdue? "Overdue ": `Days Remaining: ${deadline.daysRemaining}`}{" "}

              <button onClick={() => deleteDeadline(deadline._id)}>
                Delete
              </button>

              <button
                onClick={() => {
                  setEditForm({
                    ...deadline,
                    due_date: new Date(deadline.due_date)
                      .toISOString()
                      .split("T")[0]
                  });
                  setIsEditing(true);
                }}
              >
                Edit
              </button>
            </li>
          ))}
      </ul>

      {/* -------- EDIT MODAL -------- */}
      {isEditing && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Edit Deadline</h2>

            <form onSubmit={updateDeadline}>
              <input
                type="text"
                value={editForm.course}
                onChange={e =>
                  setEditForm({ ...editForm, course: e.target.value })
                }
                required
              />

              <input
                type="text"
                value={editForm.title}
                onChange={e =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                required
              />

              <input
                type="text"
                value={editForm.type}
                onChange={e =>
                  setEditForm({ ...editForm, type: e.target.value })
                }
                required
              />

              <input
                type="date"
                value={editForm.due_date}
                onChange={e =>
                  setEditForm({ ...editForm, due_date: e.target.value })
                }
                required
              />

              <button type="submit">Save</button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------- ADD FORM -------- */}
      <form onSubmit={addDeadline}>
        <h2>Add New Deadline</h2>

        <input
          type="text"
          placeholder="Course"
          value={newDeadline.course}
          onChange={e =>
            setNewDeadline({ ...newDeadline, course: e.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Title"
          value={newDeadline.title}
          onChange={e =>
            setNewDeadline({ ...newDeadline, title: e.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Type"
          value={newDeadline.type}
          onChange={e =>
            setNewDeadline({ ...newDeadline, type: e.target.value })
          }
          required
        />

        <input
          type="date"
          value={newDeadline.due_date}
          onChange={e =>
            setNewDeadline({ ...newDeadline, due_date: e.target.value })
          }
          required
        />

        <button type="submit">Add Deadline</button>
      </form>
    </div>
  );
}

export default App;
