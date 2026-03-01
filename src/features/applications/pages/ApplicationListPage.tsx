import { useEffect, useRef, useState } from "react";
import {
  Table,
  Typography,
  Space,
  message,
  Input,
  Select,
  Button,
  Tag,
  DatePicker,
  Avatar,
  Tooltip
} from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";

import type { ColumnsType } from "antd/es/table";

import { listApplications } from "../services/applicationApi";
import type { WorkApplicationFilter } from "../types/workApplicationFilter";
import type { WorkApplicationListQuery, WorkApplicationSortableColumn } from "../types/workApplicationListQuery";
import { WorkApplicationListItem } from "../types/workApplicationListItem";
import type { ListPage } from "../../_base/types/listPage";
import type { WorkApplicationStatus } from "../types/workApplicationStatus"
import type { Sorting } from "../../_base/types/sorting"
import { getNextSortState } from "../../_base/extensions"

import { formatPhoneNumber, formatDateTime, getProviderWorkUrl, getProviderIcon } from '../../../shared/extensions';
import { useDebounce } from '../../../shared/hooks';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const PAGE_SIZE_OPTIONS = ["10", "20", "30"];
const DEFAULT_PAGE_SIZE = Number(PAGE_SIZE_OPTIONS[1]);

const STATUS_OPTIONS: WorkApplicationStatus[] = [
  "SUBMITTED",
  "VIEWED",
  "REJECTED",
  "ACCEPTED",
];

const STATUS_LABELS: Record<WorkApplicationStatus, string> = {
  SUBMITTED: "Submitted",
  VIEWED: "Viewed",
  REJECTED: "Rejected",
  ACCEPTED: "Accepted",
};


