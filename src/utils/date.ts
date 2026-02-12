export function formatFreshness(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.valueOf())) {
    return dateString;
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hourStr = hours.toString().padStart(2, '0');

  return `${day}-${month}-${year} ${hourStr}:${minutes} ${ampm}`;
}
