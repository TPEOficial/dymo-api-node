import { NegativeEmailRules, NegativeSensitiveInfoRules } from "./data-verifier";

export interface EmailValidatorRules {
    deny: NegativeEmailRules[];
}

export interface SensitiveInfoRules {
    deny: NegativeSensitiveInfoRules[];
}

// -------------------- DYMO MAIN CLIENT RULES -------------------- //
export interface Rules {
    email?: EmailValidatorRules;
    sensitiveInfo?: SensitiveInfoRules;
}