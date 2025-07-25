import "./spinner.css";

const Spinner = () => {
  return (
    <div className="spinner-container">
      <svg viewBox="25 25 50 50" className="spinner-svg">
        <circle r="20" cy="50" cx="50" className="spinner-circle"></circle>
      </svg>
    </div>
  );
};

export default Spinner;