export default function ApplicationListPage() {
  const [data, setData] = useState<ListPage<WorkApplicationListItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, page_size: DEFAULT_PAGE_SIZE });
  const [filters, setFilters] = useState<WorkApplicationFilter>({});
  const [sort, setSort] = useState<Sorting<WorkApplicationSortableColumn>>({sortColumn: null, sortOrder: null});
  const debouncedFilters = useDebounce(filters);
  const isFilterChange = useRef(false);

  const fetchList = async (activeFilters = debouncedFilters) => {
    try {
      setLoading(true);
      const query: WorkApplicationListQuery = {
        page: pagination.page,
        pageSize: pagination.page_size,
        sortColumn: sort.sortColumn ?? "Id",
        sortOrder: sort.sortOrder ?? "asc",
        filter: activeFilters
      }
      const res = await listApplications(query);
      setData(res);
    } catch {
      message.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  // fetch on pagination
  useEffect(() => {
    if (isFilterChange.current) return;
    fetchList();
  }, [pagination.page, pagination.page_size]);

  // fetch on filter
  useEffect(() => {
    if (!isFilterChange.current) return;
  
    isFilterChange.current = false;
    fetchList(debouncedFilters);
  }, [debouncedFilters]);

  // fetch on sort
  useEffect(() => {
    fetchList();
  }, [sort]);

  const onFilterChange = (
    key: keyof typeof filters,
    value: any
  ) => {
    isFilterChange.current = true;
  
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  
    // reset page but DO NOT trigger fetch immediately
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  const mapRangeToFilter = (
    dates: any
  ): { from: string | null; to: string | null } => {
  
    if (!dates) {
      return { from: null, to: null };
    }
  
    const [fromDate, toDate] = dates;
    return {
      from: fromDate ? fromDate.format("YYYY-MM-DD") : null,
      to: toDate ? toDate.format("YYYY-MM-DD") : null,
    };
  };

  const handleChangeCreated = (dates: any, _dateStrings: [string, string]) => {
    const { from, to } = mapRangeToFilter(dates);    
    onFilterChange('createdFrom', from);
    onFilterChange('createdTo', to);
  };

  const handleChangeUpdated = (dates: any, _dateStrings: [string, string]) => {
    const { from, to } = mapRangeToFilter(dates);    
    onFilterChange('updatedFrom', from);
    onFilterChange('updatedTo', to);
  };

  const buildSortButton = (column: WorkApplicationSortableColumn) => {
    const isActive = sort.sortColumn === column;
  
    let icon = "⇅";
  
    if (isActive && sort.sortOrder === "asc") icon = "↑";
    if (isActive && sort.sortOrder === "desc") icon = "↓";
  
    return (
      <Button
        size="small"
        type="text"
        icon={icon}
        style={{
          color: isActive ? "#1677ff" : undefined,
        }}
        onClick={() => {
          const next = getNextSortState(sort, column);
          setSort(next);

          // setPagination(prev => ({
          //   ...prev,
          //   page: 1,
          // }));
        }}
      />
    );
  };

  const columns: ColumnsType<WorkApplicationListItem> = [
    {
      title: (
        <div>
          Work
          {/* <Input
            placeholder="provider"
            value={filters.workProvider as string || ''}
            onChange={(e) => onFilterChange('workProvider', e.target.value)}
            size="small"
            style={{ marginTop: 4 }}
          /> */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="company"
              value={filters.workCompany as string || ""}
              onChange={(e) =>
                onFilterChange("workCompany", e.target.value)
              }
              size="small"
              style={{ flex: 1 }}
            />
            {buildSortButton("WorkCompany")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="position"
              value={filters.workName as string || ''}
              onChange={(e) => onFilterChange('workName', e.target.value)}
              size="small"
              style={{ marginTop: 4 }}
            />
            {buildSortButton("WorkName")}
          </div>
        </div>
      ),
      render: (_, r) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tooltip title={r.work.provider}>
              <Avatar
                src={getProviderIcon(r.work.provider)}
                size={18}
                shape="square"
              />
            </Tooltip>
            { (r.work.company ?? '').length > 0 ? r.work.company : '?'}
          </div>
          {
            !r.work.removedByScanId ? (
              <a
                href={getProviderWorkUrl(r.work.provider, r.work.url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight:  "bold" }}
              >
                {r.work.name}
              </a>
            ) : (
              <span style={{ fontWeight: "bold" }}>
                {r.work.name}
              </span>
            )
          }
        </div>
      ),
      key: 'work',
      // align: 'center',
      // width: 250,
    },
    {
      title: (
        <div>
          Contacts
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="email"
              value={filters.email as string || ""}
              onChange={(e) =>
                onFilterChange("email", e.target.value)
              }
              size="small"
              style={{ flex: 1 }}
            />
            {buildSortButton("Email")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="phone"
              value={filters.workName as string || ''}
              onChange={(e) => onFilterChange('phone', e.target.value)}
              size="small"
              style={{ marginTop: 4 }}
            />
            {buildSortButton("Phone")}
          </div>
        </div>
      ),
      key: "contact", // key: "phone",
      //width: 260,
      render: (_, r) => (
        <div>
          <div>{`${r.firstName} ${r.lastName}`}</div>
      
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MailOutlined />
            <span>{r.email}</span>
          </div>
      
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PhoneOutlined />
            <span>{formatPhoneNumber(r.phone)}</span>
          </div>
        </div>
      )
    },
    {
      title: (
        <div>
          Message
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="message"
              value={filters.message as string || ""}
              onChange={(e) =>
                onFilterChange("message", e.target.value)
              }
              size="small"
              style={{ flex: 1 }}
            />
            {buildSortButton("Message")}
          </div>
        </div>
      ),
      key: "message", // key: "phone",
      //width: 260,
      dataIndex: 'message',
    },
    {
      title: (
        <div>
          Dates
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RangePicker 
              placeholder={['Created from', 'Created to']}
              allowEmpty={[true, true]}
              size="small"
              format="DD.MM.YYYY"
              disabledDate={(current) => current && current.valueOf() > Date.now()}
              onChange={handleChangeCreated}
              style={{ marginTop: 4 }}
            />
            {buildSortButton("CreatedAt")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RangePicker
              placeholder={['Updated from', 'Updated to']}
              allowEmpty={[true, true]}
              size="small"
              format="DD.MM.YYYY"
              disabledDate={(current) => current && current.valueOf() > Date.now()}
              onChange={handleChangeUpdated}
              style={{ marginTop: 4 }}
            />
            {buildSortButton("UpdatedAt")}
          </div>
        </div>
      ),
      key: "dates",
      //width: 260,
      render: (_, r) => (
        <div>
          <div style={{color: 'green'}}>{formatDateTime(r.createdAt)}</div>
          <div style={{color: 'orange'}}>{formatDateTime(r.updatedAt) ?? '-'}</div>
        </div>
      ),
      // align: 'center',
    },
    {
      title: (
        <div>
          Status
          <div>
          <Select
                options={STATUS_OPTIONS.map((s) => ({label: STATUS_LABELS[s], value: s}))}
                //placeholder='status'
                size="small"
                mode="multiple"
                style={{ width: "100%", height: 54 }}
                onChange={(values) => onFilterChange("status", values)}
            />
          </div>
        </div>
      ),

      key: "status",
      //width: 260,
      render: (_, r) => (
        <Tag>{STATUS_LABELS[r.status]}</Tag>  
      ),
      //align: 'center',
    },
  ];

  return (
    <>
      <Title level={3}>Applications</Title>

      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.page_size,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          total: data?.total,
          onChange: (page, size) => setPagination({ page: page, page_size: size }),
        }}
        columns={columns}
        style={{ marginTop: 16 }}
      />
    </>
  );
} 

// add columns: cv (to the same column as message)
// filter by provider ?
// filter by cv
// filter clear button !?
