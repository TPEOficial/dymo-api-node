import * as WellKnownBots from "./well-known-bots";
import { NegativeEmailRules, NegativePhoneRules, NegativeSensitiveInfoRules } from "./data-verifier";

type Mode = "LIVE" | "DRY_RUN";

export type NegativeWafRules =  "FRAUD" | "VPN" | "PROXY" | "TOR_NETWORK";

export interface WafRules {
    mode?: Mode;
    allowBots?: WellKnownBots.WellKnownBotOrCategory[];
    deny?: NegativeWafRules[];
}

export interface EmailValidatorRules {
    mode?: Mode;
    deny: NegativeEmailRules[];
}

export interface PhoneValidatorRules {
    mode?: Mode;
    deny: NegativePhoneRules[];
}

export interface SensitiveInfoRules {
    mode?: Mode;
    deny: NegativeSensitiveInfoRules[];
}

// -------------------- DYMO MAIN CLIENT RULES -------------------- //
export interface Rules {
    email?: EmailValidatorRules;
    phone?: PhoneValidatorRules;
    sensitiveInfo?: SensitiveInfoRules;
    waf?: WafRules;
}