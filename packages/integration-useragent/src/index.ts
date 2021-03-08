import { ClientLike, Event, IntegrationV7 } from '@sentry/types';
import { getGlobalObject } from '@sentry/utils';

export class UserAgent implements IntegrationV7 {
  public static id: string = 'UserAgent';
  public name: string = UserAgent.id;

  public install(client: ClientLike): void {
    const global = getGlobalObject<Window>();

    client.addEventProcessor((event: Event) => {
      // if none of the information we want exists, don't bother
      if (!global.navigator && !global.location && !global.document) {
        return event;
      }

      // grab as much info as exists and add it to the event
      const url = event.request?.url || global.location?.href;
      const { referrer } = global.document || {};
      const { userAgent } = global.navigator || {};

      const headers = {
        ...event.request?.headers,
        ...(referrer && { Referer: referrer }),
        ...(userAgent && { 'User-Agent': userAgent }),
      };
      const request = { ...(url && { url }), headers };

      return { ...event, request };
    });
  }
}