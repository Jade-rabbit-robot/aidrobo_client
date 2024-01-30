import axios from "axios";

const http = axios.create({
  baseURL: "http://" + host + ":55555/ros",
  timeout: 10000,
});

export const start = () =>
  http({
    method: "post",
    url: "/start_video",
  });
export const stop = () =>
  http({
    method: "post",
    url: "/stop_video",
  });
export const exit = () =>
  http({
    method: "get",
    url: "/exit_ros",
  });

export default http;
