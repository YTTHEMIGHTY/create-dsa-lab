import containerWithMostWater_11 from './containerWithMostWater_11.ts';

describe('containerWithMostWater_11', () => {
  test('should return 49 for the classic example', () => {
    expect(containerWithMostWater_11([1, 8, 6, 2, 5, 4, 8, 3, 7])).toBe(49);
  });

  test('should handle two equal heights', () => {
    expect(containerWithMostWater_11([1, 1])).toBe(1);
  });

  test('should handle descending heights', () => {
    expect(containerWithMostWater_11([4, 3, 2, 1, 4])).toBe(16);
  });

  test('should handle all same heights', () => {
    expect(containerWithMostWater_11([5, 5, 5, 5])).toBe(15);
  });

  test('should handle single tall line at one end', () => {
    expect(containerWithMostWater_11([1, 2, 1])).toBe(2);
  });
});
