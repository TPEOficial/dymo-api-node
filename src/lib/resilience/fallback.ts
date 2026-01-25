import * as Interfaces from "../types/interfaces";

export class FallbackDataGenerator {
    static generateFallbackData<T>(method: string, inputData?: any): T {
        switch (method) {
            case "isValidData":
            case "isValidDataRaw":
                return this.generateDataValidationAnalysis(inputData) as T;
            case "isValidEmail": return this.generateEmailValidatorResponse(inputData) as T;
            case "isValidIP": return this.generateIPValidatorResponse(inputData) as T;
            case "isValidPhone": return this.generatePhoneValidatorResponse(inputData) as T;
            case "protectReq": return this.generateHTTPRequest(inputData) as T;
            case "sendEmail": return this.generateEmailStatus() as T;
            case "getRandom": return this.generateSRNSummary(inputData) as T;
            case "extractWithTextly": return this.generateExtractWithTextly(inputData) as T;
            case "getPrayerTimes": return this.generatePrayerTimes(inputData) as T;
            case "satinize":
            case "satinizer":
                return this.generateSatinizedInputAnalysis(inputData) as T;
            case "isValidPwd": return this.generatePasswordValidationResult(inputData) as T;
            default: throw new Error(`Unknown method for fallback: ${method}`);
        }
    };

    private static validateURL(url?: string): boolean {
        if (!url) return false;
        const urlRegex = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;
        return urlRegex.test(url);
    };

    private static validateEmail(email?: string): boolean {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    private static validateDomain(domain?: string): boolean {
        if (!domain) return false;
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
        if (!domainRegex.test(domain)) return false;
        
        // Validar que tenga un TLD (último punto + contenido)
        const parts = domain.split('.');
        return parts.length >= 2 && parts[parts.length - 1].length > 0;
    };

    private static validateCreditCard(creditCard?: string | any): boolean {
        if (!creditCard) return false;
        const cardNumber = typeof creditCard === "string" ? creditCard : creditCard?.pan || "";
        if (!cardNumber) return false;
        const cardRegex = /^\d{13,19}$/;
        if (!cardRegex.test(cardNumber.replace(/\s/g, ""))) return false;
        
        // Luhn algorithm
        const digits = cardNumber.replace(/\s/g, "").split("").map(Number);
        let sum = 0;
        let isEven = false;
        
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = digits[i];
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    };

    private static validateIP(ip?: string): boolean {
        if (!ip) return false;
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    };

    private static validatePhone(phone?: string): boolean {
        if (!phone) return false;
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phone.replace(/[^\d+]/g, ""));
    };

    private static validateWallet(wallet?: string): boolean {
        if (!wallet) return false;
        const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
        const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
        return bitcoinRegex.test(wallet) || ethereumRegex.test(wallet);
    };

    private static validateIBAN(iban?: string): boolean {
        if (!iban) return false;
        const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;
        return ibanRegex.test(iban.replace(/\s/g, "").toUpperCase());
    };

    private static extractDomain(url?: string): string {
        if (!url) return "";
        try {
            return new URL(url).hostname;
        } catch {
            return "";
        }
    };

    private static generateDataValidationAnalysis(inputData?: any): Interfaces.DataValidationAnalysis {
        return {
            url: {
                valid: this.validateURL(inputData?.url),
                fraud: false,
                freeSubdomain: false,
                customTLD: false,
                url: inputData?.url || "",
                domain: this.extractDomain(inputData?.url),
                plugins: {
                    blocklist: false,
                    compromiseDetector: false,
                    mxRecords: [],
                    nsfw: false,
                    reputation: "unknown" as const,
                    riskScore: 0,
                    torNetwork: false,
                    typosquatting: 0,
                    urlShortener: false
                }
            },
            email: this.generateEmailDataAnalysis(inputData?.email),
            phone: this.generatePhoneDataAnalysis(inputData?.phone),
            domain: {
                valid: this.validateDomain(inputData?.domain),
                fraud: false,
                freeSubdomain: false,
                customTLD: false,
                domain: inputData?.domain || "",
                plugins: {
                    blocklist: false,
                    compromiseDetector: false,
                    mxRecords: [],
                    nsfw: false,
                    reputation: "unknown" as const,
                    riskScore: 0,
                    torNetwork: false,
                    typosquatting: 0,
                    urlShortener: false
                }
            },
            creditCard: {
                valid: this.validateCreditCard(inputData?.creditCard),
                fraud: false,
                test: false,
                type: "unknown",
                creditCard: typeof inputData?.creditCard === "string" ? inputData.creditCard : inputData?.creditCard?.pan || "",
                plugins: {
                    blocklist: false,
                    riskScore: 0
                }
            },
            ip: this.generateIPDataAnalysis(inputData?.ip),
            wallet: {
                valid: this.validateWallet(inputData?.wallet),
                fraud: false,
                wallet: inputData?.wallet || "",
                type: "unknown",
                plugins: {
                    blocklist: false,
                    riskScore: 0,
                    torNetwork: false
                }
            },
            userAgent: {
                valid: false,
                fraud: false,
                userAgent: inputData?.userAgent || "",
                bot: true,
                device: { type: "unknown", brand: "unknown" },
                plugins: {
                    blocklist: false,
                    riskScore: 0
                }
            },
            iban: {
                valid: this.validateIBAN(inputData?.iban),
                fraud: false,
                iban: inputData?.iban || "",
                plugins: {
                    blocklist: false,
                    riskScore: 0
                }
            }
        };
    };

