import { version } from "../../package.json";
import { config } from "../configs/config";

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "Task Management API Documentation",
    version: version,
    license: {
      name: "Apache 2.0",
      url: "http://www.apache.org/licenses/LICENSE-2.0.html",
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
    },
  ],
};

export default swaggerDef;
