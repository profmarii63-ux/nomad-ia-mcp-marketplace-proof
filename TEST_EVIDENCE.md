# Test evidence

Verified locally on 2026-10-07 with Node.js 24.

Command:

    npm test

Result:

    tests 5
    pass 5
    fail 0

Coverage exercised:
- project payload normalization
- search filter construction
- bearer authorization header handling
- category fallback behavior
- upstream HTTP error handling without response-body leakage

The public repository contains the exact source and tests used for this run.
