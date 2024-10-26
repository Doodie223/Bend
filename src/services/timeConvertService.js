const convertDateFormat = (dateString) => {
  const parts = dateString.split("/");
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
};

module.exports = {
  convertDateFormat,
};
