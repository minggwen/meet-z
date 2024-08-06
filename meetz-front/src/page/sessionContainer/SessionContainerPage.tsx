import { useEffect, useState } from "react";
import FanSettingPage from "./setting/pages/FanSettingPage";
import StarLoadingPage from "./setting/pages/StarLoadingPage";
import SessionSwitchPage from "./session/pages/SessionSwitchPage";
import { useSessionStore } from "../../zustand/useSessionStore";
import StarSessionPage from "./session/pages/StarSessionPage";
import FanSessionPage from "./session/pages/FanSessionPage";
import { EventSourcePolyfill } from "event-source-polyfill";
import fetchUserData from "../../lib/fetchUserData";
import { useOpenvidu } from "../../hooks/session/useOpenvidu";

const SessionContainerPage = () => {
  // const storedRole:String|null = window.sessionStorage.getItem('rl');
  const { session, publisher, subscriber, joinSession } = useOpenvidu();
  const storedRole: String | null = "FAN";
  const storedMeetingId: String | null = window.sessionStorage.getItem("mi");
  const {
    wait,
    fanId,
    token,
    remain,
    settingDone,
    setWait,
    setFanId,
    setRemain,
    setSettingDone,
    setToken,
  } = useSessionStore();
  //SSE 연결
  useEffect(() => {
    fetchSSE();
  }, []);
  useEffect(() => {
    if(token!==''){
      joinSession();
    }
  }, [token]);
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
    eventSource.onopen = () => {
      console.log("!SSE 연결 성공!");
    };
    eventSource.onmessage = async (e: any) => {
      const res = await e.data;
      const parseData = JSON.parse(res);
      console.log(parseData);
      setWait(parseData.waitingNum);
      setToken(parseData.viduToken);
    eventSource.onerror = (e: any) => {
      eventSource.close();
      if (e.error) {
      }
      if (e.target.readyState === EventSourcePolyfill.CLOSED) {
      }
    };
  };
}

  if (storedRole === "STAR") {
    if (settingDone) {
      return <StarSessionPage />;
    }
    if (remain === 0) {
      return <SessionSwitchPage />;
    }
    return <StarLoadingPage />;
    //return <StarSessionPage />;
  }

  if (storedRole === "FAN") {
    if (wait === 0 && settingDone) {
      return <FanSessionPage />;
    }
    if (remain === 0) {
      return <SessionSwitchPage />;
    }
    return <FanSettingPage />;
    // return <FanSessionPage />;
  }
  return null;
};
export default SessionContainerPage;
