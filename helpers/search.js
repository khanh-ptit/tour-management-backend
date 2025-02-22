module.exports = (query, keyword) => {
  let objectSearch = {};
  if (query[keyword]) {
    const regex = new RegExp(query[keyword], "i");
    objectSearch.regex = regex;
  }
  return objectSearch;
};
