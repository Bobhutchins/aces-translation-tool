// Test word count calculation
const text1 = 'This is a test document with numbers 123 and symbols! @#$%';
const text2 = 'Hello world 123 !@# test';
const text3 = 'Simple text without numbers';
const text4 = 'Educational document with IEP goals and 504 plans for student success.';

function calculateWordCount(text) {
  if (!text || typeof text !== 'string') return 0;
  
  // Remove extra whitespace and normalize
  const normalizedText = text.trim().replace(/\s+/g, ' ');
  
  // Split by whitespace and filter out non-word tokens
  const words = normalizedText.split(/\s+/).filter(word => {
    // Remove empty strings
    if (!word) return false;
    
    // Count words that contain at least one letter (for translation purposes)
    // This excludes pure numbers, symbols, or punctuation-only tokens
    return /[a-zA-Z]/.test(word);
  });
  
  return words.length;
}

console.log('=== Word Count Test Results ===');
console.log('Text 1:', text1);
console.log('Word count:', calculateWordCount(text1));
console.log('Expected: 8 (This, is, a, test, document, with, numbers, and, symbols)');
console.log('');

console.log('Text 2:', text2);
console.log('Word count:', calculateWordCount(text2));
console.log('Expected: 4 (Hello, world, test)');
console.log('');

console.log('Text 3:', text3);
console.log('Word count:', calculateWordCount(text3));
console.log('Expected: 4 (Simple, text, without, numbers)');
console.log('');

console.log('Text 4:', text4);
console.log('Word count:', calculateWordCount(text4));
console.log('Expected: 10 (Educational, document, with, IEP, goals, and, plans, for, student, success)');
console.log('');

// Test with empty and edge cases
console.log('Edge cases:');
console.log('Empty string:', calculateWordCount(''));
console.log('Only numbers:', calculateWordCount('123 456 789'));
console.log('Only symbols:', calculateWordCount('!@# $%^ &*()'));
console.log('Mixed with spaces:', calculateWordCount('  Hello   world  !  '));
