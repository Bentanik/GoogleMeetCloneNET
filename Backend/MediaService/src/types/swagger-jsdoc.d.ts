declare module "swagger-jsdoc" {
  interface Options {
    definition?: object;
    apis?: string[];
  }

  function swaggerJSDoc(options?: Options): any;

  export default swaggerJSDoc;
}
