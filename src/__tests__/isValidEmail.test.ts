import DymoAPI from "../dymo-api.js";

const dymoClient = new DymoAPI();

describe("isValidEmail", () => {
    it("throws if token is null", async () => {
        await expect(dymoClient.isValidEmail("test@example.com")).rejects.toThrow("Invalid private token.");
    });

    it("returns true for valid email when rules allow it", async () => {
        const fakeToken = "fake-token";

        // Puedes simular la respuesta de la API si no quieres hacer llamadas reales
        // jest.mock(...) o mockear axios

        // Ejemplo simple si la función no hace llamadas externas
        const result = await dymoClient.isValidEmail("valid@example.com", { deny: ["FRAUD"] });
        expect(result).toBe(true);
    });
});