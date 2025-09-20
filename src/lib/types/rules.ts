import { NegativeEmailRules, NegativeSensitiveInfoRules } from "./data-verifier";

export interface Rules {
    email: {
        deny: NegativeEmailRules[];
    };
    sensitiveInfo: {
        deny: NegativeSensitiveInfoRules[];
    };
};