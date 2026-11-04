import useAuth from "../hooks/useAuth";

function AdminPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Management Page</h1>

      <p>Welcome, {user?.email}</p>

      <p>
        Only Admin users can access this page.
      </p>
    </div>
  );
}

export default AdminPage;