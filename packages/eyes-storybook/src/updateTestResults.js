function didTestPass({resultsOrErr}) {
  return (
    resultsOrErr.constructor.name !== 'Error' &&
    resultsOrErr.every(
      r => r.constructor.name !== 'Error' && r.getStatus && r.getStatus() === 'Passed',
    )
  );
}

function updateSpinnerEnd(allTestResults, spinner) {
  allTestResults.every(didTestPass) ? spinner.succeed() : spinner.fail();
}

module.exports = updateSpinnerEnd;
