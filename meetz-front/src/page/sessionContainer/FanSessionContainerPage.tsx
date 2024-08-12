import { useEffect, useState } from "react";
import { useSessionStore } from "../../zustand/useSessionStore";
import { EventSourcePolyfill } from "event-source-polyfill";
import fetchUserData from "../../lib/fetchUserData";
import FanSessionPage from "./session/pages/FanSessionPage";
import FanSettingPage from "./setting/pages/FanSettingPage";
import SessionLoadingPage from "./session/pages/SessionLoadingPage";
import PickPhotoPage from "./pickPhoto/PickPhotoPage";
import SessionSwitchPage from "./session/pages/SessionSwitchPage";
import { useOpenvidu } from "../../hooks/session/useOpenvidu";
import useOpenviduStore from "../../zustand/useOpenviduStore";
type SessionInfo = {
  timer: number;
  wait: number;
  starName: string;
  nextStarName: string;
  sessionId: string;
};
const FanSessionContainerPage = () => {
  const { isSessionEnd, setWait, setTakePhoto, setIsSessionEnd } =
    useSessionStore();
  const { session, setSessionId } = useOpenviduStore();
  const [type, setType] = useState(0);
  const { leaveSession } = useOpenvidu();
  const { settingDone, setTimer, setStartName, setNextStarName } =
    useSessionStore();
  //로딩될 때마다 SSE 연결 시도
  useEffect(() => {
    fetchSSE();
  }, []);
  useEffect(() => {
    console.log(session);
  }, [session]);
  useEffect(() => {
    if (!settingDone && type === 1) {
      alert("카메라 설정이 완료되어야 미팅 입장이 진행됩니다.");
    }
  }, [type]);
  //fetchSSE 연결
  const fetchSSE = () => {
    console.log("SSE 연결 시도");
    const { accessToken } = fetchUserData();
    const eventSource = new EventSourcePolyfill(
      `${import.meta.env.VITE_API_DEPLOYED_URL}/api/sessions/sse`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "text/event-stream",
        },
        heartbeatTimeout: 7200 * 1000,
      }
    );

    //SSE와 연결 되었을 때
    eventSource.onopen = () => {
      console.log("!SSE 연결 성공!");
    };

    //SSE에게 메시지를 전달 받았을 때
    eventSource.onmessage = async (e: any) => {
      const res = await e.data;
      const parseData = await JSON.parse(res);
      console.log(parseData);
      await setType(parseData.type);
      if (session && parseData.type !== 3 && parseData.type !== 0) {
        await leaveSession();
      }
      switch (parseData.type) {
        case 1:
          await moveNextSession(parseData);
          break;
      
        case 3:
          setTakePhoto(true);
          break;
      
        case 4:
          leaveSession();
          if (
            !localStorage.getItem("images") ||
            localStorage.getItem("images") === "[]"
          ) {
            setIsSessionEnd(true);
          }
          break;
      
        case 0:
          setWait(parseData.waitingNum);
          break;
      }
      
      //SSE에러 발생 시 SSE와 연결 종료
      eventSource.onerror = (e: any) => {
        eventSource.close();
        if (e.error) {
          console.error(e.error);
        }
        if (e.target.readyState === EventSourcePolyfill.CLOSED) {
          console.log("EventSourcePolyFill-CLOSED");
        }
      };
    };
  };

  const moveNextSession = async (parseData: any) => {
    const info: SessionInfo = {
      timer: parseData.timer,
      starName: parseData.currentStarName,
      nextStarName: parseData.nextStarName,
      sessionId: parseData.viduToken,
      wait: parseData.waitingNum,
    };
    await setInfo(info);
  };
  const setInfo = async (info: SessionInfo) => {
    setTimer(info.timer);
    setStartName(info.starName);
    setNextStarName(info.nextStarName);
    setSessionId(info.sessionId);
    setWait(info.wait);
  };
  if (type === 2 && settingDone) {
    return <SessionLoadingPage />;
  } else if (type === 4) {
    if (isSessionEnd) {
      return <SessionSwitchPage />;
    }
    return <PickPhotoPage />;
  } else if ((type === 1 || type === 3) && settingDone) {
    return <FanSessionPage />;
  } else {
    return <FanSettingPage />;
  }
};

export default FanSessionContainerPage;