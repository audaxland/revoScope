import Papa from 'papaparse';
import md5 from "md5";

export const readFile = file => (
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    })
);

export const readCsvString = fileString => {
    return Papa.parse(fileString, {header: true, skipEmptyLines: false}).data.filter(row => Object.keys(row).length > 1);
}

const getFileStatistics = rows => {
    return rows.reduce((prev, curr) => {
            if ((!prev.fromStartDate) || (curr['Started Date'] < prev.fromStartDate)) {
                prev.fromStartDate = curr['Started Date'];
            }
            if ((!prev.toStartDate) || (curr['Started Date'] > prev.toStartDate)) {
                prev.toStartDate = curr['Started Date'];
            }
            if ((!prev.fromCompletedDate) || (curr['Completed Date'] < prev.fromCompletedDate)) {
                prev.fromCompletedDate = curr['Completed Date'];
            }
            if ((!prev.toCompletedDate) || (curr['Completed Date'] > prev.toCompletedDate)) {
                prev.toCompletedDate = curr['Completed Date'];
            }
            prev.currencies[curr.Currency] = (prev.currencies[curr.Currency] ?? 0) + 1;
            if (curr.Type === "EXCHANGE") {
                prev.exchanges++;
            }
            return prev;
        },
        {
            fromStartDate: null,
            toStartDate: null,
            fromCompletedDate: null,
            toCompletedDate: null,
            currencies: {},
            exchanges: 0,
        }
    );
}


export const readNewStatementFile = async newUpload => {
    const {lastModified, name, size, type} = newUpload;

    if (name.slice(-4).toLowerCase() !== '.csv') {
        throw new Error('Invalid File: ' + name + '. Only CSV files allowed.');
    }
    const fileContent = await readFile(newUpload);

    const csvContent = readCsvString(fileContent);

    const statistics = getFileStatistics(csvContent);

    const fileData = csvContent.map(row => {
        const hash = md5(JSON.stringify(row));
        const {'Completed Date': dontCare, State, ...partialRow} = row;
        const partialHash = md5(JSON.stringify(partialRow));
        const key = row['Started Date'].replaceAll(/[^0-9]/g, '_') + '_' + hash;
        const date = new Date(row['Started Date']);
        return {
            key,
            hash,
            partialHash,
            date,
            ...row,
        }
    });

    return {
        fileHash: md5(fileContent),
        name,
        size,
        type,
        lastModified,
        ...statistics,
        count: fileData.length,
        fileData,
    };
}
