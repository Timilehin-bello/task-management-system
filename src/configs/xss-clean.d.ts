declare module "xss-clean" {
  import express from "express";

  function xssClean(options?: any): express.RequestHandler;
  export = xssClean;
}
