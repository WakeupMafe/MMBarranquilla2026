import FotoAuthGate from "../components/FotoAuthGate";
import FotoUploadTest from "./FotoUploadTest";

export default function FotosTestPage() {
  return (
    <FotoAuthGate>
      <FotoUploadTest />
    </FotoAuthGate>
  );
}
