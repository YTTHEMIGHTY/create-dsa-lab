// LeetCode: containerWithMostWater_11 (Problem #11 - Container With Most Water)
// ────────────────────────────────────────

/**
 * Given n non-negative integers a1, a2, ..., an where each represents a point
 * at coordinate (i, ai), find two lines which together with the x-axis forms
 * a container that holds the most water.
 *
 * @param height - Array of non-negative integers representing heights
 * @returns The maximum area of water the container can hold
 */
function containerWithMostWater_11(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let maxArea = 0;

  while (left < right) {
    const width = right - left;
    const currentHeight = Math.min(height[left], height[right]);
    const area = width * currentHeight;
    maxArea = Math.max(maxArea, area);

    // Move the pointer with the shorter height inward
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxArea;
}

// ── Metadata (powers the dashboard) ──────────
export const meta = {
  name: 'Container With Most Water',
  time: 'O(n)',
  space: 'O(1)',
  difficulty: 'Medium' as const,
  tags: ['two-pointers', 'greedy', 'array'],
  sampleInput: [[1, 8, 6, 2, 5, 4, 8, 3, 7]] as unknown[],
  sampleOutput: 49,
};

export default containerWithMostWater_11;
