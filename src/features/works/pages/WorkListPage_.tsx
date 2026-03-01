import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

import {
  Table,
  Typography,
  Button,
  Space,
  message,
} from "antd";
import { SendOutlined } from "@ant-design/icons";

import type { ColumnsType} from 'antd/es/table';
import { Input, Select } from 'antd';

import { getProviderWorkUrl } from '../../../shared/extensions';
import { getWorks, Work } from '../services/workApi';
import './WorkListPage.css';

const { Title } = Typography;
const { Option } = Select;

const PAGE_SIZE_OPTIONS = ['10', '20', '30'];
const DEFAULT_PAGE_SIZE = Number(PAGE_SIZE_OPTIONS[1]);

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null
): string | null {
  if (min == null && max == null) return null;

  const format = (value: number) =>
    value.toLocaleString('cs-CZ'); // or 'en-US' depending on locale

  const cur = currency ?? '';

  if (min != null && max != null) return `${format(min)} - ${format(max)} ${cur}`;
  if (min != null) return `from ${format(min)} ${cur}`;
  if (max != null) return `up to ${format(max)} ${cur}`;

  return null;
}

export default function WorkListPage() {
  const [data, setData] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, page_size: DEFAULT_PAGE_SIZE });
  const [filters, setFilters] = useState<{ [key: string]: string | boolean | number }>({
    active: true,
  });

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const res = await getWorks({ ...pagination, ...filters });
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('Failed to load works');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, [pagination, filters]);

  
  const onFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      // Keys that expect numeric values
      const numericKeys = ['remote', 'salary'];
      const booleanKeys = ['active'];
  
      // Handle numeric filters
      if (numericKeys.includes(key)) {
        const num = Number(value);
        if (isNaN(num) || num <= 0) {
          // Remove key from filters if value is not a valid number
          const { [key]: _, ...rest } = prev;
          return rest;
        }
  
        return {
          ...prev,
          [key]: num,
        };
      }

      // Handle boolean filters
      if (booleanKeys.includes(key)) {
        const parsedValue =
            value === 'true'
              ? true
              : value === 'false'
              ? false
              : undefined;
      
        if (parsedValue === undefined) {
          // Remove key from filters if value is not a valid number
          const { [key]: _, ...rest } = prev;
          return rest;
        }

        return {
          ...prev,
          [key]: parsedValue,
        };
      }
  
      // All other (string/boolean) filters
      return {
        ...prev,
        [key]: value,
      };
    });
  };
  
  const columns: ColumnsType<Work> = [
    {
      title: (
        <div>
          ID
          <Input
            placeholder="provider"
            value={filters.provider as string || ''}
            onChange={(e) => onFilterChange('provider', e.target.value)}
            size="small"
            style={{ marginTop: 4 }}
          />
        </div>
      ),
      render: (_, record) => (
        <span>
          {record.provider} | {record.originalId}
        </span>
      ),
      key: 'id',
      align: 'center',
      width: 250,
    },
    {
      title: (
        <div>
          Company
          <Input
            placeholder="company"
            value={filters.company as string || ''}
            onChange={(e) => onFilterChange('company', e.target.value)}
            size="small"
            style={{ marginTop: 4 }}
          />
        </div>
      ),
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: (
        <div>
          Position
          <Input
            placeholder="position"
            value={filters.name as string || ''}
            onChange={(e) => onFilterChange('name', e.target.value)}
            size="small"
            style={{ marginTop: 4 }}
          />
        </div>
      ),
      render: (_, record) =>
        !record.removedByScanId ? (
          <a href={getProviderWorkUrl(record.provider, record.url)} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 750 }}>
            {record.name}
          </a>
        ) : (
          <span style={{ fontWeight: 250 }}>{record.name}</span>
        ),
      key: 'position',
    },
    {
      title: (
        <div>
          Remote
          <Input
            placeholder="remote"
            value={filters.remote as string || ''}
            onChange={(e) => onFilterChange('remote', e.target.value)}
            size="small"
            style={{ marginTop: 4 }}
          />
        </div>
      ),
      render: (record) => record.remoteRatio == null ? null : `${record.remoteRatio} %`,
      key: 'remote',
      align: 'center',
    },
    {
      title: (
        <div>
          Salary
          <Input
            placeholder="salary"
            value={filters.salary as string || ''}
            onChange={(e) => onFilterChange('salary', e.target.value)}
            size="small"
            style={{ marginTop: 4 }}
          />
        </div>
      ),
      render: (_, record) => formatSalary(record.salaryMin, record.salaryMax, record.salaryCurrency),
      key: 'salary',
      align: 'center',
    },
    {
      title: "Actions",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: Work) => (
        <Space>
          <Link to={`/works/${record.id}/apply`}>
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="small"
            >
              Apply
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  var fActiveValue = filters.active === true ? 'true' : filters.active === false ? 'false' : '';
  console.log('Filters:', filters);
  return (
    <>
      <Title level={3}>Works</Title>
      <Select
        showSearch
        placeholder="Select a company"
        value={fActiveValue}
        onChange={(value) => onFilterChange('active', value)}
        style={{ width: 200 }}
      >
        <Option value="true">Active</Option>
        <Option value="false">Inactive</Option>
        <Option value="">ALL</Option>
      </Select>

      <Table
        rowKey="id"
        rowClassName={(record) =>
          record.removedByScanId == null ? 'row-added' : 'row-removed'
        }
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.page_size,
          showSizeChanger: true, // 👈 enables the page size dropdown
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          total,
          onChange: (page, size) => {
            setPagination({ page: page, page_size: size });
          },
        }}
        columns={columns}
        style={{ marginTop: 16 }}
      />
    </>
  );
}
