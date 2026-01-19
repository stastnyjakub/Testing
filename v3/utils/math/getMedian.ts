export const getMedian = (numbers: number[]): number | null => {
  if (numbers.length === 0) return null; // Return null if array is empty

  // Create a sorted copy of the array
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  const midIndex = Math.floor(sortedNumbers.length / 2);

  // If the array length is odd, return the middle element
  if (sortedNumbers.length % 2 !== 0) {
    return sortedNumbers[midIndex];
  } else {
    // If even, return the average of the two middle elements
    return (sortedNumbers[midIndex - 1] + sortedNumbers[midIndex]) / 2;
  }
};
