import dayjs, { Dayjs } from "dayjs";
// import isoWeek from "dayjs/plugin/isoWeek";
// dayjs.extend(isoWeek);

export const getProviderWorkUrl = (provider: string, work_url: string): string => {
  const providerUrls: Record<string, string> = {
    StartupJobs: "https://www.startupjobs.cz",
    CoolJobs: "https://www.cooljobs.eu/cz/",
    JobStackIT: "https://www.jobstack.it",
    Titans: "https://join.titans.eu/cs/",
    JobsCZ: "https://www.jobs.cz/",
    // FreelanceDE: "", // No base URL
  };

  const providerUrl = providerUrls[provider];

  // Only return URL if base URL exists
  if (providerUrl) {
    return `${providerUrl}${work_url}`;
  }

  return "";
};

export const getProviderIcon = (provider: string): string => {
  const providerIcons: Record<string, string> = {
    StartupJobs: "pvd_startupjobs.svg",
    CoolJobs: "pvd_cooljobs.svg",
    JobStackIT: "pvd_jobstack.svg",
    Titans: "pvd_titans.svg",
    JobsCZ: "pvd_jobscz.svg",
    // FreelanceDE: "", // No base URL
  };

  return `/${providerIcons[provider]}`;
};

export const formatPhoneNumber = (phone: string) => {
  return phone.replace(/(\+?\d{3})(\d{3})(\d{3})(\d+)/, "$1 $2 $3 $4");
};

export const formatDateTime = (value: string | null | undefined): string | null => {

  if (!value) return null;

  const d = new Date(value);

  if (isNaN(d.getTime())) return null; // ochrana proti invalid date

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return `${days[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const formatSalary = (
  min: number | null,
  max: number | null,
  currency: string | null
): string | null => {
  if (min == null && max == null) return null;

  const format = (value: number) =>
    value.toLocaleString('cs-CZ'); // or 'en-US' depending on locale

  const cur = currency ?? '';

  if (min != null && max != null) return `${format(min)} - ${format(max)} ${cur}`;
  if (min != null) return `from ${format(min)} ${cur}`;
  if (max != null) return `up to ${format(max)} ${cur}`;

  return null;
}


export type DatePeriod = "this_month" | "last_month" | "this_week" | "last_week";
const DATE_PERIOD_LABELS: Record<DatePeriod, string> = {
  this_month: "This month",
  last_month: "Last month",
  this_week: "This week",
  last_week: "Last week",
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1 - day); // Monday as first day
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getRange(period: DatePeriod): [Date, Date] {
  const now = new Date();

  switch (period) {
    case "this_month":
      return [startOfMonth(now), now];

    case "last_month": {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return [startOfMonth(lastMonth), endOfMonth(lastMonth)];
    }

    case "this_week":
      return [startOfWeek(now), now];

    case "last_week": {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      return [startOfWeek(lastWeek), endOfWeek(lastWeek)];
    }
  }
}

export function buildDatePickerPresets(
  periods: DatePeriod[]
): { label: string; value: [Dayjs, Dayjs] }[] {
  return periods.map((period) => {
    const [start, end] = getRange(period);

    return {
      label: DATE_PERIOD_LABELS[period],
      value: [dayjs(start), dayjs(end)],
    };
  });
}
