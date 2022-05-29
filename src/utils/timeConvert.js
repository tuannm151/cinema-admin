export const timeStampToTimeString = (timeStamp) => {
  const date = new Date(timeStamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeString = `${hours}:${String(minutes).padStart(2, "0")}`;
  return timeString;
};

export function parseISOLocal(s) {
  var b = s.split(/\D/);
  return new Date(b[0], b[1] - 1, b[2], b[3], b[4], b[5]);
}
