const scraperObject = {
	url: 'https://jprp.vn/index.php/JPRP/issue/archive',
	async scraper(browser) {
		let page = await browser.newPage();
		console.log(`Navigating to ${this.url}...`);
		// Navigate to the selected page
		await page.goto(this.url);
		// Wait for the required DOM to be rendered
		await page.waitForSelector('#main-content');
		// Get the links
		let urls = await page.$$eval('#main-content .issue-summary', links => {
			// Extract the links from the data
			links = links.map(el => el.querySelector('.media-body > a').href)
			return links;
		});

		// Loop through each of those links, open a new page instance and get the relevant data from them
		let pagePromise = (link) => new Promise(async (resolve, reject) => {
			let articleUrls;
			let newPage = await browser.newPage();
			await newPage.goto(link);
			articleUrls = await newPage.$$eval('#main-content .media-body', articleLinks => {
				articleLinks = articleLinks.map(el => el.querySelector('.col-md-10 > a').href)
				return articleLinks;
			});
			resolve(articleUrls);
			await newPage.close();
		});

		for (link in urls) {
			let currentPageData = await pagePromise(urls[link]);
			// scrapedData.push(currentPageData);
			console.log(currentPageData);
		}


	}
}

module.exports = scraperObject;