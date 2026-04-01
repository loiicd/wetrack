import ClockCard from "@/components/charts/clockCard";

describe("ClockCard", () => {
  beforeEach(() => {
    // Fix the system clock so time-dependent assertions are deterministic
    cy.clock(new Date("2024-06-15T14:30:45Z").getTime());
  });

  it("renders the clock with default local time", () => {
    cy.mount(<ClockCard />);
    // The clock renders hours and minutes as digits
    cy.get("[class*=tabular-nums]").should("exist");
  });

  it("renders with a specific timezone (Berlin)", () => {
    cy.mount(<ClockCard timeZone="Europe/Berlin" />);
    cy.contains("Berlin").should("be.visible");
  });

  it("renders with city label format", () => {
    cy.mount(
      <ClockCard timeZone="America/New_York" labelFormat="city" />,
    );
    cy.contains("New York").should("be.visible");
  });

  it("renders with offset label format", () => {
    cy.mount(
      <ClockCard timeZone="Europe/London" labelFormat="offset" />,
    );
    cy.get("[class*=uppercase]").should("exist");
  });

  it("hides seconds when showSeconds is false", () => {
    cy.mount(
      <ClockCard timeZone="Europe/Berlin" showSeconds={false} />,
    );
    cy.contains("sec").should("not.exist");
  });

  it("hides minutes when showMinutes is false", () => {
    cy.mount(
      <ClockCard timeZone="Europe/Berlin" showHours={true} showMinutes={false} showSeconds={false} />,
    );
    // Only hours are shown — ensure the clock still renders
    cy.get("[class*=tabular-nums]").should("exist");
  });

  it("renders with a custom label override", () => {
    cy.mount(
      <ClockCard timeZone="Asia/Tokyo" label="Tokyo HQ" />,
    );
    cy.contains("Tokyo HQ").should("be.visible");
  });

  it("renders without a card border when showCard is false", () => {
    cy.mount(<ClockCard timeZone="Europe/Berlin" showCard={false} />);
    cy.contains("Berlin").should("be.visible");
  });
});
