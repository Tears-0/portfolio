// The one Workers runtime module the site's Worker imports, typed by hand so the project needs
// no extra type package (https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/).
declare module 'cloudflare:email' {
  export class EmailMessage {
    constructor(from: string, to: string, raw: string | ReadableStream);
    readonly from: string;
    readonly to: string;
  }
}
