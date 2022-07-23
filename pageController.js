const pageScraper = require('./pageScraper');
const XLSX = require('xlsx');

async function scrapeAll(browserInstance) {
	let browser;
	try {
		browser = await browserInstance;
		let scrapedData = [];
		scrapedData = await pageScraper.scraper(browser);
		await browser.close();
		console.log(scrapedData);

		try {
			const file = XLSX.readFile('./result.xlsx');
			const ws = XLSX.utils.json_to_sheet(scrapedData);
			// Adjust collum width.
			let wscols = [
				{ wpx: 1190 },
				{ wpx: 90 },
				{ wpx: 60 },
				{ wpx: 250 }
			];
			ws['!cols'] = wscols;
			XLSX.utils.book_append_sheet(file, ws, "Scraped Data");
			// Writing to file
			XLSX.writeFile(file, './result.xlsx');
			console.log("The data has been scraped and saved successfully! View it at './result.xlsx'");
		} catch (error) {
			console.log("Could not save data to file: ", error);
		}
	}
	catch (err) {
		console.log("Could not resolve the browser instance => ", err);
	}
}

module.exports = (browserInstance) => scrapeAll(browserInstance)