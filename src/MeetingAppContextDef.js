import {
  useContext,
  createContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";

export const MeetingAppContext = createContext();

export const useMeetingAppContext = () => useContext(MeetingAppContext);

export const MeetingAppProvider = ({ children }) => {
  const [raisedHandsParticipants, setRaisedHandsParticipants] = useState([]);
  const [sideBarMode, setSideBarMode] = useState(null);
  const [draftPolls, setDraftPolls] = useState([]);
  const [createdPolls, setCreatedPolls] = useState([]);
  const [endedPolls, setEndedPolls] = useState([]);
  const [afterMeetingJoinedHLSState, setAfterMeetingJoinedHLSState] =
    useState(null);

  const polls = useMemo(
    () =>
      createdPolls.map((poll) => ({
        ...poll,
        isActive:
          endedPolls.findIndex(({ pollId }) => pollId === poll.id) === -1,
      })),
    [createdPolls, endedPolls]
  );

  const useRaisedHandParticipants = () => {
    const raisedHandsParticipantsRef = useRef();

    const participantRaisedHand = (participantId) => {
      const raisedHandsParticipants = [...raisedHandsParticipantsRef.current];

      const newItem = { participantId, raisedHandOn: new Date().getTime() };

      const participantFound = raisedHandsParticipants.findIndex(
        ({ participantId: pID }) => pID === participantId
      );

      if (participantFound === -1) {
        raisedHandsParticipants.push(newItem);
      } else {
        raisedHandsParticipants[participantFound] = newItem;
      }

      setRaisedHandsParticipants(raisedHandsParticipants);
    };

    useEffect(() => {
      raisedHandsParticipantsRef.current = raisedHandsParticipants;
    }, [raisedHandsParticipants]);

    const _handleRemoveOld = () => {
      const raisedHandsParticipants = [...raisedHandsParticipantsRef.current];

      const now = new Date().getTime();

      const persisted = raisedHandsParticipants.filter(({ raisedHandOn }) => {
        return parseInt(raisedHandOn) + 15000 > parseInt(now);
      });

      if (raisedHandsParticipants.length !== persisted.length) {
        setRaisedHandsParticipants(persisted);
      }
    };

    useEffect(() => {
      const interval = setInterval(_handleRemoveOld, 1000);

      return () => {
        clearInterval(interval);
      };
    }, []);

    return { participantRaisedHand };
  };

  return (
    <MeetingAppContext.Provider
      value={{
        // states
        raisedHandsParticipants,
        draftPolls,
        createdPolls,
        endedPolls,
        afterMeetingJoinedHLSState,
        sideBarMode,
        // setters
        setRaisedHandsParticipants,
        setDraftPolls,
        setCreatedPolls,
        setEndedPolls,
        setAfterMeetingJoinedHLSState,
        setSideBarMode,

        polls,
        useRaisedHandParticipants,
      }}
    >
      {children}
    </MeetingAppContext.Provider>
  );
};
