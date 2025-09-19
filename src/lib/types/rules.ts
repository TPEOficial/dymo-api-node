import { NegativeEmailRules } from "./data-verifier";

export interface Rules {
    email: {
        deny: NegativeEmailRules[];
    };
};