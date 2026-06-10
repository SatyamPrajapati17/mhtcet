const knownCategories = [
    'GOPENS', 'GSCS', 'GSTS', 'GVJS', 'GNT1S', 'GNT2S', 'GNT3S', 'GOBCS', 'GSEBCS',
    'LOPENS', 'LSCS', 'LSTS', 'LVJS', 'LNT1S', 'LNT2S', 'LNT3S', 'LOBCS', 'LSEBCS',
    'PWDOPENS', 'PWDOBCS', 'DEFOBCS', 'DEFRSEBC', 'DEFS', 'EWS', 'ORPHAN', 'TFWS',
    'DEFOPENS', 'PWDROBC'
];

function splitConcatenatedCategories(concatenated) {
  const categories = [];
  let remaining = concatenated;

  // Sort by length descending to match longer categories first
  const sortedCategories = [...knownCategories].sort((a, b) => b.length - a.length);

  while (remaining.length > 0) {
    let matched = false;
    for (const cat of sortedCategories) {
      if (remaining.startsWith(cat)) {
        categories.push(cat);
        remaining = remaining.substring(cat.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // If we can't match a known category, stop parsing
      // The remaining text is likely not part of the category string
      console.log(`Could not match remaining: "${remaining}"`);
      break;
    }
  }

  return categories;
}

const actualBase = 'GOPENSGSCSGSTSGVJSGNT1SGNT2SGNT3SGOBCSGSEBCSLOPENSLSCSLSTSLVJSLNT2SLOBCSLSEBCSPWDOPENSPWDOBCSDEFOPENSDEFOBCSTFWSPWDROBC';
console.log('Input:', actualBase);
console.log('Input length:', actualBase.length);
const result = splitConcatenatedCategories(actualBase);
console.log('Parsed categories:', result);
console.log('Length:', result.length);
// Reconstruct to verify
const reconstructed = result.join('');
console.log('Reconstructed:', reconstructed);
console.log('Reconstructed length:', reconstructed.length);
console.log('Matches original:', actualBase === reconstructed);
if (!actualBase.startsWith(reconstructed)) {
  console.log('First mismatch at index:', reconstructed.length);
  console.log('Remaining in original:', actualBase.substring(reconstructed.length));
}