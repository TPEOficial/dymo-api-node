import * as WellKnownBots from "./well-known-bots";
import { NegativeEmailRules, NegativeSensitiveInfoRules } from "./data-verifier";

type Mode = "LIVE" | "DRY_RUN";

export interface BotRules {
    mode?: Mode;
    allow?: WellKnownBots.WellKnownBotOrCategory[];
}

export interface EmailValidatorRules {
    mode?: Mode;
    deny: NegativeEmailRules[];
}

export interface SensitiveInfoRules {
    mode?: Mode;
    deny: NegativeSensitiveInfoRules[];
}

// -------------------- DYMO MAIN CLIENT RULES -------------------- //
export interface Rules {
    bot?: BotRules;
    email?: EmailValidatorRules;
    sensitiveInfo?: SensitiveInfoRules;
}