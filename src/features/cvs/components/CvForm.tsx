import { useState } from "react";
import { Cv } from "../types/cv";

interface Props {
  initialData?: Cv;
  onSubmit: any;
}

const CvForm = ({ initialData, onSubmit }: Props) => {
  
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    onSubmit(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      {!initialData && (
        <div>
          <label>File</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
        </div>
      )}

      <button type="submit">Save</button>
    </form>
  );
};

export default CvForm;
