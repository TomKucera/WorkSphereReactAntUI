import { useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom";
import './WorkListPage.css';

import dayjs from "dayjs";

import {
  Table,
  Typography,
  Space,
  message,
  Input,
  InputNumber,
  Select,
  Button,
  DatePicker,
  Avatar,
  Tooltip,
  Flex,
} from "antd";
import { ReloadOutlined, SendOutlined, EditOutlined } from "@ant-design/icons";

import type { ColumnsType } from 'antd/es/table';

import { listWorks } from "../services/workApi";
import type { WorkFilter } from "../types/workFilter";
import type { WorkListQuery } from "../types/workListQuery"
import type { WorkSortableColumn } from "../types/workSortableColumn"
import { WorkListItem } from "../types/workListItem";
import type { ListPage } from "../../_base/types/listPage";
import type { Sorting } from "../../_base/types/sorting"
import { getNextSortState } from "../../_base/extensions"

import { formatDateTime, formatSalary, getProviderWorkUrl, getProviderIcon, buildDatePickerPresets } from '../../../shared/extensions';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { usePersistentListState } from '../../../shared/hooks/usePersistentListState';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const PAGE_SIZE_OPTIONS = ['10', '15', '20', '25', '30'];
const DEFAULT_PAGE_SIZE = Number(PAGE_SIZE_OPTIONS[1]);

const filterInputStyle = { flex: 1, marginTop: 4 };

const defaultFilter: WorkFilter = { active: true, application: false };  // createdFrom
const defaultSorting: Sorting<WorkSortableColumn> = { sortColumn: 'CreatedAt', sortOrder: 'desc' };
const datePickerPresets = buildDatePickerPresets(['this_week', 'last_week', 'this_month'])

export default function WorkListPage() {
  const {
    filters,
    setFilters,
    sort,
    setSort,
    pagination,
    setPagination,
    reset,
    isDefault,
  } = usePersistentListState<WorkFilter, Sorting<WorkSortableColumn>>({
    storageKey: "work_list_settings",
    defaultFilter,
    defaultSort: defaultSorting,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const [data, setData] = useState<ListPage<WorkListItem> | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedFilters = useDebounce(filters);

  const fetchList = async () => {
    try {
      setLoading(true);

      const query: WorkListQuery = {
        page: pagination.page,
        pageSize: pagination.page_size,
        sortColumn: sort.sortColumn ?? "Id",
        sortOrder: sort.sortOrder ?? "asc",
        filter: debouncedFilters,
      };

      const res = await listWorks(query);
      setData(res);
    } catch {
      message.error("Failed to load works");
    } finally {
      setLoading(false);
    }
  };

  // Single fetch effect
  useEffect(() => {
    fetchList();
  }, [
    pagination.page,
    pagination.page_size,
    sort.sortColumn,
    sort.sortOrder,
    debouncedFilters,
  ]);

  // Filter change
  const onFilterChange = (key: keyof WorkFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));

    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  // Date helpers
  const mapRangeToFilter = (
    dates: any
  ): { from: string | null; to: string | null } => {
    if (!dates) return { from: null, to: null };

    const [fromDate, toDate] = dates;

    return {
      from: fromDate ? fromDate.format("YYYY-MM-DD") : null,
      to: toDate ? toDate.format("YYYY-MM-DD") : null,
    };
  };

  const handleChangeCreated = (dates: any) => {
    const { from, to } = mapRangeToFilter(dates);
    onFilterChange("createdFrom", from);
    onFilterChange("createdTo", to);
  };

  const handleChangeDeleted = (dates: any) => {
    const { from, to } = mapRangeToFilter(dates);
    onFilterChange("deletedFrom", from);
    onFilterChange("deletedTo", to);
  };

  // Sort button
  const buildSortButton = (column: WorkSortableColumn) => {
    const isActive = sort.sortColumn === column;

    let icon = "⇅";
    if (isActive && sort.sortOrder === "asc") icon = "↑";
    if (isActive && sort.sortOrder === "desc") icon = "↓";

    return (
      <Button
        size="small"
        type="text"
        icon={icon}
        style={{ color: isActive ? "#1677ff" : undefined }}
        onClick={() => {
          const next = getNextSortState(sort, column);
          setSort(next);
        }}
      />
    );
  };

  const columns: ColumnsType<WorkListItem> = [
    {
      title: (
        <div>
          ID
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="provider"
              value={filters.provider as string || ""}
              onChange={(e) =>
                onFilterChange("provider", e.target.value)
              }
              size="small"
              style={filterInputStyle}
            />
            {buildSortButton("Provider")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="original id"
              value={filters.originalId as string || ''}
              onChange={(e) => onFilterChange('originalId', e.target.value)}
              size="small"
              style={filterInputStyle}
            />
            {buildSortButton("OriginalId")}
          </div>
        </div>
      ),
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tooltip title={r.provider}>
            <Avatar
              src={getProviderIcon(r.provider)}
              size={18}
              shape="square"
            />
          </Tooltip>
          {r.originalId}
        </div>
      ),
      key: 'id',
      // align: 'center',
      // width: 250,
    },
    {
      title: (
        <div>
          Position
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="company"
              value={filters.company as string || ""}
              onChange={(e) =>
                onFilterChange("company", e.target.value)
              }
              size="small"
              style={filterInputStyle}
            />
            {buildSortButton("Company")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="name"
              value={filters.name as string || ''}
              onChange={(e) => onFilterChange('name', e.target.value)}
              size="small"
              style={filterInputStyle}
            />
            {buildSortButton("Name")}
          </div>
        </div>
      ),
      render: (_, r) => (
        <div>
          <div>
            {(r.company ?? '').length > 0 ? r.company : '?'}
          </div>
          <div>
            {
              !r.removedByScanId ? (
                <a
                  href={getProviderWorkUrl(r.provider, r.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: "bold" }}
                >
                  {r.name}
                </a>
              ) : (
                <span style={{ fontWeight: "bold" }}>
                  {r.name}
                </span>
              )
            }
          </div>
        </div>
      ),
      key: 'position',
      // align: 'center',
      // width: 250,
    },
    {
      title: (
        <div>
          Conditions
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <InputNumber
              min={0}
              placeholder="remote from"
              value={filters.remote}
              onChange={(value) =>
                onFilterChange("remote", value)
              }
              size="small"
              style={filterInputStyle}
            />
            {buildSortButton("Remote")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <InputNumber
              min={0}
              placeholder="salary from"
              value={filters.salary}
              onChange={(value) => onFilterChange('salary', value)}
              size="small"
              style={filterInputStyle}
            />
            {buildSortButton("Salary")}
          </div>
        </div>
      ),
      render: (_, r) => (
        <div>
          <div>
            {r.remoteRatio == null ? null : `${r.remoteRatio} %`}
          </div>
          <div>
            {formatSalary(r.salaryMin, r.salaryMax, r.salaryCurrency)}
          </div>
        </div>
      ),
      key: 'conditions',
      // align: 'center',
      // width: 250,
    },
    {
      title: (
        <div>
          Dates
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RangePicker
              presets={datePickerPresets}
              placeholder={['Created from', 'Created to']}
              allowEmpty={[true, true]}
              size="small"
              value={[filters.createdFrom ? dayjs(filters.createdFrom) : null, filters.createdTo ? dayjs(filters.createdTo) : null]}
              format="DD.MM.YYYY"
              disabledDate={(current) => current && current.valueOf() > Date.now()}
              onChange={handleChangeCreated}
              style={{ marginTop: 4 }}
            />
            {buildSortButton("CreatedAt")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RangePicker
              presets={datePickerPresets}
              placeholder={['Deleted from', 'Deleted to']}
              allowEmpty={[true, true]}
              size="small"
              value={[filters.deletedFrom ? dayjs(filters.deletedFrom) : null, filters.deletedTo ? dayjs(filters.deletedTo) : null]}
              format="DD.MM.YYYY"
              disabledDate={(current) => current && current.valueOf() > Date.now()}
              onChange={handleChangeDeleted}
              style={{ marginTop: 4 }}
            />
            {buildSortButton("DeletedAt")}
          </div>
        </div>
      ),
      key: "dates",
      //width: 260,
      render: (_, r) => (
        <div>
          <div style={{ color: 'green' }}>{formatDateTime(r.addedByScan.endedAt) ?? '-'}</div>
          <div style={{ color: 'darkred' }}>{formatDateTime(r.removedByScan?.endedAt) ?? '-'}</div>
        </div>
      ),
      // align: 'center',
    },
    {
      // title: "Actions",
      title: (
        <div>
          Actions
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Select
              placeholder="Select active state"
              value={filters.active}
              onChange={(value) => onFilterChange("active", value)}
              size="small"
              style={filterInputStyle}
              options={[
                { label: "Active", value: true },
                { label: "Inactive", value: false },
                { label: "All", value: null },
              ]}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Select
              placeholder="Select application state"
              value={filters.application}
              onChange={(value) => onFilterChange("application", value)}
              size="small"
              style={filterInputStyle}
              options={[
                { label: "With application", value: true },
                { label: "Without application", value: false },
                { label: "All", value: null },
              ]}
            />
          </div>
        </div>
      ),
      key: "actions",
      align: "right" as const,
      render: (_: any, r: WorkListItem) => (
        <Space size="middle">
          <Link to={`/works/${r.id}`}>
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              // disabled={r.removedByScanId != null || r.application != null}
              style={{
                color: r.hasCustomDescription ? "orange" : "silver"
              }}
            />
          </Link>

          {r.application == null &&
            (<Link to={`/works/${r.id}/apply`}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                size="small"
                disabled={r.removedByScanId != null}
              >
                Apply
              </Button>
            </Link>
            )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Flex justify="space-between" align="center">
        <Title level={3} style={{ margin: 0 }}>
          Works
        </Title>
        <Space>
          <Tooltip title="Reset filtering and sorting">
            <Button
              icon={<ReloadOutlined />}
              onClick={reset}
              disabled={isDefault}
            />
          </Tooltip>
        </Space>
      </Flex>

      <Table
        rowKey="id"
        rowClassName={(r) =>
          r.removedByScanId == null ? 'row-added' : 'row-removed'
        }
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

// column ACTIONS: add link to existing application