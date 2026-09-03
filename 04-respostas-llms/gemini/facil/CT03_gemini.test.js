const {
  calculateDaysPassed,
  canAdvanceCycle,
  advanceCycle
} = require('./cycleUtils');

describe('cycleUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 9, 15)); 
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('calculateDaysPassed', () => {
    it('should return 0 when start date is today', () => {
      const startDate = new Date(2023, 9, 15);
      expect(calculateDaysPassed(startDate)).toBe(0);
    });

    it('should return the correct number of days passed', () => {
      const startDate = new Date(2023, 9, 5);
      expect(calculateDaysPassed(startDate)).toBe(10);
    });

    it('should return a negative number if start date is in the future', () => {
      const startDate = new Date(2023, 9, 20);
      expect(calculateDaysPassed(startDate)).toBe(-5);
    });
  });

  describe('canAdvanceCycle', () => {
    it('should return false when the minimum number of days has not been reached', () => {
      const cycle = { startDate: new Date(2023, 9, 5) }; 
      expect(canAdvanceCycle(cycle)).toBe(false);
    });

    it('should return true when exactly the minimum number of days has passed', () => {
      const cycle = { startDate: new Date(2023, 8, 30) }; 
      expect(canAdvanceCycle(cycle)).toBe(true);
    });

    it('should return true when more than the minimum number of days has passed', () => {
      const cycle = { startDate: new Date(2023, 8, 20) }; 
      expect(canAdvanceCycle(cycle)).toBe(true);
    });

    it('should respect custom minDays parameter', () => {
      const cycle = { startDate: new Date(2023, 9, 10) }; 
      expect(canAdvanceCycle(cycle, 10)).toBe(false);
      expect(canAdvanceCycle(cycle, 5)).toBe(true);
    });
  });

  describe('advanceCycle', () => {
    it('should advance the cycle correctly and mutate the object', () => {
      const cycle = {
        currentCycle: 1,
        startDate: new Date(2023, 8, 1),
        daysPassed: 44,
        manualAdvance: false
      };

      const advancedCycle = advanceCycle(cycle);

      expect(advancedCycle.currentCycle).toBe(2);
      expect(advancedCycle.startDate).toEqual(new Date(2023, 9, 15));
      expect(advancedCycle.daysPassed).toBe(0);
      expect(advancedCycle.manualAdvance).toBe(true);
      expect(cycle).toBe(advancedCycle); 
    });
  });
});
