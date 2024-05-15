const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

async function writeCSV(filePath, data) {
  const csvWriter = createCsvWriter({
    path: filePath,
    header: Object.keys(data[0]).map((key) => ({ id: key, title: key })),
  });

  await csvWriter.writeRecords(data);
}

async function filterRetailers(firstFilePath, secondFilePath, outputFilePath) {
  try {
    const firstFileData = await readCSV(firstFilePath);
    const secondFileData = await readCSV(secondFilePath);
    const pageTypesToRemove = firstFileData.map((item) => item.page_type);
    const retailersToRemove = firstFileData.map((item) => item.retailer);
    const filteredData = secondFileData.map((item) => {
      if (retailersToRemove.includes(item.retailer) && pageTypesToRemove.includes(item.page_type)) {
      return { ...item, Verifier: "", status: 'Not Feasible', "Ticket No": "" };
      } else {
      return item;
      }
    });

    await writeCSV(outputFilePath, filteredData);

    console.log('Filtered data has been written to', outputFilePath);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

const firstFilePath = 'csvFiles/noPidList.csv';
const secondFilePath = 'csvFiles/anomalyReport.csv';
const outputFilePath = 'csvFiles/filtered.csv';

filterRetailers(firstFilePath, secondFilePath, outputFilePath); 