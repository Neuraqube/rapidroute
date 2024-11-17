const findById = (id) => {
  return `Model No ${id}`;
};

const findAllRecords = (filter) => {
  const arr = Array(10).fill(null).map((ele, index) => {
    return `Model no ${index}`;
  });
  arr[arr.length] = filter
  return arr;
};

export default { findById, findAllRecords };
