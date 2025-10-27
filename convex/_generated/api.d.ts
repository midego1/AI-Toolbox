/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminTools from "../adminTools.js";
import type * as aiJobs from "../aiJobs.js";
import type * as auth from "../auth.js";
import type * as clerk from "../clerk.js";
import type * as files from "../files.js";
import type * as history from "../history.js";
import type * as http from "../http.js";
import type * as lib_openrouter from "../lib/openrouter.js";
import type * as lib_stripe from "../lib/stripe.js";
import type * as migration from "../migration.js";
import type * as payments from "../payments.js";
import type * as tools_backgroundRemoval from "../tools/backgroundRemoval.js";
import type * as tools_cadeautips from "../tools/cadeautips.js";
import type * as tools_chat from "../tools/chat.js";
import type * as tools_copywriting from "../tools/copywriting.js";
import type * as tools_imageGeneration from "../tools/imageGeneration.js";
import type * as tools_linkedinContent from "../tools/linkedinContent.js";
import type * as tools_lootjestrekken from "../tools/lootjestrekken.js";
import type * as tools_ocr from "../tools/ocr.js";
import type * as tools_rewriter from "../tools/rewriter.js";
import type * as tools_schoentjeTekening from "../tools/schoentjeTekening.js";
import type * as tools_seoOptimizer from "../tools/seoOptimizer.js";
import type * as tools_sinterklaasBrief from "../tools/sinterklaasBrief.js";
import type * as tools_sinterklaasBulkGedichten from "../tools/sinterklaasBulkGedichten.js";
import type * as tools_sinterklaasFamilieMoment from "../tools/sinterklaasFamilieMoment.js";
import type * as tools_sinterklaasGedichten from "../tools/sinterklaasGedichten.js";
import type * as tools_sinterklaasIllustratie from "../tools/sinterklaasIllustratie.js";
import type * as tools_sinterklaasTraditie from "../tools/sinterklaasTraditie.js";
import type * as tools_sinterklaasVoicemail from "../tools/sinterklaasVoicemail.js";
import type * as tools_summarizer from "../tools/summarizer.js";
import type * as tools_surpriseIdeeen from "../tools/surpriseIdeeen.js";
import type * as tools_transcription from "../tools/transcription.js";
import type * as tools_translation from "../tools/translation.js";
import type * as tools_wardrobe from "../tools/wardrobe.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adminTools: typeof adminTools;
  aiJobs: typeof aiJobs;
  auth: typeof auth;
  clerk: typeof clerk;
  files: typeof files;
  history: typeof history;
  http: typeof http;
  "lib/openrouter": typeof lib_openrouter;
  "lib/stripe": typeof lib_stripe;
  migration: typeof migration;
  payments: typeof payments;
  "tools/backgroundRemoval": typeof tools_backgroundRemoval;
  "tools/cadeautips": typeof tools_cadeautips;
  "tools/chat": typeof tools_chat;
  "tools/copywriting": typeof tools_copywriting;
  "tools/imageGeneration": typeof tools_imageGeneration;
  "tools/linkedinContent": typeof tools_linkedinContent;
  "tools/lootjestrekken": typeof tools_lootjestrekken;
  "tools/ocr": typeof tools_ocr;
  "tools/rewriter": typeof tools_rewriter;
  "tools/schoentjeTekening": typeof tools_schoentjeTekening;
  "tools/seoOptimizer": typeof tools_seoOptimizer;
  "tools/sinterklaasBrief": typeof tools_sinterklaasBrief;
  "tools/sinterklaasBulkGedichten": typeof tools_sinterklaasBulkGedichten;
  "tools/sinterklaasFamilieMoment": typeof tools_sinterklaasFamilieMoment;
  "tools/sinterklaasGedichten": typeof tools_sinterklaasGedichten;
  "tools/sinterklaasIllustratie": typeof tools_sinterklaasIllustratie;
  "tools/sinterklaasTraditie": typeof tools_sinterklaasTraditie;
  "tools/sinterklaasVoicemail": typeof tools_sinterklaasVoicemail;
  "tools/summarizer": typeof tools_summarizer;
  "tools/surpriseIdeeen": typeof tools_surpriseIdeeen;
  "tools/transcription": typeof tools_transcription;
  "tools/translation": typeof tools_translation;
  "tools/wardrobe": typeof tools_wardrobe;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
