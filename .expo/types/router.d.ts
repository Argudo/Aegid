/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/keys` | `/(tabs)/keys copy` | `/_sitemap` | `/keys` | `/keys copy`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
