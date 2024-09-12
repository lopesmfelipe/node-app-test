declare module "xss-clean" {
  const xssClean: () => (req: any, res: any, next: any) => void;
  export default xssClean;
}

/* Adding the module to the 'types' array in tsconfig.json
explicitly tells TypeScript to include that module's types,
even if they are not in the default location ( node_modules/@types).
*/
