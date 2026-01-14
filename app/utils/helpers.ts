export const formatCurrency = (amount: number): string => {
  const formattedAmount = amount.toLocaleString("id-ID");
  return `${formattedAmount}`;
};

export const formatDate = (dateString: string | Date, format: string): string => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];

    const monthName = months[month] ? months[month] : ""

    if (format == 'ddMMyyyy') {
      return `${String(day).padStart(2, '0')} ${monthName} ${year}`;
    }

    if (format == 'queryDate') {
      return `${String(day).padStart(2, '0')}-${String(month+1).padStart(2, '0')}-${year}`
    }

        if (format == 'queryApi') {
      return `${year}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    return '';
};

export const getErrorFetchMessage = (error:any) : string  => {
  if (error.response) {
    return error.response._data.message;
  } else if (error.message) {
    return error.message ;
  }

  return 'Unknown error';
}