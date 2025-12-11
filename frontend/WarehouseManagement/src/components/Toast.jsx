export default function Toast({ message, tone = "info" }) {
  return (
    <div className={`toast toast-${tone}`}>
      <span className="dot" />
      <p>{message}</p>
    </div>
  );
}