    private static generateEmailValidatorResponse(inputData?: any): Interfaces.EmailValidatorResponse {
        return {
            email: inputData?.email || "",
            allow: this.validateEmail(inputData?.email),
            reasons: this.validateEmail(inputData?.email) ? [] : ["INVALID"],
            response: this.generateEmailDataAnalysis(inputData?.email)
        };
    };

    private static generateEmailDataAnalysis(email?: string): any {
        return {
            valid: this.validateEmail(email),
            fraud: false,
            proxiedEmail: false,
            freeSubdomain: false,
            corporate: false,
            email: email || "",
            realUser: "",
            didYouMean: null,
            noReply: false,
            customTLD: false,
            domain: "",
            roleAccount: false,
            plugins: {
                mxRecords: [],
                blocklist: false,
                compromiseDetector: false,
                nsfw: false,
                reputation: "unknown" as const,
                riskScore: 0,
                torNetwork: false,
                typosquatting: 0,
                urlShortener: false
            }
        };
    };

    private static generateIPValidatorResponse(inputData?: any): Interfaces.IPValidatorResponse {
        return {
            ip: inputData?.ip || "",
            allow: this.validateIP(inputData?.ip),
            reasons: this.validateIP(inputData?.ip) ? [] : ["INVALID"],
            response: this.generateIPDataAnalysis(inputData?.ip)
        };
    };

    private static generateIPDataAnalysis(ip?: string): any {
        const isValid = this.validateIP(ip);
        return {
            valid: isValid,
            type: isValid ? "IPv4" : "Invalid",
            class: isValid ? "A" : "Unknown",
            fraud: false,
            ip: ip || "",
            continent: "",
            continentCode: "",
            country: "",
            countryCode: "",
            region: "",
            regionName: "",
            city: "",
            district: "",
            zipCode: "",
            lat: 0,
            lon: 0,
            timezone: "",
            offset: 0,
            currency: "",
            isp: "",
            org: "",
            as: "",
            asname: "",
            mobile: false,
            proxy: true,
            hosting: false,
            plugins: {
                blocklist: false,
                riskScore: 0
            }
        };
    };

    private static generatePhoneValidatorResponse(inputData?: any): Interfaces.PhoneValidatorResponse {
        return {
            phone: inputData?.phone || "",
            allow: this.validatePhone(inputData?.phone),
            reasons: this.validatePhone(inputData?.phone) ? [] : ["INVALID"],
            response: this.generatePhoneDataAnalysis(inputData?.phone)
        };
    };

    private static generatePhoneDataAnalysis(phone?: any): any {
        const phoneNumber = phone?.phone || phone;
        const isValid = this.validatePhone(phoneNumber);
        return {
            valid: isValid,
            fraud: false,
            phone: phone?.phone || "",
            prefix: "",
            number: "",
            lineType: "Unknown",
            carrierInfo: {
                carrierName: "",
                accuracy: 0,
                carrierCountry: "",
                carrierCountryCode: ""
            },
            country: "",
            countryCode: "",
            plugins: {
                blocklist: false,
                riskScore: 0
            }
        };
    };

    private static generateHTTPRequest(inputData?: any): Interfaces.HTTPRequest {
        return {
            method: inputData?.method || "GET",
            url: inputData?.url || "",
            headers: inputData?.headers || {},
            body: inputData?.body || null,
            allow: false,
            reasons: ["FRAUD"],
            protected: true
        };
    };

    private static generateEmailStatus(): Interfaces.EmailStatus {
        return {
            status: false,
            error: "API unavailable - using fallback response"
        };
    };

    private static generateSRNSummary(inputData?: any): Interfaces.SRNSummary {
        const quantity = inputData?.quantity || 1;
        const values = Array.from({ length: quantity }, () => ({
            integer: 0,
            float: 0.0
        }));

        return {
            values,
            executionTime: 0
        };
    };

    private static generateExtractWithTextly(inputData?: any): any {
        return {
            data: inputData?.data || "",
            extracted: {},
            error: "API unavailable - using fallback response"
        };
    };

    private static generatePrayerTimes(inputData?: any): Interfaces.CountryPrayerTimes | { error: string } {
        return {
            error: "API unavailable - using fallback response"
        };
    };

    private static generateSatinizedInputAnalysis(inputData?: any): Interfaces.SatinizedInputAnalysis {
        return {
            input: inputData?.input || "",
            formats: {
                ascii: false,
                bitcoinAddress: false,
                cLikeIdentifier: false,
                coordinates: false,
                crediCard: false,
                date: false,
                discordUsername: false,
                doi: false,
                domain: false,
                e164Phone: false,
                email: false,
                emoji: false,
                hanUnification: false,
                hashtag: false,
                hyphenWordBreak: false,
                ipv6: false,
                ip: false,
                jiraTicket: false,
                macAddress: false,
                name: false,
                number: false,
                panFromGstin: false,
                password: false,
                port: false,
                tel: false,
                text: false,
                semver: false,
                ssn: false,
                uuid: false,
                url: false,
                urlSlug: false,
                username: false
            },
            includes: {
                spaces: false,
                hasSql: false,
                hasNoSql: false,
                letters: false,
                uppercase: false,
                lowercase: false,
                symbols: false,
                digits: false
            }
        };
    };

    private static generatePasswordValidationResult(inputData?: any): Interfaces.PasswordValidationResult {
        return {
            valid: false,
            password: inputData?.password || "",
            details: [
                {
                    validation: "length",
                    message: "API unavailable - using fallback response"
                }
            ]
        };
    };
};