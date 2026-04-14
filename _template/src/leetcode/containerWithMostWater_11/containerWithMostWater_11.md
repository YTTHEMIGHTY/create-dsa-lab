# LeetCode #11: Container With Most Water

## Understanding the Problem

Given `n` non-negative integers representing heights at positions along the x-axis, find two lines that together with the x-axis form a container that holds the most water.

**Key insight:** The area is determined by the *shorter* of the two lines multiplied by the distance between them.

## Concrete Examples

```
Input:  [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output: 49

The lines at index 1 (height 8) and index 8 (height 7) form the container
with the most water: min(8, 7) × (8 - 1) = 7 × 7 = 49
```

## Approach

**Two Pointer technique:**
1. Start with pointers at both ends (widest container)
2. Calculate the area at each step
3. Move the pointer pointing to the shorter line inward
4. The shorter line is the bottleneck — keeping it can only decrease area as width shrinks

**Why move the shorter line?**
- Area = min(left, right) × width
- Width always decreases by 1 when we move a pointer
- Moving the taller line can never increase the min-height
- Moving the shorter line *might* find a taller line, increasing area

## Complexity

- **Time: O(n)** — single pass with two pointers
- **Space: O(1)** — only constant extra variables
