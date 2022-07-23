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

		async function articleScraper() {
			let scrapedData = [];
			// Get articles' urls 
			async function findUrls(link) {
				let articleUrls;
				await page.goto(link);
				articleUrls = await page.$$eval('#main-content .media-body', articleLinks => {
					articleLinks = articleLinks.map(el => el.querySelector('.col-md-10 > a').href)
					return articleLinks;
				});
				return articleUrls;
			}

			// Get data from each article
			let articlePromise = (link) => new Promise(async (resolve, reject) => {
				let pageData = {};
				let newPage = await browser.newPage();
				await newPage.goto(link);
				pageData['Tên bài báo'] = await newPage.$eval('header > h2', text => text.textContent.replace(/\s+/g, ' ').trim());
				try {
					pageData['Ngày đăng'] = await newPage.$eval('.list-group > .date-published', text => text.textContent.replace(/\s+/g, ' ').replace('Đã đăng: ', '').trim());
				} catch (error) {
					pageData['Ngày đăng'] = ''; // Some articles lack of this data.
				}
				pageData['Số báo'] = await newPage.$eval('.panel-body > .title', text => text.textContent.replace(/\s+/g, ' ').trim());
				try {
					pageData['Địa chỉ DOI'] = await newPage.$eval('.list-group > .doi > a', text => text.textContent.replace(/\s+/g, ' ').trim());
				} catch (e) {
					pageData['Địa chỉ DOI'] = '';
				}
				resolve(pageData);
				scrapedData.push(pageData);
				await newPage.close();
			});

			for (link in urls) {
				let articleUrls = await findUrls(urls[link]);
				for (articleLink in articleUrls) {
					await articlePromise(articleUrls[articleLink]);
				}
			}

			return scrapedData;
		}

		let data = await articleScraper();
		await page.close();
		// console.log(data);
		return data;

	}
}

module.exports = scraperObject;