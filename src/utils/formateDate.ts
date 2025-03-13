import moment from "moment";
const formatDate = (dateStr: string) => {
  return moment(dateStr, ["DD-MM-YYYY", "MM/DD/YYYY"]).format("DD-MM-YYYY");
};
export default formatDate;
