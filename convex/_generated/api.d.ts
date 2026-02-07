/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authHelpers from "../authHelpers.js";
import type * as beacon from "../beacon.js";
import type * as conversations from "../conversations.js";
import type * as discover from "../discover.js";
import type * as dogs from "../dogs.js";
import type * as files from "../files.js";
import type * as friendRequests from "../friendRequests.js";
import type * as friendships from "../friendships.js";
import type * as http from "../http.js";
import type * as meetingInvitations from "../meetingInvitations.js";
import type * as meetings from "../meetings.js";
import type * as messages from "../messages.js";
import type * as spots from "../spots.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";
import type * as walks from "../walks.js";
import type * as weather from "../weather.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authHelpers: typeof authHelpers;
  beacon: typeof beacon;
  conversations: typeof conversations;
  discover: typeof discover;
  dogs: typeof dogs;
  files: typeof files;
  friendRequests: typeof friendRequests;
  friendships: typeof friendships;
  http: typeof http;
  meetingInvitations: typeof meetingInvitations;
  meetings: typeof meetings;
  messages: typeof messages;
  spots: typeof spots;
  todos: typeof todos;
  users: typeof users;
  walks: typeof walks;
  weather: typeof weather;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
