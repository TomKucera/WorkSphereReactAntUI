import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCvById, createCv } from "../services/cvApi";
import { Cv } from "../types/cv";
import CvForm from "../components/CvForm";

const CvEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cv, setCv] = useState<Cv | null>(null);

  useEffect(() => {
    if (id && id !== "new") {
      getCvById(Number(id)).then(setCv);
    }
  }, [id]);

  const handleSubmit = async (data: any) => {
    await createCv(data);
    // if (id === "new") {
    //   await createCv(data);
    // } else if (id) {
    //   await updateCv(Number(id), data);
    // }
    navigate("/cvs");
  };

  if (id !== "new" && !cv) return <div>Loading...</div>;

  return (
    <div>
      <h1>{id === "new" ? "Upload CV" : "Edit CV"}</h1>
      <CvForm initialData={cv || undefined} onSubmit={handleSubmit} />
    </div>
  );
};

export default CvEditPage;
