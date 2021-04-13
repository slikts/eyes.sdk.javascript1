async function fakeIE(page) {
  console.log('[fakeIE] - faking IE');
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko',
  );
  await page.evaluate('document.documentMode = 11');

  console.log('[fakeIE] - done faking IE');
}

module.exports = fakeIE;
