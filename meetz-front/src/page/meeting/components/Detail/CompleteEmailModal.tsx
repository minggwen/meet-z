import { MeetingDetailDto } from '../../../../types/types';
import { useDetailstore } from '../../../../zustand/useDetailStore';

const CompleteEmailModal = ({ meetingData }: { meetingData: MeetingDetailDto }) => {
  const { closeMailModal, setModalStep } = useDetailstore();

  const closeHandler = () => {
    closeMailModal();
    setModalStep(0);
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
      <div
        onClick={(e) => e.stopPropagation()}
        className='w-[460px] h-[240px] flex flex-col  items-center justify-center rounded-3xl border-2 border-[#FF4F5D] bg-white'
      >
        <div className='flex flex-col'>
          <div className='gap-1 flex flex-col items-center justify-center'>
            <div>
              <span className='text-2xl font-bold cursor-default'>
                {meetingData.meetingName}
              </span>
            </div>
            <span className='text-xl'>
              당첨자 메일 발송이 완료 되었습니다 !
            </span>
          </div>
          <div className='flex justify-center mt-7 -mb-4'>
            <button
              onClick={closeHandler}
              className='text-xl duration-100 ease-in-out transform hover:scale-105 hover:bg-[#ff626f] transition text-white border px-5 py-1  border-[#FF4F5D] bg-[#ff4f5d] rounded-lg'
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteEmailModal;
