import './CvListPage.css';
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Tooltip,
  Flex,
  Popconfirm,
  Switch
} from "antd";
import { UploadOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";

import type { ColumnsType } from "antd/es/table";

import { listCvs, setCvActive } from "../services/cvApi";
import type { CvFilter } from "../types/cvFilter";
import type { CvListQuery, CvSortableColumn } from "../types/cvListQuery";
import { CvListItem } from "../types/cvListItem";
import type { ListPage } from "../../_base/types/listPage";
import type { Sorting } from "../../_base/types/sorting"
import { getNextSortState } from "../../_base/extensions"

import dayjs from "dayjs";

import { formatDateTime } from '../../../shared/extensions';
import { useDebounce } from '../../../shared/hooks';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const filterInputStyle = { flex: 1, marginTop: 4 };

const PAGE_SIZE_OPTIONS = ["10", "20", "30"];
const DEFAULT_PAGE_SIZE = Number(PAGE_SIZE_OPTIONS[1]);

const defaultFilter: CvFilter = { active: true };  // createdFrom
const defaultSorting: Sorting<CvSortableColumn> = {sortColumn: 'Id', sortOrder: 'asc'};

const CvListPage = () => {
  const [data, setData] = useState<ListPage<CvListItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, page_size: DEFAULT_PAGE_SIZE });
  const [filters, setFilters] = useState<CvFilter>(defaultFilter);
  const [sort, setSort] = useState<Sorting<CvSortableColumn>>({ sortColumn: null, sortOrder: null });
  const debouncedFilters = useDebounce(filters);
  const isFilterChange = useRef(false);
  const navigate = useNavigate();

  const fetchList = async (activeFilters = debouncedFilters) => {
    try {
      setLoading(true);
      const query: CvListQuery = {
        page: pagination.page,
        pageSize: pagination.page_size,
        sortColumn: sort.sortColumn ?? "Id",
        sortOrder: sort.sortOrder ?? "asc",
        filter: activeFilters
      }
      const res = await listCvs(query);
      setData(res);
    } catch {
      message.error("Failed to load cvs");
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

  const handleToggleActive = async (id: number, value: boolean) => {
    try {
      await setCvActive(id, value);
      fetchList();
      message.success("CV state updated");
    } catch (e: any) {
      message.error(e.message || "Failed to update state");
    }
  };

  const handleReset = () => {
    isFilterChange.current = true;
    setFilters(defaultFilter);
    setSort(defaultSorting);
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

  const buildSortButton = (column: CvSortableColumn) => {
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
        }}
      />
    );
  };

  const columns: ColumnsType<CvListItem> = [
    {
      title: (
        <div>
          Name
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="name"
              value={filters.name as string || ""}
              onChange={(e) =>
                onFilterChange("name", e.target.value)
              }
              size="small"
              style={filterInputStyle}
            />
            {buildSortButton("Name")}
          </div>
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      // align: 'center',
      // width: 250,
    },
    {
      title: (
        <div>
          Note
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="note"
              value={filters.note as string || ""}
              onChange={(e) =>
                onFilterChange("note", e.target.value)
              }
              size="small"
              style={filterInputStyle}
            />
            {buildSortButton("Note")}
          </div>
        </div>
      ),
      key: "note",
      //width: 260,
      dataIndex: 'note',
    },
    {
      title: (
        <div>
          File name
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Input
              placeholder="file name"
              value={filters.originalFileName as string || ""}
              onChange={(e) =>
                onFilterChange("originalFileName", e.target.value)
              }
              size="small"
              style={filterInputStyle}
            />
            {buildSortButton("OriginalFileName")}
          </div>
        </div>
      ),
      key: "originalFileName",
      //width: 260,
      dataIndex: 'originalFileName',
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
              value= {[ filters.createdFrom ? dayjs(filters.createdFrom) : null, filters.createdTo ? dayjs(filters.createdTo) : null]}
              disabledDate={(current) => current && current.valueOf() > Date.now()}
              onChange={handleChangeCreated}
              style={filterInputStyle}
            />
            {buildSortButton("CreatedAt")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <RangePicker
              placeholder={['Updated from', 'Updated to']}
              allowEmpty={[true, true]}
              size="small"
              format="DD.MM.YYYY"
              value= {[ filters.createdFrom ? dayjs(filters.updatedFrom) : null, filters.createdTo ? dayjs(filters.updatedTo) : null]}
              disabledDate={(current) => current && current.valueOf() > Date.now()}
              onChange={handleChangeUpdated}
              style={filterInputStyle}
            />
            {buildSortButton("UpdatedAt")}
          </div>
        </div>
      ),
      key: "dates",
      //width: 260,
      render: (_, r) => (
        <div>
          <div style={{ color: 'green' }}>{formatDateTime(r.createdAt)}</div>
          <div style={{ color: 'orange' }}>{formatDateTime(r.updatedAt) ?? '-'}</div>
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
            {buildSortButton("Active")}
          </div>
        </div>
      ),
      key: "actions",
      align: "right" as const,
      render: (_: any, r:CvListItem) => (
        <Space>
          {/* <Tooltip title="Edit CV">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => navigate("/cvs/edit")}
            />
          </Tooltip> */}
          
          <Popconfirm
            title={
              r.active
                ? "Deactivate this CV?"
                : "Activate this CV?"
            }
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleToggleActive(r.id, !r.active)}
          >
            <Tooltip title={r.active ? "Deactivate" : "Activate"}>
              <Switch
                checked={r.active}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Flex justify="space-between" align="center">
        <Title level={3} style={{ margin: 0 }}>
          CVs
        </Title>
        <Space>
          <Tooltip title="Upload new CV">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => navigate("/cvs/new")}
            />
          </Tooltip>
          <Tooltip title="Reset filtering and sorting">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            />
          </Tooltip>
        </Space>
      </Flex>
      <Table
        rowKey="id"
        rowClassName={(r) =>
          r.active ? 'row-active' : 'row-inactive'
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
};

export default CvListPage;

// column ACTIONS: add edit existing cv (maybe also show detail, rags, ...)