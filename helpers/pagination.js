module.exports = (query) => {
  let objectPagination = {
    currentPage: 1,
    limitedItem: 2,
    skip: 0,
  };
  // const pages = Math.ceil(countTasks / objectPagination.limitedItem)
  if (query.limitedItem) {
    objectPagination.limitedItem = parseInt(query.limitedItem);
  }
  if (query.page) {
    objectPagination.currentPage = parseInt(query.page);
    objectPagination.skip =
      objectPagination.limitedItem * (objectPagination.currentPage - 1);
  }

  return objectPagination;
};
