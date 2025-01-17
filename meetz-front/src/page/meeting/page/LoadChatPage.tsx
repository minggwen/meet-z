import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../common/Loading";

const LoadChatPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/manage/${meetingId}`);
    }, 1500);

    return () => clearTimeout(timer);
  }, [meetingId, navigate]);

  return (
    <div className="mt-36 flex flex-grow flex-col items-center justify-center gap-12">
      <span className="text-3xl font-semibold">잠시 후 미팅이 시작됩니다!</span>
      <Loading width={100} height={100} />
    </div>
  );
};

export default LoadChatPage;
