export const convertToDateTimeLocalString = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface TimeLeftProps {
  targetTime: string; // ISO format or date string
}

export const timeLeft = ({ targetTime }: { targetTime: string }): string => {
  const targetDate = new Date(targetTime);
  const currentTime = new Date();
  const diff = targetDate.getTime() - currentTime.getTime();

  if (diff <= 0) {
    return "Time is up!";
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} ${years === 1 ? "year" : "years"}`;
  if (months > 0) return `${months} ${months === 1 ? "month" : "months"}`;
  if (weeks > 0) return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"}`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
};

export const timeAgo = ({ pastTime }: { pastTime: string }): string => {
  const pastDate = new Date(pastTime);
  const currentTime = new Date();
  const diff = currentTime.getTime() - pastDate.getTime();

  if (diff <= 0) {
    return "Just now";
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} ${years === 1 ? "year" : "years"}`;
  if (months > 0) return `${months} ${months === 1 ? "month" : "months"}`;
  if (weeks > 0) return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"}`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
};
