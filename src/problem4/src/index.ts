/**
 * @fileoverview Utility functions to calculate the sum of integers from 1 to n.
 * @module sum-utils
 * @author Quynh Pham<vn.chemgio@yahoo.com>
 * @version 1.0.0
 */

/**
 * Calculates the sum of integers from 1 to n using an iterative approach.
 *
 * @description
 * Loops from 1 to n and accumulates the sum. Simple and safe for moderate values of n.
 *
 * @param {number} n - A non-negative integer representing the upper bound of the sum.
 * @returns {number} The sum of integers from 1 to n.
 *
 * @timeComplexity O(n)
 * @spaceComplexity O(1)
 *
 * @throws {Error} If n is negative or not an integer.
 *
 * @example
 * sum_to_n_a(5); // returns 15
 * sum_to_n_a(0); // returns 0
 */
function sum_to_n_a(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("Input must be a non-negative integer");
  }

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Calculates the sum of integers from 1 to n using the mathematical formula.
 *
 * @description
 * Uses the arithmetic series formula: S = n × (n + 1) / 2.
 * This is the most efficient approach with constant time complexity.
 *
 * @param {number} n - A non-negative integer representing the upper bound of the sum.
 * @returns {number} The sum of integers from 1 to n.
 *
 * @timeComplexity O(1)
 * @spaceComplexity O(1)
 *
 * @throws {Error} If n is negative, not an integer, or too large for safe calculation.
 *
 * @example
 * sum_to_n_b(5); // returns 15
 * sum_to_n_b(100); // returns 5050
 * sum_to_n_b(1e6); // returns 500000500000
 */
function sum_to_n_b(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("Input must be a non-negative integer");
  }
  if (n > Number.MAX_SAFE_INTEGER) {
    throw new Error("Input too large - may cause precision loss");
  }

  return (n * (n + 1)) / 2;
}

/**
 * Calculates the sum of integers from 1 to n using recursion.
 *
 * @description
 * Recursively adds n to the sum of numbers from 1 to n-1.
 * Educational purpose only - not recommended for large n due to call stack limits.
 *
 * @param {number} n - A non-negative integer representing the upper bound of the sum.
 * @returns {number} The sum of integers from 1 to n.
 *
 * @timeComplexity O(n)
 * @spaceComplexity O(n) - Due to call stack depth
 *
 * @throws {Error} If n is negative or not an integer.
 * @throws {RangeError} If recursion depth exceeds call stack limit.
 *
 * @example
 * sum_to_n_c(5); // returns 15
 * sum_to_n_c(1); // returns 1
 *
 * @warning Avoid using for n > ~10,000 in most JavaScript environments.
 */
function sum_to_n_c(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("Input must be a non-negative integer");
  }

  if (n <= 1) return n;
  return n + sum_to_n_c(n - 1);
}