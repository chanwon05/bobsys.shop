import {useEffect, useState} from "react";
import {request} from "../services/api";

function useResource(path) {
  const [state, setState] = useState({data: null, loading: true, error: ""});
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!cancelled) setState({data: null, loading: true, error: ""});
      return request(path, {signal: controller.signal});
    }).then((data) => {
      if (!cancelled) setState({data, loading: false, error: ""});
    }).catch((error) => {
      if (!cancelled) setState({data: null, loading: false, error: error.message});
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [path, revision]);

  return {...state, reload: () => setRevision((current) => current + 1)};
}

export default useResource;
