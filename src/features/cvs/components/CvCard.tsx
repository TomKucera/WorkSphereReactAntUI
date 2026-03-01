import { Link } from "react-router-dom";
import { Cv } from "../types/cv";

interface Props {
  cv: Cv;
  onDelete: (id: number) => void;
}

const CvCard = ({ cv, onDelete }: Props) => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "12px",
        marginBottom: "10px",
        borderRadius: "6px",
      }}
    >
      <h3>
        {cv.originalFileName}
      </h3>
      <p>File: {cv.originalFileName}</p>
      <p>Created: {new Date(cv.createdAt).toLocaleDateString()}</p>

      <Link to={`/cvs/${cv.id}`}>Edit</Link>
      {" | "}
      <button onClick={() => onDelete(cv.id)}>Delete</button>
    </div>
  );
};

export default CvCard;
