import * as WellKnownBots from "./well-known-bots";
import { NegativeEmailRules, NegativeSensitiveInfoRules } from "./data-verifier";

type Mode = "LIVE" | "DRY_RUN";

type NegativeWafRules =  "FRAUD" | "VPN" | "PROXY" | "TOR_NETWORK";

export interface WafRules {
    mode?: Mode;
    allowBots?: WellKnownBots.WellKnownBotOrCategory[];
    deny?: NegativeWafRules[];
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
    email?: EmailValidatorRules;
    sensitiveInfo?: SensitiveInfoRules;
    waf?: WafRules;
}