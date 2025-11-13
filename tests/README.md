# AuroraPickem Test Suite

Comprehensive test suite for the AuroraPickem smart contract covering unit tests, integration tests, and edge cases.

## Overview

This test suite ensures the reliability and security of the AuroraPickem betting platform, covering:

- **Contract functionality**: Series creation, entry, settlement, and prize claims
- **Access control**: Owner-only functions and user permissions
- **Edge cases**: Single participant, all-wrong predictions, etc.
- **Gas optimization**: Performance measurements for key operations
- **State consistency**: Proper state transitions throughout the lifecycle

## Test Files

### 1. AuroraPickem.test.js

**Unit tests** covering individual contract functions:

- **Series Creation** (3 tests)
  - Successful series creation
  - Duplicate series prevention
  - Minimum entry fee validation

- **Series Entry** (6 tests)
  - Team A and Team B pick submissions
  - Duplicate entry prevention
  - Entry fee validation
  - Lock time enforcement
  - Multiple entrants tracking

- **Series Settlement** (4 tests)
  - Correct settlement process
  - Lock time requirements
  - Double settlement prevention
  - Owner-only access control

- **Prize Claims** (4 tests)
  - Winner prize claims
  - Loser claim prevention
  - Double claim prevention
  - Settlement requirements

- **Series Cancellation** (4 tests)
  - Owner cancellation
  - Refund claims after cancellation
  - Owner-only access control
  - Post-settlement cancellation prevention

- **Pick Counts** (1 test)
  - Accurate pick count tracking

- **User Series Tracking** (1 test)
  - User's series list management

- **List All Series** (1 test)
  - Global series enumeration

**Total: 24 unit tests**

### 2. Integration.test.js

**Integration tests** covering end-to-end workflows:

- **End-to-End Betting Flow** (2 tests)
  - Complete lifecycle from creation to prize claim
  - Cancelled series with refunds

- **Multiple Series Management** (2 tests)
  - Concurrent series handling
  - Different picks across series

- **Prize Distribution** (1 test)
  - Proportional prize distribution among winners

- **Edge Cases** (3 tests)
  - Single participant series
  - All users pick losing team
  - Large number of participants

- **Gas Optimization Tests** (1 test)
  - Gas cost measurements for common operations

- **State Consistency** (1 test)
  - State transitions throughout lifecycle

**Total: 10 integration tests**

## Running the Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Ensure Hardhat is properly configured
```

### Run All Tests

```bash
npx hardhat test
```

### Run Specific Test File

```bash
# Run unit tests only
npx hardhat test tests/AuroraPickem.test.js

# Run integration tests only
npx hardhat test tests/Integration.test.js
```

### Run with Gas Reporter

```bash
REPORT_GAS=true npx hardhat test
```

### Run with Coverage

```bash
npx hardhat coverage
```

## Test Results

Expected output format:

```
AuroraPickem Contract Tests
  Series Creation
    ✓ Should create a new series successfully
    ✓ Should not allow creating duplicate series
    ✓ Should require minimum entry fee
  Series Entry
    ✓ Should allow users to enter series with Team A pick
    ✓ Should allow users to enter series with Team B pick
    ✓ Should not allow duplicate entries from same user
    ...

AuroraPickem Integration Tests
  End-to-End Betting Flow
    ✓ Should handle complete betting lifecycle from creation to prize claim
    ✓ Should handle cancelled series with refunds
  Multiple Series Management
    ✓ Should handle multiple concurrent series
    ...

34 passing (5s)
```

## Key Test Scenarios

### 1. Happy Path: Successful Betting

```javascript
1. Owner creates series
2. Multiple users enter with different picks
3. Lock time passes
4. Owner settles series
5. Winners claim prizes
6. Losers cannot claim
```

### 2. Cancellation Path

```javascript
1. Owner creates series
2. Users enter series
3. Owner cancels series (before settlement)
4. All users claim refunds
```

### 3. Edge Case: Single Winner

```javascript
1. Series created with 10 participants
2. 1 user picks Team A, 9 pick Team B
3. Team A wins
4. Single winner receives entire prize pool
```

## Gas Cost Benchmarks

Typical gas usage (approximate):

| Operation | Gas Cost |
|-----------|----------|
| Series Creation | ~150,000 |
| Series Entry | ~100,000 |
| Series Settlement | ~80,000 |
| Prize Claim | ~50,000 |
| Refund Claim | ~45,000 |

## Testing Best Practices

1. **Isolation**: Each test starts with fresh contract deployment
2. **Time manipulation**: Uses `@nomicfoundation/hardhat-network-helpers` for time travel
3. **Balance tracking**: Verifies ETH transfers with gas cost adjustments
4. **Event verification**: Uses `expect().to.emit()` for event testing
5. **Revert messages**: Tests error conditions with specific revert messages

## Mock Data

Tests use mock encrypted values and proofs:

```javascript
const encryptedValue = ethers.hexlify(ethers.randomBytes(32));
const proof = ethers.hexlify(ethers.randomBytes(32));
```

These simulate FHE encrypted confidence values without requiring actual FHE operations in tests.

## Coverage Goals

Target coverage:

- **Line Coverage**: > 95%
- **Function Coverage**: 100%
- **Branch Coverage**: > 90%
- **Statement Coverage**: > 95%

## Continuous Integration

Recommended CI configuration:

```yaml
- name: Run tests
  run: npx hardhat test

- name: Check coverage
  run: npx hardhat coverage

- name: Generate gas report
  run: REPORT_GAS=true npx hardhat test
```

## Troubleshooting

### Common Issues

1. **"Transaction reverted without a reason string"**
   - Check gas limits in hardhat.config.js
   - Verify contract deployment succeeded

2. **Time manipulation not working**
   - Ensure using hardhat network helpers
   - Don't mix `evm_increaseTime` with `time.increase()`

3. **Balance assertions failing**
   - Account for gas costs in balance calculations
   - Use `closeTo()` matcher for small differences

## Future Test Enhancements

1. **FHE Integration Tests**: Test with actual Zama FHE operations
2. **Frontend Integration**: End-to-end tests with frontend
3. **Stress Tests**: Test with 100+ participants
4. **Security Tests**: Reentrancy, overflow/underflow checks
5. **Upgradeability Tests**: If contract becomes upgradeable

## Contributing

When adding new tests:

1. Follow existing naming conventions
2. Add descriptive test names
3. Include both positive and negative test cases
4. Update this README with new test descriptions
5. Ensure all tests pass before committing

## License

Tests are part of the AuroraPickem project and follow the same license.
