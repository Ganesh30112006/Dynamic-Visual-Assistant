import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <section className="empty-state">
        <h1>Page not found</h1>
        <p>This address does not match a page in Dynamic Visual Assistant.</p>
        <Link className="btn btn-primary" to="/">Go to home</Link>
      </section>
    </div>
  );
}
