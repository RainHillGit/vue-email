declare module 'html-to-react' {
  export class Parser {
    constructor(options?: any);
    parse(html: string): React.ReactNode;
  }
}
