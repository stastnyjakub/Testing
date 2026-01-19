const { carrierFilter } = require("../../../v1-2/model/carrier-model");

describe("/api/carrier", () => {
  describe(`Filter test`, () => {
    it("should return correct filter", async () => {
      let filter = carrierFilter({
        ordering: "desc",
        limit: 100,
        number: 2,
        company: "narex",
        phone: "1234656"
      });

      expect(filter[0]).toBe(
        ` and "number" = $1 and "company" ILIKE $2 and "phone" = $3`
      );
      expect(filter[1].length).toBe(3);
    });

    it("should return zero filter parameters", async () => {
      let filter = carrierFilter({
        ordering: "desc",
        limit: 100
      });
      expect(filter[1].length).toBe(0);
    });
  });
});
